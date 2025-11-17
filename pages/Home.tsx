import { Button, TextInput, Surface, Text, IconButton } from 'react-native-paper';
import { ScrollView, Image, Linking, ViewStyle, StyleProp, ImageBackground } from 'react-native';
import CustomText from '../assets/CustomText';
import { View, Pressable } from 'react-native';
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


const NameBanner = () => {
    const theme = useTheme();
    const user = useDataContext().currentUser[0];

    return (
        <View style={{height: "12%"}}>
            <View style={{flex: 1, backgroundColor: theme.colors.background, paddingBottom: 10}}>
            <ImageBackground imageStyle={{ top: "-120%", }} source={headerBg} 
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
                <CustomText variant='displaySmallBold' style={{color: theme.colors.background, marginHorizontal: "auto"}}>Hi {user.Vorna}</CustomText>
                <View style={{position: "absolute", right: 0, top: 0}}>
                    <IconButton icon={() => <LucideIcons.LogOut color={theme.colors.background} size={30}/>} size={30} 
                        style={{backgroundColor: "rgba(188, 21, 0, 0.5)"}}
                        onPress={async () => {
                            await AsyncStorage.removeItem('localAuthToken');
                            screenFlowModule.onNavigateToScreen('Users');
                        }} />
                </View>
            </ImageBackground>
            </View>
        </View>
    )
}

const LegacyServices = () => {
    const theme = useTheme();
    const {services, setCurrentProfile, currentUser} = useDataContext();

    //map our services into an array of tiles
    const Tiles = services.map((x) => {
        const iconMapping : any = {
            'menu-skills-maint.png' : skillsMaintIcon,
            'menu-resources.png' : resourcesIcon,
            'menu-default.png' : defaultIcon,
            'menu-forms.png' : formIcon,
            'menu-training.png' : trainingIcon
        }

        const imageIcon = iconMapping[x.IconFilename];
        
        if (x.TargetPath == '/cfu-my-members'){
            return (
                <Pressable
                    onPress={() => {
                        setCurrentProfile('MyMembers');
                        screenFlowModule.onNavigateToScreen('MyMembers');
                    }}
                >
                    <View style={{alignItems: 'center', padding: 10}}>
                        <Image
                            source={imageIcon}
                            style={{ width: 30, height: 30, resizeMode: 'contain' }}
                        />
                        <CustomText variant='bodySmall' style={{marginTop: 10, textAlign: 'center'}}>{x.Title}</CustomText>
                    </View>
                </Pressable>
            )
        }
        else if (x.TargetPath == '/cfu-unit-details'){
            return (
                <Pressable
                    onPress={() => {
                        screenFlowModule.onNavigateToScreen('MyUnitDetailScreen');
                    }}
                >
                    <View style={{alignItems: 'center', padding: 10}}>
                        <Image
                            source={imageIcon}
                            style={{ width: 30, height: 30, resizeMode: 'contain' }}
                        />
                        <CustomText variant='bodySmall' style={{marginTop: 10, textAlign: 'center'}}>{x.Title}</CustomText>
                    </View>
                </Pressable>
            )
        }
        else if (x.TargetPath == '/cfu-training'){
            return (
                <Pressable
                    onPress={() => {
                        screenFlowModule.onNavigateToScreen('TrainingMain');
                    }}
                >
                    <View style={{alignItems: 'center', padding: 10}}>
                        <Image
                            source={imageIcon}
                            style={{ width: 30, height: 30, resizeMode: 'contain' }}
                        />
                        <CustomText variant='bodySmall' style={{marginTop: 10, textAlign: 'center'}}>{x.Title}</CustomText>
                    </View>
                </Pressable>
            )
        }
        else if (x.TargetPath == '/cfu-resources'){
            return (
                <Pressable
                    onPress={() => {
                        screenFlowModule.onNavigateToScreen('Resources');
                    }}
                >
                    <View style={{alignItems: 'center', padding: 10}}>
                        <Image
                            source={imageIcon}
                            style={{ width: 30, height: 30, resizeMode: 'contain' }}
                        />
                        <CustomText variant='bodySmall' style={{marginTop: 10, textAlign: 'center'}}>{x.Title}</CustomText>
                    </View>
                </Pressable>
            )
        }
        else if (x.TargetPath == '/cfu-skills-maint'){
            return (
                <Pressable
                    onPress={() => {
                        screenFlowModule.onNavigateToScreen('SkillsMaintenancePage');
                    }}
                >
                    <View style={{alignItems: 'center', padding: 10}}>
                        <Image
                            source={imageIcon}
                            style={{ width: 30, height: 30, resizeMode: 'contain' }}
                        />
                        <CustomText variant='bodySmall' style={{marginTop: 10, textAlign: 'center'}}>{x.Title}</CustomText>
                    </View>
                </Pressable>
            )
        }else if(x.TargetPath.includes("/forms-launcher")){
            return (
                <Pressable
                    onPress={() => {
                        screenFlowModule.onNavigateToScreen('FormServicePage', {formLaunchId: x.TargetPath.substring(x.TargetPath.lastIndexOf("/") + 1)});
                    }}
                >
                    <View style={{alignItems: 'center', padding: 10}}>
                        <Image
                            source={imageIcon}
                            style={{ width: 30, height: 30, resizeMode: 'contain' }}
                        />
                        <CustomText variant='bodySmall' style={{marginTop: 10, textAlign: 'center'}}>{x.Title}</CustomText>
                    </View>
                </Pressable>
            )
        }
        else {
            return (
                <View style={{alignItems: 'center', padding: 10}}>
                    <Image
                        source={imageIcon}
                        style={{ width: 30, height: 30, resizeMode: 'contain' }}
                    />
                    <CustomText variant='bodySmall' style={{marginTop: 10, textAlign: 'center'}}>{x.Title}</CustomText>
                </View>
            )
        }
    });

    return (
        <View style={{marginVertical: 20}}>
            <CustomText style={{marginVertical: 15, color: theme.colors.primary, paddingHorizontal: 15}} variant='titleLargeBold'>Services</CustomText>
            {
                Grid(Tiles, 3, undefined, '#fff', true)
            }
        </View>
    )
}

const Services = () => {
    const theme = useTheme();
    const {services, setCurrentProfile, currentUser} = useDataContext();

    const iconMapping : any = {
        'menu-skills-maint.png' : skillsMaintIcon,
        'menu-resources.png' : resourcesIcon,
        'menu-default.png' : defaultIcon,
        'menu-forms.png' : formIcon,
        'menu-training.png' : trainingIcon,
        'menu-all-services.png' : allServicesIcon
    }
    
    //map callbacks to the targetPaths
    const targetMapping: any = {
        "/all-services" : (TargetPath: string, Title: string) => {
            screenFlowModule.onNavigateToScreen('AllServicesListScreen', {title: Title});
        },
        "/cfu-unit-details": (TargetPath: string, Title: string) => {
            screenFlowModule.onNavigateToScreen('MyUnitDetailsScreen', {title: Title});
        },
        "/cfu-manage-members" : (TargetPath: string, Title: string) => {
            setCurrentProfile('MyMembers');
            screenFlowModule.onNavigateToScreen('MyMembers', {title: Title});
        },
        "/cfu-training": (TargetPath: string, Title: string) => {
            screenFlowModule.onNavigateToScreen('TrainingMain', {title: Title});
        },
        "/cfu-resources": (TargetPath: string, Title: string) => {
            screenFlowModule.onNavigateToScreen('Resources', {title: Title});
        },
        "/cfu-skills-maint": (TargetPath: string, Title: string) => {
            screenFlowModule.onNavigateToScreen('SkillsMaintenancePage', {title: Title});
        },
        "/forms-launcher": (TargetPath: string, Title: string) => {
            screenFlowModule.onNavigateToScreen('FormServicePage', {title: Title, formLaunchId: TargetPath.substring(TargetPath.lastIndexOf("/") + 1)});
        }
    }

    const slashCount = (path:string) => {
        const regex = /(?<!:)\//g;
        const matches = path.match(regex)
        return matches ? matches.length : 0
    }

    const Tile = ({service, style}:{service: any, style?: StyleProp<ViewStyle>}) => {
        const {IconFilename, TargetPath, Title} = service
        const imageIcon = iconMapping[IconFilename];
        let path = TargetPath;
        if(slashCount(TargetPath) > 1){
            //we have a path param (i.e /path/param)
            path = TargetPath.substring(0, TargetPath.lastIndexOf("/"))
        }
        const callBack = targetMapping[path] ? targetMapping[path] : () => {
            console.log(`Missing callback for service ${Title} with target ${TargetPath}, maybe broken config?`)
        }

        return (
            <Pressable onPress={() => callBack(TargetPath, Title)} style={({ pressed }) => [pressed ? {opacity: 0.6} : {opacity: 1}, style, {aspectRatio: 0.75, alignItems: "center", justifyContent: "flex-start"}]}>
                <View style={{backgroundColor:"#fff", width: "100%", aspectRatio: 1, borderRadius: 10, justifyContent: "center", alignItems: "center"}}>
                    <Image
                        source={imageIcon}
                        style={{ height: "50%", width: "50%", resizeMode: 'contain' }}
                    />
                </View>
                <CustomText variant='bodyMedium' style={{marginTop: 5, marginHorizontal: 5, textAlign: 'center'}}>{Title}</CustomText>
            </Pressable>
        )
    }

    const ServiceTiles = []
    for(let i = 0; i < services.length; i++) {
        const service = services[i]
        if(i > 7 && services.length > 9){
            //we only want a maximum of 9 services
            ServiceTiles.push(<Tile key={`service_${service.MenuId}`} service={{IconFilename: "menu-all-services.png", TargetPath: "/all-services", Title: "All Services"}}/>)
            break;
        }else {
            ServiceTiles.push(<Tile key={`service_${service.MenuId}`} service={service}/>)
        }
    }

    return (
        <View style={{marginVertical: 20, width: "100%"}}>
            <CustomText style={{marginVertical: 15, color: theme.colors.primary, paddingHorizontal: 15}} variant='titleLargeBold'>Keep your info up to date</CustomText>
            <CustomGrid columns={3} style={{gap: 10, rowGap: 20}}>
                {ServiceTiles}
            </CustomGrid>
        </View>
    )
}

const ContactUs = () => {
    const theme = useTheme();
    return (
        <View style={{marginVertical: 20, paddingHorizontal: 15}}>
            <CustomText style={{marginVertical: 15, color: theme.colors.primary}} variant='titleLargeBold'>Contact us</CustomText>
            <CustomText style={{marginVertical: 15}}>If you need assistance please reach out to the CFU Team</CustomText>
            <View style={{paddingVertical: 10, paddingHorizontal: 15, backgroundColor: '#fff', ...GlobalStyles.globalBorderRadius}}>
                <Pressable style={({pressed})=> [pressed ? {opacity: 0.6}:{opacity: 1},{flexDirection: 'row', alignItems: 'center', paddingVertical:16}]} onPress={() => Linking.openURL(`tel:1300 238 238`)}>
                    <LucideIcons.Phone style={{marginRight: 20}} color={theme.colors.primary}/>
                    <CustomText variant='bodyLarge'>1300 CFU CFU (1300 238 238)</CustomText>
                </Pressable>
                <Pressable style={({pressed})=> [pressed ? {opacity: 0.6}:{opacity: 1},{flexDirection: 'row', alignItems: 'center', paddingVertical:16}]} onPress={() => Linking.openURL(`mailTo:cfu@fire.nsw.gov.au`)}>
                    <LucideIcons.Mail style={{marginRight: 20}} color={theme.colors.primary}/>
                    <CustomText variant='bodyLarge'>cfu@fire.nsw.gov.au</CustomText>
                </Pressable>
                <Pressable style={({pressed})=> [pressed ? {opacity: 0.6}:{opacity: 1},{flexDirection: 'row', alignItems: 'center', paddingVertical:16}]} onPress={() => screenFlowModule.onNavigateToScreen("FeedbackScreen")}>
                    <LucideIcons.Heart style={{marginRight: 20}} color={theme.colors.primary}/>
                    <CustomText variant='bodyLarge'>Rate this app</CustomText>
                </Pressable>
            </View>
        </View>
    )
}


const HomePage = () => {
    const theme = useTheme();
    const { setShowBusyIndicator, setDialogMessage, setShowDialog } = useAppContext();
    const {setAuthType} = useSecurityContext();

    return (
        <ScrollView contentContainerStyle={{paddingBottom: "12%", backgroundColor: theme.colors.background}}>
            <NameBanner/>
            <View style={[GlobalStyles.pageContainer]}>
                <Services/>
                <ContactUs/>
            </View>
        </ScrollView>
    )
}

export default HomePage;