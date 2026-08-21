/*
 * Shared watchlist — the single source of truth for the sector-grouped ticker
 * list. Imported by both the market Terminal (chart/news) and the portfolio
 * trade panel, so the two never drift. Add a symbol here and it shows up in
 * both places.
 */
export const SECTIONS = [
  { name: 'Semis',        tickers: ['NVDA', 'AMD', 'AVGO', 'TSM', 'ASML', 'MU', 'QCOM', 'MRVL', 'ARM', 'AMAT', 'TXN', 'INTC', 'SNDK'] },
  { name: 'Software',     tickers: ['MSFT', 'GOOGL', 'META', 'AMZN', 'ORCL', 'NOW', 'PLTR', 'IBM', 'BABA', 'NOK'] },
  { name: 'Crypto',       tickers: ['COIN', 'MSTR', 'CRCL', 'BMNR', 'BTC-USD'] },
  { name: 'Space',        tickers: ['SPCX', 'RKLB', 'ASTS', 'LUNR', 'RDW', 'PL'] },
  { name: 'Neocloud',     tickers: ['CRWV', 'NBIS', 'IREN', 'APLD', 'WULF'] },
  { name: 'EV & Battery', tickers: ['TSLA', 'QS', 'ABAT'] },
  { name: 'ETFs',         tickers: ['SPY', 'QQQ', 'IWM', 'SOXL'] },
];
