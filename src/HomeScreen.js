import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image, ScrollView } from 'react-native';
import * as Location from 'expo-location';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set } from 'firebase/database';
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
//import { getStorage,getDownloadURL } from 'firebase/storage';

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

const db = getFirestore(app);

const API_KEY = 'd5d622b87e057c9805f232ce7a7f8eea';

const HomeScreen = () => {
    const [weatherData, setWeatherData] = useState(null);
    const [location, setLocation] = useState(null);

    const [forecastData, setForecastData] = useState([]);

    const [data, setData] = useState([]);
    const [best, setBest] = useState([]);
    const [crop, setCrop] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingB, setLoadingB] = useState(true);
    const [remain, setRemain] = useState([]);
    const [loadingR, setLoadingR] = useState(true);

    let isFirst = true;

    useEffect(() => {

        async function fetchData() {
            try {
                const q = query(
                    collection(db, 'feedback'),
                    where('temperatureFeedback', '==', 'moderate'),
                    where('comfortFeedback', '==', 'comfortable')
                );

                const querySnapshot = await getDocs(q);

                const fetchedBest = [];
                const fetchedRemain = [];
                const fetchedData = [];

                var now = new Date();   // 현재 날짜 및 시간
                var sevenDaysAgo = new Date(now);
                sevenDaysAgo.setDate(now.getDate() - 10);   // 7일 전
                sevenDaysAgo.setHours(0, 0, 0, 0); // Set the time to midnight (0 am)

                //const tem = weatherData.main.temp;

                querySnapshot.forEach((doc) => {
                    const feedbackDate = doc.data().timestamp.toDate();

                    if ((isFirst) && (feedbackDate < sevenDaysAgo)) {
                        fetchedBest.push(doc.data());
                        isFirst = false;
                    }
                    else {
                        fetchedRemain.push(doc.data());
                    }

                    //const data = doc.data();

                    //if (data.feelsLike >= tem - 1 && data.feelsLike <= tem + 1) {
                    //    if ((isFirst) && (feedbackDate < sevenDaysAgo)) {
                    //        fetchedBest.push(doc.data());
                    //        isFirst = false;
                    //    }
                    //    else {
                    //        fetchedRemain.push(doc.data());
                    //    }
                    //}
                });

                setData(fetchedData);
                setLoading(false);
                setBest(fetchedBest);
                setLoadingB(false);
                setRemain(fetchedRemain);
                setLoadingR(false);
                fetchCrop(best);

            } catch (error) {
                console.error('Error fetching data: ', error);
            }
        };

        const fetchCrop = async (best) => {
            try {
                const fetchedCrop = [];

                const promises = best.map(async (item) => {
                    const qq = query(
                        collection(db, 'modelResult'),
                        where('imgSrc', '==', item.downloadURL)
                    );

                    const querySnapshot = await getDocs(qq);

                    querySnapshot.forEach((doc) => {
                        fetchedCrop.push(doc.data());
                    });
                });

                // Wait for all promises to resolve
                await Promise.all(promises);
                setCrop(fetchedCrop);

            } catch (error) {
                console.error('Error fetching data: ', error);
            }
        };

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
                fetchWeatherForecast(location.coords.latitude, location.coords.longitude);
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
                // console.log('Weather data saved to Firebase:', data);
            } catch (error) {
                console.error('Error saving weather data to Firebase:', error);
            }
        };

        const fetchWeatherForecast = async (latitude, longitude) => {
            try {
                const response = await axios.get(
                    `http://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
                );

                const groupedForecastData = groupForecastByDate(response.data.list);
                setForecastData(groupedForecastData);
            } catch (error) {
                console.error('Error fetching weather forecast:', error);
            }
        };

        const groupForecastByDate = (forecastList) => {
            const groupedData = {};

            forecastList.forEach((item) => {
                const date = item.dt_txt.split(' ')[0];

                if (!groupedData[date]) {
                    groupedData[date] = [];
                }

                groupedData[date].push(item);
            });

            return groupedData;
        };

        fetchLocationAndWeather();
        fetchData();
    }, [weatherData]);

    //            
    const getWeatherIcon = (weatherCondition) => {
        switch (weatherCondition) {
            case 'Clear':
                return 'sun-o'; // FontAwesome icon for clear sky
            case 'Clouds':
                return 'cloud'; // FontAwesome icon for cloudy weather
            case 'Rain':
                return 'umbrella'; // FontAwesome icon for rain
            case 'Snow':
                return 'snowflake';
            case 'Thunderstorm':
                return 'cloud-bolt';
            case 'Drizzle':
                return 'cloud-rain';
            case 'Mist':
                return 'cloud';
            default:
                return 'question';
        }
    };

    const DegreeSymbol = () => <Text>&#176;</Text>;

    if (!weatherData) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="black" />
            </View>
        );
    }

    const renderForecastItem = ({ item }) => (
        <View style={styles.forecastItem}>
            <Text>{item.dt_txt.split(' ')[1]}</Text>
            <Image source={{ uri: getWeatherIcon_Forecast(item.weather[0].icon) }} style={styles.weatherIcon} />
            <Text>{item.main.temp}<DegreeSymbol />C</Text>
        </View>
    );


    const renderDayForecast = (date, data) => {
        // Format the date to MM/DD format
        const formattedDate = new Date(date).toLocaleDateString('en-US', {
            month: 'numeric',
            day: 'numeric',
        });

        return (
            <View key={date} style={styles.dayForecast}>
                <Text style={styles.day}>{formattedDate}</Text>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                >
                    {data.map((item) => (
                        <View key={item.dt} style={styles.forecastItem}>
                            {renderForecastItem({ item })}
                        </View>
                    ))}
                </ScrollView>
            </View>
        );
    };

    const getWeatherIcon_Forecast = (icon) => `http://openweathermap.org/img/wn/${icon}.png`;



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
                    <View style={styles.forecastContainer}>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                        >
                            {Object.keys(forecastData).map((date) => (
                                renderDayForecast(date, forecastData[date])
                            ))}
                        </ScrollView>
                    </View>
                </View>

                {/* Clothing images */}
                <View style={styles.clothingContainer}>
                    <Text>Recommended clothes</Text>
                    <View>
                        {loadingB ? (
                            <Text>Loading...</Text>
                        ) : (
                            crop.map((item, index) => (
                                <View style={styles.clothingImagesContainer} key={index} >
                                    <Image
                                        style={styles.clothingImage}
                                        source={{ uri: item.topURL }} // Use source attribute for images in React Native
                                        onError={(e) => console.log('Error loading image:', e.nativeEvent.error)}
                                    />
                                    <Image
                                        style={styles.clothingImage}
                                        source={{ uri: item.bottomURL }} // Use source attribute for images in React Native
                                        onError={(e) => console.log('Error loading image:', e.nativeEvent.error)}
                                    />
                                    <Image
                                        style={styles.clothingImage}
                                        source={{ uri: item.shoeURL }} // Use source attribute for images in React Native
                                        onError={(e) => console.log('Error loading image:', e.nativeEvent.error)}
                                    />
                                </View>
                            ))
                        )}
                    </View>
                </View>

                <View style={styles.previousClothesContainer}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.previousClothesScrollView}
                    >

                        {loadingR ? (
                            <Text>Loading...</Text>
                        ) : (
                            remain.map((item, index) => (
                                <View key={index}>
                                    <Image
                                        style={styles.previousClothImage}
                                        source={{ uri: item.downloadURL }} // Use source attribute for images in React Native
                                    />
                                    <Text style={styles.previousClothDate}>
                                        {new Date(item.timestamp.toDate()).toLocaleDateString()}
                                    </Text>
                                </View>
                            ))
                        )}
                    </ScrollView>
                </View>

            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 10,
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
        marginTop: 15,
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
        width: 90,
        height: 90,
        resizeMode: 'contain',
        // borderRadius: 20,
        marginRight: 5,
        marginLeft: 5,
    },
    forecastContainer: {
        marginTop: 10,
    },

    dayForecast: {
        marginRight: 16,
    },
    day: {
        fontSize: 18,
        marginBottom: 3,
    },
    forecastItem: {
        marginRight: 16,
        alignItems: 'center',
    },
    weatherIcon: {
        width: 40,
        height: 40,
        resizeMode: 'cover',
    },
    previousClothesScrollView: {
        marginTop: 20,
    },
    previousClothItem: {
        marginRight: 10,
    },
    previousClothImage: {
        width: 130,
        height: 190,
        resizeMode: 'cover',
        borderRadius: 8,
        marginRight: 10,

    },
    previousClothDate: {
        textAlign: 'center',
        marginTop: 5,
    },
});

export default HomeScreen;