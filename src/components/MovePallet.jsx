import axios from 'axios';
import { ImageBackground } from 'expo-image';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import useResponsive from '../hooks/useResponsive';
const ghraDark = require('../../assets/images/ghra_dark.jpg');

const MovePallet = ({}) => {
    const { hp, rs, wp } = useResponsive();
    const palletRef = useRef(null);
    const stagingRef = useRef(null);
    const [onForklift, setOnForklift] = useState(false);
    const [isValidPallet, setIsValidPallet] = useState(false);
    const [movePalletVisible, setMovePalletVisible] = useState(false);
    const [palletId, setPalletId] = useState('');
    const [palletData, setPalletData] = useState([]);
    const [currentBin, setCurrentBin] = useState('');
    const [lane, setLane] = useState('');


    const forkliftLoc = useSelector(state => state.items.forkliftLoc);
    const employeeID = useSelector(state => state.items.employeeId);
    console.log("forkliftLoc: ", forkliftLoc);
    async function getPallet() {
        console.log("palletId: ", palletId);
        try {
            const response = await axios.post('http://192.168.2.165:81/api/Pallet/getPalletDetail', {
            token: 'Yh2k7QSu4l8CZg5p6X3Pna9L0Miy4D3Bvt0JVr87UcOj69Kqw5R2Nmf4FWs03Hdx',
            palletId: palletId
        })

            if (!response?.data?.success) {
                console.log("getPallet failed");
            } else {
                console.log("getPallet: ", response);
                setPalletData(response.data.palletDetailData);
            }

        } catch (err) {
            console.log("error: ", err?.message);
        }
    }

    async function movePallet () {
        try {
            const response = await axios.post('http://192.168.2.165:81/api/Pallet/movePallet', {
                token: 'Yh2k7QSu4l8CZg5p6X3Pna9L0Miy4D3Bvt0JVr87UcOj69Kqw5R2Nmf4FWs03Hdx',
                palletId: palletId,
                toBin: currentBin.startsWith('FRK-') || currentBin.startsWith('FORKLIFT') ? lane : forkliftLoc,
                employeeId: employeeID
            })

            console.log("movePallet: ", response.data);
            if (response.data.success) {
                setMovePalletVisible(true);
                setPalletData([]);
            }
        } catch (err) {
            console.log("movePallet err: ", err.message);
        }
    }

    useEffect(() => {
        if (palletId.length > 0) {
            getPallet();
        }
    }, [palletId])

    useEffect(() => {
        if (palletData.length > 0) {
            console.log("palletData: ", palletData);
            setCurrentBin(palletData[0].currentBin);
        }
    }, [palletData])

    useEffect(() => {
        if (currentBin.length > 0) {
            console.log("currentBin: ", currentBin);
        }
    }, [currentBin])

    return (
        <ImageBackground source={ghraDark} resizeMode='contain' style={styles.backgroundImage}>
            <Modal
                animationType="slide"
                transparent={true}
                visible={movePalletVisible}
                onRequestClose={() => {
                    
            }}>
                <View style={{backgroundColor: '#000000bb', width: '70%', marginHorizontal: 'auto', marginTop: hp(22), minHeight: rs(125), padding: rs(10), borderRadius: rs(10), borderWidth: 1, borderColor: '#808080'}}>
                    <Text style={{color: '#fff', textAlign: 'center', fontWeight: 'bold', fontSize: rs(20)}}>{`Pallet Loaded to ${currentBin.startsWith('FRK-') || currentBin.startsWith('FORKLIFT') ? 'Lane' : 'Forklift'}`}</Text>
                    <View style={{backgroundColor: '#ff0000', width: rs(100), padding: rs(10), borderRadius: rs(8), marginHorizontal: 'auto', marginTop: rs(20)}}>
                        <TouchableOpacity onPress={() => {
                            setMovePalletVisible(false);
                            router.replace("/menu");
                        }}>
                            <Text style={{color: '#fff', textAlign: 'center', fontSize: rs(20), fontWeight: 'bold'}}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            <ScrollView>
                <TextInput 
                    ref={palletRef}
                    placeholder='|||| Scan / Enter pallet number' placeholderTextColor={'#919191'} 
                    style={[styles.skuInput, { padding: rs(25), fontSize: rs(20), height: rs(75), borderRadius: rs(15), marginTop: 40 }]} 
                    showSoftInputOnFocus={false} 
                    submitBehavior="submit"
                    autoFocus={true} 
                    // value={bin} 
                    onChangeText={(text) => {
                        // setBin(text);
                        setPalletId(text);
                    }} 
                    onKeyPress={(e) => {
                        if (e.nativeEvent.key === 'Enter') {
                            // setEnterSource(true);
                            // getPallet();
                        }
                    }}/>
                    {palletData.length > 0 && <View>
                        <View style={{ backgroundColor: '#2b2b2b', borderColor: '#5f5f5f', borderWidth: 1, borderRadius: rs(10), padding: rs(10), marginTop: rs(20)}}>
                            <TouchableOpacity onPress={() => {
                                // if (!showQty) {
                                //     setVerifyPallet(true);
                                // }
                            }}>
                                <View style={{display: 'flex', flexDirection: 'row', width: '100%', justifyContent: 'space-between'}}>
                                    <Text style={{color: '#979595', marginLeft: 10, fontSize: rs(14)}}>Pallet Location</Text>
                                    <View style={styles.palletTag}>
                                        <Text style={{color: '#28dba3', fontSize: rs(14)}}>#{palletId}</Text>
                                    </View>
                                </View>
                                <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-around', marginTop: 10, flexWrap: 'wrap'}}>
                                    <View>
                                        <Text style={[styles.palletCol, { fontSize: rs(12) }]}>LOCATION</Text>
                                        <Text style={[styles.palletRow, { fontSize: rs(15) }]}>{palletData.length > 0 && palletData[0].currentBin}</Text>
                                    </View>
                                    <View>
                                        <Text style={[styles.palletCol, { fontSize: rs(12) }]}>STATUS</Text>
                                        <Text style={[styles.palletRow, { fontSize: rs(15) }]}></Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </View>

                        <View style={{ backgroundColor: '#222121', borderColor: '#5f5f5f', borderWidth: 1, borderRadius: rs(10), padding: rs(10), marginTop: rs(20)}}>
                            <TouchableOpacity onPress={() => {
                                // if (!showQty) {
                                //     setVerifyPallet(true);
                                // }
                            }}>
                                <View style={{display: 'flex', flexDirection: 'row', width: '100%', justifyContent: 'space-between'}}>
                                    <Text style={{color: '#979595', marginLeft: 10, fontSize: rs(14)}}>Items on Pallet</Text>
                                </View>
                                {
                                    palletData && palletData.map((item, i) => { 
                                        return <View key={`palletItem-${i}`} style={{ backgroundColor: '#2b2b2b', borderColor: '#5f5f5f', borderWidth: 1, borderRadius: rs(10), padding: rs(10), marginTop: rs(20)}}>
                                        <Text style={{ color: 'white', fontWeight: 'bold'}}>{item.description}</Text>
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
                                    </View>
                                    })
                                }
                                {/* <View style={{ backgroundColor: '#2b2b2b', borderColor: '#5f5f5f', borderWidth: 1, borderRadius: rs(10), padding: rs(10), marginTop: rs(20)}}>
                                    <Text style={{ color: 'white', fontWeight: 'bold'}}>SNICKERS CHOCOLATE KING SIZE 24 - 3.29 OZ</Text>
                                    <Text style={{ color: 'white', fontWeight: 'bold'}}>QTY: 13</Text>
                                    <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-around', marginTop: 10, flexWrap: 'wrap'}}>
                                        <View>
                                            <Text style={[styles.palletCol, { fontSize: rs(12) }]}>LOCATION</Text>
                                            <Text style={[styles.palletRow, { fontSize: rs(15) }]}>LANE-01</Text>
                                        </View>
                                        <View>
                                            <Text style={[styles.palletCol, { fontSize: rs(12) }]}>SKU</Text>
                                            <Text style={[styles.palletRow, { fontSize: rs(15) }]}></Text>
                                        </View>
                                        <View>
                                            <Text style={[styles.palletCol, { fontSize: rs(12) }]}>EXP</Text>
                                            <Text style={[styles.palletRow, { fontSize: rs(15) }]}></Text>
                                        </View>
                                    </View>
                                </View> */}
                            </TouchableOpacity>
                        </View>

                        <View style={{ backgroundColor: '#2b2b2b', borderColor: '#5f5f5f', borderWidth: 1, borderRadius: rs(10), padding: rs(10), marginTop: rs(20), marginBottom: rs(80)}}>
                                <View style={{width: '100%', justifyContent: 'space-between'}}>
                                    <Text style={{color: '#979595', marginLeft: 10, fontSize: rs(14)}}>Move Pallet</Text>
                                    <Text style={{color: '#818080', marginLeft: 10, fontSize: rs(14)}}>Unload pallet from location to forklift for staging</Text>
                                    {
                                        (currentBin.startsWith('FRK-') || currentBin.startsWith('FORKLIFT')) &&  <TextInput 
                                                    ref={stagingRef}
                                                    placeholder='|||| Scan / Enter staging lane' placeholderTextColor={'#919191'} 
                                                    style={[styles.skuInput, { padding: rs(25), fontSize: rs(20), height: rs(75), borderRadius: rs(15), marginTop: 20, marginBottom: 20 }]} 
                                                    showSoftInputOnFocus={false} 
                                                    submitBehavior="submit"
                                                    autoFocus={true} 
                                                    value={lane} 
                                                    onChangeText={(text) => {
                                                        setLane(text);
                                                    }} 
                                                    onKeyPress={(e) => {
                                                        if (e.nativeEvent.key === 'Enter') {
                                                            // setEnterSource(true);
                                                        }
                                                    }}/>
                                    }
                                    {
                                        (currentBin.startsWith('FRK-') || currentBin.startsWith('FORKLIFT')) && <TouchableOpacity disabled={lane.length === 0}
                                        onPress={() => {
                                        movePallet();
                                    }} style={{ backgroundColor: '#1dac7f', paddingBottom: 20, borderRadius: 20}}>
                                        <Text style={{color: 'white', fontSize: 20, textAlign: 'center', fontWeight: 'bold', marginTop: 15}}>🛣️Unload forklift to lane</Text>
                                    </TouchableOpacity>
                                    }
                                    {
                                    (!currentBin.startsWith('FRK-') && !currentBin.startsWith('FORKLIFT')) && <TouchableOpacity onPress={() => {
                                        movePallet();
                                    }} style={{ backgroundColor: '#1dac7f', paddingBottom: 20, borderRadius: 20}}>
                                        <Text style={{color: 'white', fontSize: 20, textAlign: 'center', fontWeight: 'bold', marginTop: 15}}>🚜Unload pallet to forklift</Text>
                                    </TouchableOpacity>
                                    }
                                </View>
                        </View>
                    </View>} 
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
})

export default MovePallet;