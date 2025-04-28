import { View, Text, TouchableOpacity, Image, FlatList } from 'react-native'
import React, { useState } from 'react'
import database from '@react-native-firebase/database';

import {
  responsiveHeight as hp,
  responsiveWidth as wp,
  responsiveFontSize as rsvp
} from "react-native-responsive-dimensions";
import { useFocusEffect } from '@react-navigation/native';
import { getData } from '../AsyncStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
const Info = ({ navigation }) => {

  let Search = async (text) => {
    try {
      const snapshot = await database()
        .ref('/buses')
        .orderByChild('bus')
        .equalTo(Number(text))
        .once('value');
      if (snapshot.exists()) {
        const busno = snapshot.val();
        console.log('Matching users:', busno);
      } else {
        console.log('No user found');
      }
    } catch (error) {
      console.error('Search error:', error);
    }
  }
  let [Buses, setBuses] = useState({})
  let [userdata, Setuserdata] = useState({});
  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        const u = await getData('usercred');
        await Setuserdata(u)
        const ref = database().ref('/buses');

        const onValueChange = ref.on('value', snapshot => {
          const data = snapshot.val();
          if (data) {
            const busArray = Object.entries(data).map(([userId, timestampsObj]) => {
              const timeKeys = Object.keys(timestampsObj).filter(key => !isNaN(key));
              const latestTimestamp = Math.max(...timeKeys.map(Number));
              return {
                id: userId,
                ...timestampsObj[latestTimestamp],
                timestamp: latestTimestamp,
              };
            });
            setBuses(busArray);
            console.log(busArray)
          }
        });

        return () => ref.off('value', onValueChange);
      })();

      return () => {

      };
    }, [])
  );
  let renderList = (item) => {
    const formatTimestampToTime = (timestamp) => {
      const date = new Date(timestamp);
      let hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';

      hours = hours % 12;
      hours = hours ? hours : 12; // hour '0' should be '12'
      const minutesStr = minutes < 10 ? '0' + minutes : minutes;

      return `${hours}:${minutesStr} ${ampm}`;
    };

    return (
      <TouchableOpacity onPress={(() => {
        if (userdata.user.uid.toString() == item.item.userid) {
          navigation.navigate('RadingCalculator');
        }
      })}>
        <View style={{ padding: wp(2) }}>
          <View style={{ backgroundColor: '#151949', height: hp(20), width: wp(90), borderRadius: wp(6), justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: wp(60) }}>
              <View style={{ backgroundColor: 'white', padding: wp(2), borderRadius: wp(8), width: wp(16), borderWidth: 4, borderColor: '#000000', justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: 'black', fontWeight: '500', fontSize: rsvp(4) }}>{item.item.busnumber}</Text>
              </View>
              <View>
                <View style={{ paddingLeft: wp(6) }}>
                  <Text style={{ color: 'white', fontWeight: '500', fontSize: rsvp(2) }}>Driver Name:{item.item.drivername}</Text>
                </View>
                <View style={{ paddingLeft: wp(6) }}>
                  <Text style={{ color: 'white', fontWeight: '500', fontSize: rsvp(2) }}>Conductor Name:{item.item.busconductor}</Text>
                </View>
              </View>
            </View>
            {userdata.user.uid.toString() == item.item.userid ? <View style={{ backgroundColor: '#b55656', width: wp(20), height: hp(6), borderRadius: wp(5), justifyContent: 'center', alignItems: 'center', position: 'absolute', right: 4, top: 4 }}>
              <Text style={{ color: 'white', fontSize: rsvp(2), fontWeight: '500' }}>Your Bus</Text>
            </View> : null}
          </View>
        </View>
      </TouchableOpacity>

    )
  }
  return (

    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#333d73' }}>
      <View style={{position:'absolute' , top:hp(4) , right: wp(3),}}>
     <TouchableOpacity onPress={async ()=>
      {
       await AsyncStorage.clear();
       await navigation.navigate('Login')
      }
     }>
     <View style={{ height: hp(3), backgroundColor: 'red', width: wp(25), borderRadius: wp(2), justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: 'white', fontWeight: '600', fontSize: rsvp(1.8) }}>Log out</Text>
        </View>
     </TouchableOpacity>
      </View>
      <View style={{ justifyContent: 'center', alignItems: 'center', height: hp(80), width: wp(100) }}>

        <FlatList data={Buses} renderItem={(items) => renderList(items)} />
      </View>

      <View style={{ backgroundColor: '#151949', height: hp(10), width: wp(100), position: 'absolute', bottom: 0, justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: wp(90) }}>
          <TouchableOpacity onPress={() => { navigation.navigate('Home') }}>
            <View style={{ justifyContent: 'center', alignItems: 'center', opacity: 0.3 }}>
              <Image source={require('../assets/images/home.png')} height={40} width={50} />
              <Text style={{ color: 'white', fontWeight: '500', fontSize: rsvp(3) }}>Home</Text>
            </View>
          </TouchableOpacity>
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <Image source={require('../assets/images/info.png')} height={40} width={50} />
            <Text style={{ color: 'white', fontWeight: '500', fontSize: rsvp(3) }}>Information</Text>

          </View>
        </View>
      </View>
    </View>
  )
}

export default Info