![](https://buddy.insure/static/118333b8a6b5251d6016a19b6c5b5402/47498/buddy-banner.jpg)

# Partner Testing Playground

## Stack

- React-Native (Expo)
- [Nativewind](https://www.nativewind.dev/v4/overview) + [RNR](https://rnr-docs.vercel.app/)


## Deployment

This app is built and packaged using Expo Application Services (EAS). The eas.json file at the repo root defines four build profiles: ios-simulator, development, preview, and production. The ios-simulator profile creates an internal-distribution, development-client build targeting the iOS simulator. The development and preview profiles also use internal distribution (with a development client for development) and set the APP_VARIANT environment variable to development and preview respectively, publishing to the matching EAS update channel of the same name. The production profile builds for internal distribution on the production channel.

Builds are triggered directly with the EAS CLI, for example eas build --profile production; there is no dedicated npm or yarn script that wraps this command. The eas-build-pre-install script in package.json (npm config set legacy-peer-deps true) is run automatically by EAS Build before dependencies are installed, but it is not something a developer runs manually.

App store submission is also configured: eas.json declares a production profile under submit, so a production build can be submitted with eas submit --profile production. That profile is currently empty in the repo, meaning it relies on EAS's default submission flow (interactive credentials and prompts) rather than any store-specific configuration checked into source control.

Finally, app.config.js ties the app to the buddy-technology EAS account and a specific EAS project (a fixed projectId, and an updates.url pointing at u.expo.dev) with runtimeVersion set to 1.0.0. Combined with the expo-updates dependency in package.json, this means the app also supports over-the-air updates via eas update, separate from full native builds through eas build.

