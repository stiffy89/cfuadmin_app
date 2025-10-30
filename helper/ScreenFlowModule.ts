import { NavType, RootStackScreenKeys, RootStackParamList } from '../types/AppTypes';
import {NavigationContainerRefWithCurrent} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { useSecurityContext } from './SecurityContext';

import { useAppContext } from './AppContext';

export class ScreenFlowModule {
    
    private navigator: NavigationContainerRefWithCurrent<RootStackParamList> | null = null;

    onInitRootNavigator(navigator: NavigationContainerRefWithCurrent<RootStackParamList>) {
        this.navigator = navigator;
    }

    onGoBack () {
        if (this.navigator?.canGoBack()){
            this.navigator?.goBack();
        }
    }

    onNavigateToScreen (screen : any, data? : any) {
        console.log(data);
       
        if (this.navigator?.isReady()){
            switch (screen) {
                case 'LoginScreen' :
                    this.navigator?.navigate('LoginScreen');
                    break;

                case 'Resources' : 
                    this.navigator?.navigate('Resources');
                    break;

                case 'EditScreen' :
                    this.navigator?.navigate(
                        'EditScreen',
                        data
                    );
                    break;

                case 'HomeScreen' :
                    this.navigator?.navigate(
                        'MainTabs', 
                        {
                            screen: 'HomeScreen'
                        }
                    );
                    break;

                case 'ContactScreen' :
                    this.navigator?.navigate(
                        'MainTabs', 
                        {
                            screen: 'ContactsScreen',
                            params: {
                                screen : 'ContactsMain',
                                params : {
                                    screen : 'ContactsMyUnit'
                                }
                            }
                        }
                    );
                    break;

                case 'MyUnitContactDetail' :
                    this.navigator?.navigate(
                        'MainTabs', 
                        {
                            screen: 'ContactsScreen',
                            params: {
                                screen : 'MyUnitContactDetail',
                                params : data
                            }
                        }
                    );
                    break;

                case 'CfuPhonebookContactsList' :
                    this.navigator?.navigate(
                        'MainTabs', 
                        {
                            screen: 'ContactsScreen',
                            params: {
                                screen : 'CfuPhonebookContactsList',
                                params : data
                            }
                        }
                    );
                    break;

                case 'CfuPhonebookContactDetail' :
                    this.navigator?.navigate(
                        'MainTabs', 
                        {
                            screen: 'ContactsScreen',
                            params: {
                                screen : 'CfuPhonebookContactDetail',
                                params : data
                            }
                        }
                    );
                    break;

                case 'ProfileScreen':
                    this.navigator?.navigate(
                        'MainTabs', 
                        {
                            screen: 'MyProfileScreen',
                            params: {
                                screen: 'ProfileScreen'
                            }
                        }
                    );
                    break;
                
                case 'MyDetailsScreen':
                    this.navigator?.navigate(
                        'MainTabs', 
                        {
                            screen: 'MyProfileScreen',
                            params: {
                                screen: 'MyDetailsScreen',
                                params: data
                            }
                        }
                    );
                    break;

                case 'ContactDetailsScreen':
                    this.navigator?.navigate(
                        'MainTabs', 
                        {
                            screen: 'MyProfileScreen',
                            params: {
                                screen: 'ContactDetailsScreen',
                                params: data
                            }
                        }
                    );
                    break;

                case 'EmergencyContactsScreen':
                    this.navigator?.navigate(
                        'MainTabs', 
                        {
                            screen: 'MyProfileScreen',
                            params: {
                                screen: 'EmergencyContactsScreen',
                                params: data
                            }
                        }
                    );
                    break;

                case 'MyUnitDetailsScreen':
                    this.navigator?.navigate(
                        'MainTabs', 
                        {
                            screen: 'MyProfileScreen',
                            params: {
                                screen: 'MyUnitDetailsScreen',
                                params: data
                            }
                        }
                    );
                    break;

                case 'TrainingHistoryScreen':
                    this.navigator?.navigate(
                        'MainTabs', 
                        {
                            screen: 'MyProfileScreen',
                            params: {
                                screen: 'TrainingHistoryScreen',
                                params: data
                            }
                        }
                    );
                    break;

                case 'TrainingDetailScreen':
                    this.navigator?.navigate(
                        'MainTabs', 
                        {
                            screen: 'MyProfileScreen',
                            params: {
                                screen: 'TrainingDetailsScreen',
                                params: data
                            }
                        }
                    );
                    break;

                case 'MembershipDetailsScreen':
                    this.navigator?.navigate(
                        'MainTabs', 
                        {
                            screen: 'MyProfileScreen',
                            params: {
                                screen: 'MembershipDetailsScreen',
                                params: data
                            }
                        }
                    );
                    break;

                case 'UniformDetailsScreen':
                    this.navigator?.navigate(
                        'MainTabs', 
                        {
                            screen: 'MyProfileScreen',
                            params: {
                                screen: 'UniformDetailsScreen',
                                params: data
                            }
                        }
                    );
                    break;

                case 'MedalsAndAwardsScreen':
                    this.navigator?.navigate(
                        'MainTabs', 
                        {
                            screen: 'MyProfileScreen',
                            params: {
                                screen: 'MedalsAndAwardsScreen',
                                params: data
                            }
                        }
                    );
                    break;

                case 'ResourceList':
                    this.navigator?.navigate(
                      'MainTabs', 
                      {
                          screen: 'Resources',
                          params: {
                            screen: 'ResourceList',
                            params: data,
                          }
                      }
                    );
                    break;
                
                case 'FormPage':
                    this.navigator?.navigate(
                      'MainTabs', 
                      {
                          screen: 'FormService',
                          params: {
                            screen: 'FormPage',
                            params: data,
                          }
                      }
                    );
                    break;
            }
        }
    }

    getScreenState () {
        return this.navigator?.getCurrentRoute();
    }

    //on app wake
    async onAppWake() {
        const {authType, setAuthType} = useSecurityContext();

        //just for debugging purposes
        const {setLastAppState} = useAppContext();
        setLastAppState('active');

        //check to see if we have installation id
        const installationId = await AsyncStorage.getItem('installation_id');

        if (!installationId){

            //create an installation id and save it to the device
            const newInstallationID = Crypto.randomUUID(); //create a new ID
            await AsyncStorage.setItem('installation_id', newInstallationID)

            if (authType !== 'okta'){
                setAuthType('okta')
            }

            if (this.navigator?.isReady()){
                if (this.navigator?.getCurrentRoute()?.name !== 'LoginScreen'){
                    this.navigator?.navigate('LoginScreen');
                }
            }
        }
        else {
            //local auth
            if (authType !== 'local'){
                setAuthType('local')
            }

            if (this.navigator?.isReady()){
                if (this.navigator?.getCurrentRoute()?.name !== 'LoginScreen'){
                    this.navigator?.navigate('LoginScreen');
                }
            }
        }
    }

    onNavigateToHome() {
        if (this.navigator?.isReady()){
            if (this.navigator?.getCurrentRoute()?.name !== 'HomeScreen'){
                this.navigator?.navigate('MainTabs', {screen: 'HomeScreen'});
            }
        }
    }

    //on app sleep
    onAppSleep() {
         //just for debugging purposes
        const {setLastAppState} = useAppContext();
        setLastAppState('background');

        const currentTime = (new Date()).toISOString();
        AsyncStorage.setItem('last_active', currentTime);
    }

    //clear the stored timestamp of the last time it was logged in
    async onLogout () : Promise<boolean>{
        try {
            await AsyncStorage.removeItem('last_active');
            return true;
        } 
        catch (error) {
            this.onHandleError(error);
            return false;
        }
    }

    //handle error
    onHandleError (error : any) {
        console.log('Screen flow module error : ', error);
    }

}

export const screenFlowModule = new ScreenFlowModule();