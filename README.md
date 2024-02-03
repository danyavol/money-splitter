# Money Splitter

This is Android/IOS/browser app which helps to split bills in a group of people.

[Google Play](https://play.google.com/store/apps/details?id=danyavol.moneysplitter)

## Pre-requisites

- `Android Studio`. Don't try to install all android-related drivers manually, just install Android Studio, it doesn't worth it.. Without Android Studio you will only be able to debug the app in browser.
- `Node 14.20.x, 16.13.x or 18.10.x`
- `Android Debug Bridge (ADB)` if you would like to test the app on your own phone, not just emulator

## Start application

1) Copy files from **Github - Settings - Environments - dev** to:

   - `src/environments/environment.prod.ts`
   - `src/environments/environment.ts`

2) Instal dependencies `npm install`
   
3) I don't know exact steps to start the app, it is hell every time... Try to play with these commands:

   - `npm run build`
   - `npx cap copy` - (Copy required files to android folder)
   - `npx ionic capacitor run android -l --external` - (Start emulator)

4) Also you may try to open project in Android Studio, build and run app from there:
   
   - `npx cap open android` 

## Debug on your own phone

### Via WiFi

1) Enable Debug mode `Settings - System - Developer Options - Wireless debugging`
2) Click at `Wireless debugging` and then `Pair device with QR code`
3) Open `Android Studio - Devices - Pair Devices Using Wi-Fi`
4) Scan `QR code` with your mobile phone
5) After pairing you may need to click `Connect`
6) Deploy app to your mobile phone using `Run app` button in Android Studio or using command `npx ionic capacitor run android -l --external`

### Via USB

1) Enable Debug mode at `Settings - System - Developer Options - USB debugging`
2) Connect your phone to PC using `USB cable`
3) Deploy app to your mobile phone using `Run app` button in Android Studio or using command `npx ionic capacitor run android -l --external`

## Environments

Note that there are two environments DEV and PROD. At your mobile phone you may install both of them and they will be treated as independent applications with separate storage and so on..

It means that you can run `npm run start-android--win` (`--macOS`) and do what every you want with this app, production app with real data will be untouched.

Just make sure that the application has "DEV" prefix in the name and "DEV" icon.

![dev env](https://github.com/danyavol/money-splitter/assets/48417874/4e593384-aa49-4b0e-acc0-a0ed0b970295)

