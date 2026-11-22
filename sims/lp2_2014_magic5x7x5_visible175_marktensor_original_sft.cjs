'use strict';

/**
 * Source-original test: 175 visible punctuation marks, three 2014 Stage10
 * magic squares of orders 5, 7 and 5, and the complete 5x7x5 GP29 tensor.
 * Run from any working directory on Node.js 22. Read-only, no dependencies.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const loadJSON = (name) => JSON.parse(fs.readFileSync(path.join(root, 'resources', 'liber-primus', name), 'utf8'));
const corpus = loadJSON('lp2-corpus.json');
const punctuation = loadJSON('lp2-punctuation-identity.json');
const matrixText = fs.readFileSync(path.join(root, 'resources', 'cicada2014-openpuff-magic-squares.txt'), 'utf8');

const matrices = matrixText.trim().split(/\r?\n\s*\r?\n/).map((block) =>
  block.trim().split(/\r?\n/).map((line) => line.trim().split(/\s+/).map(Number))
);
assert.deepEqual(matrices.map((m) => m.length), [5, 7, 5]);
assert.deepEqual(matrices.map((m) => m[0].reduce((a, b) => a + b, 0)), [3301, 1033, 1033]);
for (const [index, matrix] of matrices.entries()) {
  const sum = [3301, 1033, 1033][index];
  assert(matrix.every((row) => row.length === matrix.length && row.reduce((a, b) => a + b, 0) === sum));
  assert(Array.from({length:matrix.length},(_,c)=>matrix.reduce((a,row)=>a+row[c],0)).every(x=>x===sum));
}

const excluded = new Set([57, 58, 59, 60, 125]);
assert.equal(punctuation.events.length, 180);
const marks = punctuation.events.filter((event) => !excluded.has(event.index));
assert.equal(marks.length, 175);
const original = corpus.pages.filter((page) => page.page <= 55).flatMap((page) => page.indices);
assert.equal(original.length, 12956);
assert.equal(marks[0].rune_offset, 13);
assert.equal(marks[174].rune_offset, 12956);
const duplicates = marks.filter((mark, index) => index > 0 && mark.rune_offset === marks[index - 1].rune_offset).map((mark) => mark.rune_offset);
assert.deepEqual(duplicates, [1860, 3603, 9358]);
const marksBefore = marks.map((event) => original[event.rune_offset - 1]);
assert(marksBefore.every((value) => Number.isInteger(value) && value >= 0 && value < 29));

/** @param {number} value @returns {number} */
function mod(value) {
  return (value % 29 + 29) % 29;
}

/** @param {number[][]} matrix @returns {number[][]} */
function invert(matrix) {
  const n = matrix.length;
  const augmented = matrix.map((row, i) =>
    row.map(mod).concat(Array.from({length:n},(_,j)=>Number(j===i)))
  );
  for(let c=0;c<n;c++){
    const pivot = augmented.findIndex((row,i)=>i>=c && row[c]!==0);
    assert(pivot>=c, 'Historical key must be nonsingular');
    [augmented[c],augmented[pivot]]=[augmented[pivot],augmented[c]];
    const multiplicativeInverse = Array.from({length:29},(_,i)=>i).find((x)=>mod(x*augmented[c][c])===1);
    assert(multiplicativeInverse!==undefined);
    augmented[c]=augmented[c].map((x)=>mod(x*multiplicativeInverse));
    for(let row=0;row<n;row++){
      if(row===c)continue;
      const factor=augmented[row][c];
      augmented[row]=augmented[row].map((x,j)=>mod(x-factor*augmented[c][j]));
    }
  }
  return augmented.map((row)=>row.slice(n));
}
const inverses=matrices.map(invert);

/**
 * Multiply a full 175-rune tensor along one original 5x7x5 axis.
 * @param {number[]} tape
 * @param {number[][]} matrix
 * @param {number} axis
 * @returns {number[]}
 */
function applyAxis(tape,matrix,axis){
  assert.equal(tape.length,175);
  const output=tape.slice();
  for(let position=0;position<175;position++){
    const coordinates=[Math.floor(position/35),Math.floor(position/5)%7,position%5];
    const target=coordinates[axis];
    let value=0;
    for(let source=0;source<matrix.length;source++){
      const inputCoordinates=coordinates.slice();
      inputCoordinates[axis]=source;
      value+=matrix[target][source]*tape[inputCoordinates[0]*35+inputCoordinates[1]*5+inputCoordinates[2]];
    }
    output[position]=mod(value);
  }
  return output;
}

/** @param {number[]} input @param {number} bitmask @returns {number[]} */
function decode(input,bitmask){
  let result=input.slice();
  for(let axis=0;axis<3;axis++){
    result=applyAxis(result,bitmask&(1<<axis)?matrices[axis]:inverses[axis],axis);
  }
  return result;
}

/** @param {number[]} input @param {number} bitmask @returns {number[]} */
function encode(input,bitmask){
  let result=input.slice();
  for(let axis=2;axis>=0;axis--){
    result=applyAxis(result,bitmask&(1<<axis)?inverses[axis]:matrices[axis],axis);
  }
  return result;
}

/** @param {number[]} tape @returns {number} */
function ioc(tape){
  const counts=Array(29).fill(0);
  for(const rune of tape)counts[rune]++;
  return counts.reduce((total,count)=>total+count*(count-1),0)/(tape.length*(tape.length-1));
}

/** @param {number[]} tape @returns {string} */
function gp(tape){
  return tape.map((index)=>corpus.translit[index]).join('');
}

const solved=corpus.pages.find((page)=>page.page===57).indices;
assert.equal(solved.length,95);
const nativePlant=Array.from({length:175},(_,i)=>solved[i%solved.length]);

// Four complete fixed visible-mark channels; each carries exactly 175 GF29 values.
// The after-mark channel includes a single conditional final->first rune wrap.
const markAfter=marks.map((mark)=>original[mark.rune_offset%original.length]);
const markGaps=marks.map((mark,i)=>mod(mark.rune_offset-(i?marks[i-1].rune_offset:0)));
const dotCounts=marks.map((mark)=>mark.large_mark?.dot_count??(
  mark.symbol==='⁚'||mark.index===127?3:mark.index===91?1:4
));
const dotHistogram=dotCounts.reduce((counts,value)=>(counts[value]=(counts[value]||0)+1,counts),{});
assert.deepEqual(dotHistogram,{'1':1,'3':5,'4':138,'10':3,'13':28});
const channels={
  'preceding-original-rune':marksBefore,
  'following-original-rune-cyclic':markAfter,
  'consecutive-mark-rune-gap-mod29':markGaps,
  'original-visible-mark-dot-count':dotCounts
};
const expectedIoC={
  'preceding-original-rune':[0.033694581281,0.035927750411,0.034417077176,0.032840722496,0.034548440066,0.038029556650,0.036781609195,0.032643678161],
  'following-original-rune-cyclic':[0.035270935961,0.036387520525,0.034285714286,0.034482758621,0.033563218391,0.032840722496,0.032643678161,0.033037766831],
  'consecutive-mark-rune-gap-mod29':[0.035205254516,0.034614121511,0.035336617406,0.034220032841,0.035665024631,0.035139573071,0.036256157635,0.036256157635],
  'original-visible-mark-dot-count':[0.035665024631,0.032052545156,0.036256157635,0.035862068966,0.034417077176,0.035205254516,0.036387520525,0.032118226601]
};
assert.equal(markAfter.at(-1),original[0]);
assert.equal(markGaps[0],13);
console.log('PASS original_runes=12956 visible_marks=175 source_dimensions=5x7x5');
console.log('PASS excluded_only_original_absent_events=57,58,59,60,125 duplicate_offsets=1860,3603,9358');
for(const [name,input] of Object.entries(channels)){
  assert.equal(input.length,175);
  const outputs=[];
  for(let bitmask=0;bitmask<8;bitmask++){
    const decoded=decode(input,bitmask);
    assert.deepEqual(encode(decoded,bitmask),input);
    assert.deepEqual(decode(encode(nativePlant,bitmask),bitmask),nativePlant);
    assert(Math.abs(ioc(decoded)-expectedIoC[name][bitmask])<1e-12);
    outputs.push({bitmask, ioc:ioc(decoded), prefix:gp(decoded.slice(0,52)), distinct:new Set(decoded).size});
  }
  console.log('PASS channel='+name+' eight_exact_original_roundtrips eight_solved_p57_plants');
  console.log('channel='+name+' raw_IoC='+ioc(input).toFixed(12)+' max_IoC='+Math.max(...outputs.map(x=>x.ioc)).toFixed(12));
  for(const output of outputs)console.log('channel='+name+' bitmask='+output.bitmask+' IoC='+output.ioc.toFixed(12)+' distinct='+output.distinct+' prefix='+output.prefix);
}
console.log('DECISION: no sustained native-GP instruction in any of 32 fixed original-mark tensor candidates; source-selected mark-to-key operation absent');
