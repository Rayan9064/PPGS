'use client';

import { useState } from 'react';
import { ArrowLeftIcon, ClockIcon, QrCodeIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { useTelegram } from '@/components/providers/telegram-provider';
import { ProductData } from '@/types';
import { getNutritionGrade } from '@/utils/grading-logic';

interface ScanHistoryItem {
  id: string;
  product: ProductData;
  timestamp: Date;
  scanLocation?: string;
}

export default function ScanHistory() {
  const { hapticFeedback } = useTelegram();
  
  // Mock scan history data
  const [scanHistory] = useState<ScanHistoryItem[]>([
    {
      id: '1',
      product: {
        code: '123456789',
        product_name: 'Organic Greek Yogurt',
        brands: 'Chobani',
        ingredients_text: 'Organic milk, live cultures',
        nutrition_grades: 'a',
        nutriments: { sugars_100g: 6, fat_100g: 0, salt_100g: 0.1 }
      },
      timestamp: new Date(),
      scanLocation: 'Home'
    },
    {
      id: '2',
      product: {
        code: '987654321',
        product_name: 'Whole Grain Bread',
        brands: 'Dave\'s Killer Bread',
        ingredients_text: 'Whole wheat flour, water, yeast',
        nutrition_grades: 'b',
        nutriments: { sugars_100g: 5, fat_100g: 4, salt_100g: 1.2 }
      },
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      scanLocation: 'Grocery Store'
    },
    {
      id: '3',
      product: {
        code: '456789123',
        product_name: 'Energy Drink',
        brands: 'Monster',
        ingredients_text: 'Water, sugar, caffeine',
        nutrition_grades: 'e',
        nutriments: { sugars_100g: 28, fat_100g: 0, salt_100g: 0.2 }
      },
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      scanLocation: 'Office'
    }
  ]);

  const [filter, setFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

  const getFilteredHistory = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    switch (filter) {
      case 'today':
        return scanHistory.filter(item => item.timestamp >= today);
      case 'week':
        return scanHistory.filter(item => item.timestamp >= weekAgo);
      case 'month':
        return scanHistory.filter(item => item.timestamp >= monthAgo);
      default:
        return scanHistory;
    }
  };

  const filteredHistory = getFilteredHistory();

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

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const groupHistoryByDate = () => {
    const groups: { [key: string]: ScanHistoryItem[] } = {};
    
    filteredHistory.forEach(item => {
      const date = item.timestamp.toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(item);
    });

    return Object.entries(groups).sort(([a], [b]) => 
      new Date(b).getTime() - new Date(a).getTime()
    );
  };

  const groupedHistory = groupHistoryByDate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 overflow-y-auto">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 py-4 pt-4">
          <div className="flex items-center gap-3 mb-4">
            <button 
              onClick={() => window.history.back()}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <ArrowLeftIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Scan History</h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm">View all your scanned products</p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2">
            {[
              { key: 'all', label: 'All' },
              { key: 'today', label: 'Today' },
              { key: 'week', label: 'Week' },
              { key: 'month', label: 'Month' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  hapticFeedback.impact('light');
                  setFilter(tab.key as any);
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  filter === tab.key
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-sm">
            <QrCodeIcon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-xl font-bold text-gray-900 dark:text-white">{filteredHistory.length}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Total Scans</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-sm">
            <CalendarIcon className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {new Set(filteredHistory.map(item => item.timestamp.toDateString())).size}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Active Days</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-sm">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {filteredHistory.filter(item => {
                const grade = getNutritionGrade(item.product);
                return ['A', 'B'].includes(grade.grade);
              }).length}
            </p>
            <p className="text-xs text-gray-500">Healthy</p>
          </div>
        </div>

        {/* History List */}
        {groupedHistory.length > 0 ? (
          <div className="space-y-4">
            {groupedHistory.map(([dateString, items]) => (
              <div key={dateString} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-3 bg-gray-50 border-b border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-900">
                    {new Date(dateString).toDateString() === new Date().toDateString() 
                      ? 'Today' 
                      : new Date(dateString).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          month: 'short', 
                          day: 'numeric' 
                        })
                    }
                  </h3>
                </div>
                <div className="divide-y divide-gray-100">
                  {items.map((item) => {
                    const grade = getNutritionGrade(item.product);
                    return (
                      <div key={item.id} className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${getGradeColor(grade.grade)}`}>
                            {grade.grade}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{item.product.product_name}</h3>
                            {item.product.brands && (
                              <p className="text-sm text-gray-500">{item.product.brands}</p>
                            )}
                            <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                              <ClockIcon className="w-3 h-3" />
                              <span>{formatDate(item.timestamp)}</span>
                              {item.scanLocation && (
                                <>
                                  <span>•</span>
                                  <span>{item.scanLocation}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm">
            <QrCodeIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No scans found</h3>
            <p className="text-gray-500 mb-6">
              {filter === 'all' 
                ? 'Start scanning products to build your history!'
                : `No scans found for the selected ${filter} period.`
              }
            </p>
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
  );
}
