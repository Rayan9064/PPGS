'use client';

import { ArrowLeftIcon, QuestionMarkCircleIcon, MagnifyingGlassIcon, ChatBubbleLeftRightIcon, BookOpenIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HelpCenter() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All Topics' },
    { id: 'scanning', label: 'Scanning Products' },
    { id: 'nutrition', label: 'Nutrition Info' },
    { id: 'account', label: 'Account & Profile' },
    { id: 'technical', label: 'Technical Issues' },
  ];

  const faqs = [
    {
      id: 1,
      category: 'scanning',
      question: 'How do I scan a product barcode?',
      answer: 'To scan a product barcode, tap the "Scan" button in the bottom navigation, then point your camera at the barcode. Make sure the barcode is well-lit and clearly visible. The app will automatically detect and process the barcode.',
    },
    {
      id: 2,
      category: 'scanning',
      question: 'What if the barcode doesn\'t work?',
      answer: 'If the barcode doesn\'t scan, try cleaning your camera lens, ensuring good lighting, and holding the phone steady. You can also manually enter the barcode number using the "Enter Barcode Manually" option.',
    },
    {
      id: 3,
      category: 'nutrition',
      question: 'How are nutrition grades calculated?',
      answer: 'Nutrition grades (A-E) are calculated based on the product\'s nutritional content, including calories, sugar, salt, saturated fat, and fiber. Grade A represents the healthiest options, while Grade E indicates products to consume in moderation.',
    },
    {
      id: 4,
      category: 'nutrition',
      question: 'Can I trust the nutrition information?',
      answer: 'Our nutrition data comes from reliable databases and is regularly updated. However, we recommend checking the product packaging for the most current information, as formulations may change.',
    },
    {
      id: 5,
      category: 'account',
      question: 'How do I update my profile information?',
      answer: 'Go to the Profile tab, then tap "Edit Profile" to update your personal information, health goals, and dietary preferences. Changes are saved automatically.',
    },
    {
      id: 6,
      category: 'account',
      question: 'Is my data secure?',
      answer: 'Yes, your data is stored locally on your device and is never shared with third parties. We prioritize your privacy and data security.',
    },
    {
      id: 7,
      category: 'technical',
      question: 'The app is running slowly. What should I do?',
      answer: 'Try closing and reopening the app, clearing your browser cache, or restarting your device. If the issue persists, contact our support team.',
    },
    {
      id: 8,
      category: 'technical',
      question: 'How do I report a bug?',
      answer: 'You can report bugs by going to Contact Us in the Profile section. Please include details about what happened and when it occurred.',
    },
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleBack = () => {
    router.push('/profile');
  };

  return (
    <div className="min-h-screen bg-primary-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-primary-50 border-b border-primary-200 shadow-sm">
        <div className="px-6 py-4 pt-12">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="p-2 rounded-xl"
            >
              <ArrowLeftIcon className="w-6 h-6 text-secondary-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-secondary-900">Help Center</h1>
              <p className="text-sm text-secondary-600">Find answers to common questions</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
            <input
              type="text"
              placeholder="Search for help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-secondary-200 bg-white text-secondary-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-secondary-900 mb-3">Browse by Category</h2>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                  selectedCategory === category.id
                    ? 'bg-primary-500 text-white'
                    : 'bg-white text-secondary-600 border border-secondary-200 hover:bg-primary-100'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-secondary-900 mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <button className="p-4 bg-white rounded-2xl border border-secondary-200 hover:bg-primary-50 transition-colors text-left">
              <ChatBubbleLeftRightIcon className="w-6 h-6 text-primary-500 mb-2" />
              <div className="font-medium text-secondary-900">Live Chat</div>
              <div className="text-sm text-secondary-600">Get instant help</div>
            </button>
            <button className="p-4 bg-white rounded-2xl border border-secondary-200 hover:bg-primary-50 transition-colors text-left">
              <BookOpenIcon className="w-6 h-6 text-primary-500 mb-2" />
              <div className="font-medium text-secondary-900">User Guide</div>
              <div className="text-sm text-secondary-600">Complete tutorial</div>
            </button>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-secondary-900 mb-3">
            Frequently Asked Questions
            {filteredFaqs.length !== faqs.length && (
              <span className="text-sm font-normal text-secondary-600 ml-2">
                ({filteredFaqs.length} of {faqs.length} questions)
              </span>
            )}
          </h2>
          <div className="space-y-3">
            {filteredFaqs.map((faq) => (
              <div key={faq.id} className="bg-white rounded-2xl border border-secondary-200 p-4">
                <div className="flex items-start gap-3">
                  <QuestionMarkCircleIcon className="w-5 h-5 text-primary-500 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-medium text-secondary-900 mb-2">{faq.question}</h3>
                    <p className="text-sm text-secondary-600 leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Support */}
        <div className="bg-primary-100 rounded-2xl p-6 text-center">
          <ExclamationTriangleIcon className="w-8 h-8 text-primary-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-secondary-900 mb-2">Still need help?</h3>
          <p className="text-secondary-600 mb-4">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <button
            onClick={() => window.location.href = '/profile/contact-us'}
            className="bg-primary-500 hover:bg-primary-600 text-white font-medium py-3 px-6 rounded-xl transition-colors"
          >
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
}
