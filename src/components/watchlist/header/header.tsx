import { ReactElement, MouseEvent, memo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectListColumns, selectListOrder, setListSorting } from 'app/store';
import css from './header.module.css';
import { parseColumn } from 'tools';
import { getIntervalName } from 'tools/intervals';
import { COLUMN_NAMES } from 'config';
import { useContextMenu } from 'hooks';

function Header({ className }: TProps): ReactElement {
  const headers = ['name', 'price', ...useSelector(selectListColumns)];

  return (
    <div className={[className, css.Header].join(' ')}>
      {headers.map((h, i) => (
        <HeaderItem key={h} index={i} column={h} />
      ))}
    </div>
  );
}

export const WatchlistHeader = memo(Header);

function HeaderItem({ index, column }: TItemProps): ReactElement {
  const dispatch = useDispatch();
  const changeOrder = (order: string) => (e: MouseEvent) => {
    dispatch(setListSorting(order));
    e.stopPropagation();
  };
  const [sortColumn] = useSelector(selectListOrder).split('-');
  const parsedHeader = parseColumn(column);
  const itemRef = useRef<HTMLDivElement>(null);
  useContextMenu(itemRef, 'header', index - 2);

  return (
    <div ref={index > 1 ? itemRef : null}>
      <span onClick={changeOrder(column)} className={column === sortColumn ? css.Sorted : ''}>
        {parsedHeader.interval === '' ? COLUMN_NAMES[parsedHeader.field] : getIntervalName(parsedHeader.interval)}
      </span>
    </div>
  );
}

type TProps = {
  className: string;
};

type TItemProps = {
  index: number;
  column: string;
};
