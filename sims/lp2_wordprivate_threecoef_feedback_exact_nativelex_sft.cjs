'use strict';

/**
 * Exhaustive exact original-cipher native-lexicon gate for EVERY word-private
 * 3-coefficient invertible affine GP29 predecessor transducer:
 *
 *    C_j = A_word * P_j + B_word * C_(j-1) + D_word  (mod29), j>=1
 *
 * All secret A∈1..28, B,D∈0..28 are allowed independently for EVERY word,
 * with arbitrary first plaintext GP rune and arbitrary first cipher rune.
 * Finite-field 3-observation elimination checks an entire candidate word,
 * including degenerate rank<3 systems by complete 28×29 key fallback.
 * The 29k English lexical register is independent of the ciphertext.
 * A long native-GP dictionary hit would nominate actual plaintext only
 * conditionally, since the source does not specify this affine operation.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const corpus=require('../resources/liber-primus/lp2-corpus.json');
const {parseLP2Words}=require('./lp2_word_pages.cjs');
const raw=fs.readFileSync(path.join(root,'resources/lp2-transcription.txt'),'utf8');
const parsed=parseLP2Words(raw),full=parseLP2Words(raw,57);
assert.deepEqual([parsed.words.length,parsed.runeCount,parsed.crossPageWords],[2896,12956,32]);
const R=new Map(corpus.runes.map((c,i)=>[c,i]));
const cwords=parsed.words.map(w=>[...w.runes].map(c=>R.get(c)));
assert.equal(cwords.reduce((s,a)=>s+a.length,0),12956);
const mod=x=>((x%29)+29)%29;
const inv=Array(29).fill(0);
for(let i=1;i<29;i++)for(let j=1;j<29;j++)if(i*j%29===1)inv[i]=j;
assert(inv.slice(1).every(Boolean));
const tokens=corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
/** @param {string} value */
function gpWord(value) {
 let s=value.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U')
  .replace(/[KQ]/g,'C').replace(/Z/g,'S').replace(/ING/g,'NG')
  .replace(/IO/g,'IA');
 const result=[];
 while(s.length){
  const m=tokens.find(t=>s.startsWith(t.s));
  if(!m)return null;
  result.push(m.i);s=s.slice(m.s.length);
 }
 return result;
}
/** @type {Map<number,Array<{word:string,freq:number,gp:number[]}>>} */
const lex=new Map();
let totalLex=0,usableLex=0;
for(const line of fs.readFileSync(path.join(root,'resources/control/english_wordfreq_textblob.txt'),'utf8').split(/\r?\n/)){
 const match=/^([a-z]+) (\d+)$/.exec(line);
 if(!match)continue;
 totalLex++;
 const gp=gpWord(match[1]),freq=Number(match[2]);
 if(!gp||gp.length<7||gp.length>14)continue;
 usableLex++;
 const a=lex.get(gp.length)||[];a.push({word:match[1],freq,gp});lex.set(gp.length,a);
}
assert(totalLex>20000&&usableLex>10000);

/** @param {number[]} c @param {number[]} p
 * @returns {{a:number,b:number,d:number}|null} */
function fit(c,p) {
 assert.equal(c.length,p.length);
 if(c.length<4)return null;
 let a=0,b=0,d=0,found=false;
 const px=p[1],cx=c[0],yx=c[1];
 for(let j=2;j<c.length&&!found;j++){
  for(let k=j+1;k<c.length&&!found;k++){
   const u=mod(p[j]-px),v=mod(c[j-1]-cx);
   const w=mod(p[k]-px),z=mod(c[k-1]-cx);
   const det=mod(u*z-w*v);
   if(!det)continue;
   const f=mod(c[j]-yx),g=mod(c[k]-yx);
   a=mod((f*z-g*v)*inv[det]);
   b=mod((u*g-w*f)*inv[det]);
   d=mod(yx-a*px-b*cx);
   found=true;
  }
 }
 if(!found) {
  // Source words whose (P_j,Cprev_j) points are collinear have a
  // nonunique 2-parameter family; explicitly enumerate it without
  // choosing the best plaintext or a fitted secret.
  for(let aa=1;aa<29;aa++)for(let bb=0;bb<29;bb++){
   const dd=mod(yx-aa*px-bb*cx);
   if(c.slice(1).every((v,i)=>v===mod(aa*p[i+1]+bb*c[i]+dd)))
    return {a:aa,b:bb,d:dd};
  }
  return null;
 }
 if(!a)return null; // invertible plaintext channel only
 for(let j=1;j<c.length;j++)
  if(c[j]!==mod(a*p[j]+b*c[j-1]+d))return null;
 return {a,b,d};
}
/** @param {number[]} p @param {number} a @param {number} b
 * @param {number} d @param {number} init */
function forward(p,a,b,d,init){
 const c=[init];
 for(let j=1;j<p.length;j++)c.push(mod(a*p[j]+b*c[j-1]+d));
 return c;
}
const native=full.words.filter(w=>w.startPage===56)
 .map(w=>[...w.runes].map(x=>R.get(x)));
assert.deepEqual([native.length,native.reduce((s,a)=>s+a.length,0)],[20,95]);
let plant=0;
for(const p of native)if(p.length>=4){
 for(const a of [1,7,13,28])for(const b of [0,2,27])
  for(const d of [0,11]){
   const c=forward(p,a,b,d,mod(p[0]+17));
   const recovered=fit(c,p);
   assert(recovered&&recovered.a!==0);
   plant++;
  }
}
assert(plant>=160);
/** @param {number[]} c */
function lexicalCandidates(c){
 const arr=lex.get(c.length)||[];
 const hits=[];
 for(const item of arr){
  const keys=fit(c,item.gp);
  if(keys)hits.push({word:item.word,freq:item.freq,...keys});
 }
 return hits;
}
const source=cwords.map((c,i)=>({i,page:parsed.words[i].startPage,
 len:c.length,hits:c.length>=7?lexicalCandidates(c):[]}));
const lengths=[7,8,9,10,11,12,13,14];
const byLength=lengths.map(len=>{
 const z=source.filter(v=>v.len===len);
 return {len,words:z.length,any:z.filter(x=>x.hits.length).length,
 freq20:z.filter(x=>x.hits.some(v=>v.freq>=20)).length};
});
const examples=source.filter(x=>x.len>=8&&x.hits.length)
 .map(x=>({wordIndex:x.i,page:x.page,len:x.len,
  best:x.hits.sort((a,b)=>b.freq-a.freq).slice(0,10)})).slice(0,30);
const long=source.filter(x=>x.len>=8);
const original=long.filter(x=>x.hits.length).length;
const original20=long.filter(x=>x.hits.some(v=>v.freq>=20)).length;
let seed=0x14712515;
function rand(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0;}
/** @param {number} n */
function randomCipher(n){
 const c=[rand()%29];
 for(let i=1;i<n;i++)
  c.push(rand()%10000<67?c[i-1]:(c[i-1]+1+rand()%28)%29);
 return c;
}
const trials=42;
let sum=0,sum20=0,ge=0,ge20=0,max=0;
for(let t=0;t<trials;t++){
 let hits=0,f20=0;
 for(const x of long){
  const a=lexicalCandidates(randomCipher(x.len));
  if(a.length)hits++;
  if(a.some(y=>y.freq>=20))f20++;
 }
 sum+=hits;sum20+=f20;max=Math.max(max,hits);
 ge+=Number(hits>=original);
 ge20+=Number(f20>=original20);
}
console.log(JSON.stringify({
 model:'all 28×29×29 invertible word-private GP29 3coef feedback keys; arbitrary word-first rune',
 originalRunes:12956,words:2896,lexiconTotal:totalLex,lexiconGP7to14:usableLex,
 sourceNativeP57Plants:plant,byLength,originalWordsGe8:long.length,
 originalGe8Any:original,originalGe8Freq20:original20,
 null:{seed:'0x14712515',trials,sourceRepeatPer10000:67,
  meanGe8Any:sum/trials,maxGe8Any:max,meanGe8Freq20:sum20/trials,
  upperTailGE:(ge+1)/(trials+1),upperTailFreq20GE:(ge20+1)/(trials+1)},
 originalLongCandidates:examples
}));
console.log('PASS every invertible word-private 3coef GP29 predecessor affine English candidate, native p57 plants, source low-repeat null');
