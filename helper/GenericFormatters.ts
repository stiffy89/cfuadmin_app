//generic formatter to help us format dates, addresses etc
import { DateTime } from 'luxon';

export default class GenericFormatter {
    formatAddress (data : any) {
        let addressString = '';

        data.Stras ? addressString += (data.Stras + ", ") : addressString += '';
        data.Ort01 ? addressString += (data.Ort01 + " ") : addressString += '';
        data.Regio ? addressString += (data.Regio + " ") : addressString += '';
        data.Pstlz ? addressString += (data.Pstlz + " ") : addressString += '';

        return addressString;
    }

    formatFromEdmDate (edmString : string, format? : string) {
        const timestamp = parseInt(edmString.replace(/\D/g, ""), 10);
        const luxonDate = DateTime.fromMillis(timestamp);
        let formattedDate;

        format ? formattedDate = luxonDate.toFormat(format) : formattedDate = luxonDate.toFormat('dd/MM/yyyy');
        return formattedDate;
    }
}