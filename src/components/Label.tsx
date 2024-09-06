import { FC, useMemo } from "react";
import { tv } from "tailwind-variants";

import { Text, type TextProps } from "./Text";
import { StylingProps } from "./types";

import { tw } from "~/lib";

type LabelProps = TextProps &
  StylingProps & {
    invalid?: boolean;
    htmlFor: string;
  };

const classes = tv({
  variants: {
    invalid: {
      true: "text-error",
    },
  },
});

export const Label: FC<LabelProps> = ({
  className,
  htmlFor,
  size,
  style,
  invalid,
  children,
  ...props
}) => {
  const computedTw = useMemo(() => {
    const label = classes({ invalid });
    return tw.style(label, style, className);
  }, [className, style, invalid]);

  return (
    <Text style={computedTw} bold size="xs" {...props}>
      {children}
    </Text>
  );
};
