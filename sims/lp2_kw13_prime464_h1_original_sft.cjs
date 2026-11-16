'use strict';

/**
 * Source-fixed 2014 solved-keyword x 2013 prime_echo H1 reachability SFT.
 * Run: node sims/lp2_kw13_prime464_h1_original_sft.cjs
 *
 * This tests the frozen additive two-layer key K_j = (prime_j + keyword_j) mod 29.
 * Starting event is the 2013 two-second 1033 pause, ordinal 174 (zero index173).
 * The original source has 464 prime events; a wrap is defined for long plants,
 * but both discriminating original failures occur before any source-list wrap.
 * Exactly preserves the authentic solved plaintext-F nonconsuming bypass.
 *
 * H1 model "skip": 0..5 rejected key attempts on a collision with previous
 * ciphertext; "coin": the published one-redraw model. Full exact DP enumerates
 * all possible key-pointer paths, with no selected plaintext and no language
 * model. An unreachable original rune excludes this exact model regardless of
 * which English language prior a beam search might apply.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const ROOT = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(
  ROOT, 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'));
const script = fs.readFileSync(path.join(
  ROOT, 'resources', 'historical', 'cicada2013-os-original-prime-echo.sh'), 'utf8');

const prime = [...script.matchAll(/echo\s+(?:-n\s+)?["'](\d+)/g)]
  .map(x => Number(x[1]));
assert.equal(prime.length, 464);
assert.equal(prime[0], 2);
assert.equal(prime[173], 1033);
assert.equal(prime[463], 3301);
const pause = 173;
const SYMBOLS = [...'FIRFUMFERENFE'];
const gp = new Map(corpus.translit.map((letter, i) => [letter, i]));
const keyword = SYMBOLS.map(letter => {
  assert.ok(gp.has(letter));
  return gp.get(letter);
});
assert.equal(keyword.length, 13);
const MOD = 29;
const mod = n => ((n % MOD) + MOD) % MOD;

/** @param {number} pointer
 *  @param {number} [eventOrigin]
 *  @param {number[]} [kw]
 *  @returns {number} */
function key(pointer, eventOrigin = pause, kw = keyword) {
  return mod(prime[(eventOrigin + pointer) % 464] + kw[pointer % kw.length]);
}

/**
 * Exact reachable-source-pointer DP, no language filtering.
 * Model 0: (P+K_j)=C, or up to 5 preceding tried K values produce previous C.
 * Model 1: direct branch consumes 1 (+1 on repeated C), redraw branch
 *          requires (P+K_j)=previous C and emits (P+K_(j+2))=C, consuming 3.
 * Literal plaintext F emits ciphertext F and does not move the pointer.
 *
 * @param {number[]} cipher Original source GP29 indices
 * @param {0|1} model
 * @param {number} [origin] Historic source prime event index
 * @param {number[]} [kw]
 * @returns {{furthest:number,states:number,peak:number,minPointer:number|null,maxPointer:number|null}}
 */
function invertReachable(cipher, model, origin = pause, kw = keyword) {
  let states = new Set([0]);
  let peak = 1;
  for (let i = 0; i < cipher.length; i += 1) {
    const ci = cipher[i];
    const prev = i ? cipher[i - 1] : -1;
    const next = new Set();
    for (const j of states) {
      if (ci === 0) next.add(j); // Authentic plaintext-F transparent branch.
      let p = mod(ci - key(j, origin, kw));
      if (p !== 0) {
        next.add(j + 1 + Number(model === 1 && ci === prev));
      }
      if (prev < 0) continue;
      if (model === 0) {
        for (let rejected = 1; rejected <= 5; rejected += 1) {
          p = mod(ci - key(j + rejected, origin, kw));
          if (p === 0) continue; // Original plaintext F never encrypted.
          let valid = true;
          for (let h = 0; h < rejected; h += 1) {
            if (mod(p + key(j + h, origin, kw)) !== prev) {
              valid = false;
              break;
            }
          }
          if (valid) next.add(j + rejected + 1);
        }
      } else {
        p = mod(ci - key(j + 2, origin, kw));
        if (p !== 0 && mod(p + key(j, origin, kw)) === prev) {
          next.add(j + 3);
        }
      }
    }
    if (!next.size) {
      return {
        furthest: i, states: 0, peak, minPointer: null, maxPointer: null
      };
    }
    states = next;
    peak = Math.max(peak, states.size);
  }
  return {
    furthest: cipher.length, states: states.size, peak,
    minPointer: Math.min(...states), maxPointer: Math.max(...states)
  };
}

/**
 * Known plaintext positive: concatenate three copies of the independently
 * solved clear p57 native GP-rune page and encrypt through the fixed K_j.
 * Select a deterministic H1 collision redraw when available.
 * Both channels include 9 authentic plaintext-F bypass events and at least
 * ten actual source-key drift events; cipher values are never hand-planted.
 *
 * @param {number[]} plain
 * @param {0|1} model
 * @returns {{cipher:number[],drifts:number,plainF:number,used:number}}
 */
function encryptPlant(plain, model) {
  const cipher = [];
  let j = 0;
  let drifts = 0;
  let plainF = 0;
  for (const p of plain) {
    if (p === 0) {
      cipher.push(0);
      plainF += 1;
      continue;
    }
    const prev = cipher.length ? cipher[cipher.length - 1] : -1;
    let c = mod(p + key(j));
    if (model === 0) {
      let attempts = 0;
      while (c === prev && attempts < 5) {
        j += 1;
        attempts += 1;
        c = mod(p + key(j));
      }
      drifts += attempts;
      j += 1;
    } else if (c === prev) {
      const redraw = mod(p + key(j + 2));
      if (redraw !== prev) {
        c = redraw;
        j += 3;
        drifts += 1;
      } else {
        j += 2; // The model may keep a repeated ciphertext.
      }
    } else {
      j += 1;
    }
    cipher.push(c);
  }
  return {cipher, drifts, plainF, used: j};
}

/** @param {number[]} values @returns {string} */
function checksum(values) {
  return crypto.createHash('sha256').update(Buffer.from(values)).digest('hex');
}

/** @param {number} first @param {number} last @returns {number[]} */
function unknownRange(first, last) {
  return corpus.pages.filter(p => p.page >= first && p.page <= last)
    .flatMap(p => p.indices);
}

const c0 = unknownRange(0, 2).slice(0, 220);
const c40 = unknownRange(40, 53).slice(0, 220);
assert.equal(c0.length, 220);
assert.equal(c40.length, 220);
const nativeSolved = corpus.pages.find(p => p.page === 57).indices;
assert.equal(nativeSolved.length, 95);
const plantText = [nativeSolved, nativeSolved, nativeSolved].flat();
assert.equal(plantText.length, 285);

const planted = [];
const original = [];
for (const model of [0, 1]) {
  const plantedCipher = encryptPlant(plantText, model);
  const correct = invertReachable(plantedCipher.cipher, model);
  assert.equal(correct.furthest, 285, 'true-key native p57 positive');
  assert.ok(plantedCipher.drifts >= 10);
  assert.equal(plantedCipher.plainF, 9);
  const wrongKeyword = keyword.slice(1).concat(keyword[0]);
  const controls = {
    wrongKeywordRotate1: invertReachable(
      plantedCipher.cipher, model, pause, wrongKeyword),
    wrongFirstPause1031: invertReachable(
      plantedCipher.cipher, model, pause - 1),
    wrongFinalPause3301: invertReachable(
      plantedCipher.cipher, model, 463)
  };
  planted.push({
    model: model ? 'coin' : 'skip',
    sourceSolvedPage: 57,
    plaintextRunes: 285,
    nativeFBypasses: plantedCipher.plainF,
    plantedCollisionRedraws: plantedCipher.drifts,
    plantedCipherSha256: checksum(plantedCipher.cipher),
    correct,
    controls
  });
  original.push({
    model: model ? 'coin' : 'skip',
    p0First220: invertReachable(c0, model),
    p40First220: invertReachable(c40, model)
  });
}

assert.equal(original[0].p0First220.furthest, 220);
assert.equal(original[0].p40First220.furthest, 123);
assert.equal(original[1].p0First220.furthest, 51);
assert.equal(original[1].p40First220.furthest, 220);

// Source independently verifies ordinary glyphs, but each chapter's first
// oversized red rune is one of 13 unresolved ornamental identities.
const firstRuneErasures = [];
for (const model of [0, 1]) {
  const everyFirstRune = (original) => Array.from({length: 29}, (_, rune) => {
    const input = original.slice();
    input[0] = rune;
    return invertReachable(input, model).furthest;
  });
  const p0 = everyFirstRune(c0);
  const p40 = everyFirstRune(c40);
  firstRuneErasures.push({
    model: model ? 'coin' : 'skip',
    p0All29MaxReached: Math.max(...p0),
    p0All29Full220: p0.filter(n => n === 220).length,
    p40All29MaxReached: Math.max(...p40),
    p40All29Full220: p40.filter(n => n === 220).length
  });
}
assert.equal(firstRuneErasures[0].p40All29MaxReached, 123);
assert.equal(firstRuneErasures[0].p40All29Full220, 0);
assert.equal(firstRuneErasures[1].p0All29MaxReached, 51);
assert.equal(firstRuneErasures[1].p0All29Full220, 0);

console.log(JSON.stringify({
  hypothesis: 'fixed authentic 2014 keyword + literal 2013 prime_echo source',
  corpus: 'resources/liber-primus/lp2-corpus.json',
  primeSource: 'resources/historical/cicada2013-os-original-prime-echo.sh',
  key: '(source prime[(173+j) mod 464] + GP[FIRFUMFERENFE][j mod 13]) mod29',
  sourceAnchor: '2013 script event ordinal174, prime1033, 2-second pause',
  originalFirst220: {
    p0Sha256: checksum(c0),
    p40Sha256: checksum(c40)
  },
  models: ['skip: 0..5 rejected collision attempts', 'coin: single redraw'],
  original,
  firstRuneErasures,
  planted,
  decision: 'A global fixed H1 mode cannot decode both original p0 and p40 windows with authentic plaintext-F transparency: skip fails at p40 zero-based rune123 and coin fails at p0 zero-based rune51. The exact original-inverse failure needs no fitted language or key. Source does not authorize mode switching between the two chapters. No LP2 plaintext or unknown key.'
}, null, 2));
