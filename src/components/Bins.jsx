import { ImageBackground } from 'expo-image';
import React, { useState } from 'react';
import { StyleSheet, TextInput } from 'react-native';
import useResponsive from '../hooks/useResponsive';

const ghraDark = require('../../assets/images/ghra_dark.jpg');

export default function Bins () {
    const [bin, setBin] = useState("");
    const { rs, wp, hp } = useResponsive();
    return (
        <ImageBackground source={ghraDark} resizeMode='contain' style={styles.backgroundImage}>
            <TextInput 
                placeholder='|||| Scan / Enter source bin' placeholderTextColor={'#919191'} style={[styles.skuInput, { padding: rs(25), fontSize: rs(20), height: rs(75), borderRadius: rs(15), marginTop: 40 }]} 
                showSoftInputOnFocus={false} 
                autoFocus={true} 
                value={bin} 
                onChangeText={(text) => {
                setBin(text);
            }} />

            <View style={styles.itemOverview}>
                <Text style={[styles.itemDesc, { fontSize: rs(15) }]}>{itemObj[0].description}</Text>
            </View>

            <View style={styles.itemDetailFlex}>
                <Text style={[styles.itemDetailsHead, { fontSize: rs(13) }]}>Quantity</Text>
                <Text style={[styles.itemQty, { fontSize: rs(20) }]}>{numberCommaFormat(calcBin(itemObj[0].primaryBinQuantity, itemObj[0].secondaryBinQuantity, itemObj[0].fulfillQuantity))}</Text>
            </View>
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
        backgroundColor: '#252525',
        paddingBottom: 10,
        borderWidth: 1,
        borderColor: '#5f5f5f',
        borderBottomEndRadius: 10,
        borderBottomStartRadius: 10
    },
    itemDesc: {
        color: 'white',
        fontWeight: 'bold',
        marginTop: 0,
        marginStart: 10
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
})