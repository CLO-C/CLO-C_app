//import React from 'react';
//import { View, Text, Image, StyleSheet } from 'react-native';
import Swiper, { Pagination } from 'react-native-swiper';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image, ScrollView } from 'react-native';
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';

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

const ClosetScreen = () => {

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        async function fetchData() {
            try {
                const q = query(
                    collection(db, 'modelResult')
                );

                const querySnapshot = await getDocs(q);

                const fetchedData = [];

                querySnapshot.forEach((doc) => {
                    fetchedData.push(doc.data());
                });

                setData(fetchedData);
                setLoading(false);

            } catch (error) {
                console.error('Error fetching data: ', error);
            }
        };

        fetchData();

    }, []);



    return (
        <View style={styles.container}>
            <View style={styles.swiperContainer}>
                <Swiper style={styles.swiper} showsButtons={false} loop showsPagination={false}>
                    {data.map((item, index) => (
                        <View key={index} style={styles.slide}>
                            <View style={styles.imageContainerTop}>
                                <Image
                                    style={styles.topImage}
                                    source={{ uri: item.topURL }} // Use source attribute for images in React Native
                                />
                            </View>
                        </View>
                    ))}
                </Swiper>
            </View>

            <View style={styles.swiperContainer}>
                <Swiper style={styles.swiper} showsButtons={false} loop showsPagination={false}>
                    {data.map((item, index) => (
                        <View key={index} style={styles.slide}>
                            <View style={styles.imageContainerBottom}>
                                <Image
                                    style={styles.bottomImage}
                                    source={{ uri: item.bottomURL }} // Use source attribute for images in React Native
                                />
                            </View>
                        </View>
                    ))}
                </Swiper>
            </View>

            <View style={styles.swiperContainer}>
                <Swiper style={styles.swiper} showsButtons={false} loop showsPagination={false}>
                    {data.map((item, index) => (
                        <View key={index} style={styles.slide}>
                            <View style={styles.imageContainerShoe}>
                                <Image
                                    style={styles.shoeImage}
                                    source={{ uri: item.shoeURL }} // Use source attribute for images in React Native
                                />
                            </View>
                        </View>
                    ))}
                </Swiper>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    swiperContainer: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
        marginTop: 10,
    },
    imageContainerTop: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 8,
    },
    imageContainerBottom: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 8,
    },
    imageContainerShoe: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 8,
    },
    swiper: {
        height: 200,
    },
    slide: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    topImage: {
        width: 200,
        height: 200,
        resizeMode: 'contain',
        borderRadius: 8,
    },
    bottomImage: {
        width: 200,
        height: 200,
        resizeMode: 'contain',
        borderRadius: 8,
    },
    shoeImage: {
        width: 200,
        height: 200,
        resizeMode: 'contain',
        borderRadius: 8,
    },
    dotStyle: {
        width: 5,
        height: 5,
        borderRadius: 5,
        margin: 5,
        backgroundColor: 'lightgray',
    },
    activeDotStyle: {
        width: 5,
        height: 5,
        borderRadius: 5,
        margin: 5,
        backgroundColor: 'gray',
    },

});


export default ClosetScreen;