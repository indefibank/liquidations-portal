import { cloneElement } from 'react';
import BigNumber from 'bignumber.js';
import { jsx, SxStyleProp } from 'theme-ui';
import { css } from '@theme-ui/css';
import round from 'lodash/round';
import Auction from 'types/auction';
import { SupportedNetworks, ETHERSCAN_PREFIXES } from './constants';

export async function fetchJson(url: RequestInfo, init?: RequestInit): Promise<any> {
  const response = await fetch(url, init);
  const json = await response.json();

  if (!response.ok) throw new Error(`${response.statusText}: ${json.error?.message || JSON.stringify(json)}`);
  return json;
}

export function timeoutPromise(ms: number, promise: Promise<any>): Promise<any> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject('promise timeout');
    }, ms);
    promise.then(
      res => {
        clearTimeout(timeoutId);
        resolve(res);
      },
      err => {
        clearTimeout(timeoutId);
        reject(err);
      }
    );
  });
}

export function wait(duration: number) {
  return new Promise(res => setTimeout(res, duration));
}

export function backoffRetry(retries: number, fn: () => Promise<any>, delay = 500): Promise<any> {
  return fn().catch(err =>
    retries > 1 ? wait(delay).then(() => backoffRetry(retries - 1, fn, delay * 2)) : Promise.reject(err)
  );
}

export function getEtherscanLink(
  network: SupportedNetworks,
  data: string,
  type: 'transaction' | 'address'
): string {
  const prefix = `https://${
    ETHERSCAN_PREFIXES[network] || ETHERSCAN_PREFIXES[SupportedNetworks.MAINNET]
  }etherscan.io`;

  switch (type) {
    case 'transaction':
      return `${prefix}/tx/${data}`;
    case 'address':
    default:
      return `${prefix}/address/${data}`;
  }
}

/* eslint-disable no-useless-escape */
// https://medium.com/@mhagemann/the-ultimate-way-to-slugify-a-url-string-in-javascript-b8e4a0d849e1
export function slugify(string: string) {
  const a = 'àáâäæãåāăąçćčđďèéêëēėęěğǵḧîïíīįìłḿñńǹňôöòóœøōõőṕŕřßśšşșťțûüùúūǘůűųẃẍÿýžźż·/_,:;';
  const b = 'aaaaaaaaaacccddeeeeeeeegghiiiiiilmnnnnoooooooooprrsssssttuuuuuuuuuwxyyzzz------';
  const p = new RegExp(a.split('').join('|'), 'g');

  return string
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(p, c => b.charAt(a.indexOf(c)))
    .replace(/&/g, '-and-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}
/* eslint-enable no-useless-escape */

/** Add sx styles to the passed in component. Provided styles override component styles if there's a clash. */
export function styledClone(component, { sx: stylesToMerge }: { sx: SxStyleProp }): React.ReactNode {
  if ('css' in component.props) {
    return cloneElement(component, {
      css: theme => [component.props.css(theme), css(stylesToMerge)(theme)]
    });
  } else {
    const { sx, ...componentProps } = component.props;
    return jsx(component.type, {
      key: component.key,
      ...componentProps,
      css: theme => [css(sx instanceof Function ? sx(theme) : sx)(theme), css(stylesToMerge)(theme)]
    });
  }
}

export const formatDateWithTime = dateString => {
  if (!dateString) return;
  const date = new Date(dateString);
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hourCycle: 'h23',
    timeZone: 'UTC',
    timeZoneName: 'short'
  };
  try {
    return new Intl.DateTimeFormat('en-US', options).format(date);
  } catch (err) {
    console.error(err);
    return '??';
  }
};

function now() {
  return Math.floor(new Date().getTime());
}

export function formatAddress(address: string) {
  return address.slice(0, 7) + '...' + address.slice(-4);
}

export function cutMiddle(text = '', left = 6, right = 4) {
  if (text.length <= left + right) return text;
  return `${text.substring(0, left)}...${text.substring(text.length - right - 1, text.length - 1)}`;
}

export const formatRound = (num, decimals = 2) =>
  isNaN(num) ? '----' : round(num, decimals).toLocaleString({}, { minimumFractionDigits: decimals });

export function fromRad(value): BigNumber {
  return new BigNumber(value).shiftedBy(-45);
}

export const calculateCollateralAmt = (colAmt: BigNumber, colPrice: BigNumber): BigNumber =>
  colAmt.div(colPrice);

export const calculateColValue = (colAmt: BigNumber, colPrice: BigNumber): BigNumber =>
  colAmt.times(colPrice);

// Auction response for reference
// {
//  "saleId": "4990",
//  "pos": "5",
//  "tab": "48150187464057295135313238110939183779274217273",
//  "lot": "196969000000000000",
//  "usr": "0xdaaFAe93C0e2A0226043E88a70aCF5be9b671124",
//  "tic": "1595930405",
//  "top": "6120186359841348405000000000000000000000000000",
//  "active": true,
//  "created": "2020-07-28T04:00:05",
//  "updated": "2020-07-28T04:00:05"
// }
export function transformAuctions(response: any): Auction[] {
  return response.map(resp => ({
    id: resp.saleId,
    name: 'link',
    initialCollateral: '1000', // can look up by `sales()`
    urn: resp.usr,
    collateralAvailable: resp.lot.toFixed(2),
    daiNeeded: resp.tab.toFixed(2),
    dustLimit: '100', //get from chain on init?
    maxBid: '100',
    endDate: resp.tic // need to get ttl (tic + ttl) (tic = start date)
  }));
}

export function getAuctionCountByStatus(allClips: any[], filterActive: boolean): number {
  return allClips.filter(clip => Boolean(clip.active) === filterActive).length;
}

export function getDaiRequiredForAuctions(allClips: any[]): number {
  const daiNeeded = allClips.reduce((acc, cur) => acc.plus(cur.tab), new BigNumber(0));
  return daiNeeded.toFixed(2);
}
