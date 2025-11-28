import { Button, Surface, Text, useTheme, HelperText } from 'react-native-paper';
import CustomText from '../assets/CustomText';
import { View, Animated, Easing, TextInput } from 'react-native';
import GlobalStyles from '../style/GlobalStyles';
import Grid from '../helper/GridLayout';
import { useState, useRef, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
import Svg, { Path, Image, ClipPath, Defs, Rect } from 'react-native-svg';
import { StyleSheet } from 'react-native';
import BackgroundImage from '../assets/images/Default-667h.png';


const LoginPage = () => {
    const { authMethod, setAuthMethod, isAuthenticating } = useSecurityContext();
    const hasSetPin = useRef(false);
    const appContext = useAppContext();
    const helperDataContext = useHelperValuesDataContext();
    const dataContext = useDataContext();
    let presses = 0;
	let lastTimePressed : any = null;

    const OktaLogin = () => {
        return (
            <View>
                <Button
                    style={{ marginBottom: 20 }}
                    mode='outlined'
                    onPress={() => {
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
                >
                    External Login
                </Button>
                <Button
                    onPress={() => {

                        authModule.onFRNSWLogin()
                            .then(async (result: OktaLoginResult) => {

                                appContext.setShowBusyIndicator(true);
                                appContext.setShowDialog(true);

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
        <View>
            <OktaLogin />
        </View>
    )
}

export default LoginPage;