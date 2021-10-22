import React, {
  memo,
  ReactElement,
  useCallback,
  useState,
  ChangeEvent,
  useEffect,
  useRef,
  Ref,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  selectIndicators,
  selectAdvanced,
  selectStockInfo,
  selectTheme,
  createIndicator,
  removeIndicator as removeIndicatorAction,
  setIndicator,
  createAdvanced,
  removeAdvanced as removeAdvancedAction,
  setAdvanced,
  updateAdvanced,
} from "app/store";
import { getStockLogoUrl, findDataIndex, formatNumber } from "tools";
import { getTheme } from "themes";
import { INTERVALS, INDICATORS_ADVANCED, INTERVALS_MAX } from "config";
import css from "./tooltip.module.css";

function Tooltip({ data, series, stock, interval }: TProps): ReactElement {
  const dispatch = useDispatch();
  const stockInfo = useSelector(selectStockInfo(stock));
  const indicators = useSelector(selectIndicators);
  const advanced = useSelector(selectAdvanced);
  const [indicatorSettings, setIndicatorSettings] = useState(-1);
  const [advancedSettings, setAdvancedSettings] = useState(false);
  const theme = getTheme(useSelector(selectTheme));
  const wrapperRef = useRef<any>();

  const addIndicator = useCallback(() => {
    dispatch(createIndicator());
  }, [dispatch]);

  const removeIndicator = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const i = parseInt(e.currentTarget.getAttribute("data-index") || "");
      dispatch(removeIndicatorAction(i));
    },
    [dispatch]
  );

  const editIndicator = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const i = parseInt(e.currentTarget.getAttribute("data-index") || "");
    setIndicatorSettings(i);
  }, []);

  const addAdvanced = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      dispatch(createAdvanced());
    },
    [dispatch]
  );

  const editAdvanced = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    setAdvancedSettings(true);
  }, []);

  const removeAdvanced = useCallback(() => {
    dispatch(removeAdvancedAction());
  }, [dispatch]);

  useEffect(() => {
    if (indicatorSettings >= 0 || advancedSettings) {
      const clickAway = (e: MouseEvent | TouchEvent) => {
        if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
          setIndicatorSettings(-1);
          setAdvancedSettings(false);
        }
      };

      const escKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setIndicatorSettings(-1);
          setAdvancedSettings(false);
        }
      };

      document.addEventListener("mousedown", clickAway);
      document.addEventListener("touchstart", clickAway);
      document.addEventListener("keyup", escKey);
      return () => {
        document.removeEventListener("mousedown", clickAway);
        document.removeEventListener("touchstart", clickAway);
        document.removeEventListener("keyup", escKey);
      };
    }
  }, [indicatorSettings, advancedSettings]);

  const closeIndicatorSettings = useCallback(() => {
    setIndicatorSettings(-1);
    setAdvancedSettings(false);
  }, [setIndicatorSettings, setAdvancedSettings]);

  const dataIndex =
    series && series.length > 0 && data.length > 0
      ? findDataIndex(data, series[1].type === "line" ? series[1].time : 0)
      : -1;

  if (stockInfo && dataIndex >= 0) {
    const dataIndex = findDataIndex(
      data,
      series[1].type === "line" ? series[1].time : 0
    );

    const info: ReactElement[] = [];
    const extra: ReactElement[] = [];
    const advancedExtra: ReactElement[] = [];
    const infoCss = [css.Info];

    let diff;
    let prev;

    if (series[0].type === "line") {
      info.push(
        <div className={css.Ohlc} key="p">
          <span>{series[0].value ? formatNumber(series[0].value) : ""}</span>
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
      prev =
        dataIndex > 0
          ? parseFloat(data[dataIndex - 1][4] || "")
          : series[0].open;
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
          <span>{(diff >= 0 ? "+" : "") + formatNumber(diff)}</span>
          <span>
            ({(diff >= 0 ? "+" : "") + formatNumber((diff / prev) * 100) + "%"})
          </span>
        </div>
      );
    }

    for (let i = 0; i < indicators.length; i += 1) {
      if (series.length < i + 3) break;
      const s = series[i + 2];
      const val = s.type === "line" ? s.value : s.close;
      extra.push(
        <div className={css.Indicator} key={"i" + i}>
          <div className={css.Name} style={{ color: theme.indicators[i] }}>
            {indicators[i].type.toUpperCase() + " " + indicators[i].length}
          </div>
          <div className={css.Value}>
            {!!val ? formatNumber(val) : <span>-</span>}
          </div>
          <div className={css.Controls}>
            <div title="Edit indicator" data-index={i} onClick={editIndicator}>
              <svg viewBox="0 0 100 100">
                <use xlinkHref={`#icon-settings`} />
              </svg>
            </div>
            <div
              title="Remove indicator"
              data-index={i}
              onClick={removeIndicator}
            >
              <svg viewBox="0 0 100 100">
                <use xlinkHref={`#icon-trash`} />
              </svg>
            </div>
          </div>
        </div>
      );
    }
    if (indicators.length < INTERVALS_MAX) {
      extra.push(
        <div
          key="add-indicator"
          className={[css.Indicator, css.Add].join(" ")}
          onClick={addIndicator}
          style={{ color: theme.indicators[indicators.length] }}
        >
          + Indicator
        </div>
      );
    }

    if (advanced) {
      const advancedSeries = [];

      for (
        let a = 0, i = 2 + indicators.length;
        i < series.length;
        i += 1, a += 1
      ) {
        const s = series[i];
        const val = s.type === "line" ? s.value : s.close;

        advancedSeries.push(
          <div
            className={[
              css.Value,
              advanced.type === "macd" ? css.BigValue : "",
            ].join(" ")}
            style={{
              color:
                advanced.type === "macd" && a === 0
                  ? val > 0
                    ? theme.green[0]
                    : theme.red[0]
                  : theme.advanced[
                      ["rsi", "adx"].includes(advanced.type)
                        ? 2
                        : advanced.type === "macd"
                        ? a - 1
                        : a
                    ],
            }}
            key={i}
          >
            {formatNumber(val, false, advanced.type === "macd" ? 4 : 2)}
          </div>
        );
      }
      if (advanced.type === "macd") advancedSeries.push(advancedSeries.shift());
      const nameInfo = [];
      for (let i = 0; i < INDICATORS_ADVANCED.length; i += 1) {
        if (INDICATORS_ADVANCED[i].type === advanced.type) {
          for (let j = 0; j < INDICATORS_ADVANCED[i].params.length; j += 1) {
            const { key, value } = INDICATORS_ADVANCED[i].params[j];
            nameInfo.push(
              key in advanced ? advanced[key as keyof TAdvanced] : value
            );
          }
          break;
        }
      }

      advancedExtra.push(
        <div className={css.Indicator} key={advanced.type}>
          <div
            className={[
              css.Name,
              advanced.type === "macd" ? css.BigName : "",
            ].join(" ")}
          >
            {advanced.type.toUpperCase()}{" "}
            <span className={css.NameInfo}>{nameInfo.join(" ")}</span>
          </div>
          {advancedSeries}
          <div className={css.Controls}>
            <div title="Edit indicator" onClick={editAdvanced}>
              <svg viewBox="0 0 100 100">
                <use xlinkHref={`#icon-settings`} />
              </svg>
            </div>
            <div title="Remove indicator" onClick={removeAdvanced}>
              <svg viewBox="0 0 100 100">
                <use xlinkHref={`#icon-trash`} />
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

    const totalStocks =
      (series[1].type === "line" ? series[1].value : series[1].close) || 0;
    const curMarketcap = data[dataIndex][data[dataIndex].length - 1];

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

          <div className={infoCss.join(" ")}>{info}</div>
        </div>
        <div className={[css.Volume, css.Indicator].join(" ")}>
          <div
            className={css.Name}
            style={{ color: "rgb(" + theme.volume + ")" }}
          >
            # Shares
          </div>
          <div className={css.Value}>
            {formatNumber(totalStocks, true)}{" "}
            <span>
              ($
              {formatNumber(curMarketcap, true)})
            </span>
          </div>
        </div>
        <div className={css.Indicators}>{extra}</div>
        {indicatorSettings >= 0 && (
          <IndicatorSettings
            ref={wrapperRef}
            index={indicatorSettings}
            onClose={closeIndicatorSettings}
          />
        )}
        <div
          className={[css.AdvancedIndicator, !advanced ? css.None : ""].join(
            " "
          )}
        >
          {advancedExtra}
        </div>
        {advancedSettings && (
          <AdvancedSettings ref={wrapperRef} onClose={closeIndicatorSettings} />
        )}
      </>
    );
  }

  return <></>;
}

const IndicatorSettingsC = React.forwardRef(
  (
    { index, onClose }: { index: number; onClose: () => void },
    ref: Ref<HTMLDivElement>
  ): ReactElement => {
    const dispatch = useDispatch();
    const indicators = useSelector(selectIndicators);

    const changeType = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        const clickedType = e.currentTarget.value;
        const { length, type } = indicators[index];
        if (type !== clickedType) {
          dispatch(setIndicator(index, { type: clickedType, length }));
        }
      },
      [dispatch, index, indicators]
    );

    const changeLength = useCallback(
      (e: ChangeEvent<HTMLInputElement>) => {
        const { type } = indicators[index];
        let length = parseInt(e.currentTarget.value);
        if (!isNaN(length)) {
          if (length > 250) length = 250;
          else if (length < 2) length = 2;
          dispatch(setIndicator(index, { type, length }));
        }
      },
      [dispatch, index, indicators]
    );

    const inputKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === "Enter") onClose();
      },
      [onClose]
    );

    if (indicators.length < index + 1) return <></>;
    const { type, length } = indicators[index];
    return (
      <div ref={ref} className={css.Settings} style={{ marginTop: index * 20 }}>
        <div>
          <div className={css.Label}>Indicator</div>
          <div>
            <button
              onClick={changeType}
              value="sma"
              className={type === "sma" ? css.Active : ""}
            >
              SMA
            </button>
            <button
              onClick={changeType}
              value="ema"
              className={type === "ema" ? css.Active : ""}
            >
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
      </div>
    );
  }
);
const IndicatorSettings = memo(IndicatorSettingsC);

const AdvancedSettingsC = React.forwardRef(
  (
    { onClose }: { onClose: () => void },
    ref: Ref<HTMLDivElement>
  ): ReactElement => {
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
        const field = e.currentTarget.getAttribute("data-field");
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
        if (e.key === "Enter") onClose();
      },
      [onClose]
    );

    const { params } = advanced
      ? (INDICATORS_ADVANCED.find(
          (e) => e.type === advanced.type
        ) as typeof INDICATORS_ADVANCED[number])
      : INDICATORS_ADVANCED[0];

    return (
      <div ref={ref} className={[css.Settings, css.Advanced].join(" ")}>
        <div>
          <div className={css.Label}>Indicator</div>
          <div>
            {INDICATORS_ADVANCED.map(({ type }) => (
              <button
                key={type}
                className={advanced && advanced.type === type ? css.Active : ""}
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
                defaultValue={
                  advanced && key in advanced
                    ? advanced[key as keyof TAdvanced]
                    : value
                }
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
      type: "ohlc";
      open: number;
      high: number;
      low: number;
      close: number;
    }
  | {
      type: "line";
      time: number;
      value: number;
    };
