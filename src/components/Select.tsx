import { Picker } from "@react-native-picker/picker";
import { ComponentProps, FC } from "react";

import { StylingProps } from "./types";

const BaseSelect: FC<
  ComponentProps<typeof Picker> & StylingProps & { disabled?: boolean }
> = ({ disabled, className, style, ...props }) => {
  return <Picker {...props} aria-disabled={disabled} />;
};

export const SelectItem: FC<ComponentProps<typeof Picker.Item>> = (props) => {
  return <Picker.Item {...props} />;
};

export const Select = Object.assign(BaseSelect, {
  Item: SelectItem,
});
