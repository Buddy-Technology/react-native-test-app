import { AlertTriangle } from "lucide-react-native";
import { View } from "react-native";

import { Text } from "../Text";

import { theme, tw } from "~/lib";

export const ContentError = (error, code, message) => {
  return (
    <View style={tw`gap-y-1 h-full justify-center items-center`}>
      <AlertTriangle size={50} style={tw`mb-3`} color={theme.colors.error} />
      <Text size="xl" semibold>
        {message}
      </Text>
      <View style={tw`flex-row gap-x-1 items-center justify-start`}>
        <Text size="xs" medium>
          {error}
        </Text>
        <Text size="xs" black>
          {code}
        </Text>
      </View>
    </View>
  );
};
