# chat-app

## Set up

yarn install (this will install all necessary libraries needed for this project)

### Expo

Expo makes it very helpful to develop and test your work.

using yarn (or npm), install this globally:

1. `yarn add global expo-cli`
2. download the Expo app on your phone.
3. You will need to set up an account on Expo.
4. once that's done, you can start using it to create react native apps:)

start create and start your project:

1. `expo init [app-name]`
   - answer the questions that come up (I believe the defaults are what I used for this)
2. `expo start` (this will open up a new tab in your browser)
3. Open up your phone and your point your camera towards the QR code scanner. This will send some kind of notification message on your phone which will open up expo and show your app on your phone.

### You can also use the following simulators/emulators to help with your development/testing.

#### IOS Simulator:

You need xcode, (only available on Mac), which can be downloaded from the [App Store](https://itunes.apple.com/app/xcode/). Follow the instructions to complete the set up.

#### Android Emulator

Download [Android Studo](https://docs.expo.io/versions/v32.0.0/workflow/android-studio-emulator/). Follow the instructions.

note: you need to add the Android SDK to your path in one of your bash files. It should look something like this:

`export ANDROID_SDK=/Users/[myuser]/Library/Android/sdk`

if you're a Mac user, you also need to export the following line:

`export PATH=/Users/[myuser]/Library/Android/sdk/platform-tools:$PATH`

note: replace "myuser" with your own username (without the brackets).

Open up the Android Studio and follow these steps:

1. click "Configure"
2. select "AVD Manager"
3. click "Create Virtual Device
4. choose a device from the list
5. click "Next"
6. click "Recommended"
7. select an OS & click the corresponding "Download" link
8. click finish once the download is complete
9. click "Play" on the Virtual Device Manager
10. (assuming you're project is running with yarn start etc, which will open up an expo page in the browser), click on "Run on Android device/emulator"

### Images in your chat app

if you want to save/send images, you need to set up a database. For this app, we are using firestore.

1. set up a database called "messages"
2. click the "Authentication" tab on the left
3. click on the "Sign-in method" tab
4. scroll down to the "Anonymous" and enable this option (note: the app won't correctly if this not enabled)
5. make sure you to add your firestore creds to the app. It will look something like this:

```
components/Chat.js

const firebase = require("firebase");
require("firebase/firestore");


firebase.initializeApp({
  apiKey: "xxxxx",
  authDomain: "xxxx.firebaseapp.com",
  databaseURL: "https://xxxx.firebaseio.com",
  projectId: "xxxxx",
  storageBucket: "xxxx.appspot.com",
  messagingSenderId: "xxxxx",
  appId: "xxxx",
  measurementId: "xxxx"
});

```
