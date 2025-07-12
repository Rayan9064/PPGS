'use client';

import { QrCodeIcon, SparklesIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { useTelegram } from '@/components/providers/telegram-provider';

interface WelcomeScreenProps {
  onStartScanning: () => void;
}

export const WelcomeScreen = ({ onStartScanning }: WelcomeScreenProps) => {
  const { hapticFeedback } = useTelegram();

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
      <div className="card">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Nutrition Grading System</h3>
        <div className="space-y-3">
          {gradeExamples.map((item) => (
            <div key={item.grade} className="flex items-center space-x-3">
              <span className={`grade-badge w-8 h-8 text-sm ${item.color}`}>
                {item.grade}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">{item.description}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
