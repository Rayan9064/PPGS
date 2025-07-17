# Data Inconsistency and Mock Data Issues

## Issue Description
The NutriPal application has multiple critical data inconsistency issues where scanned products, favorites, and consumption data are not properly synchronized across different views. Additionally, several profile pages are using mock data instead of real-time data from localStorage.

## Problem Overview
- **Issue Type**: Data Synchronization & Mock Data Usage
- **Severity**: High - Critical functionality affected
- **Impact**: Poor user experience, data loss, inconsistent information display

## Critical Issues Identified

### 1. Scanned Products Data Flow Issues

#### Problem
- Scanned products are stored in `tab-navigation.tsx` state but not properly reflected in profile pages
- Scan history page uses mock data instead of localStorage data
- Recent scans on home page may not match actual scan history

#### Current Implementation Issues
```typescript
// In tab-navigation.tsx - Real data storage
const [scannedProducts, setScannedProducts] = useState<ProductData[]>([]);
localStorage.setItem('nutripal-scan-history', JSON.stringify(updatedHistory));

// In profile/history/page.tsx - Uses MOCK data instead!
const [scanHistory] = useState<ScanHistoryItem[]>([/* mock data */]);
```

### 2. Favorites Data Inconsistency

#### Problem
- ProductResult component saves favorites to localStorage
- Favorites profile page uses mock data instead of localStorage
- No synchronization between the two data sources

#### Files Affected
- `src/components/product/product-result.tsx` (saves to localStorage)
- `src/app/profile/favorites/page.tsx` (uses mock data)

### 3. Consumption Data Inconsistency

#### Problem
- ProductResult component saves consumption to localStorage
- Consumed profile page uses mock data instead of localStorage
- No real-time updates when products are marked as consumed

#### Files Affected
- `src/components/product/product-result.tsx` (saves to localStorage)
- `src/app/profile/consumed/page.tsx` (uses mock data)

## Detailed Analysis

### Mock Data Usage Found
1. **Scan History** (`src/app/profile/history/page.tsx:19`)
   ```typescript
   // Mock scan history data
   const [scanHistory] = useState<ScanHistoryItem[]>([...]);
   ```

2. **Favorites** (`src/app/profile/favorites/page.tsx:20`)
   ```typescript
   // Mock favorites data
   const [favorites, setFavorites] = useState<FavoriteProduct[]>([...]);
   ```

3. **Consumed Products** (`src/app/profile/consumed/page.tsx:20`)
   ```typescript
   // Mock data for demonstration
   const [consumedProducts] = useState<ConsumedProduct[]>([...]);
   ```

### Expected Enhanced Data Flow
```
User Scans Product → localStorage Storage → Profile Pages Display (Real + Mock)
                  ↓                              ↑
            ProductResult Component              │
                  ↓                              │
          User Adds to Favorites/Consumption    │
                  ↓                              │
            localStorage Update → Custom Events ─┘
                  ↓
          Real-time UI Updates Across App
          + Visual Indicators (User vs Demo Data)
```

### Current Enhanced Flow (Proposed)
```
User Scans Product → localStorage Storage → ✅ Profile Pages Show Combined Data
                  ↓                              ↑
            ProductResult Component              │
                  ↓                              │
          User Adds to Favorites/Consumption    │
                  ↓                              │
            localStorage Update → Custom Events ─┘
                  ↓
          ✅ Immediate UI Updates + Toast Feedback
          ✅ Visual Badges: "Your Data" vs "Demo Data"
```

## Required Fixes

### 1. Hybrid Data Approach - Mock Data + Real Data Integration

#### Strategy
Keep existing mock data to ensure rich UI presentation while adding real-time data tracking functionality. This provides the best user experience by showing populated interfaces immediately while properly tracking user interactions.

#### Scan History Page Enhancement
```typescript
// Enhanced approach: Combine mock data with real data
useEffect(() => {
  // Load real scan history from localStorage
  const realScanHistory = JSON.parse(localStorage.getItem('nutripal-scan-history') || '[]');
  
  // Convert localStorage format to component format
  const realScans = realScanHistory.map(scan => ({
    id: scan.id,
    product: scan.product,
    timestamp: new Date(scan.timestamp),
    scanLocation: 'User Scan' // Could be enhanced with location tracking
  }));
  
  // Combine with mock data, prioritizing real data
  const combinedHistory = [
    ...realScans, // Real user scans first
    ...mockScanHistory.filter(mock => 
      !realScans.some(real => real.product.code === mock.product.code)
    ) // Mock data for products not scanned by user
  ];
  
  setScanHistory(combinedHistory);
}, []);
```

#### Favorites Page Enhancement
```typescript
// Enhanced approach: Show mock favorites + real favorites
useEffect(() => {
  const realFavorites = JSON.parse(localStorage.getItem('nutripal-favorites') || '[]');
  
  // Convert localStorage format to component format
  const userFavorites = realFavorites.map(fav => ({
    id: fav.id,
    product: fav.product,
    dateAdded: new Date(fav.dateAdded),
    category: fav.category || 'User Favorite' // Auto-categorize or use stored category
  }));
  
  // Combine with mock data for better UI presentation
  const combinedFavorites = [
    ...userFavorites, // User's real favorites first
    ...mockFavorites.filter(mock => 
      !userFavorites.some(real => real.product.code === mock.product.code)
    ) // Mock favorites for demonstration
  ];
  
  setFavorites(combinedFavorites);
}, []);

// Add real-time updates
const handleRemoveFavorite = (productId: string) => {
  // Update localStorage
  const currentFavorites = JSON.parse(localStorage.getItem('nutripal-favorites') || '[]');
  const updatedFavorites = currentFavorites.filter(fav => fav.product.code !== productId);
  localStorage.setItem('nutripal-favorites', JSON.stringify(updatedFavorites));
  
  // Update local state
  setFavorites(prev => prev.filter(fav => fav.product.code !== productId));
  
  toast.success('Removed from favorites');
};
```

#### Consumed Page Enhancement
```typescript
// Enhanced approach: Combine real consumption data with mock data
useEffect(() => {
  const realConsumed = JSON.parse(localStorage.getItem('nutripal-consumed') || '[]');
  
  // Convert localStorage format to component format
  const userConsumed = realConsumed.map(item => ({
    id: item.id,
    product: item.product,
    timestamp: new Date(item.timestamp),
    quantity: item.quantity,
    calories: item.calories
  }));
  
  // Combine with mock data for rich UI
  const combinedConsumed = [
    ...userConsumed, // Real consumption data first
    ...mockConsumedProducts.filter(mock => 
      !userConsumed.some(real => real.product.code === mock.product.code)
    ) // Mock data for demonstration
  ];
  
  setConsumedProducts(combinedConsumed);
}, []);
```

### 2. Add Real-time Data Synchronization with Visual Indicators

#### Implement Data Source Indicators
Add visual indicators to distinguish between user data and demo data:

```typescript
// Component enhancement to show data source
const DataSourceBadge = ({ isUserData }: { isUserData: boolean }) => (
  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
    isUserData 
      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
  }`}>
    {isUserData ? '✓ Your Data' : '📋 Demo Data'}
  </div>
);
```

#### Enhanced ProductResult Component
```typescript
// Add immediate UI feedback when data is saved
const handleToggleFavorite = () => {
  hapticFeedback.impact('light');
  setIsFavorite(!isFavorite);
  
  // ... existing localStorage logic ...
  
  // Dispatch custom event for real-time synchronization
  window.dispatchEvent(new CustomEvent('favoritesUpdated', {
    detail: { productCode: product.code, action: !isFavorite ? 'added' : 'removed' }
  }));
  
  toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites');
};

const handleToggleConsumption = () => {
  hapticFeedback.impact('light');
  setIsConsumed(!isConsumed);
  
  // ... existing localStorage logic ...
  
  // Dispatch custom event for real-time synchronization
  window.dispatchEvent(new CustomEvent('consumptionUpdated', {
    detail: { productCode: product.code, action: !isConsumed ? 'added' : 'removed' }
  }));
  
  toast.success(isConsumed ? 'Removed from consumption' : 'Added to consumption');
};
```

#### Real-time Event Listeners
```typescript
// In profile pages - Add event listeners for real-time updates
useEffect(() => {
  const handleFavoritesUpdate = (event: CustomEvent) => {
    // Reload favorites data when updated from other components
    const realFavorites = JSON.parse(localStorage.getItem('nutripal-favorites') || '[]');
    // ... update logic ...
  };

  const handleConsumptionUpdate = (event: CustomEvent) => {
    // Reload consumption data when updated from other components
    const realConsumed = JSON.parse(localStorage.getItem('nutripal-consumed') || '[]');
    // ... update logic ...
  };

  window.addEventListener('favoritesUpdated', handleFavoritesUpdate);
  window.addEventListener('consumptionUpdated', handleConsumptionUpdate);

  return () => {
    window.removeEventListener('favoritesUpdated', handleFavoritesUpdate);
    window.removeEventListener('consumptionUpdated', handleConsumptionUpdate);
  };
}, []);
```

### 3. Enhanced State Management with Visual Feedback

#### Custom Hooks with Mock Data Integration
Create enhanced custom hooks that merge real and mock data:

```typescript
// useEnhancedFavorites.ts
export const useEnhancedFavorites = () => {
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadFavorites = useCallback(() => {
    const realFavorites = JSON.parse(localStorage.getItem('nutripal-favorites') || '[]');
    const mockFavorites = getMockFavorites(); // Import from constants
    
    const userFavorites = realFavorites.map(fav => ({ ...fav, isUserData: true }));
    const demoFavorites = mockFavorites
      .filter(mock => !userFavorites.some(real => real.product.code === mock.product.code))
      .map(mock => ({ ...mock, isUserData: false }));
    
    setFavorites([...userFavorites, ...demoFavorites]);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadFavorites();
    
    const handleUpdate = () => loadFavorites();
    window.addEventListener('favoritesUpdated', handleUpdate);
    return () => window.removeEventListener('favoritesUpdated', handleUpdate);
  }, [loadFavorites]);

  return { favorites, isLoading, refresh: loadFavorites };
};
```

#### Context Providers with Enhanced Features
```typescript
// DataProvider.tsx - Centralized data management
interface DataContextType {
  scanHistory: ScanHistoryItem[];
  favorites: FavoriteProduct[];
  consumed: ConsumedProduct[];
  refreshAll: () => void;
  isLoading: boolean;
}

const DataContext = createContext<DataContextType | null>(null);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  
  // Enhanced data loading with mock + real data merge
  const loadAllData = useCallback(() => {
    setIsLoading(true);
    
    // Load and merge all data types
    const realScanHistory = JSON.parse(localStorage.getItem('nutripal-scan-history') || '[]');
    const realFavorites = JSON.parse(localStorage.getItem('nutripal-favorites') || '[]');
    const realConsumed = JSON.parse(localStorage.getItem('nutripal-consumed') || '[]');
    
    // Merge with mock data for rich UI
    // ... merging logic ...
    
    setIsLoading(false);
  }, []);

  // Event listeners for real-time updates
  useEffect(() => {
    loadAllData();
    
    const handleDataUpdate = () => loadAllData();
    
    window.addEventListener('favoritesUpdated', handleDataUpdate);
    window.addEventListener('consumptionUpdated', handleDataUpdate);
    window.addEventListener('scanHistoryUpdated', handleDataUpdate);
    
    return () => {
      window.removeEventListener('favoritesUpdated', handleDataUpdate);
      window.removeEventListener('consumptionUpdated', handleDataUpdate);
      window.removeEventListener('scanHistoryUpdated', handleDataUpdate);
    };
  }, [loadAllData]);

  return (
    <DataContext.Provider value={{ /* ... */ }}>
      {children}
    </DataContext.Provider>
  );
};
```

## Files Requiring Updates

### High Priority - Enhanced Data Integration
- [ ] `src/app/profile/history/page.tsx` - Implement hybrid scan history (real + mock)
- [ ] `src/app/profile/favorites/page.tsx` - Implement hybrid favorites (real + mock)
- [ ] `src/app/profile/consumed/page.tsx` - Implement hybrid consumption data (real + mock)
- [ ] Add visual indicators to distinguish user data from demo data
- [ ] Implement real-time event-based synchronization

### Medium Priority - Enhanced User Experience
- [ ] `src/components/product/product-result.tsx` - Add custom event dispatching
- [ ] Create enhanced custom hooks for data management
- [ ] Add loading states and smooth transitions
- [ ] Implement toast notifications for data operations
- [ ] Add data source badges/indicators in UI

### Low Priority - Advanced Features
- [ ] Implement centralized DataProvider context
- [ ] Add data migration and versioning
- [ ] Create data export/import functionality
- [ ] Add offline data synchronization
- [ ] Implement data analytics and insights

## Testing Requirements

### Data Flow Testing
- [ ] Scan a product → Verify it appears in scan history (prioritized over demo data)
- [ ] Add to favorites → Verify it appears in favorites page with "Your Data" badge
- [ ] Mark as consumed → Verify it appears in consumed page with user indicator
- [ ] Test real-time updates across different tabs/components
- [ ] Verify demo data is still visible for rich UI presentation
- [ ] Test data persistence across app sessions
- [ ] Verify recent scans on home page match actual scan history
- [ ] Test custom event propagation for immediate UI updates

### Enhanced UI Testing
- [ ] Verify visual indicators distinguish user vs demo data
- [ ] Test loading states during data operations
- [ ] Verify toast notifications for user actions
- [ ] Test smooth transitions between data states
- [ ] Verify accessibility of data source indicators

### Edge Case Testing
- [ ] Test with empty localStorage (should show only demo data)
- [ ] Test with corrupted localStorage data (fallback to demo data)
- [ ] Test localStorage quota exceeded scenarios
- [ ] Test concurrent modifications from multiple tabs
- [ ] Test performance with large amounts of user data mixed with demo data

## Impact Assessment

### User Experience Impact
- **High**: Users can see their actual data prioritized over demo data
- **High**: Rich UI presentation maintained with demo data fallback
- **Medium**: Clear visual distinction between user and demo data
- **Low**: Enhanced real-time feedback and synchronization

### Data Integrity Impact
- **High**: User data is properly tracked and displayed with priority
- **Medium**: Demo data provides consistent fallback for empty states
- **Low**: Enhanced error handling and data validation

## Implementation Priority

### Phase 1 (Immediate - High Priority)
1. Implement hybrid data approach (real + mock data integration)
2. Add visual indicators to distinguish user vs demo data
3. Implement real-time event-based synchronization
4. Add enhanced toast notifications and user feedback

### Phase 2 (Short-term - Important)
1. Create enhanced custom hooks for data management
2. Implement centralized DataProvider context
3. Add comprehensive error handling and loading states
4. Create thorough testing suite for hybrid data approach

### Phase 3 (Long-term - Enhancement)
1. Add data export/import functionality
2. Implement offline synchronization capabilities
3. Add data analytics and user insights
4. Optimize performance with data virtualization and caching

## Labels
- `enhancement`
- `hybrid-data`
- `real-time-sync`
- `user-experience`
- `localStorage`
- `visual-indicators`
- `data-integration`

## Created Date
July 14, 2025

## Status
� **Enhanced Approach** - Hybrid data integration for optimal UX

## Dependencies
- Keep existing mock data intact for UI richness
- Implement alongside existing localStorage functionality
- No breaking changes to current user experience
