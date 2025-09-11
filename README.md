# 🍎 NutriGrade - Smart Nutrition Scanner

> A modern web application for instant product nutrition analysis and health grading

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-14.2.30-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Web App](https://img.shields.io/badge/Web-App-26A5E4)

## 📱 Overview

NutriGrade is an intelligent nutrition scanner that helps users make informed dietary decisions by scanning product barcodes. Built as a modern web application, it provides instant access to comprehensive nutrition analysis with an intuitive mobile-first interface.

### ✨ Key Features

- **🔍 Barcode Scanner**: Instant product recognition using camera
- **📊 Nutrition Grading**: A-E health scoring system
- **🤖 AI Assistant**: Contextual nutrition advice and recommendations
- **📈 Health Tracking**: Personal nutrition statistics and progress
- **⚙️ Smart Preferences**: Dietary restrictions and health goals
- **📱 Mobile-First**: Responsive design for all devices
- **🌐 Web-Native**: Works in any modern browser

## 🏗️ Architecture

### Tech Stack

| Component | Technology |
|-----------|------------|
| **Framework** | Next.js 14 with App Router |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **Scanner** | html5-qrcode |
| **Data Source** | Open Food Facts API |
| **Notifications** | React Hot Toast |
| **Icons** | Heroicons |
| **Platform** | Web Application |

### Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main app entry point
├── components/
│   ├── navigation/        # Tab navigation system
│   │   ├── tab-navigation.tsx
│   │   └── tabs/          # Individual tab components
│   │       ├── home-tab.tsx      # Dashboard & quick stats
│   │       ├── scan-tab.tsx      # Barcode scanner
│   │       ├── results-tab.tsx   # Product analysis
│   │       ├── chat-tab.tsx      # AI assistant
│   │       └── profile-tab.tsx   # User preferences
│   ├── providers/         # React Context providers
│   │   └── web-provider.tsx      # Web app integration
│   ├── scanner/           # Barcode scanning components
│   ├── product/           # Product display components
│   └── welcome/           # Onboarding components
├── lib/                   # Core utilities
│   ├── nutrition-limits.ts    # Health thresholds
│   ├── product-api.ts         # API integration
│   └── user-data.ts           # User data management
├── utils/                 # Helper functions
│   └── grading-logic.ts       # Nutrition scoring algorithm
├── types/                 # TypeScript definitions
└── styles/                # Global styles
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Modern web browser with camera support

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd CodeX-NutriGrade
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

### Environment Setup

Create a `.env.local` file for configuration:

```env
# Optional: Custom API endpoints
NEXT_PUBLIC_API_BASE_URL=https://world.openfoodfacts.org
```

## 📱 Mobile Testing

### Local Network Testing

1. **Find your local IP address**
   ```bash
   ipconfig  # Windows
   ifconfig  # macOS/Linux
   ```

2. **Access from mobile device**
   ```
   http://YOUR_LOCAL_IP:3000
   ```

## 🎯 Features Deep Dive

### 🏠 Home Dashboard
- **Quick Stats**: Scanned products, healthy choices, health score
- **Recent Scans**: Last 3 scanned products with grades
- **Nutrition Guide**: Visual A-E grading explanation
- **One-Tap Scanning**: Quick access to scanner

### 📱 Barcode Scanner
- **Camera Integration**: Real-time barcode detection
- **Product Recognition**: Open Food Facts database integration
- **Error Handling**: Graceful fallbacks and user feedback
- **Haptic Feedback**: Browser vibration API support

### 📊 Results Analysis
- **Nutrition Grading**: A-E health score with color coding
- **Detailed Breakdown**: Sugar, fat, salt content per 100g
- **Health Warnings**: Alerts for high-risk ingredients
- **Scan History**: Persistent local storage of results

### 🤖 AI Chat Assistant
- **Contextual Help**: Product-specific nutrition advice
- **General Q&A**: Answers about nutrition and health
- **Suggested Questions**: Quick-start conversation prompts
- **Real-time Chat**: Simulated AI responses (extensible to real AI)

### 👤 User Profile
- **Health Goals**: Personalized nutrition targets
- **Dietary Preferences**: Vegetarian, vegan, gluten-free filters
- **Progress Tracking**: Visual health score and statistics
- **App Settings**: Notification and scanning preferences

## 🔧 Nutrition Grading System

NutriGrade uses a scientific approach to grade products:

| Grade | Score | Criteria | Color |
|-------|-------|----------|-------|
| **A** | Excellent | Low sugar, fat, salt; high nutrients | 🟢 Green |
| **B** | Good | Moderate levels, generally healthy | 🟡 Lime |
| **C** | Fair | Average nutritional value | 🟡 Yellow |
| **D** | Poor | High in unhealthy components | 🟠 Orange |
| **E** | Bad | Very high sugar/fat/salt content | 🔴 Red |

### Calculation Logic

```typescript
// Simplified grading algorithm
const grade = calculateGrade({
  sugars_100g: number,   // Grams of sugar per 100g
  fat_100g: number,      // Grams of fat per 100g  
  salt_100g: number,     // Grams of salt per 100g
});
```

## 🛠️ Development

### Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript validation
```

### Code Quality

- **TypeScript**: Full type safety with strict mode
- **ESLint**: Code linting with Next.js recommended rules
- **Prettier**: Consistent code formatting
- **Responsive Design**: Mobile-first approach

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect Repository**
   ```bash
   vercel --prod
   ```

2. **Configure Environment**
   - Add environment variables in Vercel dashboard
   - Set up custom domain if needed

### Manual Deployment

```bash
npm run build
npm start
```

## 🔐 Security & Privacy

- **No Personal Data Storage**: All data processed client-side
- **Secure API Calls**: HTTPS-only communication
- **Camera Permissions**: Explicit user consent required
- **Local Storage**: User preferences stored locally

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
- **Next.js Team**: Amazing React framework
- **Tailwind CSS**: Utility-first CSS framework

## 🔗 Links

- **Live Demo**: [Your deployed URL]
- **GitHub Repository**: [Your repo URL]
- **Open Food Facts**: [openfoodfacts.org](https://world.openfoodfacts.org)

---

<div align="center">
  <strong>Made with ❤️ for better nutrition choices</strong><br>
  <em>Empowering healthier decisions, one scan at a time</em>
</div>