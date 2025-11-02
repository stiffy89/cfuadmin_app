import React, {useRef} from 'react';
import { View, ScrollView } from 'react-native';
import { useTheme, IconButton, TextInput } from 'react-native-paper';
import * as LucideIcons from 'lucide-react-native';
import { screenFlowModule, ScreenFlowModule } from '../helper/ScreenFlowModule';
import CustomText from '../assets/CustomText';
import GlobalStyles from '../style/GlobalStyles';
import { StackScreenProps } from '@react-navigation/stack';
import { ProfileStackParamList, RootStackParamList } from '../types/AppTypes';
import GenericFormatter from '../helper/GenericFormatters';
import { useDataContext } from '../helper/DataContext';

type props = StackScreenProps<RootStackParamList, 'UniformDetailsScreen'>; //typing the navigation props

const UniformDetails = ({route, navigation} : props) => {
    
    const theme = useTheme();
    const params = route.params ?? {};

    const genericFormatter = new GenericFormatter();
    const dataContext = useDataContext();

    const EditData = (data: any) => {
        screenFlowModule.onNavigateToScreen("EditScreen", {
            screenName: "UniformDetails",
            editData: data,
        });
    };


    return (
        <View style={GlobalStyles.page}>
            <View style={{flexDirection: 'row', alignItems: 'center', marginVertical: 20}}>
                <IconButton icon={() => <LucideIcons.ChevronLeft color={theme.colors.primary} size={25}/>} size={20} onPress={() => screenFlowModule.onGoBack()} />
                <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flex: 1}}>
                    <CustomText style={{marginLeft: 20}} variant='titleLargeBold'>Uniform Details</CustomText>
                    {
                        (dataContext.currentProfile == 'MyMembers') && (
                            <IconButton
                                style={{marginRight: 20}}
                                icon={() => (
                                    <LucideIcons.Pencil color={theme.colors.primary} size={20} />
                                )}
                                onPress={() => {
                                    EditData(params);
                                }}
                            />
                        )
                    }
                </View>
            </View>
            <ScrollView style={{paddingHorizontal: 20, paddingBottom: 40}}>
                <TextInput style={{marginTop: 20, ...GlobalStyles.disabledTextInput}} editable={false} mode='flat' underlineColor='transparent' label='Object' value={params.ObjectTypesStext}/>
                <TextInput style={{marginTop: 20, ...GlobalStyles.disabledTextInput}} editable={false} mode='flat' underlineColor='transparent' label='From' value={genericFormatter.formatFromEdmDate(params.OriginalPskeyBegda)}/>
                <TextInput style={{marginTop: 20, ...GlobalStyles.disabledTextInput}} editable={false} mode='flat' underlineColor='transparent' label='Quantity' value={params.Anzkl}/>
                <TextInput style={{marginTop: 20, ...GlobalStyles.disabledTextInput}} editable={false} mode='flat' underlineColor='transparent' label='Unit' value={params.UnitsEtext}/>
                <TextInput style={{marginTop: 20, ...GlobalStyles.disabledTextInput}} editable={false} mode='flat' underlineColor='transparent' label='Reference No.' value={params.Lobnr}/>
                <TextInput style={{marginTop: 20, ...GlobalStyles.disabledTextInput}} editable={false} mode='flat' underlineColor='transparent' label='Return Date' value={genericFormatter.formatFromEdmDate(params.ReturnDate)}/>
                <TextInput style={{marginTop: 20, ...GlobalStyles.disabledTextInput}} editable={false} mode='flat' underlineColor='transparent' label='Comment 1' value={params.Text1}/>
                <TextInput style={{marginTop: 20, ...GlobalStyles.disabledTextInput}} editable={false} mode='flat' underlineColor='transparent' label='Comment 2' value={params.Text2}/>
                <TextInput style={{marginTop: 20, ...GlobalStyles.disabledTextInput}} editable={false} mode='flat' underlineColor='transparent' label='Comment 3' value={params.Text3}/>
            </ScrollView>
        </View>
    )
}

export default UniformDetails;