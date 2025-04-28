import { View, Text, TextInput, TouchableOpacity, Alert, ImageBackground } from 'react-native';
import React, { useState } from 'react';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import {
  responsiveHeight as hp,
  responsiveWidth as wp,
  responsiveFontSize as rsvp
} from "react-native-responsive-dimensions";
import { getData, storeData } from '../AsyncStore';
import { useFocusEffect } from '@react-navigation/native';

const Login = ({navigation}) => {
 
  const [LoginData, SetLoginData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleChange = (key, value) => {
    SetLoginData({ ...LoginData, [key]: value });
  };

  const signUpAndSave = async () => {
    const { email, password, name } = LoginData;
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      const uid = userCredential.user.uid;
      // Save data to Realtime DB
      await database()
        .ref('/users/' + uid)
        .set({
          username: name,
          email: email,
        });

        Alert.alert('Alert Title', 'My Alert Msg', [
        
          {text: 'OK', onPress: () =>   navigation.navigate('LoginOrig')},
        ]);
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <ImageBackground source={require('../assets/images/bgimg.png')} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <TextInput
        placeholder="Name"
        value={LoginData.name}
        onChangeText={(e) => handleChange("name", e)}
        style={{ height: hp(7), width: wp(80), borderRadius: wp(8), borderWidth: 2, borderColor: 'blue' ,  backgroundColor:'white' , color:'black' }}
      />
      <View style={{ paddingTop: hp(2) }}>
        <TextInput
          placeholder="Email"
          value={LoginData.email}
          onChangeText={(e) => handleChange("email", e)}
          style={{ height: hp(7), width: wp(80), borderRadius: wp(8), borderWidth: 2, borderColor: 'blue', backgroundColor:'white' , color:'black' }}
        />
      </View>
      <View style={{ paddingTop: hp(2) }}>
        <TextInput
          placeholder="Password"
          secureTextEntry={true}
          value={LoginData.password}
          onChangeText={(e) => handleChange("password", e)}
          style={{ height: hp(7), width: wp(80), borderRadius: wp(8), borderWidth: 2, borderColor: 'blue', backgroundColor:'white' , color:'black' }}
        />
      </View>
      <View style={{ paddingTop: hp(2) }}>
        <TouchableOpacity onPress={signUpAndSave}>
          <View style={{ height: hp(7), backgroundColor: 'blue', width: wp(80), borderRadius: wp(8), justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: 'white', fontWeight: '600', fontSize: rsvp(3) }}>Sign Up</Text>
          </View>
        </TouchableOpacity>
      </View>
      
      <View  style={{ paddingTop: hp(2) }}>
     <TouchableOpacity onPress={()=>{navigation.navigate('LoginOrig')}}>
     <Text style={{textDecorationLine:'underline' , color:'red', fontWeight: '600', fontSize: rsvp(2)}}>Log in</Text>
     </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

export default Login;
