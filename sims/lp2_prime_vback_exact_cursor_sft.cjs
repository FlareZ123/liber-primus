"use strict";
const fs=require("node:fs"),path=require("node:path");
const INPUTS=[
  "resources/liber-primus/lp2-corpus.json",
  "resources/external/relikd-solved-gp29-native-v1.json",
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/shakespeare_first300k.txt",
  "resources/control/emerson_essays_2944.txt"
];
function experiment(raw,scope="plants"){
 const gp=JSON.parse(raw[0]),native=JSON.parse(raw[1]),A=29,mod=x=>(x%29+29)%29,ix=new Map(gp.runes.map((v,i)=>[v,i])),tokens=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
 const supp=1-.00664/(1/29),logReject=Math.log(supp),logAccept=Math.log1p(-supp),MAXSTART=3301,NKEY=17000;
 const isPrime=new Uint8Array(200000).fill(1);isPrime[0]=isPrime[1]=0;for(let p=2;p*p<isPrime.length;p++)if(isPrime[p])for(let j=p*p;j<isPrime.length;j+=p)isPrime[j]=0;
 const primes=[];for(let p=2;p<isPrime.length&&primes.length<NKEY;p++)if(isPrime[p])primes.push(p);if(primes.length!==NKEY)throw Error("prime sieve length");
 const Kplus=primes.map(p=>mod(p-1)),Kminus=Kplus.map(v=>mod(-v));
 const gold=native.sections.map(s=>({name:s.name,p:[...s.source_text].filter(c=>ix.has(c)).map(c=>ix.get(c))}));
 function spell(w){w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const p=[];for(let j=0;j<w.length;){const v=w.startsWith("ING",j)?{t:"ING",i:21}:w.startsWith("IO",j)?{t:"IO",i:27}:tokens.find(x=>w.startsWith(x.t,j));if(!v)throw Error("spell");p.push(v.i);j+=v.t.length}return p}
 const donors=raw.slice(2).map(s=>(s.toUpperCase().match(/[A-Z]+/g)||[]).flatMap(spell)),reserve=16000;
 const U=new Float64Array(A).fill(.25),B=new Float64Array(A*A).fill(.25);
 for(const s of [...donors.map(s=>s.slice(0,-reserve)),...gold.filter(s=>s.name!=="p56_an_end").map(s=>s.p)])for(let i=0;i<s.length;i++){U[s[i]]++;if(i)B[s[i-1]*A+s[i]]++}
 const sum=U.reduce((a,b)=>a+b,0);for(let p=0;p<A;p++)U[p]=Math.log(U[p]/sum);
 for(let q=0;q<A;q++){let s=0;for(let p=0;p<A;p++)s+=B[q*A+p];for(let p=0;p<A;p++)B[q*A+p]=Math.log(B[q*A+p]/s)}
 const NEG=-1e100;
 function solve(C,K,hold,from,to,initials,trace=false,prob=supp){
  const maxCursor=Math.max(...initials.map(x=>x>>1))+to-from+1,S=2*(maxCursor+1);
  let cur=new Float64Array(S).fill(NEG),next=new Float64Array(S).fill(NEG),orig=new Int32Array(S).fill(-1),norig=new Int32Array(S).fill(-1);
  let lo=Infinity,hi=-1,back=trace?[]:null;for(const state of initials){cur[state]=0;orig[state]=state;lo=Math.min(lo,state>>1);hi=Math.max(hi,state>>1)}
  let count=0;const lr=prob===0?NEG:Math.log(prob),la=prob===1?NEG:Math.log1p(-prob);
  for(let i=from;i<to;i++){
   const c=C[i],prev=i?C[i-1]:-1;next.fill(NEG);norig.fill(-1);let nlo=Infinity,nhi=-1;
   const stepBack=trace?new Int32Array(S).fill(-1):null;
   for(let j=lo;j<=hi;j++){
    const a=2*j,b=a+1,ca=cur[a],cb=cur[b];if(ca===NEG&&cb===NEG)continue;
    const lastA=i&&j?mod(prev-K[j-1]):0;
    function emit(p,ns,pen){
     if(pen===NEG)return;
     let va=ca===NEG?NEG:ca+(i?B[lastA*A+p]:U[p]),vb=cb===NEG?NEG:cb+(i?B[p]:U[p]);const src=va>=vb?a:b,v=Math.max(va,vb)+pen;
     if(v>next[ns]){next[ns]=v;norig[ns]=orig[src];if(stepBack)stepBack[ns]=src;nlo=Math.min(nlo,ns>>1);nhi=Math.max(nhi,ns>>1)}
    }
    if(hold&&c===0)emit(0,b,0);
    const direct=mod(c-K[j]);if(!hold||direct!==0)emit(direct,2*(j+1),i&&c===prev&&j>0?la:0);
    if(i&&j>0&&prob>0){
     const p=mod(prev-K[j]);if(!hold||p!==0){let r=j-1,k=1;while(r>=0){
       const z=mod(p+K[r]);if(z===c)emit(p,2*(r+1),k*lr+(z===prev&&r>0?la:0));
       if(z!==prev||r===0)break;r--;k++;
     }}
    }
   }
   if(nhi<0)return {legal:false,failedAt:i,steps:i-from};if(trace)back.push(stepBack);[cur,next]=[next,cur];[orig,norig]=[norig,orig];lo=nlo;hi=nhi;count+=hi-lo+1;
  }
  let state=-1,best=NEG;for(let j=2*lo;j<=2*hi+1;j++)if(cur[j]>best){best=cur[j];state=j}
  const res={legal:true,score:best,mean:best/(to-from),initial:orig[state],end:state,reachableWidth:hi-lo+1,visitedWidth:count};if(trace){
   const P=[],events=[];let s=state;for(let i=to-1;i>=from;i--){const src=back[i-from][s];if(src<0)throw Error("bad backtrace");const j=src>>1,end=s>>1,held=s&1,p=held?0:mod(C[i]-K[end-1]),r=held?j:end-1,backs=j-r;if(held){if(j!==end||C[i]!==0)throw Error("bad hold")}else{if(backs<0||hold&&p===0)throw Error("bad consuming");for(let k=j;k>r;k--)if(k===0||!i||mod(p+K[k])!==C[i-1])throw Error("bad rejection");if(mod(p+K[r])!==C[i])throw Error("bad replay")}
    P.push(p);events.push(held?-1:backs);s=src;
   }if(s!==res.initial)throw Error("initial trace");res.P=P.reverse();res.events=events.reverse();
  }return res;
 }
 function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/2**32}}
 function plant(P,K,hold,start,R,prob=supp){let j=start,prev=-1;const C=[],events=[];for(let i=0;i<P.length;i++){const p=P[i];if(hold&&p===0){C.push(0);prev=0;events.push(-1);continue}let z=mod(p+K[j]),n=0;while(i&&j>0&&z===prev&&R()<prob){j--;n++;z=mod(p+K[j])}C.push(z);events.push(n);prev=z;j++}return {C,events,end:j}}
 const authentic=gold.find(s=>s.name==="p56_an_end").p,official=gp.pages.find(p=>p.page===56).indices,auth=plant(authentic,Kplus,true,0,()=>1,0);if(auth.C.join()!==official.join())throw Error("authentic p56 failed");
 const known=solve(official,Kplus,true,0,official.length,[1],true,0);if(!known.legal||known.P.join()!==authentic.join())throw Error("p56 inverse failed");
 const all=Array.from({length:MAXSTART+1},(_,i)=>2*i+1);
 function attack(C,K,hold,cut,truth=null){const fit=solve(C,K,hold,0,cut,all);if(!fit.legal)return {fit};const train=solve(C,K,hold,0,cut,[fit.initial],true);if(!train.legal||Math.abs(train.score-fit.score)>1e-7||train.end!==fit.end)throw Error("train retrace mismatch");
 const test=solve(C,K,hold,cut,C.length,[fit.end],true);
 const result={fit:{...fit,origin:fit.initial>>1,preview:train.P.slice(0,80).map(i=>gp.translit[i]).join(" "),holds:train.events.filter(v=>v===-1).length,backsteps:train.events.reduce((a,v)=>a+Math.max(v,0),0)},test:test.legal?{...test,preview:test.P.slice(0,120).map(i=>gp.translit[i]).join(" ")}:test};
 if(truth){result.trainExact=train.P.filter((p,i)=>p===truth[i]).length;result.testExact=test.legal?test.P.filter((p,i)=>p===truth[cut+i]).length:0}
 return result;
 }
 const chapters=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]].map(([a,b])=>({a,b,C:gp.pages.filter(p=>p.page>=a&&p.page<=b).flatMap(p=>p.indices)}));
 const plants=[];
 if(scope==="plants"||scope==="all"){for(let d=0;d<3;d++){const length=[chapters[0].C.length,chapters[6].C.length,chapters[7].C.length][d],P=donors[d].slice(-reserve,-reserve+length),cut=Math.floor(length*2/3);
  for(const hold of [false,true]){const R=rng(0x3301bace+d*31+Number(hold)),origin=Math.floor(R()*(MAXSTART+1)),K=d===1?Kminus:Kplus,z=plant(P,K,hold,origin,R),out=attack(z.C,K,hold,cut,P);plants.push({d,hold,length,cut,origin,actualHolds:z.events.filter(v=>v===-1).length,actualBacksteps:z.events.reduce((a,v)=>a+Math.max(v,0),0),...out})}
 }}
 const originals=[];
 if(scope==="original"||scope==="all"){for(const {a,b,C} of chapters){const cut=Math.floor(C.length*2/3);for(const hold of [false,true])for(const sign of [1,-1])originals.push({a,b,hold,sign,n:C.length,cut,...attack(C,sign===1?Kplus:Kminus,hold,cut)})}}
 return {scope,authentic:{runes:official.length,consuming:auth.end,exact:true},supp,MAXSTART,plants,originals};
}
console.log(JSON.stringify(experiment(INPUTS.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8")),process.argv[2]||"plants"),null,2));
