export function getStockLogoUrl(stock: string, dark = false): string {
  return (
    "https://www.torn.com/images/v2/stock-market/" +
    (dark ? "dark-mode/" : "") +
    "logos/" +
    stock.toUpperCase() +
    ".svg"
  );
}
