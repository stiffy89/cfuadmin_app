import { View, ImageBackground, ScrollView, Pressable, Image, StyleProp, ViewStyle } from 'react-native';
import { useState } from 'react';
import CustomText from '../../assets/CustomText';
import { TextInput, Button, useTheme } from 'react-native-paper';
import { screenFlowModule } from '../../helper/ScreenFlowModule';
import headerBg from '../../assets/images/header-bg-transparent.png';
import GlobalStyles from '../../style/GlobalStyles';
import defaultIcon from '../../assets/menuicons/menu-default.png';
import CustomGrid from '../../helper/CustomGrid';
import { Phone, Mail, Heart } from 'lucide-react-native';

const NameBanner = () => {
    const theme = useTheme();

    return (
        <View style={{ height: "12%" }}>
            <View style={{ flex: 1, backgroundColor: theme.colors.background, paddingBottom: 10 }}>
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
                    <CustomText variant='displaySmallBold' style={{ color: theme.colors.background, marginHorizontal: "auto" }}>Hi John</CustomText>
                </ImageBackground>
            </View>
        </View>
    )
}

const Services = () => {
    const theme = useTheme();


    const iconMapping: any = {
        'menu-skills-maint.png': defaultIcon,
        'menu-resources.png': defaultIcon,
        'menu-default.png': defaultIcon,
        'menu-forms.png': defaultIcon,
        'menu-training.png': defaultIcon,
        'menu-all-services.png': defaultIcon
    }

    //map callbacks to the targetPaths
    const targetMapping: any = {
        "/all-services": (TargetPath: string, Title: string) => {

        },
        "/cfu-unit-details": (TargetPath: string, Title: string) => {

        },
        "/cfu-manage-members": async (TargetPath: string, Title: string) => {

        },
        "/cfu-training": (TargetPath: string, Title: string) => {

        },
        "/cfu-resources": (TargetPath: string, Title: string) => {

        },
        "/cfu-skills-maint": (TargetPath: string, Title: string) => {

        },
        "/forms-launcher": (TargetPath: string, Title: string) => {

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
            console.log(`Missing callback for service ${Title} with target ${TargetPath}, maybe broken config?`)
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

    const ServiceTiles = [];
    const services = [
        {
            IconFilename:"menu-forms.png",
            IsActive:true,
            MenuId:"CFU-1040",
            MenuRole:"CFUAPP-VOLMEM",
            SortOrder:10,
            TargetPath:"/forms-launcher/PRACTICAL-TRAINING",
            Title:"Registration"
        },
        {
            IconFilename:"menu-forms.png",
            IsActive:true,
            MenuId:"CFU-1050",
            MenuRole:"CFUAPP-VOLMEM",
            SortOrder:10,
            TargetPath:"/forms-launcher/PRACTICAL-TRAINING",
            Title:"Unit"
        },
        {
            IconFilename:"menu-forms.png",
            IsActive:true,
            MenuId:"CFU-1060",
            MenuRole:"CFUAPP-VOLMEM",
            SortOrder:10,
            TargetPath:"/forms-launcher/PRACTICAL-TRAINING",
            Title:"Training"
        },
        {
            IconFilename:"menu-forms.png",
            IsActive:true,
            MenuId:"CFU-1070",
            MenuRole:"CFUAPP-VOLMEM",
            SortOrder:10,
            TargetPath:"/forms-launcher/PRACTICAL-TRAINING",
            Title:"Contacts"
        },
        {
            IconFilename:"menu-forms.png",
            IsActive:true,
            MenuId:"CFU-1080",
            MenuRole:"CFUAPP-VOLMEM",
            SortOrder:10,
            TargetPath:"/forms-launcher/PRACTICAL-TRAINING",
            Title:"Resources"
        },
        {
            IconFilename:"menu-forms.png",
            IsActive:true,
            MenuId:"CFU-1090",
            MenuRole:"CFUAPP-VOLMEM",
            SortOrder:10,
            TargetPath:"/forms-launcher/PRACTICAL-TRAINING",
            Title:"Self Learning"
        }
    ]

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
        <View style={{ marginVertical: 20, width: "100%"}}>
            <CustomText style={{ marginVertical: 15, color: theme.colors.primary, paddingHorizontal: 15 }} variant='titleLargeBold'>My Services</CustomText>
            <CustomGrid columns={3} style={{ gap: 10, rowGap: 20 }}>
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
            <CustomText style={{marginVertical: 15}}>If you need assistance please reach out to the IT team</CustomText>
            <View style={{paddingVertical: 10, paddingHorizontal: 15, backgroundColor: '#fff', ...GlobalStyles.globalBorderRadius}}>
                <Pressable style={({pressed})=> [pressed ? {opacity: 0.6}:{opacity: 1},{flexDirection: 'row', alignItems: 'center', paddingVertical:16}]}>
                    <Phone style={{marginRight: 20}} color={theme.colors.primary}/>
                    <CustomText variant='bodyLarge'>1300 123 456</CustomText>
                </Pressable>
                <Pressable style={({pressed})=> [pressed ? {opacity: 0.6}:{opacity: 1},{flexDirection: 'row', alignItems: 'center', paddingVertical:16}]} >
                    <Mail style={{marginRight: 20}} color={theme.colors.primary}/>
                    <CustomText variant='bodyLarge'>info@fire.nsw.gov.au</CustomText>
                </Pressable>
                <Pressable style={({pressed})=> [pressed ? {opacity: 0.6}:{opacity: 1},{flexDirection: 'row', alignItems: 'center', paddingVertical:16}]} >
                    <Heart style={{marginRight: 20}} color={theme.colors.primary}/>
                    <CustomText variant='bodyLarge'>Rate this app</CustomText>
                </Pressable>
            </View>
        </View>
    )
}

const ExternalHomePage = () => {
    const theme = useTheme();



    return (
        <ScrollView contentContainerStyle={{ paddingBottom: "12%", backgroundColor: theme.colors.background }}>
            <NameBanner />
            <View style={[GlobalStyles.pageContainer]}>
                <Services/>
                <ContactUs/>
            </View>
        </ScrollView>
    )
}



export default ExternalHomePage;