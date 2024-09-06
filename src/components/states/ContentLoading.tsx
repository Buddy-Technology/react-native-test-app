import { View } from "react-native";
import Spinner from "react-native-spinkit";

import { theme, tw } from "~/lib";

export const ContentLoading = () => (
  <View style={tw`h-full justify-center items-center`}>
    <Spinner size={50} color={theme.colors.accent.DEFAULT} type="ArcAlt" />
  </View>
);
