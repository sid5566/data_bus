import { View, Text, TextInput, TouchableOpacity, Platform, FlatList, Image } from 'react-native'
import React, { useState } from 'react'
import {
  responsiveHeight as hp,
  responsiveWidth as wp,
  responsiveFontSize as rsvp
} from "react-native-responsive-dimensions";
import { OtpInput } from "react-native-otp-entry";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import database, { firebase } from '@react-native-firebase/database';
import { useFocusEffect } from '@react-navigation/native';
import { getData } from '../AsyncStore';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { getApp } from '@react-native-firebase/app';
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from '@react-native-firebase/storage';
import { getDatabase, ref as dbRef, push } from '@react-native-firebase/database';
const RadingCalculator = ({ navigation, route }) => {

  

  let [userdata, Setuserdata] = useState({});
  let [timeStampXX, Settimestamp] = useState('')
  let [List, SetList] = useState([])
  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        try {
          const u = await getData('usercred');
          Setuserdata(u);  // ❌ no await needed
  
          const ud = await getData('timestamp');
          Settimestamp(ud); // ❌ no await needed
  
          console.log('Fetched user and timestamp:', u, ud);
  
          const snapshot = await database()
            .ref(`/reading/${u.user.uid.toString()}`)
            .once('value');
  
          if (snapshot.exists()) {
            const readings = snapshot.val();
            console.log('All readings:', readings);
  
            // Convert snapshot to array and map over it
            const readingList = Object.entries(readings).map(([timeStamp, data]) => ({
              timeStamp: parseInt(timeStamp),  // Ensure timeStamp is a number for sorting
              ...data,
            }));
  
            // Sort the list by timeStamp (ascending order)
            const sortedReadingList = readingList.sort((a, b) => b.timeStamp - a.timeStamp);
  
            // If you need descending order, change the sorting line to:
            // const sortedReadingList = readingList.sort((a, b) => b.timeStamp - a.timeStamp);
  
            console.log('Sorted list:', sortedReadingList);
            SetList(sortedReadingList);
          } else {
            console.log('No readings found.');
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };
  
      fetchData(); // Call the async function here
  
      return () => {
        // cleanup if needed
      };
    }, [])
  );
  
  let [Readingdata, SetReadingData] = useState({
    Readingnumber: "",
    studentcount: "",
    checkBox: false,
    baseimg:''

  })
  const handleChange = (key, value) => {
    SetReadingData({ ...Readingdata, [key]: value });
  };

  let Save_Update = async (data) => {
    const timeStamp = Date.now();
    console.log('asdas', userdata.user.uid.toString(), `/reading/${userdata.user.uid.toString()}/${timeStamp}`)
    database()
      .ref(`/reading/${userdata.user.uid.toString()}/${timeStamp}`)
      .set({
        Readingnumber: Readingdata.Readingnumber,
        studentcount: Readingdata.studentcount,
        checkBox: Readingdata.checkBox,
        userid: userdata.user.uid.toString(),
        baseimg:Readingdata.baseimg
      })
      .then(() => {
        console.log("Details updated successfully!");
        navigation.navigate('Home')
      })
      .catch(error => {
        console.error("Update failed: ", error);
      });


      await database()
  .ref(`/buses/${userdata.user.uid.toString()}/${timeStampXX}`)
  .update({
    LatestTime: timeStamp, // Only updating the 'name' field
  });
  }

  const openCamera = () => {
    launchCamera(
      {
        mediaType: 'photo',
        cameraType: 'back',
        includeBase64:true
      },
      async (response) => {
        if (response.didCancel) {
          console.log('User cancelled camera picker');
        } else if (response.errorCode) {
          console.log('Camera Error: ', response.errorMessage);
        } else {
          console.log('Photo taken: ', response.assets[0].base64);
          handleChange('baseimg',  response.assets[0].base64)
        }
      }
    );
  };

  let renderListdata =({item})=>
  {
    const convertTimestampToTime = (timestamp) => {
      const date = new Date(parseInt(timestamp)); // Convert the string to a number
      let hours = date.getHours();
      let minutes = date.getMinutes();
      const period = hours >= 12 ? 'PM' : 'AM';
      
      // Convert 24-hour format to 12-hour format
      hours = hours % 12;
      hours = hours ? hours : 12; // 0 should be 12
    
      // Add leading zero to minutes if less than 10
      minutes = minutes < 10 ? '0' + minutes : minutes;
    
      return `${hours}:${minutes} ${period}`;
    };

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
   return (
    <View style={{padding:wp(2)}}>
    <View style={{ backgroundColor: '#151949', height: hp(20), width: wp(90), borderRadius: wp(6), justifyContent: 'center', alignItems: 'center' }}>
   <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: wp(60) }}>
       <View style={{ backgroundColor: 'white', height:hp(10), borderRadius: wp(8), width: wp(30), borderWidth: 4, borderColor: '#000000', justifyContent: 'center', alignItems: 'center' }}>
       <Image
       resizeMode='cover'
  source={{ uri: `data:image/jpeg;base64,${item.baseimg}` }}
  style={{  width: wp(30), height:hp(10) }} 
/>
       </View>
      <View>
      <View style={{ paddingLeft: wp(6) }}>
           <Text style={{ color: 'white', fontWeight: '500', fontSize: rsvp(2) }}>Reading:{item.Readingnumber}</Text>
       </View>
       <View style={{ paddingLeft: wp(6) }}>
           <Text style={{ color: 'white', fontWeight: '500', fontSize: rsvp(2) }}>Student:{item.studentcount}</Text>
       </View>
       <View style={{ paddingLeft: wp(6) }}>
           <Text style={{ color: 'white', fontWeight: '500', fontSize: rsvp(2) }}>Time:{convertTimestampToTime(item.timeStamp)}</Text>
       </View>
       <View style={{ paddingLeft: wp(6) }}>
           <Text style={{ color: 'white', fontWeight: '500', fontSize: rsvp(2) }}>Shift:{item.checkBox ? "First " : "Second "}</Text>
       </View>
       <View style={{ paddingLeft: wp(6) }}>
           <Text style={{ color: 'white', fontWeight: '500', fontSize: rsvp(2) }}>Date:{convertTimestampToDate(item.timeStamp)}</Text>
       </View>
      </View>
   </View>

</View>
  </View>
   )
  }
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#333d73' }}>
      <Text style={{ fontSize: rsvp(3), color: 'white', fontWeight: '600' }}>Enter Bus Reading and Details</Text>
      <View style={{ padding: wp(3) }}>
        <TouchableOpacity onPress={() => { openCamera() }}>
          <View style={{ height: hp(5), backgroundColor: 'blue', width: wp(50), borderRadius: wp(2), justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: 'white', fontWeight: '600', fontSize: rsvp(2) }}>Open Camera</Text>
          </View>
        </TouchableOpacity>
      </View>
      <View style={{ paddingTop: hp(2), paddingHorizontal: wp(5) }}>
        <Text style={{ fontSize: rsvp(2), color: 'white', fontWeight: '600' }}>Bus Reading</Text>
        <View style={{ paddingTop: hp(2) }}>
          <OtpInput numberOfDigits={6} onTextChange={(text) => handleChange("Readingnumber", text)} theme={{
            pinCodeTextStyle: { color: 'white' }
          }} />
        </View>
      </View>
      <View style={{ paddingTop: hp(2), paddingHorizontal: wp(5) }}>
        <Text style={{ fontSize: rsvp(2), color: 'white', fontWeight: '600' }}>Student Count</Text>
        <View style={{ paddingTop: hp(2) }}>
          <View style={{ paddingHorizontal: wp(25) }}>
            <OtpInput numberOfDigits={3} onTextChange={(text) => handleChange("studentcount", text)} theme={{
              pinCodeTextStyle: { color: 'white' }
            }} />
          </View>
        </View>

      </View>
      <View style={{ paddingTop: hp(2), flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: wp(40) }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ color: 'white' }}>{Readingdata.checkBox ? "First Shift" : "Second Shift"}</Text>
          </View>
          <View style={{ paddingLeft: wp(5) }}>
            <BouncyCheckbox
              size={25}
              fillColor="blue"
              unFillColor="white"
              iconStyle={{ borderColor: "red" }}
              innerIconStyle={{ borderWidth: 2 }}
              textStyle={{ fontFamily: "JosefinSans-Regular" }}
              onPress={(isChecked: boolean) => {
                SetReadingData({ ...Readingdata, checkBox: isChecked });
              }}
            />
          </View>
        </View>
      </View>
      <View style={{ paddingTop: hp(2) }}>
        <TouchableOpacity onPress={() => Save_Update(Readingdata)}>
          <View style={{ height: hp(7), backgroundColor: 'blue', width: wp(80), borderRadius: wp(8), justifyContent: 'center', alignItems: 'center', }}>
            <Text style={{ color: 'white', fontWeight: '600', fontSize: rsvp(3) }}>Submit</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={{ height: hp(35),  width: wp(100) }}>
                  <FlatList data={List} renderItem={({item})=>{return renderListdata({ item });}}/>
      </View>
    </View>
  )
}

export default RadingCalculator