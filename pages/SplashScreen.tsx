import {View, ImageBackground} from 'react-native';
import BackgroundImage from '../assets/images/Default-667h.png';
import GlobalStyles from '../style/GlobalStyles';
import CustomText from '../assets/CustomText';
import {ActivityIndicator, Button, useTheme} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { screenFlowModule } from '../helper/ScreenFlowModule';

const SplashScreen = () => {
    const theme = useTheme();

    return (
        <ImageBackground source={BackgroundImage} style={GlobalStyles.backgroundImage}>
            <View style={GlobalStyles.backgroundOverlay}/>
            <CustomText variant='titleLargeBold' style={{zIndex: 10, color: theme.colors.background, marginBottom: 40}}>Loading your App</CustomText>
            <ActivityIndicator animating={true} color={theme.colors.background} size='large'/>
            {/* TODO remove this for production */}
            <Button 
                style={{marginTop: 20}}
                mode='contained'
                onPress={async () => {
                    await AsyncStorage.removeItem('installation_id');
                }}
            >Clear Installation Id</Button>
        </ImageBackground>
    )
}

export default SplashScreen;