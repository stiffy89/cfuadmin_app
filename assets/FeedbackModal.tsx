import { useEffect, useRef, useState} from 'react';
import { View, Animated } from 'react-native';
import { Modal, IconButton, useTheme, Button, TextInput } from 'react-native-paper';

import CustomText from '../assets/CustomText';

import * as LucideIcons from "lucide-react-native";
import Emoji, { EmojiType } from './Emoji';
import { resourceDataHandlerModule } from '../helper/ResourcesDataHandlerModule';
import { useAppContext } from '../helper/AppContext';

type FeedbackRating = {
    emojiType: EmojiType,
    emojiLabel: string,
    ratingValue: string
}

const FeedbackRatings: FeedbackRating[] = [
    {
        emojiType: "unhappy",
        emojiLabel: "Unhappy",
        ratingValue: "1"
    },
    {
        emojiType: "unamused",
        emojiLabel: "Unamused",
        ratingValue: "2"
    },
    {
        emojiType: "neutral",
        emojiLabel: "Neutral",
        ratingValue: "3"
    },
    {
        emojiType: "happy",
        emojiLabel: "Happy",
        ratingValue: "4"
    },
    {
        emojiType: "very happy",
        emojiLabel: "Awesome",
        ratingValue: "5"
    },
]

const FeedbackModal = ({visible, setVisible}:{visible: boolean, setVisible: (val: boolean) => void}) => {
    const { setShowDialog, setShowBusyIndicator } = useAppContext();
    const theme = useTheme();

    const modalAnim = useRef(new Animated.Value(0)).current
    const modalPos = modalAnim.interpolate({
        inputRange: [0, 100],
        outputRange: ['-120%', '-20%']
    })
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const ratingLabelOpacityAnims = useRef(
        Array.from(FeedbackRatings, () => new Animated.Value(0))
    ).current;
    const confirmationFadeAnim = useRef(new Animated.Value(0)).current

    const [emojiSelection, setEmojiSelection] = useState([false, false, false, false, false])
    const [rating, setRating] = useState<FeedbackRating | undefined>()
    const [comment, setComment] = useState("")
    const [submitting, setSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)

    const slideIn = () => {
        Animated.timing(modalAnim, {
            toValue: 100,
            duration: 500, 
            useNativeDriver: false,
        }).start();
    };
    const slideOut = () => {
        Animated.timing(modalAnim, {
            toValue: 0,
            duration: 500, 
            useNativeDriver: false, 
      }).start();
    }
    const fadeIn = () => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500, 
            useNativeDriver: true,
        }).start();
    }
    const fadeOut = () => {
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 500, 
            useNativeDriver: true,
        }).start();
    }
    const fadeInConfirmation = () => {
        Animated.timing(confirmationFadeAnim, {
            toValue: 1,
            duration: 1000, 
            useNativeDriver: true,
        }).start();
    }

    const animateLabelAnims = (sel: number) => {
      ratingLabelOpacityAnims.forEach((value, index) => {
        if(index == sel){
            Animated.timing(value, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }else {
            Animated.timing(value, {
                toValue: 0,
                duration: 100,
                useNativeDriver: true,
            }).start();
        }
      });
    };


    useEffect(()=> {   
        if(visible){
            slideIn()
            fadeIn()
        }else {
            slideOut()
            fadeOut()
        }
    }, [visible])

    const onSelect = (index: number, selected: boolean, fbRating : FeedbackRating) => {
        const arr = [false, false, false, false, false]
        arr[index] = selected

        setEmojiSelection(arr)
        setRating(selected ? fbRating : undefined)
        animateLabelAnims(selected ? index : -1)
    }

    const onSubmit = async () => {
        setSubmitting(true)
        setShowBusyIndicator(true);
        setShowDialog(true);
        
        if(comment.length < 1 && !rating){
            console.log("Block")
            setSubmitting(false)
            setShowBusyIndicator(false);
            setShowDialog(false);
        }else{
            setTimeout(async () => {
                await resourceDataHandlerModule.postFeedbackSet(rating ? rating.ratingValue : "", comment).then((res)=>{
                    setSubmitting(false)
                    setShowBusyIndicator(false);
                    setShowDialog(false);
                    if(res.status == 201){
                        //we're good
                        setSubmitted(true)
                        fadeInConfirmation()
                    }else {
                        //we're not so good
                        console.log("Something went wrong")
                    }
                })
            }, 1000)
        }
    }

    return (
        <>  
            <Modal visible={visible} onDismiss={() => setVisible(false)} style={{ width: "100%", height: "100%" }} contentContainerStyle={{ height: "80%", opacity: fadeAnim }}>
                <Animated.View style={{ transform: [{ translateY: modalPos}],flex: 1, backgroundColor: "#fff", borderBottomLeftRadius: 20, borderBottomRightRadius: 20 }}>
                    <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 20}}>
                        <IconButton icon={() => <LucideIcons.ChevronLeft color={theme.colors.primary} size={25}/>} size={20} onPress={() => setVisible(false)} />
                        <CustomText style={{marginLeft: 20}} variant='titleLargeBold'>Feedback</CustomText>
                    </View>
                    {!submitted && (<>
                        <CustomText style={{marginHorizontal: 20, marginTop: 10}} variant='displaySmallBold'>Share your feedback</CustomText>
                        <CustomText style={{marginHorizontal: 20, marginTop: 10}} variant='headlineMedium'>Rate your experience</CustomText>
                        <View style={{flexDirection:"row", justifyContent: "center", marginTop: 20, marginHorizontal: 20}}>
                            {
                                FeedbackRatings.map((fbRating, index) => {
                                    return (
                                        <View key={`rating_${fbRating.emojiLabel}`}style={{alignItems: "center", width: 85, marginHorizontal: -5, marginTop: 10 }}>
                                            <Emoji type={fbRating.emojiType} size={40} pressed={emojiSelection[index]} onPress={(selected:boolean) => onSelect(index, selected, fbRating)}/>
                                            <Animated.View style={{ opacity: ratingLabelOpacityAnims[index]}}>
                                                <CustomText style={{marginTop: 20, color: "#4f8af8ff"}} variant='titleMediumBold'>{fbRating.emojiLabel}</CustomText>
                                            </Animated.View>
                                        </View>
                                    )
                                })
                            }
                        </View>
                        <TextInput multiline={true} placeholder='Add a comment...' value={comment} onChangeText={text => setComment(text)} style={{marginHorizontal: 20, marginTop: 20, height: 275}} mode='outlined'/>
                        <View style={{ marginTop: 20, width: "100%" }}>
                            <Button style={{marginHorizontal: 20, borderRadius: 10}} contentStyle={{height: 50}} mode="contained" buttonColor={theme.colors.primary} disabled={(comment.length < 1 && !rating) || submitting} onPress={onSubmit} >
                                <CustomText style={{marginLeft: 20, color: "#fff"}} variant='titleMediumBold'>Submit</CustomText>
                            </Button>
                        </View>
                    </>)}
                    {submitted && (
                        <>
                            <Animated.View style={{opacity: confirmationFadeAnim}}>
                                <CustomText style={{marginHorizontal: 20, marginTop: 10}} variant='displaySmallBold'>Thank you for your valuable feedback!</CustomText>
                                <CustomText style={{marginHorizontal: 20, marginTop: 10}} variant='headlineMedium'>We appreciate your time and input, which will help us enhance the quality and performance of our app.</CustomText>
                            </Animated.View>
                            <View style={{ position: "absolute", bottom: 20, width: "100%" }}>
                                <Button style={{marginHorizontal: 20, borderRadius: 10}} contentStyle={{height: 50}} mode="contained" buttonColor={theme.colors.primary} disabled={comment.length < 1 && !rating} onPress={() => setVisible(false)} >
                                    <CustomText style={{marginLeft: 20, color: "#fff"}} variant='titleMediumBold'>Close</CustomText>
                                </Button>
                            </View>
                        </>
                    )}
                </Animated.View>
            </Modal>
        </>
    )
}

export default FeedbackModal