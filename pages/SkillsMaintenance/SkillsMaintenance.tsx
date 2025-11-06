import React from "react";
import { Easing, View } from "react-native";
import GlobalStyles from "../../style/GlobalStyles";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { createStackNavigator } from "@react-navigation/stack";
import { SkillsMaintenanceStackParamList } from "../../types/AppTypes";

import SkillsMaintenancePage from "./SkillsMaintenancePage";
import DrillPage from "./DrillPage";
import DrillCardsPage from "./DrillCardsPage";
import DrillInstructionsPage from "./DrillInstructionsPage";


const SkillsMaintenanceStack = () => {
    const insets = useSafeAreaInsets();
    const Stack = createStackNavigator<SkillsMaintenanceStackParamList>();

    return (
        <View style={{flex: 1, paddingBottom: insets.bottom}}>
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
                <Stack.Screen name="DrillInstructionsPage" component={DrillInstructionsPage} />
                <Stack.Screen name="DrillCardPage" component={DrillCardsPage}/>
            </Stack.Navigator>
        </View>
    );
};

export default SkillsMaintenanceStack;