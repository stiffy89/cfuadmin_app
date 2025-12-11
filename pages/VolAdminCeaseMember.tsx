import React, { useEffect, useState } from 'react';
import { View, Pressable } from 'react-native';
import { IconButton, TextInput, List, Divider, Button, Portal, Dialog, useTheme } from 'react-native-paper';
import { ScreenFlowModule, screenFlowModule } from '../helper/ScreenFlowModule';
import { X, UserRound, Calendar, ChevronDown } from 'lucide-react-native';
import CustomText from '../assets/CustomText';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../types/AppTypes';
import GlobalStyles from '../style/GlobalStyles';
import GenericFormatter from '../helper/GenericFormatters';
import { dataHandlerModule } from '../helper/DataHandlerModule';
import { registerTranslation, enGB, DatePickerModal } from 'react-native-paper-dates';
import { useDataContext } from '../helper/DataContext';
import { useAppContext } from '../helper/AppContext';
import { useHelperValuesDataContext } from '../helper/HelperValuesDataContext';
import PaletteData from '../assets/zsp_team_palette.json';


type props = StackScreenProps<RootStackParamList, 'VolAdminCeaseMember'>;

const VolAdminCeaseMember = ({ route }: props) => {
    registerTranslation('en-GB', enGB);
    const employeeDetails = route.params!.employeeDetails;
    const membershipDetails = route.params!.membershipDetails;
    const genericFormatter = new GenericFormatter();
    const dataContext = useDataContext();
    const appContext = useAppContext();
    const helperDataContext = useHelperValuesDataContext();

    const [showDialog, setShowDialog] = useState(false);
    const [dialogText, setDialogText] = useState('');
    const [showDropDown, setShowDropDown] = useState(false);
    const [showPicker, setShowPicker] = useState(false);
    const [ceaseDate, setCeaseDate] = useState<Date | null>(null);

    const initCeaseReason = helperDataContext.cessationReasons.filter(x => x.Mgtxt === '')[0];

    const [ceaseReason, setCeaseReason] = useState(initCeaseReason);

    const today = new Date();
    const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const theme = useTheme();

    const mod = Number(employeeDetails .Pernr) % PaletteData.length;
                                                   
    const iconColor = PaletteData.filter((x) => {
        return ((x.PaletteId / mod) == 1)
    })[0];

    return (
        <View style={GlobalStyles.page}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginLeft: 20 }}>
                <CustomText variant="titleLargeBold">Cease Membership</CustomText>
                <IconButton
                    icon={() => <X />}
                    onPress={() => screenFlowModule.onGoBack()}
                />
            </View>
            <View style={{ paddingHorizontal: 20, paddingBottom: 20, backgroundColor: theme.colors.background }}>
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: 'center'
                    }}
                >
                    <View
                        style={{
                            padding: 20,
                            backgroundColor: iconColor.HexCode,
                            borderRadius: 50,
                            marginRight: 30
                        }}
                    >
                        <UserRound color='#fff' size={50} />
                    </View>
                    <View
                        style={{ flex: 1, alignItems: 'flex-start' }}
                    >
                        <CustomText
                            variant="displaySmallBold"
                            style={{ textAlign: "center", marginTop: 20 }}
                        >
                            {employeeDetails.Vorna}
                        </CustomText>
                        <CustomText
                            variant="displaySmallBold"
                            style={{ textAlign: "center", marginTop: 20 }}
                        >
                            {employeeDetails.Nachn}
                        </CustomText>
                        <CustomText
                            variant="titleLarge"
                            style={{ textAlign: "center", marginTop: 10 }}
                        >
                            {employeeDetails.Pernr}
                        </CustomText>
                        <CustomText
                            variant="titleSmall"
                            style={{ textAlign: "center", marginTop: 10 }}
                        >
                            {membershipDetails.Otext}
                        </CustomText>
                    </View>
                </View>
            </View>
            <View style={{ paddingHorizontal: 20 }}>
                <TextInput style={{ marginTop: 20 }} editable={false} mode='outlined' underlineColor='transparent' label='Last Date' value={genericFormatter.formatJSDateToFormat(ceaseDate)} right={<TextInput.Icon onPress={() => {
                    setShowPicker(!showPicker)
                }} icon={() => <Calendar />} />} />
            </View>
            <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
                <Pressable
                    onPress={() => {
                        setShowDropDown(!showDropDown);
                    }}
                >
                    <View pointerEvents="none">
                        <TextInput
                            mode='outlined'
                            value={ceaseReason ? ceaseReason.Mgtxt : ''}
                            editable={false}
                            right={
                                <TextInput.Icon
                                    icon={() => {
                                        return <ChevronDown />
                                    }}
                                />
                            }
                        />
                    </View>
                </Pressable>
                {(showDropDown) &&
                    <List.Section style={{ backgroundColor: theme.colors.onSecondary, position: 'absolute', width: '100%', top: 50, left: 20, zIndex: 100, borderColor: 'rgba(99, 99, 99, 1)', borderWidth: 1 }}>
                        {helperDataContext.cessationReasons.map((x, i) => {
                            return (
                                <React.Fragment key={'Fragment_' + i}>
                                    <List.Item
                                        key={i}
                                        title={x.Mgtxt}
                                        style={{
                                            backgroundColor: (x.Mgtxt === ceaseReason.Mgtxt) ? theme.colors.surfaceVariant : theme.colors.onPrimary
                                        }}
                                        onPress={async () => {

                                            setCeaseReason(x);

                                            //when we set the selected org unit, we need to update the members list aswell
                                            setShowDropDown(!showDropDown);
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
                style={{ flex: 1, paddingHorizontal: 20, justifyContent: 'flex-end' }}
            >
                <Button
                    style={{ marginBottom: 40 }}
                    mode='contained'
                    onPress={async () => {


                        if (ceaseDate == null || ceaseReason.Massg == '') {
                            setDialogText("Please select a cessation date and reason before saving");
                            setShowDialog(true);
                            return;
                        }

                        appContext.setShowBusyIndicator(true);
                        appContext.setShowDialog(true);

                        const cessationData = {
                            "Pernr": employeeDetails.Pernr,
                            "LastDay": genericFormatter.formatToEdmDate(ceaseDate),
                            "Ename": employeeDetails.Ename,
                            "Zzplans": membershipDetails.Zzplans,
                            "Massg": ceaseReason.Massg,
                            "Stext": membershipDetails.Otext
                        }

                        try {
                            const response = await dataHandlerModule.batchSingleUpdate(
                                `Cessations(Pernr='${employeeDetails.Pernr}')`,
                                "Z_VOL_MANAGER_SRV",
                                cessationData
                            );

                            if (!response.responseBody) {
                                //do another read on the employee details and membership details and go back

                                try {
                                    const membershipResponse = await dataHandlerModule.batchGet(`MembershipDetails?$filter=Pernr%20eq%20%27${employeeDetails.Pernr}%27%20and%20Zzplans%20eq%20%27${membershipDetails.Zzplans}%27`, 'Z_VOL_MEMBER_SRV', 'MembershipDetails');
                                    const employeeResponse = await dataHandlerModule.batchGet(`EmployeeDetails?$filter=Pernr%20eq%20%27${employeeDetails.Pernr}%27%20and%20Zzplans%20eq%20%27${membershipDetails.Zzplans}%27`, 'Z_ESS_MSS_SRV', 'EmployeeDetails');
                                    dataContext.setMyMembersMembershipDetails(membershipResponse.responseBody.d.results);
                                    dataContext.setMyMemberEmployeeDetails(employeeResponse.responseBody.d.results);

                                    //do another read to update the main manage members list
                                    if (dataContext.volAdminMembersSearchFilter.firstName || dataContext.volAdminMembersSearchFilter.lastName || dataContext.volAdminMembersSearchFilter.pernr) {
                                        let query = '';

                                        if (dataContext.volAdminMembersSearchFilter.firstName && !dataContext.volAdminMembersSearchFilter.lastName) {
                                            const cleanedFirstname = dataContext.volAdminMembersSearchFilter.firstName.replace(/\s+/g, '');
                                            query += `Brigades?$skip=0&$top=100&$filter=substringof(%27${cleanedFirstname}%27,Vorna)`
                                        }
                                        else if (!dataContext.volAdminMembersSearchFilter.firstName && dataContext.volAdminMembersSearchFilter.lastName) {
                                            const cleanedLastname = dataContext.volAdminMembersSearchFilter.lastName.replace(/\s+/g, '');
                                            query += `Brigades?$skip=0&$top=100&$filter=substringof(%27${cleanedLastname}%27,Nachn)`
                                        }
                                        else if (dataContext.volAdminMembersSearchFilter.firstName && dataContext.volAdminMembersSearchFilter.lastName) {
                                            const cleanedFirstname = dataContext.volAdminMembersSearchFilter.firstName.replace(/\s+/g, '');
                                            const cleanedLastname = dataContext.volAdminMembersSearchFilter.lastName.replace(/\s+/g, '');
                                            query += `Brigades?$skip=0&$top=100&$filter=substringof(%27${cleanedFirstname}%27,Vorna)%20and%20substringof(%27${cleanedLastname}%27,Nachn)`
                                        }

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

                                            dataContext.setVolAdminMemberDetailSearchResults(results.responseBody.d.results);
                                            appContext.setShowDialog(false);
                                            screenFlowModule.onGoBack();

                                        } catch (error) {
                                            appContext.setShowDialog(false);
                                            screenFlowModule.onNavigateToScreen('ErrorPage', error);
                                        }
                                    }
                                    else {
                                        const plans = membershipDetails.Zzplans;
                                        try {
                                            const results = await dataHandlerModule.batchGet(
                                                `Members?$skip=0&$top=100&$filter=Zzplans%20eq%20%27${plans}%27%20and%20InclWithdrawn%20eq%20${dataContext.volAdminMembersSearchFilter.withdrawn}`,
                                                'Z_VOL_MANAGER_SRV',
                                                'Members'
                                            );

                                            dataContext.setOrgUnitTeamMembers(results.responseBody.d.results);
                                            appContext.setShowDialog(false);
                                            screenFlowModule.onGoBack();
                                        }
                                        catch (error) {
                                            appContext.setShowDialog(false);
                                            screenFlowModule.onNavigateToScreen('ErrorPage', error);
                                        }
                                    }
                                }
                                catch (error) {
                                    appContext.setShowDialog(false);
                                    screenFlowModule.onNavigateToScreen('ErrorPage', error);
                                }
                            }
                        }
                        catch (error) {
                            appContext.setShowDialog(false);
                            screenFlowModule.onNavigateToScreen('ErrorPage', error);
                        }
                    }}
                >
                    Save
                </Button>
            </View>
            <Portal>
                <Dialog visible={showDialog} theme={{ colors: { primary: 'green' } }} onDismiss={() => setShowDialog(!showDialog)}>
                    <Dialog.Content>
                        <CustomText variant='bodyMedium'>
                            {dialogText}
                        </CustomText>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setShowDialog(!showDialog)} textColor={theme.colors.secondary}>OK</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
            <DatePickerModal
                locale='en-GB'
                date={new Date()}
                visible={showPicker}
                mode='single'
                saveLabel="Select Date"
                validRange={{
                    startDate: undefined,
                    endDate: endOfToday,
                    disabledDates: undefined
                }}
                onConfirm={({ date }) => {

                    if (!date) {
                        // no date selected, just close the picker
                        setShowPicker(false);
                        return;
                    }

                    const newDateObj = new Date(
                        date.getFullYear(),
                        date.getMonth(),
                        date.getDate()
                    );

                    setCeaseDate(newDateObj);
                    setShowPicker(false);
                }}
                onDismiss={() => setShowPicker(!showPicker)}
            />
        </View>
    )
}

export default VolAdminCeaseMember;