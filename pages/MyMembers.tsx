//landing page for my members - single & multi units
import React, { useState, useEffect } from "react";
import { View, ScrollView } from "react-native";
import { Searchbar, List, Divider, Menu, TextInput, IconButton, useTheme } from "react-native-paper";
import CustomText from "../assets/CustomText";
import { useDataContext } from "../helper/DataContext";
import { useAppContext } from "../helper/AppContext";
import * as LucideIcons from "lucide-react-native";
import { screenFlowModule } from "../helper/ScreenFlowModule";
import GlobalStyles from "../style/GlobalStyles";
import { dataHandlerModule } from "../helper/DataHandlerModule";

const MyMembers = () => {
    const dataContext = useDataContext();
    const appContext = useAppContext();

    type listType = Record<string, Record<string, string>[]> | undefined;

    const [searchValue, setSearchValue] = useState("");
    const [membersList, setMembersList] = useState<listType>(undefined);
    const [orgUnitList, setOrgUnitList] = useState<any[]>([]);
    const [selectedOrgUnit, setSelectedOrgUnit] = useState<any>(undefined);
    const [showDropDown, setShowDropDown] = useState<boolean>(false);
    const [volAdmin, setVolAdmin] = useState(false);

    useEffect(() => {
        
        if (dataContext.currentUser[0].VolAdmin){
            setVolAdmin(true);
        }

        setOrgUnitList(dataContext.rootOrgUnits);
        setSelectedOrgUnit(dataContext.rootOrgUnits[0]);
        const filteredList = filterAndFormatList("");
        setMembersList(filteredList);
    }, []);

    //filter our contacts
    const filterAndFormatList = (query: string, results?: any[]) => {
        let filteredList;
        let dataList = results ? results : dataContext.orgUnitTeamMembers;

        if (query) {
            filteredList = dataList.filter((x) => {
                if (x.Stext.toLowerCase().includes(query.toLowerCase())) {
                    return x;
                }
            });
        } else {
            filteredList = dataList;
        }

        const sortedList = [...filteredList].sort((a, b) =>
            a.Stext.localeCompare(b.Stext)
        );

        const grouped = sortedList.reduce((accumulator, currentValue) => {
            const firstLetter = currentValue.Stext[0].toUpperCase();
            if (!accumulator[firstLetter]) {
                accumulator[firstLetter] = [];
            }

            accumulator[firstLetter].push(currentValue);
            return accumulator;
        }, {});

        //returns this format, so our names are grouped into alphabet keys
        /*  {
                    A: [{string : string }],
                    B: [{string : string }],
                    C: [{string : string }]
                } 
            */

        return grouped;
    };

    const theme = useTheme();

    return (
        <View style={GlobalStyles.page}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 20 }}>
                <IconButton icon={() => <LucideIcons.ChevronLeft color={theme.colors.primary} size={25} />} size={20} onPress={() => screenFlowModule.onGoBack()} />
                <CustomText style={{ marginLeft: 20 }} variant='titleLargeBold'>My Members</CustomText>
            </View>
            {(!volAdmin && orgUnitList.length === 1) && (
                <View style={{ paddingVertical: 20, paddingLeft: 20, borderBottomColor: theme.colors.onSurfaceDisabled, borderBottomWidth: 1 }}>
                    <CustomText variant="bodyLargeBold">{orgUnitList[0].Short}</CustomText>
                </View>
            )}
            {(!volAdmin && orgUnitList.length > 1) && (
                <>
                    <View style={{ marginLeft: 20 }}>
                        <CustomText variant='bodyLargeBold'>{selectedOrgUnit.Stext}</CustomText>
                    </View>
                    <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
                        <TextInput
                            mode='outlined'
                            value={selectedOrgUnit.Short}
                            editable={false}
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
                            <List.Section style={{ backgroundColor: theme.colors.onSecondary, position: 'absolute', width: '100%', top: 50, left: 20, zIndex: 100, boxShadow: 'rgba(99, 99, 99, 0.2) 0px 2px 8px 0px' }}>
                                {orgUnitList.map((x, i) => {
                                    return (
                                        <React.Fragment key={'Fragment_' + i}>
                                            <List.Item
                                                key={i}
                                                title={x.Short}
                                                style={{
                                                    backgroundColor: (x.Plans === selectedOrgUnit.Plans) ? theme.colors.surfaceVariant : theme.colors.onPrimary
                                                }}
                                                onPress={async () => {
                                                    const plans = x.Plans;
                                                    setSelectedOrgUnit(x);

                                                    //when we set the selected org unit, we need to update the members list aswell
                                                    setShowDropDown(!showDropDown);


                                                    appContext.setShowBusyIndicator(true);
                                                    appContext.setShowDialog(true);

                                                    //read the org unit team members
                                                    try {
                                                        const orgUnitTeamMembers = await dataHandlerModule.batchGet(`Members?$skip=0&$top=100&$filter=Zzplans%20eq%20%27${plans}%27%20and%20InclWithdrawn%20eq%20false`, 'Z_VOL_MANAGER_SRV', 'Members');
                                                        appContext.setShowBusyIndicator(false);

                                                        if (orgUnitTeamMembers.responseBody.error) {
                                                            appContext.setDialogMessage(
                                                                orgUnitTeamMembers.responseBody.error.message.value
                                                            );

                                                            return;
                                                        }

                                                        dataContext.setOrgUnitTeamMembers(orgUnitTeamMembers.responseBody.d.results);
                                                        const newTeamList = filterAndFormatList('', orgUnitTeamMembers.responseBody.d.results);

                                                        setMembersList(newTeamList);
                                                        appContext.setShowDialog(false);
                                                    }
                                                    catch (error) {
                                                        //TODO handle error
                                                        appContext.setShowBusyIndicator(false);
                                                        appContext.setShowDialog(false);
                                                        console.log(error);
                                                    }


                                                }}
                                            />
                                            <Divider key={'divider' + i} />
                                        </React.Fragment>
                                    )
                                })}
                            </List.Section>
                        }
                    </View>
                </>
            )}
            <Searchbar
                style={{
                    marginVertical: 20,
                    marginHorizontal: 20,
                    backgroundColor: theme.colors.surfaceVariant,
                }}
                placeholder="Search Members"
                value={searchValue}
                onChangeText={(text) => {
                    const filterResult = filterAndFormatList(text);
                    setMembersList(filterResult);
                    setSearchValue(text);
                }}
            />
            <ScrollView
                style={{ flex: 1, paddingBottom: 40, backgroundColor: theme.colors.background }}
            >
                {membersList && (
                    <List.Section>
                        {Object.keys(membersList).map((letter, i) => {
                            return (
                                <React.Fragment key={`header_${letter}_${i}`}>
                                    <List.Subheader key={"subheader_" + i}>
                                        <CustomText variant="bodyLargeBold">{letter}</CustomText>
                                    </List.Subheader>
                                    {membersList[letter].map((member, ii) => {

                                        return (
                                            <React.Fragment key={`contact_${letter}_${ii}`}>
                                                <List.Item
                                                    onPress={async () => {
                                                        //next screen also needs the brigade information, so combine them into ones
                                                        //do a read and update the employeeDetails & myMembersMembershipDetails
                                                        appContext.setShowDialog(true);
                                                        appContext.setShowBusyIndicator(true);

                                                        try {
                                                            const membershipDetails = await dataHandlerModule.batchGet(`MembershipDetails?$filter=Pernr%20eq%20%27${member.Pernr}%27%20and%20Zzplans%20eq%20%27${member.Zzplans}%27`, 'Z_VOL_MEMBER_SRV', 'MembershipDetails');
                                                            const employeeDetails = await dataHandlerModule.batchGet(`EmployeeDetails?$filter=Pernr%20eq%20%27${member.Pernr}%27%20and%20Zzplans%20eq%20%27${member.Zzplans}%27`, 'Z_ESS_MSS_SRV', 'EmployeeDetails');

                                                            if (!membershipDetails.responseBody.error) {
                                                                dataContext.setMyMembersMembershipDetails(membershipDetails.responseBody.d.results);
                                                            }
                                                            else {
                                                                //TODO handle error properly
                                                                console.log(membershipDetails.responseBody.error)
                                                            }

                                                            if (!employeeDetails.responseBody.error) {
                                                                dataContext.setMyMemberEmployeeDetails(employeeDetails.responseBody.d.results);
                                                            }
                                                            else {
                                                                //TODO handle error properly
                                                                console.log(employeeDetails.responseBody.error)
                                                            }

                                                            const memberInfo = {
                                                                ...member,
                                                                ...selectedOrgUnit,
                                                            };

                                                            screenFlowModule.onNavigateToScreen(
                                                                "MyMembersProfile",
                                                                memberInfo
                                                            );

                                                            appContext.setShowDialog(false);
                                                            appContext.setShowBusyIndicator(false);
                                                        }
                                                        catch (error) {
                                                            //TODO handle error
                                                            appContext.setShowDialog(false);
                                                            appContext.setShowBusyIndicator(false);
                                                            throw error;
                                                        }

                                                    }}
                                                    right={() => (
                                                        <LucideIcons.ChevronRight
                                                            color={theme.colors.primary}
                                                        />
                                                    )}
                                                    left={() => (
                                                        <View
                                                            style={{
                                                                backgroundColor: theme.colors.surfaceDisabled,
                                                                padding: 5,
                                                                borderRadius: 50,
                                                            }}
                                                        >
                                                            <LucideIcons.User color={theme.colors.outline} />
                                                        </View>
                                                    )}
                                                    style={{ marginLeft: 20 }}
                                                    key={"item_" + ii}
                                                    title={`${member.Stext}`}
                                                    description={member.RoleFl}
                                                />
                                                <Divider />
                                            </React.Fragment>
                                        );
                                    })}
                                </React.Fragment>
                            );
                        })}
                    </List.Section>
                )}
                {(!membersList || membersList == undefined) && (
                    <CustomText>No members in this unit</CustomText>
                )}
            </ScrollView>
        </View>
    );
};

export default MyMembers;
