'use strict';
/**
 * Source P7 quartic as *reversible* four-round, two-GP-rune Feistel F.
 * Page8 red whole-word GP0 products [4,3] select 4 rounds and
 * a constant source step of 3 within P(right+3*round).
 * One frozen candidate before original plaintext inspection;
 * two directions, original p8 black+authentic p9 carry, plus all-p0..55
 * untouched diagnostic receiver. Windows Node22, CJS, source-native controls.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const gp=JSON.parse(fs.readFileSync(path.join(__dirname,'..','resources',
  'liber-primus','lp2-corpus.json'),'utf8'));
const mod=x=>(x%29+29)%29;
/** @param {number} x @returns {number} */
const P=x=>mod(11+26*x+8*x*x+15*x*x*x+2*x*x*x*x);
for(let x=0;x<29;x++)assert.equal(mod(P(x)-x),
  mod(2*(x-3)*(x-4)*(x*x-8)));
const title=gp.pages[8].indices.slice(0,12);
assert.equal(title.length,12);
assert.deepEqual([title.slice(0,4),title.slice(4)]
  .map(w=>w.reduce((s,x)=>mod(s*x),1)),[4,3]);
const source=gp.pages.slice(0,56).flatMap(p=>p.indices);
assert.equal(source.length,12956);
const body=gp.pages[8].indices.slice(12)
  .concat(gp.pages[9].indices.slice(0,5));
assert.equal(body.length,248);
/** @param {number[]} a @returns {number} */
function ioc(a){
  const f=Array(29).fill(0);for(const x of a)f[x]++;
  return f.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1));
}
/** @param {[number,number]} pair @param {'encrypt'|'decrypt'} direction
 * @returns {[number,number]} */
function feistel(pair,direction){
  let [L,R]=pair;
  if(direction==='encrypt'){
    for(let round=0;round<4;round++){
      [L,R]=[R,mod(L+P(mod(R+3*round)))];
    }
  }else{
    for(let round=3;round>=0;round--){
      [L,R]=[mod(R-P(mod(L+3*round))),L];
    }
  }
  return [L,R];
}
/** @param {number[]} input @param {'encrypt'|'decrypt'} direction
 * @returns {number[]} */
function transform(input,direction){
  assert.equal(input.length%2,0);
  const out=[];
  for(let i=0;i<input.length;i+=2)
    out.push(...feistel([input[i],input[i+1]],direction));
  return out;
}
const solved=gp.pages[57].indices;
assert.equal(solved.length,95);
assert(ioc(solved)>0.06);
const cases=[];
for(const [scope,cipher] of [['p8-black-plus-p9-carry',body],
                           ['whole-original-unknown',source]]){
  const plant=Array.from({length:cipher.length},(_,i)=>solved[i%solved.length]);
  for(const direction of ['decrypt','encrypt']){
    const inverse=direction==='decrypt'?'encrypt':'decrypt';
    const output=transform(cipher,direction);
    assert.deepEqual(transform(output,inverse),cipher);
    assert.deepEqual(transform(transform(plant,inverse),direction),plant);
    cases.push({scope,direction,originalRunes:cipher.length,
      originalIoC:ioc(cipher),decodedIoC:ioc(output),
      decodedPrefix:output.slice(0,42).map(x=>gp.translit[x]).join(' '),
      firstSectionP0IoC:scope==='whole-original-unknown'
        ?ioc(output.slice(0,gp.pages[0].indices.length)):null,
      realFullReplay:true,solvedP57Plant:true});
  }
}
assert.equal(cases.length,4);
console.log(JSON.stringify({
  source:'p7 red products as P(X), p8 two red title word products [4,3]',
  fixedFeistel:'4 rounds: (L,R)->(R,L+P(R+3r)) mod29, r=0..3',
  modelCount:cases.length,outputs:cases,
  originalCiphers:[{recipient:'p8-black+physical-p9-five-carry',length:248},
    {recipient:'all physical p0–p55 original runes',length:12956}],
  interpretation:'A reversible candidate, not an attested Cicada opcode'
},null,2));
console.log('PASS: source p7 polynomial four-round Feistel original input and solved controls');
