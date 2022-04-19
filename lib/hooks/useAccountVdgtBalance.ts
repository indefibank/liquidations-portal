import useSWR from 'swr';
import { getAccountVdgtBalance } from 'lib/api';
import { fromWad } from 'lib/utils';

async function fetchAccountVdgtBalance(address?: string): Promise<any> {
  const response = await getAccountVdgtBalance(address);
  return fromWad(response);
}

export function useAccountVdgtBalance(address?: string): any {
  const { data, error } = useSWR(address ? '/balances/vdgt' : null, () => fetchAccountVdgtBalance(address));

  return {
    data,
    loading: !error && !data,
    error
  };
}
