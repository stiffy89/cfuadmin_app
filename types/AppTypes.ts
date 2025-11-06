//all our types are here
import * as AuthSession from "expo-auth-session";
import { StackScreenProps } from '@react-navigation/stack';
import type { NavigationProp, NavigationContainerRefWithCurrent, NavigatorScreenParams } from '@react-navigation/native';

export type AuthType = 'okta' | 'local' | 'pin';

export type AuthenticationMode = 'authenticate' | 'bypass';

export type AppContextType = {
    showDialogCancelButton: boolean;
    setShowDialogCancelButton: (val: boolean) => void;
    dialogActionButtonText: string;
    setDialogActionButtonText: (val: string) => void;
    dialogActionFunction? : () => void;
    setDialogActionFunction: (fn: (() => void) | undefined) => void;
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
    cardModalVisible: boolean,
    setCardModalVisible: (val: boolean) => void,
    feedbackModalVisible : boolean,
    setFeedbackModalVisible: (val:boolean) => void
};

export type batchGETResponse = {
    entityName: string;
    responseBody: any;
}


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
    services: any[];
    setServices: (val: any[]) => void;

    currentUser: any[];
    setCurrentUser: (val: any[]) => void;

    membershipDetails: any[];
    setMembershipDetails: (val: any[]) => void;

    trainingHistoryDetails: any[];
    setTrainingHistoryDetails: (val: any[]) => void;

    employeeDetails: any[];
    setEmployeeDetails: (val: any[]) => void;

    volunteerRoles: any[];
    setVolunteerRoles: (val: any[]) => void;

    objectsOnLoan: any[];
    setObjectsOnLoan: (val: any[]) => void;

    medalsAwards: any[];
    setMedalsAwards: (val: any[]) => void;

    employeeAddresses: any[];
    setEmployeeAddresses: (val: any[]) => void;

    myOrgUnitDetails : any [];
    setMyOrgUnitDetails : (val : any[]) => void;

    addressStates: any[];
    setAddressStates: (val: any[]) => void;

    addressRelationships: any[];
    setAddressRelationships: (val: any[]) => void;

    brigadeSummary: any[];
    setBrigadeSummary: (val: any[]) => void;

    myUnitContacts: any[];
    setMyUnitContacts: (val: any[]) => void;

    cfuPhonebookSuburbs : any[];
    setCfuPhonebookSuburbs: (val: any[]) => void;

    rootOrgUnits : any[];
    setRootOrgUnits : (val: any[]) => void;

    orgUnitTeamMembers : any[];
    setOrgUnitTeamMembers : (val : any[]) => void;

    myMembersMembershipDetails : any [];
    setMyMembersMembershipDetails : (val: any[]) => void;

    myMemberEmployeeDetails : any [];
    setMyMemberEmployeeDetails : (val : any[]) => void;

    currentProfile : string;
    setCurrentProfile : (val : string) => void; // this will change based on whether we are editing My Member or Current User

    drillDetails: any[];
    setDrillDetails: (val: any[]) => void; //sets the drill details per org unit, select the first org unit IF we have multiple because thats the one that will render first

    memberDrillCompletion: any[];
    setMemberDrillCompletion: (val: any[]) => void; //sets the drill completion from members per org

    trainingSelectedOrgUnit: any;
    setTrainingSelectedOrgUnit: (val: any[]) => void;//sets the selected org unit for training
}

export type OktaLoginResult = {
    response: AuthSession.TokenResponse
}

export type TokenError = {
    [key: string]: object;
}

export type ScreenState = 'auth' | 'home';

interface DrillData {
    drillObj : Record<string, any>;
    drillCompletions: Record<string, string>[];
}

interface MemberData {
    memberData : Record<string, string>;
    brigades: Record<string, string>[];
    trainingDetails : Record<string, string>[];
    volunteerStatuses : Record<string, string>[];
}

export type RootStackParamList = {
    SplashScreen: undefined;
    MainTabs: NavigatorScreenParams<TabParamList>;
    LoginScreen: undefined;
    EditScreen: Record<string, string> | undefined;
    Resources: NavigatorScreenParams<ResourceStackParamList>;
    MyMembers: Record<string, string> | undefined;
    MyMembersProfile: Record<string, string> | undefined;
    MyDetailsScreen: Record<string, string> | undefined;
    ContactDetailsScreen: Record<string, string> | undefined;
    EmergencyContactsScreen: Record<string, string> | undefined;
    MyUnitDetailsScreen: Record<string, string> | undefined;
    TrainingHistoryScreen: Record<string, string>[] | undefined;
    TrainingDetailsScreen: Record<string, string> | undefined;
    MembershipDetailsScreen: Record<string, Record<string, string>[]> | undefined;
    UniformDetailsScreen: Record<string, string> | undefined;
    MedalsAndAwardsScreen: Record<string, string> | undefined;
    SkillsMaintenance: NavigatorScreenParams<SkillsMaintenanceStackParamList>;
    FormService:NavigatorScreenParams<FormServiceStackParamList>;
    TrainingMain: undefined;
    TrainingCompletionByDrill: DrillData | undefined;
    TrainingCompletionByUser: MemberData | undefined;
}

export type TabParamList = {
    HomeScreen: undefined;
    ContactsScreen: NavigatorScreenParams<ContactsStackParamList>;
    MyProfileScreen: NavigatorScreenParams<ProfileStackParamList>;
    FormService: NavigatorScreenParams<FormServiceStackParamList>;
}

export type ContactsStackParamList = {
    ContactsMain: NavigatorScreenParams<ContactsTabParamList>;
    MyUnitContactDetail: Record<string, string> | undefined;
    CfuPhonebookContactsList: any | undefined;
    CfuPhonebookContactDetail: Record<string, string> | undefined;
}

export type ContactsTabParamList = {
    ContactsMyUnit: undefined;
    ContactsCFUPhonebook: undefined;
}

export type ProfileStackParamList = {
    ProfileScreen: undefined;
}

export type ResourceStackParamList = {
    ResourceCategories: Record<string, string> | undefined;
    ResourceList: Record<string, string> | undefined;
    Resource: Record<string, string> | undefined;
};

export type FormServiceStackParamList = {
    FormServicePage: Record<string, string> | undefined;
    FormPage: Record<string, string> | undefined;
};

export type SkillsMaintenanceStackParamList = {
    SkillsMaintenancePage: Record<string, string> | undefined;
    DrillPage: Record<string, string> | undefined;
    DrillInstructionsPage: Record<string, string> | undefined;
    DrillCardPage: Record<string, string> | undefined;
}

export type DocumentResources = {
    __metadata: {
        id: string,
        uri: string,
        type: string
    },
    AccessRid: string,
    Desktop: boolean,
    DisplayName: string,
    ParentRid: string,
    FilePath: string,
    FileType: string,
    Ui5Icon: string,
    LastModDec15: string,
    LastModDate: string,
    LastModTime: string,
    SizeBytes: number,
    SizeText: string,
}

export type FormsLauncherSet = {
    __metadata: {
        id: string,
        uri: string,
        type: string
    },
    ButtonLabel: string,
    Features: string,
    FormLaunchId: string,
    HtmlString: string,
    ImageFileName: string,
    LaunchMode: string,
    TargetUrl: string,
    Title: string,
}

export type SkillsMaintenanceCategory = {
    __metadata: {
        id: string,
        uri: string,
        type: string
    },
    Id: string,
    Name: string,
    ParentCategoryId: string,
    Active: string,
    IsPool: boolean,
    AvailableForPools: string,
    InstructionLink: string,
    QuestionImg: string,
    AnswerImg: string,
    BlurbText: string,
    CardsShown: string,
    CompletionText: string,
    CompletionImg: string,
    AnswerButtonText: string,
    QuestionButtonText: string,
}

export type SkillsMaintenanceDrillCard = {
    __metadata: {
        id: string,
        uri: string,
        type: string
    },
    Id: string,
    Name: string,
    CategoryId: string,
    Question: string,
    Answer: string,
    QuestionImg: string,
    AnswerImg: string,
    AnswerLinkUrl: string,
    QuestionLinkUrl: string,
    Active: boolean
}

export type RootStackScreenKeys = keyof RootStackParamList;
export type ProfileStackScreenKeys = keyof ProfileStackParamList;

export type NavType = NavigationContainerRefWithCurrent<RootStackParamList>;