import React, { useEffect, useState } from "react";
import { View, ScrollView, Pressable, Image, PixelRatio } from "react-native";
import { useTheme, IconButton } from "react-native-paper";
import * as LucideIcons from "lucide-react-native";
import CustomText from "../../assets/CustomText";

import { StackScreenProps } from "@react-navigation/stack";
import { SkillsMaintenanceCategory, SkillsMaintenanceStackParamList } from "../../types/AppTypes";

import { useAppContext } from "../../helper/AppContext";

import { screenFlowModule } from "../../helper/ScreenFlowModule";
import { dataHandlerModule } from "../../helper/DataHandlerModule";


const loadSkillsMaintenanceCategories = async (setShowDialog: (vaL:boolean) => void) => {
    try{
        const skillsMaitenanceCategories = await dataHandlerModule.batchGet("Categories?$filter=ParentCategoryId%20eq%20%270000000000%27", "Z_CFU_FLASHCARDS_SRV", "Categories")
        const data = skillsMaitenanceCategories.responseBody.d.results;

        return data;
    }catch (error){
        setShowDialog(false);
		screenFlowModule.onNavigateToScreen('ErrorPage', error);
    }
}

type props = StackScreenProps<SkillsMaintenanceStackParamList, "SkillsMaintenancePage">;

const SkillsMaintenancePage = ({ route, navigation }: props) => {
    const { setShowDialog, setShowBusyIndicator } = useAppContext();
    const [categories, setCategories] = useState<SkillsMaintenanceCategory[]>([])
    const [maxWidth, setMaxWidth] = useState<number>()

    const theme = useTheme();
    const params = route.params ?? {};
    const fontScale = Math.round(PixelRatio.getFontScale() * 10) / 10;
    
    useEffect(() => {
        loadSkillsMaintenanceCategories(setShowDialog).then((res) => {
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

    //adjust card and text container height based on fontScale
    const cardHeight = fontScale >= 1.3 ? 180 : 90
    const textContHeight = fontScale >= 1.3 ? 80 : 50
    const cardGap = fontScale * 20
    return (
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
            <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 20, marginBottom: 10}}>
                <IconButton icon={() => <LucideIcons.ChevronLeft color={theme.colors.primary} size={25}/>} size={20} onPress={() => screenFlowModule.onGoBack()} />
                <CustomText style={{marginLeft: 20}} variant='titleLargeBold'>{params.title}</CustomText>
            </View>
            <ScrollView style={{ flex: 1, width:"100%", backgroundColor: theme.colors.background }} contentContainerStyle={{paddingBottom: "20%", flexDirection: "row", flexWrap:"wrap", justifyContent: "flex-start", gap: cardGap, margin: 20}}>
                {
                    categories.map((category:SkillsMaintenanceCategory, index) => {
                    return (
                        <Pressable
                            key={index}
                            style={({ pressed }) => [pressed ? {opacity: 0.6} : {opacity: 1}, {flexGrow: 1, maxWidth: maxWidth, alignItems: "center", height: cardHeight, aspectRatio: 1.8, marginBottom: 50}]}
                            onPress={() => navigate(category)}
                            onLayout={(e) => {
                                if(index == 0){
                                    setMaxWidth(e.nativeEvent.layout.width)
                                }
                            }}
                        >
                            <View style={{borderTopLeftRadius: 5, borderTopRightRadius: 5, alignItems: "center", justifyContent: "center", width: "100%"}}>
                                <Image source={{uri: `data:image/png;base64,${category.QuestionImg}`}} style={{height: "100%", width: "100%", borderTopLeftRadius: 5, borderTopRightRadius: 5}} resizeMode="cover"/>
                            </View>
                            <View style={{backgroundColor: "#fff", borderBottomLeftRadius: 5, borderBottomRightRadius: 5, padding: 5, width: "100%", height: textContHeight}}>
                                <CustomText variant="bodyMedium">{category.Name}</CustomText>
                            </View>
                        </Pressable>
                    );
                    })
                }
            </ScrollView>
        </View>
    )
}

export default SkillsMaintenancePage;