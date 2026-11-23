#!/usr/bin/env node
'use strict';

/**
 * Read-only live blockchain history lookup of source-derived mainnet P2PKH.
 * Queries two public Esplora implementations. Do not transact or assume
 * ownership. HTTP failure reports unknown rather than no transactions.
 * Windows Node22: node sims/lp2_p50_meanpng_chain_history_sft.cjs
 */
const assert = require('node:assert/strict');
const address = '1Meanpng7jzYW69Cqmto1r2mGeEoynXdoK';
const providers = [
  { name: 'blockstream', base: 'https://blockstream.info/api' },
  { name: 'mempool', base: 'https://mempool.space/api' }
];

/** @param {string} url @returns {Promise<any>} */
async function getJSON(url) {
  const r = await fetch(url, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(15000)
  });
  if (!r.ok) throw Error('HTTP ' + r.status + ' ' + url);
  return r.json();
}

/** @param {{name:string,base:string}} provider */
async function inspect(provider) {
  try {
    const data = await getJSON(provider.base + '/address/' + address);
    assert.equal(data.address, address);
    const chain = data.chain_stats, pending = data.mempool_stats;
    assert.ok(Number.isSafeInteger(chain.tx_count));
    assert.ok(Number.isSafeInteger(pending.tx_count));
    const result = {
      provider: provider.name,
      checkedAt: new Date().toISOString(),
      confirmedTxCount: chain.tx_count,
      mempoolTxCount: pending.tx_count,
      receivedSatoshis: chain.funded_txo_sum,
      spentSatoshis: chain.spent_txo_sum,
      confirmedTx: []
    };
    if (chain.tx_count > 0) {
      const tx = await getJSON(provider.base + '/address/' + address + '/txs/chain');
      assert.ok(Array.isArray(tx));
      result.confirmedTx = tx.slice(0,25).map(t => ({
        txid: t.txid,
        confirmedAt: t.status && t.status.block_time
          ? new Date(t.status.block_time * 1000).toISOString() : null,
        height: t.status ? t.status.block_height : null,
        opReturns: (t.vout || [])
          .filter(v => String(v.scriptpubkey_asm).includes('OP_RETURN'))
          .map(v => ({ asm: v.scriptpubkey_asm, hex: v.scriptpubkey }))
      }));
    }
    return result;
  } catch (error) {
    return { provider: provider.name, status: 'UNVERIFIED_PROVIDER_ERROR',
      detail: String(error.message || error).slice(0,450) };
  }
}

(async () => {
  const records = await Promise.all(providers.map(inspect));
  const good = records.filter(x => Number.isSafeInteger(x.confirmedTxCount));
  if (good.length === 2) {
    assert.equal(good[0].confirmedTxCount, good[1].confirmedTxCount);
    assert.equal(good[0].mempoolTxCount, good[1].mempoolTxCount);
  }
  const verdict = good.length === 0
    ? 'No usable provider: chain status unknown'
    : good.every(x => x.confirmedTxCount === 0 && x.mempoolTxCount === 0)
      ? 'Accessible providers report no transactions at check time'
      : 'Transaction history observed, inspect confirmed dates';
  console.log(JSON.stringify({ address, records, verdict }, null, 2));
})().catch(error => { console.error(error); process.exitCode = 1; });
