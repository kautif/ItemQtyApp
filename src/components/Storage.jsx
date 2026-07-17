import React, { useCallback, useEffect, useState } from 'react';
import { ImageBackground, ScrollView, StyleSheet, Text, TextInput, Touchable, TouchableOpacity, View } from 'react-native';
import axios from 'axios';
import {Calendar} from 'react-native-calendars';
import { useDispatch, useSelector } from 'react-redux';
import Dropdown, { DropdownSelect } from 'react-native-input-select';
import { current } from '@reduxjs/toolkit';

const ghraDark = require('../../assets/images/ghra_dark.jpg');

const Storage = ({}) => {
    const currentDate = new Date;
    const pallets = useSelector(state => state.items.pallets);
    const employeeId = useSelector(state => state.items.employeeId);
    console.log('employeeId: ', employeeId)
    const itemId = useSelector(state => state.items.itemId);

    const [scannedPallet, setScannedPallet] = useState('');
    const [palletIndex, setPalletIndex] = useState(0);
    const [selectedPallet, setSelectedPallet] = useState();
    const [verifyPallet, setVerifyPallet] = useState(false);
    const [showQty, setShowQty] = useState(false);
    const [binQty, setBinQty] = useState(0);
    const [defaultDate, setDefaultDate] = useState(Date.now());
    const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
    const [selectedDay, setSelectedDay] = useState(currentDate.getDay());
    const [selected, setSelected] = useState();

    const [test, setTest] = useState('');

    let yearOptions = [];
    let response;

//     async function updatePallet() {
//         console.log("response body: ", {
//                 token: 'Yh2k7QSu4l8CZg5p6X3Pna9L0Miy4D3Bvt0JVr87UcOj69Kqw5R2Nmf4FWs03Hdx',
//                 employeeId: employeeId,
//                 palletDataId: selectedPallet.palletDataId,
//                 itemID: itemId,
//                 expiryDate: defaultDate,
//                 quantity: binQty
//             })
//         try {
//             response = await axios.post('http://192.168.2.165:81/api/Item/updateItemPalletQuantityAdjustment', {
//                 token: 'Yh2k7QSu4l8CZg5p6X3Pna9L0Miy4D3Bvt0JVr87UcOj69Kqw5R2Nmf4FWs03Hdx',
//                 employeeId: employeeId,
//                 palletDataId: selectedPallet,
//                 itemID: itemId,
//                 expiryDate: defaultDate,
//                 quantity: binQty
//             })
//             setTest(response);
//    console.log("updatePallet: ", response);
//         } catch (err) {
//             console.error("ERROR: ", err);
//             console.log("test: ", test);
//         } finally {
//             // console.log("pallet result: ", response);
//         }
//     }

const updatePallet = async (palletId) => {
        return axios.post('http://192.168.2.165:81/api/Item/updateItemPalletQuantityAdjustment', {
                token: 'Yh2k7QSu4l8CZg5p6X3Pna9L0Miy4D3Bvt0JVr87UcOj69Kqw5R2Nmf4FWs03Hdx',
                employeeId: employeeId,
                palletDataId: palletId,
                itemID: itemId,
                expiryDate: defaultDate,
                quantity: binQty
            }).then(response => {
                console.log("pallet response: ", response.data);
            }).catch(err => {
                console.error(err.response.data.reason);
            })
    }

    for (let i = 0; i < 10; i++) {
        yearOptions.push({label: (currentDate.getFullYear() + i).toString(), value: currentDate.getFullYear() + i});
    }

    // const currentMonth = new Date.getMonth();
    // const currentYear = new Date.getFullYear();

    let palletIdArr = [];

    useEffect(() => {
        console.log("current month: ", currentDate.getMonth());
        console.log("current year: ", currentDate.getFullYear());
    }, [])

    useEffect(() => {
        if (pallets.length > 0) {
            pallets.map((pallet) => {
                palletIdArr.push(pallet.palletId);
            })
        }
    }, [pallets])

    useEffect(() => {
        // if (scannedPallet.length > 0 && palletIdArr.includes(scannedPallet)) {
        //     console.log("pallet index: ", palletIdArr.indexOf(scannedPallet));
        //     console.log("pallet found: ", palletIdArr[palletIdArr.indexOf(scannedPallet)]);
        // }
    }, [scannedPallet])

    useEffect(() => {
        console.log("date updated: ", defaultDate);
    }, [defaultDate])
    return (
        <ImageBackground source={ghraDark} style={styles.backgroundImage}>
            <ScrollView style={{marginBottom: 40}}>
                <TextInput 
                    placeholder='Scan Pallet'
                    placeholderTextColor={'#fff'}
                    autoFocus={true}
                    style={{...styles.qtyInput, textAlign: 'center', marginTop: 40}}
                    value={scannedPallet}
                    onChangeText={(text) => {
                        setScannedPallet(text);
                        if (palletIdArr.includes(parseInt(text))) {
                            // console.log("pallet index: ", palletIdArr.indexOf(parseInt(text)));
                            // console.log("pallet: ", pallets[palletIdArr.indexOf(parseInt(text))]);
                            setPalletIndex(palletIdArr.indexOf(parseInt(text)));
                            setSelectedPallet(pallets[palletIdArr.indexOf(parseInt(text))]);
                            setBinQty(pallets[palletIdArr.indexOf(parseInt(text))].quantity);
                        }
                    }}
                />
                    {selectedPallet &&
                        <View style={{ backgroundColor: '#2b2b2b', borderColor: '#5f5f5f', borderWidth: 1, borderRadius: 10, padding: 10, marginTop: 20}}>
                            <TouchableOpacity onPress={() => {
                                if (!showQty) {
                                    setVerifyPallet(true);
                                }
                            }}>
                                <View style={{display: 'flex', flexDirection: 'row', width: '100%', justifyContent: 'space-between'}}>
                                    <Text style={{color: '#979595', marginLeft: 10}}>Pallet Location</Text>
                                    <View style={styles.palletTag}>
                                        <Text style={{color: '#28dba3'}}>#{selectedPallet.palletId}</Text>
                                    </View>
                                </View>
                                <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-around', marginTop: 10}}>
                                    <View>
                                        <Text style={styles.palletCol}>LOCATION NAME</Text>
                                        <Text style={styles.palletRow}>{selectedPallet.binNumber}</Text>
                                    </View>
                                    <View>
                                        <Text style={styles.palletCol}>QUANTITY</Text>
                                        <Text style={styles.palletRow}>{selectedPallet.quantity}</Text>
                                    </View>
                                    <View>
                                        <Text style={styles.palletCol}>EXPIRATION</Text>
                                        <Text style={styles.palletRow}>{selectedPallet.expiryDate}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                            {verifyPallet && <View>
                                    <Text style={{color: 'white', marginTop: 20}}>Scan the pallet barcode or enter the pallet number to unlock editing</Text>
                                    <TextInput 
                                        style={{...styles.qtyInput, marginTop: 20}} placeholder='|||| Pallet Number'
                                        autoFocus={true}
                                        onChangeText={(text) => {
                                            if (parseInt(text) === selectedPallet.palletId) {
                                                setVerifyPallet(false);
                                                setShowQty(true);
                                            }
                                        }}    
                                    />
                                    <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-around'}}>
                                        <TouchableOpacity style={styles.applyBtn}>
                                            <Text style={styles.qtyBtnText}>Verify</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity 
                                            style={styles.applyBtn}
                                            onPress={() => {
                                                setVerifyPallet(false);
                                            }}
                                        >
                                            <Text style={styles.qtyBtnText}>Cancel</Text>
                                        </TouchableOpacity>
                                    </View>
                            </View>}

                            {showQty && <View style={styles.itemDetailFlex}>
                                {/* <Text style={styles.itemDetailsHead}>Quantity</Text> */}
                                    <View style={{...styles.textGroup, width: '100%', marginVertical: 20}}>
                                        <View>
                                            <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                                                <TouchableOpacity style={{...styles.qtyBtn, alignItems: 'center', marginVertical: 'auto'}} onPress={() => {
                                                    setBinQty(prevQty => {
                                                        return prevQty - 1;
                                                    })
                                                }}><Text style={{...styles.qtyBtnText, fontSize: 30}}>-</Text></TouchableOpacity>
                                                <TextInput 
                                                    style={{...styles.qtyInput, color: '#fff', textAlign: 'center', padding: 10}} placeholder={binQty.toString()} 
                                                    keyboardType='numeric'
                                                    onChangeText={(text) => {
                                                        setBinQty(parseInt(text));
                                                    }}    
                                                />
                                                <TouchableOpacity style={styles.qtyBtn} onPress={() => {
                                                    setBinQty(prevQty => {
                                                        return prevQty + 1;
                                                    })
                                                }}><Text style={{...styles.qtyBtnText, fontSize: 30}}>+</Text></TouchableOpacity>
                                            </View>
                                            <View>
                                                <Text style={{color: '#929292', textAlign: 'center', marginTop: 10}}>{binQty < selectedPallet.quantity ? `Deducting ${binQty - selectedPallet.quantity}`
                                                : binQty > selectedPallet.quantity ? `Adding ${binQty - selectedPallet.quantity}` : ""}</Text>

                                                {/* <TouchableOpacity
                                                    onPress={() => {
                                                        setDefaultDate(new Date(2030, 1, 1));
                                                    }}
                                                >
                                                    <Text style={{color: 'white'}}>2030</Text>
                                                </TouchableOpacity> */}
                                                <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '100%'}}>
                                                    <View style={{width: '50%'}}>
                                                        <Text style={{ fontSize: 20, color: '#fff', textAlign: 'center', marginBottom: 10}}>Year</Text>
                                                        <Dropdown 
                                                            dropdownStyle={{
                                                                height: 50,
                                                                width: '95%'
                                                            }}
                                                            dropdownIconStyle={{
                                                                top: 35,
                                                                left: 120
                                                            }}
                                                            
                                                            placeholder='Select Year'
                                                            placeholderStyle={{'color': 'blue', fontSize: 20}}
                                                            options={yearOptions}
                                                            selectedValue={selectedYear}
                                                            onValueChange={(val) => {
                                                                setSelectedYear(val);
                                                                setDefaultDate(`${val}-${selectedMonth + 1}-${selectedDay}`)
                                                            }}
                                                        />
                                                    </View>
                                                    <View style={{width: '50%'}}>
                                                        <Text style={{ fontSize: 20, color: '#fff', textAlign: 'center', marginBottom: 10}}>Month</Text>
                                                        <Dropdown 
                                                            dropdownStyle={{
                                                                height: 50,
                                                                width: '95%'
                                                            }}
                                                            dropdownIconStyle={{
                                                                top: 35,
                                                                left: 120
                                                            }}
                                                            
                                                            placeholder='Select Year'
                                                            placeholderStyle={{'color': 'blue', fontSize: 20}}
                                                            options={[
                                                                {label: 'January', value: 0},
                                                                {label: 'February', value: 1},
                                                                {label: 'March', value: 2},
                                                                {label: 'April', value: 3},
                                                                {label: 'May', value: 4},
                                                                {label: 'June', value: 5},
                                                                {label: 'July', value: 6},
                                                                {label: 'August', value: 7},
                                                                {label: 'September', value: 8},
                                                                {label: 'October', value: 9},
                                                                {label: 'November', value: 10},
                                                                {label: 'December', value: 11},
                                                            ]}
                                                            selectedValue={selectedMonth}
                                                            onValueChange={(val) => {
                                                                setSelectedMonth(val);
                                                                setDefaultDate(`${selectedYear}-${val + 1}-${selectedDay}`)
                                                            }}
                                                        />
                                                    </View>
                                                </View>

                                                <Calendar 
                                                   current={defaultDate}
                                                   key={defaultDate}
                                                   onDayPress={(day) => {
                                                    setSelected(day.dateString);
                                                    console.log("day: ", day);
                                                    // setSelectedDay(day)
                                                    setDefaultDate(`${day.dateString}`)
                                                   }}
                                                   markedDates={{
                                                    [selected]: {selected: true}
                                                   }}
                                                   
                                                />

                                                <View style={{display: 'flex', flexDirection: 'row'}}>
                                                    <TouchableOpacity style={{...styles.applyBtn, marginTop: 20, width: '40%', marginHorizontal: 'auto'}}
                                                    onPress={() => {
                                                        // updateBinQty(itemObj[0].primaryBin, whQty - itemObj[0].primaryBinQuantity);
                                                        updatePallet(selectedPallet.palletDataId);
                                                    }}>
                                                        <Text style={{color: '#fff', fontWeight: 'bold', textAlign: 'center'}}>Apply</Text>
                                                    </TouchableOpacity>

                                                    <TouchableOpacity style={{...styles.applyBtn, marginTop: 20, width: '40%', marginHorizontal: 'auto', backgroundColor: 'red'}}
                                                    onPress={() => {
                                                        setShowQty(false);
                                                        // updateBinQty(itemObj[0].primaryBin, whQty - itemObj[0].primaryBinQuantity);
                                                    }}>
                                                        <Text style={{color: '#fff', fontWeight: 'bold', textAlign: 'center'}}>Cancel</Text>
                                                    </TouchableOpacity>

                                                </View>
                                            </View>
                                        </View>
                                            {/* <View>
                                                <TouchableOpacity style={styles.applyBtn} onPress={() => {
                                                    updateBinQty(itemObj[0].itemData.primaryBin)
                                                }}>
                                                    <Text style={{color: '#ffffff', fontWeight: 'bold'}}>Apply</Text>
                                                </TouchableOpacity>
                                                <Text style={{color: '#969696', marginVertical: 10}} onPress={() => {
                                                    setEditWHQty(false);
                                                }}>Cancel</Text>
                                            </View> */}
                                    </View>
                            </View>}
                        </View>}
            </ScrollView>
        </ImageBackground>
    )
}

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1, 
        backgroundColor: "#000"
    },
    qtyInput: {
        borderColor: "#1D9E75",
        borderWidth: 1,
        borderRadius: 10,
        width: 200,
        marginHorizontal: 'auto',
        backgroundColor: '#6160605d', 
        // marginTop: 40,
        fontSize: 20
    },
    palletTag: {
        backgroundColor: "#1d9e7580",
        padding: 5,
        paddingHorizontal: 7,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#28dba3'
    },
    palletCol: {
        color: '#696969', 
        marginLeft: 3
    },
    palletRow: {
        color: '#fff',
        fontWeight: 'bold',
        marginLeft: 3
    },
    qtyBtnText: {
        color: '#fff', 
        fontSize: 15, 
        textAlign: 'center'
    },
    applyBtn: {
        backgroundColor: "#1D9E75",
        padding: 10,
        borderRadius: 8,
        marginTop: 20
    },
    itemDetailFlex: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between'
    },  
    qtyBtn: {
        backgroundColor: '#131212', 
        width: 50,
        height: 50,
        borderWidth: 1, 
        borderRadius: 8, 
        borderColor: '#525252'
    },
})

export default Storage;