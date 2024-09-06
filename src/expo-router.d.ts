import "expo-router";
declare module "expo-router" {
  type UnknownOutputParams = Record<string, string>;

  export function useLocalSearchParams<
    T = { testId: "ion" | "url" },
  >(): SearchParams<T>;
}
