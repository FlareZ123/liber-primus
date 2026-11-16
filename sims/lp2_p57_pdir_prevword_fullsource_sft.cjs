#!/usr/bin/env node
'use strict';
/**
 * Source-fixed LP2 p57 interior-55 ciphertext-previous-word pointer test.
 * Runs on Node 22, Windows 11; repository root is the process working directory.
 * Full original first chapter is selected before the disjoint floral holdout.
 * Prior 300-rune pilot: im-results/lp2_pdir_p57_interior55_gp_prev_pilot.md
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');

const source = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json', 'utf8'));
const transcript = fs.readFileSync('resources/liber-primus/lp2-transcription.txt', 'utf8');
const latin = fs.readFileSync('resources/liber-primus/lp1-plaintext-reference.txt', 'utf8');
const runeMap = new Map(source.runes.map((r, i) => [r, i]));
const runicWords = new RegExp('[' + source.runes.join('') + ']+', 'gu');
const sections = transcript.split('%').map(s => s.replace(/\/\r?\n/g, '').replace(/\r?\n/g, ''));
const words = text => (text.match(runicWords) || []).map(w => Array.from(w, r => runeMap.get(r)));
const start = words(sections.slice(0, 3).join(''));
const holdout = words(sections.slice(40, 53).join('')); // physical p40..49 and p51..53, p50 absent
const clear = words(sections.at(-1));
assert.equal(sections.length, 57);
assert.equal(start.length, 158);
assert.equal(start.flat().length, 729);
assert.equal(holdout.flat().length, 3008);
assert.equal(clear.length, 20);
assert.equal(clear.flat().length, 95);
assert.deepEqual(start.flat(), source.pages.slice(0, 3).flatMap(p => p.indices));
assert.deepEqual(holdout.flat(), source.pages.slice(40, 54).flatMap(p => p.indices));
const insides = clear.flatMap(w => w.slice(1, -1));
assert.equal(insides.length, 55);
assert.equal(clear[0].slice(1, -1).length, 5);

const mod29 = x => (x % 29 + 29) % 29;
const mod55 = x => (x % 55 + 55) % 55;
function isPrime(n) {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
  return true;
}
function directions(cipherWords) {
  return cipherWords.map((w, i) => i === 0 ? 1 :
    isPrime(cipherWords[i - 1].reduce((n, r) => n + source.prime[r], 0)) ? 1 : -1);
}
function ioc(values) {
  const cnt = Array(29).fill(0);
  for (const r of values) cnt[r]++;
  return cnt.reduce((s, v) => s + v * (v - 1), 0) / (values.length * (values.length - 1));
}

/** Build a GP-native word-boundary trigram model from the solved LP1 corpus. */
function buildLanguage() {
  const map = new Map(source.translit.map((name, i) => [name, i]));
  const digraphs = ['TH', 'EO', 'NG', 'OE', 'AE', 'IA', 'EA'];
  const norm = w => w.replace(/K/g, 'C').replace(/V/g, 'U').replace(/Q/g, 'C').replace(/Z/g, 'S');
  function toGP(w) {
    const a = [];
    const x = norm(w);
    for (let i = 0; i < x.length;) {
      const d = digraphs.find(v => x.startsWith(v, i));
      const token = d || x[i];
      if (!map.has(token)) return [];
      a.push(map.get(token));
      i += token.length;
    }
    return a;
  }
  const native = (latin.match(/[A-Z]+/g) || []).map(toGP).filter(w => w.length);
  const uni = Array(29).fill(1);
  const tri = new Map();
  const ctx = new Map();
  for (const w of native) {
    let a = 29, b = 29;
    for (const r of w) {
      uni[r]++;
      const prefix = a * 30 + b, key = prefix * 29 + r;
      tri.set(key, (tri.get(key) || 0) + 1);
      ctx.set(prefix, (ctx.get(prefix) || 0) + 1);
      a = b; b = r;
    }
  }
  const total = uni.reduce((n, v) => n + v, 0);
  const logprob = new Float64Array(30 * 30 * 29);
  const pseudocount = 8;
  for (let a = 0; a < 30; a++) for (let b = 0; b < 30; b++) {
    const prefix = a * 30 + b, denom = (ctx.get(prefix) || 0) + pseudocount;
    for (let r = 0; r < 29; r++) {
      const hit = (tri.get(prefix * 29 + r) || 0) + pseudocount * uni[r] / total;
      logprob[prefix * 29 + r] = Math.log(hit / denom);
    }
  }
  return { logprob, sampleWords: native.length, sampleRunes: native.flat().length };
}
const language = buildLanguage();
function languageScore(plainWords) {
  let score = 0, n = 0;
  for (const w of plainWords) {
    let a = 29, b = 29;
    for (const r of w) {
      score += language.logprob[(a * 30 + b) * 29 + r];
      n++; a = b; b = r;
    }
  }
  return score / n;
}

/** Unconditional bijection: direction from previous ciphertext word, cyclic key. */
function direct(cipherWords, key, sign, reverse) {
  const dirs = directions(cipherWords);
  let j = 0;
  return cipherWords.map((w, i) => w.map(c => {
    const p = mod29(c - sign * key[mod55(j)]);
    j += dirs[i] * reverse;
    return p;
  }));
}

/**
 * Full original skip/coin beam.
 * Each candidate is exactly a possible inverse path; paths are ambiguous
 * unless an independent state or branch grammar supplies the distinction.
 * Word boundary resets the language context but NEVER the key pointer.
 */
function beam(cipherWords, key, sign, collisionModel, beamWidth = 160) {
  const dirs = directions(cipherWords);
  let states = [{ j: 0, a: 29, b: 29, score: 0, prev: null, pt: -1 }];
  const allCipher = [];
  for (let wi = 0; wi < cipherWords.length; wi++) {
    for (const c of cipherWords[wi]) {
      const d = dirs[wi];
      const previous = allCipher.length ? allCipher.at(-1) : -1;
      const successors = new Map();
      for (const s of states) {
        const k0 = mod29(sign * key[mod55(s.j)]);
        const primary = mod29(c - k0);
        const opts = [[primary, s.j + d, s.j]];
        if (previous >= 0) {
          if (collisionModel === 'skip') {
            const k1 = mod29(sign * key[mod55(s.j + d)]);
            const p1 = mod29(c - k1);
            if (mod29(p1 + k0) === previous) opts.push([p1, s.j + 2 * d, s.j + d]);
            const k2 = mod29(sign * key[mod55(s.j + 2 * d)]);
            const p2 = mod29(c - k2);
            if (mod29(p2 + k0) === previous && mod29(p2 + k1) === previous) {
              opts.push([p2, s.j + 3 * d, s.j + 2 * d]);
            }
          } else {
            opts[0][1] = s.j + (c === previous ? 2 * d : d);
            const k2 = mod29(sign * key[mod55(s.j + 2 * d)]);
            const p2 = mod29(c - k2);
            if (mod29(p2 + k0) === previous) opts.push([p2, s.j + 3 * d, s.j + 2 * d]);
          }
        }
        for (const [p, nextj, readj] of opts) {
          const score = s.score + language.logprob[(s.a * 30 + s.b) * 29 + p];
          const a = s.b, b = p;
          const token = mod55(nextj) + ':' + a + ':' + b;
          const old = successors.get(token);
          if (!old || old.score < score) successors.set(token,
            { j: nextj, a, b, score, prev: s, pt: p, readj });
        }
      }
      states = [...successors.values()].sort((a, b) => b.score - a.score).slice(0, beamWidth);
      allCipher.push(c);
    }
    // Visible source word boundary is a language boundary; the rune cipher clock continues.
    states = states.map(s => ({ ...s, a: 29, b: 29 }));
  }
  const winner = states[0];
  const backtrace = [];
  for (let p = winner; p; p = p.prev) if (p.pt >= 0) backtrace.push(p);
  backtrace.reverse();
  const reversed = backtrace.map(x => x.pt);
  assert.equal(reversed.length, allCipher.length);
  // Cryptographic source-preserving forward invariant, for every actual inverse path.
  for (let i = 0; i < reversed.length; i++) {
    assert.equal(mod29(reversed[i] + sign * key[mod55(backtrace[i].readj)]), allCipher[i],
      'exact original-cipher forward recovery');
  }
  const lens = cipherWords.map(w => w.length);
  let cursor = 0;
  const plainWords = lens.map(n => reversed.slice(cursor, cursor += n));
  return { output: plainWords, bits: reversed, meanLog: winner.score / reversed.length,
    ioc: ioc(reversed), states: states.length, reencryptionCount: reversed.length };
}

/** Causal synthetic collision planter and its path certificate. */
function plant(plainWords, key, sign, collisionModel, keepCollision = false) {
  let j = 0, prev = -1, cipherWords = [], trace = [], lastCipherWords = [];
  for (const w of plainWords) {
    const d = lastCipherWords.length === 0 ? 1 :
      isPrime(lastCipherWords.at(-1).reduce((n, r) => n + source.prime[r], 0)) ? 1 : -1;
    const out = [];
    for (const p of w) {
      const prevj = j;
      let val = mod29(p + sign * key[mod55(j)]);
      j += d;
      if (prev >= 0 && val === prev) {
        if (collisionModel === 'coin') {
          j += d; // the coin
          if (!keepCollision) {val = mod29(p + sign * key[mod55(j)]); j += d;}
        } else if (!keepCollision) {
          for (let trial = 0; val === prev && trial < 2; trial++) {
            val = mod29(p + sign * key[mod55(j)]);
            j += d;
          }
        }
      }
      out.push(val); trace.push({ prevj, nextj: j, p, val, prev });
      prev = val;
    }
    cipherWords.push(out); lastCipherWords.push(out);
  }
  return { cipherWords, trace };
}
function certifyPath(plainWords, ciphertextWords, key, sign, collisionModel, keepCollision = false) {
  let j = 0, prev = -1, checked = 0;
  const dirs = directions(ciphertextWords);
  for (let wi = 0; wi < plainWords.length; wi++) {
    const d = dirs[wi];
    for (let i = 0; i < plainWords[wi].length; i++) {
      const p = plainWords[wi][i], c = ciphertextWords[wi][i];
      const j0 = j, k0 = mod29(sign * key[mod55(j)]);
      let y = mod29(p + k0); j += d;
      if (prev >= 0 && y === prev) {
        if (collisionModel === 'coin') {
          j += d;
          if (!keepCollision) { y = mod29(p + sign * key[mod55(j)]); j += d; }
        } else if (!keepCollision) {
          for (let trial = 0; y === prev && trial < 2; trial++) {
            y = mod29(p + sign * key[mod55(j)]); j += d;
          }
        }
      }
      assert.equal(y, c, 'planted original plaintext must reencipher exactly');
      assert.ok(Math.abs(j - j0) <= 3);
      checked++; prev = c;
    }
  }
  return checked;
}

const titleKey = insides;
const primeKey = insides.map(i => source.prime[i] % 29);
const nativeControl = clear.concat(clear, clear);
const controls = {};
for (const model of ['skip', 'coin']) {
  const planted = plant(nativeControl, titleKey, 1, model, false);
  const roundtrip = certifyPath(nativeControl, planted.cipherWords, titleKey, 1, model, false);
  const decoded = beam(planted.cipherWords, titleKey, 1, model, 320);
  controls[model] = { plantedRunes: roundtrip,
    exactRecovered: decoded.bits.every((x, i) => x === nativeControl.flat()[i]),
    runeMatch: decoded.bits.filter((x, i) => x === nativeControl.flat()[i]).length,
    bestIoc: decoded.ioc, score: decoded.meanLog };
}
const keyConfigs = [
  ['gp-title-plus', titleKey, 1], ['gp-title-minus', titleKey, -1],
  ['prime-title-plus', primeKey, 1], ['prime-title-minus', primeKey, -1]
];
const opening = [], trials = [];
for (const [name, key, sign] of keyConfigs) {
  const directPlain = direct(start, key, sign, 1);
  opening.push({ name, model: 'unconditional', log: languageScore(directPlain), ioc: ioc(directPlain.flat()) });
  for (const model of ['skip', 'coin']) {
    const result = beam(start, key, sign, model);
    opening.push({ name, model, log: result.meanLog, ioc: result.ioc,
      firstWords: result.output.slice(0, 17).map(w => w.map(r => source.translit[r]).join('')).join(' '),
      trail: result.output.slice(-5).map(w => w.map(r => source.translit[r]).join('')).join(' ') });
  }
}
opening.sort((a,b) => b.log - a.log);
const candidate = opening.find(x => x.model !== 'unconditional');
const [chosenName, chosenKey, chosenSign] = keyConfigs.find(x => x[0] === candidate.name);
const heldout = beam(holdout, chosenKey, chosenSign, candidate.model);
const heldoutPlain = heldout.output;
const rng = seed => () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
const random = rng(0x20160105);
const nulls = [];
for (let sample = 0; sample < 12; sample++) {
  // Matched original-search null: permute the 55 actual GP runes, then
  // refit ALL four arithmetic/sign and both collision-model alternatives.
  const shuffled = titleKey.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const primeShuffled = shuffled.map(i => source.prime[i] % 29);
  let best = -Infinity;
  for (const candidateKey of [shuffled, primeShuffled]) {
    for (const sign of [1, -1]) {
      const unconditional = direct(start, candidateKey, sign, 1);
      best = Math.max(best, languageScore(unconditional));
      for (const model of ['skip', 'coin']) {
        best = Math.max(best, beam(start, candidateKey, sign, model).meanLog);
      }
    }
  }
  nulls.push(best);
}
const sortedNulls = [...nulls].sort((a,b)=>a-b);
const controlP57 = languageScore(clear);
const output = {
  hypothesis: '2016 previous ciphertext GP-prime word sum direction + p57 PARABLE interior55 cyclic pointer',
  source: { openingWords:start.length, openingRunes:start.flat().length,
    heldoutWords:holdout.length, heldoutRunes:holdout.flat().length,
    keyRunes:insides.length, model:'conv000, first word forward; pointer carries across all word/page boundaries',
    sourceGpP57IoC:ioc(clear.flat()), nativeGpP57LanguageLog:controlP57,
    nativeLp1LanguageWords:language.sampleWords, nativeLp1LanguageRunes:language.sampleRunes },
  controls, opening,
  selectedOnOpening: { name:chosenName, model:candidate.model,
    openingLog:candidate.log, openingIoc:candidate.ioc,
    nullMedian:sortedNulls[6], nullMaximum:sortedNulls.at(-1),
    nullEmpiricalUpperTail:(1+nulls.filter(x=>x>=candidate.log).length)/(nulls.length+1) },
  untouchedFloralHoldout: { n:heldout.bits.length, score:heldout.meanLog,
    ioc:heldout.ioc, reencryptionCount: heldout.reencryptionCount, firstWords:heldoutPlain.slice(0, 25).map(w => w.map(r => source.translit[r]).join('')).join(' '),
    lastWords:heldoutPlain.slice(-10).map(w => w.map(r => source.translit[r]).join('')).join(' ') },
  nullScores:nulls
};
console.log(JSON.stringify(output, null, 2));
assert.equal(output.untouchedFloralHoldout.n, 3008);
