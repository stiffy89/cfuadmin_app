import React from "react";
import { Easing, View } from "react-native";
import GlobalStyles from "../../style/GlobalStyles";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { createStackNavigator} from "@react-navigation/stack";
import { ResourceStackParamList} from "../../types/AppTypes";

import ResourceCategoriesPage from "./ResourceCategoriesPage";
import ResourceListPage from "./ResourceListPage";
import ResourcePage from "./ResourcePage";

const ResourceStack = () => {
  const insets = useSafeAreaInsets();
  const Stack = createStackNavigator<ResourceStackParamList>();

  return (
    <View style={{flex: 1, paddingBottom: insets.bottom}}>
      <Stack.Navigator
        initialRouteName="ResourceCategoriesPage"
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
        <Stack.Screen
          name="ResourceCategoriesPage"
          component={ResourceCategoriesPage}
        />
        <Stack.Screen name="ResourceListPage" component={ResourceListPage} />
        <Stack.Screen name="ResourcePage" component={ResourcePage} />
      </Stack.Navigator>
    </View>
  );
};

export default ResourceStack;
