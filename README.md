```markdown
# 📦 Packaged Product Grading System (PPGS) — MVP

A mobile application built using **React Native (Expo)** to scan packaged product barcodes and display health-related product grading using public datasets.

---

## ✅ Project Goals (MVP)

- Implement barcode scanning functionality
- Fetch product details using a public dataset (e.g., Open Food Facts)
- Display nutrition-based product grading
- Provide basic feedback based on ingredients (sugar, fat, salt)

---

## 🧩 Tech Stack

| Layer           | Tool/Library                     |
|------------------|----------------------------------|
| Framework        | React Native (via Expo)          |
| Barcode Scanner  | expo-barcode-scanner             |
| Public Dataset   | Open Food Facts API              |
| HTTP Client      | Axios or Fetch                   |
| UI Library       | React Native Paper or NativeWind |
| State Management | Context API (initially)          |
| Navigation       | React Navigation                 |

---

## 📁 Project Structure

```

ppgs-mvp/
│
├── App.js
├── package.json
├── assets/
│   └── images/
│
├── components/
│   ├── ScanButton.js
│   ├── ProductCard.js
│   └── Loader.js
│
├── screens/
│   ├── HomeScreen.js
│   ├── ScannerScreen.js
│   └── ResultScreen.js
│
├── services/
│   └── productAPI.js   # API handler for Open Food Facts
│
├── utils/
│   └── gradingLogic.js # Simple product grading logic
│
├── constants/
│   └── Colors.js
│   └── NutritionLimits.js
│
└── navigation/
└── AppNavigator.js

```

---

## 🔧 Requirements

### Functional
- [ ] Barcode scanning via camera
- [ ] On successful scan, fetch product data
- [ ] Parse and display:
  - Product name
  - Ingredients
  - Nutrition grade (A–E or color-coded)
  - Key nutrient values (sugar, fat, sodium)
- [ ] Basic grading or warning system based on limits

### Non-Functional
- [ ] Responsive and intuitive UI
- [ ] Lightweight with smooth navigation
- [ ] Works offline for scanned product cache (optional)

---

## 🔗 API Reference: Open Food Facts

**Example Endpoint:**
```

GET [https://world.openfoodfacts.org/api/v0/product/{barcode}.json](https://world.openfoodfacts.org/api/v0/product/{barcode}.json)

````

**Sample Fields to Extract:**
- `product.product_name`
- `product.ingredients_text`
- `product.nutrition_grades`
- `product.nutriments.sugars_100g`
- `product.nutriments.fat_100g`
- `product.nutriments.salt_100g`

---

## 🧪 Testing

- Test with real Indian product barcodes (Amul, Maggi, etc.)
- Fallback mock JSON file for offline/dev mode

---

## 🚀 Future Features (Post-MVP)

- User preference-based grading (e.g., diabetic-safe)
- Suggest healthier alternatives
- History of scanned products
- Manual input of product data
- Integration with nutritionist advisory

---

## 📌 Setup Instructions

```bash
npx create-expo-app ppgs-mvp
cd ppgs-mvp
npx expo install expo-barcode-scanner
npm install axios react-navigation
````

---

## 🧠 Contributors

* Project Lead: \[Your Name]
* Design: \[Optional]
* Development: \[You or collaborators]

```

---