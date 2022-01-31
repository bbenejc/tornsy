import { INTERVAL_NAMES } from 'config';
import type { UTCTimestamp } from 'lightweight-charts';

export function findDataIndex(data: any[], time: number): number {
  let index = -1;
  let min = 0;
  let max = data.length - 1;

  while (max >= min) {
    const tmp = Math.floor((max + min) / 2);
    const tmpTime = data[tmp][0];
    if (tmpTime === time) {
      index = tmp;
      break;
    } else if (time > tmpTime) min = tmp + 1;
    else max = tmp - 1;
  }

  return index;
}

export function sumArray(data: number[]): number {
  return data.reduce(function (pv, cv) {
    return pv + cv;
  }, 0);
}

export const EMPTY_ARRAY = [];

export function parseColumn(column: string): TParsedColumn {
  const [field, i = '', iType = ''] = column.split('|');
  const type = i[0] as keyof typeof INTERVAL_NAMES;
  const length = parseInt(i.substr(1));
  let interval = INTERVAL_NAMES[type] && !isNaN(length) ? i : '';

  return {
    field: field as TParsedColumn['field'],
    interval,
    type: interval !== '' && iType === '' ? '%' : iType,
  };
}

export function makeColumnString({ field, interval, type }: TParsedColumn): string {
  const parts: string[] = [field];
  if (interval !== '') {
    parts.push(interval);
    if (type !== '%') parts.push(type);
  }

  return parts.join('|');
}

export function parseFloatsListIntervals(input: TAPIStockList['interval']): TStockList['interval'] {
  const output: TStockList['interval'] = {};

  if (input) {
    const intervals = Object.keys(input);
    for (let i = 0; i < intervals.length; i += 1) {
      const interval = intervals[i];
      const { price, total_shares, marketcap } = input[interval];
      const priceNum = parseFloat(price);
      output[interval] = {
        price: priceNum,
        total_shares,
        marketcap: marketcap ? marketcap : priceNum * total_shares,
      };
    }
  }

  return output;
}

export function parseFloatsData(input: TAPIStockData[]): TStockData[] {
  const output: TStockData[] = [];

  for (let i = 0; i < input.length; i += 1) {
    const len = input[i].length;
    if (len <= 4) {
      const [time, price, shares, mcap] = input[i] as TDataM1;
      const priceNum = parseFloat(price);
      output.push([time, priceNum, shares, mcap ? mcap : priceNum * shares]);
    } else {
      const [time, open, high, low, close, shares, mcap] = input[i] as TDataOHLC;
      const openNum = parseFloat(open);
      const highNum = parseFloat(high);
      const lowNum = parseFloat(low);
      const closeNum = parseFloat(close);
      output.push([time, openNum, highNum, lowNum, closeNum, shares, mcap ? mcap : closeNum * shares]);
    }
  }

  return output;
}

export function getColumnValue(data: TStockList, column: string): [number, string] {
  const { field, interval, type } = parseColumn(column);
  let value = data[field];
  const isPercentage = type !== '$';

  if (interval) {
    if (data.interval[interval]) {
      const prevValue = data.interval[interval][field];
      value = isPercentage ? (value / prevValue - 1) * 100 : value - prevValue;
    } else value = 0;
  }

  return [value, type];
}

type TDataM1 = [UTCTimestamp, string, number, number?];
type TDataOHLC = [UTCTimestamp, string, string, string, string, number, number?];
type TParsedColumn = {
  field: 'price' | 'marketcap' | 'total_shares';
  interval: string;
  type: string;
};
