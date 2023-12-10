import React, { useState, useEffect } from 'react';
import {
    View,
    Image,
    Button,
    StyleSheet,
    Text,
    Platform,
    TouchableOpacity,
    Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { initializeApp } from 'firebase/app';
import {
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL,
} from 'firebase/storage';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import * as Location from 'expo-location';

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

const API_KEY = 'd5d622b87e057c9805f232ce7a7f8eea';

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const firestore = getFirestore(app);

const TEMPERATURE_VALUES = {
    COLD: 'cold',
    MODERATE: 'moderate',
    HOT: 'hot',
};

const COMFORT_VALUES = {
    UNCOMFORTABLE: 'uncomfortable',
    COMFORTABLE: 'comfortable',
};

export default function ImageUploadScreen() {
    const [selectedImage, setSelectedImage] = useState(null);
    const [temperatureFeedback, setTemperatureFeedback] = useState(null);
    const [comfortFeedback, setComfortFeedback] = useState(null);
    const [uploading, setUploading] = useState(false)

    const uploadToFastAPI = async (feedbackID) => {
        console.log("UploadToFastAPI")
        console.log("ID:", feedbackID)
        // const encodedFeedbackID = encodeURIComponent(feedbackID);
        const apiUrl = `http://localhost:8000/detect?feedbackID=%20${feedbackID}`;

        try {
            const response = await fetch(apiUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ feedbackID: feedbackID }),
            });

            if (!response.ok) {
              throw new Error('Failed to send image link to server');
            }

            const result = await response.json();
            console.log('Server response:', result);
            // Handle the response from the server here
          } catch (error) {
            console.error('Error sending image link to server:', error.message);
            // Handle errors here
          }

    };

    useEffect(() => {
        (async () => {
            if (Platform.OS !== 'web') {
                const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
                const mediaLibraryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();

                if (cameraStatus.status !== 'granted' || mediaLibraryStatus.status !== 'granted') {
                    alert('Permission to access camera and media library is required!');
                }
            }
        })();
    }, []);


    // ���������� ���� ����
    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setSelectedImage(result.assets[0].uri);
        }
    };

    // ī�޶�� ���
    const takePicture = async () => {
        try {
            let result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });

            if (!result.canceled) {
                setSelectedImage(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Error taking picture:', error);
        }
    };

    const handleTemperatureFeedback = (feedback) => {
        setTemperatureFeedback(feedback);
    };

    const handleComfortFeedback = (feedback) => {
        setComfortFeedback(feedback);
    };


    // ���ε� -> ����: ���丮��, ������ ����: ���̾���
    const uploadImage = async () => {
        try {
            if (!selectedImage || !temperatureFeedback || !comfortFeedback) {
                Alert.alert(
                    'Error',
                    'Please select an image, provide feedback, and rate the image first',
                    [
                        {
                            text: 'OK',
                            onPress: () => {
                                console.log('User clicked OK');
                            },
                        },
                    ],
                    { cancelable: false }
                );
                return;

            }

            setUploading(true);

            // Fetch current weather data
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.log('Permission to access location was denied');
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            const weatherResponse = await fetch(
                `http://api.openweathermap.org/data/2.5/weather?lat=${location.coords.latitude}&lon=${location.coords.longitude}&appid=${API_KEY}&units=metric`
            );
            const weatherData = await weatherResponse.json();

            // �ʿ��� ������ ���̾�� �ø���
            const { coord, main, name, weather } = weatherData;
            const { lat, lon } = coord;
            const { feels_like, temp } = main;
            const { description } = weather[0];

            // Fetch image data
            const imageResponse = await fetch(selectedImage);
            const blob = await imageResponse.blob();

            // Upload image to Firebase Storage
            const storageRef = ref(storage, `Cloth/${Date.now()}.jpg`);
            const uploadTask = uploadBytes(storageRef, blob);
            await uploadTask;

            const downloadURL = await getDownloadURL(storageRef);

            console.log('Image uploaded successfully! Download URL:', downloadURL);
            console.log('Temperature Feedback:', temperatureFeedback);
            console.log('Comfort Feedback:', comfortFeedback);
            console.log('Latitude:', lat);
            console.log('Longitude:', lon);
            console.log('Feels Like:', feels_like);
            console.log('Temperature:', temp);
            console.log('City Name:', name);
            console.log('Weather Description:', description);



            const feedbackDocRef = await addDoc(collection(firestore, 'feedback'), {
                timestamp: new Date(),
                downloadURL,
                temperatureFeedback,
                comfortFeedback,
                latitude: lat,
                longitude: lon,
                feelsLike: feels_like,
                temperature: temp,
                cityName: name,
                weatherDescription: description,
            });

            console.log('Feedback saved to Firestore with ID:', feedbackDocRef.id);
            uploadToFastAPI(feedbackDocRef.id);

            setUploading(false);

            Alert.alert(
                'Success',
                'Uploaded successfully!',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            console.log('User clicked OK');
                        },
                    },
                ],
                { cancelable: false }
            );
        } catch (error) {
            console.error('Error preparing image for upload:', error);
        }
    };


    return (
        <View style={styles.container}>
            <Button title="Take Picture" onPress={takePicture} />
            <Button title="Pick Image from Gallery" onPress={pickImage} />
            <View style={styles.imageContainer}>
                {!selectedImage ? (
                    <Text>Please select an image first</Text>
                ) : (
                    <Image source={{ uri: selectedImage }} style={styles.image} />
                )}
            </View>

            <View style={styles.feedbackContainer}>
                <View style={styles.feedbackRow}>
                    <TouchableOpacity
                        style={[styles.feedbackButton, temperatureFeedback === TEMPERATURE_VALUES.COLD && styles.selectedButton]}
                        onPress={() => handleTemperatureFeedback(TEMPERATURE_VALUES.COLD)}
                    >
                        <Text>Cold</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.feedbackButton, temperatureFeedback === TEMPERATURE_VALUES.MODERATE && styles.selectedButton]}
                        onPress={() => handleTemperatureFeedback(TEMPERATURE_VALUES.MODERATE)}
                    >
                        <Text>Moderate</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.feedbackButton, temperatureFeedback === TEMPERATURE_VALUES.HOT && styles.selectedButton]}
                        onPress={() => handleTemperatureFeedback(TEMPERATURE_VALUES.HOT)}
                    >
                        <Text>Hot</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.feedbackRow}>
                    <TouchableOpacity
                        style={[styles.feedbackButton, comfortFeedback === COMFORT_VALUES.UNCOMFORTABLE && styles.selectedButton]}
                        onPress={() => handleComfortFeedback(COMFORT_VALUES.UNCOMFORTABLE)}
                    >
                        <Text>Uncomfortable</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.feedbackButton, comfortFeedback === COMFORT_VALUES.COMFORTABLE && styles.selectedButton]}
                        onPress={() => handleComfortFeedback(COMFORT_VALUES.COMFORTABLE)}
                    >
                        <Text>Comfortable</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <Button title="Upload" onPress={uploadImage} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageContainer: {
        width: 200,
        height: 200,
        marginTop: 20,
        borderWidth: 1,
        borderColor: 'lightgray',
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: 200,
        height: 200,
    },
    feedbackContainer: {
        marginTop: 20,
    },
    feedbackRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 10,

    },
    feedbackButton: {
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 5,
        marginHorizontal: 5,
    },
    selectedButton: {
        backgroundColor: 'lightgray',
    },
});
