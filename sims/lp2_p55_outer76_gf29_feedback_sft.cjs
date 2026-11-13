'use strict';
/**
 * Original p55's 76 runes vs 32x8 source table's 76 outer-shell cells:
 * one direct GF29 multiplicative ciphertext-feedback consumer.
 * Source matched first, no phase/key fitting.
 * Run: node sims/lp2_p55_outer76_gf29_feedback_sft.cjs
 */
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const ROOT=path.resolve(__dirname,'..');
/** @param {string} p @returns {string} */
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const db=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const table=JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const original=read('resources/liber-primus/lp2-transcription.txt');
const lexSource=read('resources/control/english_wordfreq_textblob.txt');
const trans=db.translit.map((token,i)=>({token,i})).sort((a,b)=>b.token.length-a.token.length);
/** @param {string} english @returns {number[] | null} */
function gp(english){
  const s=english.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U')
    .replace(/K/g,'C').replace(/Z/g,'S').replace(/ING/g,'NG')
    .replace(/IO/g,'IA');
  const out=[];
  for(let p=0;p<s.length;){
    const hit=trans.find(x=>s.startsWith(x.token,p));
    if(!hit)return null;out.push(hit.i);p+=hit.token.length;
  }
  return out;
}
const lex=new Set();
for(const m of lexSource.matchAll(/^([a-z]+) (\d+)$/gm)){
  const w=gp(m[1]);if(w)lex.add(w.join(','));
}
assert.equal(lex.size,29058);
const mod=n=>(n%29+29)%29;
/** @param {number} n @returns {number} */
function inv(n){assert(n>0&&n<29);for(let i=1;i<29;i++)if(n*i%29===1)return i;throw Error('invalid key');}
const p54=db.pages[54].indices;
const p55=db.pages[55].indices;
assert.deepEqual([p54.length,p55.length,table.bytes.length],[232,76,256]);
// Traverse original 32x8 source-visible outer perimeter from top-left.
const cw=[];
for(let x=0;x<8;x++)cw.push(x);
for(let y=1;y<32;y++)cw.push(8*y+7);
for(let x=6;x>=0;x--)cw.push(8*31+x);
for(let y=30;y>=1;y--)cw.push(8*y);
assert.equal(cw.length,76);assert.equal(new Set(cw).size,76);
const ccw=[cw[0],...cw.slice(1).reverse()];
const rune=new Map(db.runes.map((x,i)=>[x,i]));
let page=0,wordId=0,ink=[];
for(const c of original){
  if(rune.has(c)) ink.push({page:page>=50?page+1:page,c:rune.get(c),wordId});
  else if('-.$&§'.includes(c))wordId++;
  else if(c==='%')page++;
}
const original55=ink.filter(x=>x.page===55);
assert.deepEqual(original55.map(x=>x.c),p55);
function cipher(plain,key,prev0){let last=prev0;return plain.map((v,i)=>{
  last=mod(last+key[i]*(v+1));return last;});}
function decipher(src,key,prev0){
  let last=prev0;return src.map((c,i)=>{
    const d=mod((c-last)*inv(key[i])-1);last=c;return d;});}
/** @param {number[]} arr @returns {number} */
function ioc(arr){const f=Array(29).fill(0);for(const v of arr)f[v]++;
  return f.reduce((s,n)=>s+n*(n-1),0)/(arr.length*(arr.length-1));}
const rows=[];
for(const [direction,ring] of [['clockwise',cw],['counterclockwise',ccw]]){
  const keys=ring.map(i=>1+table.bytes[i]%28);
  for(const iv of [0,p54.at(-1)]){
    const out=decipher(p55,keys,iv);
    assert.deepEqual(cipher(out,keys,iv),p55);
    const words=new Map();
    for(let i=0;i<p55.length;i++){
      const id=original55[i].wordId;
      if(!words.has(id))words.set(id,[]);
      words.get(id).push(out[i]);
    }
    const hit=[...words.values()].filter(x=>lex.has(x.join(',')));
    const longHit=hit.filter(x=>x.length>=6);
    assert.equal(longHit.length,0);
    rows.push({direction,initialFeedback:iv,IoC:ioc(out),
      allNativeEnglishWordMatches:hit.length,longNativeEnglishWordMatches:longHit.length,
      GPwordReadout:[...words.values()].map(x=>x.map(i=>db.translit[i]).join('')).join(' ')});
  }
}
// A real GP29 source control with appended EA-initial EACH executes zero-step.
const sourceKnown=db.pages[57].indices.concat(gp('each'));
assert.equal(sourceKnown.length,98);
const plant=sourceKnown.slice(0,76);
const keyPlant=cw.map(i=>1+table.bytes[i]%28);
const ciphertext=cipher(plant,keyPlant,0);
assert.deepEqual(decipher(ciphertext,keyPlant,0),plant);
console.log(JSON.stringify({original:'p55 76 runes',outerGridRing:76,
  operator:'K=1+(tableByte mod28), P=(cipherdelta/K)-1 mod29',
  originalIoC:ioc(p55),trials:rows,sourceNativePlant:{length:plant.length,exact:true}},null,2));
