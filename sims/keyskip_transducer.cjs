"use strict";
/**
 * Exact truncated marginal likelihood for an additive modular cipher whose
 * key pointer advances past proposals that would repeat the preceding
 * *ciphertext* symbol. Crucial: the plaintext symbol is sampled ONCE per
 * output and held fixed across rejected key positions.
 *
 * Model: propose C=sigma((P + key[j]) mod M), with P sampled from q;
 * if C equals preceding output, reject this key position with probability
 * rejectRepeat and propose again with the SAME P; otherwise accept.
 *
 * Distinct from the incorrect model that redraws P after each skip.
 * At any emitting position j, P is uniquely determined by observed C and
 * key[j]; a path of s skipped positions is possible only if ALL skipped
 * keys would produce the preceding observed C from that SAME P.
 * Summing over hidden positions gives the forward likelihood, with no
 * fitted per-symbol key skips. Truncation allows up to maxSkippedPerOutput
 * local rejects and maxTotalSkips extra key positions.
 *
 * Reusable for arbitrary alphabet size, keystream and outer permutation.
 * No private key or manuscript solution is claimed.
 */

/**
 * @typedef {{
 *   key:number[],q:number[],inverseSigma:number[],
 *   offset?:number,rejectRepeat?:number,
 *   maxTotalSkips?:number,maxSkippedPerOutput?:number
 * }} Model
 */

/** @param {number} x @param {number} modulus */
function mod(x, modulus) {
  return (x % modulus + modulus) % modulus;
}

/**
 * @param {number[]} cipher
 * @param {Model} model
 * @returns {number} Truncated log probability, natural logarithms.
 */
function logLikelihood(cipher, model) {
  const { key, q, inverseSigma } = model;
  const M = q.length, KEYLEN = key.length;
  const r = model.rejectRepeat === undefined ? 0.83 : model.rejectRepeat;
  const offset = model.offset || 0;
  const maxTotalSkips = model.maxTotalSkips === undefined
    ? 40 : model.maxTotalSkips;
  const maxSkippedPerOutput = model.maxSkippedPerOutput === undefined
    ? 4 : model.maxSkippedPerOutput;
  let state = new Float64Array(cipher.length + maxTotalSkips + 2);
  state[0] = 1;
  let logProb = 0;
  for (let t = 0; t < cipher.length; t++) {
    const observed = cipher[t], previous = t ? cipher[t - 1] : -1;
    const currentInternal = inverseSigma[observed];
    const previousInternal = previous < 0 ? -1 : inverseSigma[previous];
    const next = new Float64Array(state.length);
    let normalization = 0;
    const upper = Math.min(t + maxTotalSkips, state.length - 2);
    for (let emitAt = t; emitAt <= upper; emitAt++) {
      const p = mod(currentInternal - key[(offset + emitAt) % KEYLEN], M);
      const accept = previous === observed ? (1 - r) : 1;
      let paths = state[emitAt];
      if (t > 0) {
        let product = r;
        for (let s = 1; s <= maxSkippedPerOutput && emitAt - s >= t; s++) {
          const skippedPosition = emitAt - s;
          const wouldEmit = mod(p +
            key[(offset + skippedPosition) % KEYLEN], M);
          if (wouldEmit !== previousInternal) break;
          paths += state[skippedPosition] * product;
          product *= r;
        }
      }
      const probability = q[p] * accept * paths;
      next[emitAt + 1] += probability;
      normalization += probability;
    }
    if (normalization === 0) return -Infinity;
    const invNorm = 1 / normalization;
    for (let j = t + 1; j <= Math.min(t + maxTotalSkips + 1, state.length - 1); j++) {
      next[j] *= invNorm;
    }
    logProb += Math.log(normalization);
    state = next;
  }
  return logProb;
}

/**
 * Generate planted examples with a fixed plaintext symbol across rejection
 * trials; makes exact test assertions possible.
 * @param {number[]} plain
 * @param {number[]} key
 * @param {number[]} sigma
 * @param {()=>number} random
 * @param {{offset?:number,rejectRepeat?:number}} [options]
 * @returns {{cipher:number[],skips:number,pointers:number[]}}
 */
function encrypt(plain, key, sigma, random, options = {}) {
  const r = options.rejectRepeat === undefined ? 0.83 : options.rejectRepeat;
  let cursor = options.offset || 0, skips = 0;
  const cipher = [], pointers = [];
  for (const p of plain) {
    let c;
    for (;;) {
      const j = cursor++;
      c = sigma[(p + key[j % key.length]) % sigma.length];
      if (!(cipher.length && c === cipher[cipher.length - 1]
        && random() < r)) {
        pointers.push(j);
        break;
      }
      skips++;
    }
    cipher.push(c);
  }
  return {cipher,skips,pointers};
}

/** @param {number[]} sigma */
function invert(sigma) {
  const out = Array(sigma.length);
  sigma.forEach((s, i) => { out[s] = i; });
  return out;
}

module.exports = {logLikelihood,encrypt,invert};
