"use strict";
/** Exact GP29 two-history linear projection row-substitution capacity and arbitrary page-cut DP. */
function experiment(corpus,texts){
 const M=29,K=28,spans=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
 const pages=corpus.pages.slice(0,56).filter(p=>p.indices.length),P=pages.length,orig=pages.flatMap(p=>p.indices),N=orig.length;
 const check=(v,m)=>{if(!v)throw Error(m)};
 check(N===12956&&P===55,"source geometry");
 const offsets=[0];for(const p of pages)offsets.push(offsets.at(-1)+p.indices.length);
 const gp=corpus.translit.map((token,i)=>({token,i})).sort((a,b)=>b.token.length-a.token.length);
 function encode(source){let a=[];for(let word of source.toUpperCase().match(/[A-Z]+/g)||[]){word=word.replace(/QU/g,"CW").replace(/V/g,"U").replace(/K/g,"C").replace(/Z/g,"S");for(let i=0;i<word.length;){const t=gp.find(o=>word.startsWith(o.token,i));check(t,"GP encoding");a.push(t.i);i+=t.token.length}}return a}
 function project(a,b,t){return t===29?b:(a+t*b)%M}
 function hist(){return Array.from({length:M},()=>new Uint32Array(M))}
 function prefix(rows){const p=new Int32Array(K).fill(2);for(const row of rows){const q=Array.from(row).sort((a,b)=>b-a);let s=0;for(let k=0;k<K;k++)p[k]+=(s+=q[k])}return p}
 function direct(tape,t){const h=hist();for(let i=2;i<tape.length;i++)h[project(tape[i-1],tape[i-2],t)][tape[i]]++;return prefix(h)}
 const state=Array.from({length:30},(_,t)=>Uint8Array.from(orig,(_,i)=>i<2?0:project(orig[i-1],orig[i-2],t)));
 const env=Array.from({length:P},()=>Array.from({length:P+1},()=>new Int32Array(K)));
 for(let l=0;l<P;l++)for(let t=0;t<30;t++){
  const h=hist();let next=offsets[l]+2;
  for(let rr=l+1;rr<=P;rr++){
   for(;next<offsets[rr];next++)h[state[t][next]][orig[next]]++;
   const top=prefix(h),e=env[l][rr];for(let k=0;k<K;k++)if(top[k]>e[k])e[k]=top[k];
  }
 }
 for(const [l,rr] of [[0,1],[0,P],[11,16],[54,55]])for(let k=0;k<K;k++){
  const truth=Math.max(...Array.from({length:30},(_,t)=>direct(orig.slice(offsets[l],offsets[rr]),t)[k]));
  check(truth===env[l][rr][k],"direct interval");
 }
 const dp=Array.from({length:P+1},()=>Array.from({length:P+1},()=>new Int32Array(K).fill(-1000000)));dp[0][0].fill(0);
 for(let b=1;b<=P;b++)for(let rr=b;rr<=P;rr++)for(let l=b-1;l<rr;l++)for(let k=0;k<K;k++){
  const v=dp[b-1][l][k]+env[l][rr][k];if(v>dp[b][rr][k])dp[b][rr][k]=v;
 }
 const tops=Array.from({length:P},(_,i)=>Array.from(dp[i+1][P]));
 for(let b=1;b<P;b++)for(let k=0;k<K;k++)check(tops[b][k]>=tops[b-1][k],"monotone");
 const chapterTop=Array(K).fill(0);
 for(const [a,b] of spans){const l=pages.findIndex(p=>p.page===a),rr=pages.findIndex(p=>p.page===b)+1;check(l>=0&&rr>l,"chapter");for(let k=0;k<K;k++)chapterTop[k]+=env[l][rr][k]}
 const donors=texts.map(encode);
 function scan(d){const h=Array(M).fill(0);for(let i=0;i<N;i++)h[d[i]]++;const earliest=Array(P+1).fill(0),examples=Array(P+1).fill(null);let total=0,globalMinGap=Infinity,chapterMinGap=Infinity;
  for(let s=0;s+N<=d.length;s++){const f=h.slice().sort((a,b)=>b-a);let p=0;const cum=f.slice(0,K).map(x=>(p+=x));
   const gap=top=>Math.max(...cum.map((v,k)=>v-top[k]));globalMinGap=Math.min(globalMinGap,gap(tops[0]));chapterMinGap=Math.min(chapterMinGap,gap(chapterTop));
   let lo=0,hi=P-1;while(lo<hi){let mid=(lo+hi)>>1;if(gap(tops[mid])<=0)hi=mid;else lo=mid+1}
   check(gap(tops[lo])<=0,"page envelope");earliest[lo+1]++;if(examples[lo+1]===null)examples[lo+1]={start:s,prefix:cum};total++;
   if(s+N<d.length){h[d[s]]--;h[d[s+N]]++}
  }return{length:d.length,total,globalMinGap,chapterMinGap,earliest,examples}}
 let seed=0x412711;function rand(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0}
 function perm(){let a=Array.from({length:M},(_,i)=>i);for(let i=M-1;i>0;i--){let j=rand()%(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
 function collisions(tape,t,start,end){let h=hist(),num=0,den=0,n=new Uint32Array(M);for(let i=Math.max(2,start);i<end;i++){const s=project(tape[i-1],tape[i-2],t);num+=h[s][tape[i]]++;den+=n[s]++}return{num,den,rate:num/den}}
 function rank(tape,start,end){return Array.from({length:30},(_,t)=>({t,...collisions(tape,t,start,end)})).sort((a,b)=>b.rate-a.rate||a.t-b.t)}
 const plants=[4,19,29].map((t,j)=>{const d=donors[j].slice(123,N+123),rows=Array.from({length:M},perm),c=d.slice(0,2);for(let i=2;i<N;i++)c.push(rows[project(c[i-1],c[i-2],t)][d[i]]);const fit=rank(c,0,N/2),held=collisions(c,fit[0].t,N/2,N);
 const inv=c.slice(0,2);for(let i=2;i<N;i++)inv.push(rows[project(c[i-1],c[i-2],fit[0].t)].indexOf(c[i]));
 const f=Array(M).fill(0);for(const x of d)f[x]++;f.sort((a,b)=>b-a);let s=0;const top=direct(c,t);check(f.slice(0,K).every((v,k)=>(s+=v)<=top[k]),"planted capacity");
 return{truth:t,rank:1+fit.findIndex(x=>x.t===t),winner:fit[0],runnerUp:fit[1],held,heldTruth:collisions(c,t,N/2,N),oracleRowDecode:inv.filter((x,i)=>x===d[i]).length}});
 const originalFit=rank(orig,0,N/2),originalHeld=collisions(orig,originalFit[0].t,N/2,N);
 return{N,P,offsets,pageNumbers:pages.map(p=>p.page),globalTop:tops[0],chapterTop,pageTop:tops[P-1],resetEnvelopes:tops,native:donors.map(scan),plants,originalFit:originalFit.slice(0,5),originalHeld};
}
if(require.main===module){const fs=require("node:fs"),path=require("node:path"),root=path.join(__dirname,"..");const paths=["resources/liber-primus/lp2-corpus.json","resources/control/shakespeare_first300k.txt","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt"];const a=paths.map(p=>fs.readFileSync(path.join(root,p),"utf8"));console.log(JSON.stringify(experiment(JSON.parse(a[0]),a.slice(1)),null,2));}
module.exports=experiment;
