import BigNumber from 'bignumber.js';

export enum SupportedNetworks {
  VELAS = 'velas',
  VELASTESTNET = 'velastestnet',
  TESTNET = 'testnet'
}

export const DEFAULT_NETWORK = SupportedNetworks.VELAS;

export const ETHERSCAN_PREFIXES = {
  [SupportedNetworks.VELAS]: 'evmexplorer.',
  [SupportedNetworks.VELASTESTNET]: 'evmexplorer.testnet.'
};

type CollateralInfo = {
  name: string;
  ilk: string;
  symbol: string;
  bigNumFormatter: (val: BigNumber) => string;
  cardTexturePng: string;
  bannerPng: string;
  iconSvg: string;
  colorIconName: string;
  decimals: number;
  lpToken?: boolean;
  protocol?: string;
  protocolSvg?: string;
  pool?: string;
  poolSvg?: string;
};

export const COLLATERAL_MAP: Record<string, CollateralInfo> = {
  // 'BAT-A': {
  //   name: 'Basic Attention Token',
  //   ilk: 'BAT-A',
  //   symbol: 'BAT',
  //   bigNumFormatter: (val: BigNumber): string => val.toFormat(2),
  //   cardTexturePng: '/assets/bat-card-texture.png',
  //   bannerPng: '/assets/bat-banner-texture.png',
  //   iconSvg: '/assets/bat-icon.svg',
  //   colorIconName: 'batCircleColor',
  //   decimals: 18
  // },
  'VLX-A': {
    name: 'Velas',
    ilk: 'VLX-A',
    symbol: 'VLX',
    bigNumFormatter: (val: BigNumber): string => val.toFormat(2),
    cardTexturePng: '/assets/vlx-card-texture.png',
    bannerPng: '/assets/vlx-banner-texture.png',
    iconSvg: '/assets/vlx-icon.svg',
    colorIconName: 'ethCircleColor',
    decimals: 18
  }
};

export const COLLATERAL_ARRAY = Object.keys(COLLATERAL_MAP).map(currency => ({
  ...COLLATERAL_MAP[currency],
  key: currency
}));

export const TOOLTIP_DICT = {
  ACTIVE_AUCTIONS: 'The number of active auctions in which you can place a bid.',
  INACTIVE_AUCTIONS: 'The number of auctions that ended in which you can no longer place a bid.',
  UNDERCOLLATERALIZED_VAULTS: 'The number of undercollateralized vaults that need to be initiated.',
  USDV_REQUIRED: 'The amount of USDV required to purchase available auction collateral',
  MAX_AVAILABLE: 'Max amount of USDV that can be auctioned.',
  USDV_IN_VAT:
    'The VAT contract is the core vault engine of the Maker Protocol and manages USDV accounting. Depositing USDV into this contract and approving permissions is necessary in order to participate in auctions.',
  DUST_LIMIT: 'Minimum vault debt.',
  AUCTION_PRICE: 'The maximum acceptable price.'
};
