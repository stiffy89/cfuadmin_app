import React, { useState, useEffect } from 'react';
import { ScrollView, View } from 'react-native';
import { useTheme, Searchbar, List, Divider } from 'react-native-paper';
import CustomText from '../../assets/CustomText';
import { useDataContext } from '../../helper/DataContext';
import { screenFlowModule } from '../../helper/ScreenFlowModule';
import * as LucideIcons from 'lucide-react-native';
import { useAppContext } from '../../helper/AppContext';
import { dataHandlerModule } from '../../helper/DataHandlerModule';

const ContactsCFUPhoneBook = () => {

    const dataContext = useDataContext();
    const appContext = useAppContext();

    const [searchValue, setSearchValue] = useState('');
    type listType = Record<string, Record<string, string>[]> | undefined;
    const [suburbsList, setSuburbsList] = useState<listType>(undefined);

    const theme = useTheme();

    useEffect(() => {
        const filteredList = filterAndFormatList('');
        setSuburbsList(filteredList);
        
    }, [])

    const filterAndFormatList = (query : string) => {
        let filteredList;

        if (query){
            filteredList = dataContext.cfuPhonebookSuburbs.filter((x) => {
                if (x.SuburbName.toLowerCase().includes(query.toLowerCase())) {
                    return x;
                }
            })
        }
        else {
            filteredList = dataContext.cfuPhonebookSuburbs;
        }

        const sortedList = [...filteredList].sort((a, b) => 
            a.SuburbName.localeCompare(b.SuburbName)
        )

        const grouped = sortedList.reduce((accumulator, currentValue) => {
            const firstLetter = currentValue.SuburbName[0].toUpperCase();
            if (!accumulator[firstLetter]){
                accumulator[firstLetter] = []
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
    }

    const onBrigadeSelect = async (brigadeName : string) => {
        //read our brigade contacts
        appContext.setShowBusyIndicator(true);
        appContext.setShowDialog(true);

        try {
            //convert the spaces
            const formattedBrigadeName = brigadeName.replace(/ /g, "%20");
            const suburbData = await dataHandlerModule.batchGet(`Contacts?$filter=Suburb%20eq%20%27${formattedBrigadeName}%27`, 'Z_CFU_CONTACTS_SRV', 'SuburbContacts');
            const suburbContactsObj = {
                suburbName : brigadeName,
                suburbContacts : suburbData.responseBody.d.results
            }
            appContext.setShowDialog(false);
            appContext.setShowBusyIndicator(false);
            screenFlowModule.onNavigateToScreen('CfuPhonebookContactsList', suburbContactsObj);
        }
        catch (error) {
            console.log(error);
        }
    }

    return (
        <ScrollView style={{paddingBottom: 40, backgroundColor: theme.colors.background}}>
            <Searchbar style={{marginVertical: 20, marginHorizontal: 20, backgroundColor: theme.colors.surfaceDisabled}} value={searchValue} placeholder='Search Suburbs' onChangeText={(text) => {
                const filterResult = filterAndFormatList(text);
                setSuburbsList(filterResult)
                setSearchValue(text);
            }}/>
            {
                (suburbsList) && (
                    <List.Section>
                        {
                            Object.keys(suburbsList).map((letter, i) => {
                                return (
                                    <React.Fragment key={`header_${letter}_${i}`}>
                                        <List.Subheader key={'subheader_' + i}><CustomText variant='bodyLargeBold'>{letter}</CustomText></List.Subheader>
                                        {
                                            suburbsList[letter].map((suburb, ii) => {
                                                return (
                                                    <React.Fragment key={`suburb_${letter}_${ii}`}>
                                                        <Divider/>
                                                        <List.Item onPress={() => {
                                                            onBrigadeSelect(suburb.SuburbName)
                                                            }} right={() => <View style={{flexDirection: 'row', alignItems: 'center'}}><CustomText style={{marginRight: 20}}>{suburb.ContactsCount}</CustomText><LucideIcons.ChevronRight color={theme.colors.outline}/></View>} style={{marginLeft: 20}} key={'item_' + ii} title={suburb.SuburbName} />
                                                        <Divider/>
                                                    </React.Fragment>
                                                )
                                            })
                                        }
                                    </React.Fragment>
                                )
                            })
                        }
                    </List.Section>
                )
            }
        </ScrollView>
    )
}

export default ContactsCFUPhoneBook;