import type { HistogramData, LineData } from "lightweight-charts";
import { sumArray } from "./utils";

export function calculateSMA(stockData: TStockData, length = 6): LineData[] {
  const data = parseData_(stockData);
  const smaData: LineData[] = [];
  const smaSum = [];

  for (let i = 0; i < data.length; i += 1) {
    smaSum.push(data[i].value);
    if (smaSum.length > length) smaSum.shift();
    if (smaSum.length === length) {
      smaData.push({
        time: data[i].time,
        value: sumArray(smaSum) / length,
      });
    }
  }

  return smaData;
}

export function calculateEMA(
  stockData: TStockData,
  length = 6,
  smoothing = 2
): LineData[] {
  const data = parseData_(stockData);

  return calcEMA_(data, length, smoothing);
}

export function calculateRSI(stockData: TStockData, length = 14): LineData[] {
  const { data, interval } = stockData;
  const isM1 = interval === "m1" ? 1 : 0;
  const cIndex = isM1 ? 1 : 4;
  const initialLength = length + isM1;
  if (data.length < initialLength) return [];

  const initialGains = [];
  const initialLosses = [];

  for (let i = isM1; i < initialLength; i += 1) {
    const curData = data[i];
    const diff = isM1
      ? parseFloat(curData[1]) - parseFloat(data[i - 1][1])
      : parseFloat(curData[4] as string) - parseFloat(curData[1]);

    if (diff > 0) initialGains.push(diff);
    else initialLosses.push(-diff);
  }

  const RSI: LineData[] = [];
  let AG = sumArray(initialGains) / length;
  let AL = sumArray(initialLosses) / length;
  let prevPrice = parseFloat(data[initialLength - 1][1]);

  for (let i = initialLength; i < data.length; i += 1) {
    const curData = data[i];
    const CP = parseFloat(curData[cIndex] as string);
    const OP = isM1 ? prevPrice : parseFloat(curData[1]);
    const diff = CP - OP;
    const G = diff > 0 ? diff : 0;
    const L = diff < 0 ? -diff : 0;

    AG = ((length - 1) * AG + G) / length;
    AL = ((length - 1) * AL + L) / length;

    const RS = AG / AL;
    RSI.push({ time: curData[0], value: 100 - 100 / (1 + RS) });

    prevPrice = CP;
  }

  return RSI;
}

export function calculateStochastics(
  stockData: TStockData,
  kLength = 12,
  dLength = 3
): [LineData[], LineData[]] {
  const { interval, data } = stockData;
  const hIndex = interval === "m1" ? 1 : 2;
  const lIndex = interval === "m1" ? 1 : 3;
  const cIndex = interval === "m1" ? 1 : 4;
  const K: LineData[] = [];
  const D: LineData[] = [];
  const lArr: number[] = [];
  const hArr: number[] = [];

  for (let i = 0; i < data.length; i += 1) {
    const curData = data[i];
    const l = parseFloat(curData[lIndex] as string);
    const h = parseFloat(curData[hIndex] as string);
    lArr.push(l);
    hArr.push(h);

    if (lArr.length > kLength) {
      lArr.shift();
      hArr.shift();
    }
    if (lArr.length === kLength) {
      const CP = parseFloat(curData[cIndex] as string);
      const L = Math.min(...lArr);
      const H = Math.max(...hArr);

      K.push({ time: curData[0], value: 100 * ((CP - L) / (H - L)) });
    }
  }

  const dSum = [];
  for (let i = 0; i < K.length; i += 1) {
    dSum.push(K[i].value);
    if (dSum.length > dLength) dSum.shift();
    if (dSum.length === dLength) {
      D.push({ time: K[i].time, value: sumArray(dSum) / dLength });
    }
  }

  return [K, D];
}

export function calculateMACD(
  stockData: TStockData,
  slowLength = 26,
  fastLength = 12,
  signalLength = 9,
  theme: TTheme
): any[] {
  const data = parseData_(stockData);
  const slow = calcEMA_(data, slowLength);
  const fast = calcEMA_(data, fastLength);

  if (slow.length < fast.length) fast.splice(0, fast.length - slow.length);
  else if (fast.length < slow.length) slow.splice(0, slow.length - fast.length);

  if (slow.length === fast.length && slow.length > 0) {
    const MACD: LineData[] = [];
    const histogram: HistogramData[] = [];

    for (let i = 0; i < slow.length; i += 1) {
      MACD.push({ time: slow[i].time, value: fast[i].value - slow[i].value });
    }
    const signal: LineData[] = calcEMA_(MACD, signalLength);
    const lDiff = signal.length - MACD.length;
    for (let i = 0; i < signal.length; i += 1) {
      const value = MACD[i - lDiff].value - signal[i].value;
      histogram.push({
        time: signal[i].time,
        value,
        color: value < 0 ? theme.red : theme.green,
      });
    }

    return [MACD, signal, histogram];
  }

  return [];
}

function parseData_(stockData: TStockData): LineData[] {
  const { data, interval } = stockData;
  const cIndex = interval === "m1" ? 1 : 4;
  const parsedData: LineData[] = [];

  for (let i = 0; i < data.length; i += 1) {
    parsedData.push({
      time: data[i][0],
      value: parseFloat(data[i][cIndex] as string),
    });
  }

  return parsedData;
}

function calcEMA_(data: LineData[], length: number, smoothing = 2): LineData[] {
  const emaData: LineData[] = [];
  if (data.length > length) {
    const K = smoothing / (length + 1);
    let prevEMA = 0;
    for (let i = 0; i < length; i += 1) {
      prevEMA += data[i].value;
    }
    prevEMA /= length;
    emaData.push({ time: data[length - 1].time, value: prevEMA });

    for (let i = length; i < data.length; i += 1) {
      const CP = data[i].value;
      const curEMA = (CP - prevEMA) * K + prevEMA;
      emaData.push({ time: data[i].time, value: curEMA });
      prevEMA = curEMA;
    }
  }

  return emaData;
}
