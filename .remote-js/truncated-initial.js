if (!window.Buddy) {
  window.Buddy = {};
}

const STAGE_CONFIG = "STAGING";

function insertUmami() {
  const script = document.createElement("script");
  script.async = true;
  script.src = "https://buddy-analytics.netlify.app/script.js";
  // const currentDomain = window.location.hostname;
  // console.log('currentDomain', currentDomain);
  const umamiCode =
    STAGE_CONFIG === "PRODUCTION"
      ? "3282b970-f011-4341-a2fa-e2c669096b4d"
      : "01156092-d59d-4b7f-84d6-d93f4915343e";
  script.setAttribute("data-website-id", umamiCode);

  try {
    document.body.appendChild(script);
  } catch (error) {
    console.log(error);
  }
}

let offeringOptions = {};
let channelUrl;

if (typeof window !== "undefined") {
  channelUrl = window.location.href;
}

function waitForOptions() {
  const checkInterval = setInterval(() => {
    if (window?.options) {
      // console.log('options is now available', options);
      offeringOptions = options;

      window.ReactNativeWebView.postMessage(
        JSON.stringify({
          type: "embedded-content",
          message: "options successfully configured",
        }),
      );

      // console.log('offeringOptions', offeringOptions);
      clearInterval(checkInterval); // Stop checking
    }
  }, 100); // Check every 100 milliseconds
}

try {
  insertUmami();
  waitForOptions();
} catch (error) {
  console.log(error);
}

function addScript(src) {
  console.log("adding script for chase iFrame");
  const chaseIframescript = Object.assign(document.createElement("script"), {
    type: "text/javascript",
    src,
  });
  document.body.appendChild(chaseIframescript);
}

function addStyles(src) {
  console.log("adding styles to head to support chase iFrame wrapper");
  const wrapperStylesLink = Object.assign(document.createElement("link"), {
    type: "text/css",
    href: src,
    rel: "stylesheet",
  });
  document.head.appendChild(wrapperStylesLink);
}

try {
  // To use postMessage, merchant must include the following script on iFrame parent page
  const hpfScript =
    STAGE_CONFIG === "PRODUCTION"
      ? "https://www.chasepaymentechhostedpay.com/hpf/js/hpfParent.min.js"
      : "https://www.chasepaymentechhostedpay-var.com/hpf/js/hpfParent.min.js";
  addScript(hpfScript);
  // diff styles based on ENV
  const baseSrcWrapperStyles =
    STAGE_CONFIG === "PRODUCTION"
      ? "https://embed.buddy.insure/allstate/payment/wrapperStyles.css"
      : "https://staging.embed.buddy.insure/allstate/payment/wrapperStyles.css";
  addStyles(baseSrcWrapperStyles);
} catch (error) {
  console.log(error);
}
function sendMessage(payload) {
  const buddyFrame = document.getElementById("buddy_iframe");
  const data = {
    action: "CUSTOM_MESSAGE",
    buddy_source: "config",
    timestamp: Date.now(),
    payload,
  };
  buddyFrame?.contentWindow?.postMessage(data, "*");
}

function killModal() {
  // Find the div with ID 'secureFrameWrapper'
  const div = document.getElementById("secureFrameWrapper");
  // If the div exists, remove it from the DOM
  if (div) {
    div.parentNode.removeChild(div);
  } else {
    console.error('Div with ID "secureFrameWrapper" not found.');
  }
}

// Map each error code to its message or a default message
const errorMessages = {
  118: "We're experiencing technical difficulties. Please try after some time!",
  200: "An unexpected error occurred. Please close the window and try again.",
  310: "Please enter the name associated with this card.",
  315: "Please enter a valid credit card number.",
  320: "Please enter a valid credit card number.",
  330: "Please enter a valid expiration month.",
  340: "Please enter a valid expiration year.",
  350: "Please enter a valid CVV.",
  355: "Please enter a valid CVV.",
  357: "Please enter valid credit card information.",
  360: "Please check one of the following fields for errors: zip, credit card number",
  365: "You have reached the max number of attempts. Please hit cancel and try again.",
  370: "Please enter a valid expiration date.",
  400: "We're experiencing technical difficulties. Please try after some time!",
  530: "Please enter a valid ZIP code.",
  531: "Please enter a valid ZIP code.",
  0o5: "Your payment info could not be processed. Please close the window and select another payment method.",
  52: "Your payment info could not be processed. Please close the window and select another payment method.",
  89: "We're experiencing technical difficulties. Please try after some time!",
  521: "We're experiencing technical difficulties. Please try after some time!",
  841: "We're experiencing technical difficulties. Please try after some time!",
  20412:
    "We're experiencing technical difficulties. Please try after some time!",
  9582: "We're experiencing technical difficulties. Please try after some time!",
};

function handlePaymentErrors(data) {
  const errorsReceived = data.errorCode;
  const errorsToSend = errorsReceived
    .filter((code) => code.trim() !== "")
    .map((code) => errorMessages[code] || "Unknown error occurred");
  const combinedMessage = Object.values(errorsToSend).join("\n\n");
  const secureDiv = document.getElementById("secureFrameWrapper");
  const formattedError = `<span">${combinedMessage}</span>`;

  if (secureDiv) {
    const errorContainer = document.getElementById("displayErrors");
    if (!errorContainer) {
      const newErrorContainer = Object.assign(document.createElement("div"), {
        id: "displayErrors",
      });
      const newErrorParagraph = Object.assign(document.createElement("p"), {
        id: "errorParagraph",
        role: "alert",
      });
      newErrorParagraph.innerHTML = formattedError;
      newErrorContainer.appendChild(newErrorParagraph);
      secureDiv.appendChild(newErrorContainer);
    } else {
      const newErrorParagraph = Object.assign(
        document.getElementById("errorParagraph"),
        { innerHTML: "" },
      );
      newErrorParagraph.innerHTML = formattedError;
      errorContainer.appendChild(newErrorParagraph);
    }
  } else {
    console.error(
      'Div with ID "secureFrameWrapper" not found - could not add error messages.',
    );
  }

  console.log("handlePaymentErrors data", data);
  // alert(`postMessage function handlePaymentErrors is called. \nError: ${Object.values(data)}${combinedMessage}`);
}
function completePayment(data) {
  sendMessage({ paymentUpdate: true, paymentStatus: "COMPLETE" });
  killModal();
}
function hpfReady() {
  console.log("HPF Form finished loading.");
}
function scrollRelay(scrollX, scrollY) {}

function startPayment() {}

function cancelPayment(data) {
  sendMessage({ paymentUpdate: true, paymentStatus: "CANCEL" });
  killModal();
}
// For Credit Card Payment
function whatCVV2() {
  alert("The 3 numbers on the back of your card");
}
window.Buddy.config = {
  userEvents(e) {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(
        JSON.stringify({ event: e.eventType, data: e.data }),
      );
    } else {
      console.error(
        "No native webview global available...we're either testing on the web or something has gone wrong. Either way, cannot send messages to native.\n",
        e,
      );
    }

    // this event pushes event back to the partner implementation
    if (window?.Buddy?.partnerUserEvents) {
      window.Buddy.partnerUserEvents(e);
    }
    // this tracks which views are displayed
    if (e.eventType == "onViewChange") {
      // umami.track(e.eventType, { viewScreen: e.data.viewId });
      umami.track(e.eventType, {
        viewScreen: e.data.viewId,
        ion: offeringOptions?.ion,
        channelUrl,
      });
      // console.log('onViewChange stuff', offeringOptions?.ion, channelUrl);
    }
    // This tracks when quotes are made
    if (e.eventType == "onQuote") {
      umami.track(e.eventType, {
        price: e.data.pricing,
        ion: offeringOptions?.ion,
        channelUrl,
      });
    }
    // checkout actions
    if (e.eventType == "onCheckout") {
      umami.track(e.eventType, {
        price: e.data.pricing,
        premium: e.data.premium,
        checkoutStatus: e.data.checkoutStatus,
        orderID: e.data.orderID,
        ion: offeringOptions?.ion,
        channelUrl,
      });
    }
    // This triggers every time a user selects a radio button
    if (e.eventType == "onRadioSelection") {
      umami.track(e.eventType, {
        elementId: e.data.elementId,
        value: e.data.value,
        ion: offeringOptions?.ion,
        channelUrl,
      });
    }
    // This triggers every time a user checks a selection on a checkbox
    if (e.eventType == "onCheckboxSelection") {
      umami.track(e.eventType, {
        elementId: e.data.elementId,
        checked: e.data.checked,
        value: e.data.value,
        ion: offeringOptions?.ion,
        channelUrl,
      });
    }
    // This triggers when the form fires a validation error
    if (e.eventType == "onValidationError") {
      umami.track(e.eventType, {
        elementId: e.data.elementId,
        validationError: e.data.validationError,
        ion: offeringOptions?.ion,
        channelUrl,
      });
    }
    // This triggers when a user clicks an external link
    if (e.eventType == "onExternalLink") {
      umami.track(e.eventType, {
        externalLinkUrl: e.data.externalLinkUrl,
        ion: offeringOptions?.ion,
        channelUrl,
      });
    }
  },
  handleCustomMessage({ id, data }) {
    if (id === "paymentUid") {
      const { uID } = data?.policy?.utility || {};
      if (uID) {
        const div = Object.assign(document.createElement("div"), {
          id: "secureFrameWrapper",
        });
        const baseIframeSrcLink =
          STAGE_CONFIG === "PRODUCTION"
            ? "https://www.chasepaymentechhostedpay.com/hpf/1_1/?"
            : "https://www.chasepaymentechhostedpay-var.com/hpf/1_1/?";
        const src = `${baseIframeSrcLink}${uID}`;
        const iframe = Object.assign(document.createElement("iframe"), {
          src,
          id: "secureFrame",
          className: "secureFrame",
        });
        div.appendChild(iframe);
        document.body.appendChild(div);
      }
    }
  },
  themeBase: {
    baseTheme: "base",
    palette: "base",
  },
};
