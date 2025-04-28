import { View, Text, TouchableOpacity, FlatList, Image, Alert } from 'react-native';
import React, { useState, useCallback } from 'react';
import { responsiveHeight as hp, responsiveWidth as wp, responsiveFontSize as rsvp } from "react-native-responsive-dimensions";
import database from '@react-native-firebase/database';
import { useFocusEffect } from '@react-navigation/native';
import { getData } from '../AsyncStore';
import * as XLSX from 'xlsx';
import RNFS from 'react-native-fs';
import DateTimePicker from '@react-native-community/datetimepicker';

const BusListSp = ({ navigation, route }) => {
  let [userdata, Setuserdata] = useState({});
  let [timeStampXX, Settimestamp] = useState('');
  let [List, SetList] = useState([]);
  let [selectedItems, setSelectedItems] = useState([]);
  let [selectAll, setSelectAll] = useState(false);
  let [startDate, setStartDate] = useState(null);
  let [endDate, setEndDate] = useState(null);
  let [showStartPicker, setShowStartPicker] = useState(false);
  let [showEndPicker, setShowEndPicker] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        try {
          const u = await getData('usercred');
          Setuserdata(u);

          const ud = await getData('timestamp');
          Settimestamp(ud);

          const snapshot = await database()
            .ref(`/reading/${route.params.asd}`)
            .once('value');

          if (snapshot.exists()) {
            const readings = snapshot.val();
            const readingList = Object.entries(readings).map(([timeStamp, data]) => ({
              timeStamp: parseInt(timeStamp),
              ...data,
            }));
            const sortedReadingList = readingList.sort((a, b) => b.timeStamp - a.timeStamp);
            SetList(sortedReadingList);
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };

      fetchData();
    }, [route.params.asd])
  );

  const toggleSelectItem = (item) => {
    const index = selectedItems.findIndex(i => i.timeStamp === item.timeStamp);
    if (index > -1) {
      setSelectedItems(selectedItems.filter(i => i.timeStamp !== item.timeStamp));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredData());
    }
    setSelectAll(!selectAll);
  };

  const filteredData = () => {
    if (startDate && endDate) {
      return List.filter(item => {
        const itemDate = new Date(item.timeStamp);
        return itemDate >= startDate && itemDate <= endDate;
      });
    }
    return List;
  };

  const downloadToExcel = async () => {
    try {
      let dataToExport = selectedItems.length > 0 ? selectedItems : filteredData();

      if (dataToExport.length === 0) {
        Alert.alert('No Data', 'No data selected or available to export.');
        return;
      }

      let excelData = dataToExport.map(item => ({
        Reading: item.Readingnumber,
        Student: item.studentcount,
        Shift: item.checkBox ? "First" : "Second",
        Date: convertTimestampToDate(item.timeStamp),
        Time: convertTimestampToTime(item.timeStamp),
      }));

      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Readings");

      const wbout = XLSX.write(wb, { type: 'binary', bookType: 'xlsx' });
      const path = `${RNFS.DownloadDirectoryPath}/BusReadings.xlsx`;

      await RNFS.writeFile(path, wbout, 'ascii');
      Alert.alert('Success', `Excel file has been saved to Download folder.`);
    } catch (error) {
      console.error('Error downloading Excel:', error);
      Alert.alert('Error', 'Failed to download Excel.');
    }
  };

  const convertTimestampToTime = (timestamp) => {
    const date = new Date(parseInt(timestamp));
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const period = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    minutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${hours}:${minutes} ${period}`;
  };

  const convertTimestampToDate = (timestamp) => {
    const date = new Date(parseInt(timestamp));
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  let renderListdata = ({ item }) => {
    const isSelected = selectedItems.some(i => i.timeStamp === item.timeStamp);

    return (
      <TouchableOpacity onPress={() => toggleSelectItem(item)} style={{ padding: wp(2) }}>
        <View style={{ backgroundColor: isSelected ? '#4CAF50' : '#151949', height: hp(20), width: wp(90), borderRadius: wp(6), justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: wp(60) }}>
            <View style={{ backgroundColor: 'white', height: hp(10), borderRadius: wp(8), width: wp(30), borderWidth: 4, borderColor: '#000000', justifyContent: 'center', alignItems: 'center' }}>
              <Image resizeMode='cover' source={{ uri: `data:image/jpeg;base64,${item.baseimg}` }} style={{ width: wp(30), height: hp(10) }} />
            </View>
            <View>
              <Text style={{ color: 'white', fontWeight: '500', fontSize: rsvp(2) }}>Reading: {item.Readingnumber}</Text>
              <Text style={{ color: 'white', fontWeight: '500', fontSize: rsvp(2) }}>Student: {item.studentcount}</Text>
              <Text style={{ color: 'white', fontWeight: '500', fontSize: rsvp(2) }}>Time: {convertTimestampToTime(item.timeStamp)}</Text>
              <Text style={{ color: 'white', fontWeight: '500', fontSize: rsvp(2) }}>Shift: {item.checkBox ? "First" : "Second"}</Text>
              <Text style={{ color: 'white', fontWeight: '500', fontSize: rsvp(2) }}>Date: {convertTimestampToDate(item.timeStamp)}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#333d73', padding: wp(4) }}>
      
      {/* Buttons */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: hp(2) }}>
        
        <TouchableOpacity onPress={handleSelectAll} style={{ backgroundColor: 'blue', padding: wp(2), borderRadius: wp(2) }}>
          <Text style={{ color: 'white', fontWeight: '600' }}>{selectAll ? 'Unselect All' : 'Select All'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setShowStartPicker(true)} style={{ backgroundColor: 'orange', padding: wp(2), borderRadius: wp(2) }}>
          <Text style={{ color: 'white' }}>Start Date</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setShowEndPicker(true)} style={{ backgroundColor: 'orange', padding: wp(2), borderRadius: wp(2) }}>
          <Text style={{ color: 'white' }}>End Date</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={downloadToExcel} style={{ backgroundColor: 'green', padding: wp(2), borderRadius: wp(2) }}>
          <Text style={{ color: 'white', fontWeight: '600' }}>Download</Text>
        </TouchableOpacity>

      </View>

      {/* DatePickers */}
      {showStartPicker && (
        <DateTimePicker
          value={startDate || new Date()}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowStartPicker(false);
            if (date) setStartDate(date);
          }}
        />
      )}
      {showEndPicker && (
        <DateTimePicker
          value={endDate || new Date()}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowEndPicker(false);
            if (date) setEndDate(date);
          }}
        />
      )}

      {/* FlatList */}
      <FlatList
        data={filteredData()}
        renderItem={renderListdata}
        keyExtractor={(item) => item.timeStamp.toString()}
      />
    </View>
  );
};

export default BusListSp;
