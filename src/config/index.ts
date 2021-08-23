export const worker = new Worker("/worker.js");

export const API_LIMIT = 1000;
export const UPDATE_SECOND = 5;
export const SMALL = 975;
export const XSMALL = 640;
export const INTERVALS: { [key in TInterval]: string } = {
  m1: "1m",
  m5: "5m",
  m15: "15m",
  m30: "30m",
  h1: "1h",
  h2: "2h",
  h4: "4h",
  h6: "6h",
  h12: "12h",
  d1: "1D",
  w1: "1W",
  n1: "1M",
};

export const INDICATORS_ADVANCED = [
  { type: "rsi", params: [{ key: "length", value: 14, title: "Length" }] },
  {
    type: "stoch",
    params: [
      { key: "k", value: 12, title: "K Length" },
      { key: "d", value: 3, title: "D Smoothing" },
    ],
  },
  {
    type: "macd",
    params: [
      { key: "fast", value: 12, title: "Fast Length" },
      { key: "slow", value: 26, title: "Slow Length" },
      { key: "smoothing", value: 9, title: "Smoothing" },
    ],
  },
  { type: "adx", params: [{ key: "length", value: 14, title: "Length" }] },
];
