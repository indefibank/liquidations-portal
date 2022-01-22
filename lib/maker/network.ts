import { SupportedNetworks } from '../constants';

export function networkToRpc(network: SupportedNetworks, nodeProvider?: 'infura' | 'alchemy'): string {
  switch (network) {
    case SupportedNetworks.VELAS:
      return 'https://explorer.velas.com/rpc';
    case SupportedNetworks.VELASTESTNET:
      return 'https://explorer.testnet.velas.com/rpc';
    case SupportedNetworks.TESTNET:
      return 'https://explorer.testnet.velas.com/rpc';
    default:
      return 'https://explorer.velas.com/rpc';
  }
}
