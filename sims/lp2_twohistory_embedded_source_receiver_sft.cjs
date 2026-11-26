"use strict";
const fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto");
const files=["resources/liber-primus/lp2-corpus.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/blake_song_of_liberty_train.txt"];
const root=path.resolve(__dirname,"..");
const inputs=files.map(p=>{const b=fs.readFileSync(path.join(root,p));return {path:p,sha:crypto.createHash("sha1").update("blob "+b.length+"\0").update(b).digest("hex"),source:b.toString("utf8")}});
function experiment(inputs){
 const gp=JSON.parse(inputs[0].source),mod=x=>(x%29+29)%29;
 const assert=(p,m)=>{if(!p)throw Error(m)};
 const tokens=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function native(s){const a=[];for(const w of s.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").match(/[A-Z]+/g)||[]){for(let i=0;i<w.length;){if(w.startsWith("ING",i)){a.push(21);i+=3}else if(w.startsWith("IO",i)){a.push(27);i+=2}else{const t=tokens.find(x=>w.startsWith(x.s,i));assert(t,"unmapped "+w);a.push(t.i);i+=t.s.length}}}return Uint8Array.from(a)}
 const donors=inputs.slice(1).map(x=>({name:x.path,tape:native(x.source)}));
 const starts=[0,3,8,15,23,27,33,40,54,56],W=650,T=450;
 function layout(pages){let C=[],states=[];for(const page of pages)for(let j=0;j<page.length;j++){C.push(page[j]);states.push(j<2?-1:page[j-2]*29+page[j-1])}return {C,states}}
 const chapters=starts.slice(0,-1).map((p,i)=>({name:`p${p}-${starts[i+1]-1}`, ...layout(gp.pages.filter(x=>x.page>=p&&x.page<starts[i+1]&&x.indices.length).map(x=>x.indices))}));
 assert(chapters.reduce((a,x)=>a+x.C.length,0)===12956,"length");
 function prepare(L,o,n){
  const rows=new Map(),eq=[],ne=[],aff=[];
  for(let i=0;i<n;i++){let s=L.states[o+i],c=L.C[o+i];if(s<0)continue;let r=rows.get(s);if(!r){r=new Map();rows.set(s,r)}if(r.has(c))eq.push(r.get(c),i);else r.set(c,i);}
  for(const row of rows.values()){const e=[...row];if(e.length<2)continue;for(let j=0;j<e.length;j++)for(let k=j+1;k<e.length;k++)ne.push(e[j][1],e[k][1]);const [c0,i0]=e[0],[c1,i1]=e[1];for(let k=2;k<e.length;k++)aff.push(i0,i1,e[k][1],mod(c1-c0),mod(e[k][0]-c0));}
  return {rows,eq,ne,aff}
 }
 function same(t,o,x){for(let j=0;j<x.eq.length;j+=2)if(t[o+x.eq[j]]!==t[o+x.eq[j+1]])return false;return true}
 function different(t,o,x){for(let j=0;j<x.ne.length;j+=2)if(t[o+x.ne[j]]===t[o+x.ne[j+1]])return false;return true}
 function linear(t,o,x){for(let j=0;j<x.aff.length;j+=5){const a=t[o+x.aff[j]],b=t[o+x.aff[j+1]],c=t[o+x.aff[j+2]];if(((c-a)*x.aff[j+3]-(b-a)*x.aff[j+4])%29!==0)return false}return true}
 function prediction(L,start,t,o,x,affine){let covered=0,correct=0,eligible=0;const keys=new Map();
  for(const [s,row] of x.rows){const d=new Int8Array(29).fill(-1);for(const [c,i] of row)d[c]=t[o+i];if(affine&&row.size>=2){const [[c0,i0],[c1,i1]]=[...row];let inv=1;while(mod(inv*(c1-c0))!==1)inv++;const a=mod((t[o+i1]-t[o+i0])*inv);for(let c=0;c<29;c++)d[c]=mod(t[o+i0]+a*(c-c0));}keys.set(s,d);}
  for(let i=T;i<W;i++){let s=L.states[start+i];if(s<0)continue;eligible++;const p=keys.get(s)?.[L.C[start+i]]??-1;if(p>=0){covered++;if(p===t[o+i])correct++;}}
  assert(covered===correct,"prediction mismatch on compatible tape");return {covered,correct,eligible}
 }
 function makeIndex(t){const lists=new Map();return d=>{if(lists.has(d))return lists.get(d);const z=[];for(let i=0;i+d<t.length;i++)if(t[i]===t[i+d])z.push(i);const a=Int32Array.from(z);lists.set(d,a);return a}}
 function sweep(L,d,idx,onlyStart=null){
  const t=d.tape,limit=t.length-W;
  const out={chapter:L.name,donor:d.name,cipherWindows:0,anchoredWindows:0,unanchoredWindows:0,affineOnlyWindows:0,arbitrary:{train:0,full:0,maxCoverage:0,best:null},affine:{train:0,full:0,maxCoverage:0,best:null},anchorOffsetsExamined:0,affineDirectOffsetsExamined:0};
  if(limit<0)return out;
  const s0=onlyStart===null?0:onlyStart,s1=onlyStart===null?L.C.length-W:onlyStart;
  for(let start=s0;start<=s1;start++){
   out.cipherWindows++;const train=prepare(L,start,T);let full=null;
   function record(o,affine){const z=affine?out.affine:out.arbitrary;z.train++;full??=prepare(L,start,W);
     if(!same(t,o,full)||!different(t,o,full)||(affine&&!linear(t,o,full)))return;
     z.full++;const p=prediction(L,start,t,o,train,affine);
     if(z.best===null||p.covered>z.maxCoverage){z.maxCoverage=p.covered;z.best={cipherOffset:start,donorOffset:o,...p};}
   }
   if(train.eq.length){
    out.anchoredWindows++;let best=null,at=0;
    for(let i=0;i<train.eq.length;i+=2){const a=train.eq[i],b=train.eq[i+1],ls=idx(b-a);if(best===null||ls.length<best.length){best=ls;at=a}}
    for(const pos of best){const o=pos-at;if(o<0||o>limit)continue;out.anchorOffsetsExamined++;if(!same(t,o,train)||!different(t,o,train))continue;record(o,false);if(linear(t,o,train))record(o,true);}
   }else{
    out.unanchoredWindows++;
    if(!train.aff.length)continue;out.affineOnlyWindows++;
    for(let o=0;o<=limit;o++){out.affineDirectOffsetsExamined++;if(linear(t,o,train)&&different(t,o,train))record(o,true)}
   }
  }return out
 }
 function plant(t,offset,affine,seed){let x=seed>>>0;function rand(n){x=(Math.imul(x,1664525)+1013904223)>>>0;return x%n}
 const tables=Array.from({length:841},()=>{if(affine){const a=1+rand(28),b=rand(29);return Array.from({length:29},(_,p)=>mod(a*p+b))}const a=Array.from({length:29},(_,i)=>i);for(let j=28;j>0;j--){const k=rand(j+1);[a[j],a[k]]=[a[k],a[j]]}return a});
 const pages=[];let k=0;for(const n of [217,201,232]){const p=[];for(let i=0;i<n;i++){const v=t[offset+k++],c=i<2?rand(29):tables[p[i-2]*29+p[i-1]][v];if(i>=2)assert(tables[p[i-2]*29+p[i-1]].indexOf(c)===v,"plant inverse");p.push(c)}pages.push(p)}return {name:"hidden-plant",...layout(pages)}}
 const controls=[];
 for(const affine of [false,true]){const d=donors[0],o=affine?22220:10080,L=plant(d.tape,o,affine,affine?0x99125:0x330125);const a=sweep(L,d,makeIndex(d.tape),0),z=affine?a.affine:a.arbitrary;assert(z.full===1&&z.best.donorOffset===o&&z.best.covered>0,"hidden control source recovery");controls.push({model:affine?"affine":"arbitrary",knownOffset:o,...a})}
 const original=[];for(const d of donors){const idx=makeIndex(d.tape);for(const L of chapters){if(L.C.length<W)continue;original.push(sweep(L,d,idx))}}
 return {window:W,training:T,inputs:inputs.map(({path,sha})=>({path,sha})),controls,original};
}
console.log(JSON.stringify(experiment(inputs),null,2));
