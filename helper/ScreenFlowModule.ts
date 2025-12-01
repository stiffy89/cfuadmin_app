import { RootStackParamList } from '../types/AppTypes';
import {NavigationContainerRefWithCurrent} from '@react-navigation/native';


export class ScreenFlowModule {
    
    private navigator: NavigationContainerRefWithCurrent<RootStackParamList> | null = null;

    onInitRootNavigator(navigator: NavigationContainerRefWithCurrent<RootStackParamList>) {
        this.navigator = navigator;
    }

    onGoBack () {
        if (this.navigator?.canGoBack()){
            this.navigator?.goBack();
        }
    }

    onNavigateToScreen (screen : any, data? : any) {
       
        if (this.navigator?.isReady()){
            switch (screen) {
                case 'AllServicesListScreen' :
                    this.navigator?.navigate('AllServicesListScreen', data);
                    break;

                case 'FeedbackScreen' :
                    this.navigator?.navigate('FeedbackScreen');
                    break;

                case 'LocalAuthScreen':
                    this.navigator?.navigate('LocalAuthScreen');
                    break;
                    
                case 'SplashScreen':
                    this.navigator?.navigate('SplashScreen');
                    break;

                case 'LoginScreen' :
                    this.navigator?.navigate('LoginScreen');
                    break;

                case 'EditScreen' :
                    this.navigator?.navigate(
                        'EditScreen',
                        data
                    );
                    break;

                case 'Resources' : 
                    this.navigator?.navigate(
                        'Resources', 
                        {
                            screen: 'ResourceCategoriesPage',
                            params: data
                        }
                    );
                    break;

                case 'ResourceList' : 
                    this.navigator?.navigate(
                        'Resources', 
                        {
                            screen: 'ResourceListPage',
                            params: data
                        }
                    );
                    break;

                case 'Resource':
                    this.navigator?.navigate(
                        'Resources',
                        {
                            screen: 'ResourcePage',
                            params: data
                        }
                    )
                    break;

                case 'SkillsMaintenancePage' : 
                    this.navigator?.navigate(
                        'SkillsMaintenance', 
                        {
                            screen: 'SkillsMaintenancePage',
                            params: data
                        }
                    );
                    break;

                case 'DrillPage' : 
                    this.navigator?.navigate(
                        'SkillsMaintenance', 
                        {
                            screen: 'DrillPage',
                            params: data
                        }
                    );
                    break;
                
                case 'DrillInstructionsPage' : 
                    this.navigator?.navigate(
                        'SkillsMaintenance', 
                        {
                            screen: 'DrillInstructionsPage',
                            params: data
                        }
                    );
                    break;

                case 'DrillCardPage':
                    this.navigator?.navigate(
                        'SkillsMaintenance',
                        {
                            screen: 'DrillCardPage',
                            params: data
                        }
                    )
                    break;

                
                case 'HomeScreen' :
                    this.navigator?.navigate(
                        'MainTabs', 
                        {
                            screen: 'HomeScreen'
                        }
                    );
                    break;

                case 'ContactScreen' :
                    this.navigator?.navigate(
                        'MainTabs', 
                        {
                            screen: 'ContactsScreen',
                            params: {
                                screen : 'ContactsMain',
                                params : {
                                    screen : 'ContactsMyUnit'
                                }
                            }
                        }
                    );
                    break;

                case 'MyUnitContactDetail' :
                    this.navigator?.navigate(
                        'MainTabs', 
                        {
                            screen: 'ContactsScreen',
                            params: {
                                screen : 'MyUnitContactDetail',
                                params : data
                            }
                        }
                    );
                    break;

                case 'CfuPhonebookContactsList' :
                    this.navigator?.navigate(
                        'MainTabs', 
                        {
                            screen: 'ContactsScreen',
                            params: {
                                screen : 'CfuPhonebookContactsList',
                                params : data
                            }
                        }
                    );
                    break;

                case 'CfuPhonebookContactDetail' :
                    this.navigator?.navigate(
                        'MainTabs', 
                        {
                            screen: 'ContactsScreen',
                            params: {
                                screen : 'CfuPhonebookContactDetail',
                                params : data
                            }
                        }
                    );
                    break;

                case 'ProfileScreen':
                    this.navigator?.navigate(
                        'MainTabs', 
                        {
                            screen: 'MyProfileScreen',
                            params: {
                                screen: 'ProfileScreen'
                            }
                        }
                    );
                    break;

                case 'MyDetailsScreen':
                    this.navigator?.navigate(
                        'MyDetailsScreen', data
                    )
                    break;

                case 'ContactDetailsScreen':
                    this.navigator?.navigate(
                        'ContactDetailsScreen', data
                    )
                    break;

                case 'EmergencyContactsScreen':
                    this.navigator?.navigate(
                        'EmergencyContactsScreen', data
                    )
                    break;

                case 'MyUnitDetailsScreen':
                    this.navigator?.navigate(
                        'MyUnitDetailsScreen', data
                    )
                    break;

                case 'TrainingHistoryScreen':
                    this.navigator?.navigate(
                        'TrainingHistoryScreen', data
                    )
                    break;

                case 'TrainingDetailsScreen':
                    this.navigator?.navigate(
                        'TrainingDetailsScreen', data
                    )
                    break;

                case 'MembershipDetailsScreen':
                    this.navigator?.navigate(
                        'MembershipDetailsScreen', data
                    );
                    break;

                case 'UniformDetailsScreen':
                    this.navigator?.navigate(
                        'UniformDetailsScreen', data
                    );
                    break;

                case 'MedalsAndAwardsScreen':
                    this.navigator?.navigate(
                        'MedalsAndAwardsScreen', data
                    );
                    break;

                case 'MyMembers':
                    this.navigator?.navigate(
                        'MyMembers', data
                    );
                    break;

                case 'MyMembersProfile':
                    this.navigator?.navigate(
                        'MyMembersProfile', data
                    );
                    break;
                
                case 'FormServicePage':
                   this.navigator?.navigate(
                        'FormService', 
                        {
                            screen: 'FormServicePage',
                            params: data
                        }
                    );
                    break;

                case 'FormPage':
                    this.navigator?.navigate(
                      'FormService', 
                        {
                            screen: 'FormPage',
                            params: data
                        }
                    );
                    break;
                
                case 'TrainingMain':
                    this.navigator?.navigate(
                        'TrainingMain',
                        data
                    );
                    break;

                case 'TrainingCompletionByDrill':
                    this.navigator?.navigate(
                        'TrainingCompletionByDrill',
                        data
                    );
                    break;

                case 'TrainingCompletionByUser':
                    this.navigator?.navigate(
                        'TrainingCompletionByUser',
                        data
                    );
                    break;

                case 'PDFDisplayPage' : 
                    this.navigator?.navigate(
                        'PDFDisplayPage',
                        data
                    );
                    break;

                case 'VolAdminSearch' : 
                    this.navigator?.navigate(
                        'VolAdminSearch',
                        data
                    );
                    break;

                case 'VolAdminCeaseMember' : 
                    this.navigator?.navigate(
                        'VolAdminCeaseMember',
                        data
                    );
                    break;

                case 'VolunteerNotes':
                    this.navigator?.navigate(
                        'VolunteerNotes',
                        data
                    )
                    break;

                case 'PositionHistory':
                    this.navigator?.navigate(
                        'PositionHistory',
                        data
                    )
                    break;

                case 'EquityDiversity':
                    this.navigator?.navigate(
                        'EquityDiversity',
                        data
                    )
                    break;

                case 'ErrorPage':
                    this.navigator?.navigate(
                        'ErrorPage',
                        data
                    )
                    break;

                case 'ExternalLoginPage':
                    this.navigator?.navigate(
                        'ExternalLoginPage'
                    )
                    break;

                case 'ExternalHomePage':
                    this.navigator?.navigate(
                        'ExternalHomePage'
                    )
                    break;
            }
        }
    }

    getScreenState () {
        return this.navigator?.getCurrentRoute();
    }
}

export const screenFlowModule = new ScreenFlowModule();