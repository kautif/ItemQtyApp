import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';
import Menu from '../components/Menu';

export default function MenuPage() {
    const navigation = useNavigation();
    return <Menu />
}