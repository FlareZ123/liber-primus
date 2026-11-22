'use strict';

/**
 * All 550 initial phases of the cuneiform 1033^j mod3301 stream, under the
 * authentic solved-LP plaintext-F bypass rule, on all five original numbered
 * passages. Windows Node.js 22; no packages, no file writes.
 * This source-motivated DH transport remains a hypothesis, not a first-party
 * instruction from Cicada.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const book=JSON.parse(fs.readFileSync(path.join(
  __dirname,'..','resources','liber-primus','lp2-corpus.json'),'utf8'));
const pages=new Map(book.pages.map(p=>[p.page,p.indices]));
const parts=[
  pages.get(36).slice(99,238),
  pages.get(37).slice(0,91),
  pages.get(37).slice(91,189),
  pages.get(37).slice(189,228).concat(pages.get(38).slice(0,57)),
  pages.get(38).slice(57,186),
];
assert.deepEqual(parts.map(p=>p.length),[139,91,98,96,129]);
const cipher=parts.flat();
assert.equal(cipher.length,553);
assert.equal(cipher.filter(x=>x===0).length,12);
assert.equal(pages.get(57).length,95);

const orbit=[];let x=1;
do {
  assert(!orbit.includes(x),'unexpected short DH orbit');
  orbit.push(x);
  x=(x*1033)%3301;
} while(x!==1);
assert.equal(orbit.length,550);
assert.deepEqual(orbit.slice(0,2),[1,1033]);
const phi=Array.from({length:3301},(_,i)=>i);
for(let p=2;p<phi.length;p++)if(phi[p]===p)
  for(let q=p;q<phi.length;q+=p)phi[q]-=phi[q]/p;
const tapes={
  raw:orbit.map(v=>v%29),
  totient:orbit.map(v=>phi[v]%29),
};
const mod29=x=>((x%29)+29)%29;

/**
 * Exhaustively tracks key-consumption counts. At C=F, either P=F bypasses
 * without advancing, or decrypted P non-F consumes the key. At C non-F,
 * plaintext F is impossible, so only the non-F consuming branch survives.
 * @param {number[]} observed
 * @param {number[]} tape
 * @param {number} phase
 * @param {-1|1} sign P=(C+sign*K) mod29
 * @returns {{prefix:number, states:Set<number>, maxStates:number}}
 */
function walk(observed,tape,phase,sign){
  let states=new Set([0]),maxStates=1;
  for(let i=0;i<observed.length;i++){
    const next=new Set();
    for(const used of states){
      const k=tape[(phase+used)%550];
      if(observed[i]===0)next.add(used);
      if(mod29(observed[i]+sign*k)!==0)next.add(used+1);
    }
    states=next;maxStates=Math.max(maxStates,states.size);
    if(!states.size)return{prefix:i,states,maxStates};
  }
  return{prefix:observed.length,states,maxStates};
}
/**
 * Genuine known GP plaintext is the encoder input. F is literal and does
 * not advance the DH register; a non-F may encrypt to ciphertext F.
 * @param {number[]} plain
 * @param {number[]} tape
 * @param {number} phase
 * @param {-1|1} sign
 */
function encrypt(plain,tape,phase,sign){
  let used=0;
  const output=plain.map(p=>{
    if(p===0)return 0;
    const c=mod29(p-sign*tape[(phase+used)%550]);
    used++;return c;
  });
  return {output,used};
}
// Original solved PARABLE GP runes repeated at the exact 553 source length;
// keep exactly three source-native Fs, replacing any extra F with index1
// only in this explicit control, to exercise exactly 550 consumed key symbols.
const native=pages.get(57);
const plant=Array.from({length:553},(_,i)=>native[i%native.length]);
let preservedF=0;
for(let i=0;i<plant.length;i++)if(plant[i]===0){
  if(preservedF<3)preservedF++;
  else plant[i]=1;
}
assert.equal(preservedF,3);
assert.equal(plant.filter(v=>v===0).length,3);
let checkedControls=0;
for(const tape of Object.values(tapes))
  for(const sign of [-1,1])
    for(const phase of [0,185]){
      const encoded=encrypt(plant,tape,phase,sign);
      assert.equal(encoded.used,550);
      const decoded=walk(encoded.output,tape,phase,sign);
      assert.equal(decoded.prefix,553);
      assert(decoded.states.has(550));
      checkedControls++;
    }
const rows=[];
for(const [mode,tape] of Object.entries(tapes))
  for(const sign of [-1,1]){
    let survivingPhases=0,longestPrefix=-1,longestPhase=-1,maxStates=0;
    for(let phase=0;phase<550;phase++){
      const r=walk(cipher,tape,phase,sign);
      if(r.prefix===553)survivingPhases++;
      if(r.prefix>longestPrefix){
        longestPrefix=r.prefix;longestPhase=phase;
      }
      maxStates=Math.max(maxStates,r.maxStates);
    }
    rows.push({mode,sign,initialPhases:550,survivingPhases,
      longestPrefix,longestPhase,maxStates});
  }
assert.deepEqual(rows.map(r=>r.survivingPhases),[0,0,0,0]);
assert.deepEqual(rows.map(r=>r.longestPrefix),[281,266,352,225]);
assert.deepEqual(rows.map(r=>r.longestPhase),[150,30,185,129]);
assert.equal(checkedControls,8);
console.log(JSON.stringify({
  source:{passageLengths:parts.map(p=>p.length),
    originalRunes:cipher.length,originalCiphertextF:12,
    dhGenerator:1033,dhModulus:3301,dhOrder:orbit.length},
  testedPhases:2200,results:rows,
  positive:{nativeSource:'solved p57 GP native',transparentF:3,
    consumed:550,exactRoundtripControls:checkedControls},
  decision:'No complete original F-valid DH-phase inversion exists; zero unknown plaintext recovered.'
},null,2));
