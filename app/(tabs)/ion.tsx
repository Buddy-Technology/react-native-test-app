import { Stack } from "expo-router";
import { MotiScrollView } from "moti";
import { View } from "react-native";

import { StageSelect, TextInput, Header } from "~/components";
import { tw } from "~/lib";
import { useIsValidIonConfiguration, useTestParamsStore } from "~/stores";

export default function IonConfiguration() {
  const {
    ion,
    config,
    stage,
    theme,
    userEvents,
    setConfig,
    setIon,
    setStage,
    setTheme,
    setUserEvents,
  } = useTestParamsStore();
  const isValid = useIsValidIonConfiguration();

  return (
    <View style={tw`flex-1 w-full p-8 pb-0 bg-white`}>
      <Stack.Screen
        options={{
          header: () => (
            <Header
              headerRight={isValid ? () => <Header.NextAction /> : null}
            />
          ),
        }}
      />

      <MotiScrollView
        style={tw`flex-1`}
        contentContainerStyle={tw`gap-y-4`}
        from={{ opacity: 0, translateY: 5 }}
        animate={{ opacity: 1, translateY: 0 }}
      >
        <TextInput
          name="ION"
          required
          value={ion}
          onChangeText={setIon}
          placeholder="SENTIENT_SNOWBALL"
          helpText="ION ID to test"
        />
        <StageSelect onChange={setStage} defaultValue={stage} />
        <TextInput
          name="Config"
          required
          value={config}
          onChangeText={setConfig}
          placeholder="https://remote-config.io/config.js"
          helpText="Accessible JS config"
        />
        <TextInput
          name="Theme"
          value={theme}
          required={false}
          onChangeText={setTheme}
          placeholder="config.theme"
          helpText="Location of theme configuration"
        />
        <TextInput
          name="User Events"
          required={false}
          value={userEvents}
          onChangeText={setUserEvents}
          placeholder="config.userEvents"
          helpText="Location of user events configuration"
        />
      </MotiScrollView>
    </View>
  );
}
