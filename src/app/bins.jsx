import { useNavigation } from '@react-navigation/native';
import Bins from "../components/Bins";

export default function BinsPage() {
    const navigation = useNavigation();
    return <Bins />
}