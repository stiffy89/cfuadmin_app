import React, { useEffect, useState } from "react";
import { View, Dimensions } from "react-native";
import { useTheme, IconButton } from "react-native-paper";
import * as LucideIcons from "lucide-react-native";
import CustomText from "../assets/CustomText";

import { File, Paths } from 'expo-file-system';
import { shareAsync } from 'expo-sharing';

import { StackScreenProps } from "@react-navigation/stack";
import { RootStackParamList } from "../types/AppTypes";

import { dataHandlerModule } from "../helper/DataHandlerModule";
import { screenFlowModule } from "../helper/ScreenFlowModule";
import { useAppContext } from '../helper/AppContext';

import Pdf from "react-native-pdf";
import { Buffer } from "buffer";
import CustomIcon from "../assets/CustomIcon";

const loadPDF = async (Path: string) => {
    const response = await dataHandlerModule.getPDFResource(Path);
    const base64String = Buffer.from(response.data as any, "binary").toString("base64");
    return base64String;
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

const storePDF = async (contentString: string, filename: string) => {
    try {
        //console.log('Paths cache', Paths.cache)
        const src = new File(Paths.cache, filename);
        const bytes = base64ToUint8Array(contentString);
        src.write(bytes)
        return src.uri
    } catch (error) {
        throw new Error('Error saving file from Base64');
    }
}

type props = StackScreenProps<RootStackParamList, "PDFDisplayPage">;

const PDFDisplayPage = ({ route }: props) => {
    const { setShowDialog, setShowBusyIndicator } = useAppContext();
    const [pdfSource, setPdfSource] = useState("")
    const [localFilePath, setLocalFilePath] = useState<string | undefined>()
    const [showSharing, setShowSharing] = useState(false);

    const theme = useTheme();
    const params = route.params;

    const displayName = params!.displayName;
    const filePath = params!.filePath;
    const cache = params!.cache;
    const appContext = useAppContext();

    useEffect(() => {

        if (params!.showSharing) {
            setShowSharing(true);
        }

        //storing the file locally in a file
        if (cache) {
            const fileName = params!.fileName;
            if (!fileName){
                appContext.setShowBusyIndicator(false);
                appContext.setShowDialog(false);

                const error = {
                    isAxiosError : false,
                    message : 'No PDF filename provided'
                }

                screenFlowModule.onNavigateToScreen('ErrorPage', error);
                return;
            }

            const file = new File(Paths.cache, fileName);

            if (file.exists) {
                appContext.setShowBusyIndicator(false);
                appContext.setShowDialog(false);
                
                setLocalFilePath(file.uri)
                setPdfSource(file.uri)
            } else {
                loadPDF(filePath)
                .then((pdfString) => {
                    appContext.setShowBusyIndicator(false);
                    appContext.setShowDialog(false);

                    setPdfSource(`data:application/pdf;base64,${pdfString}`)
                    storePDF(pdfString, fileName).then(res => setLocalFilePath(res))
                })
                .catch(() => {
                    appContext.setShowBusyIndicator(false);
                    appContext.setShowDialog(false);
                    
                    const error = {
                        isAxiosError : false,
                        message : 'PDF cannot be loaded'
                    }

                    screenFlowModule.onNavigateToScreen('ErrorPage', error);
                })
            }
        }
        else {
            loadPDF(filePath)
            .then((pdfString) => {
                appContext.setShowBusyIndicator(false);
                appContext.setShowDialog(false);

                setPdfSource(`data:application/pdf;base64,${pdfString}`)
            })
            .catch(() => {
                appContext.setShowBusyIndicator(false);
                appContext.setShowDialog(false);

                const error = {
                    isAxiosError : false,
                    message : 'PDF cannot be loaded'
                }
                screenFlowModule.onNavigateToScreen('ErrorPage', error);
            })
        }

    }, []);

    const shareFile = async () => {
        if (localFilePath) {
            shareAsync(localFilePath)
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
            <View style={{ flexDirection: 'row', justifyContent: "space-around", alignItems: 'center', marginTop: 20, marginBottom: 10 }}>
                <IconButton icon={() => <LucideIcons.ChevronLeft color={theme.colors.primary} size={25} />} size={20} onPress={() => screenFlowModule.onGoBack()} />
                <CustomText style={{ marginLeft: 20, marginRight: 60 }} variant='titleMediumBold'>{displayName}</CustomText>
                {
                    showSharing && (
                        <IconButton icon={() => <CustomIcon name="Share" color={!localFilePath ? theme.colors.surfaceDisabled : theme.colors.primary} size={25} />} disabled={!localFilePath} size={20} onPress={shareFile} />
                    )
                }
            </View>
            {pdfSource &&
                (<Pdf
                    source={{ uri: pdfSource }}
                    style={{ flex: 1, width: Dimensions.get("window").width, height: Dimensions.get("window").height }}
                    trustAllCerts={false}
                    onLoadComplete={() => {
                        setShowBusyIndicator(false);
                        setShowDialog(false);
                    }}
                />)}
        </View>
    );
};

export default PDFDisplayPage;