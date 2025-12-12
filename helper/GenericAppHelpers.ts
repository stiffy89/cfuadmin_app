import { Platform, Linking } from "react-native";

export default class GenericAppHelpers {
    async navigateToNativeMaps(address: string) {

        //default ios to apple maps - web version.
        //android, default them to whatever their selected maps app is, if they cannot open, then use google maps
        const url = Platform.select({
            ios: `http://maps.apple.com/?q=${encodeURIComponent(address)}`,
            android: `geo:0,0?q=${encodeURIComponent(address)}`
        });

        if (Platform.OS == 'ios'){
            Linking.openURL(url!)
        }
        else {
            if (await Linking.canOpenURL(url!)){
                Linking.openURL(url!);
            }
            else {
                const webUrl = `https://www.google.com/maps/${encodeURIComponent(address)}`;
                Linking.openURL(webUrl)
            }
        }
    }

    navigateToPhone(phoneString : string) {
        const number = phoneString.split(':')[1];
        if (!number){
            return;
        }

        Linking.openURL(phoneString);
    }

    navigateToEmail(emailString : string) {
        const email = emailString.split(':')[1];
        if (!email){
            return;
        }

        Linking.openURL(emailString);
    }
}