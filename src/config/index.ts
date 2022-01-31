export const API_LIMIT = 1000;
export const UPDATE_SECOND = 5;
export const INDICATORS_MAX = 4;
export const SMALL = 1200;
export const XSMALL = 640;
export const INTERVALS: TInterval[] = ['m1', 'm5', 'm15', 'm30', 'h1', 'h2', 'h4', 'h6', 'h12', 'd1', 'w1', 'n1', 'y1'];
export const INTERVAL_NAMES = { m: 'm', h: 'h', d: 'D', w: 'W', n: 'M', y: 'Y' };
export const LIST_INTERVALS = [
  'm1',
  'm5',
  'm15',
  'm30',
  'm60',
  'h0',
  'h1',
  'h2',
  'h4',
  'h6',
  'h12',
  'h24',
  'd0',
  'd1',
  'd3',
  'd7',
  'd14',
  'w0',
  'w1',
  'w2',
  'w4',
  'n0',
  'n1',
  'n2',
  'n3',
  'n4',
  'n6',
  'n12',
  'y0',
  'y1',
];

export const SORTING = ['asc', 'desc'];
export const COLUMN_NAMES = { name: 'Symbol', price: 'Price', total_shares: '# Shares', marketcap: 'M. Cap' };
export const VOLUME = [
  ['total_shares', COLUMN_NAMES.total_shares],
  ['marketcap', COLUMN_NAMES.marketcap],
];

export const INDICATORS_ADVANCED = [
  { type: 'rsi', params: [{ key: 'length', value: 14, title: 'Length' }] },
  {
    type: 'stoch',
    params: [
      { key: 'k', value: 12, title: 'K Length' },
      { key: 'd', value: 3, title: 'D Smoothing' },
    ],
  },
  {
    type: 'macd',
    params: [
      { key: 'fast', value: 12, title: 'Fast Length' },
      { key: 'slow', value: 26, title: 'Slow Length' },
      { key: 'smoothing', value: 9, title: 'Smoothing' },
    ],
  },
  { type: 'adx', params: [{ key: 'length', value: 14, title: 'Length' }] },
];
