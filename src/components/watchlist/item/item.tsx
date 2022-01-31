import { ReactElement, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useContextMenu } from 'hooks';
import { selectInterval, selectIsActiveStock, selectListColumns, selectTheme } from 'app/store';
import { getColumnValue, formatNumber, getStockLogoUrl } from 'tools';
import css from './item.module.css';
import { Placeholder } from 'components/placeholder';

export function WatchlistItem(props: TProps): ReactElement {
  const { stock, price } = props.stock;
  const chartInterval = useSelector(selectInterval);
  const cols = useSelector(selectListColumns);
  const isDarkTheme = useSelector(selectTheme) === 'dark';
  const isActiveStock = useSelector(selectIsActiveStock(stock.toLowerCase()));
  const itemRef = useRef<HTMLAnchorElement>(null);
  useContextMenu(itemRef, 'favourites', stock);

  const classNames = [css.Item];
  if (isActiveStock) classNames.push(css.Active);

  return (
    <Link
      ref={itemRef}
      className={classNames.join(' ')}
      to={'/' + stock.toLowerCase() + (chartInterval !== 'm1' ? '/' + chartInterval : '')}
    >
      <div>
        <img src={getStockLogoUrl(stock, isDarkTheme)} alt={stock} />
        {stock}
      </div>
      <div>{formatNumber(price)}</div>
      {cols.map((col, i) => {
        const [value, growth] = getColumnValue(props.stock, col);
        const key = `${i}-${col}`;
        if (value === null)
          return (
            <div key={key}>
              <Placeholder />
            </div>
          );
        else if (growth !== '') {
          return (
            <div className={value === 0 ? css.Grey : value > 0 ? css.Green : css.Red} key={key}>
              {growth !== '' && value > 0 ? '+' : value < 0 ? '-' : ''}
              {formatNumber(Math.abs(value), true)}
              {growth === '%' ? '%' : ''}
            </div>
          );
        } else return <div key={key}>{formatNumber(value, true)}</div>;
      })}
    </Link>
  );
}

type TProps = {
  stock: TStockList;
};
