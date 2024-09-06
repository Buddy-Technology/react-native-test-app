import { FC, useMemo } from "react";
import {
  Text as BaseText,
  type TextProps as BaseTextProps,
} from "react-native";
import { tv } from "tailwind-variants";
import { Style } from "twrnc";

import { tw } from "~/lib";

export type TextProps = Omit<BaseTextProps, "style"> & {
  semibold?: boolean;
  bold?: boolean;
  medium?: boolean;
  black?: boolean;
  allcaps?: boolean;
  thin?: boolean;
  className?: string;
  style?: string | Style;
  subtle?: boolean;
  size?: "sm" | "xs" | "md" | "lg" | "xl";
};

const classes = tv({
  variants: {
    allcaps: { true: "uppercase" },
    semibold: { true: "font-semibold" },
    regular: { true: "font-regular" },
    bold: { true: "font-bold" },
    medium: { true: "font-medium" },
    black: { true: "font-black" },
    thin: { true: "font-thin" },
    subtle: {
      true: "text-subtle/40",
      false: "text-black/80",
    },
    size: {
      sm: "text-sm",
      xs: "text-xs",
      md: "text-base",
      lg: "text-lg",
      xl: "text-xl",
    },
  },
});

export const Text: FC<TextProps> = ({
  size,
  subtle,
  thin,
  black,
  medium,
  allcaps,
  bold,
  semibold,
  className,
  style,
  children,
  ...props
}) => {
  const computedTw = useMemo(() => {
    const text = classes({
      size,
      allcaps,
      thin,
      subtle,
      black,
      medium,
      bold,
      semibold,
    });

    const styles = tw.style(text, className, style);

    return styles;
  }, [
    size,
    style,
    className,
    allcaps,
    black,
    subtle,
    thin,
    medium,
    bold,
    semibold,
  ]);

  return (
    <BaseText style={computedTw} {...props}>
      {children}
    </BaseText>
  );
};
