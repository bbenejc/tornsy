import { memo, ReactElement, useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectInterval, selectStock, selectTheme, setTheme } from 'app/store';
import { Link } from 'react-router-dom';
import { Watchlist } from 'components';
import { INTERVALS, SMALL, XSMALL } from 'config';
import { getIntervalName } from 'tools/intervals';
import css from './menu.module.css';

function Menu({ width, height }: TProps): ReactElement {
  const dispatch = useDispatch();
  const stock = useSelector(selectStock);
  const interval = useSelector(selectInterval);
  const [list, setList] = useState(false);
  const listRef = useRef<any>(null);
  const theme = useSelector(selectTheme);
  const toggleTheme = useCallback(() => {
    dispatch(setTheme(theme === 'light' ? 'dark' : 'light'));
  }, [dispatch, theme]);

  const isSmall = width < SMALL;

  const toggleList = useCallback(() => {
    if (isSmall) setList((l) => !l);
  }, [isSmall]);

  useEffect(() => {
    if (list) {
      const closeList = (e: MouseEvent) => {
        if (listRef.current && !listRef.current.contains(e.target)) setList(false);
      };
      const escKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setList(false);
      };

      document.addEventListener('click', closeList);
      document.addEventListener('keyup', escKey);
      if (!isSmall) setList(false);
      return () => {
        document.removeEventListener('click', closeList);
        document.removeEventListener('keyup', escKey);
      };
    }
  }, [list, isSmall]);

  const intervals: ReactElement[] = [];
  for (let i = 0; i < INTERVALS.length; i += 1) {
    const curI = INTERVALS[i];
    intervals.push(
      <Link
        className={curI === interval ? css.Active : ''}
        key={i}
        to={'/' + stock.toLowerCase() + (curI !== 'm1' ? '/' + curI : '')}
      >
        {getIntervalName(curI)}
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
        <div className={css.Theme} onClick={toggleTheme} title="Toggle theme">
          <svg viewBox="0 0 100 100">
            <use xlinkHref={`#icon-theme`} />
          </svg>
        </div>
      </div>
      {list && (
        <div
          className={css.List}
          style={
            width < XSMALL || height < XSMALL
              ? mobileListStyle
              : { top: -1, width: 360, height: Math.min(height - 40, 450), border: '1px solid var(--color-border)' }
          }
          ref={listRef}
        >
          <Watchlist small onClose={toggleList} />
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
  width: number;
  height: number;
};
