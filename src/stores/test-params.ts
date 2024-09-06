import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { Stage, TestType } from "~/types";

type TestParamsState = {
  _hasRehydrated?: boolean;
  selectedType: keyof typeof TestType | null;
  url: string | null;
  ion: string | null;
  stage: keyof typeof Stage | null;
  config: string | null;
  theme: string | null;
  userEvents: string | null;
};

type TestParamsStore = TestParamsState & {
  //
  _setHasRehydrated: (v: boolean) => void;
  setSelectedType: (x: keyof typeof TestType) => void;
  setUrl: (x: string) => void;
  setIon: (x: string) => void;
  setStage: (x: keyof typeof Stage) => void;
  setConfig: (x: string) => void;
  setTheme: (x: string) => void;
  setUserEvents: (x: string) => void;
  startNewTest: () => void;
};

// vanilla zustand
export const useTestParamsStore = create<TestParamsStore>()(
  persist(
    (set) => ({
      _hasRehydrated: false,
      selectedType: null,
      config: null,
      ion: null,
      stage: null,
      theme: null,
      url: null,
      userEvents: null,
      //
      _setHasRehydrated: (v) => set((s) => ({ ...s, _hasRehydrated: v })),
      setSelectedType: (type) => set((s) => ({ ...s, selectedType: type })),
      setUrl: (url) => set((s) => ({ ...s, url })),
      setIon: (ion) => set((s) => ({ ...s, ion })),
      setStage: (stage) => set((s) => ({ ...s, stage })),
      setConfig: (config) => set((s) => ({ ...s, config })),
      setTheme: (theme) => set((s) => ({ ...s, theme })),
      setUserEvents: (userEvents) => set((s) => ({ ...s, userEvents })),
      //
      stopCurrentTest: () => set((s) => ({})),
      startNewTest: () =>
        set((s) => {
          // clear unused url parameter
          if (s.selectedType === "ion") {
            return {
              ...s,
              stage: s.stage ?? "staging",
              url: null,
            };
          }
          // clear unused ion parameters
          else if (s.selectedType === "url") {
            return {
              ...s,
              ion: null,
              config: null,
              userEvents: null,
              stage: null,
              theme: null,
            };
          }
        }),
    }),
    {
      name: "testParamsStore",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage() {
        return (state, error) => {
          if (error) {
            console.error(error);
          } else {
            state._hasRehydrated = true;
          }
        };
      },
      partialize: (state) => ({
        selectedType: state.selectedType,
        config: state.config,
        ion: state.ion,
        url: state.url,
        stage: state.stage,
        theme: state.theme,
        userEvents: state.userEvents,
      }),
    },
  ),
);

export const useIsValidIonConfiguration = () => {
  return useTestParamsStore((s) => {
    return !!s.ion && s.ion !== "" && !!s.config && s.config !== "";
  });
};

export const useIsValidUrlConfiguration = () => {
  return useTestParamsStore((s) => {
    try {
      if (!s.url) {
        return {
          valid: false,
          error: "URL is required",
        };
      }

      console.info(s.url);

      /* eslint-disable-next-line */
      new URL(s.url);

      return { valid: true, error: null };
    } catch (error) {
      console.error("Failed to validate provided url\n", error);
      return { valid: false, error: "URL is invalid" };
    }
  });
};
