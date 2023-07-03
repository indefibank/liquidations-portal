import BigNumber from 'bignumber.js';

export enum SupportedNetworks {
  TESTNET = 'testnet',
  MAINNET = 'mainnet',
  POLYGON = 'polygon',
  MUMBAI = 'mumbai'
}

process.env.EXPLORER = 'explorer';
process.env.STBL_NAME = 'STBL';
process.env.COIN_NAME = 'MATIC';
process.env.GOV_NAME = 'gst';
process.env.COMPANY_NAME = 'Indefibank';

export const DEFAULT_NETWORK = SupportedNetworks.MUMBAI;

export const ETHERSCAN_PREFIXES = {
  [SupportedNetworks.MAINNET]: 'evmexplorer.testnet.',
  [SupportedNetworks.POLYGON]: 'evmexplorer.testnet.',
  [SupportedNetworks.MUMBAI]: 'evmexplorer.testnet.'
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
  'USDT-A': {
    name: 'Tether USD',
    ilk: 'USDT-A',
    symbol: 'USDT',
    bigNumFormatter: (val: BigNumber): string => val.toFormat(6),
    cardTexturePng: '/assets/usdt-card-texture.png',
    bannerPng: '/assets/usdt-banner-texture.png',
    iconSvg: '/assets/usdt-icon.svg',
    colorIconName: 'ethCircleColor',
    decimals: 6
  },
  // 'BNB-A': {
  //   name: 'Binance Coin',
  //   ilk: 'BNB-A',
  //   symbol: 'BNB',
  //   bigNumFormatter: (val: BigNumber): string => val.toFormat(18),
  //   cardTexturePng: '/assets/bnb-card-texture.png',
  //   bannerPng: '/assets/bnb-banner-texture.png',
  //   iconSvg: '/assets/bnb-icon.svg',
  //   colorIconName: 'ethCircleColor',
  //   decimals: 18
  // },
  'MATIC-A': {
    name: 'Polygon Coin',
    ilk: 'MATIC-A',
    symbol: 'MATIC',
    bigNumFormatter: (val: BigNumber): string => val.toFormat(18),
    cardTexturePng: '/assets/matic-card-texture.png',
    bannerPng: '/assets/matic-banner-texture.png',
    iconSvg: '/assets/matic-icon.svg',
    colorIconName: 'ethCircleColor',
    decimals: 18
  },
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
  STBL_REQUIRED: `The amount of ${process.env.STBL_NAME} required to purchase available auction collateral`,
  MAX_AVAILABLE: `Max amount of ${process.env.STBL_NAME} that can be auctioned.`,
  STBL_IN_VAT: `The VAT contract is the core vault engine of the Maker Protocol and manages ${process.env.STBL_NAME} accounting. Depositing ${process.env.STBL_NAME} into this contract and approving permissions is necessary in order to participate in auctions.`,
  DUST_LIMIT: 'Minimum vault debt.',
  AUCTION_PRICE: 'The maximum acceptable price.'
};
