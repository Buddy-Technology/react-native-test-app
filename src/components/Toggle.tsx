import { FC } from "react";
import { Switch, View } from "react-native";

import { Text } from "./Text";

import { tw } from "~/lib";

type ToggleProps = {
  value: boolean;
  onChange: (value: boolean) => void;
  label?: string;
};

const trackColor = { true: "#ed311d", false: "#cecece" };

export const Toggle: FC<ToggleProps> = ({ value, onChange, label }) => {
  return (
    <View
      style={tw.style({
        "flex flex-row items-center justify-start gap-x-2":
          !!label && label !== "",
      })}
    >
      <Switch trackColor={trackColor} value={value} onValueChange={onChange} />
      {!!label && label !== "" && (
        <Text size="sm" semibold>
          {label}
        </Text>
      )}
    </View>
  );
};
