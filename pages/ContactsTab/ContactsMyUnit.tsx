import React, {useState, useEffect} from 'react';
import {View, ScrollView} from 'react-native';
import {Searchbar, List, Divider, useTheme} from 'react-native-paper';
import CustomText from '../../assets/CustomText';
import { useDataContext } from '../../helper/DataContext';
import * as LucideIcons from 'lucide-react-native';
import { screenFlowModule } from '../../helper/ScreenFlowModule';

const ContactsMyUnit = () => {
    
    const dataContext = useDataContext();
    const [searchValue, setSearchValue] = useState('');
    type listType = Record<string, Record<string, string>[]> | undefined;
    const [contactsList, setContactsList] = useState<listType>(undefined);

    useEffect(() => {

        const filteredList = filterAndFormatList('');
        setContactsList(filteredList);
    }, [])

    //filter our contacts
    const filterAndFormatList = (query : string) => {
        let filteredList;

        if (query){
            filteredList = dataContext.myUnitContacts.filter((x) => {
                if (x.Nachn.toLowerCase().includes(query.toLowerCase()) || x.Vorna.toLowerCase().includes(query.toLowerCase())) {
                    return x;
                }
            })
        }
        else {
            filteredList = dataContext.myUnitContacts;
        }

        const sortedList = [...filteredList].sort((a, b) => 
            a.Nachn.localeCompare(b.Nachn)
        )

        const grouped = sortedList.reduce((accumulator, currentValue) => {
            const firstLetter = currentValue.Nachn[0].toUpperCase();
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
                                                        <List.Item onPress={() => {
                                                            //next screen also needs the brigade information, so combine them into ones
                                                            const contactInfo = {
                                                                ...contact,
                                                                ...dataContext.brigadeSummary[0]
                                                            }
                                                            
                                                            screenFlowModule.onNavigateToScreen('MyUnitContactDetail', contactInfo)
                                                            }} right={() => <LucideIcons.ChevronRight color={theme.colors.primary}/>} left={() => <View style={{backgroundColor: theme.colors.surfaceDisabled, padding: 5, borderRadius: 50}}><LucideIcons.User color={theme.colors.outline}/></View>} style={{marginLeft: 20}} key={'item_' + ii} title={`${contact.Vorna} ${contact.Nachn}`}/>
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

export default ContactsMyUnit;