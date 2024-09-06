import {
  WebViewError,
  WebViewHttpError,
} from "react-native-webview/lib/WebViewTypes";

export enum BuddyEventType {
  onViewChange = "onViewChange",
  onBlur = "onBlur",
  onFocus = "onFocus",
  onRadioSelection = "onRadioSelection",
  onCheckboxSelection = "onCheckboxSelection",
  onQuote = "onQuote",
  onCheckout = "onCheckout",
  onValidationError = "onValidationError",
  onExternalLink = "onExternalLink",
  // global events
  onLoad = "onLoad",
  onError = "onError",
}

/**
 @description config.userEvents payloads
*/
export type BuddyEventPayload = {
  [BuddyEventType.onLoad]: Record<string, unknown>;
  [BuddyEventType.onError]: { meta?: Record<string, unknown> } & Record<
    string,
    unknown
  >;
  [BuddyEventType.onViewChange]: {
    viewId: string;
    ion?: string;
    channelUrl: string;
  };
  [BuddyEventType.onBlur]: {
    timestamp: number;
    elementId: string;
  };
  [BuddyEventType.onFocus]: {
    timestamp: number;
    elementId: string;
  };
  [BuddyEventType.onRadioSelection]: {
    timestamp: number;
    elementId: string;
    value: string | number;
  };
  [BuddyEventType.onCheckboxSelection]: {
    timestamp: number;
    elementId: string;
    value: true | false;
  };
  [BuddyEventType.onQuote]: {
    price: string | number;
    ion?: string;
    channelUrl: string;
  };
  [BuddyEventType.onCheckout]: {
    price: number | string;
    premium: number | string;
    checkoutStatus: string;
    orderID: string;
    ion?: string;
    channelUrl: string;
  };
  [BuddyEventType.onValidationError]: {
    timestamp: number;
    elementId: string;
    validationError: string;
    ion?: string;
    channelUrl: string;
  };
  [BuddyEventType.onExternalLink]: {
    externalLinkUrl: string;
    ion?: string;
    channelUrl: string;
  };
};

export enum Stage {
  production = "Production",
  staging = "Staging",
  testing = "Testing",
}

export enum TestType {
  ion = "ion",
  url = "url",
}

export enum MessageType {
  status = "status",
  event = "event",
  bridge = "bridge",
  error = "error",
  buddyCallback = "buddy-callback",
  debugging = "debugging",
}

export enum MessageRecipient {
  native = "native",
  embeddedContent = "embedded-content",
}

export type Message<P extends Record<string, unknown>> =
  | {
      source: "native";
      error: true;
      destination: "native";
      payload: WebViewError;
    }
  | {
      source: "native";
      error: true;
      destination: "native";
      payload: WebViewHttpError;
    }
  | {
      error?: boolean;
      source: keyof typeof MessageRecipient;
      destination?: keyof typeof MessageRecipient;
      payload?: P & { meta?: Record<string, unknown> };
    };
