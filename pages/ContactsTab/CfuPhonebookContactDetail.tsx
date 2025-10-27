import React, { useRef } from 'react';
import { View, ScrollView } from 'react-native';
import { useTheme, IconButton, TextInput } from 'react-native-paper';
import * as LucideIcons from 'lucide-react-native';
import { screenFlowModule } from '../../helper/ScreenFlowModule';
import CustomText from '../../assets/CustomText';
import GlobalStyles from '../../style/GlobalStyles';
import { StackScreenProps } from '@react-navigation/stack';
import { ContactsStackParamList } from '../../types/AppTypes';
import GenericFormatter from '../../helper/GenericFormatters';

type props = StackScreenProps<ContactsStackParamList, 'CfuPhonebookContactDetail'>; //typing the navigation props

const CfuPhonebookContactDetail = ({ route }: props) => {

    const theme = useTheme();
    const params = route.params ?? {};
    const genericFormatter = new GenericFormatter();

    return (
        <View style={{flex: 1}}>
            <View style={{backgroundColor: theme.colors.background}}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 20 }}>
                    <IconButton icon={() => <LucideIcons.ChevronLeft color={theme.colors.primary} size={25} />} size={20} onPress={() => screenFlowModule.onGoBack()} />
                </View>
                <View style={{ margin: 20 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 }}>
                        <View style={{ padding: 20, backgroundColor: '#d3d3d3ff', borderRadius: 50 }}>
                            <LucideIcons.UserRound size={50} />
                        </View>
                    </View>
                    <CustomText variant='displaySmallBold' style={{ textAlign: 'center', marginTop: 20 }}>{params.FirstName} {params.Surname}</CustomText>
                    <CustomText variant='titleSmall' style={{ textAlign: 'center', marginTop: 10 }}>{params.UnitShortName}</CustomText>
                </View>
            </View>
            <ScrollView style={{ paddingHorizontal: 20, backgroundColor: theme.colors.surface}} contentContainerStyle={{ paddingBottom: 20 }}>
                <TextInput style={{ marginTop: 20, ...GlobalStyles.disabledTextInput }} editable={false} mode='flat' underlineColor='transparent' label='Role' value={params.Role} />
                <TextInput style={{ marginTop: 20, ...GlobalStyles.disabledTextInput }} editable={false} mode='flat' underlineColor='transparent' label='Primary Mobile' value={params.ContactNo} />
                <TextInput style={{ marginTop: 20, ...GlobalStyles.disabledTextInput }} editable={false} mode='flat' underlineColor='transparent' label='Address' multiline value={genericFormatter.formatContactsAddress(params)} />
            </ScrollView>
        </View>
    )
}

export default CfuPhonebookContactDetail;
