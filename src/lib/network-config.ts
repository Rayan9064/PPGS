// Network configuration utilities for Algorand integration

export interface AlgorandNetworkConfig {
  network: string;
  algodServer: string;
  algodPort: number;
  algodToken: string;
  indexerServer: string;
  indexerPort: number;
  indexerToken: string;
}

export function getAlgorandNetworkConfig(): AlgorandNetworkConfig {
  return {
    network: process.env.NEXT_PUBLIC_ALGORAND_NETWORK || 'testnet',
    algodServer: process.env.NEXT_PUBLIC_ALGOD_SERVER || 'https://testnet-api.algonode.cloud',
    algodPort: parseInt(process.env.NEXT_PUBLIC_ALGOD_PORT || '443'),
    algodToken: process.env.NEXT_PUBLIC_ALGOD_TOKEN || '',
    indexerServer: process.env.NEXT_PUBLIC_INDEXER_SERVER || 'https://testnet-idx.algonode.cloud',
    indexerPort: parseInt(process.env.NEXT_PUBLIC_INDEXER_PORT || '443'),
    indexerToken: process.env.NEXT_PUBLIC_INDEXER_TOKEN || '',
  };
}

export function isLocalNet(): boolean {
  return getAlgorandNetworkConfig().network === 'localnet';
}

export function isTestNet(): boolean {
  return getAlgorandNetworkConfig().network === 'testnet';
}

export function isMainNet(): boolean {
  return getAlgorandNetworkConfig().network === 'mainnet';
}

export function getNetworkDisplayName(): string {
  const network = getAlgorandNetworkConfig().network;
  switch (network) {
    case 'localnet':
      return 'LocalNet';
    case 'testnet':
      return 'TestNet';
    case 'mainnet':
      return 'MainNet';
    default:
      return 'Unknown Network';
  }
}

export function getExplorerUrl(transactionId?: string, assetId?: string): string {
  const network = getAlgorandNetworkConfig().network;
  const baseUrl = network === 'localnet' 
    ? 'https://lora.algokit.io/localnet'
    : `https://lora.algokit.io/${network}`;
  
  if (transactionId) {
    return `${baseUrl}/transaction/${transactionId}`;
  }
  
  if (assetId) {
    return `${baseUrl}/asset/${assetId}`;
  }
  
  return baseUrl;
}

export function isBlockchainEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_BLOCKCHAIN_FEATURES === 'true';
}

export function isDebugMode(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_DEBUG_MODE === 'true';
}

export function getNutriContractId(): string | undefined {
  return process.env.NEXT_PUBLIC_NUTRI_CONTRACT_ID;
}