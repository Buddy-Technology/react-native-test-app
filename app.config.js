const IS_DEV = process.env.APP_VARIANT === "development";
const IS_PREVIEW = process.env.APP_VARIANT === "preview";

function getName() {
  if (IS_DEV) {
    return "Partner Testing Playground (Dev)";
  } else if (IS_PREVIEW) {
    return "Partner Testing Playground (Preview)";
  }

  return "Partner Testing Playground";
}

function getBundleIdentifier() {
  if (IS_DEV) {
    return "com.buddy.partner-testing-playground.dev";
  } else if (IS_PREVIEW) {
    return "com.buddy.partner-testing-playground.preview";
  }

  return "com.buddy.partner-testing-playground";
}

function getAssetsForVariant() {
  if (IS_DEV) {
    return {
      icon: "./assets/icon-dev.png",
    };
  } else if (IS_PREVIEW) {
    return {
      icon: "./assets/icon-preview.png",
    };
  }

  return {
    icon: "./assets/icon.png",
  };
}

const assets = getAssetsForVariant();
const bundleIdentifier = getBundleIdentifier();

export default {
  name: getName(),
  platforms: ["ios"],
  experiments: {
    typedRoutes: true,
  },
  slug: "partner-testing-playground",
  scheme: "buddy",
  version: "1.0.0",
  orientation: "portrait",
  icon: assets.icon,
  userInterfaceStyle: "automatic",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#DC5648",
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: false,
    bundleIdentifier,
  },
  plugins: [
    "expo-router",
    [
      "@sentry/react-native/expo",
      {
        organization: "shovel-sandbox",
        project: "buddy-ptp",
      },
    ],
    [
      "expo-font",
      {
        fonts: [
          "node_modules/@expo-google-fonts/inter/Inter_400Regular.ttf",
          "node_modules/@expo-google-fonts/inter/Inter_600SemiBold.ttf",
          "node_modules/@expo-google-fonts/inter/Inter_700Bold.ttf",
        ],
      },
    ],
  ],
  extra: {
    router: {
      origin: false,
    },
    eas: {
      projectId: "0fbce1a0-98ff-400a-9a49-a9e344dfcbe4",
    },
  },
  owner: "buddy-technology",
  runtimeVersion: "1.0.0",
  updates: {
    url: "https://u.expo.dev/0fbce1a0-98ff-400a-9a49-a9e344dfcbe4",
  },
  android: {
    package: "com.buddy.partner_testing_playground",
  },
};
