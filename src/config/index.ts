export const API = "http://torn-stocks.jurcec.si/api";
export const worker = new Worker("/worker.js");

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
};
