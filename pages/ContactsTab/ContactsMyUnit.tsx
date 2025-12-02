import React, { useState, useEffect } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { List, Divider, TextInput, useTheme } from 'react-native-paper';
import CustomText from '../../assets/CustomText';
import { useDataContext } from '../../helper/DataContext';
import * as LucideIcons from 'lucide-react-native';
import { screenFlowModule } from '../../helper/ScreenFlowModule';
import { useAppContext } from '../../helper/AppContext';
import { dataHandlerModule } from '../../helper/DataHandlerModule';
import GenericFormatter from '../../helper/GenericFormatters';

const ContactsMyUnit = () => {

    const dataContext = useDataContext();
    const appContext = useAppContext();
    const genericFormatter = new GenericFormatter();

    type listType = Record<string, Record<string, string>[]> | undefined;

    const [contactsList, setContactsList] = useState<listType>(undefined);
    const [selectedOrgUnit, setSelectedOrgUnit] = useState<any>(undefined);
    const [showDropDown, setShowDropDown] = useState<boolean>(false);

    useEffect(() => {
        const filteredList = filterAndFormatList(dataContext.myUnitContacts);
        setContactsList(filteredList);
        const matchingUnit = dataContext.rootOrgUnits.filter(x => x.Plans == dataContext.myOrgUnitDetails[0].Zzplans)[0];
        setSelectedOrgUnit(matchingUnit);
    }, [])

    //filter our contacts
    const filterAndFormatList = (List: any[]) => {
        const sortedList = [...List].sort((a, b) =>
            a.Nachn.localeCompare(b.Nachn)
        )

        const grouped = sortedList.reduce((accumulator, currentValue) => {
            const firstLetter = currentValue.Nachn[0].toUpperCase();
            if (!accumulator[firstLetter]) {
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
        <>
            {
                (dataContext.rootOrgUnits.length > 1) && (
                    <View style={{ marginTop: 20 }}>
                        <View style={{ marginLeft: 20 }}>
                            <CustomText variant='bodyLargeBold'>{selectedOrgUnit ? selectedOrgUnit.Stext : ""}</CustomText>
                        </View>
                        <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
                            <Pressable
                                onPress={() => {
                                    setShowDropDown(!showDropDown);
                                }}
                            >
                                <View pointerEvents="none">
                                    <TextInput
                                        mode='outlined'
                                        value={selectedOrgUnit ? `${selectedOrgUnit.Short}` : ""}
                                        editable={false}
                                        right={
                                            <TextInput.Icon
                                                icon={() => {
                                                    return <LucideIcons.ChevronDown />
                                                }}
                                            />
                                        }
                                    />
                                </View>
                            </Pressable>
                            {(showDropDown) &&
                                <List.Section style={{ backgroundColor: theme.colors.onSecondary, position: 'absolute', width: '100%', top: 50, left: 20, zIndex: 100, borderColor: 'rgba(99, 99, 99, 1)', borderWidth: 1 }}>
                                    {dataContext.rootOrgUnits.map((x, i) => {
                                        return (
                                            <React.Fragment key={'Fragment_' + i}>
                                                <List.Item
                                                    key={i}
                                                    title={`${x.Short} ${x.Stext}`}
                                                    style={{
                                                        backgroundColor: (x.Plans === selectedOrgUnit.Plans) ? theme.colors.surfaceVariant : theme.colors.onPrimary
                                                    }}
                                                    onPress={async () => {
                                                        const plans = x.Plans;
                                                        setSelectedOrgUnit(x);

                                                        //when we set the selected org unit, we need to update the members list aswell
                                                        setShowDropDown(!showDropDown);

                                                        appContext.setShowBusyIndicator(true);
                                                        appContext.setShowDialog(true);

                                                        //read the org unit team members
                                                        try {
                                                            const contactsOrgUnit = await dataHandlerModule.batchGet(`Contacts?$filter=Zzplans%20eq%20%27${plans}%27`, 'Z_VOL_MEMBER_SRV', 'Contacts');
                                                            const filteredList = filterAndFormatList(contactsOrgUnit.responseBody.d.results);
                                                            setContactsList(filteredList);

                                                            //set the selected org plan for printing
                                                            dataContext.setContactsPrintPlans(plans);

                                                            appContext.setShowDialog(false);
                                                        }
                                                        catch (error) {
                                                            appContext.setShowDialog(false);
                                                            screenFlowModule.onNavigateToScreen('ErrorPage', error);
                                                        }
                                                    }}
                                                />
                                                <Divider key={'divider' + i} />
                                            </React.Fragment>
                                        )
                                    })}
                                </List.Section>
                            }
                        </View>
                    </View>
                )
            }
            <ScrollView style={{ paddingBottom: 40, backgroundColor: theme.colors.background }}>
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
                                                            <Divider />
                                                            <List.Item onPress={() => {
                                                                //next screen also needs the brigade information, so combine them into ones
                                                                const contactInfo = {
                                                                    ...contact,
                                                                    ...dataContext.brigadeSummary[0]
                                                                }

                                                                screenFlowModule.onNavigateToScreen('MyUnitContactDetail', contactInfo)
                                                            }} right={() => <LucideIcons.ChevronRight color={theme.colors.primary} />} left={() => <View style={{ backgroundColor: theme.colors.surfaceDisabled, padding: 5, borderRadius: 50 }}><LucideIcons.User color={theme.colors.outline} /></View>} style={{ marginLeft: 20 }} key={'item_' + ii} title={`${contact.Vorna} ${contact.Nachn}`} description={genericFormatter.formatRole(contact.Role)} />
                                                            <Divider />
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
        </>
    )
}

export default ContactsMyUnit;