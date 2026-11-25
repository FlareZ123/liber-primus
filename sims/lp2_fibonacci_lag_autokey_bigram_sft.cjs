"use strict";
const fs=require("node:fs"),path=require("node:path");
// Director #2698: fixed Fibonacci-lag plaintext autokey, literal-F clock.
// Usage: node sims/lp2_fibonacci_lag_autokey_sft.cjs [control index|--original|--all]
function experiment(gp,ink,raw,mode="--all"){
 const Q=29,L=139,H=200,F=[1,2,3,5,8,13,21,34,55,89,144,233,377,610,987],NEG=-Infinity;
 const check=(b,m)=>{if(!b)throw Error(m)}, mod=x=>((x%Q)+Q)%Q,range=n=>Array.from({length:n},(_,i)=>i);
 const lag=Array.from({length:2000},(_,i)=>F.filter(f=>f<=i).at(-1)||0);
 const tokens=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
 function body(t,j){if(j===0)return t;const start=j===1?"There is no great and no small":"Almustafa,",a=t.indexOf(start),b=t.search(/\*\*\*\s*END OF (?:THIS|THE) PROJECT GUTENBERG/i);check(a>=0&&b>a,"body markers");return t.slice(a,b)}
 function native(t){const a=[];for(const w of t.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").match(/[A-Z]+/g)||[]){for(let j=0;j<w.length;){const x=w.startsWith("ING",j)?{t:"ING",i:21}:w.startsWith("IO",j)?{t:"IO",i:27}:tokens.find(o=>w.startsWith(o.t,j));check(x,"native token");a.push(x.i);j+=x.t.length}}return a}
 const corpus=raw.map((t,j)=>native(body(t,j))),split=corpus.map(a=>Math.floor(a.length*.8));
 const u=new Float64Array(Q),b=new Float64Array(Q*Q),tr=new Float64Array(Q*Q*Q);
 let total=0;
 for(let j=0;j<corpus.length;j++){const a=corpus[j];for(let i=0;i<split[j];i++){const x=a[i];u[x]++;total++;if(i)b[a[i-1]*Q+x]++;if(i>1)tr[(a[i-2]*Q+a[i-1])*Q+x]++}}
 const lp1=Float64Array.from(u,x=>Math.log((x+.5)/(total+.5*Q))),lp2=new Float64Array(Q*Q),lp3=new Float64Array(Q*Q*Q);
 for(let j=0;j<Q;j++){let z=0;for(let x=0;x<Q;x++)z+=b[j*Q+x];for(let x=0;x<Q;x++)lp2[j*Q+x]=Math.log((b[j*Q+x]+8*Math.exp(lp1[x]))/(z+8))}
 for(let j=0;j<Q*Q;j++){let z=0;for(let x=0;x<Q;x++)z+=tr[j*Q+x];for(let x=0;x<Q;x++)lp3[j*Q+x]=Math.log((tr[j*Q+x]+8*Math.exp(lp2[(j%Q)*Q+x]))/(z+8))}
 const score=(a,i)=>i===0?lp1[a[0]]:lp2[a[i-1]*Q+a[i]];
 function enc(P,K){const active=[];return P.map(p=>{if(p===0)return 0;const j=active.length,k=j<8?K[j]:active[j-lag[j]];active.push(p);return mod(p+k)})}
 // For each chosen zero-hold mask, build affine expressions of the eight primer values.
 function expressions(C,mask){
   const e=[],active=[],domains=range(8).map(()=>new Uint8Array(Q).fill(1));let z=0;
   for(const c of C){
     if(c===0&&(mask&(1<<z++))){e.push({r:-1,s:0,o:0});continue}
     const j=active.length, prev=j<8?{r:j,s:1,o:0}:active[j-lag[j]];
     const x={r:prev.r,s:-prev.s,o:mod(c-prev.o)};
     domains[x.r][mod(-x.o*x.s)]=0;active.push(x);e.push(x);
   }
   const d=domains.map(a=>range(Q).filter(k=>a[k]));
   return d.some(a=>!a.length)?null:{e,d};
 }
 function optimize(ex){
   const {e,d}=ex, sz=d.map(a=>a.length), as=Array(8).fill(0),groups=new Map();
   const values=e.map(x=>x.r<0?[0]:d[x.r].map(k=>mod(x.o+x.s*k)));
   const scopeOf=xs=>[...new Set(xs.map(i=>e[i].r).filter(i=>i>=0))].sort((a,b)=>a-b);
   const value=i=>values[i][e[i].r<0?0:as[e[i].r]];
   for(let i=0;i<e.length;i++){
     const xs=range(Math.min(2,i+1)).map(k=>i-Math.min(1,i)+k);
     const scope=scopeOf(xs),key=scope.join(",");
     if(!groups.has(key))groups.set(key,{scope,terms:[]});
     groups.get(key).terms.push(xs);
   }
   const size=scope=>scope.reduce((a,r)=>a*sz[r],1);
   const strides=scope=>scope.map((_,i)=>size(scope.slice(i+1)));
   function enumerate(scope,cb,depth=0,index=0){if(depth===scope.length){cb(index);return}const v=scope[depth];for(let a=0;a<sz[v];a++){as[v]=a;enumerate(scope,cb,depth+1,index*sz[v]+a)}}
   const factors=[];
   for(const {scope,terms} of groups.values()){
     const table=new Float64Array(size(scope));
     enumerate(scope,index=>{let s=0;for(const t of terms){if(t.length===1)s+=lp1[value(t[0])];else if(t.length===2)s+=lp2[value(t[0])*Q+value(t[1])];else s+=lp3[(value(t[0])*Q+value(t[1]))*Q+value(t[2])]}table[index]=s});
     factors.push({scope,table,stride:strides(scope)});
   }
   const remain=new Set(range(8)),trace=[];let maxWork=0;
   while(remain.size){
     let best=null;
     for(const v of remain){
       const selected=factors.filter(f=>f.scope.includes(v)),joint=[...new Set(selected.flatMap(f=>f.scope))].sort((a,b)=>a-b);
       if(!joint.includes(v))joint.push(v);
       const work=size(joint);
       if(!best||work<best.work)best={v,selected,joint,work};
     }
     const {v,selected,joint,work}=best;maxWork=Math.max(maxWork,work);remain.delete(v);
     const scope=joint.filter(x=>x!==v),table=new Float64Array(size(scope)),arg=new Uint8Array(table.length);
     enumerate(scope,index=>{
       let best=NEG,bi=0;
       for(let x=0;x<sz[v];x++){
         as[v]=x;let s=0;
         for(const f of selected){let z=0;for(let k=0;k<f.scope.length;k++)z+=as[f.scope[k]]*f.stride[k];s+=f.table[z]}
         if(s>best){best=s;bi=x}
       }
       table[index]=best;arg[index]=bi;
     });
     for(let i=factors.length-1;i>=0;i--)if(selected.includes(factors[i]))factors.splice(i,1);
     factors.push({scope,table,stride:strides(scope)});trace.push({v,scope,arg,stride:strides(scope)});
   }
   for(let t=trace.length-1;t>=0;t--){const q=trace[t];let i=0;for(let j=0;j<q.scope.length;j++)i+=as[q.scope[j]]*q.stride[j];as[q.v]=q.arg[i]}
   const key=d.map((a,i)=>a[as[i]]),P=e.map((_,i)=>value(i)),ll=P.reduce((s,_,i)=>s+score(P,i),0),opt=factors.reduce((s,f)=>s+f.table[0],0);
   check(Math.abs(ll-opt)<1e-7,"factor optimization replay");
   return {key,P,ll,maxWork,domains:sz};
 }
 function prefix(C,lo=0,hi=Infinity){
   const z=C.filter(x=>x===0).length;
   if(z>12)return {capped:true,z};
   let best=null,runner=NEG,feasible=0,maxWork=0;
   for(let mask=lo;mask<Math.min(hi,1<<z);mask++){
     const ex=expressions(C,mask);if(!ex)continue;
     const a=optimize(ex);feasible++;maxWork=Math.max(maxWork,a.maxWork);
     check(enc(a.P,a.key).join()===C.join(),"prefix replay");
     if(!best||a.ll>best.ll){if(best)runner=Math.max(runner,best.ll);best={...a,mask}}else runner=Math.max(runner,a.ll);
   }
   return {z,feasible,lo,hi:Math.min(hi,1<<z),maskCount:1<<z,best,runnerMaskScore:Number.isFinite(runner)?runner:null,maxWork};
 }
 function suffix(C,fit){
   const P=fit.P.slice(),active=P.filter(x=>x!==0);let best=null,nodes=0,paths=0,depth=0;
   function rec(i,ll){
     nodes++;depth=Math.max(depth,i);
     if(i===C.length){paths++;if(!best||ll>best.ll)best={P:P.slice(),ll};return}
     if(C[i]===0){P.push(0);rec(i+1,ll+score(P,P.length-1));P.pop()}
     const j=active.length,k=j<8?fit.key[j]:active[j-lag[j]],p=mod(C[i]-k);
     if(p!==0){P.push(p);active.push(p);rec(i+1,ll+score(P,P.length-1));active.pop();P.pop()}
   }
   rec(0,0);
   return {nodes,paths,depth,best};
 }
 function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296}}
 const specs=range(6).map(id=>{const j=Math.floor(id/2),random=rng((0x2698a6^Math.imul(id+1,0x9e3779b9))>>>0),a=corpus[j],start=split[j]+Math.floor(random()*(a.length-split[j]-L-H)),P=a.slice(start,start+L+H),key=range(8).map(()=>Math.floor(random()*Q));return{id,j,start,P,key}});
 function control({id,j,start,P,key}){
   const C=enc(P,key),p=prefix(C.slice(0,L));
   if(!p.best)return{id,j,start,z:p.z,cap:p.capped??false,fit:false};
   const hold=suffix(C.slice(L),p.best),match=(a,b)=>a.filter((x,i)=>x===b[i]).length;
   const same=key.join()===p.best.key.join();
   if(hold.best)check(enc(hold.best.P,p.best.key).join()===C.join(),"control full replay");
   return{id,j,start,z:p.z,feasibleMasks:p.feasible,fit:true,trueKey:key,key:p.best.key,exactKey:same,prefixCorrect:match(p.best.P,P.slice(0,L)),prefixScore:p.best.ll,runnerMaskScore:p.runnerMaskScore,maxWork:p.maxWork,heldoutCorrect:hold.best?match(hold.best.P.slice(L),P.slice(L)):0,heldoutPaths:hold.paths,heldoutDepth:hold.depth,heldoutScore:hold.best?.ll??null,trueHeldoutF:P.slice(L).filter(x=>x===0).length,trueHeldoutConsumingZero:C.slice(L).filter((x,i)=>x===0&&P[i+L]!==0).length};
 }
 function original(){
   const p=gp.pages.find(x=>x.page===15),ann=ink.pages.find(x=>x.page===15);
   const start=Math.max(...ann.red_spans.map(s=>s.start+s.length));
   const C=p.indices.slice(start),HOLD=gp.pages.filter(x=>x.page>=16&&x.page<=22).flatMap(x=>x.indices).slice(0,H);
   check(start===20&&C.length===L&&HOLD.length===H,"physical body span");
   const fit=prefix(C);
   if(!fit.best)return{fit};
   const hold=suffix(HOLD,fit.best);
   if(hold.best)check(enc(hold.best.P,fit.best.key).join()===C.concat(HOLD).join(),"original replay");
   return{fit,hold,plaintext:hold.best?.P.map(i=>gp.translit[i]).join("")??fit.best.P.map(i=>gp.translit[i]).join("")};
 }
 if(mode.startsWith('--part:')){const [,id,lo,hi]=mode.split(':').map(Number),s=specs[id];return{part:{id,lo,hi},fit:prefix(enc(s.P,s.key).slice(0,L),lo,hi)}}
 const controls=mode==="--all"||mode==="--original"?specs.map(control):[control(specs[Number(mode)])];
 const gate={exactKeys:controls.filter(c=>c.exactKey).length,exactHeldout:controls.filter(c=>c.heldoutCorrect===H).length,heldoutAtLeast95:controls.filter(c=>c.heldoutCorrect>=.95*H).length};
 gate.pass=controls.length===6&&gate.exactKeys===6&&gate.heldoutAtLeast95===6&&gate.exactHeldout>=5&&controls.every(c=>c.trueHeldoutF>0&&c.trueHeldoutConsumingZero>0);
 return{method:{F,L,H,training:split,order:2,zeroMaskCap:12},controls,gate,original:mode==="--original"&&gate.pass?original():null};
}
const files=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-ink-annotations.json","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/gibran_prophet_58585.txt"];
const data=files.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8"));
console.log(JSON.stringify(experiment(JSON.parse(data[0]),JSON.parse(data[1]),data.slice(2),process.argv[2]||"--all"),null,2));
