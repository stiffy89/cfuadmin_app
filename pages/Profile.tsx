import React from 'react';
import { View, ScrollView, Easing } from 'react-native';
import { useTheme, Button, List, Divider } from 'react-native-paper';
import * as LucideIcons from 'lucide-react-native';
import CustomText from '../assets/CustomText';
import { useDataContext } from '../helper/DataContext';
import GlobalStyles from '../style/GlobalStyles';

import { createStackNavigator } from '@react-navigation/stack';
import { ProfileStackParamList } from '../types/AppTypes';

import { screenFlowModule } from '../helper/ScreenFlowModule';
import MyDetails from './MyDetails';

const ProfileHeader = () => {
    const theme = useTheme();
    const { user } = useDataContext();

    return (
        <View style={{ margin: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                <Button mode='outlined'>ID Card</Button>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 }}>
                <View style={{ padding: 20, backgroundColor: '#d3d3d3ff', borderRadius: 50 }}>
                    <LucideIcons.UserRound size={50} />
                </View>
            </View>
            <CustomText variant='displaySmallBold' style={{ textAlign: 'center', marginTop: 20 }}>{user.firstname} {user.lastname}</CustomText>
            <CustomText variant='titleLarge' style={{ textAlign: 'center', marginTop: 10 }}>{user.position}</CustomText>
            <CustomText variant='titleSmall' style={{ textAlign: 'center', marginTop: 10 }}>{user.unitid}</CustomText>
        </View>
    )
}

const ProfilePage = () => {

    return (
        <View style={{ flex: 1 }}>
            <ProfileHeader />
            <ScrollView style={{ flex: 1, backgroundColor: '#fff' }} contentContainerStyle={{ paddingBottom: 200 }}>
                <View style={{ marginVertical: 40, paddingHorizontal: 20 }}>
                    <CustomText variant='titleLarge' style={{ marginBottom: 20 }}>Personal Information</CustomText>
                    <List.Section style={{ backgroundColor: '#f9f9f9ff', ...GlobalStyles.globalBorderRadius }}>
                        <List.Item style={{ height: 80, justifyContent: 'center' }} onPress={() => screenFlowModule.onNavigateToScreen('MyDetailsScreen')} title={() => <CustomText variant='bodyLarge'>My Details</CustomText>} right={() => <LucideIcons.ChevronRight />} />
                        <Divider />
                        <List.Item style={{ height: 80, justifyContent: 'center' }} onPress={() => navigateToPage('MyStatus')} title={() => <CustomText variant='bodyLarge'>My Status</CustomText>} right={() => <LucideIcons.ChevronRight />} />
                        <Divider />
                        <List.Item style={{ height: 80, justifyContent: 'center' }} onPress={() => navigateToPage('MyUnitDetails')} title={() => <CustomText variant='bodyLarge'>My Unit Details</CustomText>} right={() => <LucideIcons.ChevronRight />} />
                    </List.Section>
                    <CustomText variant='titleLarge' style={{ marginTop: 20, marginBottom: 20 }}>Volunteer Information</CustomText>
                    <List.Section style={{ backgroundColor: '#f9f9f9ff', ...GlobalStyles.globalBorderRadius }}>
                        <List.Item style={{ height: 80, justifyContent: 'center' }} onPress={() => navigateToPage('MyPersonalDetails')} title={() => <CustomText variant='bodyLarge'>My Personal Details</CustomText>} right={() => <LucideIcons.ChevronRight />} />
                        <Divider />
                        <List.Item style={{ height: 80, justifyContent: 'center' }} onPress={() => navigateToPage('MyStatus')} title={() => <CustomText variant='bodyLarge'>My Status</CustomText>} right={() => <LucideIcons.ChevronRight />} />
                        <Divider />
                        <List.Item style={{ height: 80, justifyContent: 'center' }} onPress={() => navigateToPage('MyUnitDetails')} title={() => <CustomText variant='bodyLarge'>My Unit Details</CustomText>} right={() => <LucideIcons.ChevronRight />} />
                    </List.Section>
                </View>
            </ScrollView>
        </View>
    )
}

const Profile = () => {
    const Stack = createStackNavigator<ProfileStackParamList>();

    return (
        <Stack.Navigator initialRouteName='ProfileScreen'
            screenOptions={{
                headerShown: false,
                gestureEnabled: true,
                transitionSpec: {
                    open: {
                        animation : 'timing',
                        config : {
                            duration: 450,
                            easing: Easing.inOut(Easing.quad)
                        }
                    },
                    close: {
                        animation : 'timing',
                        config : {
                            duration: 450,
                            easing: Easing.inOut(Easing.quad)
                        }
                    }
                }
            }}
        >
            <Stack.Screen name='ProfileScreen' component={ProfilePage}/>
            <Stack.Screen name='MyDetailsScreen' component={MyDetails}/>
        </Stack.Navigator>
    )
}

export default Profile;