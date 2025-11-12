import { Button, TextInput, Surface, Text } from 'react-native-paper';
import { ScrollView, Image, Linking } from 'react-native';
import CustomText from '../assets/CustomText';
import { View, Pressable } from 'react-native';
import GlobalStyles from '../style/GlobalStyles';

import { useSecurityContext } from '../helper/SecurityContext';
import { useAppContext } from '../helper/AppContext';
import { authModule } from '../helper/AuthModule';
import { screenFlowModule } from '../helper/ScreenFlowModule';
import { useTheme, Card } from 'react-native-paper';
import Grid from '../helper/GridLayout';
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

const NameBanner = () => {
    const theme = useTheme();
    const user = useDataContext().currentUser[0];

    return (
        <View style={{paddingHorizontal: 20, paddingVertical: 20, backgroundColor: theme.colors.secondary, flexDirection: 'row', justifyContent: 'space-between'}}>
            <CustomText variant='displaySmallBold' style={{color: theme.colors.background}}>Hi {user.Vorna}</CustomText>
            <Button 
                textColor={theme.colors.background} 
                mode='outlined'
                onPress={async () => {
                    await AsyncStorage.removeItem('localAuthToken');
                    screenFlowModule.onNavigateToScreen('Users');
                }}
            >Log Out</Button>
        </View>
    )
}

const Services = () => {
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

const ContactUs = () => {
    const theme = useTheme();
    return (
        <View style={{marginVertical: 20, paddingHorizontal: 15}}>
            <CustomText style={{marginVertical: 15, color: theme.colors.primary}} variant='titleLargeBold'>Contact Us</CustomText>
            <CustomText style={{marginVertical: 15}}>If you need assistance please reach out to the CFU Team</CustomText>
            <View style={{paddingVertical: 10, paddingHorizontal: 15, backgroundColor: '#d3d3d3ff', ...GlobalStyles.globalBorderRadius}}>
                <Pressable style={({pressed})=> [pressed ? {opacity: 0.6}:{opacity: 1},{flexDirection: 'row', alignItems: 'center'}]} onPress={() => Linking.openURL(`tel:1300 238 238`)}>
                    <LucideIcons.Phone style={{marginRight: 20}} color={theme.colors.primary}/>
                    <CustomText variant='bodyLarge'>1300 CFU CFU (1300 238 238)</CustomText>
                </Pressable>
                <Pressable style={({pressed})=> [pressed ? {opacity: 0.6}:{opacity: 1},{flexDirection: 'row', alignItems: 'center', marginTop: 20}]} onPress={() => Linking.openURL(`mailTo:cfu@fire.nsw.gov.au`)}>
                    <LucideIcons.Mail style={{marginRight: 20}} color={theme.colors.primary}/>
                    <CustomText variant='bodyLarge'>cfu@fire.nsw.gov.au</CustomText>
                </Pressable>
                <Pressable style={({pressed})=> [pressed ? {opacity: 0.6}:{opacity: 1},{flexDirection: 'row', alignItems: 'center', marginTop: 20}]} onPress={() => screenFlowModule.onNavigateToScreen("FeedbackScreen")}>
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
        <ScrollView>
            <NameBanner/>
            <View style={[GlobalStyles.pageContainer, {backgroundColor: theme.colors.background}]}>
                <Services/>
                <ContactUs/>
            </View>
        </ScrollView>
    )
}

export default HomePage;