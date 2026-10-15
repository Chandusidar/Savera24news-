# सवेरा 24 न्यूज़ (Savera 24 News) - Android & Web News App

> **टैगलाइन:** सच की राह सवेरा के साथ  
> **आधिकारिक वेबसाइट:** [www.savera24news.in](https://www.savera24news.in/)  
> **ब्रांड रंग:** Red (`#dc2626`), Charcoal Dark (`#111827`), White (`#ffffff`)

---

## 📱 ऐप का परिचय (App Overview)

**सवेरा 24 न्यूज़** छत्तीसगढ़, महासमुंद, पिथौरा, बसना, सरायपाली, बागबाहरा और देश-विदेश की ताज़ा एवं निष्पक्ष खबरें प्रदान करने वाला एक आधुनिक, तेज़ और मोबाइल-फर्स्ट न्यूज़ पोर्टल एप्लिकेशन है।

यह एप्लिकेशन सीधे आधिकारिक ब्लॉगर JSON फीड (`https://www.savera24news.in/feeds/posts/default?alt=json`) से लाइव समाचार लोड करता है।

---

## 🌟 मुख्य विशेषताएं (Key Features)

1. **लाइव ब्लॉगर फीड एकीकरण (Live Blogger Feed Integration):**
   - वास्तविक ब्लॉगर पोस्ट्स, तिथियां, श्रेणियां और मीडिया थंबनेल बिना किसी बनावटी (mock) डेटा के लोड होते हैं।
   - HTML सामग्री को DOMPurify के माध्यम से सुरक्षित (sanitized) किया गया है।

2. **ब्रेकिंग न्यूज़ टिकर (Breaking News Ticker):**
   - केवल प्रमाणित और 'ब्रेकिंग' टैग वाले समाचारों को ही प्राथमिकता से दिखाता है। किसी भी सामान्य समाचार को गलत रूप से ब्रेकिंग मार्क नहीं किया जाता।

3. **क्षेत्रीय एवं विषयवार श्रेणियां (Regional Categories):**
   - छत्तीसगढ़ (Chhattisgarh), महासमुंद (Mahasamund), पिथौरा (Pithora), बसना (Basna), सरायपाली (Saraipali), बागबाहरा (Bagbahara), राजनीति (Politics), शिक्षा (Education), अपराध (Crime), खेल (Sports), रायपुर (Raipur), मनोरंजन (Entertainment)।
   - यदि किसी श्रेणी में समाचार नहीं हैं, तो पारदर्शी एम्प्टी स्टेट प्रदर्शित होता है।

4. **फोटो गैलरी (Photo News Gallery):**
   - ब्लॉगर पोस्ट्स से उच्च-रिज़ॉल्यूशन चित्रों का संग्रह।
   - चित्र पर टैप करके लाइटबॉक्स में बड़ा देखने तथा सीधे संबंधित लेख पढ़ने की सुविधा।

5. **वीडियो समाचार बुलेटिन (Video News):**
   - पोस्ट्स में एम्बेडेड यूट्यूब वीडियो और वीडियो लिंक्स की पहचान।
   - 16:9 थंबनेल और गैर-ऑटोप्ले (No autoplay sound) वीडियो प्लेयर।

6. **आर्टिकल रीडर (Article Reader):**
   - पढ़ने के लिए अनुकूलित लेआउट।
   - फ़ॉन्ट साइज़ नियंत्रक (अ, अ+, अ++) बुजुर्ग पाठकों के लिए।
   - मूल वेबसाइट ([www.savera24news.in](https://www.savera24news.in/)) पर खोलने का सीधा लिंक।
   - वेब शेयर एपीआई (Web Share API) से व्हाट्सएप और सोशल मीडिया पर एक क्लिक में खबर शेयर करने की सुविधा।

7. **प्रोग्रेसिव वेब ऐप (PWA) एवं ऑफ़लाइन मोड:**
   - सर्विस वर्कर (`sw.js`) और वेब ऐप मैनिफेस्ट (`manifest.json`)।
   - इंटरनेट न होने पर पूर्व में लोड किए गए समाचार लोकल स्टोरेज कैशे से प्रदर्शित होते हैं।
   - होम स्क्रीन पर "ऐप इंस्टॉल करें" का आसान बटन (Android Chrome और iOS Safari दोनों के लिए निर्देश)।

---

## 🛠️ तकनीकी संरचना (Tech Stack)

- **Frontend:** React 19, TypeScript, Tailwind CSS
- **Icons:** Lucide React
- **HTML Sanitization:** DOMPurify
- **PWA Tooling:** `vite-plugin-pwa`, Custom Service Worker with Cache-First & Stale-While-Revalidate strategies
- **Backend / Proxy:** Express.js + Vite middleware with 60-second in-memory response cache to prevent rate-limits and eliminate CORS blocks.

---

## 🚀 स्थानीय विकास और परीक्षण (Local Development)

```bash
# डिपेंडेंसी इंस्टॉल करें
npm install

# डेवलपमेंट सर्वर चालू करें (पोर्ट 3000 पर)
npm run dev

# प्रोडक्शन बिल्ड तैयार करें
npm run build

# प्रोडक्शन सर्वर प्रारंभ करें
npm start
```

---

## 📦 Android पैकेजिंग के निर्देश (Packaging for Android)

विस्तृत Android पैकेजिंग, Capacitor सेटअप, TWA (Trusted Web Activity) और Google Play Store के लिए साइन किया हुआ Android App Bundle (`.aab`) तैयार करने के लिए कृपया **`ANDROID_PACKAGING_GUIDE.md`** देखें।
