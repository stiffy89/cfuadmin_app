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

type PinLoginProps = {
    hasSetPinValue: boolean;
    setAuthType: (val: AuthType) => void;
}

const PinLogin = ({ hasSetPinValue, setAuthType }: PinLoginProps) => {

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
                            screenFlowModule.onNavigateToScreen('SplashScreen');
                        //    onGetInitialLoad();
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
                                    .catch(() => {
                                        const error = {
                                            isAxiosError: false,
                                            message: 'There was an error in logging out of your account. Please try again, otherwise contact your IT administrator for further assistance.'
                                        }

                                        screenFlowModule.onNavigateToScreen('ErrorPage', error);
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
                                //    screenFlowModule.onNavigateToScreen('SplashScreen');
                                //    onGetInitialLoad();
                                }).catch(() => {
                                    const error = {
                                        isAxiosError: false,
                                        message: 'There was an error in setting up the local PIN. Please try again, otherwise contact your IT administrator for further assistance.'
                                    }

                                    screenFlowModule.onNavigateToScreen('ErrorPage', error);
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

const onGetInitialLoad = async (dataContext : any, helperDataContext : any, appContext : any) => {
    let user;

    try {
        const userInfo = await dataHandlerModule.batchGet('Users', 'Z_ESS_MSS_SRV', 'Users');
        dataContext.setCurrentUser(userInfo.responseBody.d.results);
        user = userInfo.responseBody.d.results[0]
    }
    catch (error) {
        appContext.setShowDialog(false);
        screenFlowModule.onNavigateToScreen('ErrorPage', error);
        return;
    }

    let zzplans = user.Zzplans;

    //member, team coordinator, vol admin
    if (!user.VolAdmin) {
        try {
            const brigadesResult = await dataHandlerModule.batchGet('Brigades', 'Z_VOL_MEMBER_SRV', 'Brigades');
            if (brigadesResult.responseBody.error) {
                throw new Error('SAP Error when calling brigades')
            }

            dataContext.setBrigadeSummary(brigadesResult.responseBody.d.results);
            dataContext.setMyOrgUnitDetails(brigadesResult.responseBody.d.results);
            zzplans = brigadesResult.responseBody.d.results[0].Zzplans;
        }
        catch (error) {
            appContext.setShowDialog(false);
            screenFlowModule.onNavigateToScreen('ErrorPage', error);
            return;
        }
    }
    else {
        try {
            const brigadeSummaryResult = await dataHandlerModule.batchGet(`BrigadeSummaries?$filter=Zzplans%20eq%20%27${zzplans}%27`, 'Z_VOL_MEMBER_SRV', 'Brigades');
            if (brigadeSummaryResult.responseBody.error) {
                throw new Error('SAP Error when calling brigade summaries')
            }

            dataContext.setBrigadeSummary(brigadeSummaryResult.responseBody.d.results);
            dataContext.setVolAdminLastSelectedOrgUnit(brigadeSummaryResult.responseBody.d.results);
        }
        catch (error) {
            appContext.setShowDialog(false);
            screenFlowModule.onNavigateToScreen('ErrorPage', error);
            return;
        }
    }

    //set the plans for the contact printing
    dataContext.setContactsPrintPlans(zzplans);

    let requests = [
        dataHandlerModule.batchGet('MenuSet?$format=json', 'Z_MOB2_SRV', 'MenuSet', undefined, true),
        dataHandlerModule.batchGet('EmployeeDetails', 'Z_ESS_MSS_SRV', 'EmployeeDetails'),
        dataHandlerModule.batchGet('AddressStates?$skip=0&$top=20', 'Z_ESS_MSS_SRV', 'VH_AddressStates'),
        dataHandlerModule.batchGet('AddressRelationships?$skip=0&$top=20', 'Z_ESS_MSS_SRV', 'VH_AddressRelationships'),
        dataHandlerModule.batchGet('EquityGenderValues', 'Z_ESS_MSS_SRV', 'VH_EquityGenderValues'),
        dataHandlerModule.batchGet('EquityItemValues?$filter=Edtyp%20eq%20%2708%27', 'Z_ESS_MSS_SRV', 'VH_EquityAboriginalValues'),
        dataHandlerModule.batchGet('EquityItemValues?$filter=Edtyp%20eq%20%2709%27', 'Z_ESS_MSS_SRV', 'VH_EquityRacialEthnicReligiousValues'),
        dataHandlerModule.batchGet('EquityItemValues?$filter=Edtyp%20eq%20%2702%27', 'Z_ESS_MSS_SRV', 'VH_EquityFirstLanguageValues'),
        dataHandlerModule.batchGet('EquityItemValues?$filter=Edtyp%20eq%20%2703%27', 'Z_ESS_MSS_SRV', 'VH_EquityNESLValues'),
        dataHandlerModule.batchGet('EquityItemValues?$filter=Edtyp%20eq%20%2701%27', 'Z_ESS_MSS_SRV', 'VH_EquityDisabilityValues')
    ]

    if (!user.VolAdmin) {
        requests.push(dataHandlerModule.batchGet('MembershipDetails', 'Z_VOL_MEMBER_SRV', 'MembershipDetails'));
        requests.push(dataHandlerModule.batchGet('VolunteerRoles', 'Z_VOL_MEMBER_SRV', 'VolunteerRoles'));
        requests.push(dataHandlerModule.batchGet(`Contacts?$filter=Zzplans%20eq%20%27${zzplans}%27`, 'Z_VOL_MEMBER_SRV', 'Contacts'));
    }

    if (user.TeamCoordinator) {
        requests.push(dataHandlerModule.batchGet('Suburbs', 'Z_CFU_CONTACTS_SRV', 'Suburbs'));
        requests.push(dataHandlerModule.batchGet('RootOrgUnits', 'Z_VOL_MANAGER_SRV', 'RootOrgUnits'));
        requests.push(dataHandlerModule.batchGet(`Members?$skip=0&$top=100&$filter=Zzplans%20eq%20%27${zzplans}%27%20and%20InclWithdrawn%20eq%20false`, 'Z_VOL_MANAGER_SRV', 'Members'));
        requests.push(dataHandlerModule.batchGet(`MemberDrillCompletions?$skip=0&$top=100&$filter=Zzplans%20eq%20%27${zzplans}%27`, 'Z_VOL_MANAGER_SRV', 'MemberDrillCompletions'));
        requests.push(dataHandlerModule.batchGet(`DrillDetails?$skip=0&$top=100&$filter=Zzplans%20eq%20%27${zzplans}%27`, 'Z_VOL_MANAGER_SRV', 'DrillDetails'));
        requests.push(dataHandlerModule.batchGet(`PositionHistoryFilters?$skip=0&$top=100`, 'Z_VOL_MANAGER_SRV', 'VH_PositionHistory'));
    }
    else if (user.VolAdmin) {
        requests.push(dataHandlerModule.batchGet('CessationReasons', 'Z_VOL_MANAGER_SRV', 'VH_CessationReasons'));
        requests.push(dataHandlerModule.batchGet(`Contacts?$filter=Zzplans%20eq%20%27${zzplans}%27%20and%20Mss%20eq%20true`, 'Z_VOL_MEMBER_SRV', 'Contacts'));
        requests.push(dataHandlerModule.batchGet('Suburbs', 'Z_CFU_CONTACTS_SRV', 'Suburbs'));
        requests.push(dataHandlerModule.batchGet(`Members?$skip=0&$top=100&$filter=Zzplans%20eq%20%27${zzplans}%27%20and%20InclWithdrawn%20eq%20false`, 'Z_VOL_MANAGER_SRV', 'Members'));
        requests.push(dataHandlerModule.batchGet(`DrillDetails?$skip=0&$top=100&$filter=Zzplans%20eq%20%27${zzplans}%27`, 'Z_VOL_MANAGER_SRV', 'DrillDetails'));
        requests.push(dataHandlerModule.batchGet(`MemberDrillCompletions?$skip=0&$top=100&$filter=Zzplans%20eq%20%27${zzplans}%27`, 'Z_VOL_MANAGER_SRV', 'MemberDrillCompletions'));
        requests.push(dataHandlerModule.batchGet('MembershipTypes?$skip=0&$top=100', 'Z_VOL_MEMBER_SRV', 'VH_MembershipTypes'));
        requests.push(dataHandlerModule.batchGet('MembershipStatuses?$skip=0&$top=100', 'Z_VOL_MEMBER_SRV', 'VH_MembershipStatuses'));
        requests.push(dataHandlerModule.batchGet('VolunteerStatuses?$skip=0&$top=100', 'Z_VOL_MEMBER_SRV', 'VH_VolunteerStatuses'));
        requests.push(dataHandlerModule.batchGet(`DrillDetails?$skip=0&$top=100&$filter=Zzplans%20eq%20%27${zzplans}%27`, 'Z_VOL_MANAGER_SRV', 'DrillDetails'));
        requests.push(dataHandlerModule.batchGet(`PositionHistoryFilters?$skip=0&$top=100`, 'Z_VOL_MANAGER_SRV', 'VH_PositionHistory'));
    }

    const results = await Promise.allSettled(requests);

    //if we have any fails - its a critical error
    const passed = results.every(x => x.status == 'fulfilled');

    if (!passed) {
        appContext.setShowDialog(false);
        screenFlowModule.onNavigateToScreen('ErrorPage', {
            isAxiosError: false,
            message: "Hang on, we found an error. There was a problem in getting your initial data. Please go back and try again or contact your IT administrator for further assistance."
        });
        return;
    }

    //check to see if we have any read errors from server
    const readErrors = results.filter(x => x.value.responseBody.error);
    if (readErrors.length > 0) {
        appContext.setShowDialog(false);
        screenFlowModule.onNavigateToScreen('ErrorPage', {
            isAxiosError: false,
            message: "Hang on, we found an error. There was a problem in getting your initial data. Please go back and try again or contact your IT administrator for further assistance."
        });
        return;
    }

    for (const x of results) {
        switch (x.value.entityName) {
            case 'MenuSet':
                dataContext.setServices(x.value.responseBody.d.results);
                break;

            case 'Users':
                dataContext.setCurrentUser(x.value.responseBody.d.results);
                break;

            case 'EmployeeDetails':
                dataContext.setEmployeeDetails(x.value.responseBody.d.results);
                break;

            case 'MembershipDetails':
                dataContext.setMembershipDetails(x.value.responseBody.d.results);
                break;

            case 'VolunteerRoles':
                dataContext.setVolunteerRoles(x.value.responseBody.d.results);
                break;

            case 'Contacts':
                dataContext.setMyUnitContacts(x.value.responseBody.d.results);
                break;

            case 'Suburbs':
                dataContext.setCfuPhonebookSuburbs(x.value.responseBody.d.results);
                break;

            case 'Members':
                dataContext.setOrgUnitTeamMembers(x.value.responseBody.d.results);
                break;

            case 'DrillDetails':
                dataContext.setDrillDetails(x.value.responseBody.d.results);
                break;

            case 'MemberDrillCompletions':
                dataContext.setMemberDrillCompletion(x.value.responseBody.d.results);
                break;

            case 'RootOrgUnits':
                dataContext.setRootOrgUnits(x.value.responseBody.d.results);
                dataContext.setTrainingSelectedOrgUnit(x.value.responseBody.d.results[0]);
                break;

            case 'VH_PositionHistory':
                helperDataContext.setPositionHistoryHelperValue(x.value.responseBody.d.results);
                break;

            case 'VH_CessationReasons':
                helperDataContext.setCessationReasons(x.value.responseBody.d.results);
                break;

            case 'VH_AddressStates':
                helperDataContext.setAddressStates(x.value.responseBody.d.results);
                break;

            case 'VH_AddressRelationships':
                helperDataContext.setAddressRelationships(x.value.responseBody.d.results);
                break;

            case 'VH_MembershipTypes':
                helperDataContext.setMembershipTypes(x.value.responseBody.d.results);
                break;

            case 'VH_MembershipStatuses':
                helperDataContext.setMembershipStatuses(x.value.responseBody.d.results);
                break;

            case 'VH_VolunteerStatuses':
                helperDataContext.setVolunteerStatuses(x.value.responseBody.d.results);
                break;

            case 'VH_EquityAboriginalValues':
                helperDataContext.setEquityAboriginalValues(x.value.responseBody.d.results);
                break;

            case 'VH_EquityRacialEthnicReligiousValues':
                helperDataContext.setEquityRacialEthnicReligiousValues(x.value.responseBody.d.results);
                break;

            case 'VH_EquityFirstLanguageValues':
                helperDataContext.setEquityFirstLanguageValues(x.value.responseBody.d.results);
                break;

            case 'VH_EquityNESLValues':
                helperDataContext.setEquityNESLValues(x.value.responseBody.d.results);
                break;

            case 'VH_EquityDisabilityValues':
                helperDataContext.setEquityDisabilityValues(x.value.responseBody.d.results);
                break;

            case 'VH_EquityGenderValues':
                helperDataContext.setEquityGenderValues(x.value.responseBody.d.results);
                break;
                
        }
    }

    screenFlowModule.onNavigateToScreen('HomeScreen');
}

const LoginPage = () => {
    const { authType, setAuthType, isAuthenticating } = useSecurityContext();
    const hasSetPin = useRef(false);
    const appContext = useAppContext();
    const helperDataContext = useHelperValuesDataContext();
    const dataContext = useDataContext();

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
                        authModule.onFRNSWLogin()
                            .then(async (result: OktaLoginResult) => {
                                const oktaIDToken = result.response.idToken;

                                if (oktaIDToken) {
                                    dataHandlerModule.setAuthType('Bearer');
                                    const tokenResponse = await dataHandlerModule.getFRNSWInitialTokens(oktaIDToken);

                                    const newAccessToken = tokenResponse.data.TOKEN_RESPONSE.ACCESS_TOKEN;
                                    const newRefreshToken = tokenResponse.data.TOKEN_RESPONSE.REFRESH_TOKEN;

                                    await authModule.onSaveSecureKeys('access_token', newAccessToken);
                                    await authModule.onSaveSecureKeys('refresh_token', newRefreshToken);

                                    //setAuthType('pin');
                                    onGetInitialLoad(dataContext, helperDataContext, appContext);
                                }
                                else {
                                    appContext.setShowDialog(false);
                                    const error = {
                                        isAxiosError: false,
                                        message: 'There was an error with accessing the ID token from okta. Please try again and if this issue persists, please contact your IT department for further assistance.'
                                    }

                                    screenFlowModule.onNavigateToScreen('ErrorPage', error);
                                }
                            })
                            .catch((error) => {
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