"use strict";
const fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto");
const files=["resources/liber-primus/lp2-corpus.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/blake_song_of_liberty_train.txt"];
const root=path.resolve(__dirname,"..");
const inputs=files.map(p=>{const b=fs.readFileSync(path.join(root,p));return {path:p,sha:crypto.createHash("sha1").update("blob "+b.length+"\0").update(b).digest("hex"),source:b.toString("utf8")}});
function experiment(inputs){
 const gp=JSON.parse(inputs[0].source), mod=x=>(x%29+29)%29;
 const assert=(p,m)=>{if(!p)throw Error(m)};
 const tokens=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function native(s){const a=[];for(const w of s.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").match(/[A-Z]+/g)||[]){for(let i=0;i<w.length;){if(w.startsWith("ING",i)){a.push(21);i+=3}else if(w.startsWith("IO",i)){a.push(27);i+=2}else{const t=tokens.find(x=>w.startsWith(x.s,i));assert(t,"unmapped "+w);a.push(t.i);i+=t.s.length}}}return a}
 const donors=inputs.slice(1).map(x=>({name:x.path,tape:native(x.source)}));
 const starts=[0,3,8,15,23,27,33,40,54,56];
 const chapters=starts.slice(0,-1).map((p,i)=>({name:`p${p}-${starts[i+1]-1}`,pages:gp.pages.filter(x=>x.page>=p&&x.page<starts[i+1]&&x.indices.length).map(x=>x.indices)}));
 assert(chapters.flatMap(x=>x.pages).flat().length===12956,"original length");
 function layout(pages){let C=[],states=[];for(const page of pages){for(let j=0;j<page.length;j++){C.push(page[j]);states.push(j<2?-1:page[j-2]*29+page[j-1]);}}return {C,states}}
 function prepare(C,states,end){
  const rows=Array.from({length:841},()=>new Map()),eq=[],ne=[],aff=[];
  for(let i=0;i<end;i++){let s=states[i];if(s<0)continue;const row=rows[s];if(row.has(C[i]))eq.push([row.get(C[i]),i]);else row.set(C[i],i);}
  for(const row of rows){const entries=[...row];if(entries.length<2)continue;for(let j=0;j<entries.length;j++)for(let k=j+1;k<entries.length;k++)ne.push([entries[j][1],entries[k][1]]);
   const [c0,i0]=entries[0],[c1,i1]=entries[1];for(let k=2;k<entries.length;k++){const [c,i]=entries[k];aff.push([i0,i1,i,mod(c1-c0),mod(c-c0)]);}
  }
  return {rows,eq,ne,aff}
 }
 function compatible(t,o,x,affine){for(const [i,j] of x.eq)if(t[o+i]!==t[o+j])return false;
 if(affine)for(const [i,j,k,u,v] of x.aff)if(mod((t[o+k]-t[o+i])*u-(t[o+j]-t[o+i])*v)!==0)return false;
 for(const [i,j] of x.ne)if(t[o+i]===t[o+j])return false;return true}
 function predict(C,states,cut,t,o,train,affine){
  const recovered=Array.from({length:841},()=>new Int8Array(29).fill(-1));
  for(let s=0;s<841;s++){const es=[...train.rows[s]];for(const [c,i] of es)recovered[s][c]=t[o+i];
    if(affine&&es.length>=2){const [c0,i0]=es[0],[c1,i1]=es[1];let inv=1;while(mod(inv*(c1-c0))!==1)inv++;const a=mod((t[o+i1]-t[o+i0])*inv);for(let c=0;c<29;c++)recovered[s][c]=mod(t[o+i0]+a*(c-c0));}
  }
  let covered=0,correct=0,eligible=0;for(let i=cut;i<C.length;i++){const s=states[i];if(s<0)continue;eligible++;const p=recovered[s][C[i]];if(p>=0){covered++;if(p===t[o+i])correct++;}}
  return {eligible,covered,correct};
 }
 function scan(layout,donor,cut,affine){const {C,states}=layout,t=donor.tape,n=C.length,train=prepare(C,states,cut),full=prepare(C,states,n);let fit=0,all=0,maxCoverage=0,best=null;
  for(let o=0;o+n<=t.length;o++){if(!compatible(t,o,train,affine))continue;fit++;if(!compatible(t,o,full,affine))continue;all++;const q=predict(C,states,cut,t,o,train,affine);assert(q.covered===q.correct,"full feasibility vs prediction");if(best===null||q.covered>maxCoverage){maxCoverage=q.covered;best={offset:o,...q,preview:t.slice(o,o+Math.min(n,80)).map(i=>gp.translit[i]).join("")}}}
  return {windows:Math.max(0,t.length-n+1),fit,all,best,trainConstraints:{equal:train.eq.length,unequal:train.ne.length,affine:train.aff.length},fullConstraints:{equal:full.eq.length,unequal:full.ne.length,affine:full.aff.length}}
 }
 function plant(plain,lengths,affine,seed){let x=seed>>>0;function random(n){x=(Math.imul(x,1664525)+1013904223)>>>0;return x%n}
  const tables=Array.from({length:841},()=>{if(affine){const a=1+random(28),b=random(29);return Array.from({length:29},(_,p)=>mod(a*p+b))}const a=Array.from({length:29},(_,i)=>i);for(let i=28;i>0;i--){const j=random(i+1);[a[i],a[j]]=[a[j],a[i]]}return a});
  let offset=0,pages=[];for(const len of lengths){const page=[];for(let j=0;j<len;j++){let p=plain[offset++];const c=j<2?random(29):tables[page[j-2]*29+page[j-1]][p];if(j>=2)assert(tables[page[j-2]*29+page[j-1]].indexOf(c)===p,"plant exact inverse");page.push(c)}pages.push(page)}return layout(pages)}
 const controls=[];
 for(const affine of [false,true]){const ch=chapters[7],d=donors[0],n=ch.pages.flat().length,o=affine?12029:4013,L=plant(d.tape.slice(o,o+n),ch.pages.map(p=>p.length),affine,affine?0x3301:0xc1cada);const cut=Math.floor(n*2/3),q=scan(L,d,cut,affine);
 assert(q.all===1&&q.best.offset===o&&q.best.covered>0,"blind source-offset/key control");controls.push({affine,knownOffset:o,n,...q});}
 const original=[];
 for(const ch of chapters){const L=layout(ch.pages),n=L.C.length,cut=Math.floor(n*2/3);for(const d of donors){for(const affine of [false,true])original.push({chapter:ch.name,n,cut,donor:d.name,affine,...scan(L,d,cut,affine)})}}
 return {inputs:inputs.map(({path,sha})=>({path,sha})),donorLengths:donors.map(d=>({name:d.name,n:d.tape.length})),controls,original};
}
console.log(JSON.stringify(experiment(inputs),null,2));
