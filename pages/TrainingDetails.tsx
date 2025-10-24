import React, {useRef} from 'react';
import { View } from 'react-native';
import { useTheme, IconButton, TextInput } from 'react-native-paper';
import * as LucideIcons from 'lucide-react-native';
import { screenFlowModule, ScreenFlowModule } from '../helper/ScreenFlowModule';
import CustomText from '../assets/CustomText';
import GlobalStyles from '../style/GlobalStyles';
import { StackScreenProps } from '@react-navigation/stack';
import { ProfileStackParamList } from '../types/AppTypes';
import GenericFormatter from '../helper/GenericFormatters';

type props = StackScreenProps<ProfileStackParamList, 'TrainingDetailsScreen'>; //typing the navigation props

const TrainingDetails = ({route, navigation} : props) => {
    
    const theme = useTheme();
    const params = route.params ?? {};

    const genericFormatter = new GenericFormatter();

    return (
        <View style={GlobalStyles.page}>
            <View style={{flexDirection: 'row', alignItems: 'center', marginVertical: 20}}>
                <IconButton icon={() => <LucideIcons.ChevronLeft color={theme.colors.primary} size={25}/>} size={20} onPress={() => screenFlowModule.onGoBack()} />
                <CustomText style={{marginLeft: 20}} variant='titleLargeBold'>Training Details</CustomText>
            </View>
            <View style={{paddingHorizontal: 20}}>
                <TextInput style={{marginTop: 20, ...GlobalStyles.disabledTextInput}} editable={false} mode='flat' underlineColor='transparent' label='Abbreviation' value={params.QualificationShort}/>
                <TextInput style={{marginTop: 20, ...GlobalStyles.disabledTextInput}} editable={false} mode='flat' underlineColor='transparent' label='Name' value={params.QualificationName}/>
                <TextInput style={{marginTop: 20, ...GlobalStyles.disabledTextInput}} editable={false} mode='flat' underlineColor='transparent' label='Type' value={params.QualificationTypeText}/>
                <TextInput style={{marginTop: 20, ...GlobalStyles.disabledTextInput}} editable={false} mode='flat' underlineColor='transparent' label='From' value={genericFormatter.formatFromEdmDate(params.ValidFrom)}/>
                <TextInput style={{marginTop: 20, ...GlobalStyles.disabledTextInput}} editable={false} mode='flat' underlineColor='transparent' label='To' value={genericFormatter.formatFromEdmDate(params.ValidTo)}/>
                <TextInput style={{marginTop: 20, ...GlobalStyles.disabledTextInput}} editable={false} mode='flat' underlineColor='transparent' label='Assessor' value={params.AssessorName}/>
            </View>
        </View>
    )
}

export default TrainingDetails;