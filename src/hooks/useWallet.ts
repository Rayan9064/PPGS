'use client';

export { useWallet } from '@/components/providers/wallet-provider';

// Re-export for convenience and compatibility with Web3Social patterns
import { useWallet as useWalletInternal } from '@/components/providers/wallet-provider';

export default useWalletInternal;