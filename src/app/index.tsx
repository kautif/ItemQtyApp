// import * as Device from 'expo-device';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { NavigationIndependentTree } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet } from 'react-native';
import Menu from '../components/Menu';
import Scan from '../components/Scan';
import ScanItem from '../components/ScanItem';
import Storage from '../components/Storage';

const Stack = createNativeStackNavigator();

export default function HomeScreen() {
  return (
    <NavigationIndependentTree>
      <Stack.Navigator>
        <Stack.Screen name="Scan" component={Scan} options={{orientation: 'portrait_up'}}></Stack.Screen>
        <Stack.Screen name="Menu" component={Menu} options={{orientation: 'portrait_up'}}></Stack.Screen>
        <Stack.Screen name="Scan Item" component={ScanItem} options={{orientation: 'portrait_up'}}></Stack.Screen>
        <Stack.Screen name="Storage" component={Storage} options={{orientation: 'portrait_up'}}></Stack.Screen>
      </Stack.Navigator>
    </NavigationIndependentTree>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    gap: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
  },
  heroSection: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingHorizontal: Spacing.four,
    gap: Spacing.four,
  },
  title: {
    textAlign: 'center',
  },
  code: {
    textTransform: 'uppercase',
  },
  stepContainer: {
    gap: Spacing.three,
    alignSelf: 'stretch',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.four,
    borderRadius: Spacing.four,
  },
});
