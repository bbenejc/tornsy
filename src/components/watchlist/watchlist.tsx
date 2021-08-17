import React, { memo, ReactElement, MouseEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import {
  setListSorting,
  selectOrderedStocksList,
  selectTheme,
  selectInterval,
} from "app/store";
import { getStockLogoUrl } from "tools";
import css from "./watchlist.module.css";

function Watchlist(): ReactElement {
  const dispatch = useDispatch();
  const interval = useSelector(selectInterval);
  const stocks = useSelector(selectOrderedStocksList);
  const isDarkTheme = useSelector(selectTheme) === "dark";

  const changeOrder = (order: string) => (e: MouseEvent) => {
    dispatch(setListSorting(order));
    e.stopPropagation();
  };

  if (stocks.length) {
    return (
      <div className={css.Watchlist}>
        <div className={css.Header}>
          <div>
            <span onClick={changeOrder("name")}>Symbol</span>
          </div>
          <div>
            <span onClick={changeOrder("price")}>Price</span>
          </div>
          <div>
            <span onClick={changeOrder("diff")}>Diff</span>
          </div>
          <div>
            <span onClick={changeOrder("percent")}>Diff %</span>
          </div>
        </div>
        {stocks.map(({ stock, price, diff_m1, diff_percent_m1 }) => (
          <NavLink
            activeClassName={css.Active}
            to={
              "/" +
              stock.toLowerCase() +
              (interval !== "m1" ? "/" + interval : "")
            }
            key={stock}
          >
            <div>
              <img src={getStockLogoUrl(stock, isDarkTheme)} alt={stock} />
              <div>{stock}</div>
            </div>
            <div>{price}</div>
            <div className={diff_m1 >= 0 ? css.Green : css.Red}>
              {(diff_m1 >= 0 ? "+" : "") + diff_m1.toFixed(2)}
            </div>
            <div className={diff_m1 >= 0 ? css.Green : css.Red}>
              {(diff_m1 >= 0 ? "+" : "") + diff_percent_m1.toFixed(2)}%
            </div>
          </NavLink>
        ))}
      </div>
    );
  }
  return <div className={css.Watchlist} />;
}

export default memo(Watchlist);
