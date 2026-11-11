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
function orderFor(key,direction){
 return key.map((value,index)=>({value,index}))
   .sort((a,b)=>direction*(a.value-b.value)||a.index-b.index)
   .map(x=>x.index);
}
function columnarEncrypt(input,key,direction){
 const order=orderFor(key,direction),columns=Array.from({length:key.length},()=>[]);
 for(let i=0;i<input.length;i++)columns[i%key.length].push(input[i]);
 return order.flatMap(j=>columns[j]);
}
function columnarDecrypt(input,key,direction){
 const order=orderFor(key,direction),n=input.length,rows=Math.ceil(n/key.length);
 const remainder=n%key.length;
 const lengths=Array.from({length:key.length},(_,j)=>Math.floor(n/key.length)+(j<remainder?1:0));
 const columns=Array(key.length);let pos=0;
 for(const j of order){columns[j]=input.slice(pos,pos+lengths[j]);pos+=lengths[j];}
 assert.equal(pos,n);
 const out=[];
 for(let r=0;r<rows;r++)for(let j=0;j<key.length;j++)if(r<columns[j].length)out.push(columns[j][r]);
 return out;
}
function apply(input,key,direction,scope,skipHeader,pages,operation){
 const f=operation==="decrypt"?columnarDecrypt:columnarEncrypt;
 if(scope==="global")return f(input,key,direction);
 const out=[];let offset=0;
 for(const page of pages){
  const start=skipHeader&&page.page===0?2:0;
  const length=page.indices.length-start;
  out.push(...f(input.slice(offset,offset+length),key,direction));
  offset+=length;
 }
 assert.equal(offset,input.length);
 return out;
}
function ioc(a){const h=Array(29).fill(0);for(const x of a)h[x]++;return h.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1));}
function train(a){const h=new Map();let n=0;for(let i=0;i+2<a.length;i++){const k=a[i]*841+a[i+1]*29+a[i+2];h.set(k,(h.get(k)||0)+1);n++;}return {h,n};}
function score(a,m){const d=m.n+0.1*29**3;let s=0;for(let i=0;i+2<a.length;i++){const k=a[i]*841+a[i+1]*29+a[i+2];s+=Math.log(((m.h.get(k)||0)+0.1)/d);}return s/(a.length-2);}
function windows(a,m,n){const max=a.length-n,v=[];for(let i=0;i<300;i++){const j=Math.floor(i*max/299);v.push(score(a.slice(j,j+n),m));}v.sort((a,b)=>a-b);return {count:300,min:v[0],median:v[149],max:v[299]};}
function main(){
 const corpus=read("resources/liber-primus/lp2-corpus.json"),ink=read("resources/liber-primus/lp2-ink-annotations.json");
 const pages=corpus.pages.filter(p=>p.page<=55),spans=[];
 for(const pi of ink.pages){
  const page=corpus.pages.find(p=>p.page===pi.page);
  for(const s of pi.red_spans||[]){
   const ids=page.indices.slice(s.start,s.start+s.length),pr=ids.map(i=>corpus.prime[i]);
   const sum=pr.reduce((a,b)=>a+b,0);
   if(mod(sum)===24)spans.push({page:pi.page,start:s.start,ids,pr});
  }
 }
 spans.sort((a,b)=>a.page-b.page||a.start-b.start);
 assert.deepEqual(spans.map(s=>[s.page,s.start,s.ids.length,s.pr.reduce((a,b)=>a+b,0)]),
   [[0,0,13,662],[15,9,11,430],[56,0,5,285]]);
 const keyGP=spans.flatMap(s=>s.ids),keyPrime=spans.flatMap(s=>s.pr.map(mod));
 assert.equal(keyGP.length,29);
 const cipher=pages.flatMap(p=>p.indices);
 const sh=nativeGP(fs.readFileSync(path.join(ROOT,"resources/control/shakespeare_first300k.txt"),"utf8"),corpus.translit);
 const gi=nativeGP(fs.readFileSync(path.join(ROOT,"resources/control/gibran_prophet_58585.txt"),"utf8"),corpus.translit);
 const em=nativeGP(fs.readFileSync(path.join(ROOT,"resources/control/emerson_essays_2944.txt"),"utf8"),corpus.translit);
 const model=train(sh),variants=[];
 for(const [keyName,key] of [["GP-index",keyGP],["prime-mod29",keyPrime]])
  for(const direction of [1,-1])
   for(const scope of ["global","page"])
    for(const skipHeader of [false,true]){
     const input=skipHeader?cipher.slice(2):cipher;
     const decoded=apply(input,key,direction,scope,skipHeader,pages,"decrypt");
     const plant=sh.slice(0,input.length);
     const encrypted=apply(plant,key,direction,scope,skipHeader,pages,"encrypt");
     const recovered=apply(encrypted,key,direction,scope,skipHeader,pages,"decrypt");
     assert.deepEqual(recovered,plant,"native-GP columnar plant must recover exactly");
     variants.push({key:keyName,direction:direction===1?"ascending":"descending",
       scope,skipHeader,length:input.length,ioc:ioc(decoded),trigram:score(decoded,model),
       first24:decoded.slice(0,24).map(i=>corpus.translit[i]).join(" "),plantExact:true});
    }
 const scores=variants.map(x=>x.trigram),iocs=variants.map(x=>x.ioc);
 const raw={full:{ioc:ioc(cipher),trigram:score(cipher,model)},
   payload:{ioc:ioc(cipher.slice(2)),trigram:score(cipher.slice(2),model)}};
 const controls={shakespeare:{length:sh.length,windows:windows(sh,model,12956)},
   gibran:{length:gi.length,windows:windows(gi,model,12956)},
   emerson:{length:em.length,windows:windows(em,model,12956)}};
 console.log(JSON.stringify({
  source:{selectedSpans:spans.map(s=>({page:s.page,start:s.start,length:s.ids.length,
    primeSum:s.pr.reduce((a,b)=>a+b,0)})),keyLength:keyGP.length,
    gpKeyDistinct:new Set(keyGP).size,primeMod29Distinct:new Set(keyPrime).size,
    gpAscendingOrder:orderFor(keyGP,1),primeMod29AscendingOrder:orderFor(keyPrime,1)},
  model:"Stable-tie keyed columnar transposition using the 29-rune residue-24 red-span sequence; GP indices or prime weights mod29; ascending/descending order; global/per-page scope; with/without the 2-rune header.",
  raw,controls,variants,
  ranges:{ioc:[Math.min(...iocs),Math.max(...iocs)],
    trigram:[Math.min(...scores),Math.max(...scores)],best:Math.max(...scores),
    worstNativeWindow:Math.min(controls.shakespeare.windows.min,
      controls.gibran.windows.min,controls.emerson.windows.min)},
  interpretation:"All 16 source-derived columnar variants invert native-GP plants exactly, but none produces language from original LP2. This rejects only standard stable-tie columnar transposition under the tested 29-rune key and framing choices."
 },null,2));
}
if(require.main===module)main();
module.exports={orderFor,columnarEncrypt,columnarDecrypt,apply};
