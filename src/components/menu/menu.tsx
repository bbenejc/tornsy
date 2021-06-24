import { memo, ReactElement, useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectTheme, setTheme } from "app/store";
import { Link } from "react-router-dom";
import { Watchlist } from "components";
import { INTERVALS, SMALL } from "config";
import css from "./menu.module.css";

function Menu({ stock, interval, width, height }: TProps): ReactElement {
  const dispatch = useDispatch();
  const [list, setList] = useState(false);
  const theme = useSelector(selectTheme);
  const toggleTheme = useCallback(() => {
    dispatch(setTheme(theme === "light" ? "dark" : "light"));
  }, [dispatch, theme]);

  const isSmall = width < SMALL;

  const toggleList = useCallback(() => {
    if (isSmall) setList((l) => !l);
  }, [isSmall]);

  useEffect(() => {
    if (list) {
      const closeList = () => setList(false);

      document.addEventListener("click", closeList);
      return () => {
        document.removeEventListener("click", closeList);
      };
    }
  }, [list]);

  const intervals: ReactElement[] = [];
  for (const i in INTERVALS) {
    intervals.push(
      <Link
        className={i === interval ? css.Active : ""}
        key={i}
        to={"/" + stock.toLowerCase() + (i !== "m1" ? "/" + i : "")}
      >
        {INTERVALS[i as TInterval]}
      </Link>
    );
  }

  return (
    <>
      <div className={css.Menu}>
        <div className={css.Stock} onClick={toggleList}>
          {stock.toUpperCase()}
        </div>
        <div className={css.Intervals}>{intervals}</div>
        <div className={css.Theme} onClick={toggleTheme}>
          <svg viewBox="0 0 100 100">
            <use xlinkHref={`#icon-theme`} />
          </svg>
        </div>
      </div>
      {list && (
        <div
          className={css.List}
          style={
            width < 640 || height < 640
              ? mobileListStyle
              : { width: 320, height: Math.min(height - 40, 450) }
          }
        >
          <Watchlist interval={interval} />
        </div>
      )}
    </>
  );
}

export default memo(Menu);

const mobileListStyle = {
  bottom: 0,
  right: 0,
};

type TProps = {
  stock: string;
  interval: TInterval;
  width: number;
  height: number;
};
