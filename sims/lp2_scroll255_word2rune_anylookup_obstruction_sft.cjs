'use strict';
/**
 * SFT: the 255 complete printed words on LP2 pp3-7 and the 255 GP29 runes
 * on adjacent p8 cannot be related by a stateless word-only lookup.
 *
 * Conditional premise: these two original registers are positionally paired.
 * This source adjacency is observed, but authorship of the pairing is unknown.
 *
 * Windows 11, Node.js 22, CommonJS. Read-only, no command-line arguments.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..', 'resources', 'liber-primus');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const corpus = JSON.parse(read('lp2-corpus.json'));
const grid = JSON.parse(read('lp2-grid-256.json'));
const parts = read('lp2-transcription.txt').split('%');
const runeIndex = new Map(corpus.runes.map((rune, i) => [rune, i]));
const words = [];
let current = [];
let firstPage = -1;
let lastPage = -1;

/** Record one complete source word, carrying it across page/line breaks. */
function flush() {
  if (current.length) {
    words.push({ runes: current, firstPage, lastPage });
    current = [];
  }
}
for (let page = 3; page <= 7; page++) {
  for (const char of parts[page]) {
    if (runeIndex.has(char)) {
      if (!current.length) firstPage = page;
      lastPage = page;
      current.push(runeIndex.get(char));
    } else if (char === '-' || char === '.') {
      flush();
    }
  }
}
flush();

const target = corpus.pages.find(page => page.page === 8).indices;
const source = corpus.pages.filter(page => page.page >= 3 && page.page <= 7)
  .flatMap(page => page.indices);
assert.equal(words.length, 255);
assert.equal(target.length, 255);
assert.equal(source.length, 1145);
assert.deepEqual(words.flatMap(word => word.runes), source);
assert.equal(grid.bytes.length, 256);


/**
 * All possible contiguous original p0–p54 page intervals with a following
 * rune-bearing page. Count COMPLETE printed words across page and line
 * carries, then ask whether they match the entire next physical page's runes.
 * This is a source-visible independent registration test: 55*56/2 =1540
 * intervals, no search by English plaintext or cryptographic scoring.
 */
const equalAdjacentPageWindows = [];
let testedAdjacentPageWindows = 0;
function wholeWordsInPhysicalWindow(a, b) {
  let count = 0;
  let inWord = false;
  for (let page = a; page <= b; page++) {
    for (const character of parts[page]) {
      if (runeIndex.has(character)) inWord = true;
      else if ((character === '-' || character === '.') && inWord) {
        count++;
        inWord = false;
      }
    }
  }
  return count + Number(inWord);
}
for (let start = 0; start <= 54; start++) {
  for (let end = start; end <= 54; end++) {
    testedAdjacentPageWindows++;
    const count = wholeWordsInPhysicalWindow(start, end);
    const nextLength = corpus.pages.find(page =>
      page.page === end + 1).indices.length;
    if (count === nextLength)
      equalAdjacentPageWindows.push({start, end, words:count});
  }
}
assert.equal(testedAdjacentPageWindows, 1540);
assert.deepEqual(equalAdjacentPageWindows, [{start:3,end:7,words:255}]);
console.log('WHOLE_SOURCE_UNIQUE_255_TO_255 ' +
  JSON.stringify({allAdjacentPageWindows:1540,exactMatches:equalAdjacentPageWindows}));

/**
 * The best possible deterministic lookup is learned independently for EACH
 * distinct source key. Its exception count is a strict lower bound over ALL
 * functions from these source keys to 29 output runes, including secret tables.
 *
 * @param {Array<string|number>} keys
 * @param {number[]} outputs
 * @returns {{distinctKeys:number,conflictingGroups:number,minExceptions:number}}
 */
function obstruction(keys, outputs) {
  assert.equal(keys.length, outputs.length);
  const groups = new Map();
  keys.forEach((key, i) => {
    if (!groups.has(key)) groups.set(key, new Map());
    const counts = groups.get(key);
    const rune = outputs[i];
    counts.set(rune, (counts.get(rune) || 0) + 1);
  });
  let conflictingGroups = 0;
  let minExceptions = 0;
  for (const counts of groups.values()) {
    if (counts.size > 1) conflictingGroups++;
    const frequency = [...counts.values()];
    minExceptions += frequency.reduce((a, b) => a + b, 0) -
      Math.max(...frequency);
  }
  return { distinctKeys: groups.size, conflictingGroups, minExceptions };
}

/** @param {number[]} runes */
function base29Byte(runes) {
  return runes.reduce((value, rune) => (29 * value + rune) % 256, 0);
}
const registers = {
  wholeWord: words.map(word => word.runes.join(',')),
  GP0Sum: words.map(word => word.runes.reduce((sum, x) => sum + x, 0) % 256),
  primeSum: words.map(word => word.runes
    .reduce((sum, x) => sum + corpus.prime[x], 0) % 256),
  base29Byte: words.map(word => base29Byte(word.runes))
};
const expected = {
  wholeWord: [252, 3, 3],
  GP0Sum: [106, 67, 141],
  primeSum: [152, 70, 101],
  base29Byte: [167, 55, 84]
};

assert.deepEqual(words[235].runes, [23, 21]);
assert.deepEqual(words[236].runes, [23, 21]);
assert.deepEqual([words[235].firstPage, words[236].firstPage], [7, 7]);
assert.deepEqual([target[235], target[236]], [17, 3]);
assert.deepEqual(words[47].runes, words[240].runes);
assert.deepEqual(words[48].runes, words[231].runes);
assert.equal(words[47].firstPage, 4);
assert.equal(words[240].firstPage, 7);


/**
 * Independent original-p7-red GF(4) 255-state register and original 256-byte
 * p50 table, source-selected before asking whether a fixed secret word
 * lookup can map scroll words to p8 under a nonconstant key.
 *
 * The p7 last five red complete-word GP0 products are [11,26,8,15,2].
 * Four taps modulo4: [3,2,0,3]; fifth product2 is a fixed initial digit.
 * GF4 modulus x^2+x+1, table address is the base4 state integer 0..255.
 * Candidate conditional channel: p8[i] = H(scrollWord[i]) - table[state[i]].
 * Identical source words eliminate arbitrary unknown H exactly. 
 * @param {number} a @param {number} b
 */
function gf4Multiply(a,b) {
  let result = 0;
  for (let bit=0;bit<2;bit++) {
    if ((b>>>bit)&1) result ^= a;
    a <<= 1;
    if (a&4) a ^= 7;
  }
  return result;
}
const p7redWords = [[23,3],[22,16,2,25],[5,7,11],[14,28],[6,28,19]];
const gp0product = runes => runes.reduce((v, x) => v*x%29, 1);
assert.deepEqual(p7redWords.map(gp0product),[11,26,8,15,2]);
assert.deepEqual(corpus.pages.find(p=>p.page===7).indices.slice(194),
  p7redWords.flat());
let state = [2,0,0,0];
const taps = [3,2,0,3];
const gf4states = [];
for (let i=0;i<255;i++) {
  gf4states.push([...state]);
  let feedback=0;
  for (let j=0;j<4;j++) feedback ^= gf4Multiply(state[j],taps[j]);
  state=[...state.slice(1),feedback];
}
assert.deepEqual(state,[2,0,0,0]);
const addresses = gf4states.map(v =>
  v.reduce((acc, digit)=>acc*4+digit,0));
assert.equal(new Set(addresses).size,255);
assert.deepEqual(addresses.slice(0,8),[128,1,7,30,123,236,177,199]);
const pairs = [[47,240],[48,231],[235,236]];
const mod29 = v => ((v%29)+29)%29;
const sourceKey = addresses.map(addr => grid.bytes[addr]);
const actualCollisionDiffs = pairs.map(([i,j]) =>
  mod29(target[i]-target[j]));
const predictedCollisionDiffs = pairs.map(([i,j]) =>
  mod29(-(sourceKey[i]-sourceKey[j])));
assert.deepEqual(actualCollisionDiffs,[8,18,14]);
assert.deepEqual(predictedCollisionDiffs,[8,18,15]);
assert.deepEqual(pairs.map(([i,j])=>[addresses[i],addresses[j]]),
  [[8,120],[32,31],[43,173]]);
assert.equal(pairs.filter(([i,j]) =>
  mod29(target[i]+sourceKey[i])===mod29(target[j]+sourceKey[j])).length,2);
console.log('HEX_GF4_P50_COLLISIONS '+JSON.stringify({
  originalGP29Differences:actualCollisionDiffs,
  exactSourceGF4GridPredictions:predictedCollisionDiffs,
  matchedPairs:2,totalPairs:3,
  note:'The held-out adjacent same-page p7 pair differs by one; no exact word dictionary decryption'
}));

/**
 * Full 255-position untouched-word holdout: test the same GF4-addressed
 * byte stream against every affine GP29 word-hash law H(w)=a*f(w)+b.
 * Both a and b are optimized over all 29×29 possibilities. This is an
 * exhaustive test of the stated finite affine family without plaintext.
 */
const affineWordHashes = {
  GPsum: words.map(w=>mod29(w.runes.reduce((n,x)=>n+x,0))),
  primeSum: words.map(w=>mod29(w.runes.reduce((n,x)=>n+corpus.prime[x],0))),
  base29: words.map(w=>mod29(w.runes.reduce((n,x)=>29*n+x,0))),
  product: words.map(w=>mod29(w.runes.reduce((n,x)=>n*x,1))),
  first: words.map(w=>w.runes[0]),
  last: words.map(w=>w.runes.at(-1)),
  length: words.map(w=>w.runes.length%29)
};
const expectedAffineMax={GPsum:21,primeSum:18,base29:19,
  product:19,first:20,last:19,length:18};
for(const [name,hashes] of Object.entries(affineWordHashes)){
  let best=0,bestA=0,bestB=0;
  for(let a=0;a<29;a++)for(let b=0;b<29;b++){
    let hits=0;
    for(let i=0;i<255;i++){
      if(mod29(a*hashes[i]+b-sourceKey[i])===target[i])hits++;
    }
    if(hits>best){best=hits;bestA=a;bestB=b;}
  }
  assert.equal(best,expectedAffineMax[name]);
  const plant=hashes.map((h,i)=>mod29(7*h+17-sourceKey[i]));
  assert.equal(plant.reduce((count,y,i)=>
    count+Number(y===mod29(7*hashes[i]+17-sourceKey[i])),0),255);
  console.log('HEX_GF4_P50_AFFINE_SOURCE_HOLDOUT '+JSON.stringify({
    wordHash:name,allSecretAffineFamilies:841,
    bestOriginalHits:best,total:255,bestA,bestB,
    authenticConstructedPositiveHits:255
  }));
}


for (const [name, keys] of Object.entries(registers)) {
  const observed = obstruction(keys, target);
  assert.deepEqual(Object.values(observed), expected[name]);

  // Positive: even repeated addresses must reproduce without exception when
  // the target was generated by a real deterministic, arbitrary secret table.
  const plantedMap = new Map();
  const planted = keys.map(key => {
    if (!plantedMap.has(key)) plantedMap.set(key, plantedMap.size % 29);
    return plantedMap.get(key);
  });
  const plant = obstruction(keys, planted);
  assert.equal(plant.conflictingGroups, 0);
  assert.equal(plant.minExceptions, 0);

  if (name === 'wholeWord') {
    console.log(name + ': ' + JSON.stringify(observed) +
      ', same-page p7 contradiction word235/236');
    continue;
  }
  // Independently test the literal original 256-byte table, with the
  // conventional source base60 byte read reduced to a GP29 rune.
  const predicted = keys.map(address => grid.bytes[address] % 29);
  const shifts = Array.from({ length: 255 }, (_, shift) =>
    predicted.reduce((n, rune, i) =>
      n + Number(rune === target[(i + shift) % 255]), 0));
  const direct = shifts[0];
  const rank = shifts.filter(count => count >= direct).length;
  const expectedMatches = { GP0Sum: [10, 94], primeSum: [7, 202], base29Byte: [7, 192] };
  assert.deepEqual([direct, rank], expectedMatches[name]);
  console.log(name + ': ' + JSON.stringify(observed) +
    ', literalTableMatches=' + direct + '/255, cyclicRank=' + rank + '/255');
}

/**
 * GF29 rank certificate against a moving five-tap state plus scroll-word
 * feed-forward key, without fixing ANY of the coefficients.
 *
 * AR5: output_i = sum_j a_j output_(i-j) + b input_i + c.
 * FIR6: output_i = sum_j b_j input_(i-j) + c.
 * AR5+FIR6: both moving-output and moving-input channels, all twelve
 * coefficients freely secret. The first five original outputs are public IVs.
 * @param {number[][]} rows
 * @param {number[]} rhs
 */
function linearCertificate(rows, rhs) {
  const augmented = rows.map((row, i) => [...row, rhs[i]]);
  const numCols = rows[0].length;
  let rank = 0;
  for (let col = 0; col < numCols; col++) {
    let pivot = rank;
    while (pivot < augmented.length && augmented[pivot][col] === 0) pivot++;
    if (pivot === augmented.length) continue;
    [augmented[rank], augmented[pivot]] =
      [augmented[pivot], augmented[rank]];
    const inverse = Array.from({length: 28}, (_, i) => i + 1)
      .find(x => ((x * augmented[rank][col]) % 29) === 1);
    assert.notEqual(inverse, undefined);
    for (let j = col; j <= numCols; j++) {
      augmented[rank][j] = augmented[rank][j] * inverse % 29;
    }
    for (let i = rank + 1; i < augmented.length; i++) {
      if (augmented[i][col] === 0) continue;
      const factor = augmented[i][col];
      for (let j = col; j <= numCols; j++) {
        augmented[i][j] = ((augmented[i][j] -
          factor * augmented[rank][j]) % 29 + 29) % 29;
      }
    }
    rank++;
  }
  const contradictions = augmented.slice(rank)
    .filter(row => row[numCols] !== 0).length;
  return {rank, contradictions};
}
/** @param {number[]} input @param {number[]} output @param {string} mode */
function stateRows(input, output, mode) {
  const rows = [], rhs = [];
  const ar = mode !== 'FIR6', fir = mode !== 'AR5+input';
  for (let i = 5; i < output.length; i++) {
    const row = ar ? Array.from({length:5}, (_, k) => output[i - k - 1]) : [];
    for (let k = 0; k < (fir ? 6 : 1); k++) row.push(input[i - k]);
    row.push(1);
    rows.push(row);
    rhs.push(output[i]);
  }
  return {rows, rhs};
}
const expectedState = {
  GP0Sum: [[7,235],[7,235],[12,230]],
  primeSum: [[7,223],[7,235],[12,226]],
  base29Byte: [[7,231],[7,235],[12,230]]
};
for (const [name, input] of Object.entries(registers)) {
  if (!(name in expectedState)) continue;
  const reducedInput = input.map(x => x % 29);
  for (const [k,mode] of ['FIR6','AR5+input','AR5+FIR6'].entries()) {
    const original = stateRows(reducedInput, target, mode);
    const cert = linearCertificate(original.rows, original.rhs);
    assert.deepEqual(Object.values(cert), expectedState[name][k]);
    assert(cert.contradictions > 0);

    // Real AR/FIR5 state-positive: choose secret nonzero fixed coefficients
    // and an independent source-native public five-rune initial state.
    const plant = target.slice(0,5);
    for (let i=5; i<target.length; i++) {
      const features = mode === 'FIR6' ? [] :
        Array.from({length:5}, (_, j) => plant[i-j-1]);
      for (let j=0; j < (mode === 'AR5+input' ? 1 : 6); j++) {
        features.push(reducedInput[i-j]);
      }
      features.push(1);
      const value = features.reduce((sum, v, j) =>
        sum + v * ((j * 11 + 3) % 29), 0) % 29;
      plant.push(value);
    }
    const planted = stateRows(reducedInput, plant, mode);
    const plantedCert = linearCertificate(planted.rows, planted.rhs);
    assert.equal(plantedCert.contradictions, 0);
    console.log(name + ' ' + mode + ': ' + JSON.stringify(cert) +
      ', authentic state-plant 250/250');
  }
}

console.log('PASS: arbitrary-table and arbitrary-five-tap causal-linear original-source exclusions; no plaintext.');
