'use strict';

/**
 * Two-way separable additive/XOR unknown-key obstruction for the 30x6 interior
 * of original LP2 p49-51 grid aligned with solved p56+p57 (85+95=180 runes).
 *
 * All 30 row keys and all six column keys are free, with one gauge redundancy;
 * 145 subsequent equations are key-free exact predictions. Two original
 * historically plausible radices and two p56 registers are source-locked.
 *
 * Run: node sims/terminal_inner180_allsecret_rowcol_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.join(__dirname, '..');
/** @param {string} name */
const load = name => JSON.parse(fs.readFileSync(path.join(ROOT,name),'utf8'));
const corpus = load('resources/liber-primus/lp2-corpus.json');
const grid = load('resources/liber-primus/base60-grid.json');
const gp = corpus.translit.map((name,index)=>({name,index}))
  .sort((a,b)=>b.name.length-a.name.length);
const expectedWords = 'AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE';
/** @returns {number[]} */
function plaintext56() {
  const output = [];
  for (const word of expectedWords.split(' ')) {
    let remaining=word;
    while (remaining.length) {
      const token=gp.find(v=>remaining.startsWith(v.name));
      assert(token, 'Invalid known p56 GP token: '+remaining);
      output.push(token.index);
      remaining=remaining.slice(token.name.length);
    }
  }
  return output;
}
const p56=corpus.pages.find(p=>p.page===56).indices;
const p57=corpus.pages.find(p=>p.page===57).indices;
const known=plaintext56();
assert.equal(known.length,85);
assert.equal(p56.length,85);
assert.equal(p57.length,95);
assert.equal(grid.rows.length,32);
assert.equal(grid.byte_rows.flat().length,256);
const A59=grid.alphabet.replace('f','');
const sourceModes=[
  ['base60',grid.byte_rows.flat()],
  ['base59',grid.rows.flat().map(s=>A59.indexOf(s[0])*59+A59.indexOf(s[1]))]
];
const registers=[
  ['solved-p56-plaintext+p57',known.concat(p57)],
  ['printed-p56-ciphertext+p57',p56.concat(p57)]
];
const mod=(x,m)=>(x%m+m)%m;

/** @param {number[]} values Must hold 30 rows of six key residual bytes.
 *  @param {'mod29'|'xor256'} family */
function exactPredictions(values,family) {
  assert.equal(values.length,180);
  let matches=0;
  for (let i=1;i<30;i++)for(let j=1;j<6;j++){
    const lhs=values[i*6+j];
    const rhs=family==='mod29'
      ? mod(values[i*6]+values[j]-values[0],29)
      : values[i*6]^values[j]^values[0];
    matches+=Number(lhs===rhs);
  }
  return matches;
}

/** @param {number[]} bytes
 *  @param {number[]} text
 *  @param {'mod29'|'xor256'} family */
function residue(bytes,text,family) {
  const output=[];
  for (let row=1;row<=30;row++)for(let col=1;col<=6;col++){
    const byte=bytes[row*8+col],plain=text[(row-1)*6+(col-1)];
    output.push(family==='mod29'?mod(byte-plain,29):byte^plain);
  }
  return output;
}
const results=[];
for(const [radix,bytes] of sourceModes)
  for(const [register,text] of registers)
    for(const family of /** @type {const} */ (['mod29','xor256'])){
      const matches=exactPredictions(residue(bytes,text,family),family);
      results.push({radix,register,family,independentChecks:145,matches,failures:145-matches});
    }
assert.deepEqual(results.map(r=>r.matches),[2,1,9,1,8,1,1,2]);

// Positive controls: source-independent native register and completely
// unknown, deliberately nonconstant row/column masks. Exact all-secret
// interpolation must predict every withheld interior key equation.
for (const family of /** @type {const} */ (['mod29','xor256'])) {
  const row=Array.from({length:30},(_,i)=>(11*i*i+7*i+3)% (family==='mod29'?29:256));
  const col=Array.from({length:6},(_,i)=>(17*i+5) % (family==='mod29'?29:256));
  const plant=[];
  for(let i=0;i<30;i++)for(let j=0;j<6;j++)
    plant.push(family==='mod29'?mod(row[i]+col[j],29):row[i]^col[j]);
  assert.equal(exactPredictions(plant,family),145);
}
console.log(JSON.stringify({
  hypothesis:'unknown separable row+column keys over table interior aligned with solved p56+p57',
  originalTableRows:32,
  originalTableCols:8,
  knownInnerCells:180,
  unknownRowKeys:30,
  unknownColumnKeys:6,
  gaugeDegreesOfFreedom:1,
  unconstrainedTests:145,
  results,
  positivePlantedAllSecretMasks:'PASS: 145/145 each',
  classification:'No compatible source-original row+column key or recovered unknown plaintext'
},null,2));
