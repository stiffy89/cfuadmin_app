import React from "react";
import { View, ScrollView, Pressable } from "react-native";
import { useTheme, IconButton, Button} from "react-native-paper";
import { StackScreenProps } from "@react-navigation/stack";
import {RootStackParamList } from "../types/AppTypes";
import { screenFlowModule } from "../helper/ScreenFlowModule";
import GlobalStyles from "../style/GlobalStyles";
import * as LucideIcons from "lucide-react-native";
import CustomText from "../assets/CustomText";
import { useDataContext } from "../helper/DataContext";
import GenericFormatter from "../helper/GenericFormatters";
import GenericAppHelpers from "../helper/GenericAppHelpers";

type props = StackScreenProps<RootStackParamList, "EmergencyContactsScreen">; //typing the navigation props

const EmergencyContacts = ({ route, navigation }: props) => {
    const theme = useTheme();
    const dataContext = useDataContext();
    const genericAppHelper = new GenericAppHelpers();

    const pernr = (dataContext.currentProfile == 'MyMembers') ? dataContext.myMemberEmployeeDetails[0].Pernr : dataContext.employeeDetails[0].Pernr;

    const employeeAddresses = useDataContext().employeeAddresses;

    const EditData = (data: any) => {
        screenFlowModule.onNavigateToScreen("EditScreen", {
            screenName: "EmergencyContacts",
            editData: data,
        });
    };

    const AddressFormatter = (dataObj: any) => {
        let addressString = "";

        dataObj.StreetE
            ? (addressString += dataObj.StreetE + ", ")
            : (addressString += "");
        dataObj.CityE
            ? (addressString += dataObj.CityE + " ")
            : (addressString += "");
        dataObj.StateE
            ? (addressString += dataObj.StateE + " ")
            : (addressString += "");
        dataObj.ZipcodeE
            ? (addressString += dataObj.ZipcodeE + " ")
            : (addressString += "");

        return addressString;
    };

    const SecondaryAddressFormatter = (dataObj: any) => {
        let addressString = "";

        dataObj.Street
            ? (addressString += dataObj.Street + ", ")
            : (addressString += "");
        dataObj.City
            ? (addressString += dataObj.City + " ")
            : (addressString += "");
        dataObj.State
            ? (addressString += dataObj.State + " ")
            : (addressString += "");
        dataObj.Zipcode
            ? (addressString += dataObj.Zipcode + " ")
            : (addressString += "");

        return addressString;
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
                    Emergency Contacts
                </CustomText>
            </View>
            <ScrollView
                style={{ flex: 1, backgroundColor: "#fff", paddingHorizontal: 20 }}
                contentContainerStyle={{ paddingBottom: 0 }}
            >
                {employeeAddresses.map((x, i) => {
                    return (
                        <View
                            key={i}
                            style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                                backgroundColor: "#efefef",
                                padding: 20,
                                marginBottom: 20,
                                ...GlobalStyles.globalBorderRadius,
                            }}
                        >
                            <View style={{width: '90%'}}>
                                <CustomText style={{ marginBottom: 10 }}>{x.Coname}</CustomText>
                                <CustomText style={{ marginBottom: 10 }}>
                                    {x.ZzindrlAtext}
                                </CustomText>
                                <CustomText style={{ marginBottom: 10 }}>{x.Telnr}</CustomText>
                                <Pressable
                                    onPress={() => {
                                        const address = SecondaryAddressFormatter(x);
                                        if (address){
                                            genericAppHelper.navigateToNativeMaps(address);
                                        }
                                    }}
                                >
                                    <CustomText style={{ marginBottom: 10, flexWrap: 'wrap', color: theme.colors.secondary }}>
                                        {SecondaryAddressFormatter(x)}
                                    </CustomText>
                                </Pressable>
                            </View>
                            <IconButton
                                icon={() => (
                                    <LucideIcons.Pencil color={theme.colors.primary} size={20} />
                                )}
                                onPress={() => EditData(x)}
                            />
                        </View>
                    );
                })}
                <Button
                    onPress={() => {
                        const genericFormatter = new GenericFormatter();

                        const EmptyContact = {
                            AddressType: "4",
                            NewAddress: true,
                            Addressline: "",
                            Begda: genericFormatter.formatToEdmDate(new Date()),
                            City: "",
                            Coname: "",
                            Countrykey: "",
                            County: "",
                            Endda: genericFormatter.formatToEdmDate(new Date()),
                            Objps: "",
                            Pernr: "",
                            Seqnr: "",
                            Sprps: "",
                            State: "",
                            Statekey: "",
                            Street: "",
                            Subty: "",
                            Telnr: "",
                            Zipcode: "",
                            Zznum01: "",
                            Zznum02: "",
                            Zznum03: "",
                            Zzindrl: "",
                            ZzindrlAtext: "",
                        };

                        EmptyContact.Pernr = pernr;

                        EditData(EmptyContact);
                    }}
                >
                    Add Contact
                </Button>
            </ScrollView>
        </View>
    );
};

export default EmergencyContacts;
