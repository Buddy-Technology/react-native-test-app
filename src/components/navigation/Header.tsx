import { Header as RNHeader } from "@react-navigation/elements";
import { Link } from "expo-router";
import {
  ChevronLeft,
  /*MessageCircleCode,*/ Settings2,
} from "lucide-react-native";
import { View } from "moti";
import { type FC, type ComponentProps } from "react";
import { Pressable } from "react-native";

import { Logotext } from "../Logo";
import { Text } from "../Text";

import { theme as twTheme, tw } from "~/lib";
import { useTestParamsStore, useTestingStore } from "~/stores";

type HeaderProps = Omit<ComponentProps<typeof RNHeader>, "title"> & {
  title?: string;
  onPressRight?: () => void;
  onPressLeft?: () => void;
};
type NextActionProps = {
  label?: string;
};
type BackActionProps = { onPress?: () => void };

interface CompoundHeader {
  LogoTitle: FC<{ size?: "sm" | "base" }>;
  BackAction: FC<BackActionProps>;
  TestActions: FC;
  NextAction: FC<NextActionProps>;
}

const BackAction: FC<BackActionProps> = ({ onPress }) => (
  <View style={tw`flex-1 flex-row items-center justify-start gap-x-3.5 pr-4`}>
    <Link style={tw`p-2 pl-3`} asChild href="/ion">
      <Pressable
        onPress={onPress}
        style={tw`flex-row items-center justify-end relative`}
      >
        <ChevronLeft
          size={20}
          style={tw.style(`text-[${twTheme.colors.muted.foreground}]`)}
        />
        <Text
          size="sm"
          semibold
          style={tw`text-[${twTheme.colors.muted.foreground}]`}
        >
          Back
        </Text>
      </Pressable>
    </Link>
  </View>
);

const LogoTitle = () => <Logotext size={70} />;

const NextAction: FC<NextActionProps> = ({ label }) => {
  const { startTest } = useTestingStore();
  const { selectedType, ion, config, url, stage, userEvents, theme } =
    useTestParamsStore();

  return (
    <Link
      href="/(shared)/loading"
      style={tw`flex-1 flex-row items-center justify-center pr-5 py-3`}
      onPress={() =>
        startTest(selectedType, { ion, config, url, stage, userEvents, theme })
      }
    >
      <Text
        size="sm"
        semibold
        style={tw`my-auto text-[${twTheme.colors.muted.foreground}]`}
      >
        {label ?? "Submit"}
      </Text>
    </Link>
  );
};

const TestActions = () => (
  <View style={tw`flex-1 flex-row items-center justify-start gap-x-3.5 pr-4`}>
    <Link style={tw`py-2`} asChild href="/current-test/parameters">
      <Pressable style={tw`flex-row items-center justify-end relative`}>
        <Settings2
          size={20}
          style={tw.style(`text-[${twTheme.colors.muted.foreground}]`)}
        />
      </Pressable>
    </Link>

    {/* <Link style={tw`py-2`} asChild href="/current-test/messages">
      <Pressable style={tw`flex-row items-center justify-end relative`}>
        <MessageCircleCode
          size={20}
          style={tw.style(`text-[${twTheme.colors.muted.foreground}]`)}
        />
      </Pressable>
    </Link> */}
  </View>
);

const HeaderRoot: FC<HeaderProps> = ({
  headerStyle,
  title,
  headerRight,
  headerLeft,
  onPressRight,
  onPressLeft,
  ...props
}) => {
  return (
    <RNHeader
      title={title}
      headerTitle={title ? null : () => <Header.LogoTitle />}
      headerStyle={headerStyle}
      headerRight={headerRight}
      headerLeft={headerLeft}
      {...props}
    />
  );
};

export const Header: CompoundHeader & FC<HeaderProps> = Object.assign(
  HeaderRoot,
  {
    LogoTitle,
    BackAction,
    TestActions,
    NextAction,
  },
);
