'use strict';
/**
 * LP2 original p40–53 floral thirteen/five-hole two-register self-synchronizer.
 *
 * A fixed nonlinear cipher candidate motivated by actual original floral
 * left dots 01101=13 (3 filled) and right dots 11111=31 (5 filled).
 * State starts (L,R)=(13,31 mod29), round key K=L^3+R^5 mod29,
 * full GP29 symbol P=C-K mod29. Advance L'=R, R'=L+C mod29.
 * Every ciphertext symbol including GP F=0 advances the state;
 * printed word/page boundaries have no phantom cipher event.
 *
 * SOURCE LIMIT: the ornament does not authenticate a two-register opcode.
 * The test is an actual full source inverse and fresh nonlinear family.
 *
 * Windows11 Node22: node sims/lp2_floral13_31_evolving_nonlinear_twostate_original_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const c = JSON.parse(fs.readFileSync(path.resolve(__dirname,
  '../resources/liber-primus/lp2-corpus.json'), 'utf8'));
const mod = a => ((a % 29) + 29) % 29;
const pow = (x,n) => { let p=1; for(let i=0;i<n;i++)p=p*x%29; return p; };
const pages = c.pages.filter(p => p.page >= 40 && p.page <= 53);
assert.deepEqual(pages.map(p=>p.indices.length),
  [231,273,272,274,273,270,270,274,271,66,0,92,263,179]);
const input = pages.flatMap(p => p.indices);
assert.equal(input.length, 3008);
assert.equal(c.pages.find(p=>p.page===53).indices.length,179);

/**
 * @typedef {{L:number,R:number}} State
 * @param {number[]} seq Native GP29 symbols in untouched physical order
 * @param {State} state Seed derived from floral masks, default left13/right31
 * @param {boolean} decrypt Whether input is ciphertext
 * @returns {{out:number[],state:State}}
 */
function run(seq, state, decrypt) {
  let L=mod(state.L), R=mod(state.R);
  const out=[];
  for(const value of seq) {
    assert.ok(Number.isInteger(value)&&value>=0&&value<29);
    const k = mod(pow(L,3) + pow(R,5));
    const C=decrypt ? value : mod(value+k);
    const P=decrypt ? mod(value-k) : value;
    out.push(decrypt?P:C);
    const nextR = mod(L+C);
    L=R; R=nextR;
  }
  return {out,state:{L,R}};
}
/** @param {number[]} s */
function ioc(s) {
  const f=Array(29).fill(0);
  for(const v of s) f[v]++;
  return f.reduce((sum,n)=>sum+n*(n-1),0)/(s.length*(s.length-1));
}
const GP = x => x.map(j => c.translit[j]).join('');
const seed={L:13,R:31};
const real=run(input,seed,true);
assert.deepEqual(run(real.out,seed,false).out,input);
const solved = c.pages.find(p=>p.page===57).indices.concat(c.pages.find(p=>p.page===56).indices);
assert.equal(solved.length,180);
const native = Array.from({length:input.length},(_,i)=>solved[i%solved.length]);
const encrypted = run(native,seed,false);
assert.deepEqual(run(encrypted.out,seed,true).out,native);
assert.notDeepEqual(run(encrypted.out,{L:31,R:13},true).out,native);
const continuous=[],reset=[];
let at=0;
for(const page of pages){
  const decoded=real.out.slice(at,at+page.indices.length);
  const single=page.indices.length>0?run(page.indices,seed,true).out:[];
  if(single.length) assert.deepEqual(run(single,seed,false).out,page.indices);
  continuous.push({page:page.page,n:decoded.length,
    ioc:decoded.length>1?ioc(decoded):null,opening32:GP(decoded.slice(0,32))});
  reset.push({page:page.page,n:single.length,ioc:single.length>1?ioc(single):null,
    opening32:GP(single.slice(0,32))});
  at+=page.indices.length;
}
assert.equal(at,input.length);
const p40=continuous.find(p=>p.page===40),p53=continuous.find(p=>p.page===53);
assert.equal(p40.n,231);
assert.equal(p53.n,179);
assert.ok(ioc(real.out)<0.04);
const separate=reset.flatMap(p=>p.n>0?p.ioc:[]).filter(x=>x>0);
const result={source:{leftDots:'01101',rightDots:'11111',
  initialState:[13,31],modulus:29,exponents:[3,5],
  feedback:"L'=R;R'=L+C",key:'K=L^3+R^5',clock:'one source rune including F'},
  originalN:input.length, originalIoC:ioc(input),
  continuousIoC:ioc(real.out), solvedGPControlIoC:ioc(native),
  p40Continuous:p40,p53Continuous:p53,
  p42Continued:continuous.find(p=>p.page===42),
  perPageResetMedianIoC:separate.sort((a,b)=>a-b)[Math.floor(separate.length/2)],
  perPageContinuous:continuous,perPageReset:reset,
  sourceNativePlantRecovered:input.length,originalReplayed:input.length,
  historicalOpcodeSelected:false,unknownPlaintextRecovered:0};
console.log(JSON.stringify(result,null,2));
console.log('PASS full original p40-p53 source nonlinear 13/31 two-register inverse, native GP planted and wrong-art control');
