'use client';

import { useWeb } from '@/components/providers/web-provider';
import { QrCodeIcon, ShieldCheckIcon, SparklesIcon } from '@heroicons/react/24/outline';

interface WelcomeScreenProps {
  onStartScanning: () => void;
}

export const WelcomeScreen = ({ onStartScanning }: WelcomeScreenProps) => {
  const { hapticFeedback } = useWeb();

  const handleStartScanning = () => {
    hapticFeedback.impact('medium');
    onStartScanning();
  };

  const gradeExamples = [
    { grade: 'A', color: 'bg-grade-a', description: 'Excellent nutritional value' },
    { grade: 'B', color: 'bg-grade-b', description: 'Good nutritional value' },
    { grade: 'C', color: 'bg-grade-c text-black', description: 'Average nutritional value' },
    { grade: 'D', color: 'bg-grade-d', description: 'Below average nutritional value' },
    { grade: 'E', color: 'bg-grade-e', description: 'Poor nutritional value' },
  ];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
          <QrCodeIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Nutripal</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Scan product barcodes to get detailed nutrition information and health grading
        </p>
      </div>

      {/* Start Scanning Button */}
      <button
        onClick={handleStartScanning}
        className="w-full btn-primary mb-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
      >
        <QrCodeIcon className="w-6 h-6 inline mr-2" />
        Start Scanning
      </button>

      {/* Features */}
      <div className="grid gap-4 mb-8">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
            <SparklesIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">Instant Analysis</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Get immediate nutrition facts and grading</p>
          </div>
        </div>
        
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
            <ShieldCheckIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">Health Warnings</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Alerts for high sugar, fat, or salt content</p>
          </div>
        </div>
      </div>

      {/* Grading System */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-6 shadow-lg border border-indigo-100 dark:border-gray-600">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center float-animation">
            <SparklesIcon className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Nutrition Grading System
          </h3>
        </div>
        <div className="grid gap-4">
          {gradeExamples.map((item, index) => (
            <div 
              key={item.grade} 
              className="flex items-center space-x-4 p-4 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl border border-white/50 dark:border-gray-600/50 animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-bold ${item.color} shadow-lg`}>
                <span className="relative z-10">{item.grade}</span>
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900 dark:text-white mb-1 text-lg">
                  {item.description.split(' ')[0]} {/* First word like "Excellent" */}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {item.description}
                </p>
              </div>
              <div className="w-2 h-8 bg-gradient-to-b from-indigo-400 to-purple-400 rounded-full grade-indicator"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
