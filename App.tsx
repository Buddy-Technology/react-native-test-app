import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { useFonts } from "expo-font";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useDeviceContext } from "twrnc";

import "./src/global.css";

import { tw } from "~/lib";

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Inter: Inter_400Regular,
    "Inter Medium": Inter_500Medium,
    "Inter Semibold": Inter_600SemiBold,
    "Inter Bold": Inter_700Bold,
  });

  useDeviceContext(tw, {
    observeDeviceColorSchemeChanges: false,
    initialColorScheme: "light",
  });

  if (!fontsLoaded || fontError) {
    return null;
  }

  return <SafeAreaProvider />;
}
