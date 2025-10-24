import React, { useState, useRef, useEffect } from 'react';
import { View, ScrollView } from 'react-native';
import { useTheme, IconButton, DataTable } from 'react-native-paper';
import * as LucideIcons from 'lucide-react-native';
import { screenFlowModule } from '../helper/ScreenFlowModule';
import CustomText from '../assets/CustomText';
import GlobalStyles from '../style/GlobalStyles';
import { StackScreenProps } from '@react-navigation/stack';
import { ProfileStackParamList } from '../types/AppTypes';


import GenericFormatter from '../helper/GenericFormatters';

type props = StackScreenProps<ProfileStackParamList, 'TrainingHistoryScreen'>; //typing the navigation props

const TrainingHistory = ({ route, navigation }: props) => {

    const theme = useTheme();
    const params = route.params ?? [];
    const [page, setPage] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(0)

    const genericFormatter = new GenericFormatter();

    const calculateMaxRows = (pageHeight: number) => {
        const remainingHeight = pageHeight - 184; // e.g. 148 for header, table header + pagination
        const newItemsPerPage = Math.floor(remainingHeight / 48);
        setItemsPerPage(newItemsPerPage);
    }

    const from = page * itemsPerPage;
    const to = Math.min((page + 1) * itemsPerPage, params.length);

    return (
        <View
            onLayout={(e) => calculateMaxRows(e.nativeEvent.layout.height)}
            style={GlobalStyles.page}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 20 }}>
                <IconButton icon={() => <LucideIcons.ChevronLeft color={theme.colors.primary} size={25} />} size={20} onPress={() => screenFlowModule.onGoBack()} />
                <CustomText style={{ marginLeft: 20 }} variant='titleLargeBold'>Training History</CustomText>
            </View>
            <DataTable>
                <DataTable.Header>
                    <DataTable.Title style={{ flex: 3.5, marginRight: 10 }}>Name</DataTable.Title>
                    <DataTable.Title style={{ flex: 2 }}>From</DataTable.Title>
                    <DataTable.Title style={{ flex: 2 }}>To</DataTable.Title>
                    <DataTable.Title style={{ flex: 0.5 }}> </DataTable.Title>
                </DataTable.Header>
                {
                    params.slice(from, to).map((item, i) => {
                        return (
                            <DataTable.Row key={i} onPress={() => {
                                screenFlowModule.onNavigateToScreen('TrainingDetailScreen', item)
                            }}>
                                <DataTable.Cell style={{ flex: 3.5, marginRight: 10 }}><CustomText style={{ flexWrap: 'wrap' }}>{item.QualificationName}</CustomText></DataTable.Cell>
                                <DataTable.Cell style={{ flex: 2 }}>{genericFormatter.formatFromEdmDate(item.ValidFrom)}</DataTable.Cell>
                                <DataTable.Cell style={{ flex: 2 }}>{genericFormatter.formatFromEdmDate(item.ValidTo)}</DataTable.Cell>
                                <DataTable.Cell style={{ flex: 0.5 }}><LucideIcons.ChevronRight /></DataTable.Cell>
                            </DataTable.Row>
                        )
                    })
                }
                <DataTable.Pagination
                    page={page}
                    numberOfPages={Math.ceil(params.length / itemsPerPage)}
                    onPageChange={(page) => setPage(page)}
                    label={`${from + 1}-${to} of ${params.length}`}
                    numberOfItemsPerPage={itemsPerPage}
                    showFastPaginationControls
                    selectPageDropdownLabel={'Rows per page'}
                />
            </DataTable>
        </View>
    )
}

export default TrainingHistory;