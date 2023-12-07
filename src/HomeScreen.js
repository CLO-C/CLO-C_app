import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image, ScrollView } from 'react-native';
import * as Location from 'expo-location';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set } from 'firebase/database';
import Icon from 'react-native-vector-icons/FontAwesome';


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
    const [previousClothes, setPreviousClothes] = useState([
        { date: '2023-12-01', image: require('../assets/previous-cloth1.png') },
        { date: '2023-12-02', image: require('../assets/previous-cloth2.png') },
        { date: '2023-12-03', image: require('../assets/previous-cloth3.png') },
        { date: '2023-12-04', image: require('../assets/previous-cloth4.png') },
        { date: '2023-12-05', image: require('../assets/previous-cloth5.png') },
    ]);
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

    // ���� ������
    const getWeatherIcon = (weatherCondition) => {
        switch (weatherCondition) {
            case 'Clear':
                return 'sun-o'; // FontAwesome icon for clear sky
            case 'Clouds':
                return 'cloud'; // FontAwesome icon for cloudy weather
            case 'Rain':
                return 'cloud-showers-heavy'; // FontAwesome icon for rain
            case 'Snow':
                return 'snowflake';
            case 'Thunderstorm':
                return 'cloud-bolt';
            case 'Drizzle':
                return 'cloud-rain';
            default:
                return 'smog';
        }
    };

    // ���� ��ȣ
    const DegreeSymbol = () => <Text>&#176;</Text>;

    if (!weatherData) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="black" />
            </View>
        );
    }


    /////// ���� �ʿ�
    // ���Ƿ� ������, �Ź� ���� ������

    const topImage = require('../assets/top-image.png'); // Replace with the actual path
    const bottomImage = require('../assets/bottom-image.png'); // Replace with the actual path
    const shoesImage = require('../assets/shoes-image.png'); // Replace with the actual path



    const renderPreviousClothItem = (item, index) => (
        <View key={index} style={styles.previousClothItem}>
            <Image source={item.image} style={styles.previousClothImage} />
            <Text style={styles.previousClothDate}>{item.date}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <View>
                <View style={styles.weatherInfoContainer}>
                    <Text style={styles.Header}>Date: {new Date().toLocaleDateString()}</Text>
                    <Text style={styles.Header}>Location: {weatherData.name}</Text>
                    <View style={styles.weatherRow}>
                        <Icon name={getWeatherIcon(weatherData.weather[0].main)} size={50} color="black" />
                        <Text style={styles.temp}>
                            {weatherData.main.temp}
                            <DegreeSymbol />C
                        </Text>
                    </View>
                    <View style={styles.weatherInfo}>
                        <Text>
                            Max: {weatherData.main.temp_max}
                            <DegreeSymbol />C
                        </Text>
                        <Text>
                            Min: {weatherData.main.temp_min}
                            <DegreeSymbol />C
                        </Text>
                    </View>
                    <View style={styles.weatherInfo}>
                        <Text>Rain: {weatherData.clouds.all}%</Text>
                        <Text>Humidity: {weatherData.main.humidity}%</Text>
                    </View>
                </View>
                {/* Clothing images */}
                <View style={styles.clothingContainer}>
                    <Text>Recommended clothes</Text>
                    <View style={styles.clothingImagesContainer}>
                        <Image source={topImage} style={styles.clothingImage} />
                        <Image source={bottomImage} style={styles.clothingImage} />
                        <Image source={shoesImage} style={styles.clothingImage} />
                    </View>
                </View>

                { /*���� �Ծ��� ��*/}
                <View style={styles.previousClothesContainer}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.previousClothesScrollView}
                    >
                        {previousClothes.map(renderPreviousClothItem)}
                    </ScrollView>
                </View>

            </View>
        </View>
    );

};

const styles = StyleSheet.create({

    container: {
        flex: 1,
        marginTop: 30,
        paddingHorizontal: 20,
    },
    Header: {
        fontSize: 18,
        marginTop: 3,
        marginBottom: 3,
        marginHorizontal: 5,
    },
    weatherInfoContainer: {
        borderRadius: 5,
        padding: 10,
        backgroundColor: 'white',
    },
    weatherRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 5,
        marginBottom: 10,
        marginHorizontal: 20,
    },
    weatherInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
        marginHorizontal: 20,
    },
    temp: {
        fontSize: 40,
        marginLeft: 10,
    },
    text: {
        fontSize: 18,
        marginBottom: 10,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    clothingContainer: {
        flexDirection: 'column',
        marginTop: 20,
        borderRadius: 5,
        padding: 10,
        backgroundColor: 'white',
    },
    clothingImagesContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    clothingImage: {
        width: 100,
        height: 100,
        resizeMode: 'cover',
        borderRadius: 8,
    },
    previousClothesScrollView: {
        marginTop: 20,
    },
    previousClothItem: {
        marginRight: 10,
    },
    previousClothImage: {
        width: 170,
        height: 250,
        resizeMode: 'cover',
        borderRadius: 8,
    },
    previousClothDate: {
        textAlign: 'center',
        marginTop: 5,
    },
});

export default HomeScreen;