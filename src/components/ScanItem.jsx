import axios from 'axios';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, ImageBackground, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { setItemId, setItems, setPallets } from '../../redux/itemSlice';
import useResponsive from '../hooks/useResponsive';

const ghraDark = require('../../assets/images/ghra_dark.jpg');
const pencil = require('../../assets/images/pencil.png');

const ScanItem = ({}) => {
    const dispatch = useDispatch();
    const { rs, wp, hp } = useResponsive();

    const [item, setItem] = useState('');
    const [itemObj, setItemObj] = useState();
    const [palletCount, setPalletCount] = useState(0);
    const [palletQty, setPalletQty] = useState(0);
    const [binNum, setBinNum] = useState(0);
    const [whQty, setWhQty] = useState(0);
    const [ccQty, setCcQty] = useState(0);

    const [errorVisible, setErrorVisible] = useState(false);

    const [editWHQty, setEditWHQty] = useState(false);
    const [editCCQty, setEditCCQty] = useState(false);

    const [verifyWHLoc, setVerifyWHLoc] = useState(false);
    const [verifyWHText, setVerifyWHText] = useState("");

    const [verifyCCLoc, setVerifyCCLoc] = useState(false);
    const [verifyCCText, setVerifyCCText] = useState("");

    // const pallets = useSelector(state => state.items.pallets);
    const items = useSelector(state => state.items);
    const employeeId = useSelector(state => state.items.employeeId);
    const itemId = useSelector(state => state.items.itemId);
    // console.log("employeeId: ", employeeId);

    useEffect(() => {
        if (item.length > 0) {
            getItem();
        }
    }, [item])

    useEffect(() => {
        // console.log("USE EFFECT items: ", items);
    }, [items])

    useEffect(() => {
        console.log("itemId: ", itemId);
    }, [itemId])

    useEffect(() => {
        // console.log('item data: ', itemObj);
    }, [itemObj])

    async function getItem () {
        try {
            const response = await axios.post('http://192.168.2.165:81/api/Item/getItem', {
                token: 'Yh2k7QSu4l8CZg5p6X3Pna9L0Miy4D3Bvt0JVr87UcOj69Kqw5R2Nmf4FWs03Hdx',
                upc: item
            })
                // console.log("response: ", response);
                if (!response.data.success) {
                    setErrorVisible(true);
                    setItem('');

                } else {
                    setItemObj(response.data.itemData);
                    dispatch(setItemId(response.data.itemData[0].id));
                    dispatch(setItems(response.data.itemData));
                    dispatch(setPallets(response.data.itemData[0].palletData));
                    setWhQty(response.data.itemData[0].primaryBinQuantity);
                    setCcQty(response.data.itemData[0].secondaryBinQuantity);
                    calcPalletItems(response.data.itemData[0].palletData);
                }

                // console.log("getItem response: ", response.data);
        } catch (err) {
            console.error("ERROR: ", err);
        } finally {
            // console.log("RESULT: ", itemObj);
        }
    }

    const updateBinQty= async (bin, qty) => {
        console.log("itemId: ", itemObj[0].id);
        console.log("employeeId: ", employeeId);
        console.log("qty: ", qty);
        console.log("bin: ", bin);
            return axios.post('http://192.168.2.165:81/api/Item/updateItemBinQuantityAdjustment', {
                token: 'Yh2k7QSu4l8CZg5p6X3Pna9L0Miy4D3Bvt0JVr87UcOj69Kqw5R2Nmf4FWs03Hdx',
                employeeId: employeeId,
                itemID: itemObj[0].id,
                binNumber: bin,
                quantity: qty
            }).then(response => {
                console.log("updateBin: ", response.data);
            }).catch(err => {
                console.error("ERROR: ", err.response.reason);
            })
    }

    function calcBin(primary, secondary, fulfilled) {
        // setBinNum(primary + secondary + fulfilled);
        return primary + secondary + fulfilled;
    }

    function calcDiff(total, bin) {
        return (total) + (bin);
    }

    function calcPalletItems (palletData) {
        let palletAgg = 0
        for (let i = 0; i < palletData.length; i++) {
            palletAgg += palletData[i].quantity;
        }
        setPalletQty(palletAgg);
    }

    return (
        <>
            <ImageBackground source={ghraDark} style={styles.backgroundImage}>
          <Modal
            animationType="slide"
            transparent={true}
            visible={verifyWHLoc}
            onRequestClose={() => {
            }}>
                <View style={{backgroundColor: '#000000bb', width: '90%', marginHorizontal: 'auto', marginTop: hp(22), minHeight: rs(200), padding: rs(10), borderRadius: rs(10), borderWidth: 1, borderColor: '#808080'}}>
                    <Text style={{color: '#fff', textAlign: 'center', fontWeight: 'bold', fontSize: rs(20)}}>Verify Location</Text>
                    <TextInput style={{color: 'white', borderColor: "#1D9E75", borderWidth: 1, borderRadius: rs(10), padding: rs(10), marginTop: rs(10), fontSize: rs(16)}} placeholder='Scan Location' placeholderTextColor={'#fff'} showSoftInputOnFocus={false} autoFocus={true} onChangeText={(text) => {
                        // console.log("Verify WH Text: ", text);
                        setVerifyWHText(text);
                        if (text === itemObj[0].primaryBin) {
                            // console.log('WH location verified');
                            setVerifyWHLoc(false);
                        }
                    }}/>
                    <View style={{backgroundColor: '#ff0000', width: rs(100), padding: rs(10), borderRadius: rs(8), marginHorizontal: 'auto', marginTop: rs(20)}}>
                        <TouchableOpacity onPress={() => {
                            setVerifyWHLoc(false);
                            setEditWHQty(false);
                        }}>
                            <Text style={{color: '#fff', textAlign: 'center', fontSize: rs(20), fontWeight: 'bold'}}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            <Modal
            animationType="slide"
            transparent={true}
            visible={verifyCCLoc}
            onRequestClose={() => {
            }}>
                <View style={{backgroundColor: '#000000bb', width: '90%', marginHorizontal: 'auto', marginTop: hp(22), minHeight: rs(200), padding: rs(10), borderRadius: rs(10), borderWidth: 1, borderColor: '#808080'}}>
                    <Text style={{color: '#fff', textAlign: 'center', fontWeight: 'bold', fontSize: rs(20)}}>Verify Location</Text>
                    <TextInput style={{color: 'white', borderColor: "#1D9E75", borderWidth: 1, borderRadius: rs(10), padding: rs(10), marginTop: rs(10), fontSize: rs(16)}} placeholder='Scan Location' placeholderTextColor={'#fff'} showSoftInputOnFocus={false} autoFocus={true} onChangeText={(text) => {
                        // console.log("Verify WH Text: ", text);
                        setVerifyCCText(text);
                        if (text === itemObj[0].secondaryBin) {
                            // console.log('WH location verified');
                            setVerifyCCLoc(false);
                            setVerifyCCText(text);
                        }
                    }}/>
                    <View style={{backgroundColor: '#ff0000', width: rs(100), padding: rs(10), borderRadius: rs(8), marginHorizontal: 'auto', marginTop: rs(20)}}>
                        <TouchableOpacity onPress={() => {
                            setVerifyCCLoc(false);
                            setEditCCQty(false);
                        }}>
                            <Text style={{color: '#fff', textAlign: 'center', fontSize: rs(20), fontWeight: 'bold'}}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            <Modal
                animationType="slide"
                transparent={true}
                visible={errorVisible}
                onRequestClose={() => {
                    setItem('');
            }}>
                <View style={{backgroundColor: '#000000bb', width: '70%', marginHorizontal: 'auto', marginTop: hp(22), minHeight: rs(125), padding: rs(10), borderRadius: rs(10), borderWidth: 1, borderColor: '#808080'}}>
                    <Text style={{color: '#fff', textAlign: 'center', fontWeight: 'bold', fontSize: rs(20)}}>Invalid Item</Text>
                    <View style={{backgroundColor: '#ff0000', width: rs(100), padding: rs(10), borderRadius: rs(8), marginHorizontal: 'auto', marginTop: rs(20)}}>
                        <TouchableOpacity onPress={() => {
                            setErrorVisible(false);
                        }}>
                            <Text style={{color: '#fff', textAlign: 'center', fontSize: rs(20), fontWeight: 'bold'}}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
                {!itemObj &&
                 <View style={{flex: 1, justifyContent: 'center', paddingHorizontal: '5%'}}>
                    <TextInput placeholder='|||| Item number or UPC' placeholderTextColor={'#919191'} style={[styles.skuInput, { padding: rs(25), fontSize: rs(20), height: rs(75), borderRadius: rs(15) }]} showSoftInputOnFocus={false} autoFocus={true} value={item} onChangeText={(text) => {
                        setItem(text);
                    }} />
                    <Text style={{color: '#8f8f8f', textAlign: 'center', marginTop: rs(20), fontSize: rs(14)}}>Scan item or type. Press Enter.</Text>
                </View>}
                {itemObj !== undefined && 
                    <ScrollView>
                        <View style={{marginBottom: rs(100)}}>
                            <Image source={{uri: itemObj[0].itemUrl}} style={[styles.productImg, { height: hp(28) }]}/>
                            <View style={styles.itemOverview}>
                                <Text style={[styles.sku, { fontSize: rs(14), margin: rs(10) }]}>SKU {itemObj[0].sku}</Text>
                                <Text style={[styles.itemDesc, { fontSize: rs(15) }]}>{itemObj[0].description}</Text>
                                <Text style={[styles.categoryTag, { fontSize: rs(13), paddingVertical: rs(4) }]}>{itemObj[0].department}</Text>
                            </View>
                            <View>
                                <View style={{...styles.itemOverview, marginTop: 10, paddingBottom: 0, borderTopEndRadius: 10, borderTopLeftRadius: 10, }}>
                                    <View style={styles.itemDetailFlex}>
                                        <Text style={[styles.itemDetailsHead, { fontSize: rs(13) }]}>Quantity on Hand (QOH)</Text>
                                        <Text style={[styles.itemQty, { fontSize: rs(20) }]}>{itemObj[0].quantity}</Text>
                                    </View>
                                    <View style={styles.itemDetailFlex}>
                                        <Text style={[styles.itemDetailsHead, { fontSize: rs(13) }]}>Bins total (WH + C/C + Storage + Fulfilled)</Text>
                                        <Text style={[styles.itemQty, { fontSize: rs(20) }]}>{calcBin(itemObj[0].primaryBinQuantity, itemObj[0].secondaryBinQuantity, itemObj[0].fulfillQuantity)}</Text>
                                    </View>
                                    {
                                        calcBin(itemObj[0].primaryBinQuantity, itemObj[0].secondaryBinQuantity, itemObj[0].fulfillQuantity) < 0 && <View style={styles.itemDiscrepancy}>
                                        <Text style={[styles.itemDiscrepancyText, { fontSize: rs(13) }]}>BIN DISCREPANCY - bins under by {calcDiff(itemObj[0].quantity, calcBin(itemObj[0].primaryBinQuantity, itemObj[0].secondaryBinQuantity, itemObj[0].fulfillQuantity))}</Text>
                                    </View>
                                    }
                                    {
                                        calcBin(itemObj[0].primaryBinQuantity, itemObj[0].secondaryBinQuantity, itemObj[0].fulfillQuantity) > 0 && <View style={styles.itemDiscrepancy}>
                                        <Text style={[styles.itemDiscrepancyText, { fontSize: rs(13) }]}>BIN DISCREPANCY - bins over by {calcDiff(itemObj[0].quantity, calcBin(itemObj[0].primaryBinQuantity, itemObj[0].secondaryBinQuantity, itemObj[0].fulfillQuantity))}</Text>
                                    </View>
                                    }
                                </View>
                                <View style={{...styles.itemOverview, marginTop: 10, paddingBottom: 0, borderTopEndRadius: 10, borderTopLeftRadius: 10}}>
                                    <View style={{...styles.itemDetailFlex, flexDirection: 'column'}}>
                                        <Text style={[styles.itemDetailsHead, { marginBottom: 5, marginLeft: 20, fontSize: rs(13) }]}>Warehouse Location</Text>
                                        <Text style={[styles.itemQty, { alignSelf: 'flex-start', fontSize: rs(15), marginTop: 0, marginLeft: 20 }]}>{itemObj[0].primaryBin}</Text>
                                    </View>
                                    <View>
                                        {editWHQty === false && <View style={styles.itemDetailFlex}>
                                            <Text style={[styles.itemDetailsHead, { fontSize: rs(13) }]}>Quantity</Text>
                                                <View style={styles.textGroup}>
                                                    <Text style={[styles.itemQty, { fontSize: rs(20) }]}>{itemObj[0].primaryBinQuantity}</Text>
                                                    <TouchableOpacity onPress={() => {
                                                        setEditWHQty(true);
                                                        setEditCCQty(false);
                                                        setVerifyWHLoc(true);
                                                    }}>
                                                        <Image style={[styles.pencilIcon, { width: rs(32), height: rs(32), marginRight: rs(15) }]} source={pencil} />
                                                    </TouchableOpacity>
                                                </View>
                                        </View>}
                                        {editWHQty === true && <View style={styles.itemDetailFlex}>
                                            {/* <Text style={styles.itemDetailsHead}>Quantity</Text> */}
                                                <View style={{...styles.textGroup, width: '100%', marginVertical: 20}}>
                                                    <View>
                                                        <Text style={{color: '#fff', textAlign: 'center', fontSize: rs(14)}}>{itemObj[0].primaryBinQuantity}</Text>
                                                        <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                                                            <TouchableOpacity style={[styles.qtyBtn, { width: rs(50), height: rs(50) }]} onPress={() => {
                                                                setWhQty(prevQty => {
                                                                    return prevQty - 1;
                                                                })
                                                            }}><Text style={[styles.qtyBtnText, { fontSize: rs(30) }]}>-</Text></TouchableOpacity>
                                                            <TextInput 
                                                                style={[styles.qtyInput, { color: '#fff', textAlign: 'center', padding: rs(10), width: wp(45), maxWidth: rs(200) }]}
                                                                placeholder={'Change total quantity'}
                                                                placeholderTextColor={'#fff'}
                                                                value={whQty}
                                                                keyboardType='number-pad'
                                                                onChangeText={(val) => {
                                                                    setWhQty(val);
                                                                }}   
                                                            />
                                                            <TouchableOpacity style={[styles.qtyBtn, { width: rs(50), height: rs(50) }]} onPress={() => {
                                                                setWhQty(prevQty => {
                                                                    return prevQty + 1;
                                                                })
                                                            }}><Text style={[styles.qtyBtnText, { fontSize: rs(30) }]}>+</Text></TouchableOpacity>
                                                        </View>
                                                        <View>
                                                        <Text style={{color: '#929292', textAlign: 'center', marginTop: 10, fontSize: rs(13)}}>{whQty < itemObj[0].primaryBinQuantity ? `Deducting ${whQty - itemObj[0].primaryBinQuantity}`
                                                         : whQty > itemObj[0].primaryBinQuantity ? `Adding ${whQty - itemObj[0].primaryBinQuantity}` : ""}</Text>
                                                        <TouchableOpacity style={{...styles.applyBtn, marginTop: 20, width: '50%', marginHorizontal: 'auto', padding: rs(10), borderRadius: rs(8)}}
                                                        onPress={() => {
                                                            updateBinQty(itemObj[0].primaryBin, whQty - itemObj[0].primaryBinQuantity);
                                                        }}>
                                                            <Text style={{color: '#fff', fontWeight: 'bold', textAlign: 'center', fontSize: rs(15)}}>Apply</Text>
                                                        </TouchableOpacity>
                                                    </View>
                                                    </View>
                                                </View>
                                        </View>}
                                    </View>
                                </View>
                                <View style={{...styles.itemOverview, marginTop: 10, paddingBottom: 0, borderTopEndRadius: 10, borderTopLeftRadius: 10}}>
                                    <View style={{...styles.itemDetailFlex, flexDirection: 'column'}}>
                                        <Text style={[styles.itemDetailsHead, { marginBottom: 5, marginLeft: 20, fontSize: rs(13) }]}>Cash/Carry Location</Text>
                                        <Text style={[styles.itemQty, { alignSelf: 'flex-start', fontSize: rs(15), marginTop: 0, marginLeft: 20 }]}>{itemObj[0].secondaryBin}</Text>
                                    </View>
                                    <View>
                                        {editCCQty === false && <View style={styles.itemDetailFlex}>
                                            <Text style={[styles.itemDetailsHead, { fontSize: rs(13) }]}>Quantity</Text>
                                                <View style={styles.textGroup}>
                                                    <Text style={[styles.itemQty, { fontSize: rs(20) }]}>{itemObj[0].secondaryBinQuantity}</Text>
                                                    <TouchableOpacity onPress={() => {
                                                        setEditCCQty(true);
                                                        setEditWHQty(false);
                                                        setVerifyCCLoc(true);
                                                    }}>
                                                        <Image style={[styles.pencilIcon, { width: rs(32), height: rs(32), marginRight: rs(15) }]} source={pencil} />
                                                    </TouchableOpacity>
                                                </View>
                                        </View>}
                                        {editCCQty === true && <View style={styles.itemDetailFlex}>
                                            {/* <Text style={styles.itemDetailsHead}>Quantity</Text> */}
                                                <View style={{...styles.textGroup, width: '100%', marginVertical: 20}}>
                                                    <View>
                                                        <Text style={{color: '#fff', textAlign: 'center', fontSize: rs(14)}}>{itemObj[0].secondaryBinQuantity}</Text>
                                                        <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                                                            <TouchableOpacity style={[styles.qtyBtn, { width: rs(50), height: rs(50) }]} onPress={() => {
                                                                setCcQty(prevQty => {
                                                                    return prevQty - 1;
                                                                })
                                                            }}><Text style={[styles.qtyBtnText, { fontSize: rs(30) }]}>-</Text></TouchableOpacity>
                                                            <TextInput 
                                                                style={[styles.qtyInput, { color: '#fff', textAlign: 'center', padding: rs(10), width: wp(45), maxWidth: rs(200) }]}
                                                                placeholder={'Change total quantity'}
                                                                placeholderTextColor={'#fff'}
                                                                value={ccQty}
                                                                keyboardType='number-pad'
                                                                onChangeText={(val) => {
                                                                    setCcQty(val);
                                                                }}   
                                                            />
                                                            <TouchableOpacity style={[styles.qtyBtn, { width: rs(50), height: rs(50) }]} onPress={() => {
                                                                setCcQty(prevQty => {
                                                                    return prevQty + 1;
                                                                })
                                                            }}><Text style={[styles.qtyBtnText, { fontSize: rs(30) }]}>+</Text></TouchableOpacity>
                                                        </View>
                                                        <View>
                                                        <Text style={{color: '#929292', textAlign: 'center', marginTop: 10, fontSize: rs(13)}}>
                                                            {ccQty < itemObj[0].secondaryBinQuantity ? `Deducting ${ccQty - itemObj[0].secondaryBinQuantity}`
                                                         : ccQty > itemObj[0].secondaryBinQuantity ? `Adding ${ccQty - itemObj[0].secondaryBinQuantity}` : ""}</Text>
                                                         <TouchableOpacity 
                                                            style={{...styles.applyBtn, marginTop: 20, width: '50%', marginHorizontal: 'auto', padding: rs(10), borderRadius: rs(8)}}
                                                            onPress={() => {
                                                                updateBinQty(itemObj[0].secondaryBin, ccQty - itemObj[0].secondaryBinQuantity);
                                                            }}>
                                                            <Text style={{color: '#fff', fontWeight: 'bold', textAlign: 'center', fontSize: rs(15)}}>Apply</Text>
                                                        </TouchableOpacity>
                                                    </View>
                                                    </View>
                                                </View>
                                        </View>}
                                    </View>
                                </View>
                                <View style={{...styles.itemOverview, marginTop: 10, paddingBottom: 0, borderTopEndRadius: 10, borderTopLeftRadius: 10, }}>
                                    <TouchableOpacity onPress={() => {
                                        router.push('storage')
                                    }}>
                                        <View style={{...styles.itemDetailFlex}}>
                                            <Text style={[styles.itemDetailsHead, { marginBottom: 5, fontSize: rs(13) }]}>Storage</Text>
                                            <Text style={[styles.itemQty, { fontSize: rs(20) }]}>{palletQty}</Text>
                                        </View>
                                        <View style={{...styles.itemDetailFlex, alignSelf: 'flex-end'}}>
                                            <Text style={[styles.itemDetailsHead, { marginTop: 0, fontSize: rs(13) }]}>{itemObj[0].palletData.length} pallet(s) - tap to view</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                                <View style={{...styles.itemOverview, marginTop: 10, paddingBottom: 0, borderTopEndRadius: 10, borderTopLeftRadius: 10, }}>
                                    <View style={{...styles.itemDetailFlex, paddingVertical: 10}}>
                                        <Text style={[styles.itemDetailsHead, { marginBottom: 5, fontSize: rs(13) }]}>Fulfilled</Text>
                                        <Text style={[styles.itemQty, { fontSize: rs(20) }]}>{itemObj[0].fulfillQuantity}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>    
                    </ScrollView>}

            </ImageBackground>
        </>
    )
}

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1, 
        backgroundColor: "#000"
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
    productImg: {
        width: "100%",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20
    },
    itemOverview: {
        backgroundColor: '#252525',
        paddingBottom: 10,
        borderWidth: 1,
        borderColor: '#5f5f5f',
        borderBottomEndRadius: 10,
        borderBottomStartRadius: 10
    },
    sku: {
        color: "#1D9E75",
        marginBottom: 2
    },
    itemDesc: {
        color: 'white',
        fontWeight: 'bold',
        marginTop: 0,
        marginStart: 10
    },
    categoryTag: {
        backgroundColor: "#1D9E75",
        color: 'white',
        fontWeight: 'bold',
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        textAlign: 'center',
        borderRadius: 5,
        margin: 10
    },
    itemDetailFlex: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between'
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
    itemDiscrepancy: {
        backgroundColor: '#b4020280',
        marginBottom: 0,
        borderBottomEndRadius: 10,
        borderBottomLeftRadius: 10,
        paddingVertical: 10,
        borderWidth: 1,
        borderTopColor: '#e70000'
    },
    itemDiscrepancyText: {
        color: '#ff928e',
        marginLeft: 10
    },
    textGroup: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-around'
    },
    pencilIcon: {},
    editingBorder: {
        borderColor: "#1D9E75",
        borderWidth: 2,
        borderRadius: 10,
    },
    qtyBtn: {
        backgroundColor: '#131212', 
        borderWidth: 1, 
        borderRadius: 8, 
        borderColor: '#525252',
        alignItems: 'center',
        justifyContent: 'center',
    },
    qtyBtnText: {
        color: '#fff', 
        textAlign: 'center'
    },
    qtyInput: {
        borderColor: "#1D9E75",
        borderWidth: 1,
        borderRadius: 10,
    },
    applyBtn: {
        backgroundColor: "#1D9E75",
    }

})

export default ScanItem;
