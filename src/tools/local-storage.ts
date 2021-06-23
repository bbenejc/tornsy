import { INTERVALS } from "config";

const THEME = "theme";
const ORDER = "list-order";
const STOCK = "stock";
const INTERVAL = "interval";

export function getTheme(): string | null {
  return localStorage.getItem(THEME);
}

export function setTheme(theme: string): void {
  localStorage.setItem(THEME, theme);
}

export function getListOrder(): string | null {
  return localStorage.getItem(ORDER);
}

export function setListOrder(order: string): void {
  localStorage.setItem(ORDER, order);
}

export function getStock(): string {
  return localStorage.getItem(STOCK) || "";
}

export function setStock(stock: string): void {
  localStorage.setItem(STOCK, stock);
}

export function getInterval(): TInterval {
  const interval = localStorage.getItem(INTERVAL);
  return (interval && interval in INTERVALS ? interval : "m1") as TInterval;
}

export function setInterval(interval: string): void {
  localStorage.setItem(INTERVAL, interval);
}
