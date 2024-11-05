import { Tabs } from "expo-router";
import { KeyboardAvoidingView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { TabBar } from "~/components";
import { tw } from "~/lib";
import { useTestParamsStore } from "~/stores";

export default function TestParameterTabs() {
  const { setSelectedType } = useTestParamsStore();

  return (
    <KeyboardAvoidingView behavior="padding" style={tw`flex-1`}>
      <SafeAreaView style={tw`flex-1 bg-white p-0`} edges={["bottom"]}>
        <Tabs
          backBehavior="history"
          screenListeners={{
            focus: ({ target }) => {
              if (target.includes("ion")) {
                setSelectedType("ion");
              } else if (target.includes("url")) {
                setSelectedType("url");
              }
            },
          }}
          screenOptions={{
            unmountOnBlur: true,
          }}
          tabBar={(p) => <TabBar {...p} />}
        >
          <Tabs.Screen name="url" />
          <Tabs.Screen name="ion" />
        </Tabs>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
