import React, { useState, useEffect } from "react";
import { ScrollView, View } from "react-native";
import CustomText from "../../assets/CustomText";
import {
  useTheme,
  List,
  Divider,
  IconButton,
  TextInput,
  Searchbar,
  Badge
} from "react-native-paper";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { useDataContext } from "../../helper/DataContext";
import { useAppContext } from "../../helper/AppContext";
import { ScreenFlowModule, screenFlowModule } from "../../helper/ScreenFlowModule";
import { dataHandlerModule } from "../../helper/DataHandlerModule";
import * as LucideIcons from "lucide-react-native";
import GlobalStyles from "../../style/GlobalStyles";

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
                    <LucideIcons.ChevronRight color={theme.colors.outline} />
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

  type listType = Record<string, Record<string, string>[]> | undefined;

  const [searchValue, setSearchValue] = useState("");
  const [membersList, setMembersList] = useState<any[]>([]);

  useEffect(() => {
    const initialMembersList = filterAndFormatList("");
    setMembersList(initialMembersList);
  }, [dataContext.memberDrillCompletion]);

  const filterAndFormatList = (query: string) => {
    let filteredList;

    if (query) {
      filteredList = dataContext.memberDrillCompletion.filter((x) => {
        if (x.FirstName.toLowerCase().includes(query.toLowerCase()) || x.LastName.toLowerCase().includes(query.toLowerCase())) {
          return x;
        }
      });
    } else {
      filteredList = dataContext.memberDrillCompletion;
    }

    const sortedList = [...filteredList].sort((a, b) =>
      a.LastName.localeCompare(b.LastName)
    );

    const grouped = sortedList.reduce((accumulator, currentValue) => {
      const firstLetter = currentValue.LastName[0].toUpperCase();
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
                              const status = member.Zzvstat;

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
                                memberData : member,
                                brigades : [],
                                volunteerStatuses : [],
                                trainingDetails : []
                              }

                              for (const x of results){
                                switch (x.value.entityName){
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
                          title={`${member.FirstName} ${member.LastName}`}
                          description={`${member.Stext}`}
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

const TrainingMain = () => {
  const Tab = createMaterialTopTabNavigator();
  const theme = useTheme();
  const dataContext = useDataContext();
  const orgUnitList = dataContext.rootOrgUnits;

  const [showDropDown, setShowDropDown] = useState<boolean>(false);

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
          onPress={() => screenFlowModule.onGoBack()}
        />
        <CustomText style={{ marginLeft: 20 }} variant="titleLargeBold">
          Training
        </CustomText>
      </View>
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
              value={dataContext.trainingSelectedOrgUnit.Short}
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
                    <List.Item
                      key={i}
                      title={x.Short}
                      onPress={() => {
                        dataContext.setTrainingSelectedOrgUnit(x);
                        setShowDropDown(!showDropDown);
                      }}
                    />
                  );
                })}
              </List.Section>
            )}
          </View>
        )}
      </View>
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
        <Tab.Screen name="TrainingListByUser" component={ByTeamMember} />
        <Tab.Screen name="TrainingListByDrill" component={ByDrill} />
      </Tab.Navigator>
    </>
  );
};

export default TrainingMain;
