import React, {useRef} from 'react';
import { View, ScrollView } from 'react-native';
import { useTheme, IconButton, TextInput } from 'react-native-paper';
import * as LucideIcons from 'lucide-react-native';
import { screenFlowModule, ScreenFlowModule } from '../helper/ScreenFlowModule';
import CustomText from '../assets/CustomText';
import GlobalStyles from '../style/GlobalStyles';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../types/AppTypes';
import GenericFormatter from '../helper/GenericFormatters';

type props = StackScreenProps<RootStackParamList, 'MedalsAndAwardsScreen'>; //typing the navigation props

const MedalsAndAwards = ({route, navigation} : props) => {
    
    const theme = useTheme();
    const params = route.params ?? {};

    const genericFormatter = new GenericFormatter();

    return (
        <View style={GlobalStyles.page}>
            <View style={{flexDirection: 'row', alignItems: 'center', marginVertical: 20}}>
                <IconButton icon={() => <LucideIcons.ChevronLeft color={theme.colors.primary} size={25}/>} size={20} onPress={() => screenFlowModule.onGoBack()} />
                <CustomText style={{marginLeft: 20}} variant='titleLargeBold'>Medals & Awards Details</CustomText>
            </View>
            <ScrollView style={{paddingHorizontal: 20, paddingBottom: 40}}>
                <TextInput style={{marginTop: 20, ...GlobalStyles.disabledTextInput}} editable={false} mode='flat' underlineColor='transparent' label='Date' value={genericFormatter.formatFromEdmDate(params.OriginalPskeyBegda)}/>
                <TextInput style={{marginTop: 20, ...GlobalStyles.disabledTextInput}} editable={false} mode='flat' underlineColor='transparent' label='Medal / Award' value={params.Awdtx}/>
                <TextInput style={{marginTop: 20, ...GlobalStyles.disabledTextInput}} editable={false} multiline mode='flat' underlineColor='transparent' label='Notes' value={`${params.Text1}\n${params.Text2}\n${params.Text3}`}/>
            </ScrollView>
        </View>
    )
}

export default MedalsAndAwards;