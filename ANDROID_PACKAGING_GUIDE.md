# सवेरा 24 न्यूज़ - Android Packaging & Google Play Deployment Guide

इस गाइड में **सवेरा 24 न्यूज़** वेब ऐप को एक प्रामाणिक Android ऐप्लिकेशन (`.apk` / `.aab`) में बदलने की पूरी प्रक्रिया दी गई है।

आप दो सबसे लोकप्रिय और Google द्वारा समर्थित विधियों में से किसी एक का उपयोग कर सकते हैं:
1. **विधि 1: Capacitor (अनुशंसित - पूर्ण नेटिव Android ऐप)**
2. **विधि 2: Trusted Web Activity (TWA - Google Bubblewrap CLI)**

---

## 📋 पूर्व-आवश्यकताएं (Prerequisites)

अपने कंप्यूटर (Windows, macOS या Linux) पर निम्नलिखित सॉफ़्टवेयर इंस्टॉल करें:
1. **Node.js** (v18 या नया) और **npm**
2. **Android Studio** (Hedgehog या नया) Android SDK और Command Line Tools के साथ
3. **Java Development Kit (JDK 17 या 21)**

---

## 🚀 विधि 1: Capacitor के साथ Android ऐप बनाना (अनुशंसित)

Capacitor आपके वेब ऐप को एक संपूर्ण नेटिव Android स्टूडियो प्रोजेक्ट में बदल देता है।

### चरण 1: Capacitor पैकेज इंस्टॉल करें
प्रोजेक्ट की रूट डायरेक्टरी में टर्मिनल खोलें:

```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
```

### चरण 2: Capacitor को इनिशियलाइज़ करें

```bash
npx cap init "Savera 24 News" "in.savera24news.app" --web-dir dist
```

- **App Name:** `Savera 24 News`
- **App ID (Package Name):** `in.savera24news.app`
- **Web Asset Directory:** `dist`

### चरण 3: वेब ऐप का प्रोडक्शन बिल्ड बनाएं

```bash
npm run build
```

### चरण 4: Android प्लेटफ़ॉर्म जोड़ें और कोड सिंक करें

```bash
npx cap add android
npx cap sync android
```

### चरण 5: Android Studio में प्रोजेक्ट खोलें

```bash
npx cap open android
```

Android Studio स्वतः Gradle सिंक करेगा और आपके सामने नेटिव Android कोड आ जाएगा।

---

## 🌐 विधि 2: Trusted Web Activity (TWA) और Bubblewrap से पैकेजिंग

Google का आधिकारिक Bubblewrap टूल आपके PWA को सीधे Google Play Store कंपैटिबल AAB में बदल देता है।

### चरण 1: Bubblewrap इंस्टॉल करें

```bash
npm install -g @bubblewrap/cli
```

### चरण 2: PWA मैनिफेस्ट से प्रोजेक्ट इनिशियलाइज़ करें

```bash
bubblewrap init --manifest https://www.savera24news.in/manifest.json
```

Bubblewrap आपसे ऐप का नाम, पैकेज नेम (`in.savera24news.twa`), और कीस्टोर का विवरण पूछेगा।

### चरण 3: TWA बिल्ड करें

```bash
bubblewrap build
```
इससे आपको `app-release-signed.aab` फ़ाइल मिल जाएगी।

---

## 🔑 सुरक्षित Keystore बनाना (Generate Signing Keystore)

Google Play Store में ऐप पब्लिश करने के लिए आपको एक निजी डिजिटल हस्ताक्षर (Signing Keystore) की आवश्यकता होती है।

टर्मिनल में यह कमांड चलाएं:

```bash
keytool -genkey -v -keystore savera24-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias savera24-key
```

- आपसे पासवर्ड, आपका नाम और संगठन (Savera 24 News) पूछा जाएगा।
- **सावधानी:** `savera24-release-key.jks` फ़ाइल और उसका पासवर्ड सुरक्षित रखें। इसे कभी न खोएं, क्योंकि भविष्य के ऐप अपडेट इसी की से साइन होंगे।

---

## ⚙️ Android Studio में Signing Config सेट करना

`android/app/build.gradle` फ़ाइल खोलें और `android { ... }` ब्लॉक के अंदर यह जोड़ें:

```groovy
android {
    ...
    defaultConfig {
        applicationId "in.savera24news.app"
        minSdkVersion 22
        targetSdkVersion 34
        versionCode 1
        versionName "1.0.0"
    }

    signingConfigs {
        release {
            storeFile file("../../savera24-release-key.jks")
            storePassword "YOUR_KEYSTORE_PASSWORD"
            keyAlias "savera24-key"
            keyPassword "YOUR_KEY_PASSWORD"
        }
    }

    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

---

## 🏗️ Signed Android App Bundle (.aab) का निर्माण

Google Play Console अब सिर्फ `.aab` (Android App Bundle) स्वीकार करता है।

### कमांड लाइन से बिल्ड करने का तरीका:

```bash
cd android
./gradlew bundleRelease
```

बिल्ड पूरा होने पर आपकी साइन की हुई AAB फ़ाइल यहाँ मिलेगी:
`android/app/build/outputs/bundle/release/app-release.aab`

### Android Studio GUI से बिल्ड करने का तरीका:
1. Android Studio में ऊपर मेनू से **Build** > **Generate Signed Bundle / APK...** चुनें।
2. **Android App Bundle** चुनें और **Next** पर क्लिक करें।
3. अपनी `savera24-release-key.jks` फ़ाइल का पाथ और पासवर्ड डालें।
4. **release** विकल्प चुनें और **Create** दबाएं।

---

## 📲 Google Play Console पर पब्लिश करना (Play Store Deployment)

1. [Google Play Console](https://play.google.com/console/) पर अपने डेवलपर खाते से लॉगिन करें।
2. **Create App** बटन दबाएं:
   - **App Name:** `सवेरा 24 न्यूज़ - सच की राह सवेरा के साथ`
   - **Default Language:** `Hindi (hi-IN)`
   - **App or Game:** `App`
   - **Free or Paid:** `Free`
3. **App Dashboard > Set up your app:**
   - **Privacy Policy URL:** `https://www.savera24news.in/`
   - **Content Rating:** न्यूज़ ऐप (General)
   - **Target Audience:** 13+ या सामान्य पाठक
   - **News App Declaration:** "Yes, this is a News App" चुनें और आवश्यक क्रेडेंशियल व संपर्क जानकारी भरें।
4. **App Store Listing:**
   - **Short Description:** सच की राह सवेरा के साथ। छत्तीसगढ़ और महासमुंद की ताज़ा खबरें।
   - **Full Description:** सवेरा 24 न्यूज़ का आधिकारिक ऐप।
   - **App Icon:** `512x512` PNG (प्रोजेक्ट की `public/pwa-512x512.png` का उपयोग करें)
   - **Feature Graphic:** `1024x500` बैनर
   - **Screenshots:** कम से कम 2-4 मोबाइल स्क्रीनशॉट
5. **Release Management > Internal Testing / Production:**
   - तैयार की गई `app-release.aab` फ़ाइल अपलोड करें।
   - **Save & Review Release** पर क्लिक करें।
   - **Roll out to Production** दबाकर Google Review के लिए सबमिट करें।

Google टीम द्वारा 2-3 कार्यदिवसों में समीक्षा पूरी होने के बाद आपका ऐप Google Play Store पर लाइव हो जाएगा!
