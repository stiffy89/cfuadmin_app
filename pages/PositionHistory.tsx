import React, { useState } from 'react';
import { View, FlatList } from 'react-native';
import { useTheme, IconButton, Divider, TextInput, List } from 'react-native-paper';
import * as LucideIcons from 'lucide-react-native';
import { screenFlowModule } from '../helper/ScreenFlowModule';
import CustomText from '../assets/CustomText';
import GlobalStyles from '../style/GlobalStyles';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../types/AppTypes';
import { useHelperValuesDataContext } from '../helper/HelperValuesDataContext';
import { useDataContext } from '../helper/DataContext';
import { useAppContext } from '../helper/AppContext';
import { dataHandlerModule } from '../helper/DataHandlerModule';

import GenericFormatter from '../helper/GenericFormatters';

type props = StackScreenProps<RootStackParamList, 'PositionHistory'>; //typing the navigation props

const PositionHistory = ({ route, navigation }: props) => {

    const theme = useTheme();
    const dataContext = useDataContext();
    const appContext = useAppContext();
    const helperDataContext = useHelperValuesDataContext();

    const history = route.params.history;
    const pernr = route.params.pernr;

    const [positionHistory, setPositionHistory] = useState(history);
    const [showDropDown, setShowDropDown] = useState(false);
    const matchingPositionFilter = helperDataContext.positionHistoryHelperValue.filter(x => (x.OptionId == 1))[0]
    const [selectedPositionFilter, setSelectedPositionFilter] = useState(matchingPositionFilter);

    return (
        <View
            style={GlobalStyles.page}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 20 }}>
                <IconButton icon={() => <LucideIcons.ChevronLeft color={theme.colors.primary} size={25} />} size={20} onPress={() => screenFlowModule.onGoBack()} />
                <CustomText style={{ marginLeft: 20 }} variant='titleLargeBold'>Position History</CustomText>
            </View>
            <View style={{ paddingHorizontal: 20}}>
                <TextInput
                    mode='outlined'
                    value={`${selectedPositionFilter.OptionText}`}
                    editable={false}
                    right={
                        <TextInput.Icon
                            icon={() => {
                                return <LucideIcons.ChevronDown />
                            }}
                            onPress={() => {
                                setShowDropDown(!showDropDown);
                            }}
                        />
                    }
                />
                {(showDropDown) &&
                    <List.Section style={{ backgroundColor: theme.colors.onSecondary, position: 'absolute', width: '100%', top: 50, left: 20, zIndex: 100, boxShadow: 'rgba(99, 99, 99, 0.2) 0px 2px 8px 0px' }}>
                        {helperDataContext.positionHistoryHelperValue.map((x, i) => {
                            return (
                                <React.Fragment key={'Fragment_' + i}>
                                    <List.Item
                                        key={i}
                                        title={`${x.OptionText}`}
                                        style={{
                                            backgroundColor: (x.OptionId === selectedPositionFilter.OptionId) ? theme.colors.surfaceVariant : theme.colors.onPrimary
                                        }}
                                        onPress={async () => {
                                            const optionId = x.OptionId;

                                            setSelectedPositionFilter(x);

                                            //when we set the selected org unit, we need to update the members list aswell
                                            setShowDropDown(!showDropDown);


                                            appContext.setShowBusyIndicator(true);
                                            appContext.setShowDialog(true);

                                
                                            //read the org unit team members
                                            try {
                                                //x.OptionId is 1,2,3 which causes errors, added a leading 0 because the back expects 01, 02, 03
                                                const positionHistoryResults = await dataHandlerModule.batchGet(`PositionRecords?$filter=Mss%20eq%20true%20and%20PskeyPernr%20eq%20%27${pernr}%27%20and%20FilterOptionId%20eq%20${x.OptionId}`, 'Z_VOL_MEMBER_SRV', 'PositionRecords');
                                                setPositionHistory(positionHistoryResults.responseBody.d.results);
                                                appContext.setShowDialog(false);
                                            }
                                            catch (error) {
                                                //TODO handle error
                                                appContext.setShowBusyIndicator(false);
                                                appContext.setShowDialog(false);
                                                console.log(error);
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
            <View
                style={{flex: 1, paddingBottom: 170}}
            >
                {
                    (positionHistory.length == 0) && (
                        <View style={{justifyContent: 'center', alignItems: 'center', flex: 1}}>
                            <CustomText variant='bodyLargeBold'>No position history found</CustomText>
                        </View>
                    )
                }
                <FlatList
                    style={{ marginTop: 20}}
                    data={positionHistory}
                    renderItem={({ item }) => {
                        return (
                            <View style={{ paddingHorizontal: 20 }}>
                                <View
                                    style={{ padding: 20, backgroundColor: theme.colors.background }}
                                >
                                    <CustomText variant='bodyMediumBold'>Unit :</CustomText>
                                    <CustomText style={{ marginTop: 5, marginLeft: 5 }} variant='bodyLarge'>{item.OrgUnitDesc}</CustomText>
                                    <CustomText style={{ marginTop: 10 }} variant='bodyMediumBold'>Membership Type :</CustomText>
                                    <CustomText style={{ marginTop: 5, marginLeft: 5, marginBottom: 5 }} variant='bodyLarge'>{item.MemTypeDescStext}</CustomText>
                                    <CustomText style={{ marginTop: 10 }} variant='bodyMediumBold'>Start Date - End Date</CustomText>
                                    <CustomText style={{ marginTop: 5, marginLeft: 5 }} variant='bodyLarge'>{item.BegdaText} - {item.EnddaText}</CustomText>
                                </View>
                                <Divider />
                            </View>
                        )
                    }}
                />
            </View>
        </View>
    )
}

export default PositionHistory;