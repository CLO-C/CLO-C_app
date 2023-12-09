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
                else{
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

    return (
        <View style={{ flex: 1 }}>
            <View style={{ height: 300 }}>
                <Calendar
                    onDayPress={handleDayClick}
                    markedDates={{ [selectedDate]: { selected: true } }}
                />
                
                <View style={styles.imageContainer}>
                    {data.length === 0 ? (
                            <Text>No photo for the selected date</Text>
                        ) : (
                                data.map((item, index) => (
                                    <View key={index}>                                    
                                        <Image
                                            style={styles.previousClothImage}
                                            source={{ uri: item.downloadURL }} // Use source attribute for images in React Native
                                        />
                                        {/* <Text style={styles.previousClothData}>{formatDate(item.timestamp)}</Text> */}
                                        <Text style={styles.previousClothData}>
                                            Date: {item.timestamp instanceof Timestamp ? item.timestamp.toDate().toISOString().replace('T', ' ').substring(0, 16) : null}
                                        </Text>
                                        <Text style={styles.previousClothData}>Weather: {item.weatherDescription}</Text>
                                        <Text style={styles.previousClothData}>Temperature: {item.temperature}</Text>
                                        <Text style={styles.previousClothData}>ComfortFeedback: {item.comfortFeedback}</Text>
                                    </View>
                            ))
                        )}
                </View>
            </View>

        </View>
    );
};

const styles = {
    imageContainer: {
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        position: 'absolute',
        bottom: -200,
        left: 0,
        right: 0,
    },

    previousClothImage: {
        width: 190,
        height: 300,
        resizeMode: 'cover',
        borderRadius: 8,
        position: 'absolute',
        bottom: -180,
        left: -180
    },

    previousClothData: {
        fontSize: 15,
        marginBottom: 10,
    }
  };
export default CalendarScreen;