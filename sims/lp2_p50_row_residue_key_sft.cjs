"use strict";
const fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,".."),read=p=>fs.readFileSync(path.join(root,p),"utf8");
const gp=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid=JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const Q=29,L=32,W=8;
const tokensGP=gp.translit.map((s,i)=>[s,i]).sort((a,b)=>b[0].length-a[0].length);
function encode(t){
 const out=[];
 for(const w of t.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").match(/[A-Z]+/g)||[]){
  for(let i=0;i<w.length;){
   const x=w.startsWith("ING",i)?["ING",21]:w.startsWith("IO",i)?["IO",27]:tokensGP.find(([s])=>w.startsWith(s,i));
   if(!x)throw Error(w);out.push(x[1]);i+=x[0].length;
  }
 }
 return out;
}
const tr=encode(read("resources/control/emerson_essays_2944.txt"));
const g=encode(read("resources/control/gibran_prophet_58585.txt"));
const s=encode(read("resources/control/shakespeare_first300k.txt"));
const ct=new Float64Array(24389),dn=new Float64Array(841),big=new Float64Array(841),bd=new Float64Array(29),freq=new Float64Array(29);
for(let i=0;i<tr.length;i++){
 freq[tr[i]]++;
 if(i){big[tr[i-1]*29+tr[i]]++;bd[tr[i-1]]++}
 if(i>=2){let j=tr[i-2]*29+tr[i-1];ct[j*29+tr[i]]++;dn[j]++}
}
const uni=Array.from(freq,v=>Math.log((v+.3)/(tr.length+8.7))),lm=new Float64Array(24389);
for(let a=0;a<Q;a++)for(let b=0;b<Q;b++)for(let c=0;c<Q;c++){
 let j=a*Q+b,pb=(big[b*Q+c]+0.3)/(bd[b]+8.7);
 lm[j*Q+c]=Math.log((ct[j*Q+c]+10*pb)/(dn[j]+10));
}
const tokens=grid.pages.flatMap(x=>x.tokens),families=[];
if(tokens.length!==256)throw Error("panel");
for(const radix of [59,60])for(const sign of [-1,1]){
 const a=radix===60?grid.alphabet:grid.alphabet.replace("f","");
 if(a.length!==radix)throw Error("alphabet");
 const vals=tokens.map(t=>(sign*(a.indexOf(t[0])*radix+a.indexOf(t[1]))%29+29)%29);
 const d=Array.from({length:L},(_,j)=>[...new Set(vals.slice(8*j,8*j+8))].sort((a,b)=>a-b));
 families.push({radix,sign,d});
}
/** Exact cyclic max-sum for three-consecutive-key-position factors. */
function cyclic(D,cost){
 const n=D.map(x=>x.length);let best=-Infinity,bestK;
 for(let a0=0;a0<n[0];a0++)for(let b0=0;b0<n[1];b0++){
  let prev=new Float64Array(n[0]*n[1]).fill(-Infinity);prev[a0*n[1]+b0]=0;
  const back=[];
  for(let j=2;j<L;j++){
   const next=new Float64Array(n[j-1]*n[j]).fill(-Infinity),bptr=new Int8Array(next.length);
   for(let a=0;a<n[j-2];a++)for(let b=0;b<n[j-1];b++){
    const v=prev[a*n[j-1]+b];if(v===-Infinity)continue;
    for(let c=0;c<n[j];c++){
     const q=v+cost[j][(a*n[j-1]+b)*n[j]+c],idx=b*n[j]+c;
     if(q>next[idx]){next[idx]=q;bptr[idx]=a}
    }
   }
   prev=next;back[j]=bptr;
  }
  for(let a=0;a<n[L-2];a++)for(let b=0;b<n[L-1];b++){
   const q=prev[a*n[L-1]+b]+cost[0][(a*n[L-1]+b)*n[0]+a0]+cost[1][(b*n[0]+a0)*n[1]+b0];
   if(q>best){
    best=q;const k=Array(L);k[L-2]=a;k[L-1]=b;
    for(let j=L-1;j>=2;j--)k[j-2]=back[j][k[j-1]*n[j]+k[j]];
    bestK=k.map((v,j)=>D[j][v]);
   }
  }
 }
 return {key:bestK,score:best};
}
function score(P){let v=0;for(let i=2;i<P.length;i++)v+=lm[(P[i-2]*29+P[i-1])*29+P[i]];return v}
function fitOrdinary(C,D){
 const cost=[];
 for(let j=0;j<L;j++){
  const x=D[(j+L-2)%L],y=D[(j+L-1)%L],z=D[j],arr=new Float64Array(x.length*y.length*z.length);
  for(let a=0;a<x.length;a++)for(let b=0;b<y.length;b++)for(let c=0;c<z.length;c++){
   let val=0;
   for(let i=j;i<C.length;i+=L)if(i>=2){
    const p=(C[i-2]+29-x[a])%29,q=(C[i-1]+29-y[b])%29,r=(C[i]+29-z[c])%29;
    val+=lm[(p*29+q)*29+r];
   }
   arr[(a*y.length+b)*z.length+c]=val;
  }
  cost.push(arr);
 }
 const ans=cyclic(D,cost),P=C.map((v,i)=>(v+29-ans.key[i%L])%29);
 if(Math.abs(score(P)-ans.score)>1e-7)throw Error("ordinary DP mismatch");
 return {key:ans.key,score:ans.score/(C.length-2)};
}
function solveOrdinary(C,dev){
 let best=null;const all=[];
 for(const f of families)for(let phase=0;phase<L;phase++){
  const D=Array.from({length:L},(_,j)=>f.d[(j+phase)%L]),h=fitOrdinary(C.slice(0,dev),D);
  const ans={radix:f.radix,sign:f.sign,phase,...h};
  all.push({radix:f.radix,sign:f.sign,phase,score:h.score});
  if(!best||ans.score>best.score)best=ans;
 }
 const P=C.map((v,i)=>(v+29-best.key[i%L])%29);
 return {...best,holdoutScore:score(P.slice(dev))/(P.length-dev-2),decoded:P,top:all.sort((a,b)=>b.score-a.score).slice(0,5)};
}
function rng(seed){let state=seed>>>0;return ()=>{state^=state<<13;state^=state>>>17;state^=state<<5;return state>>>0}}
function plantOrdinary(P,f,phase,seed){
 const rand=rng(seed),key=Array.from({length:L},(_,j)=>{const d=f.d[(j+phase)%L];return d[rand()%d.length]});
 const C=P.map((p,i)=>(p+key[i%L])%29),ans=solveOrdinary(C,534);
 return {true:{radix:f.radix,sign:f.sign,phase,key},selected:{radix:ans.radix,sign:ans.sign,phase:ans.phase,key:ans.key},fit:ans.score,heldout:ans.holdoutScore,correct:ans.decoded.reduce((n,x,i)=>n+(x===P[i]),0),heldoutCorrect:ans.decoded.slice(534).reduce((n,x,i)=>n+(x===P[i+534]),0)};
}
function fitMask(C,state){
 const f=families[state.f],D=f.d.map((d,j)=>d.filter((v,i)=>Number.isFinite(state.s[j*W+i])));
 if(D.some(d=>!d.length))throw Error("empty domain");
 let phase=state.origin,z=0;
 const pidx=C.map(c=>{if(c===0&&state.holds[z++])return -1;const j=phase;phase=(phase+1)%L;return j});
 const cost=D.map((d,j)=>new Float64Array(D[(j+30)%32].length*D[(j+31)%32].length*d.length));let constant=0;
 for(let i=2;i<C.length;i++){
  const j=pidx[i]>=0?pidx[i]:pidx[i-1]>=0?pidx[i-1]:pidx[i-2];
  if(j<0){constant+=lm[0];continue}
  const x=D[(j+30)%32],y=D[(j+31)%32],z=D[j],arr=cost[j],ct=C.slice(i-2,i+1),ps=pidx.slice(i-2,i+1).map(v=>v<0?-1:(v-j+32)%32);
  for(let a=0;a<x.length;a++)for(let b=0;b<y.length;b++)for(let c=0;c<z.length;c++){
   const val=[x[a],y[b],z[c]],p=ps.map((v,k)=>v<0?0:(ct[k]+29-val[v===30?0:v===31?1:2])%29);
   arr[(a*y.length+b)*z.length+c]+=lm[(p[0]*29+p[1])*29+p[2]];
  }
 }
 const out=cyclic(D,cost),P=C.map((c,i)=>pidx[i]<0?0:(c+29-out.key[pidx[i]])%29);
 if(Math.abs(out.score+constant-score(P))>1e-7||P.some((p,i)=>pidx[i]>=0&&p===0))throw Error("bad mask inverse");
 return {key:out.key,phase,score:score(P),P,origin:state.origin,f:state.f,holds:state.holds};
}
function fitViterbi(C,key,start,context=[]){
 let states=new Map([[start*841+(context[0]??0)*29+(context[1]??0),{score:0,path:""}]]);
 for(let i=0;i<C.length;i++){
  const c=C[i],next=new Map();
  for(const [id,h] of states){
   const phase=Math.floor(id/841),a=Math.floor(id%841/29),b=id%29;
   function put(p,q){
    const k=q*841+b*29+p,sc=h.score+(i+context.length>=2?lm[(a*29+b)*29+p]:0);
    if(!next.has(k)||next.get(k).score<sc)next.set(k,{score:sc,path:h.path+String.fromCharCode(65+p)});
   }
   if(c===0)put(0,phase);
   const p=(c+29-key[phase])%29;if(p!==0)put(p,(phase+1)%L);
  }
  states=next;if(!states.size)return {legal:false,failed:i};
 }
 let best;for(const h of states.values())if(!best||h.score>best.score)best=h;
 return {legal:true,score:best.score,P:[...best.path].map(x=>x.charCodeAt(0)-65)};
}
function beam(C,width=2048,shortlist=96){
 const blocks=[];let a=[];
 for(const c of C){if(c===0){blocks.push({a,zero:true});a=[]}else a.push(c)}
 blocks.push({a,zero:false});
 let states=[];
 for(let f=0;f<families.length;f++)for(let origin=0;origin<L;origin++){
  const v=new Float64Array(L*W).fill(-Infinity);
  for(let j=0;j<L;j++)for(let k=0;k<families[f].d[j].length;k++)v[j*W+k]=0;
  states.push({f,origin,phase:origin,s:v,holds:[],penalty:0,u:0});
 }
 const widths=[];let expanded=0;
 for(const block of blocks){
  const inc=families.map(f=>Array.from({length:L},(_,phase)=>{
   const v=new Float64Array(L*W);
   for(let i=0;i<block.a.length;i++){
    const row=(phase+i)%L,c=block.a[i],d=f.d[row];
    for(let k=0;k<d.length;k++){const p=(c+29-d[k])%29;v[row*W+k]+=p?uni[p]:-Infinity}
   }
   return v;
  }));
  const ns=[];
  function add(st,v,phase,hold,penalty){
   let sum=penalty;
   for(let j=0;j<L;j++){
    let m=-Infinity;for(let k=0;k<W;k++)m=Math.max(m,v[j*W+k]);
    if(!Number.isFinite(m))return;sum+=m;
   }
   ns.push({...st,s:v,phase,holds:hold===null?st.holds:st.holds.concat(hold),penalty,u:sum});
  }
  for(const st of states){
   const v=new Float64Array(L*W),vv=inc[st.f][st.phase];
   for(let i=0;i<v.length;i++)v[i]=st.s[i]+vv[i];
   const phase=(st.phase+block.a.length)%L;
   if(!block.zero){add(st,v,phase,null,st.penalty);continue}
   add(st,v,phase,true,st.penalty+uni[0]);
   const w=v.slice(),d=families[st.f].d[phase];
   for(let k=0;k<d.length;k++){const p=(29-d[k])%29;w[phase*W+k]+=p?uni[p]:-Infinity}
   add(st,w,(phase+1)%L,false,st.penalty);expanded+=2;
  }
  ns.sort((a,b)=>b.u-a.u);states=ns.slice(0,width);widths.push(states.length);
  if(!states.length)return {legal:false,widths,expanded};
 }
 let best;const top=[];
 for(const st of states.slice(0,shortlist)){
  const v=fitMask(C,st);if(!best||v.score>best.score)best=v;
  top.push({f:st.f,origin:st.origin,unigram:st.u,trigram:v.score});
 }
 return {legal:true,best,top:top.sort((a,b)=>b.trigram-a.trigram).slice(0,5),widths,expanded,ranked:states.length};
}
function solveF(C,dev){
 const ans=beam(C.slice(0,dev));if(!ans.legal)return ans;
 const b=ans.best,hold=fitViterbi(C.slice(dev),b.key,b.phase,b.P.slice(-2)),rep=fitViterbi(C.slice(0,dev),b.key,b.origin);
 return {...ans,hold,refitScore:rep.score,fitPerRune:b.score/(dev-2),heldoutPerRune:hold.legal?hold.score/(C.length-dev):null,selected:{radix:families[b.f].radix,sign:families[b.f].sign,origin:b.origin,key:b.key}};
}
function plantF(P,f,origin,seed){
 const rand=rng(seed),key=families[f].d.map(d=>d[rand()%d.length]);let phase=origin;
 const C=P.map(p=>{if(p===0)return 0;const c=(p+key[phase])%29;phase=(phase+1)%L;return c});
 const ans=solveF(C,534);
 return {true:{f,origin,key},selected:ans.selected,fit:ans.fitPerRune,heldout:ans.heldoutPerRune,fitCorrect:ans.legal?ans.best.P.reduce((n,x,i)=>n+(x===P[i]),0):0,heldoutCorrect:ans.hold?.legal?ans.hold.P.reduce((n,x,i)=>n+(x===P[i+534]),0):0,legal:ans.legal,holdLegal:ans.hold?.legal,expanded:ans.expanded,zeroes:C.slice(0,534).filter(c=>c===0).length};
}
const C=gp.pages.filter(x=>x.page>=51&&x.page<=55).flatMap(x=>x.indices);
if(C.length!==842)throw Error("bad adjacent tape");
const result={families:families.map(f=>({radix:f.radix,sign:f.sign,domainSizes:f.d.map(d=>d.length),keySpace:f.d.reduce((x,d)=>x*BigInt(d.length),1n).toString()})),trainingRunes:tr.length};
const mode=process.argv[2]??"both";
if(mode!=="f")result.ordinary={controls:[plantOrdinary(g.slice(5000,5842),families[0],7,0x4301),plantOrdinary(s.slice(8000,8842),families[3],19,0x4302)],original:solveOrdinary(C,534)};
if(mode!=="ordinary")result.transparentF={controls:[plantF(g.slice(5000,5842),0,7,0x4301),plantF(s.slice(8000,8842),3,19,0x4302)],original:solveF(C,534)};
console.log(JSON.stringify(result,null,2));
if(result.ordinary&&(!result.ordinary.controls.every(x=>x.correct===842&&x.heldoutCorrect===308)||Math.abs(result.ordinary.original.score+4.793986194636771)>1e-8))throw Error("ordinary regression");
if(result.transparentF&&(!result.transparentF.controls.every(x=>x.fitCorrect===534&&x.heldoutCorrect>=306)||result.transparentF.original.hold.legal||result.transparentF.original.hold.failed!==40))throw Error("F regression");
