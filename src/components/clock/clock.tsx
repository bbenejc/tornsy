import { ReactElement, useEffect, useRef, useState } from "react";
import css from "./clock.module.css";

export function Clock(): ReactElement {
  const timer = useRef<NodeJS.Timeout>();
  const [time, setTime] = useState(getTime());

  if (timer.current) clearTimeout(timer.current);
  timer.current = setTimeout(() => {
    setTime(getTime());
  }, 1000 - (Date.now() % 1000));

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  return <time className={css.Clock}>{time}</time>;
}

function getTime(): string {
  const date = new Date();
  return `${padZero(date.getUTCHours())}:${padZero(
    date.getUTCMinutes()
  )}:${padZero(date.getUTCSeconds())}`;
}

function padZero(num: number): string {
  return num < 10 ? "0" + num : num.toString();
}
