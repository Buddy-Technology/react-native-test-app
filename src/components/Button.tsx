import { MotiView, MotiText, View } from "moti";
import { FC, ReactNode, useMemo } from "react";
import { Pressable } from "react-native";
import { TouchableOpacityProps } from "react-native-gesture-handler";
import { tv } from "tailwind-variants";

import { StylingProps } from "./types";

import { theme, tw } from "~/lib";

type ButtonProps = Omit<TouchableOpacityProps, "style" | "containerStyle"> & {
  intent?: "primary" | "secondary" | "subtle";
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  fullWidth?: boolean;
  rounded?: boolean;
  round?: boolean;
  icon?: ReactNode;
  loading?: boolean;
  containerClassName?: string;
} & StylingProps;

const classes = tv({
  slots: {
    base: "rounded-sm overflow-hidden flex items-center justify-center flex-row gap-x-3 flex-nowrap",
    label: "font-medium",
    indicator: "hidden",
  },
  variants: {
    loading: {
      true: {
        indicator: "flex",
      },
    },
    full: {
      true: {
        base: "w-full",
        label: "w-full text-center",
      },
    },
    round: {
      true: {
        base: "rounded-full",
      },
      false: {},
    },
    rounded: {
      true: {
        base: "rounded-lg",
      },
    },
    disabled: {
      true: "opacity-50",
    },
    color: {
      primary: {
        base: `bg-[${theme.colors.primary.DEFAULT}]`,
        label: `text-[${theme.colors.primary.foreground}]`,
        indicator: `text-[${theme.colors.primary.foreground}]`,
      },
      secondary: {
        base: `bg-[${theme.colors.secondary.DEFAULT}]`,
        label: `text-[${theme.colors.secondary.foreground}]`,
        indicator: `text-[${theme.colors.secondary.foreground}]`,
      },
      subtle: {
        base: `bg-transparent border border-[${theme.colors.muted.DEFAULT}]`,
        label: `text-[${theme.colors.muted.foreground}]`,
        indicator: `text-[${theme.colors.muted.foreground}]`,
      },
    },
    size: {
      sm: {
        base: "py-1.5 px-3.5",
        label: "text-sm",
      },
      md: {
        base: "py-2 px-4",
        label: "text-base",
      },
      lg: {
        base: "py-3 px-4.5",
        label: "text-lg",
      },
      xl: {
        base: "py-3.5 px-5",
        label: "text-xl",
      },
    },
  },
  defaultVariants: {
    size: "md",
    full: true,
    rounded: true,
    color: "primary",
  },
});

export const Button: FC<ButtonProps> = ({
  style,
  containerClassName,
  size,
  intent,
  children,
  rounded,
  loading,
  icon,
  round,
  disabled,
  className,
  onPress,
  ...props
}) => {
  const computedTw = useMemo(() => {
    const { base, label, indicator } = classes({
      size,
      color: intent,
      loading,
      rounded,
      round,
      disabled,
      className,
    });
    const buttonStyles = tw.style(base(), style);
    const labelStyles = tw.style(label());
    const indicatorStyles = tw.style(indicator());

    return {
      button: buttonStyles,
      label: labelStyles,
      indicator: indicatorStyles,
    };
  }, [round, style, rounded, size, loading, intent, disabled, className]);

  return (
    <MotiView
      style={tw.style(containerClassName)}
      key="button"
      exit={{ opacity: 0 }}
      from={{ opacity: 1 }}
      animate={{
        opacity: 1,
      }}
    >
      <Pressable style={computedTw.button} onPress={onPress}>
        {icon ? <View style={tw`flex-1`}>{icon}</View> : null}
        <MotiText key="label" style={computedTw.label} exit={{ opacity: 0 }}>
          {children}
        </MotiText>
      </Pressable>
    </MotiView>
  );
};
