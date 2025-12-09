import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { View, ImageBackground } from 'react-native';
import BackgroundImage from '../assets/images/Default-667h.png';
import GlobalStyles from '../style/GlobalStyles';
import CustomText from '../assets/CustomText';
import { ActivityIndicator, Button, useTheme } from 'react-native-paper';

import { screenFlowModule } from '../helper/ScreenFlowModule';
import { authModule } from '../helper/AuthModule';

const SplashScreen = () => {

    const theme = useTheme();
    const [timedOut, setTimedOut] = useState(false);

    useFocusEffect(
        useCallback(() => {
            const timeout = setTimeout(() => {
                setTimedOut(true);
            }, 90000); //90000 -> 90 seconds

            return () => {
                clearTimeout(timeout);
            };
        }, [])
    );  

    return (
        <ImageBackground source={BackgroundImage} style={GlobalStyles.splashBackgroundImage}>
            <View style={GlobalStyles.backgroundOverlay} />
            {
                (!timedOut) &&
                <>
                    <CustomText variant='titleLargeItalic' style={{ zIndex: 10, color: theme.colors.background, marginBottom: 40 }}>Preparing your App</CustomText>
                    <ActivityIndicator animating={true} color={theme.colors.background} size='large'/>
                </>
            }
            {
                (timedOut) && 
                    <View style={{marginTop: 50, paddingHorizontal: 20, alignItems: 'center'}}>
                        <CustomText variant='bodyLarge' style={{color: theme.colors.background}}>This is taking longer than usual, please go back to either page and try re-authenticating again</CustomText>
                        <Button
                            style={{width: 200, marginVertical: 20}}
                            mode='contained-tonal'
                            onPress={() => {
                                authModule.onLogOut();
                            }}
                        >Login Page</Button>
                        <Button
                            style={{width: 200}}
                            mode='contained-tonal'
                            onPress={() => {
                                screenFlowModule.onNavigateToScreen('LocalAuthScreen');
                            }}
                        >Pin Page</Button>
                    </View>
            }
        </ImageBackground>
    )
}

export default SplashScreen;