import axios from 'axios';
import { ImageBackground } from 'expo-image';
import React, { useEffect, useRef, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import useResponsive from '../hooks/useResponsive';

const ghraDark = require('../../assets/images/ghra_dark.jpg');
const Bins = ({}) => {
    const { rs, wp, hp } = useResponsive();
    const [bin, setBin] = useState("");
    const [dest, setDest] = useState("");
    const [upc, setUPC] = useState("");
    const [availableBins, setAvailableBins] = useState([]);
    const [possibleBins, setPossibleBins] = useState([]);
    const [desc, setDesc] = useState("");
    const [binQty, setBinQty] = useState();
    const [binInput, setBinInput] = useState(1);
    const [sku, setSKU] = useState("");
    const [itemId, setItemId] = useState(0);

    const [enterSource, setEnterSource] = useState(false);
    const [enterItem, setEnterItem] = useState(false);

    const [errorVisible, setErrorVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const [confirmVisible, setConfirmVisible] = useState(false);

    const fromBinRef = useRef(null);
    const binInputRef = useRef(null);
    const destInputRef = useRef(null);
    const itemRef = useRef(null);
    const employeeId = useSelector(state => state.items.employeeId);

    const getBins = () => {
         return axios.post('http://192.168.2.165:81/api/Item/getItemBin', {
            token: "Yh2k7QSu4l8CZg5p6X3Pna9L0Miy4D3Bvt0JVr87UcOj69Kqw5R2Nmf4FWs03Hdx",
            upc: upc,
            fromBinNumber: bin
         }).then(response => {
            if (response.data.success) {
                console.log("bin response: ", response.data.binItemData[0].availableBins);
                setAvailableBins(response.data.binItemData[0].availableBins);

                for (let i = 0; i < response.data.binItemData[0].availableBins.length; i++) {
                    setPossibleBins(prevBins => {
                        return [...prevBins, response.data.binItemData[0].availableBins[i].binNumber];
                    })
                }

                setDesc(response.data.binItemData[0].description);
                setBinQty(response.data.binItemData[0].fromBinQuantity);
                setSKU(response.data.binItemData[0].sku);
                setItemId(response.data.binItemData[0].id);
            } else {
                console.log("bin response fail: ", response.data);
                setErrorMessage(response.data.reason + `\n location: ${bin}` + `\n SKU/UPC: ${upc}`);
                setBin('');
                setSKU('');
                setUPC('');
                setEnterSource(false);
                setEnterItem(false);
                setErrorVisible(true);
            }
         })
    }

    function numberCommaFormat(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    function hasNumber(myString) {
        return /\d/.test(myString);
    }

    function transferToBin() {
        return axios.post('http://192.168.2.165:81/api/Item/binTransfer', {
            "token": "Yh2k7QSu4l8CZg5p6X3Pna9L0Miy4D3Bvt0JVr87UcOj69Kqw5R2Nmf4FWs03Hdx",
            "employeeId": employeeId,
            "itemID": itemId,
            "fromBinNumber": bin,
            "quantity": binInput,
            "binNumber": dest
        }).then(response => {
            if (response.data.success) {
                console.log("transfer response: ", response.data);
                setConfirmVisible(true);
            } else {
                setErrorMessage(response.data.reason);
                setErrorVisible(true);
            }
        }).catch(err => {
            console.error(err.message);
        })
    }

    // useEffect(() => {
    //     if (upc.length > 0) {
    //         getBins
    //     }
    // }, [upc])

    useEffect(() => {
        if (enterSource === true) {
            setTimeout(() => {
                itemRef.current?.focus();
            }, 100)
        }
    }, [enterSource])

    useEffect(() => {
        if (enterItem === true) {
            getBins();
            setTimeout(() => {
                destInputRef.current?.focus()
            }, 100)
        }
    }, [enterItem])

    useEffect(() => {
        if (binQty === 0) {
            setBin('');
            setSKU('');
            setUPC('');
            setDesc('');
            setBinQty();
            setItemId('');
            setAvailableBins([]);
            setPossibleBins([]);
            setEnterSource(false);
            setEnterItem(false);
            setErrorMessage(` ${bin} has 0 quantity of this item`);
            setErrorVisible(true);
        }
    }, [binQty])

    useEffect(() => {
        console.log("available bins: ", availableBins);
        console.log("desc: ", desc);
        console.log("binQty: ", binQty);
        console.log("sku: ", sku);
        console.log("itemId: ", itemId);
    }, [itemId])

    return (
        <ImageBackground source={ghraDark} resizeMode='contain' style={styles.backgroundImage}>
            <Modal
                animationType="slide"
                transparent={true}
                visible={errorVisible}
                onRequestClose={() => {
                    
            }}>
                <View style={{backgroundColor: '#000000bb', width: '70%', marginHorizontal: 'auto', marginTop: hp(22), minHeight: rs(125), padding: rs(10), borderRadius: rs(10), borderWidth: 1, borderColor: '#808080'}}>
                    <Text style={{color: '#fff', textAlign: 'center', fontWeight: 'bold', fontSize: rs(20)}}>{errorMessage}</Text>
                    <View style={{backgroundColor: '#ff0000', width: rs(100), padding: rs(10), borderRadius: rs(8), marginHorizontal: 'auto', marginTop: rs(20)}}>
                        <TouchableOpacity onPress={() => {
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
                <View style={{backgroundColor: '#000000bb', width: '90%', marginHorizontal: 'auto', marginTop: hp(22), minHeight: rs(125), padding: rs(10), borderRadius: rs(10), borderWidth: 1, borderColor: '#808080'}}>
                    <Text style={{width: '100%', color: '#fff', fontSize: 20, textAlign: 'center'}}>Transfer from {bin} to {dest} successful</Text>
                    <View style={{backgroundColor: '#ff0000', width: rs(100), padding: rs(10), borderRadius: rs(8), marginHorizontal: 'auto', marginTop: rs(20)}}>
                        <TouchableOpacity onPress={() => {
                            setConfirmVisible(false);
                            setUPC('');
                            setSKU('');
                            setBin('');
                            setDesc('');
                            setDest('');
                            setAvailableBins([]);
                            setPossibleBins([]);
                            setBinQty();
                            setBinInput(1);
                            setItemId(0);
                            setEnterSource(false);
                            setEnterItem(false);
                            setTimeout(() => {
                                fromBinRef.current?.focus();
                            }, 100)
                        }}>
                            <Text style={{color: '#fff', textAlign: 'center', fontSize: rs(20), fontWeight: 'bold'}}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            <ScrollView style={{marginBottom: 80}}>
                <TextInput 
                    ref={fromBinRef}
                    placeholder='|||| Scan / Enter source bin' placeholderTextColor={'#919191'} 
                    style={[styles.skuInput, { padding: rs(25), fontSize: rs(20), height: rs(75), borderRadius: rs(15), marginTop: 40 }]} 
                    // showSoftInputOnFocus={false} 
                    autoFocus={true} 
                    value={bin} 
                    onChangeText={(text) => {
                        setBin(text);
                    }} 
                    onKeyPress={(e) => {
                        if (e.nativeEvent.key === 'Enter') {
                            setEnterSource(true);
                        }
                    }}
                    />

                {enterSource && <TextInput
                    ref={itemRef}
                    placeholder='|||| Scan Item' placeholderTextColor={'#919191'} 
                    style={[styles.skuInput, { padding: rs(25), fontSize: rs(20), height: rs(75), borderRadius: rs(15), marginTop: 40 }]} 
                    // showSoftInputOnFocus={false} 
                    autoFocus={true} 
                    value={upc} 
                    onChangeText={(text) => {
                        setUPC(text);
                    }} 
                    onKeyPress={(e) => {
                        if (e.nativeEvent.key === 'Enter') {
                            setEnterItem(true);
                            console.log("ENTER enterItem");
                        }
                    }}
                    />
                    }
                {sku && 
                <>
                    <View style={[styles.itemOverview, {marginTop: 20}]}>
                        <Text style={[styles.itemDesc, { fontSize: rs(15) }]}>{desc}</Text>
                        <Text style={[styles.sku, { fontSize: rs(14), margin: rs(10), color: '#fff' }]}>SKU {sku}</Text>
                    </View>
                    <View style={{
                    width: 300,
                    backgroundColor: '#252525',
                    padding: 10,
                    borderWidth: 1,
                    borderColor: '#5f5f5f',
                    borderRadius: 10,
                    marginHorizontal: 'auto',
                    marginTop: 20
                    }}>
                        <View style={{...styles.itemDetailFlex}}>
                            <Text style={styles.itemDetailsHead}>Quantity</Text>
                            <View style={{...styles.textGroup, width: '100%', marginVertical: 20}}>
                                <View>
                                    {/* <Text style={{color: '#fff', textAlign: 'center', fontSize: rs(23)}}>{numberCommaFormat(binQty)}</Text> */}
                                    <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                                        <TouchableOpacity style={[styles.qtyBtn, { width: rs(50), height: rs(50) }]} onPress={() => {
                                            setBinInput(prevQty => {
                                                if (prevQty <= 1) {
                                                    return 1;
                                                } else {
                                                    return prevQty - 1;
                                                }
                                            })
                                        }}><Text style={[styles.qtyBtnText, { fontSize: rs(30) }]}>-</Text></TouchableOpacity>
                                        <TextInput 
                                            ref={binInputRef}
                                            style={[styles.qtyInput, { color: '#fff', textAlign: 'center', padding: rs(10), width: wp(45), maxWidth: rs(200) }]}
                                            placeholder={'Change quantity'}
                                            placeholderTextColor={'#919191'}
                                            // showSoftInputOnFocus={false}
                                            value={binInput.toString()}
                                            keyboardType='number-pad'
                                            onChangeText={(val) => {
                                                setBinInput(val === '' ? 0 : parseInt(val) || 0);
                                                if (parseInt(val) > binQty) {
                                                    setBinInput(binQty);
                                                }
                                            }}   
                                        />
                                        <TouchableOpacity style={[styles.qtyBtn, { width: rs(50), height: rs(50) }]} onPress={() => {
                                            setBinInput(prevQty => {
                                                if (prevQty >= binQty) {
                                                    return binQty;
                                                } else {
                                                    return prevQty + 1;
                                                }
                                            })
                                        }}><Text style={[styles.qtyBtnText, { fontSize: rs(30) }]}>+</Text></TouchableOpacity>
                                    </View>
                                    <View>
                                        {Number.isFinite(binQty) && <Text style={{color: '#fff', textAlign: 'center', marginTop: 10, fontSize: rs(20)}}>
                                        Bin: {binQty}</Text>}
                                        {/* {Number.isFinite(binQty) > 0 && <Text style={{color: '#fff', textAlign: 'center', marginTop: 10, fontSize: rs(20)}}>New Total: {binQty}</Text>} */}
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>
                        <View style={[styles.itemOverview, {marginTop: 20}]}>
                            <Text style={styles.itemDetailsHead}>Locations</Text>
                            {possibleBins.map((someBin, i) => {
                                if (hasNumber(someBin)) {
                                    return <Text key={`bin-${i}`} style={[styles.itemDesc, { fontSize: rs(15) }]}>{someBin}</Text>
                                }
                            })}
                            <Text style={[styles.itemDesc, { fontSize: rs(15) }]}>{bin}</Text>
                        </View>
                    <TextInput 
                        ref={destInputRef}
                        placeholder='|||| Scan / Enter destination bin' placeholderTextColor={'#919191'} 
                        style={[styles.skuInput, { padding: rs(25), fontSize: rs(20), height: rs(75), borderRadius: rs(15), marginTop: 40 }]} 
                        showSoftInputOnFocus={false} 
                        autoFocus={true} 
                        value={dest} 
                        onChangeText={(text) => {
                        setDest(text);
                    }} />
                    <TouchableOpacity style={{...styles.applyBtn, marginTop: 20, width: '50%', marginHorizontal: 'auto', padding: rs(10), borderRadius: rs(8)}}
                        onPress={() => {
                            console.log("destinations: ", availableBins);
                            if (possibleBins.includes(dest) && dest !== bin) {
                                transferToBin();
                            } 
                            
                            if (!possibleBins.includes(dest) || dest === bin) {
                                setErrorMessage('Not a Valid Bin');
                                setDest('');
                                setTimeout(() => {
                                    destInputRef.current?.focus();
                                }, 100)
                                setErrorVisible(true);
                            }
                        }}>
                        <Text style={{color: '#fff', fontWeight: 'bold', textAlign: 'center', fontSize: rs(15)}}>Transfer</Text>
                    </TouchableOpacity>
                </>
            }
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
    itemOverview: {
        width: 300,
        marginHorizontal: 'auto',
        backgroundColor: '#252525',
        padding: 10,
        borderWidth: 1,
        borderColor: '#5f5f5f',
        borderRadius: 10
    },
    itemDetailsHead: {
        color: '#c5c5c5',
        margin: 10
    },
    itemDesc: {
        color: 'white',
        fontWeight: 'bold',
        marginTop: 0,
        marginStart: 10
    },
    itemDetailFlex: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
    },  
    itemDetailsHead: {
        color: '#c5c5c5',
        margin: 10
    },
    itemQty: {
        color: '#fff',
        fontWeight: 'bold',
        alignSelf: 'center',
        marginRight: 10
    },
    textGroup: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-around'
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
    applyBtn: {
        backgroundColor: "#1D9E75",
    }
})

export default Bins;