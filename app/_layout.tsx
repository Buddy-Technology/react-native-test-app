import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import * as Sentry from "@sentry/react-native";
import { isRunningInExpoGo } from "expo";
import { useFonts } from "expo-font";
import { Stack, useNavigationContainerRef } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useDeviceContext } from "twrnc";

import { tw } from "~/lib";
import { useTestParamsStore } from "~/stores";

const routingInstrumentation = new Sentry.ReactNavigationInstrumentation();

SplashScreen.preventAutoHideAsync();

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  debug: Boolean(process.env.EXPO_PUBLIC_ENABLE_SENTRY_DEBUGGING) !== true,
  integrations: [
    new Sentry.ReactNativeTracing({
      // Pass instrumentation to be used as `routingInstrumentation`
      routingInstrumentation,
      enableNativeFramesTracking: !isRunningInExpoGo(),
      traceXHR: true,
      traceFetch: true,
      // ...
    }),
  ],
});

function Layout() {
  const { _hasRehydrated } = useTestParamsStore();
  const [isReady, setReady] = useState(false);
  const ref = useNavigationContainerRef();
  const [fontsLoaded, fontError] = useFonts({
    Inter: Inter_400Regular,
    "Inter Medium": Inter_500Medium,
    "Inter Semibold": Inter_600SemiBold,
    "Inter Bold": Inter_700Bold,
  });

  useDeviceContext(tw, {
    observeDeviceColorSchemeChanges: false,
    initialColorScheme: "light",
  });

  useEffect(() => {
    if (ref) {
      routingInstrumentation.registerNavigationContainer(ref);
    }
  }, [ref]);

  useEffect(() => {
    async function rehydrateStore() {
      await useTestParamsStore.persist.rehydrate();
    }

    if (!_hasRehydrated) {
      rehydrateStore().catch((e) => console.error("failed to rehydrate", e));
    }
  }, [_hasRehydrated]);

  useEffect(() => {
    if (fontsLoaded && !fontError && _hasRehydrated) {
      SplashScreen.hideAsync();
      setReady(true);
    }
  }, [fontsLoaded, fontError, _hasRehydrated]);

  if (!fontsLoaded || fontError || !isReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={tw`flex-1 bg-white`}>
      <StatusBar style="dark" />

      <SafeAreaProvider>
        <SafeAreaView
          edges={["right", "left"]}
          mode="padding"
          style={tw`flex-1`}
        >
          <Stack initialRouteName="(tabs)/index">
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="(shared)/loading"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              options={{ headerShown: false }}
              name="current-test"
            />
          </Stack>
        </SafeAreaView>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default Sentry.wrap(Layout);
