import React, { useEffect, useState } from 'react';
import { View, ScrollView } from 'react-native';
import { useTheme, IconButton, Divider, List } from 'react-native-paper';
import { ChevronLeft, Pencil, Plus, NotebookPen } from 'lucide-react-native';
import { screenFlowModule } from '../helper/ScreenFlowModule';
import CustomText from '../assets/CustomText';

import GlobalStyles from '../style/GlobalStyles';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../types/AppTypes';
import GenericFormatter from '../helper/GenericFormatters';
import { useDataContext } from '../helper/DataContext';

type props = StackScreenProps<RootStackParamList, 'VolunteerNotes'>; //typing the navigation props

const VolunteerNotes = ({ route, navigation }: props) => {

    const theme = useTheme();
    const pernr = route.params?.pernr;

    const genericFormatter = new GenericFormatter();
    const dataContext = useDataContext();

    const [memberNotes, setMemberNotes] = useState<any[]>([]);

    const EditData = (data: any) => {
        screenFlowModule.onNavigateToScreen("EditScreen", {
            screenName: "VolunteerNotes",
            editData: data,
        });
    };

    useEffect(() => {
        setMemberNotes(dataContext.volAdminMemberNotes);
    }, [dataContext.volAdminMemberNotes])

    return (
        <View style={GlobalStyles.page}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 20 }}>
                <IconButton icon={() => <ChevronLeft color={theme.colors.primary} size={25} />} size={20} onPress={() => screenFlowModule.onGoBack()} />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flex: 1 }}>
                    <CustomText style={{ marginLeft: 20 }} variant='titleLargeBold'>Volunteer Notes</CustomText>
                </View>
            </View>
            <ScrollView style={{ paddingHorizontal: 20, paddingBottom: 40 }}>
                <List.Section
                    style={{
                        backgroundColor: "#f9f9f9ff",
                        ...GlobalStyles.globalBorderRadius,
                    }}
                >
                    {
                        (memberNotes.length > 0) &&
                        memberNotes.map((note, i) => {
                            return (
                                <React.Fragment
                                    key={'frag_' + i}
                                >
                                    <List.Item
                                        style={{ marginLeft: 20 }}
                                        key={'note_' + i}
                                        title={note.Notes}
                                        description={genericFormatter.formatFromEdmDate(note.Begda)}
                                        right={() => (
                                            <Pencil
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
                                                <NotebookPen color={theme.colors.outline} />
                                            </View>
                                        )}
                                        onPress={() => {
                                            EditData(note)
                                        }}
                                    />
                                    <Divider />
                                </React.Fragment>
                            )
                        })
                    }
                    <List.Item
                        style={{ marginLeft: 55, marginBottom: 10 }}
                        title={<CustomText variant='bodyLargeBold'>Add a new note</CustomText>}
                        right={() => (
                            <Plus
                                color={theme.colors.primary}
                            />
                        )}
                        onPress={() => {
                            const edmBegda = genericFormatter.formatToEdmDate(new Date());

                            EditData({
                                "NewNote": true, 
                                "Begda": edmBegda, 
                                "Endda": "\/Date(253399623147101)\/", 
                                "Pernr": pernr, 
                                "Subty": "", 
                                "Objps": "", 
                                "Sprps": "", 
                                "Seqnr": "", 
                                "Notes": ""
                            })
                        }}
                    />
                </List.Section>
            </ScrollView>
        </View>
    )
}

export default VolunteerNotes;