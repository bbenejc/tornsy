import React, { memo, ReactElement, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useStockData } from "hooks";
import {
  createChart,
  IChartApi,
  LineData,
  BarData,
  ISeriesApi,
  MouseEventParams,
  CrosshairMode,
  TimeRange,
} from "lightweight-charts";
import { Tooltip } from "./tooltip";
import { selectTheme } from "app/store";
import { getTheme } from "themes";

function Chart({ stock, interval, height, width }: TProps): ReactElement {
  const [data, loadHistory] = useStockData(stock, interval);
  const theme = getTheme(useSelector(selectTheme));
  const [hover, setHover] = useState(0);
  const divRef = useRef<HTMLDivElement>(null);
  const chart = useRef<IChartApi>();
  const lineSeries = useRef<ISeriesApi<"Line">>();
  const ohlcSeries = useRef<ISeriesApi<"Candlestick">>();
  const volumeSeries = useRef<ISeriesApi<"Area">>();
  const historyDebounce = useRef<NodeJS.Timeout | null>(null);

  // init chart
  useEffect(() => {
    if (divRef.current) {
      if (!chart.current) {
        chart.current = createChart(divRef.current, {
          width,
          height,
          leftPriceScale: {
            scaleMargins: {
              top: 0.75,
            },
          },
          rightPriceScale: {
            scaleMargins: { bottom: 0.2 },
          },
          watermark: {
            text: "Loading",
            fontSize: 20,
          },
          crosshair: {
            mode: CrosshairMode.Normal,
            horzLine: { visible: false },
            vertLine: { visible: false },
          },
        });
        chart.current
          .timeScale()
          .subscribeVisibleTimeRangeChange((e: TimeRange | null) => {
            if (historyDebounce.current) clearTimeout(historyDebounce.current);
            historyDebounce.current = setTimeout(() => {
              if (e !== null) loadHistory(e.from as number);
              historyDebounce.current = null;
            }, 50);
          });
        chart.current.subscribeCrosshairMove((param: MouseEventParams) => {
          setHover(param.time ? (param.time as number) : 0);
        });
      } else chart.current.resize(width, height);

      chart.current.applyOptions({
        layout: {
          backgroundColor: theme.paper,
          textColor: theme.font,
        },
        grid: {
          horzLines: { color: theme.grid },
          vertLines: { color: theme.grid },
        },
        rightPriceScale: { borderColor: theme.axis },
        timeScale: {
          timeVisible: true,
          secondsVisible: false,
          rightOffset: 8,
          borderColor: theme.axis,
        },
        crosshair: {
          horzLine: { color: theme.crosshair },
          vertLine: { color: theme.crosshair },
        },
        watermark: { color: theme.fontSec },
      });
    }
  }, [width, height, loadHistory, theme]);

  // handle data series
  useEffect(() => {
    if (chart.current) {
      if (data.data.length) {
        // line series
        if (data.interval === "m1") {
          if (!lineSeries.current)
            lineSeries.current = chart.current.addLineSeries();

          const lineData: LineData[] = [];
          for (let i = 0; i < data.data.length; i += 1) {
            lineData.push({
              time: data.data[i][0],
              value: parseFloat(data.data[i][1]),
            });
          }
          lineSeries.current.setData(lineData);
          if (ohlcSeries.current) {
            chart.current.removeSeries(ohlcSeries.current);
            ohlcSeries.current = undefined;
          }
        }
        // candle series
        else {
          if (!ohlcSeries.current)
            ohlcSeries.current = chart.current.addCandlestickSeries();
          ohlcSeries.current.applyOptions({
            upColor: theme.green,
            wickUpColor: theme.green,
            downColor: theme.red,
            wickDownColor: theme.red,
            borderVisible: false,
          });
          const ohlcData: BarData[] = [];
          for (let i = 0; i < data.data.length; i += 1) {
            const row = data.data[i];
            ohlcData.push({
              time: row[0],
              open: parseFloat(row[1]),
              high: parseFloat(row[2]),
              low: parseFloat(row[3]),
              close: parseFloat(row[4]),
            });
          }
          ohlcSeries.current.setData(ohlcData);
          if (lineSeries.current) {
            chart.current.removeSeries(lineSeries.current);
            lineSeries.current = undefined;
          }
        }
        // volume series
        if (!volumeSeries.current)
          volumeSeries.current = chart.current.addAreaSeries({
            priceScaleId: "left",
            priceLineVisible: false,
            crosshairMarkerVisible: false,
            lineWidth: 2,
          });
        volumeSeries.current.applyOptions({
          lineColor: `rgba(${theme.volume},0.3)`,
          topColor: `rgba(${theme.volume},0.6)`,
          bottomColor: `rgba(${theme.volume},0)`,
        });

        const volumeData: LineData[] = [];
        const v = data.data[0].length - 1;
        for (let i = 0; i < data.data.length; i += 1) {
          const row = data.data[i];
          volumeData.push({
            time: row[0],
            value: row[v],
          });
        }
        volumeSeries.current.setData(volumeData);

        chart.current.applyOptions({
          watermark: { visible: false },
          timeScale: { timeVisible: data.interval !== "d1" },
          crosshair: {
            horzLine: { visible: true },
            vertLine: { visible: true },
          },
        });
      } else {
        if (lineSeries.current) chart.current.removeSeries(lineSeries.current);
        if (ohlcSeries.current) chart.current.removeSeries(ohlcSeries.current);
        if (volumeSeries.current)
          chart.current.removeSeries(volumeSeries.current);
        chart.current.applyOptions({
          watermark: { visible: true },
        });
      }
    }
  }, [data, theme]);

  // handle title change
  useEffect(() => {
    let title = stock.toUpperCase();
    if (data.data.length) {
      const last = data.data[data.data.length - 1];
      title += " " + (data.interval === "m1" ? last[1] : last[4]);
    }

    if (title !== "") title += " | ";
    title += "Torn City Stocks";

    if (document.title !== title) document.title = title;
  }, [stock, data]);

  return (
    <div ref={divRef}>
      <Tooltip data={data} hover={hover} />
    </div>
  );
}

export default memo(Chart);

type TProps = {
  stock: string;
  interval: TInterval;
  height: number;
  width: number;
};
