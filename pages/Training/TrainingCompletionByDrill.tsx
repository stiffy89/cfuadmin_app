import { View } from "react-native";
import CustomText from "../../assets/CustomText";
import { StackScreenProps } from "@react-navigation/stack";
import { RootStackParamList } from "../../types/AppTypes";
import {
  registerTranslation,
  enGB,
  DatePickerModal,
} from "react-native-paper-dates";
import {
  useTheme,
  IconButton,
  DataTable,
  Badge,
  Button,
  TextInput,
  Portal,
  Dialog,
} from "react-native-paper";
import { useDataContext } from "../../helper/DataContext";
import { useState, useEffect, useRef } from "react";
import { screenFlowModule } from "../../helper/ScreenFlowModule";
import GenericFormatter from "../../helper/GenericFormatters";
import GlobalStyles from "../../style/GlobalStyles";
import * as LucideIcons from "lucide-react-native";
import { useAppContext } from "../../helper/AppContext";
import { dataHandlerModule } from "../../helper/DataHandlerModule";

type props = StackScreenProps<RootStackParamList, "TrainingCompletionByDrill">;

const TrainingCompletionByDrill = ({ route }: props) => {
  registerTranslation("en-GB", enGB);
  const theme = useTheme();
  const appContext = useAppContext();
  const dataContext = useDataContext();

  const [showPicker, setShowPicker] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [page, setPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [trainingCompletions, setTrainingCompletions] = useState<any[]>([]);

  const selectedRecordToEdit = useRef<any | undefined>(undefined);
  const updatedRecords = useRef<any[]>([]);

  const today = new Date();
  const endOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  let drillCompletions = route.params!.drillCompletions;

  useEffect(() => {
    setTrainingCompletions(drillCompletions);
  }, []);

  const genericFormatter = new GenericFormatter();

  const calculateMaxRows = (pageHeight: number) => {
    const remainingHeight = pageHeight - 290; // e.g. 148 for header, table header + pagination + save button
    const newItemsPerPage = Math.floor(remainingHeight / 48);
    setItemsPerPage(newItemsPerPage);
  };

  const from = page * itemsPerPage;
  const to = Math.min((page + 1) * itemsPerPage, trainingCompletions!.length);

  const statusBadge = (item: any) => {
    let status = item.Status;
    let backgroundColor;

    switch (status) {
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
      <View style={{ flex: 1, justifyContent: "center", marginRight: 20 }}>
        <Badge style={{ backgroundColor: backgroundColor }} />
      </View>
    );
  };

  return (
    <>
      <Portal>
        <Dialog visible={showCancelDialog} dismissable={false}>
          <Dialog.Title>Cancel Changes</Dialog.Title>
          <Dialog.Content>
            <CustomText variant="bodyMedium">Are you sure you want to discard you changes?</CustomText>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowCancelDialog(false)}>Go Back</Button>
            <Button onPress={() => {
              setIsEditing(false);
              setShowCancelDialog(false);
              setTrainingCompletions(drillCompletions)
              updatedRecords.current = [];
            }}>Discard</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      <View
        onLayout={(e) => calculateMaxRows(e.nativeEvent.layout.height)}
        style={GlobalStyles.page}
      >
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
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              flex: 1,
            }}
          >
            <CustomText style={{ marginLeft: 20 }} variant="titleLargeBold">
              Training History
            </CustomText>
            {!isEditing && (
              <IconButton
                style={{ marginRight: 20 }}
                icon={() => (
                  <LucideIcons.Pencil color={theme.colors.primary} size={20} />
                )}
                onPress={() => {
                  if (!isEditing) {
                    setIsEditing(true);
                  }
                }}
              />
            )}
            {isEditing && (
              <Button
                onPress={() => {
                  setShowCancelDialog(true);
                }}
              >
                Cancel Edit
              </Button>
            )}
          </View>
        </View>
        <View style={{ marginLeft: 20 }}>
          <CustomText>{route.params!.drillObj.Drill}</CustomText>
          <CustomText variant='bodyLargeBold'>{route.params!.drillObj.Description}</CustomText>
        </View>
        <View style={{ flex: 1, justifyContent: "space-between" }}>
          <DataTable>
            <DataTable.Header>
              <DataTable.Title style={{ flex: 0.5 }}> </DataTable.Title>
              <DataTable.Title style={{ flex: 2 }}>Name</DataTable.Title>
              <DataTable.Title style={{ flex: 2 }}>
                Date Completed
              </DataTable.Title>
            </DataTable.Header>
            {trainingCompletions!.slice(from, to).map((item, i) => {
              return (
                <DataTable.Row key={i}>
                  <DataTable.Cell
                    style={{ flex: 0.5, justifyContent: "flex-start" }}
                  >
                    {statusBadge(item)}
                  </DataTable.Cell>
                  <DataTable.Cell style={{ flex: 2 }}>
                    {item.Emnam}
                  </DataTable.Cell>
                  <DataTable.Cell style={{ flex: 2 }}>
                    {isEditing ? (
                      <View style={{ flex: 1 }}>
                        <TextInput
                          style={{
                            height: 40,
                            backgroundColor: theme.colors.background,
                          }}
                          mode="flat"
                          underlineColor="transparent"
                          editable={false}
                          value={genericFormatter.formatFromEdmDate(item.Start)}
                          right={
                            <TextInput.Icon
                              onPress={() => {
                                selectedRecordToEdit.current = item;
                                setShowPicker(!showPicker);
                              }}
                              icon={() => <LucideIcons.Calendar size={15} />}
                            />
                          }
                        />
                      </View>
                    ) : (
                      <CustomText>
                        {genericFormatter.formatFromEdmDate(item.Start)}
                      </CustomText>
                    )}
                  </DataTable.Cell>
                </DataTable.Row>
              );
            })}
            <DataTable.Pagination
              page={page}
              numberOfPages={Math.ceil(
                trainingCompletions!.length / itemsPerPage
              )}
              onPageChange={(page) => setPage(page)}
              label={`${from + 1}-${to} of ${trainingCompletions!.length}`}
              numberOfItemsPerPage={itemsPerPage}
              showFastPaginationControls
              selectPageDropdownLabel={"Rows per page"}
            />
          </DataTable>
          <DatePickerModal
            locale="en-GB"
            date={
              selectedRecordToEdit.current == undefined
                ? new Date()
                : genericFormatter.formatFromEdmToJSDate(
                  selectedRecordToEdit.current.Start
                )
            }
            visible={showPicker}
            mode="single"
            saveLabel="Select Date"
            validRange={{
              startDate: undefined,
              endDate: endOfToday,
              disabledDates: undefined,
            }}
            onConfirm={(params) => {
              //get the id of the selected record
              const calendarDate = params.date;
              if (!calendarDate) {
                // no date selected, just close the picker
                setShowPicker(false);
                return;
              }

              const newDateObj = new Date(
                calendarDate.getFullYear(),
                calendarDate.getMonth(),
                calendarDate.getDate()
              );
              const edmDate = genericFormatter.formatToEdmDate(newDateObj);

              const updatedList = trainingCompletions.map((x) => {
                if (x.__metadata.id == selectedRecordToEdit.current.__metadata.id) {
                  x.Start = edmDate;
                  updatedRecords.current.push(x);
                }
                return x;
              });

              setTrainingCompletions(updatedList);
              setShowPicker(!showPicker);
            }}
            onDismiss={() => setShowPicker(!showPicker)}
          />
          {isEditing && (
            <View style={{ alignItems: "center" }}>
              <Button
                style={{ width: "80%", marginBottom: 30 }}
                mode="contained"
                onPress={async () => {
                  appContext.setShowBusyIndicator(true);
                  appContext.setShowDialog(true);

                  const updatePromises = updatedRecords.current.map(x => {
                    const uriPath = (x.__metadata.uri.split('Z_VOL_MANAGER_SRV')[1]).substring(1);
                    return dataHandlerModule.batchSingleUpdate(uriPath, "Z_VOL_MANAGER_SRV", x);
                  })

                  const results = await Promise.allSettled(updatePromises);
                  //if we have any fails - its a critical error
                  const passed = results.every(x => x.status == 'fulfilled');
                  if (!passed) {
                    appContext.setShowDialog(false);
                    screenFlowModule.onNavigateToScreen('ErrorPage', {
                      isAxiosError: false,
                      message: "Hang on, we found an error. There was a problem in updating your data. Please go back and try again or contact your IT administrator for further assistance."
                    });
                    return;
                  }

                  const sapErrors = results.filter(x => x.value.responseBody.error);
                  if (sapErrors.length > 0) {
                    appContext.setShowDialog(false);
                    screenFlowModule.onNavigateToScreen('ErrorPage', {
                      isAxiosError: false,
                      message: "Hang on, we found an error. There was a problem in updating your data. Please go back and try again or contact your IT administrator for further assistance."
                    });
                    return;
                  }

                  const plans = dataContext.trainingSelectedOrgUnit.Plans;

                  const memberDrillCompletions = await dataHandlerModule.batchGet(`MemberDrillCompletions?$filter=Short%20eq%20%27${route.params?.drillObj.Short}%27%20and%20Zzplans%20eq%20%27${plans}%27`, "Z_VOL_MANAGER_SRV", "MemberDrillCompletions");
                  
                  const drillDetails = await dataHandlerModule.batchGet(`DrillDetails?$skip=0&$top=100&$filter=Zzplans%20eq%20%27${plans}%27`, 'Z_VOL_MANAGER_SRV', 'DrillDetails');
                  

                  drillCompletions = memberDrillCompletions.responseBody.d.results
                  setTrainingCompletions(drillCompletions);

                  dataContext.setDrillDetails(drillDetails.responseBody.d.results)

                  setIsEditing(false);
                  appContext.setShowBusyIndicator(false);
                  appContext.setShowDialog(false);
                }}
              >
                Save
              </Button>
            </View>
          )}
        </View>
      </View>
    </>
  );
};

export default TrainingCompletionByDrill;
