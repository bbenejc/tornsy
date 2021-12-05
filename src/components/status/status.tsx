import React, { ReactElement, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectOnline } from 'app/store';
import css from './status.module.css';

export function Status(): ReactElement | null {
  const online = useSelector(selectOnline);
  const prevOnline = useRef(online);
  const [, setUpdate] = useState(1);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (online && !prevOnline.current) {
      timer = setTimeout(() => {
        prevOnline.current = online;
        setUpdate((u) => (u + 1) % 2);
      }, 1500);
    } else prevOnline.current = online;

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [online]);

  if ((online && !prevOnline.current) || !online) {
    const classNames = [css.Status];
    if (!online) classNames.push(css.Offline);
    return <div className={classNames.join(' ')}>{online ? 'You are back online!' : 'You are offline!'}</div>;
  }

  return null;
}
