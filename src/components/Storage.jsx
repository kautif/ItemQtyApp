import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { ImageBackground, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import Dropdown from 'react-native-input-select';
import { useSelector } from 'react-redux';
import useResponsive from '../hooks/useResponsive';

const ghraDark = require('../../assets/images/ghra_dark.jpg');

const Storage = ({}) => {
    const { hp, rs, wp } = useResponsive();
    const currentDate = new Date;
    const pallets = useSelector(state => state.items.pallets);
    const employeeId = useSelector(state => state.items.employeeId);
    console.log('employeeId: ', employeeId)
    const itemId = useSelector(state => state.items.itemId);

    const [scannedPallet, setScannedPallet] = useState('');
    const [palletIndex, setPalletIndex] = useState(0);
    const [selectedPallet, setSelectedPallet] = useState();
    const [verifyPalletText, setVerifyPalletText] = useState('');

    const [confirmVisible, setConfirmVisible] = useState(false);
    const [confirmMessage, setConfirmMessage] = useState('');
    
    const [verifyPallet, setVerifyPallet] = useState(false);
    const [showQty, setShowQty] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false);

    const [errorVisible, setErrorVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const [binQty, setBinQty] = useState(0);
    const [defaultDate, setDefaultDate] = useState(Date.now());
    const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
    const [selectedDay, setSelectedDay] = useState(currentDate.getDay());
    const [selected, setSelected] = useState();

    const [test, setTest] = useState('');

    let yearOptions = [];
    let response;

const updatePallet = async (palletId) => {
        return axios.post('http://192.168.2.165:81/api/Item/updateItemPalletQuantityAdjustment', {
                token: 'Yh2k7QSu4l8CZg5p6X3Pna9L0Miy4D3Bvt0JVr87UcOj69Kqw5R2Nmf4FWs03Hdx',
                employeeId: employeeId,
                palletDataId: palletId,
                itemID: itemId,
                expiryDate: defaultDate,
                quantity: selectedPallet && (binQty - selectedPallet.quantity)
            }).then(response => {
                console.log("pallet response: ", response.data);
                if (response.data.success) {
                    setConfirmMessage("Pallet Updated");
                    setConfirmVisible(true);
                }
            }).catch(err => {
                console.error(err.response.data.reason);
                setErrorMessage(err.response.data.reason);
                setErrorVisible(true);
            })
    }

    function numberCommaFormat(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    }

    for (let i = 0; i < 10; i++) {
        yearOptions.push({label: (currentDate.getFullYear() + i).toString(), value: currentDate.getFullYear() + i});
    }

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
        if (verifyPallet && selectedPallet) {
            setDefaultDate(selectedPallet.expiryDate);
            setSelected(selectedPallet.expiryDate)
            console.log("pallet default date: ", selectedPallet.expiryDate);
        }
    }, [verifyPallet])

    useEffect(() => {
        console.log("date updated: ", defaultDate);
    }, [defaultDate])
    return (
        <ImageBackground source={ghraDark} style={styles.backgroundImage}>
            <Modal
                animationType="slide"
                transparent={true}
                visible={errorVisible}
                onRequestClose={() => {
                    setScannedPallet('');
            }}>
                <View style={{backgroundColor: '#000000bb', width: '70%', marginHorizontal: 'auto', marginTop: hp(22), minHeight: rs(125), padding: rs(10), borderRadius: rs(10), borderWidth: 1, borderColor: '#808080'}}>
                    <Text style={{color: '#fff', textAlign: 'center', fontWeight: 'bold', fontSize: rs(20)}}>{errorMessage}</Text>
                    <View style={{backgroundColor: '#ff0000', width: rs(100), padding: rs(10), borderRadius: rs(8), marginHorizontal: 'auto', marginTop: rs(20)}}>
                        <TouchableOpacity onPress={() => {
                            setScannedPallet('');
                            setVerifyPalletText('');
                            setErrorVisible(false);
                        }}>
                            <Text style={{color: '#fff', textAlign: 'center', fontSize: rs(20), fontWeight: 'bold'}}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            <Modal
                animationType="slide"
                transparent={true}
                visible={confirmVisible}
                onRequestClose={() => {
            }}>
                <View style={{backgroundColor: '#000000bb', width: '70%', marginHorizontal: 'auto', marginTop: hp(22), minHeight: rs(125), padding: rs(10), borderRadius: rs(10), borderWidth: 1, borderColor: '#808080'}}>
                    <Text style={{color: '#fff', textAlign: 'center', fontWeight: 'bold', fontSize: rs(20)}}>{confirmMessage}</Text>
                    <Text style={{color: '#fff', textAlign: 'center', fontWeight: 'bold', fontSize: rs(20)}}>{selectedPallet && (binQty < selectedPallet.quantity ? `Deducted ${numberCommaFormat(-1 * (binQty - selectedPallet.quantity))}` : binQty > selectedPallet.quantity ? `Added ${numberCommaFormat(binQty - selectedPallet.quantity)}` : "")}</Text>
                    <View style={{backgroundColor: '#ff0000', width: rs(100), padding: rs(10), borderRadius: rs(8), marginHorizontal: 'auto', marginTop: rs(20)}}>
                        <TouchableOpacity onPress={() => {
                            setConfirmVisible(false);
                            setShowCalendar(false);
                            setVerifyPallet(false);
                            setShowQty(false);
                            setSelectedPallet('');
                            setScannedPallet('');
                            setVerifyPalletText('');
                        }}>
                            <Text style={{color: '#fff', textAlign: 'center', fontSize: rs(20), fontWeight: 'bold'}}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            <ScrollView style={{marginBottom: 40}} contentContainerStyle={{ paddingHorizontal: '4%' }}>
                <TextInput 
                    placeholder='Scan Pallet'
                    placeholderTextColor={'#919191'}
                    showSoftInputOnFocus={false}
                    autoFocus={true}
                    style={[styles.qtyInput, { textAlign: 'center', color: '#fff', marginTop: rs(40), width: wp(50), maxWidth: rs(200), fontSize: rs(20) }]}
                    value={scannedPallet}
                    onChangeText={(text) => {
                        setScannedPallet(text);
                        if (palletIdArr.includes(parseInt(text))) {
                            setPalletIndex(palletIdArr.indexOf(parseInt(text)));
                            setSelectedPallet(pallets[palletIdArr.indexOf(parseInt(text))]);
                            setBinQty(pallets[palletIdArr.indexOf(parseInt(text))].quantity);
                        } else {
                            setErrorMessage('Not a valid pallet');
                            setErrorVisible(true);
                        }
                    }}
                />
                <TouchableOpacity 
                    style={[styles.applyBtn, { padding: rs(10), borderRadius: rs(8), width: '50%', marginHorizontal: 'auto' }]}
                    onPress={() => {
                        setConfirmVisible(false);
                        setShowCalendar(false);
                        setVerifyPallet(false);
                        setShowQty(false);
                        setSelectedPallet('');
                        setScannedPallet('');
                        setVerifyPalletText('');
                    }}
                    >
                    <Text style={{color: '#fff', fontWeight: 'bold', textAlign: 'center', fontSize: rs(15)}}>Clear</Text>
                </TouchableOpacity>
                    {selectedPallet &&
                        <View style={{ backgroundColor: '#2b2b2b', borderColor: '#5f5f5f', borderWidth: 1, borderRadius: rs(10), padding: rs(10), marginTop: rs(20)}}>
                            <TouchableOpacity onPress={() => {
                                if (!showQty) {
                                    setVerifyPallet(true);
                                }
                            }}>
                                <View style={{display: 'flex', flexDirection: 'row', width: '100%', justifyContent: 'space-between'}}>
                                    <Text style={{color: '#979595', marginLeft: 10, fontSize: rs(14)}}>Pallet Location</Text>
                                    <View style={styles.palletTag}>
                                        <Text style={{color: '#28dba3', fontSize: rs(14)}}>#{selectedPallet.palletId}</Text>
                                    </View>
                                </View>
                                <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-around', marginTop: 10, flexWrap: 'wrap'}}>
                                    <View>
                                        <Text style={[styles.palletCol, { fontSize: rs(12) }]}>LOCATION NAME</Text>
                                        <Text style={[styles.palletRow, { fontSize: rs(15) }]}>{selectedPallet.binNumber}</Text>
                                    </View>
                                    <View>
                                        <Text style={[styles.palletCol, { fontSize: rs(12) }]}>QUANTITY</Text>
                                        <Text style={[styles.palletRow, { fontSize: rs(15) }]}>{numberCommaFormat(selectedPallet.quantity)}</Text>
                                    </View>
                                    <View>
                                        <Text style={[styles.palletCol, { fontSize: rs(12) }]}>EXPIRATION</Text>
                                        <Text style={[styles.palletRow, { fontSize: rs(15) }]}>{selectedPallet.expiryDate}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                            {verifyPallet && <View>
                                    <Text style={{color: 'white', marginTop: 20, fontSize: rs(14)}}>Scan the pallet barcode or enter the pallet number to unlock editing</Text>
                                    <TextInput 
                                        style={[styles.qtyInput, { marginTop: rs(20), width: wp(50), maxWidth: rs(200), fontSize: rs(16), color: '#fff' }]} placeholder='|||| Pallet Number'
                                        autoFocus={true}
                                        showSoftInputOnFocus={false}
                                        placeholderTextColor={'#919191'}
                                        value={verifyPalletText}
                                        onChangeText={(text) => {
                                            setVerifyPalletText(text);
                                            if (parseInt(text) === selectedPallet.palletId) {
                                                setVerifyPallet(false);
                                                setShowQty(true);
                                            } else {
                                                setErrorMessage("Pallet doesn't match");
                                                setErrorVisible(true);
                                            }
                                        }}    
                                    />
                                    <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-around'}}>
                                        <TouchableOpacity style={[styles.applyBtn, { padding: rs(10), borderRadius: rs(8) }]}>
                                            <Text style={[styles.qtyBtnText, { fontSize: rs(15) }]}>Verify</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity 
                                            style={[styles.applyBtn, { padding: rs(10), borderRadius: rs(8) }]}
                                            onPress={() => {
                                                setVerifyPallet(false);
                                                setVerifyPalletText('');
                                            }}
                                        >
                                            <Text style={[styles.qtyBtnText, { fontSize: rs(15) }]}>Cancel</Text>
                                        </TouchableOpacity>
                                    </View>
                            </View>}

                            {showQty && <View style={styles.itemDetailFlex}>
                                    <View style={{...styles.textGroup, width: '100%', marginVertical: 20}}>
                                        <View>
                                            <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                                                <TouchableOpacity style={[styles.qtyBtn, { width: rs(50), height: rs(50), alignItems: 'center', justifyContent: 'center' }]} onPress={() => {
                                                    setBinQty(prevQty => {
                                                        return prevQty - 1;
                                                    })
                                                }}><Text style={[styles.qtyBtnText, { fontSize: rs(30) }]}>-</Text></TouchableOpacity>
                                                <TextInput 
                                                    style={[styles.qtyInput, { color: '#fff', textAlign: 'center', padding: rs(10), width: wp(45), maxWidth: rs(200), fontSize: rs(16) }]} placeholder={binQty.toString()}
                                                    placeholderTextColor={'#919191'}
                                                    showSoftInputOnFocus={false} 
                                                    keyboardType='numeric'
                                                    onChangeText={(text) => {
                                                        setBinQty(parseInt(text));
                                                    }}    
                                                />
                                                <TouchableOpacity style={[styles.qtyBtn, { width: rs(50), height: rs(50), alignItems: 'center', justifyContent: 'center' }]} onPress={() => {
                                                    setBinQty(prevQty => {
                                                        return prevQty + 1;
                                                    })
                                                }}><Text style={[styles.qtyBtnText, { fontSize: rs(30) }]}>+</Text></TouchableOpacity>
                                            </View>
                                            <View>
                                                <Text style={{color: '#929292', textAlign: 'center', marginTop: 10, fontSize: rs(13)}}>{binQty < selectedPallet.quantity ? `Deducting ${numberCommaFormat(-1 * (binQty - selectedPallet.quantity))}`
                                                : binQty > selectedPallet.quantity ? `Adding ${numberCommaFormat(binQty - selectedPallet.quantity)}` : ""}</Text>

                                                <TouchableOpacity 
                                                    style={[styles.applyBtn, { marginTop: 20, width: '50%', marginHorizontal: 'auto', padding: rs(10), borderRadius: rs(8) }]}
                                                    onPress={() => {
                                                        setShowCalendar(!showCalendar);
                                                    }}
                                                    >
                                                    <Text style={{ color: '#fff', fontSize: 15, fontWeight: 'bold', textAlign: 'center' }}>{showCalendar ? "Close" : "Update Expiration"}</Text>
                                                </TouchableOpacity>
                                                {showCalendar && <>
                                                <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '100%'}}>
                                                    <View style={{width: '50%'}}>
                                                        <Text style={{ fontSize: rs(18), color: '#fff', textAlign: 'center', marginBottom: 10}}>Year</Text>
                                                        <Dropdown 
                                                            dropdownStyle={{
                                                                height: rs(50),
                                                                width: '95%'
                                                            }}
                                                            dropdownIconStyle={{
                                                                top: rs(35),
                                                                left: rs(120)
                                                            }}
                                                            
                                                            placeholder='Select Year'
                                                            placeholderStyle={{'color': 'blue', fontSize: rs(18)}}
                                                            options={yearOptions}
                                                            selectedValue={selectedYear}
                                                            onValueChange={(val) => {
                                                                setSelectedYear(val);
                                                                setDefaultDate(`${val}-${selectedMonth + 1}-${selectedDay}`)
                                                            }}
                                                        />
                                                    </View>
                                                    <View style={{width: '50%'}}>
                                                        <Text style={{ fontSize: rs(18), color: '#fff', textAlign: 'center', marginBottom: 10}}>Month</Text>
                                                        <Dropdown 
                                                            dropdownStyle={{
                                                                height: rs(50),
                                                                width: '95%'
                                                            }}
                                                            dropdownIconStyle={{
                                                                top: rs(35),
                                                                left: rs(120)
                                                            }}
                                                            
                                                            placeholder='Select Year'
                                                            placeholderStyle={{'color': 'blue', fontSize: rs(18)}}
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
                                                        setDefaultDate(`${day.dateString}`)
                                                    }}
                                                    markedDates={{
                                                        [selected]: {selected: true}
                                                    }}/>
                                                    </>}

                                                <View style={{display: 'flex', flexDirection: 'row'}}>
                                                    <TouchableOpacity style={[styles.applyBtn, { marginTop: 20, width: '40%', marginHorizontal: 'auto', padding: rs(10), borderRadius: rs(8) }]}
                                                    onPress={() => {
                                                        updatePallet(selectedPallet.palletDataId);
                                                    }}>
                                                        <Text style={{color: '#fff', fontWeight: 'bold', textAlign: 'center', fontSize: rs(15)}}>Apply</Text>
                                                    </TouchableOpacity>

                                                    <TouchableOpacity style={[styles.applyBtn, { marginTop: 20, width: '40%', marginHorizontal: 'auto', backgroundColor: 'red', padding: rs(10), borderRadius: rs(8) }]}
                                                    onPress={() => {
                                                        setShowQty(false);
                                                        setVerifyPalletText('');
                                                    }}>
                                                        <Text style={{color: '#fff', fontWeight: 'bold', textAlign: 'center', fontSize: rs(15)}}>Cancel</Text>
                                                    </TouchableOpacity>

                                                </View>
                                            </View>
                                        </View>
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
        marginHorizontal: 'auto',
        backgroundColor: '#6160605d', 
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
        textAlign: 'center'
    },
    applyBtn: {
        backgroundColor: "#1D9E75",
        marginTop: 20
    },
    itemDetailFlex: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between'
    },  
    qtyBtn: {
        backgroundColor: '#131212', 
        borderWidth: 1, 
        borderRadius: 8, 
        borderColor: '#525252'
    },
})

export default Storage;
