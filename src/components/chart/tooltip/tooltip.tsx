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
  createIndicator,
  selectIndicators,
  selectStockInfo,
  selectTheme,
  removeIndicator as removeIndicatorAction,
  setIndicator,
} from "app/store";
import { getStockLogoUrl, findDataIndex } from "tools";
import { getTheme } from "themes";
import { INTERVALS } from "config";
import css from "./tooltip.module.css";
import { formatNumber } from "tools/format";
import classes from "./tooltip.module.css";

function Tooltip({ data, series, indicators }: TProps): ReactElement {
  const dispatch = useDispatch();
  const stockInfo = useSelector(selectStockInfo(data.stock));
  const theme = getTheme(useSelector(selectTheme));
  const [indicatorSettings, setIndicatorSettings] = useState(-1);
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

  const editIndicator = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const i = parseInt(e.currentTarget.getAttribute("data-index") || "");
      setIndicatorSettings(i);
    },
    [setIndicatorSettings]
  );

  useEffect(() => {
    if (indicatorSettings >= 0) {
      const clickAway = (e: MouseEvent) => {
        if (wrapperRef.current && !wrapperRef.current.contains(e.target))
          setIndicatorSettings(-1);
      };
      const escKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") setIndicatorSettings(-1);
      };

      document.addEventListener("click", clickAway);
      document.addEventListener("keydown", escKey);
      return () => {
        document.removeEventListener("click", clickAway);
        document.removeEventListener("keydown", escKey);
      };
    }
  }, [indicatorSettings, setIndicatorSettings]);

  const closeIndicatorSettings = useCallback(() => {
    setIndicatorSettings(-1);
  }, [setIndicatorSettings]);

  if (stockInfo && series && series.length > 0) {
    const info: ReactElement[] = [];
    const extra: ReactElement[] = [];
    const infoCss = [css.Info];

    if (series[0].type === "line") {
      const index = findDataIndex(data.data, series[0].time);
      info.push(
        <div className={css.Ohlc} key="p">
          <span>{series[0].value}</span>
        </div>
      );
      if (index > 0) {
        const cur = parseFloat(data.data[index][1]);
        const prev = parseFloat(data.data[index - 1][1]);
        const diff = cur - prev;

        if (diff >= 0) infoCss.push(css.Green);
        else infoCss.push(css.Red);

        info.push(
          <div className={css.OhlcGrowth} key="d">
            <span>{(diff >= 0 ? "+" : "") + diff.toFixed(2)}</span>
            <span>
              ({(diff >= 0 ? "+" : "") + ((diff / prev) * 100).toFixed(2) + "%"}
              )
            </span>
          </div>
        );
      } else infoCss.push(css.Red);
    } else {
      const diff = series[0].close - series[0].open;
      infoCss.push(diff >= 0 ? css.Green : css.Red);

      info.push(
        <div className={css.Ohlc} key="o">
          <span>O</span>
          <span>{series[0].open}</span>
        </div>
      );
      info.push(
        <div className={css.Ohlc} key="h">
          <span>H</span>
          <span>{series[0].high}</span>
        </div>
      );
      info.push(
        <div className={css.Ohlc} key="l">
          <span>L</span>
          <span>{series[0].low}</span>
        </div>
      );
      info.push(
        <div className={css.Ohlc} key="c">
          <span>C</span>
          <span>{series[0].close}</span>
        </div>
      );

      info.push(
        <div className={css.OhlcGrowth} key="d">
          <span>{(diff >= 0 ? "+" : "") + diff.toFixed(2)}</span>
          <span>
            (
            {(diff >= 0 ? "+" : "") +
              ((diff / series[0].open) * 100).toFixed(2) +
              "%"}
            )
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
            {!!val ? val.toFixed(2) : <span>-</span>}
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
    if (series.length < 4)
      extra.push(
        <div
          key="add-indicator"
          className={[css.Indicator, css.Add].join(" ")}
          onClick={addIndicator}
          style={{ color: theme.indicators[series.length - 2] }}
        >
          + Indicator
        </div>
      );

    const totalStocks =
      (series[1].type === "line" ? series[1].value : series[1].close) || 0;
    const curPrice =
      (series[0].type === "line" ? series[0].value : series[0].close) || 0;

    return (
      <>
        <div className={css.Tooltip}>
          <div className={css.Title}>
            <img
              src={getStockLogoUrl(data.stock, theme.dark)}
              alt={data.stock}
            />
            <div>
              {stockInfo.name}
              <span className={css.Interval}>{INTERVALS[data.interval]}</span>
            </div>
          </div>

          <div className={infoCss.join(" ")}>{info}</div>
        </div>
        <div className={[css.Volume, css.Indicator].join(" ")} key="vol">
          <div
            className={css.Name}
            style={{ color: "rgb(" + theme.volume + ")" }}
          >
            # Shares
          </div>
          <div className={css.Value}>
            {formatNumber(totalStocks)}{" "}
            <span>
              ($
              {formatNumber(totalStocks * curPrice)})
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
          if (length > 99) length = 99;
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
              className={type === "sma" ? classes.Active : ""}
            >
              SMA
            </button>
            <button
              onClick={changeType}
              value="ema"
              className={type === "ema" ? classes.Active : ""}
            >
              EMA
            </button>
          </div>
        </div>
        <div>
          <div className={css.Label}>
            Length <span>(2-99)</span>
          </div>
          <input
            type="number"
            min={2}
            max={99}
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

export default memo(Tooltip);

type TProps = {
  data: TStockData;
  series: TTooltip[];
  indicators: TIndicator[];
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
      time?: any;
      value?: number;
    };
