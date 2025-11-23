import React, { useState } from "react";
import { View, ScrollView, Easing, Dimensions } from "react-native";
import { useTheme, Button, List, Divider } from "react-native-paper";
import * as LucideIcons from "lucide-react-native";
import CustomText from "../assets/CustomText";
import { useDataContext } from "../helper/DataContext";
import GlobalStyles from "../style/GlobalStyles";

import { createStackNavigator } from "@react-navigation/stack";
import { ProfileStackParamList } from "../types/AppTypes";

import { useAppContext } from "../helper/AppContext";
import { dataHandlerModule } from "../helper/DataHandlerModule";

import { screenFlowModule } from "../helper/ScreenFlowModule";

import { authModule } from "../helper/AuthModule";
import { OktaLoginResult } from "../types/AppTypes";


const ProfileHeader = () => {
    const { setCardModalVisible } = useAppContext();
    const theme = useTheme();
    const user = useDataContext().currentUser[0];
    const membership = useDataContext().membershipDetails[0];

    return (
        <View style={{ padding: 20, backgroundColor: theme.colors.background }}>
            <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
                <Button
                    mode="contained"
                    onPress={async () => {
                        setCardModalVisible(true)
                        if (!dataHandlerModule.securityInstanceInitialised()) {
                            return;
                        }

                        const volRolesBatchBody =
                            dataHandlerModule.getBatchBody("VolunteerRoles");

                        const membershipDetailsBatchBody =
                            dataHandlerModule.getBatchBody("MembershipDetails");

                        const batchBodyArray = [
                            membershipDetailsBatchBody,
                            volRolesBatchBody,
                        ];

                        try {
                            const responseBody = await dataHandlerModule.batchGet(
                                "MembershipDetailsss",
                                "Z_VOL_MEMBER_SRV",
                                "MembershipDetails"
                            );

                            console.log(responseBody);
                        } catch (error) {
                            //TODO handle error
                            throw error;
                        }
                    }}
                >
                    ID Card
                </Button>
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
                {user.Vorna} {user.Nachn}
            </CustomText>
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
    );
};

const ProfilePage = () => {
    const { setShowDialog, setShowBusyIndicator, setDialogMessage } = useAppContext();
    const dataContext = useDataContext();
    const appContext = useAppContext();

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
                <ProfileHeader />
                <View style={{ marginVertical: 40, paddingHorizontal: 20 }}>
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
                                const pernr = dataContext.currentUser[0].Pernr;
                                getPageData(`EmployeeDetails?$filter=Pernr%20eq%20%27${pernr}%27`, 'Z_ESS_MSS_SRV', 'EmployeeDetails', (data) => {
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
                                const pernr = dataContext.currentUser[0].Pernr;
                                getPageData(`EmployeeDetails?$filter=Pernr%20eq%20%27${pernr}%27`, 'Z_ESS_MSS_SRV', 'EmployeeDetails', (data) => {
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
                                    `EmployeeAddresses?$filter=Pernr%20eq%20%27${dataContext.currentUser[0].Pernr}%27%20and%20Subty%20eq%20%274%27`,
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
                        <List.Item
                            style={{ height: 80, justifyContent: "center" }}
                            onPress={async () => {
                                appContext.setShowBusyIndicator(true);
                                appContext.setShowDialog(true);
                                const pernr = dataContext.currentUser[0].Pernr;
                                const requests = [
                                    dataHandlerModule.batchGet(`MembershipDetails?$filter=Pernr%20eq%20%27${pernr}%27`, 'Z_VOL_MEMBER_SRV', 'MembershipDetails'),
                                    dataHandlerModule.batchGet(`ObjectsOnLoan?$filter=Pernr%20eq%20%27${pernr}%27&$skip=0&$top=100&$filter=CurrentOnly%20eq%20true`, 'Z_ESS_MSS_SRV', 'ObjectsOnLoan'),
                                    dataHandlerModule.batchGet(`MedalsAwards?$filter=Pernr%20eq%20%27${pernr}%27&$skip=0&$top=100`, 'Z_ESS_MSS_SRV', 'MedalsAwards'),
                                ]

                                try {
                                    const results = await Promise.allSettled(requests);
                                    const passed = results.every(x => x.status == 'fulfilled');
                                    if (!passed) {
                                        appContext.setShowDialog(false);
                                        screenFlowModule.onNavigateToScreen('ErrorPage', {
                                            isAxiosError: false,
                                            message : "Hang on, we found an error. There was a problem in getting your initial data. Please go back and try again or contact your IT administrator for further assistance."
                                        });
                                        return;
                                    }

                                    const readErrors = results.filter(x => x.value.responseBody.error);
                                    if (readErrors.length > 0) {
                                        appContext.setShowDialog(false);
                                        screenFlowModule.onNavigateToScreen('ErrorPage', {
                                            isAxiosError: false,
                                            message : "Hang on, we found an error. There was a problem in getting your initial data. Please go back and try again or contact your IT administrator for further assistance."
                                        });
                                    }

                                    for (const x of results) {
                                        switch (x.value.entityName) {
                                            case 'MembershipDetails':
                                                dataContext.setMembershipDetails(x.value.responseBody.d.results);
                                                break;

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
                        <List.Item
                            style={{ height: 80, justifyContent: "center" }}
                            onPress={() => {
                                const pernr = dataContext.currentUser[0].Pernr;
                                getPageData(
                                    `TrainingHistoryDetails?$filter=Pernr%20eq%20%27${pernr}%27`,
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
                        <Divider/>
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
                    </List.Section>
                </View>
            </View>
        </ScrollView>
    );
};

const Profile = () => {
    const Stack = createStackNavigator<ProfileStackParamList>();

    return (
        <Stack.Navigator
            initialRouteName="ProfileScreen"
            screenOptions={{
                headerShown: false,
                cardStyle: GlobalStyles.AppBackground,
                gestureEnabled: true,
                transitionSpec: {
                    open: {
                        animation: "timing",
                        config: {
                            duration: 450,
                            easing: Easing.inOut(Easing.quad),
                        },
                    },
                    close: {
                        animation: "timing",
                        config: {
                            duration: 450,
                            easing: Easing.inOut(Easing.quad),
                        },
                    },
                },
            }}
        >
            <Stack.Screen name="ProfileScreen" component={ProfilePage} />
        </Stack.Navigator>
    );
};

export default Profile;
