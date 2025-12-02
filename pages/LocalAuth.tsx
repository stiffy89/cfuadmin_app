//local authentication screen - this will be for pin, biometrics verification
import { Button, Surface, Text, useTheme, HelperText } from 'react-native-paper';
import CustomText from '../assets/CustomText';
import { View, Animated, Easing, TextInput, ImageBackground } from 'react-native';
import GlobalStyles from '../style/GlobalStyles';
import Grid from '../helper/GridLayout';
import { useState, useRef, useEffect } from 'react';
import { hasHardwareAsync, isEnrolledAsync, getEnrolledLevelAsync } from 'expo-local-authentication';
import { authModule } from '../helper/AuthModule';

import { screenFlowModule } from '../helper/ScreenFlowModule';
import { useAppContext } from '../helper/AppContext';
import { dataHandlerModule } from '../helper/DataHandlerModule';
import { useDataContext } from '../helper/DataContext';
import { useHelperValuesDataContext } from '../helper/HelperValuesDataContext';
import { isAxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';
import BackgroundImage from '../assets/images/Default-667h.png';

const LocalAuth = () => {

    const pinCopy = useRef('');
    const [pin, setPin] = useState('');
    const [attempts, setAttempts] = useState(3);
    const [errorText, setErrorText] = useState('');
    const [hasPin, setHasPin] = useState(false);
    const [pinTitle, setPinTitle] = useState('Set New Pin');
    const theme = useTheme();

    useEffect(() => {
        async function onMount() {
            const pin = await SecureStore.getItemAsync('pin');

            if (pin) {
                setHasPin(true);
                setPinTitle('Enter Pin')
            }

            //if no pin, make then set a pin first
            if (!pin) {
                return;
            }

            //checking to see if user has biometrics available and active on their device. If not, default to the pin
            if ((pin) && (await hasHardwareAsync() && await isEnrolledAsync())) {
                const securityLevel = await getEnrolledLevelAsync();
                if (securityLevel > 0) {
                    const localAuthResult = await authModule.onLocalAuthLogin();
                    if (localAuthResult) {
                        screenFlowModule.onNavigateToScreen('SplashScreen');
                        //refresh the tokens first and then get all data
                        onRefreshAllTokens()
                            .then(async (tokenResponse) => {
                                const newAccessToken = tokenResponse.data.TOKEN_RESPONSE.ACCESS_TOKEN;
                                const newRefreshToken = tokenResponse.data.TOKEN_RESPONSE.REFRESH_TOKEN;
                                await SecureStore.setItemAsync('access-token', newAccessToken);
                                await SecureStore.setItemAsync('refresh-token', newRefreshToken);

                                onGetInitialLoad();
                            })
                            .catch((error : any) => {
                                error['fromAuth'] = true;
                                screenFlowModule.onNavigateToScreen('ErrorPage', error);
                            })
                        return;
                    }
                }
            }
        }

        onMount();

    }, [])

    const appContext = useAppContext();
    const helperDataContext = useHelperValuesDataContext();
    const dataContext = useDataContext();

    const onRefreshAllTokens = async () => {
        const refreshToken = await SecureStore.getItemAsync('refresh-token');

        async function FullLogin() {
            try {
                const oktaLoginResponse = await authModule.onFRNSWLogin();
                const oktaIDToken = oktaLoginResponse.response.idToken;
                const initialTokenResponse = await dataHandlerModule.getFRNSWInitialTokens(oktaIDToken!);
                return initialTokenResponse;
            }
            catch (error) {
                throw error;
            }
        }

        //full login if we cannot get refresh token
        if (!refreshToken) {
            try {
                return await FullLogin();
            }
            catch (error) {
                throw error;
            }
        }

        try {
            const newAccessTokenResponse = await dataHandlerModule.getRefreshedAccessToken(refreshToken);
            return newAccessTokenResponse;
        }
        catch (error) {
            if (isAxiosError(error)) {
                try {
                    return await FullLogin();
                }
                catch (error) {
                    throw error;
                }
            }

            throw error;
        }
    }

    const onGetInitialLoad = async () => {

        let user;

        try {
            const userInfo = await dataHandlerModule.getInitialUserData();
            dataContext.setCurrentUser(userInfo.data.d.results);
            user = userInfo.data.d.results[0]
        }
        catch (error : any) {
            appContext.setShowDialog(false);

            error['fromAuth'] = true;
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
            catch (error : any) {
                appContext.setShowDialog(false);
                error['fromAuth'] = true;
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
            catch (error : any) {
                appContext.setShowDialog(false);
                error['fromAuth'] = true;
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

    
    const PinBody = <View style={{ marginTop: 20 }}>
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
                            if (hasPin) {
                                const pinSuccess = await authModule.onPinLogin(text);
                                if (pinSuccess) {
                                    screenFlowModule.onNavigateToScreen('SplashScreen');

                                    //refresh the tokens first and then get all data
                                    onRefreshAllTokens()
                                        .then(async (tokenResponse) => {
                                            const newAccessToken = tokenResponse!.data.TOKEN_RESPONSE.ACCESS_TOKEN;
                                            const newRefreshToken = tokenResponse!.data.TOKEN_RESPONSE.REFRESH_TOKEN;
                                            await SecureStore.setItemAsync('access-token', newAccessToken);
                                            await SecureStore.setItemAsync('refresh-token', newRefreshToken);

                                            onGetInitialLoad();
                                        })
                                        .catch((error : any) => {
                                            error['fromAuth'] = true;
                                            screenFlowModule.onNavigateToScreen('ErrorPage', error);
                                        })
                                } else {
                                    if (attempts > 1) {
                                        const attemptsRemaining = attempts - 1;
                                        setAttempts(attemptsRemaining);
                                        triggerShake();
                                        setPin('');
                                        setErrorText('You have ' + attemptsRemaining + ' attempts left');
                                    }
                                    else {
                                        authModule.onLogOut();
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
                                            //no need to get tokens because we just logged in with okta
                                            screenFlowModule.onNavigateToScreen('SplashScreen');
                                            onGetInitialLoad();
                                        }).catch(() => {
                                            const error = {
                                                isAxiosError: false,
                                                fromAuth : true,
                                                message: 'There was an error in setting up the local PIN. Please try again, otherwise contact your IT administrator for further assistance.'
                                            }

                                            screenFlowModule.onNavigateToScreen('ErrorPage', error);
                                        })
                                    }
                                    else {
                                        //pin doesnt match, ask them to try again
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
                {
                    (hasPin) &&
                    <View style={{alignItems: 'flex-start', marginLeft: 20}}>
                        <CustomText variant='bodyLarge' style={{marginLeft: 12, marginBottom: 5}}>Forgotten PIN?</CustomText>
                        <Button 
                            labelStyle={{fontSize: 16}}
                            onPress={()=>{
                                authModule.onLogOut();
                            }}
                        >
                            Reset your PIN
                        </Button>
                    </View>
                }
            </View>

    return PinBody;
    

/*    return (
        <ImageBackground source={BackgroundImage} style={GlobalStyles.backgroundImagePin}>
            <View style={GlobalStyles.backgroundOverlay} />
            <View style={{ height: 310, width: '100%', backgroundColor: theme.colors.background, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}>
                <PinBody />
            </View>
        </ImageBackground>
    ) */


}

export default LocalAuth;   