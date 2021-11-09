import { SupportedNetworks } from '../constants';

export function networkToRpc(network: SupportedNetworks, nodeProvider?: 'infura' | 'alchemy'): string {
  switch (network) {
    case SupportedNetworks.VELAS:
      return 'https://evmexplorer.velas.com/rpc';
    case SupportedNetworks.VELASTESTNET:
      return 'https://evmexplorer.testnet.velas.com/rpc';
    case SupportedNetworks.TESTNET:
      return 'https://evmexplorer.testnet.velas.com/rpc';
    default:
      return 'https://evmexplorer.velas.com/rpc';
  }
}
