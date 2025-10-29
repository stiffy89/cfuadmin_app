import React, {useEffect, useState, useRef} from "react";
import { View, ScrollView, Easing, Dimensions, TouchableOpacity, Share } from "react-native";
import { useTheme, Button, List, Divider, IconButton, Card } from "react-native-paper";
import {WebView} from "react-native-webview"
import * as LucideIcons from "lucide-react-native";
import CustomText from "../../assets/CustomText";
import CustomIcon from "../../assets/CustomIcon"
import { useDataContext } from "../../helper/DataContext";
import GlobalStyles from "../../style/GlobalStyles";

import * as Linking from 'expo-linking';

import { createStackNavigator, StackScreenProps } from "@react-navigation/stack";
import { FormServiceStackParamList, ProfileStackParamList, ResourceStackParamList, RootStackParamList } from "../../types/AppTypes";

import { useAppContext } from "../../helper/AppContext";
import { dataHandlerModule } from "../../helper/DataHandlerModule";
import { DummyData } from "../../data/DummyData";

import { screenFlowModule } from "../../helper/ScreenFlowModule";
import {DateTime} from 'luxon';

import { authModule } from "../../helper/AuthModule";
import { OktaLoginResult } from "../../types/AppTypes";

type formServicePageProps = StackScreenProps<
  FormServiceStackParamList,
  "FormServicePage"
>;

const FormServicePage = ({ route, navigation }: formServicePageProps) => {
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

type formPageProps = StackScreenProps<
  FormServiceStackParamList,
  "FormPage"
>;

const FormPage = ({ route, navigation }: formPageProps) => {
    const { setShowDialog, setShowBusyIndicator } = useAppContext();
    const [uri, setUri] = useState("")

    const webViewRef = useRef<WebView>(null)
    const [webViewHistory, setWebViewHistory] = useState<string[]>([])
    const [currentUri, setCurrentUri] = useState("")
    const [currentTitle, setCurrentTitle] = useState("")
    const [canGoBack, setCanGoBack] = useState(false);
    const [canGoForward, setCanGoForward] = useState(false)

    const theme = useTheme();
    const params = route.params ?? {};
    const formServiceName = params.title

    useEffect(() => {
        setUri(params.formUrl)
        setCurrentUri(params.formUrl)
    }, []);

    const webViewRefresh = () => {
        if(webViewRef.current){
            webViewRef.current.reload();
        }
    }

    const webViewBack = () => {
        if(webViewRef.current){
            webViewRef.current.goBack()
        }
    }

    const webViewForward = () => {
        if(webViewRef.current){
            webViewRef.current.goForward()
        }
    }

    const webViewShare = async () => {
        console.log("Share")

        try {
            const result = await Share.share({
                message: `${currentTitle} | ${currentUri}`, 
            });
            if (result.action === Share.sharedAction) {
                if (result.activityType) {
                // shared with activity type of result.activityType
                } else {
                // shared
                }
            } else if (result.action === Share.dismissedAction) {
                // dismissed
            }
        } catch (error: any) {
           console.log(error.message);
        }
    }

    const webViewExit = () => {
       console.log("Going External")
       Linking.openURL(currentUri)
    }

    const handleWebViewNavigationStateChange = (newNavState: any) => {
        const url = newNavState.url;
        const title = newNavState.title
        setCurrentUri(url)
        setCurrentTitle(title)
    
        if(!webViewHistory.includes(url) && url != "about:blank"){
            webViewHistory.push(url)
        }

        if(webViewHistory.indexOf(url) > 0){
            setCanGoBack(true)
        }else{
            setCanGoBack(false)
        }

        if(webViewHistory.indexOf(url) != webViewHistory.length - 1){
            setCanGoForward(true)
        }else{
            setCanGoForward(false)
        }
    };


    return (
        <View style={{ flex: 1, backgroundColor: "#fff", marginTop: 5, borderTopLeftRadius: 25, borderTopRightRadius: 25, boxShadow: "0px 5px 10px rgba(0, 0, 0, 0.8)" }}>
            <View style={{flexDirection: 'row', justifyContent: "space-around", alignItems: 'center', marginTop: 20, marginBottom: 10}}>
                <Button contentStyle={{height: 50}} mode="text" onPress={() => screenFlowModule.onGoBack()} >
                    <CustomText style={{color: theme.colors.primary}} variant='titleMediumBold'>Done</CustomText>
                </Button>
                <CustomText variant='titleLargeBold'>{formServiceName}</CustomText>
                <IconButton icon={() => <CustomIcon name="RotateCcw" color={theme.colors.primary} size={25}/>} size={20} onPress={webViewRefresh} />
            </View>
            <View style={{flex: 1, marginBottom: 100, marginHorizontal: 20}}>
                <WebView
                    ref={webViewRef}
                    originWhitelist={['*']} // Important for custom HTML to allow all origins
                    source={{ uri: uri}}
                    javaScriptEnabled={true}
                    style={{flex: 1}}
                    onNavigationStateChange={handleWebViewNavigationStateChange}
                    onLoadEnd={() => {
                        setShowBusyIndicator(false);
                        setShowDialog(false);
                    }}
                    incognito={true}
                    onHttpError={(error ) => {
                        console.log(error.nativeEvent);
                    }}
                />
            </View>
            <View style={{position: "absolute", bottom: 10, width: "100%", boxShadow: "0px -2px 5px rgba(0, 0, 0, 0.3)"}}>
                <View style={{backgroundColor: "#f1f1f1ff", height: 20, borderRadius: 5, marginTop: 10, marginHorizontal: 25, justifyContent: "center", alignItems: "center"}}>
                    <CustomText style={{color: "grey", textAlign: "center"}} variant='labelSmall'>{currentUri}</CustomText>
                </View>
                <View style={{flexDirection: "row", justifyContent: "space-around"}}>
                    <IconButton icon={() => <CustomIcon name="ChevronLeft" color={canGoBack ? theme.colors.primary : theme.colors.surfaceDisabled} size={25}/>} disabled={!canGoBack} size={25} onPress={webViewBack} />
                    <IconButton icon={() => <CustomIcon name="ChevronRight" color={canGoForward ? theme.colors.primary : theme.colors.surfaceDisabled} size={25}/>} disabled={!canGoForward} size={25} onPress={webViewForward} />
                    <IconButton icon={() => <CustomIcon name="Share" color={theme.colors.primary} size={25}/>} size={25} onPress={webViewShare} />
                  <IconButton icon={() => <CustomIcon name="LogOut" color={theme.colors.primary} size={25}/>} size={25} onPress={webViewExit} />
                </View>
            </View>
        </View>
    );
};

const FormServiceStack = () => {
    const Stack = createStackNavigator<FormServiceStackParamList>();

    return (
    <Stack.Navigator
        initialRouteName="FormServicePage"
        screenOptions={{
        headerShown: false,
        cardStyle: GlobalStyles.AppBackground,
        gestureEnabled: true,
        transitionSpec: {
            open: {
            animation: "timing",
            config: {
                duration: 450,
                easing: Easing.inOut(Easing.quad),
            },
            },
            close: {
            animation: "timing",
            config: {
                duration: 450,
                easing: Easing.inOut(Easing.quad),
            },
            },
        },
        }}
    >
        <Stack.Screen name="FormServicePage" component={FormServicePage} />
        <Stack.Screen name="FormPage" component={FormPage} options={{animation: "slide_from_bottom", gestureEnabled: false}}/>
    </Stack.Navigator>
    );
};

export default FormServiceStack;