import React, {useState, useEffect} from 'react';
import {View, ScrollView} from 'react-native';
import {Searchbar, List, Divider, IconButton, useTheme} from 'react-native-paper';
import CustomText from '../../assets/CustomText';
import { useDataContext } from '../../helper/DataContext';
import * as LucideIcons from 'lucide-react-native';
import { screenFlowModule } from '../../helper/ScreenFlowModule';
import { StackScreenProps } from '@react-navigation/stack';
import { ContactsStackParamList } from '../../types/AppTypes';

type props = StackScreenProps<ContactsStackParamList, 'CfuPhonebookContactsList'>; 

const CfuPhonebookContactsList = ({route} : props) => {
    const params = route.params;
    const suburbName = params?.suburbName;
    const suburbContacts = params?.suburbContacts;

    const [searchValue, setSearchValue] = useState('');
    type listType = Record<string, Record<string, string>[]> | undefined;

    const [contactsList, setContactsList] = useState<listType>(undefined);

    useEffect(() => {
        if (suburbContacts && suburbContacts.length > 0){
            const filteredList = filterAndFormatList('');
            setContactsList(filteredList);
        }
    }, [])

    //filter our contacts
    const filterAndFormatList = (query : string) => {
        
        let filteredList : any[];

        if (query){
            filteredList = suburbContacts?.filter((x : any) => {
                if (x.FirstName.toLowerCase().includes(query.toLowerCase()) || x.Surname.toLowerCase().includes(query.toLowerCase())) {
                    return x;
                }
            })
        }
        else {
            filteredList = suburbContacts;
        }

        const sortedList = [...filteredList].sort((a, b) => 
            a.Surname.localeCompare(b.Surname)
        )

        const grouped = sortedList.reduce((accumulator, currentValue) => {
            const firstLetter = currentValue.Surname[0].toUpperCase();
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

    const theme = useTheme();

    return (
        <ScrollView style={{paddingBottom: 40, backgroundColor: theme.colors.background}}>
            <View style={{flexDirection: 'row', alignItems: 'center', marginVertical: 20}}>
                <IconButton icon={() => <LucideIcons.ChevronLeft color={theme.colors.primary} size={25}/>} size={20} onPress={() => screenFlowModule.onGoBack()} />
                <CustomText style={{marginLeft: 20}} variant='titleLargeBold'>Contacts</CustomText>
            </View>
            <View style={{alignItems: 'center', borderBottomColor: theme.colors.onSurfaceDisabled, borderBottomWidth: 1, paddingBottom: 10}}><CustomText variant='bodyLarge'>{suburbName}</CustomText></View>
            <Searchbar style={{marginVertical: 20, marginHorizontal: 20, backgroundColor: theme.colors.surfaceDisabled}} placeholder='Search Members' value={searchValue} onChangeText={(text) => {
                const filterResult = filterAndFormatList(text);
                setContactsList(filterResult);
                setSearchValue(text);
            }}/>
            {
                (contactsList) && (
                    <List.Section>
                        {
                            Object.keys(contactsList).map((letter, i) => {
                                return (
                                    <React.Fragment key={`header_${letter}_${i}`}>
                                        <List.Subheader key={'subheader_' + i}><CustomText variant='bodyLargeBold'>{letter}</CustomText></List.Subheader>
                                        {
                                            contactsList[letter].map((contact, ii) => {
                                                return (
                                                    <React.Fragment key={`contact_${letter}_${ii}`}>
                                                        <Divider/>
                                                        <List.Item 
                                                            onPress={() => {
                                                                screenFlowModule.onNavigateToScreen('CfuPhonebookContactDetail', contact)
                                                            }} 
                                                            right={() => <LucideIcons.ChevronRight color={theme.colors.primary}/>} 
                                                            left={() => <View style={{backgroundColor: theme.colors.surfaceDisabled, padding: 5, borderRadius: 50}}><LucideIcons.User color={theme.colors.outline}/></View>} style={{marginLeft: 20}} key={'item_' + ii} 
                                                            title={`${contact.FirstName} ${contact.Surname}`}
                                                            description={contact.Role}
                                                        />
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
            {
                (!contactsList) && (
                    <CustomText>No contacts in my unit</CustomText>
                )
            }
        </ScrollView>
    )
}

export default CfuPhonebookContactsList;

