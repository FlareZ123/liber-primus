"use strict";
// GP29 trigram Viterbi beam, exact keyskip1 path relation, maxSkip=3,
// no printed separators. Trace is lossless: reconstruct from skip positions.
function beam(C,K,L,{width=64,hold=512,maxSkip=3,trace=true}={}){
 const n=C.length,B=width*(maxSkip+1)+4,split=n-hold;
 let S=new Float64Array(B),J=new Int32Array(B),A=new Uint8Array(B),D=new Uint8Array(B);
 let T=new Float64Array(B),I=new Int32Array(B),E=new Uint8Array(B),F=new Uint8Array(B);
 const parent=new Uint8Array(B),steps=new Uint8Array(B),stamps=new Int32Array((n*(maxSkip+1)+4)*(maxSkip+1)),slots=new Int32Array(stamps.length);
 const bp=trace?new Uint8Array(n*width):null,sp=trace?new Uint8Array(n*width):null;
 const order=new Int32Array(B);
 const diff=new Uint8Array(K.length),run=new Uint8Array(K.length);
 for(let i=1;i<K.length;i++){diff[i]=(K[i]-K[i-1]+29)%29;run[i]=i>1&&K[i-2]===K[i-1]?Math.min(maxSkip,run[i-1]+1):1}
 let count=1,p=(C[0]+29-K[0])%29;S[0]=L.lp1[p];J[0]=0;A[0]=p;D[0]=p;
 let prefixScore=NaN,prefixSkips=NaN;
 const better=(x,y)=>T[x]>T[y]||(T[x]===T[y]&&(I[x]<I[y]||(I[x]===I[y]&&x<y)));
 for(let i=1;i<n;i++){
  const ci=C[i],delta=(ci-C[i-1]+29)%29;let m=0;
  for(let h=0;h<count;h++){
   const next=J[h]+1,base=i===1?D[h]*29:(A[h]*29+D[h])*29,tab=i===1?L.lp2:L.lp3;
   for(let k=0;k<=maxSkip;k++){
    const j=next+k;if(k&&(diff[j]!==delta||run[j]<k))continue;
    const p=(ci+29-K[j])%29,score=S[h]+tab[base+p],id=j*(maxSkip+1)+k;
    let z;if(stamps[id]===i){z=slots[id];if(score<=T[z])continue}else{z=m++;stamps[id]=i;slots[id]=z}
    T[z]=score;I[z]=j;E[z]=D[h];F[z]=p;parent[z]=h;steps[z]=k;
   }
  }
  for(let k=0;k<m;k++)order[k]=k;
  if(i===split-1||i===n-1){let best=0;for(let k=1;k<m;k++)if(better(k,best))best=k;order[0]=best;count=1;if(i===split-1){prefixScore=T[best];prefixSkips=I[best]-i}}
  else if(m<=width)count=m;
  else{
   // Usually only a few states must be discarded; select the worst repeatedly.
   let live=m;while(live>width){let worst=0;for(let k=1;k<live;k++)if(better(order[worst],order[k]))worst=k;order[worst]=order[--live]}
   count=width;
  }
  for(let h=0;h<count;h++){const z=order[h];S[h]=T[z];J[h]=I[z];A[h]=E[z];D[h]=F[z];if(trace){bp[i*width+h]=parent[z];sp[i*width+h]=steps[z]}}
 }
 const result={score:S[0]/n,skips:J[0]-(n-1),prefixScore:prefixScore/split,prefixSkips,holdScore:(S[0]-prefixScore)/hold};
 if(trace){let h=0;const path=[];for(let i=n-1;i>=1;i--){const k=sp[i*width+h];if(k)path.push([i,k]);h=bp[i*width+h]}path.reverse();result.path=path;
  let j=0,t=0;const P=new Uint8Array(n);for(let i=0;i<n;i++){const k=t<path.length&&path[t][0]===i?path[t++][1]:0;if(i)j+=k+1;const p=(C[i]+29-K[j])%29;for(let q=1;q<=k;q++)if((p+K[j-q])%29!==C[i-1])throw Error("skip relation failed");P[i]=p;}if(j!==J[0])throw Error("path end mismatch");result.plain=Array.from(P);
 }
 return result;
}
module.exports={beam};
