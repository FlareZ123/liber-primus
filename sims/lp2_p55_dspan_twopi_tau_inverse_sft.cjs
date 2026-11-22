"use strict";
/**
 * Exploratory p55 TWO + deep P + center I -> TWO PI reading.
 * The geometric meaning 2*pi is a hypothesis, not an authored instruction.
 * Test the source-frozen direct cipher consumer against original p55.
 * Node 22: node sims/lp2_p55_dspan_twopi_tau_inverse_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const db=JSON.parse(fs.readFileSync(path.join(__dirname,"..",
  "resources/liber-primus/lp2-corpus.json"),"utf8"));
const MOD=29;
/** @param {number} n */
const mod=n=>((n%MOD)+MOD)%MOD;
const cipher=db.pages[55].indices;
const solved=db.pages[57].indices;
assert.deepEqual([cipher.length,solved.length],[76,95]);
const lengths=[1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3];
const words=[];
let idx=0;
for(const len of lengths){words.push(cipher.slice(idx,idx+len));idx+=len;}
assert.equal(idx,76);
const interior=words.flatMap(w=>w.slice(1,-1));
assert.equal(interior.length,43);
assert.deepEqual(interior.flatMap((n,i)=>n===23?[i+1]:[]),[5,23]);
const between=interior.slice(5,22);
assert.deepEqual(between,[2,27,24,17,5,28,0,14,10,19,1,5,13,8,21,20,15]);
/** @param {number[]} a */
function fold(a){
  const result=[];
  for(let i=0;i<Math.floor(a.length/2);i++)
    result.push(mod(a[i]-a[a.length-i-1]));
  if(a.length%2)result.push(a[Math.floor(a.length/2)]);
  return result;
}
const layers=[between];
while(layers.at(-1).length>1)layers.push(fold(layers.at(-1)));
assert.deepEqual(layers.map(a=>a.length),[17,9,5,3,2,1]);
assert.deepEqual(layers[1].slice(0,3),[16,7,3]); // TWO
assert.equal(between[8],10); // I, untouched original center
assert.equal(layers[1].at(-1),10); // the same I
assert.deepEqual(layers.at(-1),[13]); // final P

/** Machin's pi=16 atan(1/5)-4 atan(1/239), fixed-point.
 * @param {bigint} n
 * @param {bigint} scale
 */
function atanInv(n,scale){
  let sum=0n,pow=n;
  for(let k=0n;;k++){
    const term=scale/((2n*k+1n)*pow);
    if(term===0n)break;
    sum+=k%2n===0n?term:-term;
    pow*=n*n;
  }
  return sum;
}
const SCALE=29n**110n;
const tau=2n*(16n*atanInv(5n,SCALE)-4n*atanInv(239n,SCALE));
const integer=Number(tau/SCALE);
assert.equal(integer,6);
let rem=tau%SCALE;
const digits=[];
for(let i=0;i<100;i++){
  rem*=29n;
  digits.push(Number(rem/SCALE));
  rem%=SCALE;
}
assert.deepEqual(digits.slice(0,12),[8,6,4,17,17,0,25,10,24,16,10,23]);

/** Fully branched historical plaintext-F-transparent inverse.
 * @param {number[]} data
 * @param {number[]} key
 */
function inverse(data,key){
  let states=[{clock:0,plain:[]}];
  for(let i=0;i<data.length;i++){
    const next=[];
    for(const state of states){
      if(data[i]===0)next.push({clock:state.clock,
        plain:state.plain.concat(0)});
      const val=mod(data[i]-key[state.clock]);
      if(val!==0)next.push({clock:state.clock+1,
        plain:state.plain.concat(val)});
    }
    states=next;
    if(!states.length)return {count:0,failure:i,states:[]};
  }
  return {count:states.length,failure:null,states};
}
/** @param {number[]} plain @param {number[]} key */
function encode(plain,key){
  let k=0;
  return plain.map(v=>v===0?0:mod(v+key[k++]));
}
const outcomes={};
for(const [kind,key] of Object.entries({
  fractional:digits,integerFirst:[integer].concat(digits)})){
  const full=inverse(cipher,key);
  const suffix=inverse(cipher.slice(1),key);
  outcomes[kind]={full:[full.count,full.failure],
    suffix:[suffix.count,suffix.failure]};
  const encryptedPlant=encode(solved,key);
  const recovered=inverse(encryptedPlant,key);
  assert.ok(recovered.states.some(s=>
    s.plain.every((v,i)=>v===solved[i])));
}
assert.deepEqual(outcomes,{
  fractional:{full:[3,null],suffix:[0,11]},
  integerFirst:{full:[0,12],suffix:[0,5]}
});
const candidates=inverse(cipher,digits).states.map(s=>s.plain);
for(const plain of candidates)assert.deepEqual(encode(plain,digits),cipher);
/** @param {number[]} a */
function ioc(a){
  const tally=Array(29).fill(0);
  for(const n of a)tally[n]++;
  return tally.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1));
}
const spell=a=>a.map(n=>db.translit[n]).join("");
assert.equal(spell(candidates[0].slice(0,12)),"PMSOEMSNGRAEATHEO");
process.stdout.write(JSON.stringify({
  source:"Original p55 76-rune and clear p57 95-rune arrays",
  fold:layers.map(a=>a.map(n=>db.translit[n]).join(" ")),
  tentativeReading:"TWO + final P + preserved center I => TWO PI",
  tauBase29First20:digits.slice(0,20),
  outcomes,candidates:candidates.map(a=>({ioc:ioc(a),runes:spell(a)})),
  classification:"No recovered original unknown plaintext or authenticated key"
},null,2)+"\n");
