import React, { useState, useEffect } from 'react';
import { View, Text, Image } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, Timestamp } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyD7jlUzKiSs6oLOMptBnweP8XhrOuiUyZ8",
    authDomain: "cloc-bdf74.firebaseapp.com",
    databaseURL: "https://cloc-bdf74-default-rtdb.firebaseio.com/",
    projectId: "cloc-bdf74",
    storageBucket: "cloc-bdf74.appspot.com",
    messagingSenderId: "485093561661",
    appId: "1:485093561661:web:e4d4743dda2407b90f2154",
    measurementId: "G-ZXG5FLMMFN"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const CalendarScreen = () => {
    const [selectedDate, setSelectedDate] = useState(null);
    const [data, setData] = useState([]);
    const [markedDates, setMarkedDates] = useState({});

    useEffect(() => {
        // Fetch data based on selected date
        async function fetchData() {
            try {
                const updatedMarkedDates = {};

                // Fetch data from Firebase
                const startOfDay = new Date(selectedDate);
                startOfDay.setHours(0, 0, 0, 0);

                const endOfDay = new Date(startOfDay);
                endOfDay.setDate(endOfDay.getDate() + 1);
                endOfDay.setHours(0, 0, 0, 0);

                const q = query(
                    collection(db, 'feedback')
                );

                const querySnapshot = await getDocs(q);

                const fetchedData = [];
                querySnapshot.forEach((doc) => {
                    const date = doc.data().timestamp.toDate().toISOString().split('T')[0];
                    updatedMarkedDates[date] = { marked: true, dotColor: 'gray' };
                    fetchedData.push(doc.data());
                });

                setData(fetchedData);

                // Set markedDates state
                setMarkedDates(updatedMarkedDates);
            } catch (error) {
                console.error('Error fetching data: ', error);
            }
        }

        fetchData();
    }, []);

    useEffect(() => {
        const updatedMarkedDates = {};

        // Mark all dates with gray dots
        data.forEach((item) => {
            const date = item.timestamp.toDate().toISOString().split('T')[0];
            updatedMarkedDates[date] = { marked: true, dotColor: 'gray' };
        });

        // Add the selected day with a sky blue circle
        if (selectedDate) {
            updatedMarkedDates[selectedDate] = { ...updatedMarkedDates[selectedDate], selected: true, selectedColor: 'skyblue' };
        }

        setMarkedDates(updatedMarkedDates);
    }, [data, selectedDate]);

    const handleDayClick = (day) => {
        setSelectedDate(day.dateString);
    };

    return (
        <View style={{ flex: 1 }}>
            <View style={{ height: 300 }}>
                <Calendar
                    onDayPress={handleDayClick}
                    markedDates={markedDates}
                />
            </View>

            <View style={styles.containerWithImages}>
                {data.length === 0 ? (
                    <Text style={styles.noPhotoText}>No photo for the selected date</Text>
                ) : (
                    data.map((item, index) => (
                        <ImageItem key={index} item={item} />
                    ))
                )}
            </View>
        </View>
    );
};

const DegreeSymbol = () => <Text>&#176;</Text>;

const ImageItem = ({ item }) => (
    <View style={styles.itemContainer}>
        <Image style={styles.previousClothImage} source={{ uri: item.downloadURL }} />
        <View style={styles.textContainer}>
            <Text style={styles.previousClothData}>
                {item.timestamp instanceof Timestamp
                    ? item.timestamp.toDate().toISOString().replace('T', ' ').substring(0, 16)
                    : null}
            </Text>
            <Text style={styles.previousClothData}>{item.weatherDescription}</Text>
            <Text style={styles.previousClothData}>
                {item.temperature}<DegreeSymbol />C
            </Text>
            <Text style={styles.previousClothData}>
                {item.temperatureFeedback} / {item.comfortFeedback}
            </Text>
        </View>
    </View>
);

const styles = {
    containerWithImages: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: 20,
        marginTop: 45,
    },
    itemContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    noPhotoText: {
        fontSize: 17,
        marginTop: 50,
    },
    previousClothImage: {
        width: 210,
        height: 300,
        resizeMode: 'cover',
        borderRadius: 8,
    },
    textContainer: {
        marginTop: 5,
        marginLeft: 20,
    },
    previousClothData: {
        fontSize: 15,
        marginBottom: 10,
    },
};

export default CalendarScreen;
