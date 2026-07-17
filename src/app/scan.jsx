import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';
import Scan from "../components/Scan";

export default function ScanPage() {
    const navigation = useNavigation();
    return <Scan />
}