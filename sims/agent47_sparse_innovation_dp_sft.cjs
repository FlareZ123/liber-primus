"use strict";
const fs=require("node:fs");
const path=require("node:path");
function experiment(corpus,src){
 const q=29,S=q*q,INF=30000,mod=x=>(x%q+q)%q;
 const lookup=new Map(corpus.runes.map((x,i)=>[x,i])),words=[];let w=[],offset=0;
 for(const ch of src.split("%").slice(0,55).join("%")){
   if(lookup.has(ch))w.push({i:offset++,c:lookup.get(ch)});
   else if(ch!=="%"&&ch!=="/"&&!/\s/u.test(ch)&&w.length){words.push(w);w=[]}
 }if(w.length)words.push(w);
 const C=words.flat().map(x=>x.c),obs=words.filter(w=>w.length===1).map(w=>w[0].i);
 const pages=corpus.pages.filter(p=>p.page<=55);
 if(C.join()!==pages.flatMap(p=>p.indices).join()||C.length!==12956||obs.length!==83)throw Error("source mismatch");
 const starts=[0,3,8,15,23,27,33,40,54].map(p=>pages.filter(x=>x.page<p).reduce((a,x)=>a+x.indices.length,0));starts.push(C.length);
 // Masks of permissible plaintext symbols at each physical rune.
 const all=(1<<29)-1,mask=values=>values.reduce((a,x)=>a|(1<<x),0);
 function anchorMask(n,anchors,allowed){const A=new Int32Array(n).fill(all);for(const i of anchors)A[i]=mask(allowed);return A}
 // State: key for next consuming rune, previous slope. Initial slope free.
 // A branch consuming the rune advances k by the chosen next slope.
 // F hold uses no key tick. All permitted innovations are charged one.
 function solve(C,A,F,trace=false){
   let D=new Int16Array(S),E=new Int16Array(S),N=new Uint8Array(S).fill(1),M=new Uint8Array(S);
   const back=trace?new Uint16Array(C.length*S):null;
   function offer(j,v,count,pred,hold,i){if(v<E[j]){E[j]=v;M[j]=count;if(back)back[i*S+j]=pred+(hold?S:0)}else if(v===E[j])M[j]=Math.min(2,M[j]+count)}
   for(let i=0;i<C.length;i++){
     E.fill(INF);M.fill(0);const c=C[i],a=A[i];
     if(F&&c===0&&(a&1))for(let s=0;s<S;s++)if(D[s]<INF)offer(s,D[s],N[s],s,true,i);
     for(let k=0;k<q;k++){
       const p=mod(c-k);if(!(a&(1<<p))||(F&&p===0))continue;
       const base=k*q;let min=INF,arg=-1,n=0;
       for(let d=0;d<q;d++){const v=D[base+d];if(v<min){min=v;arg=d;n=N[base+d]}else if(v===min)n=Math.min(2,n+N[base+d])}
       if(min===INF)continue;
       for(let e=0;e<q;e++){
         const j=mod(k+e)*q+e,s=base+e;
         if(D[s]<INF)offer(j,D[s],N[s],s,false,i);
         if(min+1<=D[s])offer(j,min+1,n,base+arg,false,i);
       }
     }
     [D,E]=[E,D];[N,M]=[M,N];
   }
   let min=INF,arg=-1,count=0;
   for(let s=0;s<S;s++){if(D[s]<min){min=D[s];arg=s;count=N[s]}else if(D[s]===min)count=Math.min(2,count+N[s])}
   if(min===INF)return {cost:null,pathsCapped:0};
   const out={cost:min,pathsCapped:count};
   if(trace){
     let s=arg;const plain=[],key=[],events=[],holds=[];
     for(let i=C.length-1;i>=0;i--){const v=back[i*S+s],hold=v>=S,prev=v%S,k=Math.floor(prev/q),d=prev%q,e=s%q;
       plain.push(hold?0:mod(C[i]-k));key.push(k);if(hold)holds.push(i);else if(e!==d)events.push([i,e]);s=prev;
     }
     out.plain=plain.reverse();out.key=key.reverse();out.events=events.reverse();out.holds=holds.reverse();out.initial=[Math.floor(s/q),s%q];
     let k=out.initial[0],d=out.initial[1],ei=0,hi=0;
     for(let i=0;i<C.length;i++){
       const p=out.plain[i];if(!(A[i]&(1<<p))||k!==out.key[i])throw Error("trace mismatch");
       const hold=hi<out.holds.length&&out.holds[hi]===i;if(hold){hi++;if(!F||p!==0||C[i]!==0)throw Error("hold mismatch");continue}
       if(F&&p===0||mod(p+k)!==C[i])throw Error("forward mismatch");
       if(ei<out.events.length&&out.events[ei][0]===i)d=out.events[ei++][1];k=mod(k+d);
     }
     if(ei!==min)throw Error("event count mismatch");
   }
   return out;
 }
 const original=[];
 for(const F of [false,true])for(const allowed of [[24,10],[24,10,3]]){
   const A=anchorMask(C.length,obs,allowed),whole=solve(C,A,F),chapters=[];
   for(let i=0;i<starts.length-1;i++){const l=starts[i],h=starts[i+1];chapters.push({n:h-l,anchors:obs.filter(x=>x>=l&&x<h).length,...solve(C.slice(l,h),A.slice(l,h),F)})}
   original.push({F,allowed,whole,chapters,chapterSum:chapters.reduce((a,x)=>a+(x.cost??Infinity),0)});
 }
 // Native p57 actual clear rune sequence; repeated only for length, with known anchor mask.
 const native=corpus.pages.find(p=>p.page===57).indices;
 function plant(P,F,changes,quadratic=false){let k=7,d=4,tick=0;const C=[],events=[];for(let i=0;i<P.length;i++){const p=P[i];if(F&&p===0){C.push(0);continue}C.push(mod(p+k));if(quadratic&&tick>0){d=mod(d+3);events.push([i,d])}else if(changes.has(tick)){d=changes.get(tick);events.push([i,d])}k=mod(k+d);tick++}return {C,events}}
 const controls=[];
 for(const F of [false,true]){
   const P=Array.from({length:190},(_,i)=>native[i%native.length]),changes=new Map([[17,8],[53,12],[97,1]]),pl=plant(P,F,changes),wrong=plant(P,F,new Map(),true);
   const A=Int32Array.from(P,p=>1<<p),sparse=Int32Array.from(P,(p,i)=>i%23===0?1<<p:all);
   const exact=solve(pl.C,A,F,true),blind=solve(pl.C,sparse,F,true),bad=solve(wrong.C,A,F,true);
   if(exact.plain.join()!==P.join()||exact.cost!==pl.events.length||exact.events.join()!==pl.events.join())throw Error("dense calibration");
   controls.push({F,n:P.length,trueEvents:pl.events,dense:{cost:exact.cost,pathsCapped:exact.pathsCapped,events:exact.events,initial:exact.initial},sparse:{cost:blind.cost,pathsCapped:blind.pathsCapped,events:blind.events,initial:blind.initial,matchedPlain:blind.plain.filter((p,i)=>p===P[i]).length},wrongLaw:{cost:bad.cost,pathsCapped:bad.pathsCapped,actualEvents:wrong.events.length}});
 }
 return {n:C.length,anchors:obs.length,chapterStarts:starts,original,controls};
}
if(require.main===module){const root=path.join(__dirname,"../resources/liber-primus");console.log(JSON.stringify(experiment(JSON.parse(fs.readFileSync(path.join(root,"lp2-corpus.json"),"utf8")),fs.readFileSync(path.join(root,"lp2-transcription.txt"),"utf8")),null,2));}
module.exports=experiment;
