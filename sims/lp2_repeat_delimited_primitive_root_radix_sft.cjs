'use strict';
/**
 * Source-motivated primitive-root ordering of LP2's 28 nonzero transitions.
 * Run from the repository root with Node.js 22:
 *   node sims/lp2_repeat_delimited_primitive_root_radix_sft.cjs
 *
 * This is a frozen exploratory inverse, not an authenticated Cicada cipher.
 */
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = p => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));

function experiment(corpus, donor) {
  const eq = (a, b, msg) => {
    if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(msg);
  };
  const requireTrue = (v, msg) => { if (!v) throw new Error(msg); };
  const mod = 29;
  const generator = 2; // least positive primitive root modulo 29
  const powers = new Array(28);
  const discreteLog = new Int8Array(29).fill(-1);
  let v = 1;
  for (let e = 0; e < 28; e++) {
    powers[e] = v;
    discreteLog[v] = e;
    v = (v * generator) % mod;
  }
  eq(v, 1, 'primitive-root cycle closes');
  eq(new Set(powers).size, 28, '2 must enumerate every nonzero residue');

  const runeId = new Map(corpus.runes.map((r, i) => [r, i]));
  const pages = corpus.pages.filter(p => p.page < 56);
  const ciphertext = pages.flatMap(p => p.indices);
  eq(ciphertext.length, 12956, 'canonical unknown-page rune count');

  let offset = 0;
  const pageBounds = new Map();
  for (const p of pages) {
    pageBounds.set(p.page, [offset, offset + p.indices.length]);
    offset += p.indices.length;
  }

  // Positional conversion with leading-zero preservation.
  function convert(digits, from, to) {
    let zeros = 0;
    while (zeros < digits.length && digits[zeros] === 0) zeros++;
    let n = 0n;
    for (let i = zeros; i < digits.length; i++) {
      requireTrue(digits[i] >= 0 && digits[i] < from, 'digit outside source radix');
      n = n * BigInt(from) + BigInt(digits[i]);
    }
    const tail = [];
    while (n > 0n) {
      tail.push(Number(n % BigInt(to)));
      n /= BigInt(to);
    }
    return Array(zeros).fill(0).concat(tail.reverse());
  }

  // A zero modular difference is a block delimiter. Every nonzero difference
  // is mapped to its unique exponent in the cyclic group F_29^*.
  function decode(c) {
    requireTrue(c.length > 0, 'first ciphertext rune is the seed');
    const blocks = [];
    let digits = [];
    let start = 1;
    let repeats = 0;
    for (let i = 1; i < c.length; i++) {
      const d = (c[i] - c[i - 1] + mod) % mod;
      if (d === 0) {
        blocks.push({ start, end: i, digits, plain: convert(digits, 28, 29) });
        digits = [];
        start = i + 1;
        repeats++;
      } else {
        digits.push(discreteLog[d]);
      }
    }
    blocks.push({ start, end: c.length, digits, plain: convert(digits, 28, 29) });
    return { seed: c[0], blocks, repeats };
  }

  // Inverse: base29 -> base28, exponentiate the primitive root, then
  // accumulate nonzero differences; duplicate the last ciphertext rune
  // between blocks to recreate each observed delimiter.
  function encode(seed, plaintextBlocks) {
    const out = [seed];
    for (let b = 0; b < plaintextBlocks.length; b++) {
      const digits = convert(plaintextBlocks[b], 29, 28);
      for (const e of digits) {
        const d = powers[e];
        out.push((out[out.length - 1] + d) % mod);
      }
      if (b < plaintextBlocks.length - 1) out.push(out[out.length - 1]);
    }
    return out;
  }

  const original = decode(ciphertext);
  eq(original.repeats, 86, 'original repeat-delimiter count');
  eq(original.blocks.length, 87, 'original block count');
  eq(encode(original.seed, original.blocks.map(b => b.plain)), ciphertext,
     'full original forward replay');

  const sections = donor.sections.map(s => ({
    name: s.name,
    a: [...s.source_text].filter(ch => runeId.has(ch)).map(ch => runeId.get(ch))
  }));
  eq(sections.reduce((n, s) => n + s.a.length, 0), 2979, 'native donor length');

  const heldNames = ['0_welcome', 'jpg107-167'];
  const count = new Uint32Array(29 ** 3);
  const context = new Uint32Array(29 ** 2);
  for (const s of sections.filter(s => !heldNames.includes(s.name))) {
    for (let i = 2; i < s.a.length; i++) {
      const h = s.a[i - 2] * 29 + s.a[i - 1];
      context[h]++;
      count[h * 29 + s.a[i]]++;
    }
  }

  function score(a) {
    let total = 0;
    for (let i = 2; i < a.length; i++) {
      const h = a[i - 2] * 29 + a[i - 1];
      total += Math.log((count[h * 29 + a[i]] + 0.5) / (context[h] + 14.5));
    }
    return total / (a.length - 2);
  }
  function ioc(a) {
    const f = Array(29).fill(0);
    for (const x of a) f[x]++;
    return f.reduce((sum, n) => sum + n * (n - 1), 0) / (a.length * (a.length - 1));
  }
  const latin = a => a.map(x => corpus.translit[x]).join('');
  const metric = a => ({
    n: a.length,
    ioc: ioc(a),
    trigramNatsPerRune: score(a),
    head: latin(a.slice(0, 120))
  });

  const originalPlain = original.blocks.flatMap(b => b.plain);
  const selectBlocks = range =>
    original.blocks.filter(b => b.start >= range[0] && b.end <= range[1]);
  const opening = selectBlocks([pageBounds.get(0)[0], pageBounds.get(2)[1]]);
  const holdout = selectBlocks([pageBounds.get(16)[0], pageBounds.get(21)[1]]);
  const openingPlain = opening.flatMap(b => b.plain);
  const holdoutPlain = holdout.flatMap(b => b.plain);
  requireTrue(openingPlain.length >= 300 && holdoutPlain.length >= 200,
              'frozen original holdout minimums');

  let state = 3301 >>> 0;
  function rng() {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  }
  function shuffle(a) {
    a = a.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = rng() % (i + 1);
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  function shuffleNull(blocks) {
    const actual = score(blocks.flatMap(b => b.plain));
    const scores = Array.from({ length: 128 }, () =>
      score(blocks.flatMap(b => convert(shuffle(b.digits), 28, 29))));
    return {
      n: scores.length,
      min: Math.min(...scores),
      max: Math.max(...scores),
      mean: scores.reduce((a, b) => a + b, 0) / scores.length,
      atLeastActual: scores.filter(s => s >= actual).length
    };
  }

  const controls = sections.filter(s => heldNames.includes(s.name)).map((s, i) => {
    const chunks = [];
    for (let j = 0; j < s.a.length; j += 128) chunks.push(s.a.slice(j, j + 128));
    const c = encode(3 + i, chunks);
    const d = decode(c);
    eq(d.seed, 3 + i, 'native control seed');
    eq(d.blocks.map(b => b.plain), chunks, 'native plaintext recovery');
    eq(encode(d.seed, d.blocks.map(b => b.plain)), c, 'native ciphertext replay');
    return {
      name: s.name,
      plain: metric(s.a),
      ciphertext: metric(c),
      recoveredRunes: d.blocks.reduce((n, b) => n + b.plain.length, 0),
      insertedRepeatDelimiters: d.repeats,
      ciphertextLength: c.length
    };
  });

  return {
    field: 29,
    eulerTotient: 28,
    primitiveRoot: generator,
    primitiveRootPowers: powers,
    seed: original.seed,
    sourceLength: ciphertext.length,
    sourceRepeatDelimiters: original.repeats,
    sourceBlockCount: original.blocks.length,
    sourceBlockDigitLengths: original.blocks.map(b => b.digits.length),
    decodedBlockLengths: original.blocks.map(b => b.plain.length),
    decodedLength: originalPlain.length,
    removedOverhead: ciphertext.length - originalPlain.length,
    fullOriginal: metric(originalPlain),
    openingP0to2: {
      physicalPages: 'p0-p2',
      completeBlocks: opening.length,
      metric: metric(openingPlain),
      shuffleNull: shuffleNull(opening)
    },
    holdoutP16to21: {
      physicalPages: 'p16-p21',
      completeBlocks: holdout.length,
      metric: metric(holdoutPlain),
      shuffleNull: shuffleNull(holdout)
    },
    nativeControls: controls
  };
}

const result = experiment(
  read('resources/liber-primus/lp2-corpus.json'),
  read('resources/external/relikd-solved-gp29-native-v1.json')
);
console.log(JSON.stringify(result, null, 2));
