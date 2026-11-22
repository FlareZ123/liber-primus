/**
 * Search non-affine algebraic transfer from one encrypted word to the next.
 * Candidate maps are chosen from Gematria prime arithmetic and F_29 inverses.
 * Family-wise permutation null and weak-signal positive control.
 */
'use strict';

const { wordPages, modes, shuffle, makeRandom } = require('./word_affine_probe.cjs');
const primes = [2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109];
const M = 29;
const pow = (base, exponent) => {
  let out = 1;
  for (let i = 0; i < exponent; i++) out = (out * base) % M;
  return out;
};
const inv = (n) => n === 0 ? 0 : pow(n, 27);
const primitiveLog = Array(29).fill(0);
let element = 1;
for (let k = 0; k < 28; k++) {
  primitiveLog[element] = k;
  element = (element * 2) % 29;
}
const transforms = {
  inverse_index: x => inv(x),
  square: x => (x * x) % 29,
  cube: x => (x * x * x) % 29,
  prime_mod29: x => primes[x] % 29,
  prime_inverse: x => inv(primes[x] % 29),
  index_plus_prime: x => (x + primes[x]) % 29,
  index_times_prime: x => (x * primes[x]) % 29,
  mobius_fraction: x => x === 28 ? 0 : (x * inv((x + 1) % 29)) % 29,
  discrete_log2: x => primitiveLog[x]
};
const allMaps = [];
for (const [name, transform] of Object.entries(transforms)) {
  for (let a = 1; a < 29; a++) {
    for (let b = 0; b < 29; b++) {
      const positions = new Uint16Array(29);
      for (let x = 0; x < 29; x++) positions[x] = 29 * x + (a * transform(x) + b) % 29;
      allMaps.push({ name, a, b, positions });
    }
  }
}
const value = (word, k) => k >= 0 ? word[k] : word[word.length + k];

function scan(pages) {
  let best = { z: -Infinity };
  for (const {left,right} of modes) {
    const mat = new Uint32Array(29 * 29);
    let n = 0;
    for (const words of pages) {
      for (let i = 1; i < words.length; i++) {
        const x = value(words[i - 1], left);
        const y = value(words[i], right);
        if (x !== undefined && y !== undefined) { mat[29 * x + y]++; n++; }
      }
    }
    const expected = n / 29, sd = Math.sqrt(expected * 28 / 29);
    for (const {name,a,b,positions} of allMaps) {
      let hits = 0;
      for (let x = 0; x < 29; x++) hits += mat[positions[x]];
      const z = (hits - expected) / sd;
      if (z > best.z) best = { z, name, a, b, left, right, hits, n };
    }
  }
  return best;
}

// Plant an otherwise unknown nonlinear mechanism at a sparse 3% of word transitions.
function plant(pages, rng, rate = 0.03) {
  const output = pages.map(ws => ws.map(w => w.slice()));
  for (const ws of output) {
    for (let j = 1; j < ws.length; j++) {
      if (ws[j - 1].length < 2 || ws[j].length < 2 || rng() >= rate) continue;
      const x = ws[j - 1][ws[j - 1].length - 2];
      ws[j][ws[j].length - 2] = (13 * inv(x) + 11) % 29;
    }
  }
  return output;
}

function study(replicates = 500, controls = 50, seed = 3302) {
  const rng = makeRandom(seed), observation = scan(wordPages);
  const nullScores = [];
  for (let i = 0; i < replicates; i++) nullScores.push(scan(shuffle(wordPages, rng)).z);
  nullScores.sort((a,b) => a-b);
  const threshold = nullScores[Math.ceil(0.99 * replicates)-1];
  let found = 0;
  for (let i = 0; i < controls; i++) if (scan(plant(shuffle(wordPages,rng),rng)).z > threshold) found++;
  return {
    hypothesis: 'non-affine maps of Gematria rune index or prime residue, y = a*g(x)+b (mod 29), on 15 adjacent-word position pairings',
    families: Object.keys(transforms),
    hypotheses: allMaps.length * modes.length,
    nullReplicates: replicates,
    observation,
    null95: nullScores[Math.ceil(0.95 * replicates)-1],
    null99: threshold,
    familywiseP: (1 + nullScores.filter(x=>x>=observation.z).length)/(replicates+1),
    plantDescription: '3% sparse neighboring penultimate-rune map y=13*inv(x)+11 mod29',
    plantDetections: found,
    plantTrials: controls,
    seed,
    caveat: 'Near-uniform null z scores assume independent rune-value marginals; family-wise distribution is empirical under pagewise shuffled words. Null does not preserve cross-word anti-doublet effect; immediate boundary mode excluded.'
  };
}
if (require.main === module) process.stdout.write(JSON.stringify(study(),null,2)+'\n');
module.exports={study,scan,plant};
