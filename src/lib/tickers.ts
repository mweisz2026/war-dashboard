import type { TickerConfig } from './types';

export const YAHOO_TICKERS: TickerConfig[] = [
  // ── Crude Oil ────────────────────────────────────────────────────────────────
  { symbol: 'CL=F',      name: 'WTI Crude',           category: 'Crude Oil',        unit: '$/bbl',    source: 'yahoo' },
  { symbol: 'BZ=F',      name: 'Brent Crude',          category: 'Crude Oil',        unit: '$/bbl',    source: 'yahoo' },
  { symbol: 'TQO.L',     name: 'Oman Crude',           category: 'Crude Oil',        unit: '$/bbl',    source: 'yahoo' },
  { symbol: 'DBO',       name: 'DB Oil Fund (WTI ETF)', category: 'Crude Oil',       unit: '$',        source: 'yahoo' },

  // ── Refined Products ─────────────────────────────────────────────────────────
  { symbol: 'RB=F',      name: 'RBOB Gasoline',        category: 'Refined Products', unit: '$/gal',    source: 'yahoo' },
  { symbol: 'HO=F',      name: 'Heating Oil (NY)',      category: 'Refined Products', unit: '$/gal',    source: 'yahoo' },
  { symbol: 'QS=F',      name: 'ICE Gasoil (ARA)',      category: 'Refined Products', unit: '$/mt',     source: 'yahoo' },
  { symbol: 'PN=F',      name: 'Propane (Mont Belvieu)', category: 'Refined Products', unit: '¢/gal',   source: 'yahoo' },

  // ── Natural Gas ──────────────────────────────────────────────────────────────
  { symbol: 'NG=F',      name: 'Henry Hub Nat Gas',    category: 'Natural Gas',      unit: '$/MMBtu',  source: 'yahoo' },
  { symbol: 'TTF=F',     name: 'TTF Nat Gas (Europe)', category: 'Natural Gas',      unit: '€/MWh',    source: 'yahoo' },
  { symbol: 'UNG',       name: 'US Nat Gas ETF',       category: 'Natural Gas',      unit: '$',        source: 'yahoo' },

  // ── Base Metals ──────────────────────────────────────────────────────────────
  { symbol: 'HG=F',      name: 'Copper (LME)',          category: 'Base Metals',      unit: '¢/lb',     source: 'yahoo' },
  { symbol: 'ALI=F',     name: 'Aluminum (LME)',        category: 'Base Metals',      unit: '$/mt',     source: 'yahoo' },
  { symbol: 'NI=F',      name: 'Nickel (LME)',          category: 'Base Metals',      unit: '$/mt',     source: 'yahoo' },
  { symbol: 'ZNC=F',     name: 'Zinc (LME)',            category: 'Base Metals',      unit: '$/mt',     source: 'yahoo' },
  { symbol: 'SLX',       name: 'Steel ETF (SLX)',       category: 'Base Metals',      unit: '$',        source: 'yahoo' },
  { symbol: 'TIO.AX',    name: 'Iron Ore ETF (proxy)',  category: 'Base Metals',      unit: 'A$',       source: 'yahoo' },

  // ── Precious Metals ──────────────────────────────────────────────────────────
  { symbol: 'GC=F',      name: 'Gold (Spot)',           category: 'Precious Metals',  unit: '$/oz',     source: 'yahoo' },
  { symbol: 'SI=F',      name: 'Silver (Spot)',         category: 'Precious Metals',  unit: '$/oz',     source: 'yahoo' },
  { symbol: 'PA=F',      name: 'Palladium',             category: 'Precious Metals',  unit: '$/oz',     source: 'yahoo' },
  { symbol: 'PL=F',      name: 'Platinum',              category: 'Precious Metals',  unit: '$/oz',     source: 'yahoo' },

  // ── Specialty Metals ─────────────────────────────────────────────────────────
  { symbol: 'CPER',      name: 'Copper ETF (CPER)',     category: 'Specialty Metals', unit: '$',        source: 'yahoo' },
  { symbol: 'COMT',      name: 'Cobalt/Materials ETF',  category: 'Specialty Metals', unit: '$',        source: 'yahoo' },
  { symbol: 'REMX',      name: 'Rare Earth ETF (REMX)', category: 'Specialty Metals', unit: '$',        source: 'yahoo' },

  // ── Grains ───────────────────────────────────────────────────────────────────
  { symbol: 'ZC=F',      name: 'Corn (CBT)',            category: 'Grains',           unit: '¢/bu',     source: 'yahoo' },
  { symbol: 'ZS=F',      name: 'Soybeans (CBT)',        category: 'Grains',           unit: '¢/bu',     source: 'yahoo' },
  { symbol: 'ZW=F',      name: 'SRW Wheat (CBT)',       category: 'Grains',           unit: '¢/bu',     source: 'yahoo' },
  { symbol: 'KE=F',      name: 'HRW Wheat (KCBT)',      category: 'Grains',           unit: '¢/bu',     source: 'yahoo' },
  { symbol: 'ZR=F',      name: 'Rough Rice',            category: 'Grains',           unit: '$/cwt',    source: 'yahoo' },

  // ── Softs ────────────────────────────────────────────────────────────────────
  { symbol: 'KC=F',      name: 'Coffee (ICE)',          category: 'Softs',            unit: '¢/lb',     source: 'yahoo' },
  { symbol: 'SB=F',      name: 'Sugar #11 (ICE)',       category: 'Softs',            unit: '¢/lb',     source: 'yahoo' },
  { symbol: 'CT=F',      name: 'Cotton (ICE)',          category: 'Softs',            unit: '¢/lb',     source: 'yahoo' },
  { symbol: 'CC=F',      name: 'Cocoa (ICE)',           category: 'Softs',            unit: '$/mt',     source: 'yahoo' },
  { symbol: 'OJ=F',      name: 'Orange Juice',          category: 'Softs',            unit: '¢/lb',     source: 'yahoo' },
  { symbol: 'LBS=F',     name: 'Lumber',                category: 'Softs',            unit: '$/mbf',    source: 'yahoo' },

  // ── Livestock ────────────────────────────────────────────────────────────────
  { symbol: 'LE=F',      name: 'Live Cattle (CME)',     category: 'Livestock',        unit: '¢/lb',     source: 'yahoo' },
  { symbol: 'HE=F',      name: 'Lean Hogs (CME)',       category: 'Livestock',        unit: '¢/lb',     source: 'yahoo' },
  { symbol: 'GF=F',      name: 'Feeder Cattle',         category: 'Livestock',        unit: '¢/lb',     source: 'yahoo' },

  // ── Fertilizers (ETF/equity proxies — no OTC feed available) ─────────────────
  { symbol: 'MOS',       name: 'Mosaic Co (Potash proxy)', category: 'Fertilizers',  unit: '$',        source: 'yahoo' },
  { symbol: 'NTR',       name: 'Nutrien (Fertilizer)',  category: 'Fertilizers',      unit: '$',        source: 'yahoo' },
  { symbol: 'CF',        name: 'CF Industries (Nitrogen/Urea)', category: 'Fertilizers', unit: '$',    source: 'yahoo' },
  { symbol: 'IPI',       name: 'Intrepid Potash',       category: 'Fertilizers',      unit: '$',        source: 'yahoo' },

  // ── Shipping ─────────────────────────────────────────────────────────────────
  { symbol: 'BDRY',      name: 'Baltic Dry ETF (BDRY)', category: 'Shipping',         unit: '$',        source: 'yahoo' },
  { symbol: 'ZIM',       name: 'ZIM Shipping',          category: 'Shipping',         unit: '$',        source: 'yahoo' },
  { symbol: 'STNG',      name: 'Scorpio Tankers (VLCC proxy)', category: 'Shipping',  unit: '$',        source: 'yahoo' },
  { symbol: 'INSW',      name: 'Intl Seaways (Tankers)', category: 'Shipping',        unit: '$',        source: 'yahoo' },

  // ── Macro (war-relevant only) ─────────────────────────────────────────────────
  { symbol: 'ILS=X',     name: 'USD/ILS',               category: 'Macro',            unit: '',         source: 'yahoo' },
  { symbol: 'DX-Y.NYB',  name: 'DXY (USD Index)',       category: 'Macro',            unit: '',         source: 'yahoo' },
  { symbol: '^VIX',      name: 'VIX',                   category: 'Macro',            unit: '',         source: 'yahoo' },
  { symbol: '^OVX',      name: 'Oil VIX (OVX)',         category: 'Macro',            unit: '',         source: 'yahoo' },
  { symbol: 'GLD',       name: 'Gold ETF (GLD)',         category: 'Macro',            unit: '$',        source: 'yahoo' },
];

export const FRED_SERIES: TickerConfig[] = [
  { symbol: 'DGS10',        name: '10Y Treasury',        category: 'Macro', unit: '%',   source: 'fred' },
  { symbol: 'DGS2',         name: '2Y Treasury',         category: 'Macro', unit: '%',   source: 'fred' },
  { symbol: 'T10YIE',       name: '10Y Breakeven Infl',  category: 'Macro', unit: '%',   source: 'fred' },
  { symbol: 'BAMLH0A0HYM2', name: 'HY Credit Spread',    category: 'Macro', unit: 'bps', source: 'fred' },
  { symbol: 'BAMLC0A0CM',   name: 'IG Credit Spread',    category: 'Macro', unit: 'bps', source: 'fred' },
];

export const ALL_TICKERS = [...YAHOO_TICKERS, ...FRED_SERIES];

export const COMMODITY_CATEGORIES = [
  { key: 'Crude Oil',        label: '🛢  Crude Oil',           description: 'WTI, Brent, Oman' },
  { key: 'Refined Products', label: '⛽  Refined Products',    description: 'Gasoline, heating oil, gasoil, propane' },
  { key: 'Natural Gas',      label: '🔥  Natural Gas',         description: 'Henry Hub, TTF Europe' },
  { key: 'Base Metals',      label: '⚙️  Base Metals',         description: 'Copper, aluminum, nickel, zinc, iron ore, steel' },
  { key: 'Precious Metals',  label: '🥇  Precious Metals',     description: 'Gold, silver, palladium, platinum' },
  { key: 'Specialty Metals', label: '🔬  Specialty Metals',    description: 'Cobalt, rare earth, TiO₂ proxies' },
  { key: 'Grains',           label: '🌾  Grains',              description: 'Corn, soybeans, wheat' },
  { key: 'Softs',            label: '☕  Softs',               description: 'Coffee, sugar, cotton, cocoa' },
  { key: 'Livestock',        label: '🐄  Livestock',           description: 'Live cattle, lean hogs' },
  { key: 'Fertilizers',      label: '🌱  Fertilizers',         description: 'Potash, nitrogen, urea proxies' },
  { key: 'Shipping',         label: '🚢  Shipping & Tankers',  description: 'Baltic Dry, VLCC tanker proxies' },
  { key: 'Macro',            label: '📊  Macro / War Signals', description: 'USD/ILS, DXY, VIX, OVX, rates' },
];

export const CONFLICT_DATES = [
  { date: '2023-10-07', label: 'Hamas attack' },
  { date: '2024-04-01', label: 'IDF strikes Damascus consulate' },
  { date: '2024-04-13', label: 'Iran launches direct attack on Israel' },
  { date: '2024-04-19', label: 'Israel retaliates vs. Iran' },
  { date: '2025-06-13', label: 'US/Israel joint strikes on Iran' },
];

export const DEFAULT_BASELINE_DATE = '2024-04-13';
