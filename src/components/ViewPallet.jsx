import { ImageBackground } from 'expo-image';
import { ScrollView, StyleSheet, Text, TextInput } from 'react-native';
import useResponsive from '../hooks/useResponsive';
import { useRef } from 'react';
const ghraDark = require('../../assets/images/ghra_dark.jpg');

const ViewPallet = ({}) => {
    const { hp, rs, wp } = useResponsive();
    const binRef = useRef();

    return (
        <ImageBackground source={ghraDark} resizeMode='contain' style={styles.backgroundImage}>
            <ScrollView>
                <TextInput 
                    ref={binRef}
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
})

export default ViewPallet;