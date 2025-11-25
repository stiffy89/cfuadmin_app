//generic formatter to help us format dates, addresses etc
import { DateTime } from 'luxon';

export default class GenericFormatter {
    formatContactsAddress(data: any) {
        let addressString = '';

        data.Street ? addressString += (data.Street + ", ") : addressString += '';
        data.Suburb ? addressString += (data.Suburb + " ") : addressString += '';
        data.Postcode ? addressString += (data.Postcode + " ") : addressString += '';

        return addressString;
    }

    formatAddress(data: any) {
        let addressString = '';

        data.Stras ? addressString += (data.Stras + ", ") : addressString += '';
        data.Ort01 ? addressString += (data.Ort01 + " ") : addressString += '';
        data.Regio ? addressString += (data.Regio + " ") : addressString += '';
        data.Pstlz ? addressString += (data.Pstlz + " ") : addressString += '';

        return addressString;
    }

    formatJSDateToFormat(date : Date | undefined | null, format? : string){
        let selectedFormat = 'dd/MM/yyyy';

        if (format){
            selectedFormat = format;
        }

        if (date == undefined || date == null){
            return ''
        }

        const luxonDate = DateTime.fromJSDate(date);
        return luxonDate.toFormat(selectedFormat);
    }

    formatFromEdmToJSDate(edmString: string){
        if (!edmString) {
            return undefined;
        }

        const timestamp = parseInt(edmString.replace(/\D/g, ""), 10);
        const luxonDate = DateTime.fromMillis(timestamp);
        return luxonDate.toJSDate();
    }

    formatFromEdmDate(edmString: string, format?: string) {
        if (!edmString) {
            return '';
        }

        const timestamp = parseInt(edmString.replace(/\D/g, ""), 10);
        const luxonDate = DateTime.fromMillis(timestamp);
        let formattedDate;

        format ? formattedDate = luxonDate.toFormat(format) : formattedDate = luxonDate.toFormat('dd/MM/yyyy');
        return formattedDate;
    }

    formatToEdmDate(dateObj: Date): string {
        if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
            throw new Error("Invalid Date object");
        }


        const millis = dateObj.getTime();


        return `/Date(${millis})/`;
    }

    convertEdmToAbapDateTime(edmString: string): string {
        if (!edmString) return "";

        const timestamp = parseInt(edmString.replace(/\D/g, ""), 10);
        if (isNaN(timestamp)) return "";

        const luxonDate = DateTime.fromMillis(timestamp);

        const iso = luxonDate.toFormat("yyyy-MM-dd'T'HH:mm:ss");

        const encoded = iso.replace(/:/g, "%3A");

        return `datetime'${encoded}'`;
    }

    formatRole(role : string) {
        if (!role){
            return ''
        }
        else if (role.toLowerCase().includes('tc')){
            return 'Team Coordinator'
        }
        else if (role.toLowerCase().includes('sc')){
            return 'Secondary Contact'
        }
        else if (role.toLowerCase().includes('secondary')){
            return 'Secondary Contact'
        }
        else if (role.toLowerCase().includes('coordinator')){
            return 'Team Coordinator'
        }
        else {
            return '';
        }
    }
}