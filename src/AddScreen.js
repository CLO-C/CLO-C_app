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
    const [uploading, setUploading] = useState(false);

    const uploadToFastAPI = async (imageLink) => {
        console.log("UploadToFastAPI")
        console.log("Link:", imageLink)
        const encodedImageLink = encodeURIComponent(imageLink);
        const apiUrl = `http://localhost:8000/detect?image_link=${encodedImageLink}`;

        try {
            const response = await fetch('http://localhost:8000/detect?image_link=' +encodedImageLink, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ image_link: imageLink }),
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


    // ���������� ���� ������
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
                console.error('Please select an image, provide feedback, and rate the image first');
                return;
            }

            setUploading(true);

            const response = await fetch(selectedImage);
            const blob = await response.blob();

            const storageRef = ref(storage, `Cloth/${Date.now()}.jpg`);
            const uploadTask = uploadBytes(storageRef, blob);

            await uploadTask.then(async () => {
              // Introduce a delay (e.g., using setTimeout) before getting the download URL
              const downloadURL = await getDownloadURL(storageRef);
              console.log('Image uploaded successfully to Firebase! Download URL:', downloadURL);

            }).catch((error) => {
              console.error('Error uploading image to Firebase:', error);
            });

            const downloadURL = await getDownloadURL(storageRef);

            console.log('Image uploaded successfully! Download URL:', downloadURL);
            console.log('Temperature Feedback:', temperatureFeedback);
            console.log('Comfort Feedback:', comfortFeedback);

            uploadToFastAPI(downloadURL);

            const feedbackDocRef = await addDoc(collection(firestore, 'feedback'), {
                timestamp: new Date(),
                downloadURL,
                temperatureFeedback,
                comfortFeedback,
            });

            console.log('Feedback saved to Firestore with ID:', feedbackDocRef.id);

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
            {selectedImage && <Image source={{ uri: selectedImage }} style={styles.image} />}

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
    image: {
        width: 200,
        height: 200,
        marginTop: 20,
    },
    feedbackContainer: {
        marginTop: 20,
    },
    feedbackRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 10,
    },
    feedbackButton: {
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 5,
        marginLeft: 10,
    },
    selectedButton: {
        backgroundColor: 'gray',
    },
});