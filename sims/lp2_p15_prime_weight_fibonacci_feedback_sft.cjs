"use strict";
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
// Source: p15 original spiral, solved p56 prime-minus-one shift, and GP29 prime alphabet.
// A bounded exploratory transfer, not an authored cipher claim.
function run(j,native,assert){
  const mod=x=>((x%29)+29)%29;
  const gp=j.prime.map(x=>mod(x-1));
  const seed=mod(3299)*29+mod(3298);
  assert(j.pages[15].page===15&&j.pages[15].runic_count===159,"source layout");
  const source=j.pages.slice(15,23).flatMap(p=>p.page===15?p.indices.slice(9):p.indices);
  assert(source.length===1894,"receiver length");
  const rune=new Map(j.runes.map((v,i)=>[v,i]));
  const plain=native.sections.map(s=>({name:s.name,P:Array.from(s.source_text).filter(x=>rune.has(x)).map(x=>rune.get(x))}));
  const all=Array.from({length:841},(_,i)=>i);
  /** @param {number} s @param {number} p */
  function step(s,p){const a=Math.floor(s/29),b=s%29;return b*29+mod(a+b+gp[p]);}
  /** @param {number[]} P @param {number} s @param {boolean} hold */
  function enc(P,s,hold){const C=[],states=[];for(const p of P){if(hold&&p===0){C.push(0);}else{C.push(mod(p+Math.floor(s/29)));s=step(s,p);}states.push(s);}return{C,states};}
  /** @param {number[]} C @param {number} s */
  function dec(C,s){const P=[];for(const c of C){const p=mod(c-Math.floor(s/29));P.push(p);s=step(s,p);}return P;}
  function ioc(P){const h=Array(29).fill(0);for(const p of P)h[p]++;return h.reduce((a,b)=>a+b*(b-1),0)/(P.length*(P.length-1));}
  /** @param {number[]} C @param {number[]} initial @param {number[]} [trueStates] */
  function reach(C,initial,trueStates){
    let states=new Set(initial),peak=0,branch=0;
    for(let i=0;i<C.length;i++){
      const c=C[i],next=new Set();
      for(const s of states){
        const p=mod(c-Math.floor(s/29));
        if(c===0){next.add(s);if(p!==0)branch++;}
        if(p!==0)next.add(step(s,p));
      }
      if(trueStates)assert(next.has(trueStates[i]),`missing true state at ${i}`);
      if(!next.size)return{death:i,c,previous:[...states],peak,branch};
      states=next;peak=Math.max(peak,states.size);
    }
    return{death:null,peak,end:states.size,branch};
  }
  const controls=plain.map(({name,P},i)=>{
    const s=mod(7*i+3)*29+mod(11*i+5);
    const e=enc(P,s,true), r=reach(e.C,[s],e.states);
    const q=dec(enc(P,s,false).C,s);
    assert(q.every((v,k)=>v===P[k]),"ordinary inverse");
    assert(r.death===null,"F-hold inverse");
    return{name,n:P.length,ioc:ioc(P),hold:r};
  });
  const fixed=reach(source,[seed]), unrestricted=reach(source,all);
  assert(fixed.death===139&&unrestricted.death===349,"original reachability");
  // Deliberately keep this no-hold check separate from the exact support result.
  // Train a conditional trigram model only on solved native texts, with add-one smoothing.
  function model(records){
    const count=new Float64Array(29**3).fill(1), den=new Float64Array(29**2).fill(29);
    for(const {P} of records)for(let i=2;i<P.length;i++){
      const k=P[i-2]*29+P[i-1];count[k*29+P[i]]++;den[k]++;
    }
    return Array.from(count,(n,k)=>Math.log(n/den[Math.floor(k/29)]));
  }
  function score(P,m){let x=0;for(let i=2;i<P.length;i++)x+=m[(P[i-2]*29+P[i-1])*29+P[i]];return x/(P.length-2);}
  function rank(C,m){
    let top=null,maxIoc=null;
    for(const s of all){
      const P=dec(C,s),d={s,score:score(P,m),ioc:ioc(P)};
      if(!top||d.score>top.score)top=d;
      if(!maxIoc||d.ioc>maxIoc.ioc)maxIoc=d;
    }
    return{top,maxIoc};
  }
  // Exact all-IV synchronizing image, under the same no-hold law.
  const full=j.pages.slice(15,56).flatMap(p=>p.page===15?p.indices.slice(9):p.indices);
  assert(full.length===9344,"full source continuation");
  let image=new Set(all), sync=null;
  for(let i=0;i<full.length;i++){
    const c=full[i], next=new Set();
    for(const s of image)next.add(step(s,mod(c-Math.floor(s/29))));
    image=next;
    if(image.size===1){sync={i,state:[...image][0]};break;}
  }
  assert(sync&&sync.i===1445&&sync.state===733,"all-IV synchronization");
  const fullP=dec(full,seed);
  assert(enc(fullP,seed,false).C.every((x,i)=>x===full[i]),"full replay");
  const start40=j.pages.slice(15,40).reduce((n,p)=>n+p.indices.length-(p.page===15?9:0),0);
  const length40to53=j.pages.slice(40,54).reduce((n,p)=>n+p.indices.length,0);
  const holdout=fullP.slice(start40,start40+length40to53);
  const synchronization={...sync,oneStepImage:29*new Set(gp.map((x,p)=>mod(x-p))).size,suffixN:full.length-sync.i-1,suffixIoc:ioc(fullP.slice(sync.i+1)),p40to53N:holdout.length,p40to53Ioc:ioc(holdout),p40to53Prefix:holdout.slice(0,80).map(p=>j.translit[p]).join(" ")};
  const modelAll=model(plain);
  const noHold=rank(source,modelAll);
  const fixedP=dec(source,seed);
  const bestP=dec(source,noHold.top.s);
  assert(enc(fixedP,seed,false).C.every((x,i)=>x===source[i]),"fixed replay");
  assert(enc(bestP,noHold.top.s,false).C.every((x,i)=>x===source[i]),"selected replay");
  const blind=plain.map(({name,P},i)=>{
    const s=mod(7*i+3)*29+mod(11*i+5);
    const m=model(plain.filter((_,k)=>k!==i));
    const r=rank(enc(P,s,false).C,m);
    const q=dec(enc(P,s,false).C,r.top.s);
    return{name,n:P.length,truth:s,found:r.top.s,correct:q.filter((v,k)=>v===P[k]).length,score:r.top.score,trueScore:score(P,m)};
  });
  return {synchronization,sourceN:source.length,gp,sourceSeed:[Math.floor(seed/29),seed%29],fixed,unrestricted,controls,noHold:{...noHold,fixedIoc:ioc(fixedP),fixedScore:score(fixedP,modelAll),bestText:bestP.slice(0,80).map(p=>j.translit[p]).join(" "),fixedText:fixedP.slice(0,80).map(p=>j.translit[p]).join(" ")},blind};
}
const root = path.resolve(__dirname,"..");
const corpus = JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8")));
const native = JSON.parse(fs.readFileSync(path.join(root,"resources/external/relikd-solved-gp29-native-v1.json"),"utf8")));
console.log(JSON.stringify(run(corpus,native,assert),null,2));
