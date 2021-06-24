import { selectStockInfo, selectTheme } from "app/store";
import React, { memo, ReactElement } from "react";
import { useSelector } from "react-redux";
import { getStockLogoUrl, findDataIndex } from "tools";
import { INTERVALS } from "config";
import css from "./tooltip.module.css";

function Tooltip({ data, series }: TProps): ReactElement {
  const stockInfo = useSelector(selectStockInfo(data.stock));
  const theme = useSelector(selectTheme);

  /*
  const index =
    hover > 0 ? findDataIndex(data.data, hover) : data.data.length - 1;

  
*/

  if (stockInfo && series && series.length > 0) {
    const info: ReactElement[] = [];
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

    return (
      <div className={css.Tooltip}>
        <div className={css.Title}>
          <img
            src={getStockLogoUrl(data.stock, theme === "dark")}
            alt={data.stock}
          />
          <div>
            {stockInfo.name}
            <span className={css.Interval}>{INTERVALS[data.interval]}</span>
          </div>
        </div>

        <div className={infoCss.join(" ")}>{info}</div>
      </div>
    );
  }

  return <></>;
}

export default memo(Tooltip);

type TProps = {
  data: TStockData;
  series?: TTooltip[];
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
