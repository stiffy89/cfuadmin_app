import React, { useRef } from 'react';
import { View, ScrollView } from 'react-native';
import { useTheme, IconButton, TextInput, List, Divider } from 'react-native-paper';
import * as LucideIcons from 'lucide-react-native';
import { screenFlowModule, ScreenFlowModule } from '../helper/ScreenFlowModule';
import CustomText from '../assets/CustomText';
import GlobalStyles from '../style/GlobalStyles';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../types/AppTypes';
import GenericFormatter from '../helper/GenericFormatters';
import { useDataContext } from '../helper/DataContext';
import { useAppContext } from '../helper/AppContext';
import { dataHandlerModule } from '../helper/DataHandlerModule';

type props = StackScreenProps<RootStackParamList, 'MyUnitDetailsScreen'>; //typing the navigation props
type MyUnitHeaderProps = {
    unitName?: string
}
const MyUnitHeader = (props: MyUnitHeaderProps) => {
    const theme = useTheme();

    return (
        <View style={{ padding: 20, backgroundColor: theme.colors.background, marginBottom: 20 }}>
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
    const appContext = useAppContext();
    const genericFormatter = new GenericFormatter();
    const dataContext = useDataContext()
    const UnitData = dataContext.myOrgUnitDetails[0];

    return (
        <ScrollView contentContainerStyle={{ paddingBottom: 50 }}>
            <View style={GlobalStyles.page}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 20 }}>
                    <IconButton icon={() => <LucideIcons.ChevronLeft color={theme.colors.primary} size={25} />} size={20} onPress={() => screenFlowModule.onGoBack()} />
                    <CustomText style={{ marginLeft: 20 }} variant='titleLargeBold'>My Unit Details</CustomText>
                </View>
                <MyUnitHeader unitName={UnitData.Short} />
                <View style={{ paddingHorizontal: 20 }}>
                    <CustomText variant='bodyLargeBold'>Contact Information</CustomText>
                    <TextInput style={{ marginTop: 20, ...GlobalStyles.disabledTextInput }} multiline editable={false} mode='flat' underlineColor='transparent' label='Location' value={UnitData ? genericFormatter.formatAddress(UnitData) : ''} />
                    <TextInput style={{ marginTop: 20, ...GlobalStyles.disabledTextInput }} editable={false} mode='flat' underlineColor='transparent' label='Station' value={UnitData ? UnitData.Station : ''} />
                    <TextInput style={{ marginTop: 20, ...GlobalStyles.disabledTextInput }} editable={false} mode='flat' underlineColor='transparent' label='Station Phone' value={UnitData ? UnitData.StationPhone : ''} />
                    <TextInput style={{ marginTop: 20, ...GlobalStyles.disabledTextInput }} editable={false} mode='flat' underlineColor='transparent' label='Maintenance Schedule' value={UnitData ? genericFormatter.formatFromEdmDate(UnitData.OpReadyCheckDate) : ''} />
                </View>
                <View style={{ paddingHorizontal: 20, marginTop: 20}}>
                    <CustomText variant='bodyLargeBold'>Other Details</CustomText>
                    <List.Section
                        style={{
                            backgroundColor: "#f9f9f9ff",
                            ...GlobalStyles.globalBorderRadius,
                        }}
                    >
                        <List.Item
                            style={{ height: 60, justifyContent: 'center'}}
                            onPress={async() => { 
                                
                                appContext.setShowDialog(true);
                                appContext.setShowBusyIndicator(true);

                                const url = `Z_CFU_DOCUMENTS_SRV/FileExports(Url='%2Fdocuments%2Fzfrnsw%2Fcfu%2Fmaps%2FMAP_2%2FCFUPortal_MAP2_${UnitData.Short}.pdf',FileType='application%2Fpdf')/$value`;
                                const obj = {
                                    showSharing: false,
                                    displayName: 'Bushfire Risk Map (' + UnitData.Short + ")",
                                    filePath : url,
                                    fileName : `Bushfire_Risk_Map_${UnitData.Short}`
                                }
                                screenFlowModule.onNavigateToScreen('PDFDisplayPage', obj);
                            }}
                            title='Bushfire Risk Map'
                            right={() => <LucideIcons.ChevronRight color={theme.colors.primary} />}
                        />
                        <Divider />
                        <List.Item
                            style={{ height: 60, justifyContent: 'center'}}
                            onPress={() => { 

                                appContext.setShowDialog(true);
                                appContext.setShowBusyIndicator(true);

                                const url = `Z_CFU_DOCUMENTS_SRV/FileExports(Url='%2Fdocuments%2Fzfrnsw%2Fcfu%2Fmaps%2FMAP_4%2FCFUPortal_MAP4_${UnitData.Short}.pdf',FileType='application%2Fpdf')/$value`;
                                const obj = {
                                    showSharing: false,
                                    displayName: '(PIP) Map (' + UnitData.Short + ')',
                                    filePath : url,
                                    fileName : `PIP_Map_${UnitData.Short}`
                                }
                                screenFlowModule.onNavigateToScreen('PDFDisplayPage', obj);
                            }}
                            title='Pre-incident Plan (PIP) Map'
                            right={() => <LucideIcons.ChevronRight color={theme.colors.primary} />}
                        />
                    </List.Section>

                </View>
            </View>
        </ScrollView>
    )
}

export default MyUnit;