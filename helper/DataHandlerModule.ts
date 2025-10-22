//this module handles all our oData calls
import axios, { AxiosInstance, AxiosResponse } from 'axios';

class DataHandlerModule {

    private axiosInstance : AxiosInstance | null = null;
    private csrfToken : string | null = null;
    
    init () {
        this.axiosInstance = axios.create({
            baseURL: 'https://sapes5.sapdevcenter.com/sap/opu/odata/iwbep/GWSAMPLE_BASIC'
        })
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

    async readEntity (entityset : string) : Promise<AxiosResponse> {
        try {
            let headers: Record<string, string> = {
                "Accept" : 'application/json'
            }

            if (this.csrfToken == null){
                headers['X-CSRF-Token'] = 'Fetch';
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
