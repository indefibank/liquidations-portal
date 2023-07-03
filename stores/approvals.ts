import create from 'zustand';
import getMaker from '../lib/maker';
import { transactionsApi } from './transactions';

type Store = {
  hasJoinStblApproval: boolean;
  hasJoinStblHope: boolean;
  hasIlkHope: Record<string, boolean>;

  setHasJoinStblApproval: (address: string | undefined) => Promise<void>;
  setHasJoinStblHope: (address: string | undefined) => Promise<void>;
  setHasIlkHope: (address: string, ilk: string) => Promise<void>;

  enableJoinStblApproval: () => Promise<void>;
  enableJoinStblHope: () => Promise<void>;
  enableIlkHope: (ilk: string) => Promise<void>;

  joinStblApprovalPending: boolean;
  joinStblHopePending: boolean;
  joinIlkHopePending: Record<string, boolean>;

  initApprovals: (address: string, ilks?: string[]) => Promise<void>;
};

const [useApprovalsStore] = create<Store>((set, get) => ({
  hasJoinStblApproval: false,
  hasJoinStblHope: false,
  hasIlkHope: {},
  joinStblApprovalPending: false,
  joinStblHopePending: false,
  joinIlkHopePending: {},

  setHasJoinStblApproval: async address => {
    try {
      const maker = await getMaker();
      const allowance = await maker
        .getToken(`${process.env.STBL_NAME}`)
        .allowance(address, maker.service('smartContract').getContract('MCD_JOIN_STBL').address);
      set({
        hasJoinStblApproval: allowance.toBigNumber().gt(0)
      });
    } catch (err) {
      set({
        hasJoinStblApproval: false
      });
    }
  },
  setHasJoinStblHope: async address => {
    try {
      const maker = await getMaker();
      const can = await maker
        .service('smartContract')
        .getContract('MCD_VAT')
        .can(address, maker.service('smartContract').getContract('MCD_JOIN_STBL').address);

      set({
        hasJoinStblHope: can.toNumber() === 1
      });
    } catch (err) {
      set({
        hasJoinStblHope: false
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

  enableJoinStblApproval: async () => {
    const maker = await getMaker();
    const address = maker.service('smartContract').getContract('MCD_JOIN_STBL').address;
    const txCreator = () => maker.getToken(`${process.env.STBL_NAME}`).approveUnlimited(address);

    await transactionsApi.getState().track(txCreator, `Join ${process.env.STBL_NAME} approval sent`, {
      pending: () => {
        set({
          joinStblApprovalPending: true
        });
      },
      mined: txId => {
        transactionsApi.getState().setMessage(txId, `Join ${process.env.STBL_NAME} approval finished`);
        set({
          hasJoinStblApproval: true,
          joinStblApprovalPending: false
        });
      },
      error: () => {
        set({
          joinStblApprovalPending: false
        });
      }
    });
  },
  enableJoinStblHope: async () => {
    const maker = await getMaker();
    const address = maker.service('smartContract').getContract('MCD_JOIN_STBL').address;
    const txCreator = () => maker.service('smartContract').getContract('MCD_VAT').hope(address);

    await transactionsApi.getState().track(txCreator, `Join ${process.env.STBL_NAME} hope sent`, {
      pending: () => {
        set({
          joinStblHopePending: true
        });
      },
      mined: txId => {
        transactionsApi.getState().setMessage(txId, `Join ${process.env.STBL_NAME} hope finished`);
        set({
          hasJoinStblHope: true,
          joinStblHopePending: false
        });
      },
      error: () => {
        set({
          joinStblHopePending: false
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
    get().setHasJoinStblApproval(address);
    get().setHasJoinStblHope(address);
    ilks?.forEach(ilk => get().setHasIlkHope(address, ilk));
  }
}));

export default useApprovalsStore;
