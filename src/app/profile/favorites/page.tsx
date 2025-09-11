'use client';

import { useState, useEffect } from 'react';
import { ArrowLeftIcon, StarIcon, HeartIcon, TrashIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { useWeb } from '@/components/providers/web-provider';
import { ProductData } from '@/types';
import { getNutritionGrade } from '@/utils/grading-logic';
import toast from 'react-hot-toast';

interface FavoriteProduct {
  id: string;
  product: ProductData;
  dateAdded: Date;
  category?: string;
  isUserData?: boolean; // Add flag to distinguish user vs demo data
}

// Data source indicator component
const DataSourceBadge = ({ isUserData }: { isUserData: boolean }) => (
  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
    isUserData 
      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
  }`}>
    {isUserData ? '❤️ Your Favorite' : '📋 Demo Data'}
  </div>
);

export default function Favorites() {
  const { hapticFeedback } = useWeb();
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // Web user info
  const [webUser, setWebUser] = useState<any>(null);

  // Get Web user info on mount
  useEffect(() => {
    // Mock web user for demo
    setWebUser({
      id: 'web-user-123',
      firstName: 'Web',
      lastName: 'User',
      username: 'webuser'
    });
  }, []);

  // Mock favorites data for demo purposes
  const mockFavorites: FavoriteProduct[] = [
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
      dateAdded: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      category: 'Dairy',
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
      dateAdded: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      category: 'Grains',
      isUserData: false
    },
    {
      id: 'demo-3',
      product: {
        code: '456789123',
        product_name: 'Organic Almonds',
        brands: 'Blue Diamond',
        ingredients_text: 'Organic almonds',
        nutrition_grades: 'b',
        nutriments: { sugars_100g: 4, fat_100g: 50, salt_100g: 0.01 }
      },
      dateAdded: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      category: 'Nuts',
      isUserData: false
    }
  ];

  // Load combined data (real + mock)
  useEffect(() => {
    const loadFavorites = () => {
      setIsLoading(true);
      
      try {
        // Load real favorites from localStorage
        const realFavorites = JSON.parse(localStorage.getItem('nutripal-favorites') || '[]');
        
        // Convert localStorage format to component format
        const userFavorites: FavoriteProduct[] = realFavorites.map((fav: any) => ({
          id: fav.id,
          product: fav.product,
          dateAdded: new Date(fav.dateAdded),
          category: fav.category || 'User Favorite',
          isUserData: true
        }));
        
        // Combine with mock data, filtering out duplicates
        const combinedFavorites = [
          ...userFavorites, // Real user favorites first
          ...mockFavorites.filter(mock => 
            !userFavorites.some(real => real.product.code === mock.product.code)
          ) // Mock data for products not favorited by user
        ].sort((a, b) => b.dateAdded.getTime() - a.dateAdded.getTime()); // Sort by date, newest first
        
        setFavorites(combinedFavorites);
      } catch (error) {
        console.error('Error loading favorites:', error);
        // Fallback to mock data if localStorage fails
        setFavorites(mockFavorites);
      } finally {
        setIsLoading(false);
      }
    };

    loadFavorites();

    // Listen for favorites updates
    const handleFavoritesUpdate = () => {
      loadFavorites();
    };

    window.addEventListener('favoritesUpdated', handleFavoritesUpdate);
    return () => {
      window.removeEventListener('favoritesUpdated', handleFavoritesUpdate);
    };
  }, []);

  const [filter, setFilter] = useState<'all' | 'recent' | 'healthy'>('all');
  const [editMode, setEditMode] = useState(false);

  const removeFavorite = (id: string, isUserData: boolean) => {
    hapticFeedback.impact('medium');
    
    if (isUserData) {
      // Remove from localStorage
      const currentFavorites = JSON.parse(localStorage.getItem('nutripal-favorites') || '[]');
      const updatedFavorites = currentFavorites.filter((fav: any) => fav.id !== id);
      localStorage.setItem('nutripal-favorites', JSON.stringify(updatedFavorites));
      
      // Dispatch event for real-time updates
      window.dispatchEvent(new CustomEvent('favoritesUpdated'));
      
      toast.success('Removed from favorites');
    } else {
      // For demo data, just remove from local state
      setFavorites(prev => prev.filter(fav => fav.id !== id));
      toast.success('Demo item removed');
    }
  };

  const getFilteredFavorites = () => {
    switch (filter) {
      case 'recent':
        return favorites
          .filter(fav => new Date().getTime() - fav.dateAdded.getTime() < 7 * 24 * 60 * 60 * 1000)
          .sort((a, b) => b.dateAdded.getTime() - a.dateAdded.getTime());
      case 'healthy':
        return favorites.filter(fav => {
          const grade = getNutritionGrade(fav.product);
          return ['A', 'B'].includes(grade.grade);
        });
      default:
        return favorites.sort((a, b) => b.dateAdded.getTime() - a.dateAdded.getTime());
    }
  };

  const filteredFavorites = getFilteredFavorites();

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
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const groupFavoritesByCategory = () => {
    const groups: { [key: string]: FavoriteProduct[] } = {};
    
    filteredFavorites.forEach(fav => {
      const category = fav.category || 'Other';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(fav);
    });

    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  };

  const groupedFavorites = groupFavoritesByCategory();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 overflow-y-auto">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 py-4 pt-4 flex items-center gap-4">
          <button 
            onClick={() => window.history.back()}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowLeftIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Favorites</h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Your saved healthy products</p>
          </div>
          <button
            onClick={() => {
              hapticFeedback.impact('light');
              setEditMode(!editMode);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              editMode 
                ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {editMode ? 'Done' : 'Edit'}
          </button>
        </div>

        {/* Telegram User Info */}
        {webUser && (
          <div className="px-4 pb-2 flex items-center gap-3">
            {webUser.photo_url && (
              <img
                src={webUser.photo_url}
                alt="Telegram Avatar"
                className="w-10 h-10 rounded-full border border-gray-300 dark:border-gray-700"
                onError={e => (e.currentTarget.style.display = 'none')}
              />
            )}
            <div>
              <div className="font-semibold text-gray-900 dark:text-white">{webUser.firstName} {webUser.lastName}</div>
              {webUser.username && <div className="text-xs text-gray-500 dark:text-gray-400">@{webUser.username}</div>}
              <div className="text-xs text-gray-400 dark:text-gray-500">User ID: {webUser.id}</div>
            </div>
          </div>
        )}
      </div>

      <div className="px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-sm">
            <StarIconSolid className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-xl font-bold text-gray-900 dark:text-white">{favorites.length}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Total Favorites</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-sm">
            <HeartIcon className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {favorites.filter(fav => {
                const grade = getNutritionGrade(fav.product);
                return ['A', 'B'].includes(grade.grade);
              }).length}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Healthy</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-sm">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">{groupedFavorites.length}</span>
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{groupedFavorites.length}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Categories</p>
          </div>
        </div>

        {/* Favorites List */}
        {isLoading ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center shadow-sm">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 dark:border-emerald-400 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading your favorites...</p>
          </div>
        ) : filteredFavorites.length > 0 ? (
          <div className="space-y-4">
            {groupedFavorites.map(([category, items]) => (
              <div key={category} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-100 dark:border-gray-600">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{category}</h3>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {items.map((favorite) => {
                    const grade = getNutritionGrade(favorite.product);
                    return (
                      <div key={favorite.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${getGradeColor(grade.grade)}`}>
                            {grade.grade}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900 dark:text-white">{favorite.product.product_name}</h3>
                              <DataSourceBadge isUserData={favorite.isUserData || false} />
                            </div>
                            {favorite.product.brands && (
                              <p className="text-sm text-gray-500 dark:text-gray-400">{favorite.product.brands}</p>
                            )}
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                              Added {formatDate(favorite.dateAdded)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <StarIconSolid className="w-5 h-5 text-yellow-500" />
                            {editMode && (
                              <button
                                onClick={() => removeFavorite(favorite.id, favorite.isUserData || false)}
                                className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                              >
                                <TrashIcon className="w-5 h-5 text-red-500 dark:text-red-400" />
                              </button>
                            )}
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
          <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center shadow-sm">
            <StarIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No favorites yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {filter === 'all' 
                ? 'Start marking products as favorites to save them here!'
                : `No favorites found for the selected ${filter} filter.`
              }
            </p>
            <button 
              onClick={() => {
                hapticFeedback.impact('medium');
                window.history.back();
              }}
              className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-6 py-3 font-semibold transition-colors"
            >
              Explore Products
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
