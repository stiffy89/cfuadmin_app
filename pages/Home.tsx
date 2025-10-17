import { Button, TextInput, Surface, Text } from 'react-native-paper';
import { ScrollView } from 'react-native';
import CustomText from '../assets/CustomText';
import { View } from 'react-native';
import GlobalStyles from '../style/GlobalStyles';

import { useSecurityContext } from '../helper/SecurityContext';
import { useAppContext } from '../helper/AppContext';
import { authModule } from '../helper/AuthModule';
import { screenFlowModule } from '../helper/ScreenFlowModule';
import { useTheme, Card } from 'react-native-paper';
import { useDataContext } from '../helper/DataContext';

const NameBanner = () => {
    const theme = useTheme();
    const {user} = useDataContext();

    return (
        <View style={{paddingHorizontal: 20, paddingVertical: 10, backgroundColor: theme.colors.secondary}}>
            <CustomText variant='titleMedium' style={{color: '#fff'}}>Hi</CustomText>
            <CustomText variant='displaySmallBold' style={{color: '#fff'}}>{user.firstname} {user.lastname}</CustomText>
        </View>
    )
}

const Services = () => {

}


const HomePage = () => {
    const theme = useTheme();
    const { setShowBusyIndicator, setDialogMessage, setShowDialog } = useAppContext();
    const {setAuthType} = useSecurityContext();



    return (
        <ScrollView>
            <NameBanner/>
            <View style={[GlobalStyles.pageContainer, {backgroundColor: theme.colors.background, borderTopRightRadius: 15, borderTopLeftRadius: 15}]}>
                
            </View>
        </ScrollView>
    )
}

export default HomePage;