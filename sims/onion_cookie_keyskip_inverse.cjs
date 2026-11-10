'use strict';

/**
 * Skip-aware original-cipher inversion using the fixed 2013 onion cookie
 * values. Reuses the shared source-derived AES/ChaCha20 keystream generator
 * and exact collision-constrained Viterbi; no additional invented cipher.
 *
 * SFT: node sims/onion_cookie_keyskip_inverse.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {keySources} = require('./onion_cookie_key_probe.cjs');
const {streamKey, viterbi} = require('./grid_stream_collision_viterbi.cjs');
const {train, encode} = require('./grid_keyskip_viterbi.cjs');

const ROOT = path.resolve(__dirname, '..');
const raw = name => fs.readFileSync(path.join(ROOT, name), 'utf8');
const corpus = JSON.parse(raw('resources/liber-primus/lp2-corpus.json'));
const pageIds = [0, 3, 8, 23, 27, 40];
const pages = pageIds.map(n => corpus.pages.find(p => p.page === n));
const T = 130, H = 80;
assert.ok(pages.every(p => p.indices.length >= T + H));
const book = raw('resources/control/shakespeare_first300k.txt');
const model = train(book.slice(0, 210000));
const alphabet = corpus.runes;

const modes = [];
for (const [keyName, key] of Object.entries(keySources))
  for (const algo of ['aes-256-ctr', 'chacha20'])
    for (const nonce of ['zero', 'page-index'])
      for (const reducer of ['mod29', 'scaled29'])
        for (const sign of [-1, 1])
          modes.push({keyName, key, algo, nonce, reducer, sign});
assert.equal(modes.length, 112);

function getPad(setting, page) {
  const iv = Buffer.alloc(16);
  if (setting.nonce === 'page-index') iv.writeUInt32BE(page, 12);
  return streamKey(setting.key, {
    algo: setting.algo, reducer: setting.reducer, reverseKey: false
  }, 320, iv);
}

function evaluate(cipher) {
  const results = [];
  for (const setting of modes) {
    const details = [];
    let trainScore = 0;
    for (let j = 0; j < pages.length; j++) {
      const pad = getPad(setting, pages[j].page);
      const first = viterbi(cipher[j].slice(0, T), pad, setting.sign, model);
      const continuation = viterbi(
        cipher[j].slice(T, T + H),
        pad.slice(T + first.skips), setting.sign, model);
      trainScore += first.score;
      details.push({
        page: pages[j].page, initialScore: first.perRune,
        initialRejectedDraws: first.skips,
        following80: continuation.perRune,
        candidate: continuation.plaintext.slice(0, 45).map(x => alphabet[x]).join('')
      });
    }
    results.push({
      key: setting.keyName, algo: setting.algo,
      nonce: setting.nonce, reducer: setting.reducer, sign: setting.sign,
      training: trainScore / (pages.length * T),
      heldout: details.reduce((s, d) => s + d.following80, 0) / pages.length,
      details
    });
  }
  return results.sort((a, b) => b.training - a.training);
}

function plant() {
  const english = encode(book.slice(220000));
  assert.ok(english.length > pages.length * (T + H));
  const target = modes.find(m =>
    m.keyName === 'cookie167' && m.algo === 'aes-256-ctr' &&
    m.nonce === 'page-index' && m.reducer === 'mod29' && m.sign === 1);
  assert.ok(target);
  let seed = 0x16776113;
  function rnd() {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    return seed >>> 0;
  }
  const rejected = [];
  const encrypted = pages.map((page, j) => {
    const pad = getPad(target, page.page);
    let previous = -1, position = 0, skips = 0;
    const symbols = english.slice(j * (T + H), (j + 1) * (T + H));
    const output = [];
    for (const p of symbols) {
      let c = (p + pad[position]) % 29;
      if (c === previous && rnd() % 100 < 81) {
        position++;
        c = (p + pad[position]) % 29;
        skips++;
      }
      output.push(c);
      previous = c;
      position++;
    }
    rejected.push(skips);
    return output;
  });
  const ranked = evaluate(encrypted);
  const rank = ranked.findIndex(x =>
    x.key === 'cookie167' && x.algo === 'aes-256-ctr' &&
    x.nonce === 'page-index' && x.reducer === 'mod29' && x.sign === 1) + 1;
  assert.equal(rank, 1, 'Source-true collision-rejected plant should win');
  assert.ok(ranked[0].heldout > -4,
    'Heldout planted passage must retain GP-language signal');
  const directRecovered = pages.map((page, j) => {
    const pad = getPad(target, page.page);
    const result = viterbi(encrypted[j], pad, target.sign, model);
    const actual = english.slice(j * (T + H), (j + 1) * (T + H));
    const correct = result.plaintext.filter((x, i) => x === actual[i]).length;
    return {page: page.page, correct, total: actual.length, inferredSkips: result.skips};
  });
  const totalRecovered = directRecovered.reduce((n, x) => n + x.correct, 0);
  assert.equal(totalRecovered, pages.length * (T + H),
    'The original source-key inverse must recover every planted GP rune');
  return {
    trueRank: rank, rejected, totalRecovered, totalPlain: pages.length * (T + H),
    directRecovered, top: ranked.slice(0, 2).map(compact)
  };
}

function compact(row) {
  return {
    key: row.key, algo: row.algo, nonce: row.nonce,
    reducer: row.reducer, sign: row.sign,
    training: row.training, heldout: row.heldout,
    perPage: row.details.map(d => ({
      page: d.page, training: d.initialScore,
      holdout: d.following80, skippedIn130: d.initialRejectedDraws,
      candidate: d.candidate.slice(0, 25)
    }))
  };
}

function main() {
  const control = plant();
  const original = evaluate(pages.map(p => p.indices.slice(0, T + H)));
  console.log(JSON.stringify({
    hypothesis: 'Reported 2013 cookie values as AES/ChaCha20 stream keys with original-cipher collision-rejected draws',
    pages: pageIds, trainingPerPage: T, originalHoldoutPerPage: H,
    models: modes.length, control,
    realTop: original.slice(0, 4).map(compact),
    bestOriginalHeldoutAfterSelection: compact(
      original.reduce((a, b) => a.heldout > b.heldout ? a : b))
  }, null, 2));
}
if (require.main === module) main();
module.exports = {getPad, evaluate, plant, main};