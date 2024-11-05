import { Link, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { X } from "lucide-react-native";
import { View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

import { Text } from "~/components";
import { tw } from "~/lib";

export default function MessagesModal() {
  const isPresented = router.canGoBack();
  const messages = Array.from(Array(50)).map((x, i) => i);

  return (
    <View style={tw`flex-1 items-center justify-start`}>
      <StatusBar style="light" />
      <View style={tw`flex flex-row items-center justify-evenly w-full p-4`}>
        <View style={tw`flex-3 `}>
          <Text semibold size="md">
            {messages.length} Messages
          </Text>
        </View>
        {isPresented && (
          <Link style={tw`py-2 pl-2 pr-0  relative top-2`} href="../">
            <X size={15} style={tw`text-gray-500`} />
          </Link>
        )}
      </View>

      <ScrollView style={tw`w-full`} contentContainerStyle={tw`h-full`}>
        {messages.map((message) => {
          return (
            <View
              key={message}
              style={tw`w-full flex flex-row items-center justify-start py-4 border-b-[1px] border-b-gray-200 px-3`}
            >
              <Text semibold>Message: {message}</Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
