import React, { useState, useEffect } from 'react';
import { View, KeyboardAvoidingView, Platform, ScrollView, Keyboard } from 'react-native';
import CustomText from '../assets/CustomText';
import { VolAdminSearchFilter } from '../types/AppTypes';
import { screenFlowModule } from '../helper/ScreenFlowModule';
import { IconButton, Switch, SegmentedButtons, useTheme, Searchbar, TextInput, Button, List } from 'react-native-paper';
import { ChevronLeft } from 'lucide-react-native';
import { useDataContext } from '../helper/DataContext';
import GlobalStyles from '../style/GlobalStyles';
import { useAppContext } from '../helper/AppContext';
import { dataHandlerModule } from '../helper/DataHandlerModule';
import { House } from 'lucide-react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../types/AppTypes';
import { parse } from 'react-native-svg';

type props = StackScreenProps<RootStackParamList, 'VolAdminSearch'>;

const VolAdminSearch = ({ route }: props) => {

    const theme = useTheme();
    const dataContext = useDataContext();
    const appContext = useAppContext();
    const parsedData = route.params;

    const [searchFilter, setSearchFilter] = useState<VolAdminSearchFilter>(parsedData!.category == 'member' ? dataContext.volAdminMembersSearchFilter : dataContext.volAdminTrainingSearchFilter);

    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const [stationSearchResults, setStationSearchResults] = useState<any[]>([]);
    const [unitSearchResults, setUnitSearchResults] = useState<any[]>([]);

    useEffect(() => {
        const showSub = Keyboard.addListener('keyboardWillShow', () => setKeyboardVisible(true));
        const hideSub = Keyboard.addListener('keyboardWillHide', () => setKeyboardVisible(false));

        if (parsedData!.category == 'member') {
            setSearchFilter(dataContext.volAdminMembersSearchFilter);
        }
        else if (parsedData!.category == 'training') {
            setSearchFilter(dataContext.volAdminTrainingSearchFilter);
        }

        return () => {
            showSub.remove();
            hideSub.remove();
        };

    }, []);

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : "height"}
            keyboardVerticalOffset={75}
            style={{ flex: 1 }}
        >
            <View style={GlobalStyles.page}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20 }}>
                    <IconButton icon={() => <ChevronLeft color={theme.colors.primary} size={25} />} size={20} onPress={() => {
                        screenFlowModule.onGoBack()
                    }} />
                    <CustomText style={{ marginLeft: 20 }} variant='titleLargeBold'>Search Unit / Member</CustomText>
                </View>
                <ScrollView style={{ paddingHorizontal: 20 }}>
                    <CustomText variant='bodyMediumBold' style={{ marginVertical: 10 }}>Unit / Station</CustomText>
                    {(stationSearchResults.length == 0) &&
                        <Searchbar
                            style={{
                                backgroundColor: theme.colors.surfaceVariant,
                                ...GlobalStyles.inputRoundedCorners,
                                marginBottom: 20
                            }}
                            placeholder='Search Unit'
                            value={searchFilter.unit}
                            onChangeText={(text) => {
                                setSearchFilter({
                                    ...searchFilter,
                                    unit: text
                                })
                            }}
                            onClearIconPress={() => {
                                setUnitSearchResults([]);
                            }}
                            onSubmitEditing={async (e) => {
                                appContext.setShowBusyIndicator(true);
                                appContext.setShowDialog(true);

                                try {
                                    const query = e.nativeEvent.text;
                                    const cleanedQuery = query.replace(/\s+/g, '');

                                    const results = await dataHandlerModule.batchGet(
                                        `Brigades?$skip=0&$top=100&$filter=substringof(%27${cleanedQuery}%27,Stext)`,
                                        'Z_VOL_MANAGER_SRV',
                                        'Brigades'
                                    );

                                    if (results.responseBody.error) {
                                        throw new Error('SAP error - ', results.responseBody.error.message.value)
                                    }

                                    setUnitSearchResults(results.responseBody.d.results);

                                    appContext.setShowBusyIndicator(false);
                                    appContext.setShowDialog(false);
                                }
                                catch (error) {
                                    //TODO - handle error
                                    console.log(error);
                                    appContext.setShowBusyIndicator(false);
                                    appContext.setShowDialog(false);
                                }
                            }}
                        />
                    }
                    {(unitSearchResults.length == 0) &&
                        <Searchbar
                            style={{
                                backgroundColor: theme.colors.surfaceVariant,
                                ...GlobalStyles.inputRoundedCorners
                            }}
                            placeholder='Search Station'
                            value={searchFilter.station}
                            onChangeText={(text) => {
                                setSearchFilter({
                                    ...searchFilter,
                                    station: text
                                })
                            }}
                            onClearIconPress={() => {
                                setStationSearchResults([]);
                            }}
                            onSubmitEditing={async (e) => {
                                appContext.setShowBusyIndicator(true);
                                appContext.setShowDialog(true);

                                try {
                                    const query = e.nativeEvent.text;
                                    const cleanedQuery = query.replace(/\s+/g, '');
                                    const results = await dataHandlerModule.batchGet(
                                        `Brigades?$skip=0&$top=100&$filter=substringof(%27${cleanedQuery}%27,Station)`,
                                        'Z_VOL_MANAGER_SRV',
                                        'Brigades'
                                    );

                                    if (results.responseBody.error) {
                                        throw new Error('SAP error - ', results.responseBody.error.message.value)
                                    }

                                    setStationSearchResults(results.responseBody.d.results);

                                    appContext.setShowBusyIndicator(false);
                                    appContext.setShowDialog(false);
                                }
                                catch (error) {
                                    //TODO - handle error
                                    console.log(error);
                                    appContext.setShowBusyIndicator(false);
                                    appContext.setShowDialog(false);
                                }
                            }}
                        />
                    }
                    {((unitSearchResults.length == 0) && (stationSearchResults.length == 0)) &&
                        <View>
                            <CustomText variant='bodyMediumBold' style={{ marginTop: 30, marginBottom: 10 }}>Member Service ID</CustomText>
                            <Searchbar
                                style={{
                                    backgroundColor: theme.colors.surfaceVariant,
                                    ...GlobalStyles.inputRoundedCorners
                                }}
                                placeholder='Search Personnel No'
                                value={searchFilter.pernr}
                                onChangeText={(text) => {
                                    setSearchFilter({
                                        ...searchFilter,
                                        pernr: text
                                    })
                                }}
                                onSubmitEditing={async (e) => {
                                    appContext.setShowBusyIndicator(true);
                                    appContext.setShowDialog(true);

                                    try {
                                        const query = e.nativeEvent.text;
                                        const cleanedQuery = query.replace(/\s+/g, '');
                                        const results = await dataHandlerModule.batchGet(
                                            `Brigades?$skip=0&$top=100&$filter=Pernr%20eq%20%27${cleanedQuery}%27`,
                                            'Z_VOL_MANAGER_SRV',
                                            'Brigades'
                                        );

                                        if (results.responseBody.d.results.length == 0) {
                                            appContext.setShowBusyIndicator(false);
                                            appContext.setDialogMessage('No results found for this personnel number');
                                            return;
                                        }

                                        //set data, filter, nav back
                                        dataContext.setVolAdminMemberDetailSearchResults(results.responseBody.d.results);

                                        if (parsedData!.category == 'member') {
                                            dataContext.setVolAdminMembersSearchFilter({
                                                withdrawn: searchFilter.withdrawn,
                                                unit: '',
                                                station: '',
                                                lastName: '',
                                                firstName: '',
                                                pernr: searchFilter.pernr
                                            });
                                        }
                                        else {
                                            dataContext.setVolAdminTrainingSearchFilter({
                                                withdrawn: false,
                                                unit: '',
                                                station: '',
                                                lastName: '',
                                                firstName: '',
                                                pernr: searchFilter.pernr
                                            });
                                        }

                                        screenFlowModule.onGoBack();
                                    }
                                    catch (error) {
                                        //TODO - handle error
                                        console.log(error);
                                        appContext.setShowBusyIndicator(false);
                                        appContext.setShowDialog(false);
                                    }
                                }}
                            />
                            <CustomText variant='bodyMediumBold' style={{ marginTop: 30, marginBottom: 10 }}>Member Name</CustomText>
                            <TextInput
                                style={{
                                    backgroundColor: theme.colors.surfaceVariant,
                                    marginBottom: 10
                                }}
                                placeholder='First Name'
                                value={searchFilter.firstName}
                                onChangeText={(text) => {
                                    setSearchFilter({
                                        ...searchFilter,
                                        firstName: text
                                    })
                                }}
                            />
                            <TextInput
                                style={{
                                    backgroundColor: theme.colors.surfaceVariant,
                                    marginBottom: 20
                                }}
                                placeholder='Last Name'
                                value={searchFilter.lastName}
                                onChangeText={(text) => {
                                    setSearchFilter({
                                        ...searchFilter,
                                        lastName: text
                                    })
                                }}
                            />
                            <Button
                                mode='outlined'
                                style={{ borderColor: theme.colors.primary, marginTop: 20 }}
                                onPress={async () => {

                                    let query = '';

                                    if (searchFilter.firstName && !searchFilter.lastName) {
                                        const cleanedFirstname = searchFilter.firstName.replace(/\s+/g, '');
                                        query += `Brigades?$skip=0&$top=100&$filter=substringof(%27${cleanedFirstname}%27,Vorna)`
                                    }
                                    else if (!searchFilter.firstName && searchFilter.lastName) {
                                        const cleanedLastname = searchFilter.lastName.replace(/\s+/g, '');
                                        query += `Brigades?$skip=0&$top=100&$filter=substringof(%27${cleanedLastname}%27,Nachn)`
                                    }
                                    else if (searchFilter.firstName && searchFilter.lastName) {
                                        const cleanedFirstname = searchFilter.firstName.replace(/\s+/g, '');
                                        const cleanedLastname = searchFilter.lastName.replace(/\s+/g, '');
                                        query += `Brigades?$skip=0&$top=100&$filter=substringof(%27${cleanedFirstname}%27,Vorna)%20and%20substringof(%27${cleanedLastname}%27,Nachn)`
                                    }

                                    appContext.setShowBusyIndicator(true);
                                    appContext.setShowDialog(true);

                                    try {
                                        const results = await dataHandlerModule.batchGet(
                                            query,
                                            'Z_VOL_MANAGER_SRV',
                                            'Brigades'
                                        );

                                        if (results.responseBody.d.results.length == 0) {
                                            appContext.setShowBusyIndicator(false);
                                            appContext.setDialogMessage('No results found for this name search');
                                            return;
                                        }

                                        appContext.setShowDialog(false);

                                        //set data, filter, nav back
                                        dataContext.setVolAdminMemberDetailSearchResults(results.responseBody.d.results);

                                        if (parsedData!.category == 'member') {
                                            dataContext.setVolAdminMembersSearchFilter({
                                                withdrawn: searchFilter.withdrawn,
                                                unit: '',
                                                station: '',
                                                lastName: searchFilter.lastName,
                                                firstName: searchFilter.firstName,
                                                pernr: ''
                                            });
                                        }
                                        else {
                                            dataContext.setVolAdminTrainingSearchFilter({
                                                withdrawn: false,
                                                unit: '',
                                                station: '',
                                                lastName: searchFilter.lastName,
                                                firstName: searchFilter.firstName,
                                                pernr: ''
                                            });
                                        }


                                        screenFlowModule.onGoBack();

                                    }
                                    catch (error) {
                                        //TODO handle error
                                        console.log(error);
                                        appContext.setShowDialog(false);
                                    }
                                }}
                            >
                                Search Member Name
                            </Button>
                        </View>
                    }
                    {
                        //display the list for stations and units
                        (unitSearchResults.length > 0) && (
                            unitSearchResults.map((x, i) => {
                                return (
                                    <List.Item
                                        key={'item_' + i}
                                        title={x.Stext}
                                        description={x.Short}
                                        left={() => (
                                            <View
                                                style={{
                                                    backgroundColor: theme.colors.surfaceDisabled,
                                                    padding: 5,
                                                    borderRadius: 50,
                                                }}
                                            >
                                                <House color={theme.colors.outline} />
                                            </View>
                                        )}
                                        onPress={async () => {
                                            appContext.setShowBusyIndicator(true);
                                            appContext.setShowDialog(true);

                                            try {
                                                const results = await dataHandlerModule.batchGet(
                                                    `Members?$skip=0&$top=100&$filter=Zzplans%20eq%20%27${x.Zzplans}%27%20and%20InclWithdrawn%20eq%20${searchFilter.withdrawn}`,
                                                    'Z_VOL_MANAGER_SRV',
                                                    'Members'
                                                );

                                                const saveLastSelected = await dataHandlerModule.batchGet(
                                                    `SaveLastSelectedUnit?Zzplans='${x.Zzplans}'`,
                                                    'Z_VOL_MANAGER_SRV',
                                                    'SaveLastSelectedUnit'
                                                );

                                                if (results.responseBody.error || saveLastSelected.responseBody.error) {
                                                    throw new Error('SAP error for updating vol admin org selection')
                                                }

                                                dataContext.setOrgUnitTeamMembers(results.responseBody.d.results);
                                                dataContext.setVolAdminLastSelectedOrgUnit([x]);

                                                if (parsedData!.category == 'member') {
                                                    dataContext.setVolAdminMembersSearchFilter({
                                                        withdrawn: searchFilter.withdrawn,
                                                        unit: '',
                                                        station: '',
                                                        lastName: '',
                                                        firstName: '',
                                                        pernr: ''
                                                    })
                                                }
                                                else {
                                                    dataContext.setVolAdminTrainingSearchFilter({
                                                        withdrawn: false,
                                                        unit: '',
                                                        station: '',
                                                        lastName: '',
                                                        firstName: '',
                                                        pernr: ''
                                                    })
                                                }

                                                appContext.setShowBusyIndicator(false);
                                                appContext.setShowDialog(false);

                                                screenFlowModule.onGoBack();
                                            } catch (error) {
                                                appContext.setShowBusyIndicator(false);
                                                appContext.setShowDialog(false);
                                                //TODO handle error
                                            }
                                        }}
                                    />
                                )
                            })
                        )
                    }
                    {
                        (stationSearchResults.length > 0) && (
                            stationSearchResults.map((x, i) => {
                                return (
                                    <List.Item
                                        key={'item_' + i}
                                        title={x.Stext}
                                        description={x.Otext}
                                        left={() => (
                                            <View
                                                style={{
                                                    backgroundColor: theme.colors.surfaceDisabled,
                                                    padding: 5,
                                                    borderRadius: 50,
                                                }}
                                            >
                                                <House color={theme.colors.outline} />
                                            </View>
                                        )}
                                        onPress={async () => {
                                            appContext.setShowBusyIndicator(true);
                                            appContext.setShowDialog(true);

                                            try {
                                                const results = await dataHandlerModule.batchGet(
                                                    `Members?$skip=0&$top=100&$filter=Zzplans%20eq%20%27${x.Zzplans}%27%20and%20InclWithdrawn%20eq%20${searchFilter.withdrawn}`,
                                                    'Z_VOL_MANAGER_SRV',
                                                    'Brigades'
                                                );

                                                const saveLastSelected = await dataHandlerModule.batchGet(
                                                    `SaveLastSelectedUnit?Zzplans='${x.Zzplans}'`,
                                                    'Z_VOL_MANAGER_SRV',
                                                    'SaveLastSelectedUnit'
                                                );

                                                if (results.responseBody.error || saveLastSelected.responseBody.error) {
                                                    throw new Error('SAP error for updating vol admin org selection')
                                                }

                                                dataContext.setOrgUnitTeamMembers(results.responseBody.d.results);
                                                dataContext.setVolAdminLastSelectedOrgUnit([x]);

                                                if (parsedData!.category == 'member') {
                                                    dataContext.setVolAdminMembersSearchFilter({
                                                        withdrawn: searchFilter.withdrawn,
                                                        unit: '',
                                                        station: '',
                                                        lastName: '',
                                                        firstName: '',
                                                        pernr: ''
                                                    })
                                                }
                                                else {
                                                    dataContext.setVolAdminTrainingSearchFilter({
                                                        withdrawn: false,
                                                        unit: '',
                                                        station: '',
                                                        lastName: '',
                                                        firstName: '',
                                                        pernr: ''
                                                    })
                                                }

                                                appContext.setShowBusyIndicator(false);
                                                appContext.setShowDialog(false);

                                                screenFlowModule.onGoBack();
                                            } catch (error) {
                                                appContext.setShowBusyIndicator(false);
                                                appContext.setShowDialog(false);
                                                //TODO handle error
                                            }
                                        }}
                                    />
                                )
                            })
                        )
                    }
                </ScrollView>
            </View>
        </KeyboardAvoidingView>
    );
}

export default VolAdminSearch;