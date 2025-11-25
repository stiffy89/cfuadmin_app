import React, { useState, useEffect } from "react";
import { View, ScrollView, KeyboardAvoidingView, Platform, Keyboard } from "react-native";
import * as LucideIcons from "lucide-react-native";
import {
    useTheme,
    IconButton,
    TextInput,
    Button,
    HelperText,
    Menu,
    Divider,
    List
} from "react-native-paper";
import CustomText from "../assets/CustomText";
import { StackScreenProps } from "@react-navigation/stack";
import { RootStackParamList } from "../types/AppTypes";
import { screenFlowModule, ScreenFlowModule } from "../helper/ScreenFlowModule";
import GlobalStyles from "../style/GlobalStyles";
import { useAppContext } from "../helper/AppContext";
import { dataHandlerModule } from "../helper/DataHandlerModule";
import { useDataContext } from "../helper/DataContext";
import { useHelperValuesDataContext } from "../helper/HelperValuesDataContext";
import GenericFormatter from "../helper/GenericFormatters";
import { DateTime } from "luxon";
import { registerTranslation, enGB, DatePickerModal } from 'react-native-paper-dates';

type props = StackScreenProps<RootStackParamList, "EditScreen">; //typing the navigation props

const MyDetailsEdit = (data: any) => {
    const appContext = useAppContext();
    const dataContext = useDataContext();

    const theme = useTheme();
    let originalData = data.data;

    const [preferredName, setPreferredName] = useState<any>(originalData.Rufnm);
    const [hasError, setHasError] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<string>("");

    return (
        <View style={{ paddingHorizontal: 20, flex: 1 }}>
            <CustomText style={{ marginBottom: 20 }} variant="titleLargeBold">
                Personal Details Edit
            </CustomText>
            <TextInput
                label="Preferred Name"
                mode="outlined"
                activeOutlineColor={theme.colors.onSecondaryContainer}
                value={preferredName}
                onChangeText={(text) => {
                    setPreferredName(text);
                }}
            />
            {hasError && <HelperText type="error">{errorMsg}</HelperText>}
            <View style={{ flex: 1 }}></View>
            <Button
                style={{
                    backgroundColor: theme.colors.primary,
                    ...GlobalStyles.floatingButtonBottom,
                }}
                mode="elevated"
                textColor={theme.colors.background}
                onPress={async () => {
                    //check to see if keyboard is open, if it is, close it
                    const keyboardIsVisible = Keyboard.isVisible();
                    if (keyboardIsVisible) {
                        Keyboard.dismiss();
                    }

                    //check to see if we have an value
                    if (preferredName === "") {
                        setErrorMsg(
                            "Please input a preferred name before attempting to save"
                        );
                        setHasError(true);
                    } else {
                        originalData.Rufnm = preferredName;
                        appContext.setShowBusyIndicator(true);
                        appContext.setShowDialog(true);

                        try {
                            const uriParts =
                                originalData.__metadata.uri.split("Z_ESS_MSS_SRV");
                            const uriPath = uriParts[1].substring(1);
                            const response = await dataHandlerModule.batchSingleUpdate(
                                uriPath,
                                "Z_ESS_MSS_SRV",
                                originalData
                            );

                            if (!response.responseBody) {
                                //update success, do a read of and update the info
                                const pernr = originalData.Pernr;
                                const plans = (dataContext.currentProfile == 'MyMembers') ? dataContext.myMembersMembershipDetails[0].Zzplans : dataContext.membershipDetails[0].Zzplans;

                                const employeeDetails = await dataHandlerModule.batchGet(
                                    `EmployeeDetails?$filter=Pernr%20eq%20%27${pernr}%27%20and%20Zzplans%20eq%20%27${plans}%27`,
                                    "Z_ESS_MSS_SRV",
                                    "EmployeeDetails"
                                );

                                if (dataContext.currentProfile == 'MyMembers') {
                                    dataContext.setMyMemberEmployeeDetails(
                                        employeeDetails.responseBody.d.results
                                    );
                                }
                                else {
                                    dataContext.setEmployeeDetails(
                                        employeeDetails.responseBody.d.results
                                    );
                                }

                                screenFlowModule.onGoBack();
                                appContext.setShowBusyIndicator(false);
                                appContext.setShowDialog(false);
                            } else if (response.responseBody.error) {
                                appContext.setShowBusyIndicator(false);
                                appContext.setDialogMessage(
                                    response.responseBody.error.message.value
                                );
                            }
                        } catch (error) {
                            appContext.setShowDialog(false);
                            screenFlowModule.onNavigateToScreen('ErrorPage', error);
                        }

                        setErrorMsg("");
                        setHasError(false);
                    }
                }}
            >
                Save
            </Button>
        </View>
    );
};

const ContactDetailsEdit = (data: any) => {
    const theme = useTheme();
    const dataObj = data.data;
    const appContext = useAppContext();
    const dataContext = useDataContext();
    const helperDataContext = useHelperValuesDataContext();

    const key = Object.keys(dataObj)[0];
    let originalData = dataObj[key];

    type ContactDetailsEdit = {
        primarymobile: string;
        home: string;
        work: string;
        email: string;
        mail_careof: string;
        mail_street: string;
        mail_suburb: string;
        mail_state: string;
        mail_postcode: string;
    };

    const [contactDetails, setContactDetails] = useState<ContactDetailsEdit>({
        primarymobile: key == "primarymobile" ? dataObj[key]["Telnr"] : "", //<-- if it matches what we passed, use that otherwise just start with blanks
        home: key == "home" ? dataObj[key]["Zznum01"] : "",
        work: key == "work" ? dataObj[key]["Zznum02"] : "",
        email: key == "email" ? dataObj[key]["UsridLong"] : "",
        mail_careof: key == "mailing_address" ? dataObj[key]["Coname"] : "",
        mail_street: key == "mailing_address" ? dataObj[key]["Street"] : "",
        mail_suburb: key == "mailing_address" ? dataObj[key]["City"] : "",
        mail_state: key == "mailing_address" ? dataObj[key]["Statekey"] : "",
        mail_postcode: key == "mailing_address" ? dataObj[key]["Zipcode"] : "",
    });

    const [hasError, setHasError] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<string>("");
    const [showDropDown, setShowDropDown] = useState(false);

    function saveData() {
        async function updateData(
            uriPath: string,
            service: string,
            data: any,
            callback: () => void
        ) {
            appContext.setShowBusyIndicator(true);
            appContext.setShowDialog(true);
            try {
                const response = await dataHandlerModule.batchSingleUpdate(
                    uriPath,
                    service,
                    data
                );

                if (!response.responseBody) {
                    callback();
                } else if (response.responseBody.error) {
                    appContext.setShowBusyIndicator(false);
                    appContext.setDialogMessage(
                        response.responseBody.error.message.value
                    );
                }
            } catch (error) {
                console.log(error);
            }
        }

        if (["primarymobile", "home", "work"].includes(key)) {
            const showError = () => {
                setHasError(true);
                setErrorMsg("Please input a phone number before saving");
            };

            if (key == "primarymobile" && contactDetails.primarymobile == "") {
                showError();
                return;
            }

            if (key == "home" && contactDetails.home == "") {
                showError();
                return;
            }

            if (key == "work" && contactDetails.work == "") {
                showError();
                return;
            }

            setHasError(false);
            setErrorMsg("");

            const uriParts = originalData.__metadata.uri.split("Z_ESS_MSS_SRV");
            const uriPath = uriParts[1].substring(1);
            switch (key) {
                case "primarymobile":
                    originalData.Telnr = contactDetails.primarymobile;
                    break;

                case "home":
                    originalData.Zznum01 = contactDetails.home;
                    break;

                case "work":
                    originalData.Zznum02 = contactDetails.work;
                    break;
            }

            originalData.Zzcom01 = "HOME";
            originalData.Zzcom02 = "WORK";

            updateData(uriPath, "Z_ESS_MSS_SRV", originalData, async () => {

                const pernr = originalData.Pernr;
                const plans = (dataContext.currentProfile == 'MyMembers') ? dataContext.myMembersMembershipDetails[0].Zzplans : dataContext.membershipDetails[0].Zzplans;

                const employeeDetails = await dataHandlerModule.batchGet(
                    `EmployeeDetails?$filter=Pernr%20eq%20%27${pernr}%27%20and%20Zzplans%20eq%20%27${plans}%27`,
                    "Z_ESS_MSS_SRV",
                    "EmployeeDetails"
                );

                if (dataContext.currentProfile == 'MyMembers') {
                    dataContext.setMyMemberEmployeeDetails(
                        employeeDetails.responseBody.d.results
                    );
                }
                else {
                    dataContext.setEmployeeDetails(
                        employeeDetails.responseBody.d.results
                    );
                }

                screenFlowModule.onGoBack();
                appContext.setShowBusyIndicator(false);
                appContext.setShowDialog(false);
            });
        }

        //email
        if (key == "email") {
            if (
                contactDetails.email == "" ||
                !contactDetails.email.includes("@") ||
                !contactDetails.email.includes(".")
            ) {
                setHasError(true);
                setErrorMsg("Please input a valid email before saving");
                return;
            }

            originalData.UsridLong = contactDetails.email;
            const uriParts = originalData.__metadata.uri.split("Z_ESS_MSS_SRV");
            const uriPath = uriParts[1].substring(1);
            updateData(uriPath, "Z_ESS_MSS_SRV", originalData, async () => {

                const pernr = originalData.Pernr;
                const plans = (dataContext.currentProfile == 'MyMembers') ? dataContext.myMembersMembershipDetails[0].Zzplans : dataContext.membershipDetails[0].Zzplans;

                const employeeDetails = await dataHandlerModule.batchGet(
                    `EmployeeDetails?$filter=Pernr%20eq%20%27${pernr}%27%20and%20Zzplans%20eq%20%27${plans}%27`,
                    "Z_ESS_MSS_SRV",
                    "EmployeeDetails"
                );

                if (dataContext.currentProfile == 'MyMembers') {
                    dataContext.setMyMemberEmployeeDetails(
                        employeeDetails.responseBody.d.results
                    );
                }
                else {
                    dataContext.setEmployeeDetails(
                        employeeDetails.responseBody.d.results
                    );
                }

                screenFlowModule.onGoBack();
                appContext.setShowBusyIndicator(false);
                appContext.setShowDialog(false);
            });
        }

        //mailing
        if (key == "mailing_address") {
            if (
                contactDetails.mail_street == "" ||
                contactDetails.mail_suburb == "" ||
                contactDetails.mail_state == "" ||
                contactDetails.mail_postcode == ""
            ) {
                appContext.setDialogMessage(
                    "Please input a value into all the mandatory fields before saving"
                );
                appContext.setShowDialog(true);
                return;
            }

            appContext.setShowDialog(false);

            originalData.Coname = contactDetails.mail_careof;
            originalData.Street = contactDetails.mail_street;
            originalData.City = contactDetails.mail_suburb;
            originalData.Statekey = contactDetails.mail_state;
            originalData.Zipcode = contactDetails.mail_postcode;

            const genericFormatter = new GenericFormatter();
            const begdaAbapDate = genericFormatter.convertEdmToAbapDateTime(
                originalData.Begda
            );
            const enddaAbapDate = genericFormatter.convertEdmToAbapDateTime(
                originalData.Endda
            );

            let urlPath = "";

            if (originalData.NewAddress) {
                //build the path
                urlPath +=
                    "EmployeeAddresses(Pernr='" +
                    originalData.Pernr +
                    "',Subty='',Objps='',Sprps='',Seqnr='',Endda=" +
                    enddaAbapDate +
                    ",Begda=" +
                    begdaAbapDate +
                    ")";
            } else {
                const uriParts = originalData.__metadata.uri.split("Z_ESS_MSS_SRV");
                urlPath = uriParts[1].substring(1);
            }

            updateData(urlPath, "Z_ESS_MSS_SRV", originalData, async () => {

                const pernr = originalData.Pernr;
                const plans = (dataContext.currentProfile == 'MyMembers') ? dataContext.myMembersMembershipDetails[0].Zzplans : dataContext.membershipDetails[0].Zzplans;

                const employeeDetails = await dataHandlerModule.batchGet(
                    `EmployeeDetails?$filter=Pernr%20eq%20%27${pernr}%27%20and%20Zzplans%20eq%20%27${plans}%27`,
                    "Z_ESS_MSS_SRV",
                    "EmployeeDetails"
                );

                if (dataContext.currentProfile == 'MyMembers') {
                    dataContext.setMyMemberEmployeeDetails(
                        employeeDetails.responseBody.d.results
                    );
                }
                else {
                    dataContext.setEmployeeDetails(
                        employeeDetails.responseBody.d.results
                    );
                }

                screenFlowModule.onGoBack();
                appContext.setShowBusyIndicator(false);
                appContext.setShowDialog(false);
            });
        }
    }

    function deleteMailingAddress() {
        //show dialog
        appContext.setDialogMessage('Are you sure you want to delete this mailing address?');
        appContext.setShowDialog(true);
        appContext.setShowDialogCancelButton(true);
        appContext.setDialogActionButtonText('Delete');
        appContext.setDialogActionFunction(async () => {
            //change the dialog
            appContext.setShowBusyIndicator(true);
            appContext.setShowDialogCancelButton(false);
            appContext.setDialogActionButtonText('OK');

            const uriParts = originalData.__metadata.uri.split("Z_ESS_MSS_SRV");
            const urlPath = uriParts[1].substring(1);
            try {
                const response = await dataHandlerModule.batchSingleDelete(
                    urlPath,
                    "Z_ESS_MSS_SRV"
                );

                if (!response.responseBody) {

                    const pernr = originalData.Pernr;
                    const plans = (dataContext.currentProfile == 'MyMembers') ? dataContext.myMembersMembershipDetails[0].Zzplans : dataContext.membershipDetails[0].Zzplans;

                    const employeeDetails = await dataHandlerModule.batchGet(
                        `EmployeeDetails?$filter=Pernr%20eq%20%27${pernr}%27%20and%20Zzplans%20eq%20%27${plans}%27`,
                        "Z_ESS_MSS_SRV",
                        "EmployeeDetails"
                    );

                    if (dataContext.currentProfile == 'MyMembers') {
                        dataContext.setMyMemberEmployeeDetails(
                            employeeDetails.responseBody.d.results
                        );
                    }
                    else {
                        dataContext.setEmployeeDetails(
                            employeeDetails.responseBody.d.results
                        );
                    }

                    screenFlowModule.onGoBack();
                    appContext.setShowBusyIndicator(false);
                    appContext.setShowDialog(false);
                    appContext.setDialogActionFunction(undefined);
                } else if (response.responseBody.error) {
                    appContext.setShowBusyIndicator(false);
                    appContext.setDialogMessage(
                        response.responseBody.error.message.value
                    );
                }
            } catch (error) {
                console.log(error);
            }
        })
    }

    return (
        <ScrollView contentContainerStyle={{ flex: (key == "mailing_address") ? 0 : 1 }} style={{ paddingHorizontal: 20 }}>
            <CustomText style={{ marginBottom: 20 }} variant="titleLargeBold">
                Contact Details Edit
            </CustomText>
            {key == "primarymobile" && (
                <View style={{ flex: 1 }}>
                    <TextInput
                        label="Primary Mobile"
                        mode="outlined"
                        activeOutlineColor={theme.colors.onSecondaryContainer}
                        value={contactDetails.primarymobile}
                        onChangeText={(text) => {
                            setContactDetails({
                                ...contactDetails,
                                primarymobile: text,
                            });
                        }}
                    />
                    {hasError && <HelperText type="error">{errorMsg}</HelperText>}
                </View>
            )}
            {key == "home" && (
                <View style={{ flex: 1 }}>
                    <TextInput
                        label="Home Phone"
                        mode="outlined"
                        activeOutlineColor={theme.colors.onSecondaryContainer}
                        value={contactDetails.home}
                        onChangeText={(text) => {
                            setContactDetails({
                                ...contactDetails,
                                home: text,
                            });
                        }}
                    />
                    {hasError && <HelperText type="error">{errorMsg}</HelperText>}
                </View>
            )}
            {key == "work" && (
                <View style={{ flex: 1 }}>
                    <TextInput
                        label="Work Phone"
                        mode="outlined"
                        activeOutlineColor={theme.colors.onSecondaryContainer}
                        value={contactDetails.work}
                        onChangeText={(text) => {
                            setContactDetails({
                                ...contactDetails,
                                work: text,
                            });
                        }}
                    />
                    {hasError && <HelperText type="error">{errorMsg}</HelperText>}
                </View>
            )}
            {key == "email" && (
                <View style={{ flex: 1 }}>
                    <TextInput
                        label="Email"
                        mode="outlined"
                        activeOutlineColor={theme.colors.onSecondaryContainer}
                        value={contactDetails.email}
                        onChangeText={(text) => {
                            setContactDetails({
                                ...contactDetails,
                                email: text,
                            });
                        }}
                    />
                    {hasError && <HelperText type="error">{errorMsg}</HelperText>}
                </View>
            )}
            {key == "mailing_address" && (
                <View style={{ marginBottom: 150 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
                        <CustomText variant="titleSmallBold">
                            Mailing Address
                        </CustomText>
                        {
                            originalData.__metadata &&
                            <IconButton
                                icon={() => <LucideIcons.Trash2 />}
                                mode='contained-tonal'
                                onPress={() => {
                                    deleteMailingAddress();
                                }}
                            />
                        }
                    </View>
                    <TextInput
                        label="Care of"
                        mode="outlined"
                        activeOutlineColor={theme.colors.onSecondaryContainer}
                        style={{ marginBottom: 20 }}
                        value={contactDetails.mail_careof}
                        onChangeText={(text) => {
                            setContactDetails({
                                ...contactDetails,
                                mail_careof: text,
                            });
                        }}
                    />
                    <TextInput
                        label="Street *"
                        mode="outlined"
                        activeOutlineColor={theme.colors.onSecondaryContainer}
                        style={{ marginBottom: 20 }}
                        value={contactDetails.mail_street}
                        onChangeText={(text) => {
                            setContactDetails({
                                ...contactDetails,
                                mail_street: text,
                            });
                        }}
                    />
                    <TextInput
                        label="Suburb *"
                        mode="outlined"
                        activeOutlineColor={theme.colors.onSecondaryContainer}
                        style={{ marginBottom: 20 }}
                        value={contactDetails.mail_suburb}
                        onChangeText={(text) => {
                            setContactDetails({
                                ...contactDetails,
                                mail_suburb: text,
                            });
                        }}
                    />
                    <View>
                        <TextInput
                            style={{ ...GlobalStyles.disabledTextInput }}
                            mode='outlined'
                            value={contactDetails.mail_state}
                            editable={false}
                            label="State *"
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
                            <ScrollView style={{ height: 300, backgroundColor: theme.colors.onSecondary, position: 'absolute', width: '100%', top: 55, zIndex: 100, borderColor: 'rgba(99, 99, 99, 1)', borderWidth: 1 }}>
                                <List.Section>
                                    {helperDataContext.addressStates.map((x, i) => {
                                        return (
                                            <React.Fragment key={'Fragment_' + i}>
                                                <List.Item
                                                    key={i}
                                                    title={`${x.Bland}`}
                                                    style={{
                                                        backgroundColor: (x.Bland === contactDetails.mail_state) ? theme.colors.surfaceVariant : theme.colors.onPrimary
                                                    }}
                                                    onPress={() => {
                                                        setContactDetails({
                                                            ...contactDetails,
                                                            mail_state: x.Bland,
                                                        });
                                                        setShowDropDown(!showDropDown);
                                                    }}
                                                />
                                                <Divider key={'divider' + i} />
                                            </React.Fragment>
                                        )
                                    })}
                                </List.Section>
                            </ScrollView>
                        }
                    </View>
                    <TextInput
                        style={{ marginTop: 20 }}
                        label="Postcode *"
                        mode="outlined"
                        activeOutlineColor={theme.colors.onSecondaryContainer}
                        value={contactDetails.mail_postcode}
                        onChangeText={(text) => {
                            setContactDetails({
                                ...contactDetails,
                                mail_postcode: text,
                            });
                        }}
                    />
                </View>
            )}
            <Button
                style={{
                    backgroundColor: theme.colors.primary,
                    ...GlobalStyles.floatingButtonBottom,
                    marginTop: 20
                }}
                mode="elevated"
                textColor={theme.colors.background}
                onPress={() => {
                    //check to see if keyboard is open, if it is, close it
                    const keyboardIsVisible = Keyboard.isVisible();
                    if (keyboardIsVisible) {
                        Keyboard.dismiss();
                    }

                    saveData();
                }}
            >
                Save
            </Button>
        </ScrollView>
    );
};

const EmergencyContactsEdit = (data: any) => {
    const theme = useTheme();
    const dataObj = data.data;
    const dataContext = useDataContext();
    const helperDataContext = useHelperValuesDataContext();
    const appContext = useAppContext();
    const [emergencyContact, setEmergencyContact] = useState(dataObj);
    const [showRelatDropDown, setShowRelatDropDown] = useState(false);
    const [showStateDropDown, setShowStateDropDown] = useState(false);

    function saveData() {
        async function updateData(
            uriPath: string,
            service: string,
            data: any,
            callback: () => void
        ) {
            appContext.setShowBusyIndicator(true);
            appContext.setShowDialog(true);
            try {
                const response = await dataHandlerModule.batchSingleUpdate(
                    uriPath,
                    service,
                    data
                );

                if (!response.responseBody) {
                    callback();
                } else if (response.responseBody.error) {
                    appContext.setShowBusyIndicator(false);
                    appContext.setDialogMessage(
                        response.responseBody.error.message.value
                    );
                }
            } catch (error) {
                console.log(error);
            }
        }

        if (
            emergencyContact.Zzindrl == "" ||
            emergencyContact.Coname == "" ||
            emergencyContact.Telnr == ""
        ) {
            appContext.setDialogMessage(
                "Please input a value into all the mandatory fields before saving"
            );
            appContext.setShowDialog(true);
            return;
        }

        appContext.setShowDialog(false);

        const genericFormatter = new GenericFormatter();
        const begdaAbapDate = genericFormatter.convertEdmToAbapDateTime(
            emergencyContact.Begda
        );
        const enddaAbapDate = genericFormatter.convertEdmToAbapDateTime(
            emergencyContact.Endda
        );

        let urlPath = "";

        if (emergencyContact.NewAddress) {
            //build the path
            urlPath +=
                "EmployeeAddresses(Pernr='" +
                emergencyContact.Pernr +
                "',Subty='',Objps='',Sprps='',Seqnr='',Endda=" +
                enddaAbapDate +
                ",Begda=" +
                begdaAbapDate +
                ")";
        } else {
            const uriParts = emergencyContact.__metadata.uri.split("Z_ESS_MSS_SRV");
            urlPath = uriParts[1].substring(1);
        }

        updateData(urlPath, "Z_ESS_MSS_SRV", emergencyContact, async () => {

            const pernr = emergencyContact.Pernr;

            const employeeDetails = await dataHandlerModule.batchGet(
                `EmployeeAddresses?$filter=Pernr%20eq%20%27${pernr}%27%20and%20Subty%20eq%20%274%27`,
                "Z_ESS_MSS_SRV",
                "EmployeeAddresses"
            );

            dataContext.setEmployeeAddresses(employeeDetails.responseBody.d.results);

            screenFlowModule.onGoBack();
            appContext.setShowBusyIndicator(false);
            appContext.setShowDialog(false);
        });
    }

    function deleteContact() {
        //show dialog
        appContext.setDialogMessage('Are you sure you want to delete this contact?');
        appContext.setShowDialog(true);
        appContext.setShowDialogCancelButton(true);
        appContext.setDialogActionButtonText('Delete');
        appContext.setDialogActionFunction(async () => {
            //change the dialog
            appContext.setShowBusyIndicator(true);
            appContext.setShowDialogCancelButton(false);
            appContext.setDialogActionButtonText('OK');

            const uriParts = emergencyContact.__metadata.uri.split("Z_ESS_MSS_SRV");
            const urlPath = uriParts[1].substring(1);
            try {
                const response = await dataHandlerModule.batchSingleDelete(
                    urlPath,
                    "Z_ESS_MSS_SRV"
                );

                if (!response.responseBody) {
                    const employeeDetails = await dataHandlerModule.batchGet(
                        "EmployeeAddresses",
                        "Z_ESS_MSS_SRV",
                        "EmployeeAddresses"
                    );
                    dataContext.setEmployeeAddresses(employeeDetails.responseBody.d.results);
                    screenFlowModule.onGoBack();
                    appContext.setShowBusyIndicator(false);
                    appContext.setShowDialog(false);
                    appContext.setDialogActionFunction(undefined);
                } else if (response.responseBody.error) {
                    appContext.setShowBusyIndicator(false);
                    appContext.setDialogMessage(
                        response.responseBody.error.message.value
                    );
                }
            } catch (error) {
                console.log(error);
            }
        })
    }


    return (

        <View style={{ paddingHorizontal: 20, flex: 1 }}>
            <View
                style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}
            >
                <CustomText variant="titleLargeBold">
                    Emergency Contacts Edit
                </CustomText>
                {
                    emergencyContact.__metadata &&
                    <IconButton
                        icon={() => <LucideIcons.Trash2 />}
                        mode='contained-tonal'
                        onPress={() => {
                            deleteContact();
                        }}
                    />
                }
            </View>
            <ScrollView
                contentContainerStyle={{
                    paddingBottom: 50
                }}
            >
                <TextInput
                    label="Name *"
                    mode="outlined"
                    activeOutlineColor={theme.colors.onSecondaryContainer}
                    style={{ marginBottom: 20 }}
                    value={emergencyContact.Coname}
                    onChangeText={(text) => {
                        setEmergencyContact({
                            ...emergencyContact,
                            Coname: text,
                        });
                    }}
                />
                <View>
                    <TextInput
                        style={{ ...GlobalStyles.disabledTextInput, marginBottom: 20 }}
                        mode='outlined'
                        value={emergencyContact.ZzindrlAtext}
                        editable={false}
                        label="Relationship *"
                        right={
                            <TextInput.Icon
                                icon={() => {
                                    return <LucideIcons.ChevronDown />
                                }}
                                onPress={() => {
                                    setShowRelatDropDown(!showRelatDropDown);
                                }}
                            />
                        }
                    />
                    {(showRelatDropDown) &&
                        <ScrollView style={{ backgroundColor: theme.colors.onSecondary, position: 'absolute', width: '100%', top: 55, zIndex: 100, borderColor: 'rgba(99, 99, 99, 1)', borderWidth: 1 }}>
                            <List.Section>
                                {helperDataContext.addressRelationships.map((x, i) => {
                                    return (
                                        <React.Fragment key={'Fragment_' + i}>
                                            <List.Item
                                                key={i}
                                                title={`${x.Atext}`}
                                                style={{
                                                    backgroundColor: (x.Atext === emergencyContact.ZzindrlAtext) ? theme.colors.surfaceVariant : theme.colors.onPrimary
                                                }}
                                                onPress={() => {
                                                    setEmergencyContact({
                                                        ...emergencyContact,
                                                        ZzindrlAtext: x.Atext,
                                                        Zzindrl: x.Zzindrl,
                                                    });
                                                    setShowRelatDropDown(!showRelatDropDown);
                                                }}
                                            />
                                            <Divider key={'divider' + i} />
                                        </React.Fragment>
                                    )
                                })}
                            </List.Section>
                        </ScrollView>
                    }
                </View>
                <TextInput
                    label="Mobile *"
                    mode="outlined"
                    activeOutlineColor={theme.colors.onSecondaryContainer}
                    style={{ marginBottom: 20 }}
                    value={emergencyContact.Telnr}
                    onChangeText={(text) => {
                        setEmergencyContact({
                            ...emergencyContact,
                            Telnr: text,
                        });
                    }}
                />
                <TextInput
                    label="Street"
                    mode="outlined"
                    activeOutlineColor={theme.colors.onSecondaryContainer}
                    style={{ marginBottom: 20 }}
                    value={emergencyContact.Street}
                    onChangeText={(text) => {
                        setEmergencyContact({
                            ...emergencyContact,
                            Street: text,
                        });
                    }}
                />
                <TextInput
                    label="Suburb"
                    mode="outlined"
                    activeOutlineColor={theme.colors.onSecondaryContainer}
                    style={{ marginBottom: 20 }}
                    value={emergencyContact.City}
                    onChangeText={(text) => {
                        setEmergencyContact({
                            ...emergencyContact,
                            City: text,
                        });
                    }}
                />
                <View>
                    <TextInput
                        style={{ ...GlobalStyles.disabledTextInput, marginBottom: 20 }}
                        mode='outlined'
                        value={emergencyContact.Statekey}
                        editable={false}
                        label="State *"
                        right={
                            <TextInput.Icon
                                icon={() => {
                                    return <LucideIcons.ChevronDown />
                                }}
                                onPress={() => {
                                    setShowStateDropDown(!showStateDropDown);
                                }}
                            />
                        }
                    />
                    {(showStateDropDown) &&
                        <ScrollView style={{ height: 150, backgroundColor: theme.colors.onSecondary, position: 'absolute', width: '100%', top: 55, zIndex: 100, borderColor: 'rgba(99, 99, 99, 1)', borderWidth: 1 }}>
                            <List.Section>
                                {helperDataContext.addressStates.map((x, i) => {
                                    return (
                                        <React.Fragment key={'Fragment_' + i}>
                                            <List.Item
                                                key={i}
                                                title={`${x.Bland}`}
                                                style={{
                                                    backgroundColor: (x.Bland === emergencyContact.Statekey) ? theme.colors.surfaceVariant : theme.colors.onPrimary
                                                }}
                                                onPress={() => {
                                                    setEmergencyContact({
                                                        ...emergencyContact,
                                                        Statekey: x.Bland,
                                                    });
                                                    setShowStateDropDown(!showStateDropDown);
                                                }}
                                            />
                                            <Divider key={'divider' + i} />
                                        </React.Fragment>
                                    )
                                })}
                            </List.Section>
                        </ScrollView>
                    }
                </View>
                <TextInput
                    label="Postcode"
                    mode="outlined"
                    activeOutlineColor={theme.colors.onSecondaryContainer}
                    style={{ marginBottom: 20 }}
                    value={emergencyContact.Zipcode}
                    onChangeText={(text) => {
                        setEmergencyContact({
                            ...emergencyContact,
                            Zipcode: text,
                        });
                    }}
                />
            </ScrollView>
            <Button
                style={{
                    backgroundColor: theme.colors.primary,
                    marginTop: 20
                }}
                mode="elevated"
                textColor={theme.colors.background}
                onPress={() => {
                    //check to see if keyboard is open, if it is, close it
                    const keyboardIsVisible = Keyboard.isVisible();
                    if (keyboardIsVisible) {
                        Keyboard.dismiss();
                    }

                    saveData();
                }}
            >
                Save
            </Button>
        </View>

    );
};

const UniformDetailsEdit = (data: any) => {
    registerTranslation('en-GB', enGB);
    const theme = useTheme();
    const dataObj = data.data;

    const dataContext = useDataContext();
    const appContext = useAppContext();
    const genericFormatter = new GenericFormatter();

    const today = new Date();
    const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const originalReturnDate = (data.ReturnDate === null) ? undefined : genericFormatter.formatFromEdmToJSDate(data.ReturnDate);

    const [returnDate, setReturnDate] = useState<Date | undefined>(originalReturnDate);
    const [showPicker, setShowPicker] = useState(false);

    async function saveData() {
        appContext.setShowBusyIndicator(true);
        appContext.setShowDialog(true);

        //convert DD/MM/YYYY to EDM Date
        if (!returnDate) {
            appContext.setShowBusyIndicator(false);
            appContext.setDialogMessage('Please select a return date before continuing');
            return;
        }

        const luxonDate = DateTime.fromJSDate(returnDate);

        if (!luxonDate.isValid) {
            appContext.setShowBusyIndicator(false);
            appContext.setShowDialog(true);
            appContext.setDialogMessage('Please input a valid date into the return date field')
        }

        const jsDate = luxonDate.toJSDate();
        const edmDate = genericFormatter.formatToEdmDate(jsDate);
        dataObj.ReturnDate = edmDate;

        try {
            const uriParts = dataObj.__metadata.uri.split("Z_ESS_MSS_SRV");
            const uriPath = uriParts[1].substring(1);
            const response = await dataHandlerModule.batchSingleUpdate(
                uriPath,
                "Z_ESS_MSS_SRV",
                dataObj
            );

            if (!response.responseBody) {
                //update success, do a read of and update the info
                const pernr = dataObj.Pernr;
                const plans = dataObj.Zzplans;

                const objectsOnLoan = await dataHandlerModule.batchGet(
                    `ObjectsOnLoan?$filter=Pernr%20eq%20%27${pernr}%27%20and%20Zzplans%20eq%20%27${plans}%27%20and%20Mss%20eq%20true`,
                    "Z_ESS_MSS_SRV",
                    "ObjectsOnLoan"
                );

                dataContext.setObjectsOnLoan(objectsOnLoan.responseBody.d.results);

                screenFlowModule.onGoBack();
                appContext.setShowBusyIndicator(false);
                appContext.setShowDialog(false);
            } else if (response.responseBody.error) {
                appContext.setShowBusyIndicator(false);
                appContext.setDialogMessage(
                    response.responseBody.error.message.value
                );
            }
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <View style={{ paddingHorizontal: 20, flex: 1 }}>
            <View
                style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}
            >
                <CustomText variant="titleLargeBold">
                    Uniform Details Edit
                </CustomText>
            </View>
            <ScrollView style={{ paddingBottom: 40 }}>
                <TextInput style={{ marginTop: 20, ...GlobalStyles.disabledTextInput }} editable={false} mode='flat' underlineColor='transparent' label='Object' value={dataObj.ObjectTypesStext} />
                <TextInput style={{ marginTop: 20, ...GlobalStyles.disabledTextInput }} editable={false} mode='flat' underlineColor='transparent' label='From' value={genericFormatter.formatFromEdmDate(dataObj.OriginalPskeyBegda)} />
                <TextInput style={{ marginTop: 20, ...GlobalStyles.disabledTextInput }} editable={false} mode='flat' underlineColor='transparent' label='Quantity' value={dataObj.Anzkl} />
                <TextInput style={{ marginTop: 20, ...GlobalStyles.disabledTextInput }} editable={false} mode='flat' underlineColor='transparent' label='Unit' value={dataObj.UnitsEtext} />
                <TextInput style={{ marginTop: 20, ...GlobalStyles.disabledTextInput }} editable={false} mode='flat' underlineColor='transparent' label='Reference No.' value={dataObj.Lobnr} />
                <TextInput style={{ marginTop: 20 }} editable={false} mode='flat' underlineColor='transparent' label='Return Date' value={genericFormatter.formatJSDateToFormat(returnDate)} right={<TextInput.Icon onPress={() => {
                    setShowPicker(!showPicker)
                }} icon={() => <LucideIcons.Calendar />} />} />
                <DatePickerModal
                    locale='en-GB'
                    date={returnDate}
                    visible={showPicker}
                    mode='single'
                    saveLabel="Select Date"
                    validRange={{
                        startDate: undefined,
                        endDate: endOfToday,
                        disabledDates: undefined
                    }}
                    onConfirm={(params) => {
                        if (params.date) {
                            setReturnDate(params.date)
                        }

                        setShowPicker(!showPicker)
                    }}
                    onDismiss={() => setShowPicker(!showPicker)}
                />
                <TextInput style={{ marginTop: 20, ...GlobalStyles.disabledTextInput }} editable={false} mode='flat' underlineColor='transparent' label='Comment 1' value={dataObj.Text1} />
                <TextInput style={{ marginTop: 20, ...GlobalStyles.disabledTextInput }} editable={false} mode='flat' underlineColor='transparent' label='Comment 2' value={dataObj.Text2} />
                <TextInput style={{ marginTop: 20, ...GlobalStyles.disabledTextInput }} editable={false} mode='flat' underlineColor='transparent' label='Comment 3' value={dataObj.Text3} />
                <Button
                    style={{
                        marginTop: 20,
                        backgroundColor: theme.colors.primary
                    }}
                    mode="elevated"
                    textColor={theme.colors.background}
                    onPress={() => {
                        if (returnDate == undefined) {
                            appContext.setShowDialog(true)
                            appContext.setDialogMessage('Please add a return date before continuing')
                            return;
                        }

                        //check to see if keyboard is open, if it is, close it
                        const keyboardIsVisible = Keyboard.isVisible();
                        if (keyboardIsVisible) {
                            Keyboard.dismiss();
                        }

                        saveData()
                    }}
                >
                    Save
                </Button>
            </ScrollView>
        </View>
    );
}

const VolunteerDetailsEdit = (data: any) => {
    const appContext = useAppContext();
    const dataContext = useDataContext();
    const genericFormatter = new GenericFormatter();

    const theme = useTheme();

    const [volunteerNotes, setVolunteerNotes] = useState<any>(data.data);

    const [hasError, setHasError] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<string>("");

    return (
        <View style={{ paddingHorizontal: 20, flex: 1 }}>
            <CustomText style={{ marginBottom: 20 }} variant="titleLargeBold">
                Volunteer Notes Edit
            </CustomText>
            <View style={{ flexGrow: 1, marginTop: 20 }}>
                <TextInput
                    multiline={true}
                    placeholder='Add a comment...'
                    value={volunteerNotes.Notes}
                    onChangeText={text => setVolunteerNotes({
                        ...volunteerNotes,
                        Notes: text
                    })}
                    style={{ flex: 1, paddingTop: 10 }}
                    mode='outlined'
                />
            </View>
            {hasError && <HelperText type="error">{errorMsg}</HelperText>}
            <View style={{ flex: 1 }}></View>
            <Button
                style={{
                    backgroundColor: theme.colors.primary,
                    ...GlobalStyles.floatingButtonBottom,
                }}
                mode="elevated"
                textColor={theme.colors.background}
                onPress={async () => {
                    //check to see if keyboard is open, if it is, close it
                    const keyboardIsVisible = Keyboard.isVisible();

                    if (keyboardIsVisible) {
                        Keyboard.dismiss();
                    }

                    //check to see if we have an value
                    if (volunteerNotes.Notes === "") {
                        setErrorMsg(
                            "Please fill in the text box before saving"
                        );
                        setHasError(true);
                    } else {
                        setErrorMsg("");
                        setHasError(false);
                        appContext.setShowBusyIndicator(true);
                        appContext.setShowDialog(true);

                        let uriPath = '';

                        if (volunteerNotes.NewNote) {
                            const abapBegda = genericFormatter.convertEdmToAbapDateTime(volunteerNotes.Begda);
                            uriPath = `VolunteerNotes(Pernr='${volunteerNotes.Pernr}',Subty='',Objps='',Sprps='',Seqnr='',Endda=datetime'9999-12-01T11%3A12%3A00',Begda=${abapBegda})`
                        }
                        else {
                            const uriParts = volunteerNotes.__metadata.uri.split("Z_ESS_MSS_SRV");
                            uriPath = uriParts[1].substring(1);
                        }

                        try {
                            const response = await dataHandlerModule.batchSingleUpdate(
                                uriPath,
                                "Z_ESS_MSS_SRV",
                                volunteerNotes
                            );

                            if (!response.responseBody) {
                                try {
                                    const volNotes = await dataHandlerModule.batchGet(`VolunteerNotes?$skip=0&$top=100&$filter=Pernr%20eq%20%27${volunteerNotes.Pernr}%27`, 'Z_ESS_MSS_SRV', 'VolunteerNotes');
                                    dataContext.setVolAdminMemberNotes(volNotes.responseBody.d.results);
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
                }}
            >
                Save
            </Button>
        </View>
    );
}

const VolunteerEdit = (data: any) => {
    const appContext = useAppContext();
    const dataContext = useDataContext();
    const helperDataContext = useHelperValuesDataContext();
    const genericFormatter = new GenericFormatter();

    const theme = useTheme();
    const membershipDetail = data.data;
    const [membershipData, setMembershipData] = useState<any>(membershipDetail);

    const [hasMemberTypeError, setHasMemberTypeError] = useState(false);
    const [errorMemberTypeMsg, setErrorMemberTypeMsg] = useState<string>("");

    const [hasMemberStatusError, setHasMemberStatusError] = useState(false);
    const [errorMemberStatusMsg, setErrorMemberStatusMsg] = useState<string>("");

    const [hasVolStatusError, setHasVolStatusError] = useState(false);
    const [errorVolStatusMsg, setErrorVolStatusMsg] = useState<string>("");

    function CloseOpenedDropDown() {
        if (showMembershipType) {
            setShowMembershipType(false);
        }

        if (showMembershipStatus) {
            setShowMembershipStatus(false);
        }

        if (showVolunteerStatus) {
            setShowVolunteerStatus(false);
        }
    }

    //membershiptype VH drop down
    const [showMembershipType, setShowMembershipType] = useState(false);
    const initialSelectedMembershipType = helperDataContext.membershipTypes.filter(x => x.Mtype === membershipDetail.Zzmemty)[0];
    const [selectedMembershipType, setSelectedMembershipType] = useState<any>(initialSelectedMembershipType);

    //memberstatus VH drop down
    const [showMembershipStatus, setShowMembershipStatus] = useState(false);
    const initialSelectedMembershipStatus = helperDataContext.membershipStatuses.filter(x => x.Statu === membershipDetail.Zzstatu)[0];
    const [selectedMembershipStatus, setSelectedMembershipStatus] = useState<any>(initialSelectedMembershipStatus);

    //volstatus VH drop down
    const [showVolunteerStatus, setShowVolunteerStatus] = useState(false);
    const initialSelectedVolunteerStatus = helperDataContext.volunteerStatuses.filter(x => x.Statu === membershipDetail.Zzvstat)[0];
    const [selectedVolunteerStatus, setSelectedVolunteerStatus] = useState<any>(initialSelectedVolunteerStatus);


    return (
        <ScrollView style={{ paddingHorizontal: 20, flex: 1 }}>
            <CustomText style={{ marginBottom: 20 }} variant="titleLargeBold">
                Membership Edit
            </CustomText>
            <TextInput style={{ marginTop: 20, ...GlobalStyles.disabledTextInput }} editable={false} mode='flat' underlineColor='transparent' label='Unit' value={membershipData.Otext} />
            <TextInput style={{ marginTop: 20, ...GlobalStyles.disabledTextInput }} editable={false} mode='flat' underlineColor='transparent' label='Location' value={membershipData.Stext} />
            <TextInput style={{ marginTop: 20, ...GlobalStyles.disabledTextInput }} editable={false} mode='flat' underlineColor='transparent' label='Start Date' value={genericFormatter.formatFromEdmDate(membershipData.StartDate)} />
            <TextInput style={{ marginTop: 20, ...GlobalStyles.disabledTextInput }} editable={false} mode='flat' underlineColor='transparent' label='Member Since' value={genericFormatter.formatFromEdmDate(membershipData.FromDate)} />
            <View>
                <TextInput
                    style={{ marginTop: 20, ...GlobalStyles.disabledTextInput }}
                    mode='flat'
                    value={membershipData.ZzmemtyDesc}
                    editable={false}
                    label='Member type'
                    right={
                        //this button is only accessible via vol admin
                        (dataContext.currentUser[0].VolAdmin) && (
                            <TextInput.Icon
                                icon={() => {
                                    return <LucideIcons.ChevronDown />
                                }}
                                onPress={() => {
                                    CloseOpenedDropDown();
                                    setShowMembershipType(!showMembershipType);
                                }}
                            />
                        )
                    }
                />
                {hasMemberTypeError && <HelperText type="error">{errorMemberTypeMsg}</HelperText>}
                {(showMembershipType) &&
                    <List.Section style={{ backgroundColor: theme.colors.onSecondary, position: 'absolute', width: '100%', top: 70, zIndex: 100, boxShadow: 'rgba(99, 99, 99, 0.2) 0px 2px 8px 0px' }}>
                        {helperDataContext.membershipTypes.map((x, i) => {
                            return (
                                <React.Fragment key={'Fragment_' + i}>
                                    <List.Item
                                        key={i}
                                        title={`${x.Stext}`}
                                        style={{
                                            backgroundColor: (x.Mtype === selectedMembershipType.Mtype) ? theme.colors.surfaceVariant : theme.colors.onPrimary
                                        }}
                                        onPress={async () => {
                                            setSelectedMembershipType(x);

                                            setMembershipData({
                                                ...membershipData,
                                                Zzmemty: x.Mtype,
                                                ZzmemtyDesc: x.Stext
                                            });

                                            setShowMembershipType(!showMembershipType);
                                        }}
                                    />
                                    <Divider key={'divider' + i} />
                                </React.Fragment>
                            )
                        })}
                    </List.Section>
                }
            </View>
            <View>
                <TextInput
                    style={{ marginTop: 20, ...GlobalStyles.disabledTextInput }}
                    mode='flat'
                    value={membershipData.ZzstatuDesc}
                    editable={false}
                    label='Status'
                    right={
                        //this button is only accessible via vol admin
                        (dataContext.currentUser[0].VolAdmin) && (
                            <TextInput.Icon
                                icon={() => {
                                    return <LucideIcons.ChevronDown />
                                }}
                                onPress={() => {
                                    CloseOpenedDropDown();
                                    setShowMembershipStatus(!showMembershipStatus);
                                }}
                            />
                        )
                    }
                />
                {hasMemberStatusError && <HelperText type="error">{errorMemberStatusMsg}</HelperText>}
                {(showMembershipStatus) &&
                    <List.Section style={{ backgroundColor: theme.colors.onSecondary, position: 'absolute', width: '100%', top: 70, zIndex: 100, boxShadow: 'rgba(99, 99, 99, 0.2) 0px 2px 8px 0px' }}>
                        {helperDataContext.membershipStatuses.map((x, i) => {
                            return (
                                <React.Fragment key={'Fragment_' + i}>
                                    <List.Item
                                        key={i}
                                        title={`${x.Stext}`}
                                        style={{
                                            backgroundColor: (x.Statu === selectedMembershipStatus.Statu) ? theme.colors.surfaceVariant : theme.colors.onPrimary
                                        }}
                                        onPress={async () => {
                                            setSelectedMembershipStatus(x);
                                            setMembershipData({
                                                ...membershipData,
                                                Zzstatu: x.Statu,
                                                ZzstatuDesc: x.Stext
                                            });

                                            setShowMembershipStatus(!showMembershipStatus);
                                        }}
                                    />
                                    <Divider key={'divider' + i} />
                                </React.Fragment>
                            )
                        })}
                    </List.Section>
                }
            </View>
            <View>
                <TextInput
                    style={{ marginTop: 20, ...GlobalStyles.disabledTextInput }}
                    mode='flat'
                    value={membershipData.ZzvstatDesc}
                    editable={false}
                    label='Volunteer Status'
                    right={
                        <TextInput.Icon
                            icon={() => {
                                return <LucideIcons.ChevronDown />
                            }}
                            onPress={() => {
                                CloseOpenedDropDown();
                                setShowVolunteerStatus(!showVolunteerStatus);
                            }}
                        />
                    }
                />
                {hasVolStatusError && <HelperText type="error">{errorVolStatusMsg}</HelperText>}
                {(showVolunteerStatus) &&
                    <List.Section style={{ backgroundColor: theme.colors.onSecondary, position: 'absolute', width: '100%', top: -450, zIndex: 100, boxShadow: 'rgba(99, 99, 99, 0.2) 0px 2px 8px 0px' }}>
                        {helperDataContext.volunteerStatuses.map((x, i) => {
                            return (
                                <React.Fragment key={'Fragment_' + i}>
                                    <List.Item
                                        key={i}
                                        title={`${x.Stext}`}
                                        style={{
                                            backgroundColor: (x.Statu === selectedVolunteerStatus.Statu) ? theme.colors.surfaceVariant : theme.colors.onPrimary
                                        }}
                                        onPress={async () => {
                                            setSelectedVolunteerStatus(x);
                                            setMembershipData({
                                                ...membershipData,
                                                Zzvstat: x.Statu,
                                                ZzvstatDesc: x.Stext
                                            });

                                            setShowVolunteerStatus(!showVolunteerStatus);
                                        }}
                                    />
                                    <Divider key={'divider' + i} />
                                </React.Fragment>
                            )
                        })}
                    </List.Section>
                }
            </View>
            <TextInput
                style={{ marginTop: 20, ...GlobalStyles.disabledTextInput }}
                mode='outlined'
                activeOutlineColor={theme.colors.onSecondaryContainer}
                underlineColor='transparent'
                label='Occupation'
                value={membershipData.Zzoccupation}
                onChangeText={(text) => {
                    setMembershipData({
                        ...membershipData,
                        Zzoccupation: text
                    })
                }}
            />
            <Button
                style={{
                    marginTop: 20,
                    backgroundColor: theme.colors.primary
                }}
                mode="elevated"
                textColor={theme.colors.background}
                onPress={async () => {
                    //check to see if keyboard is open, if it is, close it
                    const keyboardIsVisible = Keyboard.isVisible();

                    if (keyboardIsVisible) {
                        Keyboard.dismiss();
                    }

                    let bPassed = true;

                    //check to make sure all the values are filled in
                    if (!membershipData.Zzmemty) {
                        setHasMemberTypeError(true);
                        setErrorMemberTypeMsg('Please select a member type');
                        bPassed = false;
                    }

                    if (!membershipData.Zzstatu) {
                        setHasMemberStatusError(true);
                        setErrorMemberStatusMsg('Please select a member status');
                        bPassed = false;
                    }

                    if (!membershipData.Zzvstat) {
                        setHasVolStatusError(true);
                        setErrorVolStatusMsg('Please select a volunteer status');
                        bPassed = false;
                    }

                    if (!bPassed) {
                        return;
                    }

                    appContext.setShowBusyIndicator(true);
                    appContext.setShowDialog(true);

                    const uriParts = membershipData.__metadata.uri.split("Z_VOL_MEMBER_SRV");
                    let uriPath = uriParts[1].substring(1);

                    try {
                        const response = await dataHandlerModule.batchSingleUpdate(
                            uriPath,
                            "Z_VOL_MEMBER_SRV",
                            membershipData
                        );

                        if (!response.responseBody) {
                            try {
                                const updatedMembershipDetails = await dataHandlerModule.batchGet(`MembershipDetails?$filter=Pernr%20eq%20%27${membershipData.Pernr}%27%20and%20Zzplans%20eq%20%27${membershipData.Zzplans}%27`, 'Z_VOL_MEMBER_SRV', 'MembershipDetails');
                                dataContext.setMyMembersMembershipDetails(updatedMembershipDetails.responseBody.d.results);
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
                }}
            >
                Save
            </Button>
        </ScrollView>
    );
}

const EquityDiversity = (data: any) => {
    const theme = useTheme();
    const appContext = useAppContext();
    const dataContext = useDataContext();
    const helperDataContext = useHelperValuesDataContext();
    const [equityData, setEquityData] = useState(data.data[0]);

    //gender
    const [showGender, setShowGender] = useState(false);
    const initialSelectedGender = helperDataContext.equityGenderValues.filter(x => x.DomvalueL === equityData.Gesch)[0];
    const [selectedGender, setSelectedGender] = useState<any>(initialSelectedGender);

    //aboriginal
    const [showAboriginal, setShowAboriginal] = useState(false);
    const initialSelectedAboriginal = helperDataContext.equityAboriginalValues.filter(x => x.Edseq === equityData.Permi)[0];
    const [selectedAboriginal, setSelectedAboriginal] = useState<any>(initialSelectedAboriginal);

    //racial
    const [showRacial, setShowRacial] = useState(false);
    const initialSelectedRacial = helperDataContext.equityRacialEthnicReligiousValues.filter(x => x.Edseq === equityData.Movec)[0];
    const [selectedRacial, setSelectedRacial] = useState<any>(initialSelectedRacial);

    //first language
    const [showFirstLanguage, setShowFirstLanguage] = useState(false);
    const initialSelectedFirstLanguage = helperDataContext.equityFirstLanguageValues.filter(x => x.Edseq === equityData.Fslng)[0];
    const [selectedFirstLanguage, setSelectedFirstLanguage] = useState<any>(initialSelectedFirstLanguage);

    //NESL
    const [showNESL, setShowNESL] = useState(false);
    const initialNESL = helperDataContext.equityNESLValues.filter(x => x.Edseq === equityData.Mslng)[0];
    const [selectedNESL, setSelectedNESL] = useState<any>(initialNESL);

    //Disability
    const [showDisability, setShowDisability] = useState(false);
    const initialSelectedDisability = helperDataContext.equityDisabilityValues.filter(x => x.Edseq === equityData.Disap)[0];
    const [selectedDisability, setSelectedDisability] = useState<any>(initialSelectedDisability);

    function CloseOpenedDropDown() {
        if (showGender) {
            setShowGender(false);
        }

        if (showAboriginal) {
            setShowAboriginal(false);
        }

        if (showDisability) {
            setShowDisability(false);
        }

        if (showFirstLanguage) {
            setShowFirstLanguage(false);
        }

        if (showNESL) {
            setShowNESL(false);
        }

        if (showRacial) {
            setShowRacial(false);
        }
    }

    return (
        <ScrollView style={{ paddingHorizontal: 20, flex: 1 }}>
            <CustomText style={{ marginBottom: 20 }} variant="titleLargeBold">
                Equity Diversity Edit
            </CustomText>
            <View>
                <TextInput
                    style={{ marginTop: 20, ...GlobalStyles.disabledTextInput }}
                    mode='flat'
                    value={selectedNESL.Eddes}
                    editable={false}
                    label='Main non-english language spoken'
                    right={
                        <TextInput.Icon
                            icon={() => {
                                return <LucideIcons.ChevronDown />
                            }}
                            onPress={() => {
                                CloseOpenedDropDown();
                                setShowNESL(!showNESL);
                            }}
                        />
                    }
                />
                {(showNESL) &&
                    <ScrollView style={{ height: 550, backgroundColor: theme.colors.onSecondary, position: 'absolute', width: '100%', top: 70, zIndex: 100, boxShadow: 'rgba(99, 99, 99, 0.2) 0px 2px 8px 0px' }}>
                        <List.Section>
                            {helperDataContext.equityNESLValues.map((x, i) => {
                                return (
                                    <React.Fragment key={'Fragment_' + i}>
                                        <List.Item
                                            key={i}
                                            title={`${x.Eddes}`}
                                            style={{
                                                backgroundColor: (x.Edseq === selectedNESL.Edseq) ? theme.colors.surfaceVariant : theme.colors.onPrimary
                                            }}
                                            onPress={async () => {
                                                setSelectedNESL(x);
                                                setEquityData({
                                                    ...equityData,
                                                    Mslng: x.Edseq
                                                });

                                                setShowNESL(!showNESL);
                                            }}
                                        />
                                        <Divider key={'divider' + i} />
                                    </React.Fragment>
                                )
                            })}
                        </List.Section>
                    </ScrollView>
                }
            </View>
            <View>
                <TextInput
                    style={{ marginTop: 20, ...GlobalStyles.disabledTextInput }}
                    mode='flat'
                    value={selectedGender.Ddtext}
                    editable={false}
                    label='Gender for Equity and Diversity'
                    right={
                        <TextInput.Icon
                            icon={() => {
                                return <LucideIcons.ChevronDown />
                            }}
                            onPress={() => {
                                CloseOpenedDropDown();
                                setShowGender(!showGender);
                            }}
                        />
                    }
                />
                {(showGender) &&
                    <List.Section style={{ backgroundColor: theme.colors.onSecondary, position: 'absolute', width: '100%', top: 70, zIndex: 100, boxShadow: 'rgba(99, 99, 99, 0.2) 0px 2px 8px 0px' }}>
                        {helperDataContext.equityGenderValues.map((x, i) => {
                            return (
                                <React.Fragment key={'Fragment_' + i}>
                                    <List.Item
                                        key={i}
                                        title={`${x.Ddtext}`}
                                        style={{
                                            backgroundColor: (x.DomvalueL === selectedGender.DomvalueL) ? theme.colors.surfaceVariant : theme.colors.onPrimary
                                        }}
                                        onPress={async () => {
                                            setSelectedGender(x);

                                            setEquityData({
                                                ...equityData,
                                                Gesch: x.DomvalueL
                                            });

                                            setShowGender(!showGender);
                                        }}
                                    />
                                    <Divider key={'divider' + i} />
                                </React.Fragment>
                            )
                        })}
                    </List.Section>
                }
            </View>
            <View>
                <TextInput
                    style={{ marginTop: 20, ...GlobalStyles.disabledTextInput }}
                    mode='flat'
                    value={selectedAboriginal.Eddes}
                    editable={false}
                    label='Aboriginal or Torres Strait Islander'
                    right={
                        <TextInput.Icon
                            icon={() => {
                                return <LucideIcons.ChevronDown />
                            }}
                            onPress={() => {
                                CloseOpenedDropDown();
                                setShowAboriginal(!showAboriginal);
                            }}
                        />
                    }
                />
                {(showAboriginal) &&
                    <List.Section style={{ backgroundColor: theme.colors.onSecondary, position: 'absolute', width: '100%', top: 70, zIndex: 100, boxShadow: 'rgba(99, 99, 99, 0.2) 0px 2px 8px 0px' }}>
                        {helperDataContext.equityAboriginalValues.map((x, i) => {
                            return (
                                <React.Fragment key={'Fragment_' + i}>
                                    <List.Item
                                        key={i}
                                        title={`${x.Eddes}`}
                                        style={{
                                            backgroundColor: (x.Edseq === selectedAboriginal.Edseq) ? theme.colors.surfaceVariant : theme.colors.onPrimary
                                        }}
                                        onPress={async () => {
                                            setSelectedAboriginal(x);
                                            setEquityData({
                                                ...equityData,
                                                Permi: x.Edseq
                                            });

                                            setShowAboriginal(!showAboriginal);
                                        }}
                                    />
                                    <Divider key={'divider' + i} />
                                </React.Fragment>
                            )
                        })}
                    </List.Section>
                }
            </View>
            <View>
                <TextInput
                    style={{ marginTop: 20, ...GlobalStyles.disabledTextInput }}
                    mode='flat'
                    value={selectedRacial.Eddes}
                    editable={false}
                    label='Racial/Ethnic/Religious Minority'
                    right={
                        <TextInput.Icon
                            icon={() => {
                                return <LucideIcons.ChevronDown />
                            }}
                            onPress={() => {
                                CloseOpenedDropDown();
                                setShowRacial(!showRacial);
                            }}
                        />
                    }
                />
                {(showRacial) &&
                    <List.Section style={{ backgroundColor: theme.colors.onSecondary, position: 'absolute', width: '100%', top: 70, zIndex: 100, boxShadow: 'rgba(99, 99, 99, 0.2) 0px 2px 8px 0px' }}>
                        {helperDataContext.equityRacialEthnicReligiousValues.map((x, i) => {
                            return (
                                <React.Fragment key={'Fragment_' + i}>
                                    <List.Item
                                        key={i}
                                        title={`${x.Eddes}`}
                                        style={{
                                            backgroundColor: (x.Edseq === selectedRacial.Edseq) ? theme.colors.surfaceVariant : theme.colors.onPrimary
                                        }}
                                        onPress={async () => {
                                            setSelectedRacial(x);
                                            setEquityData({
                                                ...equityData,
                                                Movec: x.Edseq
                                            });

                                            setShowRacial(!showRacial);
                                        }}
                                    />
                                    <Divider key={'divider' + i} />
                                </React.Fragment>
                            )
                        })}
                    </List.Section>
                }
            </View>
            <View>
                <TextInput
                    style={{ marginTop: 20, ...GlobalStyles.disabledTextInput }}
                    mode='flat'
                    value={selectedFirstLanguage.Eddes}
                    editable={false}
                    label='First Language'
                    right={
                        <TextInput.Icon
                            icon={() => {
                                return <LucideIcons.ChevronDown />
                            }}
                            onPress={() => {
                                CloseOpenedDropDown();
                                setShowFirstLanguage(!showFirstLanguage);
                            }}
                        />
                    }
                />
                {(showFirstLanguage) &&
                    <List.Section style={{ backgroundColor: theme.colors.onSecondary, position: 'absolute', width: '100%', top: 70, zIndex: 100, boxShadow: 'rgba(99, 99, 99, 0.2) 0px 2px 8px 0px' }}>
                        {helperDataContext.equityFirstLanguageValues.map((x, i) => {
                            return (
                                <React.Fragment key={'Fragment_' + i}>
                                    <List.Item
                                        key={i}
                                        title={`${x.Eddes}`}
                                        style={{
                                            backgroundColor: (x.Edseq === selectedFirstLanguage.Edseq) ? theme.colors.surfaceVariant : theme.colors.onPrimary
                                        }}
                                        onPress={async () => {
                                            setSelectedFirstLanguage(x);

                                            setEquityData({
                                                ...equityData,
                                                Fslng: x.Edseq
                                            });

                                            setShowFirstLanguage(!showFirstLanguage);
                                        }}
                                    />
                                    <Divider key={'divider' + i} />
                                </React.Fragment>
                            )
                        })}
                    </List.Section>
                }
            </View>
            <View>
                <TextInput
                    style={{ marginTop: 20, ...GlobalStyles.disabledTextInput }}
                    mode='flat'
                    value={selectedDisability.Eddes}
                    editable={false}
                    label='Disability'
                    right={
                        <TextInput.Icon
                            icon={() => {
                                return <LucideIcons.ChevronDown />
                            }}
                            onPress={() => {
                                CloseOpenedDropDown();
                                setShowDisability(!showDisability);
                            }}
                        />
                    }
                />
                {(showDisability) &&
                    <List.Section style={{ backgroundColor: theme.colors.onSecondary, position: 'absolute', width: '100%', top: -220, zIndex: 100, boxShadow: 'rgba(99, 99, 99, 0.2) 0px 2px 8px 0px' }}>
                        {helperDataContext.equityDisabilityValues.map((x, i) => {
                            return (
                                <React.Fragment key={'Fragment_' + i}>
                                    <List.Item
                                        key={i}
                                        title={`${x.Eddes}`}
                                        style={{
                                            backgroundColor: (x.Edseq === selectedDisability.Edseq) ? theme.colors.surfaceVariant : theme.colors.onPrimary
                                        }}
                                        onPress={async () => {
                                            setSelectedDisability(x);
                                            setEquityData({
                                                ...equityData,
                                                Disap: x.Edseq
                                            });

                                            setShowDisability(!showDisability);
                                        }}
                                    />
                                    <Divider key={'divider' + i} />
                                </React.Fragment>
                            )
                        })}
                    </List.Section>
                }
            </View>
            <Button
                style={{
                    marginTop: 20,
                    backgroundColor: theme.colors.primary
                }}
                mode="elevated"
                textColor={theme.colors.background}
                onPress={async () => {
                    //check to see if keyboard is open, if it is, close it
                    const keyboardIsVisible = Keyboard.isVisible();

                    if (keyboardIsVisible) {
                        Keyboard.dismiss();
                    }

                    appContext.setShowBusyIndicator(true);
                    appContext.setShowDialog(true);

                    const uriParts = equityData.__metadata.uri.split("Z_ESS_MSS_SRV");
                    let uriPath = uriParts[1].substring(1);

                    try {
                        const response = await dataHandlerModule.batchSingleUpdate(
                            uriPath,
                            "Z_ESS_MSS_SRV",
                            equityData
                        );

                        if (!response.responseBody) {
                            try {
                                if (dataContext.currentProfile == 'MyMembers') {
                                    const updatedData = await dataHandlerModule.batchGet(`EmployeeDetails?$filter=Pernr%20eq%20%27${equityData.Pernr}%27%20and%20Zzplans%20eq%20%27${dataContext.myMembersMembershipDetails[0].Zzplans}%27`, 'Z_ESS_MSS_SRV', 'EmployeeDetails')
                                    dataContext.setMyMemberEmployeeDetails(updatedData.responseBody.d.results);
                                }
                                else {
                                    const updatedData = await dataHandlerModule.batchGet(`EmployeeDetails`, 'Z_ESS_MSS_SRV', 'EmployeeDetails')
                                    dataContext.setEmployeeDetails(updatedData.responseBody.d.results);
                                }

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
                }}
            >
                Save
            </Button>
        </ScrollView>
    );
}

const EditScreen = ({ route, navigation }: props) => {
    const EditPayload = route.params;
    let SelectedEditScreen;

    const [keyboardIsShowing, setKeyboardIsShowing] = useState(false);

    useEffect(() => {
        const showSubscription = Keyboard.addListener('keyboardWillShow', () => {
            setKeyboardIsShowing(true);
        });

        const hideSubscription = Keyboard.addListener('keyboardWillHide', () => {
            setKeyboardIsShowing(false);
        });

        return () => {
            showSubscription.remove();
            hideSubscription.remove();
        }
    }, [])

    switch (EditPayload?.screenName) {
        case "MyDetails":
            SelectedEditScreen = <MyDetailsEdit data={EditPayload.data} />;
            break;

        case "ContactDetails":
            SelectedEditScreen = <ContactDetailsEdit data={EditPayload.editData} />;
            break;

        case "EmergencyContacts":
            SelectedEditScreen = <EmergencyContactsEdit data={EditPayload.editData} />
            break;

        case "UniformDetails":
            SelectedEditScreen = <UniformDetailsEdit data={EditPayload.editData} />
            break;

        case "VolunteerNotes":
            SelectedEditScreen = <VolunteerDetailsEdit data={EditPayload.editData} />
            break;

        case "VolunteerData":
            SelectedEditScreen = <VolunteerEdit data={EditPayload.editData} />
            break;

        case "EquityDiversity":
            SelectedEditScreen = <EquityDiversity data={EditPayload.editData} />
            break;
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : "height"}
            keyboardVerticalOffset={75}
            style={{ flex: 1 }}
        >
            <View style={GlobalStyles.page}>
                <View style={{ alignItems: "flex-end" }}>
                    <IconButton
                        icon={() => <LucideIcons.X />}
                        onPress={() => screenFlowModule.onGoBack()}
                    />
                </View>
                {SelectedEditScreen}
                <View style={{ marginBottom: keyboardIsShowing ? 0 : 30 }} />
            </View>
        </KeyboardAvoidingView>
    );
};

export default EditScreen;
