"use strict";
const fs=require("node:fs"),path=require("node:path");
function treeAffine(raw,mode="control0"){
 const gp=JSON.parse(raw[0]),gold=JSON.parse(raw[4]),Q=29,K=812;
 const mod=x=>(x%Q+Q)%Q,check=(v,m)=>{if(!v)throw Error(m)},inv=Array.from({length:Q},(_,a)=>a?Array.from({length:28},(_,i)=>i+1).find(x=>a*x%Q===1):0);
 const tokens=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length),ix=new Map(gp.runes.map((x,i)=>[x,i]));
 function encode(s){let out=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");for(let j=0;j<w.length;){const q=w.startsWith("ING",j)?{t:"ING",i:21}:w.startsWith("IO",j)?{t:"IO",i:27}:tokens.find(o=>w.startsWith(o.t,j));check(q,"encode");out.push(q.i);j+=q.t.length;}}return out;}
 function body(s){const a=/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(s),b=/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(s);return s.slice(a?a.index+a[0].length:0,b?b.index:s.length);}
 const lit=raw.slice(1,4).map(s=>encode(body(s)));
 const train=[...lit.map(p=>p.slice(0,Math.floor(p.length*.65))),...gold.sections.filter(s=>s.name!=="p57_parable").map(s=>[...s.source_text].filter(x=>ix.has(x)).map(x=>ix.get(x)))];

const A=Array.from({length:K},(_,k)=>1+Math.floor(k/29)),Bv=Array.from({length:K},(_,k)=>k%29);
const keymap=Array.from({length:Q},(_,x)=>Uint8Array.from({length:K},(_,k)=>mod(A[k]*x+Bv[k])));
const sizes=[255,268,263,273,261,272,137],N=137,S=6,W=512,D=5,QP=Array.from({length:D+1},(_,i)=>Q**i);
const total=train.reduce((a,p)=>a+p.length,0);
function model(seqs){
 const count=Array.from({length:D+1},()=>new Map());count[0].set(0,new Uint32Array(Q));
 for(const p of seqs)for(let i=0;i<p.length;i++){const x=p[i];count[0].get(0)[x]++;let c=0,m=1;
  for(let d=1;d<=D&&i>=d;d++){c+=p[i-d]*m;m*=Q;let row=count[d].get(c);if(!row){row=new Uint32Array(Q);count[d].set(c,row);}row[x]++;}
 }
 const tab=Array.from({length:D+1},()=>new Map()),base=count[0].get(0),tot=base.reduce((a,b)=>a+b,0);
 tab[0].set(0,Float32Array.from(base,n=>Math.log((n+.5)/(tot+14.5))));
 function row(d,c){while(d>0&&!tab[d].has(c)){c%=QP[--d];}return tab[d].get(c);}
 for(let d=1;d<=D;d++){for(const [c,ns] of count[d]){const back=row(d-1,c%QP[d-1]),n=ns.reduce((a,b)=>a+b,0),types=ns.reduce((a,b)=>a+Number(b>0),0),alpha=Math.max(d===1?12:d===2?9:d===3?7:2,types);
   tab[d].set(c,Float32Array.from(ns,(v,x)=>Math.log((v+alpha*Math.exp(back[x]))/(n+alpha))));
 }count[d].clear();}
 return {row,contexts:tab.map(t=>t.size)};
}
const forward=model(train),reverse=model(train.map(p=>p.slice().reverse()));
function score(p,m=forward){let v=0,c=0;for(let i=0;i<p.length;i++){v+=m.row(Math.min(D,i),c)[p[i]];c=(c*Q+p[i])%QP[D];}return v;}
function beamFit(c,m){
 const M=Array.from({length:N},(_,i)=>{let a=new Uint8Array(K*S);for(let k=0;k<K;k++)for(let j=0;j<S;j++)a[k*S+j]=keymap[c[j][i]][k];return a;});
 const nodes=[],scores=new Float64Array(W*K),indices=new Int32Array(W*K),powK=K**(D-1);
 let beam=[{hist:0,k:-1,v:0,parent:-1}],widths=[];
 function select(n,want){
  for(let i=0;i<n;i++)indices[i]=i;
  function higher(i,j){return scores[i]>scores[j]||(scores[i]===scores[j]&&i<j);}
  let lo=0,hi=n-1,t=want-1;
  while(lo<hi){const pivot=indices[(lo+hi)>>1];let i=lo,j=hi;while(i<=j){while(higher(indices[i],pivot))i++;while(higher(pivot,indices[j]))j--;if(i<=j){const z=indices[i];indices[i++]=indices[j];indices[j--]=z;}}if(t<=j)hi=j;else if(t>=i)lo=i;else break;}
  return Array.from(indices.subarray(0,want)).sort((a,b)=>scores[b]-scores[a]||a-b);
 }
 for(let t=0;t<N;t++){
  const now=M[t],n=beam.length*K,d=Math.min(D,t),keys=new Int32Array(D),rows=new Array(S);
  for(let s=0;s<beam.length;s++){
   const e=beam[s],z=s*K;let h=e.hist;for(let i=d-1;i>=0;i--){keys[i]=h%K;h=Math.floor(h/K);}
   for(let j=0;j<S;j++){let ctx=0;for(let i=0;i<d;i++)ctx=ctx*Q+M[t-d+i][keys[i]*S+j];rows[j]=m.row(d,ctx);}
   const [r0,r1,r2,r3,r4,r5]=rows;
   for(let k=0,o=0;k<K;k++,o+=S)scores[z+k]=e.v+r0[now[o]]+r1[now[o+1]]+r2[now[o+2]]+r3[now[o+3]]+r4[now[o+4]]+r5[now[o+5]];
  }
  let want=Math.min(n,4*W),next;
  for(;;){const rank=select(n,want),seen=new Set();next=[];
   for(const h of rank){const par=Math.floor(h/K),k=h%K,e=beam[par],sig=(e.hist%powK)*K+k;if(seen.has(sig))continue;seen.add(sig);next.push({hist:sig,k,v:scores[h],parent:par});if(next.length===W)break;}
   if(next.length===W||want===n)break;want=Math.min(n,2*want);
  }
  nodes.push(next);beam=next;widths.push(beam.length);
 }
 const key=new Array(N);let h=0;for(let t=N-1;t>=0;t--){const e=nodes[t][h];key[t]=e.k;h=e.parent;}
 const plain=c.map(p=>p.map((v,i)=>keymap[v][key[i]]));check(Math.abs(plain.reduce((s,p)=>s+score(p,m),0)-beam[0].v)<1e-6,"path objective");
 return {key,plain,value:beam[0].v,widths};
}
function fit(c){
 check(c.length===S&&c.every(x=>x.length===N),"fit geometry");
 const f=beamFit(c,forward),b=beamFit(c.map(p=>p.slice().reverse()),reverse);
 function refine(k0){const kk=k0.slice(),pp=c.map(p=>p.map((v,i)=>keymap[v][kk[i]]));let sweeps=0,changes=0;
  function local(t,j,x){const p=pp[j];let v=0;
   for(let i=t;i<=Math.min(N-1,t+D);i++){let ctx=0,d=Math.min(D,i);for(let z=i-d;z<i;z++)ctx=ctx*Q+(z===t?x:p[z]);v+=forward.row(d,ctx)[i===t?x:p[i]];}
   return v;
  }
  const ls=Array.from({length:S},()=>new Float64Array(Q));
  for(let s=0;s<10;s++){let ch=0;for(let i=0;i<N;i++){const t=s%2?N-1-i:i;
    for(let j=0;j<S;j++)for(let x=0;x<Q;x++)ls[j][x]=local(t,j,x);
    function val(k){let v=0;for(let j=0;j<S;j++)v+=ls[j][keymap[c[j][t]][k]];return v;}
    let best=kk[t],bv=val(best);for(let k=0;k<K;k++){const v=val(k);if(v>bv+1e-9){bv=v;best=k;}}
    if(best!==kk[t]){kk[t]=best;for(let j=0;j<S;j++)pp[j][t]=keymap[c[j][t]][best];ch++;}
   }sweeps++;changes+=ch;if(!ch)break;}
  return {key:kk,plain:pp,value:pp.reduce((s,p)=>s+score(p),0),sweeps,changes};
 }
 const ff=refine(f.key),bb=refine(b.key.slice().reverse()),best=ff.value>=bb.value?ff:bb;
 check(best.value>=f.value-1e-6,"refine monotonic");return {...best,beamValue:f.value,reverseValue:bb.value,selected:ff.value>=bb.value?"forward":"reverse",widths:f.widths};
}
function evaluate(C,truth=null,doRefine=true){
 const fitC=C.slice(0,S).map(p=>p.slice(0,N)),res=fit(fitC),key=res.key;
 // The seventh track is not passed to fit. Only now decode and score it.
 const held=C[S].slice(0,N).map((x,i)=>keymap[x][key[i]]);
 const all=[...res.plain,held];
 for(let j=0;j<=S;j++)for(let i=0;i<N;i++){const k=key[i],p=all[j][i],replay=mod(inv[A[k]]*(p-Bv[k]));check(replay===C[j][i],"replay");}
 const out={fitNats:res.value/(N*S),beamNats:res.beamValue/(N*S),heldNats:score(held)/N,heldLatin:held.map(x=>gp.translit[x]).join(""),key:key.map(k=>[A[k],Bv[k]]),fitPlain:res.plain,heldPlain:held,sweeps:res.sweeps,changes:res.changes,selected:res.selected,reverseNats:res.reverseValue/(N*S),contexts:forward.contexts};
 if(truth){const id=Array.from({length:N},(_,i)=>new Set(fitC.map(p=>p[i])).size>1),observable=id.filter(Boolean).length;
 out.truth={observable,correct:key.filter((k,i)=>id[i]&&k===truth.key[i]).length,heldCorrect:held.filter((x,i)=>x===truth.P[S][i]).length,fitCorrect:res.plain.map((p,j)=>p.filter((x,i)=>x===truth.P[j][i]).length),trueFitNats:truth.P.slice(0,S).reduce((a,p)=>a+score(p.slice(0,N)),0)/(N*S),trueHeldNats:score(truth.P[S].slice(0,N))/N};}
 return out;
}
if(mode==="original"){
 const pages=gp.pages.slice(8,15).map(p=>p.indices);
 check(pages.map(p=>p.length).join()===sizes.join(),"original geometry");
 return {trainRunes:total,mode,N,W,result:evaluate(pages)};
}
const m=/^control([0-5])$/.exec(mode);check(m,"mode control0..5 or original");const trial=Number(m[1]);let rng=(0xa704f91c+trial*0x6a09e667)>>>0;
function rand(n){rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;return (rng>>>0)%n;}
const donor=lit[trial%3],start=Math.floor(donor.length*.72)+rand(Math.floor(donor.length*.23)-sizes.reduce((a,b)=>a+b,0));let off=start;const P=sizes.map(n=>{const p=donor.slice(off,off+n);off+=n;return p;});
const key=Array.from({length:N},()=>rand(K));
function plant(shared){return P.map(p=>p.slice(0,N).map((x,i)=>{const k=shared?key[i]:rand(K);return mod(inv[A[k]]*(x-Bv[k]));}));}
const positive=evaluate(plant(true),{P,key}),negative=evaluate(plant(false));
return {trainRunes:total,trial,donor:trial%3,start,N,W,positive,negative,passed:positive.truth.correct>=Math.ceil(.7*positive.truth.observable)&&positive.truth.heldCorrect>=Math.ceil(.7*N)&&positive.heldNats>negative.heldNats+1&&positive.heldNats>-4.2&&negative.heldNats<-4.2};

}
const paths=["resources/liber-primus/lp2-corpus.json","resources/control/shakespeare_first300k.txt","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt","resources/external/relikd-solved-gp29-native-v1.json"];
if(require.main===module)console.log(JSON.stringify(treeAffine(paths.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8")),process.argv[2]??"control0"),null,2));
module.exports={treeAffine,paths};
