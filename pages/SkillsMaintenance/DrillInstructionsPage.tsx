import React, { useEffect, useState } from "react";
import { View, Dimensions } from "react-native";
import { useTheme, IconButton} from "react-native-paper";
import * as LucideIcons from "lucide-react-native";
import CustomText from "../../assets/CustomText";

import { File, Paths, Directory } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { StackScreenProps } from "@react-navigation/stack";
import { SkillsMaintenanceStackParamList } from "../../types/AppTypes";

import { dataHandlerModule } from "../../helper/DataHandlerModule";
import { screenFlowModule } from "../../helper/ScreenFlowModule";
import { useAppContext } from '../../helper/AppContext';

import Pdf from "react-native-pdf";
import { Buffer } from "buffer";
import CustomIcon from "../../assets/CustomIcon";

const loadInstructions = async (Path: string, FileType: string) => {
  const response = await dataHandlerModule.getResource(Path, FileType)

  return response.data;
};

const base64ToUint8Array = (base64: string) => {
        const binaryStr = atob(base64);
        const len = binaryStr.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryStr.charCodeAt(i);
        }
        return bytes;
    };

const storeInstructions = async (contentString: string, filename:string) => {
  try {
    //console.log('Paths cache', Paths.cache)
    const src = new File(Paths.cache, filename);
    const bytes = base64ToUint8Array(contentString);
    src.write(bytes)
    return src.uri 
  } catch (error) {
    console.error('Error saving file from Base64:', error);
  }
}

type props = StackScreenProps<SkillsMaintenanceStackParamList, "DrillInstructionsPage">;

const DrillInstructionsPage = ({ route, navigation }: props) => {
    const { setShowDialog, setShowBusyIndicator } = useAppContext();
    const [instructions, setInstructions] = useState<any>();
    const [pdfSource, setPdfSource] = useState("")
    const [localFilePath, setLocalFilePath] = useState<string | undefined>()

    const theme = useTheme();
    const params = route.params ?? {};

    const displayName = params.Name;
    const instructionLink = params.InstructionLink
    const filePath = decodeURI(instructionLink.substring(instructionLink.indexOf("/documents")));
    const fileType = "application/pdf";

    useEffect(() => {
        const file = new File(Paths.cache, displayName);

        if(file.exists){
            setLocalFilePath(file.uri)
            setPdfSource(file.uri)
        }else {
            loadInstructions(filePath, fileType).then((res) => setInstructions(res));
        }
    }, []);

    useEffect(() => {
        if(instructions){
            const base64String = Buffer.from(instructions as any, "binary").toString("base64");
            setPdfSource(`data:application/pdf;base64,${base64String}`)
            storeInstructions(base64String, displayName).then(res => setLocalFilePath(res))
        }
    }, [instructions])

    const shareFile = async () => {
        if(localFilePath){
            Sharing.shareAsync(localFilePath)
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
            <View style={{flexDirection: 'row', justifyContent: "space-around", alignItems: 'center', marginTop: 20, marginBottom: 10}}>
                <IconButton icon={() => <LucideIcons.ChevronLeft color={theme.colors.primary} size={25}/>} size={20} onPress={() => screenFlowModule.onGoBack()} />
                <CustomText style={{marginLeft: 20, marginRight: 60}} variant='titleMediumBold'>{displayName}</CustomText>
                <IconButton icon={() => <CustomIcon name="Share" color={!localFilePath ? theme.colors.surfaceDisabled : theme.colors.primary} size={25}/>} disabled={!localFilePath} size={20} onPress={shareFile} />
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
