'use strict';
const fs=require('node:fs'),path=require('node:path');
function experiment(corpus,native){
 const N=29**4, Q=29, M=[[10,3,20,22],[1,22,21,25],[11,17,19,7],[8,12,12,22]],mod=x=>(x%29+29)%29;
 if(JSON.stringify(corpus.runes)!==JSON.stringify(native.runes))throw Error("alphabet");
 const rune=new Map(native.runes.map((r,i)=>[r,i])), S=native.sections.map(s=>Array.from(s.source_text).filter(x=>rune.has(x)).map(x=>rune.get(x)));
 if(S.map(x=>x.length).join()!=="184,515,157,780,755,319,89,85,95")throw Error("sections");
 const low=new Uint8Array(N),forward=new Int32Array(N),inverse=new Int32Array(N).fill(-1);
 for(let v=0;v<N;v++){let d=[v%29,Math.floor(v/29)%29,Math.floor(v/841)%29,Math.floor(v/24389)],y=M.map(row=>mod(row.reduce((a,x,i)=>a+x*d[i],0))),w=y[0]+29*y[1]+841*y[2]+24389*y[3];if(inverse[w]>=0)throw Error("singular M");low[v]=d[0];forward[v]=w;inverse[w]=v}
 const add=(w,c)=>w+c-(low[w]+c>=29?29:0), step=(v,c)=>add(forward[v],c);
 const freq=new Float64Array(29).fill(.5);S.forEach((s,i)=>{if(i!==3&&i!==4)s.forEach(x=>freq[x]++)});const total=freq.reduce((a,b)=>a+b,0),score=Array.from(freq,x=>Math.round(1000*Math.log(x/total)));
 // The one-bit predecessor choice per state/event is sufficient because
 // the consuming transition is invertible once the public ciphertext is fixed.
 function viterbi(c,start=null){
   const MIN=-2147483648;
   let cur=new Int32Array(N),nxt=new Int32Array(N),ways=new Uint8Array(N),nways=new Uint8Array(N),A=new Int32Array(N),B=new Int32Array(N),count=0;
   cur.fill(MIN); if(start===null){for(let i=0;i<N;i++){A[i]=i;cur[i]=0;ways[i]=1}count=N}else{A[0]=start;count=1;cur[start]=0;ways[start]=1}
   const decisions=[],sizes=[];
   for(let i=0;i<c.length;i++){
     let x=c[i],d=x===0?new Uint32Array(Math.ceil(N/32)):null,m=0;
     nxt.fill(MIN);
     function update(w,s,k,hold){
       if(nxt[w]===MIN){B[m++]=w;nxt[w]=s;nways[w]=k;if(d&&hold)d[w>>>5]|=1<<(w&31)}
       else if(s>nxt[w]){nxt[w]=s;nways[w]=k;if(d){if(hold)d[w>>>5]|=1<<(w&31);else d[w>>>5]&=~(1<<(w&31))}}
       else if(s===nxt[w]){nways[w]=Math.min(2,nways[w]+k)}
     }
     for(let j=0;j<count;j++){
       let v=A[j],s=cur[v],k=ways[v];
       if(x===0)update(v,s+score[0],k,true);
       if(x!==low[v]){let p=mod(x-low[v]);update(step(v,x),s+score[p],k,false)}
     }
     decisions.push(d);[cur,nxt]=[nxt,cur];[ways,nways]=[nways,ways];[A,B]=[B,A];count=m;
     if((i+1)%100===0||i===c.length-1||!count)sizes.push([i+1,count]);
     if(!count)return {emptyAt:i+1,sizes}
   }
   let best=MIN,terminal=-1,ties=0;
   for(let j=0;j<count;j++){let v=A[j];if(cur[v]>best){best=cur[v];terminal=v;ties=ways[v]}else if(cur[v]===best)ties=Math.min(2,ties+ways[v])}
   let p=new Uint8Array(c.length),v=terminal;
   for(let i=c.length-1;i>=0;i--){let x=c[i],d=decisions[i];if(d&&((d[v>>>5]>>>(v&31))&1)){p[i]=0}else{let prev=inverse[add(v,mod(-x))];let y=mod(x-low[prev]);if(y===0)throw Error("invalid backtrace");p[i]=y;v=prev}}
   // Forward replay exact ciphertext and terminal state.
   let w=v;for(let i=0;i<c.length;i++){let x=p[i]===0?0:mod(p[i]+low[w]);if(x!==c[i])throw Error("bad replay");if(p[i]!==0)w=step(w,x)}if(w!==terminal)throw Error("bad terminal");
   return {root:v,terminal,nll:-best/(1000*c.length),optimumPathsCappedAt2:ties,reachableTerminalStates:count,p:Array.from(p),sizes}
 }
 const controls=[];
 for(let [j,iv] of [[3,274314],[4,360866]]){
   let p=S[j],v=iv,c=[],states=[v];
   for(let x of p){let y=x===0?0:mod(x+low[v]);c.push(y);if(x!==0)v=step(v,y);states.push(v)}
   let fit=viterbi(c.slice(0,267)),held=viterbi(c.slice(267),fit.terminal);
   function compare(out,truth){return out.p.reduce((a,x,i)=>a+(x===truth[i]),0)}
   let fitCorrect=compare(fit,p.slice(0,267)),heldCorrect=held.p?compare(held,p.slice(267)):0;
   delete fit.p;delete held.p;
   controls.push({section:j,actualRoot:iv,actualCutState:states[267],fit,fitCorrect,held,heldCorrect,heldLength:p.length-267})
 }
 return {controls,method:"all-IV exact maximum unigram score, transparent-F; held only from frozen fit terminal; optimal path count capped at two"}
}
const root=path.resolve(__dirname,'..');
const c=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const n=JSON.parse(fs.readFileSync(path.join(root,'resources/external/relikd-solved-gp29-native-v1.json'),'utf8'));
console.log(JSON.stringify(experiment(c,n),null,2));
