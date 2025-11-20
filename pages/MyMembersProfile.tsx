import React, { useState } from "react";
import { View, ScrollView, Easing, Dimensions } from "react-native";
import { useTheme, Button, List, Divider, IconButton } from "react-native-paper";
import * as LucideIcons from "lucide-react-native";
import CustomText from "../assets/CustomText";
import { useDataContext } from "../helper/DataContext";
import GlobalStyles from "../style/GlobalStyles";
import GenericFormatter from "../helper/GenericFormatters";

import { createStackNavigator } from "@react-navigation/stack";
import { ProfileStackParamList } from "../types/AppTypes";

import { useAppContext } from "../helper/AppContext";
import { dataHandlerModule } from "../helper/DataHandlerModule";

import { screenFlowModule } from "../helper/ScreenFlowModule";
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../types/AppTypes';

const ProfileHeader = () => {
    const theme = useTheme();
    const dataContext = useDataContext();
    const employeeDetails = dataContext.myMemberEmployeeDetails[0];
    const membership = dataContext.myMembersMembershipDetails[0];
    const genericFormatter = new GenericFormatter();

    return (
        <View style={{ padding: 20, backgroundColor: theme.colors.background }}>
            <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>

            </View>
            <View
                style={{
                    flexDirection: "row",
                    justifyContent: "space-around",
                    marginTop: 20,
                }}
            >
                <View
                    style={{
                        padding: 20,
                        backgroundColor: "#d3d3d3ff",
                        borderRadius: 50,
                    }}
                >
                    <LucideIcons.UserRound size={50} />
                </View>
            </View>
            <CustomText
                variant="displaySmallBold"
                style={{ textAlign: "center", marginTop: 20 }}
            >
                {employeeDetails.Vorna} {employeeDetails.Nachn}
            </CustomText>
            {
                (employeeDetails.Ceased) && (
                    <View>
                        <CustomText
                            variant="titleMedium"
                            style={{ textAlign: "center", marginTop: 10 }}
                        >
                            Ceased Date : {genericFormatter.formatFromEdmDate(employeeDetails.CeasedDate)}
                        </CustomText>
                    </View>
                )
            }
            {
                (!employeeDetails.Ceased) && (
                    <View>
                        <CustomText
                            variant="titleLarge"
                            style={{ textAlign: "center", marginTop: 10 }}
                        >
                            {membership.ZzmemtyDesc}
                        </CustomText>
                        <CustomText
                            variant="titleSmall"
                            style={{ textAlign: "center", marginTop: 10 }}
                        >
                            {membership.Otext}
                        </CustomText>
                    </View>
                )
            }
        </View>
    );
};

type props = StackScreenProps<RootStackParamList, 'MyMembersProfile'>;

const MyMembersProfile = ({ route }: props) => {
    const { setShowDialog, setShowBusyIndicator, setDialogMessage } = useAppContext();
    const dataContext = useDataContext();
    const appContext = useAppContext();

    const employeeDetails = dataContext.myMemberEmployeeDetails[0];
    const membershipDetails = dataContext.myMembersMembershipDetails[0];

    const theme = useTheme();

    async function getPageData(url: string, service: string, entity: string, callback: (val: any) => void) {
        setShowDialog(true);
        setShowBusyIndicator(true);
        try {
            const responseData = await dataHandlerModule.batchGet(url, service, entity);
            if (responseData.responseBody.error) {
                setDialogMessage('There was an error reading ' + entity);
                setShowBusyIndicator(false);
                return;
            }

            setShowBusyIndicator(false);
            setShowDialog(false);
            callback(responseData.responseBody.d.results);
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }

    return (
        <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 50, backgroundColor: theme.colors.onPrimary }}
        >
            <View style={{ flex: 1, backgroundColor: theme.colors.onPrimary }}>
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        paddingVertical: 20,
                        backgroundColor: theme.colors.background
                    }}
                >
                    <IconButton
                        icon={() => (
                            <LucideIcons.ChevronLeft color={theme.colors.primary} size={25} />
                        )}
                        size={20}
                        onPress={() => screenFlowModule.onGoBack()}
                    />
                    <CustomText style={{ marginLeft: 20 }} variant="titleLargeBold">
                        Team Member Details
                    </CustomText>
                </View>
                <ProfileHeader />
                <View style={{ marginVertical: 40, paddingHorizontal: 20, backgroundColor: theme.colors.onPrimary }}>
                    <CustomText
                        variant="titleLargeBold"
                        style={{ marginVertical: 15, color: theme.colors.primary }}
                    >
                        Personal Information
                    </CustomText>
                    <List.Section
                        style={{
                            backgroundColor: "#f9f9f9ff",
                            ...GlobalStyles.globalBorderRadius,
                        }}
                    >
                        <List.Item
                            style={{ height: 80, justifyContent: "center" }}
                            onPress={async () => {
                                let plans;

                                //if ceased, use the parsed member object to get the 
                                if (employeeDetails.Ceased) {
                                    plans = dataContext.volAdminCeasedSelectedMember.Zzplans;
                                }
                                else {
                                    plans = dataContext.myMembersMembershipDetails[0].Zzplans;
                                }

                                getPageData(`EmployeeDetails?$filter=Pernr%20eq%20%27${employeeDetails.Pernr}%27%20and%20Zzplans%20eq%20%27${plans}%27`, 'Z_ESS_MSS_SRV', 'EmployeeDetails', (data) => {
                                    dataContext.setEmployeeDetails(data);
                                    screenFlowModule.onNavigateToScreen('MyDetailsScreen')
                                })
                            }}
                            title={() => (
                                <CustomText variant="bodyLarge">Personal Details</CustomText>
                            )}
                            right={() => <LucideIcons.ChevronRight color={theme.colors.primary} />}
                        />
                        <Divider />
                        <List.Item
                            style={{ height: 80, justifyContent: "center" }}
                            onPress={async () => {
                                let plans;

                                //if ceased, use the parsed member object to get the 
                                if (employeeDetails.Ceased) {
                                    plans = dataContext.volAdminCeasedSelectedMember.Zzplans;
                                }
                                else {
                                    plans = dataContext.myMembersMembershipDetails[0].Zzplans;
                                }
                                getPageData(`EmployeeDetails?$filter=Pernr%20eq%20%27${employeeDetails.Pernr}%27%20and%20Zzplans%20eq%20%27${plans}%27`, 'Z_ESS_MSS_SRV', 'EmployeeDetails', (data) => {
                                    dataContext.setEmployeeDetails(data);
                                    screenFlowModule.onNavigateToScreen('ContactDetailsScreen')
                                })
                            }}
                            title={() => (
                                <CustomText variant="bodyLarge">Contact Details</CustomText>
                            )}
                            right={() => <LucideIcons.ChevronRight color={theme.colors.primary} />}
                        />
                        <Divider />
                        <List.Item
                            style={{ height: 80, justifyContent: "center" }}
                            onPress={async () => {
                                getPageData(
                                    `EmployeeAddresses?$filter=Pernr%20eq%20%27${employeeDetails.Pernr}%27%20and%20Subty%20eq%20%274%27`,
                                    "Z_ESS_MSS_SRV",
                                    "EmployeeAddresses",
                                    (data) => {
                                        dataContext.setEmployeeAddresses(data);
                                        screenFlowModule.onNavigateToScreen('EmergencyContactsScreen')
                                    }
                                )
                            }}
                            title={() => (
                                <CustomText variant="bodyLarge">Emergency Contacts</CustomText>
                            )}
                            right={() => <LucideIcons.ChevronRight color={theme.colors.primary} />}
                        />
                    </List.Section>
                    <CustomText
                        variant="titleLargeBold"
                        style={{ marginVertical: 15, color: theme.colors.primary }}
                    >
                        Volunteer Information
                    </CustomText>
                    <List.Section
                        style={{
                            backgroundColor: "#f9f9f9ff",
                            ...GlobalStyles.globalBorderRadius,
                        }}
                    >
                        {(!employeeDetails.Ceased) &&
                            //only show if member is not ceased
                            <>
                                <List.Item
                                    style={{ height: 80, justifyContent: "center" }}
                                    onPress={async () => {
                                        appContext.setShowBusyIndicator(true);
                                        appContext.setShowDialog(true);

                                        const requests = [
                                            dataHandlerModule.batchGet(`ObjectsOnLoan?$filter=Pernr%20eq%20%27${employeeDetails.Pernr}%27%20and%20Zzplans%20eq%20%27${membershipDetails.Zzplans}%27%20and%20Mss%20eq%20true`, 'Z_ESS_MSS_SRV', 'ObjectsOnLoan'),
                                            dataHandlerModule.batchGet(`MedalsAwards?$filter=Pernr%20eq%20%27${employeeDetails.Pernr}%27&$skip=0&$top=100`, 'Z_ESS_MSS_SRV', 'MedalsAwards'),
                                        ]

                                        try {
                                            const results = await Promise.allSettled(requests);
                                            const passed = results.every(x => x.status == 'fulfilled');
                                            if (!passed) {
                                                //TODO take them to a critical error page
                                                appContext.setDialogMessage('Critical error occurred during the initial GET');
                                                return;
                                            }

                                            const readErrors = results.filter(x => x.value.responseBody.error);
                                            if (readErrors.length > 0) {
                                                //TODO handle read errors somewhere
                                                appContext.setDialogMessage('Read error on initialisation');
                                            }

                                            for (const x of results) {
                                                switch (x.value.entityName) {

                                                    case 'MedalsAwards':
                                                        dataContext.setMedalsAwards(x.value.responseBody.d.results);
                                                        break;

                                                    case 'ObjectsOnLoan':
                                                        dataContext.setObjectsOnLoan(x.value.responseBody.d.results);
                                                        break;
                                                }
                                            }

                                            screenFlowModule.onNavigateToScreen('MembershipDetailsScreen');
                                            appContext.setShowDialog(false);
                                            appContext.setShowBusyIndicator(false);
                                        } catch (error) {
                                            appContext.setShowBusyIndicator(false);
                                            appContext.setShowDialog(false);
                                            console.log(error);
                                            throw error;
                                        }
                                    }}
                                    title={() => (
                                        <CustomText variant="bodyLarge">Membership Details</CustomText>
                                    )}
                                    right={() => <LucideIcons.ChevronRight color={theme.colors.primary} />}
                                />
                                <Divider />
                            </>
                        }
                        <List.Item
                            style={{ height: 80, justifyContent: "center" }}
                            onPress={() => {

                                getPageData(
                                    `TrainingHistoryDetails?$filter=Pernr%20eq%20%27${employeeDetails.Pernr}%27`,
                                    'Z_VOL_MEMBER_SRV',
                                    'TrainingHistoryDetails',
                                    (data) => {
                                        dataContext.setTrainingHistoryDetails(data);
                                        screenFlowModule.onNavigateToScreen('TrainingHistoryScreen')
                                    }
                                )
                            }}
                            title={() => (
                                <CustomText variant="bodyLarge">Training History</CustomText>
                            )}
                            right={() => <LucideIcons.ChevronRight color={theme.colors.primary} />}
                        />
                        <Divider />
                        <List.Item
                            style={{ height: 80, justifyContent: "center" }}
                            onPress={() => {
                                screenFlowModule.onNavigateToScreen('EquityDiversity');
                            }}
                            title={() => (
                                <CustomText variant="bodyLarge">Equity Diversity</CustomText>
                            )}
                            right={() => <LucideIcons.ChevronRight color={theme.colors.primary} />}
                        />
                        <Divider />
                        <List.Item
                            style={{ height: 80, justifyContent: "center" }}
                            onPress={() => {
                                getPageData(
                                    `PositionRecords?$filter=Mss%20eq%20true%20and%20PskeyPernr%20eq%20%27${employeeDetails.Pernr}%27%20and%20FilterOptionId%20eq%201`,
                                    'Z_VOL_MEMBER_SRV',
                                    'PositionRecords',
                                    (data) => {
                                        const propData = {
                                            pernr: employeeDetails.Pernr,
                                            history: data
                                        }
                                        screenFlowModule.onNavigateToScreen('PositionHistory', propData)
                                    }
                                )
                            }}
                            title={() => (
                                <CustomText variant="bodyLarge">Position History</CustomText>
                            )}
                            right={() => <LucideIcons.ChevronRight color={theme.colors.primary} />}
                        />
                        <Divider />
                        {
                            (dataContext.currentUser[0].VolAdmin) && (
                                <>
                                    <List.Item
                                        style={{ height: 80, justifyContent: "center" }}
                                        onPress={() => {
                                            screenFlowModule.onNavigateToScreen('VolunteerNotes', { pernr: employeeDetails.Pernr });
                                        }}
                                        title={() => (
                                            <CustomText variant="bodyLarge">Volunteer Notes</CustomText>
                                        )}
                                        right={() => <LucideIcons.ChevronRight color={theme.colors.primary} />}
                                    />
                                    <Divider />
                                </>
                            )
                        }
                        {
                            //vol admin and not ceased
                            (dataContext.currentUser[0].VolAdmin && !employeeDetails.Ceased) && (
                                <List.Item
                                    style={{ height: 80, justifyContent: "center", paddingLeft: 20 }}
                                    onPress={() => {
                                        screenFlowModule.onNavigateToScreen('VolAdminCeaseMember', {
                                            employeeDetails: employeeDetails,
                                            membershipDetails: membershipDetails
                                        })
                                    }}
                                    title={() => (
                                        <CustomText style={{ color: theme.colors.primary }} variant="bodyLargeBold">Cease Membership</CustomText>
                                    )}
                                    left={() => <LucideIcons.UserX color={theme.colors.primary} />}
                                    right={() => <LucideIcons.ChevronRight color={theme.colors.primary} />}
                                />
                            )
                        }
                    </List.Section>
                </View>
            </View>
        </ScrollView>
    )
};

export default MyMembersProfile;
