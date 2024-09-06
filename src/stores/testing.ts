// import AsyncStorage from "@react-native-async-storage/async-storage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import uuid from "react-native-uuid";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { computed } from "zustand-computed-state";

import {
  Stage,
  TestType,
  Message,
  BuddyEventPayload,
  BuddyEventType,
} from "~/types";

// function isDebuggingMessage(m: Message): m is Message<"debugging"> {
//   if (!m) return false;

//   return m.type === "debugging";
// }

// function isBuddyCallbackMessage(m: Message): m is Message<"buddyCallback"> {
//   if (!m) return false;

//   return m.type === "buddyCallback";
// }

// function isStatusMessage(m: Message): m is Message<"status"> {
//   if (!m) return false;

//   return m.type === "status";
// }

// function isEventMessage(m: Message): m is Message<"event"> {
//   if (!m) return false;

//   return m.type === "event";
// }

// function isFromNative(m: Message): boolean {
//   if (!m) return false;

//   return m.source === "native";
// }

// function isFromEmbeddedContent(m: Message): boolean {
//   if (!m) return false;

//   return m.source === "embeddedContent";
// }

type TestParameters<T extends TestType> = T extends TestType.ion
  ? {
      ion: string;
      stage: keyof typeof Stage;
      config: string;
      theme?: string;
      userEvents?: string;
    }
  : {
      url: string;
    };

type Test =
  | {
      startedAt: number;
      completedAt?: number;
      uuid: string;
      type: keyof typeof TestType;
      messages?: Array<Message<any>>;
      parameters: {
        url?: string;
        ion?: string;
        stage?: keyof typeof Stage;
        config?: string;
        theme?: string;
        userEvents?: string;
      };
    }
  | {
      startedAt: number;
      completedAt?: number;
      uuid: string;
      type: TestType.ion;
      messages?: Array<Message<any>>;
      parameters: {
        ion: string;
        stage: keyof typeof Stage;
        config: string;
        theme?: string;
        userEvents?: string;
      };
    }
  | {
      startedAt: number;
      completedAt?: number;
      uuid: string;
      type: TestType.url;
      messages?: Array<Message<any>>;
      parameters: {
        url: string;
      };
    };

function isIonTestPayload(
  p: Record<string, unknown>,
): p is TestParameters<TestType.ion> {
  return "ion" in p && "stage" in p;
}

type TestingState = {
  _hasRehydrated?: boolean;
  current?: Test;
  queryString?: string;
  history: Array<Test>;
};

type TestingStore = TestingState & {
  _setHasRehydrated: (v: boolean) => void;
  startTest: (type: keyof typeof TestType, p: TestParameters<TestType>) => void;
  handleMessage: (
    m: Message<BuddyEventPayload[keyof typeof BuddyEventType]>,
  ) => void;
  endTest: () => void;
};

function buildIONQueryString(payload: Record<string, unknown>) {
  if (!isIonTestPayload(payload)) {
    return undefined;
  }

  const q = new URLSearchParams(payload);
  const x = q.toString();

  return x;
}

export const useTestingStore = create<TestingStore>()(
  persist(
    computed((set, get) => ({
      _hasRehydrated: false,
      history: [],
      current: null,
      _setHasRehydrated: (v) => set((s) => ({ ...s, _hasRehydrated: v })),
      startTest: (type, p) =>
        set((s) => {
          return {
            ...s,
            queryString: buildIONQueryString(p),
            current: {
              parameters: p,
              startedAt: Date.now(),
              uuid: uuid.v4().toString(),
              messages: [],
              type,
            },
          };
        }),
      endTest: () => {
        set((s) => ({
          ...s,
          history: [...s.history, s.current],
          current: null,
        }));
      },
      handleMessage: (m) => {
        console.log(
          `[${Date.now()}]: ${m.source} ↠ ${m.destination}\n`,
          m.payload,
        );

        set((s) => ({
          ...s,
          current: {
            ...s.current,
            messages: [...s.current.messages, m],
          },
        }));
      },
      // ...compute(get, (state) => ({
      //   messages: {
      //     debugging: state.current?.messages.filter(isDebuggingMessage),
      //     buddyCallback: state.current?.messages.filter(isBuddyCallbackMessage),
      //     status: state.current?.messages.filter(isStatusMessage),
      //   },
      // })),
    })),
    {
      name: "testingStore",
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
        history: state.history,
        current: state.current,
      }),
    },
  ),
);

export const useIONTestingURL = () => {
  const current = useTestingStore((s) => s.current);
  const params = useTestingStore((s) => s.current.parameters);

  if (!process.env.EXPO_PUBLIC_ION_TESTING_BASE_URL) {
    throw new Error("Environment is missing ION_TESTING_BASE_URL");
  }

  if (current.type !== "ion") return;

  // if we reach this point, we know we're being invoked during an ion test
  // so it's safe to force the type of params here
  const { ion, config, stage, theme, userEvents } =
    params as TestParameters<TestType.ion>;

  // build a URLSearchParams object using buddy's expected query parameters
  const q = new URLSearchParams({
    ion,
    stage: stage.toUpperCase(),
    configUrl: config,
    theme,
    userEvents,
  });

  const keysToDelete = [];

  // remove any unwanted empty values
  q.forEach((value, key) => {
    if (!value || value === "null" || value === "") {
      keysToDelete.push(key);
    }
  });

  keysToDelete.forEach((key) => q.delete(key));

  const queryString = q.toString();

  return `${process.env.EXPO_PUBLIC_ION_TESTING_BASE_URL}?${queryString}`;
};
