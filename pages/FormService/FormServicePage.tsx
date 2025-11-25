import React, {useEffect, useState} from "react";
import { View, Linking} from "react-native";
import { useTheme, Button, IconButton} from "react-native-paper";
import {WebView} from "react-native-webview"
import * as LucideIcons from "lucide-react-native";
import {StackScreenProps } from "@react-navigation/stack";

import { FormServiceStackParamList, FormsLauncherSet} from "../../types/AppTypes";
import { useAppContext } from "../../helper/AppContext";
import { screenFlowModule } from "../../helper/ScreenFlowModule";
import { dataHandlerModule } from "../../helper/DataHandlerModule";

import CustomText from "../../assets/CustomText";

const loadFormsLauncherSet = async(formLaunchId:string, setShowDialog: (val :boolean) => void) => {
    try{
        const formInfo = await dataHandlerModule.getFormsLauncherSet(formLaunchId)

        return formInfo.data.d;
    }catch (error){
        setShowDialog(false);
		screenFlowModule.onNavigateToScreen('ErrorPage', error);
    }
}

type props = StackScreenProps<FormServiceStackParamList, "FormServicePage">;

const FormServicePage = ({ route, navigation }: props) => {
    const { setShowDialog, setShowBusyIndicator } = useAppContext();
    const [formsLauncherSet, setFormsLauncherSet] = useState<FormsLauncherSet>()
    const [htmlContent, setHtmlContent] = useState<any>()

    const theme = useTheme();
    const params = route.params ?? {};
    const formLaunchId = params.formLaunchId


    useEffect(() => {
        loadFormsLauncherSet(formLaunchId, setShowDialog).then((res) => {
            setFormsLauncherSet(res)
        })
    }, []);

    useEffect(() => {
        if(formsLauncherSet){
            generateHtmlContent()

            setShowBusyIndicator(false)
            setShowDialog(false)
        }

    }, [formsLauncherSet])

    const generateHtmlContent = () => {
        const htmlBody = `<html><body>${formsLauncherSet?.HtmlString}</body></html>`
        setHtmlContent(htmlBody)
    }

    const navigate = () => {
        setShowBusyIndicator(true);
        setShowDialog(true);

        setTimeout(() => {
            setShowBusyIndicator(false);
            setShowDialog(false);

            if(formsLauncherSet?.LaunchMode == "INAPP"){
                screenFlowModule.onNavigateToScreen("FormPage", formsLauncherSet);
            }else {
                Linking.openURL(formsLauncherSet?.TargetUrl || "https://google.com")
            }   
        }, 500);
    };

    return (
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
            <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 20, marginBottom: 10}}>
                <IconButton icon={() => <LucideIcons.ChevronLeft color={theme.colors.primary} size={25}/>} size={20} onPress={() => screenFlowModule.onGoBack()} />
                <CustomText style={{marginLeft: 20, marginRight: 80}} numberOfLines={1} ellipsizeMode="tail" variant='titleLargeBold'>{formsLauncherSet?.Title}</CustomText>
            </View>
            <View style={{flex: 1, marginBottom: 70, marginHorizontal: 20}}>
                {htmlContent && 
                    (<WebView
                        originWhitelist={['*']} // Important for custom HTML to allow all origins
                        source={{ html: htmlContent }}
                        javaScriptEnabled={true}
                        style={{flex: 1}}
                        showsVerticalScrollIndicator={false}
                        onLoadEnd={() => {
                            setShowBusyIndicator(false);
                            setShowDialog(false);
                        }}
                    />)
                }
            </View>
            <View style={{position: "absolute", bottom: 10, width: "100%" }}>
                <Button style={{marginHorizontal: 20, borderRadius: 10}} contentStyle={{height: 50}} mode="contained" buttonColor={theme.colors.primary} onPress={navigate} >
                    <CustomText style={{marginLeft: 20, color: "#fff"}} variant='titleMediumBold'>{formsLauncherSet?.ButtonLabel}</CustomText>
                </Button>
            </View>
        </View>
    );
};

export default FormServicePage;