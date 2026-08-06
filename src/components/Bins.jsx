import axios from 'axios';
import { ImageBackground } from 'expo-image';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import useResponsive from '../hooks/useResponsive';

const ghraDark = require('../../assets/images/ghra_dark.jpg');
const Bins = ({}) => {
    const { rs, wp } = useResponsive();
    const [bin, setBin] = useState("");
    const [upc, setUPC] = useState("");
    const [availableBins, setAvailableBins] = useState([]);
    const [desc, setDesc] = useState("");
    const [binQty, setBinQty] = useState(0);
    const [sku, setSKU] = useState("");
    const [itemId, setItemId] = useState(0);


    const getBins = () => {
         return axios.post('http://192.168.2.165:81/api/Item/getItemBin', {
            token: "Yh2k7QSu4l8CZg5p6X3Pna9L0Miy4D3Bvt0JVr87UcOj69Kqw5R2Nmf4FWs03Hdx",
            upc: upc,
            fromBinNumber: bin
         }).then(response => {
            if (response.data.success) {
                console.log("bin response: ", response.data);
                setAvailableBins(response.data.binItemData[0].availableBins);
                setDesc(response.data.binItemData[0].description);
                setBinQty(response.data.binItemData[0].fromBinQuantity);
                setSKU(response.data.binItemData[0].sku);
                setItemId(response.data.binItemData[0].id);
            } else {
                console.log("bin response fail: ", response.data);
            }
         })
    }

    function numberCommaFormat(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    }

    useEffect(() => {
        if (bin.length > 0) {

        }
    }, [bin])

    useEffect(() => {
        if (upc.length > 0) {
            getBins();
        }
    }, [upc])

    useEffect(() => {
        console.log("available bins: ", availableBins);
        console.log("desc: ", desc);
        console.log("binQty: ", binQty);
        console.log("sku: ", sku);
        console.log("itemId: ", itemId);
    }, [itemId])

    return (
        <ImageBackground source={ghraDark} resizeMode='contain' style={styles.backgroundImage}>
            <TextInput 
                placeholder='|||| Scan / Enter source bin' placeholderTextColor={'#919191'} 
                style={[styles.skuInput, { padding: rs(25), fontSize: rs(20), height: rs(75), borderRadius: rs(15), marginTop: 40 }]} 
                showSoftInputOnFocus={false} 
                autoFocus={true} 
                value={bin} 
                onChangeText={(text) => {
                setBin(text);
            }} />

            {bin.length > 0 && <TextInput 
                placeholder='|||| Scan Item' placeholderTextColor={'#919191'} 
                style={[styles.skuInput, { padding: rs(25), fontSize: rs(20), height: rs(75), borderRadius: rs(15), marginTop: 40 }]} 
                showSoftInputOnFocus={false} 
                autoFocus={true} 
                value={upc} 
                onChangeText={(text) => {
                setUPC(text);
            }} />}
            {sku && <>
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
                                    // setWhQty(prevQty => {
                                    //     return prevQty - 1;
                                    // })
                                }}><Text style={[styles.qtyBtnText, { fontSize: rs(30) }]}>-</Text></TouchableOpacity>
                                <TextInput 
                                    // ref={whQtyInputRef}
                                    style={[styles.qtyInput, { color: '#fff', textAlign: 'center', padding: rs(10), width: wp(45), maxWidth: rs(200) }]}
                                    placeholder={'Change quantity'}
                                    placeholderTextColor={'#919191'}
                                    // showSoftInputOnFocus={false}
                                    // value={whQty.toString()}
                                    keyboardType='number-pad'
                                    onChangeText={(val) => {
                                        // setWhQty(val === '' ? 0 : parseInt(val) || 0);
                                    }}   
                                />
                                <TouchableOpacity style={[styles.qtyBtn, { width: rs(50), height: rs(50) }]} onPress={() => {
                                    // setWhQty(prevQty => {
                                    //     return prevQty + 1;
                                    // })
                                }}><Text style={[styles.qtyBtnText, { fontSize: rs(30) }]}>+</Text></TouchableOpacity>
                            </View>
                            <View>
                                {Number.isFinite(binQty) && <Text style={{color: '#fff', textAlign: 'center', marginTop: 10, fontSize: rs(20)}}>
                                Bin: {binQty}</Text>}
                                {/* {Number.isFinite(binQty) > 0 && <Text style={{color: '#fff', textAlign: 'center', marginTop: 10, fontSize: rs(20)}}>New Total: {binQty}</Text>} */}
                                <TouchableOpacity style={{...styles.applyBtn, marginTop: 20, width: '50%', marginHorizontal: 'auto', padding: rs(10), borderRadius: rs(8)}}
                                onPress={() => {
                                    // updateBinQty(itemObj[0].primaryBin, parseInt(whQty), parseInt(whQty) - defaultPrimaryQty, "primary");
                                }}>
                                    <Text style={{color: '#fff', fontWeight: 'bold', textAlign: 'center', fontSize: rs(15)}}>Apply</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
            </>
            }
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