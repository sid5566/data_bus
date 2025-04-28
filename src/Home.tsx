import { View, Text, TouchableOpacity, Image, FlatList } from 'react-native';
import React, { useState } from 'react';
import database from '@react-native-firebase/database';

import {
  responsiveHeight as hp,
  responsiveWidth as wp,
  responsiveFontSize as rsvp
} from "react-native-responsive-dimensions";
import { useFocusEffect } from '@react-navigation/native';
import { getData } from '../AsyncStore';
import { OtpInput } from 'react-native-otp-entry';

const Home = ({ navigation }) => {
  let [Buses, setBuses] = useState([]);
  let [userdata, Setuserdata] = useState({});
  let [curdate , Setcurdate] = useState('')
  const convertTimestampToDate = (timestamp) => {
    const date = new Date(parseInt(timestamp)); // Convert timestamp to Date object
    const day = date.getDate();
    const month = date.getMonth() + 1; // Months are 0-indexed, so add 1
    const year = date.getFullYear();
  
    // Add leading zero for day and month if necessary
    const formattedDay = day < 10 ? '0' + day : day;
    const formattedMonth = month < 10 ? '0' + month : month;
  
    return `${formattedMonth}/${formattedDay}/${year}`; // Return in MM/DD/YYYY format
  };
  // Load all buses on focus
  useFocusEffect(
    React.useCallback(() => {
     
      (async () => {
        const u = await getData('usercred');
        await Setuserdata(u);
        loadAllBuses();
      })();
      let t = Date.now()
      Setcurdate(convertTimestampToDate(t))
    }, [])
  );

  // Load all latest buses from each user
  const loadAllBuses = async () => {
    const ref = database().ref('/buses');
    const snapshot = await ref.once('value');
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
    }
  };

  // Search latest bus with given busnumber
  let Search = async (text) => {
    if (!text) {
      // Reload original list if search is cleared
      await loadAllBuses();
      return;
    }

    try {
      const snapshot = await database().ref('/buses').once('value');
      const data = snapshot.val();

      let matchingBuses = [];

      for (let userId in data) {
        const busesByUser = data[userId];
        for (let timestamp in busesByUser) {
          const bus = busesByUser[timestamp];
          if (bus.busnumber === text) {
            matchingBuses.push(bus);
          }
        }
      }

      if (matchingBuses.length === 0) {
        setBuses([]);
        return;
      }

      matchingBuses.sort((a, b) => b.timestamp - a.timestamp);
      const latestBus = matchingBuses[0];
      setBuses([latestBus]); // must be array for FlatList
    } catch (error) {
      console.error('Error searching buses:', error);
    }
  };

  let renderList = (item) => {
    console.log('asffdsfdsfsdfsd' , item.item)
    const formatTimestampToTime = (timestamp) => {
      const date = new Date(timestamp);
      let hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';

      hours = hours % 12;
      hours = hours ? hours : 12;
      const minutesStr = minutes < 10 ? '0' + minutes : minutes;

      return `${hours}:${minutesStr} ${ampm}`;
    };

    return (

      <View style={{ padding: wp(2) }}>
        {/* <TouchableOpacity onPress={()=>  {userdata?.user?.uid?.toString() === item.item.userid ?navigation.navigate('')}}>
        </TouchableOpacity> */}
        <View style={{
          backgroundColor: '#151949',
          height: hp(20),
          width: wp(90),
          borderRadius: wp(6),
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: wp(60) }}>
            <View style={{
              backgroundColor: 'white',
              padding: wp(2),
              borderRadius: wp(8),
              width: wp(16),
              borderWidth: 4,
              borderColor: '#000000',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <Text style={{ color: 'black', fontWeight: '500', fontSize: rsvp(4) }}>
                {item.item.busnumber}
              </Text>
            </View>
            <View style={{ paddingLeft: wp(6) }}>
              <Text style={{ color: 'white', fontWeight: '500', fontSize: rsvp(2) }}>
                Arrival Time {formatTimestampToTime(item.item.LatestTime)}
              </Text>
            </View>
          </View>
          {userdata?.user?.uid?.toString() === item.item.userid && (
            <View style={{
              backgroundColor: '#b55656',
              width: wp(20),
              height: hp(6),
              borderRadius: wp(5),
              justifyContent: 'center',
              alignItems: 'center',
              position: 'absolute',
              right: 4,
              top: 4
            }}>
              <Text style={{ color: 'white', fontSize: rsvp(2), fontWeight: '500' }}>
                Your Bus
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#333d73' }}>
      {/* Search Input */}
      <View style={{
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        paddingBottom: hp(2),
        paddingHorizontal: wp(35),
        paddingTop: hp(6)
      }}>
        <OtpInput
          numberOfDigits={2}
          onTextChange={(text) => Search(text)}
          theme={{
            pinCodeContainerStyle: { height: hp(5), width: wp(10) },
            pinCodeTextStyle: { color: 'white' }
          }}
        />
      </View>

      <View style={{justifyContent:'center' , alignItems:'center'}}>
      <Text style={{ color: 'white', fontWeight: '500', fontSize: rsvp(2) }}>{curdate}</Text>
      </View>

      {/* List of Buses */}
      <View style={{ justifyContent: 'center', alignItems: 'center', height: hp(90), width: wp(100) }}>
        <FlatList
          data={Buses}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderList}
        />
      </View>

      {/* Bottom Nav */}
      <View style={{
        backgroundColor: '#151949',
        height: hp(10),
        width: wp(100),
        position: 'absolute',
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: wp(90) }}>
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <Image source={require('../assets/images/home.png')} height={40} width={50} />
            <Text style={{ color: 'white', fontWeight: '500', fontSize: rsvp(3) }}>Home</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Info')}>
            <View style={{ justifyContent: 'center', alignItems: 'center', opacity: 0.3 }}>
              <Image source={require('../assets/images/info.png')} height={40} width={50} />
              <Text style={{ color: 'white', fontWeight: '500', fontSize: rsvp(3) }}>Information</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default Home;
