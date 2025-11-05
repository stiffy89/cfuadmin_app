import React, { useState, useEffect } from "react";
import { View, ScrollView } from "react-native";
import CustomText from "../../assets/CustomText";
import { useTheme, IconButton, DataTable, TextInput } from "react-native-paper";
import * as LucideIcons from "lucide-react-native";
import { screenFlowModule } from "../../helper/ScreenFlowModule";
import { StackScreenProps } from "@react-navigation/stack";
import { RootStackParamList } from "../../types/AppTypes";
import GenericFormatter from "../../helper/GenericFormatters";

type props = StackScreenProps<RootStackParamList, 'TrainingCompletionByUser'>;

const TrainingCompletionByUser = ({ route }: props) => {
    const theme = useTheme();
    const genericFormatter = new GenericFormatter();

    console.log(route.params!.memberData);

    //const member = route.params!.memberData;
    const [isEditing, setIsEditing] = useState(false);
    const [member, setMember] = useState<any | undefined>(undefined);
    const [brigades, setBrigades] = useState<any | undefined>(undefined);
    const [volunteerStatuses, setVolunteerStatuses] = useState<any[]>([]);
    const [trainingDetails, setTrainingDetails] = useState<any | undefined>(undefined);

    useEffect(() => {
        setMember(route.params!.memberData); //- single
        setBrigades(route.params!.brigades[0]); //- single
        setVolunteerStatuses(route.params!.volunteerStatuses) // - multiple
        setTrainingDetails(route.params!.trainingDetails[0]) // - single
    }, [])

    if (!member || !brigades || !trainingDetails) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <CustomText>Loading...</CustomText>
            </View>
        );
    }

    const trainingStatus = (expiryDate : string, status : string) => {
        if (expiryDate === null || expiryDate === undefined){
            return ''
        }

        const expiryJSDate = genericFormatter.formatFromEdmToJSDate(expiryDate);
        if (expiryJSDate){
            if (expiryJSDate <= new Date()){
                switch (status){
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

    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
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
            <View style={{ marginBottom: 20, marginLeft: 20 }}>
                <View
                    style={{ flexDirection: "row", alignItems: 'center' }}
                >
                    <View
                        style={{
                            padding: 20,
                            backgroundColor: "#d3d3d3ff",
                            borderRadius: 50,
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
                            <CustomText variant='bodyLarge'>{member.Stext}</CustomText>
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
            </View>
            <ScrollView style={{ backgroundColor: theme.colors.onPrimary }}>
                <DataTable>
                    <DataTable.Header>
                        <DataTable.Title style={{ flex: 1 }}>Status</DataTable.Title>
                        <DataTable.Title style={{ flex: 2 }}>Name</DataTable.Title>
                        <DataTable.Title style={{ flex: 2 }}>Date Completed</DataTable.Title>
                    </DataTable.Header>
                    <DataTable.Row>
                        <DataTable.Cell
                            style={{ flex: 1, justifyContent: "flex-start" }}
                        >
                            {trainingStatus(trainingDetails.Expiry1, trainingDetails.Zzvstat)}
                        </DataTable.Cell>
                        <DataTable.Cell style={{ flex: 2 }}>
                            Drill 1 Expiry
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
                                        value={genericFormatter.formatFromEdmDate(trainingDetails.Expiry1)}
                                        right={
                                            <TextInput.Icon
                                                onPress={() => {
                                                    
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
                            {trainingStatus(trainingDetails.Expiry2, trainingDetails.Zzvstat)}
                        </DataTable.Cell>
                        <DataTable.Cell style={{ flex: 2 }}>
                            Drill 2 Expiry
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
                                        value={genericFormatter.formatFromEdmDate(trainingDetails.Expiry2)}
                                        right={
                                            <TextInput.Icon
                                                onPress={() => {
                                                    
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
                            {trainingStatus(trainingDetails.Expiry3, trainingDetails.Zzvstat)}
                        </DataTable.Cell>
                        <DataTable.Cell style={{ flex: 2 }}>
                            Drill 3 Expiry
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
                                        value={genericFormatter.formatFromEdmDate(trainingDetails.Expiry3)}
                                        right={
                                            <TextInput.Icon
                                                onPress={() => {
                                                    
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
                            {trainingStatus(trainingDetails.Expiry4, trainingDetails.Zzvstat)}
                        </DataTable.Cell>
                        <DataTable.Cell style={{ flex: 2 }}>
                            Drill 4 Expiry
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
                                        value={genericFormatter.formatFromEdmDate(trainingDetails.Expiry4)}
                                        right={
                                            <TextInput.Icon
                                                onPress={() => {
                                                    
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
                            {trainingStatus(trainingDetails.Expiry5, trainingDetails.Zzvstat)}
                        </DataTable.Cell>
                        <DataTable.Cell style={{ flex: 2 }}>
                            Drill 5 Expiry
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
                                        value={genericFormatter.formatFromEdmDate(trainingDetails.Expiry5)}
                                        right={
                                            <TextInput.Icon
                                                onPress={() => {
                                                    
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
                            {trainingStatus(trainingDetails.Expiry6, trainingDetails.Zzvstat)}
                        </DataTable.Cell>
                        <DataTable.Cell style={{ flex: 2 }}>
                            Drill 6 Expiry
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
                                        value={genericFormatter.formatFromEdmDate(trainingDetails.Expiry6)}
                                        right={
                                            <TextInput.Icon
                                                onPress={() => {
                                                    
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
                                        value={genericFormatter.formatFromEdmDate(trainingDetails.Startsr)}
                                        right={
                                            <TextInput.Icon
                                                onPress={() => {
                                                    
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
                                        value={genericFormatter.formatFromEdmDate(brigades.OpReadyCheckDate)}
                                        right={
                                            <TextInput.Icon
                                                onPress={() => {
                                                    
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
            </ScrollView>
        </View>
    );
};

export default TrainingCompletionByUser;
