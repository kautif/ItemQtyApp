import { useNavigation } from '@react-navigation/native';
import Storage from "../components/Storage";

export default function ScanPage() {
    const navigation = useNavigation();
    return <Storage />
}