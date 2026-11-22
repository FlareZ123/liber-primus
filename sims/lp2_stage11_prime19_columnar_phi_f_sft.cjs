'use strict';

/**
 * Exact original 19-column + historical LP2 p56 F-transparent prime-totient
 * inversion. A source clue suggests 19, but does not prescribe this cipher.
 * Read-only Windows Node22 SFT.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const solved = JSON.parse(fs.readFileSync(path.join(root, 'resources/external/relikd-solved-gp29-native-v1.json'), 'utf8'));
const signed = fs.readFileSync(path.join(root, 'resources/historical/cicada2014-stage11-message.asc'), 'utf8');
const lines = signed.split(/\r?\n/);
const start = lines.findIndex(line => line.startsWith('Hash: SHA1'));
const end = lines.findIndex(line => line.startsWith('-----BEGIN PGP SIGNATURE-----'));
assert.ok(start >= 0 && end > start);
const whitespace = [];
for (const line of lines.slice(start + 1, end)) {
  if (/^ +$/.test(line)) whitespace.push(line.length);
  else {
    const leading = line.match(/^ +/);
    const trailing = line.match(/ +$/);
    if (leading) whitespace.push(leading[0].length);
    if (trailing) whitespace.push(trailing[0].length);
  }
}
assert.deepEqual(whitespace, [2,3,5,7,11,13,17,23,29,31,37]);
assert.equal(whitespace.includes(19), false);

/** @param {number} value @returns {number} */
function mod29(value) { return ((value % 29) + 29) % 29; }

/** @param {number} length @returns {number[]} */
function primeTotient(length) {
  const shifts = [];
  for (let p = 2; shifts.length < length; p++) {
    let isPrime = true;
    for (let d = 2; d * d <= p; d++) {
      if (p % d === 0) { isPrime = false; break; }
    }
    if (isPrime) shifts.push((p - 1) % 29);
  }
  return shifts;
}
const shifts = primeTotient(4000);

/** @param {number[]} plain @param {number} sign @returns {number[]} */
function encrypt(plain, sign) {
  let keyIndex = 0;
  return plain.map(r => r === 0 ? 0 : mod29(r + sign * shifts[keyIndex++]));
}

/**
 * Strict historical plaintext-F bypass. Keep all legal encrypted-F/literal-F
 * interpretations rather than selecting a favorable hidden skip history.
 * @param {number[]} ciphertext
 * @param {number} sign
 * @returns {{failure:number|null,states:number}}
 */
function inverse(ciphertext, sign) {
  let clocks = new Set([0]);
  for (let i = 0; i < ciphertext.length; i++) {
    const next = new Set();
    for (const k of clocks) {
      if (ciphertext[i] === 0) next.add(k);
      if (mod29(ciphertext[i] - sign * shifts[k]) !== 0) next.add(k + 1);
    }
    if (!next.size) return {failure:i,states:0};
    clocks = next;
  }
  return {failure:null,states:clocks.size};
}

/** @param {number[]} input @param {number} width @returns {number[]} */
function rowToCol(input, width) {
  const out = [];
  for (let col = 0; col < width; col++) {
    for (let i = col; i < input.length; i += width) out.push(input[i]);
  }
  return out;
}

/** @param {number[]} input @param {number} width @returns {number[]} */
function colToRow(input, width) {
  const out = Array(input.length);
  let k = 0;
  for (let col = 0; col < width; col++) {
    for (let i = col; i < input.length; i += width) out[i] = input[k++];
  }
  return out;
}

assert.equal(corpus.pages.length,58);
assert.equal(corpus.pages.slice(0,56).reduce((n,p)=>n+p.indices.length,0),12956);
assert.deepEqual([55,56,57].map(i=>corpus.pages[i].indices.length),[76,85,95]);
const known56 = Array.from(solved.sections.find(s=>s.name==='p56_an_end').source_text)
  .filter(r=>corpus.runes.includes(r)).map(r=>corpus.runes.indexOf(r));
assert.equal(known56.length,85);
assert.deepEqual(encrypt(known56,1),corpus.pages[56].indices);
assert.equal(inverse(corpus.pages[56].indices,1).failure,null);

const windows = [
  ['p0-2',0,2,729,[[6,126],[19,22]]],
  ['p3-7',3,7,1145,[[18,17],[26,18]]],
  ['p40-53',40,53,3008,[[177,71],[295,27]]],
  ['p55',55,55,76,[[null,3],[null,null]]],
];
const output = [];
let positives = 0;
for (const [label,first,last,length,expected] of windows) {
  const original = corpus.pages.slice(first,last+1).flatMap(p=>p.indices);
  assert.equal(original.length,length);
  const directions = [
    ['column-unfill',colToRow,rowToCol],
    ['column-read',rowToCol,colToRow],
  ];
  for (let d=0;d<directions.length;d++) {
    const [direction,undo,apply] = directions[d];
    assert.deepEqual(undo(apply(original,19),19),original);
    for (let si=0;si<2;si++) {
      const sign = [1,-1][si];
      const result = inverse(undo(original,19),sign);
      assert.equal(result.failure,expected[d][si],label+' '+direction+' '+sign);
      const native = Array.from({length},(_,i)=>corpus.pages[57].indices[i%95]);
      const planted = apply(encrypt(native,sign),19);
      assert.deepEqual(undo(planted,19),encrypt(native,sign));
      assert.equal(inverse(undo(planted,19),sign).failure,null);
      positives++;
      output.push({window:label,direction,sign,
        firstImpossibleOffset:result.failure,viableTerminalClocks:result.states});
    }
  }
}
assert.equal(positives,16);
assert.equal(output.filter(row=>row.firstImpossibleOffset===null).length,3);
console.log(JSON.stringify({
  source:'original LP2 GP29, source-verified 2014 whitespace, solved original p56',
  width:19, solvedSourceControl:'85/85',plantedFullLengthPositives:positives,
  authenticUnknownPlaintextRecovered:false,output
},null,2));
