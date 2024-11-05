import { Stack } from "expo-router";
import { MotiScrollView } from "moti";
import { View } from "react-native";

import { Header, TextInput } from "~/components";
import { tw } from "~/lib";
import { useIsValidUrlConfiguration, useTestParamsStore } from "~/stores";

export default function UrlConfiguration() {
  const { url, setUrl } = useTestParamsStore();
  const { valid: isValid } = useIsValidUrlConfiguration();

  return (
    <View style={tw`bg-white flex-1 p-8`}>
      <Stack.Screen
        options={{
          headerShown: true,
          animation: "flip",
          header: () => (
            <Header
              headerRight={isValid ? () => <Header.NextAction /> : null}
            />
          ),
        }}
      />
      <MotiScrollView
        from={{ opacity: 0, translateY: 10 }}
        animate={{ opacity: 1, translateY: 0 }}
      >
        <TextInput
          onChangeText={setUrl}
          required
          value={url}
          type="url"
          name="URL"
          placeholder="https://buddy.insure"
        />
      </MotiScrollView>
    </View>
  );
}
