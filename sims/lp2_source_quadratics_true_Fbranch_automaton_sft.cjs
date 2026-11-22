'use strict';

/**
 * Exhaustive all-IV, all-transparent-F-branch original-cipher feasibility.
 *
 * Two literal source-operand models are frozen:
 *   H: 2013 BASE29 triple [3,26,24] -> monic X^2+18X+11.
 *   Q: p39 red GP triple [27,5,15] -> nonlinear quadratic Hénon.
 *
 * Unlike a pseudo skip-only cipher, the authentic solved p56 F rule is:
 *   plaintext 0 -> ciphertext 0, NO key advance;
 *   plaintext nonzero -> ciphertext (plaintext+sign*key) mod29,
 *                        YES key advance (may also give ciphertext 0).
 * The inverse is branching at every displayed ciphertext 0, and this SFT
 * exhausts all branches with a 841-state finite automaton, no text guesses.
 *
 * Run on Windows Node22:
 * node sims/lp2_source_quadratics_true_Fbranch_automaton_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(path.join(
  __dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'
));
const FIELD = 29;
const STATES = FIELD * FIELD;

/** @param {number} n @returns {number} */
function mod(n) {
  return ((n % FIELD) + FIELD) % FIELD;
}

/**
 * @param {'H'|'Q'} variant
 * @param {number} u
 * @param {number} v
 * @returns {[number,number]}
 */
function transition(variant, u, v) {
  const next = variant === 'H'
    ? mod(18 * u + 11 * v)
    : mod(27 + 5 * v + 15 * v * v - u);
  return [v, next];
}

/**
 * Calculate a complete deterministic, forward-typed original cipher.
 * @param {number[]} plaintext
 * @param {'H'|'Q'} variant
 * @param {number} initialU
 * @param {number} initialV
 * @param {-1|1} sign
 * @returns {{ciphertext:number[], finalState:number, skips:number}}
 */
function encrypt(plaintext, variant, initialU, initialV, sign) {
  const ciphertext = [];
  let u = initialU;
  let v = initialV;
  let skips = 0;
  for (const p of plaintext) {
    if (p === 0) {
      ciphertext.push(0);
      skips++;
    } else {
      ciphertext.push(mod(p + sign * u));
      [u, v] = transition(variant, u, v);
    }
  }
  return {ciphertext, finalState:FIELD*u+v, skips};
}

/**
 * Complete reachable-state inverse, with ALL 29^2 initial states and both
 * possible plaintext branches when C=0. Nonzero P is required on a normal
 * emission; the C=0 skip branch is always literal P=0. No assumptions about
 * English, plaintext length beyond given C, unknown key, or skip positions.
 *
 * @param {number[]} ciphertext
 * @param {'H'|'Q'} variant
 * @param {-1|1} sign
 * @returns {{mask:Uint8Array, firstOnlyZero:number, firstEmpty:number, states:number}}
 */
function reachable(ciphertext, variant, sign) {
  const successor = new Uint16Array(STATES);
  for (let i = 0; i < STATES; i++) {
    const [u, v] = transition(variant, Math.floor(i/FIELD), i%FIELD);
    successor[i] = FIELD*u+v;
  }

  let available = new Uint8Array(STATES).fill(1);
  let firstOnlyZero = -1;
  let firstEmpty = -1;
  let count = STATES;
  for (let i = 0; i < ciphertext.length; i++) {
    const c = ciphertext[i];
    const next = new Uint8Array(STATES);
    for (let state = 0; state < STATES; state++) {
      if (!available[state]) continue;
      const key = Math.floor(state/FIELD);
      const p = mod(c - sign*key);
      // First branch: transparent plaintext F, only at printed C=F.
      if (c === 0) next[state] = 1;
      // Second branch: encrypted genuine NON-F; advances the key.
      if (p !== 0) next[successor[state]] = 1;
    }
    available = next;
    count = available.reduce((a, b) => a + b, 0);
    if (count === 1 && available[0] && firstOnlyZero === -1) {
      firstOnlyZero = i;
    }
    if (count === 0) {
      firstEmpty = i;
      break;
    }
  }
  return {mask:available, firstOnlyZero, firstEmpty, states:count};
}

/** @param {'H'|'Q'} variant @returns {number[]} */
function cycleLengths(variant) {
  const marked = new Uint8Array(STATES);
  const lengths = [];
  for (let start = 0; start < STATES; start++) {
    if (marked[start]) continue;
    let state = start;
    let n = 0;
    do {
      assert.equal(marked[state], 0);
      marked[state] = 1;
      const [u,v] = transition(variant, Math.floor(state/FIELD), state%FIELD);
      state = u*FIELD+v;
      n++;
    } while (state !== start);
    lengths.push(n);
  }
  return lengths.sort((a,b)=>a-b);
}

function main() {
  assert.equal(corpus.runes.length, FIELD);
  assert.deepEqual(cycleLengths('H'), [1,840]);
  assert.equal(cycleLengths('Q').length, 29);
  assert.equal(Math.max(...cycleLengths('Q')), 140);

  // All models have nonzero-IV exact positive controls across both 95-runic
  // native clear p57 and a full 3000-rune repeat of that authentic source.
  const clear = corpus.pages.find(p=>p.page===57).indices;
  assert.equal(clear.length, 95);
  const longer = Array.from({length:3000}, (_,i)=>clear[i%clear.length]);
  assert.ok(clear.includes(0));
  for (const variant of /** @type {const} */ (['H','Q'])) {
    for (const sign of /** @type {const} */ ([-1,1])) {
      for (const plaintext of [clear,longer]) {
        const plant = encrypt(plaintext,variant,27,5,sign);
        assert.ok(plant.skips > 0);
        const paths = reachable(plant.ciphertext,variant,sign);
        assert.ok(paths.states > 0);
        assert.equal(paths.mask[plant.finalState],1);
        console.log(`plant variant=${variant} sign=${sign} native=${plaintext.length} skips=${plant.skips} paths=${paths.states}`);
      }
    }
  }

  const chapters = [
    {start:0,end:3,len:729,h:562,qPlus:703,qMinus:687},
    {start:3,end:8,len:1145,h:386,qPlus:420,qMinus:455},
    {start:8,end:15,len:1729,h:249,qPlus:387,qMinus:406},
    {start:15,end:23,len:1903,h:326,qPlus:512,qMinus:475},
    {start:23,end:27,len:1021,h:472,qPlus:319,qMinus:659},
    {start:27,end:33,len:1433,h:666,qPlus:566,qMinus:577},
    {start:33,end:40,len:1680,h:360,qPlus:470,qMinus:463},
    {start:40,end:54,len:3008,h:423,qPlus:420,qMinus:387},
    {start:54,end:56,len:308,h:245,qPlus:272,qMinus:245}
  ];
  for (const ch of chapters) {
    const original = corpus.pages.slice(ch.start,ch.end).flatMap(p=>p.indices);
    assert.equal(original.length,ch.len);
    for (const sign of /** @type {const} */ ([-1,1])) {
      const h = reachable(original,'H',sign);
      assert.equal(h.firstOnlyZero,ch.h);
      assert.equal(h.firstEmpty,-1);
      assert.equal(h.states,1);
      assert.equal(h.mask[0],1);
      const q = reachable(original,'Q',sign);
      assert.equal(q.firstEmpty, sign===1?ch.qPlus:ch.qMinus);
      assert.equal(q.states,0);
      console.log(JSON.stringify({
        pages:`${ch.start}-${ch.end-1}`,runic_count:ch.len,
        sign,source_H_last_nonzero_seed_before:ch.h,
        source_H_remaining_seed:'only [0,0]',
        source_Q_first_undefined_zero_based:q.firstEmpty,
        source_Q_remaining_seeds:0
      }));
    }
  }

  // Page carry, red header exclusions: the complete untouched black bodies
  // remain impossible for Q when the original heading is removed.
  for (const ch of [
    {start:40,end:54,red:8,n:3000,qPlus:412,qMinus:379},
    {start:54,end:56,red:9,n:299,qPlus:263,qMinus:236}
  ]) {
    const black = corpus.pages.slice(ch.start,ch.end).flatMap(p=>p.indices).slice(ch.red);
    assert.equal(black.length,ch.n);
    for (const sign of /** @type {const} */ ([-1,1])) {
      const q = reachable(black,'Q',sign);
      assert.equal(q.firstEmpty,sign===1?ch.qPlus:ch.qMinus);
      const h = reachable(black,'H',sign);
      assert.equal(h.states,1);
      assert.equal(h.mask[0],1);
    }
  }

  console.log('PASS: source-native true-F-bypass plants and exact all-IV all-skip original infeasibility.');
}

main();
