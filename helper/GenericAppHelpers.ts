import { Platform, Linking } from "react-native";

export default class GenericAppHelpers {
    navigateToNativeMaps(address: string) {

        const url = Platform.select({
            ios: `http://maps.apple.com/?q=${encodeURIComponent(address)}`,
            android: `geo:0,0?q=${encodeURIComponent(address)}`,
        });

        Linking.openURL(url as string);

    }
}