import React, { useEffect } from "react";
import { View, ScrollView } from "react-native";
import { useTheme, Button, IconButton } from "react-native-paper";
import * as LucideIcons from "lucide-react-native";
import CustomText from "../../assets/CustomText";

import { StackScreenProps } from "@react-navigation/stack";
import { SkillsMaintenanceStackParamList } from "../../types/AppTypes";

import { useAppContext } from "../../helper/AppContext";

import { screenFlowModule } from "../../helper/ScreenFlowModule";
import CustomIcon from "../../assets/CustomIcon";

type props = StackScreenProps<SkillsMaintenanceStackParamList, "DrillPage">;

const DrillPage = ({ route, navigation }: props) => {
    const { setShowDialog, setShowBusyIndicator } = useAppContext();
    const theme = useTheme();
    const params = route.params ?? {};
    const category = params
    
    const drillNum = category.Name.includes("-") ? category.Name.substring(0, category.Name.indexOf("-")):null;
    const drillName = category.Name.includes("-") ? category.Name.substring(category.Name.indexOf("-") + 2):category.Name
    
    useEffect(() => {
        setShowBusyIndicator(false);
        setShowDialog(false);
    }, [])

    const navigate = () => {
        setShowBusyIndicator(true);
        setShowDialog(true);
            
        setTimeout(() => {    
          screenFlowModule.onNavigateToScreen("DrillCardPage", category);
        }, 500);
    };

    return (
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
            <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 20, marginBottom: 10}}>
                <IconButton icon={() => <LucideIcons.ChevronLeft color={theme.colors.primary} size={25}/>} size={20} onPress={() => screenFlowModule.onGoBack()} />
            </View>
            <ScrollView
                style={{ flex: 1, backgroundColor: "#fff", marginBottom:75 }}
                contentContainerStyle={{ }}
            >
                <View>
                    {drillNum && <CustomText style={{marginHorizontal: 20}} variant='titleLarge'>{drillNum}</CustomText>}
                    <CustomText style={{marginHorizontal: 20}} variant='titleLargeBold'>{drillName}</CustomText>
                    <CustomText style={{marginHorizontal: 20, marginTop: 20}} variant='bodyLarge'>{category.BlurbText}</CustomText>
                </View>
            </ScrollView>
            <View style={{position: "absolute", bottom: 10, width: "100%", gap: 10 }}>
                <Button icon={() => <CustomIcon name="File" color={theme.colors.primary} size={20}/>}style={{marginHorizontal: 20, borderRadius: 10, borderColor: theme.colors.primary}} contentStyle={{height: 50}} mode="outlined"  onPress={() => console.log("Open Instructions")} >
                    <CustomText style={{marginLeft: 20, color: theme.colors.primary}} variant='titleMediumBold'>Open instructions</CustomText>
                </Button>
                <Button style={{marginHorizontal: 20, borderRadius: 10}} contentStyle={{height: 50}} mode="contained" buttonColor={theme.colors.primary} onPress={navigate} >
                    <CustomText style={{marginLeft: 20, color: "#fff"}} variant='titleMediumBold'>Begin group discussion</CustomText>
                </Button>
            </View>
        </View>
    )
}


export default DrillPage;