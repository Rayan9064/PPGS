'use client';

import { useWeb } from '@/components/providers/web-provider';
import { ProductData } from '@/types';
import { getNutritionGrade } from '@/utils/grading-logic';
import { ArrowLeftIcon, ClockIcon, FireIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

interface ConsumedProduct {
  id: string;
  product: ProductData;
  timestamp: Date;
  quantity: number;
  calories: number;
  isUserData?: boolean; // Add flag to distinguish user vs demo data
}

// Data source indicator component
const DataSourceBadge = ({ isUserData }: { isUserData: boolean }) => (
  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
    isUserData 
      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
  }`}>
    {isUserData ? '🍽️ You Consumed' : '📋 Demo Data'}
  </div>
);

export default function ConsumedProducts() {
  const { hapticFeedback } = useWeb();
  const [consumedProducts, setConsumedProducts] = useState<ConsumedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Mock data for demo purposes
  const mockConsumedProducts: ConsumedProduct[] = [
    {
      id: 'demo-1',
      product: {
        code: '123456789',
        product_name: 'Organic Greek Yogurt',
        brands: 'Chobani',
        ingredients_text: 'Organic milk, live cultures',
        nutrition_grades: 'a',
        nutriments: { sugars_100g: 6, fat_100g: 0, salt_100g: 0.1 }
      },
      timestamp: new Date(),
      quantity: 1,
      calories: 150,
      isUserData: false
    },
    {
      id: 'demo-2',
      product: {
        code: '987654321',
        product_name: 'Whole Grain Bread',
        brands: 'Dave\'s Killer Bread',
        ingredients_text: 'Whole wheat flour, water, yeast',
        nutrition_grades: 'b',
        nutriments: { sugars_100g: 5, fat_100g: 4, salt_100g: 1.2 }
      },
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      quantity: 2,
      calories: 140,
      isUserData: false
    }
  ];

  // Load combined data (real + mock)
  useEffect(() => {
    const loadConsumedProducts = () => {
      setIsLoading(true);
      
      try {
        // Load real consumed products from localStorage
        const realConsumed = JSON.parse(localStorage.getItem('nutripal-consumed') || '[]');
        
        // Convert localStorage format to component format
        const userConsumed: ConsumedProduct[] = realConsumed.map((item: any) => ({
          id: item.id,
          product: item.product,
          timestamp: new Date(item.timestamp),
          quantity: item.quantity,
          calories: item.calories,
          isUserData: true
        }));
        
        // Combine with mock data, filtering out duplicates
        const combinedConsumed = [
          ...userConsumed, // Real user consumption first
          ...mockConsumedProducts.filter(mock => 
            !userConsumed.some(real => real.product.code === mock.product.code)
          ) // Mock data for products not consumed by user
        ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()); // Sort by timestamp, newest first
        
        setConsumedProducts(combinedConsumed);
      } catch (error) {
        console.error('Error loading consumed products:', error);
        // Fallback to mock data if localStorage fails
        setConsumedProducts(mockConsumedProducts);
      } finally {
        setIsLoading(false);
      }
    };

    loadConsumedProducts();

    // Listen for consumption updates
    const handleConsumptionUpdate = () => {
      loadConsumedProducts();
    };

    window.addEventListener('consumptionUpdated', handleConsumptionUpdate);
    return () => {
      window.removeEventListener('consumptionUpdated', handleConsumptionUpdate);
    };
  }, []);

  const todayConsumed = consumedProducts.filter(item => 
    new Date(item.timestamp).toDateString() === new Date().toDateString()
  );

  const totalCaloriesToday = todayConsumed.reduce((sum, item) => sum + item.calories, 0);
  const dailyCalorieGoal = 2000;

  const getGradeColor = (grade: string) => {
    const colors = {
      'A': 'bg-green-500',
      'B': 'bg-lime-500',
      'C': 'bg-yellow-500', 
      'D': 'bg-orange-500',
      'E': 'bg-red-500'
    };
    return colors[grade.toUpperCase() as keyof typeof colors] || 'bg-gray-500';
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 overflow-y-auto">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 py-4 pt-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => window.history.back()}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <ArrowLeftIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Consumed Products</h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Track your daily nutrition intake</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Daily Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Today's Summary</h2>
            <FireIcon className="w-6 h-6 text-orange-500" />
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalCaloriesToday}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Calories Consumed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{dailyCalorieGoal - totalCaloriesToday}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Remaining</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div 
              className="bg-emerald-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((totalCaloriesToday / dailyCalorieGoal) * 100, 100)}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-2">
            <span>0</span>
            <span>{dailyCalorieGoal} cal goal</span>
          </div>
        </div>

        {/* Consumed Products List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Consumption</h2>
          </div>
          
          {isLoading ? (
            <div className="px-6 py-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 dark:border-orange-400 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading consumption data...</p>
            </div>
          ) : todayConsumed.length > 0 ? (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {todayConsumed.map((item) => {
                const grade = getNutritionGrade(item.product);
                return (
                  <div key={item.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${getGradeColor(grade.grade)}`}>
                            {grade.grade}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900 dark:text-white">{item.product.product_name}</h3>
                              <DataSourceBadge isUserData={item.isUserData || false} />
                            </div>
                            {item.product.brands && (
                              <p className="text-sm text-gray-500 dark:text-gray-400">{item.product.brands}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <ClockIcon className="w-4 h-4" />
                            <span>{formatTime(item.timestamp)}</span>
                          </div>
                          <span>•</span>
                          <span>{item.calories} calories</span>
                          <span>•</span>
                          <span>Qty: {item.quantity}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="px-6 py-12 text-center">
              <FireIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No products consumed today</h3>
              <p className="text-gray-500 mb-6">Start scanning products to track your nutrition!</p>
              <button 
                onClick={() => {
                  hapticFeedback.impact('medium');
                  window.history.back();
                }}
                className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-6 py-3 font-semibold transition-colors"
              >
                Scan a Product
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
