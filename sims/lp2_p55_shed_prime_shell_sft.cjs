'use strict';

// SFT: the source-motivated p55 word circumferences / 43-rune prime core.
// Single-file, read-only, Node22, including a complete Pratt certificate.
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const gp = 'ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ';
const runeMap = new Map([...gp].map((c, i) => [c, i]));
const p55 = [
  'ᛝ-ᚫᛗᛁᚹ-ᛋᛒ-ᛉᛗ-ᛋᛇᚷᛞᚦᚫ-ᚠᛡᚪᛒᚳᚢ-ᚹᚱ-ᛒ/',
  'ᛠᚠᛉᛁᛗᚢᚳᛈᚻᛝᛚᛇ-ᛗᛋᛞᛡᛈᚠ-ᛒᚻᛇᚳ-/',
  'ᛇᛖ-ᛠᛖᛁᚷᛉᚷᛋ-ᛖᛋᛇᚦᚦᛖᛋ-ᚦᛟ-ᚳᛠᛁᛗ/',
  'ᚳᛉ-ᛞᛄᚢ-ᛒᛖᛁ.',
].join('\n');
const targetInside = 510043531279477768552291351270111060625364732293226050492113768n;
const targetOuter = 54546906948733185277568038540584540814742666891n;
const targetPrime = 63755441409934721069036418908763882578170591536653256311514221n;

// Each row certifies a prime p using a Lucas witness g, with the COMPLETE
// p-1 factorization in f. Every child factor appears earlier in this array,
// and 2 is the base case. This is an exact primality proof, not a probable-prime call.
const pratt = [{"p":"3","g":2,"f":[["2",1]]},{"p":"5","g":2,"f":[["2",2]]},{"p":"7","g":3,"f":[["2",1],["3",1]]},{"p":"11","g":2,"f":[["2",1],["5",1]]},{"p":"13","g":2,"f":[["2",2],["3",1]]},{"p":"17","g":3,"f":[["2",4]]},{"p":"19","g":2,"f":[["2",1],["3",2]]},{"p":"23","g":5,"f":[["2",1],["11",1]]},{"p":"29","g":2,"f":[["2",2],["7",1]]},{"p":"31","g":3,"f":[["2",1],["3",1],["5",1]]},{"p":"41","g":6,"f":[["2",3],["5",1]]},{"p":"43","g":3,"f":[["2",1],["3",1],["7",1]]},{"p":"53","g":2,"f":[["2",2],["13",1]]},{"p":"59","g":2,"f":[["2",1],["29",1]]},{"p":"73","g":5,"f":[["2",3],["3",2]]},{"p":"79","g":3,"f":[["2",1],["3",1],["13",1]]},{"p":"97","g":5,"f":[["2",5],["3",1]]},{"p":"103","g":5,"f":[["2",1],["3",1],["17",1]]},{"p":"127","g":3,"f":[["2",1],["3",2],["7",1]]},{"p":"173","g":2,"f":[["2",2],["43",1]]},{"p":"307","g":5,"f":[["2",1],["3",2],["17",1]]},{"p":"331","g":3,"f":[["2",1],["3",1],["5",1],["11",1]]},{"p":"509","g":2,"f":[["2",2],["127",1]]},{"p":"1039","g":3,"f":[["2",1],["3",1],["173",1]]},{"p":"1229","g":2,"f":[["2",2],["307",1]]},{"p":"2459","g":2,"f":[["2",1],["1229",1]]},{"p":"2969","g":3,"f":[["2",3],["7",1],["53",1]]},{"p":"6491","g":2,"f":[["2",1],["5",1],["11",1],["59",1]]},{"p":"22859","g":2,"f":[["2",1],["11",1],["1039",1]]},{"p":"24103","g":5,"f":[["2",1],["3",2],["13",1],["103",1]]},{"p":"49477","g":11,"f":[["2",2],["3",1],["7",1],["19",1],["31",1]]},{"p":"54973","g":14,"f":[["2",2],["3",3],["509",1]]},{"p":"2843059","g":2,"f":[["2",1],["3",1],["73",1],["6491",1]]},{"p":"9895141","g":2,"f":[["2",2],["3",2],["5",1],["54973",1]]},{"p":"11810471","g":7,"f":[["2",1],["5",1],["7",2],["24103",1]]},{"p":"15535963","g":3,"f":[["2",1],["3",5],["13",1],["2459",1]]},{"p":"1086563333","g":2,"f":[["2",2],["23",1],["11810471",1]]},{"p":"57589720621","g":6,"f":[["2",2],["3",1],["5",1],["97",1],["9895141",1]]},{"p":"23138363725031","g":7,"f":[["2",1],["5",1],["103",1],["331",1],["2969",1],["22859",1]]},{"p":"101149063843788281988908603592862658065019147521","g":11,"f":[["2",8],["3",5],["5",1],["79",1],["2843059",1],["1086563333",1],["57589720621",1],["23138363725031",1]]},{"p":"63755441409934721069036418908763882578170591536653256311514221","g":2,"f":[["2",2],["5",1],["41",1],["49477",1],["15535963",1],["101149063843788281988908603592862658065019147521",1]]}];

/** @param {string} originalPage */
function wordsInPage(originalPage) {
  return originalPage.replace(/[\r\/\n&$§123457]/g, '').split(/[-.]/g).filter(Boolean);
}

/** @param {string} rune */
function gp0(rune) {
  const n = runeMap.get(rune);
  assert.notEqual(n, undefined, 'Rune outside original GP alphabet');
  return n;
}

/** @param {number[]} digits */
function base29(digits) {
  return digits.reduce((acc, digit) => acc * 29n + BigInt(digit), 0n);
}

/** @param {bigint} a @param {bigint} exp @param {bigint} mod */
function powMod(a, exp, mod) {
  let ans = 1n;
  a %= mod;
  while (exp) {
    if (exp & 1n) ans = ans * a % mod;
    a = a * a % mod;
    exp >>= 1n;
  }
  return ans;
}

/** @param {bigint} p */
function verifyPrimalityCertificate(p) {
  const proven = new Set(['2']);
  for (const row of pratt) {
    const n = BigInt(row.p);
    const a = BigInt(row.g);
    let product = 1n;
    for (const [qText, exponent] of row.f) {
      assert.ok(proven.has(qText), 'Unproved prime factor ' + qText);
      const q = BigInt(qText);
      product *= q ** BigInt(exponent);
      assert.notEqual(powMod(a, (n - 1n) / q, n), 1n, 'Invalid Lucas witness for ' + row.p);
    }
    assert.equal(product, n - 1n, 'Incomplete p-1 factorization for ' + row.p);
    assert.equal(powMod(a, n - 1n, n), 1n, 'Fermat witness failed for ' + row.p);
    proven.add(row.p);
  }
  assert.ok(proven.has(p.toString()), 'Target missing from certificate');
  console.log('Lucas-Pratt proof: ' + proven.size + ' certified primes, target is 206 bits');
}

/** @param {string[]} completeWords */
function splitCoreShell(completeWords) {
  return {
    core: completeWords.flatMap(w => [...w].slice(1, -1).map(gp0)),
    shell: completeWords.flatMap(w => [gp0([...w][0]), gp0([...w].at(-1))]),
  };
}

/** Uniformish deterministic 32-bit shuffled-word null, with frozen seed. */
function mulberry(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6D2B79F5) >>> 0;
    let v = Math.imul(state ^ (state >>> 15), state | 1);
    v ^= v + Math.imul(v ^ (v >>> 7), v | 61);
    return (v ^ (v >>> 14)) >>> 0;
  };
}

/** @param {number[]} arr @param {() => number} rand */
function shuffle(arr, rand) {
  for (let k = arr.length - 1; k > 0; k--) {
    const j = rand() % (k + 1);
    [arr[k], arr[j]] = [arr[j], arr[k]];
  }
}

const fragments = wordsInPage(p55);
assert.deepEqual(fragments.map(w => [...w].length),
  [1, 4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3]);
assert.equal(fragments.join('').length, 76);
const complete = fragments.slice(1); // first one-rune fragment is the p54 carry
const { core, shell } = splitCoreShell(complete);
assert.equal(complete.length, 16);
assert.equal(core.length, 43);
assert.equal(shell.length, 32);
assert.equal(core.reduce((sum, n) => sum + n, 0), 576);

const coreInteger = base29(core);
const shellInteger = base29(shell);
assert.equal(coreInteger, targetInside);
assert.equal(shellInteger, targetOuter);
assert.equal(coreInteger % 16n, 8n);
assert.equal(shellInteger % 43n, 0n);
const prime = coreInteger / 8n;
assert.equal(prime, targetPrime);
verifyPrimalityCertificate(prime);
assert.ok(crypto.checkPrimeSync(prime, { checks: 24 }));
// Exact quadratic-character obstruction to transplanting old DH g=5, A=8.
assert.equal(prime % 8n, 5n);
assert.equal(powMod(5n, (prime - 1n) / 2n, prime), 1n);
assert.equal(powMod(8n, (prime - 1n) / 2n, prime), prime - 1n);
console.log('Direct historical DH g5/A8 transplant impossible by quadratic characters');
console.log('p55 76 original runes; 16 complete words; core43 shell32');
console.log('core N = ' + coreInteger);
console.log('outer E = ' + shellInteger);
console.log('N = 8 * certified prime ' + prime);
console.log('E % 43 = ' + (shellInteger % 43n));

for (const [name, digits] of [
  ['GP0 reverse', core.toReversed()],
  ['GP1 forward', core.map(x => x + 1)],
  ['GP1 reverse', core.toReversed().map(x => x + 1)],
]) {
  let n = base29(digits);
  let twos = 0;
  while (n && (n & 1n) === 0n) { n >>= 1n; twos++; }
  console.log(name + ' v2=' + twos + ' cofactorPrime=' + crypto.checkPrimeSync(n, { checks: 24 }));
}

const blocks = complete.map(w => splitCoreShell([w]));
const order = Array.from({ length: 16 }, (_, k) => k);
const rand = mulberry(0x3301A855);
const trials = 200000;
let shellHits = 0;
let coreHits = 0;
let jointHits = 0;
for (let t = 0; t < trials; t++) {
  shuffle(order, rand);
  const exterior = base29(order.flatMap(k => blocks[k].shell));
  const first = exterior % 43n === 0n;
  if (first) shellHits++;
  const middle = base29(order.flatMap(k => blocks[k].core));
  const second = middle % 16n === 8n && crypto.checkPrimeSync(middle / 8n, { checks: 16 });
  if (second) coreHits++;
  if (first && second) jointHits++;
}
console.log('200000 whole-word permutations, Mulberry32 seed=0x3301A855');
console.log('shell%43=' + shellHits + ' core8prime=' + coreHits + ' both=' + jointHits);
assert.ok(jointHits > 0 && jointHits < 100);

// When executed inside the repository, compare against original transcription
// and census all 57 rune-bearing pages with the exact same fragment-local rule.
const originalPath = path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-transcription.txt');
if (fs.existsSync(originalPath)) {
  const pages = fs.readFileSync(originalPath, 'utf8').split('%');
  assert.equal(pages.length, 57);
  assert.deepEqual(wordsInPage(pages[54]), fragments);
  const hits = [];
  for (let i = 0; i < pages.length; i++) {
    const digits = wordsInPage(pages[i])
      .flatMap(w => [...w].slice(1, -1).map(gp0));
    if (digits.length === 0) continue;
    let n = base29(digits);
    while (n && (n & 1n) === 0n) n >>= 1n;
    if (n > 1n && crypto.checkPrimeSync(n, { checks: 24 })) {
      hits.push(i < 50 ? i : i + 1);
    }
  }
  assert.deepEqual(hits, [55]);
  console.log('All 57 original physical pages, prime-cofactor hits: ' + hits);
} else {
  console.log('Only embedded original p55 checked; repository full corpus not mounted');
}
console.log('PASS: arithmetic signal and controls; no unknown-page plaintext or key claimed');
