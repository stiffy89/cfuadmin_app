import React, { useRef } from 'react';
import { View, ScrollView, Pressable, Linking } from 'react-native';
import { useTheme, IconButton, TextInput } from 'react-native-paper';
import * as LucideIcons from 'lucide-react-native';
import { screenFlowModule } from '../../helper/ScreenFlowModule';
import CustomText from '../../assets/CustomText';
import GlobalStyles from '../../style/GlobalStyles';
import { StackScreenProps } from '@react-navigation/stack';
import { ContactsStackParamList } from '../../types/AppTypes';
import PaletteData from '../../assets/zsp_team_palette.json';
import GenericAppHelpers from '../../helper/GenericAppHelpers';

type props = StackScreenProps<ContactsStackParamList, 'MyUnitContactDetail'>; //typing the navigation props

const MyUnitContactDetail = ({ route }: props) => {

    const theme = useTheme();
    const params = route.params ?? {};
    const genericAppHelper = new GenericAppHelpers();
    
    const mod = Number(params.Pernr) % PaletteData.length;
                                                   
    const iconColor = PaletteData.filter((x) => {
        return ((x.PaletteId / mod) == 1)
    })[0];

    return (
        <View style={{ flex: 1 }}>
            <View style={{ backgroundColor: theme.colors.background }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 20 }}>
                    <IconButton icon={() => <LucideIcons.ChevronLeft color={theme.colors.primary} size={25} />} size={20} onPress={() => screenFlowModule.onGoBack()} />
                </View>
                <View style={{ margin: 20 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 }}>
                        <View style={{ padding: 20, backgroundColor: iconColor.HexCode, borderRadius: 50 }}>
                            <LucideIcons.UserRound color='#fff' size={50} />
                        </View>
                    </View>
                    <CustomText variant='displaySmallBold' style={{ textAlign: 'center', marginTop: 20 }}>{params.Vorna} {params.Nachn}</CustomText>
                    <CustomText variant='titleLarge' style={{ textAlign: 'center', marginTop: 10 }}>{params.Role}</CustomText>
                    <CustomText variant='titleSmall' style={{ textAlign: 'center', marginTop: 10 }}>{params.Short}</CustomText>
                </View>
            </View>
            <ScrollView style={{ paddingHorizontal: 20, backgroundColor: theme.colors.surface }} contentContainerStyle={{ paddingBottom: 20 }}>
                <TextInput
                    style={{ marginTop: 20, ...GlobalStyles.disabledTextInput }}
                    editable={false}
                    mode='flat'
                    underlineColor='transparent'
                    label='Member Number'
                    value={params.PernrExt}
                />
                <View
                    style={{ marginTop: 20 }}
                >
                    <TextInput
                        style={{ ...GlobalStyles.disabledTextInput }}
                        textColor={theme.colors.secondary}
                        editable={false} mode='flat'
                        underlineColor='transparent'
                        label='Primary Mobile'
                        value={params.MobilePhone}
                    />
                    <Pressable
                        onPress={() => {
                            let mobNumber = `tel:${params.MobilePhone}}`;
                            genericAppHelper.navigateToPhone(mobNumber);
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
                <View
                    style={{ marginTop: 20 }}
                >
                    <TextInput
                        style={{ ...GlobalStyles.disabledTextInput }}
                        editable={false}
                        textColor={theme.colors.secondary}
                        mode='flat'
                        underlineColor='transparent'
                        label='Email'
                        value={params.Email}
                    />
                    <Pressable
                        onPress={() => {
                            let email = `mailTo:${params.Email}`;
                            genericAppHelper.navigateToEmail(email);
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
                        value={params.Stext}
                        textColor={theme.colors.secondary}
                    />
                    <Pressable
                        onPress={() => {
                            if (params.Stext){
                                genericAppHelper.navigateToNativeMaps(params.Stext);
                            }
                        }}
                        style={{
                            position: "absolute",
                            height: 60,
                            left: 0,
                            right: 0,
                            top: 20,
                            bottom: 0
                        }}
                    />
                </View>
                <View
                    style={{ marginTop: 20 }}
                >
                    <TextInput
                        style={{ ...GlobalStyles.disabledTextInput }}
                        editable={false}
                        textColor={theme.colors.secondary}
                        mode='flat'
                        underlineColor='transparent'
                        label='Home Phone'
                        value={params.HomePhone}
                    />
                    <Pressable
                        onPress={() => {
                            let homePhone = `tel:${params.HomePhone}`;
                            genericAppHelper.navigateToPhone(homePhone);
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
                <View
                    style={{marginTop: 20}}
                >
                    <TextInput
                        style={{...GlobalStyles.disabledTextInput }}
                        editable={false}
                        textColor={theme.colors.secondary}
                        mode='flat'
                        underlineColor='transparent'
                        label='Work Phone'
                        value={params.WorkPhone}
                    />
                    <Pressable
                        onPress={() => {
                            let workPhone = `tel:${params.WorkPhone}`;
                            genericAppHelper.navigateToPhone(workPhone);
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
            </ScrollView>
        </View>
    )
}

export default MyUnitContactDetail;
