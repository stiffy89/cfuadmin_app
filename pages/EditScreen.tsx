import React, { useState } from "react";
import { View, ScrollView } from "react-native";
import * as LucideIcons from "lucide-react-native";
import {
    useTheme,
    IconButton,
    TextInput,
    Button,
    HelperText,
    Menu,
    Divider,
} from "react-native-paper";
import CustomText from "../assets/CustomText";
import { StackScreenProps } from "@react-navigation/stack";
import { RootStackParamList } from "../types/AppTypes";
import { screenFlowModule, ScreenFlowModule } from "../helper/ScreenFlowModule";
import GlobalStyles from "../style/GlobalStyles";
import { useAppContext } from "../helper/AppContext";
import { dataHandlerModule } from "../helper/DataHandlerModule";
import { useDataContext } from "../helper/DataContext";
import GenericFormatter from "../helper/GenericFormatters";

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
                My Details Edit
            </CustomText>
            <TextInput
                label="Preferred Name"
                mode="flat"
                value={preferredName}
                onChangeText={(text) => {
                    setPreferredName(text);
                }}
            />
            {hasError && <HelperText type="error">{errorMsg}</HelperText>}
            <Button
                style={{
                    backgroundColor: theme.colors.primary,
                    ...GlobalStyles.floatingButtonBottom,
                }}
                mode="elevated"
                textColor={theme.colors.background}
                onPress={async () => {
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
                                const employeeDetails = await dataHandlerModule.batchGet(
                                    "EmployeeDetails",
                                    "Z_ESS_MSS_SRV",
                                    "EmployeeDetails"
                                );
                                dataContext.setEmployeeDetails(
                                    employeeDetails.responseBody.d.results
                                );

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
                const employeeDetails = await dataHandlerModule.batchGet(
                    "EmployeeDetails",
                    "Z_ESS_MSS_SRV",
                    "EmployeeDetails"
                );
                dataContext.setEmployeeDetails(employeeDetails.responseBody.d.results);

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
                const employeeDetails = await dataHandlerModule.batchGet(
                    "EmployeeDetails",
                    "Z_ESS_MSS_SRV",
                    "EmployeeDetails"
                );
                dataContext.setEmployeeDetails(employeeDetails.responseBody.d.results);

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
                const employeeDetails = await dataHandlerModule.batchGet(
                    "EmployeeDetails",
                    "Z_ESS_MSS_SRV",
                    "EmployeeDetails"
                );
                dataContext.setEmployeeDetails(employeeDetails.responseBody.d.results);

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
                    const employeeDetails = await dataHandlerModule.batchGet(
                        "EmployeeDetails",
                        "Z_ESS_MSS_SRV",
                        "EmployeeDetails"
                    );
                    dataContext.setEmployeeDetails(employeeDetails.responseBody.d.results);
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
            <CustomText style={{ marginBottom: 20 }} variant="titleLargeBold">
                Contact Details Edit
            </CustomText>
            {key == "primarymobile" && (
                <View>
                    <TextInput
                        label="Primary Mobile"
                        mode="flat"
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
                <View>
                    <TextInput
                        label="Home Phone"
                        mode="flat"
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
                <View>
                    <TextInput
                        label="Work Phone"
                        mode="flat"
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
                <View>
                    <TextInput
                        label="Email"
                        mode="flat"
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
                <View>
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
                        mode="flat"
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
                        mode="flat"
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
                        mode="flat"
                        style={{ marginBottom: 20 }}
                        value={contactDetails.mail_suburb}
                        onChangeText={(text) => {
                            setContactDetails({
                                ...contactDetails,
                                mail_suburb: text,
                            });
                        }}
                    />
                    <Menu
                        style={{ width: "70%" }}
                        visible={showDropDown}
                        onDismiss={() => setShowDropDown(!showDropDown)}
                        anchor={
                            <TextInput
                                label="State *"
                                mode="flat"
                                style={{ marginBottom: 20 }}
                                value={contactDetails.mail_state}
                                editable={false}
                                right={
                                    <TextInput.Icon
                                        icon={() => {
                                            if (showDropDown) {
                                                return <LucideIcons.ChevronUp />;
                                            } else {
                                                return <LucideIcons.ChevronDown />;
                                            }
                                        }}
                                        onPress={() => {
                                            setShowDropDown(!showDropDown);
                                        }}
                                    />
                                }
                            />
                        }
                        anchorPosition="top"
                    >
                        {dataContext.addressStates.map((state, index) => {
                            return (
                                <View key={"container_" + index}>
                                    <Menu.Item
                                        title={state.Bland}
                                        key={"item_" + index}
                                        onPress={() => {
                                            setContactDetails({
                                                ...contactDetails,
                                                mail_state: state.Bland,
                                            });
                                            setShowDropDown(!showDropDown);
                                        }}
                                    />
                                    <Divider key={"div_" + index} />
                                </View>
                            );
                        })}
                    </Menu>
                    <TextInput
                        label="Postcode *"
                        mode="flat"
                        style={{ marginBottom: 20 }}
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
                }}
                mode="elevated"
                textColor={theme.colors.background}
                onPress={() => {
                    saveData();
                }}
            >
                Save
            </Button>
        </View>
    );
};

const EmergencyContactsEdit = (data: any) => {
    const theme = useTheme();
    const dataObj = data.data;
    const dataContext = useDataContext();
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
            const employeeDetails = await dataHandlerModule.batchGet(
                "EmployeeAddresses",
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
                style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20}}
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
            <ScrollView style={{ paddingBottom: 40}}>
                <TextInput
                    label="Name *"
                    mode="flat"
                    style={{ marginBottom: 20 }}
                    value={emergencyContact.Coname}
                    onChangeText={(text) => {
                        setEmergencyContact({
                            ...emergencyContact,
                            Coname: text,
                        });
                    }}
                />
                <Menu
                    style={{ width: "70%" }}
                    visible={showRelatDropDown}
                    onDismiss={() => setShowRelatDropDown(!showRelatDropDown)}
                    anchor={
                        <TextInput
                            label="Relationship *"
                            mode="flat"
                            style={{ marginBottom: 20 }}
                            value={emergencyContact.ZzindrlAtext}
                            editable={false}
                            right={
                                <TextInput.Icon
                                    icon={() => {
                                        if (showRelatDropDown) {
                                            return <LucideIcons.ChevronUp />;
                                        } else {
                                            return <LucideIcons.ChevronDown />;
                                        }
                                    }}
                                    onPress={() => {
                                        setShowRelatDropDown(!showRelatDropDown);
                                    }}
                                />
                            }
                        />
                    }
                    anchorPosition="top"
                >
                    {dataContext.addressRelationships.map((relationship, index) => {
                        return (
                            <View key={"container_" + index}>
                                <Menu.Item
                                    title={relationship.Atext}
                                    key={"item_" + index}
                                    onPress={() => {
                                        setEmergencyContact({
                                            ...emergencyContact,
                                            ZzindrlAtext: relationship.Atext,
                                            Zzindrl: relationship.Zzindrl,
                                        });
                                        setShowRelatDropDown(!showRelatDropDown);
                                    }}
                                />
                                <Divider key={"div_" + index} />
                            </View>
                        );
                    })}
                </Menu>
                <TextInput
                    label="Mobile *"
                    mode="flat"
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
                    mode="flat"
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
                    mode="flat"
                    style={{ marginBottom: 20 }}
                    value={emergencyContact.City}
                    onChangeText={(text) => {
                        setEmergencyContact({
                            ...emergencyContact,
                            City: text,
                        });
                    }}
                />
                <Menu
                    style={{ width: "70%" }}
                    visible={showStateDropDown}
                    onDismiss={() => setShowStateDropDown(!showStateDropDown)}
                    anchor={
                        <TextInput
                            label="State"
                            mode="flat"
                            style={{ marginBottom: 20 }}
                            value={emergencyContact.Statekey}
                            editable={false}
                            right={
                                <TextInput.Icon
                                    icon={() => {
                                        if (showStateDropDown) {
                                            return <LucideIcons.ChevronUp />;
                                        } else {
                                            return <LucideIcons.ChevronDown />;
                                        }
                                    }}
                                    onPress={() => {
                                        setShowStateDropDown(!showStateDropDown);
                                    }}
                                />
                            }
                        />
                    }
                    anchorPosition="top"
                >
                    {dataContext.addressStates.map((state, index) => {
                        return (
                            <View key={"container_" + index}>
                                <Menu.Item
                                    title={state.Bland}
                                    key={"item_" + index}
                                    onPress={() => {
                                        setEmergencyContact({
                                            ...emergencyContact,
                                            Statekey: state.Bland,
                                        });
                                        setShowStateDropDown(!showStateDropDown);
                                    }}
                                />
                                <Divider key={"div_" + index} />
                            </View>
                        );
                    })}
                </Menu>
                <TextInput
                    label="Postcode"
                    mode="flat"
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
                    ...GlobalStyles.floatingButtonBottom,
                }}
                mode="elevated"
                textColor={theme.colors.background}
                onPress={() => saveData()}
            >
                Save
            </Button>
        </View>
    );
};

const EditScreen = ({ route, navigation }: props) => {
    const EditPayload = route.params;

    let SelectedEditScreen;

    switch (EditPayload?.screenName) {
        case "MyDetails":
            SelectedEditScreen = <MyDetailsEdit data={EditPayload.data} />;
            break;

        case "ContactDetails":
            SelectedEditScreen = <ContactDetailsEdit data={EditPayload.editData} />;
            break;

        case "EmergencyContacts":
            SelectedEditScreen = (
                <EmergencyContactsEdit data={EditPayload.editData} />
            );
            break;
    }

    return (
        <View style={GlobalStyles.page}>
            <View style={{ alignItems: "flex-end" }}>
                <IconButton
                    icon={() => <LucideIcons.X />}
                    onPress={() => screenFlowModule.onGoBack()}
                />
            </View>

            {SelectedEditScreen}
        </View>
    );
};

export default EditScreen;
