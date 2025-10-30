import React from "react";
import {Easing} from "react-native";
import GlobalStyles from "../../style/GlobalStyles";

import { createStackNavigator} from "@react-navigation/stack";
import { FormServiceStackParamList } from "../../types/AppTypes";

import FormServicePage from "./FormServicePage";
import FormPage from "./FormPage";

const FormServiceStack = () => {
    const Stack = createStackNavigator<FormServiceStackParamList>();

    return (
    <Stack.Navigator
        initialRouteName="FormServicePage"
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
        <Stack.Screen name="FormServicePage" component={FormServicePage} />
        <Stack.Screen name="FormPage" component={FormPage} options={{animation: "slide_from_bottom", gestureEnabled: false}}/>
    </Stack.Navigator>
    );
};

export default FormServiceStack;