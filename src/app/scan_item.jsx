import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';
import ScanItem from "../components/ScanItem";

export default function ScanItemPage() {
    const navigation = useNavigation();
    return <ScanItem />
}