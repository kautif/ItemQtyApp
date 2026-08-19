import axios from 'axios';
import { useAudioPlayer } from 'expo-audio';
import { router } from 'expo-router';
import * as ScreenOrientation from "expo-screen-orientation";
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  AppState,
  Image,
  Modal,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { setEmployeeId, setIp } from '../../redux/itemSlice';
import useResponsive from '../hooks/useResponsive';
import { addLog, clearLogs, formatLogsAsText, getLogs } from '../utils/scanLogger';

const ghraLogo = require('../../assets/images/WH-New-Logo-PNG-scaled.png');
const gear = require('../../assets/images/settings.png');

const Scan = ({ navigation }) => {
  const ip = useSelector(state => state.items.ip);

  const dispatch = useDispatch();

  // Shared scaling hook (same baseline/scale used across every screen).
  const { rs, wp } = useResponsive();

  const player = useAudioPlayer(require('../../assets/sounds/buzzer.mp3'));

  const [badgeId, setBadgeId] = useState('');
  const [ipAddress, setIpAddress] = useState('');

  const [modalVisible, setModalVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [loading, setLoading] = useState(false);
  const [lastSubmitted, setLastSubmitted] = useState('');

  // ## LOGGING ## - hidden log viewer (long-press the version text)
  const [logsVisible, setLogsVisible] = useState(false);
  const [logEntries, setLogEntries] = useState([]);

  const inputRef = useRef(null);
  const badgeIdRef = useRef('');
  const modalOpenRef = useRef(false); // tracks whether any modal is up, used by refocus logic

  useEffect(() => {
    modalOpenRef.current = modalVisible || settingsVisible || logsVisible;
  }, [modalVisible, settingsVisible, logsVisible]);

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

  const showToast = (message) => {
      if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
      } else {
      // For iOS, you can use Alert or a third-party toast library
      Alert.alert('Keyboard Status', message);
      }
  }

  function validIp(ip) {
    const parts = ip.split(/[.:]/);

    if (parts.length === 4) {

        // Check IPv4 parts
        for (const part of parts) {
            const num = parseInt(part);
            if (isNaN(num) || num < 0 || num > 255) {
                return false;
            }
        }
        return true;
    } else if (parts.length === 8) {

        // Check IPv6 parts
        for (const part of parts) {
            if (!/^[0-9a-fA-F]{1,4}$/.test(part)) {
                return false;
            }
        }
        return true;
    }
    return false;
  }

  function handleSubmit(rawValue) {
    const cleaned = rawValue.replace(/[\r\n]/g, '').trim();
    console.log("handleSubmit cleaned:", cleaned);

    if (!cleaned) return;

    // Clear ref immediately so debounce can't fire again with the same value
    badgeIdRef.current = '';

    if (!cleaned.includes("TA")) {
      // ## LOGGING ## - this is a dead end: no API call ever happens for this path.
      // If the API developer sees scans that never reach the server, this is
      // one of the first places to check - it usually means characters were
      // dropped from the scan (e.g. focus was lost mid-scan).
      addLog('badge_rejected_no_TA', { raw: rawValue, cleaned });
      Alert.alert("That is not a valid badge");
      setBadgeId('');
      setLastSubmitted('');
      return;
    }

    addLog('submit_start', { cleaned });
    sendScannedData(cleaned);
  }

  async function sendScannedData(code) {
    console.log("CODE: ", code)
    console.log("sendScannedData running");
    if (!code) return;

    if (loading) {
      // ## LOGGING ## - a scan came in while a previous request was still
      // in flight and was silently dropped.
      addLog('submit_skipped_already_loading', { code });
      return;
    }
    if (code === lastSubmitted) {
      // ## LOGGING ## - duplicate-scan debounce swallowed this one.
      addLog('submit_skipped_duplicate', { code });
      return;
    }

    setLoading(true);
    setLastSubmitted(code);

    addLog('api_request_start', { code });

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
        addLog('api_request_no_employee', { code, success: response?.data?.success });
        throw new Error(`Employee not found in DB: ${code}`);
      } else {
          addLog('api_request_success', { code, employeeID: emp.employeeID });
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
      // ## LOGGING ## - also fixes a real bug: `Alert` is not callable,
      // it's the react-native module object. The original code
      // `await Alert(...)` threw a TypeError here, which was an unhandled
      // rejection that silently ate the real error - the user (and the
      // API developer) never saw why the request failed.
      addLog('api_request_error', { code, detail: String(detail) });
      Alert.alert('Error', `[${detail}] ${err?.message}`);
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
    addLog('screen_mounted');

    return () => {
      clearTimeout(timer);
      ScreenOrientation.unlockAsync();
    };
  }, []);

  useEffect(() => {
    if (ip.length > 0) {
      setSettingsVisible(false);
      console.log("ip: ", ip);
      showToast(`IP Address updated to ${ip}`);
    }
  }, [ip])

  // ## LOGGING ## - app backgrounding is a common cause of "the badge was
  // scanned but nothing happened": if the device sleeps or another app
  // comes forward mid-scan, the wedge scanner's keystrokes can be lost
  // or delivered to the wrong place entirely.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState) => {
      addLog('app_state_change', { nextState });
    });
    return () => sub.remove();
  }, []);

  // Note: useAudioPlayer manages its own loading/unloading lifecycle,
  // so no manual cleanup effect is needed here.

  async function openLogViewer() {
    const logs = await getLogs();
    setLogEntries(logs);
    setLogsVisible(true);
  }

  async function handleShareLogs() {
    try {
      const text = formatLogsAsText(logEntries);
      await Share.share({ message: text });
    } catch (err) {
      console.log('handleShareLogs error:', err?.message);
    }
  }

  async function handleClearLogs() {
    await clearLogs();
    setLogEntries([]);
  }

  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        {/* ERROR MODAL */}
        <Modal transparent visible={modalVisible} animationType="fade">
          <View style={styles.modalBackdrop}>
            <View style={[styles.modalView, { width: wp(80), maxWidth: rs(400) }]}>
              <Text style={[styles.modalText, { fontSize: rs(18) }]}>{errorMessage}</Text>

              <TouchableOpacity
                style={[styles.okButton, { paddingVertical: rs(10), paddingHorizontal: rs(30)}]}
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

        <Modal transparent visible={settingsVisible} animationType="fade">
          <View style={styles.modalBackdrop}>
            <View style={[styles.modalView, { width: wp(80), maxWidth: rs(400) }]}>
              <TouchableOpacity 
                style={{position: 'absolute', right: 10}}
                onPress={() => {
                  setSettingsVisible(false);
                }}>
                <Text style={{fontSize: 40}}>X</Text>
              </TouchableOpacity>
              <Text style={[styles.modalText, { fontSize: rs(18) }]}>Enter IP Address</Text>

              <TextInput
                // ref={inputRef}
                style={[styles.input, { width: wp(78), maxWidth: rs(300), height: rs(60), fontSize: rs(16) }]}
                value={ipAddress}
                // showSoftInputOnFocus={false}
                autoFocus
                onChangeText={(text) => {
                  setIpAddress(text);
                }}
                keyboardType='numeric'
                returnKeyType="done"
              />
            <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around'}}>
              <TouchableOpacity
                style={[styles.clearButton, { width: wp(35), maxWidth: rs(150), marginRight: 10, padding: rs(10) }]}
                onPress={() => {
                    if(validIp(ipAddress)) {
                      dispatch(setIp(ipAddress));
                    } else {
                      setErrorMessage("IP Address Not Valid");
                      setModalVisible(true);
                      setIpAddress('');
                    }
                }}>
              <Text style={[styles.clearButtonText, { fontSize: rs(18) }]}>Update</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.clearButton, { width: wp(35), maxWidth: rs(150), padding: rs(10), backgroundColor: 'red' }]}
                onPress={() => {
                    setIpAddress('');
                }}>
              <Text style={[styles.clearButtonText, { fontSize: rs(18) }]}>Clear</Text>
            </TouchableOpacity>
            </View>
            </View>
          </View>
        </Modal>

        {/* ## LOGGING ## - diagnostics viewer, opened via the "Logs" button
            top-left. Closing it (X button) just dismisses the modal and
            returns to the Scan Badge screen underneath. */}
        <Modal transparent visible={logsVisible} animationType="fade">
          <View style={styles.modalBackdrop}>
            <View style={[styles.modalView, { width: wp(92), maxWidth: rs(500), maxHeight: '80%' }]}>
              <TouchableOpacity
                style={{ position: 'absolute', right: 10, top: 10, zIndex: 1 }}
                onPress={() => setLogsVisible(false)}
              >
                <Text style={{ fontSize: 30 }}>X</Text>
              </TouchableOpacity>
              <Text style={[styles.modalText, { fontSize: rs(18), marginTop: 20 }]}>
                Scan Diagnostics (last 48h)
              </Text>
              <ScrollView style={{ maxHeight: rs(350), width: '100%' }}>
                <Text style={{ fontSize: rs(12), fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }}>
                  {formatLogsAsText(logEntries)}
                </Text>
              </ScrollView>
              <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around', marginTop: 15, width: '100%' }}>
                <TouchableOpacity
                  style={[styles.clearButton, { paddingVertical: rs(10), paddingHorizontal: rs(20) }]}
                  onPress={handleShareLogs}
                >
                  <Text style={[styles.clearButtonText, { fontSize: rs(16) }]}>Share</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.clearButton, { paddingVertical: rs(10), paddingHorizontal: rs(20), backgroundColor: 'red' }]}
                  onPress={handleClearLogs}
                >
                  <Text style={[styles.clearButtonText, { fontSize: rs(16) }]}>Clear Logs</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* ## LOGGING ## - visible button to open the diagnostics log viewer */}
        <TouchableOpacity
          style={styles.logButton}
          onPress={openLogViewer}
        >
          <Text style={styles.logButtonText}>Logs</Text>
        </TouchableOpacity>

        <Image
          style={[styles.logo, { width: rs(400), height: rs(400), maxWidth: wp(100), maxHeight: wp(80) }]}
          source={ghraLogo}
          resizeMode="contain"
        />

        {/* <TouchableOpacity
          style={{ position: 'absolute', top: 0, right: 0}}
          onPress={() => {
            dispatch(setIp(''));
            setIpAddress('');
            setSettingsVisible(true);
          }}
        >
          <Image
            style={[styles.logo, { width: rs(40), height: rs(40), maxWidth: wp(100), maxHeight: wp(80) }]}
            source={gear}
            resizeMode="contain"
          />
        </TouchableOpacity> */}

        <Text style={[styles.version, { fontSize: rs(12) }]}>Version 2.11.2 (Bin App)</Text>

        <View style={styles.scanBox}>
          <TextInput
            ref={inputRef}
            style={[styles.input, { width: wp(78), maxWidth: rs(300), height: rs(60), fontSize: rs(16) }]}
            value={badgeId}
            showSoftInputOnFocus={false}
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
            onBlur={() => {
              // ## LOGGING ## - this is the prime suspect for "scanned but
              // no API call": the scanner behaves like a keyboard, so if
              // this input isn't focused, its keystrokes go nowhere and
              // there is no error to show because handleSubmit is never
              // even called. Log it, and re-focus automatically unless a
              // modal is intentionally open.
              addLog('scan_input_blurred', { hadPartialInput: !!badgeIdRef.current });
              if (!modalOpenRef.current) {
                setTimeout(() => {
                  if (!modalOpenRef.current && inputRef.current) {
                    inputRef.current.focus();
                  }
                }, 150);
              }
            }}
            onFocus={() => {
              addLog('scan_input_focused');
            }}
            returnKeyType="done"
          />

          <Text style={[styles.scanText, { fontSize: rs(22) }]}>Scan GHRA Badge</Text>

          <TouchableOpacity
            style={[styles.clearButton, { width: wp(40), maxWidth: rs(150), padding: rs(10) }]}
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
    flex: 1,
    width: '96%',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 60
  },
  logo: { alignSelf: 'center' },
  version: { alignSelf: 'center' },

  logButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 10,
    backgroundColor: 'rgb(0, 85, 165)',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  logButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },

  scanBox: {
    alignItems: 'center',
    marginTop: 20,
    width: '100%',
  },
  input: {
    backgroundColor: '#e8e8e8',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  scanText: {
    fontWeight: '800',
    textTransform: 'uppercase',
    textAlign: 'center',
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
