# 🍎 NutriGrade - AI-Powered Nutrition Scanner with Blockchain

> A modern web application with Algorand blockchain integration for transparent, verifiable nutrition tracking

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-14.2.30-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Algorand](https://img.shields.io/badge/Algorand-Smart%20Contracts-26A5E4)
![Python](https://img.shields.io/badge/Python-3.8+-green)

## 📱 Overview

NutriGrade is an intelligent nutrition scanner that combines AI-powered analysis with blockchain transparency. Users can scan product barcodes to get instant nutrition information, personalized recommendations, and track their dietary choices with verifiable on-chain data.

### ✨ Key Features

**Frontend Web App:**
- **🔍 Barcode Scanner**: Instant product recognition using camera
- **📊 Nutrition Grading**: A-E health scoring system
- **🤖 AI Assistant**: Contextual nutrition advice and recommendations
- **📈 Health Tracking**: Personal nutrition statistics and progress
- **⚙️ Smart Preferences**: Dietary restrictions and health goals
- **📱 Mobile-First**: Responsive design for all devices

**AI-Powered Features:**
- **🔍 AI Nutrition Verification**: Automatically verify product data accuracy
- **💡 Personalized Recommendations**: Tailored advice based on user profile
- **🌱 Smart Alternatives**: AI-driven healthier product suggestions
- **💬 AI Chat Assistant**: Conversational nutrition guidance
- **📊 Consumption Analysis**: Pattern recognition and health insights
- **🎯 Engagement Features**: Challenges and motivational nudges

**Blockchain Integration:**
- **🔗 Algorand Smart Contracts**: Transparent product data storage
- **👤 User Profiles**: On-chain dietary preferences and history
- **⭐ Product Ratings**: Decentralized review system
- **🔒 Data Integrity**: Tamper-proof nutrition information
- **🌐 Global Access**: Location-specific product variants

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│                 │    │                  │    │                 │
│  Web Frontend   │────│ Algorand Network │────│ AI Service      │
│  (Next.js/TS)   │    │                  │    │ (Recommendations)│
│                 │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                        │
         │              ┌──────────────────┐
         │              │ Smart Contracts  │
         └──────────────│                  │
                        │ • ProductRegistry│
                        │ • UserProfiles   │
                        └──────────────────┘
```

### Tech Stack

| Component | Technology |
|-----------|------------|
| **Frontend** | Next.js 14, TypeScript, Tailwind CSS |
| **Blockchain** | Algorand, Python Smart Contracts |
| **Scanner** | html5-qrcode |
| **Data Sources** | Open Food Facts API, On-chain Storage |
| **AI** | OpenAI GPT-4, Contextual recommendations |
| **Deployment** | Vercel (Frontend), Algorand TestNet/MainNet |

## 🤖 AI Features

### 1. AI-Powered Nutrition Data Verification
- **Automatic Analysis**: AI verifies ingredient lists and nutrition labels
- **Anomaly Detection**: Identifies inconsistencies or mislabeling
- **Regulatory Compliance**: Checks against food composition standards
- **Blockchain Ready**: Verified data stored on-chain with cryptographic proof

### 2. Personalized Nutrition Recommendations
- **User Profile Integration**: Based on dietary preferences, allergies, and health goals
- **Health Score Calculation**: AI-generated health scores (0-100)
- **Contextual Advice**: Real-time recommendations for scanned products
- **Blockchain Data**: Uses on-chain user profiles for personalization

### 3. Smart Alternative Product Suggestions
- **AI-Driven Matching**: Finds healthier alternatives using similarity analysis
- **Health Impact Analysis**: Explains why alternatives are better
- **User Preference Alignment**: Matches dietary restrictions and health goals
- **Ranked Recommendations**: Prioritized by health improvement and user fit

### 4. AI Chat Assistant Integration
- **Conversational Interface**: Natural language nutrition queries
- **Context Awareness**: Understands current product and user profile
- **Real-time Insights**: Instant answers based on blockchain data
- **Product Suggestions**: Recommends related products and alternatives

### 5. Consumption Pattern Analysis & Engagement
- **Pattern Recognition**: AI analyzes eating habits and trends
- **Health Insights**: Identifies improvement opportunities
- **Motivational Challenges**: Personalized goals and progress tracking
- **Engagement Features**: Streaks, achievements, and social elements

## 📁 Project Structure

```
CodeX-NutriGrade/
├── src/                          # Frontend Web Application
│   ├── app/                      # Next.js App Router
│   ├── components/               # React Components
│   │   ├── navigation/           # Tab navigation system
│   │   ├── providers/            # React Context providers
│   │   ├── scanner/              # Barcode scanning
│   │   └── product/              # Product display
│   ├── lib/                      # Core utilities
│   ├── utils/                    # Helper functions
│   └── types/                    # TypeScript definitions
├── contracts/                    # Algorand Smart Contracts
│   ├── product_registry.py       # Product data storage
│   ├── user_profile_contract.py  # User profiles & preferences
│   ├── deploy.py                 # Deployment script
│   └── README.md                 # Blockchain documentation
└── README.md                     # This file
```

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** for frontend
- **Python 3.8+** for smart contracts
- **AlgoKit** for blockchain development
- Modern web browser with camera support

### Frontend Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

3. **Open in browser**
   ```
   http://localhost:3000
   ```

### Blockchain Setup

1. **Install AlgoKit**
   ```bash
   pip install algokit
   ```

2. **Start Algorand LocalNet**
   ```bash
   algokit localnet start
   ```

3. **Deploy contracts**
   ```bash
   cd contracts
   python deploy.py
   ```

## 🔧 Smart Contract Details

### ProductRegistry Contract

**Key Features:**
- ✅ Store product data with unique product IDs
- ✅ Version tracking for ingredient changes  
- ✅ Location-specific variants (IN, US, EU, Global)
- ✅ Owner-based access control
- ✅ Product activation/deactivation

**Main Methods:**
```python
add_product(product_id, name, ingredients, nutri_score, allergens, region)
update_product(product_id, name, ingredients, nutri_score, allergens, region)
get_product(product_id) -> ProductData
get_product_version(product_id) -> version_number
deactivate_product(product_id)
```

### UserProfile Contract

**Key Features:**
- ✅ User dietary preferences and restrictions
- ✅ Consumption history tracking
- ✅ Product rating system (1-5 stars)
- ✅ Privacy-focused (users own their data)
- ✅ Engagement analytics

**Main Methods:**
```python
create_profile(dietary_preferences, allergies, health_goals, age_range)
update_profile(dietary_preferences, allergies, health_goals, age_range)
record_consumption(product_id, rating, notes)
get_my_profile() -> UserProfile
get_consumption_record(user_address, product_id) -> ConsumptionRecord
```

## 🎯 Features Deep Dive

### 🏠 Home Dashboard
- **Quick Stats**: Scanned products, healthy choices, health score
- **Recent Scans**: Last 3 scanned products with grades
- **Nutrition Guide**: Visual A-E grading explanation
- **One-Tap Scanning**: Quick access to scanner

### 📱 Barcode Scanner
- **Camera Integration**: Real-time barcode detection
- **Blockchain Lookup**: Primary data source from smart contracts
- **API Fallback**: Open Food Facts database integration
- **Error Handling**: Graceful fallbacks and user feedback

### 📊 Results Analysis
- **Nutrition Grading**: A-E health score with color coding
- **Detailed Breakdown**: Sugar, fat, salt content per 100g
- **Health Warnings**: Alerts for high-risk ingredients
- **On-chain Verification**: Tamper-proof product data

### 🤖 AI Chat Assistant
- **Contextual Help**: Product-specific nutrition advice
- **Personalized Recommendations**: Based on user profile and history
- **General Q&A**: Answers about nutrition and health
- **Real-time Chat**: AI-powered responses

### 👤 User Profile
- **Health Goals**: Personalized nutrition targets
- **Dietary Preferences**: Vegetarian, vegan, gluten-free filters
- **Progress Tracking**: Visual health score and statistics
- **Blockchain Storage**: Decentralized profile management

## 🔧 Nutrition Grading System

NutriGrade uses a scientific approach to grade products:

| Grade | Score | Criteria | Color |
|-------|-------|----------|-------|
| **A** | Excellent | Low sugar, fat, salt; high nutrients | 🟢 Green |
| **B** | Good | Moderate levels, generally healthy | 🟡 Lime |
| **C** | Fair | Average nutritional value | 🟡 Yellow |
| **D** | Poor | High in unhealthy components | 🟠 Orange |
| **E** | Bad | Very high sugar/fat/salt content | 🔴 Red |

## 🌐 Frontend-Blockchain Integration

### Example Usage:

```javascript
// Initialize app
const nutrigrade = new NutrigradeApp();

// Scan barcode
const result = await nutrigrade.scanBarcode("1234567890123");

// Get AI recommendations  
const recommendations = await nutrigrade.getAIRecommendations(
    result.data, 
    userProfile
);

// Record consumption on blockchain
await nutrigrade.recordConsumption(productId, 4, "Tasty but high sugar");
```

## 🤖 AI Integration Points

1. **Product Verification**: AI validates ingredient data before blockchain storage
2. **Nutrition Scoring**: Automated NutriGrade calculation with ML models
3. **Personalized Recommendations**: User-specific dietary advice
4. **Anomaly Detection**: Identify suspicious product data changes
5. **Alternative Suggestions**: Healthier product recommendations

## 🛠️ Development

### Frontend Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript validation
```

### Blockchain Scripts

```bash
# Compile contracts
algokit compile py contracts/product_registry.py
algokit compile py contracts/user_profile_contract.py

# Deploy to LocalNet
python contracts/deploy.py

# Deploy to TestNet
python contracts/deploy.py --network testnet
```

## 🚀 Deployment

### Frontend (Vercel)

1. **Connect Repository**
   ```bash
   vercel --prod
   ```

2. **Configure Environment**
   - Add environment variables in Vercel dashboard
   - Set up custom domain if needed

### Blockchain (Algorand)

1. **Configure Network**:
   ```python
   # For TestNet
   ALGOD_ADDRESS = "https://testnet-api.algonode.cloud"
   
   # For MainNet  
   ALGOD_ADDRESS = "https://mainnet-api.algonode.cloud"
   ```

2. **Deploy**:
   ```bash
   python contracts/deploy.py --network testnet
   ```

## 🔐 Security & Privacy

- **No Personal Data Storage**: All data processed client-side
- **Secure API Calls**: HTTPS-only communication
- **Blockchain Integrity**: Tamper-proof product data
- **User Privacy**: Users control their own profile data
- **Camera Permissions**: Explicit user consent required

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Open Food Facts**: Comprehensive product database
- **Algorand Foundation**: Blockchain infrastructure
- **Next.js Team**: Amazing React framework
- **Tailwind CSS**: Utility-first CSS framework

## 🔗 Resources

- **Live Demo**: [Your deployed URL]
- **GitHub Repository**: [Your repo URL]
- **Algorand Developer Portal**: [developer.algorand.org](https://developer.algorand.org/)
- **Open Food Facts**: [openfoodfacts.org](https://world.openfoodfacts.org)

## 📞 Support

- Discord: [Algorand Discord](http://discord.gg/algorand)
- GitHub Issues: [Create an issue](https://github.com/your-repo/issues)
- Documentation: [Dev Portal](https://dev.algorand.co/)

---

<div align="center">
  <strong>Made with ❤️ for better nutrition choices</strong><br>
  <em>Empowering healthier decisions with blockchain transparency</em><br>
  <strong>🚀 Hackathon Ready | Built on Algorand</strong>
</div>
