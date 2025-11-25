import React, { useState } from "react";
import { View, ScrollView, Pressable } from "react-native";
import { useTheme, Button, IconButton} from "react-native-paper";
import * as LucideIcons from "lucide-react-native";
import CustomText from "../../assets/CustomText";
import CustomIcon from "../../assets/CustomIcon"

import { screenFlowModule } from "../../helper/ScreenFlowModule";
import { useAppContext } from '../../helper/AppContext';
import { ResourceStackParamList } from "../../types/AppTypes";
import { StackScreenProps } from "@react-navigation/stack";

type props = StackScreenProps<ResourceStackParamList, "ResourceCategoriesPage">;

const ResourceCategoriesPage = ({ route, navigation }: props) => {
  const { setShowDialog, setShowBusyIndicator } = useAppContext();
  const [maxWidth, setMaxWidth] = useState<number>()
  const theme = useTheme();
  const params = route.params ?? {};

  interface CategoryIcons {
    [key:string] : string
  }

  const categoryIcons : CategoryIcons = {
    "Guidelines and Recommended Practices": "FolderCog",
    "Info/Training Documents": "Info",
    "Policies & Procedures": "BookCheck",
    "Skills Maintenance": "UserStar",
    "Test your CFU Knowledge" : "BookOpenCheck",
    "CFU Engage": "FolderHeart"
  }

  const categories = [
    {
      ParentRid: "Guidelines and Recommended Practices",
      Path: "/documents/zfrnsw/cfu/resources/Guidelines and Recommended Practices",
    },
    {
      ParentRid: "Info/Training Documents",
      Path: "/documents/zfrnsw/cfu/resources/Info Sheets",
    },
    {
      ParentRid: "Policies & Procedures",
      Path: "/documents/zfrnsw/cfu/resources/Policies and Procedures",
    },
    {
      ParentRid: "Skills Maintenance",
      Path: "/documents/zfrnsw/cfu/resources/Skills Maintenance Package and Supporting Documents",
    },
    {
      ParentRid: "Test your CFU Knowledge",
      Path: "/documents/zfrnsw/cfu/resources/Test Your CFU Knowledge",
    },
    {
      ParentRid: "CFU Engage",
      Path: "/documents/zfrnsw/cfu/resources/CFU Engage",
    },
  ];

  const navigate = (category: { ParentRid: string; Path: string }) => {
    setShowBusyIndicator(true);
    setShowDialog(true);
        
    setTimeout(() => {    
      screenFlowModule.onNavigateToScreen("ResourceList", category);
    }, 500);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 20, marginBottom: 10}}>
        <IconButton icon={() => <LucideIcons.ChevronLeft color={theme.colors.primary} size={25}/>} size={20} onPress={() => screenFlowModule.onGoBack()} />
        <CustomText style={{marginLeft: 20}} variant='titleLargeBold'>{params.title}</CustomText>
      </View>
      <ScrollView style={{ flex: 1, width:"100%", backgroundColor: theme.colors.background }} contentContainerStyle={{flexDirection: "row", flexWrap:"wrap", justifyContent: "flex-start", gap: 20, margin: 20}}>
        {
          categories.map((category, index) => {
            return (
              <Pressable
                key={index}
                style={({ pressed }) => [pressed ? {opacity: 0.6} : {opacity: 1}, { flexGrow: 1, maxWidth:maxWidth, alignItems: "center", height: 120,  aspectRatio: 1 }]}
                onPress={() => navigate(category)}
                onLayout={(e) => {
                    if(index == 0){
                        setMaxWidth(e.nativeEvent.layout.width)
                    }
                }}
              >
                <View style={{borderRadius: 5, alignItems: "center", justifyContent: "space-between", backgroundColor: "#fff", height: "100%", width: "100%", paddingVertical: 20}}>
                  <CustomText
                    variant="titleMedium"
                    style={{ textAlign: "center", marginHorizontal: 20 }}
                  >
                    {category.ParentRid}
                  </CustomText>
                  <CustomIcon style={{ width: "100%" }} size={50} name={categoryIcons[category.ParentRid]} color={theme.colors.primary} />
                </View>

              </Pressable>
            );
          })
        }
      </ScrollView>
    </View>
  );
};

export default ResourceCategoriesPage;
