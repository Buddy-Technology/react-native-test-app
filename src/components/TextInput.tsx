import { OctagonX } from "lucide-react-native";
import { AnimatePresence, MotiView } from "moti";
import { FC, ReactNode, useMemo, useState } from "react";
import {
  TextInput as BaseTextInput,
  View,
  type TextInputProps as BaseTextInputProps,
} from "react-native";
import { tv } from "tailwind-variants";

import { Label } from "./Label";
import { Text } from "./Text";
import { StylingProps } from "./types";

import { theme, tw } from "~/lib";

export type TextInputProps = Omit<
  BaseTextInputProps,
  "keyboardType" | "style"
> & {
  disabled?: boolean;
  error?: string;
  helpText?: string;
  placeholder?: string;
  required?: boolean;
  name: string;
  className?: string;
  type?: Pick<BaseTextInputProps, "keyboardType">["keyboardType"];
  Input?: ReactNode;
} & StylingProps;

const classes = tv({
  slots: {
    helpText: "text-xs text-black/50 font-medium",
    helpTextContainer: "px-2 mt-0.5",
    container:
      "rounded-md w-full px-3 pb-1.5 pt-2.5 border-[1px] border-black/20",
    label: "text-xs mb-0.5 font-semibold text-black",
    input: "w-full py-1.5 text-black",
    errorText: "text-xs",
    errorContainer: "mt-0.5 gap-x-0.5 flex items-center flex-row justify-start",
  },
  variants: {
    disabled: {
      true: {
        container: "opacity-50",
      },
    },
    invalid: {
      true: {
        helpText: "hidden",
        input: "",
        errorText: `text-[${theme.colors.error}]`,
        container: `border-[${theme.colors.error}]`,
      },
      false: {
        errorText: "hidden",
        input: "text-black",
      },
    },
  },
});

export const TextInput: FC<TextInputProps> = ({
  error,
  helpText,
  style,
  name,
  required = true,
  onChangeText,
  type,
  placeholder,
  disabled = false,
  className,
  value,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const computedTw = useMemo(() => {
    const {
      errorContainer,
      container,
      label,
      input,
      errorText,
      helpText,
      helpTextContainer,
    } = classes({
      invalid:
        (required !== false && !value && !!isDirty) ||
        (error !== undefined && error !== null && error !== ""),
      disabled: disabled !== false,
      className,
    });

    const containerStyles = tw.style(
      container(),
      {
        [`border-[${theme.colors.accent.DEFAULT}]`]: isFocused,
      },
      style,
    );
    const helpTextStyles = tw`${helpText()}`;
    const helpTextContainerStyles = tw.style(helpTextContainer());
    const errorTextStyles = tw.style(
      errorText(),
      `text-[${theme.colors.error}]`,
    );
    const errorContainerStyles = tw.style(errorContainer());
    const labelStyles = tw.style(label(), {});
    const inputStyles = tw.style(input());

    return {
      container: containerStyles,
      label: labelStyles,
      helpText: helpTextStyles,
      helpTextContainer: helpTextContainerStyles,
      errorContainer: errorContainerStyles,
      input: inputStyles,
      error: errorTextStyles,
    };
  }, [error, isDirty, className, isFocused, disabled, style, value, required]);

  const handleChange = (e: string) => {
    if (!isDirty) {
      setIsDirty(true);
    }

    onChangeText(e);
  };

  return (
    <View style={tw`flex flex-col items-start justify-start w-full`}>
      <View style={computedTw.container}>
        <Label htmlFor={name} style={computedTw.label}>
          {name}
        </Label>

        <BaseTextInput
          pointerEvents={disabled ? "none" : "auto"}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholderTextColor={theme.colors.gray[500]}
          onChangeText={handleChange}
          style={computedTw.input}
          autoCapitalize="none"
          keyboardType={type}
          id={name}
          placeholder={placeholder}
          value={value}
          {...props}
        />
      </View>

      {helpText && (
        <View style={computedTw.helpTextContainer}>
          <Text
            size="sm"
            style={computedTw.helpText}
            id={`${name}-description`}
          >
            {helpText}
          </Text>
        </View>
      )}
      <AnimatePresence>
        {required !== false && !value ? (
          <MotiView
            key="missing-required-value-error"
            style={computedTw.errorContainer}
            animate={{
              opacity: 1,
              translateY: 0,
            }}
          >
            <Text size="xs" medium style={computedTw.error}>
              {name} is required
            </Text>
          </MotiView>
        ) : null}

        {typeof error === "string" ? (
          <MotiView
            key="error"
            style={computedTw.errorContainer}
            animate={{
              opacity: 1,
              translateY: 0,
            }}
          >
            <OctagonX size={15} color={theme.colors.error} />
            <Text size="xs" medium style={computedTw.error}>
              {error}
            </Text>
          </MotiView>
        ) : null}
      </AnimatePresence>
    </View>
  );
};
