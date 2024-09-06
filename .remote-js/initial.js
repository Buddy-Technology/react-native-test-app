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

      if (window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(
          JSON.stringify({
            type: "embedded-content",
            message: "options successfully configured",
          }),
        );
      }

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
    overrides: {
      styles: {
        "#allstate-asc-auto-demo div[case=single-form], #allstate-asc-auto-demo div[case=paginated]":
          {
            padding: "2rem",
            marginLeft: "0",
            minHeight: "400px",
            // '@media (min-width: 992px)': {
            // 	marginLeft: '220px',
            // },
            "@media (max-width: 660px)": {
              padding: "0rem",
            },
          },
        "#allstate-asc-auto-demo": {
          "#offerScreen-content-container-1 > p > img, #offerScreenInfoMissing-content-container-1 > p > img, #offerScreenASC-content-container-1 > p > img, #linkToCompanionPage-content-container-2 > p > img, #offerScreenInfoMissingBumpOut-content-container-1 > p > img":
            {
              width: "250px",
              margin: "0 auto",
              padding: "20px 0",
            },
          "[data-id=currentlyCoveredSubHeader] > p": {
            fontSize: "1.1rem",
          },
          '[data-id="quote-error-view-special"], [data-id="table-special"]': {
            /* CSS rules here */
            fontSize: "5.5rem",
          },
          // faking button to link out externally
          '[data-id="directAutoButton"]': {
            marginTop: "2rem!important",
            "p > a": {
              border: "2px solid var(--color-secondary)",
              background: "var(--color-secondary)",
              minWidth: "unset",
              padding: "0.8rem 2rem",
              color: "var(--color-textPrimary)",
              fontSize: "1rem",
              borderRadius: "5rem",
              display: "flex",
              flexDirection: "column",
              margin: "0 auto",
              width: "32%",
              textAlign: "center",
              "&:hover": {
                backgroundColor: "rgb(255, 255, 255)",
                color: "var(--color-secondary)",
              },
              "@media (max-width: 660px)": {
                width: "100%",
              },
            },
          },
          "#offerScreen-content-container-1, #offerScreenInfoMissing-content-container-1, #offerScreenInfoMissingBumpOut-content-container-1, #linkToCompanionPage-content-container-2":
            {
              width: "100%",
              "@media (min-width: 660px)": {
                width: "68%",
              },
              h1: {
                marginBottom: "2rem!important",
              },
            },
          '[data-id="addVehicleByField"]': {
            marginBottom: "1.25rem!important",
          },
          "[data-id=financeLeaseInfo], [data-id=registeredOwnerInfo], [data-id=explanatoryCopyFinePrint]":
            {
              paddingTop: "0.5rem",
              p: {
                marginBottom: "0.5rem!important",
                marginTop: "0.5rem!important",
                fontSize: "0.8rem",
              },
            },
          "[data-id=explanatoryCopyFinePrint]": {
            backgroundColor: "white!important",
            p: {
              marginBottom: "0rem!important",
              marginTop: "0rem!important",
              paddingLeft: "1rem!important",
              paddingRight: "1rem!important",
            },
          },
          // for views with a single button, left align it
          "#currentlyCovered-view-container": {
            "#nav-button-container": {
              flexDirection: "row",
            },
          },
          '[data-id="cardNoButton"]': {
            width: "100%",
            "@media (min-width: 660px)": {
              width: "100%",
            },
            backgroundColor: "white",
            padding: "1rem",
            p: {
              marginTop: "0rem!important",
              marginBottom: "0rem!important",
              display: "flex",
              justifyContent: "space-between",
              strong: {
                fontSize: "1.5rem!important",
                lineHeight: "normal",
                textTransform: "capitalize",
              },
              img: {
                marginTop: "0rem!important",
                marginBottom: "0rem!important",
              },
            },
          },
          '[data-id="singleDriverCardInlineEdit"], [data-id=singleDriverCardEdit], [data-id=spouseDriverCardEdit], [data-id=primaryVehicleCardEdit], [data-id=primaryVehicleCard], [data-id=vehicleCardPlain], [data-id=vehicleCardPlainWide], [data-id=editCustomerOrVehicleCard]':
            {
              backgroundColor: "white",
              width: "100%",
              "@media (min-width: 660px)": {
                width: "60%",
              },
            },
          "[data-id=editCustomerOrVehicleCard]": {
            marginTop: "-1rem",
            marginBottom: "1.25rem",
            padding: "1rem",
            "#customer-firstName-field-container, #customer-lastName-field-container, #policy-suffix-field-container, #customer-dob-field-container, #policy-spouseInfo-firstName-field-container, #policy-spouseInfo-lastName-field-container, #policy-spouseInfo-suffix-field-container, #policy-spouseInfo-dateOfBirth-field-container, #policy-secondDriverNonSpouse-firstName-field-container, #policy-secondDriverNonSpouse-lastName-field-container, #policy-secondDriverNonSpouse-suffix-field-container, #policy-secondDriverNonSpouse-dateOfBirth-field-container":
              {
                width: "100%!important",
              },
          },
          "[data-id=singleDriverCardEdit], [data-id=spouseDriverCardEdit], [data-id=primaryVehicleCardEdit]":
            {
              marginTop: "-20px",
              paddingLeft: "1rem",
              paddingBottom: "1rem",
              marginBottom: "1rem",
              display: "flex",
              justifyContent: "flex-start",
            },
          // removed #policy-utility-addAnotherDriver-field-container,
          "#policy-utility-editCurrentCustomer-field-container, #policy-utility-editSpouse-field-container, #policy-utility-editPrimaryVehicle-field-container, #policy-utility-editOtherDriver-field-container, #policy-utility-editSecondVehicle-field-container, #policy-utility-removeOtherDriver-field-container, #policy-utility-removeSpouse-field-container, #policy-utility-removeSecondVehicle-field-container, #policy-utility-editCurrentCustomerTwo-field-container, #policy-utility-editSpouseTwo-field-container, #policy-utility-editPrimaryVehicleTwo-field-container, #policy-utility-editOtherDriverTwo-field-container, #policy-utility-editSecondVehicleTwo-field-container":
            {
              width: "fit-content",
              backgroundColor: "#DDEDFD",
              border: "1px solid #DDEDFD",
              borderRadius: "25px",
              padding: "0.5rem 1rem",
              "&:hover": {
                backgroundColor: "#FFF",
                border: "1px solid #45BCE5",
              },
            },
          "#policy-utility-removeOtherDriver-field-container, #policy-utility-removeSpouse-field-container, #policy-utility-removeSecondVehicle-field-container":
            {
              backgroundColor: "#F4F6F9",
              border: "1px solid #B8C6D3",
              marginLeft: "1rem",
              "&:hover": {
                backgroundColor: "#FFFFFF",
              },
            },
          "label[for=policy-utility-editCurrentCustomer], label[for=policy-utility-editSpouse], label[for=policy-utility-editPrimaryVehicle], label[for=policy-utility-addAnotherDriver], label[for=policy-utility-editOtherDriver], label[for=policy-utility-addAnotherVehicle], label[for=policy-utility-editSecondVehicle], label[for=policy-utility-removeSpouse], label[for=policy-utility-removeOtherDriver], label[for=policy-utility-removeSecondVehicle], label[for=policy-utility-editCurrentCustomerTwo], label[for=policy-utility-editSpouseTwo], label[for=policy-utility-editPrimaryVehicleTwo], label[for=policy-utility-editSecondVehicleTwo], label[for=policy-utility-editOtherDriverTwo]":
            {
              display: "none",
              "#customer-firstName-field-container, #customer-lastName-field-container, #customer-dob-field-container, #policy-suffix-field-container":
                {
                  label: {
                    display: "none!important",
                  },
                },
            },
          "#policy-utility-editCurrentCustomer-checkbox-wrapper, #policy-utility-editSpouse-checkbox-wrapper, #policy-utility-removeSpouse-checkbox-wrapper, #policy-utility-editPrimaryVehicle-checkbox-wrapper,  #policy-utility-editOtherDriver-checkbox-wrapper, #policy-utility-removeOtherDriver-checkbox-wrapper, #policy-utility-editSecondVehicle-checkbox-wrapper, #policy-utility-removeSecondVehicle-checkbox-wrapper, #policy-utility-editCurrentCustomerTwo-checkbox-wrapper, #policy-utility-editSpouseTwo-checkbox-wrapper, #policy-utility-editPrimaryVehicleTwo-checkbox-wrapper,  #policy-utility-editOtherDriverTwo-checkbox-wrapper, #policy-utility-editSecondVehicleTwo-checkbox-wrapper":
            {
              "input[type=checkbox] + label": {
                content: "' '",
                color: "#0D1940",
                fontSize: "0.8rem",
                fontWeight: "bold",
                textDecoration: "none",
                paddingRight: "0.05rem",
              },
              "input[type=checkbox]:checked + label::after": {
                content: '" (click to close)"',
                textDecoration: "none",
                fontSize: "0.7rem",
                paddingLeft: "0.25rem",
              },
            },
          "#policy-utility-addAnotherDriver-field-container": {
            backgroundColor: "transparent!important",
          },
          "[data-id=addAnotherPersonButton], [data-id=addAnotherVehicleButton]":
            {
              p: {
                color: "#0033A0",
                fontSize: "1.1rem",
                fontWeight: "bold",
                textDecoration: "none",
              },
              img: {
                display: "inline",
                marginTop: "0px",
                marginBottom: "3px",
              },
            },
          "[data-id=yourVehiclesSubHeader]": {
            marginTop: "2rem",
          },
          "label[for=policy-startDateExpirationDateStatus], #policy-startDateExpirationDateStatus":
            {
              display: "none",
            },
          "#eSignatureSign-iframe-container": {
            iframe: { width: "100%!important", height: "600px" },
            backgroundPosition: "top right",
            backgroundSize: "190px",
            backgroundRepeat: "no-repeat",
            paddingTop: "30px",
            backgroundImage:
              'url("https://staging.embed.buddy.insure/allstate/renters/Allstate-Logo-Dark.png")',
          },
          "#eSignatureSign-iframe-container::before": {
            content: '"your signature is needed"',
            color: "#0033A0!important",
            letterSpacing: "0rem!important",
            fontWeight: "500!important",
            fontSize: "28px!important",
            marginTop: "0.25em!important",
            marginBottom: "0.25em!important",
          },
          "#policy-utility-signatureStatusIsComplete-field-container > .input-error":
            {
              color: "#D62719!important",
            },
          // '#linkToCompanionPage-content-container-1': {
          // 	marginTop: 'unset!important',
          // 	'@media (min-width: 660px)': {
          // 		marginTop: '6%!important',
          // 	},
          // 	h1: {
          // 		marginRight: 'unset!important',
          // 		marginLeft: 'unset!important',
          // 		'@media (min-width: 660px)': {
          // 			marginTop: '5%!important',
          // 			marginRight: '15%!important',
          // 			marginLeft: '15%!important',
          // 		},
          // 	},
          // 	'h1:nth-child(1)': {
          // 		marginBottom: '0rem!important',
          // 	},
          // 	'h1:nth-child(2)': {
          // 		marginTop: '0rem!important',
          // 	},
          // },
          // removed #linkToCompanionPage-content-container-0 > p::before
          "#offerScreen-content-container-0 > h2::before, #offerScreenInfoMissing-content-container-0 > h2::before, #linkToCompanionPage-content-container-0 > h2::before, #offerScreen-content-container-0 > p::before, #offerScreenInfoMissing-content-container-0 > p::before, #linkToCompanionPage-content-container-0 > p::before, #offerScreenInfoMissingBumpOut-content-container-0 > h2::before, #offerScreenInfoMissingBumpOut-content-container-0 > p::before":
            {
              content: "''",
              backgroundImage:
                "url('https://staging.embed.buddy.insure/allstate/renters/icons/infoBlueTriangle.png')",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              display: "inline-block",
              width: "38px",
              height: "34px",
              verticalAlign: "bottom",
              "@media (max-width: 660px)": {
                background: "none!important",
                width: "0px",
                height: "0px",
              },
            },
          "#offerScreen-content-container-0, #offerScreenInfoMissing-content-container-0, #linkToCompanionPage-content-container-0, #offerScreenInfoMissingBumpOut-content-container-0":
            {
              marginBottom: "1rem!important",
              // h2: {
              // 	fontSize: '18px!important',
              // 	fontWeight: '600!important',
              // 	lineHeight: '1.5rem!important',
              // 	display: 'grid',
              // 	gridTemplateColumns: '4% 65% 43%',
              // 	gridAutoRows: 'auto',
              // 	alignItems: 'center',
              // 	gridRowGap: '2%',
              // 	'grid-column-gap': '2%',
              // 	strong: {
              // 		alignItems: 'end',
              // 	},
              // 	'@media (max-width: 660px)': {
              // 		display: 'flex',
              // 		flexDirection: 'column-reverse',
              // 		alignItems: 'flex-start',
              // 	},
              // },
              p: {
                fontSize: "18px!important",
                fontWeight: "600!important",
                lineHeight: "1.5rem!important",
                display: "grid",
                gridTemplateColumns: "4% 65% 43%",
                gridAutoRows: "auto",
                alignItems: "center",
                gridRowGap: "2%",
                "grid-column-gap": "2%",
                strong: {
                  alignItems: "end",
                },
                "@media (max-width: 660px)": {
                  display: "flex",
                  flexDirection: "column-reverse",
                  alignItems: "flex-start",
                },
              },
            },
          "#offerScreen-content-container-5, #offerScreenInfoMissing-content-container-5, #offerScreenInfoMissingBumpOut-content-container-5, #linkToCompanionPage-content-container-7":
            {
              p: {
                fontSize: "12px",
                marginTop: "0.5rem!important",
                marginBottom: "0.5rem!important",
              },
              "p > a": {
                color: "#0033A0",
                fontWeight: "bold!important",
              },
              "p:nth-child(1)": {
                marginTop: "1rem!important",
              },
            },
          "#offerScreen-view-container > #nav-button-container, #offerScreenInfoMissing-view-container > #nav-button-container, #offerScreenInfoMissingBumpOut-view-container > #nav-button-container, #chooseYourPackage-view-container > #nav-button-container":
            {
              flexDirection: "column",
              marginBottom: "1rem!important",
            },
          "#offerScreen-content-container-4, #offerScreenInfoMissing-content-container-4, #offerScreenInfoMissingBumpOut-content-container-4, #chooseYourPackage-content-container-BELOW_NAV-0, #checkout-content-container-BELOW_NAV-0, #offerScreenASC-content-container-BELOW_NAV-0, #additionalDetailsPersons-content-container-8, #checkout-content-container-8, #offerScreenInfoMissing-content-container-BELOW_NAV-0, #offerScreen-content-container-BELOW_NAV-0, #linkToCompanionPage-content-container-5":
            {
              p: {
                textAlign: "left",
                fontSize: "12px",
                color: "var(--color-text-primary)",
                a: {
                  color: "#0033A0",
                },
              },
            },
          "#chooseYourPackage-content-container-BELOW_NAV-0 > p:nth-child(1) > strong, #finalReview-content-container-BELOW_NAV-0 > p:nth-child(1) > strong":
            {
              color: "var(--color-text-primary)!important",
              marginBottom: "0.5rem!important",
            },
          "#chooseYourPackage-content-container-BELOW_NAV-0 > p:nth-child(2)": {
            marginTop: "-0.75rem!important",
          },
          "#additionalDetailsPersons-content-container-8 > p": {
            fontSize: "12px",
            marginTop: "0rem!important",
            marginBottom: "0rem!important",
          },
          "#offerScreenASC-content-container-1 > h1": {
            padding: "0rem 2rem",
          },
          // hide regular nav buttons from this view altogether
          "#offerScreenASC-view-container": {
            "#nav-button-container": {
              display: "none",
            },
          },
          "#offerScreen-content-container-3, #offerScreen-content-container-4, #offerScreenInfoMissing-content-container-3, #offerScreenInfoMissingBumpOut-content-container-3, #offerScreenInfoMissing-content-container-4, #offerScreenInfoMissingBumpOut-content-container-4, #linkToCompanionPage-content-container-5":
            {
              "p:nth-child(2) > a": {
                textDecoration: "underline!important",
                fontWeight: "400!important",
                color: "var(--color-text-primary)",
              },
            },
          "#offerScreenASC-content-container-2, #offerScreenInfoMissing-content-container-2, #offerScreenInfoMissingBumpOut-content-container-2, #offerScreen-content-container-2, #linkToCompanionPage-content-container-5":
            {
              backgroundColor: "unset",
              p: {
                paddingLeft: "0%",
              },
            },
          "#offerScreenASC-content-container-4, #offerScreenInfoMissing-content-container-4, #offerScreenInfoMissingBumpOut-content-container-4, #offerScreen-content-container-4, #linkToCompanionPage-content-container-5":
            {
              marginTop: "0rem",
            },
          "label[for=policy-utility-frequencyCode], label[for=policy-utility-methodCode], #quote-price-label-container, label[for=policy-moreInfoToggle], #policy-moreInfoBox, label[for=policy-utility-manuallyEnterAddress], label[for=policy-utility-addressAutocompleteInput], label[for=policy-utility-addressAutocompleteInputRenters], label[for=policy-utility-manuallyEnterAddressRenters], label[for=policy-utility-tCPAConsentValidationRule], #policy-utility-tCPAConsentValidationRule, label[for=policy-utility-tCPAConsent], label[for=policy-utility-authorizePayment], label[for=policy-manuallyEnterAddress]":
            {
              // display: 'none',
              visibility: "hidden",
              position: "absolute!important",
            },
          "#policy-utility-frequencyCode-field-container, #policy-utility-methodCode-field-container":
            {
              marginTop: "0rem!important",
            },
          // [id*="-radio-button-wrapper"]
          // '#policy-utility-frequencyCode-radio-button-wrapper, #policy-utility-methodCode-radio-button-wrapper, #policy-addVehicleBy-radio-button-wrapper, #policy-utility-useApples-radio-button-wrapper, #policy-utility-initialCurrentlyCovered-radio-button-wrapper, #policy-timeLivedAtCurrentAddressCode-radio-button-wrapper, #policy-primarilyParkedAtCurrentAddress-radio-button-wrapper, #policy-originalOwned-radio-button-wrapper, #policy-maritalStatusCode-radio-button-wrapper, #policy-defensiveDrivingCourse-radio-button-wrapper, #policy-spouseOnPolicy-radio-button-wrapper': {
          '[id*="-radio-button-wrapper"]': {
            display: "flex",
            flexDirection: "row",
            "@media (max-width: 899px)": {
              flexDirection: "column",
            },
            // color: '#31705F',
            fontSize: "1rem",
            fontWeight: "500",
            ".radio-button-option-wrapper": {
              padding: "0px",
              marginRight: "unset",
              marginTop: "unset",
              border: "1px solid #BCC5D2",
              borderLeft: "4px solid #BCC5D2",
            },
            ".radio-button-option-wrapper:nth-child(1), .radio-button-option-wrapper:nth-child(2), .radio-button-option-wrapper:nth-child(3)":
              {
                paddingLeft: "8px",
                backgroundColor: "#F4F6F9",
              },
            ".radio-button-option-wrapper:nth-child(2)": {
              marginLeft: "1%",
              "@media (max-width: 899px)": {
                marginLeft: "0%",
                marginTop: "1%",
              },
            },
            ".radio-button-label": {
              marginLeft: "8px",
            },
          },
          "#policy-utility-selectedPackage-BudgetSavvy, #policy-utility-selectedPackage-Balanced, #policy-utility-selectedPackage-Enhanced":
            {
              ".radio-button-option-wrapper": {
                // padding: '0px',
                // marginRight: 'unset',
                // marginTop: 'unset',
                // border: '1px solid #BCC5D2',
                borderLeft: "0px solid #BCC5D2",
              },
            },
          "#policy-utility-frequencyCode-radio-button-wrapper, #policy-utility-methodCode-radio-button-wrapper":
            {
              "@media (max-width: 899px)": {
                flexDirection: "row",
              },
              ".radio-button-option-wrapper:nth-child(2)": {
                marginTop: "0%!important",
                marginLeft: "0%!important",
                "@media (max-width: 899px)": {
                  flexDirection: "row",
                  marginLeft: "1%!important",
                },
              },
            },
          '#policy-addVehicleBy-radio-button-wrapper, [data-id=vinInfoBlue], [data-id=findVinInfo], #policy-mainVehicleDetails-year-field-container, #policy-mainVehicleDetails-make-field-container, #policy-mainVehicleDetails-model-field-container, #policy-mainVehicleDetails-subModel-field-container, #policy-originalOwned-radio-button-wrapper, #policy-ownershipStatus-radio-button-wrapper, #policy-maritalStatusCode-radio-button-wrapper, #policy-defensiveDrivingCourse-radio-button-wrapper, #policy-spouseOnPolicy-radio-button-wrapper, #policy-spouseInfo-movingViolationsInFiveYears-radio-button-wrapper, #policy-spouseInfo-defensiveDrivingCourseSpouse-radio-button-wrapper, #policy-secondDriverNonSpouse-movingViolationsInFiveYears-radio-button-wrapper, #policy-currentlyInsured-radio-button-wrapper, [data-id=financeLeaseInfo], [data-id=registeredOwnerInfo], #policy-utility-registeredOwnerPrimary-field-container, [data-id=coverageDetailsFinalReview], [data-id=summaryContents], [data-id=summarySubHeader], [data-id=verticalSpacerTop], [data-id=verticalSpacerBottom], [data-id=horizontalLine], [data-id="downloadIdCardsButton"], [data-id=downloadMobileAppSubHeader], #policy-movingViolationsInFiveYears-radio-button-wrapper, #movingViolationsInFiveYears-radio-button-wrapper, #policy-addSecondVehicleBy-radio-button-wrapper, #policy-secondVehicle-year-field-container, #policy-secondVehicle-make-field-container, #policy-secondVehicle-model-field-container, #policy-secondVehicle-subModel-field-container, #policy-secondVehicleVin-field-container, #policy-secondDriverNonSpouse-movingViolationsInFiveYears-radio-button-wrapper, [data-id=horizontalLineFullWidthWhiteBackground], #policy-ownershipStatusSecondVehicle-radio-button-wrapper':
            {
              flexDirection: "row",
              maxWidth: "100%",
              ".radio-button-option-wrapper:nth-child(2), .radio-button-option-wrapper:nth-child(3)":
                {
                  marginTop: "0%!important",
                  marginLeft: "0%!important",
                },
              "@media (max-width: 899px)": {
                flexDirection: "column",
                ".radio-button-option-wrapper:nth-child(2), .radio-button-option-wrapper:nth-child(3)":
                  {
                    marginTop: "1%!important",
                    marginLeft: "0%!important",
                  },
              },
            },
          // #policy-utility-registeredOwnerSecondary-field-container
          "#policy-utility-registeredOwnerPrimary-field-container, #policy-ownershipStatus-field-container, #policy-ownershipStatusSecondVehicle-field-container":
            {
              marginTop: "0rem!important",
            },
          "[data-id=standardSubHeader]": {
            margin: "1rem 0rem",
          },
          // '#policy-priorPolicies-expirationDate-field-container, #policy-startDate-field-container': {
          // 	'@media (min-width: 800px)': {
          // 		maxWidth: '40%',
          // 	},
          // },
          // most of these are YES or NO
          "#policy-utility-initialCurrentlyCovered-radio-button-wrapper, #policy-utility-useApples-radio-button-wrapper, #policy-timeLivedAtCurrentAddressCode-radio-button-wrapper, #policy-primarilyParkedAtCurrentAddress-radio-button-wrapper, #policy-defensiveDrivingCourse-radio-button-wrapper, #policy-spouseOnPolicy-radio-button-wrapper, #policy-spouseInfo-movingViolationsInFiveYears-radio-button-wrapper, #policy-spouseInfo-defensiveDrivingCourseSpouse-radio-button-wrapper, #policy-currentlyInsured-radio-button-wrapper, #policy-movingViolationsInFiveYears-radio-button-wrapper, #movingViolationsInFiveYears-radio-button-wrapper, #policy-secondDriverNonSpouse-movingViolationsInFiveYears-radio-button-wrapper":
            {
              flexDirection: "row",
              maxWidth: "100%",
              ".radio-button-option-wrapper:nth-child(2)": {
                marginTop: "0%!important",
                marginLeft: "0%!important",
              },
              "@media (min-width: 800px)": {
                maxWidth: "60%",
              },
            },
          "#policy-originalOwned-radio-button-wrapper, [data-id=driverLicenseFields], #policy-ownershipStatus-radio-button-wrapper, #policy-ownershipStatusSecondVehicle-radio-button-wrapper":
            {
              maxWidth: "100%",
              // '@media (min-width: 800px)': {
              // 	maxWidth: '60%',
              // },
            },
          "#currentlyCovered-content-container-LABEL-DYNOMARK-1 > span": {
            display: "inline-grid",
            fontWeight: "400!important",
          },
          "[data-id=fiftyPercentOnDesktop]": {
            maxWidth: "100%",
            "@media (min-width: 770px)": {
              maxWidth: "50%!important",
            },
          },
          '[data-id=descriptionCopy], [data-id=maritalStatusDisclaimer], [data-id=spouseLicenseDisclaimer],  [data-id=disclaimerCopyFiftyPercent], [id*="BELOW_NAV-0"]':
            {
              p: {
                fontSize: "0.875rem",
                marginTop: "0.5rem!important",
                marginBottom: "0.5rem!important",
                strong: {
                  color: "#0033A0",
                },
                a: {
                  color: "#0033A0",
                },
              },
              "p:nth-child(1)": {
                marginTop: "2rem!important",
              },
            },
          '[id*="BELOW_NAV-0"], #currentlyCovered-content-container-BELOW_NAV-1, #chooseYourPackage-content-container-BELOW_NAV-1, #finalReview-content-container-BELOW_NAV-1':
            {
              p: {
                display: "flex",
                fontSize: "0.75rem",
                color: "var(--color-text-primary)",
                marginBottom: "0rem!important",
                a: {
                  color: "#0033A0",
                },
                img: {
                  width: "15px",
                  height: "15px",
                  marginTop: "0rem!important",
                  marginBottom: "0rem!important",
                  marginRight: "0.5rem",
                },
              },
              "p:nth-child(1)": {
                marginTop: "2rem!important",
              },
              "p:nth-child(2)": {
                marginTop: "0.5rem!important",
              },
            },
          "#currentlyCovered-content-container-BELOW_NAV-0, #chooseYourPackage-content-container-BELOW_NAV-0, #finalReview-content-container-BELOW_NAV-0":
            {
              p: {
                flexDirection: "column",
                fontSize: "0.75rem!important",
                marginBottom: "0.5rem!important",
              },
            },
          "[data-id=descriptionCopy], [data-id=disclaimerCopyFiftyPercent]": {
            "p:nth-child(1)": {
              marginTop: "0.5rem!important",
            },
          },
          "[data-id=disclaimerCopyFiftyPercent]": {
            p: {
              maxWidth: "100%",
              "@media (min-width: 770px)": {
                maxWidth: "50%!important",
              },
            },
          },
          "[data-id=whiteBackgroundWithHorizontalPadding]": {
            backgroundColor: "#FFF",
            paddingRight: "1rem",
            paddingLeft: "1rem",
            p: {
              marginBottom: "0rem!important",
              marginTop: "0rem!important",
              fontSize: "0.8rem",
            },
          },
          "[data-id=singleDriverCard], [data-id=spouseDriverCard], [data-id=primaryVehicleCard], [data-id=driverCardPlain], [data-id=driverCardPlainNumberTwo], [data-id=vehicleCardPlain], [data-id=paymentCardPlain], [data-id=summaryContents], [data-id=bindPremiumBlue], [data-id=autoTotalPlain], [data-id=vehicleCardPlainWide], [data-id=driverCardPlainWide], [data-id=driverLicenseFields]":
            {
              width: "60%",
              "@media (max-width: 660px)": {
                width: "100%",
              },
              table: {
                borderWidth: "0px!important",
                "thead > tr": {
                  backgroundColor: "white",
                },
                "tbody > tr > th": {
                  borderBottomColor: "#FFF!important",
                  // width: '10px',
                },
                "thead > tr > th:nth-child(1)": {
                  width: "85%",
                },
                "thead, tbody > tr, thead > tr > th, tbody > tr > td": {
                  borderWidth: "0px!important",
                },
                "tbody > tr:nth-child(1) > td": {
                  paddingTop: "0px!important",
                  paddingBottom: "0px!important",
                },
                thead: {
                  // marginTop: '1rem!important',
                  backgroundColor: "white",
                },
              },
            },
          "[data-id=singleDriverCard] > table > thead > tr > th:nth-child(1), [data-id=spouseDriverCard] > table > thead > tr > th:nth-child(1), [data-id=primaryVehicleCard] > table > thead > tr > th:nth-child(1), [data-id=driverCardPlain] > table > thead > tr > th:nth-child(1), [data-id=driverCardPlainNumberTwo] > table > thead > tr > th:nth-child(1), [data-id=vehicleCardPlain] > table > thead > tr > th:nth-child(1), [data-id=vehicleCardPlainWide] > table > thead > tr > th:nth-child(1), [data-id=driverCardPlainWide] > table > thead > tr > th:nth-child(1)":
            {
              fontSize: "1.5rem",
              fontWeight: "bold!important",
            },

          "[data-id=paymentCardPlain], [data-id=summaryContents], [data-id=bindPremiumBlue], [data-id=autoTotalPlain]":
            {
              width: "100%!important",
              "table > thead > tr > th:nth-child(1)": {
                width: "50%",
              },
            },
          "[data-id=paymentCardPlain]": {
            "table > tbody > tr > td:nth-child(1)": {
              paddingBottom: "1rem!important",
            },
          },
          "[data-id=singleDriverCard] > table > thead > tr > th:nth-child(2), [data-id=spouseDriverCard] > table > thead > tr > th:nth-child(2), [data-id=primaryVehicleCard] > table > thead > tr > th:nth-child(2), [data-id=driverCardPlain] > table > thead > tr > th:nth-child(3), [data-id=driverCardPlainNumberTwo] > table > thead > tr > th:nth-child(3), [data-id=vehicleCardPlain] > table > thead > tr > th:nth-child(2), [data-id=vehicleCardPlainWide] > table > thead > tr > th:nth-child(2), [data-id=driverCardPlainWide] > table > thead > tr > th:nth-child(3)":
            {
              marginTop: "20px",
              textTransform: "uppercase",
              color: "#303845",
              fontWeight: "bold!important",
              display: "inline-block",
              width: "50px",
              height: "50px",
              lineHeight: "50px",
              borderRadius: "50%",
              textAlign: "center",
              backgroundColor: "#E4E8EC",
              paddingTop: "0px",
              paddingLeft: "0px",
              fontSize: "18px",
              maxWidth: "50px",
            },
          "[data-id=driverCardPlain], [data-id=driverCardPlainNumberTwo], [data-id=vehicleCardPlain], [data-id=vehicleCardPlainWide], [data-id=driverCardPlainWide]":
            {
              backgroundColor: "#FFF",
              padding: "0.5rem 1rem",
              table: {
                "thead > tr": {
                  height: "100px",
                },
                "thead > tr > th": {
                  paddingLeft: "0rem",
                  paddingBottom: "2rem",
                },
                "thead > tr > th:nth-child(1)": {
                  width: "50%",
                },
                "thead > tr > th:nth-child(3)": {
                  width: "110%",
                  minWidth: "42px",
                },
                "tbody > tr > td": {
                  backgroundColor: "#E4E8EC",
                  position: "relative",
                  zIndex: 999,
                },
                "tbody > tr:nth-child(1) > td": {
                  paddingTop: "1rem!important",
                },
                "tbody > tr:nth-child(2) > td": {
                  paddingBottom: "1rem",
                },
                "tbody > tr:nth-child(3) > td": {
                  borderTop: "2px solid #BCC5D2!important",
                },
                "tbody > tr:nth-child(3) > td:nth-child(1)": {
                  fontSize: "0.8rem",
                },
              },
            },
          "[data-id=clearSpacerFullWidth]": {
            minHeight: "20px!important",
          },
          "[data-id=whiteSpacerFullWidth]": {
            minHeight: "20px!important",
            backgroundColor: "#FFF!important",
          },
          "[data-id=driverCardPlainWide]": {
            width: "100%",
            // marginBottom: '1rem',
            "@media (max-width: 660px)": {
              width: "100%",
            },
            table: {
              marginBottom: "0rem!important",
              "thead > tr": {
                height: "65px!important",
              },
              "thead > tr > th": {
                paddingBottom: "0rem!important",
              },
              "thead > tr > th:nth-child(1)": {
                width: "90%!important",
                paddingTop: "0rem!important",
                paddingLeft: "0rem!important",
              },
              "thead > tr > th:nth-child(3)": {
                marginTop: "6px!important",
              },
              "tbody > tr:nth-child(1) > td": {
                paddingTop: "0rem!important",
                paddingLeft: "0rem!important",
              },
              "tbody > tr > td": {
                backgroundColor: "#FFF!important",
                paddingTop: "0rem!important",
                paddingLeft: "0rem!important",
              },
            },
          },
          "[data-id=spouseDriverCard], [data-id=driverCardPlainNumberTwo]": {
            marginTop: "1rem!important",
          },
          // had to use enumerated div couldnt otherwise override the styles
          "#confirmDriverAndVehicleInfo-content-container-7 > #policy-spouseOnPolicy-field-container, #secondConfirmDriverAndVehicleInfo-content-container-7 > #policy-spouseOnPolicy-field-container":
            {
              padding: "0rem!important",
              "label[for=policy-spouseOnPolicy]": {
                display: "none!important",
              },
              "label[for=policy-spouseOnPolicy-false]": {
                padding: "0px!important",
                marginTop: "-1rem!important",
                backgroundColor: "#FFF",
                color: "#FFF",
                "&:hover": {
                  backgroundColor: "#FFF!important",
                  color: "#ECECEC!important",
                  textDecoration: "underline!important",
                },
              },
              "div > fieldset > #policy-spouseOnPolicy-radio-button-wrapper > .radio-button-option-wrapper":
                {
                  // display: 'none!important',
                  border: "0px solid #FFF!important",
                  paddingLeft: "0px!important",
                  backgroundColor: "#FFF!important",
                },
              "div > fieldset > #policy-spouseOnPolicy-radio-button-wrapper": {
                marginTop: "0px!important",
              },
              "div > fieldset > #policy-spouseOnPolicy-radio-button-wrapper > div:nth-child(1)":
                {
                  display: "none!important",
                },
              "div > fieldset > #policy-spouseOnPolicy-radio-button-wrapper > div:nth-child(2) > input":
                {
                  display: "none!important",
                },
              "div > fieldset > #policy-spouseOnPolicy-radio-button-wrapper > div:nth-child(2) > label":
                {
                  color: "#FFF!important",
                  content: '" "',
                },
              "div > fieldset > #policy-spouseOnPolicy-radio-button-wrapper > div:nth-child(2) > label::after":
                {
                  content: '"remove	"',
                  display: "block",
                  color: "red!important",
                  textDecoration: "none!important",
                },
              "div > fieldset > #policy-spouseOnPolicy-radio-button-wrapper > div:nth-child(2) > label:hover::after":
                {
                  textDecoration: "underline!important",
                },
            },
          "#secondConfirmDriverAndVehicleInfo-content-container-10 > #policy-utility-addAnotherDriver-field-container":
            {
              marginTop: "0rem!important",
              padding: "0rem!important",
              "div > fieldset > #policy-utility-addAnotherDriver-checkbox-wrapper > input":
                {
                  display: "none!important",
                },
              "div > fieldset > #policy-utility-addAnotherDriver-checkbox-wrapper > label":
                {
                  color: "#FFF!important",
                  content: '" "',
                },
              "div > fieldset > #policy-utility-addAnotherDriver-checkbox-wrapper > label::after":
                {
                  content: '"remove	"',
                  display: "block",
                  textDecoration: "none!important",
                  color: "red!important",
                },
              "div > fieldset > #policy-utility-addAnotherDriver-checkbox-wrapper > label:hover::after":
                {
                  textDecoration: "underline!important",
                },
            },
          "#secondConfirmDriverAndVehicleInfo-content-container-18 > #policy-utility-addAnotherVehicle-field-container":
            {
              marginTop: "0rem!important",
              padding: "0rem!important",
              "div > fieldset > #policy-utility-addAnotherVehicle-checkbox-wrapper > input":
                {
                  display: "none!important",
                },
              "div > fieldset > #policy-utility-addAnotherVehicle-checkbox-wrapper > label":
                {
                  color: "#FFF!important",
                  content: '" "',
                },
              "div > fieldset > #policy-utility-addAnotherVehicle-checkbox-wrapper > label::after":
                {
                  content: '"remove	"',
                  display: "block",
                  color: "red!important",
                  textDecoration: "none!important",
                },
              "div > fieldset > #policy-utility-addAnotherVehicle-checkbox-wrapper > label:hover::after":
                {
                  textDecoration: "underline!important",
                },
            },
          "[data-id=primaryVehicleCard] > table > thead > tr > th:nth-child(1), [data-id=vehicleCardPlain] > table > thead > tr > th:nth-child(1), [data-id=vehicleCardPlainWide] > table > thead > tr > th:nth-child(1)":
            {
              paddingTop: "0px",
              paddingBottom: "0px",
              lineHeight: "1.5rem",
              textTransform: "capitalize",
            },
          "[data-id=primaryVehicleCard] > table > thead > tr > th:nth-child(2), [data-id=vehicleCardPlain] > table > thead > tr > th:nth-child(2), [data-id=vehicleCardPlainWide] > table > thead > tr > th:nth-child(2)":
            {
              backgroundColor: "unset",
              borderRadius: "unset",
              width: "150px",
              maxWidth: "unset",
              height: "80px",
              marginTop: "0px",
            },
          "[data-id=vehicleCardPlain] > table > thead > tr > th:nth-child(1), [data-id=vehicleCardPlainWide] > table > thead > tr > th:nth-child(1)":
            {
              // width: '80%',
              width: "70%!important",
              "@media (max-width: 660px)": {
                width: "100%",
              },
            },
          "[data-id=vehicleCardPlainWide]": {
            width: "100%!important",
            "@media (max-width: 660px)": {
              width: "100%",
            },
            table: {
              paddingBottom: "0rem!important",
              "thead > tr": {
                height: "65px",
              },
              "tbody > tr > td": {
                backgroundColor: "#FFF",
                paddingTop: "0rem!important",
                paddingLeft: "0remn!important",
              },
              "tbody > tr:nth-child(1) > td": {
                paddingTop: "0rem!important",
                paddingLeft: "0rem!important",
              },
            },
          },
          "[data-id=vehicleCardPlainWide] > table > thead > tr > th:nth-child(1)":
            {
              // width: '80%',
              width: "90%!important",
              "@media (max-width: 660px)": {
                width: "100%",
              },
            },
          "[data-id=addAnotherVehicleButton] > div > span": {
            visibility: "hidden",
          },
          "#policy-vehicles-array-container, #policy-drivers-array-container": {
            display: "table",
            width: "100%",
            backgroundColor: "#F2FAFE",
            ".array-item-pill-container": {
              marginBottom: "0.5rem",
              height: "150px",
              backgroundColor: "#FFF",
              // flexDirection: 'column',
              display: "grid",
              alignItems: "flex-end",
              width: "48%",
              "@media (max-width: 660px)": {
                width: "100%",
              },
            },
            ".array-item-pill": {
              backgroundColor: "#FFF",
              borderLeft: "none!important",
              flexDirection: "column-reverse",
              "div > p": {
                fontSize: "1.5rem",
                fontWeight: "bold",
              },
            },
            ".array-item-pill:nth-child(2)": {
              backgroundColor: "#000!important",
            },
            ".array-items-add-button": {
              marginTop: "1rem",
              backgroundColor: "#DDEDFD",
              border: "none!important",
            },
          },
          // 12344566789345673
          "#policy-vehicles-array-container > button, #policy-drivers-array-container > button":
            {
              marginBottom: "1rem",
              // height: '200px',
            },
          ".array-item-pill::before": {
            content: '"edit	"',
            color: "#0033A0",
            border: "2px solid #DDEDFD!important",
            fontSize: "0.8rem",
            fontWeight: "bold",
            textDecoration: "none",
            // paddingRight: ' 0.05rem',
            backgroundColor: "#DDEDFD!important",
            width: "fit-content!important",
            borderRadius: "15px!important",
            padding: "0.5rem 1rem!important",
          },
          ".array-item-pill > svg, .array-item-remove-button > svg": {
            display: "none",
          },
          ".array-item-remove-button::before": {
            content: '"remove	"',
            color: "var(--color-text-primary)!important",
            border: "2px solid var(--color-text-primary)!important",
            fontSize: "0.8rem",
            fontWeight: "bold",
            textDecoration: "none",
            // paddingRight: ' 0.05rem',
            backgroundColor: "#FFF!important",
            width: "fit-content!important",
            borderRadius: "15px!important",
            padding: "0.5rem 1rem!important",
            marginRight: "12px",
          },
          ".array-item-remove-button:hover::before, .array-item-remove-button:hover::before":
            {
              boxShadow: "inset 0 -3px 6px -4px rgba(0, 0, 0, 0.6)",
            },
          ".array-item-remove-button": {
            marginLeft: "0rem!important",
            display: "inline-flex",
          },
          "#policy-vehicles-array-container > button::after, #policy-drivers-array-container > button::after":
            {
              content: '" another vehicle"',
              paddingLeft: "6px",
              display: "flex",
              flexDirection: "column-reverse",
              // 'div > p': {
              // 	fontSize: '1.5rem',
              // 	fontWeight: 'bold',
              // },
            },
          "#policy-drivers-array-container > button::after": {
            content: '" another driver"',
          },
          ".array-items-container": {
            width: "100%",
            // minWidth: '450px',
            paddingRight: "0rem!important",
            "@media (max-width: 660px)": {
              width: "100%",
              paddingRight: "0rem!important",
              paddingLeft: "0rem!important",
            },
          },
          "[data-id=addAnotherVehicleButton] > .array-items-container > div > #policy-vehicles-array-container > .array-item-pill-container > button > #confirmDriverAndVehicleInfo-content-container-1, [data-id=addAnotherVehicleButton] > .array-items-container > div > #policy-vehicles-array-container > .array-item-pill-container > button > #confirmDriverAndVehicleInfo-content-container-2, [data-id=addAnotherVehicleButton] > .array-items-container > div > #policy-drivers-array-container > .array-item-pill-container > button > #confirmDriverAndVehicleInfo-content-container-1, [data-id=addAnotherVehicleButton] > .array-items-container > div > #policy-drivers-array-container > .array-item-pill-container > button > #confirmDriverAndVehicleInfo-content-container-2, [data-id=addAnotherVehicleButton] > .array-items-container > div > #policy-vehicles-array-container > .array-item-pill-container > button > #secondConfirmDriverAndVehicleInfo-content-container-1, [data-id=addAnotherVehicleButton] > .array-items-container > div > #policy-vehicles-array-container > .array-item-pill-container > button > #secondConfirmDriverAndVehicleInfo-content-container-2, [data-id=addAnotherVehicleButton] > .array-items-container > div > #policy-drivers-array-container > .array-item-pill-container > button > #secondConfirmDriverAndVehicleInfo-content-container-1, [data-id=addAnotherVehicleButton] > .array-items-container > div > #policy-drivers-array-container > .array-item-pill-container > button > #secondConfirmDriverAndVehicleInfo-content-container-2":
            {
              p: {
                fontSize: "1.5rem!important",
                fontWeight: "bold!important",
                textTransform: "capitalize",
                color: "var(--color-primary)!important",
                display: "flex",
                justifyContent: "space-between",
                minHeight: "100px",
              },
              "p.input-error": {
                fontSize: "0.85rem!important",
              },
              "p > img": {
                width: "140px",
                maxHeight: "97px",
              },
            },
          // '[data-id=addAnotherVehicleButton] > .array-items-container > div > #policy-vehicles-array-container > .array-item-pill-container > button > #confirmDriverAndVehicleInfo-content-container-1 > p:nth-child(1)::after': {
          // 	content: "url('https://staging.embed.buddy.insure/allstate/auto/toyota-highlander.png')",
          // 	display: 'inline-block',
          // 	verticalAlign: 'top',
          // },
          "#policy-utility-methodCode-radio-button-wrapper, #policy-addVehicleBy-radio-button-wrapper, #policy-utility-useApples-radio-button-wrapper, #policy-utility-initialCurrentlyCovered-radio-button-wrapper, #policy-timeLivedAtCurrentAddressCode-radio-button-wrapper, #policy-primarilyParkedAtCurrentAddress-radio-button-wrapper, #policy-originalOwned-radio-button-wrapper, #policy-ownershipStatus-radio-button-wrapper, #policy-maritalStatusCode-radio-button-wrapper, #policy-defensiveDrivingCourse-radio-button-wrapper, #policy-currentlyInsured-radio-button-wrapper, #policy-movingViolationsInFiveYears-radio-button-wrapper, #policy-spouseInfo-movingViolationsInFiveYears-radio-button-wrapper, #movingViolationsInFiveYears-radio-button-wrapper, #policy-addSecondVehicleBy-radio-button-wrapper, #policy-secondDriverNonSpouse-movingViolationsInFiveYears-radio-button-wrapper, #policy-ownershipStatusSecondVehicle-radio-button-wrapper, #policy-secondDriverNonSpouse-movingViolationsInFiveYears-radio-button-wrapper":
            {
              color: "var(--color-text-primary)",
              ".radio-button-option-wrapper:nth-child(2)": {
                marginLeft: "1%",
                "@media (max-width: 899px)": {
                  marginLeft: "0%",
                  marginTop: "-0.5%",
                },
              },
            },
          "#policy-utility-frequencyCode-radio-button-wrapper > div, #policy-utility-methodCode-radio-button-wrapper > div, #policy-addVehicleBy-radio-button-wrapper > div, #policy-utility-useApples-radio-button-wrapper > div, #policy-utility-initialCurrentlyCovered-radio-button-wrapper > div, #policy-primarilyParkedAtCurrentAddress-radio-button-wrapper > div, #policy-timeLivedAtCurrentAddressCode-radio-button-wrapper > div, #policy-originalOwned-radio-button-wrapper > div, #policy-ownershipStatus-radio-button-wrapper > div, #policy-maritalStatusCode-radio-button-wrapper > div, #policy-defensiveDrivingCourse-radio-button-wrapper > div, #policy-spouseOnPolicy-radio-button-wrapper > div, #policy-spouseInfo-movingViolationsInFiveYears-radio-button-wrapper > div, #policy-spouseInfo-defensiveDrivingCourseSpouse-radio-button-wrapper > div, #policy-currentlyInsured-radio-button-wrapper > div, #policy-movingViolationsInFiveYears-radio-button-wrapper > div, #movingViolationsInFiveYears-radio-button-wrapper > div, #policy-addSecondVehicleBy-radio-button-wrapper > div, #policy-secondDriverNonSpouse-movingViolationsInFiveYears-radio-button-wrapper > div, #policy-ownershipStatusSecondVehicle-radio-button-wrapper > div":
            {
              width: "100%",
            },
          // #policy-primarilyParkedAtCurrentAddress-radio-button-wrapper
          "label[for=policy-utility-frequencyCode-PayInFull], label[for=policy-utility-frequencyCode-Monthly], label[for=policy-utility-methodCode-CreditCard], label[for=policy-utility-methodCode-BankAccount], label[for=policy-addVehicleBy-NO], label[for=policy-addVehicleBy-YES], label[for=policy-utility-initialCurrentlyCovered-true], label[for=policy-utility-initialCurrentlyCovered-false], label[for=policy-utility-useApples-true], label[for=policy-utility-useApples-false], label[for=policy-timeLivedAtCurrentAddressCode-MoreThan6Months], label[for=policy-timeLivedAtCurrentAddressCode-LessThan6Months], label[for=policy-primarilyParkedAtCurrentAddress-true], label[for=policy-primarilyParkedAtCurrentAddress-false], label[for=policy-originalOwned-true], label[for=policy-originalOwned-false], label[for=policy-ownershipStatus-Finance], label[for=policy-ownershipStatus-Lease], label[for=policy-ownershipStatus-Own], label[for=policy-maritalStatusCode-Single], label[for=policy-maritalStatusCode-Married], label[for=policy-maritalStatusCode-Widowed], label[for=policy-defensiveDrivingCourse-true], label[for=policy-defensiveDrivingCourse-false], label[for=policy-spouseOnPolicy-true], label[for=policy-spouseOnPolicy-false], label[for=policy-spouseOnPolicy-], label[for=policy-spouseInfo-movingViolationsInFiveYears-true], label[for=policy-spouseInfo-movingViolationsInFiveYears-false], label[for=policy-spouseInfo-defensiveDrivingCourseSpouse-true], label[for=policy-spouseInfo-defensiveDrivingCourseSpouse-false], label[for=policy-currentlyInsured-true], label[for=policy-currentlyInsured-false], label[for=policy-movingViolationsInFiveYears-true], label[for=policy-movingViolationsInFiveYears-false], label[for=movingViolationsInFiveYears-true], label[for=movingViolationsInFiveYears-false], label[for=policy-addSecondVehicleBy-NO], label[for=policy-addSecondVehicleBy-YES], label[for=policy-ownershipStatusSecondVehicle-Finance], label[for=policy-ownershipStatusSecondVehicle-Lease], label[for=policy-ownershipStatusSecondVehicle-Own], label[for=policy-secondDriverNonSpouse-movingViolationsInFiveYears-true], label[for=policy-secondDriverNonSpouse-movingViolationsInFiveYears-false]":
            {
              textAlign: "left",
              backgroundColor: "#fff",
              padding: "1rem",
              borderRadius: "0rem",
              width: "100%",
            },
          "#checkout-button-wrapper": {
            flexDirection: "row",
            justifyContent: "center",
            paddingLeft: "4rem",
            paddingRight: "4rem",
            marginBottom: "2rem",
          },
          "#policy-ageFirstAutoDrivingLicenseIssued, #policy-spouseInfo-ageFirstAutoDrivingLicenseIssued, #ageFirstAutoDrivingLicenseIssued":
            {
              width: "140px",
              height: "52px",
              backgroundImage:
                'url("https://staging.embed.buddy.insure/allstate/auto/yearsOld.png")',
              backgroundSize: "inherit",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
            },
          "input[type=checkbox]:not(#policy-utility-manuallyEnterAddress-true, #policy-utility-manuallyEnterAddressRenters-true, #policy-utility-addNonRelatives-true, #policy-utility-addLandlordOrPM-true, #policy-utility-tCPAConsent-true, #policy-utility-authorizePayment-true, #policy-utility-shutterDiscount-true, #policy-tCPAConsent-true, #policy-manuallyEnterAddress-true, #policy-utility-addAnotherDriver-true, #policy-utility-addAnotherVehicle-true)":
            {
              display: "none",
              visibility: "hidden",
            },
          "label[for=policy-utility-addAnotherDriver-true], label[for=policy-utility-addAnotherVehicle-true]":
            {
              paddingLeft: "0.5rem!important",
            },
          // 'input[type=checkbox]:not(#policy-seeDetailsToggle-true, #policy-utility-manuallyEnterAddress-true, #policy-utility-moreInfoToggle-true, #policy-utility-manuallyEnterAddressRenters-true, #policy-utility-addNonRelatives-true, #policy-utility-addLandlordOrPM-true, #policy-utility-tCPAConsent-true, #policy-utility-authorizePayment-true,#policy-utility-learnWhyToggle-true, #policy-utility-compareOptionsToggle-true, #policy-utility-paymentTermsAndConditionsToggle-true, #policy-utility-shutterDiscount-true, #policy-tCPAConsent-true, #policy-utility-editCurrentCustomer-true, #policy-utility-editSpouse-true, #policy-utility-editPrimaryVehicle-true, #policy-manuallyEnterAddress-true, #policy-utility-addAnotherDriver-true) + label::before': {
          // 	content: "'Edit/Review your info'",
          // 	fontSize: '16px',
          // 	textDecoration: 'underline',
          // 	fontWeight: 'bold',
          // },
          "label[for=policy-utility-manuallyEnterAddress-true], label[for=policy-utility-manuallyEnterAddressRenters-true], label[for=policy-utility-addNonRelatives-true], label[for=policy-utility-tCPAConsent-true], label[for=policy-utility-addLandlordOrPM-true], label[for=policy-utility-authorizePayment-true], label[for=policy-utility-shutterDiscount-true], label[for=policy-manuallyEnterAddress-true]":
            {
              marginLeft: "0.5rem!important",
            },
          "label[for=policy-utility-authorizePayment-true], label[for=policy-utility-addNonRelatives-true], label[for=policy-utility-addLandlordOrPM-true], label[for=policy-utility-tCPAConsent-true], label[for=policy-utility-shutterDiscount-true], label[for=policy-utility-shutterDiscount]":
            {
              textAlign: "left",
            },
          "label[for=policy-utility-addNonRelatives-true], label[for=policy-utility-addLandlordOrPM-true], label[for=policy-utility-shutterDiscount-true]":
            {
              fontSize: "18px",
            },
          "label[for=policy-utility-shutterDiscount]": {
            // fontSize: '14px',
            // fontWeight: '400',
            display: "none",
          },
          "label[for=policy-utility-shutterDiscount-true]": {
            fontSize: "14px",
          },
          // #offerScreenInfoMissing-content-container-1, #offerScreenInfoMissingBumpOut-content-container-1, #linkToCompanionPage-content-container-2, #offerScreen-content-container-1, #offerScreenASC-content-container-1, #missingInfoQuickQuoteLoader-content-container-2, #quickQuoteLoader-content-container-2, #updateQuoteLoader-content-container-2, #convertChaseUIdToMoneyball-content-container-2, #redirectUserToLinkToCompanionPage-content-container-2, #companionModeLoader-content-container-2, #configLoader-content-container-2, #eSignatureLoad-content-container-2, #configLoader-content-container-1, #linkToCompanionPage-content-container-3, #processPaymentLoader-content-container-2
          "[data-id=spinner], [data-id=loaderMainCopy], [data-id=loaderSubCopy]":
            {
              h1: {
                marginBottom: "2rem!important",
                fontSize: "1.75rem!important",
                lineHeight: "2rem!important",
                fontWeight: "400!important",
                color: "#2F3847!important",
                fontFamily: "Inter,Arial,Helvetica,sans-serif",
                marginTop: "0.25em!important",
                transform: "scaleY(0.95)",
                letterSpacing: "-0.05rem",
              },
            },
          "#linkToCompanionPage-content-container-1": {
            display: "flex",
            flexDirection: "row-reverse",
            "p > strong > img": {
              width: "190px",
            },
            "h2 > strong": {
              width: "60%",
            },
          },
          "#linkToCompanionPage-content-container-3": {
            h1: {
              textAlign: "center",
            },
          },
          '[id*="content-container-0"]': {
            marginBottom: "1.5rem",
            h2: {
              letterSpacing: "0rem!important",
              fontWeight: "500!important",
              display: "flex",
              justifyContent: "space-between",
              color: "#0033A0!important",
              strong: {
                width: "60%",
                marginLeft: "2%",
                maxWidth: "190px",
              },
              "strong > img": {
                marginTop: "0rem!important",
                marginBottom: "0rem!important",
                "@media(max-width:660px)": {
                  width: "100%",
                  marginLeft: "0%",
                  maxWidth: "unset",
                  paddingBottom: "1rem",
                  textAlign: "left",
                },
              },
              "@media(max-width:660px)": {
                paddingBottom: "0px!important",
                paddingTop: "0px!important",
                flexDirection: "column-reverse",
              },
              h3: {
                img: {
                  marginTop: "0rem!important",
                  marginBottom: "0rem!important",
                  display: "inline-block",
                },
              },
            },
            p: {
              letterSpacing: "0rem!important",
              fontWeight: "500!important",
              display: "flex",
              justifyContent: "space-between",
              color: "#0033A0!important",
              strong: {
                width: "60%",
                marginLeft: "2%",
                maxWidth: "190px",
              },
              "strong > img": {
                marginTop: "0rem!important",
                marginBottom: "0rem!important",
                "@media(max-width:660px)": {
                  width: "100%",
                  marginLeft: "0%",
                  maxWidth: "unset",
                  paddingBottom: "1rem",
                  textAlign: "left",
                },
              },
              "@media(max-width:660px)": {
                paddingBottom: "0px!important",
                paddingTop: "0px!important",
                flexDirection: "column-reverse",
              },
              h3: {
                img: {
                  marginTop: "0rem!important",
                  marginBottom: "0rem!important",
                  display: "inline-block",
                },
              },
            },
          },
          "[data-id=headerWithLogo]": {
            h1: {
              color: "#0033A0!important",
              letterSpacing: "0rem!important",
              fontWeight: "500!important",
              fontSize: "28px!important",
              marginTop: "0.25em!important",
              marginBottom: "0.25em!important",
              display: "flex",
              transform: "scaleY(0.95)",
              lineHeight: "2rem!important",
              justifyContent: "space-between",
              strong: {
                width: "60%",
                marginLeft: "2%",
                maxWidth: "190px",
                img: {
                  marginTop: "0rem!important",
                  marginBottom: "0rem!important",
                  "@media(max-width:660px)": {
                    width: "100%",
                    marginLeft: "0%",
                    maxWidth: "unset",
                    paddingBottom: "1rem",
                    textAlign: "left",
                  },
                },
              },
              "@media(max-width:660px)": {
                paddingBottom: "0px!important",
                paddingTop: "0px!important",
                flexDirection: "column-reverse",
                fontSize: "24px!important",
                textAlign: "left",
              },
            },
          },
          "#checkout-content-container-1, #checkout-content-container-2, #checkout-content-container-3, #checkout-content-container-4, #checkout-content-container-5, [data-id=bindPremiumBlue], [data-id=autoTotalPlain]":
            {
              backgroundColor: "#10193E",
              textAlign: "left",
              paddingLeft: "1rem",
              paddingRight: "1rem",
              p: {
                color: "#FFF",
                marginTop: "0rem!important",
                marginBottom: "0rem!important",
                paddingTop: "1rem!important",
                paddingBottom: "1rem!important",
              },
            },
          "#checkout-content-container-3": {
            p: {
              lineHeight: "1.5rem",
              fontSize: "0.9rem",
            },
          },
          "#checkout-content-container-6, #checkout-content-container-7, #checkout-content-container-8":
            {
              paddingLeft: "1rem",
              paddingRight: "1rem",
              backgroundColor: "#FFF",
            },
          "#checkout-content-container-8": {
            marginTop: "0rem",
            paddingBottom: "0.75rem",
            paddingLeft: "3rem",
          },
          "#checkout-content-container-6": {
            marginTop: "0rem!important",
            paddingBottom: "1rem",
            h2: {
              borderBottom: "1px solid #D5DBE3",
              paddingBottom: "0.75rem!important",
              marginBottom: "0rem!important",
              marginTop: "0rem!important",
              paddingTop: "1rem!important",
            },
          },
          "#checkout-content-container-7": {
            paddingBottom: "0.25rem!important",
          },
          "#checkout-content-container-1": {
            backgroundColor: "#FFF",
            marginTop: "1rem",
            p: {
              color: "#000",
            },
          },
          "#checkout-content-container-1, #checkout-content-container-2": {
            p: {
              display: "flex",
              justifyContent: "space-between",
            },
          },
          "#checkout-content-container-2, #checkout-content-container-4": {
            "p > strong": {
              color: "#FFF",
            },
          },
          "#checkout-content-container-2": {
            p: {
              fontSize: "1.1rem",
              color: "var(--color-secondary)",
              fontWeight: "bold!important",
              borderBottom: "1px solid #D5DBE3",
            },
          },
          "#checkout-content-container-5": {
            table: {
              borderColor: "#10193E",
              marginTop: "0rem!important",
              "thead > tr > th, tbody > tr > td": {
                backgroundColor: "#10193E",
                color: "#FFF",
                borderRightColor: "#10193E",
                borderBottomColor: "#10193E",
                paddingLeft: "0rem!important",
              },
              "tbody > tr > td": {
                fontSize: "1rem",
                paddingTop: "0rem",
              },
              "thead > tr > th:nth-child(2)": {
                fontWeight: "bold!important",
              },
            },
            p: {
              paddingTop: "0rem!important",
              fontSize: "1rem",
            },
          },
          "#paymentIsACH-content-container-5": {
            p: {
              color: "#D62719",
              marginTop: "0rem!important",
            },
            marginTop: "-10px!important",
            textAlign: "left",
          },
          "#paymentSelection-content-container-3, #paymentSelection-content-container-7":
            {
              marginBottom: "-0.5rem!important",
              h2: {
                fontSize: "1.25rem!important",
                fontWeight: "500!important",
              },
            },
          "#paymentSelection-content-container-7": {
            marginTop: "2rem!important",
          },
          "#paymentSelection-content-container-3": {
            marginTop: "0rem!important",
            minHeight: "34px",
          },
          '[data-id="yearlyOnlyOverrideHeader"]': {
            marginBottom: "1rem!important",
          },
          '[data-id="vinInfoBlue"]': {
            backgroundColor: "rgb(217, 238, 255)",
            padding: "1rem",
            paddingLeft: "1.5rem",
            borderLeft: "4px solid #67BAE0",
            p: {
              marginBottom: "0rem!important",
              marginTop: "0rem!important",
              // strong: {
              // 	color: '#10329A',
              // },
            },
          },
          // special case for MI PayInFull only option
          '[data-id="yearlyOnlyOverrideSecondaryMessage"]': {
            p: {
              strong: {
                color: "unset",
              },
            },
          },
          // Arkansas earthquake eSignature
          "label[for=policy-utility-signatureStatusIsComplete], #policy-utility-signatureStatusIsComplete":
            {
              display: "none",
            },
          // user canceled chase iframe or other error message
          // removed #chooseYourPackage-content-container-12 > p
          '#paymentSelection-content-container-1 > p, #paymentSelection-content-container-2 > p, #paymentSelection-content-container-6 > p, #paymentIsACH-content-container-1 > p, #paymentIsACH-content-container-2 > p, [data-id="shutterDiscountField"] > p, [data-id=additionalPaymentMessage] > p':
            {
              color: "#D62719",
              width: "fit-content",
              margin: "0 auto",
              padding: "10px",
              backgroundColor: "#FFCCCB",
            },
          "[data-id=autoTotalPlain]": {
            paddingLeft: "0rem",
            paddingRight: "0rem",
            backgroundColor: "#FFF",
            table: {
              marginBottom: "0rem!important",
              "thead > tr > th:nth-child(1)": {
                width: "85%",
              },
              "thead > tr > th:nth-child(2)": {
                paddingRight: "1rem",
                paddingLeft: "0.8rem",
              },
            },
          },
          "[data-id=bindPremiumBlue]": {
            table: {
              backgroundColor: "#10193E",
              paddingRight: "0rem",
              color: "#FFF",
              borderWidth: "0px!important",
              thead: {
                backgroundColor: "#10193E",
              },
              "thead > tr > th": {
                backgroundColor: "#10193E",
                fontSize: "1.1rem",
                color: "#FFF",
              },
              "thead > tr": {
                backgroundColor: "#10193E",
              },
              "thead > tr > th:nth-child(1)": {
                width: "85%",
                paddingLeft: "0rem",
              },
              "thead, tbody > tr, thead > tr > th, tbody > tr > td": {
                borderWidth: "0px!important",
              },
              "thead > tr > th:nth-child(2)": {
                color: "#57C09E",
              },
              "tbody > tr:nth-child(1) > td": {
                paddingTop: "0px!important",
                paddingBottom: "0px!important",
              },
              "tbody > tr > th": {
                borderBottomColor: "#10193E!important",
              },
            },
          },
          // green
          // removed #chooseYourPackage-content-container-13
          '#paymentSelection-content-container-6 > p, [data-id="shutterDiscountDisclaimer"] > p, [data-id=additionalPaymentMessage] > p':
            {
              color: "#31705F",
              backgroundColor: "#D4F2EC",
            },
          // shutter discount added
          // removed #chooseYourPackage-content-container-12
          '[data-id="shutterDiscountField"]': {
            paddingTop: "0rem!important",
          },
          // removed #chooseYourPackage-content-container-13
          '[data-id="shutterDiscountDisclaimer"]': {
            p: {
              // fontWeight: 'bold',
              color: "#172D3B!important",
              textAlign: "left",
              margin: "0",
              padding: "18px",
              marginTop: "0rem!important",
              width: "unset",
            },
            "p > strong": {
              fontSize: "1.1rem",
            },
            "p::before": {
              content: '""',
              backgroundImage:
                "url('https://staging.embed.buddy.insure/allstate/renters/icons/greenCheckMark.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              height: "20px",
              width: "20px",
              verticalAlign: "bottom",
              display: "inline-block",
              marginRight: "10px",
            },
          },
          "#policy-utility-frequencyCode-radio-button-wrapper > div:nth-child(1) > label::before":
            {
              content: "'Pay in full'",
              display: "block",
              color: "var(--color-text-primary)",
              paddingBottom: "10px",
              marginBottom: "10px",
              borderBottom: "1px solid #C4CCD7",
              fontSize: "1.25rem",
              fontWeight: "400!important",
            },
          "#policy-utility-frequencyCode-radio-button-wrapper > div:nth-child(1) > label::after":
            {
              content: "'12-month total, No installment fees.'",
              display: "block",
              color: "var(--color-text-primary)",
              fontSize: "0.95rem",
              fontWeight: "400!important",
            },
          "#policy-utility-frequencyCode-radio-button-wrapper > div:nth-child(2) > label::before":
            {
              content: "'Monthly'",
              color: "var(--color-text-primary)",
              paddingBottom: "10px",
              marginBottom: "10px",
              borderBottom: "1px solid #C4CCD7",
              display: "block",
              fontSize: "1.25rem",
              fontWeight: "400!important",
            },
          "#policy-utility-frequencyCode-radio-button-wrapper > div:nth-child(2) > label::after":
            {
              content: "'Automatically billed'",
              display: "block",
              color: "var(--color-text-primary)",
              fontSize: "0.95rem",
              fontWeight: "400!important",
            },
          "#checkout-view-container > .view-title": {
            display: "none!important",
          },
          "#checkout-view-container": {
            marginBottom: "0rem!important",
          },
          "#missingCustomerInfo-content-container-4, #missingRentalAddressInfo-content-container-4, #missingCurrentAddressInfo-content-container-4":
            {
              textAlign: "left!important",
            },
          "#missingRentalAddressInfo-content-container-5, #missingCurrentAddressInfo-content-container-5":
            {
              p: {
                marginTop: "0.5rem!important",
              },
            },
          // removed #chooseYourPackage-content-container-1,
          '[data-id="whyDoINeedThis"], #missingCustomerInfo-content-container-1, #missingCustomerInfo-content-container-2, #missingCustomerInfo-content-container-3, #missingRentalAddressInfo-content-container-1, #missingCurrentAddressInfo-content-container-1, #missingRentalAddressInfo-content-container-1':
            {
              p: {
                marginTop: "0rem!important",
              },
              "p > strong": {
                paddingTop: "0rem!important",
              },
              "p:nth-child(2)": {
                marginBottom: "0rem!important",
              },
            },
          "#missingCurrentAddressInfo-content-container-1 > p:nth-child(1), #missingRentalAddressInfo-content-container-1 > p:nth-child(1)":
            {
              marginBottom: "0rem!important",
              fontSize: "18px",
              fontWeight: "500",
            },
          // removed #chooseYourPackage-content-container-1 #chooseYourPackage-content-container-2, #chooseYourPackage-content-container-3
          '[data-id="whyDoINeedThis"], [data-id="learnWhyToggleField"], [data-id="whatRentersInsuranceCovers"]':
            {
              float: "right",
              width: "32%",
              clear: "both",
              "@media(max-width:990px)": {
                display: "none",
              },
            },
          // learn more about insurance BELOW main content for prefill screens
          "#missingCustomerInfo-content-container-6, #missingCustomerInfo-content-container-7, #missingCustomerInfo-content-container-8, #missingRentalAddressInfo-content-container-9, #missingCurrentAddressInfo-content-container-9":
            {
              "@media(min-width:770px)": {
                display: "none",
              },
            },
          // if floating above
          // removed #chooseYourPackage-content-container-2
          '[data-id="learnWhyToggleField"], #missingCustomerInfo-content-container-3, #missingCustomerInfo-content-container-4, #missingRentalAddressInfo-content-container-2, #missingCurrentAddressInfo-content-container-2':
            {
              paddingTop: "0.45rem!important",
              lineHeight: "1.1",
            },
          // removed #chooseYourPackage-content-container-2, #chooseYourPackage-content-container-13
          '#missingCustomerInfo-content-container-3 > #policy-utility-learnWhyToggle-field-container, #missingRentalAddressInfo-content-container-2 > #policy-utility-learnWhyToggle-field-container, #missingCurrentAddressInfo-content-container-2 > #policy-utility-learnWhyToggle-field-container, #missingCustomerInfo-content-container-7 > #policy-utility-learnWhyToggleAfter-field-container, #missingRentalAddressInfo-content-container-8 > #policy-utility-learnWhyToggleAfter-field-container, #missingCurrentAddressInfo-content-container-8 > #policy-utility-learnWhyToggleAfter-field-container, [data-id="learnWhyToggleField"] > #policy-utility-learnWhyToggle-field-container, [data-id="shutterDiscountDisclaimer"] > #policy-utility-learnWhyToggleAfter-field-container':
            {
              marginTop: "0rem!important",
              marginBottom: "0rem!important",
            },
          "#missingCurrentAddressInfo-content-container-2, #missingRentalAddressInfo-content-container-2, #missingCurrentAddressInfo-content-container-3, #missingRentalAddressInfo-content-container-3, #missingCustomerInfo-content-container-4":
            {
              display: "none",
            },
          "#policy-utility-compareOptionsToggle-field-container": {
            marginTop: "0rem!important",
            maxWidth: "unset",
          },
          ".progress-bar-container, .progress-bar-label": {
            display: "none",
          },
          "#offer-container": {
            maxWidth: "1024px!important",
            margin: "0 auto",
            "@media (max-width: 992px)": {
              maxWidth: "900px!important",
            },
          },
          ".card": {
            backgroundColor: "#F2FAFE", // light baby blue
            textAlign: "left",
            padding: "0",
            maxWidth: "990px",
            border: "16px solid #F2FAFE",
            "@media (max-width: 660px)": {
              // backgroundColor: '#FFF', // trying to account for the sticky button behavior on mobile
            },
            // '@media (min-width: 992px)': {
            // 	backgroundImage: 'url("https://staging.embed.buddy.insure/allstate/auto/as-echo-vert-no-hands.png")',
            // 	border: '16px solid var(--color-primary)',
            // 	backgroundSize: '220px',
            // 	backgroundPosition: 'left bottom',
            // 	backgroundRepeat: 'no-repeat',
            // 	borderRadius: 'unset',
            // },
          },
          "#policy-currentAddressHeader, #policy-rentalAddressHeader, #policy-confirmInfoHeader":
            {
              display: "none",
            },
          "label[for=policy-currentAddressHeader], label[for=policy-rentalAddressHeader], label[for=policy-confirmInfoHeader]":
            {
              fontSize: "13px",
              fontWeight: "400!important",
              "span:nth-child(1) > strong": {
                display: "block",
                fontSize: "16px",
              },
            },
          "#checkout-wrapper > .input-error": {
            display: "none",
          },
          "#missingInfoQuickQuoteLoader-view-container, #quickQuoteLoader-view-container, #chooseYourPackage-view-container, #updateQuoteLoader-view-container, #bindQuoteLoader-view-container, #convertChaseUIdToMoneyball-view-container, #youreCovered-view-container, #paymentSelection-content-container, #paymentIsACH-content-container, #paymentIsCC-content-container, #redirectUserToLinkToCompanionPage-view-container, #companionModeLoader-view-container, #configLoader-view-container, #eSignatureLoad-view-container, #processPaymentLoader-view-container, #updateQuoteLoader-view-container":
            {
              textAlign: "center",
              "#nav-button-container": {
                backgroundImage: "none!important",
                margin: "0rem",
                marginBottom: "1rem!important",
              },
            },
          "#youreCovered-view-container": {
            textAlign: "left",
          },
          "#paymentIsACH-content-container-1, #paymentIsACH-content-container-3, #missingCustomerInfo-content-container-1, #missingCustomerInfo-content-container-2, #missingCustomerInfo-content-container-3, #missingRentalAddressInfo-content-container-1, #missingCurrentAddressInfo-content-container-1, #missingRentalAddressInfo-content-container-1":
            {
              textAlign: "left",
            },
          "#missingCustomerInfo-content-container-1, #missingCustomerInfo-content-container-2, #missingCustomerInfo-content-container-3, #missingCustomerInfo-content-container-4, #missingRentalAddressInfo-content-container-1, #missingRentalAddressInfo-content-container-4, #missingCurrentAddressInfo-content-container-1, #missingCurrentAddressInfo-content-container-4":
            {
              backgroundColor: "#FFF",
              padding: "0rem 0.75rem",
            },
          "#missingCustomerInfo-content-container-1, #missingCustomerInfo-content-container-2, #missingCustomerInfo-content-container-3, #missingRentalAddressInfo-content-container-1, #missingCurrentAddressInfo-content-container-1":
            {
              paddingTop: "0.75rem",
              h3: {
                marginBottom: "0rem!important",
              },
            },
          "#missingCustomerInfo-content-container-2": {
            p: {
              marginBottom: "0rem!important",
              color: "#D7234A!important",
            },
          },
          // #missingCustomerInfo-content-container-2
          /// hide label[for=policy-utility-namesContainNumberValidationRule], #policy-utility-namesContainNumberValidationRule
          "label[for=policy-utility-namesContainNumberValidationRule], #policy-utility-namesContainNumberValidationRule, #missingCustomerInfo-content-container-4, #policy-utility-namesContainNumberValidationRule-field-container":
            {
              display: "none",
            },
          "#missingCustomerInfo-content-container-1": {
            h3: {
              color: "var(--color-text-primary)!important",
              fontWeight: "500!important",
            },
          },
          "#missingCustomerInfo-content-container-3, #missingCustomerInfo-content-container-4, #missingRentalAddressInfo-content-container-4, #missingCurrentAddressInfo-content-container-4":
            {
              paddingBottom: "1rem",
            },
          "#paymentIsACH-content-container-1 > p, #paymentIsACH-content-container-2 > p":
            {
              color: "#D62719",
            },
          "#policy-utility-editInfoTabs-field-container": {
            marginTop: "0rem!important",
          },
          "label[for=policy-utility-editInfoTabs], #policy-utility-editInfoTabs-insured, #policy-utility-editInfoTabs-current, #policy-utility-editInfoTabs-hidden, #policy-utility-editInfoTabs-save, #policy-utility-editInfoTabs-customer, #policy-utility-selectedPackage-BudgetSavvy, #policy-utility-selectedPackage-Balanced, #policy-utility-selectedPackage-Enhanced, #policy-editInfoCurrentDetails, #policy-editInfoInsuredDetails, #policy-editInfoCustomerDetails, #policy-utility-editInfoTabs-saveCustomer, #policy-utility-editInfoTabs-saveCurrent":
            {
              // visibility: 'hidden',
              display: "none",
            },
          "label[for=policy-utility-selectedPackage-BudgetSavvy], label[for=policy-utility-selectedPackage-Balanced], label[for=policy-utility-selectedPackage-Enhanced]":
            {
              display: "inline-block",
              padding: "10px",
              margin: 0,
              marginLeft: "0px!important",
              cursor: "pointer",
              background: "rgb(227, 233, 237)",
              borderLeft: "1px solid #d3d3d3",
              fontSize: "2rem!important",
              "@media(min-width:660px)": {
                padding: "10px 20px",
                marginLeft: "0px!important",
              },
              "@media(max-width:660px)": {
                fontSize: "1.5rem!important",
              },
            },
          "label[for=policy-utility-selectedPackage-BudgetSavvy]": {
            borderLeft: "0px solid #d3d3d3",
          },
          "label[for=policy-utility-selectedPackage-Enhanced]": {
            borderLeft: "0px solid #d3d3d3",
          },
          "#policy-utility-selectedPackage-radio-button-wrapper": {
            display: "flex",
            paddingLeft: "0px!important",
            flexDirection: "row!important",
            borderTop: "2px solid #d3d3d3",
            backgroundColor: "#F3F6F9",
            verticalAlign: "baseline",
            ".radio-button-option-wrapper": {
              margin: 0,
              marginTop: "0px!important",
              paddingLeft: "0px!important",
              flex: "1 1 0%",
              borderBottom: "none!important",
              borderLeft: "1px solid #BCC5D2",
            },
            ".radio-button-option-wrapper:nth-child(1)": {
              borderLeft: "2px solid #BCC5D2!important",
            },
          },
          "#policy-utility-selectedPackage-radio-button-wrapper > div:nth-child(3) > label":
            {
              borderRight: "2px solid #d3d3d3",
            },
          "#policy-utility-selectedPackage-radio-button-wrapper label": {
            flex: "1 1 0%",
            textAlign: "center",
          },
          "#policy-utility-selectedPackage-radio-button-wrapper label::before":
            {
              content: "'$'",
              textTransform: "lowercase",
              verticalAlign: "super",
              fontSize: "14px",
              "@media(max-width:660px)": {
                fontSize: "12px",
              },
            },
          '[data-id="selectedPackageFieldMonthly"] > #policy-utility-selectedPackage-field-container > div > fieldset > #policy-utility-selectedPackage-radio-button-wrapper > .radio-button-option-wrapper label::after':
            {
              content: "' /mo.'",
            },
          '[data-id="selectedPackageFieldYearly"] > #policy-utility-selectedPackage-field-container > div > fieldset > #policy-utility-selectedPackage-radio-button-wrapper > .radio-button-option-wrapper label::after':
            {
              content: "' /yr.'",
            },
          "#policy-utility-selectedPackage-radio-button-wrapper label::after": {
            // content: "' /mo'",
            textTransform: "lowercase",
            "vertical-align": "baseline",
            fontSize: "14px",
            "@media(max-width:660px)": {
              fontSize: "12px",
            },
          },
          "#policy-utility-selectedPackage-radio-button-wrapper input + label":
            {
              backgroundColor: "rgb(227, 233, 237)",
              "border-top": "10px solid rgb(227, 233, 237)",
              "@media(min-width:660px)": {
                backgroundColor: "rgb(227, 233, 237)",
                "border-top": "10px solid rgb(227, 233, 237)",
              },
            },
          "#policy-utility-selectedPackage-radio-button-wrapper input:checked + label":
            {
              background: "rgb(217, 238, 255)",
              "border-top": "10px solid rgb(69, 188, 229)",
              "@media(min-width:660px)": {
                backgroundColor: "#FFF",
              },
            },
          "#policy-utility-selectedPackage-radio-button-wrapper label:hover": {
            background: "rgb(217, 238, 255)",
            borderTop: "10px solid rgb(217, 238, 255)",
          },
          "#policy-utility-frequencyCode-radio-button-wrapper input:checked + label, #policy-utility-methodCode-radio-button-wrapper input:checked + label, #policy-addVehicleBy-radio-button-wrapper input:checked + label, #policy-utility-useApples-radio-button-wrapper input:checked + label, #policy-utility-initialCurrentlyCovered-radio-button-wrapper input:checked + label, #policy-timeLivedAtCurrentAddressCode-radio-button-wrapper input:checked + label, #policy-primarilyParkedAtCurrentAddress-radio-button-wrapper input:checked + label, #policy-originalOwned-radio-button-wrapper input:checked + label, #policy-ownershipStatus-radio-button-wrapper input:checked + label, #policy-maritalStatusCode-radio-button-wrapper input:checked + label, #policy-defensiveDrivingCourse-radio-button-wrapper input:checked + label, #policy-spouseOnPolicy-radio-button-wrapper input:checked + label, #policy-spouseInfo-movingViolationsInFiveYears-radio-button-wrapper input:checked + label, #policy-spouseInfo-defensiveDrivingCourseSpouse-radio-button-wrapper input:checked + label, #policy-currentlyInsured-radio-button-wrapper input:checked + label, #policy-movingViolationsInFiveYears-radio-button-wrapper input:checked + label, #movingViolationsInFiveYears-radio-button-wrapper input:checked + label, #policy-addSecondVehicleBy-radio-button-wrapper input:checked + label, #policy-secondDriverNonSpouse-movingViolationsInFiveYears-radio-button-wrapper input:checked + label, #policy-ownershipStatusSecondVehicle-radio-button-wrapper input:checked + label":
            {
              background: "rgb(217, 238, 255)",
            },
          "#policy-utility-methodCode-radio-button-wrapper input:checked, #policy-addVehicleBy-radio-button-wrapper input:checked, #policy-utility-useApples-radio-button-wrapper input:checked, #policy-utility-initialCurrentlyCovered-radio-button-wrapper input:checked #policy-timeLivedAtCurrentAddressCode-radio-button-wrapper input:checked, #policy-primarilyParkedAtCurrentAddress-radio-button-wrapper input:checked, #policy-defensiveDrivingCourse-radio-button-wrapper input:checked, #policy-spouseOnPolicy-radio-button-wrapper input:checked, #policy-spouseInfo-movingViolationsInFiveYears-radio-button-wrapper input:checked, #policy-spouseInfo-defensiveDrivingCourseSpouse-radio-button-wrapper input:checked, #policy-currentlyInsured-radio-button-wrapper input:checked, #policy-movingViolationsInFiveYears-radio-button-wrapper input:checked, #movingViolationsInFiveYears-radio-button-wrapper input:checked, #policy-addSecondVehicleBy-radio-button-wrapper input:checked, #policy-secondDriverNonSpouse-movingViolationsInFiveYears-radio-button-wrapper input:checked":
            {
              ".radio-button-option-wrapper": {
                borderLeft: "4px solid 48BDE3",
                background: "#D9EEFE!important",
              },
            },
          "#policy-utility-frequencyCode-radio-button-wrapper label:hover, #policy-utility-methodCode-radio-button-wrapper label:hover, #policy-utility-useApples-radio-button-wrapper label:hover, #policy-utility-initialCurrentlyCovered-radio-button-wrapper label:hover, #policy-addVehicleBy-radio-button-wrapper label:hover, #policy-timeLivedAtCurrentAddressCode-radio-button-wrapper label:hover, #policy-primarilyParkedAtCurrentAddress-radio-button-wrapper label:hover, #policy-originalOwned-radio-button-wrapper label:hover, #policy-ownershipStatus-radio-button-wrapper label:hover, #policy-maritalStatusCode-radio-button-wrapper label:hover, #policy-defensiveDrivingCourse-radio-button-wrapper label:hover, #policy-spouseOnPolicy-radio-button-wrapper label:hover, #policy-spouseInfo-movingViolationsInFiveYears-radio-button-wrapper label:hover, #policy-spouseInfo-defensiveDrivingCourseSpouse-radio-button-wrapper label:hover, #policy-currentlyInsured-radio-button-wrapper label:hover, #policy-movingViolationsInFiveYears-radio-button-wrapper label:hover, #movingViolationsInFiveYears-radio-button-wrapper label:hover, #policy-addSecondVehicleBy-radio-button-wrapper label:hover, #policy-secondDriverNonSpouse-movingViolationsInFiveYears-radio-button-wrapper label:hover, #policy-ownershipStatusSecondVehicle-radio-button-wrapper label:hover":
            {
              background: "rgb(217, 238, 255)",
            },
          "#policy-budgetSavvyDetails, #policy-balancedDetails, #policy-enhancedDetails, label[for=policy-utility-selectedPackage], label[for=policy-seeDetailsToggle]":
            {
              display: "none",
            },
          "label[for=policy-budgetSavvyDetails], label[for=policy-balancedDetails], label[for=policy-enhancedDetails]":
            {
              // was #chooseYourPackage-content-container-6 > p:nth-child(3)
              '[data-id="selectedPackagesTabs"] > p:nth-child(3)': {
                "@media(min-width:990px)": {
                  display: "none",
                },
              },
            },
          // removed #chooseYourPackage-content-container-4
          '[data-id="customerInfoAndAddressTable"]': {
            maxWidth: "unset",
            width: "100%!important",
            "@media(min-width:990px)": {
              width: "580px!important",
            },
            "table, table > thead, table > tbody, table > thead > tr > th, table > tbody > tr > td":
              {
                border: "none!important",
                borderBottomWidth: "0px!important",
                borderBottomColor: "#F3F6F9!important",
                backgroundColor: "#F3F6F9",
                padding: "0px!important",
              },
            "table > tbody > tr": {
              borderBottomWidth: "0px!important",
            },
            "table > thead > tr > th:nth-child(1), table > thead > tr > th:nth-child(3), table > tbody > tr:nth-child(3) > td:nth-child(1)":
              {
                fontWeight: "bold!important",
              },
          },
          "label[for=policy-utility-compareOptionsToggle-true], label[for=policy-utility-paymentTermsAndConditionsToggle-true]":
            {
              color: "#0033A0",
              fontSize: "0.8rem",
              fontWeight: "bold",
            },
          // removed #chooseYourPackage-content-container-6, #chooseYourPackage-content-container-7
          '[data-id="selectedPackagesTabs"], #policy-budgetSavvyDetails-field-container, #policy-balancedDetails-field-container, #policy-enhancedDetails-field-container, [data-id="compareOptionsToggleField"]':
            {
              padding: "1rem",
              width: "100%",
              paddingLeft: "12px",
              backgroundColor: "#FFF",
              borderLeft: "2px solid #d3d3d3",
              borderRight: "2px solid #d3d3d3",
              "@media(min-width:990px)": {
                backgroundColor: "#FFF",
                padding: "1rem",
                marginLeft: "40px",
                borderLeft: "2px solid #d3d3d3",
                borderRight: "2px solid #d3d3d3",
              },
              "p:nth-child(1)": {
                fontSize: "26px",
                strong: {
                  fontWeight: "500!important",
                },
              },
              "p:nth-child(1) > strong, p:nth-child(2), p:nth-child(4) > strong, p:nth-child(6) > strong, p:nth-child(8) > strong":
                {
                  color: "var(--color-text-primary)",
                  paddingTop: "0px",
                  "@media(min-width:990px)": {
                    color: "var(--color-text-primary)",
                  },
                },
              "p:nth-child(3), p:nth-child(5), p:nth-child(7), p:nth-child(9)":
                {
                  fontWeight: "400!important",
                  fontSize: "13px",
                  marginBottom: "0rem!important",
                  marginTop: "0rem!important",
                  paddingTop: "12px",
                  paddingBottom: "0px",
                },
            },
          // removed #chooseYourPackage-content-container-7
          '[data-id="compareOptionsToggleField"]': {
            marginLeft: "0px",
            borderBottom: "2px solid #d3d3d3",
            paddingTop: "0px",
            minWidth: "300px",
          },
          // hide have questions on desktop
          // '#chooseYourPackage-content-container-15': {
          // 	display: 'none',
          // 	padding: '2px 12px',
          // 	'p:nth-child(1)': {
          // 		color: 'rgb(69, 188, 229)',
          // 		marginBottom: '0rem!important',
          // 		fontWeight: 'bold!important',
          // 	},
          // 	'p:nth-child(2)': {
          // 		color: '#FFF',
          // 		fontSize: '15px',
          // 		marginTop: '0.2rem!important',
          // 	},
          // 	backgroundColor: 'var(--color-primary)',
          // 	marginTop: '5rem!important',
          // 	'@media(min-width:770px)': {
          // 		display: 'none',
          // 	},
          // },
          "#offer-view-container": {
            "h2, h3": {
              textAlign: "left",
              "@media (min-width: 660px)": {},
            },
            p: {
              marginTop: "2rem",
              fontStyle: "italic",
            },
          },
          "#youreCovered-content-container-4 > p": {
            paddingBottom: "1rem!important",
            width: "75%",
            "@media (max-width: 660px)": {
              width: "100%",
            },
          },
          "#youreCovered-content-container-8, [data-id=youreCoveredMobileAppTable]":
            {
              p: {
                display: "flex",
                img: {
                  width: "28px",
                  marginTop: "0rem!important",
                  marginBottom: "0rem!important",
                },
              },
            },
          "#youreCovered-content-container-2": {
            paddingTop: "1rem!important",
            p: {
              fontSize: "1.25rem",
              img: {
                paddingRight: "0.5rem",
              },
            },
          },
          // was additionalDetailsPersons-content-container-6
          "#additionalDetailsPersons-content-container-1, #additionalDetailsPersons-content-container-6, #additionalDetailsPersons-content-container-7, #additionalDetailsPersons-content-container-8, #additionalDetailsPersons-content-container-10, #additionalDetailsPersons-content-container-11, #additionalDetailsPersons-content-container-12":
            {
              backgroundColor: "#FFF",
              h2: {
                fontSize: "1.25rem!important",
                color: "var(--color-text-primary)!important",
                marginTop: "0rem!important",
                marginBottom: "0rem!important",
              },
            },
          "#additionalDetailsPersons-content-container-6": {
            marginTop: "1rem!important",
            marginBottom: "-1.25rem!important",
            padding: "1rem 1.5rem",
            p: {
              fontSize: "0.9rem!important",
              marginTop: "0rem!important",
              marginBottom: "0rem!important",
            },
          },
          "#additionalDetailsPersons-content-container-7, #additionalDetailsPersons-content-container-9, #additionalDetailsPersons-content-container-11, #additionalDetailsPersons-content-container-12":
            {
              marginTop: "-0.75rem!important",
              marginBottom: "0rem!important",
              padding: "1rem 1.5rem",
              p: {
                marginTop: "0rem!important",
                marginBottom: "0rem!important",
              },
              paddingTop: "0rem",
              "#customer-email-field-container": {
                "@media (min-width: 770px)": {
                  width: "60%",
                  display: "inline-grid",
                  marginLeft: "0%",
                },
              },
              "#customer-phone-field-container": {
                marginLeft: "1%!important",
                "@media (min-width: 770px)": {
                  width: "38%",
                  marginRight: "0px",
                  marginLeft: "0%",
                },
              },
            },
          "#additionalDetailsPersons-content-container-12": {
            p: {
              fontSize: "0.8rem!important",
            },
          },
          // was #chooseYourPackage-content-container-9
          '[data-id="rentersDiscountOpportunitiesHeader"]': {
            marginTop: "1rem!important",
            marginBottom: "-0.5rem!important",
            marginLeft: "1rem!important",
            h3: {
              fontSize: "1.25rem!important",
              fontWeight: "500!important",
              color: "var(--color-text-primary)!important",
              textAlign: "left!important",
            },
          },
          // removed #chooseYourPackage-content-container-10, #chooseYourPackage-content-container-11, #chooseYourPackage-content-container-12
          '[data-id="windstormProtectiveDeviceLabel"], [data-id="shutterDiscountLabel"], [data-id="shutterDiscountField"]':
            {
              backgroundColor: "#FFF",
              padding: "1rem",
              p: {
                fontSize: "1rem!important",
                textAlign: "left",
                fontWeight: "bold",
                color: "var(--color-text-primary)!important",
                marginTop: "0rem!important",
                marginBottom: "0rem!important",
              },
            },
          "#policy-utility-shutterDiscount-field-container": {
            marginTop: "0rem!important",
          },
          // removed #chooseYourPackage-content-container-10
          '[data-id="windstormProtectiveDeviceLabel"]': {
            marginTop: "1rem",
            p: {
              paddingBottom: "0.75rem!important",
              borderBottom: "2px solid #d3d3d3",
            },
          },
          // removed #chooseYourPackage-content-container-11
          '[data-id="shutterDiscountLabel"]': {
            marginTop: "-1rem",
          },
          // '#youreCovered-content-container-1, #youreCovered-content-container-5': {
          // 	background: 'none!important',
          // 	padding: '1rem 1.5rem 0.5rem 0rem',
          // 	h2: {
          // 		fontSize: '1.25rem!important',
          // 		fontWeight: '500!important',
          // 		color: 'var(--color-text-primary)!important',
          // 	},
          // },
          "#additionalDetailsPersons-content-container-1, #additionalDetailsPersons-content-container-8, #additionalDetailsPersons-content-container-9, #additionalDetailsPersons-content-container-10":
            {
              padding: "0.5rem 1.5rem",
            },
          "#additionalDetailsPersons-content-container-1, #additionalDetailsPersons-content-container-8":
            {
              paddingTop: "0rem",
              paddingBottom: "0rem",
              h2: {
                paddingTop: "1rem",
                fontWeight: "500!important",
                fontSize: "1.3rem!important",
              },
            },
          "#additionalDetailsPersons-content-container-4, #additionalDetailsPersons-content-container-10":
            {
              paddingBottom: "1rem",
            },
          "#additionalDetailsPersons-content-container-9, #additionalDetailsPersons-content-container-10":
            {
              backgroundColor: "#FFF",
            },
          "#additionalDetailsPersons-content-container-10": {
            h2: { fontWeight: "500!important", paddingTop: "0.5rem" },
            marginTop: "1rem",
          },
          "#additionalDetailsPersons-content-container-8": {
            marginTop: "0rem!important",
            paddingBottom: "0rem!important",
          },
          "#policy-utility-earthquakeCoverage-field-container": {
            marginTop: "1rem!important",
            paddingBottom: "1rem!important",
          },
          // '#youreCovered-content-container-7 > p > a:focus-visible img': {
          // 	outline: '3px solid var(--color-secondary)',
          // },
          ".radio-button-option-wrapper": {
            marginTop: "6px",
            marginLeft: "0px",
            "@media (min-width: 660px)": {
              marginTop: "10px",
            },
          },
          table: {
            borderColor: "#d3d3d3",
            color: "var(--color-text-primary)",
            verticalAlign: "middle",
            maxWidth: "none",
            borderWidth: "2px",
            marginTop: "0rem!important",
          },
          "td strong": {
            marginLeft: "unset",
            "@media (min-width: 660px)": {
              // marginLeft: '-1rem',
              color: "var(--color-text-primary)",
            },
          },
          thead: {
            backgroundColor: "var(--color-primary)",
            color: "#fff",
          },
          "table > thead > tr > th": {
            backgroundColor: "#FFF",
            "border-right-color": "#FFF",
            "border-bottom-color": "#FFF",
            color: "var(--color-primary)",
            fontWeight: "400!important",
            verticalAlign: "middle",
          },
          "table > tbody > tr > td": {
            backgroundColor: "#FFF",
            "border-right-color": "#FFF",
          },
          "table > thead > tr > th > img, table > tbody > tr > td > img": {
            display: "inline",
            marginBottom: "0rem!important",
            marginTop: "0rem!important",
          },
          "table > thead > tr > th:nth-child(1), table > tbody > tr > td:nth-child(1)":
            {
              img: {
                minWidth: "20px",
              },
            },
          // #missingCustomerInfo-content-container-3,
          // removed #chooseYourPackage-content-container-8, #chooseYourPackage-content-container-3
          // removed ,  #chooseYourPackage-content-container-14
          '#missingCustomerInfo-content-container-4, [data-id="compareOptionsTableMonthly"], [data-id="compareOptionsTableYearly"], [data-id="whatRentersInsuranceCovers"]':
            {
              display: "flex",
              justifyContent: "start",
              alignItems: "center",
              minWidth: "300px",
              "@media (max-width: 990px)": {
                // width: '100%!important',
              },
            },

          // styling for coverages table overlay
          // removed #chooseYourPackage-content-container-8
          '[data-id="compareOptionsTableMonthly"] > table, [data-id="compareOptionsTableYearly"] > table, [data-id=compareOptionsTableSectionOne] > table, [data-id=compareOptionsTableSectionSingleHeader] > table, [data-id=compareOptionsTableSectionHeader] > table, [data-id=compareOptionsTableSectionVehicleDetails] > table, [data-id=compareOptionsTableSectionRoadsideRental] > table, [data-id=compareOptionsTableSectionCollisionCompVehicleOne] > table, [data-id=compareOptionsTableSectionHeaderAndAmount] > table':
            {
              minWidth: "300px",
              marginTop: "20px",
              border: "none!important",
              "tr > td": {
                width: "33%",
              },
              "tbody > tr:nth-child(2), tbody > tr:nth-child(7), tbody > tr:nth-child(18)":
                {
                  borderBottom: "1px solid grey!important",
                },
              "tbody > tr:nth-child(2) > td": {
                paddingTop: "20px!important",
              },
              // section labels (covers others, you and yours, add-ons)
              // tbody > tr:nth-child(2) > td:nth-child(1),
              "tbody > tr:nth-child(7) > td:nth-child(1), tbody > tr:nth-child(18) > td:nth-child(1)":
                {
                  fontSize: "1.5rem!important",
                  paddingBottom: "10px!important",
                  paddingTop: "32px!important",
                  fontWeight: "400!important",
                  lineHeight: "1.25rem!important",
                  "@media (max-width: 990px)": {
                    fontSize: "1rem!important",
                    lineHeight: "1rem!important",
                  },
                },
              "thead > tr > th, tbody > tr > td": {
                backgroundColor: "#F3F6F9!important",
                border: "none!important",
                padding: "6px!important",
                paddingRight: "30px!important",
                paddingBottom: "0px!important",
                paddingLeft: "20px!important",
                paddingTop: "20px!important",
                textAlign: "left!important",
                fontWeight: "bold!important",
                lineHeight: "1rem",
                fontSize: "12px!important",
                "@media (max-width: 660px)": {
                  fontSize: "12px!important",
                  paddingRight: "8px!important",
                  paddingLeft: "8px!important",
                },
              },
              thead: {
                border: "none!important",
              },
              "tbody > tr": {
                border: "none!important",
              },
              "tbody > tr > td": {
                textTransform: "capitalize",
              },
              // amounts per coverage
              "tbody > tr:nth-child(4), tbody > tr:nth-child(6), tbody > tr:nth-child(9), tbody > tr:nth-child(11), tbody > tr:nth-child(14), tbody > tr:nth-child(17), tbody > tr:nth-child(21), tbody > tr:nth-child(24)":
                {
                  td: {
                    fontWeight: "400!important",
                    fontSize: "1rem!important",
                    paddingBottom: "0px!important",
                    paddingTop: "12px!important",
                    "@media (max-width: 660px)": {
                      fontSize: "13px!important",
                    },
                  },
                },
              // vehicle details collision, comp, roadside, rental
              "tbody > tr:nth-child(13), tbody > tr:nth-child(16), tbody > tr:nth-child(20), tbody > tr:nth-child(23)":
                {
                  td: {
                    fontWeight: "400!important",
                    paddingTop: "12px!important",
                  },
                  "tbody > tr:last-child > td": {
                    paddingBottom: "30px!important",
                  },
                  "thead > tr > th": {
                    backgroundColor: "#FFF!important",
                  },
                  "tbody > tr:nth-child(1)": {
                    strong: {
                      fontSize: "22px",
                    },
                    "strong::before": {
                      verticalAlign: "super",
                      fontSize: "10px",
                      content: "'$'",
                    },
                    "strong::after": {
                      content: "'/mo.'",
                      fontSize: "12px",
                    },
                  },
                  "tbody > tr:nth-child(1) > td": {
                    backgroundColor: "#FFF!important",
                    paddingBottom: "10px!important",
                    boxShadow: "inset 0 -3px 6px -4px rgba(0, 0, 0, 0.3)",
                  },
                  "@media (max-width: 990px)": {
                    width: "100%",
                    maxWidth: "unset",
                    marginTop: "52px!important",
                    paddingTop: "13px",
                  },
                  "@media (max-width: 900px)": {
                    marginTop: "46px!important",
                  },
                  "@media (max-width: 600px)": {
                    marginTop: "42px!important",
                  },
                  "@media (max-width: 450px)": {
                    marginTop: "40px!important",
                  },
                },
            },
          "[data-id=compareOptionsTableSectionOne]": {
            marginTop: "20px",
            table: {
              "thead > tr > th": {
                fontSize: "0.9rem!important",
                backgroundColor: "#FFF!important",
                paddingBottom: "unset!important",
              },
              "tbody > tr:nth-child(1)": {
                strong: {
                  fontSize: "1.75rem",
                  color: "#31705F",
                },
                "strong::before": {
                  verticalAlign: "super",
                  fontSize: "10px",
                  content: "'$'",
                  color: "#31705F",
                },
                "strong::after": {
                  content: "'/mo.'",
                  fontSize: "12px",
                  color: "#31705F",
                },
              },
              "tbody > tr:nth-child(1) > td": {
                color: "#31705F",
                backgroundColor: "#FFF!important",
                paddingBottom: "unset!important",
                boxShadow: "unset!important",
              },
              "tbody > tr:nth-child(2) > td": {
                backgroundColor: "#FFF!important",
                paddingBottom: "10px!important",
                marginTop: "-10px!important",
                boxShadow: "inset 0 -3px 6px -4px rgba(0, 0, 0, 0.3)",
                fontWeight: "400!important",
              },
              "tbody > tr:nth-child(2) > td:nth-child(1)": {
                paddingTop: "6px!important",
              },
              "tbody > tr:nth-child(2) > td:nth-child(2)": {
                fontSize: "12px!important",
                paddingTop: "0px!important",
              },
              "tbody > tr:nth-child(2) > td:nth-child(3)": {
                paddingTop: "0px!important",
              },
            },
          },
          // this only includes the table up until we list coverages that are vehicle specific
          "[data-id=compareOptionsTableSectionSingleHeader] > table, [data-id=compareOptionsTableSectionHeaderAndAmount] > table, [data-id=compareOptionsTableSectionVehicleDetails] > table":
            {
              marginTop: "-16px !important",
              "thead > tr > th": {
                backgroundColor: "#F3F6F9!important",
              },
              "tbody > tr:nth-child(1) > td": {
                backgroundColor: "#F3F6F9!important",
                paddingBottom: "unset",
                boxShadow: "unset",
              },
              // section labels (covers others, you and yours, add-ons)
              "tbody > tr:nth-child(2), tbody > tr:nth-child(7)": {
                borderBottom: "unset!important",
              },
              // amounts per coverage
              "tbody > tr:nth-child(2), tbody > tr:nth-child(5), tbody > tr:nth-child(9), tbody > tr:nth-child(12)":
                {
                  td: {
                    fontWeight: "400!important",
                    fontSize: "1rem!important",
                    paddingBottom: "0px!important",
                    paddingTop: "12px!important",
                    "@media (max-width: 660px)": {
                      fontSize: "13px!important",
                    },
                  },
                },
              "tbody > tr:nth-child(4) > td:nth-child(1), tbody > tr:nth-child(4) > td:nth-child(2), tbody > tr:nth-child(4) > td:nth-child(3)":
                {
                  fontSize: "12px!important",
                },
              "tbody > tr:nth-child(2) > td:nth-child(1), tbody > tr:nth-child(2) > td:nth-child(2), tbody > tr:nth-child(2) > td:nth-child(3)":
                {
                  paddingTop: "0px!important",
                },
              "tbody > tr:nth-child(4) > td": {
                fontSize: "12px!important",
                paddingTop: "12px!important",
                fontWeight: "bold!important",
              },
            },
          "[data-id=compareOptionsTableSectionHeaderAndAmount] > table, [data-id=compareOptionsTableSectionSingleHeader] > table":
            {
              "thead > tr > th": {
                fontSize: "0.8rem!important",
              },
              "tbody > tr > td": {
                fontSize: "1.25rem!important",
                fontWeight: "400!important",
                paddingBottom: "20px!important",
              },
            },
          "[data-id=compareOptionsTableSectionVehicleDetails] > table": {
            "thead > tr > th": {
              fontSize: "0.8rem!important",
              fontWeight: "400!important",
              textTransform: "capitalize",
            },
            "tbody > tr:nth-child(1) > td": {
              fontSize: "1.25rem!important",
              fontWeight: "400!important",
              paddingBottom: "20px!important",
            },
          },
          "[data-id=compareOptionsTableSectionHeader] > table": {
            marginTop: "-16px !important",
            "thead > tr": {
              borderBottom: "1px solid grey !important",
            },
            "thead > tr > th": {
              backgroundColor: "#F3F6F9!important",
              // paddingBottom: 'unset',
              boxShadow: "unset",
              fontSize: "1.5rem!important",
              paddingBottom: "10px!important",
              paddingTop: "32px!important",
              fontWeight: "400!important",
              lineHeight: "1.25rem!important",
              "@media (max-width: 990px)": {
                fontSize: "1rem!important",
                lineHeight: "1rem!important",
              },
            },
          },
          "[data-id=compareOptionsTableSectionRoadsideRental] > table": {
            marginTop: "-16px !important",
            // amounts per coverage
            "tbody > tr:nth-child(2), tbody > tr:nth-child(5)": {
              td: {
                fontWeight: "400!important",
                fontSize: "1rem!important",
                paddingBottom: "0px!important",
                paddingTop: "12px!important",
                "@media (max-width: 660px)": {
                  fontSize: "13px!important",
                },
              },
            },
            "tbody > tr:nth-child(1) > td": {
              backgroundColor: "#F3F6F9!important",
              paddingBottom: "unset",
              boxShadow: "unset",
            },
            "tbody > tr:nth-child(4) > td": {
              fontSize: "12px!important",
              paddingTop: "12px!important",
              fontWeight: "bold!important",
            },
            "tbody > tr:nth-child(2)": {
              borderBottom: "unset!important",
            },
            "tbody > tr:nth-child(3) > td, thead > tr > th": {
              backgroundColor: "#F3F6F9!important",
              border: "none!important",
              padding: "6px!important",
              paddingRight: "30px!important",
              paddingBottom: "0px!important",
              paddingLeft: "20px!important",
              paddingTop: "20px!important",
              textAlign: "left!important",
              fontWeight: "bold!important",
              lineHeight: "1rem",
              fontSize: "12px!important",
              "@media (max-width: 660px)": {
                fontSize: "12px!important",
                paddingRight: "8px!important",
                paddingLeft: "8px!important",
              },
            },
            "tbody > tr:nth-child(2) > td:nth-child(1), tbody > tr:nth-child(2) > td:nth-child(2), tbody > tr:nth-child(2) > td:nth-child(3)":
              {
                paddingTop: "0px!important",
              },
            "tbody > tr:nth-child(5)": {
              paddingBottom: "30px!important",
            },
          },
          '[data-id="compareOptionsTableYearly"] > table': {
            "tbody > tr:nth-child(1)": {
              "strong::after": {
                content: "'/yr.'",
                fontSize: "12px",
              },
            },
          },
          // removed #chooseYourPackage-content-container-8
          '[data-id="compareOptionsTableMonthly"] > table > tbody > tr:nth-child(2) > td:nth-child(2) > strong, [data-id="compareOptionsTableMonthly"] > table > tbody > tr:nth-child(2) > td:nth-child(3) > strong, [data-id="compareOptionsTableMonthly"] > table > tbody > tr:nth-child(7) > td:nth-child(2) > strong, [data-id="compareOptionsTableMonthly"] > table > tbody > tr:nth-child(9) > td:nth-child(2) > strong, [data-id="compareOptionsTableMonthly"] > table > tbody > tr:nth-child(9) > td:nth-child(3) > strong, [data-id="compareOptionsTableMonthly"] > table > tbody > tr:nth-child(18) > td:nth-child(2) > strong, [data-id="compareOptionsTableMonthly"] > table > tbody > tr:nth-child(18) > td:nth-child(3) > strong, [data-id="compareOptionsTableYearly"] > table > tbody > tr:nth-child(2) > td:nth-child(2) > strong, [data-id="compareOptionsTableYearly"] > table > tbody > tr:nth-child(2) > td:nth-child(3) > strong, [data-id="compareOptionsTableYearly"] > table > tbody > tr:nth-child(7) > td:nth-child(2) > strong, [data-id="compareOptionsTableYearly"] > table > tbody > tr:nth-child(7) > td:nth-child(3) > strong, [data-id="compareOptionsTableYearly"] > table > tbody > tr:nth-child(9) > td:nth-child(3) > strong, [data-id="compareOptionsTableYearly"] > table > tbody > tr:nth-child(18) > td:nth-child(2) > strong, [data-id="compareOptionsTableYearly"] > table > tbody > tr:nth-child(18) > td:nth-child(3) > strong, [data-id="compareOptionsTableSectionHeader"] > table > thead > tr > th:nth-child(2) > strong, [data-id="compareOptionsTableSectionHeader"] > table > thead > tr > th:nth-child(3) > strong':
            {
              visibility: "hidden",
            },
          // #missingInfoQuickQuoteLoader-content-container-0, #quickQuoteLoader-content-container-0, #updateQuoteLoader-content-container-0, #bindQuoteLoader-content-container-0, #convertChaseUIdToMoneyball-content-container-0, #redirectUserToLinkToCompanionPage-content-container-0, #companionModeLoader-content-container-0, #configLoader-content-container-0, #linkToCompanionPage-content-container-0, #eSignatureLoad-content-container-0, #configLoader-content-container-1, #linkToCompanionPage-content-container-1, #processPaymentLoader-content-container-0
          "[data-id=headerWithLogo], #configLoader-content-container-1": {
            h2: {
              display: "flex",
              flexDirection: "row-reverse",
            },
          },
          // spinner!
          // #missingInfoQuickQuoteLoader-content-container-1 > p > img, #convertChaseUIdToMoneyball-content-container-1 > p > img, #quickQuoteLoader-content-container-1 > p > img, #bindQuoteLoader-content-container-1 > p > img, #updateQuoteLoader-content-container-1 > p > img, #redirectUserToLinkToCompanionPage-content-container-1 > p > img, #companionModeLoader-content-container-1 > p > img, #configLoader-content-container-1 > p > img, #eSignatureLoad-content-container-1 > p > img, #processPaymentLoader-content-container-1 > p > img
          "[data-id=spinner] > p > img": {
            display: "block",
            marginLeft: "auto",
            marginRight: "auto",
            "@keyframes spin": {
              "0%": { transform: "rotate(0deg)" },
              "30%": { transform: "rotate(220deg)" },
              "60%": { transform: "rotate(300deg)" },
              "100%": { transform: "rotate(360deg)" },
            },
            animation: "spin 1s ease-out infinite",
            "transform-origin": "50px 50px",
          },
          "#checkout-back-button": {
            display: "none",
          },
          // real styles for demo
          // '#checkout-content-container-1': {
          // 	backgroundColor: '#FFF',
          // 	marginTop: '1rem',
          // 	p: {
          // 		color: '#000',
          // 	},

          // },
          // remove for demo
          // '.super-view-container #checkout-content-container': {
          // 	display: 'grid!important',
          // 	// 'flex-direction': 'column',
          // 	'flex-wrap': 'wrap!important',
          // 	alignItems: 'flex-start!important',
          // },
          // '#checkout-content-container-1, #checkout-content-container-2, #checkout-content-container-3, #checkout-content-container-4, #checkout-content-container-5': {
          // 	backgroundColor: '#FFF',
          // 	marginTop: '1rem',
          // 	p: {
          // 		color: '#000',
          // 	},
          // 	// width: '50%',
          // 	'flex-basis': '48%', /* Sets the basis width of each item to 50% */
          // 	'box-sizing': ' border-box',
          // },
          // '#checkout-content-container-6, #checkout-content-container-7': {
          // 	// backgroundColor: '#FFF',
          // 	// marginTop: '1rem',
          // 	// p: {
          // 	// 	color: '#000',
          // 	// },
          // 	// width: '50%',
          // 	'flex-basis': '48%', /* Sets the basis width of each item to 50% */
          // 	'box-sizing': ' border-box',
          // 	'margin-left': 'auto',
          // },
          "#policy-utility-tCPAConsent-field-container > .input-error, #policy-utility-authorizePayment-field-container > .input-error":
            {
              display: "none",
            },
          "#policy-utility-authorizePayment-field-container": {
            marginTop: "0rem!important",
          },
          "#policy-utility-authorizePaymentValidationRule-field-container > .input-error":
            {
              paddingLeft: "2rem",
            },
          "label[for=policy-utility-authorizePaymentValidationRule], #policy-utility-authorizePaymentValidationRule,  #policy-utility-accountNumberConfirmationRule":
            {
              display: "none",
            },
          "label[for=policy-utility-accountNumberConfirmationRule]": {
            visibility: "hidden",
          },
          "table > thead > tr": {
            borderColor: "#FFF",
          },
          "#nav-button-container": {
            flexDirection: "row-reverse",
            justifyContent: "space-between",
            marginBottom: "1rem!important",
          },
          "#missingCustomerInfo-view-container > #nav-button-container": {
            paddingLeft: "0px!important",
            marginBottom: "1rem!important",
            "@media (min-width: 770px)": {
              paddingLeft: "24px!important",
            },
          },
          "#customerInfo-view-container > #nav-button-container": {
            paddingLeft: "0px!important",
            "@media (min-width: 770px)": {
              paddingLeft: "36px!important",
            },
          },
          "#missingCurrentAddressInfo-content-container-BELOW_NAV-0, #missingRentalAddressInfo-content-container-BELOW_NAV-0, #missingCustomerInfo-content-container-BELOW_NAV-0":
            {
              textAlign: "left",
              p: {
                marginBottom: "0rem!important",
                color: "#808080!important",
              },
              "p > a": {
                color: "#0033A0!important",
              },
              "p:nth-child(2)": {
                marginTop: "0.2rem!important",
              },
              "@media (max-width: 770px)": {
                width: "100%",
                paddingTop: "1rem!important",
                paddingRight: "unset",
                paddingLeft: "unset",
              },
            },
          "#error-view-view-container, #quote-error-view-view-container": {
            "#nav-button-container": {
              backgroundImage: "none!important",
              margin: "0rem!important",
            },
          },
          "#next-button": {
            marginLeft: "unset",
            width: "100%",
            "@media (min-width: 770px)": {
              // marginLeft: '1rem',
              paddingLeft: "4rem",
              paddingRight: "4rem",
              // display: 'inline-block',
              width: "auto",
            },
          },
          "#back-button": {
            marginRight: "unset",
            marginTop: "unset",
            width: "100%",
            "@media (min-width: 770px)": {
              width: "auto",
              paddingLeft: "4rem",
              paddingRight: "4rem",
              display: "inline-block",
            },
          },
          "#powered-by-buddy-container": {
            display: "none",
          },
          "#powered-by-buddy-container > #powered-by-buddy-container": {
            marginBottom: "0.45rem",
            marginTop: "0.75rem",
            "@media (max-width: 549px)": {
              "max-width": "45%!important",
            },
          },
          // make this change ONLY on certain views (ones with nav buttons showing)
          ".view-container": {
            marginTop: "0",
            marginBottom: "2rem",
            minHeight: "220px",
            maxHeight: "unset",
            // '@media (max-width: 480px)': {
            // 	maxHeight: '80vh',
            // 	overflowX: 'auto',
            // 	marginBottom: '0rem',
            // },
          },
          "#chooseYourPackage-view-container.view-container": {
            // '@media (max-width: 480px)': {
            // 	maxHeight: '70vh',
            // },
          },
          "#quickQuoteLoader-view-container, #linkToCompanionPage-view-container, #companionModeLoader-view-container, #redirectUserToLinkToCompanionPage-view-container, #updateQuoteLoader-view-container, #companionModeLoader-view-container, #configLoader-view-container, #eSignatureLoad-view-container, #processPaymentLoader-view-container":
            {
              ".view-container": {
                "@media (max-width: 480px)": {
                  maxHeight: "unset",
                  overflowX: "unset",
                  marginBottom: "unset",
                },
              },
            },
          "input[type=checkbox]:not(#policy-seeDetailsToggle-true, #policy-saveButtonToggleCurrent-true) + label::before":
            {
              // content: "'Edit/Review your info'",
              fontSize: "14px",
              textDecoration: "underline",
              fontWeight: "bold",
            },
          "input[type=checkbox]:not(#policy-seeDetailsToggle-true, #policy-saveButtonToggleCurrent-true) + label::after":
            {
              fontSize: "14px",
              textDecoration: "underline",
              fontWeight: "bold",
            },
          ".ml-3": {
            marginLeft: "0rem!important",
          },
          "label[for=policy-utility-learnWhyToggle], #policy-learnWhyCopy, label[for=policy-utility-compareOptionsToggle], label[for=policy-utility-learnWhyToggleAfter], label[for=policy-utility-paymentTermsAndConditionsToggle]":
            {
              // display: 'none',
              visibility: "hidden",
              position: "absolute!important",
            },
          "#policy-utility-learnWhyToggle-checkbox-wrapper input[type=checkbox] + label":
            {
              textDecoration: "none",
              fontWeight: "500!important",
              fontSize: "15px",
              color: "#0033A0",
              textAlign: "left",
            },
          // '#policy-utility-learnWhyToggle-checkbox-wrapper input[type=checkbox] + label::before, #policy-utility-learnWhyToggleAfter-checkbox-wrapper input[type=checkbox] + label::before': {
          // 	content: "'Why is Renters Insurance important?'",
          // },
          // '#policy-utility-learnWhyToggle-checkbox-wrapper input[type=checkbox]:checked + label::before, #policy-utility-learnWhyToggleAfter-checkbox-wrapper input[type=checkbox]:checked + label::before': {
          // 	content: "'Show less '",
          // },
          "#policy-utility-learnWhyToggle-checkbox-wrapper input[type=checkbox] + label::after, #policy-utility-compareOptionsToggle-checkbox-wrapper input[type=checkbox] + label::after":
            {
              content: '"^"',
              fontFamily: "Nunito, sans-serif",
              textAlign: "center",
              textDecoration: "none",
              background: "#DBEEFD",
              borderRadius: "50%",
              cursor: "pointer",
              display: "inline-block",
              width: "30px",
              height: "30px",
              lineHeight: "30px",
              fontSize: "20px",
              marginLeft: "10px",
              color: "var(--color-text-primary)",
              fontWeight: "400",
              paddingTop: "2px",
              // backgroundImage: "url('https://staging.embed.buddy.insure/allstate/renters/icons/arrowDownBlueCircleBlueBG.png')",
              // backgroundSize: 'cover',
              // backgroundRepeat: 'no-repeat',
              // backgroundPosition: 'center',
              // rotate: '0deg',
            },
          "#policy-utility-learnWhyToggle-checkbox-wrapper input[type=checkbox] + label:hover::after, #policy-utility-learnWhyToggle-checkbox-wrapper input[type=checkbox]:checked + label:hover::after":
            {
              background: "#FFF",
            },
          "#policy-utility-compareOptionsToggle-checkbox-wrapper input[type=checkbox] + label::after":
            {
              content: '""',
              backgroundImage:
                "url('https://staging.embed.buddy.insure/allstate/renters/icons/compare.png')",
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              height: "18px",
              width: "24px",
              verticalAlign: "bottom",
            },
          "#policy-utility-compareOptionsToggle-checkbox-wrapper input[type=checkbox]:checked + label::after":
            {
              transform: "scaleX(-1)",
            },
          //
          "#policy-utility-learnWhyToggle-checkbox-wrapper input[type=checkbox]:checked + label::after":
            {
              background: "#DBEEFD",
            },
          "#policy-utility-learnWhyToggle-checkbox-wrapper input[type=checkbox]:checked + label::after, #policy-utility-learnWhyToggleAfter-checkbox-wrapper input[type=checkbox]:checked + label::after, #policy-utility-compareOptionsToggle-checkbox-wrapper input[type=checkbox]:checked + label::after":
            {
              rotate: "180deg",
            },
          "#policy-utility-learnWhyToggle-checkbox-wrapper input[type=checkbox]:checked + label::after, #policy-utility-learnWhyToggleAfter-checkbox-wrapper input[type=checkbox]:checked + label:hover::after, #policy-utility-learnWhyToggleAfter-checkbox-wrapper input[type=checkbox]:checked + label:hover::after":
            {
              rotate: "180deg",
              background: "#fff",
            },
          "#policy-learnWhyCopy-field-container": {
            marginTop: "1rem!important",
            backgroundColor: "#FFF",
            padding: "20px",
          },
          "#checkout-content-container-9": {
            border: "none!important",
            marginTop: "0rem!important",
            paddingBottom: "1rem",
            backgroundColor: "#FFF",
            paddingLeft: "3rem",
            paddingRight: "2rem",
            "p:nth-child(1)": {
              marginTop: "0rem!important",
              fontWeight: "bold!important",
            },
          },
          "#checkout-content-container-10": {
            position: "fixed",
            top: "1%",
            left: "24%",
            width: "52%",
            maxWidth: "52%",
            height: "68%",
            borderRadius: "2rem",
            p: {
              color: "#FFF!important",
            },
            backgroundColor: "#F2FAFE",
            display: "grid",
            placeItems: "center",
            zIndex: "1500",
            "@media (max-width: 770px)": {
              width: "90%",
              maxWidth: "90%",
              left: "5%",
              height: "68%",
            },
            "@media (max-width: 550px)": {
              height: "66%",
            },
            "@media (max-width: 400px)": {
              height: "63%",
            },
          },
          "#checkout-content-container-11": {
            position: "fixed",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            backgroundColor: "#0D1940",
            p: {
              color: "#0D1940!important",
            },
            zIndex: "1000",
          },
          "#policy-utility-paymentTermsAndConditionsToggle-field-container": {
            marginTop: "0rem!important",
          },
          "#policy-utility-paymentTermsAndConditionsToggle-checkbox-wrapper input[type=checkbox] + label::before":
            {
              content: "'View '",
              color: "#0033A0",
              fontSize: "0.8rem",
              fontWeight: "bold",
              textDecoration: "none",
              paddingRight: "0.05rem",
            },
          "#policy-utility-paymentTermsAndConditionsToggle-checkbox-wrapper input[type=checkbox]:checked + label::before":
            {
              content: "'Close '",
            },
          // '#policy-utility-paymentTermsAndConditionsToggle-checkbox-wrapper input[type=checkbox]:checked + label::after': {
          // 	content: "'back'",
          // 	fontSize: '20px',
          // 	textDecoration: 'none',
          // 	color: '#666',
          // 	borderRadius: '30px',
          // 	border: '1px solid #ececec',
          // 	backgroundColor: '#FFF!important',
          // 	position: 'fixed',
          // 	width: '25%',
          // 	left: '28%',
          // 	padding: '1%',
          // 	margin: '0 auto',
          // 	textAlign: 'center',
          // 	zIndex: '3000',
          // 	'@media (max-width: 770px)': {
          // 		width: '80%',
          // 		left: '10%',
          // 		color: '#000',
          // 		backgroundColor: '#FFF!important',
          // 	},
          // },
          "#policy-utility-paymentTermsAndConditionsToggle-checkbox-wrapper input[type=checkbox]:checked + label:hover::after":
            {
              backgroundColor: "#F2FAFE!important",
            },
          // WAS #chooseYourPackage-content-container-5
          '[data-id="selectedPackageFieldMonthly"], [data-id="selectedPackageFieldYearly"]':
            {
              width: "100%!important",
              maxWidth: "none",
              minWidth: "none",
              "@media (max-width: 990px)": {
                width: "100%!important",
                maxWidth: "none",
                minWidth: "300px",
                paddingLeft: "0px!important",
              },
            },
          "[data-id=youreCoveredMobileAppTable] > p": {
            paddingLeft: "1rem!important",
          },
          "[data-id=youreCoveredMobileAppTable]": {
            // width: '60%',
            "@media (max-width: 660px)": {
              width: "100%",
            },
            backgroundColor: "#FFF",
            paddingBottom: "2rem!important",
            display: "flex",
            flexDirection: "column",
            p: {
              marginTop: "0rem!important",
              marginBottom: "0rem!important",
              paddingTop: "0rem!important",
              paddingBottom: "0.5rem!important",
              gridColumn: "2",
              textAlign: "left",
              display: "flex",
              alignItems: "center",
              img: {
                marginTop: "0rem!important",
                marginBottom: "0rem!important",
                width: "110px",
              },
            },
            "p:nth-child(6) > a > img": {
              width: "120px",
            },
            "p:nth-child(2), p:nth-child(3), p:nth-child(4), p:nth-child(5)": {
              gridColumn: "1",
              img: {
                width: "32px",
                marginRight: "12px",
                height: "32px",
              },
            },
            "p:nth-child(1)": {
              display: "none",
            },
            "p:nth-child(2)": {
              gridRowStart: "2",
            },
            "p:nth-child(3)": {
              gridRowStart: "4",
            },
            "p:nth-child(4)": {
              gridRowStart: "6",
              justifyContent: "flex-start",
            },
            "p:nth-child(5)": {
              gridRowStart: "8",
              justifyContent: "flex-start",
            },
            // old 5
            "p:nth-child(6)": {
              justifyContent: "flex-start",
              paddingTop: "1rem!important",
              "a:nth-child(2)": {
                paddingLeft: "10px",
              },
            },
          },
          "#youreCovered-content-container-5 > p:nth-child(1) > strong": {},
          // download id cards button
          '[data-id="downloadIdCardsButton"]': {
            backgroundColor: "#FFF",
            padding: "0.25rem 1rem",
            marginBottom: "2rem",
          },
          "[data-id=downloadMobileAppSubHeader] > p:nth-child(1)": {
            fontWeight: "500",
            fontSize: "1.25rem",
            // padding: '1rem',
            paddingTop: "1rem",
            paddingBottom: "1rem",
          },
          '[data-id="downloadIdCardsButton"] > p > a': {
            border: "2px solid #DDEDFE",
            color: "#10193F",
            background: "#DDEDFE",
            minWidth: "240px",
            width: "fit-content",
            padding: "0.8rem 2rem",
            fontSize: "1rem",
            borderRadius: "5rem",
            display: "flex",
            flexDirection: "column",
            // margin: '0px auto',
            textAlign: "center",
          },
          // removed #chooseYourPackage-content-container-6
          '[data-id="selectedPackagesTabs"]': {
            marginLeft: "0px!important",
            paddingBottom: "40px!important",
            paddingTop: "2rem!important",
            // minWidth: '100%!important',
            h2: {
              textAlign: "left",
            },
            "p:nth-child(8), p:nth-child(6), p:nth-child(10)": {
              img: {
                width: "14px!important",
                marginTop: "0rem!important",
                marginBottom: "0rem!important",
                display: "inline-block",
              },
            },
            "p:nth-child(6), p:nth-child(8), p:nth-child(10)": {
              color: "#0033A0!important",
            },
            display: "grid",
            gridTemplateColumns: "45% 47%",
            gridAutoRows: "auto",
            alignItems: "start",
            gridRowGap: "2%",
            "grid-column-gap": "2%",
            p: {
              marginTop: "0rem!important",
              marginBottom: "0rem!important",
              paddingTop: "0rem!important",
              paddingBottom: "0rem!important",
              gridColumn: "2",
              textAlign: "left",
              img: {
                marginTop: "0rem!important",
                marginBottom: "0rem!important",
              },
              display: "flex",
              alignItems: "flex-start",
            },
            "p:nth-child(1)": {
              gridColumn: "1",
              gridRowStart: "1",
            },
            "p:nth-child(2)": {
              gridColumn: "1",
              gridRowStart: "2",
              gridRowEnd: "5",
            },
            "p:nth-child(3)": {
              "grid-column-start": "2",
              "grid-row": "1",
            },
            "p:nth-child(4)": {
              "grid-column-start": "2",
              "grid-row": "2",
            },
            "p:nth-child(5)": {
              "grid-column-start": "2",
              "grid-row": "3",
            },
            "p:nth-child(6)": {
              "grid-column-start": "2",
              "grid-row": "4",
            },
            "p:nth-child(7)": {
              "grid-column-start": "2",
              "grid-row": "5",
            },
            "p:nth-child(8)": {
              "grid-column-start": "2",
              "grid-row": "6",
            },
            "p:nth-child(9)": {
              "grid-column-start": "2",
              "grid-row": "7",
            },
            "p:nth-child(10)": {
              "grid-column-start": "2",
              "grid-row": "8",
            },
            "p:nth-child(3), p:nth-child(5), p:nth-child(7), p:nth-child(9)": {
              img: {
                width: "20px",
                paddingLeft: "1%",
              },
            },
            "p:nth-child(3)::before, p:nth-child(5)::before, p:nth-child(7)::before, p:nth-child(9)::before":
              {
                content: '""',
                backgroundImage:
                  'url("https://staging.embed.buddy.insure/allstate/auto/icons/crutches.png")',
                backgroundRepeat: "no-repeat",
                backgroundPosition: "left",
                display: "block",
                width: "60px",
                height: "50px",
              },
            "p:nth-child(5)::before": {
              backgroundImage:
                'url("https://staging.embed.buddy.insure/allstate/auto/icons/fenceBroken.png")',
            },
            "p:nth-child(7)::before": {
              backgroundImage:
                'url("https://staging.embed.buddy.insure/allstate/auto/icons/carBusted.png")',
            },
            "p:nth-child(9)::before": {
              backgroundImage:
                'url("https://staging.embed.buddy.insure/allstate/auto/icons/carFire.png")',
            },
            "p:nth-child(4), p:nth-child(6), p:nth-child(8), p:nth-child(10)": {
              paddingLeft: "60px!important",
              marginTop: "-28px!important",
            },
            "@media (max-width: 700px)": {
              display: "flex",
              flexDirection: "column",
              minWidth: "300px",
              paddingLeft: "1.5rem!important",
              paddingBottom: "20px!important",
              "p:nth-child(2)": {
                paddingBottom: "1rem!important",
              },
              "p:nth-child(4), p:nth-child(6), p:nth-child(8), p:nth-child(10)":
                {
                  marginTop: "-23px!important",
                },
              "p:nth-child(3)": {
                paddingTop: "1rem!important",
              },
              "p:nth-child(5)": {
                paddingTop: "1rem!important",
              },
              "p:nth-child(7)": {
                paddingTop: "1rem!important",
              },
              "p:nth-child(9)": {
                paddingTop: "1rem!important",
              },
            },
          },
          // hide content on chooseYourPackage
          // removed #chooseYourPackage-content-container-1, #chooseYourPackage-content-container-2, #chooseYourPackage-content-container-3, #chooseYourPackage-content-container-4
          '[data-id="whyDoINeedThis"], [data-id="learnWhyToggleField"], [data-id="whatRentersInsuranceCovers"], [data-id="customerInfoAndAddressTable"]':
            {
              display: "none!important",
            },
          "#paymentSelection-view-container": {
            textAlign: "left",
            ".view-title": {
              display: "none",
            },
          },
          "#policy-utility-compareOptionsToggle-checkbox-wrapper": {
            justifyContent: "center",
            paddingTop: "1rem",
          },
          "#policy-utility-compareOptionsToggle-checkbox-wrapper input[type=checkbox] + label::before":
            {
              borderRadius: "5rem!important",
              minWidth: "unset",
              color: "#0033A0",
              // content: "'compare options & coverages'",
              textDecoration: "none",
              fontSize: "0.8rem",
              fontWeight: "bold!important",
              paddingLeft: "30px",
              "@media (max-width: 990px)": {
                border: "none!important",
                fontSize: "13px!important",
                color: "#0033A0!important",
                fontWeight: "bold!important",
                paddingTop: "6px 10px",
              },
            },
          // '#policy-utility-compareOptionsToggle-checkbox-wrapper input[type=checkbox]:checked + label::before': {
          // 	content: "'close'",
          // 	color: '#000',
          // 	fontWeight: 'bold!important',
          // },
          "#policy-utility--checkbox-wrapper input[type=checkbox] + label:hover::before":
            {
              color: "rgb(69, 188, 229)!important",
              "@media (max-width: 990px)": {
                color: "rgb(69, 188, 229)!important",
              },
            },
          "#policy-personalPropertyCopy, #policy-personalPropertyCopy, #policy-youAndOthersCopy, #policy-addOnsCopy":
            {
              display: "none",
            },
          ".form-checkbox": {
            borderRadius: "4px",
            height: "24px",
            width: "24px",
          },
          "input[type=checkbox]:checked": {
            color: "#053361",
            backgroundColor: "rgb(14, 25, 65)",
          },
          "input[type=checkbox]:checked + .form-checkbox": {
            color: "red",
          },
          "input[type=radio]": {
            appearance: "none",
            "-webkit-appearance": "none",
            backgroundColor: "#fff",
            margin: 0,
            font: "inherit",
            color: "currentColor",
            display: "grid",
            placeContent: "center",
            width: "1.5rem",
            height: "1.5rem",
            backgroundClip: "content-box",
            border: "1px solid #6b7789",
            borderRadius: "50%",
          },
          "input[type=radio]:before": {
            content: "''",
            width: "1.5rem",
            height: "1.5rem",
            backgroundClip: "content-box",
            border: "1px solid #6b7789",
            backgroundColor: "#fff",
            transform: "scale(0)",
            borderRadius: "50%",
            pointerEvents: "none",
          },
          "input[type=radio]:checked:before": {
            backgroundColor: "#45bce5",
            transform: "scale(1)",
            border: ".4rem solid var(--color-primary)",
          },
          "input[type=radio]:focus": {
            outline: "max(2px, 0.15em) solid #45bce5",
            outlineOffset: "max(2px, 0.15em)",
          },
          ".progress-bar-container": {
            marginTop: "0 !important",
            marginBottom: "2.751rem !important",
          },
          "#customer-firstName-field-container, #customer-address-city-field-container, #customer-dob-field-container, #customer-phone-field-container, #firstName-field-container, #policy-spouseInfo-firstName-field-container, #customer-dob-field-container, #policy-spouseInfo-dateOfBirth-field-container, #firstName-field-container, #dateOfBirth-field-container, #policy-utility-leaseFinanceCompanyName-field-container, #policy-secondDriverNonSpouse-firstName-field-container, #policy-utility-leaseFinanceCompanyYear-field-container, #policy-utility-leaseFinanceCompanyNameSecondVehicle-field-container, #policy-utility-leaseFinanceCompanyYearSecondVehicle-field-container, #policy-utility-registeredOwnerSecondary-field-container, #policy-utility-registeredOwnerPrimary-field-container, #policy-vin-field-container, #policy-secondVehicle-vin-field-container":
            {
              "@media (min-width: 770px)": {
                width: "49%",
                display: "inline-grid",
                marginRight: "1%",
              },
            },
          "#secondConfirmDriverAndVehicleInfo-content-container-15, #vehicleVinOrSelect-content-container-2, #confirmDriverAndVehicleInfo-content-container-13":
            {
              "#policy-vin-field-container": {
                "@media (min-width: 770px)": {
                  width: "100%!important",
                },
              },
            },
          "#policy-vin-field-container": {
            marginRight: "0%",
            marginTop: "1%",
            "@media (min-width: 770px)": {
              marginTop: "0%",
            },
          },
          // 'label[for=policy-utility-leaseFinanceCompanyName], label[for=policy-utility-leaseFinanceCompanyNameSecondVehicle], label[for=policy-utility-leaseFinanceCompanyYear], label[for=policy-utility-leaseFinanceCompanyYearSecondVehicle]': {
          // 	display: 'flex',
          // 	flexDirection: 'row',
          // 	'span > span': {
          // 		display: 'flex',
          // 		flexDirection: 'column',
          // 		fontWeight: '400',
          // 	},
          // },
          "[data-id=additionalDetailsSubHeader], [data-id=emailPhoneFieldsContainer], [data-id=tCPAConsentFieldContainer], [data-id=tCPAConsentFieldContainerTwo]":
            {
              backgroundColor: "#FFF",
              padding: "0.5rem 1rem",
            },
          "[data-id=additionalDetailsSubHeader] > h3": {
            color: "var(--color-primary)!important",
            borderBottom: "1px solid #BCC5D2",
            paddingBottom: "0.75rem",
            paddingTop: "1.5rem!important",
          },
          "[data-id=coverageDetailsFinalReview]": {
            backgroundColor: "#FFF",
            padding: "0.5rem 1rem",
          },
          "[data-id=coverageDetailsFinalReview] > p": {
            backgroundImage:
              'url("https://staging.embed.buddy.insure/allstate/auto/icons/carGood.png")',
            backgroundSize: "52px",
            backgroundPosition: "left",
            paddingLeft: "65px",
            backgroundRepeat: "no-repeat",
            display: "grid",
          },
          "[data-id=summarySubHeader], [data-id=summaryContents], [data-id=downloadMobileAppSubHeader]":
            {
              backgroundColor: "#FFF",
              padding: "0.25rem 1rem",
              p: {
                marginTop: "0rem!important",
                marginBottom: "0rem!important",
                textTransform: "capitalize",
              },
            },
          "#finalReview-content-container-32": {
            p: {
              textTransform: "unset!important",
            },
          },
          "[data-id=verticalSpacerTop], [data-id=verticalSpacerBottom], [data-id=horizontalLine], [data-id=horizontalLineFullWidthWhiteBackground]":
            {
              backgroundColor: "#FFF",
            },
          "[data-id=horizontalLine]": {
            maxWidth: "unset!important",
          },
          "[data-id=horizontalLineFullWidthWhiteBackground]": {
            height: "1px",
            marginTop: "0rem!important",
            marginBottom: "0rem!important",
            backgroundColor: "#E4E8EC",
            paddingRight: "1rem",
            paddingLeft: "1rem",
            maxWidth: "unset!important",
          },
          "[data-id=verticalSpacerTop]": {
            paddingTop: "1rem",
          },
          "[data-id=verticalSpacerBottom]": {
            paddingBottom: "1rem",
          },
          "#policy-utility-tCPAConsent-checkbox-wrapper": {
            display: "flex",
            "align-items": "flex-start",
            // borderTop: '1px solid var(--color-primary)',
            paddingTop: "0.75rem",
          },
          "#policy-utility-tCPAConsent-true": {
            marginTop: "0.25rem",
          },
          "#policy-utility-tCPAConsent-field-container": {
            padding: "1rem",
            marginTop: "-1rem!important",
            // backgroundColor: '#ececec',
            paddingLeft: "0rem!important",
          },
          "#policy-utility-tCPAConsent-field-container > p.input-error": {
            display: "none",
          },
          "[data-id=tCPAConsentFieldContainer], [data-id=tCPAConsentFieldContainerTwo]":
            {
              paddingLeft: "0rem!important",
              backgroundColor: "unset!important",
            },
          "[data-id=tCPAConsentFieldContainerTwo]": {
            padding: "1rem!important",
            backgroundColor: "#FFF!important",
          },
          "#customer-lastName-field-container, #customer-address-state-field-container, #policy-renters-address-state-field-container, #customer-email-field-container, #policy-utility-accountTypeCode-field-container, #policy-utility-routingNumber-field-container, #policy-utility-accountFirstName-field-container, #policy-utility-accountLastName-field-container, #policy-utility-accountNumber-field-container, #policy-utility-accountNumberConfirmation-field-container, #policy-spouseInfo-lastName-field-container, #policy-suffix-field-container, #policy-spouseInfo-suffix-field-container, #lastName-field-container, #suffix-field-container, policy-utility-leaseFinanceCompanyYear-field-container":
            {
              "@media (min-width: 770px)": {
                width: "49%",
                display: "inline-grid",
              },
            },
          "#customer-email-field-container": {
            marginRight: "0%",
            "@media (min-width: 770px)": {
              marginRight: "1%",
            },
          },
          // policy-driverLicenseNumber-field-container
          "#policy-driverLicenseNumber-field-container, #policy-spouseInfo-spouseDriverLicenseNumber-field-container, #policy-secondDriverNonSpouse-driverLicenseNumber-field-container":
            {
              "@media (min-width: 770px)": {
                width: "59%",
                display: "inline-grid",
                marginRight: "1%",
              },
            },
          "#policy-driverLicenseState-field-container, #policy-spouseInfo-spouseDriverLicenseState-field-container, #policy-secondDriverNonSpouse-driverLicenseState-field-container":
            {
              "@media (min-width: 770px)": {
                width: "40%",
                display: "inline-grid",
              },
            },
          "#policy-driverLicenseNumber-field-container, #policy-spouseInfo-spouseDriverLicenseNumber-field-container, #policy-utility-registeredOwnerPrimary-field-container, #policy-utility-leaseFinanceCompanyName-field-container, #policy-utility-leaseFinanceCompanyYear-field-container, #policy-utility-registeredOwnerSecondary-field-container, #policy-utility-leaseFinanceCompanyNameSecondVehicle-field-container, #policy-utility-leaseFinanceCompanyYearSecondVehicle-field-container":
            {
              marginTop: "0.5rem!important",
              "@media (max-width: 770px)": {
                marginTop: "0rem!important",
                paddingTop: "1rem!important",
              },
            },
          "#driverVehicleRegOwnerLease-content-container-32": {
            marginTop: "1px!important",
          },
          // '': {
          // 	'@media (max-width: 770px)': {
          // 		paddingTop: '1rem!important',
          // 	},
          // },
          "#customer-firstName-field-container, #customer-lastName-field-container, #firstName-field-container, #lastName-field-container, #policy-spouseInfo-firstName-field-container, #policy-spouseInfo-lastName-field-container, #customer-address-city-field-container, #customer-address-state-field-container, #policy-secondDriverNonSpouse-firstName-field-container, #policy-secondDriverNonSpouse-lastName-field-container":
            {
              "@media (min-width: 770px)": {
                width: "40%",
                display: "inline-grid",
                marginRight: "1%",
              },
            },
          "#policy-suffix-field-container, #suffix-field-container, #policy-spouseInfo-suffix-field-container, #customer-address-postalCode-field-container, #policy-secondDriverNonSpouse-suffix-field-container":
            {
              "@media (min-width: 770px)": {
                width: "17%",
                display: "inline-grid",
                marginLeft: "0%",
              },
            },
          "#policy-utility-accountNumber-field-container, #policy-utility-routingNumber-field-container":
            {
              backgroundPosition: "left bottom",
              backgroundSize: "238px",
              backgroundRepeat: "no-repeat",
              paddingBottom: "35px",
              backgroundImage:
                'url("https://staging.embed.buddy.insure/allstate/renters/icons/routingNew.png")',
            },
          "#policy-utility-accountNumber-field-container": {
            backgroundImage:
              'url("https://staging.embed.buddy.insure/allstate/renters/icons/accountNumber.png")',
          },
          "#policy-utility-accountLastName-field-container, #policy-utility-accountNumber-field-container, #policy-utility-accountTypeCode-field-container":
            {
              "@media (min-width: 770px)": {
                marginLeft: "1%",
              },
            },
          "#customer-address-line1-field-container, #policy-renters-address-line1-field-container, #line1-field-container":
            {
              marginTop: "0.75rem!important",
              paddingTop: "1rem!important",
              "@media (min-width: 770px)": {
                width: "100%",
                display: "inline-grid",
                marginRight: "1%",
              },
            },
          "#policy-renters-address-line1-field-container, #customer-address-line1-field-container":
            {
              marginTop: "0rem!important",
            },
          "#line1-field-container": {
            "@media (min-width: 770px)": {
              width: "71%",
              marginRight: "1%",
            },
          },
          "#customer-firstName-field-container, #customer-lastName-field-container, #customer-dob-field-container, #customer-email-field-container, #customer-phone-field-container":
            {
              marginTop: "0.75rem!important",
            },
          "#additionalDetailsPersons-content-container-7 > #customer-email-field-container":
            {
              marginTop: "0rem!important",
              paddingTop: "1rem!important",
            },
          "#customer-address-line2-field-container, #policy-renters-address-line2-field-container, #line2-field-container":
            {
              marginTop: "0.7rem!important",
              "@media (min-width: 770px)": {
                width: "100%",
                display: "inline-grid",
                marginLeft: "0%",
              },
            },
          "#line2-field-container": {
            "@media (min-width: 770px)": {
              width: "28%",
            },
          },
          // '#customer-address-city-field-container, #customer-address-state-field-container, #policy-renters-address-city-field-container, #policy-renters-address-state-field-container, #city-field-container, #state-field-container': {
          // 	marginTop: '0.75rem!important',
          // 	'@media (min-width: 770px)': {
          // 		width: '50%',
          // 		display: 'inline-grid',
          // 		marginRight: '1%',
          // 	},
          // },
          // '#customer-address-state-field-container, #policy-renters-address-state-field-container, #state-field-container': {
          // 	'@media (min-width: 770px)': {
          // 		width: '49%',
          // 		marginRight: '0%',
          // 	},
          // },
          // '#customer-address-postalCode-field-container, #policy-renters-address-postalCode-field-container': {
          // 	marginTop: '0.75rem!important',
          // 	width: '100%',
          // 	'@media (min-width: 770px)': {
          // 		width: '50%',
          // 		display: 'inline-grid',
          // 		marginLeft: '0%',
          // 	},
          // },
          // '#postalCode-field-container': {
          // 	width: '100%',
          // 	'@media (min-width: 770px)': {
          // 		width: '50%',
          // 	},
          // },
          ".field-container": {
            marginTop: "1rem!important",
            "@media (min-width: 770px)": {
              marginTop: "1rem!important",
            },
          },
          ".tooltip": {
            backgroundColor: "red!important",
          },
          ".tooltip-text": {
            top: "20px!important",
            marginLeft: "0vw",
            maxWidth: "60vw",
            backgroundColor: "#ececec",
            color: "#333",
            fontWeight: "normal",
            padding: "20px",
            "@media (max-width: 770px)": {
              marginLeft: "-10vw",
              maxWidth: "60vw",
            },
          },
        },
        ".tooltip": {
          backgroundColor: "red!important",
        },
        ".progress-bar": {
          backgroundColor: "var(--color-secondary)",
        },
        ".input-text, .input-select": {
          color: "#333",
          borderRadius: 0,
        },
        ".input-select:focus, .input-text:focus": {
          outline: "0.15rem solid #45bce5",
          "border-color": "#0e1941",
        },
        ".input-label": {
          color: "var(--color-primary)",
          accentColor: "#0E1941",
          fontSize: ".9rem",
          fontWeight: "700",
          lineHeight: "1.25rem",
          fontFamily: "Inter,Arial,Helvetica,sans-serif",
          "@media (max-width: 900px)": {
            fontSize: ".9rem",
          },
          "@media (max-width: 770px)": {
            fontSize: ".9rem",
          },
        },
        h2: {
          color: "#2F3847!important",
          fontSize: "1.5rem!important",
          lineHeight: "1.75rem!important",
          fontWeight: "400!important",
          fontFamily: "Inter,Arial,Helvetica,sans-serif",
          transform: "scaleY(0.95)",
          letterSpacing: "-0.05rem",
          "@media(min-width:660px)": {
            fontSize: "1.75rem!important",
            lineHeight: "2rem!important",
            fontWeight: "400!important",
          },
        },
        h3: {
          // color: '#0033A0!important',
          fontSize: "1.25rem",
          fontFamily: "Inter,Arial,Helvetica,sans-serif",
          fontWeight: "bold!important",
        },
        p: {
          fontSize: ".95rem",
          fontFamily: "Inter,Arial,Helvetica,sans-serif",
          lineHeight: "1.25em!important",
        },
        ".input-error": {
          marginTop: "0rem!important",
          marginBottom: "0rem!important",
        },
        li: {
          fontSize: ".85rem",
          color: "var(--color-text-primary)!important",
          lineHeight: "1.25rem",
          fontFamily: "Inter,Arial,Helvetica,sans-serif",
          marginLeft: "2rem",
        },
        ".array-items-container": {
          backgroundColor: "transparent!important",
          padding: "1rem",
          paddingLeft: "0rem!important",
          width: "80%",
          transform: "none!important",
          "@media (max-width: 660px)": {
            width: "100%",
          },
        },
        ".array-item-remove-button": {
          padding: "0.75rem 0.125rem",
        },
        "label[for=policy-utility-addNonRelatives], label[for=policy-utility-addLandlordOrPM]":
          {
            // display: 'none',
            visibility: "hidden",
            position: "absolute!important",
          },
        "#additionalDetailsPersons-content-container-2 > #policy-utility-addNonRelatives-field-container, #additionalDetailsPersons-content-container-4 > #policy-utility-addLandlordOrPM-field-container":
          {
            marginTop: "0rem!important",
            marginBottom: "0rem!important",
          },
        "#additionalDetailsPersons-content-container-2, #additionalDetailsPersons-content-container-3, #additionalDetailsPersons-content-container-4, #additionalDetailsPersons-content-container-5":
          {
            backgroundColor: "#FFF",
            padding: "1rem 1.5rem",
            ".array-items-container": {
              backgroundColor: "transparent!important",
              width: "100%",
              marginTop: "0.25rem!important",
              marginBottom: "0.25rem!important",
            },
          },
        "#additionalDetailsPersons-content-container-2, #additionalDetailsPersons-content-container-4":
          {
            p: {
              marginTop: "0rem!important",
              marginBottom: "0rem!important",
            },
          },
        "#additionalDetailsPersons-content-container-3, #additionalDetailsPersons-content-container-5":
          {
            padding: "1rem 1.5rem",
            marginTop: "-1rem!important",
            paddingTop: "-1rem",
            ".array-items-container": {
              margin: "0rem!important",
              padding: "0rem!important",
              "@media (max-width: 660px)": {},
            },
            "div > span": {
              display: "none",
            },
          },
        // remove animation from ARRAY element
        "#additionalDetailsPersons-content-container-3 > .array-items-container > div, #additionalDetailsPersons-content-container-5 > .array-items-container > div":
          {
            transform: "none!important",
          },
        // '.array-editor-buttons-container > .array-editor-cancel-button::after': {
        // 	content: '" (cancel)"',
        // },
        // '#policy-utility-nonRelativesArray-array-container > .array-items-add-button::after': {
        // 	content: '"  a non-relative"',
        // 	paddingLeft: '6px',
        // },
        // '#policy-utility-landlordOrPMArray-array-container > .array-items-add-button::after': {
        // 	content: '"  a landlord or PMC"',
        // 	paddingLeft: '6px',
        // 	textTransform: 'none!important',
        // },
        // '#additionalDetailsPersons-content-container-3, #additionalDetailsPersons-content-container-5': {
        // 	marginTop: '-1rem!important',
        // },
        "#policy-utility-nonRelativesArray-array-container > p.input-label, #policy-utility-landlordOrPMArray-array-container > p.input-label":
          {
            marginTop: "0rem!important",
            marginBottom: "0rem!important",
          },
        "#policy-utility-landlordOrPMArray-array-container > div > .array-item-remove-button":
          {
            paddingTop: "0rem!important",
          },
        ".array-fields-container": {
          marginTop: "0rem!important",
        },
        ".array-item-pill-container": {
          transform: "none!important",
          display: "flex",
          justifyContent: "space-between",
          "@media (min-width: 600px)": {
            width: "100%",
          },
          div: {
            width: "100%!important",
            textAlign: "left!important",
          },
          "div > p": {
            display: "block",
            marginTop: "0rem!important",
            marginBottom: "0rem!important",
            fontSize: "0.85rem!important",
            fontWeight: "400!important",
            strong: {
              fontSize: "1rem!important",
              display: "block",
              paddingBottom: "0.5rem!important",
              textTransform: "capitalize",
            },
          },
        },
        ".array-items-label": {
          display: "none",
        },
        ".array-item-pill": {
          display: "flex",
          flexDirection: "row-reverse",
          minWidth: "97%!important",
          border: "none!important",
          borderLeft: "5px rgb(69, 188, 229) solid!important",
          borderRadius: "unset!important",
        },
        ".array-items-add-button": {
          minWidth: "400px!important",
          "@media (max-width: 660px)": {
            width: "100%!important",
            minWidth: "100%!important",
          },
        },
        ".item-pill-edit-button": {
          marginLeft: "0.75rem",
        },
        "#additionalDetailsPersons-view-container": {
          textAlign: "left",
          ".nav-button-container": {
            flexDirection: "column",
            "@media (min-width: 770px)": {
              flexDirection: "row!important",
            },
            ".button-primary": {},
          },
        },
        "#offerScreenInfoMissing-view-container > #nav-button-container > #next-button, #offerScreenInfoMissing-view-containerBumpOut > #nav-button-container > #next-button":
          {
            maxWidth: "unset",
          },
        "#nav-button-container": {
          marginBottom: "1rem!important",
          "@media (max-width: 480px)": {
            // background: 'rgb(242,250,254)',
            // background: '-moz-linear-gradient(180deg, rgba(242,250,254,0) 0%, rgba(242,250,254,0.5) 34%, rgba(242,250,254,1) 67%)',
            // background: '-webkit-linear-gradient(180deg, rgba(242,250,254,0) 0%, rgba(242,250,254,0.5) 34%, rgba(242,250,254,1) 67%)',
            background:
              "linear-gradient(180deg, rgba(242,250,254,0) 0%, rgba(242,250,254,0.5) 34%, rgba(242,250,254,1) 67%)",
            filter:
              'progid:DXImageTransform.Microsoft.gradient(startColorstr="#f2fafe",endColorstr="#f2fafe",GradientType=1)',
            marginTop: "1rem!important",
            // transform: 'translateX(-50%) translateY(0)',
            // left: '50%',
            // position: 'fixed',
            // backgroundColor: '#F2FAFE',
          },
        },
        '[id*="BELOW_NAV"]': {
          "@media (max-width: 660px)": {
            // paddingTop: '100px!important',
            // backgroundColor: '#F2FAFE',
          },
        },
        "#paymentIsACH-content-container-3 > p": {
          color: "#D62719",
        },
        "#policy-utility-accountNumberConfirmationRule-field-container": {
          marginTop: "0rem!important",
        },
        "#policy-utility-accountNumberConfirmationRule-field-container > .input-error":
          {
            display: "none",
          },
        "#additionalDetailsPersons-content-container-2 > div > div, #additionalDetailsPersons-content-container-4 > div > div, #policy-utility-nonRelativesArray-array-container, #policy-utility-landlordOrPMArray-array-container, #additionalDetailsPersons-view-container > div.array-items-container > div, .translate-x-0, .array-items-container, .array-item-pill-container, .array-editor-container":
          {
            transform: "none!important",
          },
        body: {
          fontFamily: "Inter,Arial,Helvetica,sans-serif",
          color: "rgb(47, 56, 71)",
        },
        ".button-primary": {
          maxWidth: "230px",
          textTransform: "lowercase",
          border: "0.25rem solid var(--color-secondary)",
          borderRadius: "5rem !important",
          background: "var(--color-secondary)",
          padding: ".75rem 1.125rem",
          color: "var(--color-text-primary)",
          "&:hover": {
            backgroundColor: "#fff",
            backgroundImage: "unset",
            color: "var(--color-text-primary)",
          },
          "&:focus": {
            color: "var(--color-textPrimary)",
            padding: ".625rem 1rem",
            boxShadow: "0 0 0 6px #45bce5, inset 0 0 0 2px #00c39c",
            border: "0.25rem solid #fff",
            backgroundColor: "#fff",
          },
          "@media (min-width: 770px)": {
            minWidth: "unset",
          },
        },
        ".button-secondary": {
          border: "1px solid #b9c6d3",
          background: "#fff!important",
          maxWidth: "230px",
          color: "var(--color-text-primary)",
          padding: ".75rem 1.125rem",
          "&:hover": {
            backgroundColor: "#f3f6f9!important",
            color: "var(--color-primary)",
            textDecoration: "none",
          },
          "&:focus": {
            color: "var(--color-textPrimary)",
            padding: ".625rem 1rem",
            boxShadow: "0 0 0 6px #45bce5, inset 0 0 0 2px #00c39c",
            border: "0.25rem solid #fff",
            backgroundColor: "#fff",
          },
        },
        button: {
          textTransform: "lowercase",
          backgroundColor: "#fff",
          fontWeight: "bold",
          fontSize: "16px",
          lineHeight: "1",
          padding: ".75rem 1.125rem",
          color: "#999",
          transition: "background-color .1s ease 0s",
          borderRadius: "5rem",
        },
        ".radio-button-wrapper": {
          marginTop: "10px!important",
        },
        ".required-asterisk, .input-error": {
          color: "#D7234A!important",
        },
      },
      colors: {
        primary: "rgb(14,25,65)",
        secondary: "rgb(0,195,156)",
        textPrimary: "#383F4C",
        backgroundPrimary: "#ffffff",
        backgroundSecondary: "#F2F6F9",
      },
      webFonts: [
        "https://fonts.googleapis.com/css2?family=Inter:wght@100;400;500;600&family=Nunito:ital,wght@0,200..1000;1,200..1000&display=swap",
      ],
    },
  },
};
