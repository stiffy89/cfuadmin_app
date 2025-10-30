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
import { DateTime } from "luxon";

//screens
import MyDetails from "./MyDetails";
import ContactDetails from "./ContactDetails";
import EmergencyContacts from "./EmergencyContacts";
import MyUnit from "./MyUnit";
import TrainingHistory from "./TrainingHistory";
import TrainingDetails from "./TrainingDetails";
import MembershipDetails from "./MembershipDetails";
import UniformDetails from "./UniformDetails";
import MedalsAndAwards from "./MedalsAndAwards";

import { authModule } from "../helper/AuthModule";
import { OktaLoginResult } from "../types/AppTypes";
import { DummyData } from "../data/DummyData";

const ProfileHeader = () => {
    const { setCardModalVisible } = useAppContext();
    const theme = useTheme();
    const { employeeDetails, membershipDetails } = useDataContext();
    const employee = employeeDetails[0];
    const membership = membershipDetails[0];

    return (
        <View style={{ margin: 20 }}>
            <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
                <Button
                    onPress={() => {
                        authModule.onClearAllDevTokens();
                    }}
                >
                    Clear Tokens
                </Button>
                <Button
                    mode="outlined"
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
                {employee.Vorna} {employee.Nachn}
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
    const { setShowDialog, setShowBusyIndicator } = useAppContext();
    const dataContext = useDataContext();
    const appContext = useAppContext();

    const theme = useTheme();

    const onNavigateTopage = (PageName: any, passedData?: any) => {
        //show busy dialog and do a read
        const dummyData = new DummyData();
        let data: any | null = null;

        if (passedData) {
            data = passedData;
        }

        //get the data from the data handler module
        switch (PageName) {
            case "MyDetailsScreen":
                break;

            case "ContactDetailsScreen":
                data = dataContext.employeeDetails[0];
                break;

            case "EmergencyContactsScreen":
                data = [
                    ...dataContext.employeeAddresses,
                    ...dataContext.employeeDetails,
                ];
                break;

            case "MyUnitDetailsScreen":
                data = dummyData.getMyUnit();
                break;

            case "TrainingHistoryScreen":
                data = dummyData.getTrainingHistoryData();
                break;

            case "MembershipDetailsScreen":
                const membershipDetail = dummyData.getMembershipDetailsData();
                const objectsOnLoanDetail = dummyData.getObjectsOnLoanData();
                const medalsAndAwards = dummyData.getMedalsAndAwards();

                data = {
                    membershipDetail: membershipDetail,
                    objectsOnLoan: objectsOnLoanDetail,
                    medalsAndAwards: medalsAndAwards,
                };

                break;
        }

        screenFlowModule.onNavigateToScreen(PageName, data);

        //dataHandlerModule.get(xxxx);
    };

    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <ProfileHeader />
            <ScrollView
                style={{ flex: 1, backgroundColor: "#fff" }}
                contentContainerStyle={{ paddingBottom: 0 }}
            >
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
                                onNavigateTopage(
                                    "MyDetailsScreen",
                                    dataContext.employeeDetails[0]
                                );
                            }}
                            title={() => (
                                <CustomText variant="bodyLarge">My Details</CustomText>
                            )}
                            right={() => <LucideIcons.ChevronRight />}
                        />
                        <Divider />
                        <List.Item
                            style={{ height: 80, justifyContent: "center" }}
                            onPress={() => {
                                onNavigateTopage("ContactDetailsScreen");
                            }}
                            title={() => (
                                <CustomText variant="bodyLarge">Contact Details</CustomText>
                            )}
                            right={() => <LucideIcons.ChevronRight />}
                        />
                        <Divider />
                        <List.Item
                            style={{ height: 80, justifyContent: "center" }}
                            onPress={async () => {
                                appContext.setShowBusyIndicator(true);
                                appContext.setShowDialog(true);

                                try {
                                    const empAddResponse = await dataHandlerModule.batchGet(
                                        `EmployeeAddresses?$filter=Pernr%20eq%20%27${dataContext.employeeDetails[0].Pernr}%27%20and%20Subty%20eq%20%274%27`,
                                        "Z_ESS_MSS_SRV",
                                        "EmployeeAddresses"
                                    );
                                    if (empAddResponse.responseBody.d) {
                                        dataContext.setEmployeeAddresses(
                                            empAddResponse.responseBody.d.results
                                        );
                                    } 
                                    appContext.setShowBusyIndicator(false);
                                    appContext.setShowDialog(false);
                                    onNavigateTopage("EmergencyContactsScreen");
                                } catch (error){
                                    appContext.setShowBusyIndicator(false);
                                    appContext.setDialogMessage('An error occurred whilst getting employee addresses')
                                    console.log(error)
                                }
                            }}
                            title={() => (
                                <CustomText variant="bodyLarge">Emergency Contacts</CustomText>
                            )}
                            right={() => <LucideIcons.ChevronRight />}
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
                            onPress={() => {
                                onNavigateTopage("MembershipDetailsScreen");
                            }}
                            title={() => (
                                <CustomText variant="bodyLarge">Membership Details</CustomText>
                            )}
                            right={() => <LucideIcons.ChevronRight />}
                        />
                        <Divider />
                        <List.Item
                            style={{ height: 80, justifyContent: "center" }}
                            onPress={() => {
                                onNavigateTopage("TrainingHistoryScreen");
                            }}
                            title={() => (
                                <CustomText variant="bodyLarge">Training History</CustomText>
                            )}
                            right={() => <LucideIcons.ChevronRight />}
                        />
                        <Divider />
                        <List.Item
                            style={{ height: 80, justifyContent: "center" }}
                            onPress={() => {
                                onNavigateTopage("MyUnitDetailsScreen");
                            }}
                            title={() => <CustomText variant="bodyLarge">My Unit</CustomText>}
                            right={() => <LucideIcons.ChevronRight />}
                        />
                    </List.Section>
                </View>
            </ScrollView>
        </View>
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
            <Stack.Screen name="MyDetailsScreen" component={MyDetails} />
            <Stack.Screen name="ContactDetailsScreen" component={ContactDetails} />
            <Stack.Screen
                name="EmergencyContactsScreen"
                component={EmergencyContacts}
            />
            <Stack.Screen name="MyUnitDetailsScreen" component={MyUnit} />
            <Stack.Screen name="TrainingHistoryScreen" component={TrainingHistory} />
            <Stack.Screen name="TrainingDetailsScreen" component={TrainingDetails} />
            <Stack.Screen
                name="MembershipDetailsScreen"
                component={MembershipDetails}
            />
            <Stack.Screen name="UniformDetailsScreen" component={UniformDetails} />
            <Stack.Screen name="MedalsAndAwardsScreen" component={MedalsAndAwards} />
        </Stack.Navigator>
    );
};

export default Profile;
