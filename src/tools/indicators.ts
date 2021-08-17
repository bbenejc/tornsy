import type { HistogramData, LineData } from "lightweight-charts";
import { sumArray } from "./utils";

export function calculateSMA(
  stockData: TStockData[],
  interval: TInterval,
  length = 6
): LineData[] {
  const data = parseData_(stockData, interval);
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
  stockData: TStockData[],
  interval: TInterval,
  length = 6,
  smoothing = 2
): LineData[] {
  const data = parseData_(stockData, interval);

  return calcEMA_(data, length, smoothing);
}

export function calculateRSI(
  data: TStockData[],
  interval: TInterval,
  length = 14
): LineData[] {
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
  data: TStockData[],
  interval: TInterval,
  kLength = 12,
  dLength = 3
): LineData[][] {
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
  stockData: TStockData[],
  interval: TInterval,
  fastLength = 12,
  slowLength = 26,
  signalLength = 9,
  theme: TTheme
): (LineData[] | HistogramData[])[] {
  const data = parseData_(stockData, interval);
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
    let prevValue = 0;
    for (let i = 0; i < signal.length; i += 1) {
      const value = MACD[i - lDiff].value - signal[i].value;
      const cIndex =
        value * prevValue > 0 && Math.abs(value) < Math.abs(prevValue) ? 1 : 0;
      histogram.push({
        time: signal[i].time,
        value,
        color: value < 0 ? theme.red[cIndex] : theme.green[cIndex],
      });
      prevValue = value;
    }

    return [MACD, signal, histogram];
  }

  return [];
}

export function calculateADX(
  data: TStockData[],
  interval: TInterval,
  smoothing = 14
): LineData[] {
  const hIndex = interval === "m1" ? 1 : 2;
  const lIndex = interval === "m1" ? 1 : 3;
  const cIndex = interval === "m1" ? 1 : 4;

  const DMplus: LineData[] = [];
  const DMminus: LineData[] = [];
  const TR: LineData[] = [];

  for (let i = 1; i < data.length; i += 1) {
    const time = data[i][0];
    const CH = parseFloat(data[i][hIndex] as string);
    const PH = parseFloat(data[i - 1][hIndex] as string);
    const CL = parseFloat(data[i][lIndex] as string);
    const PL = parseFloat(data[i - 1][lIndex] as string);
    const PC = parseFloat(data[i - 1][cIndex] as string);

    const h = CH - PH;
    const l = PL - CL;

    DMplus.push({ time, value: h > l && h > 0 ? h : 0 });
    DMminus.push({ time, value: l > h && l > 0 ? l : 0 });
    TR.push({
      time,
      value: Math.max(CH - CL, Math.abs(CH - PC), Math.abs(CL - PC)),
    });
  }

  const sTR = wilderSmooth_(TR, smoothing);
  const sDMplus = wilderSmooth_(DMplus, smoothing);
  const sDMminus = wilderSmooth_(DMminus, smoothing);

  const DIplus: LineData[] = [];
  const DIminus: LineData[] = [];
  const DX: LineData[] = [];

  for (let i = 0; i < sTR.length; i += 1) {
    const { time, value: tr } = sTR[i];
    const DIP = (sDMplus[i].value / tr) * 100;
    const DIM = (sDMminus[i].value / tr) * 100;
    DIplus.push({ time, value: DIP });
    DIminus.push({ time, value: DIM });
    DX.push({ time, value: (Math.abs(DIP - DIM) / (DIP + DIM)) * 100 });
  }

  const ADX: LineData[] = [];
  if (DX.length > smoothing) {
    let first = 0;
    for (let i = 0; i < smoothing; i += 1) first += DX[i].value;
    ADX.push({ time: DX[smoothing - 1].time, value: first / smoothing });

    for (let i = smoothing; i < DX.length; i += 1) {
      ADX.push({
        time: DX[i].time,
        value:
          (ADX[i - smoothing].value * (smoothing - 1) + DX[i].value) /
          smoothing,
      });
    }
  }

  return ADX;
}

function parseData_(data: TStockData[], interval: TInterval): LineData[] {
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

function wilderSmooth_(data: LineData[], smoothing = 14): LineData[] {
  const result: LineData[] = [];
  if (data.length > smoothing) {
    let first = 0;
    for (let i = 0; i < smoothing; i += 1) first += data[i].value;
    result.push({ time: data[smoothing - 1].time, value: first });

    for (let i = smoothing; i < data.length; i += 1) {
      result.push({
        time: data[i].time,
        value:
          result[i - smoothing].value -
          result[i - smoothing].value / smoothing +
          data[i].value,
      });
    }
  }

  return result;
}
