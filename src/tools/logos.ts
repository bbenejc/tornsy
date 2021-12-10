export function getStockLogoUrl(stock: string, dark = false): string {
  if (stock.length > 3) return 'https://tornsy.com/images/' + stock.toUpperCase() + '.svg';

  return (
    'https://www.torn.com/images/v2/stock-market/' +
    (dark ? 'dark-mode/' : '') +
    'logos/' +
    stock.toUpperCase() +
    '.svg'
  );
}
