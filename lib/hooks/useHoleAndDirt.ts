import useSWR from 'swr';
import { getHoleAndDirtForIlk } from 'lib/api';

async function fetchHoleAndDirt(ilk: string): Promise<any[]> {
  const response = await getHoleAndDirtForIlk(ilk.toUpperCase());

  return response;
}

export function useHoleAndDirt(ilk: string): any {
  const { data, error } = useSWR(`/hole-and-dirt/fetch-${ilk}`, () => fetchHoleAndDirt(ilk));

  return {
    data,
    loading: !error && !data,
    error
  };
}
