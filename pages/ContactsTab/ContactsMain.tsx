import React, {useState} from 'react';
import { View } from 'react-native';
import CustomText from '../../assets/CustomText';
import { useTheme, IconButton} from 'react-native-paper';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import {Printer} from 'lucide-react-native';
import { useDataContext } from '../../helper/DataContext';
import { useAppContext } from '../../helper/AppContext';
import { screenFlowModule } from '../../helper/ScreenFlowModule';

//screens
import ContactsMyUnit from '.././ContactsTab/ContactsMyUnit';
import ContactsCFUPhoneBook from '.././ContactsTab/ContactsCFUPhonebook';


const ContactsMain = () => {
    const Tab = createMaterialTopTabNavigator();
    const theme = useTheme();
    const dataContext = useDataContext();
    const appContext = useAppContext();
    const [showPrint, setShowPrint] = useState(true);

    const isTeamManager = (dataContext.currentUser[0].TeamCoordinator || dataContext.currentUser[0].VolAdmin);

    return (
        <>
            <View style={{ paddingHorizontal: 20, marginVertical: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                <CustomText variant='titleLargeBold'>Contacts</CustomText>
                {
                    (showPrint) && (
                        <IconButton
                            style={{position: 'absolute', right: 10}}
                            icon={() => <Printer />}
                            mode='contained-tonal'
                            onPress={() => {

                                appContext.setShowDialog(true);
                                appContext.setShowBusyIndicator(true);

                                const mss = dataContext.currentUser[0].VolAdmin;

                                const url = `Z_VOL_MEMBER_SRV/ContactListPrints(Zzplans='${dataContext.contactsPrintPlans}',Mss=${mss})/$value`;
                                const obj = {
                                    cache : false,
                                    showSharing: true,
                                    displayName: "Contact List Print",
                                    filePath: url
                                }

                                screenFlowModule.onNavigateToScreen('PDFDisplayPage', obj);
                            }}
                        />
                    )
                }
                
            </View>
            <Tab.Navigator
                screenOptions={({ route }) => ({
                    tabBarIndicatorStyle: {
                        backgroundColor: theme.colors.primary
                    },
                    tabBarLabel: ({ focused }) => {

                        let formattedRouteName;

                        switch (route.name) {
                            case 'ContactsMyUnit':
                                formattedRouteName = (dataContext.rootOrgUnits.length > 1) ? 'Selected Unit' : 'My Unit';
                                break;
                            case 'ContactsCFUPhonebook':
                                formattedRouteName = 'All Units';
                                break;
                        }

                        let iconColor = focused ? theme.colors.primary : theme.colors.outline;
                        return <CustomText variant='bodyLarge' style={{ color: iconColor }}>{formattedRouteName}</CustomText>
                    }
                })}
            >
                <Tab.Screen
                    name='ContactsMyUnit'
                    component={ContactsMyUnit}
                    listeners={({ navigation, route }) => ({
                        tabPress: (e) => {
                            setShowPrint(true);
                        }
                    })}
                />
                {
                    isTeamManager && (
                        <Tab.Screen
                            name='ContactsCFUPhonebook'
                            component={ContactsCFUPhoneBook}
                            listeners={({ navigation, route }) => ({
                                tabPress: (e) => {
                                    setShowPrint(false);
                                }
                            })}
                        />
                    )
                }
            </Tab.Navigator>
        </>
    )
}

export default ContactsMain;