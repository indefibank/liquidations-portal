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
  'WAG-A': {
    name: 'Wagyu Swap Token',
    ilk: 'WAG-A',
    symbol: 'WAG',
    bigNumFormatter: (val: BigNumber): string => val.toFormat(18),
    cardTexturePng: '/assets/wag-card-texture.png',
    bannerPng: '/assets/wag-banner-texture.png',
    iconSvg: '/assets/wag-icon.svg',
    colorIconName: 'ethCircleColor',
    decimals: 18
  },
  'WAG_VLXVDGT-A': {
    name: 'Wagyu LP_VLXVDGT Token',
    pool: 'VLX-VDGT',
    ilk: 'WAG_VLXVDGT-A',
    symbol: 'WAG_VLXVDGT',
    bigNumFormatter: (val: BigNumber): string => val.toFormat(18),
    cardTexturePng: '/assets/wag_vlxvdgt-card-texture.png',
    bannerPng: '/assets/wag_vlxvdgt-banner-texture.png',
    iconSvg: '/assets/wag_vlxvdgt-icon.svg',
    poolSvg: '/assets/wag_vlxvdgt-icon.svg',
    colorIconName: 'ethCircleColor',
    decimals: 18,
    lpToken: true,
    protocol: 'Wagyu',
    protocolSvg: '/assets/wag-icon.svg'
  },
  'VLX-A': {
    name: 'Velas',
    ilk: 'VLX-A',
    symbol: 'VLX',
    bigNumFormatter: (val: BigNumber): string => val.toFormat(18),
    cardTexturePng: '/assets/vlx-card-texture.png',
    bannerPng: '/assets/vlx-banner-texture.png',
    iconSvg: '/assets/vlx-icon.svg',
    colorIconName: 'ethCircleColor',
    decimals: 18
  },
  // 'VDGT-A': {
  //   name: 'Velas',
  //   ilk: 'VDGT-A',
  //   symbol: 'VDGT',
  //   bigNumFormatter: (val: BigNumber): string => val.toFormat(18),
  //   cardTexturePng: '/assets/vdgt-card-texture.png',
  //   bannerPng: '/assets/vdgt-banner-texture.png',
  //   iconSvg: '/assets/vdgt-icon.svg',
  //   colorIconName: 'ethCircleColor',
  //   decimals: 18
  // },
  'WBTC-A': {
    name: 'Wrapped Bitcoin',
    ilk: 'WBTC-A',
    symbol: 'WBTC',
    bigNumFormatter: (val: BigNumber): string => val.toFormat(18),
    cardTexturePng: '/assets/wbtc-card-texture.png',
    bannerPng: '/assets/wbtc-banner-texture.png',
    iconSvg: '/assets/wbtc-icon.svg',
    colorIconName: 'ethCircleColor',
    decimals: 8
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
