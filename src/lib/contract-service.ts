import { NutriGradeClient, NutriGradeFactory } from '@/contracts/NutriGradeClient';
import { getAlgorandClient, ensureWalletConnected } from './algorand';
import type { AlgorandClient } from '@algorandfoundation/algokit-utils';

export interface ContractStats {
  totalProducts: bigint;
  totalScans: bigint;
}

export interface UserStats {
  scanCount: bigint;
  lastScannedProduct: bigint;
}

export interface Product {
  id: string;
  name: string;
  ingredients: string[];
  addedAt?: Date;
  updatedAt?: Date;
}

export interface ScanResult {
  productId: string;
  scanTimestamp: Date;
  txId: string;
}

class ContractService {
  private client: NutriGradeClient | null = null;
  private algorandClient: AlgorandClient | null = null;
  private contractAppId: number | null = null;

  /**
   * Initialize the contract service with app ID
   */
  async initialize(appId: number) {
    try {
      this.algorandClient = await getAlgorandClient();
      this.contractAppId = appId;
      
      const factory = new NutriGradeFactory({
        algorand: this.algorandClient,
        defaultSender: await ensureWalletConnected()
      });

      this.client = factory.getAppClientById({
        appId: BigInt(appId)
      });

      return true;
    } catch (error) {
      console.error('Failed to initialize contract service:', error);
      throw new Error('Contract initialization failed');
    }
  }

  /**
   * Bootstrap the contract (admin only)
   */
  async bootstrap(): Promise<string> {
    if (!this.client) throw new Error('Contract not initialized');
    
    try {
      const result = await this.client.send.bootstrap();
      return result.txIds[0];
    } catch (error) {
      console.error('Bootstrap failed:', error);
      throw new Error('Failed to bootstrap contract');
    }
  }

  /**
   * User opts into the contract
   */
  async optIn(): Promise<string> {
    if (!this.client) throw new Error('Contract not initialized');
    
    try {
      const result = await this.client.send.optIn();
      return result.txIds[0];
    } catch (error) {
      console.error('Opt-in failed:', error);
      throw new Error('Failed to opt into contract');
    }
  }

  /**
   * User opts out of the contract
   */
  async optOut(): Promise<string> {
    if (!this.client) throw new Error('Contract not initialized');
    
    try {
      const result = await this.client.send.optOut();
      return result.txIds[0];
    } catch (error) {
      console.error('Opt-out failed:', error);
      throw new Error('Failed to opt out of contract');
    }
  }

  /**
   * Add a new product to the blockchain
   */
  async addProduct(product: Product): Promise<string> {
    if (!this.client) throw new Error('Contract not initialized');
    
    try {
      const result = await this.client.send.addProduct(
        product.id,
        product.name,
        product.ingredients.join(',') // Convert array to comma-separated string
      );
      
      return result.txIds[0];
    } catch (error) {
      console.error('Add product failed:', error);
      throw new Error('Failed to add product to blockchain');
    }
  }

  /**
   * Update an existing product on the blockchain
   */
  async updateProduct(product: Product): Promise<string> {
    if (!this.client) throw new Error('Contract not initialized');
    
    try {
      const result = await this.client.send.updateProduct(
        product.id,
        product.name,
        product.ingredients.join(',')
      );
      
      return result.txIds[0];
    } catch (error) {
      console.error('Update product failed:', error);
      throw new Error('Failed to update product on blockchain');
    }
  }

  /**
   * Record a product scan
   */
  async scanProduct(productId: string): Promise<ScanResult> {
    if (!this.client) throw new Error('Contract not initialized');
    
    try {
      const result = await this.client.send.scanProduct(productId);
      
      return {
        productId,
        scanTimestamp: new Date(),
        txId: result.txIds[0]
      };
    } catch (error) {
      console.error('Scan product failed:', error);
      throw new Error('Failed to record product scan');
    }
  }

  /**
   * Get global contract statistics
   */
  async getGlobalStats(): Promise<ContractStats> {
    if (!this.client) throw new Error('Contract not initialized');
    
    try {
      const stats = await this.client.state.global.getStats();
      return {
        totalProducts: stats.totalProducts,
        totalScans: stats.totalScans
      };
    } catch (error) {
      console.error('Get global stats failed:', error);
      throw new Error('Failed to fetch global statistics');
    }
  }

  /**
   * Get user-specific statistics
   */
  async getUserStats(): Promise<UserStats> {
    if (!this.client) throw new Error('Contract not initialized');
    
    try {
      const stats = await this.client.state.local.getUserStats();
      return {
        scanCount: stats.scanCount,
        lastScannedProduct: BigInt(stats.lastScannedProduct || '0')
      };
    } catch (error) {
      console.error('Get user stats failed:', error);
      throw new Error('Failed to fetch user statistics');
    }
  }

  /**
   * Get contract owner address
   */
  async getOwner(): Promise<string> {
    if (!this.client) throw new Error('Contract not initialized');
    
    try {
      return await this.client.state.global.getOwner();
    } catch (error) {
      console.error('Get owner failed:', error);
      throw new Error('Failed to fetch contract owner');
    }
  }

  /**
   * Get contract version
   */
  async getVersion(): Promise<string> {
    if (!this.client) throw new Error('Contract not initialized');
    
    try {
      return await this.client.state.global.getVersion();
    } catch (error) {
      console.error('Get version failed:', error);
      throw new Error('Failed to fetch contract version');
    }
  }

  /**
   * Check if user is opted into the contract
   */
  async isUserOptedIn(): Promise<boolean> {
    try {
      await this.getUserStats();
      return true;
    } catch (error) {
      // If getUserStats fails, user is likely not opted in
      return false;
    }
  }

  /**
   * Get the current contract app ID
   */
  getAppId(): number | null {
    return this.contractAppId;
  }

  /**
   * Check if contract service is initialized
   */
  isInitialized(): boolean {
    return this.client !== null && this.algorandClient !== null;
  }
}

// Export singleton instance
export const contractService = new ContractService();

// Utility functions for easy access
export const initializeContract = (appId: number) => contractService.initialize(appId);
export const addProductToBlockchain = (product: Product) => contractService.addProduct(product);
export const scanProductOnBlockchain = (productId: string) => contractService.scanProduct(productId);
export const getUserBlockchainStats = () => contractService.getUserStats();
export const getGlobalBlockchainStats = () => contractService.getGlobalStats();
export const optIntoContract = () => contractService.optIn();
export const optOutOfContract = () => contractService.optOut();