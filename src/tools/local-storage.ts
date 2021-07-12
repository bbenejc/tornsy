import { INTERVALS } from "config";

const THEME = "theme";
const ORDER = "list-order";
const STOCK = "stock";
const INTERVAL = "interval";
const INDICATORS = "indicators";
const ADVANCED = "advanced";

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

export function getIndicators(): TIndicator[] {
  try {
    const lsIndicators = JSON.parse(localStorage.getItem(INDICATORS) || "");
    if (Array.isArray(lsIndicators)) {
      const indicators = [];
      let updateLs = false;
      for (let i = 0; i < lsIndicators.length; i += 1) {
        const indicator = lsIndicators[i];
        if (
          typeof indicator === "object" &&
          ["sma", "ema"].includes(indicator.type) &&
          typeof indicator.length === "number"
        ) {
          indicators.push(indicator);
        } else updateLs = true;
      }
      if (updateLs) setIndicators(indicators);

      return indicators;
    }
  } catch {}

  return [];
}

export function setIndicators(indicators: TIndicator[]): void {
  localStorage.setItem(INDICATORS, JSON.stringify(indicators));
}

export function getAdvanced(): TAdvanced | undefined {
  try {
    const advanced = JSON.parse(localStorage.getItem(ADVANCED) || "");
    if (advanced) return advanced;
  } catch {}

  return undefined;
}

export function setAdvanced(advanced?: TAdvanced): void {
  if (!advanced) localStorage.removeItem(ADVANCED);
  else localStorage.setItem(ADVANCED, JSON.stringify(advanced));
}
