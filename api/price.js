// Spot prices for the assets the simulator can sell, read live, each with the
// venue it came from and the second it was read.
//
// Everything on this site that looks like a number is either something you
// typed or something here. There is no third category, because there is no
// trading history to draw one from.
//
// A symbol that no venue answers for is returned with price null and a reason.
// It is never filled in from a neighbour, an average or a cached value.

const SYMBOLS = ['BTC', 'ETH', 'SOL'];

async function grab(url, ms) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), ms || 5000);
  try {
    const r = await fetch(url, { signal: ctl.signal, headers: { 'user-agent': 'TAP/1.0' } });
    clearTimeout(t);
    if (!r.ok) return null;
    return await r.json();
  } catch (e) { clearTimeout(t); return null; }
}

async function coinbase(sym) {
  const j = await grab('https://api.coinbase.com/v2/prices/' + sym + '-USD/spot');
  const v = j && j.data && Number(j.data.amount);
  return v && isFinite(v) ? { usd: v, source: 'api.coinbase.com' } : null;
}

async function kraken(sym) {
  const pair = { BTC: 'XBTUSD', ETH: 'ETHUSD', SOL: 'SOLUSD' }[sym];
  if (!pair) return null;
  const j = await grab('https://api.kraken.com/0/public/Ticker?pair=' + pair);
  const k = j && j.result && Object.values(j.result)[0];
  const v = k && k.c && Number(k.c[0]);
  return v && isFinite(v) ? { usd: v, source: 'api.kraken.com' } : null;
}

module.exports = async (req, res) => {
  res.setHeader('cache-control', 'public, s-maxage=20, stale-while-revalidate=120');

  const want = String((req.query && req.query.s) || '').toUpperCase();
  const list = want ? want.split(',').filter((s) => SYMBOLS.indexOf(s) >= 0) : SYMBOLS;
  if (!list.length) {
    res.status(400).json({ ok: false, error: 'known symbols: ' + SYMBOLS.join(', ') });
    return;
  }

  const at = new Date().toISOString();
  const out = {};
  await Promise.all(list.map(async (s) => {
    const r = (await coinbase(s)) || (await kraken(s));
    out[s] = r
      ? { usd: r.usd, source: r.source, at: at }
      : { usd: null, source: null, at: at, error: 'no venue answered for ' + s };
  }));

  res.status(200).json({ ok: Object.keys(out).some((k) => out[k].usd != null), at: at, prices: out });
};
