import { useEffect, useRef, useState} from 'react';
import { View, Image, Animated } from 'react-native';
import { Modal, IconButton } from 'react-native-paper';

import CustomText from '../assets/CustomText';
import CustomIcon from "../assets/CustomIcon"
import { useDataContext } from '../helper/DataContext';
import { resourceDataHandlerModule } from '../helper/ResourcesDataHandlerModule';

const loadPhoto = async (pernr: string) => {
    const photo = await resourceDataHandlerModule.getIdCardPhoto(pernr)

	return photo
}

const CardModal = ({visible, setVisible}:{visible: boolean, setVisible: (val: boolean) => void}) => {
	const user = useDataContext().currentUser[0];
	const membership = useDataContext().membershipDetails[0];
	const [photoType, setPhotoType] = useState("")
	const [photo, setPhoto] = useState("")

	const slideAnim = useRef(new Animated.Value(-1000)).current;
	const fadeAnim = useRef(new Animated.Value(0)).current;
    const closeFadeAnim = useRef(new Animated.Value(0)).current;
	const imageFadeAnim = useRef(new Animated.Value(0)).current

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
			delay: 100,
        	duration: 400, 
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
	const imageFadeIn = () => {
		Animated.timing(imageFadeAnim, {
        	toValue: 1,
			delay: 200,
        	duration: 500, 
        	useNativeDriver: true,
      	}).start();
	}
	const imageFadeOut = () => {
		Animated.timing(imageFadeAnim, {
        	toValue: 0,
        	duration: 100, 
        	useNativeDriver: true,
      	}).start();
	}
    const closeFadeIn = () => {
		Animated.timing(closeFadeAnim, {
            delay: 800,
        	toValue: 0.8,
        	duration: 200, 
        	useNativeDriver: true,
      	}).start();
	}
	const closeFadeOut = () => {
		Animated.timing(closeFadeAnim, {
        	toValue: 0,
        	duration: 0, 
        	useNativeDriver: true,
      	}).start();
	}

	useEffect(() => {
		if(user){
			loadPhoto(user.Pernr).then(res => {
				setPhotoType(res.headers['content-type'])
				setPhoto(res.request._response)
			})
		}
	}, [user])

	useEffect(()=> {
		if(visible){
			slideIn()
			fadeIn()
			imageFadeIn()
            closeFadeIn()
		}else {
			slideOut()
			fadeOut()
			imageFadeOut()
            closeFadeOut()
		}
	}, [visible])

	return (
        <>  
            <Modal visible={visible} onDismiss={() => setVisible(false)} 
                contentContainerStyle={{
                    marginHorizontal: "auto", 
                    width: "95%", 
                    height: "100%",
                    transform: [{ translateY: slideAnim }],
                    opacity: fadeAnim
                }}
                >
                <View style={{ height: "80%",backgroundColor: "#0d5183", borderRadius: 20, }}>
                    <View style={{backgroundColor: "#cdc6c0", flex: 2, flexDirection: "row", gap: 10, marginTop: 25, justifyContent: "center" }}>
                        <Image
                            style={{ width: 100, height: "100%", resizeMode: "contain" }}
                            source={{
								uri: 'https://www.fire.nsw.gov.au/images/content/FRNSW-logo.png',
                            }}
                        />
                        <View style={{marginTop: 25}}>
                            <CustomText style={{ color: "#a8211a"}} variant='displaySmallBold'>COMMUNITY</CustomText>
                            <CustomText style={{ color: "#a8211a", marginTop: -10}} variant='displaySmallBold'>FIRE</CustomText>
                            <CustomText style={{ color: "#a8211a", marginTop: -10}} variant='displaySmallBold'>UNITS</CustomText>
                        </View>
                    </View>
                    <View style={{backgroundColor: "#fff", flex: 5, alignItems: "center", justifyContent: "center" }}>
                        <Animated.Image
                            style={{ width: 175, height: 225, borderRadius: 10, opacity: imageFadeAnim }}
                            source={{ uri: `data:${photoType};base64,${photo}`}}
                        />
                        <CustomText variant='headlineSmallBold'>{user?.Vorna} {user?.Nachn}</CustomText>
                        <CustomText variant='headlineSmallBold'>{parseInt(user?.Pernr)}</CustomText>
                        <CustomText variant='headlineSmallBold'>{membership?.Otext}</CustomText>
                    </View>
                    <View style={{flex: 1, alignItems: "center", justifyContent: "center" }}>
                        <CustomText style={{ color: "#cdc6c0"}} variant='displayMediumBold'>VOLUNTEER</CustomText>
                    </View>
                </View>
                <Animated.View style={{backgroundColor: "#fff", marginHorizontal: "auto", marginTop: 80, borderRadius: "50%", opacity: closeFadeAnim}}>
                    <IconButton icon={() => <CustomIcon name="X" color={"black"} size={30}/>} size={30} onPress={() => setVisible(false)} />
                </Animated.View>
            </Modal>
        </>
	)
}

export default CardModal