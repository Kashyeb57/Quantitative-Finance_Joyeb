<h1 align="center">Quant Finance Journey</h1>

<p align="center">
  <em>Math, markets &amp; machine learning — learning quantitative finance in public.</em>
</p>

<p align="center">
  <a href="https://joyebkashyeb.com.np"><img alt="Live site" src="https://img.shields.io/badge/live-joyebkashyeb.com.np-25c2a0?style=flat-square"></a>
  <a href="https://github.com/Kashyeb57/quant-finance-journey/actions/workflows/deploy.yml"><img alt="Deploy" src="https://github.com/Kashyeb57/quant-finance-journey/actions/workflows/deploy.yml/badge.svg"></a>
  <img alt="Docusaurus" src="https://img.shields.io/badge/Docusaurus-3.9-3ECC5F?style=flat-square&logo=docusaurus&logoColor=white">
  <img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black">
  <img alt="Cloudflare Workers" src="https://img.shields.io/badge/Cloudflare-Workers-F38020?style=flat-square&logo=cloudflare&logoColor=white">
</p>

<p align="center">
  <a href="https://joyebkashyeb.com.np"><img src="static/img/social-card.png" alt="joyebkashyeb.com.np" width="640"></a>
</p>

---

A living notebook and interactive lab where I study quantitative finance — and ship the tools as I learn them. It isn't a static blog: it runs a **live options/market terminal**, a **paper-trading desk** wired to a real brokerage account, long-form **market post-mortems**, an **in-browser reference library**, and **interactive math** — all behind a hand-built design system and deployed at the edge.

**→ [joyebkashyeb.com.np](https://joyebkashyeb.com.np)**

## Highlights

- **Live Market Terminal** — real-time candlestick charts (self-rendered with TradingView's open-source [lightweight-charts](https://github.com/tradingview/lightweight-charts)), multiple timeframes, market-status badge, a `$TICKER`-filterable news feed, and a **Gamma Exposure (GEX)** sidebar computed from a free CBOE options feed — net dealer gamma by strike, the gamma-flip level, and call/put walls.
- **Trading Desk** (`/portfolio`) — a live, read-only view of an Alpaca **paper** account: a scrubbable equity curve, allocation, a performance read (win rate, realized/unrealized P&L, best/worst), open positions, FIFO round-trips, and the full order ledger. Owner-gated market buy/sell sits behind a **server-side token** — no real money, and the browser never places an order the Worker didn't authorize.
- **Big Events** — long-form incident analyses, not news blurbs (Jane Street's $15B loss, the KOSPI leverage crash, the Aschenbrenner fund liquidation, and more).
- **Reference Library** — reference PDFs read **in-browser** through a custom reader (table of contents, jump-to-page); read-in-place by design.
- **Interactive math** — 3D/SVG visualizations over static images, with KaTeX throughout.
- **Learning docs** — Mathematics, Probability, Statistics, Machine Learning, Finance, Economics, and Python.

## Architecture

A static Docusaurus site on GitHub Pages, fronted by Cloudflare, with two purpose-built Cloudflare Workers doing the server-side work the static site can't — **without ever exposing an API key to the browser.**

```
Browser ──▶ Cloudflare  (proxy · cache · custom domain: joyebkashyeb.com.np)
              │
              ├── /       ──▶ GitHub Pages           static Docusaurus build
              │
              ├── /_m/*   ──▶ market Worker    ──▶   Alpaca (paper) · CBOE
              │                                       API keys live only as Worker secrets
              │
              └── /_a/*   ──▶ analytics Worker  ──▶   Cloudflare D1
```

- **`market/`** — the data plane. Proxies Alpaca with credentials held **server-side only**; exposes candles, snapshots, a live trade stream (WebSocket), the portfolio ledger, and GEX. Ships with a **keyless public fallback**, so the terminal keeps working even if the Worker is down or unconfigured.
- **`analytics/`** — a privacy-light, owner-only visitor beacon backed by **D1**.
- **Deploy-on-push** — a push to `main` triggers GitHub Actions to build the site and deploy each Worker independently. Nothing ships by hand.

## Tech stack

| Layer | Choice |
|---|---|
| Site | Docusaurus 3.9 · React 19 · MDX |
| Math & code | KaTeX (`remark-math` / `rehype-katex`) · Prism |
| Charts | lightweight-charts (runtime) + hand-rolled inline SVG (equity curves, GEX, 3D surfaces) |
| Styling | Plain CSS Modules + the **PHOSPHOR** design system — no Tailwind, no CSS-in-JS |
| Edge | Cloudflare Workers · D1 · Wrangler |
| Data | Alpaca (paper, server-side) · CBOE delayed options · keyless fallbacks |
| CI/CD | GitHub Actions → GitHub Pages + Workers |
| Type | Space Grotesk · Inter · JetBrains Mono |

## Repository layout

```
.
├── docs/                 # learning notes (Math, Probability, Statistics, ML, Finance, Economics, Python)
├── src/
│   ├── pages/            # bespoke React pages: index, terminal, portfolio, books, research, events/…
│   ├── components/       # Terminal (charts · GEX · news · streams), PdfReader, Surface3D/math labs, …
│   ├── css/              # global tokens + the PHOSPHOR design system
│   └── clientModules/    # analytics beacon
├── market/               # Cloudflare Worker — Alpaca/CBOE data proxy  (/_m/*)
├── analytics/            # Cloudflare Worker — visitor analytics on D1  (/_a/*)
├── static/               # images, favicon, social card
└── .github/workflows/    # deploy.yml · deploy-market.yml · deploy-analytics.yml
```

## Local development

Requires **Node ≥ 20**.

```bash
npm install
npm start          # dev server → http://localhost:3000
npm run build      # production build (onBrokenLinks: 'throw' — a dead link fails the build)
npm run serve      # preview the production build locally
```

## Deployment

Everything ships through GitHub — push to `main` and GitHub Actions does the rest (live in ~3 min):

- `deploy.yml` builds and publishes the static site.
- `deploy-market.yml` / `deploy-analytics.yml` deploy their Workers when the relevant directories change.

### Configuring the market Worker

API credentials are **never committed** — they live only as Cloudflare secrets:

```bash
cd market
wrangler secret put ALPACA_KEY_ID      # Alpaca paper key
wrangler secret put ALPACA_SECRET_KEY
wrangler secret put TRADE_TOKEN        # owner-only buy/sell passphrase
wrangler deploy                        # or just push — CI deploys it
```

The client bundle and the repository contain **zero** credentials; the browser only ever talks to this project's own domain.

## Design system — PHOSPHOR

*"A trading terminal restored as a luxury object."* Dark-mode only on neutral graphite, a single green accent (`#25c2a0`) with amber reserved for negative/warning ink, Space Grotesk for display and JetBrains Mono for all data, register-mark cards, and charts hand-drawn in SVG. Plain CSS only — the whole token layer lives in `src/css/`.

## License &amp; attribution

- Original **code** in this repository is © Joyeb Kashyeb.
- Some learning notes adapt third-party course material (e.g., Krish Naik's Data Science course) **with attribution**; reproduced snippets are used for study.
- Reference PDFs in the library remain © their respective authors.
- Not affiliated with Alpaca, Cloudflare, TradingView, or CBOE. Nothing here is investment advice; the trading desk is a **paper** account.

## Contact

**Joyeb Kashyeb** — Computer Science &amp; Data Science student (quantitative finance)

[Website](https://joyebkashyeb.com.np) · [GitHub](https://github.com/Kashyeb57) · [LinkedIn](https://www.linkedin.com/in/joyeb-kashyeb-b46468361) · [Instagram](https://www.instagram.com/kashyeb57/)
