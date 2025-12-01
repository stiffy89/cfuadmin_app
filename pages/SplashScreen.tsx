import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { View, ImageBackground } from 'react-native';
import BackgroundImage from '../assets/images/Default-667h.png';
import GlobalStyles from '../style/GlobalStyles';
import CustomText from '../assets/CustomText';
import { ActivityIndicator, useTheme } from 'react-native-paper';

import { screenFlowModule } from '../helper/ScreenFlowModule';

const SplashScreen = () => {

    const theme = useTheme();

    useFocusEffect(
        useCallback(() => {
    
            const timeout = setTimeout(() => {
                const error = {
                    isAxiosError : false,
                    message : 'Hmm, this is taking much longer than it should. Please go back and try logging in again. (splash screen timed out)'
                }
                screenFlowModule.onNavigateToScreen('ErrorPage', error);
            }, 120000); //120000 -> 2 minutes

            return () => {
                clearTimeout(timeout);
            };
        }, [])
    );  

    return (
        <ImageBackground source={BackgroundImage} style={GlobalStyles.splashBackgroundImage}>
            <View style={GlobalStyles.backgroundOverlay} />
            <CustomText variant='titleLargeItalic' style={{ zIndex: 10, color: theme.colors.background, marginBottom: 40 }}>Preparing your App</CustomText>
            <ActivityIndicator animating={true} color={theme.colors.background} size='large' />
        </ImageBackground>
    )
}

export default SplashScreen;