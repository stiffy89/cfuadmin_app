import { useState } from 'react';
import { Button, IconButton, Portal, Dialog } from 'react-native-paper';
import { ScrollView, Image, Linking, ViewStyle, StyleProp, ImageBackground } from 'react-native';
import CustomText from '../assets/CustomText';
import { View, Pressable } from 'react-native';
import Constants from 'expo-constants';
import GlobalStyles from '../style/GlobalStyles';

import { useSecurityContext } from '../helper/SecurityContext';
import { useAppContext } from '../helper/AppContext';
import { authModule } from '../helper/AuthModule';
import { screenFlowModule } from '../helper/ScreenFlowModule';
import { useTheme, Card } from 'react-native-paper';
import Grid from '../helper/GridLayout';
import CustomGrid from '../helper/CustomGrid';
import * as LucideIcons from 'lucide-react-native';

import { useDataContext } from '../helper/DataContext';
import { ServiceData } from '../types/AppTypes';

import AsyncStorage from '@react-native-async-storage/async-storage';

//menu icons
import defaultIcon from '../assets/menuicons/menu-default.png';
import formIcon from '../assets/menuicons/menu-forms.png';
import resourcesIcon from '../assets/menuicons/menu-resources.png';
import skillsMaintIcon from '../assets/menuicons/menu-skills-maint.png';
import trainingIcon from '../assets/menuicons/menu-training.png';
import allServicesIcon from "../assets/menuicons/menu-all-services.png"
import headerBg from "../assets/images/header-bg-transparent.png"

import { dataHandlerModule } from '../helper/DataHandlerModule';
import { OktaLoginResult } from '../types/AppTypes';

const Services = () => {
    const theme = useTheme();
    const appContext = useAppContext();
    const { services, setCurrentProfile, setVolAdminMembersSearchFilter, currentUser, volAdminLastSelectedOrgUnit, setOrgUnitTeamMembers } = useDataContext();


    const iconMapping: any = {
        'menu-skills-maint.png': skillsMaintIcon,
        'menu-resources.png': resourcesIcon,
        'menu-default.png': defaultIcon,
        'menu-forms.png': formIcon,
        'menu-training.png': trainingIcon,
        'menu-all-services.png': allServicesIcon
    }

    //map callbacks to the targetPaths
    const targetMapping: any = {
        "/all-services": (TargetPath: string, Title: string) => {
            screenFlowModule.onNavigateToScreen('AllServicesListScreen', { title: Title });
        },
        "/cfu-unit-details": (TargetPath: string, Title: string) => {
            screenFlowModule.onNavigateToScreen('MyUnitDetailsScreen', { title: Title });
        },
        "/cfu-manage-members": async (TargetPath: string, Title: string) => {
            setCurrentProfile('MyMembers');


            //if we are vol admin, we will clear the filters and reset the org unit data before navigating there
            if (currentUser[0].VolAdmin) {
                appContext.setShowBusyIndicator(true);
                appContext.setShowDialog(true);

                setVolAdminMembersSearchFilter({
                    withdrawn: false,
                    unit: '',
                    station: '',
                    lastName: '',
                    firstName: '',
                    pernr: ''
                });

                const plans = volAdminLastSelectedOrgUnit[0].Zzplans;

                try {
                    const results = await dataHandlerModule.batchGet(`Members?$skip=0&$top=100&$filter=Zzplans%20eq%20%27${plans}%27%20and%20InclWithdrawn%20eq%20false`, 'Z_VOL_MANAGER_SRV', 'Members');
                    setOrgUnitTeamMembers(results.responseBody.d.results);
                    appContext.setShowDialog(false);
                } catch (error) {
                    appContext.setShowDialog(false);
                    screenFlowModule.onNavigateToScreen('ErrorPage', error);
                }
            }

            screenFlowModule.onNavigateToScreen('MyMembers', { title: Title });
        },
        "/cfu-training": (TargetPath: string, Title: string) => {
            screenFlowModule.onNavigateToScreen('TrainingMain', { title: Title });
        },
        "/cfu-resources": (TargetPath: string, Title: string) => {
            screenFlowModule.onNavigateToScreen('Resources', { title: Title });
        },
        "/cfu-skills-maint": (TargetPath: string, Title: string) => {
            screenFlowModule.onNavigateToScreen('SkillsMaintenancePage', { title: Title });
        },
        "/forms-launcher": (TargetPath: string, Title: string) => {
            screenFlowModule.onNavigateToScreen('FormServicePage', { title: Title, formLaunchId: TargetPath.substring(TargetPath.lastIndexOf("/") + 1) });
        }
    }

    const slashCount = (path: string) => {
        const regex = /(?<!:)\//g;
        const matches = path.match(regex)
        return matches ? matches.length : 0
    }

    const Tile = ({ service, style }: { service: any, style?: StyleProp<ViewStyle> }) => {
        const { IconFilename, TargetPath, Title } = service
        const imageIcon = iconMapping[IconFilename];
        let path = TargetPath;
        if (slashCount(TargetPath) > 1) {
            //we have a path param (i.e /path/param)
            path = TargetPath.substring(0, TargetPath.lastIndexOf("/"))
        }
        const callBack = targetMapping[path] ? targetMapping[path] : () => {
            const error = {
                isAxiosError: false,
                message: `Missing callback for service ${Title} with target ${TargetPath}`
            }

            screenFlowModule.onNavigateToScreen('ErrorPage', error);
        }

        return (
            <Pressable onPress={() => callBack(TargetPath, Title)} style={({ pressed }) => [pressed ? { opacity: 0.6 } : { opacity: 1 }, style, { aspectRatio: 0.75, alignItems: "center", justifyContent: "flex-start" }]}>
                <View style={{ backgroundColor: "#fff", width: "100%", aspectRatio: 1, borderRadius: 10, justifyContent: "center", alignItems: "center" }}>
                    <Image
                        source={imageIcon}
                        style={{ height: "50%", width: "50%", resizeMode: 'contain' }}
                    />
                </View>
                <CustomText variant='bodyMedium' style={{ marginTop: 5, marginHorizontal: 5, textAlign: 'center' }}>{Title}</CustomText>
            </Pressable>
        )
    }

    const ServiceTiles = []
    for (let i = 0; i < services.length; i++) {
        const service = services[i]
        if (i > 7 && services.length > 9) {
            //we only want a maximum of 9 services
            ServiceTiles.push(<Tile key={`service_${service.MenuId}`} service={{ IconFilename: "menu-all-services.png", TargetPath: "/all-services", Title: "All Services" }} />)
            break;
        } else {
            ServiceTiles.push(<Tile key={`service_${service.MenuId}`} service={service} />)
        }
    }

    return (
        <View style={{ marginVertical: 20, width: "100%" }}>
            <CustomText style={{ marginVertical: 15, color: theme.colors.primary, paddingHorizontal: 15 }} variant='titleLargeBold'>Keep your info up to date</CustomText>
            <CustomGrid columns={3} style={{ gap: 10, rowGap: 20 }}>
                {ServiceTiles}
            </CustomGrid>
        </View>
    )
}

const ContactUs = () => {
    const theme = useTheme();
    return (
        <View style={{ marginVertical: 20, paddingHorizontal: 15 }}>
            <CustomText style={{ marginVertical: 15, color: theme.colors.primary }} variant='titleLargeBold'>Contact us</CustomText>
            <CustomText style={{ marginVertical: 15 }}>If you need assistance please reach out to the CFU Team</CustomText>
            <View style={{ paddingVertical: 10, paddingHorizontal: 15, backgroundColor: '#fff', ...GlobalStyles.globalBorderRadius }}>
                <Pressable style={({ pressed }) => [pressed ? { opacity: 0.6 } : { opacity: 1 }, { flexDirection: 'row', alignItems: 'center', paddingVertical: 16 }]} onPress={() => Linking.openURL(`tel:1300 238 238`)}>
                    <LucideIcons.Phone style={{ marginRight: 20 }} color={theme.colors.primary} />
                    <CustomText variant='bodyLarge'>1300 CFU CFU (1300 238 238)</CustomText>
                </Pressable>
                <Pressable style={({ pressed }) => [pressed ? { opacity: 0.6 } : { opacity: 1 }, { flexDirection: 'row', alignItems: 'center', paddingVertical: 16 }]} onPress={() => Linking.openURL(`mailTo:cfu@fire.nsw.gov.au`)}>
                    <LucideIcons.Mail style={{ marginRight: 20 }} color={theme.colors.primary} />
                    <CustomText variant='bodyLarge'>cfu@fire.nsw.gov.au</CustomText>
                </Pressable>
                <Pressable style={({ pressed }) => [pressed ? { opacity: 0.6 } : { opacity: 1 }, { flexDirection: 'row', alignItems: 'center', paddingVertical: 16 }]} onPress={() => screenFlowModule.onNavigateToScreen("FeedbackScreen")}>
                    <LucideIcons.Heart style={{ marginRight: 20 }} color={theme.colors.primary} />
                    <CustomText variant='bodyLarge'>Rate this app</CustomText>
                </Pressable>
            </View>
        </View>
    )
}


const HomePage = () => {
    const theme = useTheme();
    const user = useDataContext().currentUser[0];
    const [showDialog, setShowDialog] = useState(false);

    return (
        <ScrollView contentContainerStyle={{ paddingBottom: "24%", backgroundColor: theme.colors.background }}>
            <Portal>
                <Dialog visible={showDialog} theme={{ colors: { primary: 'green' } }} onDismiss={() => setShowDialog(!showDialog)}>
                    <Dialog.Content>
                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                            <LucideIcons.LogOut size={30} color={theme.colors.primary}/>
                            <CustomText style={{marginLeft: 20}} variant='bodyLarge'>
                                Are you sure you want to log out?
                            </CustomText>
                        </View>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setShowDialog(false)} textColor={theme.colors.secondary}>Cancel</Button>
                        <Button 
                            onPress={() => {
                                setShowDialog(false);
                                authModule.onLogOut()
                            }} 
                            textColor={theme.colors.secondary} 
                        >
                            Log Out
                        </Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
            <View style={{ height: "18%" }}>
                <View style={{ flex: 1, backgroundColor: theme.colors.background, paddingBottom: 10 }}>
                    <ImageBackground imageStyle={{ top: "-20%" }} source={headerBg}
                        style={{
                            position: "relative",
                            flex: 1,
                            backgroundColor: theme.colors.primary,
                            flexDirection: 'row',
                            alignItems: "flex-end",
                            paddingHorizontal: 20,
                            paddingVertical: 20,
                            boxShadow: "0px 1px 5px rgba(0, 0, 0, 0.6)",
                            overflow: "hidden"
                        }}>
                        <CustomText variant='displaySmallBold' style={{ color: theme.colors.background, marginHorizontal: "auto" }}>Hi {user.Vorna}</CustomText>
                        <View style={{ position: "absolute", right: 0, top: Constants.statusBarHeight }}>
                            <IconButton icon={() => <LucideIcons.LogOut color={theme.colors.background} size={30} />} size={30}
                                style={{ backgroundColor: "rgba(188, 21, 0, 0.5)" }}
                                onPress={async () => {
                                    //show them a warning dialog for logging out
                                    setShowDialog(true);
                                }} />
                        </View>
                    </ImageBackground>
                </View>
            </View>
            <View style={[GlobalStyles.pageContainer]}>
                <Services />
                <ContactUs />
            </View>
        </ScrollView>
    )
}

export default HomePage;