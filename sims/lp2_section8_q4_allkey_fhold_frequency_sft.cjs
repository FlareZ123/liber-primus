"use strict";
const fs=require("node:fs"),path=require("node:path");
function experiment(raw){
 const gp=JSON.parse(raw[0]),gold=JSON.parse(raw[1]),ix=new Map(gp.runes.map((c,i)=>[c,i])),mod=x=>(x%29+29)%29;
 const E=gp.translit.indexOf("E"),extract=t=>[...t].filter(c=>ix.has(c)).map(c=>ix.get(c)),same=(a,b)=>a.join()===b.join(),assert=(v,m)=>{if(!v)throw Error(m)};
 const C=gp.pages.filter(p=>p.page>=40&&p.page<=55).flatMap(p=>p.indices);assert(C.length===3316,"wrong section");
 function prep(C,q){
  const seg=[];let h=Array.from({length:q},()=>new Int32Array(29)),bad=new Int32Array(q),n=0;
  for(const c of C){if(c===0){seg.push({h,bad,n,zero:true});h=Array.from({length:q},()=>new Int32Array(29));bad=new Int32Array(q);n=0}else{h[n%q][c]++;bad[n%q]|=1<<c;n++}}
  seg.push({h,bad,n,zero:false});return seg;
 }
 function score(seg,K,target=E){
  const q=K.length;let a=new Int32Array(q).fill(-1),b=new Int32Array(q);a[0]=0;const masks=K.map(k=>1<<k),wanted=K.map(k=>mod(k+target));
  for(const {h,bad,n,zero} of seg){b.fill(-1);let any=false;
   for(let s=0;s<q;s++){if(a[s]<0)continue;let v=a[s],j=s,ok=true;
    for(let t=0;t<Math.min(n,q);t++){if(bad[t]&masks[j]){ok=false;break}v+=h[t][wanted[j]];if(++j===q)j=0}
    if(!ok)continue;const end=(s+n)%q;any=true;
    const hold=v+Number(zero&&target===0);if(hold>b[end])b[end]=hold;
    if(zero&&K[end]!==0){const nxt=(end+1)%q,z=v+Number(target!==0&&wanted[end]===0);if(z>b[nxt])b[nxt]=z}
   }
   if(!any)return -1;[a,b]=[b,a];
  }
  return Math.max(...a);
 }
 function witness(C,K,target){
  const q=K.length;let dp=new Int32Array(q).fill(-1);dp[0]=0;const states=[];
  for(const c of C){const next=new Int32Array(q).fill(-1),prev=new Int16Array(q).fill(-1),pval=new Int16Array(q).fill(-1);
   function offer(a,b,p){const s=dp[a]+Number(p===target);if(s>next[b]){next[b]=s;prev[b]=a;pval[b]=p}}
   for(let a=0;a<q;a++)if(dp[a]>=0){if(c===0)offer(a,a,0);const p=mod(c-K[a]);if(p!==0)offer(a,(a+1)%q,p)}
   dp=next;states.push({prev,pval});
  }
  const best=Math.max(...dp);if(best<0)return null;let j=dp.indexOf(best),P=[];
  for(let i=C.length-1;i>=0;i--){const s=states[i];P.push(s.pval[j]);j=s.prev[j]}P.reverse();
  const re=encode(P,K);assert(same(re.C,C),"witness forward replay");assert(P.filter(p=>p===target).length===best,"witness score");return {best,P,holds:P.filter(p=>p===0).length};
 }
 function encode(P,K){let j=0;const C=P.map(p=>p===0?0:mod(p+K[j++%K.length]));return {C,consumed:j}}
 function sweep(C,q){
  const seg=prep(C,q),K=Array(q).fill(0);let viable=0,best=-1,key=null;const feasible=[];
  const n=29**q;for(let code=0;code<n;code++){let z=code;for(let j=0;j<q;j++){K[j]=z%29;z=Math.floor(z/29)}const s=score(seg,K);if(s<0)continue;viable++;feasible.push(K.slice());if(s>best){best=s;key=K.slice()}}
  const w=witness(C,key,E);assert(w.best===best,"segment vs position DP");
  let anyNonF=-1,anyKey=null,anyTarget=null;for(const k of feasible)for(let target=1;target<29;target++){const z=score(seg,k,target);if(z>anyNonF){anyNonF=z;anyKey=k;anyTarget=target}}
  const a=witness(C,anyKey,anyTarget);assert(a.best===anyNonF,"any-rune witness");
  const f=C.filter(c=>!c).length,z=witness(C,Array(q).fill(0),0);assert(z.best===f,"F maximum");
  const ordinary=Array.from({length:q},(_,j)=>{const h=new Int32Array(29);for(let i=j;i<C.length;i+=q)h[C[i]]++;return Math.max(...h)}).reduce((a,b)=>a+b,0);
  return {q,keys:n,viable,ordinary,bestE:best,keyE:key,Eholds:w.holds,maxNonF:anyNonF,keyNonF:anyKey,targetNonF:gp.translit[anyTarget],nonFholds:a.holds,maxF:f,witnessE:w.P,witnessNonF:a.P};
 }
 function gate(C,q,limit=200000){const seg=[];let bad=new Int32Array(q),n=0;for(const c of C){if(!c){seg.push({bad,n,z:true});bad=new Int32Array(q);n=0}else{bad[n%q]|=1<<c;n++}}seg.push({bad,n,z:false});const K=new Int32Array(q).fill(-1);let nodes=0,leaves=0,tests=0,exhausted=true;const keys=[];const feasible=()=>{tests++;let states=1;for(const {bad,n,z} of seg){let next=0;for(let s=0;s<q;s++)if(states&(1<<s)){let ok=true;for(let t=0;t<Math.min(n,q);t++){const k=K[(s+t)%q];if(k>=0&&(bad[t]&(1<<k))){ok=false;break}}if(!ok)continue;const e=(s+n)%q;next|=1<<e;if(z&&K[e]!==0)next|=1<<((e+1)%q)}if(!next)return false;states=next}return true};const domains=Array.from({length:q},(_,i)=>{const a=[];for(let k=0;k<29;k++){K[i]=k;if(feasible())a.push(k)}K[i]=-1;return a});const order=domains.map((_,i)=>i).sort((a,b)=>domains[a].length-domains[b].length);function dfs(d){if(++nodes>limit){exhausted=false;return}if(d===q){leaves++;if(keys.length<10)keys.push([...K]);return}const i=order[d];for(const k of domains[i]){K[i]=k;if(feasible())dfs(d+1);if(!exhausted)break}K[i]=-1}dfs(0);return {q,domains:domains.map(x=>x.length),nodes,leaves,tests,keys,exhausted}}
 const branch=Array.from({length:8},(_,i)=>gate(C,i+1));assert(branch.every(x=>x.exhausted&&x.leaves===1&&x.keys[0].every(k=>!k)),"partial-key exclusion failed");
 const originals=[1,2,3,4].map(q=>sweep(C,q));
 // Real authentic controls under actual known keys and actual hold masks.
 const wP=extract(gold.sections.find(s=>s.name==="0_welcome").source_text),kP=extract(gold.sections.find(s=>s.name==="jpg107-167").source_text),pP=extract(gold.sections.find(s=>s.name==="p56_an_end").source_text);
 const wC=extract(raw[2].split("%").slice(1,3).join("%")),kC=extract(raw[2].split("$")[5]),pC=gp.pages.find(p=>p.page===56).indices;
 const primes=[];for(let i=2;primes.length<84;i++)if(!primes.some(p=>p*p<=i&&i%p===0))primes.push(i);
 const controls=[["WELCOME",wP,wC,[23,10,1,10,9,10,16,26]],["KOAN",kP,kC,[0,10,4,0,1,19,0,18,4,18,9,0,18]],["p56",pP,pC,primes.map(p=>mod(p-1))]].map(([name,P,C,K])=>{
  assert(same(encode(P,K).C,C),"authentic forward "+name);const trueE=P.filter(p=>p===E).length,trueF=P.filter(p=>!p).length,seg=prep(C,K.length),upperE=score(seg,K,E),upperF=score(seg,K,0);assert(upperE>=trueE&&upperF>=trueF,"true mask excluded");assert(witness(C,K,E).best===upperE&&witness(C,K,0).best===upperF,"control DP mismatch");return {name,n:C.length,trueE,trueF,upperE,upperF};
 });
 // Independent exhaustive toy calibration: all 2^visible-zero masks, compare score.
 let checks=0;for(let i=0;i<20;i++){const c=Array.from({length:10},(_,j)=>(i*17+j*11+j*j)%7===0?0:(i*5+j*3)%29),K=Array.from({length:4},(_,j)=>(i*7+j*11)%29),zeros=c.map((v,j)=>v===0?j:-1).filter(j=>j>=0);for(const target of [0,E,2]){let max=-1;for(let mask=0;mask<2**zeros.length;mask++){let phase=0,n=0,ok=true;for(let j=0;j<c.length;j++){const hold=c[j]===0&&(mask&(1<<zeros.indexOf(j)));const p=hold?0:mod(c[j]-K[phase]);if(!hold){if(!p){ok=false;break}phase=(phase+1)%K.length}n+=Number(p===target)}if(ok)max=Math.max(max,n)}assert(max===score(prep(c,4),K,target),"toy mask mismatch");checks++}}
 return {section:[40,55],n:C.length,threshold:Math.ceil(C.length*349/2797),F:C.filter(c=>!c).length,originals,controls,checks,branch};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/transcriptions/lp1_wulfic_canonical.txt"];
console.log(JSON.stringify(experiment(paths.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8"))),null,2));
