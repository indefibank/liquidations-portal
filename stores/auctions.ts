import create from 'zustand';
import getMaker from '../lib/maker';
import { transactionsApi } from './transactions';
import BigNumber from 'bignumber.js';

type Store = {
  submitBid: (ilk, id, amount, maxPrice, address) => Promise<void>;
  bidTxPending: boolean;
  bidTxSuccess: boolean;
  bidTxError: { txId: string; error: string; hash: string } | null;
  resetBidState: () => void;
};

const [useAuctionStore] = create<Store>((set, get) => ({
  bidTxPending: false,
  bidTxSuccess: false,
  bidTxError: null,
  resetBidState: () => set(state => ({ bidTxSuccess: false, bidTxPending: false, bidTxError: null })),
  submitBid: async (ilk, id, amount, maxPrice, address) => {
    const maker = await getMaker();
    const delta = new BigNumber(100);
    const _maxPrice = maxPrice.plus(delta).toFixed(18);

    // maxPrice is approximate, or else we get "Clipper/too-expensive" errors
    const txCreator = () =>
      maker.service('liquidation').take(ilk, id, amount.toFixed(18), _maxPrice, address);
    await transactionsApi.getState().track(txCreator, `Submit bid on ID: ${id}`, {
      pending: () => {
        set({
          bidTxPending: true,
          bidTxError: null
        });
      },
      mined: txId => {
        transactionsApi.getState().setMessage(txId, `Submit bid finished for ID: ${id}`);
        set({
          bidTxPending: false,
          bidTxSuccess: true,
          bidTxError: null
        });
      },
      error: (txId, error, hash) => {
        set({
          bidTxPending: false,
          bidTxError: { txId, error, hash }
        });
      }
    });
  }
}));

export default useAuctionStore;
