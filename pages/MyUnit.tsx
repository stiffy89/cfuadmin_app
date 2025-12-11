import React, { useEffect, useState } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
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
import GenericAppHelpers from '../helper/GenericAppHelpers';

type props = StackScreenProps<RootStackParamList, 'MyUnitDetailsScreen'>; //typing the navigation props

const MyUnit = ({ route, navigation }: props) => {

    const theme = useTheme();
    const appContext = useAppContext();
    const genericFormatter = new GenericFormatter();
    const dataContext = useDataContext();
    const [UnitData, setUnitData] = useState(dataContext.myOrgUnitDetails[0]);
    const [selectedOrgUnit, setSelectedOrgUnit] = useState<any | undefined>(undefined);
    const [showDropDown, setShowDropDown] = useState(false);

    const genericAppHelper = new GenericAppHelpers();

    useEffect(() => {
        if (dataContext.rootOrgUnits.length > 1){
            //find the default org unit
            const matchingUnit = dataContext.rootOrgUnits.filter(x => x.Plans == dataContext.myOrgUnitDetails[0].Zzplans)[0];
            setSelectedOrgUnit(matchingUnit);
        }

        setUnitData(dataContext.myOrgUnitDetails[0]);
    }, [])

    return (
        <ScrollView contentContainerStyle={{ paddingBottom: 50 }}>
            <View style={GlobalStyles.page}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 20 }}>
                    <IconButton icon={() => <LucideIcons.ChevronLeft color={theme.colors.primary} size={25} />} size={20} onPress={() => screenFlowModule.onGoBack()} />
                    <CustomText style={{ marginLeft: 20 }} variant='titleLargeBold'>My Unit Details</CustomText>
                </View>
                {
                    (dataContext.rootOrgUnits.length > 1) && (
                        <>
                            <View style={{ paddingHorizontal: 20, marginVertical: 20 }}>
                                <Pressable
                                    onPress={() => {
                                        setShowDropDown(!showDropDown);
                                    }}
                                >
                                    <View pointerEvents="none">
                                        <TextInput
                                            mode='outlined'
                                            value={selectedOrgUnit ? selectedOrgUnit.Short : ''}
                                            editable={false}
                                            right={
                                                <TextInput.Icon
                                                    icon={() => {
                                                        return <LucideIcons.ChevronDown />
                                                    }}
                                                />
                                            }
                                        />
                                    </View>
                                </Pressable>
                                {(showDropDown) &&
                                    <List.Section style={{ backgroundColor: theme.colors.onSecondary, position: 'absolute', width: '100%', top: 50, left: 20, zIndex: 100, borderColor: 'rgba(99, 99, 99, 1)', borderWidth: 1 }}>
                                        {dataContext.rootOrgUnits.map((x, i) => {
                                            return (
                                                <React.Fragment key={'Fragment_' + i}>
                                                    <List.Item
                                                        key={i}
                                                        title={`${x.Short} ${x.Stext}`}
                                                        style={{
                                                            backgroundColor: (x.Plans === selectedOrgUnit.Plans) ? theme.colors.surfaceVariant : theme.colors.onPrimary
                                                        }}
                                                        onPress={async () => {
                                                            const plans = x.Plans;
                                                            setSelectedOrgUnit(x);

                                                            //when we set the selected org unit, we need to update the members list aswell
                                                            setShowDropDown(!showDropDown);


                                                            appContext.setShowBusyIndicator(true);
                                                            appContext.setShowDialog(true);

                                                            //read the org unit team members
                                                            try {
                                                                const selectedOrgUnitDetail = await dataHandlerModule.batchGet(`Brigades?$filter=Zzplans%20eq%20%27${x.Plans}%27`, 'Z_VOL_MEMBER_SRV', 'Brigades');
                                                                setUnitData(selectedOrgUnitDetail.responseBody.d.results[0]);
                                                                appContext.setShowDialog(false);
                                                            }
                                                            catch (error) {
                                                                appContext.setShowDialog(false);
                                                                screenFlowModule.onNavigateToScreen('ErrorPage', error);
                                                            }


                                                        }}
                                                    />
                                                    <Divider key={'divider' + i} />
                                                </React.Fragment>
                                            )
                                        })}
                                    </List.Section>
                                }
                            </View>
                        </>
                    )
                }
                <View style={{ padding: 20, backgroundColor: theme.colors.background, marginBottom: 20 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 }}>
                        <View style={{ padding: 20, backgroundColor: '#d3d3d3ff', borderRadius: 50 }}>
                            <LucideIcons.House size={50} />
                        </View>
                    </View>
                    <CustomText variant='displaySmallBold' style={{ textAlign: 'center', marginTop: 20 }}>{UnitData.Short}</CustomText>
                </View>
                <View style={{ paddingHorizontal: 20 }}>
                    <CustomText variant='bodyLargeBold'>Contact Information</CustomText>
                    <TextInput 
                        style={{ marginTop: 20, ...GlobalStyles.disabledTextInput }} 
                        multiline editable={false} 
                        mode='flat' 
                        underlineColor='transparent' 
                        label='Location'
                        textColor={theme.colors.secondary} 
                        value={UnitData ? genericFormatter.formatAddress(UnitData) : ''} 
                    />
                    <Pressable
                        onPress={() => {
                            if (UnitData){
                                const address = genericFormatter.formatAddress(UnitData);
                                if (address) {
                                    genericAppHelper.navigateToNativeMaps(address);
                                }
                            }
                        }}
                        style={{
                            position: "absolute",
                            left: 20,
                            right: 20,
                            top: 40,
                            height: 60,
                            zIndex: 10
                        }}
                    />
                    <TextInput style={{ marginTop: 20, ...GlobalStyles.disabledTextInput }} editable={false} mode='flat' underlineColor='transparent' label='Station' value={UnitData ? UnitData.Station : ''} />
                    <TextInput style={{ marginTop: 20, ...GlobalStyles.disabledTextInput }} editable={false} mode='flat' underlineColor='transparent' label='Station Phone' value={UnitData ? UnitData.StationPhone : ''} />
                    <TextInput style={{ marginTop: 20, ...GlobalStyles.disabledTextInput }} editable={false} mode='flat' underlineColor='transparent' label='Maintenance Schedule' value={UnitData ? genericFormatter.formatFromEdmDate(UnitData.OpReadyCheckDate) : ''} />
                </View>
                <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
                    <CustomText variant='bodyLargeBold'>Other Details</CustomText>
                    <List.Section
                        style={{
                            backgroundColor: "#f9f9f9ff",
                            ...GlobalStyles.globalBorderRadius,
                        }}
                    >
                        <List.Item
                            style={{ height: 60, justifyContent: 'center' }}
                            onPress={async () => {

                                appContext.setShowDialog(true);
                                appContext.setShowBusyIndicator(true);

                                const url = `Z_CFU_DOCUMENTS_SRV/FileExports(Url='%2Fdocuments%2Fzfrnsw%2Fcfu%2Fmaps%2FMAP_2%2FCFUPortal_MAP2_${UnitData.Short}.pdf',FileType='application%2Fpdf')/$value`;
                                const obj = {
                                    cache : true,
                                    showSharing: false,
                                    displayName: 'Bushfire Risk Map (' + UnitData.Short + ")",
                                    filePath: url,
                                    fileName: `Bushfire_Risk_Map_${UnitData.Short}`
                                }
                                screenFlowModule.onNavigateToScreen('PDFDisplayPage', obj);
                            }}
                            title='Bushfire Risk Map'
                            right={() => <LucideIcons.ChevronRight color={theme.colors.primary} />}
                        />
                        <Divider />
                        <List.Item
                            style={{ height: 60, justifyContent: 'center' }}
                            onPress={() => {

                                appContext.setShowDialog(true);
                                appContext.setShowBusyIndicator(true);

                                const url = `Z_CFU_DOCUMENTS_SRV/FileExports(Url='%2Fdocuments%2Fzfrnsw%2Fcfu%2Fmaps%2FMAP_4%2FCFUPortal_MAP4_${UnitData.Short}.pdf',FileType='application%2Fpdf')/$value`;
                                const obj = {
                                    cache : true,
                                    showSharing: false,
                                    displayName: '(PIP) Map (' + UnitData.Short + ')',
                                    filePath: url,
                                    fileName: `PIP_Map_${UnitData.Short}`
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