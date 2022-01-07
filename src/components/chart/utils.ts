import { VOLUME } from 'config';
import {
  BarData,
  createChart,
  CrosshairMode,
  IChartApi,
  ISeriesApi,
  LineData,
  LineStyle,
  MouseEventParams,
  SeriesOptions,
} from 'lightweight-charts';
import { Dispatch, MutableRefObject, SetStateAction } from 'react';
import {
  calculateADX,
  calculateEMA,
  calculateMACD,
  calculateRSI,
  calculateSMA,
  calculateStochastics,
  formatNumber,
} from 'tools';
import { TTooltip } from './tooltip';

export function initChart(div: HTMLDivElement, width: number, height: number): IChartApi {
  return createChart(div, {
    width,
    height,
    leftPriceScale: { scaleMargins: { top: 0.75 } },
    rightPriceScale: { scaleMargins: { bottom: 0.3 } },
    watermark: { text: 'Loading', fontSize: 20 },
    crosshair: {
      mode: CrosshairMode.Normal,
      horzLine: { visible: false },
      vertLine: { visible: false },
    },
    localization: {
      priceFormatter: (price: number) => formatNumber(price),
    },
  });
}

export function createCrosshairHandler(
  chart: IChartApi,
  main: MutableRefObject<ISeriesApi<'Line' | 'Candlestick'> | undefined>,
  volume: MutableRefObject<ISeriesApi<'Area'> | undefined>,
  indicators: MutableRefObject<ISeriesApi<'Line'>[]>,
  advanced: MutableRefObject<ISeriesApi<'Line' | 'Histogram'>[]>,
  setHover: Dispatch<SetStateAction<TTooltip[] | undefined>>,
  hoverPrev: MutableRefObject<string | undefined>,
  isLoading: MutableRefObject<boolean>
) {
  chart.subscribeCrosshairMove((param: MouseEventParams) => {
    if (param.seriesPrices.size && main.current && !isLoading.current) {
      const tooltip: TTooltip[] = [];
      const ohlc = param.seriesPrices.get(main.current);
      const vol = volume.current ? param.seriesPrices.get(volume.current) : undefined;

      if (ohlc === Object(ohlc)) {
        tooltip.push({ type: 'ohlc', ...Object(ohlc) });
      } else {
        tooltip.push({
          type: 'line',
          time: param.time as number,
          value: ohlc ? (ohlc as number) : 0,
        });
      }

      tooltip.push({
        type: 'line',
        time: param.time as number,
        value: vol ? (vol as number) : 0,
      });

      for (let i = 0; i < indicators.current.length; i += 1) {
        const val = param.seriesPrices.get(indicators.current[i]);
        tooltip.push({
          type: 'line',
          time: param.time as number,
          value: val ? (val as number) : 0,
        });
      }

      for (let i = 0; i < advanced.current.length; i += 1) {
        const val = param.seriesPrices.get(advanced.current[i]);
        tooltip.push({
          type: 'line',
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
}

export function applyTheme(chart: IChartApi, theme: TTheme) {
  chart.applyOptions({
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
      borderColor: theme.axis,
    },
    crosshair: {
      horzLine: { color: theme.crosshair },
      vertLine: { color: theme.crosshair },
    },
    watermark: { color: theme.fontSec },
  });
}

export function createMainSeries(
  chart: IChartApi,
  series: MutableRefObject<ISeriesApi<'Line' | 'Candlestick'> | undefined>,
  data: TStockData[],
  interval: TInterval,
  tooltip: TTooltip[],
  theme: TTheme
): void {
  if (interval === 'm1') {
    if (series.current && series.current.seriesType() !== 'Line') {
      chart.removeSeries(series.current);
      series.current = undefined;
    }
    if (!series.current) series.current = chart.addLineSeries();

    const lineData: LineData[] = getLineData(data, interval);
    series.current.setData(lineData);
    const { time, value } = lineData[lineData.length - 1];
    tooltip.push({
      type: 'line',
      value,
      time: time as number,
    });
  }
  // candle series
  else {
    const ohlcData = getOhlcData(data, interval);

    if (series.current && series.current.seriesType() !== 'Candlestick') {
      chart.removeSeries(series.current);
      series.current = undefined;
    }

    if (!series.current) {
      series.current = chart.addCandlestickSeries();
      series.current.applyOptions({
        upColor: theme.green[0],
        wickUpColor: theme.green[0],
        downColor: theme.red[0],
        wickDownColor: theme.red[0],
        borderVisible: false,
      });
    }

    series.current.setData(ohlcData);
    tooltip.push({ type: 'ohlc', ...ohlcData[ohlcData.length - 1] });
  }
}

export function createVolumeSeries(
  chart: IChartApi,
  series: MutableRefObject<ISeriesApi<'Area'> | undefined>,
  data: TStockData[],
  volume: string,
  tooltip: TTooltip[],
  theme: TTheme
) {
  if (!series.current) {
    series.current = chart.addAreaSeries({
      priceScaleId: 'left',
      priceLineVisible: false,
      crosshairMarkerVisible: false,
      lineWidth: 2,
    });
  }

  series.current.applyOptions({
    lineColor: `rgba(${theme.volume},0.3)`,
    topColor: `rgba(${theme.volume},0.6)`,
    bottomColor: `rgba(${theme.volume},0)`,
  });

  const volumeData: LineData[] = [];
  const v = data[0].length - (volume === VOLUME[0][0] ? 2 : 1);
  for (let i = 0; i < data.length; i += 1) {
    const row = data[i];
    volumeData.push({
      time: row[0],
      value: row[v],
    });
  }
  series.current.setData(volumeData);

  tooltip.push({
    type: 'line',
    time: volumeData[volumeData.length - 1].time as number,
    value: volumeData[volumeData.length - 1].value,
  });
}

export function createIndicatorSeries(
  chart: IChartApi,
  series: MutableRefObject<ISeriesApi<'Line'>[]>,
  data: TStockData[],
  interval: TInterval,
  indicators: TIndicator[],
  tooltip: TTooltip[],
  theme: TTheme
) {
  series.current.map((s) => chart.removeSeries(s));
  series.current = [];

  if (indicators.length > 0) {
    for (let i = 0; i < indicators.length; i += 1) {
      const seriesData =
        indicators[i].type === 'ema'
          ? calculateEMA(data, interval, indicators[i].length)
          : calculateSMA(data, interval, indicators[i].length);

      const num = seriesData.length;
      series.current.push(
        chart.addLineSeries({
          priceLineVisible: false,
          lastValueVisible: !!indicators[i].showPrice,
          crosshairMarkerVisible: false,
          color: theme.indicators[i],
          lineStyle: LineStyle.Solid,
          lineWidth: 2,
        })
      );

      series.current[i].setData(seriesData);
      tooltip.push({
        type: 'line',
        time: num > 0 ? (seriesData[num - 1].time as number) : 0,
        value: num > 0 ? seriesData[num - 1].value : 0,
      });
    }
  }
}

export function createAdvancedSeries(
  chart: IChartApi,
  series: MutableRefObject<ISeriesApi<'Line' | 'Histogram'>[]>,
  data: TStockData[],
  interval: TInterval,
  advanced: TAdvanced,
  tooltip: TTooltip[],
  theme: TTheme
) {
  series.current.map((s) => chart.removeSeries(s));
  series.current = [];

  if (advanced) {
    const options: SeriesOptions<any> = {
      priceLineVisible: false,
      lastValueVisible: false,
      crosshairMarkerVisible: false,
      lineStyle: LineStyle.Solid,
      lineWidth: 1,
      priceScaleId: 'advanced',
      scaleMargins: { bottom: 0, top: 0.8 },
    };
    let advancedData = [];
    const priceLines: number[] = [];
    switch (advanced.type) {
      case 'rsi':
        priceLines.push(70, 30);
        const rsiData = calculateRSI(data, interval, advanced.length);
        if (rsiData.length) advancedData.push(rsiData);
        break;
      case 'stoch':
        priceLines.push(80, 20);
        advancedData = calculateStochastics(data, interval, advanced.k, advanced.d);
        break;
      case 'macd':
        priceLines.push(0);
        advancedData = calculateMACD(data, interval, advanced.fast, advanced.slow, advanced.smoothing, theme);
        break;
      case 'adx':
        priceLines.push(20);
        const adxData = calculateADX(data, interval, advanced.length);
        if (adxData.length) advancedData.push(adxData);
        break;
    }

    for (let i = 0; i < advancedData.length; i += 1) {
      options.color =
        theme.advanced[['rsi', 'adx'].includes(advanced.type) ? 2 : i - (advanced.type === 'macd' ? 1 : 0)];
      series.current.push(
        i === 0 && advanced.type === 'macd' ? chart.addHistogramSeries(options) : chart.addLineSeries(options)
      );
      series.current[i].setData(advancedData[i]);

      tooltip.push({
        type: 'line',
        time: advancedData[i].length > 0 ? (advancedData[i][advancedData[i].length - 1].time as number) : 0,
        value: advancedData[i].length > 0 ? advancedData[i][advancedData[i].length - 1].value : 0,
      });
    }

    if (series.current.length) {
      if (['rsi', 'stoch'].includes(advanced.type)) {
        series.current[0].applyOptions({
          autoscaleInfoProvider: () => ({
            priceRange: {
              minValue: 0,
              maxValue: 100,
            },
          }),
        });
      }

      priceLines.forEach((price) =>
        series.current[0].createPriceLine({
          color: theme.crosshair,
          price,
          lineStyle: LineStyle.Dotted,
          lineWidth: 1,
          axisLabelVisible: true,
          title: '',
        })
      );
    }
  }
}

function getLineData(data: TStockData[], interval: TInterval): LineData[] {
  const cIndex = interval === 'm1' ? 1 : 4;
  const lineData: LineData[] = [];

  for (let i = 0, num = data.length; i < num; i += 1) {
    const row = data[i];
    lineData.push({
      time: row[0],
      value: parseFloat(row[cIndex] as string),
    });
  }

  return lineData;
}

function getOhlcData(data: TStockData[], interval: TInterval): BarData[] {
  const oIndex = 1;
  const hIndex = interval === 'm1' ? 1 : 2;
  const lIndex = interval === 'm1' ? 1 : 3;
  const cIndex = interval === 'm1' ? 1 : 4;
  const ohlcData: BarData[] = [];

  for (let i = 0; i < data.length; i += 1) {
    const row = data[i];
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

export function enableLoadingMode(chart: IChartApi): void {
  chart.applyOptions({
    watermark: { visible: true },
    handleScroll: false,
    handleScale: false,
    crosshair: { horzLine: { visible: false, labelVisible: false }, vertLine: { visible: false, labelVisible: false } },
  });
}

export function disableLoadingMode(chart: IChartApi, interval: TInterval): void {
  const scale = chart.timeScale();
  const range = scale.getVisibleLogicalRange();
  const bar = range ? Math.round(scale.width() / (range.to - range.from)) : 6;

  chart.applyOptions({
    watermark: { visible: false },
    timeScale: {
      timeVisible: !['d1', 'w1', 'n1'].includes(interval),
      rightOffset: 10 / bar,
    },
    handleScroll: true,
    handleScale: true,
    crosshair: { horzLine: { visible: true, labelVisible: true }, vertLine: { visible: true, labelVisible: true } },
  });
}
