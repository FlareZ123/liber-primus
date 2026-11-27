'use strict';
const fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');
function hardFit(corpus,training,donor,dev,steps=10){
 const Q=29,K=812,fit=dev.fit,N=dev.N,mod=x=>(x%Q+Q)%Q,tok=new Map(corpus.translit.map((x,i)=>[x,i]));
 function gp(s){const out=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/ING/g,"NG").replace(/IO/g,"IA").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");while(w.length){const n=tok.has(w.slice(0,2))?2:1,v=tok.get(w.slice(0,n));if(v===undefined)throw Error(w);out.push(v);w=w.slice(n);}}return out;}
 const tr=gp(training),cnt=new Float64Array(Q*Q).fill(.2),B=new Float64Array(Q*Q),pi=new Float64Array(Q).fill(1/Q);
 for(let i=1;i<tr.length;i++)cnt[tr[i-1]*Q+tr[i]]++;
 for(let p=0;p<Q;p++){let s=0;for(let q=0;q<Q;q++)s+=cnt[p*Q+q];for(let q=0;q<Q;q++)B[p*Q+q]=cnt[p*Q+q]/s;}
 for(let i=0;i<500;i++){const next=new Float64Array(Q);for(let p=0;p<Q;p++)for(let q=0;q<Q;q++)next[q]+=pi[p]*B[p*Q+q];pi.set(next);}
 const F=new Uint8Array(K*Q),inv=new Uint8Array(Q);for(let a=1;a<Q;a++)for(let b=1;b<Q;b++)if(a*b%Q===1)inv[a]=b;
 for(let k=0;k<K;k++){const a=(k/Q|0)+1,b=k%Q;for(let d=0;d<Q;d++)F[k*Q+d]=(a*d+b)%Q;}
 const P=gp(donor).slice(dev.controlOffset,dev.controlOffset+N),truth=dev.trueKey,D=Uint8Array.from(P.slice(1),(q,i)=>{const k=truth[P[i]],a=(k/Q|0)+1,b=k%Q;return mod((q-b)*inv[a]);});
 const pair=new Float64Array(Q*Q);for(let i=1;i<fit-1;i++)pair[D[i-1]*Q+D[i]]++;
 const logB=Float64Array.from(B,Math.log),logPi=Float64Array.from(pi,Math.log);
 const right=new Float64Array(Q*Q),L=new Float64Array(Q*Q),base=new Float64Array(Q*Q),row=new Float64Array(Q);
 function setup(key,exclude=-1){right.fill(0);L.fill(0);for(let d=0;d<Q;d++)for(let p=0;p<Q;p++){const q=F[key[p]*Q+d],v=B[p*Q+q];right[p*Q+d]=v;if(p!==exclude)L[d*Q+q]+=pi[p]*v;}}
 function ll(key){setup(key);let total=0;for(let d=0;d<Q;d++)for(let e=0;e<Q;e++){let j=0;for(let q=0;q<Q;q++)j+=L[d*Q+q]*right[q*Q+e];if(pair[d*Q+e])total+=pair[d*Q+e]*Math.log(j);}return total;}
 function coord(key,p,scan=true){setup(key,p);base.fill(0);for(let d=0;d<Q;d++)for(let e=0;e<Q;e++){let j=0;for(let q=0;q<Q;q++)if(q!==p)j+=L[d*Q+q]*right[q*Q+e];base[d*Q+e]=j;}
  let best=-Infinity,bestKey=0,truthScore=null,truthRank=0;const scores=scan?new Float64Array(K):null;
  for(let k=0;k<K;k++){const off=k*Q;for(let e=0;e<Q;e++)row[e]=B[p*Q+F[off+e]];let s=0;
   for(let d=0;d<Q;d++){const q=F[off+d],v=pi[p]*B[p*Q+q],z=L[d*Q+p],r=q*Q,b=d*Q;for(let e=0;e<Q;e++){const c=pair[b+e];if(c)s+=c*Math.log(base[b+e]+z*row[e]+v*(q===p?row[e]:right[r+e]));}}
   if(scan)scores[k]=s;if(k===truth[p])truthScore=s;if(s>best){best=s;bestKey=k;}}
  if(scan)truthRank=1+Array.from(scores).filter(x=>x>truthScore+1e-9).length;
  return {bestKey,best,truthScore,truthRank};
 }
 function decode(key){let best=-Infinity,p0=0;for(let s=0;s<Q;s++){let ll=logPi[s],p=s;for(let i=0;i<fit-1;i++){const q=F[key[p]*Q+D[i]];ll+=logB[p*Q+q];p=q;}if(ll>best){best=ll;p0=s;}}
  const plain=[p0];let held=0;for(let i=0;i<D.length;i++){const p=plain[i],q=F[key[p]*Q+D[i]];plain.push(q);if(i>=fit-1)held+=logB[p*Q+q];}
  return {fit:best/fit,held:held/(N-fit),rows:key.filter((k,p)=>k===truth[p]).length,fitAccuracy:plain.slice(0,fit).filter((x,i)=>x===P[i]).length/fit,heldAccuracy:plain.slice(fit).filter((x,i)=>x===P[fit+i]).length/(N-fit)};
 }
 const start=Date.now(),order=Array.from({length:Q},(_,p)=>p).sort((a,b)=>pi[b]-pi[a]),truthLL=ll(truth)/(fit-2);
 const oracle=order.map(p=>({p,pi:pi[p],...coord(truth,p,true)}));
 function optimize(initial){const key=Array.from(initial),trace=[{i:0,ll:ll(key)/(fit-2),...decode(key)}];for(let i=0;i<steps;i++){let changes=0;for(const p of order){const r=coord(key,p,false);if(r.bestKey!==key[p]){key[p]=r.bestKey;changes++;}}trace.push({i:i+1,ll:ll(key)/(fit-2),changes,...decode(key)});if(!changes)break;}return {key,trace};}
 const best=optimize(dev.best.key),final=optimize(dev.final.key);
 return {schema:1,truthLL,truthDecode:decode(truth),oracle,oracleTop1:oracle.filter(x=>x.truthRank===1).length,best,final,elapsedMs:Date.now()-start};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/control/shakespeare_first300k.txt","resources/control/gibran_prophet_58585.txt","im-results/lp2-integrated-affine-row-spacingfree-em-dev-output.json"];
console.log(JSON.stringify(hardFit(JSON.parse(read(paths[0])),read(paths[1]),read(paths[2]),JSON.parse(read(paths[3])),6),null,2));
