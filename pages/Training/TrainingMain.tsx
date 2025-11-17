import React, { useState, useEffect } from "react";
import { ScrollView, View } from "react-native";
import CustomText from "../../assets/CustomText";
import { useTheme, List, Divider, IconButton, TextInput, Badge, Chip } from "react-native-paper";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { useDataContext } from "../../helper/DataContext";
import { useAppContext } from "../../helper/AppContext";
import { screenFlowModule } from "../../helper/ScreenFlowModule";
import { dataHandlerModule } from "../../helper/DataHandlerModule";
import * as LucideIcons from "lucide-react-native";
import GlobalStyles from "../../style/GlobalStyles";
import { StackScreenProps } from "@react-navigation/stack";
import { RootStackParamList } from "../../types/AppTypes";

type props = StackScreenProps<RootStackParamList, "TrainingMain">;

const ByDrill = () => {
  const dataContext = useDataContext();
  const appContext = useAppContext();

  const [trainingDrillList, setTrainingDrillList] = useState<any[]>([]);

  const theme = useTheme();

  useEffect(() => {
    setTrainingDrillList(dataContext.drillDetails);
  }, [dataContext.drillDetails]);

  return (
    <ScrollView
      style={{ paddingBottom: 40, backgroundColor: theme.colors.background }}
    >
      {trainingDrillList.length > 0 && (
        <List.Section>
          {trainingDrillList.map((drill: any, i: number) => {
            return (
              <React.Fragment key={`drill_${i}`}>
                <List.Item
                  onPress={async () => {
                    appContext.setShowBusyIndicator(true);
                    appContext.setShowDialog(true);
                    const plans = dataContext.trainingSelectedOrgUnit.Plans;
                    const short = drill.Short;

                    try {
                      const memberDrillCompletions =
                        await dataHandlerModule.batchGet(
                          `MemberDrillCompletions?$filter=Short%20eq%20%27${short}%27%20and%20Zzplans%20eq%20%27${plans}%27`,
                          "Z_VOL_MANAGER_SRV",
                          "MemberDrillCompletions"
                        );
                      appContext.setShowBusyIndicator(false);
                      appContext.setShowDialog(false);

                      if (memberDrillCompletions.responseBody.error) {
                        console.log(
                          "MemberDrillCompletions read error,",
                          memberDrillCompletions.responseBody.error
                        );
                        return;
                        //TODO handle error
                      }

                      const drillData = {
                        drillObj: drill,
                        drillCompletions:
                          memberDrillCompletions.responseBody.d.results,
                      };

                      screenFlowModule.onNavigateToScreen(
                        "TrainingCompletionByDrill",
                        drillData
                      );
                    } catch (error) {
                      console.log("MemberDrillCompletions read error,", error);
                      return;
                      //TODO handle error
                    }
                  }}
                  right={() => (
                    <LucideIcons.ChevronRight color={theme.colors.primary} />
                  )}
                  left={() => {
                    let backgroundColor;

                    switch (drill.Status) {
                      case undefined:
                        backgroundColor = "black";
                        break;

                      case "0":
                        backgroundColor = "red";
                        break;

                      case "1":
                        backgroundColor = "orange";
                        break;

                      case "2":
                        backgroundColor = "green";
                        break;

                      default:
                        backgroundColor = "black";
                        break;
                    }

                    return (
                      <Badge style={{ backgroundColor: backgroundColor }} />
                    );
                  }}
                  style={{ marginLeft: 20 }}
                  key={"item_" + i}
                  title={`${drill.Description}`}
                />
                <Divider />
              </React.Fragment>
            );
          })}
        </List.Section>
      )}
      {trainingDrillList.length == 0 && (
        <CustomText>No training drills</CustomText>
      )}
    </ScrollView>
  );
};

const ByTeamMember = () => {
  const dataContext = useDataContext();
  const appContext = useAppContext();

  const [membersList, setMembersList] = useState<any[]>([]);
  const [showTeamMemberSearch, setShowTeamMemberSearch] = useState(false);

  if (!dataContext.currentUser[0].VolAdmin) {
    useEffect(() => {
      const initialMembersList = filterAndFormatList(dataContext.memberDrillCompletion);
      setMembersList(initialMembersList);
    }, [dataContext.memberDrillCompletion]);
  }
  else {
    useEffect(() => {
      let selectedList = [];
      if (dataContext.volAdminTrainingSearchFilter.firstName || dataContext.volAdminTrainingSearchFilter.lastName || dataContext.volAdminTrainingSearchFilter.pernr) {
        selectedList = filterAndFormatList(dataContext.volAdminMemberDetailSearchResults, 'Ename');
        setShowTeamMemberSearch(true);
      }
      else {
        selectedList = filterAndFormatList(dataContext.memberDrillCompletion);
        setShowTeamMemberSearch(false);
      }

      setMembersList(selectedList);

    }, [dataContext.orgUnitTeamMembers, dataContext.volAdminMemberDetailSearchResults])
  }



  const filterAndFormatList = (results: any[], field?: string) => {

    let dataList = results;
    let compareField = 'LastName';
    if (field) {
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
      <ScrollView
        style={{
          flex: 1,
          paddingBottom: 40,
          backgroundColor: theme.colors.background,
        }}
      >
        {membersList && (
          <List.Section>
            {Object.keys(membersList).map((letter: any, i) => {
              return (
                <React.Fragment key={`header_${letter}_${i}`}>
                  <List.Subheader key={"subheader_" + i}>
                    <CustomText variant="bodyLargeBold">{letter}</CustomText>
                  </List.Subheader>
                  {membersList[letter].map((member: any, ii: number) => {

                    return (
                      <React.Fragment key={`contact_${letter}_${ii}`}>
                        <List.Item
                          onPress={async () => {
                            //reads 1. Brigades (pernr zzplans) 2.VolunteerStatuses (Training, Pernr, CurrentStatus) 3.TrainingDetails(Pernr, Zzplans)
                            appContext.setShowBusyIndicator(true);
                            appContext.setShowDialog(true);

                            try {

                              const pernr = member.Pernr;
                              const plans = member.Zzplans;

                              //if we are showing results from either /Brigades entity due to the search of the member OR from /MemberDrillCompletions
                              const status = (dataContext.currentUser[0].VolAdmin && showTeamMemberSearch) ? member.TrainingStatus : member.Zzvstat;

                              const requests = [
                                dataHandlerModule.batchGet(`TrainingDetails?$filter=Pernr%20eq%20%27${pernr}%27%20and%20Zzplans%20eq%20%27${plans}%27`, 'Z_VOL_MEMBER_SRV', 'TrainingDetails'),
                                dataHandlerModule.batchGet(`VolunteerStatuses?$skip=0&$top=100&$filter=Training%20eq%20true%20and%20CurrentStatus%20eq%20%27${status}%27%20and%20Pernr%20eq%20%27${pernr}%27`, 'Z_VOL_MEMBER_SRV', 'VolunteerStatuses'),
                                dataHandlerModule.batchGet(`Brigades?$filter=Pernr%20eq%20%27${pernr}%27%20and%20Zzplans%20eq%20%27${plans}%27`, 'Z_VOL_MEMBER_SRV', 'Brigades'),
                              ]

                              const results = await Promise.allSettled(requests);
                              const passed = results.every(x => x.status == 'fulfilled');
                              if (!passed) {
                                //TODO
                                appContext.setShowBusyIndicator(false);
                                appContext.setDialogMessage('Error in GET call my members training')
                                return;
                              }

                              const readErrors = results.filter(x => x.value.responseBody.error);
                              if (readErrors.length > 0) {
                                //TODO handle read errors somewhere SAP error
                                appContext.setShowBusyIndicator(false);
                                appContext.setDialogMessage('SAP Error in GET my members training');
                              }

                              const memberTrainingDataObj = {
                                memberData: member,
                                brigades: [],
                                volunteerStatuses: [],
                                trainingDetails: []
                              }

                              for (const x of results) {
                                switch (x.value.entityName) {
                                  case 'Brigades':
                                    memberTrainingDataObj.brigades = x.value.responseBody.d.results;
                                    break;

                                  case 'VolunteerStatuses':
                                    memberTrainingDataObj.volunteerStatuses = x.value.responseBody.d.results;
                                    break;

                                  case 'TrainingDetails':
                                    memberTrainingDataObj.trainingDetails = x.value.responseBody.d.results;
                                    break;
                                }
                              }

                              appContext.setShowBusyIndicator(false);
                              appContext.setShowDialog(false);

                              screenFlowModule.onNavigateToScreen('TrainingCompletionByUser', memberTrainingDataObj)
                            }
                            catch (error) {
                              //TODO handle error
                              console.log(error)
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
                          title={(showTeamMemberSearch ? member.Ename : `${member.FirstName} ${member.LastName}`)}
                          description={(showTeamMemberSearch ? '' : `${member.Stext}`)}
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

const FilterTokens = () => {

  const dataContext = useDataContext();
  const appContext = useAppContext();

  const [filters, setFilters] = useState<any[]>([]);

  useEffect(() => {
    const trainingVolAdminFilter: any = dataContext.volAdminTrainingSearchFilter;
    let currentFilters: any[] = [];

    ['firstName', 'lastName', 'pernr'].forEach(x => {
      if (trainingVolAdminFilter[x]) {
        const filterObj: any = {
          filter: '',
          value: ''
        };
        filterObj.filter = x;
        filterObj.value = trainingVolAdminFilter[x];
        currentFilters.push(filterObj)
      }
    });

    setFilters(currentFilters)

  }, [dataContext.volAdminTrainingSearchFilter])

  return (
    <View style={{ flexDirection: 'row', marginVertical: 10 }}>
      {
        filters.map((x, i) => {
          return (
            <Chip
              key={'chip' + i}
              textStyle={{ fontSize: 15 }}
              style={{ marginRight: 10 }}
              closeIcon={() => <LucideIcons.X size={15} />}
              onClose={async () => {
                //update the datacontext filters first

                const newFilter: any = {
                  ...dataContext.volAdminTrainingSearchFilter,
                  [x.filter]: ''
                }

                appContext.setShowBusyIndicator(true);
                appContext.setShowDialog(true);

                //do a read on members list based on whatever filters left
                if (newFilter.firstName || newFilter.lastName) {
                  //do a read on one of them
                  let query = '';

                  if (newFilter.firstName) {
                    const cleanedFirstname = newFilter.firstName.replace(/\s+/g, '');
                    query = `Brigades?$skip=0&$top=100&$filter=substringof(%27${cleanedFirstname}%27,Vorna)`
                  }
                  else if (newFilter.lastName) {
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
                    dataContext.setVolAdminTrainingSearchFilter(newFilter);
                    appContext.setShowDialog(false);
                  } catch (error) {
                    //TODO handle error
                    console.log(error)
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
                    dataContext.setVolAdminTrainingSearchFilter(newFilter);
                    appContext.setShowDialog(false);
                  } catch (error) {
                    //TODO handle error
                    console.log(error)
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

const TrainingMain = ({ route }: props) => {
  const Tab = createMaterialTopTabNavigator();
  const theme = useTheme();
  const dataContext = useDataContext();
  const appContext = useAppContext();

  const orgUnitList = dataContext.rootOrgUnits;

  const [showTeamMemberSearch, setShowTeamMemberSearch] = useState(false);
  const [showDropDown, setShowDropDown] = useState<boolean>(false);
  const title = route.params!.title;

  if (dataContext.currentUser[0].VolAdmin) {
    useEffect(() => {
      if (dataContext.volAdminTrainingSearchFilter.firstName || dataContext.volAdminTrainingSearchFilter.lastName || dataContext.volAdminTrainingSearchFilter.pernr) {
        setShowTeamMemberSearch(true);
      }
      else {
        setShowTeamMemberSearch(false);
      }
    }, [dataContext.orgUnitTeamMembers, dataContext.volAdminMemberDetailSearchResults])
  }

  return (
    <>
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
          onPress={() => {
            if (dataContext.currentUser[0].VolAdmin) {
              dataContext.setVolAdminTrainingSearchFilter({
                withdrawn: false,
                unit: '',
                station: '',
                lastName: '',
                firstName: '',
                pernr: ''
              })
            }
            screenFlowModule.onGoBack()
          }}
        />
        <View style={{ flexDirection: 'row', flex: 1, alignItems: 'center', justifyContent: 'space-between', paddingRight: 20 }}>
          <CustomText style={{ marginLeft: 20 }} variant="titleLargeBold">
            {title}
          </CustomText>
          <View style={{ flexDirection: 'row' }}>
            {
              (dataContext.currentUser[0].VolAdmin) &&
              <IconButton style={{ marginRight: 10 }} icon={() => <LucideIcons.Search color={theme.colors.primary} size={25} />} size={20} onPress={() => {
                screenFlowModule.onNavigateToScreen('VolAdminSearch', { category: 'training' });
              }} />
            }
            <IconButton
              icon={() => <LucideIcons.Printer />}
              mode='contained-tonal'
              onPress={() => {

                appContext.setShowDialog(true);
                appContext.setShowBusyIndicator(true);

                const url = `Z_VOL_MANAGER_SRV/DrillsPrints(Zzplans='${dataContext.trainingSelectedOrgUnit.Plans}')/$value`;
                const obj = {
                  showSharing: true,
                  displayName: "Training Drills - " + dataContext.trainingSelectedOrgUnit.Short,
                  filePath: url,
                  fileName: `Training_Drills_${dataContext.trainingSelectedOrgUnit.Short}`
                }
                screenFlowModule.onNavigateToScreen('PDFDisplayPage', obj);
              }}
            />
          </View>
        </View>
      </View>
      {
        (!dataContext.currentUser[0].VolAdmin) && (
          <View style={{ marginLeft: 20 }}>
            <CustomText variant='bodyLargeBold'>{dataContext.trainingSelectedOrgUnit.Stext}</CustomText>
          </View>
        )
      }
      {(!dataContext.currentUser[0].VolAdmin) &&
        <View style={{ marginBottom: 20 }}>
          {orgUnitList.length === 1 && (
            <View
              style={{
                paddingBottom: 20,
                paddingLeft: 20,
                borderBottomColor: theme.colors.onSurfaceDisabled,
                borderBottomWidth: 1,
              }}
            >
              <CustomText variant="bodyLargeBold">
                {orgUnitList[0].Short}
              </CustomText>
            </View>
          )}
          {orgUnitList.length > 1 && (
            <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
              <TextInput
                mode="outlined"
                value={`${dataContext.trainingSelectedOrgUnit.Short}`}
                editable={false}
                right={
                  <TextInput.Icon
                    icon={() => {
                      return <LucideIcons.ChevronDown />;
                    }}
                    onPress={() => {
                      setShowDropDown(!showDropDown);
                    }}
                  />
                }
              />
              {showDropDown && (
                <List.Section
                  style={{
                    backgroundColor: theme.colors.onSecondary,
                    position: "absolute",
                    width: "100%",
                    top: 50,
                    left: 20,
                    zIndex: 100,
                    boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px",
                  }}
                >
                  {orgUnitList.map((x, i) => {
                    return (
                      <React.Fragment key={'Fragment_' + i}>
                        <List.Item
                          style={{
                            backgroundColor: (x.Plans === dataContext.trainingSelectedOrgUnit.Plans) ? theme.colors.surfaceVariant : theme.colors.onPrimary
                          }}
                          key={i}
                          title={`${x.Short} ${x.Stext}`}
                          onPress={async () => {
                            dataContext.setTrainingSelectedOrgUnit(x);
                            setShowDropDown(!showDropDown);

                            appContext.setShowBusyIndicator(true);
                            appContext.setShowDialog(true);

                            //do a read on both memberdrill details and drill completion
                            const plans = x.Plans;

                            try {
                              const memberDrillDownCompletion = await dataHandlerModule.batchGet(`MemberDrillCompletions?$skip=0&$top=100&$filter=Zzplans%20eq%20%27${plans}%27`, 'Z_VOL_MANAGER_SRV', 'MemberDrillCompletions');
                              const drillDetails = await dataHandlerModule.batchGet(`DrillDetails?$skip=0&$top=100&$filter=Zzplans%20eq%20%27${plans}%27`, 'Z_VOL_MANAGER_SRV', 'DrillDetails');
                              appContext.setShowBusyIndicator(false);

                              if (memberDrillDownCompletion.responseBody.error || drillDetails.responseBody.error) {
                                let sMessage = '';
                                memberDrillDownCompletion.responseBody.error ? sMessage += (memberDrillDownCompletion.responseBody.error.message.value + `/n`) : '';
                                drillDetails.responseBody.error ? sMessage += (drillDetails.responseBody.error.message.value + `/n`) : '';

                                appContext.setDialogMessage(sMessage);
                                return;
                              }

                              dataContext.setDrillDetails(drillDetails.responseBody.d.results);
                              dataContext.setMemberDrillCompletion(memberDrillDownCompletion.responseBody.d.results);
                              appContext.setShowDialog(false);
                            }
                            catch (error) {
                              //TODO handle error
                              console.log(error);
                              appContext.setShowBusyIndicator(false);
                              appContext.setShowDialog(false);
                            }

                          }}
                        />
                        <Divider key={'divider' + i} />
                      </React.Fragment>
                    );
                  })}
                </List.Section>
              )}
            </View>
          )}
        </View>
      }
      {
        (dataContext.currentUser[0].VolAdmin) && (
          <View style={{ paddingHorizontal: 20 }}>
            <View style={{ marginLeft: 10 }}>
              <CustomText style={{ marginBottom: 10 }} variant='bodyMediumBold'>Showing results for :</CustomText>
              {
                (!showTeamMemberSearch) && (
                  <CustomText variant='bodyLarge'>{dataContext.volAdminLastSelectedOrgUnit[0].Stext}</CustomText>
                )
              }
              {
                (showTeamMemberSearch) && (
                  <FilterTokens />
                )
              }
            </View>
          </View>
        )
      }
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIndicatorStyle: {
            backgroundColor: theme.colors.primary,
          },
          tabBarLabel: ({ focused }) => {
            let formattedRouteName;

            switch (route.name) {
              case "TrainingListByUser":
                formattedRouteName = "By Team Member";
                break;
              case "TrainingListByDrill":
                formattedRouteName = "By Drill";
                break;
            }

            let iconColor = focused
              ? theme.colors.primary
              : theme.colors.outline;
            return (
              <CustomText variant="bodyLarge" style={{ color: iconColor }}>
                {formattedRouteName}
              </CustomText>
            );
          },
        })}
      >
        <Tab.Screen 
          name="TrainingListByUser" 
          component={ByTeamMember} 
          listeners={
            //only attach listener if vol admin
            (dataContext.currentUser[0].VolAdmin) ?
            ({ navigation, route }) => ({
              tabPress: (e) => {
                //either show current unit or the search chips
                if (dataContext.volAdminTrainingSearchFilter.firstName || dataContext.volAdminTrainingSearchFilter.lastName || dataContext.volAdminTrainingSearchFilter.pernr) {
                  setShowTeamMemberSearch(true);
                }
                else {
                  setShowTeamMemberSearch(false);
                }
              }
            }) : undefined
          }
        />
        <Tab.Screen
          name="TrainingListByDrill"
          component={ByDrill}
          listeners={
            //only attach listener if vol admin
            (dataContext.currentUser[0].VolAdmin) ?
            ({ navigation, route }) => ({
              tabPress: (e) => {
                setShowTeamMemberSearch(false);
              }
            }) : undefined
          } 
        />
      </Tab.Navigator>
    </>
  );
};

export default TrainingMain;
