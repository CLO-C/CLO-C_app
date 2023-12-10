import React from 'react'
import Background from '../components/Background'
import Logo from '../components/Logo'
import Header from '../components/Header'
import Paragraph from '../components/Paragraph'
import Button from '../components/Button'
import { NavigationContainer } from '@react-navigation/native'
import BottomTabNavigator from './BottomTabNavigator';

export default function Dashboard({ navigation }) {
    return (
        <Background>
            <Logo />
            <Header>Main Screen</Header>
                       
        </Background>
    )
}

