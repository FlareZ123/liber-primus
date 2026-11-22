'use strict';
/** Windows Node22 standalone original LP2 p7 five-product 1876-period
 *  all-secret literal-F transparent clock gate. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {encodeSourceNativeGP}=require('./lp2_native_gp_source_orthography_sft.cjs');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const gp=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const mod=x=>((x%29)+29)%29;
const red=[[23,3],[22,16,2,25],[5,7,11],[14,28],[6,28,19]];
assert.deepEqual(gp.pages[7].indices.slice(-14),red.flat());
const w=red.map(a=>a.reduce((p,v)=>mod(p*v),1));
assert.deepEqual(w,[11,26,8,15,2]);assert.equal(gp.prime[18],67);
const book=gp.pages.slice(0,56).flatMap(p=>p.indices);
const floral=gp.pages.slice(40,54).flatMap(p=>p.indices);
/** @param {number[]} a Printed GP29 ciphertext */
function phases(a){let out=[];for(const c of a)if(c!==0)out.push(out.length%1876);return out;}
/** @param {number[]} source 28-nonzero-rune stream @param {number[]} phase */
function score(source,phase){
 assert.equal(source.length,phase.length);
 let bins=Array.from({length:1876},()=>new Uint32Array(29));
 for(let i=0;i<source.length;i++){assert.ok(source[i]>0);bins[phase[i]][source[i]]++;}
 let hit=0,pairs=0;
 for(const f of bins){let n=0;for(const v of f){n+=v;hit+=v*(v-1)/2;}pairs+=n*(n-1)/2;}
 return {runes:source.length,pairs,hit};
}
const a=phases(book),b=phases(floral),actual=score(book.filter(x=>x!==0),a),factual=score(floral.filter(x=>x!==0),b);
assert.deepEqual([actual.runes,actual.pairs,actual.hit],[12498,35592,1305]);
assert.deepEqual([factual.runes,factual.pairs,factual.hit],[2883,1007,26]);
const sources=[
 ['Gibran','resources/control/gibran_prophet_58585.txt'],
 ['Shakespeare','resources/control/shakespeare_first300k.txt'],
 ['Emerson','resources/control/emerson_essays_2944.txt'],
 ['Latin Vulgate','resources/control/latin-vulgate-latin26-wholewords.txt']
];
/** @param {number[]} p Nonzero source-native GP text */
function sourceControls(p){
 let offs=Array.from({length:9},(_,i)=>Math.floor(i*(p.length-a.length)/8));
 const bookHits=offs.map(o=>score(p.slice(o,o+a.length),a).hit);
 const flowerHits=offs.map(o=>score(p.slice(o,o+b.length),b).hit);
 assert.ok(bookHits.every(x=>x>actual.hit));
 assert.ok(flowerHits.every(x=>x>factual.hit));
 return {bookHits,flowerHits};
}
const controls=sources.map(([name,file])=>({name,...sourceControls(
 encodeSourceNativeGP(read(file)).filter(x=>x!==0))}));
const key=[23,2,5,2,19];
for(let i=5;i<a.length;i++)key.push(mod(w.reduce((s,v,j)=>s+v*key[i-j-1],0)));
assert.ok(key.every((x,i)=>i<1876||x===key[i-1876]));
const pow=(x,n)=>{let z=1;for(let i=0;i<n;i++)z=mod(z*x);return z;};
const plain=[],cipher=[],sample=encodeSourceNativeGP(read(sources[0][1])).filter(x=>x!==0);
let clock=0;
for(const c of book){if(c===0){plain.push(0);cipher.push(0);}else{
 const x=sample[clock],factor=pow(2,key[clock++]);plain.push(x);cipher.push(mod(x*factor));}}
const recovered=[];clock=0;
for(const x of cipher){if(x===0)recovered.push(0);else{
 const factor=pow(2,key[clock++]);recovered.push(mod(x*pow(factor,27)));}}
assert.deepEqual(recovered,plain);
assert.deepEqual(score(cipher.filter(x=>x!==0),a),score(plain.filter(x=>x!==0),a));
console.log(JSON.stringify({
 original:actual,floral:factual,sourceControls:controls,period:1876,
 exactPositiveNativeRunes:recovered.length,
 decision:'No source-native GP29 plaintext for the all-F-transparent 1876-period p7 LFSR under any key seed or per-state 28-symbol bijection',
 caveat:'Unknown partial-F mask, page resets or nonlinear key-state feedback remain open'
},null,2));
