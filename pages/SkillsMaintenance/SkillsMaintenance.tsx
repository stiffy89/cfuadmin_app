import React from "react";
import { Easing } from "react-native";
import GlobalStyles from "../../style/GlobalStyles";

import { createStackNavigator } from "@react-navigation/stack";
import { SkillsMaintenanceStackParamList } from "../../types/AppTypes";

import SkillsMaintenancePage from "./SkillsMaintenancePage";
import DrillPage from "./DrillPage";
import DrillCardsPage from "./DrillCardsPage";

const SkillsMaintenanceStack = () => {
    const Stack = createStackNavigator<SkillsMaintenanceStackParamList>();

    return (
        <Stack.Navigator
            initialRouteName="SkillsMaintenancePage"
            screenOptions={{
            headerShown: false,
            cardStyle: GlobalStyles.AppBackground,
            gestureEnabled: true,
            transitionSpec: {
                open: {
                animation: "timing",
                config: {
                    duration: 450,
                    easing: Easing.inOut(Easing.quad),
                },
                },
                close: {
                animation: "timing",
                config: {
                    duration: 450,
                    easing: Easing.inOut(Easing.quad),
                },
                },
            },
            }}
        >
            <Stack.Screen name="SkillsMaintenancePage" component={SkillsMaintenancePage} />
            <Stack.Screen name="DrillPage" component={DrillPage}/>
            <Stack.Screen name="DrillCardPage" component={DrillCardsPage}/>
        </Stack.Navigator>
    );
};

export default SkillsMaintenanceStack;