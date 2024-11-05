import { Stack } from "expo-router";
import { useCallback, useEffect, useRef } from "react";
import { View } from "react-native";
import { WebView as BaseWebView } from "react-native-webview";

import { Header, ContentError, ContentLoading } from "~/components";
import { tw } from "~/lib";
import { useIONTestingURL, useTestingStore } from "~/stores";

const injectedJs = `
  window.onload = () => {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(
        JSON.stringify({
          type: "embedded-content",
          message: "window.ReactNativeWebView is available; loading embedded content now...",
        }),
      );
    } else {
      alert("window.ReactNativeWebView is not available. Cannot reach native app.");
    }
    
    return true;
  };

  window.onerror = (message, sourcefile, lineno, colno, error) => {
    if (!window.ReactNativeWebView) {
      alert(message + " - " + " in " + sourcefile + " at " + lineno + ":" + colno);
    } else {
      window.ReactNativeWebView.postMessage(
        JSON.stringify({
          error: true,
          type: "embedded-content",
          message: message,
          meta: { sourcefile, lineno, colno, error }
        }),
      );
    }

    return true; 
  }
`;

export default function Webview() {
  const { endTest, current, handleMessage } = useTestingStore();
  const webviewRef = useRef<BaseWebView>();
  const ionUrl = useIONTestingURL();
  const webviewSource = {
    uri: current.type === "ion" ? ionUrl : current.parameters.url,
  };

  const postMessage = useCallback(
    (msg: string) => {
      if (!webviewRef.current) return;

      webviewRef.current.postMessage(msg);
    },
    [webviewRef],
  );

  useEffect(() => {
    postMessage("native initialized.");
  }, [postMessage]);

  // #region webview event handlers
  const handleOnLoadEnd = (event) =>
    console.log("loadEnd:\n", event.nativeEvent.url);

  const handleOnLoadStart = (event) =>
    console.log("loadStart:\n", event.nativeEvent.url);

  const handleOnLoadProgress = (event) =>
    console.log("loadProgress:\n", event.nativeEvent.progress);

  const handleOnError = (e) => {
    handleMessage({
      source: "native",
      error: true,
      destination: "native",
      payload: e.nativeEvent,
    });
  };

  const handleOnHttpError = (e) => {
    handleMessage({
      source: "native",
      error: true,
      destination: "native",
      payload: e.nativeEvent,
    });
  };
  // #endregion
  // #region message handler
  const handleOnMessage = (x) => {
    try {
      const payload = JSON.parse(x.nativeEvent.data);

      handleMessage({
        source: "embeddedContent",
        destination: "native",
        error: payload.error !== false,
        payload,
      });
    } catch (error) {
      console.error(
        "Failed to parse original message payload from embedded content.\n",
        error,
      );
      handleMessage({
        source: "embeddedContent",
        destination: "native",
        payload: x.nativeEvent.data as any,
      });
    }
  };
  // #endregion

  return (
    <View style={tw`bg-white flex-1`}>
      <Stack.Screen
        options={{
          headerShown: true,
          header: () => (
            <Header
              headerTitle={() => <Header.LogoTitle size="sm" />}
              headerLeft={() => <Header.BackAction onPress={endTest} />}
              headerRight={() => <Header.TestActions />}
            />
          ),
        }}
      />

      <BaseWebView
        pullToRefreshEnabled
        ref={webviewRef}
        injectedJavaScriptBeforeContentLoaded={injectedJs}
        onLoadEnd={handleOnLoadEnd}
        onLoadStart={handleOnLoadStart}
        onLoadProgress={handleOnLoadProgress}
        startInLoadingState
        onShouldStartLoadWithRequest={() => true}
        containerStyle={tw`flex-1`}
        style={tw`flex-1`}
        onError={handleOnError}
        userAgent={process.env.EXPO_PUBLIC_WEBVIEW_USERAGENT}
        javaScriptEnabled
        renderError={ContentError}
        renderLoading={ContentLoading}
        onHttpError={handleOnHttpError}
        showsVerticalScrollIndicator
        showsHorizontalScrollIndicator={false}
        source={webviewSource}
        onMessage={handleOnMessage}
      />
    </View>
  );
}
