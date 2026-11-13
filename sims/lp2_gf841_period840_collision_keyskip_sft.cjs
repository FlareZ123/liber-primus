'use strict';
/**
 * Test collision-conditioned variable advance of the source-derived GF(29^2)
 * period-840 key on the complete 1,680-rune original LP2 p33–39 chapter.
 *
 * This distinguishes a genuine variable key-clock attack from the previously
 * tested fixed-840 shared-pad, constant-feedback and field-output hypotheses.
 * The source does not authenticate the tested cipher. Node.js 22, CommonJS.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { encode, train } = require('./grid_keyskip_viterbi.cjs');

const ROOT = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(ROOT, name), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const language = read('resources/control/shakespeare_first300k.txt');
const GP = 29;
const PERIOD = 840;
const MAX_ADVANCE = 3;
const SKIP_PENALTY = 3.5;
const mod = x => ((x % GP) + GP) % GP;

/**
 * Enumerate powers of the independently published source-derived primitive
 * field element g=19+13u, where u^2=3u+8 in GF(29^2).
 * @returns {Array<{a:number,b:number}>}
 */
function fieldCycle() {
  const states = [];
  const seen = new Set();
  let a = 1, b = 0;
  for (let j = 0; j < PERIOD; j++) {
    const id = a * GP + b;
    assert.ok(!seen.has(id), 'Premature GF841 field-cycle repetition');
    seen.add(id);
    states.push({ a, b });
    const nextA = mod(19 * a + 17 * b);
    const nextB = mod(13 * a);
    a = nextA;
    b = nextB;
  }
  assert.deepEqual([a, b], [1, 0], 'Primitive source-derived field period');
  assert.equal(seen.size, PERIOD);
  return states;
}

/**
 * @param {Array<{a:number,b:number}>} states
 * @returns {Array<{name:string,key:number[]}>}
 */
function projections(states) {
  return [
    { name: 'coordinate-a', key: states.map(s => s.a) },
    { name: 'coordinate-b', key: states.map(s => s.b) },
    { name: 'trace', key: states.map(s => mod(2 * s.a + 3 * s.b)) },
    { name: 'norm', key: states.map(s => mod(s.a * s.a + 3 * s.a * s.b + 21 * s.b * s.b)) }
  ];
}

/**
 * Exact Viterbi over all 840 hidden start phases, two predecessor distances,
 * and collision-conditioned discarded outputs. Each known GP29 ciphertext
 * symbol is kept unchanged. Discarding a field-key draw is legal only when
 * that draw would have emitted the actual previous ciphertext rune.
 *
 * @param {number[]} cipher
 * @param {number[]} key
 * @param {number} encodeSign Either +1 or -1 in C=P+sign*K mod29
 * @param {ReturnType<typeof train>} model
 * @returns {{plaintext:number[],score:number,plainScore:number,ioc:number,skips:number,start:number}}
 */
function solve(cipher, key, encodeSign, model) {
  assert.ok(cipher.length > 3);
  assert.equal(key.length, PERIOD);
  assert.ok(encodeSign === 1 || encodeSign === -1);
  const states = PERIOD * MAX_ADVANCE;
  const decode = (c, j) => mod(c - encodeSign * key[j]);
  const prevCipher = cipher;
  const traceback = new Int16Array(cipher.length * states).fill(-1);
  let previous = new Float64Array(states).fill(-Infinity);

  for (let phase = 0; phase < PERIOD; phase++) {
    const p0 = decode(cipher[0], phase);
    for (let d = 1; d <= MAX_ADVANCE; d++) {
      const j = (phase + d) % PERIOD;
      const p1 = decode(cipher[1], j);
      let valid = true;
      for (let h = 1; h < d; h++) {
        if (mod(p1 + encodeSign * key[(phase + h) % PERIOD]) !== cipher[0]) {
          valid = false; break;
        }
      }
      if (!valid) continue;
      const score = model.unigram[p0] + model.bigram[p0 * GP + p1] - SKIP_PENALTY * (d - 1);
      const id = j * MAX_ADVANCE + d - 1;
      if (score > previous[id]) previous[id] = score;
    }
  }

  for (let i = 2; i < cipher.length; i++) {
    const next = new Float64Array(states).fill(-Infinity);
    for (let state = 0; state < states; state++) {
      const baseScore = previous[state];
      if (!Number.isFinite(baseScore)) continue;
      const j = (state / MAX_ADVANCE) | 0;
      const oldAdvance = state % MAX_ADVANCE + 1;
      const oldJ = (j - oldAdvance + PERIOD) % PERIOD;
      const pBefore = decode(cipher[i - 2], oldJ);
      const pPrevious = decode(cipher[i - 1], j);
      const trigramBase = (pBefore * GP + pPrevious) * GP;
      for (let d = 1; d <= MAX_ADVANCE; d++) {
        const newJ = (j + d) % PERIOD;
        const p = decode(cipher[i], newJ);
        let possible = true;
        for (let h = 1; h < d; h++) {
          if (mod(p + encodeSign * key[(j + h) % PERIOD]) !== prevCipher[i - 1]) {
            possible = false; break;
          }
        }
        if (!possible) continue;
        const score = baseScore + model.trigram[trigramBase + p] - SKIP_PENALTY * (d - 1);
        const newState = newJ * MAX_ADVANCE + d - 1;
        if (score > next[newState]) {
          next[newState] = score;
          traceback[i * states + newState] = state;
        }
      }
    }
    previous = next;
  }
  let best = -Infinity, state = -1;
  for (let k = 0; k < states; k++) {
    if (previous[k] > best) { best = previous[k]; state = k; }
  }
  assert.ok(state >= 0 && Number.isFinite(best), 'No valid field-clock inverse');
  const plaintext = new Array(cipher.length);
  let skipped = 0, initialJ = -1;
  for (let i = cipher.length - 1; i >= 1; i--) {
    const j = (state / MAX_ADVANCE) | 0;
    const d = state % MAX_ADVANCE + 1;
    skipped += d - 1;
    plaintext[i] = decode(cipher[i], j);
    if (i === 1) {
      initialJ = (j - d + PERIOD) % PERIOD;
      plaintext[0] = decode(cipher[0], initialJ);
    } else {
      state = traceback[i * states + state];
      assert.ok(state >= 0, 'Invalid Viterbi parent state');
    }
  }
  const plainScore = scoreText(plaintext, model);
  const hist = new Uint32Array(GP);
  for (const p of plaintext) hist[p]++;
  const collisionPairs = hist.reduce((sum, n) => sum + n * (n - 1), 0);
  const ioc = collisionPairs / (plaintext.length * (plaintext.length - 1));
  assert.ok(Math.abs(plainScore - best - skipped * SKIP_PENALTY) < 1e-6,
    'Traceback must reproduce exactly the full optimization score');
  return { plaintext, score: best / cipher.length, plainScore: plainScore / cipher.length,
    ioc, skips: skipped, start: initialJ };
}

/**
 * @param {number[]} plain
 * @param {ReturnType<typeof train>} model
 * @returns {number}
 */
function scoreText(plain, model) {
  let score = model.unigram[plain[0]] + model.bigram[plain[0] * GP + plain[1]];
  for (let i = 2; i < plain.length; i++) {
    score += model.trigram[(plain[i - 2] * GP + plain[i - 1]) * GP + plain[i]];
  }
  return score;
}

/** @param {number} seed @returns {() => number} */
function random(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13; state ^= state >>> 17; state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

/**
 * Source-shaped positive: independently encrypt native GP prose with a known
 * key and a cipher-collision rejection clock, including >=1 actual reject.
 * @param {number[]} plaintext
 * @param {number[]} key
 * @param {number} encodeSign
 * @param {number} phase
 * @returns {{ciphertext:number[],skips:number[]}}
 */
function plant(plaintext, key, encodeSign, phase) {
  const rand = random(0x20163301);
  const ciphertext = [], skips = [];
  let j = phase, prev = -1;
  for (const p of plaintext) {
    let c = mod(p + encodeSign * key[j]), discarded = 0;
    while (prev >= 0 && c === prev && discarded < 2 && rand() < 0.87) {
      j = (j + 1) % PERIOD;
      c = mod(p + encodeSign * key[j]);
      discarded++;
    }
    ciphertext.push(c);
    skips.push(discarded);
    prev = c;
    j = (j + 1) % PERIOD;
  }
  assert.ok(skips.reduce((sum, v) => sum + v, 0) > 0);
  return { ciphertext, skips };
}

function main() {
  const pageNumbers = [33, 34, 35, 36, 37, 38, 39];
  const cipher = pageNumbers.flatMap(page => corpus.pages.find(p => p.page === page).indices);
  assert.equal(cipher.length, 1680);
  const model = train(language.slice(0, 200000));
  const holdout = encode(language.slice(230000, 285000)).slice(0, 1680);
  assert.equal(holdout.length, 1680);
  const variants = projections(fieldCycle());
  const control = plant(holdout, variants[0].key, +1, 227);
  const positive = solve(control.ciphertext, variants[0].key, +1, model);
  const correct = positive.plaintext.reduce((n, p, i) => n + (p === holdout[i] ? 1 : 0), 0);
  const sourceSkips = control.skips.reduce((a,b) => a+b,0);
  const controlResult = {
    recovered: correct, length: holdout.length, truePhase:227, recoveredPhase:positive.start,
    sourceSkips, decodedSkips:positive.skips, sourceScore:scoreText(holdout,model)/holdout.length,
    viterbiScore:positive.plainScore
  };
  console.log('POSITIVE_CONTROL ' + JSON.stringify(controlResult));
  assert.ok(correct >= 0.95 * holdout.length,
    'The original-key decoder must recover at least 95% of independent native-GP plant');

  const output = [];
  for (const variant of variants) for (const sign of [+1, -1]) {
    const result = solve(cipher, variant.key, sign, model);
    const row = {
      projection:variant.name, encodeSign:sign, length:cipher.length,
      originalRawScore:scoreText(cipher,model)/cipher.length,
      nativeHoldoutScore:scoreText(holdout,model)/holdout.length,
      viterbiScore:result.score, plaintextScore:result.plainScore,
      plaintextIoC:result.ioc, skips:result.skips, phase:result.start,
      preview:result.plaintext.slice(0,100).map(v=>corpus.translit[v]).join(' ')
    };
    output.push(row);
    console.log('ORIGINAL ' + JSON.stringify(row));
  }
  const best = output.reduce((a,b)=>a.plaintextScore>b.plaintextScore?a:b);
  console.log('BEST_ORIGINAL ' + JSON.stringify(best));
  console.log('PASS: all eight original models and the original-source-native exact Viterbi positive');
}

if (require.main === module) main();
module.exports = { fieldCycle, projections, scoreText, solve, plant };
