import React, { useEffect, useState } from "react";
import { View, ScrollView, TouchableOpacity } from "react-native";
import { useTheme, IconButton, List, Divider } from "react-native-paper";
import * as LucideIcons from "lucide-react-native";
import CustomText from "../../assets/CustomText";

import { StackScreenProps} from "@react-navigation/stack";
import { DocumentResources, ResourceStackParamList} from "../../types/AppTypes";

import {resourceDataHandlerModule} from "../../helper/ResourcesDataHandlerModule"
import { screenFlowModule } from "../../helper/ScreenFlowModule";
import { useAppContext } from '../../helper/AppContext';


const loadResourceList = async (Path: string) => {
    const resourceList = await resourceDataHandlerModule.getResourceList(Path)

    const responseText = resourceList.data;
    const boundary = responseText.match(/^--[A-Za-z0-9]+/)[0];
    const parts = responseText.split(boundary);
    const jsonPart = parts.find((p: string | string[]) =>
        p.includes("application/json")
      );
    const jsonBody = jsonPart.split("\r\n\r\n").pop();
    const data = JSON.parse(jsonBody);
    
    return data.d.results;
};

type props = StackScreenProps<
  ResourceStackParamList,
  "ResourceList"
>;

const ResourceListPage = ({ route, navigation }: props) => {
  const { setShowDialog, setShowBusyIndicator } = useAppContext();
  const [resourceList, setResourceList] = useState<DocumentResources[]>([]);

  const theme = useTheme();
  const params = route.params ?? {};

  useEffect(() => {
    loadResourceList(params.Path).then((res) => {
      setResourceList(res)

      setShowBusyIndicator(false);
      setShowDialog(false);
    });
  }, []);

  const navigate = (resource: any) => {
    setShowBusyIndicator(true);
    setShowDialog(true);
    
    setTimeout(() => {    
      screenFlowModule.onNavigateToScreen("Resource", resource);
    }, 500);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 20, marginBottom: 10}}>
        <IconButton icon={() => <LucideIcons.ChevronLeft color={theme.colors.primary} size={25}/>} size={20} onPress={() => screenFlowModule.onGoBack()} />
        <CustomText style={{marginLeft: 20}} variant='titleLargeBold'>Resources</CustomText>
      </View>
      <ScrollView
        style={{ paddingBottom: 40, backgroundColor: "#fff" }}
      >
        {resourceList && (
          <List.Section>
            {resourceList.map((resource: any, i) => {
              return (
                <React.Fragment key={`resource_${i}`}>
                  <Divider />
                  <TouchableOpacity style={{flexDirection: "row", justifyContent: "space-between", alignItems:"center", marginHorizontal: 20, paddingVertical: 10}} onPress={() => navigate(resource)}>
                    <View
                        style={{
                          padding: 5,
                        }}
                      >
                        {resource.FileType.includes("pdf") ? (
                          <LucideIcons.File color={theme.colors.outline} size={30}/>
                        ) : (
                          <LucideIcons.CodeXml color={theme.colors.outline} size={30}/>
                        )}
                      </View>
                    <CustomText style={{width: "75%", flexWrap: "wrap"}}variant='bodyLarge'>{resource.DisplayName}</CustomText>
                    <LucideIcons.ChevronRight color={theme.colors.outline} />
                  </TouchableOpacity>
                  <Divider />
                </React.Fragment>
              );
            })}
          </List.Section>
        )}
        {resourceList && resourceList.length < 1 && (
          <View style={{ paddingHorizontal: 20 }}>
            <CustomText variant="bodyMedium" style={{ marginVertical: 15 }}>
              No Resources found.
            </CustomText>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default ResourceListPage;
