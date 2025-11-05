import { useEffect, useState, useRef } from 'react';
import {Image, Animated, ColorValue, Pressable} from 'react-native';


export type EmojiType = "very happy" | "happy" | "neutral" | "unamused" | "unhappy"

const Emoji = ({type, size = 50, pressed, onPress}:{type : EmojiType, size?: number, pressed:boolean, onPress:any}) => {
    const [isPlaying, setIsPlaying] = useState(false)
    const [gifSource, setGifSource] = useState(require(`../assets/emojis/very-happy/very-happy.gif`))
    const [imgSource, setImgSource] = useState(require(`../assets/emojis/very-happy/0-very-happy.png`))
    
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const bgColorAnim = useRef(new Animated.Value(0)).current
    
    useEffect(() => {
        setIsPlaying(pressed)
    }, [pressed])

    useEffect(() => {
        if(isPlaying){
            scaleUp()
            fadeBgIn()
        }else {
            scaleDown()
            fadeBgOut()
        }
    }, [isPlaying])

    const scaleUp = () => {
        Animated.timing(scaleAnim, {
            toValue: 1.5,
            duration: 200, 
            useNativeDriver: true,
        }).start();
    };
    const scaleDown = () => {
        Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 200, 
            useNativeDriver: true, 
      }).start();
    }
    const fadeBgIn = () => {
        Animated.timing(bgColorAnim, {
            toValue: 1,
            duration: 200, 
            useNativeDriver: true,
        }).start();
    };
    const fadeBgOut = () => {
        Animated.timing(bgColorAnim, {
            toValue: 0,
            duration: 200, 
            useNativeDriver: true, 
      }).start();
    }

    const animatedBgColor = bgColorAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['rgba(79, 138, 248, 0)', 'rgba(79, 138, 248, 1)'], // Example: from transparent black to solid black
    }) as unknown as ColorValue;

    useEffect(() => {
        switch(type) {
            case "very happy":
                setGifSource(require(`../assets/emojis/very-happy/very-happy.gif`))
                setImgSource(require(`../assets/emojis/very-happy/0-very-happy.png`))
                break;

            case "happy":
                setGifSource(require(`../assets/emojis/happy/happy.gif`))
                setImgSource(require(`../assets/emojis/happy/0-happy.png`))
                break;

            case "neutral":
                setGifSource(require(`../assets/emojis/neutral/neutral.gif`))
                setImgSource(require(`../assets/emojis/neutral/0-neutral.png`))
                break;

            case "unamused":
                setGifSource(require(`../assets/emojis/unamused/unamused.gif`))
                setImgSource(require(`../assets/emojis/unamused/0-unamused.png`))
                break;

            case "unhappy":
                setGifSource(require(`../assets/emojis/unhappy/unhappy.gif`))
                setImgSource(require(`../assets/emojis/unhappy/0-unhappy.png`))
                break;
        }
    }, [])

    const handlePress = () => {
        //callback with the new state
        onPress(!isPlaying)
        setIsPlaying(!isPlaying)
    }
    
    return (
        <Pressable onPress={handlePress}>
            <Animated.View style={{transform: [{ scale: scaleAnim }], backgroundColor: animatedBgColor, borderRadius: "50%", padding: 5}}>
                <Image source={isPlaying ? gifSource : imgSource} style={{ width: size, height: size }}/>
            </Animated.View>
        </Pressable>
    )
}

export default Emoji;