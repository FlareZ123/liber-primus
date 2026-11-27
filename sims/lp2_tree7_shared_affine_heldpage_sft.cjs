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
 const n1=new Float64Array(Q),n2=new Float64Array(Q*Q),n3=new Float64Array(Q**3),n4=new Float64Array(Q**4),d2=new Float64Array(Q),d3=new Float64Array(Q*Q),d4=new Float64Array(Q**3);let total=0;
 for(const p of train)for(let i=0;i<p.length;i++){const c=p[i];n1[c]++;total++;if(i){const a=p[i-1];n2[a*Q+c]++;d2[a]++;if(i>1){const ab=p[i-2]*Q+a;n3[ab*Q+c]++;d3[ab]++;if(i>2){const abc=p[i-3]*Q*Q+ab;n4[abc*Q+c]++;d4[abc]++;}}}}
 const U=Float64Array.from(n1,n=>(n+.5)/(total+14.5)),B=Float64Array.from(n2,(n,i)=>(n+12*U[i%Q])/(d2[Math.floor(i/Q)]+12)),T=Float64Array.from(n3,(n,i)=>(n+9*B[i%(Q*Q)])/(d3[Math.floor(i/Q)]+9)),F=Float64Array.from(n4,(n,i)=>(n+7*T[i%(Q**3)])/(d4[Math.floor(i/Q)]+7));
 const lu=U.map(Math.log),lb=B.map(Math.log),lt=T.map(Math.log),lf=F.map(Math.log),logK=Math.log(K);


const A=Array.from({length:K},(_,k)=>1+Math.floor(k/29)),Bv=Array.from({length:K},(_,k)=>k%29);
const keymap=Array.from({length:Q},(_,x)=>Uint8Array.from({length:K},(_,k)=>mod(A[k]*x+Bv[k])));
const sizes=[255,268,263,273,261,272,137],N=137,S=6,W=256;
function score(p,table=lf){let v=0;for(let i=0;i<p.length;i++)v+=i===0?lu[p[i]]:i===1?lb[p[i-1]*Q+p[i]]:i===2?lt[(p[i-2]*Q+p[i-1])*Q+p[i]]:table[((p[i-3]*Q+p[i-2])*Q+p[i-1])*Q+p[i]];return v;}
function fit(c){
 check(c.length===S&&c.every(x=>x.length===N),"fit geometry");
 const M=Array.from({length:N},(_,i)=>{let m=new Uint8Array(K*S);for(let k=0;k<K;k++)for(let j=0;j<S;j++)m[k*S+j]=keymap[c[j][i]][k];return m;});
 const nodes=[],scores=new Float64Array(W*K),indices=new Int32Array(W*K);
 let beam=[{a:-1,b:-1,d:-1,v:0,parent:-1}],widths=[];
 // Enumerate all 812 candidates per retained parent; select top distinct last-three-key states.
 // Quickselect top 4W, deduplicate, expand selection if necessary.
 function select(n,want){
  for(let i=0;i<n;i++)indices[i]=i;
  function higher(i,j){return scores[i]>scores[j]||(scores[i]===scores[j]&&i<j);}
  let lo=0,hi=n-1,t=want-1;
  while(lo<hi){const pivot=indices[(lo+hi)>>1];let i=lo,j=hi;while(i<=j){while(higher(indices[i],pivot))i++;while(higher(pivot,indices[j]))j--;if(i<=j){const z=indices[i];indices[i++]=indices[j];indices[j--]=z;}}if(t<=j)hi=j;else if(t>=i)lo=i;else break;}
  return Array.from(indices.subarray(0,want)).sort((a,b)=>scores[b]-scores[a]||a-b);
 }
 for(let t=0;t<N;t++){
  const now=M[t],n=beam.length*K,rows=new Int32Array(S);
  for(let s=0;s<beam.length;s++){
   const e=beam[s],z=s*K;
   if(t===0)rows.fill(0);
   else for(let j=0;j<S;j++)rows[j]=t===1?M[t-1][e.d*S+j]*Q:t===2?(M[t-2][e.b*S+j]*Q+M[t-1][e.d*S+j])*Q:((M[t-3][e.a*S+j]*Q+M[t-2][e.b*S+j])*Q+M[t-1][e.d*S+j])*Q;
   const tab=t===0?lu:t===1?lb:t===2?lt:lf;
   for(let k=0,o=0;k<K;k++,o+=S)scores[z+k]=e.v+tab[rows[0]+now[o]]+tab[rows[1]+now[o+1]]+tab[rows[2]+now[o+2]]+tab[rows[3]+now[o+3]]+tab[rows[4]+now[o+4]]+tab[rows[5]+now[o+5]];
  }
  let want=Math.min(n,4*W),next;
  for(;;){const rank=select(n,want),seen=new Set();next=[];
   for(const h of rank){const par=Math.floor(h/K),k=h%K,e=beam[par],sig=((e.b+1)*(K+1)+(e.d+1))*(K+1)+k;if(seen.has(sig))continue;seen.add(sig);next.push({a:e.b,b:e.d,d:k,v:scores[h],parent:par});if(next.length===W)break;}
   if(next.length===W||want===n)break;want=Math.min(n,2*want);
  }
  nodes.push(next);beam=next;widths.push(beam.length);
 }
 const key=new Array(N);let h=0;for(let t=N-1;t>=0;t--){const e=nodes[t][h];key[t]=e.d;h=e.parent;}
 const plain=c.map(p=>p.map((v,i)=>keymap[v][key[i]]));check(Math.abs(plain.reduce((s,p)=>s+score(p),0)-beam[0].v)<1e-7,"path objective");
 // Coordinate ascent under the same frozen tetragram objective, never using held data.
 function refine(k0){const kk=k0.slice(),pp=c.map(p=>p.map((v,i)=>keymap[v][kk[i]]));let sweeps=0,changes=0;
  function local(t,k){let v=0;for(let j=0;j<S;j++){const p=pp[j],x=M[t][k*S+j];for(let i=t;i<=Math.min(N-1,t+3);i++){
    const q=i===t?x:p[i],r=i-1===t?x:p[i-1],s=i-2===t?x:p[i-2],a=i-3===t?x:p[i-3];
    v+=i===0?lu[q]:i===1?lb[r*Q+q]:i===2?lt[(s*Q+r)*Q+q]:lf[((a*Q+s)*Q+r)*Q+q];
   }}return v;}
  for(let s=0;s<6;s++){let ch=0;for(let i=0;i<N;i++){const t=s%2?N-1-i:i;let best=kk[t],bv=local(t,best);for(let k=0;k<K;k++){const v=local(t,k);if(v>bv+1e-9){bv=v;best=k;}}if(best!==kk[t]){kk[t]=best;for(let j=0;j<S;j++)pp[j][t]=M[t][best*S+j];ch++;}}sweeps++;changes+=ch;if(!ch)break;}
  return {key:kk,plain:pp,value:pp.reduce((s,p)=>s+score(p),0),sweeps,changes};
 }
 const refined=refine(key);check(refined.value>=beam[0].v-1e-8,"refine monotonic");
 return {...refined,beamValue:beam[0].v,widths};
}
function evaluate(C,truth=null,doRefine=true){
 const fitC=C.slice(0,S).map(p=>p.slice(0,N)),res=fit(fitC),key=res.key;
 // The seventh track is not passed to fit. Only now decode and score it.
 const held=C[S].slice(0,N).map((x,i)=>keymap[x][key[i]]);
 const all=[...res.plain,held];
 for(let j=0;j<=S;j++)for(let i=0;i<N;i++){const k=key[i],p=all[j][i],replay=mod(inv[A[k]]*(p-Bv[k]));check(replay===C[j][i],"replay");}
 const out={fitNats:res.value/(N*S),beamNats:res.beamValue/(N*S),heldNats:score(held)/N,heldLatin:held.map(x=>gp.translit[x]).join(""),key:key.map(k=>[A[k],Bv[k]]),fitPlain:res.plain,heldPlain:held,sweeps:res.sweeps,changes:res.changes};
 if(truth){const id=Array.from({length:N},(_,i)=>new Set(fitC.map(p=>p[i])).size>1),observable=id.filter(Boolean).length;
 out.truth={observable,correct:key.filter((k,i)=>id[i]&&k===truth.key[i]).length,heldCorrect:held.filter((x,i)=>x===truth.P[S][i]).length,fitCorrect:res.plain.map((p,j)=>p.filter((x,i)=>x===truth.P[j][i]).length),trueFitNats:truth.P.slice(0,S).reduce((a,p)=>a+score(p.slice(0,N)),0)/(N*S),trueHeldNats:score(truth.P[S].slice(0,N))/N};}
 return out;
}
if(mode==="original"){
 const pages=gp.pages.slice(8,15).map(p=>p.indices);
 check(pages.map(p=>p.length).join()===sizes.join(),"original geometry");
 return {trainRunes:total,mode,N,W,result:evaluate(pages)};
}
const m=/^control([0-5])$/.exec(mode);check(m,"mode control0..5 or original");const trial=Number(m[1]);let rng=(0xd8a73b21+trial*0x9e3779b9)>>>0;
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
