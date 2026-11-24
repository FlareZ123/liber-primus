"use strict";
// Agent19: spacing-free, all-secret differential plaintext-history original test.
// Run: node sims/lp2_spacingfree_differential_history_nonidentifiability_sft.cjs
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
function run(gp,native,sources){
  const check=(ok,message)=>{if(!ok)throw Error(message);};
  const pages=gp.pages.filter(p=>p.page<56&&p.indices.length);
  const N=pages.reduce((s,p)=>s+p.indices.length,0);
  check(pages.length===55&&N===12956,"source geometry");
  const tokens=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
  function encode(w){
    w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
    const a=[];
    for(let i=0;i<w.length;){
      if(w.startsWith("ING",i)){a.push(21);i+=3;}
      else if(w.startsWith("IO",i)){a.push(27);i+=2;}
      else {const x=tokens.find(x=>w.startsWith(x.s,i));check(x,"GP token "+w);a.push(x.i);i+=x.s.length;}
    }
    return a;
  }
  for(const [w,r] of [["FOLLOWING","ᚠᚩᛚᛚᚩᚹᛝ"],["FUNCTION","ᚠᚢᚾᚳᛏᛡᚾ"],["GREAT","ᚷᚱᛠᛏ"],["QUESTION","ᚳᚹᛖᛋᛏᛡᚾ"]])check(encode(w).map(x=>gp.runes[x]).join("")===r,"native spelling "+w);
  const delta=a=>a.map((x,i)=>i?(x-a[i-1]+29)%29:0);
  const D=pages.map(p=>delta(p.indices));
  function pairCount(arrays,k){
    const h=new Map();let n=0;
    for(const a of arrays)for(let i=0;i+k<=a.length;i++){
      const key=a.slice(i,i+k).join(","),v=h.get(key)||0;n+=v;h.set(key,v+1);
    }
    return n;
  }
  const collision=[3,4,5,6].map(k=>({k,local:D.reduce((s,d)=>s+pairCount([d.slice(1)],k),0),global:pairCount(D.map(d=>d.slice(1)),k)}));
  check(JSON.stringify(collision.map(x=>[x.local,x.global]))===JSON.stringify([[57,3558],[1,100],[0,3],[0,0]]),"original collision count");
  const rowKey=(P,i,m,q)=>(i%q)+":"+P.slice(i-m,i).join(",");
  function conflicts(P,d,m,q){
    let forward=0,reverse=0;
    const fw=new Map(),rv=new Map();
    for(let i=m;i<P.length;i++){
      const row=rowKey(P,i,m,q), fk=row+":"+P[i],rk=row+":"+d[i];
      if(fw.has(fk)&&fw.get(fk)!==d[i])forward++;else fw.set(fk,d[i]);
      if(rv.has(rk)&&rv.get(rk)!==P[i])reverse++;else rv.set(rk,P[i]);
    }
    return {forward,reverse};
  }
  function fit(P,d,m,q){
    const rows=new Map();
    for(let i=m;i<P.length;i++){
      const k=rowKey(P,i,m,q);
      if(!rows.has(k))rows.set(k,new Map());
      const row=rows.get(k),x=P[i],y=d[i];
      if(row.has(x)&&row.get(x)!==y)return null;
      for(const [u,v] of row)if(v===y&&u!==x)return null;
      row.set(x,y);
    }
    return rows;
  }
  function complete(rows){
    for(const row of rows.values()){
      const used=new Set(row.values()),free=Array.from({length:29},(_,i)=>i).filter(i=>!used.has(i));
      for(let x=0;x<29;x++)if(!row.has(x))row.set(x,free.shift());
      check(new Set(row.values()).size===29,"row bijection");
    }
  }
  function replay(P,C,rows,m,q){
    const p=P.slice(0,m),c=C.slice(0,m);
    for(let i=m;i<C.length;i++){
      const row=rows.get(rowKey(p,i,m,q)),d=(C[i]-C[i-1]+29)%29;
      check(row,"missing row");
      const pair=[...row].find(x=>x[1]===d);
      check(pair,"missing inverse");
      p.push(pair[0]);c.push((c[i-1]+row.get(p[i]))%29);
    }
    check(p.length===P.length&&p.every((x,i)=>x===P[i]),"plaintext replay");
    check(c.length===C.length&&c.every((x,i)=>x===C[i]),"ciphertext replay");
    return p.length;
  }
  const configurations=[[1,8],[1,9],[8,5],[8,6],[13,4],[13,5],[13,7],[29,3],[29,4]];
  const controls=[],survivors=[];
  for(const {name,text} of sources){
    const a=text.match(/[A-Za-z]+/g).flatMap(encode),windows=[];
    for(let s=0;s+N<=a.length;s+=6478){
      let k=s;windows.push({s,P:pages.map(p=>{const z=a.slice(k,k+p.indices.length);k+=p.indices.length;return z;})});
    }
    const stats=configurations.map(([q,m])=>{
      const v=windows.map(({s,P})=>{
        let forward=0,reverse=0;
        P.forEach((p,i)=>{const x=conflicts(p,D[i],m,q);forward+=x.forward;reverse+=x.reverse;});
        if(q===13&&m===7&&forward===0&&reverse===0){
          let rows=0,entries=0,single=0,log2=0,replayed=0;
          const maps=P.map((p,i)=>fit(p,D[i],m,q));
          for(let i=0;i<maps.length;i++){
            check(maps[i],"consistent row construction");
            rows+=maps[i].size;
            for(const r of maps[i].values()){
              entries+=r.size;single+=r.size===1;
              for(let z=2;z<=29-r.size;z++)log2+=Math.log2(z);
            }
            complete(maps[i]);replayed+=replay(P[i],pages[i].indices,maps[i],m,q);
          }
          survivors.push({name,offset:s,rows,entries,single,log2,replayed,opening:P[0].slice(0,45).map(x=>gp.translit[x]).join("")});
        }
        return {forward,reverse};
      });
      return {q,m,deterministic:v.filter(x=>x.forward===0).length,bijective:v.filter(x=>x.forward===0&&x.reverse===0).length,minForward:Math.min(...v.map(x=>x.forward)),minReverse:Math.min(...v.map(x=>x.reverse))};
    });
    controls.push({name,runes:a.length,windows:windows.length,stats});
  }
  check(controls.reduce((s,c)=>s+c.windows,0)===88,"88 corrected source windows");
  for(const c of controls)for(const {q,m,bijective} of c.stats)if([[1,8],[8,5],[13,4],[29,3]].some(([x,y])=>x===q&&y===m))check(bijective===0,"boundary exclusion");
  check(survivors.length===6&&survivors.every(x=>x.replayed===N),"six exact incompatible donor inverses");
  let state=330119;
  function random(){state^=state<<13;state^=state>>>17;state^=state<<5;return state>>>0;}
  function randomRow(){const a=Array.from({length:29},(_,i)=>i);for(let i=a.length-1;i>0;i--){const j=random()%(i+1);[a[i],a[j]]=[a[j],a[i]];}return new Map(a.map((x,i)=>[i,x]));}
  const ids=new Map(gp.runes.map((x,i)=>[x,i]));
  const plants=[];
  for(const [q,m] of [[1,8],[8,5],[13,4],[29,3],[13,7]]){
    let count=0;
    for(const sec of native.sections){
      const P=[...sec.source_text].filter(x=>ids.has(x)).map(x=>ids.get(x));
      check(P.length>m,"native section size");
      const C=P.slice(0,m).map(()=>random()%29),rows=new Map();
      for(let i=m;i<P.length;i++){
        const k=rowKey(P,i,m,q);if(!rows.has(k))rows.set(k,randomRow());
        C.push((C[i-1]+rows.get(k).get(P[i]))%29);
      }
      const c=conflicts(P,delta(C),m,q);check(c.forward===0&&c.reverse===0,"native plant consistency");
      count+=replay(P,C,rows,m,q);
      const fitted=fit(P,delta(C),m,q);check(fitted,"native fit");complete(fitted);replay(P,C,fitted,m,q);
    }
    plants.push({q,m,runes:count,sections:native.sections.length});
  }
  return {N,collision,controls,survivors,plants};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];
console.log(JSON.stringify(run(JSON.parse(read(paths[0])),JSON.parse(read(paths[1])),paths.slice(2).map(name=>({name,text:read(name)}))),null,2));
