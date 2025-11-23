import React, {useState, useEffect} from 'react';
import { View } from 'react-native';
import { useTheme, IconButton, TextInput } from 'react-native-paper';
import {ChevronLeft, Pencil} from 'lucide-react-native';
import { screenFlowModule } from '../helper/ScreenFlowModule';
import CustomText from '../assets/CustomText';
import GlobalStyles from '../style/GlobalStyles';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../types/AppTypes';
import GenericFormatter from '../helper/GenericFormatters';
import { dataHandlerModule } from '../helper/DataHandlerModule';
import { useAppContext } from '../helper/AppContext';
import { useDataContext } from '../helper/DataContext';

type props = StackScreenProps<RootStackParamList, 'EquityDiversity'>; //typing the navigation props

const EquityDiversity = ({route, navigation} : props) => {
    const appContext = useAppContext();
    const dataContext = useDataContext();
    const theme = useTheme();
   
    const employeeData = (dataContext.currentProfile == 'MyMembers') ? dataContext.myMemberEmployeeDetails[0] : dataContext.employeeDetails[0];

    const [employeeDetails, setEmployeeDetails] = useState(employeeData);

    useEffect(() => {
        if (dataContext.currentProfile == 'MyMembers'){
            setEmployeeDetails(dataContext.myMemberEmployeeDetails[0]);
        }
        else{
            setEmployeeDetails(dataContext.employeeDetails[0]);
        }
    }, [dataContext.myMemberEmployeeDetails, dataContext.employeeDetails])

    const EditData = async () => {
        appContext.setShowBusyIndicator(true);
        appContext.setShowDialog(true);
        try {
            const equityDetails = await dataHandlerModule.batchGet(
                `EquityRecords?$filter=Pernr%20eq%20%27${employeeDetails.Pernr}%27`,
                'Z_ESS_MSS_SRV',
                'EquityRecords',
            )

            screenFlowModule.onNavigateToScreen('EditScreen', {screenName: 'EquityDiversity', editData: equityDetails.responseBody.d.results})
            appContext.setShowBusyIndicator(false);
            appContext.setShowDialog(false);
        }
        catch (error) {
            appContext.setShowBusyIndicator(false);
            appContext.setShowDialog(false);
            screenFlowModule.onNavigateToScreen('ErrorPage', error);
        }
    }

    return (
        <View style={GlobalStyles.page}>
            <View style={{flexDirection: 'row', alignItems: 'center', marginVertical: 20, justifyContent: 'space-between'}}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <IconButton icon={() => <ChevronLeft color={theme.colors.primary} size={25}/>} size={20} onPress={() => screenFlowModule.onGoBack()} />
                    <CustomText style={{marginLeft: 20}} variant='titleLargeBold'>Equity Diversity</CustomText>
                </View>
                <Pencil style={{marginRight: 20}} color={theme.colors.primary} size={20} onPress={() => EditData()}/>
            </View>
            <View style={{paddingHorizontal: 20}}>
                <TextInput style={{marginTop: 20, ...GlobalStyles.disabledTextInput}} editable={false} mode='flat' underlineColor='transparent' label='Main non-english language spoken' value={employeeDetails.MslngText}/>
                <TextInput style={{marginTop: 20, ...GlobalStyles.disabledTextInput}} editable={false} mode='flat' underlineColor='transparent' label='Gender for Equity and Diversity' value={employeeDetails.GeschText}/>
                <TextInput style={{marginTop: 20, ...GlobalStyles.disabledTextInput}} editable={false} mode='flat' underlineColor='transparent' label='Aboriginal or Torres Strait Islander' value={employeeDetails.PermiText}/>
                <TextInput style={{marginTop: 20, ...GlobalStyles.disabledTextInput}} editable={false} mode='flat' underlineColor='transparent' label='Racial/Ethnic/Religious Minority' value={employeeDetails.MovecText} />
                <TextInput style={{marginTop: 20, ...GlobalStyles.disabledTextInput}} editable={false} mode='flat' underlineColor='transparent' label='First Language' value={employeeDetails.FslngText}/>
                <TextInput style={{marginTop: 20, ...GlobalStyles.disabledTextInput}} editable={false} mode='flat' underlineColor='transparent' label='Disability' value={employeeDetails.DisapText}/>
            </View>
        </View>
    )
}

export default EquityDiversity;