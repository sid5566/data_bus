import { View, Text } from 'react-native'
import React from 'react'
import Login from './src/Login'
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginOrig from './src/LoginOrig';
import Home from './src/Home';
import Info from './src/Info';
import BusInformation from './src/BusInformation';
import RadingCalculator from './src/RadingCalculator';
import SlpashScree from './src/SlpashScree';
import HomeAdmin from './src/HomeAdmin';
import InformationAdmin from './src/InformationAdmin';
import BusListSp from './src/BusListSp';
const Stack = createNativeStackNavigator();
const App = () => {
  return (
    <NavigationContainer>
    <Stack.Navigator initialRouteName='SlpashScree' screenOptions={{headerShown:false}}>
        <Stack.Screen
            name="Login"
            component={Login}
        />
           <Stack.Screen
            name="LoginOrig"
            component={LoginOrig}
        />
         <Stack.Screen
            name="Home"
            component={Home}
        />
         <Stack.Screen
            name="Info"
            component={Info}
        />
         <Stack.Screen
            name="BusInformation"
            component={BusInformation}
        />
  <Stack.Screen
            name="RadingCalculator"
            component={RadingCalculator}
        />

<Stack.Screen
            name="SlpashScree"
            component={SlpashScree}
        />
        <Stack.Screen
            name="HomeAdmin"
            component={HomeAdmin}
        />
        <Stack.Screen
            name="InformationAdmin"
            component={InformationAdmin}
        />
 <Stack.Screen
            name="BusListSp"
            component={BusListSp}
        />









    </Stack.Navigator>
</NavigationContainer>
  )
}

export default App