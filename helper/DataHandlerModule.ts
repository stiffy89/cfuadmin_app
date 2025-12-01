//this module handles all our oData calls
import axios, { AxiosInstance, AxiosResponse, isAxiosError } from 'axios';
import { authModule } from './AuthModule';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import { batchGETResponse } from '../types/AppTypes';

class DataHandlerModule {

    private axiosInstance: AxiosInstance | null = null;
    private axiosSecurityInstance: AxiosInstance | null = null;
    private csrfToken: string | null = null;
    private authRefreshPromise: Promise<void> | null = null;
    private csrfRefreshPromise: Promise<void> | null = null;

    private useToken = false;

    private authType: string = 'Bearer';

    async init(): Promise<boolean> {
        this.axiosInstance = axios.create({
            baseURL: 'https://portaluat.fire.nsw.gov.au/sap/opu/odata/sap/'
        })

        this.axiosSecurityInstance = axios.create({
            baseURL: 'https://portalicmuat.fire.nsw.gov.au/mslm'
        })

        //clear cookies
        const RCTNetworking = require('react-native/Libraries/Network/RCTNetworking').default;
        RCTNetworking.clearCookies((result: any) => {
            console.log('Network cookies cleared');
        })

        return true;
    }

    oDataInstanceInitialised() {
        return (this.axiosInstance !== null)
    }

    securityInstanceInitialised() {
        return (this.axiosSecurityInstance !== null)
    }


    async getInitialTokens(idToken: string): Promise<AxiosResponse> {
        try {
            const queryParams = {
                grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange',
                client_id: '0oatd4xccfgbbP7uj697',    //-> Ernox okta client ID
                subject_token_type: 'id_token',
                subject_token: idToken
            }

            const sUrl = '/token?grant_type=urn:ietf:params:oauth:grant-type:token-exchange&client_id=0oatd4xccfgbbP7uj697&subject_token_type=id_token&subject_token=' + idToken;


            const response = await this.axiosSecurityInstance?.post(sUrl);

            if (!response) {
                throw new Error('get initial tokens error')
            }

            return response;
        }
        catch (error) {
            throw error;
        }
    }

    async getFRNSWInitialTokens(idToken: string): Promise<AxiosResponse> {
        try {
            const sUrl = '/token?grant_type=urn:ietf:params:oauth:grant-type:token-exchange&client_id=0oarhcna0itjMMgM05d7&subject_token_type=id_token&subject_token=' + idToken;

            const response = await this.axiosSecurityInstance?.post(sUrl);

            if (!response) {
                throw new Error('get initial tokens error')
            }

            return response;
        }
        catch (error) {
            throw error;
        }
    }

    async getRefreshedAccessToken(refreshToken: string): Promise<AxiosResponse> {
        try {
            const sUrl = '/token?client_id=CFU2APP&grant_type=refresh_token&refresh_token=' + refreshToken;

            const response = await this.axiosSecurityInstance?.post(sUrl);

            if (!response) {
                throw new Error('get initial tokens error')
            }

            return response;
        }
        catch (error) {
            throw error;
        }
    }

    batchBodyFormatter(action: string, urlPath: string, data: any) {
        const changeSet = 'changeset_' + Crypto.randomUUID();
        const batch = 'batch_' + Crypto.randomUUID();

        const dataStr = JSON.stringify(data);

        const batchBody = `--${batch}\nContent-Type: multipart/mixed; boundary=${changeSet}\n\n--${changeSet}\nContent-Type: application/http\nContent-Transfer-Encoding: binary\n\n${action} ${urlPath} HTTP/1.1\nsap-context-id-accept: header\nAccept: application/json\nAccept-Language: en-AU\nDataServiceVersion: 2.0\nMaxDataServiceVersion: 2.0\nContent-Type: application/json\nContent-Length: 10000\n\n${dataStr}\n\n--${changeSet}--\n--${batch}--`;

        const batchBodyObj = {
            'batch': batch,
            'batchBody': batchBody
        }

        return batchBodyObj;
    }

    getBatchBody(urlPath: string) {
        const batchBody = `Content-Type: application/http\nContent-Transfer-Encoding: binary\n\nGET ${urlPath} HTTP/1.1\nsap-cancel-on-close: true\nsap-contextid-accept:header\nAccept: application/json\nAccept-Language: en-AU\nDataServiceVersion: 2.0\nMaxDataServiceVersion: 2.0\n\n\n`;
        return batchBody;
    }

    formatGETResponse(raw: string) {
        const breaker = raw.split(/\r?\n/)[0] + '--';
        const arr = raw.split(/\r?\n|\r/);
        const index = arr.indexOf(breaker);
        const jsonRaw = arr[index - 1];
        return JSON.parse(jsonRaw);
    }

    formatMERGEResponse(raw: string) {
        try {
            const breaker = raw.split(/\r?\n/)[0] + '--';
            const arr = raw.split(/\r?\n|\r/);
            const index = arr.indexOf(breaker);
            const jsonRaw = arr[index - 1];
            return JSON.parse(jsonRaw);
        }
        catch (error) {
            return ''
        }
    }

    async getInitialUserData(): Promise<AxiosResponse> {
        try {
            const token = await SecureStore.getItemAsync('access-token');
            const authString = `${this.authType} ${token}`

            const response = await this.axiosInstance?.get('/Z_ESS_MSS_SRV/Users', {
                headers: {
                    'x-csrf-token': 'Fetch',
                    'Authorization': authString
                }
            })

            if (!response) {
                throw new Error('cannot get entity, no response')
            }

            //stores a fresh csrf token
            if (response.headers['x-csrf-token']) {
                await AsyncStorage.setItem('csrf-token', response.headers['x-csrf-token']);
            }

            return response;
        } catch (error) {
            throw error
        }
    }

    async fetchCsrfToken(): Promise<AxiosResponse> {
        //TODO need to fix this up eventually
        try {
            const token = await SecureStore.getItemAsync('access-token');
            const authString = `${this.authType} ${token}`
            const response = await this.axiosInstance?.get('/Z_ESS_MSS_SRV/Users', {
                headers: {
                    'x-csrf-token': 'Fetch',
                    'Authorization': authString
                }
            });

            if (response)
                return response;

            else
                throw new Error('no csrf token response')
        }
        catch (error) {
            throw error
        }
    }

    async batchSingleUpdate(urlPath: string, serviceName: string, data: any, passedAccessToken?: string): Promise<batchGETResponse> {
        if (this.authRefreshPromise){
            await this.authRefreshPromise;
        }
        
        if (this.csrfRefreshPromise){
            await this.csrfRefreshPromise;
        }

        const batchBodyObj = this.batchBodyFormatter('MERGE', urlPath, data);
        const batchBodyString = batchBodyObj.batchBody;
        const batchSeparator = batchBodyObj.batch;

        let csrfToken = await AsyncStorage.getItem('csrf-token');

        if (!csrfToken) {
            const csrfResponse = await this.fetchCsrfToken();
            const newCsrfToken = csrfResponse?.headers['x-csrf-token'];
            await AsyncStorage.setItem('csrf-token', newCsrfToken);
            csrfToken = newCsrfToken;
        }

        let token = await SecureStore.getItemAsync('access-token');
        const authString = `${this.authType} ${token}`

        try {
            //run the create call
            const postResponse = await this.axiosInstance?.post(serviceName + '/$batch',
                batchBodyString,
                {
                    headers: {
                        'Content-Type': `multipart/mixed; boundary=${batchSeparator}`,
                        'x-csrf-token': csrfToken,
                        'Authorization': authString
                    }
                }
            );

            if (!postResponse) {
                const newError = {
                    isAxiosError: false,
                    message: 'no response from UPDATE'
                }

                throw newError;
            }

            //format the response
            const jsonResponse = this.formatMERGEResponse(postResponse.data);

            if (jsonResponse.error) {
                const newError = {
                    isAxiosError: false,
                    message: 'SAP Error - ' + jsonResponse.error.message.value
                }

                throw newError;
            }

            return {
                entityName: '',
                responseBody: jsonResponse
            }
        }
        catch (error: any) {

            if (isAxiosError(error)) {
                const status = error.response?.status;
                if (status === 401) {
                    if (!this.authRefreshPromise) {
                        this.authRefreshPromise = (async () => {
                            console.log('Refreshing access token...');
                            let currentRefreshToken = await SecureStore.getItemAsync('refresh-token');

                            try {
                                const newAccessTokenResponse = await this.getRefreshedAccessToken(currentRefreshToken!);
                                await SecureStore.setItemAsync('access-token', newAccessTokenResponse.data.TOKEN_RESPONSE.ACCESS_TOKEN);
                            }
                            catch (error) {
                                //if refresh token is busted, get new refresh token
                                //check what the error looks like
                                const oktaLoginResponse = await authModule.onFRNSWLogin();
                                const oktaIDToken = oktaLoginResponse.response.idToken;
                                const initialTokenResponse = await this.getFRNSWInitialTokens(oktaIDToken!);
                                const newAccessToken = initialTokenResponse.data.TOKEN_RESPONSE.ACCESS_TOKEN;
                                const newRefreshToken = initialTokenResponse.data.TOKEN_RESPONSE.REFRESH_TOKEN;
                                await SecureStore.setItemAsync('access-token', newAccessToken);
                                await SecureStore.setItemAsync('refresh-token', newRefreshToken);
                            }

                            this.authRefreshPromise = null;
                        })().catch(error => {
                            this.authRefreshPromise = null;
                            throw error;
                        });
                    }

                    // Wait for the auth refresh to complete (even if another request started it)
                    await this.authRefreshPromise;

                    const newAccessToken = await SecureStore.getItemAsync('access-token');
                    const newAuthString = `${this.authType} ${newAccessToken}`

                    const retryAuthResponse = await this.axiosInstance?.post(serviceName + '/$batch',
                        batchBodyString,
                        {
                            headers: {
                                'Content-Type': `multipart/mixed; boundary=${batchSeparator}`,
                                'x-csrf-token': await AsyncStorage.getItem('csrf-token'),
                                'Authorization': newAuthString
                            }
                        }
                    );

                    if (!retryAuthResponse) {
                        throw new Error('no response from update');
                    }

                    const retryAuthJsonResponse = this.formatMERGEResponse(retryAuthResponse.data);

                    if (retryAuthJsonResponse.error) {
                        const newAuthError = {
                            isAxiosError: false,
                            message: 'SAP Error - ' + retryAuthJsonResponse.error.message.value
                        }

                        throw newAuthError;
                    }

                    return {
                        entityName: '',
                        responseBody: retryAuthJsonResponse
                    }
                }
                else if (status == 403) {
                    //try getting csrf token
                    if (!this.csrfRefreshPromise) {
                        this.csrfRefreshPromise = (async () => {
                            console.log('Refreshing CSRF token...');
                            const csrfResponse = await this.fetchCsrfToken();
                            const newCsrfToken = csrfResponse?.headers['x-csrf-token'];
                            if (!newCsrfToken) throw new Error('No CSRF token returned');

                            await AsyncStorage.setItem('csrf-token', newCsrfToken);
                            console.log('CSRF token refreshed.');
                            this.csrfRefreshPromise = null;
                        })().catch(err => {
                            this.csrfRefreshPromise = null;
                            throw err;
                        });
                    }

                    // Wait for the CSRF refresh to complete (even if another request started it)
                    await this.csrfRefreshPromise;

                    const retryCSRFResponse = await this.axiosInstance?.post(serviceName + '/$batch',
                        batchBodyString,
                        {
                            headers: {
                                'Content-Type': `multipart/mixed; boundary=${batchSeparator}`,
                                'x-csrf-token': await AsyncStorage.getItem('csrf-token'),
                                'Authorization': authString
                            }
                        }
                    );

                    if (!retryCSRFResponse) {
                        throw new Error('no response from update');
                    }

                    const retryCSRFJsonResponse = this.formatMERGEResponse(retryCSRFResponse.data);

                    if (retryCSRFJsonResponse.error) {
                        const newCSRFError = {
                            isAxiosError: false,
                            message: 'SAP Error - ' + retryCSRFJsonResponse.error.message.value
                        }

                        throw newCSRFError;
                    }

                    return {
                        entityName: '',
                        responseBody: retryCSRFJsonResponse
                    }
                }
            }

            throw error;
        }
    }

    async batchSingleDelete(urlPath: string, serviceName: string, passedAccessToken?: string): Promise<batchGETResponse> {

        if (this.authRefreshPromise){
            await this.authRefreshPromise;
        }
        
        if (this.csrfRefreshPromise){
            await this.csrfRefreshPromise;
        }

        const changeSet = 'changeset_' + Crypto.randomUUID();
        const batch = 'batch_' + Crypto.randomUUID();

        const batchBody = `--${batch}\nContent-Type: multipart/mixed; boundary=${changeSet}\n\n--${changeSet}\nContent-Type: application/http\nContent-Transfer-Encoding: binary\n\nDELETE ${urlPath} HTTP/1.1\nsap-context-id-accept: header\nAccept: application/json\nAccept-Language: en-AU\nDataServiceVersion: 2.0\nMaxDataServiceVersion: 2.0\n\n\n\n--${changeSet}--\n--${batch}--`;

        let csrfToken = await AsyncStorage.getItem('csrf-token');

        if (!csrfToken) {
            const csrfResponse = await this.fetchCsrfToken();
            const newCsrfToken = csrfResponse?.headers['x-csrf-token'];
            await AsyncStorage.setItem('csrf-token', newCsrfToken);
            csrfToken = newCsrfToken;
        }

        const token = await SecureStore.getItemAsync('access-token');
        const authString = `${this.authType} ${token}`

        try {
            //run the create call
            const postResponse = await this.axiosInstance?.post(serviceName + '/$batch',
                batchBody,
                {
                    headers: {
                        'Content-Type': `multipart/mixed; boundary=${batch}`,
                        'x-csrf-token': csrfToken,
                        'Authorization': authString
                    }
                }
            );

            if (!postResponse) {
                const newError = {
                    isAxiosError: false,
                    message: 'no response from DELETE'
                }

                throw newError;
            }

            //format the response
            const jsonResponse = this.formatMERGEResponse(postResponse.data);

            if (jsonResponse.error) {
                const newError = {
                    isAxiosError: false,
                    message: 'SAP Error - ' + jsonResponse.error.message.value
                }

                throw newError;
            }

            return {
                entityName: '',
                responseBody: jsonResponse
            }
        }
        catch (error: any) {
            if (isAxiosError(error)) {
                const status = error.response?.status;
                if (status === 401) {
                    if (!this.authRefreshPromise) {
                        this.authRefreshPromise = (async () => {
                            console.log('Refreshing access token...');
                            let currentRefreshToken = await SecureStore.getItemAsync('refresh-token');

                            try {
                                const newAccessTokenResponse = await this.getRefreshedAccessToken(currentRefreshToken!);
                                await SecureStore.setItemAsync('access-token', newAccessTokenResponse.data.TOKEN_RESPONSE.ACCESS_TOKEN);
                            }
                            catch (error) {
                                //if refresh token is busted, get new refresh token
                                //check what the error looks like
                                const oktaLoginResponse = await authModule.onFRNSWLogin();
                                const oktaIDToken = oktaLoginResponse.response.idToken;
                                const initialTokenResponse = await this.getFRNSWInitialTokens(oktaIDToken!);
                                const newAccessToken = initialTokenResponse.data.TOKEN_RESPONSE.ACCESS_TOKEN;
                                const newRefreshToken = initialTokenResponse.data.TOKEN_RESPONSE.REFRESH_TOKEN;
                                await SecureStore.setItemAsync('access-token', newAccessToken);
                                await SecureStore.setItemAsync('refresh-token', newRefreshToken);
                            }

                            this.authRefreshPromise = null;
                        })().catch(error => {
                            this.authRefreshPromise = null;
                            throw error;
                        });
                    }

                    // Wait for the auth refresh to complete (even if another request started it)
                    await this.authRefreshPromise;

                    const newAccessToken = await SecureStore.getItemAsync('access-token');
                    const newAuthString = `${this.authType} ${newAccessToken}`

                    const retryAuthResponse = await this.axiosInstance?.post(serviceName + '/$batch',
                        batchBody,
                        {
                            headers: {
                                'Content-Type': `multipart/mixed; boundary=${batch}`,
                                'x-csrf-token': csrfToken,
                                'Authorization': newAuthString
                            }
                        }
                    );

                    if (!retryAuthResponse) {
                        throw new Error('no response from update');
                    }

                    const retryAuthJsonResponse = this.formatMERGEResponse(retryAuthResponse.data);

                    if (retryAuthJsonResponse.error) {
                        const newAuthError = {
                            isAxiosError: false,
                            message: 'SAP Error - ' + retryAuthJsonResponse.error.message.value
                        }

                        throw newAuthError;
                    }

                    return {
                        entityName: '',
                        responseBody: retryAuthJsonResponse
                    }
                }
                else if (status == 403) {
                    //try getting csrf token
                    if (!this.csrfRefreshPromise) {
                        this.csrfRefreshPromise = (async () => {
                            console.log('Refreshing CSRF token...');
                            const csrfResponse = await this.fetchCsrfToken();
                            const newCsrfToken = csrfResponse?.headers['x-csrf-token'];
                            if (!newCsrfToken) throw new Error('No CSRF token returned');

                            await AsyncStorage.setItem('csrf-token', newCsrfToken);
                            console.log('CSRF token refreshed.');
                            this.csrfRefreshPromise = null;
                        })().catch(err => {
                            this.csrfRefreshPromise = null;
                            throw err;
                        });
                    }

                    // Wait for the CSRF refresh to complete (even if another request started it)
                    await this.csrfRefreshPromise;

                    const retryCSRFResponse = await this.axiosInstance?.post(serviceName + '/$batch',
                        batchBody,
                        {
                            headers: {
                                'Content-Type': `multipart/mixed; boundary=${batch}`,
                                'x-csrf-token': await AsyncStorage.getItem('csrf-token'),
                                'Authorization': authString
                            }
                        }
                    );

                    if (!retryCSRFResponse) {
                        throw new Error('no response from update');
                    }

                    const retryCSRFJsonResponse = this.formatMERGEResponse(retryCSRFResponse.data);

                    if (retryCSRFJsonResponse.error) {
                        const newCSRFError = {
                            isAxiosError: false,
                            message: 'SAP Error - ' + retryCSRFJsonResponse.error.message.value
                        }

                        throw newCSRFError;
                    }

                    return {
                        entityName: '',
                        responseBody: retryCSRFJsonResponse
                    }
                }
            }

            throw error;
        }
    }

    async batchGet(path: string, serviceName: string, entityName: string, passedAccessToken?: string, menuSet?: boolean): Promise<batchGETResponse> {
        
        if (this.authRefreshPromise){
            await this.authRefreshPromise;
        }

        //build the request body and post
        const batch = 'batch_' + Crypto.randomUUID();

        let batchString = `--${batch}\n` + this.getBatchBody(path) + `--${batch}--`;

        const token = await SecureStore.getItemAsync('access-token');
        const authString = `${this.authType} ${token}`;

        

        try {
            let header: any = {
                'Content-Type': `multipart/mixed; boundary=${batch}`,
                'Authorization': authString,
                'Cache-Control': 'no-cache, no-store, must-revalidate'
            }

            if (menuSet) {
                header['client-id'] = 'CFU2APP'
            }

            const postResponse = await this.axiosInstance?.post(serviceName + '/$batch',
                batchString,
                {
                    headers: header
                }
            );

            if (!postResponse) throw new Error('no response from update');

            //format the response
            const jsonResponse = this.formatGETResponse(postResponse.data);

            if (!jsonResponse) {
                const newError = {
                    isAxiosError: false,
                    message: 'cannot parse the malformed response body'
                }

                throw newError;
            }

            if (jsonResponse.error) {
                const newError = {
                    isAxiosError: false,
                    message: 'SAP Error - ' + jsonResponse.error.message.value
                }

                throw newError;
            }

            return {
                entityName: entityName,
                responseBody: jsonResponse
            }
        }
        catch (error) {
            if (isAxiosError(error)) {
                const status = error.response?.status;
                if (status === 401) {
                    if (!this.authRefreshPromise) {
                        this.authRefreshPromise = (async () => {
                            console.log('Refreshing access token...');
                            let currentRefreshToken = await SecureStore.getItemAsync('refresh-token');

                            try {
                                const newAccessTokenResponse = await this.getRefreshedAccessToken(currentRefreshToken!);
                                await SecureStore.setItemAsync('access-token', newAccessTokenResponse.data.TOKEN_RESPONSE.ACCESS_TOKEN);
                                await SecureStore.setItemAsync('refresh-token', newAccessTokenResponse.data.TOKEN_RESPONSE.REFRESH_TOKEN);
                            }
                            catch (error) {
                                //if refresh token is busted, get new refresh token
                                //check what the error looks like
                                const oktaLoginResponse = await authModule.onFRNSWLogin();
                                const oktaIDToken = oktaLoginResponse.response.idToken;
                                const initialTokenResponse = await this.getFRNSWInitialTokens(oktaIDToken!);
                                const newAccessToken = initialTokenResponse.data.TOKEN_RESPONSE.ACCESS_TOKEN;
                                const newRefreshToken = initialTokenResponse.data.TOKEN_RESPONSE.REFRESH_TOKEN;
                                await SecureStore.setItemAsync('access-token', newAccessToken);
                                await SecureStore.setItemAsync('refresh-token', newRefreshToken);
                            }

                            this.authRefreshPromise = null;
                        })().catch(error => {
                            this.authRefreshPromise = null;
                            throw error;
                        });
                    }

                    // Wait for the auth refresh to complete (even if another request started it)
                    await this.authRefreshPromise;

                    const newAccessToken = await SecureStore.getItemAsync('access-token');
                    const newAuthString = `${this.authType} ${newAccessToken}`

                    const retryAuthResponse = await this.axiosInstance?.post(serviceName + '/$batch',
                        batchString,
                        {
                            headers: {
                                'Content-Type': `multipart/mixed; boundary=${batch}`,
                                'Authorization': newAuthString
                            }
                        }
                    );

                    if (!retryAuthResponse) {
                        throw new Error('no response from update');
                    }

                    const retryAuthJsonResponse = this.formatMERGEResponse(retryAuthResponse.data);

                    if (retryAuthJsonResponse.error) {
                        const newAuthError = {
                            isAxiosError: false,
                            message: 'SAP Error - ' + retryAuthJsonResponse.error.message.value
                        }

                        throw newAuthError;
                    }

                    return {
                        entityName: '',
                        responseBody: retryAuthJsonResponse
                    }
                }
            }

            throw error;
        }
    }

    async getPDFResource(url: string): Promise<AxiosResponse> {
        try {

            const token = await SecureStore.getItemAsync('access-token');
            const authString = `${this.authType} ${token}`

            const response = await this.axiosInstance?.get(url, {
                headers: {
                    Authorization: authString,
                },
                responseType: "arraybuffer"
            })

            if (!response) {
                throw new Error('cannot get entity, no response')
            }

            return response;

        } catch (error) {
            throw error
        }
    }

    async getResource(path: string, fileType: string): Promise<AxiosResponse> {
        if (this.authRefreshPromise){
            await this.authRefreshPromise;
        }

        const encodedPathURI = encodeURIComponent(path);
        const encodedFileType = encodeURIComponent(fileType);

        const filters = `Url='${encodedPathURI}',FileType='${encodedFileType}'`;
        const odataServiceUrl = `/Z_CFU_DOCUMENTS_SRV/FileExports(${filters})/$value`;
        const token = await SecureStore.getItemAsync('access_token');
        const authString = `${this.authType} ${token}`
        try {
            const response = await this.axiosInstance?.get(odataServiceUrl, {
                headers: {
                    Authorization: authString,
                },
                responseType: fileType == "application/pdf" ? "arraybuffer" : "json",
            })

            if (!response) {
                throw new Error('cannot get entity, no response')
            }


            return response;
        } catch (error) {
            if (isAxiosError(error)) {
                const status = error.response?.status;
                if (status === 401) {
                    if (!this.authRefreshPromise) {
                        this.authRefreshPromise = (async () => {
                            console.log('Refreshing access token...');
                            let currentRefreshToken = await SecureStore.getItemAsync('refresh-token');

                            try {
                                const newAccessTokenResponse = await this.getRefreshedAccessToken(currentRefreshToken!);
                                await SecureStore.setItemAsync('access-token', newAccessTokenResponse.data.TOKEN_RESPONSE.ACCESS_TOKEN);
                                await SecureStore.setItemAsync('refresh-token', newAccessTokenResponse.data.TOKEN_RESPONSE.REFRESH_TOKEN);
                            }
                            catch (error) {
                                //if refresh token is busted, get new refresh token
                                //check what the error looks like
                                const oktaLoginResponse = await authModule.onFRNSWLogin();
                                const oktaIDToken = oktaLoginResponse.response.idToken;
                                const initialTokenResponse = await this.getFRNSWInitialTokens(oktaIDToken!);
                                const newAccessToken = initialTokenResponse.data.TOKEN_RESPONSE.ACCESS_TOKEN;
                                const newRefreshToken = initialTokenResponse.data.TOKEN_RESPONSE.REFRESH_TOKEN;
                                await SecureStore.setItemAsync('access-token', newAccessToken);
                                await SecureStore.setItemAsync('refresh-token', newRefreshToken);
                            }

                            this.authRefreshPromise = null;
                        })().catch(error => {
                            this.authRefreshPromise = null;
                            throw error;
                        });
                    }

                    // Wait for the auth refresh to complete (even if another request started it)
                    await this.authRefreshPromise;

                    const newAccessToken = await SecureStore.getItemAsync('access-token');
                    const newAuthString = `${this.authType} ${newAccessToken}`

                    const retryAuthResponse = await this.axiosInstance?.get(odataServiceUrl, {
                        headers: {
                            Authorization: newAuthString,
                        },
                        responseType: fileType == "application/pdf" ? "arraybuffer" : "json",
                    })

                    if (!retryAuthResponse) {
                        throw new Error('no response from update');
                    }

                    return retryAuthResponse
                }
            }
            throw error
        }
    }

    async getFormsLauncherSet(formLaunchId: string): Promise<AxiosResponse> {
        if (this.authRefreshPromise){
            await this.authRefreshPromise;
        }

        const encodedFormLaunchId = encodeURIComponent(formLaunchId);

        const filters = `FormLaunchId='${encodedFormLaunchId}'`;
        const odataServiceUrl = `/Z_MOB2_SRV/FormsLauncherSet(${filters})`;

        const token = await SecureStore.getItemAsync('access_token');
        const authString = `${this.authType} ${token}`
        try {
            const response = await this.axiosInstance?.get(odataServiceUrl, {
                headers: {
                    Authorization: authString,
                },
            })

            if (!response) {
                throw new Error('cannot get entity, no response')
            }


            return response;
        } catch (error) {
            if (isAxiosError(error)) {
                const status = error.response?.status;
                if (status === 401) {
                    if (!this.authRefreshPromise) {
                        this.authRefreshPromise = (async () => {
                            console.log('Refreshing access token...');
                            let currentRefreshToken = await SecureStore.getItemAsync('refresh-token');

                            try {
                                const newAccessTokenResponse = await this.getRefreshedAccessToken(currentRefreshToken!);
                                await SecureStore.setItemAsync('access-token', newAccessTokenResponse.data.TOKEN_RESPONSE.ACCESS_TOKEN);
                                await SecureStore.setItemAsync('refresh-token', newAccessTokenResponse.data.TOKEN_RESPONSE.REFRESH_TOKEN);
                            }
                            catch (error) {
                                //if refresh token is busted, get new refresh token
                                //check what the error looks like
                                const oktaLoginResponse = await authModule.onFRNSWLogin();
                                const oktaIDToken = oktaLoginResponse.response.idToken;
                                const initialTokenResponse = await this.getFRNSWInitialTokens(oktaIDToken!);
                                const newAccessToken = initialTokenResponse.data.TOKEN_RESPONSE.ACCESS_TOKEN;
                                const newRefreshToken = initialTokenResponse.data.TOKEN_RESPONSE.REFRESH_TOKEN;
                                await SecureStore.setItemAsync('access-token', newAccessToken);
                                await SecureStore.setItemAsync('refresh-token', newRefreshToken);
                            }

                            this.authRefreshPromise = null;
                        })().catch(error => {
                            this.authRefreshPromise = null;
                            throw error;
                        });
                    }

                    // Wait for the auth refresh to complete (even if another request started it)
                    await this.authRefreshPromise;

                    const newAccessToken = await SecureStore.getItemAsync('access-token');
                    const newAuthString = `${this.authType} ${newAccessToken}`

                    const retryAuthResponse = await this.axiosInstance?.get(odataServiceUrl, {
                        headers: {
                            Authorization: newAuthString,
                        },
                    })

                    if (!retryAuthResponse) {
                        throw new Error('no response from update');
                    }

                    return retryAuthResponse
                }
            }
            throw error
        }
    }

    async postFeedbackSet(rating: string, comment: string): Promise<AxiosResponse> {
        if (this.authRefreshPromise){
            await this.authRefreshPromise;
        }

        if(this.csrfRefreshPromise){
            await this.csrfRefreshPromise;
        }

        const odataServiceUrl = `/Z_MOB2_SRV/FeedbackSet`;

        const postBody = {
            "FeedbackText": comment,
            "FeedbackRating": rating
        }

        let csrfToken = await AsyncStorage.getItem('csrf-token');
        if (!csrfToken) {
            const csrfResponse = await this.fetchCsrfToken();
            const newCsrfToken = csrfResponse?.headers['x-csrf-token'];
            await AsyncStorage.setItem('csrf-token', newCsrfToken);
            csrfToken = newCsrfToken;
        }

        const token = await SecureStore.getItemAsync('access_token');
        const authString = `${this.authType} ${token}`

        try {           
            const response = await this.axiosInstance?.post(odataServiceUrl, postBody, {
                headers: {
                    "x-csrf-token": csrfToken,
                    "Authorization": authString,
                    "Content-Type": "application/json"
                },
            })

            if (!response) {
                throw new Error('cannot get entity, no response')
            }

            return response;
        } catch (error) {
            if (isAxiosError(error)) {
                const status = error.response?.status;
                if (status === 401) {
                    if (!this.authRefreshPromise) {
                        this.authRefreshPromise = (async () => {
                            console.log('Refreshing access token...');
                            let currentRefreshToken = await SecureStore.getItemAsync('refresh-token');

                            try {
                                const newAccessTokenResponse = await this.getRefreshedAccessToken(currentRefreshToken!);
                                await SecureStore.setItemAsync('access-token', newAccessTokenResponse.data.TOKEN_RESPONSE.ACCESS_TOKEN);
                                await SecureStore.setItemAsync('refresh-token', newAccessTokenResponse.data.TOKEN_RESPONSE.REFRESH_TOKEN);
                            }
                            catch (error) {
                                //if refresh token is busted, get new refresh token
                                //check what the error looks like
                                const oktaLoginResponse = await authModule.onFRNSWLogin();
                                const oktaIDToken = oktaLoginResponse.response.idToken;
                                const initialTokenResponse = await this.getFRNSWInitialTokens(oktaIDToken!);
                                const newAccessToken = initialTokenResponse.data.TOKEN_RESPONSE.ACCESS_TOKEN;
                                const newRefreshToken = initialTokenResponse.data.TOKEN_RESPONSE.REFRESH_TOKEN;
                                await SecureStore.setItemAsync('access-token', newAccessToken);
                                await SecureStore.setItemAsync('refresh-token', newRefreshToken);
                            }

                            this.authRefreshPromise = null;
                        })().catch(error => {
                            this.authRefreshPromise = null;
                            throw error;
                        });
                    }

                    // Wait for the auth refresh to complete (even if another request started it)
                    await this.authRefreshPromise;

                    const newAccessToken = await SecureStore.getItemAsync('access-token');
                    const newAuthString = `${this.authType} ${newAccessToken}`

                    const retryAuthResponse = await this.axiosInstance?.post(odataServiceUrl, postBody, {
                        headers: {
                            "x-csrf-token": csrfToken,
                            "Authorization": newAuthString,
                            "Content-Type": "application/json"
                        },
                    })

                    if (!retryAuthResponse) {
                        throw new Error('no response from update');
                    }

                    return retryAuthResponse
                }
                else if (status == 403) {
                    //try getting csrf token
                    if (!this.csrfRefreshPromise) {
                        this.csrfRefreshPromise = (async () => {
                            console.log('Refreshing CSRF token...');
                            const csrfResponse = await this.fetchCsrfToken();
                            const newCsrfToken = csrfResponse?.headers['x-csrf-token'];
                            if (!newCsrfToken) throw new Error('No CSRF token returned');

                            await AsyncStorage.setItem('csrf-token', newCsrfToken);
                            console.log('CSRF token refreshed.');
                            this.csrfRefreshPromise = null;
                        })().catch(err => {
                            this.csrfRefreshPromise = null;
                            throw err;
                        });
                    }

                    // Wait for the CSRF refresh to complete (even if another request started it)
                    await this.csrfRefreshPromise;

                    const retryCSRFResponse = await this.axiosInstance?.post(odataServiceUrl, postBody, {
                        headers: {
                            "x-csrf-token": csrfToken,
                            "Authorization": await AsyncStorage.getItem('csrf-token'),
                            "Content-Type": "application/json"
                        },
                    })

                    if (!retryCSRFResponse) {
                        throw new Error('no response from update');
                    }

                    return retryCSRFResponse
                }
            }
            throw error
        }
    }

    async getIdCardPhoto(pernr: string): Promise<AxiosResponse> {
        if (this.authRefreshPromise){
            await this.authRefreshPromise;
        }

        const encodedPernr = encodeURIComponent(pernr);

        const filters = `'${encodedPernr}'`;
        const odataServiceUrl = `/Z_MOB2_SRV/IdCardPhotoSet(${filters})/$value`;

        const token = await SecureStore.getItemAsync('access_token');
        const authString = `${this.authType} ${token}`
        try {
            const response = await this.axiosInstance?.get(odataServiceUrl, {
                headers: {
                    Authorization: authString,
                },
                responseType: "arraybuffer"
            })

            if (!response) {
                throw new Error('cannot get entity, no response')
            }

            return response;
        } catch (error) {
            if (isAxiosError(error)) {
                const status = error.response?.status;
                if (status === 401) {
                    if (!this.authRefreshPromise) {
                        this.authRefreshPromise = (async () => {
                            console.log('Refreshing access token...');
                            let currentRefreshToken = await SecureStore.getItemAsync('refresh-token');

                            try {
                                const newAccessTokenResponse = await this.getRefreshedAccessToken(currentRefreshToken!);
                                await SecureStore.setItemAsync('access-token', newAccessTokenResponse.data.TOKEN_RESPONSE.ACCESS_TOKEN);
                                await SecureStore.setItemAsync('refresh-token', newAccessTokenResponse.data.TOKEN_RESPONSE.REFRESH_TOKEN);
                            }
                            catch (error) {
                                //if refresh token is busted, get new refresh token
                                //check what the error looks like
                                const oktaLoginResponse = await authModule.onFRNSWLogin();
                                const oktaIDToken = oktaLoginResponse.response.idToken;
                                const initialTokenResponse = await this.getFRNSWInitialTokens(oktaIDToken!);
                                const newAccessToken = initialTokenResponse.data.TOKEN_RESPONSE.ACCESS_TOKEN;
                                const newRefreshToken = initialTokenResponse.data.TOKEN_RESPONSE.REFRESH_TOKEN;
                                await SecureStore.setItemAsync('access-token', newAccessToken);
                                await SecureStore.setItemAsync('refresh-token', newRefreshToken);
                            }

                            this.authRefreshPromise = null;
                        })().catch(error => {
                            this.authRefreshPromise = null;
                            throw error;
                        });
                    }

                    // Wait for the auth refresh to complete (even if another request started it)
                    await this.authRefreshPromise;

                    const newAccessToken = await SecureStore.getItemAsync('access-token');
                    const newAuthString = `${this.authType} ${newAccessToken}`

                    const retryAuthResponse = await this.axiosInstance?.get(odataServiceUrl, {
                        headers: {
                            Authorization: newAuthString,
                        },
                        responseType: "arraybuffer"
                    })

                    if (!retryAuthResponse) {
                        throw new Error('no response from update');
                    }

                    return retryAuthResponse
                }
            }
            throw error
        }
    }
}

export const dataHandlerModule = new DataHandlerModule();