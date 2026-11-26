"use strict";
// Agent7 #2887: exact relaxed fixed prime-pad U2b receiver.
const fs=require("node:fs");
const paths=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-page-groups-54-55-derived.json","resources/control/english_wordfreq_textblob.txt","resources/external/relikd-solved-gp29-native-v1.json"];
function experiment(raw){
 const gp=JSON.parse(raw[0]),g=JSON.parse(raw[1]),gold=JSON.parse(raw[3]),Q=29;
 const mod=x=>((x%Q)+Q)%Q, ix=new Map(gp.runes.map((x,i)=>[x,i])),id=a=>String.fromCharCode(...a.map(x=>65+x)),from=s=>Array.from(s,c=>c.charCodeAt(0)-65);
 const names=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
 function word(w,alt){w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const o=[];for(let j=0;j<w.length;){const z=alt&&w.startsWith("ING",j)?{t:"ING",i:21}:alt&&w.startsWith("IO",j)?{t:"IO",i:27}:names.find(z=>w.startsWith(z.t,j));if(!z)throw Error("unknown "+w);o.push(z.i);j+=z.t.length;}return id(o);}
 const lex=new Set(Array.from({length:Q},(_,x)=>id([x])));
 for(const l of raw[2].split(/\r?\n/)){const m=l.match(/^([a-z]+)\s+(\d+)$/i);if(m){lex.add(word(m[1],true));lex.add(word(m[1],false));}}
 const native=gold.sections.map(s=>({name:s.name,words:(s.source_text.match(/[\u16a0-\u16ff]+/gu)||[]).map(w=>id(Array.from(w,c=>ix.get(c))))}));
 for(const s of native)for(const w of s.words)lex.add(w);
 const primes=[];for(let n=2;primes.length<10000;n++){if(primes.every(p=>p*p>n||n%p!==0))primes.push(n);}
 const K=primes.map(p=>mod(p-1));
 function jump(W){let j=0;return Array.from({length:W},(_,k)=>j+=gp.prime[k%Q]);}
 function encode(words,useJump=true){let h=0;const J=jump(words.length);return words.flatMap((w,k)=>from(w).map(x=>x===0?0:mod(x+K[h+++(useJump?J[k]:0)])));}
 const p56=native.find(s=>s.name==="p56_an_end").words;
 if(encode(p56,false).join()!==gp.pages[56].indices.join())throw Error("authentic p56 mismatch");
 function solve(C,lengths,offset=0){
  const N=C.length,W=lengths.length,L=[...new Set(lengths)].sort((a,b)=>a-b),S=N+1,H=C.filter(x=>x===0).length+1,counts=L.map(l=>lengths.filter(x=>x===l).length),J=jump(W);
  if(N!==lengths.reduce((a,b)=>a+b,0)||J.at(-1)+N+offset>=K.length)throw Error("bounds");
  const E=new Int32Array(W*S);
  for(let a=0;a<L.length;a++){const l=L[a],D=new Uint8Array(W*S);D[0]=1;let n=0;for(let b=0;b<L.length;b++)for(let t=0;t<counts[b]-(a===b?1:0);t++){const v=L[b];n++;for(let k=n;k>=1;k--)for(let p=N-l;p>=v;p--)if(D[(k-1)*S+p-v])D[k*S+p]=1;}for(let k=0;k<W;k++)for(let p=0;p<=N-l;p++)if(D[k*S+p])E[k*S+p]|=1<<a;}
  let states=new Map([[0,{cost:0,prev:null}]]),visits=0,edges=0;
  const maxL=L.at(-1),lens=new Map(L.map((l,i)=>[l,1<<i]));
  for(let k=0;k<W;k++){
   const next=new Map();
   for(const [state,v] of states){const p=Math.floor(state/H),held=state%H,mask=E[k*S+p];if(!mask)continue;visits++;
    let partial=[{w:"",h:held}];
    for(let l=1;l<=maxL&&p+l<=N;l++){
     const c=C[p+l-1],arr=[];
     for(const x of partial){
      const idx=p+l-1-x.h+J[k]+offset, z=mod(c-K[idx]);
      if(z!==0)arr.push({w:x.w+String.fromCharCode(65+z),h:x.h});
      if(c===0)arr.push({w:x.w+"A",h:x.h+1});
     }
     partial=arr;if(!partial.length)break;
     if(!(mask&(lens.get(l)||0)))continue;
     for(const x of partial){edges++;const ns=(p+l)*H+x.h,cost=v.cost+Number(!lex.has(x.w)),old=next.get(ns);if(!old||cost<old.cost)next.set(ns,{cost,prev:v,w:x.w});}
    }
   }
   states=next;if(!states.size)return {minimumOOV:null,deadOrdinal:k+1,visits,edges};
  }
  const terminal=[...states].filter(([s])=>Math.floor(s/H)===N).sort((a,b)=>a[1].cost-b[1].cost);
  if(!terminal.length)return {minimumOOV:null,visits,edges};
  const [last,best]=terminal[0],words=[];for(let x=best;x.prev;x=x.prev)words.push(x.w);words.reverse();
  if(offset===0&&encode(words).join()!==C.join())throw Error("replay");
  const same=words.map(w=>w.length).sort((a,b)=>a-b).join()===lengths.slice().sort((a,b)=>a-b).join();
  return {minimumOOV:best.cost,terminalHeld:last%H,terminalStates:terminal.length,visits,edges,exactInventoryWitness:same,words:words.map(w=>from(w).map(x=>gp.translit[x]).join("")),raw:words};
 }
 const groups=[...g.p54.body_groups.slice(0,-1),g.p54.body_groups.at(-1)+g.p55.groups[0],...g.p55.groups.slice(1)],alphabet="0123456789abcdefghijklmnopqrs",C=Array.from(groups.join(""),x=>alphabet.indexOf(x)),lengths=groups.map(w=>w.length);
 if(C.join()!==gp.pages[54].indices.slice(9).concat(gp.pages[55].indices).join())throw Error("source tape");
 const controls=[];
 for(const name of ["0_loss_of_divinity","0_koan_1","0_welcome","p56_an_end"]){
  const words=native.find(s=>s.name===name).words.slice(0,48),c=encode(words),ls=words.map(w=>w.length).reverse(),r=solve(c,ls);
  if(r.minimumOOV!==0)throw Error("control lost");
  const recovered=from(r.raw.join("")).filter((x,i)=>x===from(words.join(""))[i]).length;
  delete r.raw;controls.push({name,N:c.length,W:words.length,recovered,exactWords:r.words.length===words.length&&r.words.join("|")===words.map(w=>from(w).map(x=>gp.translit[x]).join("")).join("|"),...r});
 }
 const original=solve(C,lengths);delete original.raw;
 return {model:"C=0 for P=0 (hold); otherwise C=P+prime[h+J_k]-1 mod29; J_k=sum of chart primes through true word ordinal k, h prior consuming runes, origin zero",lexicon:lex.size,nativeP56Replay:85,originalLength:C.length,originalWordCount:lengths.length,controls,original};
}
if(require.main===module)console.log(JSON.stringify(experiment(paths.map(p=>fs.readFileSync(p,"utf8"))),null,2));
module.exports={experiment,paths};
