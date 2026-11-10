'use strict';
/**
 * Source-aligned 58 GP radix-29 symbols -> 59 predecessor-excluded radix-28
 * digits: exact original-cipher necessary-condition test.
 *
 * The reported 59-rune sections in the 2016 message motivate the *test*, not the cipher.
 * On a clean 59-output packet, its base-28 integer must be < 29^78.
 * This places an unconditional ceiling on the most significant digit.
 *
 * Test every unknown fixed cyclic rune ordering with a complete finite-domain CSP.
 * Repeated-rune packets are conservatively ignored as damaged/escape packets.
 * A bounded search reports "unknown", never an unsupported exclusion.
 *
 * Node 22, CommonJS, original canonical LP2 numeric corpus.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ALPHABET = 29;
const CIPHER_BLOCK = 59;
const PLAIN_BLOCK = 58;
const LIMIT = 29n ** 58n;
const BASE = 28n;
const LEADING_MAX = Number((LIMIT - 1n) / (BASE ** 58n));
const MAX_FORWARD_DISTANCE = LEADING_MAX + 1;
const ALL = (1 << ALPHABET) - 1;
assert.equal(LEADING_MAX, 7);
assert.equal(MAX_FORWARD_DISTANCE, 8);

const FORWARD = Array.from({length: ALPHABET}, (_, p) => {
  let mask = 0;
  for (let step = 1; step <= MAX_FORWARD_DISTANCE; step++) {
    mask |= 1 << ((p + step) % ALPHABET);
  }
  return mask;
});
const BACKWARD = Array.from({length: ALPHABET}, (_, p) => {
  let mask = 0;
  for (let step = 1; step <= MAX_FORWARD_DISTANCE; step++) {
    mask |= 1 << ((p - step + ALPHABET) % ALPHABET);
  }
  return mask;
});

/** @param {number} mask @returns {number} */
function population(mask) {
  let count = 0;
  while (mask) { mask &= mask - 1; count++; }
  return count;
}

/** @param {number} mask @returns {Generator<number>} */
function* bits(mask) {
  while (mask) {
    const bit = mask & -mask;
    yield 31 - Math.clz32(bit);
    mask -= bit;
  }
}

/** @returns {number[]} */
function original() {
  const file = path.join(__dirname, '..', 'resources', 'liber-primus',
    'lp2-corpus.json');
  const corpus = JSON.parse(fs.readFileSync(file, 'utf8'));
  const sequence = corpus.pages.filter(p => p.page < 56).flatMap(p => p.indices);
  assert.equal(sequence.length, 12956);
  assert.equal(Math.floor(sequence.length / CIPHER_BLOCK), 219);
  assert.equal(sequence.length % CIPHER_BLOCK, 35);
  assert(sequence.every(x => Number.isInteger(x) && x >= 0 && x < ALPHABET));
  return sequence;
}

/**
 * Exclude any packet with an immediately repeated rune, including at its
 * first position, and exclude a packet starting at physical cipher offset 0
 * because the predecessor is not published.
 * @param {number[]} cipher
 * @param {number} phase
 * @returns {number[]}
 */
function cleanStarts(cipher, phase) {
  const starts = [];
  for (let start = phase; start + CIPHER_BLOCK <= cipher.length;
    start += CIPHER_BLOCK) {
    if (start === 0) continue;
    let clean = true;
    for (let i = start; i < start + CIPHER_BLOCK; i++) {
      if (cipher[i] === cipher[i - 1]) { clean = false; break; }
    }
    if (clean) starts.push(start);
  }
  return starts;
}

/**
 * @param {number[]} cipher
 * @param {number[]} starts
 * @param {'forward'|'reverse'} direction
 * @returns {number[][]}
 */
function leadingEdges(cipher, starts, direction) {
  const at = direction === 'forward' ? 0 : CIPHER_BLOCK - 1;
  return starts.map(start => [cipher[start + at - 1], cipher[start + at]]);
}

/** @param {number[]} cipher @param {number[]} starts */
function literalPacketChecks(cipher, starts) {
  const stats = [];
  for (const mode of ['cyclic', 'sorted']) {
    for (const orientation of ['forward', 'reverse']) {
      let valid = 0;
      for (const start of starts) {
        const digits = [];
        for (let j = start; j < start + CIPHER_BLOCK; j++) {
          const before = cipher[j - 1], after = cipher[j];
          const rank = mode === 'cyclic'
            ? (after - before + ALPHABET - 1) % ALPHABET
            : after - Number(after > before);
          assert(rank >= 0 && rank < 28);
          digits.push(rank);
        }
        if (orientation === 'reverse') digits.reverse();
        let value = 0n;
        for (const digit of digits) value = value * BASE + BigInt(digit);
        valid += Number(value < LIMIT);
      }
      stats.push({mode, orientation, valid, invalid: starts.length - valid});
    }
  }
  return stats;
}

/**
 * Every ordering must give the first of a valid 59-digit block radix-28
 * digit <=15. Sorted exclusion rank(d) <=15 can only involve 17 of the
 * 29 glyph labels, regardless of which 29! fixed order was chosen.
 * @param {number[][]} edges
 */
function sortedOrderingGate(edges) {
  const distinct = new Set(edges.map(edge => edge[1])).size;
  return {distinct_leading_glyphs: distinct, maximum_allowed: LEADING_MAX + 2,
    excluded: distinct > LEADING_MAX + 2};
}

/**
 * Complete finite-domain search over all 29! fixed cyclic rune orders,
 * modulo the harmless global rotation that fixes rune 0 at position 0.
 * For each edge prev->current require modular order distance in 1..16.
 *
 * Arc consistency and all-different singleton propagation prune branches;
 * depth-first branching exhausts the remaining assignments. This is
 * deterministic, with no random seeds or heuristic statistical p-values.
 *
 * @param {number[][]} input
 * @param {number} [maxNodes=1000000]
 * @returns {{status:string,nodes:number,unique_edges:number,witness:number[]|null}}
 */
function cyclicOrderingGate(input, maxNodes = 1000000) {
  const edges = [...new Set(input.map(pair => pair.join(',')))]
    .map(value => value.split(',').map(Number));
  const degree = Array(ALPHABET).fill(0);
  for (const [a, b] of edges) { degree[a]++; degree[b]++; }
  let nodes = 0, capped = false;

  /** @param {number[]} domains @returns {number[]|null} */
  function propagate(domains) {
    let changed = true;
    while (changed) {
      changed = false;
      let singles = 0;
      for (const domain of domains) {
        if (!domain) return null;
        if (!(domain & (domain - 1))) {
          if (singles & domain) return null;
          singles |= domain;
        }
      }
      for (let i = 0; i < ALPHABET; i++) {
        const domain = domains[i];
        if (domain & (domain - 1)) {
          const next = domain & ~singles;
          if (!next) return null;
          if (next !== domain) { domains[i] = next; changed = true; }
        }
      }
      for (const [a, b] of edges) {
        const da = domains[a], db = domains[b];
        let nextA = 0, nextB = 0;
        for (const value of bits(da)) {
          if (FORWARD[value] & db) nextA |= 1 << value;
        }
        if (!nextA) return null;
        for (const value of bits(db)) {
          if (BACKWARD[value] & nextA) nextB |= 1 << value;
        }
        if (!nextB) return null;
        if (nextA !== da) { domains[a] = nextA; changed = true; }
        if (nextB !== db) { domains[b] = nextB; changed = true; }
      }
    }
    return domains;
  }

  /** @param {number[]} domains @returns {number[]|null} */
  function search(domains) {
    nodes++;
    if (nodes > maxNodes) { capped = true; return null; }
    domains = propagate(domains);
    if (!domains) return null;
    let selected = -1, minimum = ALPHABET + 1, bestDegree = -1;
    for (let i = 0; i < ALPHABET; i++) {
      const options = population(domains[i]);
      if (options > 1 && (options < minimum ||
        (options === minimum && degree[i] > bestDegree))) {
        selected = i;
        minimum = options;
        bestDegree = degree[i];
      }
    }
    if (selected < 0) return domains;
    for (const position of bits(domains[selected])) {
      const branch = domains.slice();
      branch[selected] = 1 << position;
      const found = search(branch);
      if (found) return found;
      if (capped) return null;
    }
    return null;
  }

  const initial = Array(ALPHABET).fill(ALL);
  initial[0] = 1;
  const solution = search(initial);
  const witness = solution?.map(domain => [...bits(domain)][0]) ?? null;
  if (witness) {
    assert.equal(new Set(witness).size, ALPHABET);
    assert.equal(witness[0], 0);
    for (const [a, b] of edges) {
      const distance = (witness[b] - witness[a] + ALPHABET) % ALPHABET;
      assert(distance >= 1 && distance <= MAX_FORWARD_DISTANCE);
    }
  }
  return {status: solution ? 'SAT' : capped ? 'UNKNOWN' : 'UNSAT',
    nodes, unique_edges: edges.length, witness};
}

/** @param {number} seed */
function rng(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}

/**
 * Blindly test exact packet and transition inverses on a hidden fixed cyclic
 * ordering and generated base-29 plaintext. The SAT solver must recognize
 * that at least one unknown alphabet exists.
 */
function positiveControl() {
  const next = rng(0x33017978);
  const order = Array.from({length: ALPHABET}, (_, i) => i);
  for (let i = 28; i > 0; i--) {
    const j = next() % (i + 1);
    [order[i], order[j]] = [order[j], order[i]];
  }
  const inverse = Array(29);
  for (let i = 0; i < 29; i++) inverse[order[i]] = i;
  const plaintext = [], ciphertext = [];
  let previous = 17;
  for (let block = 0; block < 24; block++) {
    const source = Array.from({length: PLAIN_BLOCK}, () => next() % ALPHABET);
    plaintext.push(source);
    let value = 0n;
    for (const digit of source) value = 29n * value + BigInt(digit);
    const digits = Array(CIPHER_BLOCK).fill(0);
    for (let i = CIPHER_BLOCK - 1; i >= 0; i--) {
      digits[i] = Number(value % 28n);
      value /= 28n;
    }
    assert.equal(value, 0n);
    let packed = 0n;
    for (const digit of digits) {
      packed = packed * BASE + BigInt(digit);
      const rank = (order[previous] + digit + 1) % ALPHABET;
      previous = inverse[rank];
      ciphertext.push(previous);
    }
    assert(packed < LIMIT);
  }
  let predecessor = 17, exact = 0;
  for (let i = 0; i < 24; i++) {
    let integer = 0n;
    for (let j = 0; j < CIPHER_BLOCK; j++) {
      const current = ciphertext[i*CIPHER_BLOCK+j];
      const digit = (order[current] - order[predecessor] + 28) % ALPHABET;
      assert(digit >= 0 && digit < 28);
      integer = integer * BASE + BigInt(digit);
      predecessor = current;
    }
    const recovered = Array(PLAIN_BLOCK);
    for (let j = PLAIN_BLOCK - 1; j >= 0; j--) {
      recovered[j] = Number(integer % 29n);
      integer /= 29n;
    }
    assert.equal(integer, 0n);
    assert.deepEqual(recovered, plaintext[i]);
    exact += recovered.length;
  }
  const starts = cleanStarts(ciphertext, 0);
  const gate = cyclicOrderingGate(leadingEdges(ciphertext, starts, 'forward'));
  assert.equal(starts.length, 23);
  assert.equal(gate.status, 'SAT');
  return {synthetic_blocks: 24, exact_recovered_plaintext_runes: exact,
    secret_order_hidden_from_solver: true, blind_gate: gate.status,
    solver_nodes: gate.nodes};
}

/**
 * @param {{phaseStart?:number,phaseEnd?:number,maxNodes?:number}} [options]
 */
function run(options = {}) {
  const source = original();
  const {phaseStart = 0, phaseEnd = 0, maxNodes = 1000000} = options;
  assert(Number.isInteger(phaseStart) && phaseStart >= 0 && phaseStart <= 78);
  assert(Number.isInteger(phaseEnd) && phaseEnd >= phaseStart && phaseEnd <= 58);
  const positive = positiveControl();
  const cases = [];
  for (let phase = phaseStart; phase <= phaseEnd; phase++) {
    const starts = cleanStarts(source, phase);
    const directions = {};
    for (const direction of ['forward', 'reverse']) {
      const edges = leadingEdges(source, starts, direction);
      directions[direction] = {
        sorted: sortedOrderingGate(edges),
        cyclic: cyclicOrderingGate(edges, maxNodes),
      };
    }
    cases.push({phase, clean_packets: starts.length,
      direct: phase === 0 ? literalPacketChecks(source, starts) : undefined,
      directions});
  }
  if (phaseStart === 0) {
    assert.equal(cases[0].clean_packets, 95);
    assert.equal(cases[0].directions.forward.sorted.distinct_leading_glyphs, 28);
    assert.equal(cases[0].directions.reverse.sorted.distinct_leading_glyphs, 29);
    assert.equal(cases[0].directions.forward.cyclic.status, 'UNSAT');
    assert.equal(cases[0].directions.reverse.cyclic.status, 'UNSAT');
  }
  return {
    source: 'canonical 55 rune-bearing original LP2 pages',
    original_runes: source.length,
    aligned_79_digit_packets: source.length / 79,
    radix29_plaintext_digits_per_packet: 78,
    maximum_permitted_leading_radix28_digit: LEADING_MAX,
    erasures: 'Discard entire 59-output packet if any adjacent glyph repeats; first packet has unknown predecessor',
    positive, cases,
    interpretations: 'UNSAT excludes the specified fixed-rune-order 78-to-79 numeric packing; UNKNOWN means an explicit solver cap was reached. No LP2 plaintext/key recovered.',
  };
}

if (require.main === module && process.env.PREFIX_TWO_DIGIT !== '1') {
  const phaseStart = Number(process.env.PHASE_START ?? '0');
  const phaseEnd = Number(process.env.PHASE_END ?? '0');
  process.stdout.write(JSON.stringify(run({phaseStart, phaseEnd}), null, 2) + '\n');
}
module.exports = {run, cleanStarts, leadingEdges, literalPacketChecks,
  sortedOrderingGate, cyclicOrderingGate, positiveControl};


/**
 * Strengthened source-linked 78->79 radix capacity gate: because the radix-28
 * digits of 29^78 - 1 begin 15,12, a clean packet must have leading digit
 * <=15, and if it equals 15 then its second digit must be <=12.
 *
 * Unknown cyclic rune ordering is handled by exact finite-domain search.
 * This is a necessary ciphertext-only constraint, not a language decode.
 */
const PREFIX_TWO_LIMIT = (() => {
  const out = Array(59).fill(0);
  let n = 29n ** 58n - 1n;
  for (let i = 58; i >= 0; i--) { out[i] = Number(n % 28n); n /= 28n; }
  assert.deepEqual(out.slice(0, 2), [7, 18]);
  return out;
})();
const P2_FORWARD19 = Array.from({length: ALPHABET}, (_, p) => {
  let mask = 0;
  for (let j = 1; j <= 19; j++) mask |= 1 << ((p + j) % ALPHABET);
  return mask;
});
const P2_BACK19 = Array.from({length: ALPHABET}, (_, p) => {
  let mask = 0;
  for (let j = 1; j <= 19; j++) mask |= 1 << ((p - j + ALPHABET) % ALPHABET);
  return mask;
});
/**
 * @param {number[]} cipher
 * @param {number[]} starts
 * @param {'forward'|'reverse'} direction
 * @returns {number[][]} Each triple is (leading edge source, target, third glyph).
 */
function prefixTwoDigitTriples(cipher, starts, direction) {
  return starts.map(st => direction === 'forward'
    ? [cipher[st - 1], cipher[st], cipher[st + 1]]
    : [cipher[st + 57], cipher[st + 58], cipher[st + 56]]);
}
/** @param {number[]} permutation @param {number[]} triple @param {'forward'|'reverse'} direction */
function prefixTwoDigitValid(permutation, triple, direction) {
  const [a, b, c] = triple;
  const lead = (permutation[b] - permutation[a] + 28) % 29;
  const next = direction === 'forward'
    ? (permutation[c] - permutation[b] + 28) % 29
    : (permutation[a] - permutation[c] + 28) % 29;
  return lead < 7 || (lead === 7 && next <= 18);
}
/**
 * Exact all-different / three-variable arc-consistent permutation solver.
 * Every removed glyph-position value lacks support for one necessary
 * 2-digit original-cipher constraint; UNSAT is a finite-domain certificate.
 * @param {number[][]} input
 * @param {'forward'|'reverse'} direction
 * @param {number} maxNodes
 * @returns {{status:string,nodes:number,triples:number,witness:number[]|null}}
 */
function prefixTwoDigitGate(input, direction, maxNodes = 100000, candidateVisitor = null) {
  const triples = [...new Set(input.map(triple => triple.join(',')))]
    .map(s => s.split(',').map(Number));
  const degree = Array(ALPHABET).fill(0);
  for (const [a, b, c] of triples) { degree[a]++; degree[b]++; degree[c]++; }
  let nodes = 0, capped = false;
  /** @param {number[]} domains @returns {number[]|null} */
  function propagate(domains) {
    let changed = true;
    while (changed) {
      changed = false;
      let singletonValues = 0;
      for (const d of domains) {
        if (!d) return null;
        if (!(d & (d - 1))) {
          if (singletonValues & d) return null;
          singletonValues |= d;
        }
      }
      for (let i = 0; i < ALPHABET; i++) {
        if (!(domains[i] & (domains[i] - 1))) continue;
        const next = domains[i] & ~singletonValues;
        if (!next) return null;
        if (next !== domains[i]) { domains[i] = next; changed = true; }
      }
      for (const [a, b, c] of triples) {
        let allowedA = 0, allowedB = 0, allowedC = 0;
        for (const x of bits(domains[a])) {
          for (const y of bits(domains[b] & FORWARD[x])) {
            const distance = (y - x + ALPHABET) % ALPHABET;
            let zDomain = domains[c] & (distance === 8
              ? direction === 'forward' ? P2_FORWARD19[y] : P2_BACK19[x]
              : ALL);
            zDomain &= c === a ? 1 << x : ~(1 << x);
            zDomain &= c === b ? 1 << y : ~(1 << y);
            if (!zDomain) continue;
            allowedA |= 1 << x;
            allowedB |= 1 << y;
            allowedC |= zDomain;
          }
        }
        if (!allowedA || !allowedB || !allowedC) return null;
        for (const [rune, allowed] of [[a, allowedA], [b, allowedB], [c, allowedC]]) {
          const next = domains[rune] & allowed;
          if (!next) return null;
          if (next !== domains[rune]) { domains[rune] = next; changed = true; }
        }
      }
    }
    return domains;
  }
  /** @param {number[]} domains @returns {number[]|null} */
  function solve(domains) {
    nodes++;
    if (nodes > maxNodes) { capped = true; return null; }
    domains = propagate(domains);
    if (!domains) return null;
    let selected = -1, fewest = ALPHABET + 1, largestDegree = -1;
    for (let i = 0; i < ALPHABET; i++) {
      const count = population(domains[i]);
      if (count > 1 && (count < fewest ||
        (count === fewest && degree[i] > largestDegree))) {
        selected = i; fewest = count; largestDegree = degree[i];
      }
    }
    if (selected === -1) {
      const candidate = domains.map(mask => [...bits(mask)][0]);
      assert.equal(new Set(candidate).size, ALPHABET);
      for (const triple of triples)
        assert(prefixTwoDigitValid(candidate, triple, direction));
      if (candidateVisitor && !candidateVisitor(candidate)) return null;
      return candidate;
    }
    for (const pos of bits(domains[selected])) {
      const branch = domains.slice();
      branch[selected] = 1 << pos;
      const candidate = solve(branch);
      if (candidate) return candidate;
      if (capped) return null;
    }
    return null;
  }
  const init = Array(ALPHABET).fill(ALL);
  init[0] = 1; // remove cyclic rotation equivalence
  const witness = solve(init);
  return {status: witness ? 'SAT' : capped ? 'UNKNOWN' : 'UNSAT',
    nodes, triples: triples.length, witness};
}

/** Every 2-digit SAT witness is also checked against the full packet bound. */
function prefixTwoFullPacketCheck(cipher, starts, direction, witness) {
  let valid = 0, invalid = 0;
  const frequencies = Array(29).fill(0);
  for (const st of starts) {
    const digits = [];
    for (let j = st; j < st + 59; j++)
      digits.push((witness[cipher[j]] - witness[cipher[j - 1]] + 28) % 29);
    if (direction === 'reverse') digits.reverse();
    let value = 0n;
    for (const digit of digits) value = value * 28n + BigInt(digit);
    if (value >= 29n ** 58n) { invalid++; continue; }
    valid++;
    for (let j = 0; j < 58; j++) {
      frequencies[Number(value % 29n)]++;
      value /= 29n;
    }
    assert.equal(value, 0n);
  }
  const length = frequencies.reduce((a,b)=>a+b,0);
  const ioc = length > 1
    ? frequencies.reduce((s,n)=>s+n*(n-1),0)/(length*(length-1)) : null;
  return {valid, invalid, decodedRunes:length, decodedGpIoc:ioc};
}
function prefixTwoPositive() {
  let seed = 0x79287829;
  const rng = () => {
    seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5;
    return seed >>> 0;
  };
  const permutation = Array.from({length:29}, (_, i) => i);
  for (let i = 28; i > 0; i--) {
    const j = rng() % (i + 1);
    [permutation[i], permutation[j]] = [permutation[j], permutation[i]];
  }
  const inverse = [];
  for (let i = 0; i < 29; i++) inverse[permutation[i]] = i;
  const encoded = [];
  let previous = 7;
  for (let block = 0; block < 12; block++) {
    let integer = 0n;
    for (let i = 0; i < 58; i++) integer = integer * 29n + BigInt(rng() % 29);
    const digits = Array(59);
    for (let i = 58; i >= 0; i--) {
      digits[i] = Number(integer % 28n);
      integer /= 28n;
    }
    assert.equal(integer, 0n);
    for (const digit of digits) {
      previous = inverse[(permutation[previous] + digit + 1) % 29];
      encoded.push(previous);
    }
  }
  const starts = cleanStarts(encoded, 0);
  assert.equal(starts.length, 11);
  const triples = prefixTwoDigitTriples(encoded, starts, 'forward');
  assert(triples.every(t => prefixTwoDigitValid(permutation, t, 'forward')));
  const solved = prefixTwoDigitGate(triples, 'forward', 200000);
  assert.equal(solved.status, 'SAT');
  const decoded = prefixTwoFullPacketCheck(encoded, starts,
    'forward', permutation);
  assert.equal(decoded.valid, 11);
  assert.equal(decoded.invalid, 0);
  assert.equal(decoded.decodedRunes, 11*58);
  return {plantPackets:12, secretOrderSatisfiesEveryConstraint:true,
    exactCleanPackets:11, blindGate:solved.status};
}
function prefixTwoDigitOriginal(options = {}) {
  const {phaseStart=0, phaseEnd=58, maxNodes=100000,
    direction='both'} = options;
  assert(phaseStart >= 0 && phaseEnd >= phaseStart && phaseEnd <= 58);
  assert(['forward','reverse','both'].includes(direction));
  const plant = prefixTwoPositive();
  const cipher = original();
  const cases = [];
  for (let phase = phaseStart; phase <= phaseEnd; phase++) {
    const starts = cleanStarts(cipher, phase);
    const ways = direction === 'both' ? ['forward','reverse'] : [direction];
    for (const way of ways) {
      const constraints = prefixTwoDigitTriples(cipher, starts, way);
      const result = prefixTwoDigitGate(constraints, way, maxNodes);
      const checked = result.witness
        ? prefixTwoFullPacketCheck(cipher, starts, way, result.witness) : null;
      const record = {phase, direction:way, cleanPackets:starts.length,
        status:result.status, nodes:result.nodes,
        tripleConstraints:result.triples, fullPacketWitness:checked,
        witness:result.witness};
      cases.push(record);
      process.stdout.write('PREFIX_TWO_CASE '+JSON.stringify(record)+'\n');
    }
  }
  return {input:'12,956 original LP2 GP runes; 59/58 packet hypothesis', phaseStart, phaseEnd,
    searchNodeCap:maxNodes, plant, limitPrefix:PREFIX_TWO_LIMIT.slice(0,5),
    cases:cases.map(({witness,...rest})=>rest),
    caveat:'UNSAT excludes the fixed unknown cyclic alphabet under this packet origin. SAT is only a necessary 2-digit condition; witnesses do not recover original plaintext.'};
}
module.exports.prefixTwoDigitGate = prefixTwoDigitGate;
module.exports.prefixTwoDigitOriginal = prefixTwoDigitOriginal;
if (require.main === module && process.env.PREFIX_TWO_DIGIT === '1') {
  const options = {
    phaseStart:Number(process.env.PHASE_START ?? '0'),
    phaseEnd:Number(process.env.PHASE_END ?? '0'),
    maxNodes:Number(process.env.PREFIX_TWO_MAX_NODES ?? '100000'),
    direction:process.env.PREFIX_TWO_DIRECTION || 'both'
  };
  process.stdout.write('PREFIX_TWO_SUMMARY '+JSON.stringify(prefixTwoDigitOriginal(options))+'\n');
}
