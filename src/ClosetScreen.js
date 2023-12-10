import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import Swiper from 'react-native-swiper';

const ClosetScreen = () => {

    /////// ���� �̹���

    const topImages = [
        require('../assets/top1.png'),
        require('../assets/top2.png'),
        require('../assets/top3.png'),

    ];

    const bottomImages = [
        require('../assets/bottom1.png'),
        require('../assets/bottom2.png'),
        require('../assets/bottom3.png'),

    ];

    const shoeImages = [
        require('../assets/shoes1.png'),
        require('../assets/shoes2.png'),
        require('../assets/shoes3.png'),

    ];


    return (
        <View style={styles.container}>
            <View style={styles.swiperContainer}>
                <Swiper style={styles.swiper} showsButtons={false} loop dotStyle={styles.dotStyle} activeDotStyle={styles.activeDotStyle}>
                    {topImages.map((image, index) => (
                        <View key={index} style={styles.slide}>
                            <View style={styles.imageContainerTop}>
                                <Image source={image} style={styles.topImage} />
                            </View>
                        </View>
                    ))}
                </Swiper>
            </View>

            <View style={styles.swiperContainer}>
                <Swiper style={styles.swiper} showsButtons={false} loop dotStyle={styles.dotStyle} activeDotStyle={styles.activeDotStyle}>
                    {bottomImages.map((image, index) => (
                        <View key={index} style={styles.slide}>
                            <View style={styles.imageContainerBottom}>
                                <Image source={image} style={styles.bottomImage} />
                            </View>
                        </View>
                    ))}
                </Swiper>
            </View>

            <View style={styles.swiperContainer}>
                <Swiper style={styles.swiper} showsButtons={false} loop dotStyle={styles.dotStyle} activeDotStyle={styles.activeDotStyle}>
                    {shoeImages.map((image, index) => (
                        <View key={index} style={styles.slide}>
                            <View style={styles.imageContainerShoe}>
                                <Image source={image} style={styles.shoeImage} />
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
