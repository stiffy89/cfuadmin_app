import React, { useEffect, useState } from "react";
import { View, Dimensions, Platform } from "react-native";
import { useTheme, IconButton} from "react-native-paper";
import {WebView} from "react-native-webview"
import * as LucideIcons from "lucide-react-native";
import CustomText from "../../assets/CustomText";

import { File, Paths } from 'expo-file-system';

import { StackScreenProps } from "@react-navigation/stack";
import { SkillsMaintenanceStackParamList } from "../../types/AppTypes";

import { resourceDataHandlerModule } from "../../helper/ResourcesDataHandlerModule";
import { screenFlowModule } from "../../helper/ScreenFlowModule";
import { useAppContext } from '../../helper/AppContext';

import Pdf from "react-native-pdf";
import { Buffer } from "buffer";

const loadInstructions = async (Path: string, FileType: string) => {
  const response = await resourceDataHandlerModule.getResource(Path, FileType)

  return response.data;
};

const storeInstructions = async (contentString: string, filename:string) => {
  try {
    const src = new File(Paths.document, filename);
    const bytes = Buffer.from(contentString, "base64")
    src.write(bytes)
  } catch (error) {
    console.error('Error saving file from Base64:', error);
  }
}

type props = StackScreenProps<SkillsMaintenanceStackParamList, "DrillInstructionsPage">;

const DrillInstructionsPage = ({ route, navigation }: props) => {
    const { setShowDialog, setShowBusyIndicator } = useAppContext();
    const [instructions, setInstructions] = useState<any>();
    const [pdfSource, setPdfSource] = useState("")

    const theme = useTheme();
    const params = route.params ?? {};

    const displayName = params.Name;
    const instructionLink = params.InstructionLink
    const filePath = decodeURI(instructionLink.substring(instructionLink.indexOf("/documents")));
    const fileType = "application/pdf";

    useEffect(() => {
        const file = new File(Paths.document, displayName);

        if(file.exists){
            setPdfSource(file.uri)
        }else {
            loadInstructions(filePath, fileType).then((res) => setInstructions(res));
        }
    }, []);

    useEffect(() => {
        if(instructions){
            const base64String = Buffer.from(instructions as any, "binary").toString("base64");
            storeInstructions(base64String, displayName)
            setPdfSource(`data:application/pdf;base64,${base64String}`)
        }
    }, [instructions])

    return (
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
            <View style={{flexDirection: 'row', alignItems: 'center', marginVertical: 20 }}>
                <IconButton icon={() => <LucideIcons.ChevronLeft color={theme.colors.primary} size={25}/>} size={20} onPress={() => screenFlowModule.onGoBack()} />
                <CustomText style={{marginLeft: 20, marginRight: 60}} variant='titleMediumBold'>{displayName}</CustomText>
            </View>
            {pdfSource && 
            (<Pdf 
                source={{uri:pdfSource}} 
                style={{flex: 1, width: Dimensions.get("window").width, height: Dimensions.get("window").height}} 
                trustAllCerts={false}
                onLoadComplete={() => {
                setShowBusyIndicator(false);
                setShowDialog(false);
                }}
            />)}
        </View>
    );
};

export default DrillInstructionsPage
