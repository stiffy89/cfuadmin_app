import React from "react";
import {Easing, View} from "react-native";
import GlobalStyles from "../../style/GlobalStyles";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { createStackNavigator} from "@react-navigation/stack";
import { FormServiceStackParamList } from "../../types/AppTypes";

import FormServicePage from "./FormServicePage";
import FormPage from "./FormPage";

const FormServiceStack = () => {
    const insets = useSafeAreaInsets();
    const Stack = createStackNavigator<FormServiceStackParamList>();

    return (
        <View style={{flex: 1, paddingBottom: insets.bottom}}>
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
        </View>
    );
};

export default FormServiceStack;