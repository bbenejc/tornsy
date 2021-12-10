import React, { memo, ReactElement, useCallback, useState, ChangeEvent, useEffect, useRef, Ref } from 'react';
import ReactDOM from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectIndicators,
  selectAdvanced,
  selectStockInfo,
  selectTheme,
  selectVolume,
  createIndicator,
  removeIndicator as removeIndicatorAction,
  setIndicator,
  createAdvanced,
  removeAdvanced as removeAdvancedAction,
  setAdvanced,
  updateAdvanced,
  setVolume,
} from 'app/store';
import { Placeholder } from 'components';
import { getTheme } from 'themes';
import { getStockLogoUrl, findDataIndex, formatNumber } from 'tools';
import { INTERVALS, INDICATORS_ADVANCED, INDICATORS_MAX, VOLUME } from 'config';
import css from './tooltip.module.css';

// TODO: add backgrounds
// TODO: mobile visibility on "edit" and "remove" buttons... can click even when hidden
function Tooltip({ data, series, stock, interval }: TProps): ReactElement {
  const dispatch = useDispatch();
  const stockInfo = useSelector(selectStockInfo(stock));
  const indicators = useSelector(selectIndicators);
  const advanced = useSelector(selectAdvanced);
  const volume = useSelector(selectVolume);
  const [indicatorSettings, setIndicatorSettings] = useState(-1);
  const [advancedSettings, setAdvancedSettings] = useState(false);
  const theme = getTheme(useSelector(selectTheme));
  const wrapperRef = useRef<any>();

  const toggleVolume = useCallback(() => {
    dispatch(setVolume());
  }, [dispatch]);

  const addIndicator = useCallback(() => {
    dispatch(createIndicator());
  }, [dispatch]);

  const removeIndicator = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const i = parseInt(e.currentTarget.getAttribute('data-index') || '');
      dispatch(removeIndicatorAction(i));
    },
    [dispatch]
  );

  const editIndicator = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const i = parseInt(e.currentTarget.getAttribute('data-index') || '-1');
    ReactDOM.unstable_batchedUpdates(() => {
      setIndicatorSettings((cur) => (cur === i ? -1 : i));
      setAdvancedSettings(false);
    });
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const addAdvanced = useCallback(() => {
    dispatch(createAdvanced());
  }, [dispatch]);

  const editAdvanced = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    ReactDOM.unstable_batchedUpdates(() => {
      setAdvancedSettings((cur) => !cur);
      setIndicatorSettings(-1);
    });
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const removeAdvanced = useCallback(() => {
    dispatch(removeAdvancedAction());
  }, [dispatch]);

  const closeIndicatorSettings = useCallback(() => {
    ReactDOM.unstable_batchedUpdates(() => {
      setIndicatorSettings(-1);
      setAdvancedSettings(false);
    });
  }, []);

  useEffect(() => {
    if (indicatorSettings >= 0 || advancedSettings) {
      const clickAway = (e: MouseEvent | TouchEvent) => {
        if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
          closeIndicatorSettings();
        }
      };

      const escKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIndicatorSettings(-1);
          setAdvancedSettings(false);
        }
      };

      document.addEventListener('click', clickAway);
      document.addEventListener('keyup', escKey);
      return () => {
        document.removeEventListener('click', clickAway);
        document.removeEventListener('keyup', escKey);
      };
    }
  }, [indicatorSettings, advancedSettings, closeIndicatorSettings]);

  if (stockInfo) {
    const dataIndex =
      series && series.length > 0 && data.length > 0
        ? findDataIndex(data, series[1].type === 'line' ? series[1].time : 0)
        : -1;

    const info: ReactElement[] = [];
    const extra: ReactElement[] = [];
    const advancedExtra: ReactElement[] = [];
    const infoCss = [css.Info];

    if (dataIndex >= 0) {
      let diff;
      let prev;
      if (series[0].type === 'line') {
        info.push(
          <div className={css.Ohlc} key="p">
            <span>{series[0].value ? formatNumber(series[0].value) : ''}</span>
          </div>
        );
        if (dataIndex > 0) {
          const cur = parseFloat(data[dataIndex][1]);
          prev = parseFloat(data[dataIndex - 1][1]);
          diff = cur - prev;

          if (diff >= 0) infoCss.push(css.Green);
          else infoCss.push(css.Red);
        } else infoCss.push(css.Red);
      } else {
        prev = dataIndex > 0 ? parseFloat(data[dataIndex - 1][4] || '') : series[0].open;
        diff = series[0].close - prev;
        infoCss.push(diff >= 0 ? css.Green : css.Red);

        info.push(
          <div className={css.Ohlc} key="o">
            <span>O</span>
            <span>{formatNumber(series[0].open)}</span>
          </div>
        );
        info.push(
          <div className={css.Ohlc} key="h">
            <span>H</span>
            <span>{formatNumber(series[0].high)}</span>
          </div>
        );
        info.push(
          <div className={css.Ohlc} key="l">
            <span>L</span>
            <span>{formatNumber(series[0].low)}</span>
          </div>
        );
        info.push(
          <div className={css.Ohlc} key="c">
            <span>C</span>
            <span>{formatNumber(series[0].close)}</span>
          </div>
        );
      }
      if (diff !== undefined && prev !== undefined) {
        info.push(
          <div className={css.OhlcGrowth} key="d">
            <span>{(diff >= 0 ? '+' : '') + formatNumber(diff)}</span>
            <span>({(diff >= 0 ? '+' : '') + formatNumber((diff / prev) * 100) + '%'})</span>
          </div>
        );
      }
    } else {
      const spans = interval === 'm1' ? [] : ['O', 'H', 'L', 'C'];
      for (let i = 0; i < (interval === 'm1' ? 2 : 5); i += 1) {
        info.push(
          <div className={css.Ohlc} key={i}>
            {spans[i] && <span>{spans[i]}</span>}
            <Placeholder width={3.5} />
          </div>
        );
      }
    }

    for (let i = 0; i < indicators.length; i += 1) {
      let Value;
      if (series.length < i + 3) Value = <Placeholder />;
      else {
        const s = series[i + 2];
        const val = s.type === 'line' ? s.value : s.close;
        Value = <div className={css.Value}>{!!val ? formatNumber(val) : <span>-</span>}</div>;
      }
      extra.push(
        <div className={css.Indicator} key={'i' + i}>
          <div className={css.Name} style={{ color: theme.indicators[i] }}>
            {indicators[i].type.toUpperCase() + ' ' + indicators[i].length}
          </div>
          {Value}
          <div className={css.Controls}>
            <div title="Edit indicator" data-index={i} onClick={editIndicator}>
              <svg viewBox="0 0 100 100">
                <use xlinkHref={`#icon-settings`} />
              </svg>
            </div>
            <div title="Remove indicator" data-index={i} onClick={removeIndicator}>
              <svg viewBox="0 0 100 100">
                <use xlinkHref={`#icon-trash`} />
              </svg>
            </div>
          </div>
        </div>
      );
    }
    if (indicators.length < INDICATORS_MAX) {
      extra.push(
        <div
          key="add-indicator"
          className={[css.Indicator, css.Add].join(' ')}
          onClick={addIndicator}
          style={{ color: theme.indicators[indicators.length] }}
        >
          + Indicator
        </div>
      );
    }

    const advancedIndicator = advanced ? INDICATORS_ADVANCED.find((i) => i.type === advanced.type) : undefined;
    if (advanced && advancedIndicator) {
      const { type, params } = advancedIndicator;
      const advancedSeries = [];

      for (let a = 0, i = 2 + indicators.length; a < params.length; a += 1, i += 1) {
        const s = series[i];
        const val = s ? (s.type === 'line' ? s.value : s.close) : undefined;
        let Value = val ? formatNumber(val, false, type === 'macd' ? 4 : 2) : <Placeholder />;

        advancedSeries.push(
          <div
            className={[css.Value, type === 'macd' ? css.BigValue : ''].join(' ')}
            style={{
              color:
                val !== undefined && type === 'macd' && a === 0
                  ? val > 0
                    ? theme.green[0]
                    : theme.red[0]
                  : theme.advanced[['rsi', 'adx'].includes(type) ? 2 : type === 'macd' ? a - 1 : a],
            }}
            key={i}
          >
            {Value}
          </div>
        );
      }

      if (type === 'macd') advancedSeries.push(advancedSeries.shift());
      const nameInfo: number[] = [];
      params.forEach(({ key, value }) => {
        nameInfo.push(key in advanced ? advanced[key as keyof TAdvanced] : value);
      });

      advancedExtra.push(
        <div className={css.Indicator} key={advanced.type}>
          <div className={[css.Name, advanced.type === 'macd' ? css.BigName : ''].join(' ')}>
            {advanced.type.toUpperCase()} <span className={css.NameInfo}>{nameInfo.join(' ')}</span>
          </div>
          {advancedSeries}
          <div className={css.Controls}>
            <div title="Edit indicator" onClick={editAdvanced}>
              <svg viewBox="0 0 100 100">
                <use xlinkHref="#icon-settings" />
              </svg>
            </div>
            <div title="Remove indicator" onClick={removeAdvanced}>
              <svg viewBox="0 0 100 100">
                <use xlinkHref="#icon-trash" />
              </svg>
            </div>
          </div>
        </div>
      );
    } else {
      advancedExtra.push(
        <div key="add-advanced" onClick={addAdvanced} className={css.Add}>
          + Advanced
        </div>
      );
    }

    const volumeValues = [
      dataIndex < 0 ? stockInfo.total_shares : data[dataIndex][data[dataIndex].length - 2],
      dataIndex < 0
        ? stockInfo.marketcap
          ? stockInfo.marketcap
          : stockInfo.total_shares * parseFloat(stockInfo.price)
        : data[dataIndex][data[dataIndex].length - 1],
    ];
    const volumeMarketcap = volume === VOLUME[1];
    if (volumeMarketcap) volumeValues.reverse();

    return (
      <>
        <div className={css.Tooltip}>
          <div className={css.Title}>
            <img src={getStockLogoUrl(stock, theme.dark)} alt={stock} />
            <div>
              {stockInfo.name}
              <span className={css.Interval}>{INTERVALS[interval]}</span>
            </div>
          </div>

          <div className={infoCss.join(' ')}>{info}</div>
        </div>
        <div className={[css.Volume, css.Indicator].join(' ')}>
          <div
            className={css.Name}
            style={{ color: 'rgb(' + theme.volume + ')' }}
            onClick={toggleVolume}
            title={volumeMarketcap ? '# Shares' : 'Marketcap'}
          >
            {volumeMarketcap ? 'M. Cap' : '# Shares'}
          </div>
          <div className={css.Value}>
            {formatNumber(volumeValues[0], true)}{' '}
            <span>
              ($
              {formatNumber(volumeValues[1], true)})
            </span>
          </div>
        </div>
        <div className={css.Indicators}>{extra}</div>
        {indicatorSettings >= 0 && (
          <IndicatorSettings ref={wrapperRef} index={indicatorSettings} onClose={closeIndicatorSettings} />
        )}
        <div className={[css.AdvancedIndicator, !advanced ? css.None : ''].join(' ')}>{advancedExtra}</div>
        {advancedSettings && <AdvancedSettings ref={wrapperRef} onClose={closeIndicatorSettings} />}
      </>
    );
  }

  return <></>;
}

const IndicatorSettingsC = React.forwardRef(
  ({ index, onClose }: { index: number; onClose: () => void }, ref: Ref<HTMLDivElement>): ReactElement => {
    const dispatch = useDispatch();
    const indicators = useSelector(selectIndicators);

    const changeType = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        const clickedType = e.currentTarget.value;
        const indicator = { ...indicators[index] };
        if (indicator.type !== clickedType) {
          indicator.type = clickedType;
          dispatch(setIndicator(index, indicator));
        }
      },
      [dispatch, index, indicators]
    );

    const changeLength = useCallback(
      (e: ChangeEvent<HTMLInputElement>) => {
        let length = parseInt(e.currentTarget.value);
        if (!isNaN(length)) {
          if (length > 250) length = 250;
          else if (length < 2) length = 2;
          const indicator = { ...indicators[index], length };
          dispatch(setIndicator(index, indicator));
        }
      },
      [dispatch, index, indicators]
    );

    const toggleScaleVisibility = useCallback(() => {
      const indicator = { ...indicators[index] };
      if (indicator.showPrice) delete indicator.showPrice;
      else indicator.showPrice = true;
      dispatch(setIndicator(index, indicator));
    }, [dispatch, index, indicators]);

    const inputKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') onClose();
      },
      [onClose]
    );

    if (indicators.length < index + 1) return <></>;
    const { type, length, showPrice } = indicators[index];
    return (
      <div ref={ref} className={css.Settings} style={{ marginTop: index * 20 }}>
        <div>
          <div className={css.Label}>Indicator</div>
          <div>
            <button onClick={changeType} value="sma" className={type === 'sma' ? css.Active : ''}>
              SMA
            </button>
            <button onClick={changeType} value="ema" className={type === 'ema' ? css.Active : ''}>
              EMA
            </button>
          </div>
        </div>
        <div>
          <div className={css.Label}>
            Length <span>(2-250)</span>
          </div>
          <input
            type="number"
            pattern="[0-9]*"
            defaultValue={length}
            onChange={changeLength}
            onKeyDown={inputKeyDown}
          />
        </div>
        <div>
          <div className={css.Label}>Show on scale</div>
          <div>
            <button onClick={toggleScaleVisibility} className={!!showPrice ? css.Active : ''}>
              Yes
            </button>
          </div>
        </div>
      </div>
    );
  }
);
const IndicatorSettings = memo(IndicatorSettingsC);

const AdvancedSettingsC = React.forwardRef(
  ({ onClose }: { onClose: () => void }, ref: Ref<HTMLDivElement>): ReactElement => {
    const dispatch = useDispatch();
    const advanced = useSelector(selectAdvanced);

    const changeType = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        const clickedType = e.currentTarget.value;
        const newAdvanced: any = { type: clickedType };

        for (let i = 0; i < INDICATORS_ADVANCED.length; i += 1) {
          if (INDICATORS_ADVANCED[i].type === clickedType) {
            for (let j = 0; j < INDICATORS_ADVANCED[i].params.length; j += 1) {
              const { key, value } = INDICATORS_ADVANCED[i].params[j];
              newAdvanced[key] = value;
            }
            break;
          }
        }

        dispatch(setAdvanced(newAdvanced as TAdvanced));
      },
      [dispatch]
    );

    const changeLength = useCallback(
      (e: ChangeEvent<HTMLInputElement>) => {
        const field = e.currentTarget.getAttribute('data-field');
        let length = parseInt(e.currentTarget.value);
        if (field && !isNaN(length)) {
          if (length > 250) length = 250;
          else if (length < 2) length = 2;
          dispatch(updateAdvanced(field, length));
        }
      },
      [dispatch]
    );

    const inputKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') onClose();
      },
      [onClose]
    );

    const { params } = advanced
      ? (INDICATORS_ADVANCED.find((e) => e.type === advanced.type) as typeof INDICATORS_ADVANCED[number])
      : INDICATORS_ADVANCED[0];

    return (
      <div ref={ref} className={[css.Settings, css.Advanced].join(' ')}>
        <div>
          <div className={css.Label}>Indicator</div>
          <div>
            {INDICATORS_ADVANCED.map(({ type }) => (
              <button
                key={type}
                className={advanced && advanced.type === type ? css.Active : ''}
                value={type}
                onClick={changeType}
              >
                {type.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <div>
          {params.map(({ key, value, title }) => (
            <label key={key}>
              {title}
              <input
                type="number"
                pattern="[0-9]*"
                defaultValue={advanced && key in advanced ? advanced[key as keyof TAdvanced] : value}
                onKeyDown={inputKeyDown}
                onChange={changeLength}
                data-field={key}
              />
            </label>
          ))}
        </div>
      </div>
    );
  }
);
const AdvancedSettings = memo(AdvancedSettingsC);

export default memo(Tooltip);

type TProps = {
  series: TTooltip[];
  data: TStockData[];
  stock: string;
  interval: TInterval;
};

export type TTooltip =
  | {
      type: 'ohlc';
      open: number;
      high: number;
      low: number;
      close: number;
    }
  | {
      type: 'line';
      time: number;
      value: number;
    };
