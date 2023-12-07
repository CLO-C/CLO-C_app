import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import * as Location from 'expo-location';

const API_KEY = 'd5d622b87e057c9805f232ce7a7f8eea';

const CalendarScreen = () => {
    const [weatherData, setWeatherData] = useState(null);
    const [location, setLocation] = useState(null);

    useEffect(() => {
        const fetchLocation = async () => {
            try {
                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    console.log('Permission to access location was denied');
                    return;
                }

                let location = await Location.getCurrentPositionAsync({});
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
            } catch (error) {
                console.error('Error fetching weather data:', error);
            }
        };

        fetchLocation();
    }, []);

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            {weatherData ? (
                <View>
                    <Text>Location: {location ? `${location.coords.latitude}, ${location.coords.longitude}` : 'Loading...'}</Text>
                    <Text>City: {weatherData.name}</Text>
                    <Text>Temperature: {weatherData.main.temp}C</Text>
                    <Text>Weather: {weatherData.weather[0].main}</Text>
                    {/* ���ϴ� ���� ������ �� �߰��ϼ��� */}
                </View>
            ) : (
                <Text>Loading...</Text>
            )}
        </View>
    );
};

export default CalendarScreen;