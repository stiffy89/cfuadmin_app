import React from "react";
import { View, ScrollView, Pressable, StyleProp, ViewStyle } from "react-native";
import { useTheme, Button, IconButton} from "react-native-paper";
import * as LucideIcons from "lucide-react-native";
import CustomText from "../../assets/CustomText";
import CustomIcon from "../../assets/CustomIcon"

import { screenFlowModule } from "../../helper/ScreenFlowModule";
import { useAppContext } from '../../helper/AppContext';

const ResourceCategoriesPage = () => {
  const { setShowDialog, setShowBusyIndicator } = useAppContext();
  const theme = useTheme();
  
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
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView
        style={{ flex: 1, backgroundColor: "#fff" }}
        contentContainerStyle={{ paddingBottom: 0 }}
      >
        <View style={{ marginVertical: 20 }}>
          <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 20}}>
            <IconButton icon={() => <LucideIcons.ChevronLeft color={theme.colors.primary} size={25}/>} size={20} onPress={() => screenFlowModule.onGoBack()} />
            <CustomText style={{marginLeft: 20}} variant='titleLargeBold'>Resources</CustomText>
          </View>
          <View style={{flexDirection: "row", flexWrap:"wrap", justifyContent: "center", gap: 20}}>
            {
              categories.map((category, index) => {
                return (
                  <Pressable
                    key={index}
                    style={({ pressed }) => [pressed ? {opacity: 0.3} : {opacity: 1}, { alignItems: "center", width:120 }]}
                    onPress={() => navigate(category)}
                  >
                    <View style={{borderWidth: 1, borderRadius: 5, width: 100, height: 100, alignItems: "center", justifyContent: "center"}}>
                      <CustomIcon style={{ width: "100%" }} size={48} name={categoryIcons[category.ParentRid]} color={theme.colors.primary} />
                    </View>
                    <CustomText
                      variant="bodySmall"
                      style={{ marginTop: 10, textAlign: "center" }}
                    >
                      {category.ParentRid}
                    </CustomText>
                  </Pressable>
                );
              })
            }
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default ResourceCategoriesPage;
