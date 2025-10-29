import React, {useState} from "react";
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
import { DummyData } from "../data/DummyData";

import { screenFlowModule } from "../helper/ScreenFlowModule";
import {DateTime} from 'luxon';

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

const ProfileHeader = () => {
    const theme = useTheme();
    const { user } = useDataContext();
    const [name, setName] = useState('John Smith');
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
                        if (!dataHandlerModule.securityInstanceInitialised()) {
                            return;
                        }

                        const token = 'AFBWp5zVH-Cs-9RK0h7vy0ie7uqlFl3L1kOITGNcMTSz4Eyy';
                        const phoneData = new DummyData().getDummyMobile();
                        const batchBody = dataHandlerModule.batchBodyFormatter('MERGE', "EmployeePhoneNumbers(Endda=datetime'9999-12-31T00%3A00%3A00',Begda=datetime'2025-10-28T00%3A00%3A00',Pernr='00825004',Subty='1',Objps='',Sprps='',Seqnr='000')", phoneData);

                        const dataResponse = await dataHandlerModule.updateEntity('/Z_ESS_MSS_SRV/$batch', batchBody, token);


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
                {name}
            </CustomText>
            <CustomText
                variant="titleLarge"
                style={{ textAlign: "center", marginTop: 10 }}
            >
                {user.position}
            </CustomText>
            <CustomText
                variant="titleSmall"
                style={{ textAlign: "center", marginTop: 10 }}
            >
                {user.unitid}
            </CustomText>
        </View>
    );
};

const ProfilePage = () => {
    const { setShowDialog, setShowBusyIndicator } = useAppContext();
    const theme = useTheme();

    const onNavigateTopage = (PageName: any) => {
        //show busy dialog and do a read
        setShowBusyIndicator(true);
        setShowDialog(true);

        const dummyData = new DummyData();

        let data: any | null = null;

        //get the data from the data handler module
        switch (PageName) {
            case "MyDetailsScreen":
                data = dummyData.getMyDetailData();
                break;

            case "ContactDetailsScreen":
                data = dummyData.getContactDetails();
                break;

            case "EmergencyContactsScreen":
                data = dummyData.getEmergencyContacts();
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

        setTimeout(() => {
            setShowBusyIndicator(false);
            setShowDialog(false);

            //navigate to page
            screenFlowModule.onNavigateToScreen(PageName, data);
        }, 2000);

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
                            onPress={() => {
                                onNavigateTopage("MyDetailsScreen");
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
                            onPress={() => {
                                onNavigateTopage("EmergencyContactsScreen");
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
