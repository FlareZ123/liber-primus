'use strict';
/**
 * One single frozen source-motivated five-phase GP29 nonlinear receiver.
 *
 * Source p7 red five-word products: [11,26,8,15,2], with inverse
 * relationships in the GP29 prime field. Known p28 local "READ OUT"
 * candidate uses the source-visible reciprocal exponent 27 (= -1 mod28).
 *
 * Hypothesis: conjugate that *already proposed* inversion by translation
 * with p7's literal five word products. Every step is invertible:
 * P_i=inv(C_i+K_i)-inv(K_i); C_i=inv(P_i+inv(K_i))-K_i mod29.
 * This leaves GP F(index0) transparent, as in the solved p56 control.
 *
 * The original author does NOT explicitly specify this conjugation,
 * cipher or clock. No part of this experiment authenticates such an
 * operation; it is a bounded original-source receiver test.
 *
 * Windows11 / Node22:
 * node sims/lp2_p7_p28_reciprocal_conjugate_p8_original_sft.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
/** @param {string} p @returns {string} */
const read=p=>fs.readFileSync(path.resolve(root,p),'utf8');
const gp=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcript=read('resources/lp2-transcription.txt');
const rune=new Map(gp.runes.map((r,i)=>[r,i]));
/** @param {number} x @returns {number} */
const mod=x=>(x%29+29)%29;
/** @param {number} x @param {number} e @returns {number} */
function power(x,e){let a=mod(x),n=e,o=1;while(n){if(n%2)o=mod(o*a);a=mod(a*a);n=Math.floor(n/2);}return o;}
/** @param {number} x @returns {number} */
const reciprocal=x=>power(x,27);
for(let x=0;x<29;x++){
 assert.equal(reciprocal(reciprocal(x)),x);
 assert.equal(reciprocal(x),x===0?0:power(x,27));
}
/** @returns {number[]} */
function redProducts(){
 const page7=transcript.split('%')[7];
 const colored=page7.split('&')[1];
 const words=colored.match(/[\u16a0-\u16ff]+/gu);
 assert.deepEqual(words.map(s=>[...s].length),[2,4,3,2,3]);
 return words.map(s=>[...s].reduce((p,r)=>{
   assert(rune.has(r));return mod(p*rune.get(r));
 },1));
}
const K=redProducts();
assert.deepEqual(K,[11,26,8,15,2]);
assert.deepEqual(K.map(reciprocal),[8,19,11,2,15]);
assert.equal(mod(K[0]*K[2]),1);
assert.equal(mod(K[3]*K[4]),1);
const p28Source=[9,28,24,10,1,20];
const p28Proposed=[power(p28Source[0],3),
  ...p28Source.slice(1).map(reciprocal)];
assert.deepEqual(p28Proposed,[4,28,23,3,1,16]);
assert.equal(p28Proposed.map(x=>gp.translit[x]).join(''),'READOUT');
/** @param {number[]} source @param {number} phase @returns {number[]} */
function decode(source,phase){
 return source.map((c,i)=>{
   const k=K[(phase+i)%5];
   return mod(reciprocal(c+k)-reciprocal(k));
 });
}
/** @param {number[]} source @param {number} phase @returns {number[]} */
function encode(source,phase){
 return source.map((p,i)=>{
   const k=K[(phase+i)%5];
   return mod(reciprocal(p+reciprocal(k))-k);
 });
}
/** @param {number[]} arr @returns {{n:number,ioc:number,top5:number,first80:string}} */
function stats(arr){
 const h=Array(29).fill(0);
 arr.forEach(v=>h[v]++);
 const n=arr.length;
 return {n,ioc:Number((h.reduce((s,v)=>s+v*(v-1),0)/(n*(n-1))).toFixed(11)),
  top5:h.slice().sort((a,b)=>b-a).slice(0,5).reduce((a,b)=>a+b,0),
  first80:arr.slice(0,80).map(v=>gp.translit[v]).join('')};
}
const pages=(a,b)=>gp.pages.filter(p=>p.page>=a&&p.page<=b)
 .flatMap(p=>p.indices);
const p8=pages(8,8),p9to14=pages(9,14),p16to21=pages(16,21);
assert.equal(p8.length,255);
assert.equal(p9to14.length,1474);
assert.equal(p16to21.length,1613);
/** @param {string} label @param {number[]} cipher @param {number} phase */
function original(label,cipher,phase){
 const p=decode(cipher,phase);
 assert.deepEqual(encode(p,phase),cipher);
 return {label,source:stats(cipher),decoded:stats(p),
   equalWithin:p.reduce((s,v,i)=>s+Number(i>0&&v===p[i-1]),0)};
}
const originalTests=[
 original('p8 first complete post-red page, 51 groups of five',p8,0),
 original('p9–14, continuous from 255-rune p8',p9to14,p8.length%5),
 original('independent p16–21, phase0 fixed start',p16to21,0)
];
const p57=gp.pages.find(p=>p.page===57).indices;
const english=read('resources/control/shakespeare_first300k.txt')
 .toUpperCase().match(/[A-Z]+/gu).join('').slice(0,1474)
 .replace(/QU/g,'CW').replace(/V/g,'U')
 .replace(/[KQ]/g,'C').replace(/Z/g,'S')
 .replace(/ING/g,'NG');
const idx=Object.fromEntries(gp.translit.map((x,i)=>[x,i]));
/** @param {string} letters @returns {number[]} */
function encodeEnglish(letters){
 const sorted=gp.translit.map((s,i)=>({s,i}))
   .sort((a,b)=>b.s.length-a.s.length);
 const out=[];
 for(let i=0;i<letters.length;){
  const term=sorted.find(v=>letters.startsWith(v.s,i));
  assert(term, 'GP native transliteration failure at '+letters.slice(i));
  out.push(term.i);
  i+=term.s.length;
 }
 return out;
}
const nativeLong=encodeEnglish(english);
assert(nativeLong.length>400);
const plants=[
 {label:'authentic solved-p57 GP rune plaintext',input:p57},
 {label:'long real Shakespeare GP-native text',input:nativeLong}
].map(x=>{
 const cipher=encode(x.input,0);
 const reread=decode(cipher,0);
 assert.deepEqual(reread,x.input);
 return {label:x.label,plaintext:stats(x.input),
  restored:reread.length,exact:true};
});
assert.equal(plants[0].restored,95);
console.log(JSON.stringify({
 hypothesis:'P_i=inv29(C_i + K[i mod 5])−inv29(K[i mod 5])',
 source:{p7products:K,p7reciprocals:K.map(reciprocal),
  originalP28READOUT:p28Proposed.map(v=>gp.translit[v]).join('')},
 originalTests,plants,
 conclusion:'All three original intervals are exactly reversible yet nonlinguistic; reject this specific reciprocal conjugate as the direct GP29 plaintext consumer.'
},null,2));
console.log('PASS: source p7 inverse packet, p28 historical reciprocal readout, intact original p8/p9–14/p16–21 and native solved/plain plants');
