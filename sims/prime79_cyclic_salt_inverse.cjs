'use strict';
/**
 * Prime-79 cyclic packet / public-IV inverse and key-free GP collision gate.
 *
 * A 79-rune packet publishes one nonzero difference (salt), followed by 78
 * plaintext rune slots. Output step zero denotes GP EA (index 28); all other
 * steps are permuted GP non-EA values by a secret row specific to (salt, slot).
 * Every row may be an arbitrary one of 28! permutations.
 *
 * The exact same-(salt,slot) collision count is invariant to ALL secret rows.
 * The original-source diagnostic is conditional: neither this framing nor
 * its EA convention is known to be the authentic Liber Primus mechanism.
 *
 * Node.js 22, CommonJS, no network and no file writes.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {encode} = require('./word_partition_invariant.cjs');
const ROOT = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(ROOT, name), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const original = corpus.pages.filter(p => p.page < 56).flatMap(p => p.indices);
const MOD = 29, ALPHA = 28, WIDTH = 79, PLAIN = 78, PHASE = 35;
const PACKETS = 164;
assert.equal(original.length, WIDTH * PACKETS);

/** @param {number} x */
function mod(x) {return (x % MOD + MOD) % MOD;}
/** @param {number} seed */
function rng(seed) {
  let x = seed >>> 0;
  return () => {x ^= x << 13; x ^= x >>> 17; x ^= x << 5; return x >>> 0;};
}

/** @param {number[]} ciphertext @param {number} phase */
function frames(ciphertext, phase) {
  const n = ciphertext.length;
  const packets = [];
  for (let block = 0; block < PACKETS; block++) {
    const start = (phase + WIDTH * block) % n;
    const salt = mod(ciphertext[start] - ciphertext[(start + n - 1) % n]);
    const ranks = [];
    for (let i = 1; i <= PLAIN; i++) {
      const now = ciphertext[(start + i) % n];
      const prev = ciphertext[(start + i - 1) % n];
      const step = mod(now - prev);
      ranks.push(step === 0 ? -1 : step - 1);
    }
    packets.push({start, salt, ranks});
  }
  return packets;
}

/**
 * Key-independent IOC under any arbitrary fixed 28-symbol permutation for
 * each public (salt, packet-relative-slot) state.
 * @param {{salt:number,ranks:number[]}[]} packets
 * @param {boolean} [crossfit]
 */
function collision(packets, crossfit = false) {
  const ncells = MOD * PLAIN;
  const hist = new Uint16Array(ncells * ALPHA);
  const sizes = new Uint16Array(ncells);
  const before = crossfit ? new Uint16Array(ncells * ALPHA) : null;
  const beforeSizes = crossfit ? new Uint16Array(ncells) : null;
  let hits = 0, pairs = 0;
  for (let block = 0; block < packets.length; block++) {
    const {salt, ranks} = packets[block];
    for (let col = 0; col < PLAIN; col++) {
      const symbol = ranks[col];
      if (symbol < 0) continue;
      const state = salt * PLAIN + col;
      const key = state * ALPHA + symbol;
      if (crossfit && block < packets.length / 2) {
        before[key]++;
        beforeSizes[state]++;
      } else {
        const earlier = crossfit ? before : hist;
        const stateSizes = crossfit ? beforeSizes : sizes;
        hits += (crossfit ? 1 : 2) * earlier[key];
        pairs += (crossfit ? 1 : 2) * stateSizes[state];
        hist[key]++;
        sizes[state]++;
      }
    }
  }
  assert(pairs > 0);
  return {hits, pairs, ioc: hits / pairs};
}

/** @param {() => number} random @param {number} n */
function permutation(random, n) {
  const a = Array.from({length: n}, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const k = random() % (i + 1);
    [a[i], a[k]] = [a[k], a[i]];
  }
  return a;
}

/** Exact forward original-cipher model on planted source GP, circular. */
function positiveControl(packets, sample, random) {
  const tables = Array.from({length: MOD * PLAIN},
    () => permutation(random, ALPHA));
  const source = packets.map((p, block) => ({
    salt: p.salt,
    ranks: p.ranks.map((v, col) => v === -1 ? 28 : sample[block * PLAIN + col])
  }));
  assert(source.every(p => p.ranks.every(v => v >= 0 && v < MOD)));
  const emitted = (salts) => {
    let sum = 0;
    for (let b = 0; b < PACKETS; b++) {
      const salt = salts[b], ranks = source[b].ranks;
      sum += salt;
      for (let j = 0; j < PLAIN; j++)
        if (ranks[j] !== 28)
          sum += 1 + tables[salt * PLAIN + j][ranks[j]];
    }
    return mod(sum);
  };
  const salts = source.map(p => p.salt);
  // The last two public IVs may be selected by the encoder to close the ring.
  // No plaintext value is fitted to the closure.
  let solved = false;
  for (let a = 1; a < MOD && !solved; a++) {
    salts[PACKETS - 2] = a;
    for (let b = 1; b < MOD && !solved; b++) {
      salts[PACKETS - 1] = b;
      solved = emitted(salts) === 0;
    }
  }
  assert(solved, 'two free final IVs must close the synthetic cycle');
  let previous = 17;
  const published = [];
  for (let b = 0; b < PACKETS; b++) {
    const salt = salts[b];
    previous = mod(previous + salt);
    published.push(previous);
    for (let col = 0; col < PLAIN; col++) {
      const plain = source[b].ranks[col];
      const step = plain === 28 ? 0
        : 1 + tables[salt * PLAIN + col][plain];
      previous = mod(previous + step);
      published.push(previous);
    }
  }
  assert.equal(previous, 17, 'published stream closes around the ring');
  const decoded = frames(published, 0);
  let recovered = 0, markers = 0;
  for (let block = 0; block < PACKETS; block++) {
    assert.equal(decoded[block].salt, salts[block]);
    for (let col = 0; col < PLAIN; col++) {
      const rank = decoded[block].ranks[col];
      let plain = 28;
      if (rank !== -1) {
        const table = tables[salts[block] * PLAIN + col];
        plain = table.indexOf(rank);
        assert(plain >= 0);
      } else markers++;
      assert.equal(plain, source[block].ranks[col]);
      recovered++;
    }
  }
  assert.equal(markers, 86);
  assert.equal(recovered, PACKETS * PLAIN);
  return {recovered, sourcePositions: PACKETS * PLAIN,
    markerPositions: markers, cycleClosed: true,
    sourceIOC: collision(source.map(p => ({
      salt: p.salt,
      ranks: p.ranks.map(x => x === 28 ? -1 : x)
    }))).ioc,
    exactForwardAndInverse: true};
}

/** @param {{salt:number,ranks:number[]}[]} packets @param {() => number} random */
function shuffleSalts(packets, random) {
  const salts = permutation(random, packets.length).map(i => packets[i].salt);
  return packets.map((p, i) => ({...p, salt: salts[i]}));
}
/** @param {{salt:number,ranks:number[]}[]} packets @param {() => number} random */
function rotatePayload(packets, random) {
  return packets.map(p => {
    const shift = random() % PLAIN;
    return {...p, ranks: p.ranks.slice(shift).concat(p.ranks.slice(0, shift))};
  });
}

/**
 * Family-wise calibration for the maximum over ALL 79 candidate starts.
 * Every null preserves each original physical page's rune multiset and
 * within-page cyclical adjacency; line, word and global packet coordinates
 * are randomized. This tests whether the postselected phase35 maximum alone
 * establishes a distinguished 79-clock.
 *
 * @param {number} draws
 */
function phaseFamilywise(draws = 150) {
  const pages = corpus.pages.filter(p => p.page < 56 && p.indices.length)
    .map(p => p.indices);
  const rand = rng(0x26a07935);
  /**
   * Typed-array streaming implementation of collision(frames(seq,phase)).
   * @param {number[]} seq
   * @param {number} phase
   */
  function score(seq, phase) {
    const h = new Uint8Array(MOD * PLAIN * ALPHA);
    const n = new Uint8Array(MOD * PLAIN);
    let hits = 0, pairs = 0;
    for (let block = 0; block < PACKETS; block++) {
      const start = (phase + WIDTH * block) % original.length;
      const salt = mod(seq[start] - seq[(start + original.length - 1) % original.length]);
      for (let k = 1; k <= PLAIN; k++) {
        const current = seq[(start + k) % original.length];
        const previous = seq[(start + k - 1) % original.length];
        const step = mod(current - previous);
        if (!step) continue;
        const state = salt * PLAIN + k - 1;
        const cell = state * ALPHA + step - 1;
        hits += 2 * h[cell]++;
        pairs += 2 * n[state]++;
      }
    }
    return hits / pairs;
  }
  const observedMaximum = Math.max(...Array.from({length: WIDTH},
    (_, phase) => score(original, phase)));
  assert.equal(observedMaximum, 2916 / 75548);
  let exceeded = 0, sum = 0, maxNull = -Infinity;
  for (let trial = 0; trial < draws; trial++) {
    const surrogate = pages.flatMap(page => {
      const rotate = rand() % page.length;
      return page.slice(rotate).concat(page.slice(0, rotate));
    });
    let maximum = -Infinity;
    for (let phase = 0; phase < WIDTH; phase++)
      maximum = Math.max(maximum, score(surrogate, phase));
    sum += maximum;
    exceeded += Number(maximum >= observedMaximum);
    maxNull = Math.max(maxNull, maximum);
  }
  if (draws === 150) assert.equal(exceeded, 19);
  return {seed:'0x26a07935',draws,observedMaximum,
    nullMeanMaximum:sum/draws,exceedances:exceeded,
    addOneFamilywiseP:(exceeded+1)/(draws+1),maxNull,
    null:'Independent circular rotation of each whole original physical rune-page; maximum over all 79 phases refitted every trial'};
}

/**
 * Stronger direct-language invariants for the source-motivated 4×41×79
 * lattice. Every model allows a completely independent unknown 28! table per
 * (public salt, position, quarter OR modulo-41 packet lane). Equality under
 * each table remains key-free.
 *
 * @param {{salt:number,ranks:number[]}[]} packets
 * @param {number[]} english
 * @param {number[]} latin
 */
function latticeGate(packets, english, latin) {
  const masks = packets.map(p => p.ranks.map(v => v < 0));
  const random = rng(0x26417935);
  const configurations = [
    {label:'4 separate 41-packet quarters',group:i=>Math.floor(i/41)},
    {label:'41 equal packet lanes across four quarters',group:i=>i%41}
  ];
  const sourceWords = {english, latin};
  const out = [];
  for (const config of configurations) {
    const pairs = [];
    for (let i = 0; i < PACKETS; i++) for (let j = i+1; j < PACKETS; j++)
      if (config.group(i) === config.group(j) &&
          packets[i].salt === packets[j].salt) pairs.push([i,j]);
    /**
     * @param {number[][]} values
     */
    function count(values) {
      let hits = 0, total = 0;
      for (const [i,j] of pairs)
        for (let k = 0; k < PLAIN; k++) {
          const a = values[i][k], b = values[j][k];
          if (a < 0 || b < 0) continue;
          total++;
          hits += Number(a === b);
        }
      return {hits,total,ioc:hits/total};
    }
    const observed = count(packets.map(p => p.ranks));
    assert(observed.total > 0);
    const source = {};
    for (const [name, reference] of Object.entries(sourceWords)) {
      let below = 0, min = Infinity, max = -Infinity, sum = 0;
      for (let trial = 0; trial < 1000; trial++) {
        const candidate = masks.map(row => row.map(marked =>
          marked ? -1 : reference[random() % reference.length]));
        const stat = count(candidate).ioc;
        min = Math.min(min, stat);
        max = Math.max(max, stat);
        sum += stat;
        below += Number(stat <= observed.ioc);
      }
      source[name] = {draws:1000,mean:sum/1000,min,max,
        belowOrEqual:below,addOneLowerP:(below+1)/1001};
    }
    out.push({group:config.label,observed,source,
      sourcePairs: pairs.length,
      invariant:'Same-(salt,column,packet-group) ciphertext rank equality is exactly unchanged by any fixed secret permutation for that public state'});
  }
  assert.equal(out[0].observed.hits,386);
  assert.equal(out[0].observed.total,10640);
  assert.equal(out[1].observed.hits,19);
  assert.equal(out[1].observed.total,688);
  return out;
}

function main() {
  const packets = frames(original, PHASE);
  assert(packets.every(p => p.salt > 0));
  const markers = packets.flatMap(p => p.ranks).filter(v => v === -1).length;
  assert.equal(markers, 86);
  const distribution = Array(5).fill(0);
  for (const packet of packets) distribution[packet.ranks.filter(x => x < 0).length]++;
  assert.deepEqual(distribution, [95, 54, 13, 2, 0]);

  const phaseScores = Array.from({length: WIDTH}, (_, phase) => {
    const pp = frames(original, phase);
    return {phase, nonzeroSalt: pp.every(p => p.salt !== 0),
      ...collision(pp)};
  });
  assert.equal(phaseScores.reduce((best, next) =>
    next.ioc > best.ioc ? next : best).phase, PHASE);
  const seen = collision(packets);
  const cross = collision(packets, true);
  assert.equal(seen.hits, 2916);
  assert.equal(seen.pairs, 75548);
  assert.equal(cross.hits, 662);
  assert.equal(cross.pairs, 16776);

  const shakespeare = read('resources/control/shakespeare_first300k.txt')
    .toUpperCase().match(/[A-Z]+/g).flatMap(encode).filter(x => x < ALPHA);
  const latin = JSON.parse(read('resources/control/latin-vulgate-heldout-gp.json'))
    .runes.filter(x => x < ALPHA);
  assert(shakespeare.length > 200000 && latin.length > 2000);
  const random = rng(0x26793526);
  const sample = (reference) => packets.flatMap(p =>
    p.ranks.map(v => v === -1 ? 28 : reference[random() % reference.length]));
  const positives = [];
  let minEnglish = Infinity, maxEnglish = -Infinity;
  let minLatin = Infinity, maxLatin = -Infinity;
  for (let i = 0; i < 1000; i++) {
    for (const [reference, isLatin] of [[shakespeare, false], [latin, true]]) {
      const plain = sample(reference);
      const imitation = packets.map((p, b) => ({
        salt: p.salt,
        ranks: plain.slice(b * PLAIN, (b + 1) * PLAIN)
          .map(v => v === 28 ? -1 : v)
      }));
      const value = collision(imitation).ioc;
      if (isLatin) {minLatin = Math.min(minLatin, value);
        maxLatin = Math.max(maxLatin, value);}
      else {minEnglish = Math.min(minEnglish, value);
        maxEnglish = Math.max(maxEnglish, value);}
    }
  }
  const planted = positiveControl(packets, sample(shakespeare), random);
  const lattice = latticeGate(packets,shakespeare,latin);
  // Matched original-marker, packet-inventory and salt-label randomization.
  let saltAtLeast = 0, rotateAtLeast = 0;
  let saltMean = 0, rotateMean = 0;
  let crossSaltAtLeast = 0, crossRotateAtLeast = 0;
  for (let i = 0; i < 5000; i++) {
    const shuffled = shuffleSalts(packets, random);
    const rotated = rotatePayload(packets, random);
    const a = collision(shuffled), b = collision(rotated);
    saltMean += a.ioc;
    rotateMean += b.ioc;
    saltAtLeast += Number(a.ioc >= seen.ioc);
    rotateAtLeast += Number(b.ioc >= seen.ioc);
    crossSaltAtLeast += Number(collision(shuffled, true).ioc >= cross.ioc);
    crossRotateAtLeast += Number(collision(rotated, true).ioc >= cross.ioc);
  }
  const p = hits => (hits + 1) / 5001;
  const familywise = phaseFamilywise();
  const result = {
    familywise,
    lattice,
    model: 'Cyclic 164x79 packets, one published salt, 78 EA-or-28-rank payload slots per packet',
    claim: 'Conditional key-independent exclusion of arbitrary fixed salt-and-column 28-permutations for native GP registers; no unknown plaintext or authentic key',
    phase: PHASE, sourceRunes: original.length, packetCount: PACKETS,
    sourceDerived: '79 from LP2 p15 Fibonacci-prime clue; phase35 previously sole viable radix-packet orientation, still postselected',
    markers, markersPerPacket: distribution,
    nonrepeatPacketSalts: 164,
    phase35IsMaximumOfAll79: true,
    phaseBest: phaseScores.slice().sort((a, b) => b.ioc - a.ioc).slice(0, 3),
    original: seen, crossHalf: cross,
    reference: {shakespeareNonEA: shakespeare.length, latinNonEA: latin.length,
      drawsEach: 1000, shakespeareIOC: [minEnglish, maxEnglish],
      latinIOC: [minLatin, maxLatin]},
    plant: planted,
    null: {trials: 5000, seed: '0x26793526',
      saltPermutation: {mean: saltMean / 5000, exceed: saltAtLeast,
        addOneP: p(saltAtLeast), crossExceed: crossSaltAtLeast,
        crossAddOneP: p(crossSaltAtLeast)},
      independentPacketRotation: {mean: rotateMean / 5000,
        exceed: rotateAtLeast, addOneP: p(rotateAtLeast),
        crossExceed: crossRotateAtLeast,
        crossAddOneP: p(crossRotateAtLeast)}},
    caveats: 'The original 79 packet/EA role and any native GP register are unverified. A nonstationary or hidden-state source, multiple keys within a public row, transpositions, and binary content remain open.'
  };
  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  return result;
}
if (require.main === module) main();
module.exports = {frames, collision, positiveControl, phaseFamilywise, latticeGate, main};
