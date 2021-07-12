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
  LineStyle,
  SeriesOptions,
} from "lightweight-charts";
import { Tooltip, TTooltip } from "./tooltip";
import { selectTheme, selectIndicators, selectAdvanced } from "app/store";
import { getTheme } from "themes";
import {
  calculateSMA,
  calculateEMA,
  calculateRSI,
  calculateStochastics,
  calculateMACD,
} from "tools";

function Chart({ stock, interval, height, width }: TProps): ReactElement {
  const [data, loadHistory] = useStockData(stock, interval);
  const indicators = useSelector(selectIndicators);
  const advanced = useSelector(selectAdvanced);
  const [hover, setHover] = useState<TTooltip[]>();
  const hoverPrev = useRef<string>();
  const [lastData, setLastData] = useState<TTooltip[]>();
  const theme = getTheme(useSelector(selectTheme));
  const divRef = useRef<HTMLDivElement>(null);
  const chart = useRef<IChartApi>();
  const mainSeries = useRef<ISeriesApi<"Line" | "Candlestick">>();
  const volumeSeries = useRef<ISeriesApi<"Area">>();
  const indicatorSerieses = useRef<ISeriesApi<"Line">[]>([]);
  const advancedSerieses = useRef<ISeriesApi<"Line" | "Histogram">[]>([]);
  const historyDebounce = useRef<NodeJS.Timeout | null>(null);

  // init chart
  useEffect(() => {
    if (divRef.current) {
      if (!chart.current) {
        chart.current = createChart(divRef.current, {
          width,
          height,
          leftPriceScale: { scaleMargins: { top: 0.75 } },
          rightPriceScale: { scaleMargins: { bottom: 0.3 } },
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
          if (param.seriesPrices.size && mainSeries.current) {
            const tooltip: TTooltip[] = [];
            const main = param.seriesPrices.get(mainSeries.current);
            const vol = volumeSeries.current
              ? param.seriesPrices.get(volumeSeries.current)
              : undefined;

            if (main === Object(main))
              tooltip.push({ type: "ohlc", ...Object(main) });
            else
              tooltip.push({
                type: "line",
                time: param.time as number,
                value: main ? (main as number) : 0,
              });
            tooltip.push({
              type: "line",
              time: param.time as number,
              value: vol ? (vol as number) : 0,
            });

            for (let i = 0; i < indicatorSerieses.current.length; i += 1) {
              const val = param.seriesPrices.get(indicatorSerieses.current[i]);
              tooltip.push({
                type: "line",
                time: param.time as number,
                value: val ? (val as number) : 0,
              });
            }

            for (let i = 0; i < advancedSerieses.current.length; i += 1) {
              const val = param.seriesPrices.get(advancedSerieses.current[i]);
              tooltip.push({
                type: "line",
                time: param.time as number,
                value: val ? (val as number) : 0,
              });
            }

            const id = JSON.stringify(tooltip);
            if (hoverPrev.current !== id) {
              setHover(tooltip);
              hoverPrev.current = id;
            }
          } else if (hoverPrev.current) {
            hoverPrev.current = undefined;
            setHover(undefined);
          }
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
        const tooltip: TTooltip[] = [];

        // line series
        if (data.interval === "m1") {
          if (
            mainSeries.current &&
            mainSeries.current.seriesType() !== "Line"
          ) {
            chart.current.removeSeries(mainSeries.current);
            mainSeries.current = undefined;
          }
          if (!mainSeries.current)
            mainSeries.current = chart.current.addLineSeries();

          const lineData: LineData[] = getLineData(data);
          mainSeries.current.setData(lineData);
          const { time, value } = lineData[lineData.length - 1];
          tooltip.push({
            type: "line",
            value,
            time: time as number,
          });
        }
        // candle series
        else {
          const ohlcData = getOhlcData(data);

          if (
            mainSeries.current &&
            mainSeries.current.seriesType() !== "Candlestick"
          ) {
            chart.current.removeSeries(mainSeries.current);
            mainSeries.current = undefined;
          }

          if (!mainSeries.current)
            mainSeries.current = chart.current.addCandlestickSeries();
          mainSeries.current.applyOptions({
            upColor: theme.green[0],
            wickUpColor: theme.green[0],
            downColor: theme.red[0],
            wickDownColor: theme.red[0],
            borderVisible: false,
          });

          mainSeries.current.setData(ohlcData);
          tooltip.push({ type: "ohlc", ...ohlcData[ohlcData.length - 1] });
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
        tooltip.push({
          type: "line",
          time: volumeData[volumeData.length - 1].time as number,
          value: volumeData[volumeData.length - 1].value,
        });

        chart.current.applyOptions({
          watermark: { visible: false },
          timeScale: {
            timeVisible: !["d1", "w1", "n1"].includes(data.interval),
          },
          crosshair: {
            horzLine: { visible: true },
            vertLine: { visible: true },
          },
        });

        for (let i = 0; i < indicatorSerieses.current.length; i += 1) {
          chart.current.removeSeries(indicatorSerieses.current[i]);
        }
        for (let i = 0; i < advancedSerieses.current.length; i += 1) {
          chart.current.removeSeries(advancedSerieses.current[i]);
        }
        indicatorSerieses.current = [];
        advancedSerieses.current = [];

        if (indicators.length > 0) {
          for (let i = 0; i < indicators.length; i += 1) {
            const indicatorSeries: SeriesOptions<any> = {
              priceLineVisible: false,
              lastValueVisible: false,
              crosshairMarkerVisible: false,
              color: theme.indicators[i],
              lineStyle: LineStyle.Solid,
              lineWidth: 2,
            };
            indicatorSerieses.current.push(
              chart.current.addLineSeries(indicatorSeries)
            );
            const indicatorData =
              indicators[i].type === "ema"
                ? calculateEMA(data, indicators[i].length)
                : calculateSMA(data, indicators[i].length);

            indicatorSerieses.current[i].setData(indicatorData);

            tooltip.push({
              type: "line",
              time:
                indicatorData.length > 0
                  ? (indicatorData[indicatorData.length - 1].time as number)
                  : 0,
              value:
                indicatorData.length > 0
                  ? indicatorData[indicatorData.length - 1].value
                  : 0,
            });
          }
        }

        if (advanced) {
          const advancedSeries: SeriesOptions<any> = {
            priceLineVisible: false,
            lastValueVisible: false,
            crosshairMarkerVisible: false,
            lineStyle: LineStyle.Solid,
            lineWidth: 1,
            priceScaleId: "advanced",
            scaleMargins: { bottom: 0, top: 0.8 },
          };
          let advancedData = [];
          const priceLines: number[] = [];
          switch (advanced.type) {
            case "rsi":
              priceLines.push(70, 30);
              const rsiData = calculateRSI(data, advanced.length);
              if (rsiData.length) advancedData.push(rsiData);
              break;
            case "stoch":
              priceLines.push(80, 20);
              advancedData = calculateStochastics(data, advanced.k, advanced.d);
              break;
            case "macd":
              priceLines.push(0);
              advancedData = calculateMACD(
                data,
                advanced.fast,
                advanced.slow,
                advanced.smoothing,
                theme
              );
              break;
          }

          for (let i = 0; i < advancedData.length; i += 1) {
            advancedSeries.color =
              theme.advanced[advanced.type === "rsi" ? 2 : i];
            advancedSerieses.current.push(
              i === 2
                ? chart.current.addHistogramSeries(advancedSeries)
                : chart.current.addLineSeries(advancedSeries)
            );
            advancedSerieses.current[i].setData(advancedData[i]);

            tooltip.push({
              type: "line",
              time:
                advancedData[i].length > 0
                  ? (advancedData[i][advancedData[i].length - 1].time as number)
                  : 0,
              value:
                advancedData[i].length > 0
                  ? advancedData[i][advancedData[i].length - 1].value
                  : 0,
            });
          }
          if (
            advancedSerieses.current.length &&
            ["rsi", "stoch"].includes(advanced.type)
          ) {
            advancedSerieses.current[0].applyOptions({
              autoscaleInfoProvider: () => ({
                priceRange: {
                  minValue: 0,
                  maxValue: 100,
                },
              }),
            });
          }

          priceLines.forEach((price) =>
            advancedSerieses.current[0].createPriceLine({
              color: theme.crosshair,
              price,
              lineStyle: LineStyle.Dotted,
              lineWidth: 1,
              axisLabelVisible: true,
              title: "",
            })
          );
        }

        setLastData(tooltip);
      } else {
        if (mainSeries.current) chart.current.removeSeries(mainSeries.current);
        if (volumeSeries.current)
          chart.current.removeSeries(volumeSeries.current);

        chart.current.applyOptions({
          watermark: { visible: true },
        });
      }
    }
  }, [data, theme, indicators, advanced]);

  // handle title change
  useEffect(() => {
    let title = stock.toUpperCase();
    if (data.data.length) {
      const last = data.data[data.data.length - 1];
      title += " " + (data.interval === "m1" ? last[1] : last[4]);
    }

    if (title !== "") title += " | ";
    title += "Tornsy";

    if (document.title !== title) document.title = title;
  }, [stock, data]);

  return (
    <div ref={divRef}>
      <Tooltip data={data} series={hover || lastData || []} />
    </div>
  );
}

export default memo(Chart);

function getLineData(data: TStockData): LineData[] {
  const cIndex = data.interval === "m1" ? 1 : 4;
  const lineData: LineData[] = [];

  for (let i = 0, num = data.data.length; i < num; i += 1) {
    const row = data.data[i];
    lineData.push({
      time: row[0],
      value: parseFloat(row[cIndex] as string),
    });
  }

  return lineData;
}

function getOhlcData(data: TStockData): BarData[] {
  const oIndex = 1;
  const hIndex = data.interval === "m1" ? 1 : 2;
  const lIndex = data.interval === "m1" ? 1 : 3;
  const cIndex = data.interval === "m1" ? 1 : 4;
  const ohlcData: BarData[] = [];

  for (let i = 0; i < data.data.length; i += 1) {
    const row = data.data[i];
    ohlcData.push({
      time: row[0],
      open: parseFloat(row[oIndex]),
      high: parseFloat(row[hIndex] as string),
      low: parseFloat(row[lIndex] as string),
      close: parseFloat(row[cIndex] as string),
    });
  }

  return ohlcData;
}

type TProps = {
  stock: string;
  interval: TInterval;
  height: number;
  width: number;
};
