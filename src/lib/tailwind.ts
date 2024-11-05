import resolveConfig from "tailwindcss/resolveConfig";
import { create } from "twrnc";

import config, { Colors } from "../../tailwind.config";

const resolvedConfig = resolveConfig(config);

export const { theme } = resolvedConfig as unknown as {
  theme: (typeof resolvedConfig)["theme"] & { colors: Colors };
};

export const tw = create(require("../../tailwind.config.ts"));
