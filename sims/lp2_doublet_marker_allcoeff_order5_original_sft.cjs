'use strict';

/**
 * All fifth-order homogeneous GF(29) recurrences against source-exact LP2
 * adjacent-equal rune markers. Node.js 22, CommonJS, single-file SFT.
 * The doublet->plaintext-F inference is a hypothesis, not an established rule.
 * No source ciphertext is modified and there is no fitted language model.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const MOD = 29, ORDER = 5;
const MARKERS = [
  [277,10],[500,22],[526,7],[868,28],[929,9],[972,22],
  [1110,10],[1121,25],[1202,22],[1314,14],[1463,18],[1549,3],
  [1704,18],[1959,13],[2019,7],[2205,7],[2475,7],[2734,26]
];
const INVERSE = Array.from({length:29}, (_,n) => {
  if (!n) return 0;
  for(let k=1;k<29;k++) if(n*k%29===1) return k;
  throw new Error('Noninvertible nonzero GP29 value: '+n);
});
/** @param {number} x @returns {number} */
function mod(x) { return (x%MOD+MOD)%MOD; }
/**
 * Polynomial product reduced by x^5 = sum(a[j]*x^j) over GF29.
 * @param {number[]} a @param {number[]} b @param {number[]} taps
 * @returns {number[]}
 */
function multiply(a,b,taps) {
  const v=new Int32Array(9);
  for(let i=0;i<5;i++)for(let j=0;j<5;j++)v[i+j]+=a[i]*b[j];
  for(let i=8;i>=5;i--) {
    const k=v[i]%MOD;
    for(let j=0;j<5;j++)v[i-5+j]+=k*taps[j];
  }
  return Array.from(v.subarray(0,5),n=>n%MOD);
}
/**
 * x^exponent modulo characteristic polynomial.
 * @param {number} exponent @param {number[][]} powers
 * @param {number[]} taps @returns {number[]}
 */
function residue(exponent,powers,taps) {
  let acc=[1,0,0,0,0],bit=0;
  for(let n=exponent;n>0;n=Math.floor(n/2),bit++)
    if(n%2)acc=multiply(acc,powers[bit],taps);
  return acc;
}
/**
 * Gaussian elimination accepts underdetermined systems, preserving all
 * possible seeds. Contradiction holds only if a zero row has nonzero RHS.
 * @param {number[]} coefficients @param {number} rhs
 * @param {(null|{row:number[],rhs:number})[]} basis @returns {boolean}
 */
function addEquation(coefficients,rhs,basis) {
  const row=coefficients.slice();
  for(let pivot=0;pivot<5;pivot++) {
    if(row[pivot]===0)continue;
    const old=basis[pivot];
    if(old) {
      const k=row[pivot];
      rhs=mod(rhs-k*old.rhs);
      for(let j=pivot;j<5;j++)row[j]=mod(row[j]-k*old.row[j]);
    } else {
      const inv=INVERSE[row[pivot]];
      for(let j=pivot;j<5;j++)row[j]=row[j]*inv%29;
      basis[pivot]={row,rhs:rhs*inv%29};
      return true;
    }
  }
  return rhs===0;
}
/** @param {(null|{row:number[],rhs:number})[]} basis @returns {number[]} */
function solveSeed(basis) {
  const seed=[0,0,0,0,0];
  for(let i=4;i>=0;i--) {
    if(!basis[i])continue;
    let n=basis[i].rhs;
    for(let j=i+1;j<5;j++)n-=basis[i].row[j]*seed[j];
    seed[i]=mod(n);
  }
  return seed;
}
/** @returns {number[][]} Original p40..53 chapter-local doublet positions/values. */
function originalMarkers() {
  const source=JSON.parse(fs.readFileSync(path.join(__dirname,
    '../resources/liber-primus/lp2-corpus.json'),'utf8'));
  assert.equal(source.pages.filter(p=>p.page<=55).reduce((n,p)=>n+p.indices.length,0),12956);
  const chapter=source.pages.filter(p=>p.page>=40&&p.page<=53);
  let at=0;
  const events=[];
  for(const p of chapter) {
    for(let i=1;i<p.indices.length;i++) {
      if(p.indices[i]===p.indices[i-1])events.push([at+i,p.indices[i]]);
    }
    at+=p.indices.length;
  }
  assert.equal(at,3008);
  assert.deepEqual(events,MARKERS);
  return events;
}
/**
 * Every one of 29^5 coefficient tuples is considered. For each tuple,
 * first ten marker equations determine the unknown seed (if consistent).
 * Each extra marker is an untouched prediction/contradiction.
 * @param {number[][]} events @param {number} limit
 * @returns {{count:number,passed:number[],tenSurvivors:object[],survived:number}}
 */
function scan(events,limit=29**5) {
  const passed=Array(events.length+1).fill(0),tenSurvivors=[];
  let survived=0;
  for(let key=0;key<limit;key++) {
    const taps=new Array(5);
    let n=key;
    for(let j=0;j<5;j++){taps[j]=n%29;n=Math.floor(n/29);}
    const powers=[[0,1,0,0,0]];
    for(let j=1;j<12;j++)powers.push(multiply(powers[j-1],powers[j-1],taps));
    const basis=Array(5).fill(null);
    let consistent=true;
    for(let j=0;j<events.length;j++) {
      const [at,value]=events[j];
      if(!addEquation(residue(at,powers,taps),value,basis)) {
        consistent=false;break;
      }
      passed[j+1]++;
      if(j===9) {
        const seed=solveSeed(basis);
        const row=residue(events[10][0],powers,taps);
        const prediction=mod(row.reduce((s,v,k)=>s+v*seed[k],0));
        tenSurvivors.push({taps,seed,prediction,actual:events[10][1]});
      }
    }
    if(consistent)survived++;
  }
  return {count:limit,passed,tenSurvivors,survived};
}
/**
 * Direct independent recurrence, also used for a positive planted control.
 * @param {number[]} taps @param {number[]} seed @param {number} last
 * @returns {number[]}
 */
function recurrence(taps,seed,last) {
  const out=seed.slice();
  for(let i=5;i<=last;i++) {
    let v=0;
    for(let j=0;j<5;j++)v+=taps[j]*out[i-5+j];
    out.push(v%29);
  }
  return out;
}
function main() {
  const events=originalMarkers();
  const started=Date.now(),result=scan(events);
  assert.equal(result.count,20511149);
  assert.deepEqual(result.passed.slice(1,12),
    [20511148,20511121,20508303,20438692,19122319,682518,23665,866,31,4,0]);
  assert.equal(result.survived,0);
  assert.deepEqual(result.tenSurvivors.map(x=>[x.taps,x.seed,x.prediction]),[
    [[8,18,15,12,14],[20,1,2,20,26],28],
    [[5,13,5,19,15],[7,24,22,13,28],17],
    [[1,0,27,6,24],[20,4,18,12,5],15],
    [[14,28,17,0,26],[13,14,28,22,21],9]
  ]);
  for(const x of result.tenSurvivors) {
    const tape=recurrence(x.taps,x.seed,events[10][0]);
    assert(events.slice(0,10).every(([at,v])=>tape[at]===v));
    assert.equal(tape[events[10][0]],x.prediction);
    assert.notEqual(x.prediction,18);
  }
  const taps=[9,4,10,6,8],seed=[7,1,12,23,5];
  const plant=recurrence(taps,seed,events.at(-1)[0]);
  const powers=[[0,1,0,0,0]];
  for(let j=1;j<12;j++)powers.push(multiply(powers[j-1],powers[j-1],taps));
  const basis=Array(5).fill(null);
  for(const [at] of events)assert(addEquation(residue(at,powers,taps),plant[at],basis));
  assert.deepEqual(solveSeed(basis),seed);
  console.log(JSON.stringify({
    source:'Unmodified LP2 physical p40-53, 3008 GP runes, 18 within-page repeat markers',
    coefficients_tested:result.count,
    survivors_after_each_marker:result.passed.slice(1),
    ten_marker_candidates:result.tenSurvivors,
    final_survivors:result.survived,
    synthetic_planted_marker_controls:18,
    elapsed_seconds:(Date.now()-started)/1000
  },null,2));
}
if(require.main===module)main();
module.exports={originalMarkers,scan,recurrence};
