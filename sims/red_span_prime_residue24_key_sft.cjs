"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const ROOT=path.resolve(__dirname,".."),M=29,mod=x=>((x%M)+M)%M;
const read=p=>JSON.parse(fs.readFileSync(path.join(ROOT,p),"utf8"));
function nativeGP(raw,translit){
 const t=translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 const words=raw.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/K/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").match(/[A-Z]+/g)||[],out=[];
 for(const word of words){const a=[];for(let j=0;j<word.length;){const x=t.find(z=>word.startsWith(z.s,j));if(!x){a.length=0;break;}a.push(x.i);j+=x.s.length;}out.push(...a);}
 return out;
}
function applyKey(input,key,sign,clock,pages,skipHeader){
 const out=input.slice();let offset=0,global=0;
 for(const page of pages){
  const start=skipHeader&&page.page===0?2:0;let pageIndex=0;
  for(let j=start;j<page.indices.length;j++){
   const inputIndex=offset+(skipHeader&&page.page===0?j-2:j);
   const k=clock==="global"?global++:pageIndex++;
   out[inputIndex]=mod(input[inputIndex]+sign*key[k%key.length]);
  }
  offset+=page.indices.length-(skipHeader&&page.page===0?2:0);
 }
 assert.equal(offset,input.length);
 return out;
}
function ioc(a){const h=Array(29).fill(0);for(const x of a)h[x]++;return h.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1));}
function train(a){const h=new Map();let n=0;for(let i=0;i+2<a.length;i++){const k=a[i]*841+a[i+1]*29+a[i+2];h.set(k,(h.get(k)||0)+1);n++;}return {h,n};}
function score(a,m){const d=m.n+0.1*29**3;let s=0;for(let i=0;i+2<a.length;i++){const k=a[i]*841+a[i+1]*29+a[i+2];s+=Math.log(((m.h.get(k)||0)+0.1)/d);}return s/(a.length-2);}
function windows(a,m,n){const max=a.length-n,v=[];for(let i=0;i<300;i++){const j=Math.floor(i*max/299);v.push(score(a.slice(j,j+n),m));}v.sort((x,y)=>x-y);return {count:300,min:v[0],median:v[149],max:v[299]};}
function main(){
 const corpus=read("resources/liber-primus/lp2-corpus.json");
 const ink=read("resources/liber-primus/lp2-ink-annotations.json");
 const pages=corpus.pages.filter(p=>p.page<=55);
 const spans=[];
 for(const pageInk of ink.pages){
  const page=corpus.pages.find(p=>p.page===pageInk.page);
  for(const span of pageInk.red_spans||[]){
   const indices=page.indices.slice(span.start,span.start+span.length);
   const primeWeights=indices.map(i=>corpus.prime[i]);
   const primeSum=primeWeights.reduce((a,b)=>a+b,0);
   spans.push({page:pageInk.page,start:span.start,length:span.length,
     indices,primeWeights,primeSum,residue:mod(primeSum)});
  }
 }
 spans.sort((a,b)=>a.page-b.page||a.start-b.start);
 const selected=spans.filter(s=>s.residue===24);
 assert.equal(spans.length,18);
 assert.deepEqual(selected.map(s=>[s.page,s.start,s.length,s.primeSum]),
   [[0,0,13,662],[15,9,11,430],[56,0,5,285]]);
 const keyGP=selected.flatMap(s=>s.indices);
 const keyPrime=selected.flatMap(s=>s.primeWeights.map(mod));
 assert.equal(keyGP.length,29);
 assert.equal(selected.reduce((n,s)=>n+s.length,0),29);
 const cipher=pages.flatMap(p=>p.indices);
 assert.equal(cipher.length,12956);
 assert.equal(corpus.pages.find(p=>p.page===54).indices[0],24);
 const sh=nativeGP(fs.readFileSync(path.join(ROOT,"resources/control/shakespeare_first300k.txt"),"utf8"),corpus.translit);
 const gi=nativeGP(fs.readFileSync(path.join(ROOT,"resources/control/gibran_prophet_58585.txt"),"utf8"),corpus.translit);
 const em=nativeGP(fs.readFileSync(path.join(ROOT,"resources/control/emerson_essays_2944.txt"),"utf8"),corpus.translit);
 const model=train(sh),variants=[];
 for(const [keyName,key] of [["GP-index",keyGP],["prime-mod29",keyPrime]])
  for(const clock of ["global","page"])
   for(const sign of [-1,1])
    for(const skipHeader of [false,true]){
     const input=skipHeader?cipher.slice(2):cipher;
     const decoded=applyKey(input,key,sign,clock,pages,skipHeader);
     const plant=sh.slice(0,input.length);
     const encrypted=applyKey(plant,key,-sign,clock,pages,skipHeader);
     const recovered=applyKey(encrypted,key,sign,clock,pages,skipHeader);
     assert.deepEqual(recovered,plant,"native-GP repeating-key plant must recover exactly");
     variants.push({key:keyName,clock,output:sign===-1?"C-K":"C+K",
       skipHeader,length:input.length,ioc:ioc(decoded),trigram:score(decoded,model),
       first24:decoded.slice(0,24).map(i=>corpus.translit[i]).join(" "),
       plantExact:true});
    }
 const scores=variants.map(x=>x.trigram),iocs=variants.map(x=>x.ioc);
 const distribution=Array(29).fill(0);spans.forEach(s=>distribution[s.residue]++);
 console.log(JSON.stringify({
  source:{redSpanCount:spans.length,selectedSpans:selected.map(s=>({
    page:s.page,start:s.start,length:s.length,primeSum:s.primeSum,residue:s.residue})),
    selectedTotalLength:29,selectedPrimeSum:selected.reduce((n,s)=>n+s.primeSum,0),
    selectedGPKey:keyGP,selectedPrimeMod29Key:keyPrime,
    gpKeyDistinct:new Set(keyGP).size,primeKeyDistinct:new Set(keyPrime).size,
    residueDistribution:distribution.map((count,residue)=>({residue,count})).filter(x=>x.count)},
  model:"Select all red spans whose GP-prime-weight sum is 24 mod29 (anchored independently by p54 Ac and the p39 repeated root); concatenate in page order to form a 29-symbol repeating key.",
  raw:{full:{ioc:ioc(cipher),trigram:score(cipher,model)},
    payload:{ioc:ioc(cipher.slice(2)),trigram:score(cipher.slice(2),model)}},
  controls:{shakespeare:{length:sh.length,windows:windows(sh,model,12956)},
    gibran:{length:gi.length,windows:windows(gi,model,12956)},
    emerson:{length:em.length,windows:windows(em,model,12956)}},
  variants,
  ranges:{ioc:[Math.min(...iocs),Math.max(...iocs)],
    trigram:[Math.min(...scores),Math.max(...scores)],
    best:Math.max(...scores),
    worstNativeWindow:Math.min(windows(sh,model,12956).min,
      windows(gi,model,12956).min,windows(em,model,12956).min)},
  interpretation:"The three residue-24 red spans form a 29-rune source-derived sequence, but neither the GP-index nor prime-mod-29 sequence works as a direct repeating Vigenere key under global/page clocks, either sign, or with/without the two-rune header. This does not disprove the residue-24 selection as a clue to another operation."
 },null,2));
}
if(require.main===module)main();
module.exports={nativeGP,applyKey,ioc,score};
