'use client';

import { aiService } from '@/lib/ai-service';
import { useUserData } from '@/components/providers/user-data-provider';
import { ProductData } from '@/types';
import { 
  ChartBarIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  MinusIcon,
  TrophyIcon,
  FireIcon,
  HeartIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface ConsumptionAnalysisProps {
  onClose?: () => void;
}

interface ConsumptionInsight {
  insights: string[];
  trends: {
    averageGrade: string;
    sugarTrend: 'increasing' | 'decreasing' | 'stable';
    healthScore: number;
  };
  recommendations: string[];
  challenges: Array<{
    title: string;
    description: string;
    target: string;
    progress: number;
  }>;
}

export const ConsumptionAnalysis = ({ onClose }: ConsumptionAnalysisProps) => {
  const { userData } = useUserData();
  const [analysis, setAnalysis] = useState<ConsumptionInsight | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [consumptionHistory, setConsumptionHistory] = useState<any[]>([]);

  // Mock consumption history for demo
  const mockConsumptionHistory = [
    {
      id: '1',
      product: {
        product_name: 'Chocolate Milk',
        nutrition_grades: 'C',
        nutriments: { sugars_100g: 12.5, fat_100g: 3.2, salt_100g: 0.1 }
      },
      timestamp: new Date(Date.now() - 86400000 * 7), // 7 days ago
      rating: 3
    },
    {
      id: '2',
      product: {
        product_name: 'Whole Wheat Bread',
        nutrition_grades: 'B',
        nutriments: { sugars_100g: 4.2, fat_100g: 2.1, salt_100g: 0.8 }
      },
      timestamp: new Date(Date.now() - 86400000 * 5), // 5 days ago
      rating: 4
    },
    {
      id: '3',
      product: {
        product_name: 'Greek Yogurt',
        nutrition_grades: 'A',
        nutriments: { sugars_100g: 3.8, fat_100g: 1.2, salt_100g: 0.1 }
      },
      timestamp: new Date(Date.now() - 86400000 * 3), // 3 days ago
      rating: 5
    },
    {
      id: '4',
      product: {
        product_name: 'Organic Granola',
        nutrition_grades: 'B',
        nutriments: { sugars_100g: 8.5, fat_100g: 12.3, salt_100g: 0.2 }
      },
      timestamp: new Date(Date.now() - 86400000 * 1), // 1 day ago
      rating: 4
    }
  ];

  useEffect(() => {
    loadAnalysis();
  }, []);

  const loadAnalysis = async () => {
    if (!userData) return;

    setIsLoading(true);
    try {
      // Load consumption history from localStorage
      const storedHistory = JSON.parse(localStorage.getItem('nutripal-scan-history') || '[]');
      const history = storedHistory.length > 0 ? storedHistory : mockConsumptionHistory;
      setConsumptionHistory(history);

      // Get AI analysis
      const result = await aiService.analyzeConsumptionPatterns(userData, history);
      setAnalysis(result);

    } catch (error) {
      console.error('Failed to load analysis:', error);
      toast.error('Failed to load consumption analysis');
    } finally {
      setIsLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUpIcon className="w-5 h-5 text-red-500" />;
      case 'decreasing':
        return <TrendingDownIcon className="w-5 h-5 text-green-500" />;
      default:
        return <MinusIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return 'text-red-600';
      case 'decreasing':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getGradeColor = (grade: string) => {
    const colors = {
      'A': 'bg-sage-green text-white',
      'B': 'bg-light-green text-gray-800',
      'C': 'bg-yellow-400 text-gray-800',
      'D': 'bg-orange-400 text-white',
      'E': 'bg-red-500 text-white'
    };
    return colors[grade as keyof typeof colors] || 'bg-gray-400 text-white';
  };

  if (isLoading) {
    return (
      <div className="bg-warm-white rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-sage-green to-light-green rounded-full flex items-center justify-center">
            <ChartBarIcon className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Analyzing Your Patterns</h3>
            <p className="text-sm text-gray-600">AI is processing your consumption data...</p>
          </div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-cream rounded-lg p-4">
                <div className="h-4 bg-light-green/30 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-light-green/20 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="bg-warm-white rounded-2xl p-6 text-center">
        <ChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="font-semibold text-gray-900 mb-2">No Data Available</h3>
        <p className="text-gray-600">Start scanning products to see your consumption analysis!</p>
      </div>
    );
  }

  return (
    <div className="bg-warm-white rounded-2xl p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-sage-green to-light-green rounded-full flex items-center justify-center">
            <ChartBarIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Consumption Analysis</h3>
            <p className="text-sm text-gray-600">AI-powered insights from your blockchain data</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {/* Health Score Overview */}
      <div className="bg-gradient-to-r from-sage-green/10 to-light-green/10 border border-sage-green/30 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
            <HeartIcon className="w-5 h-5 text-sage-green" />
            Your Health Score
          </h4>
          <div className="text-3xl font-bold text-sage-green">{analysis.trends.healthScore}</div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-2 ${getGradeColor(analysis.trends.averageGrade)}`}>
              {analysis.trends.averageGrade}
            </div>
            <div className="text-sm text-gray-600">Average Grade</div>
          </div>
          <div>
            <div className="flex items-center justify-center mb-2">
              {getTrendIcon(analysis.trends.sugarTrend)}
            </div>
            <div className={`text-sm font-medium ${getTrendColor(analysis.trends.sugarTrend)}`}>
              Sugar Trend
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-700 mb-2">{consumptionHistory.length}</div>
            <div className="text-sm text-gray-600">Products Scanned</div>
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-cream border border-light-green rounded-xl p-4">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <SparklesIcon className="w-5 h-5 text-sage-green" />
          AI Insights
        </h4>
        <ul className="space-y-2">
          {analysis.insights.map((insight, index) => (
            <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-sage-green rounded-full mt-2 flex-shrink-0"></div>
              {insight}
            </li>
          ))}
        </ul>
      </div>

      {/* Recent Consumption */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900">Recent Consumption</h4>
        <div className="space-y-3">
          {consumptionHistory.slice(0, 4).map((item, index) => (
            <div key={index} className="bg-cream border border-light-green rounded-lg p-3">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getGradeColor(item.product.nutrition_grades)}`}>
                  {item.product.nutrition_grades}
                </div>
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900">{item.product.product_name}</h5>
                  <p className="text-sm text-gray-600">
                    {item.product.nutriments.sugars_100g}g sugar • {item.product.nutriments.fat_100g}g fat
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-3 h-3 rounded-full ${
                        i < item.rating ? 'bg-sage-green' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Challenges */}
      {analysis.challenges.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
            <TrophyIcon className="w-5 h-5 text-sage-green" />
            Active Challenges
          </h4>
          <div className="space-y-3">
            {analysis.challenges.map((challenge, index) => (
              <div key={index} className="bg-gradient-to-r from-sage-green/5 to-light-green/5 border border-sage-green/20 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-gray-900">{challenge.title}</h5>
                  <div className="flex items-center gap-1">
                    <FireIcon className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-medium text-orange-600">{challenge.progress}%</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">{challenge.description}</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium text-sage-green">{challenge.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-sage-green to-light-green h-2 rounded-full transition-all duration-300"
                      style={{ width: `${challenge.progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500">Target: {challenge.target}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {analysis.recommendations.length > 0 && (
        <div className="bg-light-green/20 border border-light-green rounded-xl p-4">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <SparklesIcon className="w-5 h-5 text-sage-green" />
            Personalized Recommendations
          </h4>
          <ul className="space-y-2">
            {analysis.recommendations.map((rec, index) => (
              <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-sage-green rounded-full mt-2 flex-shrink-0"></div>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
