import type { LineData } from "lightweight-charts";
import { sumArray } from "./utils";

export function calculateSMA(data: LineData[], length = 6): LineData[] {
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
  data: LineData[],
  length = 6,
  smoothing = 2
): LineData[] {
  const K = smoothing / (length + 1);
  const emaData: LineData[] = [];

  if (data.length > length) {
    let prevEMA = sumArray(data.slice(0, length).map((d) => d.value)) / length;
    emaData.push({ time: data[length - 1].time, value: prevEMA });

    for (let i = length; i < data.length; i += 1) {
      const curEMA = (data[i].value - prevEMA) * K + prevEMA;
      emaData.push({ time: data[i].time, value: curEMA });
      prevEMA = curEMA;
    }
  }

  return emaData;
}
