import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import * as Location from 'expo-location';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set } from 'firebase/database';

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
const database = getDatabase(app);

const API_KEY = 'd5d622b87e057c9805f232ce7a7f8eea';

const HomeScreen = () => {
    const [weatherData, setWeatherData] = useState(null);
    const [location, setLocation] = useState(null);

    useEffect(() => {
        const fetchLocationAndWeather = async () => {
            try {
                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    console.log('Permission to access location was denied');
                    return;
                }

                const location = await Location.getCurrentPositionAsync({});
                setLocation(location);
                fetchWeatherData(location.coords.latitude, location.coords.longitude);
            } catch (error) {
                console.error('Error fetching location:', error);
            }
        };

        const fetchWeatherData = async (latitude, longitude) => {
            try {
                const response = await fetch(
                    `http://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
                );
                const data = await response.json();
                setWeatherData(data);
                saveWeatherDataToFirebase(data);
            } catch (error) {
                console.error('Error fetching weather data:', error);
            }
        };

        const saveWeatherDataToFirebase = async (data) => {
            try {
                await set(ref(database, 'weather'), data);
                console.log('Weather data saved to Firebase:', data);
            } catch (error) {
                console.error('Error saving weather data to Firebase:', error);
            }
        };

        fetchLocationAndWeather();
    }, []);

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            {weatherData ? (
                <View>
                    <Text>Location: {location ? `${location.coords.latitude}, ${location.coords.longitude}` : 'Loading...'}</Text>
                    <Text>City: {weatherData.name}</Text>
                    <Text>Temperature: {weatherData.main.temp}C</Text>
                    <Text>Weather: {weatherData.weather[0].main}</Text>


                </View>
            ) : (
                <Text>Loading...</Text>
            )}
        </View>
    );
};

export default HomeScreen;