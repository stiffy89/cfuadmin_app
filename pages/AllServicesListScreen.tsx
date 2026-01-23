import React, {useEffect, useState } from "react";
import { View, ScrollView, Pressable, Image } from "react-native";
import { useTheme, IconButton, Divider, Searchbar} from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CustomText from "../assets/CustomText";

import * as LucideIcons from 'lucide-react-native';

import { StackScreenProps } from "@react-navigation/stack";
import { RootStackParamList} from "../types/AppTypes";

import { useAppContext } from "../helper/AppContext";
import { useDataContext } from "../helper/DataContext";

import { screenFlowModule } from "../helper/ScreenFlowModule";

//menu icons
import defaultIcon from '../assets/new_menuicons/menu-default.png';
import formIcon from '../assets/new_menuicons/menu-forms.png';
import resourcesIcon from '../assets/new_menuicons/menu-resources.png';
import skillsMaintIcon from '../assets/new_menuicons/menu-skills-maint.png';
import trainingIcon from '../assets/new_menuicons/menu-training.png';
import allServicesIcon from "../assets/new_menuicons/menu-all-services.png";
import annualInventoryCheckIcon from '../assets/new_menuicons/menu-annual-inventory-check.png';
import idCardReplacementIcon from '../assets/new_menuicons/menu-id-card-replacement.png';
import maintenanceIcon from '../assets/new_menuicons/menu-maintenance.png';
import manageMembersIcon from '../assets/new_menuicons/menu-manage-members2.png';
import membershipDeregistrationIcon from '../assets/new_menuicons/menu-membership-deregistration.png';
import uniformReplacementIcon from '../assets/new_menuicons/menu-uniform-replacement.png';
import unitDetailsIcon from '../assets/new_menuicons/menu-unit-details.png';
import practicalTrainingRegistrationIcon from '../assets/new_menuicons/menu-practical-training-registration.png';
import menuEquipmentRepair from '../assets/new_menuicons/menu-equipment-repair.png';


type props = StackScreenProps<RootStackParamList, "AllServicesListScreen">;

const AllServicesListScreen = ({ route, navigation }: props) => {
    const insets = useSafeAreaInsets();
    const {services, setCurrentProfile, currentUser} = useDataContext();
    const [searchValue, setSearchValue] = useState("");
    const [serviceList, setServiceList] = useState<any[]>([])
    
    const theme = useTheme();    
    const params = route.params ?? {};
    
    const iconMapping : any = {
        'menu-default.png': defaultIcon,
        'menu-forms.png': formIcon,
        'menu-resources.png': resourcesIcon,
        'menu-skills-maint.png': skillsMaintIcon,
        'menu-training.png': trainingIcon,
        'menu-all-services.png': allServicesIcon,
        'menu-annual-inventory-check.png': annualInventoryCheckIcon,
        'menu-id-card-replacement.png': idCardReplacementIcon,
        'menu-maintenance.png': maintenanceIcon,
        'menu-manage-members2.png': manageMembersIcon,
        'menu-membership-deregistration.png': membershipDeregistrationIcon,
        'menu-uniform-replacement.png': uniformReplacementIcon,
        'menu-unit-details.png': unitDetailsIcon,
        'menu-practical-training-registration.png': practicalTrainingRegistrationIcon,
        'menu-equipment-repair.png' : menuEquipmentRepair
    };
    
    //map callbacks to the targetPaths
    const targetMapping: any = {
        "/cfu-unit-details": (TargetPath: string, Title: string) => {
            // screenFlowModule.onNavigateToScreen('MyUnitDetailsScreen', {title: Title});
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

    useEffect(() => {
        setServiceList(services)
    }, [])

    const filterAndFormatList = (query: string, results?: any[]) => {
        let filteredList;
        let dataList = services;

        if (query) {
            filteredList = dataList.filter((x) => {
                if (x.Title.toLowerCase().includes(query.toLowerCase())) {
                    return x;
                }
            });
        } else {
            filteredList = dataList;
        }

        return filteredList;
    };

    const slashCount = (path:string) => {
        const regex = /(?<!:)\//g;
        const matches = path.match(regex)
        return matches ? matches.length : 0
    }

    const navigate = (service: any) => {
        const {IconFilename, TargetPath, Title} = service
        let path = TargetPath;
        if(slashCount(TargetPath) > 1){
            //we have a path param (i.e /path/param)
            path = TargetPath.substring(0, TargetPath.lastIndexOf("/"))
        }
        const callBack = targetMapping[path] ? targetMapping[path] : () => {
            console.log(`Missing callback for service ${Title} with target ${TargetPath}, maybe broken config?`)
        }
        
        //close the list first
        //screenFlowModule.onGoBack()
        callBack(TargetPath, Title)
    }

    return (
        <View style={{ flex: 1, backgroundColor: "#fff", marginTop: 5, borderTopLeftRadius: 25, borderTopRightRadius: 25, boxShadow: "0px 5px 10px rgba(0, 0, 0, 0.8)", paddingBottom: insets.bottom }}>
            <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 20, marginBottom: 10}}>
                <IconButton icon={() => <LucideIcons.ChevronLeft color={theme.colors.primary} size={25}/>} size={20} onPress={() => screenFlowModule.onGoBack()} />
                <CustomText style={{marginLeft: 20}} variant='titleLargeBold'>{params.title}</CustomText>
            </View>
            <Searchbar
                style={{
                    marginVertical: 20,
                    marginHorizontal: 20,
                    backgroundColor: theme.colors.surfaceVariant,
                }}
                placeholder="Search"
                value={searchValue}
                onChangeText={(text) => {
                    const filterResult = filterAndFormatList(text);
                    setServiceList(filterResult);
                    setSearchValue(text);
                }}
            />
            <ScrollView style={{ backgroundColor: theme.colors.background }}>
                {serviceList.map((service: any, i) => {
                    return (
                        <React.Fragment key={`service_${service.MenuId}`}>
                        <Divider />
                        <Pressable style={({ pressed }) => [pressed ? {opacity: 0.6} : {opacity: 1}, {flexDirection: "row", gap: 15, justifyContent: "space-between", alignItems:"center", marginHorizontal: 20, paddingVertical: 10}]} onPress={() => navigate(service)}>
                            <View>
                                <Image source={iconMapping[service.IconFilename] ? iconMapping[service.IconFilename] : defaultIcon} style={{ height: 50, aspectRatio: 1, resizeMode: 'contain' }} />
                            </View>
                            <CustomText style={{flex: 1, flexWrap: "wrap"}}variant='bodyLarge'>{service.Title}</CustomText>
                            <LucideIcons.ChevronRight color={theme.colors.primary} />
                        </Pressable>
                        <Divider />
                        </React.Fragment>
                    );
                })}
            </ScrollView>
        </View>
    );
};

export default AllServicesListScreen