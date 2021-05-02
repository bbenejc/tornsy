import { selectStockInfo, selectTheme } from "app/store";
import React, { memo, ReactElement } from "react";
import { useSelector } from "react-redux";
import { getStockLogoUrl, findDataIndex } from "tools";
import { INTERVALS } from "config";
import css from "./tooltip.module.css";

function Tooltip({ data, hover }: TProps): ReactElement {
  const stockInfo = useSelector(selectStockInfo(data.stock));
  const theme = useSelector(selectTheme);
  const index =
    hover > 0 ? findDataIndex(data.data, hover) : data.data.length - 1;

  if (stockInfo && index >= 0) {
    const info: ReactElement[] = [];
    const infoCss = [css.Info];
    if (data.interval === "m1") {
      info.push(
        <div key="p">
          <span>{data.data[index][1]}</span>
        </div>
      );
      if (index > 0) {
        const cur = parseFloat(data.data[index][1]);
        const prev = parseFloat(data.data[index - 1][1]);
        const diff = cur - prev;

        if (diff >= 0) infoCss.push(css.Green);
        else infoCss.push(css.Red);

        info.push(
          <div key="d">{(diff >= 0 ? "+" : "") + diff.toFixed(2)}</div>
        );
        info.push(
          <div key="d%">
            {(diff >= 0 ? "+" : "") + ((diff / prev) * 100).toFixed(2) + "%"}
          </div>
        );
      } else infoCss.push(css.Red);
    } else {
      infoCss.push(
        data.data[index][4] >= data.data[index][1] ? css.Green : css.Red
      );

      info.push(
        <div key="o">
          <span>O</span>
          <span>{data.data[index][1]}</span>
        </div>
      );
      info.push(
        <div key="h">
          <span>H</span>
          <span>{data.data[index][2]}</span>
        </div>
      );
      info.push(
        <div key="l">
          <span>L</span>
          <span>{data.data[index][3]}</span>
        </div>
      );
      info.push(
        <div key="c">
          <span>C</span>
          <span>{data.data[index][4]}</span>
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
  hover: number;
};
