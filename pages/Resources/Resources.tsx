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
        initialRouteName="ResourceCategories"
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
          name="ResourceCategories"
          component={ResourceCategoriesPage}
        />
        <Stack.Screen name="ResourceList" component={ResourceListPage} />
        <Stack.Screen name="Resource" component={ResourcePage} />
      </Stack.Navigator>
    </View>
  );
};

export default ResourceStack;
