'use client';

import { ArrowLeftIcon, EnvelopeIcon, PhoneIcon, ChatBubbleLeftRightIcon, ClockIcon, MapPinIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ContactUs() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const categories = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'technical', label: 'Technical Support' },
    { value: 'bug', label: 'Bug Report' },
    { value: 'feature', label: 'Feature Request' },
    { value: 'billing', label: 'Billing Question' },
    { value: 'privacy', label: 'Privacy Concern' },
  ];

  const contactMethods = [
    {
      icon: EnvelopeIcon,
      title: 'Email Support',
      description: 'Get help via email',
      contact: 'support@nutrigrade.app',
      responseTime: 'Within 24 hours',
      color: 'text-red-500',
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: 'Live Chat',
      description: 'Chat with our team',
      contact: 'Available 9 AM - 6 PM EST',
      responseTime: 'Instant response',
      color: 'text-green-500',
    },
    {
      icon: PhoneIcon,
      title: 'Phone Support',
      description: 'Call us directly',
      contact: '+1 (555) 123-4567',
      responseTime: 'Mon-Fri 9 AM - 5 PM EST',
      color: 'text-purple-500',
    },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        name: '',
        email: '',
        subject: '',
        category: '',
        message: '',
      });
    }, 3000);
  };

  const handleBack = () => {
    router.push('/profile');
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full mx-auto mb-6 flex items-center justify-center">
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-secondary-900 mb-2">Message Sent!</h1>
          <p className="text-secondary-600 mb-6">
            Thank you for contacting us. We'll get back to you within 24 hours.
          </p>
          <button
            onClick={handleBack}
            className="bg-primary-500 text-white font-medium py-3 px-6 rounded-xl"
          >
            Back to App
          </button>
        </div>
      </div>
    );
  }

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
              <h1 className="text-2xl font-bold text-secondary-900">Contact Us</h1>
              <p className="text-sm text-secondary-600">We're here to help you</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        {/* Contact Methods */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-secondary-900 mb-3">Get in Touch</h2>
          <div className="space-y-3">
            {contactMethods.map((method, index) => (
              <div key={index} className="bg-white rounded-2xl border border-secondary-200 p-4">
                <div className="flex items-start gap-3">
                  <method.icon className={`w-6 h-6 ${method.color} mt-1 flex-shrink-0`} />
                  <div className="flex-1">
                    <h3 className="font-medium text-secondary-900">{method.title}</h3>
                    <p className="text-sm text-secondary-600 mb-1">{method.description}</p>
                    <p className="text-sm font-medium text-primary-600">{method.contact}</p>
                    <p className="text-xs text-secondary-500 mt-1">{method.responseTime}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Form */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-secondary-900 mb-3">Send us a Message</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-secondary-200 bg-white text-secondary-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-secondary-200 bg-white text-secondary-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-secondary-200 bg-white text-secondary-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Subject *
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-secondary-200 bg-white text-secondary-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Brief description of your inquiry"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Message *
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                required
                rows={5}
                className="w-full px-4 py-3 rounded-xl border-2 border-secondary-200 bg-white text-secondary-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                placeholder="Please provide as much detail as possible..."
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary-500 hover:bg-primary-600 text-white font-medium py-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  Send Message
                  <PaperAirplaneIcon className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Office Information */}
        <div className="bg-primary-100 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">Our Office</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <MapPinIcon className="w-5 h-5 text-primary-500 mt-1 flex-shrink-0" />
              <div>
                <p className="font-medium text-secondary-900">NutriGrade Headquarters</p>
                <p className="text-sm text-secondary-600">123 Health Street, Suite 100</p>
                <p className="text-sm text-secondary-600">San Francisco, CA 94105</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ClockIcon className="w-5 h-5 text-primary-500 mt-1 flex-shrink-0" />
              <div>
                <p className="font-medium text-secondary-900">Business Hours</p>
                <p className="text-sm text-secondary-600">Monday - Friday: 9:00 AM - 6:00 PM EST</p>
                <p className="text-sm text-secondary-600">Saturday: 10:00 AM - 4:00 PM EST</p>
                <p className="text-sm text-secondary-600">Sunday: Closed</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
