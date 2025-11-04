import { useEffect, useRef, useState} from 'react';
import { View, Image, Animated } from 'react-native';
import { Modal, IconButton, useTheme, Button, TextInput } from 'react-native-paper';

import CustomText from '../assets/CustomText';

import * as LucideIcons from "lucide-react-native";
import Emoji, { EmojiType } from './Emoji';

type FeedbackRating = {
    emojiType: EmojiType,
    emojiLabel: string
}

const FeedbackRatings: FeedbackRating[] = [
    {
        emojiType: "unhappy",
        emojiLabel: "Unhappy"
    },
    {
        emojiType: "unamused",
        emojiLabel: "Unamused"
    },
    {
        emojiType: "neutral",
        emojiLabel: "Neutral"
    },
    {
        emojiType: "happy",
        emojiLabel: "Happy"
    },
    {
        emojiType: "very happy",
        emojiLabel: "Awesome"
    },
]

const FeedbackModal = ({visible, setVisible}:{visible: boolean, setVisible: (val: boolean) => void}) => {
    const slideAnim = useRef(new Animated.Value(-1000)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const ratingLabelOpacityAnims = useRef(
        Array.from(FeedbackRatings, () => new Animated.Value(0))
    ).current;
    const theme = useTheme();

    const [emojiSelection, setEmojiSelection] = useState([false, false, false, false, false])
    const [rating, setRating] = useState<FeedbackRating>()
    const [comment, setComment] = useState("")

    const slideIn = () => {
        Animated.timing(slideAnim, {
            toValue: 0,
            duration: 500, 
            useNativeDriver: true,
        }).start();
    };
    const slideOut = () => {
        Animated.timing(slideAnim, {
            toValue: -1000,
            duration: 500, 
            useNativeDriver: true, 
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
        setRating(fbRating)
        animateLabelAnims(selected ? index : -1)
    }

    const onSubmit = () => {
        setVisible(false)
        const response = {
            experience: rating?.emojiLabel,
            comment: comment
        }
        console.log(response)
    }

    return (
        <>  
            <Modal visible={visible} onDismiss={() => setVisible(false)} 
                contentContainerStyle={{
                    position:"absolute",
                    top: -85,
                    width: "100%", 
                    height: "100%",
                    transform: [{ translateY: slideAnim }],
                    opacity: fadeAnim
                }}
                >
                <View style={{ height: "90%",backgroundColor: "#fff", borderBottomLeftRadius: 20, borderBottomRightRadius: 20 }}>
                    <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 20}}>
                        <IconButton icon={() => <LucideIcons.ChevronLeft color={theme.colors.primary} size={25}/>} size={20} onPress={() => setVisible(false)} />
                        <CustomText style={{marginLeft: 20}} variant='titleLargeBold'>Feedback</CustomText>
                    </View>
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
                    <TextInput multiline={true} placeholder='Add a comment...' value={comment} onChangeText={text => setComment(text)} style={{marginHorizontal: 20, marginTop: 20, height: 300}} mode='outlined'/>
                    <View style={{ marginTop: 20, width: "100%" }}>
                        <Button style={{marginHorizontal: 20, borderRadius: 10}} contentStyle={{height: 50}} mode="contained" buttonColor={theme.colors.primary} onPress={onSubmit} >
                            <CustomText style={{marginLeft: 20, color: "#fff"}} variant='titleMediumBold'>Submit</CustomText>
                        </Button>
                    </View>
                </View>
            </Modal>
        </>
    )
}

export default FeedbackModal