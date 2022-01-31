import { INTERVALS } from 'config';

const LIST_ORDER = 'list-order';
const LIST_COLUMNS = 'list-columns';
const FAVOURITES = 'favourites';
const THEME = 'theme';
const STOCK = 'stock';
const INTERVAL = 'interval';
const VOLUME = 'volume';
const INDICATORS = 'indicators';
const ADVANCED = 'advanced';

export function getListOrder(): string | null {
  return localStorage.getItem(LIST_ORDER);
}

export function setListOrder(order: string): void {
  localStorage.setItem(LIST_ORDER, order);
}

export function getListColumns(): string[] {
  const columns = localStorage.getItem(LIST_COLUMNS);
  return columns ? columns.split(',') : ['price|h24', 'price|d7', 'marketcap', 'marketcap|d1|$'];
}

export function setListColumns(columns: string[]): void {
  localStorage.setItem(LIST_COLUMNS, columns.join(','));
}

export function setListFavourites(favourites: string[]): void {
  if (favourites.length) localStorage.setItem(FAVOURITES, favourites.join(','));
  else localStorage.removeItem(FAVOURITES);
}

export function getListFavourites(): string[] {
  const favourites = localStorage.getItem(FAVOURITES);
  return favourites ? favourites.toUpperCase().split(',') : [];
}

export function getTheme(): string | null {
  return localStorage.getItem(THEME);
}

export function setTheme(theme: string): void {
  localStorage.setItem(THEME, theme);
}

export function getStock(): string {
  return localStorage.getItem(STOCK) || '';
}

export function setStock(stock: string): void {
  localStorage.setItem(STOCK, stock);
}

export function getInterval(): TInterval {
  const interval = localStorage.getItem(INTERVAL) as TInterval;
  return interval && INTERVALS.includes(interval) ? interval : 'm1';
}

export function setInterval(interval: string): void {
  localStorage.setItem(INTERVAL, interval);
}

export function getIndicators(): TIndicator[] {
  try {
    const lsIndicators = JSON.parse(localStorage.getItem(INDICATORS) || '');
    if (Array.isArray(lsIndicators)) {
      const indicators = [];
      let updateLs = false;
      for (let i = 0; i < lsIndicators.length; i += 1) {
        const indicator = lsIndicators[i];
        if (
          typeof indicator === 'object' &&
          ['sma', 'ema'].includes(indicator.type) &&
          typeof indicator.length === 'number'
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
    const advanced = JSON.parse(localStorage.getItem(ADVANCED) || '');
    if (advanced) return advanced;
  } catch {}

  return undefined;
}

export function setAdvanced(advanced?: TAdvanced): void {
  if (!advanced) localStorage.removeItem(ADVANCED);
  else localStorage.setItem(ADVANCED, JSON.stringify(advanced));
}

export function getVolume(): string | null {
  return localStorage.getItem(VOLUME);
}

export function setVolume(volume: string): void {
  localStorage.setItem(VOLUME, volume);
}
