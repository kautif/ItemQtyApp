import { router } from 'expo-router';
import React from 'react';
import { Image, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import useResponsive from '../hooks/useResponsive';
import { useDispatch } from 'react-redux';
import { resetUser } from '../../redux/itemSlice';

const ghraDark = require('../../assets/images/ghra_dark.jpg');
const cube = require('../../assets/images/cube.png');
const logout = require('../../assets/images/logout_door.png');

const Menu = ({ navigation }) => {
    const dispatch = useDispatch();
    const { rs, wp } = useResponsive();

    return (
        <ImageBackground source={ghraDark} resizeMode='contain' style={styles.backgroundImage}>
            <View style={{...styles.container, display: 'flex', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end'}}>
                <View style={[styles.menuItem, { maxWidth: wp(60) }]}>
                    <TouchableOpacity
                        style={[
                            styles.iconButton,
                            { padding: rs(20), borderRadius: rs(20) },
                        ]}
                        onPress={() => {
                            router.push('/scan_item');
                        }}>
                        <Image source={cube} style={{ width: rs(32), height: rs(32) }} />
                    </TouchableOpacity>
                    <Text style={[styles.label, { fontSize: rs(14), marginTop: rs(8) }]}>Item Details</Text>
                </View>
                <View style={[styles.menuItem, { maxWidth: wp(60) }]}>
                    <TouchableOpacity
                        style={[
                            styles.iconButton,
                            { padding: rs(20), borderRadius: rs(20) },
                        ]}
                        onPress={() => {
                            dispatch(resetUser);
                            router.push('/scan');
                        }}>
                        <Image source={logout} style={{ width: rs(32), height: rs(32) }} />
                    </TouchableOpacity>
                    <Text style={[styles.label, { fontSize: rs(14), marginTop: rs(8) }]}>Logout</Text>
                </View>
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        backgroundColor: '#000',
    },
    container: {
        flex: 1,
        // Anchored to the bottom-left as a proportion of the screen instead
        // of a fixed top/left offset, so it lands in roughly the same spot
        // on any screen size.
        justifyContent: 'flex-end',
        alignItems: 'flex-start',
        paddingBottom: '15%',
        paddingLeft: '8%',
        marginBottom: 60
    },
    menuItem: {
        alignItems: 'center',
    },
    iconButton: {
        backgroundColor: '#1D9E75',
        alignItems: 'center',
        justifyContent: 'center',
    },
    label: {
        color: 'white',
        textAlign: 'center',
    },
});

export default Menu;
