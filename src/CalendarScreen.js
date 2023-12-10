import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { initializeApp } from 'firebase/app';
import { getDatabase, set } from 'firebase/database';
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
    const [today, setToday] = useState('');


    useEffect(() => {

        async function fetchData() {
            try {
                if (selectedDate) {
                    const startOfDay = new Date(selectedDate);
                    startOfDay.setHours(0, 0, 0, 0); // Set the time to midnight (0 am)

                    const endOfDay = new Date(startOfDay);
                    endOfDay.setDate(endOfDay.getDate() + 1);
                    endOfDay.setHours(0, 0, 0, 0); // Set the time to midnight (0 am)

                    const q = query(
                        collection(db, 'feedback'),
                        where('timestamp', '>=', startOfDay),
                        where('timestamp', '<', endOfDay)
                    );

                    const querySnapshot = await getDocs(q);

                    const fetchedData = [];
                    querySnapshot.forEach((doc) => {
                        fetchedData.push(doc.data());
                    });

                    setData(fetchedData);
                }
                else {
                    setData([]);
                }
            } catch (error) {
                console.error('Error fetching data: ', error);
            }
        };

        fetchData();
    }, [selectedDate]);

    const handleDayClick = (day) => {
        setSelectedDate(day.dateString);
    };

    const formatDate = (timestamp) => {
        if (timestamp instanceof Date) {
            timestamp.setHours(timestamp.getHours() + 9);
            return timestamp.toISOString().replace('T', ' ').substring(0, 19);
            // const day = timestamp.toDate();
            // var year = day.getFullYear();
            // var month = ('0' + (day.getMonth() + 1)).slice(-2);
            // var days = ('0' + day.getDate()).slice(-2);
            // return year + '-' + month + '-' + days;

        } else {
        }
    };

    const DegreeSymbol = () => <Text>&#176;</Text>;

    const markDatesWithImages = () => {
        const markedDates = {};

        // Mark all dates with images
        data.forEach((item) => {
            const date = item.timestamp.toDate().toISOString().split('T')[0];
            markedDates[date] = { marked: true, dotColor: 'gray' };
        });

        return markedDates;
    };

    // ...

    // Mark all dates with images even if no date is selected
    const allDatesWithImages = markDatesWithImages();

    return (
        <View style={{ flex: 1 }}>
            <View style={{ height: 300 }}>
                <Calendar
                    onDayPress={handleDayClick}
                    markedDates={{
                        ...allDatesWithImages,
                        [selectedDate]: { selected: true, selectedColor: 'skyblue' }, // Selected date marker
                    }}
                />
            </View>

            <View style={styles.containerWithImages}>
                {data.length === 0 ? (
                    <Text style={styles.noPhotoText}>No photo for the selected date</Text>
                ) : (
                    data.map((item, index) => (
                        <View key={index} style={styles.itemContainer}>
                            <Image
                                style={styles.previousClothImage}
                                source={{ uri: item.downloadURL }}
                            />
                            <View style={styles.textContainer}>
                                <Text style={styles.previousClothData}>
                                    {item.timestamp instanceof Timestamp
                                        ? item.timestamp.toDate().toISOString().replace('T', ' ').substring(0, 16)
                                        : null}
                                </Text>
                                <Text style={styles.previousClothData}>{item.weatherDescription}</Text>
                                <Text style={styles.previousClothData}>
                                    {item.temperature}
                                    <DegreeSymbol />C
                                </Text>
                                <Text style={styles.previousClothData}>
                                    {item.temperatureFeedback} / {item.comfortFeedback}
                                </Text>
                            </View>
                        </View>
                    ))
                )}
            </View>
        </View>
    );
};

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
