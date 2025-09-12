'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { useUserData } from '@/components/providers/user-data-provider';
import { contractService } from '@/lib/contract-service';
import { validateProduct } from '@/config/contract-config';
import {
  CubeIcon,
  DocumentChartBarIcon,
  PlusIcon,
  PencilIcon,
  EyeIcon,
  UserGroupIcon,
  BuildingStorefrontIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface AdminProduct {
  id: string;
  name: string;
  ingredients: string[];
}

export const AdminContractManagement = () => {
  const { isConnected, accounts } = useWallet();
  const { blockchainStats, refreshBlockchainStats } = useUserData();
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'bootstrap'>('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [contractOwner, setContractOwner] = useState<string | null>(null);
  const [contractVersion, setContractVersion] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  
  // Product management
  const [newProduct, setNewProduct] = useState<AdminProduct>({
    id: '',
    name: '',
    ingredients: []
  });
  const [ingredientInput, setIngredientInput] = useState('');
  const [updateProduct, setUpdateProduct] = useState<AdminProduct>({
    id: '',
    name: '',
    ingredients: []
  });

  // Check if current user is contract owner
  useEffect(() => {
    const checkOwnership = async () => {
      if (!contractService.isInitialized() || !isConnected || !accounts[0]) return;
      
      try {
        const owner = await contractService.getOwner();
        const version = await contractService.getVersion();
        setContractOwner(owner);
        setContractVersion(version);
        setIsOwner(owner.toLowerCase() === accounts[0].toLowerCase());
      } catch (error) {
        console.error('Failed to check ownership:', error);
      }
    };

    checkOwnership();
  }, [isConnected, accounts]);

  const handleBootstrap = async () => {
    if (!isOwner) {
      toast.error('Only contract owner can bootstrap');
      return;
    }

    setIsLoading(true);
    try {
      const txId = await contractService.bootstrap();
      toast.success(`Contract bootstrapped! TX: ${txId.slice(0, 8)}...`);
      await refreshBlockchainStats();
    } catch (error) {
      console.error('Bootstrap failed:', error);
      toast.error(error instanceof Error ? error.message : 'Bootstrap failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProduct = async () => {
    if (!newProduct.id || !newProduct.name || newProduct.ingredients.length === 0) {
      toast.error('Please fill all product fields');
      return;
    }

    try {
      validateProduct(newProduct);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Invalid product data');
      return;
    }

    setIsLoading(true);
    try {
      const txId = await contractService.addProduct(newProduct);
      toast.success(`Product added! TX: ${txId.slice(0, 8)}...`);
      
      // Reset form
      setNewProduct({ id: '', name: '', ingredients: [] });
      setIngredientInput('');
      
      await refreshBlockchainStats();
    } catch (error) {
      console.error('Add product failed:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to add product');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProduct = async () => {
    if (!updateProduct.id || !updateProduct.name || updateProduct.ingredients.length === 0) {
      toast.error('Please fill all update fields');
      return;
    }

    try {
      validateProduct(updateProduct);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Invalid product data');
      return;
    }

    setIsLoading(true);
    try {
      const txId = await contractService.updateProduct(updateProduct);
      toast.success(`Product updated! TX: ${txId.slice(0, 8)}...`);
      
      // Reset form
      setUpdateProduct({ id: '', name: '', ingredients: [] });
      
      await refreshBlockchainStats();
    } catch (error) {
      console.error('Update product failed:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update product');
    } finally {
      setIsLoading(false);
    }
  };

  const addIngredient = (isUpdate: boolean = false) => {
    if (!ingredientInput.trim()) return;
    
    if (isUpdate) {
      setUpdateProduct(prev => ({
        ...prev,
        ingredients: [...prev.ingredients, ingredientInput.trim()]
      }));
    } else {
      setNewProduct(prev => ({
        ...prev,
        ingredients: [...prev.ingredients, ingredientInput.trim()]
      }));
    }
    setIngredientInput('');
  };

  const removeIngredient = (index: number, isUpdate: boolean = false) => {
    if (isUpdate) {
      setUpdateProduct(prev => ({
        ...prev,
        ingredients: prev.ingredients.filter((_, i) => i !== index)
      }));
    } else {
      setNewProduct(prev => ({
        ...prev,
        ingredients: prev.ingredients.filter((_, i) => i !== index)
      }));
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 shadow-lg text-center max-w-md">
          <CubeIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Wallet Required</h2>
          <p className="text-gray-600 mb-4">Connect your wallet to access contract management</p>
        </div>
      </div>
    );
  }

  if (!contractService.isInitialized()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 shadow-lg text-center max-w-md">
          <ExclamationTriangleIcon className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Contract Not Initialized</h2>
          <p className="text-gray-600 mb-4">Initialize the contract service first</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <CubeIcon className="w-8 h-8 text-blue-600" />
              Contract Management
            </h1>
            <p className="text-gray-600 mt-2">
              Manage NutriGrade smart contract operations and view analytics
            </p>
            {contractOwner && (
              <div className="mt-4 flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${isOwner ? 'bg-green-400' : 'bg-yellow-400'}`} />
                  <span className="text-gray-600">
                    {isOwner ? 'Owner' : 'User'} • {contractOwner.slice(0, 8)}...{contractOwner.slice(-6)}
                  </span>
                </div>
                {contractVersion && (
                  <span className="text-gray-600">Version: {contractVersion}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            {[
              { id: 'overview', label: 'Overview', icon: EyeIcon },
              { id: 'products', label: 'Products', icon: BuildingStorefrontIcon },
              { id: 'bootstrap', label: 'Bootstrap', icon: ArrowPathIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-600 text-sm font-medium">Total Products</p>
                        <p className="text-2xl font-bold text-blue-900">
                          {blockchainStats.globalStats?.totalProducts.toString() || '0'}
                        </p>
                      </div>
                      <BuildingStorefrontIcon className="w-8 h-8 text-blue-500" />
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-600 text-sm font-medium">Total Scans</p>
                        <p className="text-2xl font-bold text-green-900">
                          {blockchainStats.globalStats?.totalScans.toString() || '0'}
                        </p>
                      </div>
                      <DocumentChartBarIcon className="w-8 h-8 text-green-500" />
                    </div>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-600 text-sm font-medium">Your Scans</p>
                        <p className="text-2xl font-bold text-purple-900">
                          {blockchainStats.userStats?.scanCount.toString() || '0'}
                        </p>
                      </div>
                      <UserGroupIcon className="w-8 h-8 text-purple-500" />
                    </div>
                  </div>

                  <div className="bg-orange-50 rounded-lg p-6 border border-orange-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-orange-600 text-sm font-medium">Contract Status</p>
                        <p className="text-lg font-bold text-orange-900">
                          {blockchainStats.isOptedIn ? 'Active' : 'Inactive'}
                        </p>
                      </div>
                      <CheckCircleIcon className="w-8 h-8 text-orange-500" />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Contract Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Owner:</span>
                      <div className="font-mono text-gray-900 mt-1">
                        {contractOwner || 'Loading...'}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Version:</span>
                      <div className="font-mono text-gray-900 mt-1">
                        {contractVersion || 'Loading...'}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">App ID:</span>
                      <div className="font-mono text-gray-900 mt-1">
                        {contractService.getAppId() || 'Not set'}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Network:</span>
                      <div className="font-mono text-gray-900 mt-1">TestNet</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Products Tab */}
            {activeTab === 'products' && (
              <div className="space-y-8">
                {/* Add Product */}
                <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <PlusIcon className="w-5 h-5 text-green-600" />
                    Add New Product
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <input
                      type="text"
                      placeholder="Product ID (barcode)"
                      value={newProduct.id}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, id: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                    <input
                      type="text"
                      placeholder="Product Name"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  
                  {/* Ingredients */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ingredients
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        placeholder="Add ingredient"
                        value={ingredientInput}
                        onChange={(e) => setIngredientInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addIngredient()}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                      <button
                        onClick={() => addIngredient()}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {newProduct.ingredients.map((ingredient, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                        >
                          {ingredient}
                          <button
                            onClick={() => removeIngredient(index)}
                            className="text-green-600 hover:text-green-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleAddProduct}
                    disabled={isLoading}
                    className="w-full md:w-auto px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? 'Adding...' : 'Add Product'}
                  </button>
                </div>

                {/* Update Product */}
                <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <PencilIcon className="w-5 h-5 text-blue-600" />
                    Update Existing Product
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <input
                      type="text"
                      placeholder="Product ID (barcode)"
                      value={updateProduct.id}
                      onChange={(e) => setUpdateProduct(prev => ({ ...prev, id: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="New Product Name"
                      value={updateProduct.name}
                      onChange={(e) => setUpdateProduct(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  {/* Update Ingredients */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Updated Ingredients
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        placeholder="Add ingredient"
                        value={ingredientInput}
                        onChange={(e) => setIngredientInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addIngredient(true)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        onClick={() => addIngredient(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {updateProduct.ingredients.map((ingredient, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          {ingredient}
                          <button
                            onClick={() => removeIngredient(index, true)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleUpdateProduct}
                    disabled={isLoading}
                    className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? 'Updating...' : 'Update Product'}
                  </button>
                </div>
              </div>
            )}

            {/* Bootstrap Tab */}
            {activeTab === 'bootstrap' && (
              <div className="space-y-6">
                <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
                  <div className="flex items-start gap-4">
                    <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600 mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Contract Bootstrap
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Bootstrap initializes the smart contract and should only be called once by the contract owner.
                        This operation sets up initial contract state and cannot be undone.
                      </p>
                      
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Prerequisites:</h4>
                        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                          <li>You must be the contract owner</li>
                          <li>Contract must not be already bootstrapped</li>
                          <li>Sufficient balance for transaction fees</li>
                        </ul>
                      </div>

                      <div className="flex items-center gap-4">
                        <button
                          onClick={handleBootstrap}
                          disabled={isLoading || !isOwner}
                          className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {isLoading ? 'Bootstrapping...' : 'Bootstrap Contract'}
                        </button>
                        
                        {!isOwner && (
                          <span className="text-sm text-red-600 font-medium">
                            Only contract owner can bootstrap
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};