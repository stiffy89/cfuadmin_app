import React, { useEffect, useState } from "react";
import { View, ScrollView, Easing, Dimensions, TouchableOpacity, Image } from "react-native";
import { useTheme, Button, List, Divider, IconButton, ProgressBar} from "react-native-paper";
import * as LucideIcons from "lucide-react-native";
import CustomText from "../../assets/CustomText";
import { useDataContext } from "../../helper/DataContext";
import GlobalStyles from "../../style/GlobalStyles";

import { createStackNavigator, StackScreenProps } from "@react-navigation/stack";
import { FormServiceStackParamList, ProfileStackParamList, SkillsMaintenanceStackParamList } from "../../types/AppTypes";

import { useAppContext } from "../../helper/AppContext";
import { dataHandlerModule } from "../../helper/DataHandlerModule";

import { screenFlowModule } from "../../helper/ScreenFlowModule";
import { DateTime } from "luxon";
import CustomIcon from "../../assets/CustomIcon";
import { resourceDataHandlerModule } from "../../helper/ResourcesDataHandlerModule";


const loadSkillsMaintenanceCategories = async () => {
    const skillsMaitenanceCategories = await resourceDataHandlerModule.getSkillsMaintenanceCategories()

    const responseText = skillsMaitenanceCategories.data;
    const boundary = responseText.match(/^--[A-Za-z0-9]+/)[0];
    const parts = responseText.split(boundary);
    const jsonPart = parts.find((p: string | string[]) =>
        p.includes("application/json")
      );
    const jsonBody = jsonPart.split("\r\n\r\n").pop();
    const data = JSON.parse(jsonBody);
    
    return data.d.results;
}

type skillsMaintenanceProps = StackScreenProps<SkillsMaintenanceStackParamList, "SkillsMaintenancePage">;
type SkillsMaintenaceCategory = {
    __metadata: {
        id: string,
        uri: string,
        type: string
    },
    Id: string,
    Name: string,
    ParentCategoryId: string,
    Active: string,
    IsPool: boolean,
    AvailableForPools: string,
    InstructionLink: string,
    QuestionImg: string,
    AnswerImg: string,
    BlurbText: string,
    CardsShown: string,
    CompletionText: string,
    CompletionImg: string,
    AnswerButtonText: string,
    QuestionButtonText: string,
}

const SkillsMaintenancePage = ({ route, navigation }: skillsMaintenanceProps) => {
    const { setShowDialog, setShowBusyIndicator } = useAppContext();
    const [categories, setCategories] = useState<SkillsMaintenaceCategory[]>([])

    const theme = useTheme();
    const params = route.params ?? {};

    useEffect(() => {
        loadSkillsMaintenanceCategories().then((res) => {
            setCategories(res)
            
            setShowBusyIndicator(false);
            setShowDialog(false);
        });
      }, []);

    const navigate = (category:SkillsMaintenaceCategory) => {
        setShowBusyIndicator(true);
        setShowDialog(true);
            
        setTimeout(() => {    
          screenFlowModule.onNavigateToScreen("DrillPage", category);
        }, 500);
    };

    return (
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
            <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 20, marginBottom: 10}}>
                <IconButton icon={() => <LucideIcons.ChevronLeft color={theme.colors.primary} size={25}/>} size={20} onPress={() => screenFlowModule.onGoBack()} />
                <CustomText style={{marginLeft: 20}} variant='titleLargeBold'>Skills Maintenance</CustomText>
            </View>
            <ScrollView
                style={{ flex: 1, backgroundColor: "#fff" }}
                contentContainerStyle={{ paddingBottom: 0 }}
            >
                <View style={{ marginVertical: 20 }}>
                    <View style={{flexDirection: "row", flexWrap:"wrap", justifyContent: "center", gap: 20}}>
                    {
                        categories.map((category:SkillsMaintenaceCategory, index) => {
                        return (
                            <TouchableOpacity
                                key={index}
                                style={{ alignItems: "center"}}
                                onPress={() => navigate(category)}
                            >
                                <View style={{borderWidth: 1, borderTopLeftRadius: 5, borderTopRightRadius: 5, width: 175, height: 90, alignItems: "center", justifyContent: "center"}}>
                                    <CustomIcon style={{ width: "100%" }} size={48} name={"Info"} color={theme.colors.primary} />
                                </View>
                                <View style={{flex: 0, flexDirection: "row", borderWidth: 1, borderTopWidth: 0, borderBottomLeftRadius: 5, borderBottomRightRadius: 5, padding: 5, width: 175, height: 50, alignItems: "center", justifyContent: "center"}}>
                                    <View style={{flex: 5, height:"100%" }}>
                                        <CustomText
                                            variant="bodySmall"
                                            style={{}}
                                        >
                                            {category.Name}
                                        </CustomText>
                                    </View>
                                    <View style={{flex: 1, justifyContent: "center", alignItems: "center"  }}>
                                        <CustomIcon style={{ width: "100%" }} size={20} name={"Info"} color={theme.colors.primary} />
                                        <CustomText
                                            variant="bodySmall"
                                        >
                                        0/5
                                        </CustomText>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        );
                        })
                    }
                    </View>
                </View>
            </ScrollView>
        </View>
    )
}

type drillProps = StackScreenProps<SkillsMaintenanceStackParamList, "DrillPage">;

const DrillPage = ({ route, navigation }: drillProps) => {
    const { setShowDialog, setShowBusyIndicator } = useAppContext();
    const theme = useTheme();
    const params = route.params ?? {};
    const category = params

    const drillNum = category.Name.includes("-") ? category.Name.substring(0, category.Name.indexOf("-")):null;
    const drillName = category.Name.includes("-") ? category.Name.substring(category.Name.indexOf("-") + 2):category.Name
    
    useEffect(() => {
        setShowBusyIndicator(false);
        setShowDialog(false);
    }, [])

    const navigate = () => {
        setShowBusyIndicator(true);
        setShowDialog(true);
            
        setTimeout(() => {    
          screenFlowModule.onNavigateToScreen("DrillCardPage", category);
        }, 500);
    };

    return (
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
            <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 20, marginBottom: 10}}>
                <IconButton icon={() => <LucideIcons.ChevronLeft color={theme.colors.primary} size={25}/>} size={20} onPress={() => screenFlowModule.onGoBack()} />
            </View>
            <ScrollView
                style={{ flex: 1, backgroundColor: "#fff", marginBottom:75 }}
                contentContainerStyle={{ }}
            >
                <View>
                    {drillNum && <CustomText style={{marginHorizontal: 20}} variant='titleLarge'>{drillNum}</CustomText>}
                    <CustomText style={{marginHorizontal: 20}} variant='titleLargeBold'>{drillName}</CustomText>
                    <CustomText style={{marginHorizontal: 20, marginTop: 20}} variant='bodyLarge'>{category.BlurbText}</CustomText>
                </View>
            </ScrollView>
            <View style={{position: "absolute", bottom: 10, width: "100%" }}>
                <Button style={{marginHorizontal: 20, borderRadius: 10}} contentStyle={{height: 50}} mode="contained" buttonColor={theme.colors.primary} onPress={navigate} >
                    <CustomText style={{marginLeft: 20, color: "#fff"}} variant='titleMediumBold'>Call To Action</CustomText>
                </Button>
            </View>
        </View>
    )
}

const loadDrillRandomCards = async (categoryId:string) => {
    const randomCards = await resourceDataHandlerModule.getSkillsMaintenanceRandomCards(categoryId)

    const responseText = randomCards.data;
    const boundary = responseText.match(/^--[A-Za-z0-9]+/)[0];
    const parts = responseText.split(boundary);
    const jsonPart = parts.find((p: string | string[]) =>
        p.includes("application/json")
      );
    const jsonBody = jsonPart.split("\r\n\r\n").pop();
    const data = JSON.parse(jsonBody);
    
    return data.d.results;
}

type drillCardProps = StackScreenProps<SkillsMaintenanceStackParamList, "DrillCardPage">;
type SkillsMaintenanceDrillCard = {
    __metadata: {
        id: string,
        uri: string,
        type: string
    },
    Id: string,
    Name: string,
    CategoryId: string,
    Question: string,
    Answer: string,
    QuestionImg: string,
    AnswerImg: string,
    AnswerLinkUrl: string,
    QuestionLinkUrl: string,
    Active: boolean
}

const DrillCardsPage = ({ route, navigation }: drillCardProps) => {
    const { setShowDialog, setShowBusyIndicator } = useAppContext();
    const [cards, setCards] = useState<SkillsMaintenanceDrillCard[]>([])
    const [currentCard, setCurrentCard] = useState<SkillsMaintenanceDrillCard | null>()
    const [questionIndex, setQuestionIndex] = useState(0)
    const [answerRevealed, setAnswerRevealed] = useState(false)
    const [completed, setCompleted] = useState(false)
    const theme = useTheme();
    const params = route.params ?? {};
    const category = params

    const drillNum = category.Name.includes("-") ? category.Name.substring(0, category.Name.indexOf("-")):null;
    const drillName = category.Name.includes("-") ? category.Name.substring(category.Name.indexOf("-") + 2):category.Name


    useEffect(() => {
        loadDrillRandomCards(category.Id).then((res) => setCards(res))
    }, []);

    useEffect(() => {
        setShowBusyIndicator(false);
        setShowDialog(false);
        
        setCurrentCard(cards[0])
    }, [cards])

    const answer = () => {
        if(!answerRevealed){
            setAnswerRevealed(true)
        }else {
            if(questionIndex + 1 == cards.length){
                setCompleted(true)
                setCurrentCard(null)
            }else{
                setAnswerRevealed(false)
                setCurrentCard(cards[questionIndex + 1])
                setQuestionIndex(questionIndex + 1)
            }
        }
    }

    const navigate = () => {
        setShowBusyIndicator(true);
        setShowDialog(true);
            
        setTimeout(() => {    
          screenFlowModule.onNavigateToScreen('SkillsMaintenancePage')
        }, 500);
    };

    return (
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
            <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 20, marginBottom: 10}}>
                <IconButton icon={() => <LucideIcons.ChevronLeft color={theme.colors.primary} size={25}/>} size={20} onPress={() => screenFlowModule.onGoBack()} />
            </View>
            <View style={{flex: 1, marginBottom: 70, marginHorizontal: 20}}>
                {!completed && (<View>
                    {drillNum && <CustomText style={{}} variant='titleLarge'>{drillNum}</CustomText>}
                    <CustomText style={{}} variant='titleLargeBold'>{drillName}</CustomText>
                </View>)}
                {currentCard && (
                    <>
                        <ProgressBar progress={(questionIndex + 1) / cards.length} color={theme.colors.secondaryContainer} style={{height: 20, marginVertical: 10, borderRadius: 10, borderWidth: 1, backgroundColor: "#fff5f5ff"}}/>
                        <View style={{backgroundColor: theme.colors.onPrimary, borderWidth: 1, boxShadow: "5px 5px 5px rgba(0, 0, 0, 0.3)", width: "90%", height: "80%", borderRadius: 25, marginHorizontal: "auto"}}>
                            <Image source={{uri: `data:image/png;base64,${answerRevealed ? category.QuestionImg : category.AnswerImg}`}} style={{borderTopLeftRadius: 25, borderTopRightRadius: 25, height: "30%", width: "100%"}}/>
                            <View style={{flexDirection: "row", justifyContent:"space-between"}}>
                                <CustomText style={{marginHorizontal: 20, marginTop: 20}} variant='titleSmall'>Question</CustomText>
                                <CustomText style={{marginHorizontal: 20, marginTop: 20}} variant='titleSmall'>{questionIndex + 1}/{cards.length}</CustomText>
                            </View>
                            <CustomText style={{marginHorizontal: 20, marginTop: 20}} variant='titleLarge'>{currentCard.Question}</CustomText>
                            {answerRevealed && <CustomText style={{marginHorizontal: 20, marginTop: 20}} variant='titleLarge'>{cards[0].Answer}</CustomText>}
                        </View>
                    </>
                )}
                {completed && (
                    <View style={{height: "100%", marginHorizontal: 50, alignItems:"center", justifyContent: "center"}}>
                        <CustomIcon name="SquareCheck" color={theme.colors.surfaceDisabled} size={100} style={{marginBottom: 50}}/>
                        {drillNum && <CustomText style={{}} variant='titleLarge'>{drillNum}</CustomText>}
                        <CustomText style={{textAlign: "center"}} variant='titleLargeBold'>{drillName}</CustomText>
                        <CustomText style={{textAlign: "center"}} variant='titleLargeBold'>Completed</CustomText>
                    </View>
                )}
            </View>
            <View style={{position: "absolute", bottom: 10, width: "100%" }}>
                <Button style={{marginHorizontal: 20, borderRadius: 10, borderWidth: 1, borderColor: theme.colors.primary}} contentStyle={{height: 48}} mode={"contained"} buttonColor={answerRevealed ? theme.colors.primaryContainer : theme.colors.primary} onPress={() => {completed ? navigate() : answer()}} >
                    <CustomText style={{marginLeft: 20, color: (answerRevealed ? theme.colors.primary :"#fff")}} variant='titleMediumBold'>{completed ? "Back to Skills Maintenance" : !answerRevealed ? "Reveal Answer" : "Next"}</CustomText>
                </Button>
            </View>
        </View>
    )
}

const SkillsMaintenanceStack = () => {
    const Stack = createStackNavigator<SkillsMaintenanceStackParamList>();

    return (
        <Stack.Navigator
            initialRouteName="SkillsMaintenancePage"
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
            <Stack.Screen name="SkillsMaintenancePage" component={SkillsMaintenancePage} />
            <Stack.Screen name="DrillPage" component={DrillPage}/>
            <Stack.Screen name="DrillCardPage" component={DrillCardsPage}/>
        </Stack.Navigator>
    );
};

export default SkillsMaintenanceStack;