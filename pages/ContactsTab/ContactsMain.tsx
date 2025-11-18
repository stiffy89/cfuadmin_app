import React from 'react';
import { ScrollView, View } from 'react-native';
import CustomText from '../../assets/CustomText';
import { useTheme } from 'react-native-paper';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useDataContext } from '../../helper/DataContext';

//screens
import ContactsMyUnit from '.././ContactsTab/ContactsMyUnit';
import ContactsCFUPhoneBook from '.././ContactsTab/ContactsCFUPhonebook';


const ContactsMain = () => {
    const Tab = createMaterialTopTabNavigator();
    const theme = useTheme();
    const dataContext = useDataContext();

    const isTeamManager = (dataContext.currentUser[0].TeamCoordinator || dataContext.currentUser[0].VolAdmin);

    return (
        <>
            <View style={{ paddingHorizontal: 20, marginVertical: 20 }}>
                <CustomText variant='titleLargeBold'>Contacts</CustomText>
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
                />
                {
                    isTeamManager && (
                        <Tab.Screen
                            name='ContactsCFUPhonebook'
                            component={ContactsCFUPhoneBook}
                        />
                    )
                }
            </Tab.Navigator>
        </>
    )
}

export default ContactsMain;