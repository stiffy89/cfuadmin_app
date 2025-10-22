import React from 'react';
import {View} from 'react-native';
import {useTheme, IconButton, Button} from 'react-native-paper';
import { StackScreenProps } from '@react-navigation/stack';
import { ProfileStackParamList } from '../types/AppTypes';
import { screenFlowModule } from '../helper/ScreenFlowModule';
import GlobalStyles from '../style/GlobalStyles';
import * as LucideIcons from 'lucide-react-native';
import CustomText from '../assets/CustomText';

type props = StackScreenProps<ProfileStackParamList, 'EmergencyContactsScreen'>; //typing the navigation props

const EmergencyContacts = ({route, navigation} : props) => {
    const theme = useTheme();
    const params = route.params ?? [];

    const EditData = (data : any) => {
        screenFlowModule.onNavigateToScreen('EditScreen', {screenName: 'EmergencyContacts', editData: data})
    }

    const AddressFormatter = (dataObj : any) => {
        let addressString = '';
        
        dataObj.street ? addressString += (dataObj.street + ", ") : addressString += '';
        dataObj.suburb ? addressString += (dataObj.suburb + " ") : addressString += '';
        dataObj.state ? addressString += (dataObj.state + " ") : addressString += '';
        dataObj.postcode ? addressString += (dataObj.postcode + " ") : addressString += '';

        return addressString;
    } 

    return (
        <View style={GlobalStyles.page}>
            <View style={{flexDirection: 'row', alignItems: 'center', marginVertical: 20}}>
                <IconButton icon={() => <LucideIcons.ChevronLeft color={theme.colors.primary} size={25}/>} size={20} onPress={() => screenFlowModule.onGoBack()} />
                <CustomText style={{marginLeft: 20}} variant='titleLargeBold'>Emergency Contacts</CustomText>
            </View>
            <View style={{paddingHorizontal: 20}}>
                {
                    params.map((x, i) => {
                        return (
                            <View key={i} style={{flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#efefef', padding: 20, ...GlobalStyles.globalBorderRadius}}>
                                <View>
                                    <CustomText style={{marginBottom: 10}}>{x.name}</CustomText>
                                    <CustomText style={{marginBottom: 10}}>{x.relationship}</CustomText>
                                    <CustomText style={{marginBottom: 10}}>{x.mobile}</CustomText>
                                    <CustomText style={{marginBottom: 10}}>{AddressFormatter(x)}</CustomText>
                                </View>
                                <IconButton icon={() => <LucideIcons.Pencil color={theme.colors.primary} size={20}/>} onPress={() => EditData(x)}/>
                            </View>
                        )
                    })
                }
                <Button onPress={() => {

                    const EmptyContact = {
                        name: '',
                        relationship: '',
                        mobile: '',
                        street: '',
                        suburb: '',
                        state: '',
                        postcode: ''
                    }

                    EditData(EmptyContact);

                }}>Add Contact</Button>
            </View>
        </View>
    )
}

export default EmergencyContacts;