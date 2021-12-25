/// <reference types="react-scripts" />

type TTheme = {
  dark: boolean;
  paper: string;
  grid: string;
  axis: string;
  crosshair: string;
  font: string;
  fontSec: string;
  red: string[];
  green: string[];
  volume: string;
  indicators: string[];
  advanced: string[];
};

type TInterval = 'm1' | 'm5' | 'm15' | 'm30' | 'h1' | 'h2' | 'h4' | 'h6' | 'h12' | 'd1' | 'w1' | 'n1' | 'y1';

type TStockList = {
  stock: string;
  index?: boolean;
  name: string;
  price: string;
  total_shares: number;
  marketcap?: number;
  intervals?: {
    [interval: string]: {
      price: string;
      total_shares: number;
      marketcap?: number;
    };
  };
};

type TStockInfo = {
  stock: string;
  name: string;
  price: string;
  price_diff: number;
  price_growth: number;
  marketcap: number;
  marketcap_diff: number;
  marketcap_growth: number;
  total_shares: number;
};

type TStockData =
  | [timestamp: UTCTimestamp, price: string, total_shares: number, marketcap?: number]
  | [
      timestamp: UTCTimestamp,
      open: string,
      high: string,
      low: string,
      close: string,
      total_shares: number,
      marketcap?: number
    ];

type TIndicator = {
  type: string;
  length: number;
  showPrice?: boolean;
};

type TAdvanced =
  | undefined
  | { type: 'rsi'; length: number }
  | { type: 'stoch'; k: number; d: number }
  | { type: 'macd'; slow: number; fast: number; smoothing: number }
  | { type: 'adx'; length: number };
