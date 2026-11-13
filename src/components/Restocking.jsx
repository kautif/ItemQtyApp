import axios from 'axios';
import { ImageBackground } from 'expo-image';
import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import Dropdown from 'react-native-input-select';
import { useSelector } from 'react-redux';
import useResponsive from '../hooks/useResponsive';
const ghraDark = require('../../assets/images/ghra_dark.jpg');

const Restocking = ({}) => {
    const { hp, rs, wp } = useResponsive();
    const stagingRef = useRef(null);
    const palletRef = useRef(null);
    const palletLocRef = useRef(null);
    const palletToRef = useRef(null);
    const palletIdRef = useRef(null);
    const upcRef = useRef(null);
    const [stagingLoc, setStagingLoc] = useState("");
    const [palletInput, setPalletInput] = useState(0);
    const [qtyInput, setQtyInput] = useState(0);
    const [itemQty, setItemQty] = useState("");
    const [toPallet, setToPallet] = useState(false);
    const [toPalletColor, setToPalletColor] = useState('#1D9E75');
    const [toPalletId, setToPalletId] = useState(0);
    
    const [fromPallet, setFromPallet] = useState(true);
    const [fromPalletColor, setFromPalletColor] = useState('#2c2c2c');

    const [upcInput, setUPCinput] = useState("");

    const [palletItems, setPalletItems] = useState([]);

    const [itemSelected, setItemSelected] = useState(false);
    const [selectedItem, setSelectedItem] = useState({});
    const [palletLoc, setPalletLoc] = useState("");

    const [showCalendar, setShowCalendar] = useState(false);
    const currentDate = new Date;
    const [defaultDate, setDefaultDate] = useState(Date.now());
    const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
    const [selectedDay, setSelectedDay] = useState(currentDate.getDay());
    let yearOptions = [];
    const [selected, setSelected] = useState();

    const [modalVisible, setModalVisible] = useState(false);
    const [itemVisible, setItemVisible] = useState(false);

    const employeeId = useSelector(state => state.items.employeeId);

    for (let i = 0; i < 10; i++) {
        yearOptions.push({label: (currentDate.getFullYear() + i).toString(), value: currentDate.getFullYear() + i});
    }

    // Set of palletDataIds that should show the PICK FIRST badge.
    // A row qualifies when its SKU appears more than once AND its expiry
    // is the earliest for that SKU AND at least one other row of that SKU
    // expires later. Ties on the earliest date all get the badge.
    const pickFirstIds = useMemo(() => {
        const bySku = {};
        palletItems.forEach(item => {
            if (!item.expiryDate) return;
            (bySku[item.sku] = bySku[item.sku] || []).push(item);
        });

        const ids = new Set();
        Object.values(bySku).forEach(group => {
            if (group.length < 2) return;
            // ISO "YYYY-MM-DD" strings sort correctly as plain strings
            const dates = group.map(i => i.expiryDate);
            const earliest = dates.reduce((a, b) => (b < a ? b : a));
            const latest = dates.reduce((a, b) => (b > a ? b : a));
            if (earliest === latest) return; // all same date, nothing is "first"
            group.forEach(i => {
                if (i.expiryDate === earliest) ids.add(i.palletDataId);
            });
        });
        return ids;
    }, [palletItems]);

    async function getPalletDetail () {
                    console.log("palletInput: ", palletInput);
            console.log("location: ", stagingLoc);
            console.log("upc: ", upcInput);
        try {
            const response = await axios.post('http://192.168.2.165:81/api/Pallet/getPalletDetailByBin', { 
            token: 'Yh2k7QSu4l8CZg5p6X3Pna9L0Miy4D3Bvt0JVr87UcOj69Kqw5R2Nmf4FWs03Hdx',
            palletId: palletInput,
            binNumber: stagingLoc,
            upc: upcInput
        })

            console.log("response.data: ", response.data);
        
            if (response.data.success) {
                console.log("getPalletDetail: ", response.data);
                setPalletItems(response.data.palletDetailData);
            }
        } catch (err) {
            console.log("err: ", err.message);
        }
    }

    async function loadToBin () {
        try {
            const response = await axios.post('http://192.168.2.165:81/api/Pallet/loadToBin', {
                token: 'Yh2k7QSu4l8CZg5p6X3Pna9L0Miy4D3Bvt0JVr87UcOj69Kqw5R2Nmf4FWs03Hdx',
                palletDataId: selectedItem.palletDataId,
                toBin: palletLoc,
                quantity: qtyInput,
                employeeId: employeeId
            })
            console.log("load to bin: ", response.data);
            if (response.data.success) {
                console.log("load to bin: ", response.data);
                setModalVisible(true);
            }
        } catch (err) {
            console.log("Load to bin fail: ", err.message);
        }
    }

    async function loadToPallet () {
        console.log("load to pallet JSON: ", {
                token: 'Yh2k7QSu4l8CZg5p6X3Pna9L0Miy4D3Bvt0JVr87UcOj69Kqw5R2Nmf4FWs03Hdx',
                palletId: toPalletId,
                itemId: selectedItem.itemId,
                fromBin: palletLoc, 
                quantity: qtyInput,
                expiryDate: selected,
                employeeId: employeeId
            })
        try {
            const response = await axios.post('http://192.168.2.165:81/api/Pallet/loadToPallet', {
                token: 'Yh2k7QSu4l8CZg5p6X3Pna9L0Miy4D3Bvt0JVr87UcOj69Kqw5R2Nmf4FWs03Hdx',
                palletId: palletInput,
                itemId: selectedItem.itemId,
                fromBin: palletLoc, 
                quantity: qtyInput,
                expiryDate: selected,
                employeeId: employeeId
            })

                if (response.data.success) {
                    console.log("load to pallet: ", response.data);
                    setModalVisible(true);
                }
            } catch (err) {
                console.log("load to pallet fail: ", err.message);
            }
        }

    useEffect(() => {
        if (fromPallet) {
            setToPalletColor('#2c2c2c');
            setFromPalletColor('#1D9E75');
        } else {
            setToPalletColor('#ffbb00');
            setFromPalletColor('#2c2c2c');
        }
   
    }, [fromPallet])

        useEffect(() => {
        if (toPallet) {
            setToPalletColor('#ffbb00');
            setFromPalletColor('#2c2c2c');
        } else {
            setToPalletColor('#2c2c2c');
            setFromPalletColor('#1D9E75');
        }
   
    }, [toPallet])

    useEffect(() => {
        setItemQty(qtyInput.toString());
    }, [qtyInput])

    useEffect(() => {
        if (upcInput.length > 0) {
            getPalletDetail();
        }
    }, [upcInput])

    return (
        <ImageBackground source={ghraDark} resizeMode='contain' style={styles.backgroundImage}>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    
            }}>
                <View style={{backgroundColor: '#000000bb', width: '70%', marginHorizontal: 'auto', marginTop: hp(22), minHeight: rs(125), padding: rs(10), borderRadius: rs(10), borderWidth: 1, borderColor: '#808080'}}>
                    {toPallet && <Text style={{color: '#fff', textAlign: 'center', fontWeight: 'bold', fontSize: rs(20)}}>Loaded to Pallet</Text>}
                    {fromPallet && <Text style={{color: '#fff', textAlign: 'center', fontWeight: 'bold', fontSize: rs(20)}}>Loaded to Bin</Text>}
                    <View style={{backgroundColor: '#ff0000', width: rs(100), padding: rs(10), borderRadius: rs(8), marginHorizontal: 'auto', marginTop: rs(20)}}>
                        <TouchableOpacity onPress={() => {
                            setModalVisible(false);
                            router.replace("/menu");
                        }}>
                            <Text style={{color: '#fff', textAlign: 'center', fontSize: rs(20), fontWeight: 'bold'}}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            <Modal
                animationType="slide"
                transparent={true}
                visible={itemVisible}
                onRequestClose={() => {
                    
            }}>
                <View style={{position: 'relative', top: -125, backgroundColor: '#000000bb', width: '100%', marginHorizontal: 'auto', marginTop: hp(22), minHeight: rs(125), height: 550, padding: rs(10), borderRadius: rs(10), borderWidth: 1, borderColor: '#808080'}}>
                    <ScrollView>
                        {itemSelected && <View>
                            <View key={`item-3`} style={{ backgroundColor: '#2b2b2b', borderRadius: rs(10), padding: rs(10), marginTop: rs(10), marginBottom: rs(15)}}>
                                    <Text style={{ color: '#b4b4b4'}}>{selectedItem.desc}</Text>
                                    <View style={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around'}}>
                                        <Text style={{ color: '#b4b4b4'}}>Pallet: {palletInput}</Text>
                                        <Text style={{ color: '#b4b4b4'}}>QTY: {selectedItem.qty}</Text>
                                        <Text style={{ color: '#b4b4b4'}}>SKU: {selectedItem.sku}</Text>
                                    </View>
                                <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-around', marginTop: rs(10), marginBottom: rs(10)}}>
                                    <TouchableOpacity style={{width: '50%', alignSelf: 'center', backgroundColor: `${fromPalletColor}`, borderWidth: 1, borderRadius: rs(10), borderTopRightRadius: 0, borderEndEndRadius: 0, borderpadding: rs(10), padding: rs(10)}}
                                    onPress={() => {
                                        setToPallet(false);
                                        setFromPallet(true);
                                    }}
                                    >
                                        <Text style={{color: '#fff', textAlign: 'center'}}>Load to Bin</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={{width: '50%', backgroundColor: `${toPalletColor}`, borderColor: '#505050', borderWidth: 1, borderRadius: rs(10), borderTopStartRadius: 0, borderBottomLeftRadius: 0, padding: rs(10)}}
                                    onPress={() => {
                                        setFromPallet(false);
                                        setToPallet(true);
                                    }}>
                                        <Text style={{color: '#dddcdc'}}>Load Back to Pallet</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around'}}>
                                <TouchableOpacity style={[styles.qtyBtn, { width: rs(50), height: rs(50), backgroundColor: '#363636', borderWidth: 1, borderRadius: rs(10), borderColor: '#5a5a5a' }]} onPress={() => {
                                    setQtyInput(prevQty => {
                                        if (prevQty <= 1) {
                                            return 1;
                                        } else {
                                            console.log("decrease qty: ", prevQty);
                                            return prevQty - 1;
                                        }
                                    })
                                }}><Text style={[styles.qtyBtnText, { fontSize: rs(30) }]}>-</Text></TouchableOpacity>
                                <TextInput 
                                    // ref={binInputRef}
                                    style={[styles.qtyInput, { color: '#fff', textAlign: 'center', padding: rs(10), width: wp(45), maxWidth: rs(200) }]}
                                    placeholder={'Change quantity'}
                                    placeholderTextColor={'#919191'}
                                    showSoftInputOnFocus={false}
                                    value={itemQty}
                                    keyboardType='number-pad'
                                    onChangeText={(val) => {
                                        setQtyInput(val === '' ? 0 : parseInt(val) || 0);
                                        if (parseInt(val) > selectedItem.qty) {
                                            setQtyInput(selectedItem.qty);
                                        }
                                    }}   
                                />
                                <TouchableOpacity style={[styles.qtyBtn, { width: rs(50), height: rs(50), backgroundColor: '#363636', borderWidth: 1, borderRadius: rs(10), borderColor: '#5a5a5a' }]} onPress={() => {
                                    setQtyInput(prevQty => {
                                        console.log("increase qty: ", prevQty);
                                        if (itemSelected) {
                                            if (prevQty >= selectedItem.qty) {
                                                return prevQty = selectedItem.qty;
                                            } else {
                                                return prevQty += 1;
                                            }   
                                        }
                                    })
                                }}><Text style={[styles.qtyBtnText, { fontSize: rs(30) }]}>+</Text></TouchableOpacity>
                            </View>
                            <TextInput 
                                ref={palletLocRef}
                                placeholder='|||| Scan bin' placeholderTextColor={'#919191'} 
                                style={[styles.skuInput, { padding: rs(25), fontSize: rs(20), height: rs(75), borderRadius: rs(15), marginTop: 20 }]} 
                                showSoftInputOnFocus={false} 
                                submitBehavior="submit"
                                autoFocus={true} 
                                value={palletLoc} 
                                onChangeText={(text) => {
                                    if (!selectedItem.bin.includes(text) && text.length > 0) {
                                        Alert.alert("Invalid Location");
                                    } else {
                                        setPalletLoc(text);
                                    }
                                }} 
                                onKeyPress={(e) => {
                                    if (e.nativeEvent.key === 'Enter') {
                                        // setEnterSource(true);
                                    }
                                }}
                            />

                            {/* {toPallet && <TextInput 
                                ref={palletIdRef}
                                placeholder='|||| Scan Pallet' placeholderTextColor={'#919191'} 
                                style={[styles.skuInput, { padding: rs(25), fontSize: rs(20), height: rs(75), borderRadius: rs(15), marginTop: 20 }]} 
                                showSoftInputOnFocus={false} 
                                submitBehavior="submit"
                                autoFocus={true} 
                                value={toPalletId} 
                                onChangeText={(text) => {
                                    setToPalletId(text);
                                }} 
                                onKeyPress={(e) => {
                                    if (e.nativeEvent.key === 'Enter') {
                                        // setEnterSource(true);
                                    }
                                }}
                            />} */}

                            {toPallet && <>
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
                            {fromPallet && <TouchableOpacity 
                                style={{backgroundColor: '#1D9E75', width: '90%', padding: rs(10), borderRadius: rs(10), marginHorizontal: 'auto', marginTop: rs(10)}}
                                onPress={() => {
                                    if (palletLoc.length > 0 && qtyInput > 0) {
                                        loadToBin();
                                    }
                                }}
                                >
                                <Text style={{color: 'white', textAlign: 'center', fontWeight: 'bold'}}>Load to Bin</Text>
                            </TouchableOpacity>}

                                {toPallet && <TouchableOpacity 
                                style={{backgroundColor: '#1D9E75', width: '90%', padding: rs(10), borderRadius: rs(10), marginHorizontal: 'auto', marginTop: rs(10)}}
                                onPress={() => {
                                    if (palletLoc.length > 0 && qtyInput > 0) {
                                        loadToPallet();
                                    }
                                }}
                                >
                                <Text style={{color: 'white', textAlign: 'center', fontWeight: 'bold'}}>Load to Pallet</Text>
                            </TouchableOpacity>}
                        </View>}
                        <TouchableOpacity 
                            style={{ position: 'absolute', top: 0, right: 10}}
                            onPress={() => {
                                setQtyInput(0);
                                setPalletLoc("");
                                setFromPallet(true);
                                setToPallet(false);
                                setItemVisible(false);
                            }}>
                            <Text style={{color: '#fff', fontSize: 30, zIndex: 900}}>X</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </Modal>
            <ScrollView style={{marginBottom: 50}}>
                <View style={{ backgroundColor: '#242424', borderColor: '#5f5f5f', borderWidth: 1, borderRadius: rs(10), padding: rs(10), marginTop: rs(20)}}>
                    <View style={{width: '100%', justifyContent: 'space-between'}}>
                        <Text style={{color: '#979595', marginLeft: 10, fontSize: rs(14)}}>Staging Lane</Text>
                        {stagingLoc.length === 0 && <View>
                                    <TextInput 
                                        ref={stagingRef}
                                        placeholder='|||| Scan / Enter staging lane' placeholderTextColor={'#919191'} 
                                        style={[styles.skuInput, { padding: rs(25), fontSize: rs(20), height: rs(75), borderRadius: rs(15), marginTop: 20 }]} 
                                        showSoftInputOnFocus={false} 
                                        submitBehavior="submit"
                                        autoFocus={true} 
                                        value={stagingLoc} 
                                        onChangeText={(text) => {
                                            setStagingLoc(text);
                                        }} 
                                        onKeyPress={(e) => {
                                            if (e.nativeEvent.key === 'Enter') {
                                                // setEnterSource(true);
                                            }
                                        }}
                                    />
                                <Text style={{color: '#818080', marginTop: 10, marginLeft: 10, fontSize: rs(14)}}>Scan bin/location</Text>
                            </View>
                            }
                            {
                                stagingLoc.length > 0 && <View>
                                    <Text style={{color: 'white', fontSize: rs(20), fontWeight: 'bold', marginTop: 10}}>{stagingLoc}</Text>
                                    <TextInput 
                                        ref={palletRef}
                                        placeholder='|||| Scan / Enter Pallet ID' placeholderTextColor={'#919191'} 
                                        style={[styles.skuInput, { padding: rs(25), fontSize: rs(20), height: rs(75), borderRadius: rs(15), marginTop: 20 }]} 
                                        showSoftInputOnFocus={false} 
                                        submitBehavior="submit"
                                        autoFocus={true} 
                                        value={palletInput} 
                                        onChangeText={(text) => {
                                            setPalletInput(text);
                                        }} 
                                        onKeyPress={(e) => {
                                            if (e.nativeEvent.key === 'Enter') {
                                                // setEnterSource(true);
                                            }
                                    }}/>
                                    </View>
                            }
                                <View>
                                    {palletInput.length > 0 && <View>
                                        <TextInput 
                                            ref={stagingRef}
                                            placeholder='|||| Scan Item' placeholderTextColor={'#919191'} 
                                            style={[styles.skuInput, { padding: rs(25), fontSize: rs(20), height: rs(75), borderRadius: rs(15), marginTop: 20 }]} 
                                            showSoftInputOnFocus={false} 
                                            submitBehavior="submit"
                                            autoFocus={true} 
                                            value={upcInput} 
                                            onChangeText={(text) => {
                                                setUPCinput(text);
                                            }} 
                                            onKeyPress={(e) => {
                                                if (e.nativeEvent.key === 'Enter') {
                                                    // setEnterSource(true);
                                                }
                                            }}
                                        />
                                    </View>}
                                    {upcInput.length > 0 && <View>{palletItems.map((item, i ) => {
                                       return <TouchableOpacity 
                                                key={`item-${item.palletDataId ?? i}`} style={{ backgroundColor: '#2b2b2b', borderColor: '#5f5f5f', borderWidth: 1, borderRadius: rs(10), padding: rs(10), marginTop: rs(20)}}
                                                onPress={() => {
                                                    setItemSelected(true);
                                                    setSelectedItem({
                                                        itemId: item.itemId,
                                                        desc: item.description,
                                                        qty: item.quantity,
                                                        bin: [item.primaryBin, item.secondaryBin],
                                                        sku: item.sku,
                                                        exp: item.expiryDate,
                                                        palletDataId: item.palletDataId
                                                    })
                                                    setItemVisible(true);
                                                }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <Text style={{ color: 'white', fontWeight: 'bold', flexShrink: 1 }}>{item.description}</Text>
                                                {pickFirstIds.has(item.palletDataId) && (
                                                    <View style={[styles.pickFirstBadge, { paddingHorizontal: rs(8), paddingVertical: rs(3), borderRadius: rs(6) }]}>
                                                        <Text style={[styles.pickFirstText, { fontSize: rs(11) }]}>PICK FIRST</Text>
                                                    </View>
                                                )}
                                            </View>
                                            <Text style={{ color: 'white', fontWeight: 'bold'}}>QTY: {item.quantity}</Text>
                                            <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-around', marginTop: 10, flexWrap: 'wrap'}}>
                                                <View>
                                                    <Text style={[styles.palletCol, { fontSize: rs(12) }]}>LOCATION</Text>
                                                    <Text style={[styles.palletRow, { fontSize: rs(15) }]}>{item.currentBin}</Text>
                                                </View>
                                                <View>
                                                    <Text style={[styles.palletCol, { fontSize: rs(12) }]}>SKU</Text>
                                                    <Text style={[styles.palletRow, { fontSize: rs(15) }]}>{item.sku}</Text>
                                                </View>
                                                <View>
                                                    <Text style={[styles.palletCol, { fontSize: rs(12) }]}>EXP</Text>
                                                    <Text style={[styles.palletRow, { fontSize: rs(15) }]}>{item.expiryDate}</Text>
                                                </View>
                                            </View>
                                        </TouchableOpacity>
                                    })}
                                    </View>}
                            </View>
                    </View>
                </View>
            </ScrollView>
        </ImageBackground>
    )
}

const styles = StyleSheet.create({
        backgroundImage: {
        flex: 1,
        backgroundColor: '#000',
    },
    skuInput: {
        borderColor: "#1D9E75",
        borderWidth: 2,
        color: 'white',
        backgroundColor: "#282928bf",
        width: '95%',
        marginLeft: 'auto',
        marginRight: 'auto',
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
    qtyInput: {
        borderColor: "#1D9E75",
        borderWidth: 1,
        borderRadius: 10,
    },
    qtyBtnText: {
        color: '#fff', 
        textAlign: 'center'
    },
    toPalletSelected: {
        backgroundColor: '#1D9E75'
    },
    fromPalletSelected: {
        backgroundColor: '#1D9E75'
    },
    pickFirstBadge: {
        backgroundColor: '#1D9E75',
        marginLeft: 8,
    },
    pickFirstText: {
        color: '#1a1a1a',
        fontWeight: 'bold',
        letterSpacing: 0.5,
    }
})

export default Restocking;