//this module handles all our oData calls
import axios, { AxiosInstance, AxiosResponse } from 'axios';

class DataHandlerModule {

    private axiosInstance : AxiosInstance | null = null;
    private axiosSecurityInstance : AxiosInstance | null = null;
    private csrfToken : string | null = null;
    
    init () {
        this.axiosInstance = axios.create({
            baseURL: 'https://sapes5.sapdevcenter.com/sap/opu/odata/iwbep/GWSAMPLE_BASIC'
        })

        this.axiosSecurityInstance = axios.create({
            baseURL: 'https://portalicmuat.fire.nsw.gov.au/mslm'
        })
    }

    oDataInstanceInitialised () {
        return (this.axiosInstance !== null)
    }

    securityInstanceInitialised () {
        return (this.axiosSecurityInstance !== null)
    }

    async getInitialTokens (idToken : string) : Promise<AxiosResponse> {
        try {
            const queryParams = {
                grant_type : 'urn:ietf:params:oauth:grant-type:token-exchange',
                client_id : '0oatd4xccfgbbP7uj697',
                subject_token_type : 'id_token',
                subject_token : idToken
            }

            const sUrl = '/token?grant_type=urn:ietf:params:oauth:grant-type:token-exchange&client_id=0oatd4xccfgbbP7uj697&subject_token_type=id_token&subject_token=' + idToken;

        /*    const response = await this.axiosSecurityInstance?.post('/token', {
                params : queryParams
            }); */

            const response = await this.axiosSecurityInstance?.post(sUrl);

            if (!response){
                throw new Error ('get initial tokens error')
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

    async getRefreshedAccessToken (refreshToken : string) : Promise<AxiosResponse> {
        try {
            const sUrl = '/token?client_id=CFU2APP&grant_type=refresh_token&refresh_token=' + refreshToken;

            const response = await this.axiosSecurityInstance?.post(sUrl);

            if (!response){
                throw new Error ('get initial tokens error')
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

    async createEntity (entityset : string, data : any[]) : Promise<boolean> {
        try {
            if (this.csrfToken == null){
                //need to get the token first   
                const getResponse = await this.readEntity("/$metadata");
                this.csrfToken = getResponse.headers['x-csrf-token'];
            }

            //run the create call
            const postResponse = await this.axiosInstance?.post(entityset, data, {
                headers: {
                    'x-csrf-token' : this.csrfToken,
                    'Content-Type' : 'application/json'
                }
            });

            if (postResponse){
                return postResponse?.status >= 200 && postResponse.status < 300;
            }

            return false;
        }
        catch (error) {
            throw error;
        }
    }

    async readEntity (entityset : string, accessToken? : string) : Promise<AxiosResponse> {
        try {
            let headers: Record<string, string> = {
                "Accept" : 'application/json'
            }

            if (this.csrfToken == null){
                headers['X-CSRF-Token'] = 'Fetch';
            }

            if (accessToken){
                headers['Authorization'] = `Bearer ${accessToken}`
            }

            const response = await this.axiosInstance?.get(entityset, {
                headers : headers
            });

            if (!response){
                throw new Error ('cannot get entity, no response')
            }

            if (this.csrfToken == null){
                const csrfToken = response?.headers['x-csrf-token'];
                this.csrfToken = csrfToken;
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

    async updateEntity (entity : string, data : any[]) : Promise<boolean> {
        try {
            if (this.csrfToken == null){
                //need to get the token first   
                const getResponse = await this.readEntity("/$metadata");
                this.csrfToken = getResponse.headers['x-csrf-token'];
            }

            //run the create call
            const postResponse = await this.axiosInstance?.put(entity, data, {
                headers: {
                    'x-csrf-token' : this.csrfToken,
                    'Content-Type' : 'application/json'
                }
            });

            if (postResponse){
                return postResponse?.status >= 200 && postResponse.status < 300;
            }

            return false;
        }
        catch (error) {
            throw error;
        }
    }

    async deleteEntity () {

    }

}

export const dataHandlerModule = new DataHandlerModule ();
