import React, { useEffect, useState, useRef } from "react";
import { View, Image, Animated } from "react-native";
import { useTheme, Button, IconButton, ProgressBar} from "react-native-paper";
import * as LucideIcons from "lucide-react-native";
import CustomText from "../../assets/CustomText";

import { StackScreenProps } from "@react-navigation/stack";
import { SkillsMaintenanceDrillCard, SkillsMaintenanceStackParamList } from "../../types/AppTypes";

import { useAppContext } from "../../helper/AppContext";

import { screenFlowModule } from "../../helper/ScreenFlowModule";
import CustomIcon from "../../assets/CustomIcon";
import { dataHandlerModule } from "../../helper/DataHandlerModule";

const loadDrillRandomCards = async (categoryId:string) => {
    const randomCards = await dataHandlerModule.getSkillsMaintenanceRandomCards(categoryId)

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

type props = StackScreenProps<SkillsMaintenanceStackParamList, "DrillCardPage">;

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
        setNextCard(cards[1])
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
                setCompleted(true)
                setCurrentCard(null)
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
                    nextCardPos.setValue(100)
                    setNextCard(cards[questionIndex + 2])
                    setQuestionIndex(questionIndex + 1)
                });
            }
        }
    }

    const navigate = () => {            
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
                        <ProgressBar progress={(questionIndex + 1) / cards.length} color={theme.colors.secondaryContainer} style={{height: 20, marginVertical: 10, borderRadius: 10, borderWidth: 1, backgroundColor: "#fff5f5ff"}}/>
                        <View style={{backgroundColor: theme.colors.onPrimary, borderWidth: 1, boxShadow: "5px 5px 5px rgba(0, 0, 0, 0.3)", width: "95%", height: "82%", borderRadius: 25, marginHorizontal: "auto"}}>
                            <Animated.Image source={{uri: `data:image/png;base64,${!answerRevealed ? category.QuestionImg : category.AnswerImg}`}} style={{borderTopLeftRadius: 25, borderTopRightRadius: 25, height: animatedHeight, width: "100%"}}/>
                            <View style={{flexDirection: "row", justifyContent:"space-between", alignItems: "center", marginHorizontal: 20, marginTop: 20}}>
                                <CustomText variant='titleLargeBold'>{!answerRevealed ? "Question":"Answer"}</CustomText>
                                <CustomText variant='titleMedium'>{questionIndex + 1} of {cards.length}</CustomText>
                            </View>
                            {!answerRevealed && <CustomText style={{marginHorizontal: 20, marginTop: 20}} variant='titleLarge'>{currentCard.Question}</CustomText>}
                            <Animated.View style={{opacity: answerOpacity, marginHorizontal: 20, marginTop: 20 }}>
                                <CustomText variant='titleLarge'>{currentCard.Answer}</CustomText>
                            </Animated.View>       
                        </View>
                        {nextCard && (
                            <Animated.View style={{transform: [{translateY: "-100%"}, {translateX: animatedCardPos}],backgroundColor: theme.colors.onPrimary, borderWidth: 1, boxShadow: "5px 5px 5px rgba(0, 0, 0, 0.3)", width: "95%", height: "82%", borderRadius: 25, marginHorizontal: "auto"}}>
                                <Image source={{uri: `data:image/png;base64,${category.QuestionImg}`}} style={{borderTopLeftRadius: 25, borderTopRightRadius: 25, height: "30%", width: "100%"}}/>
                                <View style={{flexDirection: "row", justifyContent:"space-between", alignItems: "center",marginHorizontal: 20, marginTop: 20}}>
                                    <CustomText variant='titleLargeBold'>Question</CustomText>
                                    <CustomText variant='titleMedium'>{questionIndex + 2} of {cards.length}</CustomText>
                                </View>
                                <CustomText style={{marginHorizontal: 20, marginTop: 20}} variant='titleLarge'>{nextCard.Question}</CustomText>
                            </Animated.View>
                        )}
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

export default DrillCardsPage;