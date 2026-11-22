'use strict';

// Read-only source-locked test of the p55 cicada / 13-17-year / base59-tree hypothesis.
// Run from repository root with Node 22:
//   node sims/lp2_p55_cicada_base59_perimeter_tree_sft.cjs

const assert = require('node:assert/strict');
const fs = require('node:fs');

const corpus = JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json', 'utf8'));
const grid = JSON.parse(fs.readFileSync('resources/liber-primus/base60-grid.json', 'utf8'));
const page = n => {
  const p = corpus.pages.find(x => x.page === n);
  assert.ok(p, 'missing physical page ' + n);
  return p.indices;
};
const p55 = page(55);
const p56 = page(56);
const p57 = page(57);
assert.deepEqual([p55.length, p56.length, p57.length], [76, 85, 95]);
assert.equal(p55.length + p56.length + p57.length, 256);
assert.equal(grid.rows.length, 32);
assert.ok(grid.rows.every(row => row.length === 8));

const wordLengths = [1, 4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3];
assert.equal(wordLengths.length, 17);
assert.equal(wordLengths.reduce((a, b) => a + b, 0), 76);

function decodeGrid(base, alphabet) {
  const tokens = grid.rows.flat();
  assert.equal(tokens.length, 256);
  const values = tokens.map(token => {
    assert.equal(token.length, 2);
    const hi = alphabet.indexOf(token[0]);
    const lo = alphabet.indexOf(token[1]);
    assert.ok(hi >= 0 && lo >= 0, 'unmapped table token ' + token);
    const value = hi * base + lo;
    assert.ok(value >= 0 && value < 256, 'table value outside address space');
    return value;
  });
  return values;
}

function cyclesOf(parent) {
  const done = new Uint8Array(256);
  const cycles = [];
  for (let start = 0; start < 256; start++) {
    if (done[start]) continue;
    const path = [];
    const position = new Map();
    let current = start;
    while (!done[current] && !position.has(current)) {
      position.set(current, path.length);
      path.push(current);
      current = parent[current];
    }
    if (position.has(current)) cycles.push(path.slice(position.get(current)));
    for (const node of path) done[node] = 1;
  }
  return cycles;
}

function phi(n) {
  let result = n;
  for (let p = 2; p * p <= n; p++) {
    if (n % p === 0) {
      while (n % p === 0) n /= p;
      result -= result / p;
    }
  }
  if (n > 1) result -= result / n;
  return result;
}
function nthPrime(n) {
  const ps = [];
  for (let x = 2; ps.length < n; x++) {
    let prime = true;
    for (let d = 2; d * d <= x; d++) if (x % d === 0) { prime = false; break; }
    if (prime) ps.push(x);
  }
  return ps[n - 1];
}

const alphabet59 = grid.alphabet.replace('f', '');
assert.equal(grid.alphabet.length, 60);
assert.equal(alphabet59.length, 59);
assert.ok(!grid.rows.flat().some(token => token.includes('f')));
assert.equal(nthPrime(17), 59);
assert.equal(nthPrime(13), 41);
assert.equal(phi(13), 12);

const parent59 = decodeGrid(59, alphabet59);
const cycles59 = cyclesOf(parent59);
assert.deepEqual(cycles59.map(x => x.length), [1]);
const root = cycles59[0][0];
assert.equal(root, 189);
assert.equal(parent59[root], root);
const rootToken = grid.rows.flat()[root];
assert.equal(rootToken, '3C');
assert.equal(3 * 59 + 12, root);
assert.equal(phi(13), 12);
assert.equal(root % 29, 15);
assert.equal(corpus.translit[15], 'S');

const children = Array.from({ length: 256 }, () => []);
for (let node = 0; node < 256; node++) {
  if (node !== root) children[parent59[node]].push(node);
}
for (const row of children) row.sort((a, b) => a - b);
const leafCount = children.filter(row => row.length === 0).length;
assert.equal(leafCount, 95);
assert.equal(256 - leafCount, 161);

const width = 8;
const height = 32;
const perimeter = [];
for (let col = 0; col < width; col++) perimeter.push(col);
for (let row = 1; row < height - 1; row++) perimeter.push(row * width + width - 1);
for (let col = width - 1; col >= 0; col--) perimeter.push((height - 1) * width + col);
for (let row = height - 2; row >= 1; row--) perimeter.push(row * width);
const perimeterSet = new Set(perimeter);
const interior = [];
for (let row = 1; row < height - 1; row++) {
  for (let col = 1; col < width - 1; col++) interior.push(row * width + col);
}
assert.equal(perimeter.length, 76);
assert.equal(interior.length, 180);

const interiorRune = {};
const knownInterior = [...p56, ...p57];
interior.forEach((cell, i) => { interiorRune[cell] = knownInterior[i]; });

const ancestorInfo = perimeter.map(cell => {
  let current = cell;
  let depth = 0;
  const seen = new Set();
  while (perimeterSet.has(current)) {
    assert.ok(!seen.has(current), 'perimeter path cycles before reaching interior');
    seen.add(current);
    current = parent59[current];
    depth++;
  }
  assert.ok(Object.hasOwn(interiorRune, current), 'first interior ancestor lacks a known rune');
  return { cell, depth, ancestor: current, key: interiorRune[current] };
});
const depthHistogram = ancestorInfo.reduce((out, x) => {
  out[x.depth] = (out[x.depth] || 0) + 1;
  return out;
}, {});
assert.deepEqual(depthHistogram, { '1': 54, '2': 16, '3': 5, '4': 1 });

const translit = values => values.map(value => corpus.translit[value]).join('');
const splitWords = values => {
  let offset = 0;
  return wordLengths.map(length => {
    const word = translit(values.slice(offset, offset + length));
    offset += length;
    return word;
  });
};

function directAncestorKey(sign, transparentF) {
  return ancestorInfo.map((entry, i) => {
    const cipher = p55[i];
    if (transparentF && cipher === 0) return 0;
    return (cipher + sign * entry.key + 2900) % 29;
  });
}
function recursiveParentAutokey(sign, transparentF) {
  const memo = { ...interiorRune };
  const visiting = new Set();
  function decrypt(node) {
    if (Object.hasOwn(memo, node)) return memo[node];
    assert.ok(!visiting.has(node), 'perimeter recursion encountered a cycle');
    visiting.add(node);
    const parentPlain = decrypt(parent59[node]);
    const cipher = p55[perimeter.indexOf(node)];
    const plain = transparentF && cipher === 0
      ? 0
      : (cipher + sign * parentPlain + 2900) % 29;
    memo[node] = plain;
    visiting.delete(node);
    return plain;
  }
  return perimeter.map(decrypt);
}

const directMinus = directAncestorKey(-1, false);
const directPlus = directAncestorKey(1, false);
const directMinusF = directAncestorKey(-1, true);
const directPlusF = directAncestorKey(1, true);
const recursiveMinus = recursiveParentAutokey(-1, false);
const recursivePlus = recursiveParentAutokey(1, false);
const recursiveMinusF = recursiveParentAutokey(-1, true);
const recursivePlusF = recursiveParentAutokey(1, true);

const expected = {
  directMinus: 'BNSUEPPGUJNGRCITOEGUXUNEAOEMEAIGEANGNOECNGJDUHTHYEXWOAEPAEAONCTHIEYDHAEWLEANGPEATDUUJNWMNBFA',
  directPlus: 'AEEODMAEBNGOEHMOHEODCWMELNOEAEPEOHUEXIIURJNGFUHOESEAHSIAPEAYEAEOAIASIEDRPOEEAYPHNLTDRMHEAMIOOEBWAE',
  directMinusF: 'BNSUEPPGUJNGRCITFGUXUNEAOEMFIGEANGNOECNGJDUHTHYEFWOAEPAEAONCTHIEYDHAEWLEANGPEATDUUJNWMNBFA',
  directPlusF: 'AEEODMAEBNGOEHMOHEODCFMELNOEAEPEOHFEXIIURJNGFUHOESEAHFIAPEAYEAEOAIASIEDRPOEEAYPHNLTDRMHEAMIOOEBWAE',
  recursiveMinus: 'MNSILPPGUJNGOECAETOEGJXUNEADMEAIGEAFNOECNGJDUHBYEXWOAEAEAEBONEATHAENGDHAEWLEANGUUTFUUPJIACNBFA',
  recursivePlus: 'THEODUUBNGOEHMODEONGCWMNLNOEAEPUHUEXILURJNGFUHOEPEAHSIAPEAIAEALAIAHITDTPOEEAYPHNITHDWMHXIAOEUOEBXAE',
  recursiveMinusF: 'MNSILPPGUJNGOECAETFGJXUNEADMFIGEAFNOECNGJDUHBYEFWOAEAEAEBONEATHAENGDHAEWLEANGUUTFUUPJIACNBFA',
  recursivePlusF: 'THEODUUBNGOEHMODEONGCFMNLNOEAEPUHFEXILURJNGFUHOEPEAHFIAPEAIAEALAIAHITDTPOEEAYPHNITHDWMHXIAOEUOEBXAE'
};
const actual = {
  directMinus: translit(directMinus),
  directPlus: translit(directPlus),
  directMinusF: translit(directMinusF),
  directPlusF: translit(directPlusF),
  recursiveMinus: translit(recursiveMinus),
  recursivePlus: translit(recursivePlus),
  recursiveMinusF: translit(recursiveMinusF),
  recursivePlusF: translit(recursivePlusF)
};
assert.deepEqual(actual, expected);

const cellRune = Array(256);
perimeter.forEach((cell, i) => { cellRune[cell] = p55[i]; });
interior.forEach((cell, i) => { cellRune[cell] = knownInterior[i]; });
const preorder = [];
const postorder = [];
const breadth = [];
function walkPre(node) {
  preorder.push(node);
  for (const child of children[node]) walkPre(child);
}
function walkPost(node) {
  for (const child of children[node]) walkPost(child);
  postorder.push(node);
}
walkPre(root);
walkPost(root);
const queue = [root];
for (let i = 0; i < queue.length; i++) {
  const node = queue[i];
  breadth.push(node);
  queue.push(...children[node]);
}
assert.deepEqual([preorder.length, postorder.length, breadth.length], [256, 256, 256]);
const inverse = Array(256);
preorder.forEach((node, position) => { inverse[node] = position; });
const treeOutputs = {
  preorder: translit(preorder.map(node => cellRune[node])),
  postorder: translit(postorder.map(node => cellRune[node])),
  breadth: translit(breadth.map(node => cellRune[node])),
  inversePermutation: translit(inverse.map(position => cellRune[position]))
};
const expectedTree = {
  preorder: 'WAERCRMDMRXHACUEDNEIAEEACHXIEARCGCEEAFIETHAETMSSOIXWRDEMUDITHAEOUFNEAIAECEOIAECAPAEIANGIAPJEGRSWEDNTHEAGAETHTNHXMRGNGXWESBGLJTHFOYEOTAEEODUTIATHAEAERXINFDSCAOEPFESBMCLNAEIPYCTITHSGOBULEOWFNGEMOSEYMUWDIJPAEAWCNFSNGUMIANGNUCUEUNJNGFBRTHDYTEODSIRESEMLFMEOSLSFEOECWRRBSILCENIUIRETHDUNODWNLNBOHACEFIGBTHW',
  postorder: 'MDRDNEUIAECAHXREMCRGCCEFIAEREAIXTHAETMEHCEAAESWXRIOUIDEANFIAUOEOPAPSRGDENWEJEAAENXXEGBSWNGGRTHJFOLMHYEOTTHAEEOTGTHDIATUNGIIAAEXACSAEINYPLTCCMBNGEFWEOOMLUOGSSTHIBEFPYEOESDJFNCMNGIANUCUUNGSWEAAPEIWUNUMDJBFNGFTHDRNIRAEISFMLMEFSLSEOEOESBRLCIURIDTHENEIRWCERSDEOTUONYDAETHALNWCNAHOBEAICEECAEFTHGWTHBIMEDSW',
  breadth: 'WAESSREAODCCIERMHXRMMDREXEWUDTHIXITHAETMIAEFGBHEAOECTHARUCEWCCEEFIAEOIUEGCANAEIAFIEAEDNCNBAAEAWOPIATHNHNGIAELAIAUAEYDPJTHDTRTUNEEAGXIEOOGWAETHTNDRENTAEEOFRSSDNHYEODJNGTHDIRXMSMFEERLCOEUBSEEOOECGJFOAPEWUNMSWNGTHFYDILLRXWEJPEFMSRIESSBAFBLCEBMIEASNGCTHWIELCSSCSURTHNPTGNNGIDAEIYOFUUUBUMIANCLNGEOMWOFNGE',
  inversePermutation: 'CUSEODUIYEAOETHEIJHNGEAITHJGSIACGAWADNLSFGNCIAXNEBINFMEMGRIUCAEWAESFWALAEWNEIAWAETHYAETDMLMHEUNWMIAPECLCNLFUNIFEOOWAEDHIEENGXEANEGCTLBFEEOIREENUOEOIONREXITHREARWEAYSDTUSRMFEAEIATHEOCDMDEAPXDJRWEUACOOEOETHRSIDBNSFBIMFXESNGRCUAUTHTHUXTBSYMEOESEBCLIJWDCTHIEMAEASMHNBIARNGRFSTCFTHUCGGTRCSREODOPAEPNGDPNG'
};
assert.deepEqual(treeOutputs, expectedTree);

const alphabet60 = grid.alphabet;
const parent60 = decodeGrid(60, alphabet60);
const cycles60 = cyclesOf(parent60).map(x => x.length).sort((a, b) => a - b);
assert.deepEqual(cycles60, [2, 11]);
assert.equal(parent60.some((value, index) => value === index), false);

console.log(JSON.stringify({
  classification: 'bounded negative for the tested tree-key and tree-transposition consumers; source-selection hypothesis remains provisional',
  cicadaNumbers: { period13: 13, period17: 17, prime13: 41, prime17: 59, phi13: 12 },
  base59: {
    root, rootToken, rootOneBasedRow: Math.floor(root / 8) + 1,
    rootOneBasedColumn: (root % 8) + 1,
    rootModulo29: root % 29,
    rootRune: corpus.translit[root % 29],
    leafCount, internalCount: 256 - leafCount,
    perimeter: perimeter.length, interior: interior.length,
    perimeterDepthHistogram: depthHistogram
  },
  base60CycleLengths: cycles60,
  p55: { runes: p55.length, words: wordLengths.length, wordLengths },
  tests: {
    nearestInteriorAncestorVigenere: Object.fromEntries(Object.entries(actual).slice(0, 4).map(([k, v]) => [k, { prefix: v.slice(0, 48), words: splitWords(k.endsWith('F') ? (k.includes('Minus') ? directMinusF : directPlusF) : (k.includes('Minus') ? directMinus : directPlus)) }])),
    recursiveParentAutokey: Object.fromEntries(Object.entries(actual).slice(4).map(([k, v]) => [k, { prefix: v.slice(0, 48), words: splitWords(k.endsWith('F') ? (k.includes('Minus') ? recursiveMinusF : recursivePlusF) : (k.includes('Minus') ? recursiveMinus : recursivePlus)) }])),
    treeTranspositionPrefixes: Object.fromEntries(Object.entries(treeOutputs).map(([k, v]) => [k, v.slice(0, 64)]))
  }
}, null, 2));
