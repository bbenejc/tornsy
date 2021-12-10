import React, { ReactElement } from 'react';
import { useSelector } from 'react-redux';
import { selectOrderedStocksList } from 'app/store';
import { WatchlistMenu } from './menu';
import { WatchlistHeader } from './header';
import { WatchlistItem } from './item';
import css from './watchlist.module.css';

export function Watchlist(): ReactElement {
  return (
    <div className={css.Watchlist}>
      <WatchlistMenu />
      <div className={css.List}>
        <WatchlistHeader className={css.Header} />
        <List />
      </div>
    </div>
  );
}

function List(): ReactElement {
  const stocks = useSelector(selectOrderedStocksList);
  return (
    <>
      {stocks.map((stock) => {
        return <WatchlistItem stock={stock} key={stock.stock} />;
      })}
    </>
  );
}
