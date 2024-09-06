import { ChevronDown, X } from "lucide-react-native";
import { MotiText, MotiView } from "moti";
import { FC, useMemo, useState } from "react";
import { Pressable, TouchableOpacity, View } from "react-native";
import { tv } from "tailwind-variants";

import { Label } from "./Label";
import { Select } from "./Select";
import { Text } from "./Text";
import { StylingProps } from "./types";

import { theme, tw } from "~/lib";
import { Stage } from "~/types";

const classes = tv({
  slots: {
    container:
      "rounded-md w-full pb-1.5 pt-2.5 border border-black/20 flex flex-col items-stretch justify-evenly",
    controls: "flex flex-col items-stretch justify-start px-3 w-[90%]",
    helpText: "text-xs text-black/50 font-medium",
    helpTextContainer: "px-2 mt-1.5",
    closeContainer: "flex flex-row items-center justify-start gap-x-1",
    closeLabel: "text-gray-500 uppercase text-xs font-semibold tracking-wide",
    resetButton:
      "ml-auto flex flex-row items-center justify-end px-2 pr-3 pb-1",
  },
  variants: {
    focused: {
      true: {
        container: `border-${theme.colors.accent.DEFAULT}`,
      },
      false: {
        container: "border-black/20",
      },
    },
    disabled: {
      true: {
        container: "opacity-50 bg-zinc-200",
        helpText: "opacity-80",
      },
    },
    invalid: {
      true: {
        helpText: "hidden",
        errorText: `text-[${theme.colors.error}]`,
        label: `text-[${theme.colors.error}]`,
        container: "border-error",
      },
      false: {
        errorText: "hidden",
        container: "",
      },
    },
  },
});

type StageSelectProps = StylingProps & {
  error?: string;
  disabled?: boolean;
  helpText?: string;
  defaultValue?: keyof typeof Stage;
  onChange?: (s: keyof typeof Stage) => void;
};

export const StageSelect: FC<StageSelectProps> = ({
  className,
  error,
  style,
  defaultValue,
  disabled,
  onChange,
  ...props
}) => {
  const fallbackValue = defaultValue ?? Stage.staging;
  const [value, setValue] = useState(fallbackValue);
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const collapsePicker = () => {
    setIsOpen(false);
    // setIsFocused(false);
  };
  const showPicker = () => {
    setIsOpen(true);
    // setIsFocused(true);
  };
  const onSelectStage = (e: keyof typeof Stage) => {
    setValue(e);
    setIsOpen(false);
    onChange(e);
  };

  const computedTw = useMemo(() => {
    const {
      container,
      closeContainer,
      closeLabel,
      resetButton,
      controls,
      helpText,
      helpTextContainer,
    } = classes({
      invalid: error !== undefined && error !== null && error !== "",
      focused: isFocused !== false,
      disabled,
      className,
    });
    const selectStyles = tw`${controls()}`;
    const containerStyles = tw.style(container(), style);
    const resetButtonStyles = tw`${resetButton()}`;
    const helpTextContainerStyles = tw`${helpTextContainer()}`;
    const helpTextStyles = tw`${helpText()}`;
    const closeContainerStyles = tw`${closeContainer()}`;
    const closeLabelStyles = tw`${closeLabel()}`;

    return {
      container: containerStyles,
      resetButton: resetButtonStyles,
      select: selectStyles,
      closeContainer: closeContainerStyles,
      closeLabel: closeLabelStyles,
      helpText: helpTextStyles,
      helpTextContainer: helpTextContainerStyles,
    };
  }, [error, className, style, isFocused, disabled]);

  return (
    <View style={tw`flex flex-col`}>
      <Pressable
        disabled={disabled}
        onPress={showPicker}
        style={computedTw.container}
      >
        <View style={tw`flex flex-row items-stretch justify-start`}>
          <View style={computedTw.select}>
            <Label htmlFor="stage" semibold>
              Stage
            </Label>

            <Text size="sm">{!value ? "Choose Stage" : value}</Text>
          </View>
          <TouchableOpacity
            disabled={disabled}
            style={computedTw.resetButton}
            onPress={isOpen ? collapsePicker : showPicker}
          >
            {isOpen ? (
              <View style={computedTw.closeContainer}>
                <MotiText
                  from={{ opacity: 0, translateX: 5 }}
                  animate={{ opacity: 1, translateX: 0 }}
                  style={computedTw.closeLabel}
                >
                  Dimiss
                </MotiText>
                <MotiView from={{ scale: 0 }} animate={{ scale: 1 }}>
                  <X size={15} strokeWidth={2} color={theme.colors.gray[500]} />
                </MotiView>
              </View>
            ) : (
              <ChevronDown size={20} color={theme.colors.zinc[700]} />
            )}
          </TouchableOpacity>
        </View>
        <MotiView
          transition={{ translateY: { damping: 50 } }}
          animate={{ opacity: isOpen ? 1 : 0, translateY: isOpen ? 0 : -20 }}
        >
          {isOpen ? (
            <Select
              onFocus={showPicker}
              onBlur={collapsePicker}
              onValueChange={onSelectStage}
              selectedValue={value}
              selectionColor={theme.colors.accent.DEFAULT}
              disabled={disabled}
            >
              {Object.keys(Stage).map((environment) => {
                return (
                  <Select.Item
                    color={value === Stage[environment] ? "#724CF9" : "#0a0a0a"}
                    value={Stage[environment]}
                    key={environment}
                    label={Stage[environment]}
                  />
                );
              })}
            </Select>
          ) : null}
        </MotiView>
      </Pressable>
      {!isOpen ? (
        <View style={computedTw.helpTextContainer}>
          <Text size="sm" style={computedTw.helpText} id="staging-description">
            {props.helpText ? props.helpText : "Environment to simulate"}
          </Text>
        </View>
      ) : null}
    </View>
  );
};
