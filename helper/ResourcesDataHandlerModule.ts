//this module handles all our oData calls
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import * as Crypto from 'expo-crypto';

class ResourcesDataHandlerModule {

    private axiosInstance : AxiosInstance | null = null;
    private credentials : string | null = null;
    private csrfToken: string | null = null;

    async init () {
        this.axiosInstance = axios.create({baseURL: "https://portaluat.fire.nsw.gov.au/sap/opu/odata/sap"})

        const username = 'WAK816316';
        const password = 'BUTTERbar1!';
        this.credentials = btoa(`${username}:${password}`);

        try {
            const csrfResponse = await this.fetchCsrfToken()
            const newCsrfToken = csrfResponse?.headers['x-csrf-token'];
            this.csrfToken = newCsrfToken
        }
        catch (error) {
            console.log('csrf token init error')
        }
    }

    oDataInstanceInitialised () {
        return (this.axiosInstance !== null)
    }

    async fetchCsrfToken(): Promise<AxiosResponse> {
        try {
            const response = await this.axiosInstance?.get('/Z_VOL_MEMBER_SRV/MembershipDetails', {
                headers: {
                    Authorization: `Basic ${this.credentials}`,
                    'x-csrf-token': 'Fetch'
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

    async getResourceList (path: string) : Promise<AxiosResponse> {
        try {
            const pathURI = encodeURIComponent(path);
            const odataServiceUrl = "/Z_CFU_DOCUMENTS_SRV/$batch";
            
            const id = Crypto.randomUUID()
            const batchBoundary = `batch_${id}`;

            const batchReq1 = `Content-Type: application/http\nContent-Transfer-Encoding: binary\n\nGET Files?$skip=0&$top=100&$filter=ParentRid%20eq%20%27${pathURI}%27%20and%20Desktop%20eq%20false HTTP/1.1\nsap-cancel-on-close: true\nsap-contextid-accept: header\nAccept: application/json\nAccept-Language: en-AU\nDataServiceVersion: 2.0\nMaxDataServiceVersion: 2.0\n\n`;
            
            const batchBody = `--${batchBoundary}\n${batchReq1}\n\n--${batchBoundary}--`;

            const response = await this.axiosInstance?.post(odataServiceUrl, batchBody, {
                headers: {
                    Authorization: `Basic ${this.credentials}`,
                    "Content-Type": `multipart/mixed;boundary=${batchBoundary}`,
                    Accept: "multipart/mixed",
                    "Accept-Encoding": "gzip, deflate, br, zstd",
                },
            })
            
            if (!response){
                throw new Error ('cannot get entity, no response')
            }


            return response;
        }catch(error) {
            throw error
        }
    }

    async getResource(path: string, fileType: string) : Promise<AxiosResponse> {
        try {
            const encodedPathURI = encodeURIComponent(path);
            const encodedFileType = encodeURIComponent(fileType);

            const filters = `Url='${encodedPathURI}',FileType='${encodedFileType}'`;
            const odataServiceUrl = `/Z_CFU_DOCUMENTS_SRV/FileExports(${filters})/$value`;

            const response = await this.axiosInstance?.get(odataServiceUrl, {
                headers: {
                    Authorization: `Basic ${this.credentials}`,
                },
                responseType: fileType == "application/pdf" ? "arraybuffer" : "json",
                })
            
            if (!response){
                throw new Error ('cannot get entity, no response')
            }


            return response;    
        }catch(error){
            throw error
        }
    }

    async getFormsLauncherSet(formLaunchId:string) : Promise<AxiosResponse>{
        try {
            const encodedFormLaunchId = encodeURIComponent(formLaunchId);

            const filters = `FormLaunchId='${encodedFormLaunchId}'`;
            const odataServiceUrl = `/Z_MOB2_SRV/FormsLauncherSet(${filters})`;

            const response = await this.axiosInstance?.get(odataServiceUrl, {
                headers: {
                    Authorization: `Basic ${this.credentials}`,
                },
            })
            
            if (!response){
                throw new Error ('cannot get entity, no response')
            }


            return response;    
        }catch(error){
            throw error
        }
    }

    async getSkillsMaintenanceCategories (): Promise<AxiosResponse> {
        try {
            const odataServiceUrl = "/Z_CFU_FLASHCARDS_SRV/$batch";
            
            const id = Crypto.randomUUID()
            const batchBoundary = `batch_${id}`;

            const batchReq1 = `Content-Type: application/http\nContent-Transfer-Encoding: binary\n\nGET Categories?$filter=ParentCategoryId%20eq%20%270000000000%27 HTTP/1.1\nsap-cancel-on-close: true\nsap-contextid-accept: header\nAccept: application/json\nAccept-Language: en-AU\nDataServiceVersion: 2.0\nMaxDataServiceVersion: 2.0\n\n`;
            
            const batchBody = `--${batchBoundary}\n${batchReq1}\n\n--${batchBoundary}--`;

            const response = await this.axiosInstance?.post(odataServiceUrl, batchBody, {
                headers: {
                    Authorization: `Basic ${this.credentials}`,
                    "Content-Type": `multipart/mixed;boundary=${batchBoundary}`,
                    Accept: "multipart/mixed",
                    "Accept-Encoding": "gzip, deflate, br, zstd",
                },
            })
            
            if (!response){
                throw new Error ('cannot get entity, no response')
            }


            return response;
        }catch(error) {
            throw error
        }
    }

    async getSkillsMaintenanceRandomCards (categoryId:string) : Promise<AxiosResponse> {
        try {
            const odataServiceUrl = "/Z_CFU_FLASHCARDS_SRV/$batch";
            
            const id = Crypto.randomUUID()
            const batchBoundary = `batch_${id}`;

            const batchReq1 = `Content-Type: application/http\nContent-Transfer-Encoding: binary\n\nGET GetRandomCards?CategoryId='${categoryId}' HTTP/1.1\nsap-cancel-on-close: true\nsap-contextid-accept: header\nAccept: application/json\nAccept-Language: en-AU\nDataServiceVersion: 2.0\nMaxDataServiceVersion: 2.0\n\n`;
            
            const batchBody = `--${batchBoundary}\n${batchReq1}\n\n--${batchBoundary}--`;

            const response = await this.axiosInstance?.post(odataServiceUrl, batchBody, {
                headers: {
                    Authorization: `Basic ${this.credentials}`,
                    "Content-Type": `multipart/mixed;boundary=${batchBoundary}`,
                    Accept: "multipart/mixed",
                    "Accept-Encoding": "gzip, deflate, br, zstd",
                },
            })
            
            if (!response){
                throw new Error ('cannot get entity, no response')
            }

            return response; 
        }catch(error){
            throw error
        }
    }

    async postFeedbackSet(rating: string, comment: string) : Promise<AxiosResponse> {
        try {
            const odataServiceUrl = `/Z_MOB2_SRV/FeedbackSet`;

            const postBody = {
                "FeedbackId" : "",
                "FeedbackDate" :   "",
                "FeedbackTime" : "",
                "FeedbackBy" : "",
                "FeedbackText" : comment,
                "FeedbackRating" : rating,
                "FeedbackFullname" : ""
            }

            const response = await this.axiosInstance?.post(odataServiceUrl, postBody, {
                headers: {
                    "x-csrf-token": this.csrfToken,
                    "Content-Type": "application/json"
                },
            })
            
            if (!response){
                throw new Error ('cannot get entity, no response')
            }


            return response;    
        }catch(error){
            throw error
        }
    }

    async getIdCardPhoto (pernr: string) : Promise<AxiosResponse>{
        try {
            const encodedPernr = encodeURIComponent(pernr);

            const filters = `'${encodedPernr}'`;
            const odataServiceUrl = `/Z_MOB2_SRV/IdCardPhotoSet(${filters})/$value`;

            const response = await this.axiosInstance?.get(odataServiceUrl, {
                headers: {
                    Authorization: `Basic ${this.credentials}`,
                },
                responseType: "arraybuffer"
                })
            
            if (!response){
                throw new Error ('cannot get entity, no response')
            }

            return response;    
        }catch(error){
            throw error
        }
    }
}

export const resourceDataHandlerModule = new ResourcesDataHandlerModule ();
