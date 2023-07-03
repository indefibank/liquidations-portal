import BigNumber from 'bignumber.js';

type Auction = {
  id: number;
  active: boolean;
  ilk: string;
  initialCollateral: string;
  urn: string;
  collateralAvailable: BigNumber;
  stblNeeded: BigNumber;
  dustLimit: BigNumber;
  startDate: number;
  endDate: number;
};

export default Auction;
