import { useRouter, Tabs } from "expo-router";
import { Atom, Chrome } from "lucide-react-native";
import { AnimatePresence, MotiText, MotiView } from "moti";
import { useState, type ComponentProps, useEffect } from "react";
import { Pressable, View, Keyboard } from "react-native";

import { theme, tw } from "~/lib";

type TabBarProps = Parameters<ComponentProps<typeof Tabs>["tabBar"]>[0];

const UrlTab = ({ isFocused }: { isFocused?: boolean }) => {
  return (
    <>
      <MotiView animate={{ rotate: isFocused ? "90deg" : "0deg" }}>
        <Chrome size={24} style={tw`text-[${theme.colors.muted.foreground}]`} />
      </MotiView>
      {isFocused ? (
        <MotiText
          from={{ bottom: -30, opacity: 0 }}
          animate={{ opacity: 1, bottom: -34 }}
          delay={150}
          exit={{ opacity: 0 }}
          // exitTransition={{ duration: 250, delay: 50 }}
          style={tw`absolute -bottom-8 tracking-wider text-xs font-bold`}
        >
          URL
        </MotiText>
      ) : null}
    </>
  );
};

const IonTab = ({ isFocused }: { isFocused?: boolean }) => {
  return (
    <>
      <MotiView
        animate={{
          rotate: isFocused ? "90deg" : "0deg",
        }}
      >
        <Atom size={24} style={tw`text-[${theme.colors.muted.foreground}]`} />
      </MotiView>

      {isFocused ? (
        <MotiText
          from={{ bottom: -30, opacity: 0 }}
          animate={{ opacity: 1, bottom: -34 }}
          exit={{ opacity: 0 }}
          // exitTransition={{ duration: 250, delay: 50 }}
          style={tw`absolute -bottom-8 tracking-wider text-xs font-bold`}
        >
          ION
        </MotiText>
      ) : null}
    </>
  );
};

export const TabBar = (props: TabBarProps) => {
  const router = useRouter();
  const [keyboardIsVisible, setKeyboardIsVisible] = useState(false);
  useEffect(() => {
    Keyboard.addListener("keyboardWillShow", () => setKeyboardIsVisible(true));
    Keyboard.addListener("keyboardWillHide", () => setKeyboardIsVisible(false));

    return () => {
      Keyboard.removeAllListeners("keyboardWillShow");
      Keyboard.removeAllListeners("keyboardWillHide");
    };
  }, []);

  return (
    <AnimatePresence>
      {keyboardIsVisible ? null : (
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          exit={{ opacity: 0, translateY: 200 }}
          style={tw.style(
            `absolute flex flex-1 items-center justify-center w-full h-20 px-5`,
            `bottom-[${props.insets.bottom}px]`,
          )}
        >
          <View
            style={tw`rounded-full relative z-50 gap-x-2 px-3 py-3 flex w-[192px] flex-row bg-[${theme.colors.muted.DEFAULT}]`}
          >
            {props.state.routes.map((route, idx) => {
              const isFocused = props.state.index === idx;

              const handlePress = () => {
                switch (route.name) {
                  // ION configuration
                  case "ion": {
                    router.push("/(tabs)/ion");
                    break;
                  }
                  // URL configuration
                  case "url": {
                    router.push("/(tabs)/url");
                    break;
                  }
                }
              };

              // 80 + 80 + 8 + 24
              // 80 (button width)
              // 8 (spacing between buttons)
              // 24 (12px padding on left and right of tab bar)
              return (
                <Pressable
                  key={route.name}
                  style={tw.style(
                    `py-2 px-3  h-full min-w-20 flex-1 flex flex-row rounded-full items-center justify-center`,
                    {
                      [`bg-[${theme.colors.background}]`]: isFocused,
                    },
                  )}
                  onPress={handlePress}
                >
                  <AnimatePresence>
                    {route.name === "url" && <UrlTab isFocused={isFocused} />}
                    {route.name === "ion" && <IonTab isFocused={isFocused} />}
                  </AnimatePresence>
                </Pressable>
              );
            })}
          </View>
        </MotiView>
      )}
    </AnimatePresence>
  );
};
