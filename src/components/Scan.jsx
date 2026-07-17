import axios from 'axios';
import { useAudioPlayer } from 'expo-audio';
import { router } from 'expo-router';
import * as ScreenOrientation from "expo-screen-orientation";
import { useEffect, useRef, useState } from 'react';
import { setEmployeeId } from '../../redux/itemSlice';
import {
  Alert,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View
} from 'react-native';
import { useDispatch } from 'react-redux';

const ghraLogo = require('../../assets/images/WH-New-Logo-PNG-scaled.png');

const Scan = ({ navigation }) => {
  const dispatch = useDispatch();
  const { width, height } = useWindowDimensions();

  // Scale factor based on a 390px wide baseline (iPhone 14 Pro)
  const scale = Math.min(width, height) / 390;
  const rs = (size) => Math.round(size * scale);

  const player = useAudioPlayer(require('../../assets/sounds/buzzer.mp3'));
  const [badgeId, setBadgeId] = useState('');

  const [modalVisible, setModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [loading, setLoading] = useState(false);
  const [lastSubmitted, setLastSubmitted] = useState('');

  const inputRef = useRef(null);
  const badgeIdRef = useRef('');

  async function playSound() {
    player.seekTo(0);
    player.play();
  }

  async function showError(message) {
    try {
      await playSound();
      setErrorMessage(message);
      setModalVisible(true);
    } catch (err) {
      console.log("showError: ", err.message);
    }
  }

  function handleSubmit(rawValue) {
    const cleaned = rawValue.replace(/[\r\n]/g, '').trim();
    console.log("handleSubmit cleaned:", cleaned);

    if (!cleaned) return;

    // Clear ref immediately so debounce can't fire again with the same value
    badgeIdRef.current = '';

    if (!cleaned.includes("TA")) {
      Alert.alert("That is not a valid badge");
      setBadgeId('');
      setLastSubmitted('');
      return;
    }

    sendScannedData(cleaned);
  }

  async function sendScannedData(code) {
    console.log("CODE: ", code)
    console.log("sendScannedData running");
    if (!code) return;
    if (loading) return;
    if (code === lastSubmitted) return;

    setLoading(true);
    setLastSubmitted(code);

    try {
      const response = await axios.post(
        'http://192.168.2.165:81/api/Employee/getEmployee',
        {
          token: 'Yh2k7QSu4l8CZg5p6X3Pna9L0Miy4D3Bvt0JVr87UcOj69Kqw5R2Nmf4FWs03Hdx',
          employeeCode: code,
        }
      );

      const emp = response?.data?.data?.[0];

      if (!response?.data?.success || !emp) {
        throw new Error(`Employee not found in DB: ${code}`);
      } else {
          dispatch(setEmployeeId(emp.employeeID));
      }

      // dispatch(setUsername(emp.employeeName));
      // dispatch(
      //   setUser({
      //     employeeID: String(emp.employeeID),
      //     employeeName: emp.employeeName,
      //     isOrderSelectorFrozen: emp.isOrderSelectorFrozen,
      //     isOrderSelectorGrocery: emp.isOrderSelectorGrocery,
      //     isOrderSelectorPromo: emp.isOrderSelectorPromo,
      //     isOrderSelectorTobacco: emp.isOrderSelectorTobacco,
      //   })
      // );

      router.replace('/menu');
    } catch (err) {
      const detail = err?.response?.status
        || err?.code
        || err?.message;
      await showError(`[${detail}] ${err?.message}`);
    } finally {
      setLoading(false);
    }
  }

  // Orientation lock
  useEffect(() => {
    const lock = async () => {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    };

    const timer = setTimeout(lock, 100);

    return () => {
      clearTimeout(timer);
      ScreenOrientation.unlockAsync();
    };
  }, []);

  // Note: useAudioPlayer manages its own loading/unloading lifecycle,
  // so no manual cleanup effect is needed here.

  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        {/* ERROR MODAL */}
        <Modal transparent visible={modalVisible} animationType="fade">
          <View style={styles.modalBackdrop}>
            <View style={styles.modalView}>
              <Text style={[styles.modalText, { fontSize: rs(18) }]}>{errorMessage}</Text>

              <TouchableOpacity
                style={[styles.okButton, { paddingVertical: rs(10), paddingHorizontal: rs(30) }]}
                onPress={() => {
                  setModalVisible(false);
                  setBadgeId('');
                  setLastSubmitted('');
                }}
              >
                <Text style={[styles.okButtonText, { fontSize: rs(18) }]}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Image style={[styles.logo, { width: rs(300), height: rs(300) }]} source={ghraLogo} />

        <Text style={styles.version}>Version 1.0</Text>

        <View style={styles.scanBox}>
          <TextInput
            ref={inputRef}
            style={[styles.input, { width: rs(300), height: rs(60), fontSize: rs(16) }]}
            value={badgeId}
            autoFocus
            onChangeText={(text) => {
              console.log('badge RAW:', JSON.stringify(text));

              // Ring Wedge sends \r or \n as an Enter terminator after the scan
              if (text.endsWith('\r') || text.endsWith('\n')) {
                badgeIdRef.current = '';
                setBadgeId('');
                handleSubmit(text);
                return;
              }

              badgeIdRef.current = text;
              setBadgeId(text);
            }}
            onSubmitEditing={() => {
              console.log('onSubmitEditing fired — ref:', JSON.stringify(badgeIdRef.current), '| state:', JSON.stringify(badgeId));
              handleSubmit(badgeIdRef.current || badgeId);
            }}
            returnKeyType="done"
            showSoftInputOnFocus={false}
          />

          <Text style={[styles.scanText, { fontSize: rs(25) }]}>Scan GHRA Badge</Text>

          <TouchableOpacity
            style={[styles.clearButton, { width: rs(150), padding: rs(10) }]}
            onPress={() => {
              setBadgeId('');
              setLastSubmitted('');
              setLoading(false);
            }}
          >
            <Text style={[styles.clearButtonText, { fontSize: rs(18) }]}>Clear</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 25 },
  innerContainer: {
    height: '92%',
    width: '96%',
    alignSelf: 'center',
  },
  logo: { alignSelf: 'center' },
  version: { alignSelf: 'center' },

  scanBox: {
    alignItems: 'center',
    marginTop: 20,
  },
  input: {
    backgroundColor: '#e8e8e8',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  scanText: {
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  clearButton: {
    marginTop: 20,
    backgroundColor: 'rgb(0, 85, 165)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 20,
    width: '80%',
    alignItems: 'center',
  },
  modalText: {
    marginBottom: 20,
    textAlign: 'center',
  },
  okButton: {
    backgroundColor: 'rgb(0, 85, 165)',
    borderRadius: 5,
  },
  okButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default Scan;