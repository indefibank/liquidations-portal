import useSWR from 'swr';
import { getAccountGovBalance } from 'lib/api';
import { fromWad } from 'lib/utils';

async function fetchAccountGovBalance(address?: string): Promise<any> {
  const response = await getAccountGovBalance(address);
  return fromWad(response);
}

export function useAccountGovBalance(address?: string): any {
  const { data, error } = useSWR(address ? '/balances/gov' : null, () => fetchAccountGovBalance(address));

  return {
    data,
    loading: !error && !data,
    error
  };
}
