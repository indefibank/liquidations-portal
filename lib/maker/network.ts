import { SupportedNetworks } from '../constants';

export function networkToRpc(network: SupportedNetworks, nodeProvider?: 'infura' | 'alchemy'): string {
  switch (network) {
    case SupportedNetworks.MUMBAI:
      return 'https://rpc-mumbai.maticvigil.com/';
    case SupportedNetworks.POLYGON:
      return 'https://polygon-rpc.com/';
    case SupportedNetworks.MAINNET:
      return 'https://mainnet.infura.io/v3/';
    case SupportedNetworks.TESTNET:
      return 'https://rpc-mumbai.maticvigil.com/';
    default:
      return 'https://rpc-mumbai.maticvigil.com/';
  }
}
