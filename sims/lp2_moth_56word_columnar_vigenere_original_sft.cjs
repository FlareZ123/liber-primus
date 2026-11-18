'use strict';
/**
 * Source-native SFT: 56 words on repeated moth illustrations (LP2 p53/p55)
 * as per-page keys for a historical columnar-transposition + GP29 Vigenere
 * candidate. Node 22+, CommonJS, original rune corpus only.
 */
const assert=require('node:assert/strict');
const {readFileSync}=require('node:fs');
const {join}=require('node:path');
const root=join(__dirname,'..','resources','liber-primus');
const corpus=JSON.parse(readFileSync(join(root,'lp2-corpus.json'),'utf8'));
const source=readFileSync(join(root,'lp2-transcription.txt'),'utf8').split('%');
const set=new Set(corpus.runes);
/** @param {string} pageSection @returns {number[][]} */
function words(pageSection){
 return pageSection.replace(/[\/\r\n]/g,'').replace(/[&$]/g,'.')
 .split(/[.-]/).filter(Boolean)
 .map(s=>[...s].filter(ch=>set.has(ch)).map(ch=>corpus.runes.indexOf(ch)))
 .filter(w=>w.length);
}
// The numeric-only physical p50 is not in this legacy transcription's
// % page separators: text part52 is physical p53, part54 is physical p55.
const donorA=words(source[52]),donorB=words(source[54]);
assert.equal(donorA.length,40);
assert.equal(donorB.length,17);
assert.equal(donorB[0].length,1); // lone NG carried from physical p54
const keys=donorA.concat(donorB.slice(1));
assert.equal(keys.length,56);
assert.equal(keys.reduce((n,w)=>n+w.length,0),254);
/** @param {number[]} v @param {number[]} key @param {boolean} forward @returns {number[]} */
function columnar(v,key,forward){
 const k=key.length,n=v.length,order=key.map((_,i)=>i).sort((a,b)=>key[a]-key[b]||a-b);
 const counts=key.map((_,i)=>Math.floor(n/k)+(i<n%k?1:0));
 const cols=key.map(()=>[]);
 if(forward){for(let i=0;i<n;i++)cols[i%k].push(v[i]);return order.flatMap(i=>cols[i]);}
 let i=0;for(const col of order){cols[col]=v.slice(i,i+counts[col]);i+=counts[col];}
 const out=[];for(let row=0;row<Math.ceil(n/k);row++)for(let col=0;col<k;col++)
  if(row<cols[col].length)out.push(cols[col][row]);
 return out;
}
/** @param {number[]} v @param {number[]} key @param {number} sign @returns {number[]} */
function vig(v,key,sign){return v.map((x,i)=>(x+29+sign*key[i%key.length])%29);}
/** @param {number[]} xs @returns {number} */
function ioc(xs){
 const hist=Array(29).fill(0);for(const x of xs)hist[x]++;
 return hist.reduce((a,v)=>a+v*(v-1),0)/(xs.length*(xs.length-1));
}
const n=corpus.pages.slice(0,56).reduce((a,p)=>a+p.indices.length,0);
assert.equal(n,12956);
for(const operation of ['transpose-first','vigenere-first']){
 for(const sign of [-1,1]){
  const outputs=[],pages=[];
  for(let p=0;p<=55;p++){
   const original=corpus.pages[p].indices,key=keys[p];if(!original.length)continue;
   const out=operation==='transpose-first'
    ? vig(columnar(original,key,false),key,sign)
    : columnar(vig(original,key,sign),key,false);
   const replay=operation==='transpose-first'
    ? columnar(vig(out,key,-sign),key,true)
    : vig(columnar(out,key,true),key,-sign);
   assert.deepEqual(replay,original);
   outputs.push(...out);
   pages.push({p,ioc:ioc(out)});
  }
  const high=pages.filter(x=>x.ioc>=0.05);
  assert.equal(high.length,0);
  const wholeIoc=ioc(outputs);
  assert.ok(wholeIoc>0.0344&&wholeIoc<0.0345);
  console.log(JSON.stringify({operation,sign,donorWords:keys.length,decodedRunes:outputs.length,
    wholeIoc,pagesIocAtLeastPoint05:high.length,topPages:pages.sort((a,b)=>b.ioc-a.ioc).slice(0,3)}));
 }
}
