import React from 'react';
import { useTheme } from 'react-native-paper';
import { createStackNavigator } from '@react-navigation/stack';
import { ContactsStackParamList } from '../types/AppTypes';
import GlobalStyles from '../style/GlobalStyles';

//screens
import ContactsMain from './ContactsTab/ContactsMain';
import MyUnitContactDetail from './ContactsTab/MyUnitContactDetail';
import CfuPhonebookContactsList from './ContactsTab/CfuPhonebookContactsList';
import CfuPhonebookContactDetail from './ContactsTab/CfuPhonebookContactDetail';

const Stack = createStackNavigator<ContactsStackParamList>();

const Contacts = () => {
    return (
        <Stack.Navigator screenOptions={{headerShown: false, cardStyle: GlobalStyles.AppBackground}}>
            <Stack.Screen name='ContactsMain' component={ContactsMain}/>
            <Stack.Screen name='MyUnitContactDetail' component={MyUnitContactDetail}/>
            <Stack.Screen name='CfuPhonebookContactsList' component={CfuPhonebookContactsList}/>
            <Stack.Screen name='CfuPhonebookContactDetail' component={CfuPhonebookContactDetail}/>
        </Stack.Navigator>
    )
}

export default Contacts;