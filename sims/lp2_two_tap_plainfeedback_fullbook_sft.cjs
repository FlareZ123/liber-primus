'use strict';
/**
 * Nine-original-chapter GP29 1/5-back plaintext-feedback attack.
 * Reversible family C=aP+bPprev+dP5+chapterShift (mod29), a!=0.
 * A chapter's arbitrary constant shift cancels from local equalities;
 * a rescales b,d, leaving exactly 29^2 ratio candidates. Five freely
 * secret predecessor-IV values can affect only five comparisons per
 * chapter, at most 45 among the original 12901 comparisons.
 *
 * Node 22 / CommonJS standalone test:
 *   node sims/lp2_two_tap_plainfeedback_fullbook_sft.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
/** @param {string} p @returns {string} */
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const book=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const pages=book.pages.filter(p=>p.page<=55),C=pages.flatMap(p=>p.indices),N=C.length;
assert.equal(N,12956);
const epoch=[0,729,1874,3603,5506,6527,7960,9640,12648,12956];
const first=new Uint16Array(N);
for(let e=0;e<9;e++)for(let i=epoch[e];i<epoch[e+1];i++)first[i]=epoch[e];
const sites=[];let offset=0;
for(const page of pages){for(let i=1;i<page.indices.length;i++)sites.push(offset+i);offset+=page.indices.length;}
assert.equal(sites.length,12901);
const observed=sites.reduce((n,i)=>n+Number(C[i]===C[i-1]),0);
assert.equal(observed,86);
const rmap=new Map(book.runes.map((r,i)=>[r,i]));
const source=read('resources/liber-primus/lp2-transcription.txt')
 .split('%').slice(0,55).join('%').replace(/\/\r?\n/g,'').replace(/[\r\n%]/g,'');
const words=(source.match(new RegExp('['+book.runes.join('')+']+','gu'))||[])
 .map(w=>[...w].map(c=>rmap.get(c)));
assert.equal(words.length,2896);
assert.equal(words.filter(w=>w.length===1).length,83);
assert.deepEqual(words.flat(),C);
const tokens=book.translit.map((s,i)=>({s,i}))
 .concat([{s:'ING',i:21},{s:'IO',i:27}]).sort((a,b)=>b.s.length-a.s.length);
/** @param {string} value @returns {number[]} */
function gp(value){
 const w=value.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U')
   .replace(/[KQ]/g,'C').replace(/Z/g,'S');
 const out=[];
 for(let i=0;i<w.length;){
  const t=tokens.find(x=>w.startsWith(x.s,i));
  assert(t,'unknown GP token');
  out.push(t.i);i+=t.s.length;
 }
 return out;
}
assert.deepEqual(gp('THINGS'),[2,21,15]);
assert.deepEqual(gp('FUNCTION'),[0,1,9,5,16,27,9]);
const paths=[
 'resources/control/shakespeare_first300k.txt',
 'resources/control/gibran_prophet_58585.txt',
 'resources/control/emerson_essays_2944.txt'
];
const refs=paths.map(file=>{
 const w=(read(file).match(/[A-Za-z]+/g)||[]).map(gp);
 return {file,words:w,seq:w.flat()};
});
assert.deepEqual(refs.map(x=>x.seq.length),[217106,62492,321327]);
const byLen=new Map();
for(const r of refs)for(const w of r.words){
 if(!byLen.has(w.length))byLen.set(w.length,[]);
 byLen.get(w.length).push(w);
}
/** @param {number} seed @returns {number[]} */
function sourcePlant(seed){
 const result=[];
 for(let i=0;i<words.length;i++){
  const pool=byLen.get(words[i].length);
  assert(pool&&pool.length,'missing GP word length');
  result.push(...pool[(i*(41+seed)+seed*11)%pool.length]);
 }
 assert.equal(result.length,N);return result;
}
/** @param {number[]} P */
function minRepeats(P){
 assert.equal(P.length,N);
 const x=new Int16Array(sites.length),y=new Int16Array(sites.length),
  z=new Int16Array(sites.length);
 for(let j=0;j<sites.length;j++){
  const i=sites[j],f=first[i],at=k=>k<f?0:P[k];
  x[j]=at(i)-at(i-1);y[j]=at(i-1)-at(i-2);z[j]=at(i-5)-at(i-6);
 }
 let min=Infinity,best=[0,0],viable=0;
 for(let b=0;b<29;b++)for(let d=0;d<29;d++){
  let n=0;
  for(let j=0;j<sites.length;j++)n+=Number((x[j]+b*y[j]+d*z[j])%29===0);
  if(n<min){min=n;best=[b,d];}
  viable+=Number(n<=observed);
 }
 return {min,best,viable};
}
const matched=[3,17,43].map(seed=>({seed,...minRepeats(sourcePlant(seed))}));
assert.deepEqual(matched.map(x=>x.min),[357,326,324]);
const windows=refs.map(r=>({
 file:r.file,
 trials:[0,Math.floor((r.seq.length-N)/2),r.seq.length-N]
  .map(start=>({start,...minRepeats(r.seq.slice(start,start+N))}))
}));
assert.deepEqual(windows.flatMap(r=>r.trials.map(x=>x.min)),
 [337,305,350,332,328,297,299,325,288]);
for(const row of matched)assert.equal(row.viable,0);
for(const row of windows)for(const t of row.trials)assert.equal(t.viable,0);
const absoluteFloor=Math.min(...matched.map(x=>x.min),
 ...windows.flatMap(x=>x.trials.map(t=>t.min)));
assert.equal(absoluteFloor,288);
assert(absoluteFloor-45>observed);
/** @param {number[]} cipher @param {number} b @param {number} d */
function decrypt(cipher,b,d){
 const P=new Uint8Array(cipher.length);
 for(let i=0;i<cipher.length;i++){
  const f=first[i],a=i>f?P[i-1]:0,c=i>=f+5?P[i-5]:0;
  P[i]=((cipher[i]-b*a-d*c)%29+29)%29;
 }
 return P;
}
/** @param {number[]} P @param {number} b @param {number} d */
function encrypt(P,b,d){
 return Uint8Array.from(P,(p,i)=>{
  const f=first[i];
  return (p+b*(i>f?P[i-1]:0)+d*(i>=f+5?P[i-5]:0))%29;
 });
}
const count2=new Uint32Array(841),count3=new Uint32Array(24389);
for(const r of refs.slice(0,2))for(let i=2;i<r.seq.length;i++){
 const index=r.seq[i-2]*29+r.seq[i-1];
 count2[index]++;count3[index*29+r.seq[i]]++;
}
const lnp=Float64Array.from(count3,(v,i)=>
 Math.log((v+0.2)/(count2[Math.floor(i/29)]+5.8)));
/** @param {number[]} P @param {number} start @param {number} end */
function score(P,start,end){
 let s=0;
 for(let i=start+2;i<end;i++)s+=lnp[(P[i-2]*29+P[i-1])*29+P[i]];
 return s/(end-start-2);
}
/** @param {number[]} cipher */
function search(cipher){
 const candidates=[];
 for(let b=0;b<29;b++)for(let d=0;d<29;d++){
  const P=decrypt(cipher,b,d);
  candidates.push({b,d,train:score(P,0,9640)});
 }
 return candidates.sort((a,b)=>b.train-a.train);
}
const originals=search(C),key=originals[0];
assert.deepEqual([key.b,key.d],[11,27]);
const decoded=decrypt(C,key.b,key.d);
assert.deepEqual([...encrypt(decoded,key.b,key.d)],C);
const heldout=score(decoded,9640,N);
assert(key.train<-4&&heldout<-4);
const truePlain=refs[2].seq.slice(12000,12000+N);
const trueCipher=encrypt(truePlain,11,17);
assert.deepEqual([...decrypt(trueCipher,11,17)],truePlain);
const trueWinners=search(trueCipher);
assert.deepEqual([trueWinners[0].b,trueWinners[0].d],[11,17]);
assert(trueWinners[0].train>-3);
assert(trueWinners[1].train<-4);
console.log(JSON.stringify({
 verdict:'GP-native negative for all 841 ratio pairs, no unknown plaintext',
 original:{runes:N,words:words.length,adjacent:sites.length,duplicates:observed},
 morphology:{wordMatched:matched,sourceWindows:windows,
  minimum:absoluteFloor,minimumWithNineArbitraryFiveSymbolIVs:absoluteFloor-45},
 originalInverse:{training:'p0..39',heldout:'p40..55',key,
  heldoutScore:heldout,exactReencryption:N,
  firstSymbols:Array.from(decoded.slice(0,35),i=>book.translit[i]).join(' ')},
 plantedPositive:{source:'independent Emerson',key:[11,17],rank:1,
  recovery:N,training:trueWinners[0].train,wrongKey:trueWinners[1].train}
},null,2));
