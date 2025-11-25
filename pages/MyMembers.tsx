//landing page for my members - single & multi units
import React, { useState, useEffect } from "react";
import { View, ScrollView } from "react-native";
import { List, Divider, TextInput, IconButton, Chip, Switch, useTheme } from "react-native-paper";
import CustomText from "../assets/CustomText";
import { useDataContext } from "../helper/DataContext";
import { useAppContext } from "../helper/AppContext";
import * as LucideIcons from "lucide-react-native";
import { screenFlowModule } from "../helper/ScreenFlowModule";
import GlobalStyles from "../style/GlobalStyles";
import { dataHandlerModule } from "../helper/DataHandlerModule";
import { StackScreenProps } from "@react-navigation/stack";
import { RootStackParamList } from "../types/AppTypes";
import GenericFormatter from "../helper/GenericFormatters";

type props = StackScreenProps<RootStackParamList, "MyMembers">;

const WithdrawnSwitch = () => {
    const [showWithdrawn, setShowWithdrawn] = useState(false);
    const appContext = useAppContext();
    const dataContext = useDataContext();


    useEffect(() => {
        setShowWithdrawn(dataContext.volAdminMembersSearchFilter.withdrawn)
    }, [])

    return (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Switch style={{ transform: [{ scale: 0.7 }] }} value={showWithdrawn} onValueChange={async () => {
                setShowWithdrawn(!showWithdrawn);
                appContext.setShowBusyIndicator(true);
                appContext.setShowDialog(true);

                //note show withdrawn is opp because we havent changed state yet
                try {
                    const results = await dataHandlerModule.batchGet(
                        `Members?$skip=0&$top=100&$filter=Zzplans%20eq%20%27${dataContext.volAdminLastSelectedOrgUnit[0].Zzplans}%27%20and%20InclWithdrawn%20eq%20${!showWithdrawn}`,
                        'Z_VOL_MANAGER_SRV',
                        'Brigades'
                    );

                    dataContext.setOrgUnitTeamMembers(results.responseBody.d.results);
                    dataContext.setVolAdminMembersSearchFilter({
                        ...dataContext.volAdminMembersSearchFilter,
                        withdrawn : !showWithdrawn
                    })
                    appContext.setShowDialog(false);
                }
                catch (error) {
                    appContext.setShowDialog(false);
                    screenFlowModule.onNavigateToScreen('ErrorPage', error);
                }
            }} />
            <CustomText >Show Withdrawn Members</CustomText>
        </View>
    )
}

const FilterTokens = () => {

    const dataContext = useDataContext();
    const appContext = useAppContext();

    const [filters, setFilters] = useState<any[]>([]);

    useEffect(() => {
        const memberVolAdminFilter : any = dataContext.volAdminMembersSearchFilter;
        let currentFilters: any[] = [];

        ['firstName', 'lastName', 'pernr'].forEach(x => {
            if (memberVolAdminFilter[x]) {
                const filterObj: any = {
                    filter : '',
                    value : ''
                };
                filterObj.filter = x;
                filterObj.value = memberVolAdminFilter[x];
                currentFilters.push(filterObj)
            }
        });

        setFilters(currentFilters)

    }, [dataContext.volAdminMembersSearchFilter])

    return (
        <View style={{flexDirection: 'row', marginVertical: 10}}>
            {
                filters.map((x, i) => {
                    return (
                        <Chip
                            key={'chip' + i}
                            textStyle={{fontSize: 15}}
                            style={{marginRight: 10}}
                            closeIcon={() => <LucideIcons.X size={15} />}
                            onClose={async () => {
                                //update the datacontext filters first
                               
                                const newFilter : any = {
                                    ...dataContext.volAdminMembersSearchFilter,
                                    [x.filter] : ''
                                }

                                appContext.setShowBusyIndicator(true);
                                appContext.setShowDialog(true);
                                //do a read on members list based on whatever filters left
                                if (newFilter.firstName || newFilter.lastName){
                                    //do a read on one of them
                                    let query = '';

                                    if (newFilter.firstName){
                                        const cleanedFirstname = newFilter.lastName.replace(/\s+/g, '');
                                        query = `Brigades?$skip=0&$top=100&$filter=substringof(%27${cleanedFirstname}%27,Vorna)`
                                    }
                                    else if (newFilter.lastName){
                                        const cleanedLastname = newFilter.lastName.replace(/\s+/g, '');
                                        query = `Brigades?$skip=0&$top=100&$filter=substringof(%27${cleanedLastname}%27,Nachn)`
                                    }

                                    try {
                                        const results = await dataHandlerModule.batchGet(
                                            query,
                                            'Z_VOL_MANAGER_SRV',
                                            'Brigades'
                                        );

                                        dataContext.setVolAdminMemberDetailSearchResults(results.responseBody.d.results);
                                        dataContext.setVolAdminMembersSearchFilter(newFilter);
                                        appContext.setShowDialog(false);
                                    } catch (error) {
                                        appContext.setShowDialog(false);
                                        screenFlowModule.onNavigateToScreen('ErrorPage', error);
                                    }
                                }
                                else {
                                    //read last saved org unit and show list
                                    try {
                                        const results = await dataHandlerModule.batchGet(
                                            `Members?$skip=0&$top=100&$filter=Zzplans%20eq%20%27${dataContext.volAdminLastSelectedOrgUnit[0].Zzplans}%27%20and%20InclWithdrawn%20eq%20${newFilter.withdrawn}`,
                                            'Z_VOL_MANAGER_SRV',
                                            'Brigades'
                                        );
                                        
                                        dataContext.setOrgUnitTeamMembers(results.responseBody.d.results);
                                        dataContext.setVolAdminMembersSearchFilter(newFilter);
                                        appContext.setShowDialog(false);
                                    } catch (error) {
                                        appContext.setShowDialog(false);
                                        screenFlowModule.onNavigateToScreen('ErrorPage', error);
                                    }
                                }
                            }}
                        >
                            {x.value}
                        </Chip>
                    )
                })
            }
        </View>
    )
}

const MyMembers = ({ route }: props) => {
    const dataContext = useDataContext();
    const appContext = useAppContext();
    const genericFormatter = new GenericFormatter();

    type listType = Record<string, Record<string, string>[]> | undefined;

    const [membersList, setMembersList] = useState<listType>(undefined);
    const [showTeamMemberSearch, setShowTeamMemberSearch] = useState(false);
    const [orgUnitList, setOrgUnitList] = useState<any[]>([]);
    const [selectedOrgUnit, setSelectedOrgUnit] = useState<any>(undefined);
    const [showDropDown, setShowDropDown] = useState<boolean>(false);
    const [title, setTitle] = useState('');

    //not vol admin
    if (!dataContext.currentUser[0].VolAdmin){
        useEffect(() => {
            if (route.params!.title) {
                setTitle(route.params!.title);
            }

            setOrgUnitList(dataContext.rootOrgUnits);

            //set the selected org unit to your default org unit from /Brigades
            if (dataContext.rootOrgUnits.length > 1){
                const defaultRootUnit = dataContext.rootOrgUnits.filter(x => x.Plans == dataContext.myOrgUnitDetails[0].Zzplans)[0];
                setSelectedOrgUnit(defaultRootUnit);
            } else {
                setSelectedOrgUnit(dataContext.rootOrgUnits[0]);
            }
            
            
            const filteredList = filterAndFormatList(dataContext.orgUnitTeamMembers);
            setMembersList(filteredList);
        }, []);
    }
    else {
        useEffect(() => {
            if (route.params!.title) {
                setTitle(route.params!.title);
            }
            //look at the filters to see if we have pernr, first name or last name
            let selectedList = [];
            
            if (dataContext.volAdminMembersSearchFilter.firstName || dataContext.volAdminMembersSearchFilter.lastName || dataContext.volAdminMembersSearchFilter.pernr){
                selectedList = filterAndFormatList(dataContext.volAdminMemberDetailSearchResults, 'Ename');
                setShowTeamMemberSearch(true);
            }
            else {
                selectedList = filterAndFormatList(dataContext.orgUnitTeamMembers);
                setShowTeamMemberSearch(false);
            }
           
            setMembersList(selectedList);

        }, [dataContext.orgUnitTeamMembers, dataContext.volAdminMemberDetailSearchResults])
    }
    

    //filter our contacts - field is there for filtering on Ename which is /Brigades but with team members on vol adm search
    const filterAndFormatList = (results?: any[], field?:string) => {
        let dataList = results ? results : dataContext.orgUnitTeamMembers;
        let compareField = 'Stext';
        if (field){
            compareField = field;
        }
        const sortedList = [...dataList].sort((a, b) =>
            a[compareField].localeCompare(b[compareField])
        );

        const grouped = sortedList.reduce((accumulator, currentValue) => {
            const firstLetter = currentValue[compareField][0].toUpperCase();
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
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20 }}>
                <IconButton icon={() => <LucideIcons.ChevronLeft color={theme.colors.primary} size={25} />} size={20} onPress={() => {
                    screenFlowModule.onGoBack();
                }} />
                <CustomText style={{ marginLeft: 20 }} variant='titleLargeBold'>{title}</CustomText>
                {
                    (dataContext.currentUser[0].VolAdmin) && (
                        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', paddingEnd: 20 }}>
                            <IconButton icon={() => <LucideIcons.Search color={theme.colors.primary} size={25} />} size={20} onPress={() => {
                                screenFlowModule.onNavigateToScreen('VolAdminSearch', { category: 'member' });
                            }} />
                        </View>
                    )
                }
            </View>
            {(!(dataContext.currentUser[0].VolAdmin) && orgUnitList.length === 1) && (
                <View style={{ paddingVertical: 20, paddingLeft: 20, borderBottomColor: theme.colors.onSurfaceDisabled, borderBottomWidth: 1 }}>
                    <CustomText variant="bodyLargeBold">{orgUnitList[0].Short}</CustomText>
                </View>
            )}
            {(!(dataContext.currentUser[0].VolAdmin) && orgUnitList.length > 1) && (
                <>
                    <View style={{ marginLeft: 20 }}>
                        <CustomText variant='bodyLargeBold'>{selectedOrgUnit.Stext}</CustomText>
                    </View>
                    <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
                        <TextInput
                            mode='outlined'
                            value={`${selectedOrgUnit.Short}`}
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
                                                title={`${x.Short} ${x.Stext}`}
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
                                                        const newTeamList = filterAndFormatList(orgUnitTeamMembers.responseBody.d.results);

                                                        setMembersList(newTeamList);
                                                        appContext.setShowDialog(false);
                                                    }
                                                    catch (error) {
                                                        appContext.setShowDialog(false);
                                                        screenFlowModule.onNavigateToScreen('ErrorPage', error);
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
            {
                (dataContext.currentUser[0].VolAdmin) &&
                <View style={{ paddingHorizontal: 20, marginVertical: 10 }}>
                    <WithdrawnSwitch />
                    <View style={{marginLeft: 10, marginTop: 20}}>
                        <CustomText style={{marginBottom: 10}} variant='bodyMediumBold'>Showing results for :</CustomText>
                        {
                            (!showTeamMemberSearch) && (
                                <CustomText variant='bodyLarge'>{dataContext.volAdminLastSelectedOrgUnit[0].Stext}</CustomText>
                            )
                        }
                        {
                            (showTeamMemberSearch) && (
                                <FilterTokens/>
                            )
                        }
                    </View>
                </View>
            }
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

                                                        if (member.Ceased){
                                                            //save this to the selected ceased team member because we need their zzplans for personal details
                                                            dataContext.setVolAdminCeasedSelectedMember(member);
                                                        }

                                                        try {
                                                            const membershipDetails = await dataHandlerModule.batchGet(`MembershipDetails?$filter=Pernr%20eq%20%27${member.Pernr}%27%20and%20Zzplans%20eq%20%27${member.Zzplans}%27`, 'Z_VOL_MEMBER_SRV', 'MembershipDetails');
                                                            const employeeDetails = await dataHandlerModule.batchGet(`EmployeeDetails?$filter=Pernr%20eq%20%27${member.Pernr}%27%20and%20Zzplans%20eq%20%27${member.Zzplans}%27`, 'Z_ESS_MSS_SRV', 'EmployeeDetails');
                                                            
                                                            dataContext.setMyMembersMembershipDetails(membershipDetails.responseBody.d.results);
                                                            dataContext.setMyMemberEmployeeDetails(employeeDetails.responseBody.d.results);

                                                            //vol admins - member notes
                                                            if (dataContext.currentUser[0].VolAdmin){
                                                                const volNotes = await dataHandlerModule.batchGet(`VolunteerNotes?$skip=0&$top=100&$filter=Pernr%20eq%20%27${member.Pernr}%27`, 'Z_ESS_MSS_SRV', 'VolunteerNotes');
                                                                dataContext.setVolAdminMemberNotes(volNotes.responseBody.d.results);
                                                            }

                                                            screenFlowModule.onNavigateToScreen(
                                                                "MyMembersProfile"
                                                            );

                                                            appContext.setShowDialog(false);
                                                            appContext.setShowBusyIndicator(false);
                                                        }
                                                        catch (error) {
                                                            appContext.setShowDialog(false);
                                                            screenFlowModule.onNavigateToScreen('ErrorPage', error);
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
                                                    title={(showTeamMemberSearch ? member.Ename : member.Stext)}
                                                    description={genericFormatter.formatRole(member.MembershipType)}
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
