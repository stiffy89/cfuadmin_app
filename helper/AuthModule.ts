//auth module that handles okta login, local auth and other auth related things
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import * as WebBrowser from "expo-web-browser";
import Constants from "expo-constants";
import * as AuthSession from "expo-auth-session";
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';

import { screenFlowModule } from './ScreenFlowModule';

//types
import { OktaLoginResult, TokenError } from '../types/AppTypes';


export class AuthModule {

    isAuthenticating : boolean = false;

    //okta, local, pin login methods
    async onOktaLogin(): Promise<OktaLoginResult> {

        this.isAuthenticating = true;

        //to ensure close login widget
        WebBrowser.maybeCompleteAuthSession();

        //redirect uri is either what our scheme is if its a build or whatever the expo url is if testing in expo go
        // the redirect uri from the scheme will not be used when we're testing in expo go env
        // once we move this to a standalone build, we will use the 'native : <scheme url>' as explained here https://docs.expo.dev/versions/latest/sdk/auth-session/#authsessionredirecturioptions
        // the prebuild means our environment is 'bare' so we need to cater for it aswell
        let redirectURI = (Constants.executionEnvironment == 'standalone' || Constants.executionEnvironment == 'bare') ? Platform.OS == "android" ?  AuthSession.makeRedirectUri({path: "redirect"}) : 'com.ernox.login://callback' : AuthSession.makeRedirectUri({ preferLocalhost: true });

        //configuration
        const oktaConfig = {
            //ypur application id from okta
            clientId: "0oatd4xccfgbbP7uj697",
            //yout domain from okta
            domain: "https://integrator-3260158.okta.com",
            // yout domain + /oauth2/default
            issuerUrl: "https://integrator-3260158.okta.com/oauth2/default",
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
            this.onHandleAuthError(error);
        }
    }

    async onSaveSecureKeys(key: string, value: string) {
        try {
            SecureStore.setItemAsync(key, value)
        }
        catch (error: any) {
            throw error;
        }
    }

    async onGetAccessToken(): Promise<OktaLoginResult> {
        this.isAuthenticating = true;
        let redirectURI = (Constants.executionEnvironment == 'standalone') ? 'com.ernox.login://callback' : AuthSession.makeRedirectUri({ preferLocalhost: true });

        //configuration
        const oktaConfig = {
            //ypur application id from okta
            clientId: "0oatd4xccfgbbP7uj697",
            //yout domain from okta
            domain: "https://integrator-3260158.okta.com",
            // yout domain + /oauth2/default
            issuerUrl: "https://integrator-3260158.okta.com",
            //callback configured in okta signin url
            redirectUri: redirectURI,
        };

        const discovery = await AuthSession.fetchDiscoveryAsync(oktaConfig.issuerUrl);

        if (!discovery) {
            this.isAuthenticating = false;
            throw new Error('Discovery document not loaded yet');
        }

        //read the refresh token value from the secure store
        try {
            const refreshToken = await SecureStore.getItemAsync('refresh_token');

            if (!refreshToken) {
                this.isAuthenticating = false;
                throw new Error('Refresh Token is empty')
            }

            const refreshResult = await AuthSession.refreshAsync(
                {
                    clientId: oktaConfig.clientId,
                    refreshToken: refreshToken,
                    scopes: ["openid", "profile", "email", "offline_access"],
                },
                discovery
            );

            this.isAuthenticating = false;
            return {
                response: refreshResult
            }

        }
        catch {
            this.isAuthenticating = false;
            throw new Error('Error in retrieving refresh token from SecureStore')
        }
    }

    async onClearAllDeviceTokens(): Promise<boolean> {

        //remove installation id, user info from async
        const tokenErrors: TokenError[] = [];

        const asyncStoreKeys = ['installation_id', 'user_information'];

        for (var i in asyncStoreKeys) {
            try {
                await AsyncStorage.removeItem(asyncStoreKeys[i])
            }
            catch (error) {
                tokenErrors.push({
                    [asyncStoreKeys[i]]: error as object
                })
            }
        }

        //all the keys to our secure store tokens
        const secureStoreKeys = ['pin', 'access_token', 'refresh_token', 'id_token'];

        for (var i in secureStoreKeys) {
            try {
                await SecureStore.deleteItemAsync(secureStoreKeys[i])
            }
            catch (error) {
                tokenErrors.push({
                    [secureStoreKeys[i]]: error as object
                })
            }
        }

        if (tokenErrors.length > 0) {
            this.onHandleAuthError('');
            return false;
        }

        return true;
    }

    async onClearAllDevTokens () {
        await AsyncStorage.clear();
    }

    async onLogOut(): Promise<boolean> {
        const screenLogout = await screenFlowModule.onLogout();

        if (screenLogout) {
            const clearedAllTokens = await this.onClearAllDeviceTokens();
            return clearedAllTokens;
        }
        else {
            return false;
        }
    }

    onHandleAuthError(errorMessage: any) {
        console.log(errorMessage)
    }
}

export const authModule = new AuthModule();

