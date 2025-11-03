import React, {useState, useEffect} from 'react';
import { ScrollView, View } from 'react-native';
import CustomText from '../../assets/CustomText';
import { useTheme, List, Divider, IconButton, TextInput, Searchbar } from 'react-native-paper';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useDataContext } from '../../helper/DataContext';
import { useAppContext } from '../../helper/AppContext';
import { screenFlowModule } from '../../helper/ScreenFlowModule';
import { dataHandlerModule } from '../../helper/DataHandlerModule';
import * as LucideIcons from 'lucide-react-native';
import GlobalStyles from '../../style/GlobalStyles';

const ByDrill = () => {
    const dataContext = useDataContext();
    const [trainingDrillList, setTrainingDrillList] = useState<any[]>([]);

    const theme = useTheme();

    return (
        <ScrollView style={{paddingBottom: 40, backgroundColor: theme.colors.background}}>
            {
                (trainingDrillList.length > 0) && (
                    <List.Section>
                        {
                            trainingDrillList.map((drill : any, i : number) => {
                                return (
                                    <React.Fragment key={`drill_${i}`}>
                                        <Divider/>
                                        <List.Item onPress={() => {
                                            screenFlowModule.onNavigateToScreen('MyUnitContactDetail', drill)
                                            }} right={() => <LucideIcons.ChevronRight color={theme.colors.outline}/>} left={() => <View style={{backgroundColor: theme.colors.surfaceDisabled, padding: 5, borderRadius: 50}}><LucideIcons.User color={theme.colors.outline}/></View>} style={{marginLeft: 20}} key={'item_' + ii} title={`${contact.Vorna} ${contact.Nachn}`}/>
                                        <Divider/>
                                    </React.Fragment>
                                )
                            })
                        }
                    </List.Section>
                )
            }
            {
                (trainingDrillList.length == 0) && (
                    <CustomText>No training drills</CustomText>
                )
            }
        </ScrollView>
    )
}

const ByTeamMember = () => {
    const dataContext = useDataContext();
    const appContext = useAppContext();

    type listType = Record<string, Record<string, string>[]> | undefined;

    const [searchValue, setSearchValue] = useState("");
    const [membersList, setMembersList] = useState<listType>(undefined);
    const [orgUnitList, setOrgUnitList] = useState<any[]>([]);
    const [selectedOrgUnit, setSelectedOrgUnit] = useState<any>(undefined);
    const [showDropDown, setShowDropDown] = useState<boolean>(false);

    useEffect(() => {
        setOrgUnitList(dataContext.rootOrgUnits);
        setSelectedOrgUnit(dataContext.rootOrgUnits[0]);
        const filteredList = filterAndFormatList("");
        setMembersList(filteredList);
    }, []);

    //filter our contacts
    const filterAndFormatList = (query: string) => {
        let filteredList;

        if (query) {
            filteredList = dataContext.orgUnitTeamMembers.filter((x) => {
                if (
                    x.Stext.toLowerCase().includes(query.toLowerCase()) ||
                    x.Stext.toLowerCase().includes(query.toLowerCase())
                ) {
                    return x;
                }
            });
        } else {
            filteredList = dataContext.orgUnitTeamMembers;
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
            {orgUnitList.length === 1 && (
                <View style={{paddingVertical: 20, paddingLeft: 20, borderBottomColor: theme.colors.onSurfaceDisabled, borderBottomWidth: 1}}>
                    <CustomText variant="bodyLargeBold">{orgUnitList[0].Short}</CustomText>
                </View>
            )}
            {orgUnitList.length > 1 && (
                <View style={{paddingHorizontal: 20, marginTop: 20}}>
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
                    { (showDropDown) &&
                    <List.Section style={{backgroundColor: theme.colors.onSecondary, position: 'absolute', width: '100%', top: 50, left: 20, zIndex: 100, boxShadow: 'rgba(99, 99, 99, 0.2) 0px 2px 8px 0px'}}>
                        {orgUnitList.map((x, i) => {
                            return (
                                <List.Item key={i} title={x.Short} onPress={() => {
                                    setSelectedOrgUnit(x);
                                    setShowDropDown(!showDropDown);
                                }}/>
                            )
                        })}
                    </List.Section>
                    }
                </View>
            )}
            <Searchbar
                style={{
                    marginVertical: 20,
                    marginHorizontal: 20,
                    backgroundColor: theme.colors.surfaceDisabled,
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
                style={{flex: 1, paddingBottom: 40, backgroundColor: theme.colors.background }}
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
                                                    dataContext.setCurrentMyMemberZzPlan(member.Zzplans);

                                                    try {
                                                        const membershipDetails = await dataHandlerModule.batchGet(`MembershipDetails?$filter=Pernr%20eq%20%27${member.Pernr}%27%20and%20Zzplans%20eq%20%27${member.Zzplans}%27`, 'Z_VOL_MEMBER_SRV', 'MembershipDetails');
                                                        const employeeDetails = await dataHandlerModule.batchGet(`EmployeeDetails?$filter=Pernr%20eq%20%27${member.Pernr}%27%20and%20Zzplans%20eq%20%27${member.Zzplans}%27`, 'Z_ESS_MSS_SRV', 'Users');

                                                        if (!membershipDetails.responseBody.error){
                                                            dataContext.setMyMembersMembershipDetails(membershipDetails.responseBody.d.results);
                                                        }  
                                                        else {
                                                            //TODO handle error properly
                                                            console.log(membershipDetails.responseBody.error)
                                                        }

                                                        if (!employeeDetails.responseBody.error){
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
                                                    catch (error){
                                                        //TODO handle error
                                                        appContext.setShowDialog(false);
                                                        appContext.setShowBusyIndicator(false);
                                                        throw error;
                                                    }
                                                    
                                                }}
                                                right={() => (
                                                    <LucideIcons.ChevronRight
                                                        color={theme.colors.outline}
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
}


const TrainingMain = () => {
    const Tab = createMaterialTopTabNavigator();
    const theme = useTheme();

    const isTeamManager = true;

    return (
        <>
           <View style={{flexDirection: 'row', alignItems: 'center', marginVertical: 20}}>
                <IconButton icon={() => <LucideIcons.ChevronLeft color={theme.colors.primary} size={25}/>} size={20} onPress={() => screenFlowModule.onGoBack()} />
                <CustomText style={{marginLeft: 20}} variant='titleLargeBold'>Training</CustomText>
            </View>
            <Tab.Navigator
                screenOptions={({ route }) => ({
                    tabBarIndicatorStyle: {
                        backgroundColor: theme.colors.primary
                    },
                    tabBarLabel: ({ focused }) => {

                        let formattedRouteName;

                        switch (route.name) {
                            case 'TrainingListByUser':
                                formattedRouteName = 'By Team Member';
                                break;
                            case 'TrainingListByDrill':
                                formattedRouteName = 'By Drill';
                                break;
                        }

                        let iconColor = focused ? theme.colors.primary : theme.colors.outline;
                        return <CustomText variant='bodyLarge' style={{ color: iconColor }}>{formattedRouteName}</CustomText>
                    }
                })}
            >
                <Tab.Screen
                    name='TrainingListByUser'
                    component={ByTeamMember}
                />
                <Tab.Screen
                    name='TrainingListByDrill'
                    component={ByDrill}
                />
            </Tab.Navigator>
        </>
    )
}

export default TrainingMain;