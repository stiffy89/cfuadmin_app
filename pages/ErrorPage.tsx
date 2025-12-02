import {useState, useEffect} from 'react';
import { getItemAsync } from 'expo-secure-store';
import {View, Pressable, Linking} from 'react-native';
import {Button, IconButton, useTheme} from 'react-native-paper';
import CustomText from '../assets/CustomText';
import { RootStackParamList } from '../types/AppTypes';
import { StackScreenProps } from '@react-navigation/stack';
import { screenFlowModule } from '../helper/ScreenFlowModule';
import { authModule } from '../helper/AuthModule';
import { TriangleAlert, CloudAlert, ChevronLeft, Phone, Mail} from 'lucide-react-native';
import GlobalStyles from '../style/GlobalStyles';

type props = StackScreenProps<RootStackParamList, "ErrorPage">;

const ErrorPage = ({route} : props ) => {
    const theme = useTheme();
    const error = route.params!;

    const [errorMessage, setErrorMessage] = useState<string>('');
    const [sapErrorMessage, setSapErrorMessage] = useState('');
    const [errorCode, setErrorCode] = useState<number | undefined>(undefined);

    //these two states are exclusively used for auth flow errors
    const [fromAuth, setFromAuth] = useState(false);
    const [hasPin, setHasPin] = useState(false);
    
    useEffect(() => {

        //if this error is coming from auth, remove the 'go back' option because going back just results in the splash screen being displayed. 
        // Give them either the option to go back to Local Auth or Login using pin

        async function SetAuthFlowErrors () {
            setFromAuth(true);
            const pin = await getItemAsync('pin');
            if (pin){
                setHasPin(true);
            }
        }

        if (error.fromAuth){
            SetAuthFlowErrors();
        }

        if (error.isAxiosError){
            if (error.response?.status == 401){
                setErrorCode(error.response?.status);
                setErrorMessage('It seems that you are unauthorized to access this content at this time. Please go back and try again or sign out and sign back in if the problem persists.');
            }
            else if (error.response?.status == 403){
                setErrorCode(error.response?.status);
                setErrorMessage('It appears that you might be missing the correct credentials in order to access the content this time. Please go back and try again.');
            }
            else if (error.response?.status == 404){
                setErrorCode(error.response?.status);
                setErrorMessage('Well this is strange. The content you are trying to access is not found. Please go back and try again.');
            }
            else if (error.response?.status >= 500 && error.response?.status < 600){
                setErrorCode(error.response?.status);
                setErrorMessage('Oh no! There appears to a connection issue to the server. You can go back and try again or if the problem persists, please contact your IT administrator for further assistance.');
            }
            else {
                setErrorCode(601);
                setErrorMessage("We have stumbled upon a critical error. You can go back and try again or if the problem persists, please contact your IT administrator for further assistance.")
            }
        }
        else {
            //SAP error
            setErrorCode(700);
            setSapErrorMessage(error.message);
            setErrorMessage('There appears to be an error from the SAP system. The error message is listed below. You can go back and try again or contact your IT administrator for further assistance.')
        }

        if (error.fromAuth){
            setErrorMessage('We encountered an error during the authorisation process. Please go back and try again. If the problem persists, contact your IT administrator.')
        }
    }, [])
    
    const HelpStrip = () => {
        return (
            <View style={{paddingVertical: 10, paddingHorizontal: 15, backgroundColor: theme.colors.background, ...GlobalStyles.globalBorderRadius}}>
                <Pressable style={({pressed})=> [pressed ? {opacity: 0.6}:{opacity: 1},{flexDirection: 'row', alignItems: 'center', paddingVertical:16}]} onPress={() => Linking.openURL(`tel:1300 238 238`)}>
                    <Phone style={{marginRight: 20}} color={theme.colors.primary}/>
                    <CustomText variant='bodyLarge'>1300 CFU CFU (1300 238 238)</CustomText>
                </Pressable>
                <Pressable style={({pressed})=> [pressed ? {opacity: 0.6}:{opacity: 1},{flexDirection: 'row', alignItems: 'center', paddingVertical:16}]} onPress={() => Linking.openURL(`mailTo:cfu@fire.nsw.gov.au`)}>
                    <Mail style={{marginRight: 20}} color={theme.colors.primary}/>
                    <CustomText variant='bodyLarge'>cfu@fire.nsw.gov.au</CustomText>
                </Pressable>
            </View>
        )
    }

    return (
        <View style={{flex: 1}}>
            {
                (errorCode && (errorCode >= 700) && sapErrorMessage) && 
                    <View style={{flex: 1, alignItems: 'center'}}>
                        <View style={{height: 150, marginTop: 50}}>
                            <TriangleAlert color='#ff9f40' size={120}/>
                        </View>
                        <View style={{alignItems: 'center', paddingHorizontal: 50, marginBottom: 20}}>
                            <CustomText style={{marginBottom: 20, color: theme.colors.onBackground}} variant='displayLargeBold'>{errorCode}</CustomText>
                            <CustomText variant='bodyLarge'>{errorMessage}</CustomText>
                        </View>
                        <View style={{marginBottom: 30, paddingHorizontal: 50}}>
                            <CustomText style={{color: theme.colors.primary}} variant='bodyLargeBold'>{sapErrorMessage}</CustomText>
                        </View>
                        <HelpStrip/>
                        <View style={{marginTop: 20}}>
                            {   
                                (!fromAuth) &&
                                    <Button 
                                        mode='contained-tonal'
                                        onPress={() => {
                                            if (sapErrorMessage.includes('(splash screen timed out)')){
                                                authModule.onLogOut();
                                                return;
                                            }

                                            screenFlowModule.onGoBack();
                                        }}
                                    >
                                            Go back
                                    </Button>
                            }
                            {
                                (fromAuth) &&
                                    <Button 
                                        mode='contained-tonal'
                                        onPress={() => {
                                            if (hasPin){
                                                screenFlowModule.onNavigateToScreen('LocalAuthScreen');
                                            }
                                            else {
                                                screenFlowModule.onNavigateToScreen('LoginScreen');
                                            }
                                        }}
                                    >
                                        {
                                            (hasPin) ? 'Pin Page' : 'Login Page'
                                        }
                                    </Button>
                            }
                        </View>
                    </View>
            }
            {
                (errorCode && (errorCode >= 400 && errorCode < 500)) && 
                    <View style={{flex: 1, alignItems: 'center'}}>
                        <View style={{height: 150, marginTop: 50}}>
                            <TriangleAlert color='#ff9f40' size={120}/>
                        </View>
                        <View style={{alignItems: 'center', paddingHorizontal: 50, marginBottom: 20}}>
                            <CustomText style={{marginBottom: 20, color: theme.colors.onBackground}} variant='displayLargeBold'>{errorCode}</CustomText>
                            <CustomText variant='bodyLarge'>{errorMessage}</CustomText>
                        </View>
                        <HelpStrip/>
                        <View style={{marginTop: 20}}>
                            {
                                (!fromAuth) &&
                                    <Button 
                                        mode='contained-tonal'
                                        onPress={() => {
                                            screenFlowModule.onGoBack();
                                        }}
                                    >
                                            Go back
                                    </Button>
                            }
                            {
                                (fromAuth) &&
                                    <Button 
                                        mode='contained-tonal'
                                        onPress={() => {
                                            if (hasPin){
                                                screenFlowModule.onNavigateToScreen('LocalAuthScreen');
                                            }
                                            else {
                                                screenFlowModule.onNavigateToScreen('LoginScreen');
                                            }
                                        }}
                                    >
                                        {
                                            (hasPin) ? 'Pin Page' : 'Login Page'
                                        }
                                    </Button>
                            }
                        </View>
                    </View>
            }
            {
                (errorCode && (errorCode >= 500 && errorCode < 602)) && 
                    <View style={{flex: 1, alignItems: 'center'}}>
                        <View style={{height: 150, marginTop: 50}}>
                            <CloudAlert color={theme.colors.primary} size={120}/>
                        </View>
                        <View style={{alignItems: 'center', paddingHorizontal: 50, marginBottom: 20}}>
                            {
                                (errorCode < 601) &&
                                <CustomText style={{marginBottom: 20, color: theme.colors.onBackground}} variant='displayLargeBold'>{errorCode}</CustomText>
                            }
                            <CustomText variant='bodyLarge'>{errorMessage}</CustomText>
                        </View>
                        <HelpStrip/>
                        <View style={{marginTop: 20}}>
                            {
                                (!fromAuth) &&
                                    <Button 
                                        mode='contained-tonal'
                                        onPress={() => {
                                            screenFlowModule.onGoBack();
                                        }}
                                    >
                                            Go back
                                    </Button>
                            }
                            {
                                (fromAuth) &&
                                    <Button 
                                        mode='contained-tonal'
                                        onPress={() => {
                                            if (hasPin){
                                                screenFlowModule.onNavigateToScreen('LocalAuthScreen');
                                            }
                                            else {
                                                screenFlowModule.onNavigateToScreen('LoginScreen');
                                            }
                                        }}
                                    >
                                        {
                                            (hasPin) ? 'Pin Page' : 'Login Page'
                                        }
                                    </Button>
                            }
                        </View>
                    </View>
            }
        </View>
    )
}

export default ErrorPage;