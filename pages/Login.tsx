import { Button, useTheme } from 'react-native-paper';
import CustomText from '../assets/CustomText';
import { View, ImageBackground, Pressable } from 'react-native';
import { useRef } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useSecurityContext } from '../helper/SecurityContext';
import { authModule } from '../helper/AuthModule';
import { OktaLoginResult } from '../types/AppTypes';
import { screenFlowModule } from '../helper/ScreenFlowModule';
import { AuthType } from '../types/AppTypes';
import { useAppContext } from '../helper/AppContext';
import { dataHandlerModule } from '../helper/DataHandlerModule';
import { useHelperValuesDataContext } from '../helper/HelperValuesDataContext';
import { useDataContext } from '../helper/DataContext';
import GlobalStyles from '../style/GlobalStyles';
import Svg, { Path, Image, ClipPath, Defs, Rect } from 'react-native-svg';
import BackgroundImage from '../assets/images/Default-667h.png';


const LoginPage = () => {
    const theme = useTheme();
    const appContext = useAppContext();
    let presses = 0;
    let lastTimePressed: any = null;

    const OktaLogin = () => {
        return (
            <View style={{paddingTop: 30, flex: 1}}>
                <View style={{marginBottom: 20, alignItems: 'center'}}>
                    <CustomText variant='titleMediumBold'>Lets get started</CustomText>
                </View>
                <Button
                    buttonColor={theme.colors.primary}
                    textColor={theme.colors.background}
                    mode='elevated'
                    onPress={() => {
                        appContext.setShowBusyIndicator(true);
                        appContext.setShowDialog(true);

                        authModule.onFRNSWLogin()
                            .then(async (result: OktaLoginResult) => {

                                const oktaIDToken = result.response.idToken;
                                if (oktaIDToken) {
                                    const tokenResponse = await dataHandlerModule.getFRNSWInitialTokens(oktaIDToken);

                                    const newAccessToken = tokenResponse.data.TOKEN_RESPONSE.ACCESS_TOKEN;
                                    const newRefreshToken = tokenResponse.data.TOKEN_RESPONSE.REFRESH_TOKEN;

                                    await SecureStore.setItemAsync('access-token', newAccessToken);
                                    await SecureStore.setItemAsync('refresh-token', newRefreshToken);

                                    appContext.setShowBusyIndicator(false);
                                    appContext.setShowDialog(false);

                                    //navigate to pin page
                                    screenFlowModule.onNavigateToScreen('LocalAuthScreen');
                                }
                                else {
                                    //error handling
                                    appContext.setShowBusyIndicator(false);
                                    appContext.setShowDialog(false);

                                    const error = {
                                        isAxiosError: false,
                                        message: 'There was an error with accessing the ID token from okta. Please try again and if this issue persists, please contact your IT department for further assistance.'
                                    }

                                    screenFlowModule.onNavigateToScreen('ErrorPage', error);
                                }
                            })
                            .catch((error) => {
                                appContext.setShowBusyIndicator(false);
                                appContext.setShowDialog(false);
                                screenFlowModule.onNavigateToScreen('ErrorPage', error);
                            })
                    }}
                >Login</Button>
            </View>
        )
    }

    return (
        <ImageBackground source={BackgroundImage} style={GlobalStyles.backgroundImage}>
            <Pressable
                style={GlobalStyles.backgroundOverlay}
                onPress={() => {
                    console.log('pressed')
                    if (lastTimePressed && (Date.now() - lastTimePressed <= 2000)) {
                        presses += 1;
                    } else {
                        presses = 1;
                    }

                    lastTimePressed = Date.now();

                    if (presses == 10) {
                        screenFlowModule.onNavigateToScreen('ExternalLoginPage');
                    }
                }}
            />
            <View style={{height: 200, width: '100%', paddingHorizontal: 50, backgroundColor: theme.colors.background, borderTopLeftRadius: 5, borderTopRightRadius: 5 }}>
                <OktaLogin />
            </View>
        </ImageBackground>
    )
}

export default LoginPage;