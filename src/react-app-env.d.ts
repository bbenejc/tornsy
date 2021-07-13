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

type TInterval =
  | "m1"
  | "m5"
  | "m15"
  | "m30"
  | "h1"
  | "h2"
  | "h4"
  | "h6"
  | "h12"
  | "d1"
  | "w1"
  | "n1";

type TStockList = {
  stock: string;
  name: string;
  price: string;
  price_m1: string;
  total_shares: number;
};

type TStockInfo = {
  stock: string;
  name: string;
  price: string;
  diff_m1: number;
  diff_percent_m1: number;
  total_shares: number;
};

type TStockData =
  | {
      stock: string;
      interval: "m1";
      data: [timestamp: UTCTimestamp, price: string][];
    }
  | {
      stock: string;
      interval:
        | "m5"
        | "m15"
        | "m30"
        | "h1"
        | "h2"
        | "h4"
        | "h6"
        | "h12"
        | "d1"
        | "w1"
        | "n1";
      data: [
        timestamp: UTCTimestamp,
        open: string,
        high: string,
        low: string,
        close: string
      ][];
    };

type TIndicator = {
  type: string;
  length: number;
};

type TAdvanced =
  | { type: "rsi"; length: number }
  | { type: "stoch"; k: number; d: number }
  | { type: "macd"; slow: number; fast: number; smoothing: number }
  | { type: "adx"; length: number };
