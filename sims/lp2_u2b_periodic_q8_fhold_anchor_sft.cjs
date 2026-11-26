"use strict";
// Agent3: periodic q8 U2b exact literal-plaintext-F hold gate.
const fs=require("node:fs");
const paths=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-page-groups-54-55-derived.json","resources/control/english_wordfreq_textblob.txt","resources/external/relikd-solved-gp29-native-v1.json"];
function experiment(raw,mode="all",start=0,count=Infinity){
 const Q=29,q=8,alphabet="0123456789abcdefghijklmnopqrs",gp=JSON.parse(raw[0]),g=JSON.parse(raw[1]),gold=JSON.parse(raw[3]),mod=x=>(x+Q)%Q,ix=new Map(gp.runes.map((x,i)=>[x,i])),id=a=>String.fromCharCode(...a.map(x=>65+x)),from=s=>Array.from(s,c=>c.charCodeAt(0)-65);
 const names=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
 function word(w,alt){w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const o=[];for(let j=0;j<w.length;){const z=alt&&w.startsWith("ING",j)?{t:"ING",i:21}:alt&&w.startsWith("IO",j)?{t:"IO",i:27}:names.find(z=>w.startsWith(z.t,j));if(!z)throw Error("unknown "+w);o.push(z.i);j+=z.t.length;}return id(o);}
 const lex=new Set(Array.from({length:Q},(_,x)=>id([x])));
 for(const l of raw[2].split(/\r?\n/)){const m=l.match(/^([a-z]+)\s+(\d+)$/i);if(m){lex.add(word(m[1],true));lex.add(word(m[1],false));}}
 const native=gold.sections.map(s=>({name:s.name,words:(s.source_text.match(/[\u16a0-\u16ff]+/gu)||[]).map(w=>id(Array.from(w,c=>ix.get(c))))}));
 for(const s of native)for(const w of s.words)lex.add(w);
 const byLen=new Map();for(const w of lex){if(!byLen.has(w.length))byLen.set(w.length,[]);byLen.get(w.length).push(w);}
 function makeJump(W){let j=0;return Array.from({length:W},(_,k)=>(j=(j+gp.prime[k%Q])%q));}

function encode(words,K){let h=0;const jump=makeJump(words.length);return words.flatMap((w,k)=>from(w).map(x=>x===0?0:(x+K[(h+++jump[k])%q])%Q));}
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

function propose(C,I,B){
 const {L,counts,ph,N}=I,ls=L.flatMap((l,i)=>Array(counts[i]).fill(l)).sort((a,b)=>b-a),floor=ls[B];if(floor<q)throw Error("no full-key anchor guarantee");
 const prefix=new Int32Array(N+1);for(let p=0;p<N;p++)prefix[p+1]=prefix[p]+Number(C[p]===0);
 const keys=new Set();let pairs=0,joins=0,partialPairs=0,maxMissing=0;
 for(let a=0;a<L.length;a++)if(L[a]>=floor){
  const l=L[a],words=(byLen.get(l)||[]).map(from);
  for(let p=0;p+l<=N;p++)if(ph[a][p]){
   let m=ph[a][p],pm=0;
   while(m){const b=m&-m,phase=31-Math.clz32(b);m^=b;for(let f=0;f<=Math.min(7,prefix[p]);f++)pm|=1<<((phase+q-f)%q);}
   const z=prefix[p+l]-prefix[p];
   for(const w of words){
    const v=new Int8Array(q).fill(-1);let ok=true,h=0;
    for(let i=0;i<l;i++){
     if(w[i]===0){if(C[p+i]!==0){ok=false;break;}continue;}
     const x=mod(C[p+i]-w[i]),j=h++%q;
     if(v[j]>=0&&v[j]!==x){ok=false;break;}v[j]=x;
    }
    if(!ok)continue;
    pairs++;
    const missing=Array.from(v).flatMap((x,j)=>x<0?[j]:[]);if(missing.length){partialPairs++;maxMissing=Math.max(maxMissing,missing.length);}
    // Complete every unobserved digit, even for low-consuming dictionary words.
    function complete(j){
     if(j<missing.length){for(let x=0;x<Q;x++){v[missing[j]]=x;complete(j+1);}return;}
     let b=pm;while(b){const bit=b&-b,phase=31-Math.clz32(bit),K=Array(q);b^=bit;for(let i=0;i<q;i++)K[(phase+i)%q]=v[i];keys.add(id(K));joins++;}
    }
    complete(0);
   }
  }
 }
 return {keys:[...keys],floor,pairs,joins,partialPairs,maxMissing};
}
function receiver(C,I,K,B,trace=false){
 const {N,W,L,counts,S,jump,E}=I,shift=from(K),H=C.filter(x=>x===0).length+1,M=S*H,cache=Array(q*S),lIndex=new Map(L.map((l,a)=>[l,a])),maxL=L.at(-1);
 function options(p,s){
  const i=s*S+p;if(cache[i]!==undefined)return cache[i];const result=new Map();let paths=[{w:"",d:0}];
  for(let j=0;j<maxL&&p+j<N&&paths.length;j++){
   const c=C[p+j],next=[];
   for(const z of paths){
    if(c===0)next.push({w:z.w+"A",d:z.d+1});
    const x=mod(c-shift[(p+j+s-z.d)%q]);if(x!==0)next.push({w:z.w+String.fromCharCode(65+x),d:z.d});
   }
   paths=next;const a=lIndex.get(j+1);
   if(a!==undefined)for(const z of paths){const o=Number(!lex.has(z.w)),key=a*(maxL+1)+z.d,old=result.get(key);if(!old||o<old.o)result.set(key,{a,l:j+1,d:z.d,o,w:z.w});}
  }
  return cache[i]=[...result.values()];
 }
 let f=new Uint8Array(M).fill(255),h=new Uint8Array(M).fill(255),active=[0];f[0]=0;let steps=0;
 for(let k=0;k<W;k++){
  h.fill(255);const next=[];
  for(const ix of active){const p=Math.floor(ix/H),held=ix%H,mask=E[k*S+p];if(!mask)continue;
   for(const z of options(p,(jump[k]+q-held%q)%q))if(mask&(1<<z.a)){const c=f[ix]+z.o,to=(p+z.l)*H+held+z.d;if(c<=B&&c<h[to]){if(h[to]===255)next.push(to);h[to]=c;}}
  }
  steps+=active.length;[f,h]=[h,f];active=next;if(!active.length)return {lb:255,steps};
 }
 let best=255;for(let held=0;held<H;held++)best=Math.min(best,f[N*H+held]);
 if(best>B||!trace)return {lb:best,steps};
 const memo=new Uint8Array((W+1)*M).fill(254);
 function lower(k,p,held){
  if(k===W)return p===N?0:255;const ix=k*M+p*H+held;if(memo[ix]!==254)return memo[ix];
  let best=255;const mask=E[k*S+p];if(mask)for(const z of options(p,(jump[k]+q-held%q)%q))if(mask&(1<<z.a))best=Math.min(best,z.o+lower(k+1,p+z.l,held+z.d));return memo[ix]=best;
 }
 const rem=counts.slice(),failed=new Set(),out=[];let nodes=0,capped=false;
 function dfs(k,p,held,b){
  if(++nodes>3000000){capped=true;return false;}if(lower(k,p,held)>b)return false;if(k===W)return p===N;
  const state=rem.join(",")+":"+held+":"+b;if(failed.has(state))return false;
  const mask=E[k*S+p],opts=options(p,(jump[k]+q-held%q)%q);
  for(const o of [0,1])if(o<=b)for(const z of opts)if(z.o===o&&rem[z.a]&&(mask&(1<<z.a))&&lower(k+1,p+z.l,held+z.d)<=b-o){
   rem[z.a]--;out.push(z.w);if(dfs(k+1,p+z.l,held+z.d,b-o))return true;out.pop();rem[z.a]++;if(capped)return false;
  }
  failed.add(state);return false;
 }
 let found=false,minOOV=null;for(let b=best;b<=B;b++){if(dfs(0,0,0,b)){found=true;minOOV=b;break;}if(capped)break;}
 if(found){if(encode(out,shift).join()!==C.join())throw Error("replay");if(out.map(x=>x.length).sort((a,b)=>a-b).join()!==I.L.flatMap((l,i)=>Array(I.counts[i]).fill(l)).join())throw Error("inventory");}
 return {lb:best,steps,nodes,capped,found,minOOV,words:found?out.slice():null};
}
function solve(C,lengths,B,truth=null){
 const I=inventory(lengths),P=propose(C,I,B),survivors=[],exact=[],t0=Date.now();let nodes=0,states=0,minBudget=255,truthRetained=truth?P.keys.includes(truth):null,truthRelaxed=null;
 const end=Math.min(P.keys.length,start+count);
 for(let i=start;i<end;i++){const K=P.keys[i],r=receiver(C,I,K,B);states+=r.steps;if(r.lb<=B){survivors.push({K,lb:r.lb});minBudget=Math.min(minBudget,r.lb);}if(K===truth)truthRelaxed=r.lb;}
 for(const s of survivors){const r=receiver(C,I,s.K,B,true);nodes+=r.nodes||0;exact.push({key:from(s.K),...r,words:r.words?.map(w=>from(w).map(x=>gp.translit[x]).join("")),rawWords:r.words});}
 return {N:I.N,W:I.W,B,visibleZeros:C.filter(x=>x===0).length,counts:Object.fromEntries(I.L.map((l,i)=>[l,I.counts[i]])),anchorFloor:P.floor,anchorMatches:P.pairs,phaseJoins:P.joins,partialPairs:P.partialPairs,maxMissing:P.maxMissing,keys:P.keys.length,range:[start,end],truthKeyIndex:truth?P.keys.indexOf(truth):null,truthRetained,truthRelaxed,relaxedSurvivors:survivors.length,minBudget:minBudget===255?null:minBudget,states,nodes,exact,elapsedMs:Date.now()-t0};
}
 const groups=[...g.p54.body_groups.slice(0,-1),g.p54.body_groups.at(-1)+g.p55.groups[0],...g.p55.groups.slice(1)],C=Array.from(groups.join(""),x=>alphabet.indexOf(x)),lengths=groups.map(w=>w.length);
 if(C.join()!==gp.pages[54].indices.slice(9).concat(gp.pages[55].indices).join())throw Error("source tape");
 function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296};}
 function shuffle(a,R){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}

 function control(name,words,B,seed){const R=rng(seed),K=Array.from({length:q},()=>Math.floor(R()*Q)),c=encode(words,K),ls=shuffle(words.map(w=>w.length),R),r=solve(c,ls,B,id(K)),hit=r.exact.find(s=>s.key.join()===K.join()&&s.found);return {name,key:K,truthOOV:words.filter(w=>!lex.has(w)).length,truthFound:!!hit,truthWords:hit?hit.rawWords.filter((w,i)=>w===words[i]).length:null,truthRunes:hit?from(hit.rawWords.join("")).filter((x,i)=>x===from(words.join(""))[i]).length:null,...r};}


 const result={lexiconSize:lex.size,clock:"C=P+K[(consumingCount+J_k) mod8] mod29 except literal plaintext F emits F and does not consume",original:null,controls:[]};
 if(mode==="loss"||mode==="koan"||mode==="all"){for(const name of ["0_loss_of_divinity","0_koan_1"]){if(mode!=="all"&&((mode==="loss")!==(name==="0_loss_of_divinity")))continue;const s=native.find(s=>s.name===name),a=s.words.findIndex(w=>w.length>=10);if(a<0)throw Error("native anchor");const off=Math.max(0,a-12),words=s.words.slice(off,off+48);result.controls.push(control(name,words,0,0x28870000+off+(name==="0_koan_1"?1:0)));}}
 if(mode==="stress"||mode==="all"){const R=rng(0x28870003),ls=shuffle(lengths,R),words=ls.map(l=>{const a=byLen.get(l);return a[Math.floor(R()*a.length)]});let removed=0;for(let i=0;i<words.length&&removed<3;i++)if(words[i].length>=10){const l=words[i].length;let w;do{w=id(Array.from({length:l},()=>Math.floor(R()*Q)));}while(lex.has(w));words[i]=w;removed++;}if(removed!==3)throw Error("stress");result.controls.push(control("same inventory, three long OOV",words,3,0x28870004));}
 if(mode==="original"||mode==="all")result.original=solve(C,lengths,3);
 return result;
}

if(require.main===module)console.log(JSON.stringify(experiment(paths.map(p=>fs.readFileSync(p,"utf8")),process.argv[2]||"all",+(process.argv[3]||0),process.argv[4]===undefined?Infinity:+process.argv[4]),null,2));
module.exports={experiment,paths};
