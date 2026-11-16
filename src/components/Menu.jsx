import { router } from 'expo-router';
import React from 'react';
import { Image, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch } from 'react-redux';
import { resetUser } from '../../redux/itemSlice';
import useResponsive from '../hooks/useResponsive';

const ghraDark = require('../../assets/images/ghra_dark.jpg');
const cube = require('../../assets/images/cube.png');
const logout = require('../../assets/images/logout_door.png');
const transfer = require('../../assets/images/transfer.png');
const boxes = require('../../assets/images/supplies.png');
const restock = require('../../assets/images/restock.png');
const shelf = require('../../assets/images/shelf.png');

const Menu = ({ navigation }) => {
    const dispatch = useDispatch();
    const { rs, wp } = useResponsive();

    return (
        <ImageBackground source={ghraDark} resizeMode='contain' style={styles.backgroundImage}>
            <View style={{...styles.container, display: 'flex', flexDirection: 'row', justifyContent: 'space-around'}}>
                <View style={[styles.menuItem, { maxWidth: wp(60), marginBottom: rs(10) }]}>
                    <TouchableOpacity
                        style={[
                            styles.iconButton,
                            { padding: rs(20), borderRadius: rs(20) },
                        ]}
                        onPress={() => {
                            router.push('/scan_item');
                        }}>
                        <Image source={cube} style={{ width: rs(64), height: rs(64) }} />
                    </TouchableOpacity>
                    <Text style={[styles.label, { fontSize: rs(14), marginTop: rs(8) }]}>Item Details</Text>
                </View>
                <View style={[styles.menuItem, { maxWidth: wp(60), marginBottom: rs(10) }]}>
                    <TouchableOpacity
                        style={[
                            styles.iconButton,
                            { padding: rs(20), borderRadius: rs(20) },
                        ]}
                        onPress={() => {
                            router.push('/bins');
                        }}>
                        <Image source={transfer} style={{ width: rs(64), height: rs(64) }} />
                    </TouchableOpacity>
                    <Text style={[styles.label, { fontSize: rs(14), marginTop: rs(8) }]}>Bin to Bin</Text>
                </View>
                <View style={[styles.menuItem, { maxWidth: wp(60), marginBottom: rs(10) }]}>
                    <TouchableOpacity
                        style={[
                            styles.iconButton,
                            { padding: rs(20), borderRadius: rs(20) },
                        ]}
                        onPress={() => {
                            router.push('/move_pallet');
                        }}>
                        <Image source={boxes} style={{ width: rs(64), height: rs(64) }} />
                    </TouchableOpacity>
                    <Text style={[styles.label, { fontSize: rs(14), marginTop: rs(8) }]}>Move Pallet</Text>
                </View>
                <View style={[styles.menuItem, { maxWidth: wp(60), marginBottom: rs(10) }]}>
                    <TouchableOpacity
                        style={[
                            styles.iconButton,
                            { padding: rs(20), borderRadius: rs(20) },
                        ]}
                        onPress={() => {
                            router.push('/restocking');
                        }}>
                        <Image source={restock} style={{ width: rs(64), height: rs(64) }} />
                    </TouchableOpacity>
                    <Text style={[styles.label, { fontSize: rs(14), marginTop: rs(8) }]}>Restocking</Text>
                </View>
                {/* <View style={[styles.menuItem, { maxWidth: wp(60), marginBottom: rs(10) }]}>
                    <TouchableOpacity
                        style={[
                            styles.iconButton,
                            { padding: rs(20), borderRadius: rs(20) },
                        ]}
                        onPress={() => {
                            router.push('/view_pallet');
                        }}>
                        <Image source={shelf} style={{ width: rs(64), height: rs(64) }} />
                    </TouchableOpacity>
                    <Text style={[styles.label, { fontSize: rs(14), marginTop: rs(8) }]}>View Pallet</Text>
                </View> */}
                <View style={[styles.menuItem, { maxWidth: wp(60), marginBottom: rs(10) }]}>
                    <TouchableOpacity
                        style={[
                            styles.iconButton,
                            { padding: rs(20), borderRadius: rs(20) },
                        ]}
                        onPress={() => {
                            dispatch(resetUser);
                            router.push('/scan');
                        }}>
                        <Image source={logout} style={{ width: rs(64), height: rs(64) }} />
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
        width: '100%',
        flexWrap: 'wrap',
        position: 'relative',
        top: 270,
        // Anchored to the bottom-left as a proportion of the screen instead
        // of a fixed top/left offset, so it lands in roughly the same spot
        // on any screen size.
        justifyContent: 'space-around',
        alignItems: 'flex-end',
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
