import React, { memo, ReactElement, MouseEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setListSorting, selectOrderedStocksList } from 'app/store';
import { WatchlistMenu } from './menu';
import { WatchlistHeader } from './header';
import { WatchlistItem } from './item';
import css from './watchlist.module.css';

export function Watchlist(): ReactElement {
  console.log('Watchlist');
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
  console.log('List');
  const stocks = useSelector(selectOrderedStocksList);
  return (
    <>
      {stocks.map((stock) => {
        return <WatchlistItem stock={stock} key={stock.stock} />;
      })}
    </>
  );
}
