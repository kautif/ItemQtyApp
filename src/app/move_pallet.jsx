import { useNavigation } from '@react-navigation/native';
import MovePallet from "../components/MovePallet";

export default function MovePalletPage() {
    const navigation = useNavigation();
    return <MovePallet />
}