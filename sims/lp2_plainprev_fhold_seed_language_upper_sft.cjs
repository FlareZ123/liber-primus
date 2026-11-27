'use strict';
const INPUTS=["resources/liber-primus/lp2-corpus.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","im-results/lp2-plainprev-fhold-seed-domain-propagation-output.json","im-results/lp2-plainprev-fhold-seed-domain-search-output.json"];
function run(raw,{start=0,count=8,controls=false}={}){
 const gp=JSON.parse(raw[0]),prior=JSON.parse(raw[4]),search=JSON.parse(raw[5]),A=29,ALL=(1<<A)-1,mod=(x,m=A)=>(x+m)%m,bit=x=>31-Math.clz32(x),one=x=>x!==0&&(x&(x-1))===0;
 const assert=(x,m)=>{if(!x)throw Error(m)},sum=x=>x.reduce((a,b)=>a+b,0),tokens=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
 function native(t){const a=/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t),b=/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t);let p=[];for(const w0 of t.slice(a?a.index+a[0].length:0,b?b.index:t.length).toUpperCase().match(/[A-Z]+/g)||[]){const w=w0.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");for(let j=0;j<w.length;){const v=w.startsWith("ING",j)?{t:"ING",i:21}:w.startsWith("IO",j)?{t:"IO",i:27}:tokens.find(x=>w.startsWith(x.t,j));assert(v,w);p.push(v.i);j+=v.t.length;}}return p}
 const donors=raw.slice(1,4).map(native),train=donors.map(d=>d.slice(0,d.length-16000)),U0=new Float64Array(A).fill(.5),B0=new Float64Array(A*A);
 for(const p of train)for(let i=0;i<p.length;i++){U0[p[i]]++;if(i)B0[p[i-1]*A+p[i]]++;}
 const U=U0.map(x=>x/sum(U0)),B=new Float64Array(A*A);for(let q=0;q<A;q++){const n=sum(B0.subarray(q*A,(q+1)*A));for(let p=0;p<A;p++)B[q*A+p]=(B0[q*A+p]+8*U[p])/(n+8);}
 const L1=U.map(x=>Math.log(A*x)),L2=B.map(x=>Math.log(A*x));
 const frames=gp.pages.filter(p=>p.page<=55&&p.indices.length).map(p=>({page:p.page,c:p.indices}));
 const ranked=prior.trials.filter(t=>t.ok).sort((a,b)=>a.after-b.after),ids=search.batches.flatMap(b=>b.exactResults).filter(t=>t.status==="UNKNOWN").map(t=>t.i);
 // Exact maximum path score for the relaxed domain machine. State q
 // is previous consuming rune; state A+q means previous actual rune F.
 // For each transition, permit any K[q] in its domain independently.
 // Thus the result is an upper bound for every shared permutation.
 function best(C,D,trace=false){
  let s=new Float64Array(2*A),t=s.slice();s.fill(-Infinity);s[0]=0;
  const hist=trace?[]:null;
  for(let i=1;i<C.length;i++){
   t.fill(-Infinity);const d=mod(C[i]-C[i-1]),z=C[i]===0;
   const back=trace?new Int16Array(2*A).fill(-1):null;
   for(let q=0;q<A;q++){
    const a=s[q],b=s[A+q];if(a===-Infinity&&b===-Infinity)continue;
    if(z){const l=i===1?a+L1[0]:a+L2[q*A],h=b+L2[0],v=Math.max(l,h);
     if(v>t[A+q]){t[A+q]=v;if(back)back[A+q]=l>=h?q:A+q;}}
    for(let x=D[q];x;){const k=x&-x;x^=k;const p=mod(d+bit(k));if(!p)continue;
     const l=i===1?a+L1[p]:a+L2[q*A+p],h=b+L2[p],v=Math.max(l,h);
     if(v>t[p]){t[p]=v;if(back)back[p]=l>=h?q:A+q;}}
   }
   if(hist)hist.push(back);
   [s,t]=[t,s];
  }
  let end=0;for(let q=1;q<2*A;q++)if(s[q]>s[end])end=q;
  const score=s[end];if(!trace||!Number.isFinite(score))return {score};
  const P=[];for(let i=hist.length-1;i>=0;i--){P.push(end>=A?0:end);end=hist[i][end];assert(end>=0,"trace");}
  return {score,P:P.reverse()};
 }
 function enc(P,K,iv){let q=0,c=[iv];for(const p of P){c.push(p===0?0:mod(c.at(-1)+p-K[q]));if(p)q=p;}return c}
 function score(P){return sum(P.map((p,i)=>i?L2[P[i-1]*A+p]:L1[p]));}
 let seed=0x42f03429;function rnd(n){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)%n}
 function perm(){const k=Array.from({length:A},(_,q)=>q);for(let i=A-1;i>0;i--){const j=rnd(i+1);[k[i],k[j]]=[k[j],k[i]];}return k}
 if(controls){
  // Exhaust all legal plaintext paths for short ciphertexts with fixed keys.
  let bruteChecks=0,plantChecks=[];
  for(let t=0;t<120;t++){
   const K=perm(),P=Array.from({length:9},()=>rnd(A)),C=enc(P,K,rnd(A)),D=K.map(v=>1<<v);
   let max=-Infinity;function rec(i,q,p){if(i===C.length){max=Math.max(max,score(p));return;}
    if(C[i]===0)rec(i+1,q,[...p,0]);const v=mod(C[i]-C[i-1]+K[q]);if(v)rec(i+1,v,[...p,v]);}
   rec(1,0,[]);const s=best(C,D,true);assert(Math.abs(s.score-max)<1e-8&&enc(s.P,K,C[0]).join()===C.join(),"exact Viterbi");bruteChecks++;
  }
  // Three independent source tails, exact original physical geometry.
  for(let j=0;j<3;j++){
   const K=perm(),pattern=ranked[ids[j*10]].D,used=K.reduce((s,v,q)=>one(pattern[q])?s|(1<<v):s,0),D=K.map((v,q)=>one(pattern[q])?1<<v:ALL&~used);
   let pos=donors[j].length-16000,oracle=0,hard=0,upper=0,n=0,repeats=0;
   for(const f of frames){const P=donors[j].slice(pos,pos+f.c.length-1);pos+=P.length;const C=enc(P,K,f.c[0]);const a=score(P),b=best(C,K.map(v=>1<<v),true),u=best(C,D).score;
    assert(b.score+1e-8>=a&&u+1e-8>=b.score&&enc(b.P,K,C[0]).join()===C.join(),"plant bound");oracle+=a;hard+=b.score;upper+=u;n+=P.length;for(let i=1;i<C.length;i++)if(C[i]===C[i-1])repeats++;}
   plantChecks.push({donor:j,oracle:oracle/n,hard:hard/n,upper:upper/n,n,repeats,fixed:pattern.filter(one).length});
  }
  return {bruteChecks,plantChecks};
 }
 const results=[];
 for(const i of ids.slice(start,start+count)){
  const t=ranked[i],D=t.D,used=frames.filter(f=>f.page!==t.a.page&&f.page!==t.b.page);let total=0,n=0,pg=[];
  for(const f of used){const s=best(f.c,D).score;total+=s;n+=f.c.length-1;pg.push({page:f.page,score:s/(f.c.length-1)});}
  results.push({i,a:t.a,b:t.b,k0:t.k0,fixed:t.fixed,mean:total/n,n,pg});
 }
 return {start,count,total:ids.length,results};
}
if(typeof require!=='undefined'&&require.main===module){const fs=require('node:fs'),path=require('node:path'),root=path.resolve(__dirname,'..');const raw=INPUTS.map(p=>fs.readFileSync(path.join(root,p),'utf8'));console.log(JSON.stringify(run(raw,process.argv[2]==='controls'?{controls:true}:{start:Number(process.argv[2]??0),count:Number(process.argv[3]??8)}),null,2));}
