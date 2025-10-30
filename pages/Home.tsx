import { Button, TextInput, Surface, Text } from 'react-native-paper';
import { ScrollView } from 'react-native';
import CustomText from '../assets/CustomText';
import { View } from 'react-native';
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

const NameBanner = () => {
    const theme = useTheme();
    const {employeeDetails} = useDataContext();
    const employee = employeeDetails[0];

    return (
        <View style={{paddingHorizontal: 20, paddingVertical: 20, backgroundColor: theme.colors.secondary}}>
            <CustomText variant='displaySmallBold' style={{color: '#fff'}}>Hi {employee.Vorna}</CustomText>
        </View>
    )
}

const Services = () => {
    const theme = useTheme();
    const {services} = useDataContext();

    //map our services into an array of tiles
    const Tiles = services.map((x) => {
        return (
            <View style={{alignItems: 'center', padding: 10}}>
                <LucideIcons.Image style={{width: '100%'}} size={24}/>
                <CustomText variant='bodySmall' style={{marginTop: 10, textAlign: 'center'}}>{x.title}</CustomText>
            </View>
        )
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