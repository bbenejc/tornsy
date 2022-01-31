import { memo, ReactElement, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { selectFavourites, selectOrderedStocksList } from 'app/store';
import { WatchlistMenu } from './menu';
import { WatchlistHeader } from './header';
import { WatchlistItem } from './item';
import css from './watchlist.module.css';

function WatchlistComponent({ small = false, onClose }: TProps): ReactElement {
  return (
    <div className={css.Watchlist}>
      <WatchlistMenu small={small} onClose={onClose} />
      <div className={css.List}>
        <WatchlistHeader className={css.Header} />
        <List small={small} onClose={onClose} />
      </div>
    </div>
  );
}

export const Watchlist = memo(WatchlistComponent);

function List({ small = false, onClose }: TProps): ReactElement {
  const stocks = useSelector(selectOrderedStocksList);
  const favourites = useSelector(selectFavourites);

  const favStocks: typeof stocks = [];
  const otherStocks: typeof stocks = [];
  stocks.forEach((s) => {
    if (favourites.includes(s.stock)) favStocks.push(s);
    else otherStocks.push(s);
  });

  const closeWatchlist = useCallback(() => {
    if (small && onClose) onClose();
  }, [small, onClose]);

  return (
    <>
      {favStocks.length > 0 && (
        <div className={css.Group}>
          {favStocks.map((stock) => {
            return <WatchlistItem stock={stock} key={stock.stock} onClick={closeWatchlist} />;
          })}
        </div>
      )}
      {otherStocks.length > 0 && (
        <div className={css.Group}>
          {otherStocks.map((stock) => {
            return <WatchlistItem stock={stock} key={stock.stock} onClick={closeWatchlist} />;
          })}
        </div>
      )}
    </>
  );
}

type TProps = {
  small?: boolean;
  onClose?: () => void;
};
