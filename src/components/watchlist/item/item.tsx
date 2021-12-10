import React, { ReactElement } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { selectInterval, selectIsActiveStock, selectTheme } from 'app/store';
import { formatNumber, getStockLogoUrl } from 'tools';
import css from './item.module.css';

export function WatchlistItem(props: TProps): ReactElement {
  const { stock, price, price_diff, price_growth, marketcap, total_shares } = props.stock;
  const interval = useSelector(selectInterval);
  const isDarkTheme = useSelector(selectTheme) === 'dark';
  const isActiveStock = useSelector(selectIsActiveStock(stock.toLowerCase()));

  const classNames = [css.Item];
  if (isActiveStock) classNames.push(css.Active);

  const priceCss = price_diff > 0 ? css.Green : price_diff < 0 ? css.Red : css.Grey;
  // <div className={priceCss}>{Math.abs(price_diff).toFixed(2)}</div>
  return (
    <Link className={classNames.join(' ')} to={'/' + stock.toLowerCase() + (interval !== 'm1' ? '/' + interval : '')}>
      <div>
        <img src={getStockLogoUrl(stock, isDarkTheme)} alt={stock} />
        {stock}
      </div>
      <div>{formatNumber(parseFloat(price))}</div>
      <div className={[priceCss, css.Growth].join(' ')}>{Math.abs(price_growth).toFixed(2)}%</div>
      <div>{formatNumber(marketcap, true)}</div>
      <div className={[priceCss, css.Growth].join(' ')}>{Math.abs(price_growth).toFixed(2)}%</div>
    </Link>
  );
}

type TProps = {
  stock: TStockInfo;
};
