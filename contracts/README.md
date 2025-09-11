# Nutrigrade Algorand Smart Contracts

🍎 **Nutrigrade** - AI-powered nutrition tracking with blockchain transparency on Algorand

## Overview

This project implements Nutrigrade's core functionality using Algorand smart contracts written in native Python. The system stores product data on-chain, manages user profiles, and enables transparent, verifiable nutrition tracking.

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│                 │    │                  │    │                 │
│  Web Frontend   │────│ Algorand Network │────│ AI Service      │
│  (React/JS)     │    │                  │    │ (Recommendations)│
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

## 📁 Project Structure

```
nutrigrade-algorand/
├── product_registry.py           # Main product data smart contract
├── user_profile_contract.py     # User profiles and preferences
├── deploy.py                     # Deployment script
├── nutrigrade-web-integration.js # Frontend integration
├── README.md                     # This file
└── examples/
    ├── sample_products.json      # Example product data
    └── sample_interactions.py    # Usage examples
```

## 🚀 Quick Start

### Prerequisites

1. **Install AlgoKit**
   ```bash
   pip install algokit
   ```

2. **Start Algorand LocalNet**
   ```bash
   algokit localnet start
   ```

3. **Install Dependencies**
   ```bash
   pip install algorand-python
   pip install algokit-utils
   ```

### Deploy Contracts

1. **Compile Smart Contracts**
   ```bash
   algokit compile py product_registry.py
   algokit compile py user_profile_contract.py
   ```

2. **Deploy to LocalNet**
   ```bash
   python deploy.py
   ```

3. **Note the App IDs** for frontend integration

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

**Product Data Structure:**
```python
{
    "product_id": "1234567890123",
    "name": "Chocolate Milk", 
    "ingredients": "Milk, Sugar, Cocoa, Vanilla",
    "nutri_score": "B+",
    "allergens": "Milk",
    "region": "IN",
    "version": 1,
    "timestamp": 1694434800,
    "active": true
}
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

## 🌐 Frontend Integration

The web app integration provides:

- **Blockchain-first product lookup**
- **Fallback to external APIs** (Open Food Facts)
- **Real-time AI recommendations** 
- **User profile management**
- **Barcode scanning integration**
- **Product rating and reviews**

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

// Record consumption
await nutrigrade.recordConsumption(productId, 4, "Tasty but high sugar");
```

## 🤖 AI Integration Points

1. **Product Verification**: AI validates ingredient data before blockchain storage
2. **Nutrition Scoring**: Automated NutriGrade calculation with ML models
3. **Personalized Recommendations**: User-specific dietary advice
4. **Anomaly Detection**: Identify suspicious product data changes
5. **Alternative Suggestions**: Healthier product recommendations

## 📊 Sample Data

### Sample Products:
```json
{
    "1234567890123": {
        "name": "Chocolate Milk",
        "nutri_score": "B+",
        "region": "IN"
    },
    "9876543210987": {
        "name": "Whole Wheat Bread", 
        "nutri_score": "A-",
        "region": "Global"
    }
}
```

### Sample User Profile:
```json
{
    "dietary_preferences": "vegetarian,low-sodium",
    "allergies": "nuts,soy",
    "health_goals": "weight-loss,general-health",
    "age_range": "26-35"
}
```

## 🔐 Security Considerations

- **Access Control**: Owner-only product updates (expandable to authorized contributors)
- **Data Integrity**: On-chain storage prevents tampering
- **Privacy**: Users control their own profile data
- **Verification**: Cryptographic proofs for data authenticity

## 🛠️ Development Workflow

### Team Division (4 Members):

**Smart Contract Developers (2):**
- Member A: Core product registry logic, versioning, data structures
- Member B: User profiles, authorization, contract optimization

**Frontend Developer (1):**
- Web app interface, Algorand SDK integration, barcode scanning

**AI/Backend Developer (1):**  
- AI recommendation service, data validation, external API integration

### Testing:

```bash
# Run contract tests
pytest test_contracts.py

# Test frontend integration
npm test

# End-to-end testing
python test_e2e.py
```

## 🚀 Deployment to TestNet/MainNet

1. **Configure Network**:
   ```python
   # For TestNet
   ALGOD_ADDRESS = "https://testnet-api.algonode.cloud"
   ALGOD_TOKEN = ""

   # For MainNet  
   ALGOD_ADDRESS = "https://mainnet-api.algonode.cloud"
   ALGOD_TOKEN = ""
   ```

2. **Fund Deployment Account**:
   - TestNet: Use [TestNet Dispenser](https://testnet.algoexplorer.io/dispenser)
   - MainNet: Fund with real ALGO tokens

3. **Deploy**:
   ```bash
   python deploy.py --network testnet
   ```

## 📈 Scaling Considerations

- **Box Storage**: Efficient for large product databases
- **Indexer Integration**: Fast product searches
- **IPFS Integration**: Store large product images/documents
- **Layer 2 Solutions**: For high-frequency interactions

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

## 🔗 Resources

- [Algorand Developer Portal](https://developer.algorand.org/)
- [AlgoKit Documentation](https://github.com/algorandfoundation/algokit-cli)
- [Algorand Python Documentation](https://algorandfoundation.github.io/puya/)
- [Open Food Facts API](https://openfoodfacts.github.io/api-documentation/)

## 📞 Support

- Discord: [Algorand Discord](http://discord.gg/algorand)
- GitHub Issues: [Create an issue](https://github.com/your-repo/issues)
- Documentation: [Dev Portal](https://dev.algorand.co/)

---

Built with ❤️ on Algorand | Hackathon Ready 🚀
