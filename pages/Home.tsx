import { Button, TextInput, Surface, Text } from 'react-native-paper';
import { ScrollView, Image } from 'react-native';
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
        <View style={{paddingHorizontal: 20, paddingVertical: 20, backgroundColor: theme.colors.secondary}}>
            <CustomText variant='displaySmallBold' style={{color: '#fff'}}>Hi {user.Vorna}</CustomText>
        </View>
    )
}

const Services = () => {
    const theme = useTheme();
    const {services, setCurrentProfile} = useDataContext();

    //map our services into an array of tiles
    const Tiles = services.map((x) => {
        const iconMapping : any = {
            'menu-skills-maint.png' : skillsMaintIcon,
            'menu-resources.png' : resourcesIcon,
            'menu-default.png' : defaultIcon,
            'menu-forms.png' : formIcon
        }

        const imageIcon = iconMapping[x.IconFilename];

        if (x.MenuId == 'CFU-1005'){
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
        else if (x.MenuId == 'CFU-1002'){
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
        else if (x.MenuId == 'CFU-1001'){
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
            <CustomText style={{marginVertical: 15}}>You can get in touch with the CFU Admin team through the following</CustomText>
            <View style={{paddingVertical: 10, paddingHorizontal: 15, backgroundColor: '#d3d3d3ff', ...GlobalStyles.globalBorderRadius}}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <LucideIcons.Phone style={{marginRight: 20}}/>
                    <View>
                        <CustomText style={{marginBottom: 10}}>Contact Number</CustomText>
                        <CustomText>(02) 9700 1234</CustomText>
                    </View>
                </View>
                <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 20}}>
                    <LucideIcons.Mail style={{marginRight: 20}}/>
                    <View>
                        <CustomText style={{marginBottom: 10}}>Email Address</CustomText>
                        <CustomText>testemail@fire.nsw.gov.au</CustomText>
                    </View>
                </View>
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