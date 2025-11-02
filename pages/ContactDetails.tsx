import React, { useRef } from "react";
import { View } from "react-native";
import { useTheme, IconButton, TextInput } from "react-native-paper";
import * as LucideIcons from "lucide-react-native";
import { screenFlowModule, ScreenFlowModule } from "../helper/ScreenFlowModule";
import CustomText from "../assets/CustomText";
import GlobalStyles from "../style/GlobalStyles";
import { StackScreenProps } from "@react-navigation/stack";
import { RootStackParamList } from "../types/AppTypes";
import { useAppContext } from "../helper/AppContext";
import { useDataContext } from "../helper/DataContext";
import { dataHandlerModule } from "../helper/DataHandlerModule";
import GenericFormatter from "../helper/GenericFormatters";

type props = StackScreenProps<RootStackParamList, "ContactDetailsScreen">; //typing the navigation props

const ContactDetails = ({ route, navigation }: props) => {
    const theme = useTheme();
    const dataContext = useDataContext();
    const params = (dataContext.currentProfile == 'MyMembers') ? dataContext.myMemberEmployeeDetails[0] : dataContext.employeeDetails[0];
    const appContext = useAppContext();

    const EditData = async (dataObj: any) => {
        screenFlowModule.onNavigateToScreen("EditScreen", {
            screenName: "ContactDetails",
            editData: dataObj,
        });
    };

    //formats our address so that if we are missing parts, just clear it
    const addressFormatter = (addressType: string) => {
        let addressString = "";

        if (addressType == "home") {
            params.Street
                ? (addressString += params.Street + ", ")
                : (addressString += "");
            params.City
                ? (addressString += params.City + " ")
                : (addressString += "");
            params.State
                ? (addressString += params.State + " ")
                : (addressString += "");
            params.Zipcode
                ? (addressString += params.Zipcode + " ")
                : (addressString += "");
        } else if (addressType == "mailing") {
            params.ConameM
                ? (addressString += params.ConameM + ", ")
                : (addressString += "");
            params.StreetM
                ? (addressString += params.StreetM + ", ")
                : (addressString += "");
            params.AddresslineM
                ? (addressString += params.AddresslineM + " ")
                : (addressString += "");
            params.CityM
                ? (addressString += params.CityM + " ")
                : (addressString += "");
            params.StatekeyM
                ? (addressString += params.StatekeyM + " ")
                : (addressString += "");
            params.ZipcodeM
                ? (addressString += params.ZipcodeM + " ")
                : (addressString += "");
        }

        return addressString;
    };

    const setBusyDialog = (show: boolean) => {
        appContext.setShowBusyIndicator(show);
        appContext.setShowDialog(show);
    };

    const setErrorDialog = (msg: string) => {
        appContext.setShowBusyIndicator(false);
        appContext.setDialogMessage(msg);
        appContext.setShowDialog(true);
    };

    const getData = async (
        url: string,
        service: string,
        entity: string,
        callback: (data: any) => void
    ) => {
        const response = await dataHandlerModule.batchGet(url, service, entity);
        callback(response);
    };

    return (
        <View style={GlobalStyles.page}>
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginVertical: 20,
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
                    Contact Details
                </CustomText>
            </View>
            <View style={{ paddingHorizontal: 20 }}>
                <CustomText variant="bodyLargeBold">Phone Numbers</CustomText>
                <TextInput
                    style={{ marginTop: 20, ...GlobalStyles.disabledTextInput }}
                    editable={false}
                    mode="flat"
                    underlineColor="transparent"
                    label="Primary Mobile"
                    value={params.Telnr}
                    right={
                        <TextInput.Icon
                            icon={() => (
                                <LucideIcons.Pencil color={theme.colors.primary} size={20} />
                            )}
                            onPress={async () => {
                                setBusyDialog(true);
                                try {
                                    const pernr = params.Pernr;
                                    getData(
                                        `EmployeePhoneNumbers?$filter=Pernr%20eq%20%27${pernr}%27`,
                                        "Z_ESS_MSS_SRV",
                                        "EmployeePhoneNumbers",
                                        function (response) {
                                            const phoneNumbers = response.responseBody.d.results[0];
                                            EditData({ primarymobile: phoneNumbers });
                                            setBusyDialog(false);
                                        }
                                    );
                                } catch (error) {
                                    setErrorDialog("error with getting phone numbers");
                                }
                            }}
                        />
                    }
                />
                <TextInput
                    style={{ marginTop: 20, ...GlobalStyles.disabledTextInput }}
                    editable={false}
                    mode="flat"
                    underlineColor="transparent"
                    label="Home"
                    value={params.Zznum01}
                    right={
                        <TextInput.Icon
                            icon={() => (
                                <LucideIcons.Pencil color={theme.colors.primary} size={20} />
                            )}
                            onPress={async () => {
                                setBusyDialog(true);
                                try {
                                    const pernr = params.Pernr;
                                    getData(
                                        `EmployeePhoneNumbers?$filter=Pernr%20eq%20%27${pernr}%27`,
                                        "Z_ESS_MSS_SRV",
                                        "EmployeePhoneNumbers",
                                        function (response) {
                                            const phoneNumbers = response.responseBody.d.results[0];
                                            EditData({ home: phoneNumbers });
                                            setBusyDialog(false);
                                        }
                                    );
                                } catch (error) {
                                    setErrorDialog("error with getting phone numbers");
                                }
                            }}
                        />
                    }
                />
                <TextInput
                    style={{ marginTop: 20, ...GlobalStyles.disabledTextInput }}
                    editable={false}
                    mode="flat"
                    underlineColor="transparent"
                    label="Work"
                    value={params.Zznum02}
                    right={
                        <TextInput.Icon
                            icon={() => (
                                <LucideIcons.Pencil color={theme.colors.primary} size={20} />
                            )}
                            onPress={async () => {
                                setBusyDialog(true);
                                try {
                                    const pernr = params.Pernr;
                                    getData(
                                        `EmployeePhoneNumbers?$filter=Pernr%20eq%20%27${pernr}%27`,
                                        "Z_ESS_MSS_SRV",
                                        "EmployeePhoneNumbers",
                                        function (response) {
                                            const phoneNumbers = response.responseBody.d.results[0];
                                            EditData({ work: phoneNumbers });
                                            setBusyDialog(false);
                                        }
                                    );
                                } catch (error) {
                                    setErrorDialog("error with getting phone numbers");
                                }
                            }}
                        />
                    }
                />
            </View>
            <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
                <CustomText variant="bodyLargeBold">Email</CustomText>
                <TextInput
                    style={{ marginTop: 20, ...GlobalStyles.disabledTextInput }}
                    editable={false}
                    mode="flat"
                    underlineColor="transparent"
                    label="Email"
                    value={params.Email}
                    right={
                        <TextInput.Icon
                            icon={() => (
                                <LucideIcons.Pencil color={theme.colors.primary} size={20} />
                            )}
                            onPress={async () => {
                                setBusyDialog(true);
                                try {
                                    const pernr = params.Pernr;
                                    getData(
                                        `EmployeeEmails?$filter=Pernr%20eq%20%27${pernr}%27`,
                                        "Z_ESS_MSS_SRV",
                                        "EmployeeEmails",
                                        function (response) {
                                            const emails = response.responseBody.d.results;
                                            //look for subty 9040
                                            const email = response.responseBody.d.results.filter(
                                                (x: any) => x.Subty === "9040"
                                            )[0];
                                            EditData({ email: email });
                                            setBusyDialog(false);
                                        }
                                    );
                                } catch (error) {
                                    setErrorDialog("error with getting phone numbers");
                                }
                            }}
                        />
                    }
                />
            </View>
            <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
                <CustomText variant="bodyLargeBold">Addresses</CustomText>
                <TextInput
                    style={{ marginTop: 20, ...GlobalStyles.disabledTextInput }}
                    editable={false}
                    mode="flat"
                    underlineColor="transparent"
                    label="Home Address"
                    value={addressFormatter("home")}
                />
                <TextInput
                    style={{ marginTop: 20, ...GlobalStyles.disabledTextInput }}
                    editable={false}
                    mode="flat"
                    underlineColor="transparent"
                    label="Mailing Address"
                    value={addressFormatter("mailing")}
                    right={
                        <TextInput.Icon
                            icon={() => (
                                <LucideIcons.Pencil color={theme.colors.primary} size={20} />
                            )}
                            onPress={async () => {
                                setBusyDialog(true);
                                try {
                                    const pernr = params.Pernr;
                                    getData(
                                        `EmployeeAddresses?$filter=Pernr%20eq%20%27${pernr}%27%20and%20Subty%20eq%20%275%27`,
                                        "Z_ESS_MSS_SRV",
                                        "EmployeeAddresses",
                                        function (response) {
                                            const genericFormatter = new GenericFormatter();
                                            let address =
                                                response.responseBody.d.results.length > 0
                                                    ? response.responseBody.d.results[0]
                                                    : {
                                                        "AddressType": "5",
                                                        "NewAddress": true,
                                                        "Addressline": "",
                                                        "Begda": genericFormatter.formatToEdmDate(new Date()),
                                                        "City": "",
                                                        "Coname": "",
                                                        "Countrykey": "",
                                                        "County": "",
                                                        "Endda": genericFormatter.formatToEdmDate(new Date()),
                                                        "Objps": "",
                                                        "Pernr": pernr,
                                                        "Seqnr": "",
                                                        "Sprps": "",
                                                        "State": "",
                                                        "Statekey": "",
                                                        "Street": "",
                                                        "Subty": "",
                                                        "Telnr": "",
                                                        "Zipcode": "",
                                                        "Zznum01": "",
                                                        "Zznum02": "",
                                                        "Zznum03": "",
                                                        "Zzindrl": ""
                                                    };
                                            EditData({ mailing_address: address });
                                            setBusyDialog(false);
                                        }
                                    );
                                } catch (error) {
                                    setErrorDialog("error with getting phone numbers");
                                }
                            }}
                        />
                    }
                />
            </View>
        </View>
    );
};

export default ContactDetails;
