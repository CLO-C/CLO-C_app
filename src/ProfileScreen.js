import React from 'react';
import { View, Text, StyleSheet, Image, Button } from 'react-native';

const ProfileScreen = () => {
    return (
        <View style={styles.container}>
            <Image 
                source={require('../assets/default_profile.png')} 
                style={styles.profileImage}
            />
            <Text style={styles.username}>minseon</Text>
            <Text style={styles.email}>minseon9286@naver.com</Text>

            <View style={styles.buttonContainer}>
                <Button title="Logout" color="#FF5733" />
            </View>

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        //justifyContent: 'center',
    },
    profileImage: {
        width: 200,
        height: 200,
        borderRadius: 100, 
        borderWidth: 1,
        borderColor: 'lightgray',
        marginTop: 130,
        marginBottom: 30,
    },
    username: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    email: {
        fontSize: 16,
        color: '#555',
    },
    buttonContainer: {
        marginTop: 50,
        width: '70%',
    },
});

export default ProfileScreen;
