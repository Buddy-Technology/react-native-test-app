import { Link } from "expo-router";
import { X } from "lucide-react-native";
import type { FC } from "react";
import { Pressable, View } from "react-native";

import { Text } from "../../Text";
import { StylingProps } from "../../types";

import { theme, tw } from "~/lib";

export const ModalTitleBar: FC<
  { title: string; badge?: string; isDismissable?: boolean } & StylingProps
> = ({ title, badge, isDismissable, style }) => {
  return (
    <View
      style={tw.style(
        `flex flex-row items-center justify-evenly w-full p-4`,
        "border-b-[1px] border-gray-200",
        style,
      )}
    >
      <View
        style={tw.style(`flex-3`, {
          "flex-row items-center justify-start gap-x-2": !!badge,
        })}
      >
        <Text semibold size="md">
          {title}
        </Text>

        {badge ? (
          <View
            style={tw`rounded-1 px-1.75 py-1 bg-[${theme.colors.primary.DEFAULT}]/30`}
          >
            <Text
              size="xs"
              bold
              style={tw`text-[${theme.colors.primary.DEFAULT}]`}
            >
              {badge}
            </Text>
          </View>
        ) : null}
      </View>
      {isDismissable && (
        <Link style={tw`py-2 px-2`} asChild href="../">
          <Pressable style={tw`flex-row items-center justify-end relative`}>
            <X size={20} style={tw`text-gray-500`} />
          </Pressable>
        </Link>
      )}
    </View>
  );
};
