import React, { useEffect, useState } from "react";
import { View, ScrollView, Pressable, Image } from "react-native";
import { useTheme, IconButton } from "react-native-paper";
import * as LucideIcons from "lucide-react-native";
import CustomText from "../../assets/CustomText";

import { StackScreenProps } from "@react-navigation/stack";
import { SkillsMaintenanceCategory, SkillsMaintenanceStackParamList } from "../../types/AppTypes";

import { useAppContext } from "../../helper/AppContext";

import { screenFlowModule } from "../../helper/ScreenFlowModule";
import { resourceDataHandlerModule } from "../../helper/ResourcesDataHandlerModule";


const loadSkillsMaintenanceCategories = async () => {
    const skillsMaitenanceCategories = await resourceDataHandlerModule.getSkillsMaintenanceCategories()

    const responseText = skillsMaitenanceCategories.data;
    const boundary = responseText.match(/^--[A-Za-z0-9]+/)[0];
    const parts = responseText.split(boundary);
    const jsonPart = parts.find((p: string | string[]) =>
        p.includes("application/json")
      );
    const jsonBody = jsonPart.split("\r\n\r\n").pop();
    const data = JSON.parse(jsonBody);
    
    return data.d.results;
}

type props = StackScreenProps<SkillsMaintenanceStackParamList, "SkillsMaintenancePage">;

const SkillsMaintenancePage = ({ route, navigation }: props) => {
    const { setShowDialog, setShowBusyIndicator } = useAppContext();
    const [categories, setCategories] = useState<SkillsMaintenanceCategory[]>([])

    const theme = useTheme();
    const params = route.params ?? {};

    useEffect(() => {
        loadSkillsMaintenanceCategories().then((res) => {
            setCategories(res)
            
            setShowBusyIndicator(false);
            setShowDialog(false);
        });
      }, []);

    const navigate = (category:SkillsMaintenanceCategory) => {
        setShowBusyIndicator(true);
        setShowDialog(true);
            
        setTimeout(() => {    
          screenFlowModule.onNavigateToScreen("DrillPage", category);
        }, 500);
    };

    return (
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
            <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 20, marginBottom: 10}}>
                <IconButton icon={() => <LucideIcons.ChevronLeft color={theme.colors.primary} size={25}/>} size={20} onPress={() => screenFlowModule.onGoBack()} />
                <CustomText style={{marginLeft: 20}} variant='titleLargeBold'>Skills Maintenance</CustomText>
            </View>
            <ScrollView
                style={{ flex: 1, backgroundColor: theme.colors.background }}
                contentContainerStyle={{ paddingBottom: 0 }}
            >
                <View style={{ marginVertical: 20 }}>
                    <View style={{flexDirection: "row", flexWrap:"wrap", justifyContent: "center", gap: 20}}>
                    {
                        categories.map((category:SkillsMaintenanceCategory, index) => {
                        return (
                            <Pressable
                                key={index}
                                style={({ pressed }) => [pressed ? {opacity: 0.3} : {opacity: 1}, { alignItems: "center"}]}
                                onPress={() => navigate(category)}
                            >
                                <View style={{borderTopLeftRadius: 5, borderTopRightRadius: 5, width: 175, height: 90, alignItems: "center", justifyContent: "center"}}>
                                    <Image source={{uri: `data:image/png;base64,${category.QuestionImg}`}} style={{height: "100%", width: "100%", borderTopLeftRadius: 5, borderTopRightRadius: 5}} resizeMode="cover"/>
                                </View>
                                <View style={{backgroundColor: "#fff",flex: 0, flexDirection: "row", borderBottomLeftRadius: 5, borderBottomRightRadius: 5, padding: 5, width: 175, height: 50, alignItems: "center", justifyContent: "center"}}>
                                    <View style={{flex: 5, height:"100%" }}>
                                        <CustomText
                                            variant="bodyMedium"
                                            style={{}}
                                        >
                                            {category.Name}
                                        </CustomText>
                                    </View>
                                    {/* <View style={{flex: 1, justifyContent: "center", alignItems: "center"  }}>
                                        <CustomIcon style={{ width: "100%" }} size={20} name={"Info"} color={theme.colors.primary} />
                                        <CustomText
                                            variant="bodySmall"
                                        >
                                        0/5
                                        </CustomText>
                                    </View> */}
                                </View>
                            </Pressable>
                        );
                        })
                    }
                    </View>
                </View>
            </ScrollView>
        </View>
    )
}

export default SkillsMaintenancePage;