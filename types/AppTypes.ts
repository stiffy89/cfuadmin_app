//all our types are here
import * as AuthSession from "expo-auth-session";
import { StackScreenProps } from '@react-navigation/stack';
import type { NavigationProp, NavigationContainerRefWithCurrent, NavigatorScreenParams } from '@react-navigation/native';

export type AuthType = 'okta' | 'local' | 'pin';

export type AuthenticationMode = 'authenticate' | 'bypass';

export type AppContextType = {
    showDialog: boolean;
    setShowDialog: (val: boolean) => void;
    showBusyIndicator: boolean;
    setShowBusyIndicator: (val: boolean) => void;
    dialogMessage: string;
    setDialogMessage: (val: string) => void;
    lastAppState: string;
    setLastAppState: (val: string) => void;
    authenticationMode: AuthenticationMode;
    setAuthenticationMode: (val: AuthenticationMode) => void;
};

export type SecurityContextType = {
    isLoggedIn: boolean;
    setIsLoggedIn: (val: boolean) => void;
    isAuthenticating: boolean; // if we are currently authenticating, we will stop the background / active app logic flow
    setIsAuthenticating: (val: boolean) => void;
    authType: AuthType; // type of auth method - to render what will be displayed on the login page okta, local auth, pin
    setAuthType: (val: AuthType) => void;
    authErrorMessage: string;
    setAuthErrorMessage: (val: string) => void;
};

export type UserData = {
    firstname: string;
    lastname: string;
    pernr: string;
    position: string;
    unitid: string;
}

//services grid row type
export type GridLayoutRow = {
    [key: string]: React.ReactElement[]
}

export type ServiceData = {
    title: string;
}

export type DataContextType = {
    user: UserData;
    setUser: (val: UserData) => void;
    services: ServiceData[];
    setServices: (val: ServiceData[]) => void;
    myUnitContacts: any[];
    setMyUnitContacts: (val: any[]) => void;
    cfuPhonebookSuburbs : any[];
    setCfuPhonebookSuburbs: (val: any[]) => void;
}

export type OktaLoginResult = {
    response: AuthSession.TokenResponse
}

export type TokenError = {
    [key: string]: object;
}

export type ScreenState = 'auth' | 'home';

export type RootStackParamList = {
    MainTabs: NavigatorScreenParams<TabParamList>;
    LoginScreen: undefined;
    EditScreen: Record<string, string> | undefined;
}

export type TabParamList = {
    HomeScreen: undefined;
    ContactsScreen: NavigatorScreenParams<ContactsStackParamList>;
    MyProfileScreen: NavigatorScreenParams<ProfileStackParamList>;
    Resources: NavigatorScreenParams<ResourceStackParamList>
}

export type ContactsStackParamList = {
    ContactsMain : NavigatorScreenParams<ContactsTabParamList>;
    MyUnitContactDetail : Record<string, string> |undefined;
    CfuPhonebookContactsList : any | undefined;
    CfuPhonebookContactDetail : Record<string, string> | undefined;
}

export type ContactsTabParamList = {
    ContactsMyUnit: undefined;
    ContactsCFUPhonebook: undefined;
}

export type ProfileStackParamList = {
    ProfileScreen: undefined;
    MyDetailsScreen: Record<string, string> | undefined;
    ContactDetailsScreen: Record<string, string> | undefined;
    EmergencyContactsScreen: Record<string, string>[] | undefined;
    MyUnitDetailsScreen: undefined;
    TrainingHistoryScreen: Record<string, string>[] | undefined;
    TrainingDetailsScreen: Record<string, string> | undefined;
    MembershipDetailsScreen: Record<string, Record<string, string>[]> | undefined;
    UniformDetailsScreen: Record<string, string> | undefined;
    MedalsAndAwardsScreen: Record<string, string> | undefined;
}

export type ResourceStackParamList = {
    ResourceCategories: Record<string, string> | undefined;
    ResourceList: Record<string, string> | undefined;
    Resource: Record<string, string> | undefined;
};

export type RootStackScreenKeys = keyof RootStackParamList;
export type ProfileStackScreenKeys = keyof ProfileStackParamList;

export type NavType = NavigationContainerRefWithCurrent<RootStackParamList>;