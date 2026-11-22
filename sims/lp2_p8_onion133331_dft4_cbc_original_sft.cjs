'use strict';
/**
 * Original source-selected p7/p8 + onion7 133/331 fourth-root inverse.
 * Source packet: p8 red 4 IV + red 8 key + black 248 complete carried words.
 * Test exactly the two textbook GF29 DFT4/CBC placements, both printed
 * reciprocal fourth roots (12,17), and both key directions on original
 * p8-14 untouched runes. Windows Node.js 22 CommonJS SFT, read-only.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} name @returns {string} */
const read = name => fs.readFileSync(path.join(root,name),'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const ink = JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const html = read('resources/historical/cicada2014-onion7-original-index.html');
/** @param {number} n @returns {number} */
const mod = n => (n % 29 + 29) % 29;
const title = Number(html.match(/<title>(\d+)<\/title>/)[1]);
const container = Number(html.match(/<div id="(\d+)"/)[1]);
assert.deepEqual([title,container],[133,331]);
assert.deepEqual([mod(title),mod(container)],[17,12]);
assert.equal(mod(title*container),1);
assert.equal(mod(12*12),28);
assert.equal(mod(17*17),28);
const pg = n => gp.pages[n].indices;
const p8 = pg(8), p9 = pg(9);
const annotation = ink.pages.find(p=>p.page===8);
assert.deepEqual(annotation.red_spans.map(s=>[s.start,s.length]),[[0,12]]);
assert.deepEqual(p8.slice(0,12),[14,10,14,19,1,14,19,5,2,13,3,17]);
const iv = p8.slice(0,4), key = p8.slice(4,12);
const body = p8.slice(12).concat(p9.slice(0,5));
assert.equal(body.length,248); // p8 last black word continues 5 runes into p9
assert.equal(iv.length+key.length+body.length,260);
assert.equal(key.length+body.length,256);
assert.equal(p8.length,255);
const original = gp.pages.slice(8,15).flatMap((p,i)=>
  i===0?p.indices.slice(12):p.indices);
assert.equal(original.length,1717);
const chapter = original.slice(0,1716);
assert.deepEqual(chapter.slice(0,248),body);
const p7red = pg(7).slice(-14);
const widths=[2,4,3,2,3];
let pos=0;
const coeff=widths.map(n=>{
 const product=p7red.slice(pos,pos+n).reduce((a,b)=>mod(a*b),1);
 pos+=n;return product;
});
assert.deepEqual(coeff,[11,26,8,15,2]);
/** @param {number[]} c @param {number} x @returns {number} */
const poly = (c,x)=>c.reduceRight((a,b)=>mod(a*x+b),0);
const deriv=coeff.slice(1).map((v,i)=>mod(v*(i+1)));
assert.equal(poly(coeff,19),12);
assert.equal(poly(deriv,4),17);
assert.equal(p8.slice(0,12).reduce((p,x)=>mod(p*x),1),12);
assert.equal(p8[11],17);

/**
 * Enumerate all 5! original red whole-word product orderings without fitting
 * keys. The two independent typed p8 operands are XIX=19 and word-length4;
 * expected outputs 12/17 occur both in original red title and archived HTML.
 * @param {number[]} vals @returns {number[][]}
 */
function permutations(vals){
 if(!vals.length)return [[]];
 return vals.flatMap((v,i)=>permutations(vals.filter((_,j)=>j!==i))
   .map(rest=>[v,...rest]));
}
const orders=permutations(coeff);
assert.equal(orders.length,120);
const predicate=(candidate)=>({
 at19:poly(candidate,19)===mod(idNum),
 slopeAt4:poly(candidate.slice(1).map((v,i)=>mod(v*(i+1))),4)===mod(title)
});
// idNum is 331 (residue12); title is 133 (residue17).
const hits=orders.map(candidate=>({candidate,...predicate(candidate)}));
const at19=hits.filter(h=>h.at19), slope=hits.filter(h=>h.slopeAt4),
  both=hits.filter(h=>h.at19&&h.slopeAt4);
assert.equal(at19.length,4);
assert.equal(slope.length,7);
assert.equal(both.length,1);
assert.deepEqual(both[0].candidate,coeff);

/** @param {number[]} values @param {12|17} omega
 * @param {boolean} inverse @returns {number[]} */
function dft4(values,omega,inverse){
 assert.equal(values.length,4);
 return Array.from({length:4},(_,k)=>{
   let total=0;
   for(let j=0;j<4;j++){
     const power=((inverse?-1:1)*j*k%4+4)%4;
     assert(power>=0&&power<4);
     total+=values[j]*(omega**power);
   }
   return mod((inverse?22:1)*total);
 });
}
/** @param {number[]} plain @param {12|17} omega
 * @param {'before'|'after'} placement @param {-1|1} direction */
function encrypt(plain,omega,placement,direction){
 assert.equal(plain.length%4,0);
 let previous=iv;
 const out=[];
 for(let i=0;i<plain.length;i+=4){
   const block=plain.slice(i,i+4);
   const k=key.slice((i/4%2)*4,(i/4%2+1)*4);
   const input=block.map((x,j)=>mod(x+direction*k[j]+
     (placement==='before'?previous[j]:0)));
   const transformed=dft4(input,omega,false);
   const output=transformed.map((x,j)=>mod(x+
     (placement==='after'?previous[j]:0)));
   out.push(...output);
   previous=output;
 }
 return out;
}
/** @param {number[]} cipher @param {12|17} omega
 * @param {'before'|'after'} placement @param {-1|1} direction */
function decrypt(cipher,omega,placement,direction){
 assert.equal(cipher.length%4,0);
 let previous=iv;
 const out=[];
 for(let i=0;i<cipher.length;i+=4){
   const block=cipher.slice(i,i+4);
   const k=key.slice((i/4%2)*4,(i/4%2+1)*4);
   const input=block.map((x,j)=>mod(x-
     (placement==='after'?previous[j]:0)));
   const transformed=dft4(input,omega,true);
   out.push(...transformed.map((x,j)=>mod(x-direction*k[j]-
     (placement==='before'?previous[j]:0))));
   previous=block;
 }
 return out;
}
/** @param {number[]} symbols @returns {number} */
function ioc(symbols){
 const count=Array(29).fill(0);
 for(const n of symbols)count[n]++;
 return count.reduce((n,x)=>n+x*(x-1),0)/
   (symbols.length*(symbols.length-1));
}
const solved=Array.from({length:248},(_,i)=>pg(57)[i%95]);
const cases=[];
for(const omega of [12,17])for(const placement of ['before','after'])
 for(const direction of [-1,1]){
   const planted=encrypt(solved,omega,placement,direction);
   assert.deepEqual(decrypt(planted,omega,placement,direction),solved);
   const p8Plain=decrypt(body,omega,placement,direction);
   const chapterPlain=decrypt(chapter,omega,placement,direction);
   assert.deepEqual(encrypt(p8Plain,omega,placement,direction),body);
   assert.deepEqual(encrypt(chapterPlain,omega,placement,direction),chapter);
   cases.push({omega,placement,direction,
     p8Carry248IoC:ioc(p8Plain),p8p14First1716IoC:ioc(chapterPlain),
     p8First32:p8Plain.slice(0,32).map(x=>gp.translit[x]).join(''),
     sourceNativePlant:'248/248 exact; both original ciphertext replay exact'});
 }
assert.equal(cases.length,8);
assert(cases.every(c=>c.p8Carry248IoC<0.04));
assert(cases.every(c=>c.p8p14First1716IoC<0.04));
console.log(JSON.stringify({
 status:'PASS: source-aligned GF29 fourth root / DFT4 CBC variants yield no native GP29 original plaintext',
 historicalHTML:{title,container,GP29Residues:[17,12],inverseProduct:1},
 originalCoefficientPermutationGate:{all:120,at19:at19.length,derivativeAt4:slope.length,joint:both.length,winner:both[0].candidate},
 p7p8:{coeff,p7PolyAtRoman19:12,derivativeAt4:17,
    p8Red4IV:iv,p8Red8Key:key,p8RedWholeProduct:12},
 original:{p8BlackPlusFirstFullP9Word:248,
    originalRed4IVPlus256Packet:260,continuedChapterFirst1716:1716},
 candidates:cases,
 limitations:'The arithmetic cross-source match is source-exact but the Fourier/CBC interpretation is not first-party-authored; excludes only these 8 exact reversible constructions, and gives no unknown plaintext.'
},null,2));
