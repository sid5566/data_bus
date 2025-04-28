import { View, Text, TextInput, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import {
  responsiveHeight as hp,
  responsiveWidth as wp,
  responsiveFontSize as rsvp
} from "react-native-responsive-dimensions";
import { useFocusEffect } from '@react-navigation/native';
import database from '@react-native-firebase/database';
import { getData, storeData } from '../AsyncStore';

const BusInformation = ({ navigation, route }) => {
 let [userdata , Setuserdata]  = useState({})
  let [data, Setdata] = useState({
    busnumber: "00",
    busconductor: "",
    drivername: "",
    busoffino: "",
    timestamp:"",
  })

  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        try {
          const u = await getData('usercred');
        await  Setuserdata(u)
    
          const snapshot = await database()
            .ref(`/buses/${u.user.uid}`)
            .once('value');
    
          if (snapshot.exists()) {
            const buses = snapshot.val();
            const busArray = Object.keys(buses).map(timestamp => ({
              timestamp,
              ...buses[timestamp]
            }));
            Setdata({ ...busArray[0] });
          } else {
            console.log('No data available');
          }
        } catch (error) {
          console.error('Error fetching bus data:', error);
        }
      })();
   
      return () => {

      };
    }, [])
  );
  let Save_Update = async (data) => {
    const timestamp = Date.now();
    const updatedData = { ...data, 'timestamp':timestamp }; // ✅ add timestamp here
    storeData('timestamp' , timestamp);
    await database()
      .ref(`/buses/${userdata.user.uid}/${timestamp}`)
      .set({
        busnumber: data.busnumber,
        busconductor: data.busconductor,
        drivername: data.drivername,
        busoffino: data.busoffino,
        timestamp:timestamp,
        userid:userdata.user.uid
      });
      storeData("businfo",updatedData)
      navigation.navigate('RadingCalculator')

  }
  const handleChange = (key, value) => {
    Setdata({ ...data, [key]: value });
  };
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#333d73' }}>
      <View style={{ backgroundColor: 'white', padding: wp(2), borderRadius: wp(35), height: hp(20), width: wp(45), borderWidth: 4, borderColor: '#000000', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: 'black', fontWeight: '500', fontSize: rsvp(10) }}>{data.busnumber ? data.busnumber : "00"}</Text>
      </View>
      <View style={{ paddingTop: hp(2) }}>
        <TextInput
          placeholder="Bus Number"
          value={data.busnumber}
          onChangeText={(e) => handleChange("busnumber", e)}
          style={{ height: hp(7), width: wp(80), borderRadius: wp(8), borderWidth: 2, borderColor: 'blue', backgroundColor: 'white', color: 'black' }}
        />
      </View>
      <View style={{ paddingTop: hp(2) }}>
        <TextInput
          placeholder="Bus Conductor"
          value={data.busconductor}
          onChangeText={(e) => handleChange("busconductor", e)}
          style={{ height: hp(7), width: wp(80), borderRadius: wp(8), borderWidth: 2, borderColor: 'blue', backgroundColor: 'white', color: 'black' }}
        />
        <View style={{ paddingTop: hp(2) }}>
          <TextInput
            placeholder="Driver Name"
            value={data.drivername}
            onChangeText={(e) => handleChange("drivername", e)}
            style={{ height: hp(7), width: wp(80), borderRadius: wp(8), borderWidth: 2, borderColor: 'blue', backgroundColor: 'white', color: 'black' }}
          />
          <View style={{ paddingTop: hp(2) }}>
            <TextInput
              placeholder="Bus Number Orignal"
              value={data.busoffino}
              onChangeText={(e) => handleChange("busoffino", e)}
              style={{ height: hp(7), width: wp(80), borderRadius: wp(8), borderWidth: 2, borderColor: 'blue', backgroundColor: 'white', color: 'black' }}
            />
            <View style={{ paddingTop: hp(2) }}>
              <TouchableOpacity onPress={() => Save_Update(data)}>
                <View style={{ height: hp(7), backgroundColor: 'blue', width: wp(80), borderRadius: wp(8), justifyContent: 'center', alignItems: 'center', }}>
                  <Text style={{ color: 'white', fontWeight: '600', fontSize: rsvp(3) }}>Submit</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </View>
  )
}

export default BusInformation