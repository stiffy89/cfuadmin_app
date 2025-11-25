import React, { useEffect, useState, useRef } from "react";
import { View, Image, Animated } from "react-native";
import { useTheme, Button, IconButton, ProgressBar} from "react-native-paper";
import * as LucideIcons from "lucide-react-native";
import CustomText from "../../assets/CustomText";

import { StackScreenProps } from "@react-navigation/stack";
import { SkillsMaintenanceCategory, SkillsMaintenanceDrillCard, SkillsMaintenanceStackParamList } from "../../types/AppTypes";

import { useAppContext } from "../../helper/AppContext";

import { screenFlowModule } from "../../helper/ScreenFlowModule";
import CustomIcon from "../../assets/CustomIcon";
import { dataHandlerModule } from "../../helper/DataHandlerModule";

const loadDrillRandomCards = async (categoryId:string, setShowDialog: (vaL:boolean) => void) => {   
    try{
        const randomCards = await dataHandlerModule.batchGet(`GetRandomCards?CategoryId='${categoryId}'`, "Z_CFU_FLASHCARDS_SRV", "GetRandomCards")
        const data = randomCards.responseBody.d.results;
        
        return data;
    }catch (error) {
        setShowDialog(false);
		screenFlowModule.onNavigateToScreen('ErrorPage', error);
    }
}

type props = StackScreenProps<SkillsMaintenanceStackParamList, "DrillCardPage">;

//question and answer button text come from category object, set default value if empty
//question and answer img by default should be from category object, unless card object has then overwrite

const DrillCardsPage = ({ route, navigation }: props) => {
    const { setShowDialog, setShowBusyIndicator } = useAppContext();
    const [cards, setCards] = useState<SkillsMaintenanceDrillCard[]>([])
    const [currentCard, setCurrentCard] = useState<SkillsMaintenanceDrillCard | null>()
    const [nextCard, setNextCard] = useState<SkillsMaintenanceDrillCard | null>()
    const [questionIndex, setQuestionIndex] = useState(0)
    const [answerRevealed, setAnswerRevealed] = useState(false)
    const [completed, setCompleted] = useState(false)
    
    const cardImgHeight = useRef(new Animated.Value(100)).current
    const animatedHeight = cardImgHeight.interpolate({
      inputRange: [0, 100], // Map 0-100 numeric range
      outputRange: ['15%', '30%'], // To 0%-100% string range
    });
    const answerOpacity = useRef(new Animated.Value(0)).current
    const nextCardPos = useRef(new Animated.Value(100)).current
    const animatedCardPos = nextCardPos.interpolate({
        inputRange: [0, 100],
        outputRange: ['0%', '105%']
    })
    const completionPageOpacity = useRef(new Animated.Value(0)).current

    const theme = useTheme();
    const params = route.params ?? {};
    const category = params as unknown as SkillsMaintenanceCategory
    
    const drillNum = category.Name.includes("-") ? category.Name.substring(0, category.Name.indexOf("-")):null;
    const drillName = category.Name.includes("-") ? category.Name.substring(category.Name.indexOf("-") + 2):category.Name

    const questionButtonText = category.QuestionButtonText || "See Answer";
    const answerButtonText = category.AnswerButtonText || "Next Card";

    useEffect(() => {
        loadDrillRandomCards(category.Id, setShowDialog).then((res) => setCards(res))
    }, []);


    useEffect(() => {
        if(cards.length > 0){
            setShowBusyIndicator(false);
            setShowDialog(false);
            
            setCurrentCard(cards[0])
            setNextCard(cards[1])
        }
    }, [cards])

    const answer = () => {
        if(!answerRevealed){
            setAnswerRevealed(true)
            Animated.timing(cardImgHeight, {
                toValue: 0,
                duration: 300,
                useNativeDriver: false, // `width` and `height` cannot use native driver with percentage values
            }).start();
            Animated.timing(answerOpacity, {
                toValue: 1,
                duration: 500,
                useNativeDriver: false
            }).start()
        }else {
            if(questionIndex + 1 == cards.length){
                completePage()
            }else{
                //reset the currentCard 
                setTimeout(() => {
                    setCurrentCard(cards[questionIndex + 1])
                    cardImgHeight.setValue(100)
                    answerOpacity.setValue(0)
                    setAnswerRevealed(false)
                }, 450)

                Animated.timing(nextCardPos, {
                    toValue: 0,
                    duration: 500,
                    useNativeDriver: false,
                }).start(() => {
                    //reset the next card
                    if(questionIndex + 2 < cards.length){
                        nextCardPos.setValue(100)
                        setNextCard(cards[questionIndex + 2])
                    }else {
                        setNextCard(null)
                    }
                    setQuestionIndex(questionIndex + 1)
                });
            }
        }
    }

    const goBack = () => {
        if(!answerRevealed){
            //means we go back to the previous card
            setNextCard(cards[questionIndex])
            setTimeout(() => {
                nextCardPos.setValue(0)
                setCurrentCard(cards[questionIndex - 1])
                Animated.timing(nextCardPos, {
                    toValue: 100,
                    duration: 500,
                    useNativeDriver: false,
                }).start(() => {
                    setQuestionIndex(questionIndex - 1)
                });
            }, 100)
        }else {
            //means we go back to the question 
            setAnswerRevealed(false)
            Animated.timing(cardImgHeight, {
                toValue: 100,
                duration: 300,
                useNativeDriver: false,
            }).start();
            Animated.timing(answerOpacity, {
                toValue: 0,
                duration: 50,
                useNativeDriver: false
            }).start()
        }   
    }

    const completePage = () => {
        setCompleted(true)
        setCurrentCard(null)

        Animated.timing(completionPageOpacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: false
        }).start()
    }

    const navigateToDrillInstructions = () => {
        setShowBusyIndicator(true);
        setShowDialog(true);
            
        setTimeout(() => {    
            screenFlowModule.onNavigateToScreen("DrillInstructionsPage", category);
        }, 500);
    };

    const navigateToSkillsMaintenance = () => {            
        setTimeout(() => {    
            navigation.pop(2)
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
                        <ProgressBar progress={(questionIndex + 1) / cards.length} color={theme.colors.primaryContainer} style={{height: 20, marginVertical: 10, borderRadius: 10, borderWidth: 1, backgroundColor: "#fff"}}/>
                        <View style={{backgroundColor: theme.colors.onPrimary, borderWidth: 1, boxShadow: "5px 5px 5px rgba(0, 0, 0, 0.3)", width: "95%", height: "82%", borderRadius: 25, marginHorizontal: "auto"}}>
                            <Animated.Image source={{uri: `data:image/png;base64,${!answerRevealed ? (currentCard.QuestionImg ? currentCard.QuestionImg:category.QuestionImg) : (currentCard.AnswerImg ? currentCard.AnswerImg:category.AnswerImg)}`}} style={{borderTopLeftRadius: 25, borderTopRightRadius: 25, height: animatedHeight, width: "100%"}}/>
                            <View style={{flexDirection: "row", justifyContent:"space-between", alignItems: "center", marginHorizontal: 20, marginTop: 20}}>
                                <CustomText variant='titleLargeBold'>{!answerRevealed ? "Question":"Answer"}</CustomText>
                                <CustomText variant='titleMedium'>{cards.indexOf(currentCard) + 1} of {cards.length}</CustomText>
                            </View>
                            {!answerRevealed && <CustomText style={{marginHorizontal: 20, marginTop: 20}} variant='titleLarge'>{currentCard.Question}</CustomText>}
                            <Animated.View style={{opacity: answerOpacity, marginHorizontal: 20, marginTop: 20 }}>
                                <CustomText variant='titleLarge'>{currentCard.Answer}</CustomText>
                            </Animated.View>       
                        </View>
                        {nextCard && (
                            <Animated.View style={{transform: [{translateY: "-100%"}, {translateX: animatedCardPos}],backgroundColor: theme.colors.onPrimary, borderWidth: 1, boxShadow: "5px 5px 5px rgba(0, 0, 0, 0.3)", width: "95%", height: "82%", borderRadius: 25, marginHorizontal: "auto"}}>
                                <Image source={{uri: `data:image/png;base64,${nextCard.QuestionImg ? nextCard.QuestionImg:category.QuestionImg}`}} style={{borderTopLeftRadius: 25, borderTopRightRadius: 25, height: "30%", width: "100%"}}/>
                                <View style={{flexDirection: "row", justifyContent:"space-between", alignItems: "center",marginHorizontal: 20, marginTop: 20}}>
                                    <CustomText variant='titleLargeBold'>Question</CustomText>
                                    <CustomText variant='titleMedium'>{cards.indexOf(nextCard) + 1} of {cards.length}</CustomText>
                                </View>
                                <CustomText style={{marginHorizontal: 20, marginTop: 20}} variant='titleLarge'>{nextCard.Question}</CustomText>
                            </Animated.View>
                        )}
                    </>
                )}
                {completed && (
                    <Animated.View style={{height: "100%", opacity: completionPageOpacity}}>
                        {drillNum && <CustomText style={{}} variant='titleLarge'>{drillNum}</CustomText>}
                        <CustomText variant='titleLargeBold'>{drillName}</CustomText>
                        <Animated.Image source={{uri: `data:image/png;base64,${category.CompletionImg}`}} style={{marginTop: 20, borderRadius: 10, height: "35%", width: "100%"}}/>
                        <CustomText style={{textAlign: "center", marginTop:20}} variant='titleLarge'>{category.CompletionText}</CustomText>
                    </Animated.View>
                )}
            </View>
            <View style={{width:"90%", position: "absolute", bottom: 10, gap: 10, marginHorizontal: 20}}>
                {completed && (
                    <Button icon={() => <CustomIcon name="File" color={category.InstructionLink ? theme.colors.primary : theme.colors.surfaceDisabled} size={20}/>}style={{borderRadius: 10, borderWidth: 1, borderColor: category.InstructionLink ? theme.colors.primary : theme.colors.surfaceDisabled}} contentStyle={{height: 50}} mode="outlined" disabled={!category.InstructionLink} onPress={navigateToDrillInstructions} >
                        <CustomText style={{color: category.InstructionLink ? theme.colors.primary : theme.colors.surfaceDisabled}} variant='titleMediumBold'>Open instructions</CustomText>
                    </Button>
                )}
                <View style={{flex: 1,  flexDirection: "row", gap: 10}}>
                    {!completed && (questionIndex > 0 || answerRevealed) && (
                        <Button icon={() => <LucideIcons.ChevronLeft color={theme.colors.primary} size={25} style={{marginLeft: "50%"}}/>} style={{borderRadius: 10, borderWidth: 1, borderColor: theme.colors.primary}} contentStyle={{height: 50, aspectRatio: 1 }} mode="outlined" onPress={goBack} >
                            {" "}
                        </Button>
                    )}
                    <Button buttonColor={completed ? theme.colors.primary:"#fff"}style={{flex: 0.8, flexGrow: 1, borderRadius: 10, borderWidth: 1, borderColor: theme.colors.primary}} contentStyle={{height: 50}} mode="outlined" onPress={() => {completed ? navigateToSkillsMaintenance() : answer()}} >
                        <CustomText style={{ color: completed ? "#fff":theme.colors.primary}} variant='titleMediumBold'>{completed ? "End group discussion" : !answerRevealed ? questionButtonText : answerButtonText}</CustomText>
                    </Button>
                </View>
            </View>
        </View>
    )
}

export default DrillCardsPage;