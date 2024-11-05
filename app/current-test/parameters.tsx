import { router } from "expo-router";
import { View, ScrollView, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Label, ModalTitleBar, Text } from "~/components";
import { tw } from "~/lib";
import { useTestParamsStore } from "~/stores";

export default function MessagesModal() {
  const isPresented = router.canGoBack();
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { selectedType, config, ion, stage, theme, url, userEvents } =
    useTestParamsStore();

  return (
    <View
      style={tw.style(`flex-1 relative`, {
        [`max-h-[${height / 3}px]`]: selectedType === "url",
        [`max-h-[${height / 2}px]`]: selectedType === "ion",
      })}
    >
      <View style={tw`bg-white flex-1 rounded-lg overflow-hidden`}>
        <ModalTitleBar
          badge={selectedType.toUpperCase()}
          title="Test Parameters"
          isDismissable={isPresented}
        />
        <ScrollView
          style={tw`flex-1`}
          contentContainerStyle={tw`px-5  pb-[${insets.bottom}px] pt-5`}
          snapToStart
        >
          {selectedType === "url" ? (
            <>
              <Label size="sm" semibold htmlFor="url">
                URL
              </Label>
              <Text size="md">{url.toLowerCase()}</Text>
            </>
          ) : (
            <View style={tw`flex flex-col items-stretch justify-start gap-y-5`}>
              <View>
                <Label size="sm" semibold htmlFor="ion">
                  ION
                </Label>
                <Text size="md">{ion}</Text>
              </View>

              <View>
                <Label size="sm" semibold htmlFor="stage">
                  Stage
                </Label>
                <Text size="md">{stage}</Text>
              </View>

              <View>
                <Label size="sm" semibold htmlFor="config">
                  Config
                </Label>
                <Text size="md">{config}</Text>
              </View>

              <View>
                <Label size="sm" semibold htmlFor="theme">
                  Theme
                </Label>
                <Text
                  style={tw.style({ "text-black/50 text-sm": !theme })}
                  size="md"
                >
                  {theme || "N/A"}
                </Text>
              </View>

              <View>
                <Label size="sm" semibold htmlFor="userEvents">
                  User Events
                </Label>
                <Text
                  style={tw.style({ "text-black/50 text-sm": !userEvents })}
                  size="md"
                >
                  {userEvents || "N/A"}
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}
