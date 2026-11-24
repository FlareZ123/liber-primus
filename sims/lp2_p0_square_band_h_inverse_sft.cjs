'use strict';
/** Agent49: historical square-band/H exact p0 title inverse. Node22 CommonJS. */
const fs=require('node:fs'),path=require('node:path');
/** @param {string} p @returns {string} */
const read=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');
function run(corpus,squares,dict,native){
 const mod=x=>((x%29)+29)%29, K=v=>v.join(","), A=corpus.translit, C=corpus.pages.find(p=>p.page===0).indices.slice(0,13);
 const assert=(x,msg)=>{if(!x)throw Error(msg)};
 assert(K(C)==="15,8,18,3,6,19,27,0,15,26,18,21,5","original p0");
 const H=v=>{let o=[];for(let i=0;i<Math.floor(v.length/2);i++)o.push(mod(v[i]-v[v.length-1-i]),mod(v[i]+v[v.length-1-i]));if(v.length%2)o.push(v[(v.length-1)/2]);return o};
 const phi=v=>{let n=v,s=v;for(let p=2;p*p<=n;p++)if(n%p===0){while(n%p===0)n/=p;s=s/p*(p-1)}if(n>1)s=s/n*(n-1);return s};
 const decode=v=>v.map(i=>A[i]).join("");
 const mats=squares.trim().split(/\r?\n\s*\r?\n/).map(b=>b.trim().split(/\r?\n/).map(l=>l.trim().split(/\s+/).map(Number)));
 assert(K(mats.map(m=>m.length))==="5,7,5","source matrix order");
 const diag=(m,d)=>m.flatMap((r,i)=>r.flatMap((v,j)=>i-j===d?[v]:[]));
 const bands=[mats[0],mats[2]].map(m=>[-1,0,1].flatMap(d=>diag(m,d)));
 for(const b of bands){assert(b.length===13&&b.every((v,i)=>v===b[12-i]),"palindrome");assert(new Set(b).size===7,"seven source values")}
 const core=mats[1].slice(1,-1).map(r=>r.slice(1,-1)), cross=[...diag(mats[0],-1),...diag(core,0),...diag(mats[2],1)];
 assert(cross.length===13,"cross source length");
 const ts=A.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function encode(raw,sp){let w=raw.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S"),v=[];for(let i=0;i<w.length;){let t;if(sp==="native"&&w.startsWith("ING",i))t={s:"ING",i:21};else if(sp==="native"&&w.startsWith("IO",i))t={s:"IO",i:27};else t=ts.find(t=>w.startsWith(t.s,i)&&(sp==="native"||t.s.length===1));if(!t)return null;v.push(t.i);i+=t.s.length}return v}
 const rmap=new Map(corpus.runes.map((r,i)=>[r,i])), nw=native.sections.flatMap(s=>s.source_text.split(/[^ᚠ-ᛠ]+/u).filter(Boolean).map(w=>[...w].map(r=>rmap.get(r))).filter(v=>v.every(x=>x!==undefined)));
 const report={C,bands,cross,registers:{},fixed:[]};
 for(const [name,b] of [["first",bands[0]],["third",bands[1]],["three-square",cross]])for(const [map,f] of [["raw",x=>x],["phi",phi]])for(const sign of [-1,1]){const k=H(b.map(v=>mod(f(v)))),p=C.map((c,i)=>mod(c+sign*k[i]));assert(p.every((v,i)=>mod(v-sign*k[i])===C[i]),"replay");report.fixed.push({name,map,sign,k,text:[decode(p.slice(0,8)),decode(p.slice(8))]})}
 for(const sp of ["native","letter"]){
  const ds=[new Map(),new Map()];for(const raw of dict.match(/^[a-z]+(?=\s+\d)/gmi)||[]){const v=encode(raw,sp);if(v&&[8,5].includes(v.length)){const d=ds[v.length===8?0:1];if(!d.has(K(v)))d.set(K(v),raw)}}
  function arbitrary(c,passF=false){let first=[],second=[];for(const [v,w] of ds[0]){const p=v.split(",").map(Number);if(passF&&p.some((x,i)=>x===0&&c[i]!==0))continue;const d=[0,2,4,6].map(i=>mod(c[i]-p[i]));if(d.every(x=>x===d[0]))first.push({w,p,delta:d[0]})}for(const [v,w] of ds[1]){const p=v.split(",").map(Number);if(passF&&p.some((x,i)=>x===0&&c[i+8]!==0))continue;if(p[0]===c[8]&&p[2]===c[10])second.push({w,p})}return {first,second,pairs:first.length*second.length}}
  function affine(c,band,f){let prefixes=0,hits=[];for(let a=0;a<29;a++)for(let b=0;b<29;b++){const k=H(band.map(x=>mod(a*f(x)+b))),p=c.map((x,i)=>mod(x-k[i]));const w=ds[0].get(K(p.slice(0,8)));if(!w)continue;prefixes++;const v=ds[1].get(K(p.slice(8)));if(v)hits.push({a,b,words:[w,v],p,k})}return {prefixes,hits}}
  // With three independent column offsets, a slope a remains shared; first-word
  // constraints determine delta and flank sum. The center has one independent offset.
  function column(c,band,f){const base=H(band.map(x=>mod(f(x))));let prefixes=0,hits=[];for(let a=0;a<29;a++)for(let d=0;d<29;d++)for(let s=0;s<29;s++){let k1=base.slice(0,8).map((v,i)=>mod(a*v+(i%2?s:d))),p1=c.slice(0,8).map((v,i)=>mod(v-k1[i]));const w=ds[0].get(K(p1));if(!w)continue;prefixes++;for(let b=0;b<29;b++){const k2=base.slice(8).map((v,i)=>mod(a*v+(i===4?b:i%2?2*b:0))),p2=c.slice(8).map((v,i)=>mod(v-k2[i]));const w2=ds[1].get(K(p2));if(w2)hits.push({a,d,s,b,words:[w,w2],p:[...p1,...p2],k:[...k1,...k2]})}}return {prefixes,hits}}
  const ar=arbitrary(C), af=arbitrary(C,true), fits=[],controls=[];
  const p1=[...ds[0]].find(([v])=>nw.some(p=>K(p)===v)),p2=[...ds[1]].find(([v])=>nw.some(p=>K(p)===v)),p=[...p1[0].split(",").map(Number),...p2[0].split(",").map(Number)];
  for(const [name,b] of [["first",bands[0]],["third",bands[1]],["three-square",cross]])for(const [map,f] of [["raw",x=>x],["phi",phi]]){
    const g=affine(C,b,f),col=column(C,b,f);fits.push({name,map,global:g,column:col});
    const k=H(b.map(x=>mod(7*f(x)+11))),c=p.map((x,i)=>mod(x+k[i]));const ga=affine(c,b,f),ca=column(c,b,f);assert(ga.hits.some(h=>h.a===7&&h.b===11&&K(h.p)===K(p)),"global plant");assert(ca.hits.some(h=>K(h.p)===K(p)),"column plant");if(name!=="three-square")assert(arbitrary(c).first.some(h=>K(h.p)===K(p.slice(0,8))),"arbitrary plant");controls.push({name,map,globalHits:ga.hits.length,exact:true});
  }
  const crib=encode("epiphany",sp).concat(encode("seeks",sp)),residual=C.map((x,i)=>mod(x-crib[i]));report.registers[sp]={sizes:ds.map(d=>d.size),arbitrary:{first:ar.first.map(h=>[h.w,h.delta]),second:ar.second.map(h=>h.w),pairs:ar.pairs},fixedF:{first:af.first.length,second:af.second.length,pairs:af.pairs},conditionalCribResidual:residual,conditionalFlankDifferences:[0,2,4,6].map(i=>residual[i]),fits,controls,plantWords:[p1[1],p2[1]]};
 }
 return report;
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/cicada2014-openpuff-magic-squares.txt","resources/control/english_wordfreq_textblob.txt","resources/external/relikd-solved-gp29-native-v1.json"];
const d=paths.map(read);
console.log(JSON.stringify(run(JSON.parse(d[0]),d[1],d[2],JSON.parse(d[3])),null,2));
