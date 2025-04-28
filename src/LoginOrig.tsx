import { View, Text, TextInput, TouchableOpacity, Alert, ImageBackground } from 'react-native';
import React, { useState } from 'react';
import auth from '@react-native-firebase/auth';

import {
  responsiveHeight as hp,
  responsiveWidth as wp,
  responsiveFontSize as rsvp
} from "react-native-responsive-dimensions";
import database from '@react-native-firebase/database';
import { getData, storeData } from '../AsyncStore';
const LoginOrig = ({navigation}) => {

  const [LoginData, SetLoginData] = useState({
    email: '',
    password: '',
  });





  const handleChange = (key, value) => {
    SetLoginData({ ...LoginData, [key]: value });
  };
  const SignIn = async () => {
    const { email, password } = LoginData;
    try {
        const userCredential = await auth().signInWithEmailAndPassword(email, password);
        console.log(userCredential.user.uid)
        const userRef = database().ref(`/users/${userCredential.user.uid}`);
        const snapshot = await userRef.once('value');
        const userData = snapshot.val();
        storeData("usercred",  userCredential)
        storeData('LOGINP',userData.role)
       if(userData.role=='admin')
       {
        console.log('dsfsdfs')
        navigation.navigate('HomeAdmin')
       }
       else
       {
        navigation.navigate('BusInformation')
       } 
    } catch (error) {
        console.error(error);
    }
  };

  return (
  <ImageBackground source={require('../assets/images/bgimg.png')} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ paddingTop: hp(2) }}>
        <TextInput
          placeholder="Email"
          value={LoginData.email}
          onChangeText={(e) => handleChange("email", e)}
          style={{ height: hp(7), width: wp(80), borderRadius: wp(8), borderWidth: 2,  backgroundColor:'white' , color:'black' , borderColor:'blue' }}
        />
      </View>
      <View style={{ paddingTop: hp(2) }}>
        <TextInput
          placeholder="Password"
          secureTextEntry={true}
          value={LoginData.password}
          onChangeText={(e) => handleChange("password", e)}
          style={{ height: hp(7), width: wp(80), borderRadius: wp(8), borderWidth: 2, borderColor: 'blue'  , backgroundColor:'white' , color:'black'}}
        />
      </View>
      <View style={{ paddingTop: hp(2) }}>
        <TouchableOpacity onPress={SignIn}>
          <View style={{ height: hp(7), backgroundColor: 'blue', width: wp(80), borderRadius: wp(8), justifyContent: 'center', alignItems: 'center', }}>
            <Text style={{ color: 'white', fontWeight: '600', fontSize: rsvp(3) }}>Sign in</Text>
          </View>
        </TouchableOpacity>
      </View>
      <View  style={{ paddingTop: hp(2) }}>
     <TouchableOpacity onPress={()=>{navigation.navigate('Login')}}>
     <Text style={{textDecorationLine:'underline' , color:'red', fontWeight: '600', fontSize: rsvp(2)}}>Create Account</Text>
     </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

export default LoginOrig;
