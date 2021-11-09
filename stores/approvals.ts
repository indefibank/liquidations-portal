import create from 'zustand';
import getMaker from '../lib/maker';
import { transactionsApi } from './transactions';

type Store = {
  hasJoinUsdvApproval: boolean;
  hasJoinUsdvHope: boolean;
  hasIlkHope: Record<string, boolean>;

  setHasJoinUsdvApproval: (address: string | undefined) => Promise<void>;
  setHasJoinUsdvHope: (address: string | undefined) => Promise<void>;
  setHasIlkHope: (address: string, ilk: string) => Promise<void>;

  enableJoinUsdvApproval: () => Promise<void>;
  enableJoinUsdvHope: () => Promise<void>;
  enableIlkHope: (ilk: string) => Promise<void>;

  joinUsdvApprovalPending: boolean;
  joinUsdvHopePending: boolean;
  joinIlkHopePending: Record<string, boolean>;

  initApprovals: (address: string, ilks?: string[]) => Promise<void>;
};

const [useApprovalsStore] = create<Store>((set, get) => ({
  hasJoinUsdvApproval: false,
  hasJoinUsdvHope: false,
  hasIlkHope: {},
  joinUsdvApprovalPending: false,
  joinUsdvHopePending: false,
  joinIlkHopePending: {},

  setHasJoinUsdvApproval: async address => {
    try {
      const maker = await getMaker();
      const allowance = await maker
        .getToken('USDV')
        .allowance(address, maker.service('smartContract').getContract('MCD_JOIN_USDV').address);
      set({
        hasJoinUsdvApproval: allowance.toBigNumber().gt(0)
      });
    } catch (err) {
      set({
        hasJoinUsdvApproval: false
      });
    }
  },
  setHasJoinUsdvHope: async address => {
    try {
      const maker = await getMaker();
      const can = await maker
        .service('smartContract')
        .getContract('MCD_VAT')
        .can(address, maker.service('smartContract').getContract('MCD_JOIN_USDV').address);

      set({
        hasJoinUsdvHope: can.toNumber() === 1
      });
    } catch (err) {
      set({
        hasJoinUsdvHope: false
      });
    }
  },
  setHasIlkHope: async (address, ilk) => {
    try {
      const maker = await getMaker();
      const clipperAddress = maker.service('liquidation')._clipperContractByIlk(ilk).address;
      const can = await maker.service('smartContract').getContract('MCD_VAT').can(address, clipperAddress);
      set(state => ({
        hasIlkHope: {
          ...state.hasIlkHope,
          [ilk]: can.toNumber() === 1
        }
      }));
    } catch (err) {
      set(state => ({
        hasIlkHope: {
          ...state.hasIlkHope,
          [ilk]: false
        }
      }));
    }
  },

  enableJoinUsdvApproval: async () => {
    const maker = await getMaker();
    const address = maker.service('smartContract').getContract('MCD_JOIN_USDV').address;
    const txCreator = () => maker.getToken('USDV').approveUnlimited(address);

    await transactionsApi.getState().track(txCreator, 'Join USDV approval sent', {
      pending: () => {
        set({
          joinUsdvApprovalPending: true
        });
      },
      mined: txId => {
        transactionsApi.getState().setMessage(txId, 'Join USDV approval finished');
        set({
          hasJoinUsdvApproval: true,
          joinUsdvApprovalPending: false
        });
      },
      error: () => {
        set({
          joinUsdvApprovalPending: false
        });
      }
    });
  },
  enableJoinUsdvHope: async () => {
    const maker = await getMaker();
    const address = maker.service('smartContract').getContract('MCD_JOIN_USDV').address;
    const txCreator = () => maker.service('smartContract').getContract('MCD_VAT').hope(address);

    await transactionsApi.getState().track(txCreator, 'Join USDV hope sent', {
      pending: () => {
        set({
          joinUsdvHopePending: true
        });
      },
      mined: txId => {
        transactionsApi.getState().setMessage(txId, 'Join USDV hope finished');
        set({
          hasJoinUsdvHope: true,
          joinUsdvHopePending: false
        });
      },
      error: () => {
        set({
          joinUsdvHopePending: false
        });
      }
    });
  },
  enableIlkHope: async ilk => {
    const maker = await getMaker();
    const clipperAddress = maker.service('liquidation')._clipperContractByIlk(ilk).address;
    const txCreator = () => maker.service('smartContract').getContract('MCD_VAT').hope(clipperAddress);

    await transactionsApi.getState().track(txCreator, `${ilk} clipper hope sent`, {
      pending: () => {
        set(state => ({
          joinIlkHopePending: {
            ...state.joinIlkHopePending,
            [ilk]: true
          }
        }));
      },
      mined: txId => {
        transactionsApi.getState().setMessage(txId, `${ilk} clipper hope finished`);
        set(state => ({
          hasIlkHope: {
            ...state.hasIlkHope,
            [ilk]: true
          },
          joinIlkHopePending: {
            ...state.joinIlkHopePending,
            [ilk]: false
          }
        }));
      },
      error: () => {
        set(state => ({
          joinIlkHopePending: {
            ...state.joinIlkHopePending,
            [ilk]: false
          }
        }));
      }
    });
  },

  initApprovals: async (address, ilks) => {
    get().setHasJoinUsdvApproval(address);
    get().setHasJoinUsdvHope(address);
    ilks?.forEach(ilk => get().setHasIlkHope(address, ilk));
  }
}));

export default useApprovalsStore;
