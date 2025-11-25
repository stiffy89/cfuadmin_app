import React, { useEffect, useState } from "react";
import { View, ScrollView, Pressable } from "react-native";
import { useTheme, IconButton, Divider } from "react-native-paper";
import * as LucideIcons from "lucide-react-native";
import CustomText from "../../assets/CustomText";

import { StackScreenProps} from "@react-navigation/stack";
import { ResourceFile, ResourceFolder, ResourceStackParamList} from "../../types/AppTypes";

import {dataHandlerModule} from "../../helper/DataHandlerModule"
import { screenFlowModule } from "../../helper/ScreenFlowModule";
import { useAppContext } from '../../helper/AppContext';


const loadResourceFolderList = async (Path: string) => {
    const resourceList = await dataHandlerModule.getResourceFolderList(Path)

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

const loadResourceList = async (Path: string) => {
    const resourceList = await dataHandlerModule.getResourceList(Path)

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

type props = StackScreenProps<ResourceStackParamList, "ResourceListPage">;

const ResourceListPage = ({ route, navigation }: props) => {
  const { setShowDialog, setShowBusyIndicator } = useAppContext();
  const [folderList, setFolderList] = useState<ResourceFolder[]>([])
  const [fileList, setFileList] = useState<ResourceFile[]>([]);
  const [isLoading, setIsLoading] = useState(true)

  const theme = useTheme();
  const params = route.params ?? {};

  useEffect(() => {
    Promise.all([loadResourceFolderList(params.Path), loadResourceList(params.Path)]).then((values) => {
      const folders = values[0]
      const files = values[1]

      //parent folder (current folder) is part of list of folders, so remove that
      const filteredFolders = folders.filter((folder : ResourceFolder) => folder.AccessRid != params.Path)

      setFolderList(filteredFolders)
      setFileList(files)

      setShowBusyIndicator(false);
      setShowDialog(false);

      setIsLoading(false)
    })
  }, []);

  const navigateToFolder = (folder: ResourceFolder) => {
    setShowBusyIndicator(true);
    setShowDialog(true);
    
    setTimeout(() => {  
      navigation.push("ResourceListPage", {ParentRid: folder.DisplayName, Path: folder.AccessRid});
    }, 500);
  }

  const navigateToFile = (resource: ResourceFile) => {
    setShowBusyIndicator(true);
    setShowDialog(true);
    
    setTimeout(() => {    
      screenFlowModule.onNavigateToScreen("Resource", resource);
    }, 500);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff", }}>
      <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 20, marginBottom: 10}}>
        <IconButton icon={() => <LucideIcons.ChevronLeft color={theme.colors.primary} size={25}/>} size={20} onPress={() => screenFlowModule.onGoBack()} />
        <CustomText style={{marginLeft: 20, marginRight: 80}} numberOfLines={2} ellipsizeMode="tail" variant='titleLargeBold'>{params.ParentRid}</CustomText>
      </View>
      <ScrollView
        style={{ paddingBottom: 40, backgroundColor: theme.colors.background }}
      >
        {folderList && (
          <>
            {folderList.map((folder: ResourceFolder, i) => {
              return (
                <React.Fragment key={`folder_${i}`}>
                  <Divider />
                  <Pressable style={({ pressed }) => [pressed ? {opacity: 0.6} : {opacity: 1}, {flexDirection: "row", gap: 15, alignItems:"center", marginHorizontal: 25, paddingVertical: 15}]} onPress={() => navigateToFolder(folder)}>
                    <View
                        style={{
                          padding: 5,
                        }}
                      >
                      <LucideIcons.Folder color={theme.colors.primary} size={30}/>
                    </View>
                    <CustomText style={{flex: 1, flexWrap: "wrap"}}variant='bodyLarge'>{folder.DisplayName}</CustomText>
                    <LucideIcons.ChevronRight color={theme.colors.primary} />
                  </Pressable>
                  <Divider />
                </React.Fragment>
              );
            })}
          </>
        )}
        {fileList && (
          <>
            {fileList.map((file: ResourceFile, i) => {
              return (
                <React.Fragment key={`file_${i}`}>
                  <Divider />
                  <Pressable style={({ pressed }) => [pressed ? {opacity: 0.6} : {opacity: 1}, {flexDirection: "row", gap: 15, alignItems:"center", marginHorizontal: 25, paddingVertical: 15}]} onPress={() => navigateToFile(file)}>
                    <CustomText style={{flexWrap: 'wrap', width: '80%'}} variant='bodyLarge'>{file.DisplayName}</CustomText>
                    <CustomText style={{flexWrap: "wrap"}}variant='bodySmall'>{file.SizeText}</CustomText>
                  </Pressable>
                  <Divider />
                </React.Fragment>
              );
            })}
          </>
        )}
        {!isLoading && (folderList.length < 1 && fileList.length < 1) && (
          <View style={{ margin: "auto" }}>
            <CustomText variant="bodyLarge" style={{ marginVertical: 15 }}>
              No Resources found.
            </CustomText>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default ResourceListPage;
