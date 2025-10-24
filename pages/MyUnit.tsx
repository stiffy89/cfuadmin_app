import React, { useRef } from 'react';
import { View, ScrollView } from 'react-native';
import { useTheme, IconButton, TextInput, List, Divider } from 'react-native-paper';
import * as LucideIcons from 'lucide-react-native';
import { screenFlowModule, ScreenFlowModule } from '../helper/ScreenFlowModule';
import CustomText from '../assets/CustomText';
import GlobalStyles from '../style/GlobalStyles';
import { StackScreenProps } from '@react-navigation/stack';
import { ProfileStackParamList } from '../types/AppTypes';
import GenericFormatter from '../helper/GenericFormatters';

type props = StackScreenProps<ProfileStackParamList, 'MyUnitDetailsScreen'>; //typing the navigation props
type MyUnitHeaderProps = {
    unitName? : string
}
const MyUnitHeader = ( props : MyUnitHeaderProps) => {
    const theme = useTheme();

    return (
        <View style={{ padding: 20, backgroundColor: theme.colors.background, marginBottom: 20}}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 }}>
                <View style={{ padding: 20, backgroundColor: '#d3d3d3ff', borderRadius: 50 }}>
                    <LucideIcons.House size={50} />
                </View>
            </View>
            <CustomText variant='displaySmallBold' style={{ textAlign: 'center', marginTop: 20 }}>{props.unitName}</CustomText>
        </View>
    )
}


const MyUnit = ({ route, navigation }: props) => {

    const theme = useTheme();
    const genericFormatter = new GenericFormatter();

    const UnitData: any = route.params?.[0];

    const AddressFormatter = (data: any) => {
        let addressString = '';

        data.Stras ? addressString += (data.Stras + ", ") : addressString += '';
        data.Ort01 ? addressString += (data.Ort01 + " ") : addressString += '';
        data.Regio ? addressString += (data.Regio + " ") : addressString += '';
        data.Pstlz ? addressString += (data.Pstlz + " ") : addressString += '';

        return addressString;
    }

    return (
        <ScrollView>
            <View style={GlobalStyles.page}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 20 }}>
                    <IconButton icon={() => <LucideIcons.ChevronLeft color={theme.colors.primary} size={25} />} size={20} onPress={() => screenFlowModule.onGoBack()} />
                    <CustomText style={{ marginLeft: 20 }} variant='titleLargeBold'>My Unit Details</CustomText>
                </View>
                <MyUnitHeader unitName={UnitData.Short}/>
                <View style={{ paddingHorizontal: 20 }}>
                    <CustomText variant='bodyLargeBold'>Contact Information</CustomText>
                    <TextInput style={{ marginTop: 20, ...GlobalStyles.disabledTextInput }} multiline editable={false} mode='flat' underlineColor='transparent' label='Location' value={UnitData ? genericFormatter.formatAddress(UnitData) : ''} />
                    <TextInput style={{ marginTop: 20, ...GlobalStyles.disabledTextInput }} editable={false} mode='flat' underlineColor='transparent' label='Station' value={UnitData ? UnitData.Station : ''} />
                    <TextInput style={{ marginTop: 20, ...GlobalStyles.disabledTextInput }} editable={false} mode='flat' underlineColor='transparent' label='Station Phone' value={UnitData ? UnitData.StationPhone : ''} />
                    <TextInput style={{ marginTop: 20, ...GlobalStyles.disabledTextInput }} editable={false} mode='flat' underlineColor='transparent' label='Station' value={UnitData ? UnitData.Station : ''} />
                    <TextInput style={{ marginTop: 20, ...GlobalStyles.disabledTextInput }} editable={false} mode='flat' underlineColor='transparent' label='Maintenance Schedule' value={UnitData ? genericFormatter.formatFromEdmDate(UnitData.OpReadyCheckDate) : ''} />
                </View>
                <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
                    <CustomText variant='bodyLargeBold'>Other Details</CustomText>
                    <List.Section style={{ marginTop: 20, backgroundColor: '#f9f9f9ff', ...GlobalStyles.globalBorderRadius }}>
                        <List.Item style={{ height: 80, justifyContent: 'center' }} onPress={() => { }} title={() => <CustomText variant='bodyLarge'>Membership Details</CustomText>} right={() => <LucideIcons.ChevronRight />} />
                        <Divider />
                        <List.Item style={{ height: 80, justifyContent: 'center' }} onPress={() => { }} title={() => <CustomText variant='bodyLarge'>Training History</CustomText>} right={() => <LucideIcons.ChevronRight />} />
                        <Divider />
                        <List.Item style={{ height: 80, justifyContent: 'center' }} onPress={() => { }} title={() => <CustomText variant='bodyLarge'>My Unit</CustomText>} right={() => <LucideIcons.ChevronRight />} />
                    </List.Section>
                </View>
            </View>
        </ScrollView>
    )
}

export default MyUnit;