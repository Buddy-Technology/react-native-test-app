import { Stack } from "expo-router";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { tw } from "~/lib";

export default () => {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView edges={["top"]} mode="padding" style={tw`flex-1 bg-white`}>
      <Stack
        screenOptions={{
          autoHideHomeIndicator: true,
          animation: "slide_from_bottom",
        }}
      >
        <Stack.Screen
          options={{
            animation: "fade",
            headerShown: true,
          }}
          name="webview"
        />
        <Stack.Screen
          name="messages"
          options={{
            headerShown: false,
            presentation: "modal",
            animation: "fade_from_bottom",
          }}
        />
        <Stack.Screen
          name="parameters"
          options={{
            headerShown: false,
            presentation: "formSheet",
            autoHideHomeIndicator: true,
            animation: "ios",
            contentStyle: tw`bg-transparent pt-[${insets.top}px] flex flex-col items-stretch justify-end`,
          }}
        />
      </Stack>
    </SafeAreaView>
  );
};
