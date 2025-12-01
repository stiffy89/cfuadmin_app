//auth module that handles okta login, local auth and other auth related things
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';

import { screenFlowModule } from './ScreenFlowModule';

//types
import { OktaLoginResult, TokenError } from '../types/AppTypes';


export class AuthModule {

    isAuthenticating : boolean = false;

    async onFRNSWLogin () : Promise<OktaLoginResult> {
        this.isAuthenticating = true;

        //to ensure close login widget
        WebBrowser.maybeCompleteAuthSession();

        //let redirectURI = (Constants.executionEnvironment == 'standalone' || Constants.executionEnvironment == 'bare') ? Platform.OS == "android" ?  AuthSession.makeRedirectUri({path: "redirect"}) : 'com.ernox.login://callback' : AuthSession.makeRedirectUri({ preferLocalhost: true });
        let redirectURI = 'com.cfu.cfuadminapplication://callback';
        //configuration
        const oktaConfig = {
            //ypur application id from okta
            clientId: "0oarhcna0itjMMgM05d7",
            //yout domain from okta
            domain: "https://identitytest.fire.nsw.gov.au",
            // yout domain + /oauth2/default
            issuerUrl: "https://identitytest.fire.nsw.gov.au/oauth2/ausrh74y6aiPNqEaG5d7",
            //callback configured in okta signin url
            redirectUri: redirectURI,
        };

        const discovery = await AuthSession.fetchDiscoveryAsync(oktaConfig.issuerUrl);

        if (!discovery) {
            this.isAuthenticating = false;
            throw new Error('Discovery document not loaded yet');
        }

        try {
            //no need to state - expo will generate a state for us
            const request = new AuthSession.AuthRequest({
                clientId: oktaConfig.clientId,
                redirectUri: oktaConfig.redirectUri,
                scopes: ["openid"],
                responseType: 'code',
                usePKCE: true, //<-- because we are using PKCE, expo-auth-session will generate the code_challenge for us automatically and code_verifier
                prompt: AuthSession.Prompt.Login //<-- this will use existing session, otherwise users will need to log in everytime
            });

            const requestState = request.state;
            const result = await request.promptAsync(discovery);

            //AuthSessionResult returns an error
            if (result.type !== 'success') {
                this.isAuthenticating = false;
                throw new Error('Auth session error');
            }

            const { state, code } = result.params;

            if (state !== requestState) {
                this.isAuthenticating = false;
                throw new Error('Auth session - state miss match');
            }

            const tokenRequestParams = {
                code,
                clientId: oktaConfig.clientId,
                redirectUri: oktaConfig.redirectUri,
                extraParams: {
                    code_verifier: String(request?.codeVerifier),
                }
            };

            const tokenResult = await AuthSession.exchangeCodeAsync(
                tokenRequestParams,
                discovery
            );

            this.isAuthenticating = false;

            return {
                response: tokenResult
            }

        } catch (error: any) {
            this.isAuthenticating = false;
            throw error;
        }
    }

    async onPinLogin(pin: string): Promise<boolean> {
        this.isAuthenticating = true;
        //check to see if our pin matches
        const hashedPin = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, pin);
        const storedPin = await SecureStore.getItemAsync('pin');
        this.isAuthenticating = false;
        return (storedPin === hashedPin);
    }

    async onLocalAuthLogin(): Promise<boolean> {
        this.isAuthenticating = true;
        const localAuthResult = await LocalAuthentication.authenticateAsync({
            promptMessage: 'Authenticate to continue in CFU App',
            cancelLabel: 'Cancel',
            disableDeviceFallback: false
        });

        this.isAuthenticating = false;
        return localAuthResult.success;
    }

    async onSetLocalPin(pin: string) {
        //saving the pin
        const hashedPin = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, pin);

        try {
            SecureStore.setItemAsync('pin', hashedPin);
        }
        catch (error) {
            throw error;
        }
    }

    async onClearAllDeviceTokens() {
        try {
            await Promise.all([
                await AsyncStorage.removeItem('installation-id'),
                await AsyncStorage.setItem('last-active', ''),
                await SecureStore.deleteItemAsync('pin'),
                await SecureStore.deleteItemAsync('access-token'),
                await SecureStore.deleteItemAsync('refresh-token')
            ])
        } 
        catch (error) {
            throw error;
        }
    }

    async onLogOut() {
        try {
            await this.onClearAllDeviceTokens();
            const RCTNetworking = require('react-native/Libraries/Network/RCTNetworking').default; 
            RCTNetworking.clearCookies((result : any) => {
                console.log('cookies cleared');
                screenFlowModule.onNavigateToScreen('LoginScreen');
            });
        }
        catch (error : any) {
            const errorObj = {
                isAxiosError : false,
                message : 'Token deletion error : (' + error.name + " " + error.message + ")"
            }

            screenFlowModule.onNavigateToScreen('ErrorPage', errorObj);
        }
    }
}

export const authModule = new AuthModule();

