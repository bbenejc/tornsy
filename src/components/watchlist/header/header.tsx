import React, { ReactElement, MouseEvent } from 'react';
import { useDispatch } from 'react-redux';
import { setListSorting } from 'app/store';
import css from './header.module.css';

export function WatchlistHeader({ className }: TProps): ReactElement {
  const dispatch = useDispatch();
  const changeOrder = (order: string) => (e: MouseEvent) => {
    dispatch(setListSorting(order));
    e.stopPropagation();
  };

  return (
    <div className={[className, css.Header].join(' ')}>
      <div>
        <span onClick={changeOrder('name')}>Symbol</span>
      </div>
      <div>
        <span onClick={changeOrder('price')}>Price</span>
      </div>
      <div>
        <span onClick={changeOrder('diff')}>Diff %</span>
      </div>
      <div>
        <span onClick={changeOrder('marketcap')}># Shares</span>
      </div>
      <div>
        <span onClick={changeOrder('marketcap')}>Diff %</span>
      </div>
    </div>
  );
}

type TProps = {
  className: string;
};
