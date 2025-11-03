import { useEffect, useState, useRef } from 'react';
import {Image, Animated, ColorValue, Pressable} from 'react-native';


type EmojiType = "very happy" | "happy" | "neutral" | "unamused" | "unhappy"

const Emoji = ({rating, size = 50, pressed, onPress}:{rating : EmojiType, size?: number, pressed:boolean, onPress:any}) => {
    const [isPlaying, setIsPlaying] = useState(false)
    const [gifSource, setGifSource] = useState(require(`../assets/emojis/very-happy/emoji.gif`))
    const [imgSource, setImgSource] = useState(require(`../assets/emojis/very-happy/emoji.png`))
    
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
        switch(rating) {
            case "very happy":
                setGifSource(require(`../assets/emojis/very-happy/emoji.gif`))
                setImgSource(require(`../assets/emojis/very-happy/emoji.png`))
                break;

            case "happy":
                setGifSource(require(`../assets/emojis/happy/emoji.gif`))
                setImgSource(require(`../assets/emojis/happy/emoji.png`))
                break;

            case "neutral":
                setGifSource(require(`../assets/emojis/neutral/emoji.gif`))
                setImgSource(require(`../assets/emojis/neutral/emoji.png`))
                break;

            case "unamused":
                setGifSource(require(`../assets/emojis/unamused/emoji.gif`))
                setImgSource(require(`../assets/emojis/unamused/emoji.png`))
                break;

            case "unhappy":
                setGifSource(require(`../assets/emojis/unhappy/emoji.gif`))
                setImgSource(require(`../assets/emojis/unhappy/emoji.png`))
                break;
        }
    }, [])

    const handlePress = () => {
        setIsPlaying(!isPlaying)
        onPress()
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