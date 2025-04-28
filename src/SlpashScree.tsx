import { View, Text, ImageBackground } from 'react-native'
import React from 'react'
import { useFocusEffect } from '@react-navigation/native';
import { getData } from '../AsyncStore';
import {
    responsiveHeight as hp,
    responsiveWidth as wp,
    responsiveFontSize as rsvp
  } from "react-native-responsive-dimensions";
const SlpashScree = ({navigation}) => {

        useFocusEffect(
          React.useCallback(() => {
            // Do something when the screen is focused
                    setTimeout(async ()=>{
                        try {
                            const u = await getData('usercred');
                            const udaa = await getData('LOGINP');
                              if(u)
                              {

                                if(udaa=='admin')
                                  {
                                   console.log('dsfsdfs' , udaa)
                                   navigation.navigate('HomeAdmin')
                                  }
                                  else
                                  {
                                    navigation.replace('Home');
                                  }
                               
                              }else
                              {
                                navigation.replace('Login');
                              }
                          } catch (error) {
                            console.error('Error fetching bus data:', error);
                          }
                    },2000)
               

            return () => {
              // Do something when the screen is unfocused
              // Useful for cleanup functions
            };
          }, [])
        );

  return (
    <ImageBackground source={require('../assets/images/bgimg.png')} style={{justifyContent:'center' , alignItems:'center' , flex:1 }}>
     <View style={{ height: hp(7), backgroundColor: 'blue', width: wp(50), borderRadius: wp(2), justifyContent: 'center', alignItems: 'center' }}>
               <Text style={{ color: 'white', fontWeight: '600', fontSize: rsvp(3) }}>Data Bus</Text>
             </View>
    </ImageBackground>
  )
}

export default SlpashScree