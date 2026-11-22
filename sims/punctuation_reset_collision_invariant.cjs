'use strict';

/**
 * Key-independent test of shared, arbitrarily permuted 29-rune cipher rows
 * restarted at sentence punctuation and physical-page boundaries.
 *
 * If C[s,t] = sigma_t(P[s,t]) for a *common*, arbitrary bijection sigma_t
 * across all segments s, pairwise equality at position t survives. This
 * detects strong wordlike plaintext under a reused position-dependent key
 * without recovering or assuming the alphabet substitutions.
 *
 * Run: node sims/punctuation_reset_collision_invariant.cjs
 * @module punctuation_reset_collision_invariant
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const {createHash} = require('node:crypto');

const root = path.resolve(__dirname, '..');
const corpus = fs.readFileSync(path.join(root,
  'resources/lp2-transcription.txt'), 'utf8');
const source = fs.readFileSync(path.join(root,
  'resources/control/shakespeare_first300k.txt'), 'utf8');
const runes = [...'ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ'];
const runeId = new Map(runes.map((r, i) => [r, i]));
const lp2 = corpus.split('%').slice(0,55).join('%');
const N = 29, POSITIONS = 64, TRIALS = 3000;
const DIGRAPHS = {TH:2, NG:21, EO:12, OE:22, AE:25, IA:27, EA:28};
const LETTERS = {
  A:24, B:17, C:5, D:23, E:18, F:0, G:6, H:8, I:10, J:11,
  K:5, L:20, M:19, N:9, O:3, P:13, Q:5, R:4, S:15, T:16,
  U:1, V:1, W:7, X:14, Y:26, Z:15,
};

/** @param {number} seed Nonzero uint32. */
function generator(seed) {
  let s = seed >>> 0;
  assert.ok(s);
  return () => {
    s ^= s << 13; s ^= s >>> 17; s ^= s << 5;
    return s >>> 0;
  };
}

/** @param {string} value Source text with encoded runes. */
function decodeRunes(value) {
  return [...value].filter(c => runeId.has(c)).map(c => runeId.get(c));
}

/** @param {string} word Uppercase reference word. */
function englishGP(word) {
  const out = [];
  for(let i = 0; i < word.length; i++) {
    const two = DIGRAPHS[word.slice(i,i+2)];
    if (two !== undefined) { out.push(two); i++; }
    else out.push(LETTERS[word[i]]);
  }
  return out;
}
const english = (source.toUpperCase().match(/[A-Z]+/g) || [])
  .flatMap(englishGP);
assert.ok(english.length > 50000);

/** @param {RegExp} delimiter Reset-position definition. */
function fragments(delimiter) {
  const result = lp2.split(delimiter).map(decodeRunes).filter(p => p.length);
  assert.equal(result.flat().length, 12956);
  return result;
}

/**
 * Twice the excess same-rune pairs across distinct segments, comparing
 * equal absolute positions only. Invariant under an arbitrary sigma_t
 * applied identically to all segments, for every t independently.
 * @param {number[][]} segments Rune-index vectors.
 * @param {number[]} shifts Global alphabet rotations per segment.
 * @param {number[]} available Number of segments with position t.
 */
function score(segments, shifts, available) {
  const hist = Array.from({length:POSITIONS}, () => new Uint16Array(N));
  for (let s = 0; s < segments.length; s++) {
    const word = segments[s], shift = shifts[s];
    for (let t = 0; t < Math.min(POSITIONS, word.length); t++)
      hist[t][(word[t] + shift) % N]++;
  }
  let total = 0;
  for (let t = 0; t < POSITIONS; t++) {
    for (const count of hist[t]) total += count * (count - 1);
    total -= available[t] * (available[t] - 1) / N;
  }
  return total;
}

/**
 * Null retains each whole segment's internal equality, rune multiset,
 * word lengths, punctuation placement, and immediate doublet pattern.
 * Independent mod-29 rotations destroy shared absolute alphabet labels.
 * @param {number[][]} segments
 * @param {number} seed
 */
function evaluate(segments, seed) {
  const available = Array.from({length:POSITIONS}, (_, t) =>
    segments.reduce((s,p) => s + Number(p.length > t), 0));
  const observed = score(segments, segments.map(() => 0), available);
  const random = generator(seed);
  let exceed = 0, sum = 0, square = 0, max = -Infinity;
  for (let i=0; i<TRIALS; i++) {
    const shifts = segments.map(() => random() % N);
    const val = score(segments, shifts, available);
    exceed += Number(val >= observed - 1e-8);
    sum += val; square += val*val;
    if(val > max) max = val;
  }
  const mean = sum/TRIALS, sd = Math.sqrt(square/TRIALS-mean*mean);
  return {segments:segments.length, atPosition32:available[31],
    observedExcessTwicePairs:observed, nullMean:mean,
    nullSd:sd, z:(observed-mean)/sd,
    exceed, trials:TRIALS, upperP:(exceed+1)/(TRIALS+1),
    maxNull:max};
}

/**
 * Positive control: independent GP-English from held-out Shakespeare
 * preserves original segment lengths; arbitrary substitution row at
 * each position is identical across segments. Suppress 81% of adjacent
 * ciphertext repeats, matching the nuisance channel's *rate* only.
 * @param {number[][]} layout
 * @param {number} seed
 */
function planted(layout, seed) {
  const random=generator(seed), maxLength=Math.max(...layout.map(x=>x.length));
  const tables=Array.from({length:maxLength},()=>{
    const symbols=Array.from({length:N},(_,i)=>i);
    for(let i=N-1;i>0;i--) {
      const j=random()%(i+1);
      [symbols[i],symbols[j]]=[symbols[j],symbols[i]];
    }
    return symbols;
  });
  let at=30000, repaired=0, repeats=0;
  const ciphertext=layout.map(original=>{
    const clear=english.slice(at,at+original.length);
    assert.equal(clear.length,original.length);
    at+=original.length;
    const out=[];
    for(let t=0;t<clear.length;t++){
      let v=tables[t][clear[t]];
      if(t>0&&v===out[t-1]&&random()%100<81) {
        v=(v+1+(random()%28))%N;
        repaired++;
      }
      if(t>0&&v===out[t-1]) repeats++;
      out.push(v);
    }
    return out;
  });
  return {ciphertext,repaired,repeats};
}

/** @returns {object} Full experiment for the three predeclared reset sites. */
function main() {
  const modes=[
    ['period-only',/\.+/],
    ['physical-page',/%+/],
    ['period-or-page',/[.%]+/],
  ];
  const outputs=modes.map(([name,delim],i)=>{
    const actual=fragments(delim);
    const measured=evaluate(actual,(0x38bdc0ed+100*i)>>>0);
    const plant=planted(actual,(0x51bc62dc+100*i)>>>0);
    const control=evaluate(plant.ciphertext,(0x38bdc0ee+100*i)>>>0);
    assert.ok(control.upperP < 0.01, 'Positive control failed');
    return {name, original:measured,
      syntheticEnglish:{...control,repaired:plant.repaired,
        unrepairedDoublets:plant.repeats}};
  });
  assert.deepEqual(outputs.map(o=>o.original.segments),[175,55,219]);
  return {sourceSHA256:createHash('sha256').update(corpus).digest('hex'),
    sourceRunes:12956, firstPositions:POSITIONS, outputs,
    status:'No validated plaintext/key; scoped original-ciphertext test'};
}
if(require.main===module) console.log(JSON.stringify(main(),null,2));
module.exports={main,fragments,score,evaluate,planted};
