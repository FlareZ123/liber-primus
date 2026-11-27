'use strict';
// Exact 14-column arbitrary-pair receiver. Run from repository with node sims/lp2_digraph_column14_pairing_sft.cjs
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const paths=["resources/liber-primus/lp2-corpus.json","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt","resources/control/shakespeare_first300k.txt"];
const inputs=paths.map(p=>{const b=fs.readFileSync(path.join(__dirname,'..',p));return {path:p,sha:crypto.createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex'),content:b.toString('utf8')}});
function experiment(inputs){
 const d=JSON.parse(inputs[0].content), A=29,W=14,B=841,full=(1<<W)-1;
 const assert=(x,m)=>{if(!x)throw Error(m)};
 const tokens=d.translit.map((s,i)=>[s,i]).sort((a,b)=>b[0].length-a[0].length);
 function encode(s){const out=[];for(const w of s.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").match(/[A-Z]+/g)||[]){for(let i=0;i<w.length;){const [t,j]=w.startsWith("ING",i)?["ING",21]:w.startsWith("IO",i)?["IO",27]:tokens.find(([t])=>w.startsWith(t,i));out.push(j);i+=t.length}}return out}
 const donors=inputs.slice(1).map(x=>({name:x.path,a:encode(x.content)}));
 const starts=[0,3,8,15,23,27,33,40,54,56],chapters=starts.slice(0,-1).map((p,i)=>d.pages.slice(p,starts[i+1]).flatMap(x=>x.indices));
 assert(chapters.map(a=>a.length).join(",")==="729,1145,1729,1903,1021,1433,1680,3008,308","original lengths");
 const rev=Array.from({length:B},(_,i)=>A*(i%A)+Math.floor(i/A));
 const edges=[], id=Array.from({length:W},()=>Array(W).fill(-1));
 for(let a=0;a<W;a++)for(let b=a+1;b<W;b++){id[a][b]=id[b][a]=edges.length;edges.push([a,b])}
 function counts(a){const h=new Int32Array(B);let c=0;for(let i=0;i+1<a.length;i+=2){const v=A*a[i]+a[i+1];c+=2*h[v]++}return c}
 function floor(a,n){
  let min=Infinity,at=-1,windows=0;
  for(let p=0;p<2;p++){if(p+n>a.length)continue;const h=new Int32Array(B);let c=0;
   for(let i=p;i<p+n;i+=2){let v=A*a[i]+a[i+1];c+=2*h[v]++}
   for(let i=p;i+n<=a.length;i+=2){windows++;if(c<min){min=c;at=i}if(i+n+2>a.length)break;let v=A*a[i]+a[i+1],q=A*a[i+n]+a[i+n+1];c-=2*--h[v];c+=2*h[q]++}
  }
  assert(windows===a.length-n+1,"all windows");return {min,at,windows};
 }
 function infer(a,layout){
  const R=Math.floor(a.length/W), n=R*W, col=Array.from({length:W},(_,j)=>Array.from({length:R},(_,i)=>a[layout==="row"?i*W+j:j*R+i]));
  const h=edges.map(([x,y])=>{let h=new Int32Array(B);for(let r=0;r<R;r++)h[A*col[x][r]+col[y][r]]++;return h});
  const self=h.map(t=>t.reduce((s,v)=>s+v*(v-1),0)),M=edges.length;
  const same=Array.from({length:M},()=>new Int32Array(M)),opp=Array.from({length:M},()=>new Int32Array(M));
  for(let i=0;i<M;i++)for(let j=i+1;j<M;j++){const [a,b]=edges[i],[c,e]=edges[j];if(a===c||a===e||b===c||b===e)continue;let s=0,o=0;for(let v=0;v<B;v++)if(h[i][v]){s+=h[i][v]*h[j][v];o+=h[i][v]*h[j][rev[v]]}same[i][j]=same[j][i]=2*s;opp[i][j]=opp[j][i]=2*o}
  let best=-1,upper=-1,selected=[],maskBest=0,matchings=0,exactOrientationChecks=0,ties=0;const path=[];
  function walk(remaining,ub){
   if(!remaining){matchings++;if(ub>upper)upper=ub;if(ub<best)return;
    // Global orientation reversal is invariant. Fix first pair orientation.
    for(let bits=0;bits<64;bits++){const mask=bits<<1;let score=0;for(let i=0;i<7;i++){score+=self[path[i]];for(let j=0;j<i;j++){const t=((mask>>i)^(mask>>j))&1;score+=(t?opp:same)[path[i]][path[j]]}}exactOrientationChecks++;if(score>best){best=score;selected=path.slice();maskBest=mask;ties=1}else if(score===best)ties++}
    return
   }
   const x=31-Math.clz32(remaining&-remaining);let rem=remaining^(1<<x);
   for(let z=rem;z;z&=z-1){const y=31-Math.clz32(z&-z),e=id[x][y];let add=self[e];for(const f of path)add+=Math.max(same[e][f],opp[e][f]);path.push(e);walk(rem^(1<<y),ub+add);path.pop()}
  }
  walk(full,0);assert(matchings===135135,"all perfect matchings");
  const pairs=selected.map((e,i)=>((maskBest>>i)&1)?edges[e].slice().reverse():edges[e].slice());
  const tape=[];for(let r=0;r<R;r++)for(const [x,y] of pairs)tape.push(col[x][r],col[y][r]);
  assert(counts(tape)===best,"witness replay");
  return {n,rows:R,tail:a.length-n,layout,exactMax:best,relaxedMax:upper,matchings,exactOrientationChecks,tiesModuloGlobalReverse:ties,pairs};
 }
 const originals=chapters.map((a,i)=>{const n=Math.floor(a.length/W)*W;const refs=donors.map(x=>({name:x.name,...floor(x.a,n)}));return {pages:[starts[i],starts[i+1]-1],length:a.length,refs,nativeFloor:Math.min(...refs.map(x=>x.min)),fits:["row","column"].map(layout=>infer(a,layout))}});
 function plant(a,seed,layout){
  let x=seed>>>0;function next(){x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0}
  function perm(n){const p=Array.from({length:n},(_,i)=>i);for(let i=n-1;i>0;i--){const j=next()%(i+1);[p[i],p[j]]=[p[j],p[i]]}return p}
  const n=2996,R=n/W,P=a.slice(123,123+n),pi=perm(B),inv=Array(B);pi.forEach((v,i)=>inv[v]=i);
  const q=perm(W),C=[];for(let r=0;r<R;r++){const row=[];for(let j=0;j<W;j+=2){let z=pi[A*P[r*W+j]+P[r*W+j+1]];row.push(Math.floor(z/A),z%A)}for(let j=0;j<W;j++)C[layout==="row"?r*W+j:j*R+r]=row[q[j]]}
  const truth=counts(P),fit=infer(C,layout);
  const map=new Map(q.map((v,i)=>[v,i]));const correct=[];for(let r=0;r<R;r++)for(let j=0;j<W;j+=2){let u=map.get(j),v=map.get(j+1);const p=inv[A*C[layout==="row"?r*W+u:u*R+r]+C[layout==="row"?r*W+v:v*R+r]];correct.push(Math.floor(p/A),p%A)}
  assert(correct.every((v,i)=>v===P[i])&&fit.exactMax>=truth,"plant invert and exact maximum");
  const canon=pairs=>pairs.map(([u,v])=>[Math.min(u,v),Math.max(u,v)].join(",")).sort().join(";");
  const truePairs=Array.from({length:7},(_,i)=>[map.get(2*i),map.get(2*i+1)]);
  const recovered=canon(truePairs)===canon(fit.pairs);
  const oriented=(pairs)=>pairs.map(([u,v])=>`${u},${v}`).sort().join(";");
  return {seed,layout,truth,fit,recoveredUnorderedPairing:recovered,recoveredOrientedPairingUpToGlobalReverse:oriented(truePairs)===oriented(fit.pairs)||oriented(truePairs.map(p=>p.slice().reverse()))===oriented(fit.pairs),knownFullKeyRecoveredRunes:correct.length};
 }
 const plants=[plant(donors[0].a,0x14002901,"column"),plant(donors[1].a,0x14002902,"row")];
 return {inputs:inputs.map(({path,sha})=>({path,sha})),width:W,originals,plants};
}
console.log(JSON.stringify(experiment(inputs),null,2));
