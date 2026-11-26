"use strict";
// Agent3: periodic q8 word-ordinal jump key inference; ordinary consuming, exact finite lexical anchor gate.
const fs=require("node:fs");
const paths=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-page-groups-54-55-derived.json","resources/control/english_wordfreq_textblob.txt","resources/external/relikd-solved-gp29-native-v1.json"];
function experiment(raw,mode="all"){
 const Q=29,q=8,alphabet="0123456789abcdefghijklmnopqrs",gp=JSON.parse(raw[0]),g=JSON.parse(raw[1]),gold=JSON.parse(raw[3]),mod=x=>(x+Q)%Q,ix=new Map(gp.runes.map((x,i)=>[x,i])),id=a=>String.fromCharCode(...a.map(x=>65+x)),from=s=>Array.from(s,c=>c.charCodeAt(0)-65);
 const names=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
 function word(w,alt){w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const o=[];for(let j=0;j<w.length;){const z=alt&&w.startsWith("ING",j)?{t:"ING",i:21}:alt&&w.startsWith("IO",j)?{t:"IO",i:27}:names.find(z=>w.startsWith(z.t,j));if(!z)throw Error("unknown "+w);o.push(z.i);j+=z.t.length;}return id(o);}
 const lex=new Set(Array.from({length:Q},(_,x)=>id([x])));
 for(const l of raw[2].split(/\r?\n/)){const m=l.match(/^([a-z]+)\s+(\d+)$/i);if(m){lex.add(word(m[1],true));lex.add(word(m[1],false));}}
 const native=gold.sections.map(s=>({name:s.name,words:(s.source_text.match(/[\u16a0-\u16ff]+/gu)||[]).map(w=>id(Array.from(w,c=>ix.get(c))))}));
 for(const s of native)for(const w of s.words)lex.add(w);
 const byLen=new Map();for(const w of lex){if(!byLen.has(w.length))byLen.set(w.length,[]);byLen.get(w.length).push(w);}
 function makeJump(W){let j=0;return Array.from({length:W},(_,k)=>(j=(j+gp.prime[k%Q])%q));}
 function encode(words,K){let p=0;const jump=makeJump(words.length);return words.flatMap((w,k)=>from(w).map(x=>(x+K[(p+++jump[k])%q])%Q));}
 function inventory(lengths){const N=lengths.reduce((a,b)=>a+b,0),W=lengths.length,L=[...new Set(lengths)].sort((a,b)=>a-b),counts=L.map(l=>lengths.filter(x=>x===l).length),S=N+1,jump=makeJump(W);
  if(L.length>30)throw Error("bit mask");
  const E=new Int32Array(W*S),ph=L.map(()=>new Uint8Array(S));
  // For each length l, take it out and find all feasible prefix (ordinal,offset) sums.
  for(let a=0;a<L.length;a++){
   const l=L[a],D=new Uint8Array(W*S);D[0]=1;let n=0;
   for(let b=0;b<L.length;b++)for(let t=0;t<counts[b]-(a===b?1:0);t++){
    const v=L[b];n++;for(let k=n;k>=1;k--)for(let p=N-l;p>=v;p--)if(D[(k-1)*S+p-v])D[k*S+p]=1;
   }
   for(let k=0;k<W;k++)for(let p=0;p<=N-l;p++)if(D[k*S+p]){E[k*S+p]|=1<<a;ph[a][p]|=1<<((p+jump[k])%q);}
  }
  return {N,W,L,counts,S,jump,E,ph};
 }
 function sig(w){let s="";for(let i=q;i<w.length;i++)s+=String.fromCharCode(65+mod(w[i]-w[i-q]));return s;}
 function propose(C,I,B){
  const {L,counts,ph,N}=I,ls=L.flatMap((l,i)=>Array(counts[i]).fill(l)).sort((a,b)=>b-a),floor=ls[B];if(floor<q)throw Error("no full-key anchor guarantee");
  const keys=new Set();let pairs=0,joins=0;
  for(let a=0;a<L.length;a++)if(L[a]>=floor){const l=L[a],index=new Map();
   for(const w of byLen.get(l)||[]){const t=from(w),s=sig(t);if(!index.has(s))index.set(s,[]);index.get(s).push(t);}
   for(let p=0;p+l<=N;p++)if(ph[a][p])for(const w of index.get(sig(C.slice(p,p+l)))||[]){pairs++;const k=Array.from({length:q},(_,i)=>mod(C[p+i]-w[i]));let m=ph[a][p];while(m){const bit=m&-m,phase=31-Math.clz32(bit),K=Array(q);m^=bit;for(let i=0;i<q;i++)K[(phase+i)%q]=k[i];keys.add(id(K));joins++;}}
  }
  return {keys,floor,pairs,joins};
 }
 function receiver(C,I,K,B,trace=false){
  const {N,W,L,counts,S,jump,E}=I,shift=from(K),T=Array.from({length:q},(_,s)=>id(C.map((x,p)=>mod(x-shift[(p+s)%q])))),cache=new Int32Array(q*S).fill(-1);
  function valid(s,p){const i=s*S+p;if(cache[i]>=0)return cache[i];let m=0;for(let a=0;a<L.length;a++)if(p+L[a]<=N&&lex.has(T[s].slice(p,p+L[a])))m|=1<<a;return cache[i]=m;}
  // Exact shortest path on the relaxed state graph, restricted to budget B.
  let f=new Uint8Array(S).fill(255),h=new Uint8Array(S).fill(255),active=[0];f[0]=0;let steps=0;
  for(let k=0;k<W;k++){h.fill(255);const next=[];for(const p of active){let m=E[k*S+p];if(!m)continue;const v=valid(jump[k],p);while(m){const bit=m&-m,a=31-Math.clz32(bit),np=p+L[a],c=f[p]+Number(!(v&bit));m^=bit;if(c<=B&&c<h[np]){if(h[np]===255)next.push(np);h[np]=c;}}}steps+=active.length;[f,h]=[h,f];active=next;if(!active.length)return {lb:255,steps};}
  if(f[N]>B||!trace)return {lb:f[N],steps};
  // Exact suffix bound for arbitrary states, then DFS over true length inventories.
  const D=new Uint8Array((W+1)*S).fill(255);D[W*S+N]=0;
  for(let k=W-1;k>=0;k--)for(let p=0;p<N;p++){let m=E[k*S+p];if(!m)continue;const v=valid(jump[k],p);let best=255;while(m){const bit=m&-m,a=31-Math.clz32(bit),np=p+L[a],c=D[(k+1)*S+np]+Number(!(v&bit));m^=bit;if(c<best)best=c;}D[k*S+p]=best;}
  const rem=counts.slice(),failed=new Set(),out=[];let nodes=0,capped=false;
  function dfs(k,p,b){if(++nodes>3000000){capped=true;return false;}if(D[k*S+p]>b)return false;if(k===W)return p===N;const state=rem.join(",")+":"+b;if(failed.has(state))return false;const v=valid(jump[k],p);for(const o of [0,1]){if(o>b)continue;for(let a=0;a<L.length;a++){const l=L[a],bit=1<<a;if(!rem[a]||!(E[k*S+p]&bit)||Number(!(v&bit))!==o||D[(k+1)*S+p+l]>b-o)continue;rem[a]--;out.push(T[jump[k]].slice(p,p+l));if(dfs(k+1,p+l,b-o))return true;out.pop();rem[a]++;if(capped)return false;}}failed.add(state);return false;}
  let found=false,minOOV=null;for(let b=f[N];b<=B;b++){if(dfs(0,0,b)){found=true;minOOV=b;break;}if(capped)break;}
  if(found){if(encode(out,shift).join()!==C.join())throw Error("replay");if(out.map(x=>x.length).sort((a,b)=>a-b).join()!==I.L.flatMap((l,i)=>Array(I.counts[i]).fill(l)).join())throw Error("inventory");}
  return {lb:f[N],steps,nodes,capped,found,minOOV,words:found?out.slice():null};
 }
 function solve(C,lengths,B,truth=null){
  const I=inventory(lengths),P=propose(C,I,B),survivors=[],exact=[],t0=Date.now();let nodes=0,states=0,minBudget=255,truthRetained=truth?P.keys.has(truth):null,truthRelaxed=null;
  for(const K of P.keys){const r=receiver(C,I,K,B);states+=r.steps;if(r.lb<=B){survivors.push({K,lb:r.lb});minBudget=Math.min(minBudget,r.lb);}if(K===truth)truthRelaxed=r.lb;}
  for(const s of survivors){const r=receiver(C,I,s.K,B,true);nodes+=r.nodes||0;exact.push({key:from(s.K),...r,words:r.words?.map(w=>from(w).map(x=>gp.translit[x]).join("")),rawWords:r.words});}
  return {N:I.N,W:I.W,B,counts:Object.fromEntries(I.L.map((l,i)=>[l,I.counts[i]])),anchorFloor:P.floor,anchorMatches:P.pairs,phaseJoins:P.joins,keys:P.keys.size,truthRetained,truthRelaxed,relaxedSurvivors:survivors.length,minBudget:minBudget===255?null:minBudget,states,nodes,exact,elapsedMs:Date.now()-t0};
 }
 const groups=[...g.p54.body_groups.slice(0,-1),g.p54.body_groups.at(-1)+g.p55.groups[0],...g.p55.groups.slice(1)],C=Array.from(groups.join(""),x=>alphabet.indexOf(x)),lengths=groups.map(w=>w.length);
 if(C.join()!==gp.pages[54].indices.slice(9).concat(gp.pages[55].indices).join())throw Error("source tape");
 function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296};}
 function shuffle(a,R){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
 function control(name,words,B,seed){const R=rng(seed),K=Array.from({length:q},()=>Math.floor(R()*Q)),c=encode(words,K),ls=shuffle(words.map(w=>w.length),R),r=solve(c,ls,B,id(K)),hit=r.exact.find(s=>s.key.join()===K.join()&&s.found);return {name,key:K,truthOOV:words.filter(w=>!lex.has(w)).length,truthFound:!!hit,truthWords:hit?hit.rawWords.filter((w,i)=>w===words[i]).length:null,truthRunes:hit?from(hit.rawWords.join("")).filter((x,i)=>x===from(words.join(""))[i]).length:null,...r};}
 const result={lexiconSize:lex.size,clock:"C[pos+i]=P_i+K[(pos+i+sum_{j=0}^k prime[j mod29]) mod8] mod29; ordinary consuming; no F holds",original:null,controls:[]};
 if(mode!=="original"){for(const name of ["0_loss_of_divinity","0_koan_1"]){const s=native.find(s=>s.name===name),a=s.words.findIndex(w=>w.length>=10);if(a<0)throw Error("native anchor");const start=Math.max(0,a-12),words=s.words.slice(start,start+48);result.controls.push(control(name,words,0,0x28870000+start+(name==="0_koan_1"?1:0)));}
  const R=rng(0x28870003),ls=shuffle(lengths,R),words=ls.map(l=>{const a=byLen.get(l);return a[Math.floor(R()*a.length)]});let removed=0;for(let i=0;i<words.length&&removed<3;i++)if(words[i].length>=10){const l=words[i].length;let w;do{w=id(Array.from({length:l},()=>Math.floor(R()*Q)));}while(lex.has(w));words[i]=w;removed++;}if(removed!==3)throw Error("stress");result.controls.push(control("same inventory, three long OOV",words,3,0x28870004));
 }
 if(mode!=="controls")result.original=solve(C,lengths,3);
 return result;
}
if(require.main===module)console.log(JSON.stringify(experiment(paths.map(p=>fs.readFileSync(p,"utf8")),process.argv[2]||"all"),null,2));
module.exports={experiment,paths};
