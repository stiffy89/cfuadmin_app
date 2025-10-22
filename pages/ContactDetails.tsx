import React, {useRef} from 'react';
import { View } from 'react-native';
import { useTheme, IconButton, TextInput } from 'react-native-paper';
import * as LucideIcons from 'lucide-react-native';
import { screenFlowModule, ScreenFlowModule } from '../helper/ScreenFlowModule';
import CustomText from '../assets/CustomText';
import GlobalStyles from '../style/GlobalStyles';
import { StackScreenProps } from '@react-navigation/stack';
import { ProfileStackParamList } from '../types/AppTypes';

type props = StackScreenProps<ProfileStackParamList, 'ContactDetailsScreen'>; //typing the navigation props

const ContactDetails = ({route, navigation} : props) => {
    
    const theme = useTheme();
    const params = route.params ?? {};

    const EditData = (data : any) => {
        screenFlowModule.onNavigateToScreen('EditScreen', {screenName: 'ContactDetails', editData: data})
    }

    //formats our address so that if we are missing parts, just clear it
    const addressFormatter = (addressType : string) => {
        let addressString = '';

        if (addressType == 'home'){
            params.home_street ? addressString += (params.home_street + ", ") : addressString += '';
            params.home_suburb ? addressString += (params.home_suburb + " ") : addressString += '';
            params.home_state ? addressString += (params.home_state + " ") : addressString += '';
            params.home_postcode ? addressString += (params.home_postcode + " ") : addressString += '';
        }
        else if (addressType == 'work'){
            params.work_street ? addressString += (params.work_street + ", ") : addressString += '';
            params.work_suburb ? addressString += (params.work_suburb + " ") : addressString += '';
            params.work_state ? addressString += (params.work_state + " ") : addressString += '';
            params.work_postcode ? addressString += (params.work_postcode + " ") : addressString += '';
        }
        
        return addressString;
    }

    return (
        <View style={GlobalStyles.page}>
            <View style={{flexDirection: 'row', alignItems: 'center', marginVertical: 20}}>
                <IconButton icon={() => <LucideIcons.ChevronLeft color={theme.colors.primary} size={25}/>} size={20} onPress={() => screenFlowModule.onGoBack()} />
                <CustomText style={{marginLeft: 20}} variant='titleLargeBold'>Contact Details</CustomText>
            </View>
            <View style={{paddingHorizontal: 20}}>
                <CustomText variant='bodyLargeBold'>Phone Numbers</CustomText>
                <TextInput style={{marginTop: 20, ...GlobalStyles.disabledTextInput}} editable={false} mode='flat' underlineColor='transparent' label='Primary Mobile' value={params.primarymobile} right={<TextInput.Icon icon={() => <LucideIcons.Pencil color={theme.colors.primary} size={20}/>} onPress={() => EditData({'primarymobile' : params.primarymobile})}/>}/>
                <TextInput style={{marginTop: 20, ...GlobalStyles.disabledTextInput}} editable={false} mode='flat' underlineColor='transparent' label='Home' value={params.home} right={<TextInput.Icon icon={() => <LucideIcons.Pencil color={theme.colors.primary} size={20}/>} onPress={() => EditData({'home' : params.home})}/>}/>
                <TextInput style={{marginTop: 20, ...GlobalStyles.disabledTextInput}} editable={false} mode='flat' underlineColor='transparent' label='Work' value={params.work} right={<TextInput.Icon icon={() => <LucideIcons.Pencil color={theme.colors.primary} size={20}/>} onPress={() => EditData({'work' : params.work})}/>}/>
            </View>
            <View style={{paddingHorizontal: 20, marginTop: 20}}>
                <CustomText variant='bodyLargeBold'>Email</CustomText>
                <TextInput style={{marginTop: 20, ...GlobalStyles.disabledTextInput}} editable={false} mode='flat' underlineColor='transparent' label='Email' value={params.email} right={<TextInput.Icon icon={() => <LucideIcons.Pencil color={theme.colors.primary} size={20}/>} onPress={() => EditData({'email' : params.email})}/>}/>
            </View>
            <View style={{paddingHorizontal: 20, marginTop: 20}}>
                <CustomText variant='bodyLargeBold'>Addresses</CustomText>
                <TextInput style={{marginTop: 20, ...GlobalStyles.disabledTextInput}} editable={false} mode='flat' underlineColor='transparent' label='Home Address' value={addressFormatter('home')}/>
                <TextInput style={{marginTop: 20, ...GlobalStyles.disabledTextInput}} editable={false} mode='flat' underlineColor='transparent' label='Mailing Address' value={addressFormatter('work')} right={<TextInput.Icon icon={() => <LucideIcons.Pencil color={theme.colors.primary} size={20}/>} onPress={() => EditData({'work_address' : {
                    work_street : params.work_street,
                    work_suburb : params.work_suburb,
                    work_state : params.work_state,
                    work_postcode : params.work_postcode
                }})}/>}/>
            </View>
        </View>
    )
}

export default ContactDetails;