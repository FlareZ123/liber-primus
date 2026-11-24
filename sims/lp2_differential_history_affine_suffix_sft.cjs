"use strict";

/**
 * Differential history emitter: exact suffix-partition majorization,
 * including arbitrary private affine increments per printed word.
 * Windows Node22/CommonJS, read-only. No key fitting.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const paths = ["resources/liber-primus/lp2-corpus.json", "resources/lp2-transcription.txt",
  "resources/control/shakespeare_first300k.txt", "resources/control/gibran_prophet_58585.txt",
  "resources/control/emerson_essays_2944.txt"];
const files = paths.map(p => fs.readFileSync(path.join(ROOT,p),"utf8"));
function main(files) {
  const gp=JSON.parse(files[0]), rmap=new Map(gp.runes.map((x,i)=>[x,i]));
  let words=[], word=[], start=0,end=0,p=0;
  function finish(){if(word.length){words.push({seq:word,start,end});word=[]}}
  for(const c of files[1].split("%").slice(0,55).join("%")){
    if(rmap.has(c)){if(!word.length)start=p;word.push(rmap.get(c));end=p}
    else if(c==="%")p++;
    else if(c!=="/"&&!/\s/u.test(c))finish();
  }
  finish();
  if(words.length!==2896||words.flatMap(w=>w.seq).length!==12956||
    words.filter(w=>w.start!==w.end).length!==32||
    words.flatMap(w=>w.seq).join(",")!==gp.pages.slice(0,56).flatMap(x=>x.indices).join(","))
    throw Error("canonical source mismatch");
  const phy=p=>p>=50?p+1:p;
  const ch=p=>[2,7,14,22,26,32,39,53,55].findIndex(x=>phy(p)<=x);
  const mod=x=>(x%29+29)%29;
  const inv=x=>{for(let a=1;a<29;a++)if(mod(a*x)===1)return a;throw Error("zero inverse")};
  const tokens=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
  /** Source-calibrated greedy GP29 encoder. */
  function enc(w){
    let t=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
    let a=[];
    for(let i=0;i<t.length;){
      if(t.startsWith("ING",i)){a.push(21);i+=3}
      else if(t.startsWith("IO",i)){a.push(27);i+=2}
      else{let q=tokens.find(x=>t.startsWith(x.s,i));if(!q)throw Error(t);a.push(q.i);i+=q.s.length}
    }
    return a;
  }
  for (const [latin,runes] of [["FOLLOWING","ᚠᚩᛚᛚᚩᚹᛝ"],["THINGS","ᚦᛝᛋ"],
    ["FUNCTION","ᚠᚢᚾᚳᛏᛡᚾ"],["QUESTION","ᚳᚹᛖᛋᛏᛡᚾ"]]){
    if(enc(latin).map(i=>gp.runes[i]).join("")!==runes)throw Error("native spelling calibration");
  }
  const donors=files.slice(2).map(x=>{
    let pool=new Map;
    for(const w of x.toUpperCase().match(/[A-Z]+/g)){
      const a=enc(w);if(!pool.has(a.length))pool.set(a.length,[]);pool.get(a.length).push(a)
    }
    return pool;
  });
  let state=330104;
  const rng=()=>{state^=state<<13;state^=state>>>17;state^=state<<5;return state>>>0};
  const samples=donors.map(pool=>Array.from({length:64},()=>words.map(w=>{
    const row=pool.get(w.seq.length);
    return {...w,seq:row[rng()%row.length]};
  })));
  const diff=a=>a.slice(1).map((x,i)=>mod(x-a[i]));
  /** Complete orbit representative under identity, translation or invertible affine transform. */
  function norm(a,mode){
    if(mode===0)return a;
    const v=a.map(x=>mod(x-a[0]));
    if(mode===1)return v;
    const z=v.find(x=>x!==0);
    return z===undefined?v:v.map(x=>mod(x*inv(z)));
  }
  const group=(w,scope,byLen)=>(scope===0?0:scope===1?ch(w.start):phy(w.start))+(byLen?":"+w.seq.length:"");
  /** @returns {Map<string,Map<string,number>>} */
  function hist(rows,m,k,scope,cipher,mode,byLen){
    let h=new Map;
    for(const w of rows){
      let a=w.seq;
      if(a.length<m+k||(scope!==0&&w.start!==w.end))continue;
      const ss=cipher?norm(diff(a.slice(-(k+1))),mode):a.slice(-(m+k));
      const g=group(w,scope,byLen);
      let z=h.get(g);if(!z){z=new Map;h.set(g,z)}
      const key=ss.join(",");z.set(key,(z.get(key)||0)+1);
    }
    return h;
  }
  function bounds(H){
    let pair=0,max=0;
    for(const x of H.values()){const a=[...x.values()];pair+=a.reduce((s,n)=>s+n*(n-1)/2,0);max+=Math.max(...a)}
    return [pair,max];
  }
  /** Necessary partition-majorization condition, not a sufficient bin-packing test. */
  function feasible(c,p){
    for(const [g,ph] of p){
      const a=[...ph.values()].sort((a,b)=>b-a),b=[...c.get(g).values()].sort((a,b)=>b-a);
      let sa=0,sb=0;
      for(let i=0;i<a.length;i++){sa+=a[i];sb+=b[i]||0;if(sa>sb)return false}
    }
    return true;
  }
  const positive=[];
  // Each positive uses fresh completely arbitrary context-row permutations
  // in every physical page and word-length stratum and private affine per-word increments.
  for(let m=1;m<=6;m++){
    const tables=new Map, native=samples[0][m-1], plant=native.map(w=>{
      const P=w.seq, a=1+rng()%28,b=rng()%29;
      const C=P.slice(0,m).map(()=>rng()%29);
      function row(history){
        const key=group(w,2,true)+":"+history.join(",");
        let v=tables.get(key);
        if(!v){
          v=Array.from({length:29},(_,i)=>i);
          for(let i=28;i>0;i--){let j=rng()%(i+1);[v[i],v[j]]=[v[j],v[i]]}
          tables.set(key,v);
        }
        return v;
      }
      for(let j=m;j<P.length;j++)C.push(mod(C[j-1]+a*row(P.slice(j-m,j))[P[j]]+b));
      const dec=P.slice(0,m);
      for(let j=m;j<C.length;j++)dec.push(row(dec.slice(j-m,j)).indexOf(mod(inv(a)*(C[j]-C[j-1]-b))));
      if(dec.join(",")!==P.join(","))throw Error("positive exact inverse");
      return {...w,seq:C};
    });
    for(let k=2;k<=6;k++)if(!feasible(hist(plant,m,k,2,true,2,true),hist(native,m,k,2,false,2,true)))throw Error("valid positive rejected");
    positive.push({m,runes:plant.flatMap(x=>x.seq).length,contextRows:tables.size});
  }
  let result=[];
  for(let mode=0;mode<=2;mode++)for(const byLen of [false,true])for(let scope=0;scope<=2;scope++)for(let m=1;m<=6;m++){
    const O=Array.from({length:5},(_,i)=>hist(words,m,i+2,scope,true,mode,byLen));
    const pass=samples.map(ds=>ds.filter(w=>O.every((o,i)=>feasible(o,hist(w,m,i+2,scope,false,mode,byLen)))).length);
    result.push({mode,byLen,scope,m,pass,originalBounds:O.map(bounds)});
  }
  return {words:words.length,runes:12956,carry:32,samplesPerDonor:64,seed:330104,positive,result};
}
console.log(JSON.stringify(main(files),null,2));
