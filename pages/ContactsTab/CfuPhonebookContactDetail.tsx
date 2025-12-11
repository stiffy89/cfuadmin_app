import React, { useRef } from 'react';
import { View, ScrollView, Linking, Pressable } from 'react-native';
import { useTheme, IconButton, TextInput } from 'react-native-paper';
import * as LucideIcons from 'lucide-react-native';
import { screenFlowModule } from '../../helper/ScreenFlowModule';
import CustomText from '../../assets/CustomText';
import GlobalStyles from '../../style/GlobalStyles';
import { StackScreenProps } from '@react-navigation/stack';
import { ContactsStackParamList } from '../../types/AppTypes';
import GenericFormatter from '../../helper/GenericFormatters';
import PaletteData from '../../assets/zsp_team_palette.json';
import GenericAppHelpers from '../../helper/GenericAppHelpers';

type props = StackScreenProps<ContactsStackParamList, 'CfuPhonebookContactDetail'>; //typing the navigation props

const CfuPhonebookContactDetail = ({ route }: props) => {

    const theme = useTheme();
    const params = route.params ?? {};
    const genericFormatter = new GenericFormatter();
    const genericAppHelper = new GenericAppHelpers();

    const mod = Number(params.EmployeeNo) % PaletteData.length;
                                                   
    const iconColor = PaletteData.filter((x) => {
        return ((x.PaletteId / mod) == 1)
    })[0];

    return (
        <View style={{flex: 1}}>
            <View style={{backgroundColor: theme.colors.background}}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 20 }}>
                    <IconButton icon={() => <LucideIcons.ChevronLeft color={theme.colors.primary} size={25} />} size={20} onPress={() => screenFlowModule.onGoBack()} />
                </View>
                <View style={{ margin: 20 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 }}>
                        <View style={{ padding: 20, backgroundColor: iconColor.HexCode, borderRadius: 50 }}>
                            <LucideIcons.UserRound color='#fff' size={50} />
                        </View>
                    </View>
                    <CustomText variant='displaySmallBold' style={{ textAlign: 'center', marginTop: 20 }}>{params.FirstName} {params.Surname}</CustomText>
                    <CustomText variant='titleSmall' style={{ textAlign: 'center', marginTop: 10 }}>{params.UnitShortName}</CustomText>
                </View>
            </View>
            <ScrollView style={{ paddingHorizontal: 20, backgroundColor: theme.colors.surface}} contentContainerStyle={{ paddingBottom: 20 }}>
                <TextInput style={{ marginTop: 20, ...GlobalStyles.disabledTextInput }} editable={false} mode='flat' underlineColor='transparent' label='Role' value={params.Role} />
                <View
                    style={{marginTop: 20}}
                >
                    <TextInput 
                        style={{...GlobalStyles.disabledTextInput }} 
                        editable={false} 
                        mode='flat' 
                        underlineColor='transparent' 
                        label='Primary Mobile' 
                        value={params.ContactNo} 
                        textColor={theme.colors.secondary}
                    />
                    <Pressable
                        onPress={() => {
                            let mobNumber = `tel:${params.ContactNo}}`;
                            Linking.openURL(mobNumber);
                        }}
                        style={{
                            position: "absolute",
                            height: 50,
                            left: 0,
                            right: 0, // leave space for the icon so it remains clickable
                            top: 0,
                            bottom: 0,
                        }}
                    />
                </View>
                <View>
                    <TextInput 
                        style={{ marginTop: 20, ...GlobalStyles.disabledTextInput }} 
                        editable={false} 
                        mode='flat' 
                        underlineColor='transparent' 
                        label='Address' 
                        multiline value={genericFormatter.formatContactsAddress(params)} 
                        textColor={theme.colors.secondary}
                    />
                    <Pressable
                        onPress={() => {
                            if (params){
                                if (genericFormatter.formatContactsAddress(params)){
                                    genericAppHelper.navigateToNativeMaps(genericFormatter.formatContactsAddress(params));
                                }
                            }
                        }}
                        style={{
                            position: "absolute",
                            left: 0,
                            right: 0,
                            top: 20,
                            height: 60,
                            zIndex: 10
                        }}
                    />
                </View>
            </ScrollView>
        </View>
    )
}

export default CfuPhonebookContactDetail;
