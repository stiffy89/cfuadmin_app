import React from "react";
import { View, ScrollView, TouchableOpacity } from "react-native";
import { useTheme, Button, IconButton} from "react-native-paper";
import * as LucideIcons from "lucide-react-native";
import CustomText from "../../assets/CustomText";

import { screenFlowModule } from "../../helper/ScreenFlowModule";

const ResourceCategoriesPage = () => {
  const theme = useTheme();

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
    screenFlowModule.onNavigateToScreen("ResourceList", category);
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
                  <TouchableOpacity
                    key={index}
                    style={{ alignItems: "center", width:120 }}
                    onPress={() => navigate(category)}
                  >
                    <View style={{borderWidth: 1, borderRadius: 5, width: 100, height: 100, alignItems: "center", justifyContent: "center"}}>
                      <LucideIcons.Image style={{ width: "100%" }} size={24} />
                    </View>
                    <CustomText
                      variant="bodySmall"
                      style={{ marginTop: 10, textAlign: "center" }}
                    >
                      {category.ParentRid}
                    </CustomText>
                  </TouchableOpacity>
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
