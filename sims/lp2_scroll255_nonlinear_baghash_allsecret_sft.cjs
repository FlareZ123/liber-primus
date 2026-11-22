'use strict';
/**
 * Conditional all-secret source bag-hash test for the fitted GF4/radix59
 * 255-word scroll -> 255 p8-rune interface. Windows 11 Node 22.
 * Arbitrary secret lookup f(T(word)) must agree at identical T.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const dir = path.join(__dirname, '..', 'resources', 'liber-primus');
/** @param {string} f @returns {string} */
const read = f => fs.readFileSync(path.join(dir,f),'utf8');
const gp = JSON.parse(read('lp2-corpus.json'));
const grid = JSON.parse(read('lp2-grid-256.json'));
const spans = read('lp2-transcription.txt').split('%');
const rune = new Map(gp.runes.map((r,i)=>[r,i]));
const words=[]; let word=[];
for(let p=3;p<=7;p++)for(const c of spans[p]){
  if(rune.has(c))word.push(rune.get(c));
  else if((c==='-'||c==='.')&&word.length){words.push(word);word=[];}
}
if(word.length)words.push(word);
assert.equal(words.length,255);
assert.deepEqual(words.flat(),gp.pages.slice(3,8).flatMap(x=>x.indices));
const alpha=grid.alphabet.replace('f','');
const tokens=grid.pages.flatMap(p=>p.tokens);
const table=tokens.map(t=>59*alpha.indexOf(t[0])+alpha.indexOf(t[1]));
assert.equal(table.length,256);
const mod=x=>(x%29+29)%29;
/** @param {number} a @param {number} b @returns {number} */
function gf4(a,b){
  let z=0;for(let i=0;i<2;i++){if((b>>>i)&1)z^=a;a<<=1;if(a&4)a^=7;}return z;
}
let state=[2,0,0,0];const addresses=[];
for(let i=0;i<255;i++){
  addresses.push(state.reduce((a,v)=>4*a+v,0));
  const next=gf4(state[0],3)^gf4(state[1],2)^gf4(state[3],3);
  state=[state[1],state[2],state[3],next];
}
assert.equal(new Set(addresses).size,255);
assert.equal(addresses.includes(0),false);
assert.deepEqual(state,[2,0,0,0]);
const output=gp.pages[8].indices.map((v,i)=>mod(v+table[addresses[i]]));
assert.deepEqual([[47,240],[48,231],[235,236],[88,179]].map(([i,j])=>[output[i],output[j]]),
  [[20,20],[8,8],[2,2],[9,9]]);
/** @param {number[]} w @param {(x:number)=>number} f @returns {number} */
const sum=(w,f)=>mod(w.reduce((a,x)=>a+f(x),0));
/** @param {number[]} w @param {(x:number)=>number} f @returns {number} */
const product=(w,f)=>w.reduce((a,x)=>mod(a*f(x)),1);
const sig={
  'rune-index-sum':w=>[sum(w,x=>x)],
  'prime-sum':w=>[sum(w,x=>gp.prime[x])],
  'ordinal-product':w=>[product(w,x=>x+1)],
  'prime-product':w=>[product(w,x=>gp.prime[x])],
  'index-sum+prime-product':w=>[sum(w,x=>x),product(w,x=>gp.prime[x])],
  'prime-sum+prime-product':w=>[sum(w,x=>gp.prime[x]),product(w,x=>gp.prime[x])],
  'index-sum+ordinal-product':w=>[sum(w,x=>x),product(w,x=>x+1)],
  'length+prime-product':w=>[w.length,product(w,x=>gp.prime[x])],
  'length+prime-sum+prime-product':w=>[w.length,sum(w,x=>gp.prime[x]),product(w,x=>gp.prime[x])],
  'length+index-sum+ordinal-product':w=>[w.length,sum(w,x=>x),product(w,x=>x+1)]
};
const expected=[
  [29,29,198],[29,29,199],[29,29,201],[29,29,199],
  [203,37,46],[203,39,47],[204,36,46],[124,64,118],
  [235,15,15],[240,11,11]
];
let k=0;
for(const [name,fn] of Object.entries(sig)){
  const groups=new Map();
  words.forEach((w,i)=>{const s=fn(w).join(',');if(!groups.has(s))groups.set(s,[]);groups.get(s).push(i);});
  let conflicts=0, errors=0, witness=null;
  for(const [name,ids] of groups){
    const freq=new Map();
    ids.forEach(i=>freq.set(output[i],(freq.get(output[i])||0)+1));
    errors+=ids.length-Math.max(...freq.values());
    if(freq.size>1){conflicts++;if(!witness){
      const i=ids[0],j=ids.find(n=>output[n]!==output[i]);
      witness={signature:name,wordIndices:[i,j],wordRunes:[words[i],words[j]],correctedRunes:[output[i],output[j]]};
    }}
  }
  assert.deepEqual([groups.size,conflicts,errors],expected[k++]);
  assert(witness);
  const secret=new Map([...groups.keys()].map((s,i)=>[s,(7*i+11)%29]));
  for(const [s,ids] of groups)for(const i of ids)assert.equal(secret.get(fn(words[i]).join(',')),secret.get(s));
  console.log(JSON.stringify({digest:name,classes:groups.size,conflicts,minimumWrongEvenWithArbitrarySecretLookup:errors,witness}));
}
console.log('PASS: 10 original-source nonlinear secret-lookup exclusions, planted controls');
