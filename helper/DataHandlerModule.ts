//this module handles all our oData calls
import axios, { AxiosInstance, AxiosResponse, isAxiosError } from 'axios';
import { authModule } from './AuthModule';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { batchGETResponse } from '../types/AppTypes';

class DataHandlerModule {

    private axiosInstance: AxiosInstance | null = null;
    private axiosSecurityInstance: AxiosInstance | null = null;
    private csrfToken: string | null = null;

    private useToken = false;

    async init(): Promise<boolean> {
        this.axiosInstance = axios.create({
            baseURL: 'https://portaluat.fire.nsw.gov.au/sap/opu/odata/sap/'
        })

        this.axiosSecurityInstance = axios.create({
            baseURL: 'https://portalicmuat.fire.nsw.gov.au/mslm'
        })

        //update the csrf token for now
        try {
            const csrfResponse = await this.fetchCsrfToken()
            const newCsrfToken = csrfResponse?.headers['x-csrf-token'];
            await AsyncStorage.setItem('csrf-token', newCsrfToken);
        }
        catch (error) {
            console.log('csrf token init error')
        }

        /*    try {
                const oktaLoginResponse = await authModule.onOktaLogin();
                const idToken = oktaLoginResponse.response.idToken;
                if (!idToken) throw new Error('No idToken returned');
    
                const tokenResponse = await this.getInitialTokens(idToken);
                const newAccessToken = tokenResponse.data.TOKEN_RESPONSE.ACCESS_TOKEN;
                const newRefreshToken = tokenResponse.data.TOKEN_RESPONSE.REFRESH_TOKEN;
    
                await AsyncStorage.setItem('access-token', newAccessToken);
                await AsyncStorage.setItem('refresh-token', newRefreshToken);
    
                const csrfResponse = await this.readEntity('/Z_VOL_MEMBER_SRV/MembershipDetails');
                const newCsrfToken = csrfResponse?.headers['x-csrf-token'];
                await AsyncStorage.setItem('csrf-token', newCsrfToken);
    
                return true;
    
            } catch (error) {
                throw new Error("Token refresh or retry failed: " + error);
            } */

        /*        const accessToken = await AsyncStorage.getItem('access-token');
        
                if (!accessToken) {
                    //go get auth token
                    try {
                        const oktaLoginResponse = await authModule.onOktaLogin();
                        const idToken = oktaLoginResponse.response.idToken;
                        if (!idToken) throw new Error('No idToken returned');
        
                        const tokenResponse = await this.getInitialTokens(idToken);
                        const newAccessToken = tokenResponse.data.TOKEN_RESPONSE.ACCESS_TOKEN;
                        const newRefreshToken = tokenResponse.data.TOKEN_RESPONSE.REFRESH_TOKEN;
        
                        await AsyncStorage.setItem('access-token', newAccessToken);
                        await AsyncStorage.setItem('refresh-token', newRefreshToken);
        
                        return true;
        
                    } catch (error) {
                        throw new Error("Token refresh or retry failed: " + error);
                    }
                }
        */
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
                client_id: '0oatd4xccfgbbP7uj697',
                subject_token_type: 'id_token',
                subject_token: idToken
            }

            const sUrl = '/token?grant_type=urn:ietf:params:oauth:grant-type:token-exchange&client_id=0oatd4xccfgbbP7uj697&subject_token_type=id_token&subject_token=' + idToken;

            /*    const response = await this.axiosSecurityInstance?.post('/token', {
                    params : queryParams
                }); */

            const response = await this.axiosSecurityInstance?.post(sUrl);

            if (!response) {
                throw new Error('get initial tokens error')
            }

            //if we need to handle status or headers, could do them here
            const status = response.status;
            const responseHeaders = response.headers;

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

            //if we need to handle status or headers, could do them here
            const status = response.status;
            const responseHeaders = response.headers;

            return response;
        }
        catch (error) {
            throw error;
        }
    }

    async createEntity(entityset: string, data: any[]): Promise<boolean> {
        try {
            if (this.csrfToken == null) {
                //need to get the token first   
                const getResponse = await this.readEntity("/$metadata");
                this.csrfToken = getResponse.headers['x-csrf-token'];
            }

            //run the create call
            const postResponse = await this.axiosInstance?.post(entityset, data, {
                headers: {
                    'x-csrf-token': this.csrfToken,
                    'Content-Type': 'application/json'
                }
            });

            if (postResponse) {
                return postResponse?.status >= 200 && postResponse.status < 300;
            }

            return false;
        }
        catch (error) {
            throw error;
        }
    }

    async readEntity(entityset: string, passedToken?: string): Promise<AxiosResponse> {

        let headers: Record<string, string> = {
            "Accept": 'application/json'
        }

        let accessToken;

        if (passedToken) {
            accessToken = passedToken;
        }
        else {
            accessToken = await AsyncStorage.getItem('access-token');
        }

        if (!accessToken) {
            const refreshToken = await AsyncStorage.getItem('refresh-token');
            if (!refreshToken) {
                const oktaLoginResponse = await authModule.onOktaLogin();
                const idToken = oktaLoginResponse.response.idToken;
                if (!idToken) throw new Error('No idToken returned');

                const tokenResponse = await this.getInitialTokens(idToken);

                await AsyncStorage.setItem('access-token', tokenResponse.data.TOKEN_RESPONSE.ACCESS_TOKEN);
                await AsyncStorage.setItem('refresh-token', tokenResponse.data.TOKEN_RESPONSE.REFRESH_TOKEN);

                accessToken = tokenResponse.data.TOKEN_RESPONSE.ACCESS_TOKEN;
            }
            else {
                const tokenResponse = await this.getRefreshedAccessToken(refreshToken);
                await AsyncStorage.setItem('access-token', tokenResponse.data.TOKEN_RESPONSE.ACCESS_TOKEN);

                accessToken = tokenResponse.data.TOKEN_RESPONSE.ACCESS_TOKEN;
            }
        }

        //hard code this for now
        if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`
            headers['x-csrf-token'] = 'Fetch';
        }

        try {
            const response = await this.axiosInstance?.get(entityset, {
                headers
            });

            if (!response) {
                throw new Error('cannot get entity, no response')
            }

            const csrfToken = response?.headers['x-csrf-token'];
            await AsyncStorage.setItem('csrf-token', csrfToken);

            return response;
        }
        catch (error) {
            if (isAxiosError(error)) {
                const status = error.response?.status;
                if (status === 401) {
                    try {
                        const refreshToken = await AsyncStorage.getItem('refresh-token');
                        let newAccessToken;

                        if (!refreshToken) {
                            const oktaLoginResponse = await authModule.onOktaLogin();
                            const idToken = oktaLoginResponse.response.idToken;
                            if (!idToken) throw new Error('No idToken returned');

                            const tokenResponse = await this.getInitialTokens(idToken);

                            await AsyncStorage.setItem('access-token', tokenResponse.data.TOKEN_RESPONSE.ACCESS_TOKEN);
                            await AsyncStorage.setItem('refresh-token', tokenResponse.data.TOKEN_RESPONSE.REFRESH_TOKEN);

                            newAccessToken = tokenResponse.data.TOKEN_RESPONSE.ACCESS_TOKEN;
                        }
                        else {
                            const tokenResponse = await this.getRefreshedAccessToken(refreshToken);
                            await AsyncStorage.setItem('access-token', tokenResponse.data.TOKEN_RESPONSE.ACCESS_TOKEN);

                            newAccessToken = tokenResponse.data.TOKEN_RESPONSE.ACCESS_TOKEN;
                        }

                        return await this.readEntity(entityset, newAccessToken);

                    } catch (error) {
                        console.error("Token refresh or retry failed:", error);
                        throw error;
                    }
                }
            }

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

    updateBatchBody(urlPath: string, data: any) {
        const dataStr = JSON.stringify(data);
        const batchBody = `Content-Type: application/http\nContent-Transfer-Encoding: binary\n\nMERGE ${urlPath} HTTP/1.1\nsap-context-id-accept: header\nAccept: application/json\nAccept-Language: en-AU\nDataServiceVersion: 2.0\nMaxDataServiceVersion: 2.0\nContent-Type: application/json\nContent-Length: 10000\n\n${dataStr}`;
        return batchBody;
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

    async fetchCsrfToken(): Promise<AxiosResponse> {
        //TODO need to fix this up eventually
        try {
            const username = 'WAK816316';
            const password = 'BUTTERbar1!';
            const token = btoa(`${username}:${password}`);
            const authString = `Basic ${token}`

            const response = await this.axiosInstance?.get('/Z_VOL_MEMBER_SRV/MembershipDetails', {
                headers: {
                    'x-csrf-token': 'Fetch'
                },
                auth: {
                    username: 'WAK816316',
                    password: 'BUTTERbar1!',
                },
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

        const username = 'WAK816316';
        const password = 'BUTTERbar1!';
        const token = btoa(`${username}:${password}`);
        const authString = `Basic ${token}`

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

            if (!postResponse) throw new Error('no response from update');

            //format the response
            const jsonResponse = this.formatMERGEResponse(postResponse.data);

            return {
                entityName: '',
                responseBody: jsonResponse
            }
        }
        catch (error) {
            if (isAxiosError(error)) {
                const status = error.response?.status;
                if (status === 401) {
                    try {
                        const refreshToken = await AsyncStorage.getItem('refresh-token');
                        let newAccessToken;

                        if (!refreshToken) {
                            const oktaLoginResponse = await authModule.onOktaLogin();
                            const idToken = oktaLoginResponse.response.idToken;
                            if (!idToken) throw new Error('No idToken returned');

                            const tokenResponse = await this.getInitialTokens(idToken);

                            await AsyncStorage.setItem('access-token', tokenResponse.data.TOKEN_RESPONSE.ACCESS_TOKEN);
                            await AsyncStorage.setItem('refresh-token', tokenResponse.data.TOKEN_RESPONSE.REFRESH_TOKEN);

                            newAccessToken = tokenResponse.data.TOKEN_RESPONSE.ACCESS_TOKEN;
                        }
                        else {
                            const tokenResponse = await this.getRefreshedAccessToken(refreshToken);
                            await AsyncStorage.setItem('access-token', tokenResponse.data.TOKEN_RESPONSE.ACCESS_TOKEN);

                            newAccessToken = tokenResponse.data.TOKEN_RESPONSE.ACCESS_TOKEN;
                        }

                        const retryResponse = await this.axiosInstance?.post(serviceName + '/$batch',
                            batchBodyString,
                            {
                                headers: {
                                    'Content-Type': `multipart/mixed; boundary=${batchSeparator}`,
                                    'x-csrf-token': csrfToken,
                                    'Authorization': authString
                                }
                            }
                        );

                        if (!retryResponse) throw new Error('no response from update');

                        //format the response
                        const retryJsonResponse = this.formatGETResponse(retryResponse.data);

                        if (!retryJsonResponse) {
                            throw new Error('response body is malformed, cannot parse')
                        }

                        return {
                            entityName: '',
                            responseBody: retryJsonResponse
                        }

                    } catch (error) {
                        console.error("Token refresh or retry failed:", error);
                        throw error;
                    }
                }
                else if (status == 403) {
                    //try getting csrf token
                    const csrfResponse = await this.fetchCsrfToken()
                    const newCsrfToken = csrfResponse?.headers['x-csrf-token'];
                    await AsyncStorage.setItem('csrf-token', newCsrfToken);
                    const retryResponse = await this.axiosInstance?.post(serviceName + '/$batch',
                        batchBodyString,
                        {
                            headers: {
                                'Content-Type': `multipart/mixed; boundary=${batchSeparator}`,
                                'x-csrf-token': csrfToken,
                                'Authorization': authString
                            }
                        }
                    );

                    if (!retryResponse) throw new Error('no response from update');

                    //format the response
                    const retryJsonResponse = this.formatGETResponse(retryResponse.data);

                    if (!retryJsonResponse) {
                        throw new Error('response body is malformed, cannot parse')
                    }

                    return {
                        entityName: '',
                        responseBody: retryJsonResponse
                    }
                }
            }

            throw error;
        }
    }

    async batchSingleDelete(urlPath: string, serviceName: string, passedAccessToken?: string): Promise<batchGETResponse> {

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

        const username = 'WAK816316';
        const password = 'BUTTERbar1!';
        const token = btoa(`${username}:${password}`);
        const authString = `Basic ${token}`

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

            if (!postResponse) throw new Error('no response from update');

            //format the response
            const jsonResponse = this.formatMERGEResponse(postResponse.data);

            return {
                entityName: '',
                responseBody: jsonResponse
            }
        }
        catch (error) {
            if (isAxiosError(error)) {
                const status = error.response?.status;
                if (status === 401) {
                    try {
                        const refreshToken = await AsyncStorage.getItem('refresh-token');
                        let newAccessToken;

                        if (!refreshToken) {
                            const oktaLoginResponse = await authModule.onOktaLogin();
                            const idToken = oktaLoginResponse.response.idToken;
                            if (!idToken) throw new Error('No idToken returned');

                            const tokenResponse = await this.getInitialTokens(idToken);

                            await AsyncStorage.setItem('access-token', tokenResponse.data.TOKEN_RESPONSE.ACCESS_TOKEN);
                            await AsyncStorage.setItem('refresh-token', tokenResponse.data.TOKEN_RESPONSE.REFRESH_TOKEN);

                            newAccessToken = tokenResponse.data.TOKEN_RESPONSE.ACCESS_TOKEN;
                        }
                        else {
                            const tokenResponse = await this.getRefreshedAccessToken(refreshToken);
                            await AsyncStorage.setItem('access-token', tokenResponse.data.TOKEN_RESPONSE.ACCESS_TOKEN);

                            newAccessToken = tokenResponse.data.TOKEN_RESPONSE.ACCESS_TOKEN;
                        }

                        const retryResponse = await this.axiosInstance?.post(serviceName + '/$batch',
                            batchBody,
                            {
                                headers: {
                                    'Content-Type': `multipart/mixed; boundary=${batch}`,
                                    'x-csrf-token': csrfToken,
                                    'Authorization': authString
                                }
                            }
                        );

                        if (!retryResponse) throw new Error('no response from update');

                        //format the response
                        const retryJsonResponse = this.formatGETResponse(retryResponse.data);

                        if (!retryJsonResponse) {
                            throw new Error('response body is malformed, cannot parse')
                        }

                        return {
                            entityName: '',
                            responseBody: retryJsonResponse
                        }

                    } catch (error) {
                        console.error("Token refresh or retry failed:", error);
                        throw error;
                    }
                }
                else if (status == 403) {
                    //try getting csrf token
                    const csrfResponse = await this.fetchCsrfToken()
                    const newCsrfToken = csrfResponse?.headers['x-csrf-token'];
                    await AsyncStorage.setItem('csrf-token', newCsrfToken);
                    const retryResponse = await this.axiosInstance?.post(serviceName + '/$batch',
                        batchBody,
                        {
                            headers: {
                                'Content-Type': `multipart/mixed; boundary=${batch}`,
                                'x-csrf-token': csrfToken,
                                'Authorization': authString
                            }
                        }
                    );

                    if (!retryResponse) throw new Error('no response from update');

                    //format the response
                    const retryJsonResponse = this.formatGETResponse(retryResponse.data);

                    if (!retryJsonResponse) {
                        throw new Error('response body is malformed, cannot parse')
                    }

                    return {
                        entityName: '',
                        responseBody: retryJsonResponse
                    }
                }
            }

            throw error;
        }
    }

    async batchGet(path: string, serviceName: string, entityName: string, passedAccessToken?: string, menuSet?: boolean): Promise<batchGETResponse> {
        //build the request body and post
        const batch = 'batch_' + Crypto.randomUUID();

        let batchString = `--${batch}\n` + this.getBatchBody(path) + `--${batch}--`;

        let csrfToken = await AsyncStorage.getItem('csrf-token');
        let csrfRefreshPromise: Promise<void> | null = null;

        if (!csrfToken) {
            const csrfResponse = await this.fetchCsrfToken();
            const newCsrfToken = csrfResponse?.headers['x-csrf-token'];
            await AsyncStorage.setItem('csrf-token', newCsrfToken);
            csrfToken = newCsrfToken;
        }

        const username = 'WAK816316';
        const password = 'BUTTERbar1!';
        const token = btoa(`${username}:${password}`);
        const authString = `Basic ${token}`

        try {


            let accessToken;

            if (this.useToken) {
                if (passedAccessToken) {
                    accessToken = passedAccessToken;
                }
                else {
                    accessToken = await AsyncStorage.getItem('access-token');
                }
            }

            let customHeaders;

            customHeaders = {
                'Content-Type': `multipart/mixed; boundary=${batch}`,
                'x-csrf-token': csrfToken,
                'Authorization': `Bearer ${accessToken}`
            }


            let header: any = {
                'Content-Type': `multipart/mixed; boundary=${batch}`,
                //    'x-csrf-token': csrfToken,
                'Authorization': authString
            }

            if (menuSet) {
                header['client-id'] = 'CFU2APP'
            }

            //run the create call
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
                throw new Error('response body is malformed, cannot parse')
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
                    try {
                        const refreshToken = await AsyncStorage.getItem('refresh-token');
                        let newAccessToken;

                        if (!refreshToken) {
                            const oktaLoginResponse = await authModule.onOktaLogin();
                            const idToken = oktaLoginResponse.response.idToken;
                            if (!idToken) throw new Error('No idToken returned');

                            const tokenResponse = await this.getInitialTokens(idToken);

                            await AsyncStorage.setItem('access-token', tokenResponse.data.TOKEN_RESPONSE.ACCESS_TOKEN);
                            await AsyncStorage.setItem('refresh-token', tokenResponse.data.TOKEN_RESPONSE.REFRESH_TOKEN);

                            newAccessToken = tokenResponse.data.TOKEN_RESPONSE.ACCESS_TOKEN;
                        }
                        else {
                            const tokenResponse = await this.getRefreshedAccessToken(refreshToken);
                            await AsyncStorage.setItem('access-token', tokenResponse.data.TOKEN_RESPONSE.ACCESS_TOKEN);

                            newAccessToken = tokenResponse.data.TOKEN_RESPONSE.ACCESS_TOKEN;
                        }

                        const retryResponse = await this.axiosInstance?.post(serviceName + '/$batch',
                            batchString,
                            {
                                headers: {
                                    'Content-Type': `multipart/mixed; boundary=${batch}`,
                                    'x-csrf-token': csrfToken,
                                    'Authorization': authString
                                }
                            }
                        );

                        if (!retryResponse) throw new Error('no response from update');

                        //format the response
                        const retryJsonResponse = this.formatGETResponse(retryResponse.data);

                        if (!retryJsonResponse) {
                            throw new Error('response body is malformed, cannot parse')
                        }

                        return {
                            entityName: entityName,
                            responseBody: retryJsonResponse
                        }

                    } catch (error) {
                        console.error("Token refresh or retry failed:", error);
                        throw error;
                    }
                }
                else if (status == 403) {
                    //try getting csrf token
                    if (!csrfRefreshPromise) {
                        csrfRefreshPromise = (async () => {
                            console.log('Refreshing CSRF token...');
                            const csrfResponse = await this.fetchCsrfToken();
                            const newCsrfToken = csrfResponse?.headers['x-csrf-token'];
                            if (!newCsrfToken) throw new Error('No CSRF token returned');
                            
                            await AsyncStorage.setItem('csrf-token', newCsrfToken);
                            console.log('CSRF token refreshed.');
                            csrfRefreshPromise = null;
                        })().catch(err => {
                            csrfRefreshPromise = null;
                            throw err;
                        });
                    }

                    // Wait for the CSRF refresh to complete (even if another request started it)
                    await csrfRefreshPromise;

                    // Re-run the request after refresh
                    const retryResponse = await this.axiosInstance?.post(
                        serviceName + '/$batch',
                        batchString,
                        {
                            headers: {
                                'Content-Type': `multipart/mixed; boundary=${batch}`,
                                'x-csrf-token': await AsyncStorage.getItem('csrf-token'),
                                'Authorization': authString,
                            },
                        }
                    );

                    if (!retryResponse) throw new Error('no response from update');

                    const retryJsonResponse = this.formatGETResponse(retryResponse.data);
                    if (!retryJsonResponse) throw new Error('response body is malformed');

                    return { entityName, responseBody: retryJsonResponse };
                }
            }

            throw error;
        }
    }

    async updateEntity(entity: string, batchBody: any, batchId: string, passedToken?: string): Promise<AxiosResponse> {
        let accessToken;

        if (passedToken) {
            accessToken = passedToken;
        }
        else {
            accessToken = await AsyncStorage.getItem('access-token');
        }

        if (!accessToken) {
            const refreshToken = await AsyncStorage.getItem('refresh-token');
            if (!refreshToken) {
                const oktaLoginResponse = await authModule.onOktaLogin();
                const idToken = oktaLoginResponse.response.idToken;
                if (!idToken) throw new Error('No idToken returned');

                const tokenResponse = await this.getInitialTokens(idToken);

                await AsyncStorage.setItem('access-token', tokenResponse.data.TOKEN_RESPONSE.ACCESS_TOKEN);
                await AsyncStorage.setItem('refresh-token', tokenResponse.data.TOKEN_RESPONSE.REFRESH_TOKEN);

                accessToken = tokenResponse.data.TOKEN_RESPONSE.ACCESS_TOKEN;
            }
            else {
                const tokenResponse = await this.getRefreshedAccessToken(refreshToken);
                await AsyncStorage.setItem('access-token', tokenResponse.data.TOKEN_RESPONSE.ACCESS_TOKEN);

                accessToken = tokenResponse.data.TOKEN_RESPONSE.ACCESS_TOKEN;
            }
        }

        try {
            let csrfToken = await AsyncStorage.getItem('csrf-token');

            if (!csrfToken) {
                const csrfResponse = await this.readEntity('/Z_VOL_MEMBER_SRV/MembershipDetails');
                const newCsrfToken = csrfResponse?.headers['x-csrf-token'];
                await AsyncStorage.setItem('csrf-token', newCsrfToken);
                csrfToken = newCsrfToken;
            }

            //run the create call
            const postResponse = await this.axiosInstance?.post(entity,
                batchBody,
                {
                    headers: {
                        "Content-Type": `multipart/mixed; boundary=${batchId}`,
                        'x-csrf-token': csrfToken,
                        'Authorization': `Bearer ${accessToken}`
                    }
                }
            );

            if (!postResponse) throw new Error('no response from update');
            return postResponse;
        }
        catch (error) {
            if (isAxiosError(error)) {
                const status = error.response?.status;
                if (status === 401) {
                    try {
                        const refreshToken = await AsyncStorage.getItem('refresh-token');
                        let newAccessToken;

                        if (!refreshToken) {
                            const oktaLoginResponse = await authModule.onOktaLogin();
                            const idToken = oktaLoginResponse.response.idToken;
                            if (!idToken) throw new Error('No idToken returned');

                            const tokenResponse = await this.getInitialTokens(idToken);

                            await AsyncStorage.setItem('access-token', tokenResponse.data.TOKEN_RESPONSE.ACCESS_TOKEN);
                            await AsyncStorage.setItem('refresh-token', tokenResponse.data.TOKEN_RESPONSE.REFRESH_TOKEN);

                            newAccessToken = tokenResponse.data.TOKEN_RESPONSE.ACCESS_TOKEN;
                        }
                        else {
                            const tokenResponse = await this.getRefreshedAccessToken(refreshToken);
                            await AsyncStorage.setItem('access-token', tokenResponse.data.TOKEN_RESPONSE.ACCESS_TOKEN);

                            newAccessToken = tokenResponse.data.TOKEN_RESPONSE.ACCESS_TOKEN;
                        }

                        return await this.updateEntity(entity, batchBody, newAccessToken);

                    } catch (error) {
                        console.error("Token refresh or retry failed:", error);
                        throw error;
                    }
                }
            }

            throw error;
        }
    }

    /*    async updateEntity(entity: string, data: any, accessToken : string): Promise<AxiosResponse> {
            try {
                const csrfToken = await AsyncStorage.getItem('csrf-token');
    
                if (!csrfToken){
                    throw new Error('no csrf token');
                }
    
                const batchBody =`--batch
    Content-Type: multipart/mixed; boundary=changeset
    
    --changeset
    Content-Type: application/http
    Content-Transfer-Encoding: binary
    
    MERGE EmployeeEmails(Pernr='00825004',Subty='9040',Objps='',Sprps='',Seqnr='000',Endda=datetime'9999-12-31T11%3A00%3A00',Begda=datetime'2025-10-28T11%3A00%3A00') HTTP/1.1
    sap-contextid-accept: header
    Accept: application/json
    Accept-Language: en-AU
    DataServiceVersion: 2.0
    MaxDataServiceVersion: 2.0
    Content-Type: application/json
    Content-Length: 10000
    
    {"__metadata":{"id":"https://portaluat.fire.nsw.gov.au/sap/opu/odata/sap/Z_ESS_MSS_SRV/EmployeeEmails(Begda=datetime'2025-10-28T00%3A00%3A00',Endda=datetime'9999-12-31T00%3A00%3A00',Objps='',Pernr='00825004',Seqnr='000',Sprps='',Subty='9040')","uri":"https://portaluat.fire.nsw.gov.au/sap/opu/odata/sap/Z_ESS_MSS_SRV/EmployeeEmails(Begda=datetime'2025-10-28T00%3A00%3A00',Endda=datetime'9999-12-31T00%3A00%3A00',Objps='',Pernr='00825004',Seqnr='000',Sprps='',Subty='9040')","type":"Z_ESS_MSS_SRV.EmployeeEmail"},"NewEmail":false,"Volunteer":false,"Zzsil00":false,"Begda":"\\/Date(1761609600000)\\/","Endda":"\\/Date(253402214400000)\\/","Objps":"","Pernr":"00825004","Seqnr":"000","Sprps":"","Subty":"9040","UsridLong":"STEVEN@FISTFULOFDYNAMITEE.COM.AU"}
    
    --changeset--
    --batch--`;
                
    
                //run the create call
                const postResponse = await this.axiosInstance?.post('/Z_ESS_MSS_SRV/$batch', 
                    batchBody, 
                    {
                        headers: {
                            "Content-Type": 'multipart/mixed; boundary=batch',
                            'x-csrf-token': csrfToken,
                            'Authorization' : `Bearer ${accessToken}`
                        }
                });
    
                if (!postResponse) throw new Error('no response from update');
    
                return postResponse;
            }
            catch (error) {
                if (isAxiosError(error)) {
                    const status = error.response?.status;
                    if (status === 401) {
                        try {
                            const oktaLoginResponse = await authModule.onOktaLogin();
                            const idToken = oktaLoginResponse.response.idToken;
                            if (!idToken) throw new Error('No idToken returned');
    
                            const tokenResponse = await this.getInitialTokens(idToken);
                            const newAccessToken = tokenResponse.data.TOKEN_RESPONSE.ACCESS_TOKEN;
                            return await this.updateEntity(entity, data, newAccessToken);
                        } catch (error) {
                            console.error("Token refresh or retry failed:", error);
                            throw error;
                        }
                    }
                }
    
                
                throw error;
            }
        }
    */
    async deleteEntity() {

    }

}

export const dataHandlerModule = new DataHandlerModule();