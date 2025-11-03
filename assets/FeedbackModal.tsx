import { useEffect, useRef, useState} from 'react';
import { View, Image, Animated } from 'react-native';
import { Modal, IconButton, useTheme, Button, TextInput } from 'react-native-paper';

import CustomText from '../assets/CustomText';
import CustomIcon from "../assets/CustomIcon"

import * as LucideIcons from "lucide-react-native";
import { screenFlowModule } from '../helper/ScreenFlowModule';
import Emoji from './Emoji';

const FeedbackModal = ({visible, setVisible}:{visible: boolean, setVisible: (val: boolean) => void}) => {
    const slideAnim = useRef(new Animated.Value(-1000)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const theme = useTheme();

    const [emojiSelection, setEmojiSelection] = useState([false, false, false, false, false])

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

    useEffect(()=> {
        if(visible){
            slideIn()
            fadeIn()
        }else {
            slideOut()
            fadeOut()
        }
    }, [visible])

    const onSelect = (index: number) => {
        const arr = [false, false, false, false, false]
        arr[index] = true

        setEmojiSelection(arr)
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
                    <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 20, marginBottom: 10}}>
                        <IconButton icon={() => <LucideIcons.ChevronLeft color={theme.colors.primary} size={25}/>} size={20} onPress={() => setVisible(false)} />
                        <CustomText style={{marginLeft: 20}} variant='titleLargeBold'>Feedback</CustomText>
                    </View>
                    <View>
                        <CustomText style={{marginHorizontal: 20}} variant='displaySmallBold'>Share your feedback</CustomText>
                        <CustomText style={{marginHorizontal: 20, marginTop: 20}} variant='headlineMedium'>Rate your experience</CustomText>
                    </View>
                    <View style={{flexDirection:"row", justifyContent: "space-around", gap: 5, marginVertical: 20, marginHorizontal: 20}}>
                        <Emoji rating='unhappy' size={40} pressed={emojiSelection[0]} onPress={() => onSelect(0)}/>
                        <Emoji rating='unamused' size={40} pressed={emojiSelection[1]} onPress={() => onSelect(1)}/>
                        <Emoji rating='neutral' size={40} pressed={emojiSelection[2]} onPress={() => onSelect(2)}/>
                        <Emoji rating='happy' size={40} pressed={emojiSelection[3]} onPress={() => onSelect(3)}/>
                        <Emoji rating='very happy' size={40}pressed={emojiSelection[4]} onPress={() => onSelect(4)}/>
                    </View>
                    <TextInput multiline={true} placeholder='Add a comment...' style={{marginHorizontal: 20, height: 250}}contentStyle={{}} mode='outlined'/>
                    <View style={{position: "absolute", bottom: 10, width: "100%" }}>
                        <Button style={{marginHorizontal: 20, borderRadius: 10}} contentStyle={{height: 50}} mode="contained" buttonColor={theme.colors.primary} onPress={() => setVisible(false)} >
                            <CustomText style={{marginLeft: 20, color: "#fff"}} variant='titleMediumBold'>Submit</CustomText>
                        </Button>
                    </View>
                </View>
            </Modal>
        </>
    )
}

export default FeedbackModal