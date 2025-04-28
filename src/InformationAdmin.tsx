import { View, Text, TouchableOpacity, Image, FlatList, PermissionsAndroid, Platform, Alert, Linking } from 'react-native';
import React, { useState } from 'react';
import database from '@react-native-firebase/database';
import XLSX from 'xlsx';
import RNFS from 'react-native-fs';
import {
  responsiveHeight as hp,
  responsiveWidth as wp,
  responsiveFontSize as rsvp
} from "react-native-responsive-dimensions";
import { useFocusEffect } from '@react-navigation/native';
import { getData } from '../AsyncStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const InformationAdmin = ({ navigation }) => {

  const [Buses, setBuses] = useState([]);
  const [FullData, setFullData] = useState([]); // ⭐ Added
  const [userdata, Setuserdata] = useState({});

  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        const u = await getData('usercred');
        await Setuserdata(u);
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

            // ⭐ Prepare full data (all entries not just latest)
            const fullArray = [];
            Object.entries(data).forEach(([userId, timestampsObj]) => {
              Object.entries(timestampsObj).forEach(([timestamp, info]) => {
                if (!isNaN(timestamp)) {
                  fullArray.push({
                    userid: userId,
                    timestamp: timestamp,
                    ...info
                  });
                }
              });
            });
            setFullData(fullArray);
          }
        });

        return () => ref.off('value', onValueChange);
      })();

      return () => { };
    }, [])
  );

  const formatTimestampToTime = (timestamp) => {
    const date = new Date(Number(timestamp));
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minutesStr} ${ampm}`;
  };

  const requestStoragePermission = async () => {
    try {
      if (Platform.OS === 'android') {
        if (Platform.Version >= 30) {
          if (PermissionsAndroid.PERMISSIONS.MANAGE_EXTERNAL_STORAGE) {
            const granted = await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.MANAGE_EXTERNAL_STORAGE,
              {
                title: "Storage Permission Needed",
                message: "App needs full storage access to download Excel.",
                buttonPositive: "OK",
                buttonNegative: "Cancel",
              },
            );
            if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
              Alert.alert('Permission Required', 'Please allow "All Files Access" manually.', [
                { text: 'Open Settings', onPress: () => Linking.openSettings() },
                { text: 'Cancel', style: 'cancel' }
              ]);
              return false;
            }
          } else {
            console.warn('MANAGE_EXTERNAL_STORAGE not available.');
            return false;
          }
        } else {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            {
              title: "Storage Permission Needed",
              message: "App needs storage access to download Excel.",
              buttonPositive: "OK",
              buttonNegative: "Cancel",
            },
          );
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            Alert.alert('Permission Required', 'Storage permission is required.');
            return false;
          }
        }
      }
      return true;
    } catch (err) {
      console.warn('Permission Error', err);
      return false;
    }
  };

  const DownloadExcel = async (data, type = 'latest') => {
    try {
      const excelData = data.map(item => ({
        UserId: item.userid || item.id || '',
        BusNumber: item.busnumber || '',
        DriverName: item.drivername || '',
        ConductorName: item.busconductor || '',
        LastUpdated: new Date(Number(item.timestamp)).toLocaleString(),
      }));

      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, type === 'latest' ? "LatestBuses" : "FullBusesData");
      const wbout = XLSX.write(wb, { type: 'binary', bookType: "xlsx" });

      const fileName = type === 'latest' ? `LatestBusData_${Date.now()}.xlsx` : `FullBusData_${Date.now()}.xlsx`;
      const path = `${RNFS.DownloadDirectoryPath}/${fileName}`;

      await RNFS.writeFile(path, wbout, 'ascii');

      console.log('Excel file saved to:', path);
      alert(`Excel (${type === 'latest' ? 'Latest' : 'Full'}) downloaded successfully!`);
    } catch (error) {
      console.error('Error downloading Excel:', error);
      alert('Failed to download Excel');
    }
  };

  const renderList = ({ item }) => {
    return (
      <TouchableOpacity onPress={() => navigation.navigate('BusListSp', { "asd": item.userid })}>
        <View style={{ padding: wp(2) }}>
          <View style={{ backgroundColor: '#151949', height: hp(20), width: wp(90), borderRadius: wp(6), justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: wp(60) }}>
              <View style={{ backgroundColor: 'white', padding: wp(2), borderRadius: wp(8), width: wp(16), borderWidth: 4, borderColor: '#000000', justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: 'black', fontWeight: '500', fontSize: rsvp(4) }}>{item.busnumber}</Text>
              </View>
              <View>
                <View style={{ paddingLeft: wp(6) }}>
                  <Text style={{ color: 'white', fontWeight: '500', fontSize: rsvp(2) }}>Driver Name: {item.drivername}</Text>
                </View>
                <View style={{ paddingLeft: wp(6) }}>
                  <Text style={{ color: 'white', fontWeight: '500', fontSize: rsvp(2) }}>Conductor Name: {item.busconductor}</Text>
                </View>
              </View>
            </View>
            {userdata.user.uid.toString() === item.userid && (
              <View style={{ backgroundColor: '#b55656', width: wp(20), height: hp(6), borderRadius: wp(5), justifyContent: 'center', alignItems: 'center', position: 'absolute', right: 4, top: 4 }}>
                <Text style={{ color: 'white', fontSize: rsvp(2), fontWeight: '500' }}>Your Bus</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#333d73' }}>
      
      {/* Logout Button */}
      <View style={{ position: 'absolute', top: hp(4), right: wp(3) }}>
        <TouchableOpacity onPress={async () => {
          await AsyncStorage.clear();
          await navigation.navigate('Login');
        }}>
          <View style={{ height: hp(3), backgroundColor: 'red', width: wp(25), borderRadius: wp(2), justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: 'white', fontWeight: '600', fontSize: rsvp(1.8) }}>Logout</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Bus List */}
      <View style={{ justifyContent: 'center', alignItems: 'center', height: hp(70), width: wp(100) }}>
        <FlatList data={Buses} renderItem={renderList} keyExtractor={(item, index) => index.toString()} />
      </View>

      {/* Download Excel Buttons */}
     <View style={{width:wp(100) , justifyContent:'space-between' , alignItems:'center' ,flexDirection:'row'}}>
     <TouchableOpacity
        onPress={() => DownloadExcel(Buses, 'latest')}
        style={{ backgroundColor: 'green', padding: wp(2), borderRadius: wp(4), marginTop: wp(2) }}
      >
        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: rsvp(2) }}>Download Latest Excel</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => DownloadExcel(FullData, 'full')}
        style={{ backgroundColor: 'blue', padding: wp(2), borderRadius: wp(4), marginTop: wp(2) }}
      >
        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: rsvp(2) }}>Download Full Data Excel</Text>
      </TouchableOpacity>
     </View>

      {/* Bottom Navigation */}
      <View style={{ backgroundColor: '#151949', height: hp(10), width: wp(100), position: 'absolute', bottom: 0, justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: wp(90) }}>
          <TouchableOpacity onPress={() => { navigation.navigate('HomeAdmin') }}>
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
  );
};

export default InformationAdmin;
