import {useState} from "react"
import {View, TextInput, StyleProp, ViewStyle, StyleSheet} from "react-native"
import CustomText from "./CustomText"

/**
 * editable is passed straight to native component (overriden to false by mode flat)
 * label - text label to display 
 * mode - either flat or outlined
 * onChangeText handler is passed straight to native component
 * right - Optional React Node to display on right hand side (alignment might need work)
 * style - style prop applied to root element
 * textColor - text color for main value and label (value defaults to black and grey for label)
 * value is passed straight to native component
 * 
 * Sample use:
 *  <CustomTextInput style={{...GlobalStyles.disabledTextInput}} editable={false} label="" mode="flat" value='Test value'/>
 *  <CustomTextInput style={{marginTop: 16, ...GlobalStyles.disabledTextInput}} onChangeText={(e) => setTempVal(e)} editable={true} label="Test Label" mode="outlined" value={tempVal} right={<TextInput.Icon icon={() => <LucideIcons.Pencil color={theme.colors.primary} size={20}/>} onPress={() => EditData()}/>}/>
 */
const CustomTextInput = ({ editable, label, mode, onChangeText, right, style, textColor,  value  } : { editable?: boolean, label?: string, mode: "flat" | "outlined", onChangeText?: (text:string)=>void, right?: React.ReactNode, style?: StyleProp<ViewStyle>, textColor?: string, value?: string }) => {
    if(mode == "flat"){
        return <FlatTextInput label={label} onChangeText={onChangeText} right={right} style={style} textColor={textColor} value={value}/>
    }else if (mode == "outlined"){
        return <OutlinedTextInput editable={editable} label={label} onChangeText={onChangeText} right={right} style={style} textColor={textColor} value={value}/>
    }
}

const FlatTextInput = ({ label, onChangeText, right, style, textColor,  value  } : { label?: string, onChangeText?: (text:string)=>void, right?: React.ReactNode, style?: StyleProp<ViewStyle>, textColor?: string, value?: string }) => {
    //the label is basically translated down to get it close to the value text
    //if there's no label, we add vertical padding to maintain the same height and move the value centred
    return (
        <View style={[style, {paddingLeft: 12}]}>
            {label && <CustomText variant="labelMedium" style={{color: textColor || "#1e1e1e", marginLeft: 4, top: 8, zIndex: 1}}>{label}</CustomText>}
            <View style={{flexDirection: "row", justifyContent:"space-between", paddingVertical: label ? 0 : 8 }}>
                <TextInput 
                    editable={false}
                    onChangeText={onChangeText}
                    style={[{color: textColor || "black", fontSize: 16}] }
                    value={value}
                />
                <View style={{padding:20}}>
                    {right}
                </View>
            </View>
        </View>    
    )
}

const OutlinedTextInput  = ({ editable, label, onChangeText, right, style, textColor,  value  } : {  editable?: boolean, label?: string, onChangeText?: (text:string)=>void, right?: React.ReactNode, style?: StyleProp<ViewStyle>, textColor?: string, value?: string }) => {    
    const {backgroundColor} = StyleSheet.flatten(style)
    const [focused, setFocused] = useState(false)
    //background color is not directly applied to root element so we take that value and apply to the correct element
    //we track if the box is in focus and change the border width

    //to break the border, we overlay a style on top of the main box
    //then offset the inside text up so that it appears on the border-line
    return (
        <View style={[style, {backgroundColor:"transparent", transform: [{translateY: label?-8:8}], marginBottom: label ? 0 : 16}]}> 
            {label && 
                <View pointerEvents="none" style={{marginLeft: 12, paddingHorizontal: 4, zIndex: 1, width: "auto", alignSelf:"flex-start", top: 16, backgroundColor: backgroundColor}}>
                    <CustomText variant="labelMedium" style={{color: textColor || "#1e1e1e", top: -8}}>{label}</CustomText>
                </View>        
            }
            <View style={[{backgroundColor: backgroundColor, paddingLeft: 12, padding: 4, borderWidth: focused ? 2 : 1, borderRadius: 5, flexDirection: "row", justifyContent:"space-between", alignItems: "center"}]}>
                <TextInput 
                    editable={editable}
                    onChangeText={onChangeText}
                    style={{color: textColor || "black", fontSize: 16, flexGrow: 1} }
                    value={value}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                />
                <View style={{padding:18, paddingBottom: 5}}>
                    {right}
                </View>
            </View>
        </View>    
    )
}

export default CustomTextInput