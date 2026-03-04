import React, { useState } from "react";
import { View, ScrollView, Pressable, PixelRatio } from "react-native";
import { useTheme, Button, IconButton} from "react-native-paper";
import * as LucideIcons from "lucide-react-native";
import CustomText from "../../assets/CustomText";
import CustomIcon from "../../assets/CustomIcon"

import { screenFlowModule } from "../../helper/ScreenFlowModule";
import { useAppContext } from '../../helper/AppContext';
import { ResourceStackParamList } from "../../types/AppTypes";
import { StackScreenProps } from "@react-navigation/stack";
import CustomGrid from "../../helper/CustomGrid";

type props = StackScreenProps<ResourceStackParamList, "ResourceCategoriesPage">;

const ResourceCategoriesPage = ({ route, navigation }: props) => {
  const { setShowDialog, setShowBusyIndicator } = useAppContext();
  const [maxWidth, setMaxWidth] = useState<number>()
  const theme = useTheme();
  const params = route.params ?? {};
  const fontScale = Math.round(PixelRatio.getFontScale() * 10) / 10;

  interface CategoryIcons {
    [key:string] : string
  }

  const categoryIcons : CategoryIcons = {
    "Guidelines and Recommended Practices": "FolderCog",
    "General Information": "Info",
    "Policies": "BookCheck",
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
      ParentRid: "General Information",
      Path: "/documents/zfrnsw/cfu/resources/Info Sheets",
    },
    {
      ParentRid: "Policies",
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

  const columns = fontScale >= 1.3 ? 1 : 2
  const iconSize = fontScale >= 1.3 ? 100 : 50

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 20, marginBottom: 10}}>
        <IconButton icon={() => <LucideIcons.ChevronLeft color={theme.colors.primary} size={25}/>} size={20} onPress={() => screenFlowModule.onGoBack()} />
        <CustomText style={{marginLeft: 20}} variant='titleLargeBold'>{params.title}</CustomText>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} style={{backgroundColor: theme.colors.background}} contentContainerStyle={{paddingBottom: 50}}>
        <CustomGrid columns={columns} style={{ gap: 20, rowGap: 20, paddingTop: 20, height: "100%" }}>
          {
            categories.map((category, index) => {
              return (
                <Pressable
                  key={index}
                  style={({ pressed }) => [pressed ? {opacity: 0.6} : {opacity: 1}, { alignItems: "center",  aspectRatio: 1, width: 150 }]}
                  onPress={() => navigate(category)}
                >
                  <View style={{borderRadius: 5, alignItems: "center", justifyContent: "space-between", backgroundColor: "#fff", width: "100%", aspectRatio: 1, paddingVertical: 20}}>
                    <CustomText
                      variant="titleMedium"
                      style={{ textAlign: "center", marginHorizontal: 20 }}
                    >
                      {category.ParentRid}
                    </CustomText>
                    <CustomIcon style={{ width: "100%" }} size={iconSize} name={categoryIcons[category.ParentRid]} color={theme.colors.primary} />
                  </View>

                </Pressable>
              );
            })
          }
        </CustomGrid>
      </ScrollView>
    </View>
  );
};

export default ResourceCategoriesPage;
