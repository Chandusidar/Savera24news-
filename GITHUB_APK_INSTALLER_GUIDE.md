# 📦 सवेरा 24 न्यूज़ - GitHub APK Package Installer गाइड

यह गाइड आपको बताती है कि आप इस कोडिंग ऐप को **GitHub** पर कैसे अपलोड करें ताकि **GitHub Actions** स्वतः ही आपके लिए एक **Android APK Package Installer** (`.apk`) तैयार कर दे, जिसे कोई भी अपने Android फ़ोन में सीधे डाउनलोड और इंस्टॉल कर सके।

---

## 🚀 GitHub Actions से ऑटोमैटिक APK कैसे बनेगा?

इस प्रोजेक्ट में पहले से ही **`.github/workflows/build-apk.yml`** फ़ाइल और **Capacitor Android** कॉन्फ़िगरेशन सेट है।
जब भी आप इस कोड को GitHub पर पुश करेंगे:
1. GitHub क्लाउड में स्वतः Java 17, Android SDK और Node.js का वातावरण तैयार करेगा।
2. वेब ऐप को कंपाइल करेगा (`npm run build`)।
3. Capacitor Android प्रोजेक्ट को सिंक करेगा।
4. Gradle के ज़रिए सीधे **`Savera24News-Installer.apk`** बिल्ड करेगा।
5. GitHub Actions Artifacts और GitHub Releases में डाउनलोड करने योग्य **APK पैकेज इंस्टॉलर** उपलब्ध करा देगा!

---

## 🛠️ कदम दर कदम निर्देश (Step-by-Step Instructions)

### 1. GitHub पर एक नई रिपॉजिटरी बनाएं:
1. [github.com](https://github.com/) पर जाएं और लॉगिन करें।
2. ऊपर दाईं ओर **"+"** आइकॉन पर क्लिक करें और **"New repository"** चुनें।
3. **Repository name** में डालें: `savera24news`
4. इसे **Public** रखें (ताकि GitHub Actions के अनलिमिटेड फ़्री मिनट मिलें)।
5. **Create repository** बटन पर क्लिक करें।

---

### 2. इस प्रोजेक्ट कोड को GitHub पर पुश करें:

अपने टर्मिनल में प्रोजेक्ट फ़ोल्डर के अंदर ये कमांड चलाएं:

```bash
# 1. गिट रिपॉजिटरी प्रारंभ करें (यदि पहले से नहीं है)
git init

# 2. सभी फ़ाइलों को जोड़ें
git add .

# 3. पहला कमिट करें
git commit -m "Initial commit: Savera 24 News Android PWA & APK Builder"

# 4. मुख्य ब्रांच को main नाम दें
git branch -M main

# 5. अपनी GitHub रिपॉजिटरी का लिंक जोड़ें (YOUR_USERNAME को अपने GitHub यूज़रनेम से बदलें)
git remote add origin https://github.com/YOUR_USERNAME/savera24news.git

# 6. कोड GitHub पर पुश करें
git push -u origin main
```

---

### 3. GitHub पर APK बनते हुए देखें:

1. अपने GitHub रिपॉजिटरी पेज पर जाएं: `https://github.com/YOUR_USERNAME/savera24news`
2. ऊपर **"Actions"** टैब पर क्लिक करें।
3. आपको **"Build Android APK Installer (सवेरा 24 न्यूज़)"** नाम का वर्कफ़्लो चलता हुआ दिखाई देगा (पीले रंग का चक्र घूमता दिखेगा)।
4. लगभग 2 से 4 मिनट में यह पूरा हो जाएगा (हरे रंग का चेकमार्क ✅ आ जाएगा)।

---

### 4. Android APK Package Installer डाउनलोड करें:

1. पूरे हुए रन (Run) पर क्लिक करें।
2. नीचे स्क्रॉल करके **"Artifacts"** सेक्शन देखें।
3. वहां आपको **`Savera24News-Android-Installer-APK`** दिखेगा।
4. उस पर क्लिक करें और ज़िप/APK फ़ाइल अपने कंप्यूटर या मोबाइल में डाउनलोड कर लें!

---

### 5. मोबाइल पर ऐप इंस्टॉल करें (Install on Mobile):

1. डाउनलोड की गई `.apk` फ़ाइल को अपने Android फ़ोन पर भेजें (या फ़ोन के ब्राउज़र से सीधे GitHub से डाउनलोड करें)।
2. फ़ाइल पर टैप करें।
3. यदि आपका फ़ोन **"Install unknown apps"** पूछे, तो **"Allow from this source"** को चालू करें।
4. **"Install"** दबाएं।
5. आपके फ़ोन की होम स्क्रीन पर **सवेरा 24 न्यूज़** का आइकन आ जाएगा और ऐप बिना किसी ब्राउज़र बार के एक संपूर्ण नेटिव Android ऐप की तरह चलेगा!

---

## 🏷️ नया वर्शन / Release कैसे बनाएं?

जब भी आप कोई नया अपडेट दें और चाहते हों कि एक आधिकारिक Release पेज पर APK दिखे, तो यह कमांड चलाएं:

```bash
git tag v1.0.0
git push origin v1.0.0
```

GitHub Actions अपने आप आपकी रिपॉजिटरी के **"Releases"** टैब में `Savera24News-Installer.apk` का सीधा डाउनलोड लिंक प्रकाशित कर देगा!
