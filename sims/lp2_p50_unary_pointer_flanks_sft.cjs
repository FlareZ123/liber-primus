'use strict';

/**
 * Bounded original-source necessary-condition gate for Director #2214.
 * Pure unary table-pointer state updates cannot stay aperiodic on BOTH
 * source p49 (66 GP29 runes) and p51 (92 GP29 runes).
 * No attacker-chosen key, phase, radix outside original-valid 59/60.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const grid=JSON.parse(fs.readFileSync(path.join(root,'resources','liber-primus','lp2-grid-256.json'),'utf8'));
const corpus=JSON.parse(fs.readFileSync(path.join(root,'resources','liber-primus','lp2-corpus.json'),'utf8'));
const tokens=grid.pages.flatMap(p=>p.tokens);
assert.equal(tokens.length,256);
const flankSizes=[49,51].map(p=>corpus.pages.find(x=>x.page===p).indices.length);
assert.deepEqual(flankSizes,[66,92]);
function orbit(map,start) {
  const seen=new Map();let state=start,steps=0;
  while(!seen.has(state)){seen.set(state,steps++);state=map[state]}
  const preperiod=seen.get(state);
  return {start,preperiod,period:steps-preperiod};
}
for(const radix of [60,59]) {
  const digits=radix===60?grid.alphabet:grid.alphabet.replace('f','');
  assert.equal(digits.length,radix);
  const table=tokens.map(s=>radix*digits.indexOf(s[0])+digits.indexOf(s[1]));
  assert(table.every(v=>v>=0&&v<256));
  const orbits=Array.from({length:256},(_,i)=>orbit(table,i));
  const maxTransient=Math.max(...orbits.map(v=>v.preperiod));
  const possiblePeriods=[...new Set(orbits.map(v=>v.period))].sort((a,b)=>a-b);
  const expectedPeriod=radix===60?[2,11]:[1];
  assert.deepEqual(possiblePeriods,expectedPeriod);
  assert.equal(maxTransient,radix===60?24:38);
  assert.deepEqual(orbits.filter(v=>v.preperiod===maxTransient).map(v=>v.start),
    radix===60?[71]:[98,134]);
  const seeds=[0,79,80,183,184,255].map(i=>orbits[i]);
  const remainders=flankSizes.map(n=>n-maxTransient);
  assert(remainders.every(v=>v>0));
  console.log('Source radix'+radix+
    ' periods '+possiblePeriods+' maxTransient '+maxTransient+
    '; total source flank lengths '+flankSizes+
    '; unavoidable tail of unary outputs '+remainders+
    '; seams '+JSON.stringify(seeds));
  // Explicit planted positive: all raw state paths continue precisely
  // with cycle period once their actual cycle begins.
  for(let i=0;i<256;i++) {
    const {preperiod,period}=orbits[i];
    let state=i;
    const history=[state];
    for(let k=0;k<flankSizes[1]+period;k++){state=table[state];history.push(state)}
    for(let k=preperiod;k+period<history.length;k++)
      assert.equal(history[k],history[k+period]);
  }
}
console.log('PASS: all 256 original starts, 2 literal source radices and two flanks; '+
  'state must depend on external input to avoid eventual <=11/constant period.');
