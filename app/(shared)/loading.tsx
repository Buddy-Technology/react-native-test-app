import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";
import Spinner from "react-native-spinkit";

import { Text } from "~/components";
import { tw } from "~/lib";
import { useTestParamsStore } from "~/stores";

export default function Loading() {
  const navigation = useRouter();

  const { ion, url, stage, selectedType } = useTestParamsStore();

  useEffect(() => {
    const x = setTimeout(() => {
      navigation.navigate("/current-test/webview");
    }, 1500);

    return () => {
      clearTimeout(x);
    };
  });

  return (
    <View
      style={tw`flex-1 flex flex-col items-center justify-center gap-y-3 px-10 bg-white`}
    >
      <Stack.Screen
        options={{ animation: "fade_from_bottom", headerShown: false }}
      />
      <Spinner type="ChasingDots" color="black" />
      <Text semibold size="md" style={tw`text-center`}>
        {selectedType === "ion"
          ? `Starting ION ${stage} test for ${ion}`
          : `Starting URL ${stage} test for ${url}`}
      </Text>
    </View>
  );
}
