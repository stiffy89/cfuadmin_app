import React, {useRef} from 'react';
import { View } from 'react-native';
import { useTheme, IconButton, TextInput } from 'react-native-paper';
import * as LucideIcons from 'lucide-react-native';
import { screenFlowModule, ScreenFlowModule } from '../helper/ScreenFlowModule';
import CustomText from '../assets/CustomText';
import GlobalStyles from '../style/GlobalStyles';
import { StackScreenProps } from '@react-navigation/stack';
import { ProfileStackParamList } from '../types/AppTypes';

type props = StackScreenProps<ProfileStackParamList, 'MyDetailsScreen'>; //typing the navigation props

const MyDetails = ({route, navigation} : props) => {
    
    const theme = useTheme();
    const params = route.params ?? {};

    const EditData = () => {
        screenFlowModule.onNavigateToScreen('EditScreen', {screenName: 'MyDetails'})
    }

    return (
        <View style={GlobalStyles.page}>
            <View style={{flexDirection: 'row', alignItems: 'center', marginVertical: 20}}>
                <IconButton icon={() => <LucideIcons.ChevronLeft color={theme.colors.primary} size={25}/>} size={20} onPress={() => screenFlowModule.onGoBack()} />
                <CustomText style={{marginLeft: 20}} variant='titleLargeBold'>My Details</CustomText>
            </View>
            <View style={{paddingHorizontal: 20}}>
                <TextInput style={{marginTop: 20, ...GlobalStyles.disabledTextInput}} editable={false} mode='flat' underlineColor='transparent' label='Name' value={params.name}/>
                <TextInput style={{marginTop: 20, ...GlobalStyles.disabledTextInput}} editable={false} mode='flat' underlineColor='transparent' label='Member Number' value={params.membernumber}/>
                <TextInput style={{marginTop: 20, ...GlobalStyles.disabledTextInput}} editable={false} mode='flat' underlineColor='transparent' label='Preferred Name' value={params.preferredname} right={<TextInput.Icon icon={() => <LucideIcons.Pencil color={theme.colors.primary} size={20}/>} onPress={() => EditData()}/>}/>
                <TextInput style={{marginTop: 20, ...GlobalStyles.disabledTextInput}} editable={false} mode='flat' underlineColor='transparent' label='Date of Birth' value={params.dob}/>
                <TextInput style={{marginTop: 20, ...GlobalStyles.disabledTextInput}} editable={false} mode='flat' underlineColor='transparent' label='Gender' value={params.gender}/>
            </View>
        </View>
    )
}

export default MyDetails;