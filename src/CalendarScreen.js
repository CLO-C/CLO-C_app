import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { initializeApp } from 'firebase/app';

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
const storage = getStorage(app);

const CalendarScreen = () => {
  const [selectedDate, setSelectedDate] = useState('2023-12-09'); // Set initial date to December 8th
  const [photoUrl, setPhotoUrl] = useState(null);

  useEffect(() => {
    const fetchPhoto = async () => {
      try {
        const storageRef = ref(storage, 'Cloth/1701946382295.jpg'); // Update path to target '1701946382295.jpg'
        const url = await getDownloadURL(storageRef);
        setPhotoUrl(url);
      } catch (error) {
        console.error('Error fetching photo:', error);
        setPhotoUrl(null);
      }
    };

    fetchPhoto();
  }, []);

  const handleDayClick = (day) => {
    setSelectedDate(day.dateString);
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={{ height: 300 }}>
        <Calendar
          onDayPress={handleDayClick}
          markedDates={{ [selectedDate]: { selected: true } }}
        />
      </View>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        {photoUrl ? (
          <Image source={{ uri: photoUrl }} style={{ width: 200, height: 200 }} />
        ) : (
          <Text>No photo for the selected date</Text>
        )}
      </View>
    </View>
  );
};

export default CalendarScreen;