import React, { useEffect, useState } from "react";
import { View, Dimensions, Platform } from "react-native";
import { useTheme, IconButton} from "react-native-paper";
import {WebView} from "react-native-webview"
import * as LucideIcons from "lucide-react-native";
import CustomText from "../../assets/CustomText";

import { File, Paths } from 'expo-file-system';

import {StackScreenProps} from "@react-navigation/stack";
import { ResourceStackParamList} from "../../types/AppTypes";

import { resourceDataHandlerModule } from "../../helper/ResourcesDataHandlerModule";

import { screenFlowModule } from "../../helper/ScreenFlowModule";

import Pdf from "react-native-pdf";
import { Buffer } from "buffer";

const loadResource = async (Path: string, FileType: string) => {
  const response = await resourceDataHandlerModule.getResource(Path, FileType)

  return response.data;
};

const storeResource = async (contentString: string, filename:string, fileType: string) => {
  try {
    const src = new File(Paths.document, filename);
    const bytes = fileType == "application/pdf" ? Buffer.from(contentString, "base64") : new TextEncoder().encode(contentString)
    src.write(bytes)
    
    // console.log('File saved successfully:', src);
  } catch (error) {
    console.error('Error saving file from Base64:', error);
  }
}

type props = StackScreenProps<ResourceStackParamList, "Resource">;

const ResourcePage = ({ route, navigation }: props) => {
  const [resource, setResource] = useState<any>();
  const [pdfSource, setPdfSource] = useState("")
  const [htmlContent, setHtmlContent] = useState<any>()

  const theme = useTheme();
  const params = route.params ?? {};
  const displayName = params.DisplayName;
  const accessRid = params.AccessRid;
  const fileType = params.FileType;

  useEffect(() => {
    const file = new File(Paths.document, displayName);

    if(file.exists){
      if(fileType == "application/pdf"){
        setPdfSource(file.uri)
      }else {
        setHtmlContent(file.textSync())
      }
    }else {
      loadResource(accessRid, fileType).then((res) => setResource(res));
    }
  }, []);

  useEffect(() => {
    if(resource && fileType == "application/pdf"){
      const base64String = Buffer.from(resource as any, "binary").toString("base64");
      storeResource(base64String, displayName, fileType)
      setPdfSource(`data:application/pdf;base64,${base64String}`)
    }else if(resource && fileType == "text/html"){
      storeResource(resource, displayName, fileType)
      setHtmlContent(resource)
    }
  }, [resource])

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={{flexDirection: 'row', alignItems: 'center', marginVertical: 20 }}>
        <IconButton icon={() => <LucideIcons.ChevronLeft color={theme.colors.primary} size={25}/>} size={20} onPress={() => screenFlowModule.onGoBack()} />
        <CustomText style={{marginLeft: 20, marginRight: 60}} variant='titleMediumBold'>{displayName}</CustomText>
      </View>
      {htmlContent && <WebView
          originWhitelist={['*']} // Important for custom HTML to allow all origins
          source={{ html: htmlContent }}
          javaScriptEnabled={true}
          style={{flex: 1,}}
      />}
      {pdfSource && <Pdf source={{uri:pdfSource}} style={{flex: 1, width: Dimensions.get("window").width, height: Dimensions.get("window").height}} trustAllCerts={false} />}
    </View>
  );
};

export default ResourcePage
