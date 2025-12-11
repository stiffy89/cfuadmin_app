import React, {useEffect, useState, useRef} from "react";
import { View, Share, Linking } from "react-native";
import { useTheme, Button, IconButton} from "react-native-paper";
import {WebView} from "react-native-webview"
import { StackScreenProps } from "@react-navigation/stack";

import { FormServiceStackParamList, FormsLauncherSet} from "../../types/AppTypes";
import { useAppContext } from "../../helper/AppContext";
import { screenFlowModule } from "../../helper/ScreenFlowModule";

import CustomText from "../../assets/CustomText";
import CustomIcon from "../../assets/CustomIcon"

type props = StackScreenProps<FormServiceStackParamList, "FormPage">;

const FormPage = ({ route, navigation }: props) => {
    const { setShowDialog, setShowBusyIndicator } = useAppContext();
    const [uri, setUri] = useState("")

    const webViewRef = useRef<WebView>(null)
    const [webViewHistory, setWebViewHistory] = useState<string[]>([])
    const [currentUri, setCurrentUri] = useState("")
    const [currentTitle, setCurrentTitle] = useState("")
    const [canGoBack, setCanGoBack] = useState(false);
    const [canGoForward, setCanGoForward] = useState(false)
    const [features, setFeatures] = useState({
            nav: false,
            share: false,
            launch: false,
            refresh: false
        }  
    )

    const theme = useTheme();
    const params = route.params ?? {};
    const formsLaunchSet = params as unknown as FormsLauncherSet;

    useEffect(() => {
        setUri(formsLaunchSet.TargetUrl)
        setCurrentUri(formsLaunchSet.TargetUrl)
        
        const featureSet = {
            nav: formsLaunchSet.Features.includes("nav"),
            share: formsLaunchSet.Features.includes("share"),
            launch: formsLaunchSet.Features.includes("launch"),
            refresh: formsLaunchSet.Features.includes("refresh")
        }
        setFeatures(featureSet)
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
            <View style={{flexDirection: 'row', justifyContent: "space-between", alignItems: 'center', marginTop: 20, marginBottom: 10, marginHorizontal: 10}}>
                <Button contentStyle={{height: 50}} mode="text" onPress={() => screenFlowModule.onGoBack()} >
                    <CustomText style={{color: theme.colors.primary}} variant='titleMediumBold'>Done</CustomText>
                </Button>
                <CustomText style={{width: "50%", position:"absolute", left: "50%", transform: [{translateX: "-45%"}]}} numberOfLines={1} ellipsizeMode="tail" variant='titleLargeBold'>{formsLaunchSet.Title}</CustomText>
                {features.refresh && <IconButton icon={() => <CustomIcon name="RotateCcw" color={theme.colors.primary} size={25}/>} size={20} onPress={webViewRefresh} />}
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
            <View style={{position: "absolute", bottom: 10, width: "100%", boxShadow: "0px -2px 5px rgba(0, 0, 0, 0.3)", paddingBottom: features.nav || features.share || features.launch ? 0:10}}>
                <View style={{backgroundColor: "#f1f1f1ff", height: 20, borderRadius: 5, marginTop: 10, marginHorizontal: 25, justifyContent: "center", alignItems: "center"}}>
                    <CustomText style={{color: "grey", textAlign: "center"}} variant='labelSmall'>{currentUri}</CustomText>
                </View>
                <View style={{flexDirection: "row", justifyContent: "space-around"}}>
                    {features.nav && <IconButton icon={() => <CustomIcon name="ChevronLeft" color={canGoBack ? theme.colors.primary : theme.colors.surfaceDisabled} size={25}/>} disabled={!canGoBack} size={25} onPress={webViewBack} />}
                    {features.nav && <IconButton icon={() => <CustomIcon name="ChevronRight" color={canGoForward ? theme.colors.primary : theme.colors.surfaceDisabled} size={25}/>} disabled={!canGoForward} size={25} onPress={webViewForward} />}
                    {features.share && <IconButton icon={() => <CustomIcon name="Share" color={theme.colors.primary} size={25}/>} size={25} onPress={webViewShare} />}
                    {features.launch && <IconButton icon={() => <CustomIcon name="LogOut" color={theme.colors.primary} size={25}/>} size={25} onPress={webViewExit} />}
                </View>
            </View>
        </View>
    );
};

export default FormPage;