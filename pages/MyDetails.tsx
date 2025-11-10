import React, {useState} from 'react';
import { View } from 'react-native';
import { useTheme, IconButton, TextInput } from 'react-native-paper';
import * as LucideIcons from 'lucide-react-native';
import { screenFlowModule, ScreenFlowModule } from '../helper/ScreenFlowModule';
import CustomText from '../assets/CustomText';
import GlobalStyles from '../style/GlobalStyles';
import { StackScreenProps } from '@react-navigation/stack';
import { ProfileStackParamList, RootStackParamList } from '../types/AppTypes';
import GenericFormatter from '../helper/GenericFormatters';
import { dataHandlerModule } from '../helper/DataHandlerModule';
import { useAppContext } from '../helper/AppContext';
import { useDataContext } from '../helper/DataContext';

type props = StackScreenProps<RootStackParamList, 'MyDetailsScreen'>; //typing the navigation props

const MyDetails = ({route, navigation} : props) => {
    const appContext = useAppContext();
    const theme = useTheme();
    const genericFormatter = new GenericFormatter();
    const dataContext = useDataContext();
    const params = (dataContext.currentProfile == 'MyMembers') ? dataContext.myMemberEmployeeDetails[0] : dataContext.employeeDetails[0];

    const EditData = async () => {
        appContext.setShowBusyIndicator(true);
        appContext.setShowDialog(true);
        try {
            const pernr = params.Pernr;
            const employeePersonalDetails = await dataHandlerModule.batchGet(`EmployeePersonalDetails?$filter=Pernr%20eq%20%27${pernr}%27`, 'Z_ESS_MSS_SRV', 'EmployeePersonalDetails')
            const employeeData = employeePersonalDetails.responseBody.d.results[0];
            screenFlowModule.onNavigateToScreen('EditScreen', {screenName: 'MyDetails', data: employeeData})
            appContext.setShowBusyIndicator(false);
            appContext.setShowDialog(false);
        }
        catch (error) {
            appContext.setShowBusyIndicator(false);
            appContext.setShowDialog(false);
            console.log(error);
        }
    }

    return (
        <View style={GlobalStyles.page}>
            <View style={{flexDirection: 'row', alignItems: 'center', marginVertical: 20}}>
                <IconButton icon={() => <LucideIcons.ChevronLeft color={theme.colors.primary} size={25}/>} size={20} onPress={() => screenFlowModule.onGoBack()} />
                <CustomText style={{marginLeft: 20}} variant='titleLargeBold'>Personal Details</CustomText>
            </View>
            <View style={{paddingHorizontal: 20}}>
                <TextInput style={{marginTop: 20, ...GlobalStyles.disabledTextInput}} editable={false} mode='flat' underlineColor='transparent' label='Name' value={`${params.Vorna} ${params.Nachn}`}/>
                <TextInput style={{marginTop: 20, ...GlobalStyles.disabledTextInput}} editable={false} mode='flat' underlineColor='transparent' label='Member Number' value={params.Pernr}/>
                <TextInput style={{marginTop: 20, ...GlobalStyles.disabledTextInput}} editable={false} mode='flat' underlineColor='transparent' label='Preferred Name' value={params.Rufnm} right={<TextInput.Icon icon={() => <LucideIcons.Pencil color={theme.colors.primary} size={20}/>} onPress={() => EditData()}/>}/>
                <TextInput style={{marginTop: 20, ...GlobalStyles.disabledTextInput}} editable={false} mode='flat' underlineColor='transparent' label='Date of Birth' value={genericFormatter.formatFromEdmDate(params.Gbdat)}/>
                <TextInput style={{marginTop: 20, ...GlobalStyles.disabledTextInput}} editable={false} mode='flat' underlineColor='transparent' label='Gender' value={params.Gender}/>
            </View>
        </View>
    )
}

export default MyDetails;