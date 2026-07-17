import React from 'react';
import { Text, View, ImageBackground, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

const ghraDark = require('../../assets/images/ghra_dark.jpg');
const cube = require('../../assets/images/cube.png');

const Menu = ({ navigation }) => {
    return (
    <ImageBackground source={ghraDark} resizeMode='contain' style={styles.backgroundImage}>
        <View style={{ display: 'flex', flexDirection: 'column', alignContent: 'flex-end', height: "100%"}}>
            <View style={{ position: 'absolute', top: 450, left: 50}}>
                <TouchableOpacity style={{ backgroundColor: "#1D9E75", padding: 20, borderRadius: 20 }}
                    onPress={() => {
                        router.push('/scan_item');
                    }}
                >
                    <Image source={cube} style={{ width: 32, height: 32 }} />
                </TouchableOpacity>
                <Text style={{ color: 'white'}}>Item Details</Text>
            </View>
        </View>
    </ImageBackground>

    )
}

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1, 
        backgroundColor: "#000"
    }
})

export default Menu;