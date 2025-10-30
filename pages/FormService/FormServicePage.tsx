import React, {useEffect, useState} from "react";
import { View} from "react-native";
import { useTheme, Button, IconButton} from "react-native-paper";
import {WebView} from "react-native-webview"
import * as LucideIcons from "lucide-react-native";
import CustomText from "../../assets/CustomText";


import * as Linking from 'expo-linking';

import {StackScreenProps } from "@react-navigation/stack";
import { FormServiceStackParamList} from "../../types/AppTypes";

import { useAppContext } from "../../helper/AppContext";

import { screenFlowModule } from "../../helper/ScreenFlowModule";

type props = StackScreenProps<FormServiceStackParamList, "FormServicePage">;

const FormServicePage = ({ route, navigation }: props) => {
    const { setShowDialog, setShowBusyIndicator } = useAppContext();
    const [htmlContent, setHtmlContent] = useState<any>()

    const theme = useTheme();
    const params = route.params ?? {};

    const imgHeight = 500

    const formServiceData = {
        formServiceId: "form-service",
        title: "Form Service",
        formUrl: "https://google.com",
        htmlContent: `<img src="https://picsum.photos/700/${imgHeight}" alt="Sample Image" style="display:block;width:100%;height:${imgHeight}px;object-fit:cover;margin:20px 0;border-radius:8px;"/><h2 style="color:#2c3e50;font-size:60px;font-weight:bold;margin-bottom:8px;">Introduction</h2><p style="font-size:42px;line-height:1.6;color:#333333;">TinyMCE is a powerful WYSIWYG editor that allows users to write and format text directly in the browser. It outputs clean and customizable HTML content that can be stored or rendered anywhere on the web.</p><h2 style="color:#2c3e50;font-size:60px;font-weight:bold;margin-top:20px;margin-bottom:8px;">Features</h2><p style="font-size:42px;line-height:1.6;color:#333333;">Some of the key features include inline formatting, media embedding, image uploads, and extensive plugin support. The editor is also fully customizable and integrates easily with modern frameworks like React or Angular.</p><h2 style="color:#2c3e50;font-size:60px;font-weight:bold;margin-top:20px;margin-bottom:8px;">Customization</h2><p style="font-size:42px;line-height:1.6;color:#333333;">Developers can tailor TinyMCE to fit specific use cases by adding custom plugins, configuring toolbars, and defining their own styles or formats to control the editing experience.</p><h2 style="color:#2c3e50;font-size:60px;font-weight:bold;margin-top:20px;margin-bottom:8px;">Integration</h2><p style="font-size:42px;line-height:1.6;color:#333333;">TinyMCE integrates seamlessly with frameworks such as React, Angular, and Vue, as well as with CMS platforms like WordPress and Drupal, making it versatile and easy to adopt.</p><h2 style="color:#2c3e50;font-size:60px;font-weight:bold;margin-top:20px;margin-bottom:8px;">Accessibility</h2><p style="font-size:42px;line-height:1.6;color:#333333;">The editor supports accessibility standards out of the box, ensuring that content creation remains inclusive and usable for all users, including those relying on assistive technologies.</p><h2 style="color:#2c3e50;font-size:60px;font-weight:bold;margin-top:20px;margin-bottom:8px;">Conclusion</h2><p style="font-size:42px;line-height:1.6;color:#333333;">TinyMCE continues to be one of the most trusted and flexible text editors available, empowering users and developers alike to create rich, structured web content with ease.</p>`.toString(),
        ctaButtonLabel: "Call To Action",
        launchMode: "in-app"        
    }


    useEffect(() => {
        generateHtmlContent()
    }, []);

    const generateHtmlContent = () => {
        const htmlBody = `<html><body>${formServiceData.htmlContent}</body></html>`
        setHtmlContent(htmlBody)
    }

    const navigate = () => {
        setShowBusyIndicator(true);
        setShowDialog(true);

        setTimeout(() => {
            setShowBusyIndicator(false);
            setShowDialog(false);
            if(formServiceData.launchMode == "in-app"){
                screenFlowModule.onNavigateToScreen("FormPage", formServiceData);
            }else {
                Linking.openURL(formServiceData.formUrl)
            }    
        }, 500);
    };

    return (
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
            <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 20, marginBottom: 10}}>
                <IconButton icon={() => <LucideIcons.ChevronLeft color={theme.colors.primary} size={25}/>} size={20} onPress={() => screenFlowModule.onGoBack()} />
                <CustomText style={{marginLeft: 20}} variant='titleLargeBold'>{formServiceData.title}</CustomText>
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
                    <CustomText style={{marginLeft: 20, color: "#fff"}} variant='titleMediumBold'>{formServiceData.ctaButtonLabel}</CustomText>
                </Button>
            </View>
        </View>
    );
};

export default FormServicePage;