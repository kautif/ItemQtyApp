import { useNavigation } from '@react-navigation/native';
import Restocking from "../components/Restocking";

export default function RestockPage() {
    const navigation = useNavigation();
    return <Restocking />
}