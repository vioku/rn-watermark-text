import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  PermissionsAndroid,
  Platform,
  Modal,
  Linking,
  ScrollView,
} from 'react-native';
import React, {useState} from 'react';
import {launchImageLibrary} from 'react-native-image-picker';
import Marker, {Position, TextBackgroundType} from 'react-native-image-marker';
import {Picker} from '@react-native-picker/picker';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';

import ColorPicker, {
  Panel1,
  Preview,
  OpacitySlider,
  HueSlider,
} from 'reanimated-color-picker';
import Svg, {Path} from 'react-native-svg';
import moment from 'moment';
const App = () => {
  const [modal, setmodal] = useState({show: false, isdate: false});
  const [showdate, setshowdate] = useState(false);

  const [image, setimage] = useState('');
  const [loading, setloading] = useState(false);
  const [form, setform] = useState({
    text: 'Dendi R.S',
    color: '#ffffff80',
    fontSize: '1.3',
    fontName: 'Ephesis-Regular',
    position: 'topCenter',
    datetext: moment().format('DD/MM/YYYY HH:mm:ss'),
    datecolor: '#ffffff',
    datefontSize: '1',
    datefontName: 'CourierPrime-Regular',
    dateposition: 'bottomCenter',
  });
  async function getimage() {
    setloading(true);
    setimage('');

    try {
      const response = await launchImageLibrary({
        quality: 1,
        mediaType: 'photo',
        includeExtra: true,
        exif: true,
        storageOptions: {
          skipBackup: true,
          path: 'images',
        },
      });

      const {height, width} = response.assets[0];
      const fontSize = width * (parseFloat(form.fontSize) / 100);
      const datefontSize = width * (parseFloat(form.datefontSize) / 100);
      const options = {
        backgroundImage: {
          src: response.assets[0].uri,
          scale: 1,
        },
        watermarkTexts: [
          {
            text: form.text,
            positionOptions: {
              position: Position[form.position],
            },
            style: {
              color: form.color,
              fontSize: fontSize,
              fontName: form.fontName,
              textBackgroundStyle: {
                type: TextBackgroundType.none,
              },
            },
          },
          ...(showdate
            ? [
                {
                  text: form.datetext,
                  positionOptions: {
                    position: Position[form.dateposition],
                  },
                  style: {
                    color: form.datecolor,
                    fontSize: datefontSize,
                    fontName: form.datefontName,
                    textBackgroundStyle: {
                      type: TextBackgroundType.none,
                    },
                  },
                },
              ]
            : []),
        ],
        scale: 1,
        maxSize: 2048 * 26,
      };
      Marker.markText(options)
        .then(async res => {
          setimage('file://' + res);
          setloading(false);
        })
        .catch(err => {
          Alert.alert(err.toString());
          setloading(false);
        });
    } catch (error) {
      setloading(false);
    }
  }
  async function hasAndroidPermission() {
    const checkPermissions = async () => {
      const readMediaImages =
        Platform.Version >= 33
          ? await PermissionsAndroid.check(
              PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
            )
          : await PermissionsAndroid.check(
              PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
            );
      if (Platform.Version >= 33) {
        const readMediaVideo = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
        );
        return readMediaImages && readMediaVideo;
      }
      return readMediaImages;
    };
    const requestPermissions = async () => {
      if (Platform.Version >= 33) {
        const statuses = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
        ]);
        return (
          statuses[PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          statuses[PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO] ===
            PermissionsAndroid.RESULTS.GRANTED
        );
      }
      const status = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      );
      return status === PermissionsAndroid.RESULTS.GRANTED;
    };
    const hasPermission = await checkPermissions();
    if (hasPermission) {
      return true;
    }
    return await requestPermissions();
  }

  async function savePicture() {
    if (Platform.OS === 'android' && !(await hasAndroidPermission())) return;
    try {
      CameraRoll.save('file://' + image);
      Alert.alert('Sukses', 'Gambar berhasil disimpan ke galeri.');
    } catch (error) {
      Alert.alert('Error', error.toString());
    }
  }

  const onSelectColor = ({isdate = false, hex}) => {
    const key = isdate ? 'datecolor' : 'color';
    setform({...form, [key]: hex});
  };

  return (
    <ScrollView
      className="bg-gray-800 h-screen"
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}>
      <View className="px-4 my-3">
        <View className="border border-gray-700 rounded-md p-2">
          <Text className="mb-3 text-white font-[OoohBaby-Regular] text-3xl text-center">
            Watermark IMG
          </Text>
          <View className="mb-3">
            <Text className="text-white">Text Watermark</Text>
            <TextInput
              value={form.text}
              onChangeText={text => setform({...form, text: text})}
              className="px-2 py-1 text-white rounded-md border border-slate-700"
            />
          </View>
          <View className="flex flex-row w-full justify-between mb-3">
            <View className="w-[48%]">
              <Text className="text-white">Font Size</Text>
              <TextInput
                keyboardType="numeric"
                value={form.fontSize}
                onChangeText={text => setform({...form, fontSize: text})}
                className="px-2 py-1 text-white rounded-md border border-slate-700"
              />
            </View>
            <View className="w-[48%]">
              <Text className="text-white">Font Color</Text>
              <TouchableOpacity
                onPress={() => setmodal({show: true, isdate: false})}
                className="px-2 py-2 rounded-md border border-slate-700">
                <Text className="text-white">{form.color}</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View className="flex flex-row w-full justify-between mb-3">
            <View className="w-[48%]">
              <Text className="text-white">Font Name</Text>
              <Picker
                className="text-white"
                style={{
                  borderColor: 'white',
                  borderWidth: 1,
                  borderStyle: 'solid',
                  color: '#ffffff',
                  padding: 0,
                }}
                selectedValue={form.fontName}
                onValueChange={(itemValue, itemIndex) =>
                  setform({...form, fontName: itemValue})
                }>
                {[
                  'CourierPrime-Regular',
                  'DancingScript-VariableFont_wght',
                  'Ephesis-Regular',
                  'Kalam-Regular',
                  'OoohBaby-Regular',
                  'Poppins-Regular',
                  'Sacramento-Regular',
                  'SourceCodePro-VariableFont_wght',
                  'Ubuntu-Regular',
                  'WorkSans-VariableFont_wght',
                ].map((item, index) => {
                  return <Picker.Item key={index} label={item} value={item} />;
                })}
              </Picker>
            </View>
            <View className="w-[48%]">
              <Text className="text-white">Position</Text>
              <Picker
                className="text-white"
                style={{
                  borderColor: 'white',
                  borderWidth: 1,
                  borderStyle: 'solid',
                  color: '#ffffff',
                  padding: 0,
                }}
                selectedValue={form.position}
                onValueChange={(itemValue, itemIndex) =>
                  setform({...form, position: itemValue})
                }>
                {[
                  'bottomCenter',
                  'bottomLeft',
                  'bottomRight',
                  'center',
                  'topCenter',
                  'topLeft',
                  'topRight',
                ].map((item, index) => {
                  return <Picker.Item key={index} label={item} value={item} />;
                })}
              </Picker>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => setshowdate(!showdate)}
            className="w-full border border-blue-500 rounded-md p-2 mb-3">
            <Text className="font-bold text-center text-white">
              {showdate ? 'Hide date' : 'Show date'}
            </Text>
          </TouchableOpacity>
          {showdate && (
            <>
              <View className="mb-3">
                <Text className="text-white">Date</Text>
                <TextInput
                  value={form.datetext}
                  onChangeText={text => setform({...form, datetext: text})}
                  className="px-2 py-1 text-white rounded-md border border-slate-700"
                />
              </View>
              <View className="flex flex-row w-full justify-between mb-3">
                <View className="w-[48%]">
                  <Text className="text-white">Font Size</Text>
                  <TextInput
                    keyboardType="numeric"
                    value={form.datefontSize}
                    onChangeText={text =>
                      setform({...form, datefontSize: text})
                    }
                    className="px-2 py-1 text-white rounded-md border border-slate-700"
                  />
                </View>
                <View className="w-[48%]">
                  <Text className="text-white">Font Color</Text>
                  <TouchableOpacity
                    onPress={() => setmodal({show: true, isdate: true})}
                    className="px-2 py-2 rounded-md border border-slate-700">
                    <Text className="text-white">{form.datecolor}</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View className="flex flex-row w-full justify-between mb-3">
                <View className="w-[48%]">
                  <Text className="text-white">Font Name</Text>
                  <Picker
                    className="text-white"
                    style={{
                      borderColor: 'white',
                      borderWidth: 1,
                      borderStyle: 'solid',
                      color: '#ffffff',
                      padding: 0,
                    }}
                    selectedValue={form.datefontName}
                    onValueChange={(itemValue, itemIndex) =>
                      setform({...form, datefontName: itemValue})
                    }>
                    {[
                      'CourierPrime-Regular',
                      'DancingScript-VariableFont_wght',
                      'Ephesis-Regular',
                      'Kalam-Regular',
                      'OoohBaby-Regular',
                      'Poppins-Regular',
                      'Sacramento-Regular',
                      'SourceCodePro-VariableFont_wght',
                      'Ubuntu-Regular',
                      'WorkSans-VariableFont_wght',
                    ].map((item, index) => {
                      return (
                        <Picker.Item key={index} label={item} value={item} />
                      );
                    })}
                  </Picker>
                </View>
                <View className="w-[48%]">
                  <Text className="text-white">Position</Text>
                  <Picker
                    className="text-white"
                    style={{
                      borderColor: 'white',
                      borderWidth: 1,
                      borderStyle: 'solid',
                      color: '#ffffff',
                      padding: 0,
                    }}
                    selectedValue={form.dateposition}
                    onValueChange={(itemValue, itemIndex) =>
                      setform({...form, dateposition: itemValue})
                    }>
                    {[
                      'bottomCenter',
                      'bottomLeft',
                      'bottomRight',
                      'center',
                      'topCenter',
                      'topLeft',
                      'topRight',
                    ].map((item, index) => {
                      return (
                        <Picker.Item key={index} label={item} value={item} />
                      );
                    })}
                  </Picker>
                </View>
              </View>
            </>
          )}
          <TouchableOpacity
            onPress={() => getimage()}
            className="w-full bg-blue-500 rounded-md p-2">
            <Text className="font-bold text-center text-white">
              Select Image
            </Text>
          </TouchableOpacity>
        </View>
        {loading ? (
          <Text className="text-2xl text-white font-[CourierPrime-Regular] text-center mt-5">
            Loading...
          </Text>
        ) : (
          <View className="mt-3">
            {image && (
              <>
                <Image
                  className="w-25 h-80  rounded-t-md"
                  resizeMode="contain"
                  source={{
                    uri: image
                      ? image
                      : 'https://reactnative.dev/img/logo-og.png',
                  }}
                />
                <TouchableOpacity
                  onPress={savePicture}
                  className="bg-blue-500 rounded-b-md p-1">
                  <Text className="text-center text-white font-bold">Save</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
        <View className="flex justify-center items-center mt-6">
          <Text className="text-white text-lg font-[CourierPrime-Regular]">
            Developed With ♥️ By{' '}
            <Text
              onPress={() => Linking.openURL('https://facebook.com/vioku.jsx')}
              className="text-white text-lg font-[CourierPrime-Regular]">
              @Vioku
            </Text>
          </Text>
          <View className="flex flex-row justify-center items-center mt-3 gap-x-4">
            <TouchableOpacity
              onPress={() => Linking.openURL('https://github.com/vioku')}>
              <Svg
                xmlns="http://www.w3.org/2000/svg"
                width={20}
                height={20}
                fill="#ffffff"
                viewBox="0 0 16 16">
                <Path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8" />
              </Svg>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => Linking.openURL('https://facebook.com/vioku.jsx')}>
              <Svg
                xmlns="http://www.w3.org/2000/svg"
                width={20}
                height={20}
                fill="#ffffff"
                viewBox="0 0 16 16">
                <Path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951" />
              </Svg>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => Linking.openURL('https://t.me/viokujsx')}>
              <Svg
                xmlns="http://www.w3.org/2000/svg"
                width={20}
                height={20}
                fill="#ffffff"
                viewBox="0 0 16 16">
                <Path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8.287 5.906q-1.168.486-4.666 2.01-.567.225-.595.442c-.03.243.275.339.69.47l.175.055c.408.133.958.288 1.243.294q.39.01.868-.32 3.269-2.206 3.374-2.23c.05-.012.12-.026.166.016s.042.12.037.141c-.03.129-1.227 1.241-1.846 1.817-.193.18-.33.307-.358.336a8 8 0 0 1-.188.186c-.38.366-.664.64.015 1.088.327.216.589.393.85.571.284.194.568.387.936.629q.14.092.27.187c.331.236.63.448.997.414.214-.02.435-.22.547-.82.265-1.417.786-4.486.906-5.751a1.4 1.4 0 0 0-.013-.315.34.34 0 0 0-.114-.217.53.53 0 0 0-.31-.093c-.3.005-.763.166-2.984 1.09" />
              </Svg>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                Linking.openURL('https://instagram.com/vioku.jsx')
              }>
              <Svg
                xmlns="http://www.w3.org/2000/svg"
                width={20}
                height={20}
                fill="#ffffff"
                viewBox="0 0 16 16">
                <Path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.9 3.9 0 0 0-1.417.923A3.9 3.9 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.9 3.9 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.9 3.9 0 0 0-.923-1.417A3.9 3.9 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599s.453.546.598.92c.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.5 2.5 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.5 2.5 0 0 1-.92-.598 2.5 2.5 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233s.008-2.388.046-3.231c.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92s.546-.453.92-.598c.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92m-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217m0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334" />
              </Svg>
            </TouchableOpacity>
          </View>
        </View>
        <Modal visible={modal.show} animationType="slide" transparent={true}>
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
            }}>
            <View className="w-3/4 rounded-md bg-gray-800 p-3">
              <ColorPicker
                className="mb-3 flex flex-col gap-y-3"
                value="#FFFFFF80"
                onComplete={e =>
                  onSelectColor({isdate: modal.isdate, hex: e.hex})
                }>
                <Preview hideInitialColor={true} />

                <Panel1 />
                <HueSlider />
                <OpacitySlider />
              </ColorPicker>
              <TouchableOpacity
                onPress={() => setmodal({show: false, isdate: false})}
                className="bg-blue-500 p-2 rounded-md">
                <Text className="text-white font-bold text-center">Ok</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
};

export default App;
