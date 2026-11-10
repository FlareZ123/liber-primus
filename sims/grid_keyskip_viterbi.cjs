/**
 * Skip-constrained Viterbi attack using the 256-byte LP2 p49-51 base60 table.
 * Hypothesis: ciphertext C_t = (P_t + K_j) % 29 or C_t = (P_t - K_j) %29,
 * where K_j=gridByte[j%256] %29; keys are retried only if a proposal
 * would produce the previous ciphertext rune. The model is page-reset.
 *
 * This is a test of one cipher mechanism, not a claim of recovered plaintext.
 * Replay: node sims/grid_keyskip_viterbi.cjs
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const ROOT = path.resolve(__dirname, '..');
const read = (name) => fs.readFileSync(path.join(ROOT, name), 'utf8');
const MOD = 29;
const WIDTH = 256;
const digraphs = {TH:2, NG:21, EO:12, OE:22, AE:25, IA:27, EA:28};
const letters = {A:24,B:17,C:5,D:23,E:18,F:0,G:6,H:8,I:10,J:11,K:5,L:20,M:19,N:9,O:3,P:13,Q:5,R:4,S:15,T:16,U:1,V:1,W:7,X:14,Y:26,Z:15};
const runeNames = ['F','U','TH','O','R','C','G','W','H','N','I','J','EO','P','X','S','T','B','E','M','L','NG','OE','D','A','AE','Y','IA','EA'];
const mod = (x) => (x % MOD + MOD) % MOD;

/** @param {string} text @returns {number[]} Gematria Primus indices. */
function encode(text) {
  const s = text.toUpperCase().replace(/[^A-Z]/g, '');
  const output = [];
  for (let i = 0; i < s.length; i++) {
    const di = digraphs[s.slice(i, i + 2)];
    if (di !== undefined) { output.push(di); i++; }
    else output.push(letters[s[i]]);
  }
  return output;
}

/** Smoothed GP trigram model from a separate, reusable training corpus. */
function train(text) {
  const symbols = encode(text);
  const u = new Uint32Array(MOD);
  const b = new Uint32Array(MOD * MOD);
  const t = new Uint32Array(MOD * MOD * MOD);
  for (let i = 0; i < symbols.length; i++) {
    u[symbols[i]]++;
    if (i) b[symbols[i - 1] * MOD + symbols[i]]++;
    if (i > 1) t[(symbols[i - 2] * MOD + symbols[i - 1]) * MOD + symbols[i]]++;
  }
  const unigram = new Float64Array(MOD);
  const bigram = new Float64Array(MOD * MOD);
  const trigram = new Float64Array(MOD * MOD * MOD);
  for (let c = 0; c < MOD; c++) unigram[c] = Math.log((u[c] + 1) / (symbols.length + MOD));
  for (let a = 0; a < MOD; a++) {
    for (let c = 0; c < MOD; c++) {
      const p = (b[a * MOD + c] + 12 * Math.exp(unigram[c])) / (u[a] + 12);
      bigram[a * MOD + c] = Math.log(p);
    }
  }
  for (let a = 0; a < MOD; a++) for (let v = 0; v < MOD; v++) {
    for (let c = 0; c < MOD; c++) {
      const idx = (a * MOD + v) * MOD + c;
      const p = (t[idx] + 9 * Math.exp(bigram[v * MOD + c])) / (b[a * MOD + v] + 9);
      trigram[idx] = Math.log(p);
    }
  }
  return {symbols: symbols.length, unigram, bigram, trigram};
}

/** Exact Viterbi for all 256 initial offsets and up to two rejected keys per symbol.
 * @param {number[]} cipher Numerically transcribed GP ciphertext.
 * @param {number[]} key Byte values reduced modulo 29.
 * @param {number} sign +1 means P=C+K, -1 means P=C-K.
 * @param {object} model Smoothed trigram model.
 * @param {number} maxAdvance Maximum number of keys consumed per rune.
 * @param {number} skipPenalty Negative log-odds penalty per consumed extra key.
 * @returns {{score:number,perRune:number,plaintext:number[],start:number,skips:number}}
 */
function solve(cipher, key, sign, model, maxAdvance = 3, skipPenalty = 3.5) {
  assert.ok(cipher.length >= 3);
  assert.equal(key.length, WIDTH);
  const count = WIDTH * maxAdvance;
  const decode = (c, j) => mod(c + sign * key[j]);
  const back = new Int16Array(cipher.length * count).fill(-1);
  let prev = new Float64Array(count).fill(-1e100);
  for (let j0 = 0; j0 < WIDTH; j0++) {
    const p0 = decode(cipher[0], j0);
    for (let d = 1; d <= maxAdvance; d++) {
      const j1 = (j0 + d) & 255, p1 = decode(cipher[1], j1);
      let eligible = true;
      for (let h = 1; h < d; h++) {
        if (mod(p1 - sign * key[(j0 + h) & 255]) !== cipher[0]) {
          eligible = false; break;
        }
      }
      if (!eligible) continue;
      const state = j1 * maxAdvance + d - 1;
      const score = model.unigram[p0] + model.bigram[p0 * MOD + p1] - skipPenalty * (d - 1);
      if (score > prev[state]) prev[state] = score;
    }
  }
  for (let i = 2; i < cipher.length; i++) {
    const next = new Float64Array(count).fill(-1e100);
    for (let state = 0; state < count; state++) {
      const base = prev[state];
      if (base < -1e90) continue;
      const j = Math.floor(state / maxAdvance);
      const dPrevious = state % maxAdvance + 1;
      const jPrevious = (j - dPrevious + WIDTH) & 255;
      const pPrevious2 = decode(cipher[i - 2], jPrevious);
      const pPrevious1 = decode(cipher[i - 1], j);
      for (let d = 1; d <= maxAdvance; d++) {
        const jNew = (j + d) & 255;
        const p = decode(cipher[i], jNew);
        let eligible = true;
        for (let h = 1; h < d; h++) {
          if (mod(p - sign * key[(j + h) & 255]) !== cipher[i - 1]) {
            eligible = false; break;
          }
        }
        if (!eligible) continue;
        const nextState = jNew * maxAdvance + d - 1;
        const ll = model.trigram[(pPrevious2 * MOD + pPrevious1) * MOD + p];
        const score = base + ll - skipPenalty * (d - 1);
        if (score > next[nextState]) {
          next[nextState] = score;
          back[i * count + nextState] = state;
        }
      }
    }
    prev = next;
  }
  let best = -1e100, last = -1;
  for (let state = 0; state < count; state++) {
    if (prev[state] > best) { best = prev[state]; last = state; }
  }
  const plain = new Array(cipher.length);
  let state = last, skips = 0;
  for (let i = cipher.length - 1; i >= 1; i--) {
    const j = Math.floor(state / maxAdvance), d = state % maxAdvance + 1;
    plain[i] = decode(cipher[i], j);
    skips += d - 1;
    if (i === 1) {
      plain[0] = decode(cipher[0], (j - d + WIDTH) & 255);
      state = (j - d + WIDTH) & 255;
    } else {
      state = back[i * count + state];
      assert.ok(state >= 0, 'Broken Viterbi traceback');
    }
  }
  return {score: best, perRune: best / cipher.length, plaintext: plain, start: state, skips};
}

function xorshift(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13; state ^= state >>> 17; state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

/** Construct a synthetic plaintext+known-key plant with an 82% collision filter. */
function plant(plaintext, key, start, seed) {
  const rng = xorshift(seed);
  let j = start, previous = -1, skipped = 0;
  const cipher = [];
  for (const p of plaintext) {
    let c = mod(p + key[j]), tries = 0;
    while (previous >= 0 && c === previous && tries < 2 && rng() < 0.82) {
      j = (j + 1) & 255;
      c = mod(p + key[j]);
      tries++;
      skipped++;
    }
    cipher.push(c);
    previous = c;
    j = (j + 1) & 255;
  }
  return {cipher, skipped};
}

function main() {
  const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
  const g = JSON.parse(read('resources/liber-primus/base60-grid.json'));
  const byteStream = g.byte_rows.flat();
  const alphabet = g.alphabet;
  assert.equal(alphabet, '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx');
  assert.equal(g.rows.length, 32);
  assert.equal(byteStream.length, 256);
  for (let r = 0; r < 32; r++) for (let c = 0; c < 8; c++) {
    const tok = g.rows[r][c];
    assert.equal(byteStream[r * 8 + c], 60 * alphabet.indexOf(tok[0]) + alphabet.indexOf(tok[1]));
  }
  const key = byteStream.map(v => v % MOD);
  const model = train(read('resources/control/shakespeare_first300k.txt'));
  const reference = read('resources/liber-primus/lp1-plaintext-reference.txt');
  const testPlain = encode(reference.slice(reference.indexOf('BELIEVE NOTHING'), reference.indexOf('### 3'))).slice(0, 180);
  const planted = plant(testPlain, key, 37, 0x3301ad42);
  const positive = solve(planted.cipher, key, -1, model);
  const recovered = positive.plaintext.filter((v, i) => v === testPlain[i]).length;
  console.log(JSON.stringify({kind:'positive_control',length:testPlain.length,planted_skips:planted.skipped,recovered,recovery_rate:recovered/testPlain.length,score:positive.perRune,offset:positive.start,inferred_skips:positive.skips}));
  const pages = corpus.pages.filter(p => p.page <= 55 && p.indices.length >= 3);
  assert.equal(pages.length, 55);
  assert.equal(pages.reduce((a,p) => a + p.indices.length, 0), 12956);
  const targets = new Set([0,1,20,49,51,55]);
  const rows = [];
  for (const p of pages) {
    const variants = [];
    for (const reversed of [false,true]) {
      const k = reversed ? key.slice().reverse() : key;
      for (const sign of [-1,1]) {
        const result = solve(p.indices, k, sign, model);
        variants.push({sign,reversed,score:result.perRune,offset:result.start,skips:result.skips,plaintext:result.plaintext.slice(0,35).map(v => runeNames[v]).join(' ')});
      }
    }
    variants.sort((a,b) => b.score-a.score);
    rows.push({page:p.page,len:p.indices.length,best:variants[0],variants:targets.has(p.page)?variants:undefined});
  }
  rows.sort((a,b) => b.best.score-a.best.score);
  console.log(JSON.stringify({kind:'real_scan',top20:rows.slice(0,20),focus:[0,1,20,49,51,55].map(p=>rows.find(x=>x.page===p))}));
  const rng = xorshift(0x56bd45e9);
  const numNull = 40, selected = [0,20,49,51];
  for (const pageNumber of selected) {
    const page = pages.find(p => p.page === pageNumber).indices;
    const baseline = rows.find(p => p.page===pageNumber).best.score;
    const nulls = [];
    for (let b=0;b<numNull;b++) {
      const shuffled = key.slice();
      for (let i=255;i>0;i--) {const j=Math.floor(rng()*(i+1));[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];}
      let best=-1e100;
      for(const reversed of [false,true]) for(const sign of [-1,1]) {
        const k=reversed?shuffled.slice().reverse():shuffled;
        best=Math.max(best,solve(page,k,sign,model).perRune);
      }
      nulls.push(best);
    }
    const mean = nulls.reduce((a,b)=>a+b,0)/numNull;
    const sd = Math.sqrt(nulls.reduce((a,b)=>a+(b-mean)**2,0)/(numNull-1));
    const tail = (1+nulls.filter(s=>s>=baseline).length)/(1+numNull);
    console.log(JSON.stringify({kind:'key_permutation_null',page:pageNumber,observed:baseline,mean,sd,empirical_p:tail,replicates:numNull}));
  }
}
if (require.main === module) main();
module.exports = { encode, train, solve, plant };
