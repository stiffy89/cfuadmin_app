import { NavType, RootStackParamList } from '../types/AppTypes';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { useSecurityContext } from './SecurityContext';
import { ScreenState } from '../types/AppTypes';
import { RootStackScreenKeys } from '../types/AppTypes';

import { useAppContext } from './AppContext';

export class ScreenFlowModule {
    
    private navigator: NavType | null = null;

    //on init
    onInit(navigator: NavType) {
        this.navigator = navigator;
    }

    onNavigateToScreen (screen : RootStackScreenKeys) {
        if (this.navigator?.isReady()){
            this.navigator?.navigate(screen);
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
                this.navigator?.navigate('HomeScreen');
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