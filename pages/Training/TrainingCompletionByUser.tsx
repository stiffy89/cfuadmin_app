import React, { useState, useEffect, useRef } from "react";
import { View, ScrollView } from "react-native";
import CustomText from "../../assets/CustomText";
import { useTheme, IconButton, DataTable, TextInput, Button, List, Portal, Dialog } from "react-native-paper";
import * as LucideIcons from "lucide-react-native";
import { screenFlowModule } from "../../helper/ScreenFlowModule";
import { StackScreenProps } from "@react-navigation/stack";
import { RootStackParamList } from "../../types/AppTypes";
import GenericFormatter from "../../helper/GenericFormatters";
import { registerTranslation, enGB, DatePickerModal } from "react-native-paper-dates";
import { useAppContext } from "../../helper/AppContext";
import { useDataContext } from "../../helper/DataContext";
import { dataHandlerModule } from "../../helper/DataHandlerModule";

type props = StackScreenProps<RootStackParamList, 'TrainingCompletionByUser'>;

const TrainingCompletionByUser = ({ route }: props) => {
    registerTranslation("en-GB", enGB);
    const theme = useTheme();
    const appContext = useAppContext();
    const dataContext = useDataContext();

    const genericFormatter = new GenericFormatter();

    let brigadeInitialData = route.params!.brigades[0];
    let memberInitialData: any = route.params!.memberData;
    let volInitialStatuses = route.params!.volunteerStatuses;
    let initialTrainingDetails = route.params!.trainingDetails[0];

    //check to see if our member data is from a team member search (vol admin searching) because data is coming from
    ///Brigades entity rather than /MemberDrillCompletions -> do this by checking the path of the memberData uri being passed in
    if (memberInitialData.__metadata.id.includes('Brigades')) {
        //split up Ename to first and last name so that the binding for first and last name is the same as /MemberDrillCompletions
        let Ename = memberInitialData.Ename.split(" ");
        memberInitialData.FirstName = Ename[0];
        memberInitialData.LastName = Ename[1];
    }


    //const member = route.params!.memberData;
    const [isEditing, setIsEditing] = useState(false);
    const [member, setMember] = useState<any | undefined>(undefined);
    const [brigades, setBrigades] = useState<any | undefined>(undefined);
    const [volunteerStatuses, setVolunteerStatuses] = useState<any[]>([]);
    const [trainingDetails, setTrainingDetails] = useState<any | undefined>(undefined);
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const selectedRecordToEdit = useRef<string>('');
    const [showPicker, setShowPicker] = useState(false);
    const [showMemberStatusMenu, setShowMemberStatusMenu] = useState(false);
    const [dialogMessage, setDialogMessage] = useState('Are you sure you want to discard you changes?');
    const [showDialogActionButton, setShowDialogActionButton] = useState(true);

    const today = new Date();
    const endOfToday = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
    );

    useEffect(() => {
        setMember(memberInitialData); //- single
        setBrigades(brigadeInitialData); //- single
        setVolunteerStatuses(volInitialStatuses) // - multiple
        setTrainingDetails(initialTrainingDetails) // - single
    }, [])

    if (!member || !brigades || !trainingDetails) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <CustomText>Loading...</CustomText>
            </View>
        );
    }

    const trainingStatus = (expiryDate: string, status: string) => {
        if (expiryDate === null || expiryDate === undefined) {
            return ''
        }

        const expiryJSDate = genericFormatter.formatFromEdmToJSDate(expiryDate);
        if (expiryJSDate) {
            if (expiryJSDate <= new Date()) {
                switch (status) {
                    case "02": //operational
                        return 'Expired';

                    case "03": //Associate
                        return '';

                    case "09": //In training
                        return '';
                }
            }
            else {
                return 'Valid'
            }
        }
        else {
            return ''
        }
    }

    const selectedEditDate = (fieldName: string) => {
        switch (fieldName) {
            case 'Start1':
                return genericFormatter.formatFromEdmToJSDate(trainingDetails.Start1);

            case 'Start2':
                return genericFormatter.formatFromEdmToJSDate(trainingDetails.Start2);

            case 'Start3':
                return genericFormatter.formatFromEdmToJSDate(trainingDetails.Start3);

            case 'Start4':
                return genericFormatter.formatFromEdmToJSDate(trainingDetails.Start4);

            case 'Start5':
                return genericFormatter.formatFromEdmToJSDate(trainingDetails.Start5);

            case 'Start6':
                return genericFormatter.formatFromEdmToJSDate(trainingDetails.Start6);

            case 'Startsr':
                return genericFormatter.formatFromEdmToJSDate(trainingDetails.Startsr);

            case 'OpReadyCheckDate':
                return genericFormatter.formatFromEdmToJSDate(brigades.OpReadyCheckDate);
        }
    }

    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <Portal>
                <Dialog visible={showCancelDialog} dismissable={false}>
                    <Dialog.Title>{
                        showDialogActionButton ? '' : 'Cancel Changes'}</Dialog.Title>
                    <Dialog.Content>
                        <CustomText variant="bodyMedium">{dialogMessage}</CustomText>
                    </Dialog.Content>
                    <Dialog.Actions>
                        {
                            !showDialogActionButton &&
                            <Button onPress={() => {
                                setShowCancelDialog(false)
                                setShowDialogActionButton(true);
                                setDialogMessage('Are you sure you want to discard you changes?')
                            }}>OK</Button>
                        }
                        {
                            showDialogActionButton &&
                            <Button onPress={() => setShowCancelDialog(false)}>Go Back</Button>
                        }
                        {
                            showDialogActionButton &&
                            <Button onPress={() => {
                                setIsEditing(false);
                                setShowCancelDialog(false);
                                setTrainingDetails(initialTrainingDetails);

                            }}>Discard</Button>
                        }
                    </Dialog.Actions>
                </Dialog>
            </Portal>
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
                <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <CustomText style={{ marginLeft: 20 }} variant="titleLargeBold">
                        Training
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
            <View style={{ marginBottom: 20 }}>
                <View
                    style={{ flexDirection: "row", alignItems: 'center' }}
                >
                    <View
                        style={{
                            padding: 20,
                            backgroundColor: "#d3d3d3ff",
                            borderRadius: 50,
                            marginLeft: 20
                        }}
                    >
                        <LucideIcons.UserRound size={50} />
                    </View>
                    <View style={{ alignItems: 'flex-start', marginLeft: 20 }}>
                        <CustomText
                            variant="displaySmallBold"
                            style={{ textAlign: "center", marginTop: 20 }}
                        >
                            {member.FirstName}
                        </CustomText>
                        <CustomText
                            variant="displaySmallBold"
                            style={{ textAlign: "center", marginTop: 20 }}
                        >
                            {member.LastName}
                        </CustomText>
                        <CustomText
                            variant="titleLarge"
                            style={{ textAlign: "center", marginTop: 10 }}
                        >
                            {member.Pernr}
                        </CustomText>
                    </View>
                </View>
                <View style={{ marginTop: 20, flexDirection: 'row', justifyContent: 'space-evenly' }}>
                    {!isEditing &&
                        <View>
                            <CustomText style={{ marginBottom: 10 }} variant='labelMedium'>Member Status :</CustomText>
                            <CustomText variant='bodyLarge'>{trainingDetails.Stext}</CustomText>
                        </View>
                    }
                    <View>
                        <CustomText style={{ marginBottom: 10 }} variant='labelMedium'>Joined :</CustomText>
                        <CustomText variant='bodyLarge'>{genericFormatter.formatFromEdmDate(trainingDetails.Joindate)}</CustomText>
                    </View>
                    <View>
                        <CustomText style={{ marginBottom: 10 }} variant='labelMedium'>Inducted :</CustomText>
                        <CustomText variant='bodyLarge'>{genericFormatter.formatFromEdmDate(trainingDetails.Inducted)}</CustomText>
                    </View>
                </View>
                {
                    isEditing && (
                        <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
                            <TextInput
                                label="Member Status"
                                mode="outlined"
                                value={trainingDetails.Stext}
                                editable={false}
                                right={
                                    <TextInput.Icon
                                        icon={() => {
                                            if (showMemberStatusMenu) {
                                                return <LucideIcons.ChevronUp />;
                                            } else {
                                                return <LucideIcons.ChevronDown />;
                                            }
                                        }}
                                        onPress={() => {
                                            setShowMemberStatusMenu(!showMemberStatusMenu);
                                        }}
                                    />
                                }
                            />
                            {showMemberStatusMenu && (
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
                                    {volunteerStatuses.map((x, i) => {
                                        return (
                                            <List.Item
                                                key={i}
                                                title={x.Stext}
                                                onPress={() => {
                                                    if (x.Statu == '02') {
                                                        //check to see if we are currently 02
                                                        if (initialTrainingDetails.Zzvstat !== '02') {
                                                            //check to see if trainingDetails all have complete dates
                                                            const startDates = ['Start1', 'Start2', 'Start3', 'Start4', 'Start5', 'Start6'];

                                                            const passed = startDates.every(x => {
                                                                return trainingDetails[x] //-> if its not null, then return true and we can pass
                                                            });

                                                            if (!passed) {
                                                                setDialogMessage('To change to Operational status, all six drills must be completed');
                                                                setShowDialogActionButton(false);
                                                                setShowCancelDialog(true);
                                                                setShowMemberStatusMenu(!showMemberStatusMenu);
                                                                return;
                                                            }
                                                        }
                                                    }


                                                    setTrainingDetails({
                                                        ...trainingDetails,
                                                        Stext: x.Stext,
                                                        Zzvstat: x.Statu
                                                    })
                                                    setShowMemberStatusMenu(!showMemberStatusMenu);
                                                }}
                                            />
                                        );
                                    })}
                                </List.Section>
                            )}
                        </View>
                    )
                }
            </View>
            <ScrollView style={{ backgroundColor: theme.colors.onPrimary }} contentContainerStyle={{ paddingBottom: 40 }}>
                <DataTable>
                    <DataTable.Header>
                        <DataTable.Title style={{ flex: 1 }}>Status</DataTable.Title>
                        <DataTable.Title style={{ flex: 2 }}>Name</DataTable.Title>
                        <DataTable.Title style={{ flex: 2.5 }}>Date Completed</DataTable.Title>
                    </DataTable.Header>
                    <DataTable.Row>
                        <DataTable.Cell
                            style={{ flex: 1, justifyContent: "flex-start" }}
                        >
                            {!isEditing && trainingStatus(trainingDetails.Expiry1, trainingDetails.Zzvstat)}
                        </DataTable.Cell>
                        <DataTable.Cell style={{ flex: 2 }}>
                            {`Drill 1 ` + (isEditing ? 'Completed' : 'Expiry')}
                        </DataTable.Cell>
                        <DataTable.Cell style={{ flex: 2.5 }}>
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
                                        value={genericFormatter.formatFromEdmDate(trainingDetails.Start1)}
                                        right={
                                            <TextInput.Icon
                                                onPress={() => {
                                                    selectedRecordToEdit.current = 'Start1';
                                                    setShowPicker(!showPicker);
                                                }}
                                                icon={() => <LucideIcons.Calendar size={15} />}
                                            />
                                        }
                                    />
                                </View>
                            ) : (
                                <CustomText>
                                    {genericFormatter.formatFromEdmDate(trainingDetails.Expiry1)}
                                </CustomText>
                            )}
                        </DataTable.Cell>
                    </DataTable.Row>
                    <DataTable.Row>
                        <DataTable.Cell
                            style={{ flex: 1, justifyContent: "flex-start" }}
                        >
                            {!isEditing && trainingStatus(trainingDetails.Expiry2, trainingDetails.Zzvstat)}
                        </DataTable.Cell>
                        <DataTable.Cell style={{ flex: 2 }}>
                            {`Drill 2 ` + (isEditing ? 'Completed' : 'Expiry')}
                        </DataTable.Cell>
                        <DataTable.Cell style={{ flex: 2.5 }}>
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
                                        value={genericFormatter.formatFromEdmDate(trainingDetails.Start2)}
                                        right={
                                            <TextInput.Icon
                                                onPress={() => {
                                                    selectedRecordToEdit.current = 'Start2';
                                                    setShowPicker(!showPicker);
                                                }}
                                                icon={() => <LucideIcons.Calendar size={15} />}
                                            />
                                        }
                                    />
                                </View>
                            ) : (
                                <CustomText>
                                    {genericFormatter.formatFromEdmDate(trainingDetails.Expiry2)}
                                </CustomText>
                            )}
                        </DataTable.Cell>
                    </DataTable.Row>
                    <DataTable.Row>
                        <DataTable.Cell
                            style={{ flex: 1, justifyContent: "flex-start" }}
                        >
                            {!isEditing && trainingStatus(trainingDetails.Expiry3, trainingDetails.Zzvstat)}
                        </DataTable.Cell>
                        <DataTable.Cell style={{ flex: 2 }}>
                            {`Drill 3 ` + (isEditing ? 'Completed' : 'Expiry')}
                        </DataTable.Cell>
                        <DataTable.Cell style={{ flex: 2.5 }}>
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
                                        value={genericFormatter.formatFromEdmDate(trainingDetails.Start3)}
                                        right={
                                            <TextInput.Icon
                                                onPress={() => {
                                                    selectedRecordToEdit.current = 'Start3';
                                                    setShowPicker(!showPicker);
                                                }}
                                                icon={() => <LucideIcons.Calendar size={15} />}
                                            />
                                        }
                                    />
                                </View>
                            ) : (
                                <CustomText>
                                    {genericFormatter.formatFromEdmDate(trainingDetails.Expiry3)}
                                </CustomText>
                            )}
                        </DataTable.Cell>
                    </DataTable.Row>
                    <DataTable.Row>
                        <DataTable.Cell
                            style={{ flex: 1, justifyContent: "flex-start" }}
                        >
                            {!isEditing && trainingStatus(trainingDetails.Expiry4, trainingDetails.Zzvstat)}
                        </DataTable.Cell>
                        <DataTable.Cell style={{ flex: 2 }}>
                            {`Drill 4 ` + (isEditing ? 'Completed' : 'Expiry')}
                        </DataTable.Cell>
                        <DataTable.Cell style={{ flex: 2.5 }}>
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
                                        value={genericFormatter.formatFromEdmDate(trainingDetails.Start4)}
                                        right={
                                            <TextInput.Icon
                                                onPress={() => {
                                                    selectedRecordToEdit.current = 'Start4';
                                                    setShowPicker(!showPicker);
                                                }}
                                                icon={() => <LucideIcons.Calendar size={15} />}
                                            />
                                        }
                                    />
                                </View>
                            ) : (
                                <CustomText>
                                    {genericFormatter.formatFromEdmDate(trainingDetails.Expiry4)}
                                </CustomText>
                            )}
                        </DataTable.Cell>
                    </DataTable.Row>
                    <DataTable.Row>
                        <DataTable.Cell
                            style={{ flex: 1, justifyContent: "flex-start" }}
                        >
                            {!isEditing && trainingStatus(trainingDetails.Expiry5, trainingDetails.Zzvstat)}
                        </DataTable.Cell>
                        <DataTable.Cell style={{ flex: 2 }}>
                            {`Drill 5 ` + (isEditing ? 'Completed' : 'Expiry')}
                        </DataTable.Cell>
                        <DataTable.Cell style={{ flex: 2.5 }}>
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
                                        value={genericFormatter.formatFromEdmDate(trainingDetails.Start5)}
                                        right={
                                            <TextInput.Icon
                                                onPress={() => {
                                                    selectedRecordToEdit.current = 'Start5';
                                                    setShowPicker(!showPicker);
                                                }}
                                                icon={() => <LucideIcons.Calendar size={15} />}
                                            />
                                        }
                                    />
                                </View>
                            ) : (
                                <CustomText>
                                    {genericFormatter.formatFromEdmDate(trainingDetails.Expiry5)}
                                </CustomText>
                            )}
                        </DataTable.Cell>
                    </DataTable.Row>
                    <DataTable.Row>
                        <DataTable.Cell
                            style={{ flex: 1, justifyContent: "flex-start" }}
                        >
                            {!isEditing && trainingStatus(trainingDetails.Expiry6, trainingDetails.Zzvstat)}
                        </DataTable.Cell>
                        <DataTable.Cell style={{ flex: 2 }}>
                            {`Drill 6 ` + (isEditing ? 'Completed' : 'Expiry')}
                        </DataTable.Cell>
                        <DataTable.Cell style={{ flex: 2.5 }}>
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
                                        value={genericFormatter.formatFromEdmDate(trainingDetails.Start6)}
                                        right={
                                            <TextInput.Icon
                                                onPress={() => {
                                                    selectedRecordToEdit.current = 'Start6';
                                                    setShowPicker(!showPicker);
                                                }}
                                                icon={() => <LucideIcons.Calendar size={15} />}
                                            />
                                        }
                                    />
                                </View>
                            ) : (
                                <CustomText>
                                    {genericFormatter.formatFromEdmDate(trainingDetails.Expiry6)}
                                </CustomText>
                            )}
                        </DataTable.Cell>
                    </DataTable.Row>
                    <DataTable.Row>
                        <DataTable.Cell
                            style={{ flex: 1, justifyContent: "flex-start" }}
                        > </DataTable.Cell>
                        <DataTable.Cell style={{ flex: 2 }}>
                            Station Engagement
                        </DataTable.Cell>
                        <DataTable.Cell style={{ flex: 2.5 }}>
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
                                        value={genericFormatter.formatFromEdmDate(trainingDetails.Startsr)}
                                        right={
                                            <TextInput.Icon
                                                onPress={() => {
                                                    selectedRecordToEdit.current = 'Startsr';
                                                    setShowPicker(!showPicker);
                                                }}
                                                icon={() => <LucideIcons.Calendar size={15} />}
                                            />
                                        }
                                    />
                                </View>
                            ) : (
                                <CustomText>
                                    {genericFormatter.formatFromEdmDate(trainingDetails.Startsr)}
                                </CustomText>
                            )}
                        </DataTable.Cell>
                    </DataTable.Row>
                    <DataTable.Row>
                        <DataTable.Cell
                            style={{ flex: 1, justifyContent: "flex-start" }}
                        > </DataTable.Cell>
                        <DataTable.Cell style={{ flex: 2 }}>
                            Op Readiness Check
                        </DataTable.Cell>
                        <DataTable.Cell style={{ flex: 2.5 }}>
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
                                        value={genericFormatter.formatFromEdmDate(brigades.OpReadyCheckDate)}
                                        right={
                                            <TextInput.Icon
                                                onPress={() => {
                                                    selectedRecordToEdit.current = 'OpReadyCheckDate';
                                                    setShowPicker(!showPicker);
                                                }}
                                                icon={() => <LucideIcons.Calendar size={15} />}
                                            />
                                        }
                                    />
                                </View>
                            ) : (
                                <CustomText>
                                    {genericFormatter.formatFromEdmDate(brigades.OpReadyCheckDate)}
                                </CustomText>
                            )}
                        </DataTable.Cell>
                    </DataTable.Row>
                </DataTable>
                <DatePickerModal
                    locale="en-GB"
                    date={
                        selectedRecordToEdit.current == ''
                            ? new Date()
                            : selectedEditDate(selectedRecordToEdit.current)
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

                        if (selectedRecordToEdit.current == 'OpReadyCheckDate') {
                            setBrigades({
                                ...brigades,
                                OpReadyCheckDate: edmDate
                            })
                        }
                        else {
                            setTrainingDetails({
                                ...trainingDetails,
                                [selectedRecordToEdit.current!]: edmDate
                            })
                        }

                        setShowPicker(!showPicker);
                    }}
                    onDismiss={() => setShowPicker(!showPicker)}
                />
                {
                    (isEditing) &&
                    <View style={{ marginTop: 20, alignItems: 'center' }}>
                        <Button
                            style={{ width: '80%' }}
                            mode='contained'
                            onPress={async () => {
                                //saves training details, brigades
                                appContext.setShowBusyIndicator(true);
                                appContext.setShowDialog(true);

                                const brigadePath = brigades.__metadata.uri.split('Z_VOL_MEMBER_SRV')[1].substring(1);

                                const trainingDetailPath = trainingDetails.__metadata.uri.split('Z_VOL_MEMBER_SRV')[1].substring(1);

                                const updates = [
                                    dataHandlerModule.batchSingleUpdate(brigadePath, "Z_VOL_MEMBER_SRV", brigades),
                                    dataHandlerModule.batchSingleUpdate(trainingDetailPath, "Z_VOL_MEMBER_SRV", trainingDetails),
                                ]

                                const updateResults = await Promise.allSettled(updates);
                                const updatePassed = updateResults.every(x => x.status == 'fulfilled');

                                if (!updatePassed) {
                                    appContext.setShowDialog(false);
                                    screenFlowModule.onNavigateToScreen('ErrorPage', {
                                        isAxiosError: false,
                                        message: "Hang on, we found an error. There was a problem in getting updating your data. Please go back and try again or contact your IT administrator for further assistance."
                                    });
                                    return;
                                }

                                const updateSapErrors = updateResults.filter(x => x.value.responseBody.error);
                                if (updateSapErrors.length > 0) {
                                    appContext.setShowDialog(false);
                                    screenFlowModule.onNavigateToScreen('ErrorPage', {
                                        isAxiosError: false,
                                        message : "Hang on, we found an error. There was a problem in updating your data. Please go back and try again or contact your IT administrator for further assistance."
                                    });
                                    return;
                                }

                                const pernr = member.Pernr;
                                const plans = member.Zzplans;
                                const status = member.Zzvstat;

                                const readRequests = [
                                    dataHandlerModule.batchGet(`TrainingDetails?$filter=Pernr%20eq%20%27${pernr}%27%20and%20Zzplans%20eq%20%27${plans}%27`, 'Z_VOL_MEMBER_SRV', 'TrainingDetails'),
                                    dataHandlerModule.batchGet(`VolunteerStatuses?$skip=0&$top=100&$filter=Training%20eq%20true%20and%20CurrentStatus%20eq%20%27${status}%27%20and%20Pernr%20eq%20%27${pernr}%27`, 'Z_VOL_MEMBER_SRV', 'VolunteerStatuses'),
                                    dataHandlerModule.batchGet(`Brigades?$filter=Pernr%20eq%20%27${pernr}%27%20and%20Zzplans%20eq%20%27${plans}%27`, 'Z_VOL_MEMBER_SRV', 'Brigades'),
                                    dataHandlerModule.batchGet(`MemberDrillCompletions?$skip=0&$top=100&$filter=Zzplans%20eq%20%27${plans}%27`, 'Z_VOL_MANAGER_SRV', 'MemberDrillCompletions')
                                ]

                                const readResults = await Promise.allSettled(readRequests);
                                const readPassed = readResults.every(x => x.status == 'fulfilled');

                                if (!readPassed) {
                                    appContext.setShowDialog(false);
                                    screenFlowModule.onNavigateToScreen('ErrorPage', {
                                        isAxiosError: false,
                                        message : "Hang on, we found an error. There was a problem in getting your data. Please go back and try again or contact your IT administrator for further assistance."
                                    });
                                    return;
                                }

                                const readErrors = readResults.filter(x => x.value.responseBody.error);
                                if (readErrors.length > 0) {
                                    appContext.setShowDialog(false);
                                    screenFlowModule.onNavigateToScreen('ErrorPage', {
                                        isAxiosError: false,
                                        message : "Hang on, we found an error. There was a problem in getting your initial data. Please go back and try again or contact your IT administrator for further assistance."
                                    });
                                    return;
                                }

                                appContext.setShowBusyIndicator(false);
                                appContext.setShowDialog(false);
                                setIsEditing(false);

                                //now we are going to update the values
                                for (const x of readResults) {
                                    switch (x.value.entityName) {
                                        case 'Brigades':
                                            brigadeInitialData = x.value.responseBody.d.results[0];
                                            setBrigades(brigadeInitialData);
                                            break;

                                        case 'VolunteerStatuses':
                                            volInitialStatuses = x.value.responseBody.d.results;
                                            setVolunteerStatuses(volInitialStatuses);
                                            break;

                                        case 'TrainingDetails':
                                            initialTrainingDetails = x.value.responseBody.d.results[0];
                                            setTrainingDetails(initialTrainingDetails);
                                            break;

                                        case 'MemberDrillCompletions':
                                            dataContext.setMemberDrillCompletion(x.value.responseBody.d.results);
                                            break;
                                    }
                                }
                            }}
                        >
                            Save
                        </Button>
                    </View>
                }
            </ScrollView>
        </View>
    );
};

export default TrainingCompletionByUser;
