//this module handles all our oData calls
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import * as Crypto from 'expo-crypto';

class ResourcesDataHandlerModule {

    private axiosInstance : AxiosInstance | null = null;
    private credentials : string | null = null;

    init () {
        this.axiosInstance = axios.create({baseURL: "https://portal.uat.rfs.nsw.gov.au/sap/opu/odata/sap/Z_CFU_DOCUMENTS_SRV"})

        const username = process.env.EXPO_PUBLIC_BASIC_USERNAME;
        const password = process.env.EXPO_PUBLIC_BASIC_PASSWORD;
        this.credentials = btoa(`${username}:${password}`);
    }

    oDataInstanceInitialised () {
        return (this.axiosInstance !== null)
    }

    async getResourceList (path: string) : Promise<AxiosResponse> {
        try {
            const pathURI = encodeURIComponent(path);
            const odataServiceUrl = "/$batch";
            
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
            const odataServiceUrl = `/FileExports(${filters})/$value`;

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
}

export const resourceDataHandlerModule = new ResourcesDataHandlerModule ();
