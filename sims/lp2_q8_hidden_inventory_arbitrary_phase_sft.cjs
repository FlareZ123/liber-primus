"use strict";
// Agent3: clock-free periodic q8 exact hidden-start inventory relaxation.
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

function canonical(K){const s=id(K);let best=s;for(let j=1;j<q;j++){const t=s.slice(j)+s.slice(0,j);if(t<best)best=t;}return best;}
function propose(C,I,B){
 const {L,counts,ph,N}=I,ls=L.flatMap((l,i)=>Array(counts[i]).fill(l)).sort((a,b)=>b-a),floor=ls[B];if(floor<q)throw Error("no complete anchor guarantee");
 const keys=new Set(),modeKeys=[new Set(),new Set()];let pairs=[0,0],partial=[0,0];
 for(let a=0;a<L.length;a++)if(L[a]>=floor){const l=L[a],words=(byLen.get(l)||[]).map(from);
  for(let p=0;p+l<=N;p++)if(ph[a][p])for(const w of words)for(let held=0;held<=1;held++){
   const v=new Int8Array(q).fill(-1);let h=0,ok=true;
   for(let i=0;i<l;i++){if(held&&w[i]===0){if(C[p+i]!==0){ok=false;break;}continue;}const x=mod(C[p+i]-w[i]),j=h++%q;if(v[j]>=0&&v[j]!==x){ok=false;break;}v[j]=x;}
   if(!ok)continue;pairs[held]++;const missing=Array.from(v).flatMap((x,j)=>x<0?[j]:[]);if(missing.length)partial[held]++;
   function complete(i){if(i<missing.length){for(let x=0;x<Q;x++){v[missing[i]]=x;complete(i+1);}return;}const K=canonical(Array.from(v));keys.add(K);modeKeys[held].add(K);}
   complete(0);
  }
 }
 return {keys,floor,pairs,partial,modeKeys:modeKeys.map(x=>x.size)};
}
function decodeLocal(C,p,l,K,phase,hold,emit){
 let paths=[{w:"",d:0}];
 for(let j=0;j<l;j++){const c=C[p+j],next=[];for(const z of paths){if(hold&&c===0)next.push({w:z.w+"A",d:z.d+1});const x=mod(c-K[(phase+j-z.d)%q]);if(!hold||x!==0)next.push({w:z.w+String.fromCharCode(65+x),d:z.d});}paths=next;if(!paths.length)break;emit(j+1,paths);}
}
function receiver(C,I,key,B,trace=false){
 const {N,W,L,counts,S,E,ph}=I,K=from(key),maxL=L.at(-1),lIndex=new Map(L.map((l,a)=>[l,a])),valid=new Int32Array(S),witness=trace?Array.from({length:S},()=>Array(L.length)):null;
 for(let p=0;p<N;p++){
  let allowed=0;for(let a=0;a<L.length;a++)if(ph[a][p])allowed|=1<<a;if(!allowed)continue;
  const l=Math.min(maxL,N-p);
  for(let phase=0;phase<q&&(valid[p]&allowed)!==allowed;phase++){
   let w="";for(let j=0;j<l;j++){w+=String.fromCharCode(65+mod(C[p+j]-K[(phase+j)%q]));const a=lIndex.get(j+1);if(a!==undefined&&(allowed&(1<<a))&&!(valid[p]&(1<<a))&&lex.has(w)){valid[p]|=1<<a;if(witness)witness[p][a]={w,phase,hold:false};}}
   if(!C.slice(p,p+l).includes(0))continue;
   decodeLocal(C,p,l,K,phase,true,(n,paths)=>{const a=lIndex.get(n);if(a===undefined||!(allowed&(1<<a))||(valid[p]&(1<<a)))return;for(const z of paths)if(lex.has(z.w)){valid[p]|=1<<a;if(witness)witness[p][a]={w:z.w,phase,hold:true};break;}});
  }
 }
 // Count per-length lexical interval packing. Earliest finish is exact
 // for each equal-length family. Each required group of length l must
 // occupy a different nonoverlapping interval, so forced OOV sums across l.
 const supports=[];let lower=0;
 for(let a=0;a<L.length;a++){let n=0;for(let p=0;p+L[a]<=N;){if(valid[p]&(1<<a)){n++;p+=L[a];}else p++;}supports.push(n);lower+=Math.max(0,counts[a]-n);}
 if(lower>B)return {stage:"length-packing",lb:lower,supports};
 let f=new Uint8Array(S).fill(255),h=new Uint8Array(S).fill(255),active=[0];f[0]=0;let steps=0;
 for(let k=0;k<W;k++){h.fill(255);const next=[];for(const p of active){let m=E[k*S+p];while(m){const bit=m&-m,a=31-Math.clz32(bit),np=p+L[a],c=f[p]+Number(!(valid[p]&bit));m^=bit;if(c<=B&&c<h[np]){if(h[np]===255)next.push(np);h[np]=c;}}}steps+=active.length;[f,h]=[h,f];active=next;if(!active.length)return {stage:"relaxed-path",lb:255,supports,steps};}
 if(f[N]>B||!trace)return {stage:"relaxed-path",lb:f[N],supports,steps};
 const D=new Uint8Array((W+1)*S).fill(255);D[W*S+N]=0;
 for(let k=W-1;k>=0;k--)for(let p=0;p<N;p++){let m=E[k*S+p],best=255;while(m){const bit=m&-m,a=31-Math.clz32(bit),np=p+L[a],c=D[(k+1)*S+np]+Number(!(valid[p]&bit));m^=bit;best=Math.min(best,c);}D[k*S+p]=best;}
 const rem=counts.slice(),failed=new Set(),out=[];let nodes=0,capped=false;
 function dfs(k,p,b){if(++nodes>3000000){capped=true;return false;}if(D[k*S+p]>b)return false;if(k===W)return p===N;const state=rem.join(",")+":"+b;if(failed.has(state))return false;
  // A second packing bound on the unused suffix, conditional on exact counts.
  let need=0;for(let a=0;a<L.length;a++)if(rem[a]){let n=0;for(let t=p;t+L[a]<=N;){if(valid[t]&(1<<a)){n++;t+=L[a];}else t++;}need+=Math.max(0,rem[a]-n);}if(need>b)return false;
  for(const o of [0,1])if(o<=b)for(let a=0;a<L.length;a++){const l=L[a],bit=1<<a;if(!rem[a]||!(E[k*S+p]&bit)||Number(!(valid[p]&bit))!==o||D[(k+1)*S+p+l]>b-o)continue;const z=witness[p][a]||{w:id(C.slice(p,p+l).map((x,j)=>mod(x-K[j%q]))),phase:0,hold:false};rem[a]--;out.push(z);if(dfs(k+1,p+l,b-o))return true;out.pop();rem[a]++;if(capped)return false;}failed.add(state);return false;}
 let found=false,minOOV=null;for(let b=Math.max(f[N],lower);b<=B;b++){if(dfs(0,0,b)){found=true;minOOV=b;break;}if(capped)break;}
 if(found){const enc=out.flatMap(z=>{let h=z.phase;return from(z.w).map(x=>z.hold&&x===0?0:(x+K[h++%q])%Q);});if(enc.join()!==C.join())throw Error("replay");if(out.map(z=>z.w.length).sort((a,b)=>a-b).join()!==I.L.flatMap((l,i)=>Array(I.counts[i]).fill(l)).join())throw Error("inventory");}
 return {stage:"exact",lb:f[N],supports,steps,nodes,capped,found,minOOV,words:found?out.slice():null};
}
function solve(C,lengths,B,truth=null){
 const I=inventory(lengths),P=propose(C,I,B),exact=[],survivors=[];let packingReject=0,pathReject=0,minPacking=Infinity,minRejectedPacking=Infinity,truthStage=null,states=0,nodes=0,t0=Date.now();
 for(const K of P.keys){const r=receiver(C,I,K,B);if(r.stage==="length-packing"){packingReject++;minRejectedPacking=Math.min(minRejectedPacking,r.lb);}else if(r.lb>B){pathReject++;states+=r.steps||0;}else{survivors.push(K);states+=r.steps||0;}if(K===truth)truthStage=r;}
 for(const K of survivors){const r=receiver(C,I,K,B,true);nodes+=r.nodes||0;exact.push({key:from(K),...r,words:r.words?.map(z=>({...z,text:from(z.w).map(x=>gp.translit[x]).join("")}))});}
 return {N:I.N,W:I.W,B,anchorFloor:P.floor,counts:Object.fromEntries(I.L.map((l,i)=>[l,I.counts[i]])),anchorMatches:P.pairs,partialAnchors:P.partial,rotationKeysByMode:P.modeKeys,rotationKeys:P.keys.size,truthRetained:truth?P.keys.has(truth):null,truthStage,packingReject,pathReject,minRejectedPacking:Number.isFinite(minRejectedPacking)?minRejectedPacking:null,relaxedSurvivors:survivors.length,states,nodes,exact,elapsedMs:Date.now()-t0};
}
 const groups=[...g.p54.body_groups.slice(0,-1),g.p54.body_groups.at(-1)+g.p55.groups[0],...g.p55.groups.slice(1)],C=Array.from(groups.join(""),x=>alphabet.indexOf(x)),lengths=groups.map(w=>w.length);
 if(C.join()!==gp.pages[54].indices.slice(9).concat(gp.pages[55].indices).join())throw Error("source tape");
 function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296};}
 function shuffle(a,R){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}

function control(name,words,B,seed){
 const R=rng(seed),K=Array.from({length:q},()=>Math.floor(R()*Q)),key=canonical(K),C=words.flatMap(w=>{let phase=Math.floor(R()*q),hold=R()<.5;return from(w).map(x=>hold&&x===0?0:(x+K[phase++%q])%Q);}),ls=shuffle(words.map(w=>w.length),R),r=solve(C,ls,B,key),hit=r.exact.find(x=>id(x.key)===key&&x.found),actual=from(words.join(""));return {name,key:from(key),truthOOV:words.filter(w=>!lex.has(w)).length,truthFound:!!hit,truthRunes:hit?from(hit.words.map(z=>z.w).join("")).filter((x,i)=>x===actual[i]).length:null,...r};
}

 const result={lexiconSize:lex.size,clock:"arbitrary phase and either ordinary or literal-F per word; period8 shared key modulo cyclic rotations",original:null,controls:[]};
 if(mode!=="original"){for(const name of ["0_loss_of_divinity","0_koan_1"]){const s=native.find(s=>s.name===name),a=s.words.findIndex(w=>w.length>=10),off=Math.max(0,a-12);result.controls.push(control(name,s.words.slice(off,off+48),0,0x28870000+off+(name==="0_koan_1"?1:0)));}
 const R=rng(0x28870003),ls=shuffle(lengths,R),words=ls.map(l=>{const a=byLen.get(l);return a[Math.floor(R()*a.length)]});let removed=0;for(let i=0;i<words.length&&removed<3;i++)if(words[i].length>=10){const l=words[i].length;let w;do{w=id(Array.from({length:l},()=>Math.floor(R()*Q)));}while(lex.has(w));words[i]=w;removed++;}result.controls.push(control("same inventory, three long OOV",words,3,0x28870004));}
 if(mode!=="controls")result.original=solve(C,lengths,3);
 return result;
}

if(require.main===module)console.log(JSON.stringify(experiment(paths.map(p=>fs.readFileSync(p,"utf8")),process.argv[2]||"all"),null,2));
module.exports={experiment,paths};
