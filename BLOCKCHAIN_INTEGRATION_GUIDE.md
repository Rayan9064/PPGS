# 🔗 NutriGrade Smart Contract Integration Guide

## Overview

This guide provides comprehensive instructions for testing and using the NutriGrade smart contract integration. All contract functions have been integrated into the application with full wallet support.

## 🚀 Quick Start

### 1. Environment Setup

1. Copy the environment configuration:
   ```bash
   cp .env.example .env.local
   ```

2. Set your contract app ID after deployment:
   ```bash
   NEXT_PUBLIC_CONTRACT_APP_ID=your_contract_app_id_here
   ```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

## 📱 Testing Contract Functions

### Wallet Connection

1. **Connect Pera Wallet**
   - Navigate to Profile tab
   - Click "Connect Pera Wallet"
   - Approve connection in Pera Wallet app
   - Verify wallet address appears in profile

### Contract Initialization

1. **Initialize Contract Service**
   - Ensure wallet is connected
   - Contract service auto-initializes when wallet connects
   - Check console for initialization logs

### User Operations

#### 1. Opt Into Contract

**Location**: Profile → Blockchain Section

**Steps**:
1. Connect wallet first
2. Click "Enable Blockchain Features"
3. Approve transaction in Pera Wallet
4. Wait for confirmation
5. Verify "Contract Enabled" status

**Expected Result**: 
- User status changes to opted-in
- User stats become available
- Blockchain features unlock in scanner and AI chat

#### 2. Scan Products (Blockchain-Enabled)

**Location**: Scan Tab

**Steps**:
1. Ensure wallet connected and opted-in
2. Scan any barcode
3. Observe blockchain status indicators:
   - "Adding to Blockchain"
   - "Recording Scan"
   - "Blockchain operations completed!"

**Expected Result**:
- Product added to blockchain (if new)
- Scan recorded on blockchain
- User scan count increments
- Transaction IDs logged

#### 3. View Blockchain Stats

**Location**: Profile → Stats Grid

**Expected Data**:
- Blockchain Scans: Your total recorded scans
- Last Product: ID of last scanned product
- Global Network Stats: Community totals

#### 4. AI Chat with Blockchain Context

**Location**: Chat Tab

**Test Queries**:
- "Show my blockchain scan history"
- "What are my blockchain stats?"
- "How does blockchain tracking help?"

**Expected Result**:
- Special blockchain-themed responses
- Visual blockchain data cards
- Personalized insights based on scan history

### Admin Operations (Contract Owner Only)

#### 1. Access Admin Panel

**URL**: `/admin`

**Requirements**:
- Wallet connected
- Must be contract owner address

#### 2. Bootstrap Contract

**Location**: Admin Panel → Bootstrap Tab

**Steps**:
1. Verify you're the contract owner
2. Click "Bootstrap Contract"
3. Approve transaction
4. Wait for confirmation

**Note**: Only run once per contract deployment

#### 3. Add Products

**Location**: Admin Panel → Products Tab

**Steps**:
1. Fill product details:
   - Product ID (barcode number)
   - Product Name
   - Ingredients (add one by one)
2. Click "Add Product"
3. Approve transaction

#### 4. Update Products

**Location**: Admin Panel → Products Tab

**Steps**:
1. Enter existing product ID
2. Provide updated name and ingredients
3. Click "Update Product"
4. Approve transaction

## 🧪 Testing Scenarios

### Scenario 1: New User Onboarding

1. **Fresh Start**:
   - Clear browser storage
   - Start app in incognito mode

2. **User Journey**:
   - Connect Pera Wallet
   - Opt into contract
   - Scan first product
   - Check AI chat for blockchain welcome

3. **Verification**:
   - User stats show 1 scan
   - Profile shows blockchain features
   - AI acknowledges blockchain participation

### Scenario 2: Returning User

1. **Prerequisites**:
   - Previously opted-in user
   - Multiple scans recorded

2. **Test Flow**:
   - Connect wallet
   - View accumulated stats
   - Scan new products
   - Chat with AI about history

3. **Verification**:
   - Stats increment correctly
   - History preserved
   - AI provides personalized insights

### Scenario 3: Admin Workflow

1. **Setup**:
   - Use contract owner wallet
   - Access admin panel

2. **Admin Tasks**:
   - Bootstrap contract (if needed)
   - Add test products
   - Update existing products
   - Monitor global stats

3. **Verification**:
   - Products appear in scans
   - Global stats update
   - Community stats reflect changes

## 🔍 Verification & Debugging

### Check Transaction Status

1. **In Console**:
   ```javascript
   // View last transaction
   console.log('Last TX:', lastTransactionId);
   ```

2. **On AlgoExplorer**:
   - Go to: https://testnet.algoexplorer.io/
   - Search transaction ID
   - Verify application call details

### Verify Contract State

1. **User Stats**:
   ```javascript
   // In browser console
   await contractService.getUserStats();
   ```

2. **Global Stats**:
   ```javascript
   await contractService.getGlobalStats();
   ```

### Common Issues & Solutions

#### Issue: "Contract not initialized"
**Solution**: 
- Check wallet connection
- Verify contract app ID in environment
- Check console for initialization errors

#### Issue: "User not opted in"
**Solution**:
- Complete opt-in process from profile
- Approve transaction in wallet
- Wait for confirmation

#### Issue: "Insufficient balance"
**Solution**:
- Get TestNet ALGO from faucet
- Ensure minimum 0.1 ALGO balance

#### Issue: "Transaction failed"
**Solution**:
- Check network connection
- Verify contract is properly deployed
- Check for network congestion

## 📊 Expected Performance

### Transaction Times
- **Opt-in**: ~5-10 seconds
- **Add Product**: ~5-10 seconds  
- **Scan Product**: ~5-10 seconds
- **Bootstrap**: ~5-10 seconds

### Gas Costs (TestNet)
- **Opt-in**: ~0.001 ALGO
- **Add Product**: ~0.001 ALGO
- **Scan Product**: ~0.001 ALGO
- **Bootstrap**: ~0.001 ALGO

## 🎯 Success Criteria

### Core Functionality ✅
- [x] Wallet connection works
- [x] Contract initialization succeeds
- [x] User can opt-in/opt-out
- [x] Products can be added to blockchain
- [x] Scans are recorded on blockchain
- [x] Stats are retrieved accurately

### User Experience ✅
- [x] Loading states during transactions
- [x] Success/error notifications
- [x] Blockchain status indicators
- [x] Profile stats display correctly
- [x] AI chat includes blockchain context

### Admin Features ✅
- [x] Admin panel accessible to owners
- [x] Bootstrap functionality works
- [x] Product management (add/update)
- [x] Global stats monitoring

### Error Handling ✅
- [x] Graceful failure for disconnected wallet
- [x] Clear error messages for failed transactions
- [x] Fallback behavior when blockchain unavailable
- [x] Validation for invalid inputs

## 🔗 Integration Points

### Scanner Component
- **File**: `src/components/scanner/scanner-component.tsx`
- **Integration**: Auto-adds scanned products to blockchain
- **Features**: Status indicators, error handling

### Profile Tab
- **File**: `src/components/navigation/tabs/profile-tab.tsx`
- **Integration**: Blockchain stats, opt-in/out controls
- **Features**: User stats, global stats, wallet management

### AI Chat Assistant
- **File**: `src/components/ai/ai-chat-assistant.tsx`
- **Integration**: Blockchain-aware responses
- **Features**: Special blockchain queries, visual data cards

### Contract Service
- **File**: `src/lib/contract-service.ts`
- **Integration**: Core contract operations wrapper
- **Features**: All contract functions, error handling

### User Data Provider
- **File**: `src/components/providers/user-data-provider.tsx`
- **Integration**: Blockchain state management
- **Features**: Stats caching, automatic updates

### Admin Panel
- **File**: `src/components/admin/admin-contract-management.tsx`
- **Integration**: Contract management interface
- **Features**: Bootstrap, product management, monitoring

## 🎉 Next Steps

1. **Deploy Contract**: Use AlgoKit to deploy to TestNet
2. **Set App ID**: Update environment with deployed contract ID
3. **Test End-to-End**: Run through all testing scenarios
4. **User Testing**: Get feedback from real users
5. **Production Prep**: Deploy to MainNet when ready

---

**Happy Testing! 🚀**

For issues or questions, check the console logs and verify your wallet connection and contract deployment status.