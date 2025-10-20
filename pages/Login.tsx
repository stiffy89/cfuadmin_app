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

type PinLoginProps = {
    hasSetPinValue : boolean;
    setAuthType : (val : AuthType) => void;
}

const PinLogin = ({hasSetPinValue, setAuthType} : PinLoginProps) => {

    const pinCopy = useRef('');
    const [pin, setPin] = useState('');
    const [attempts, setAttempts] = useState(3);
    const [errorText, setErrorText] = useState('');
    const [pinTitle, setPinTitle] = useState(hasSetPinValue ? 'Enter PIN' : 'Set New Pin');

    const shake = useRef(new Animated.Value(0)).current;

    const triggerShake = () => {
        shake.setValue(0);
        Animated.sequence([
            Animated.timing(shake, { toValue: 1, duration: 50, easing: Easing.linear, useNativeDriver: true }),
            Animated.timing(shake, { toValue: -1, duration: 50, easing: Easing.linear, useNativeDriver: true }),
            Animated.timing(shake, { toValue: 1, duration: 50, easing: Easing.linear, useNativeDriver: true }),
            Animated.timing(shake, { toValue: -1, duration: 50, easing: Easing.linear, useNativeDriver: true }),
            Animated.timing(shake, { toValue: 0, duration: 50, easing: Easing.linear, useNativeDriver: true }),
        ]).start();
    };

    const shakeStyle = {
        transform: [
            {
                translateX: shake.interpolate({
                    inputRange: [-1, 1],
                    outputRange: [-12, 12], // shake amplitude
                }),
            },
        ],
    };

    const PinBoxes = [
        (
            <Surface style={GlobalStyles.surface}>
                <Text style={GlobalStyles.pinAsterisk}>
                    {
                        (pin[0] ? '*' : '')
                    }
                </Text>
            </Surface>
        ),
        (
            <Surface style={GlobalStyles.surface}>
                <Text style={GlobalStyles.pinAsterisk}>
                    {
                        (pin[1] ? '*' : '')
                    }
                </Text>
            </Surface>
        ),
        (
            <Surface style={GlobalStyles.surface}>
                <Text style={GlobalStyles.pinAsterisk}>
                    {
                        (pin[2] ? '*' : '')
                    }
                </Text>
            </Surface>
        ),
        (
            <Surface style={GlobalStyles.surface}>
                <Text style={GlobalStyles.pinAsterisk}>
                    {
                        (pin[3] ? '*' : '')
                    }
                </Text>
            </Surface>
        )
    ]

    const PinBody = <View style={{ marginTop: 30 }}>
        <View style={{ width: '100%', alignItems: 'center' }}>
            <CustomText variant="headlineMediumBold">
                {pinTitle}
            </CustomText>
        </View>
        <Animated.View style={shakeStyle}>
            {
                Grid(PinBoxes, 4, 350)
            }
        </Animated.View>
        <TextInput
            style={{ opacity: 0, height: 1, width: 1, position: 'absolute', left: -9999 }}
            value={pin}
            keyboardType='numeric'
            onChangeText={async (text) => {
                setPin(text);
                if (text.length == 4) {
                    //check to see if pin has been set
                    //if we have, we validate, otherwise, we're just setting up the pin
                    if (hasSetPinValue) {
                        const pinSuccess = await authModule.onPinLogin(text);
                        if (pinSuccess) {
                            //navigate to the home
                            screenFlowModule.onNavigateToScreen('HomeScreen');
                        } else {
                            if (attempts > 1) {
                                const attemptsRemaining = attempts - 1;
                                setAttempts(attemptsRemaining);
                                triggerShake();
                                setPin('');
                                setErrorText('You have ' + attemptsRemaining + ' attempts left');
                            }
                            else {
                                //log out
                                authModule.onLogOut()
                                    .then(() => {
                                        setAuthType('okta');
                                        if (screenFlowModule.getScreenState()?.name !== 'LoginScreen') {
                                            screenFlowModule.onNavigateToScreen('LoginScreen');
                                        }
                                    })
                                    .catch((error) => {
                                        //handle the error
                                        console.log('error in logging out from pin page : ', error)
                                    })
                            }
                        }
                    }
                    else {
                        //we're setting up the pin
                        //copy is empty, save the current pin to copy and wipe the pin clean to start again
                        if (pinCopy.current === '') {
                            setPinTitle('Confirm Set Pin');
                            pinCopy.current = text;
                            setPin('');
                        }
                        else {
                            //check to see if the pin match
                            if (pinCopy.current === text) {
                                //save pin
                                authModule.onSetLocalPin(text).then(() => {
                                    //navigate to home

                                    screenFlowModule.onNavigateToScreen('HomeScreen');
                                }).catch((error) => {
                                    //handle error
                                    console.log('saving pin error : ', error);
                                })
                            }
                            else {
                                //pin doesnt match, ask them to try again
                                console.log('pin doesnt match')
                                triggerShake();
                                pinCopy.current = '';
                                setPin('');
                                setPinTitle('Set New PIN');
                            }
                        }
                    }
                }
            }}
            autoFocus
        />
        {
            (errorText !== '') &&
            <HelperText style={{ paddingHorizontal: 46, fontSize: 16 }} type='error'>
                {errorText}
            </HelperText>
        }
    </View>

    return PinBody;
}

const LoginPage = () => {
    const { authType, setAuthType, isAuthenticating } = useSecurityContext();
    const hasSetPin = useRef(false);

    useEffect(() => {
        (async () => {
            const pin = await SecureStore.getItemAsync('pin');
            console.log(pin)
            if (pin) {
                hasSetPin.current = true;
            }
            else {
                hasSetPin.current = false;
            }
        })();
    }, [])

    const OktaLogin = () => {
        return (
            <View>
                <Button
                    onPress={() => {
                        authModule.onOktaLogin()
                            .then(async (result: OktaLoginResult) => {
                                let tokenArr = [];

                                if (result.response.accessToken) {
                                    tokenArr.push({ key: 'access_token', value: result.response.accessToken })
                                }
                                if (result.response.refreshToken) {
                                    tokenArr.push({ key: 'refresh_token', value: result.response.refreshToken })
                                }
                                if (result.response.idToken) {
                                    tokenArr.push({ key: 'id_token', value: result.response.idToken })
                                }

                                let failedTokens = [];

                                for (var i = 0; i < tokenArr.length; i++) {
                                    try {
                                        await authModule.onSaveSecureKeys(tokenArr[i].key, tokenArr[i].value); //await for each one
                                    }
                                    catch (error) {
                                        failedTokens.push(tokenArr[i]) //save any fails
                                    }
                                }

                                if (failedTokens.length > 0) {
                                    //handle error
                                    console.log('secure tokens were not saved properly : ', failedTokens);
                                }
                                else {
                                    //set up pin
                                    setAuthType('pin');
                                }
                            })
                            .catch((error) => {
                                //handle the auth error
                                console.log('Okta button press error : ', error)
                            })
                    }}
                >Login</Button>
            </View>
        )
    }

    return (
        <View>
            {
                (authType === 'okta') && (
                    <View>
                        <OktaLogin />
                    </View>
                )
            }
            {
                (authType === 'pin') && (
                    <View>
                        <PinLogin hasSetPinValue={hasSetPin.current} setAuthType={setAuthType} />
                    </View>
                )
            }
        </View>
    )
}

export default LoginPage;