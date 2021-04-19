import { useAuctions, useUnsafeVaults, useTotalDai, useHoleAndDirt } from 'lib/hooks';

export function useSystemStats(): any {
  const { data: auctions, error: auctionsError } = useAuctions();
  const { data: unsafeVaults, error: unsafeVaultsError } = useUnsafeVaults();
  const { data: totalDai, error: totalDaiError } = useTotalDai();

  // return data needed for each field in fieldMap and let format function do the rest
  // ['Active Auctions', 'Inactive Auctions', 'Vaults requiring kick', 'Dai required for Auctions', 'Global max available']
  const data =
    auctions && unsafeVaults && totalDai ? [auctions, auctions, unsafeVaults, auctions, totalDai] : null;
  const error = auctionsError || unsafeVaultsError || totalDaiError;

  return {
    data,
    loading: !error && !data,
    error: error
  };
}

export function useSystemStatsSidebar(ilk: string): any {
  const type = ilk.toLowerCase();

  const { data: auctions, error: auctionsError } = useAuctions(type);
  const { data: unsafeVaults, error: unsafeVaultsError } = useUnsafeVaults(type);
  const { data: holeAndDirt, error: holeAndDirtError } = useHoleAndDirt(type);

  // return data needed for each field in fieldMap and let format function do the rest
  // ['Undercollateralized Vaults', 'Active Auctions', 'Inactive Auctions', 'Dai required for Auctions', 'Limit per collateral available']
  const data = auctions && unsafeVaults ? [unsafeVaults, auctions, auctions, auctions, holeAndDirt] : null;
  const error = auctionsError || unsafeVaultsError || holeAndDirtError;

  return {
    data,
    loading: !error && !data,
    error: error
  };
}