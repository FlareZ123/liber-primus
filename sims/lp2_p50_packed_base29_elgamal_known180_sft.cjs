'use strict';
const fs=require('node:fs');
const path=require('node:path');
function experiment(C,G){
  const assert=(x,m)=>{if(!x)throw Error(m)}, mod=x=>((x%29)+29)%29;
  const pg=n=>C.pages.find(p=>p.page===n).indices, cipher=pg(56), p57=pg(57);
  assert(pg(55).length===76&&cipher.length===85&&p57.length===95,"terminal lengths");
  const primes=[];for(let n=2;primes.length<84;n++){if(!primes.some(p=>p*p<=n&&n%p===0))primes.push(n)}
  let k=0;const p56=cipher.map((x,i)=>i===56?0:mod(x-primes[k++]+1));
  assert(cipher[56]===0&&k===84,"native F clock");
  k=0;assert(p56.every((x,i)=>cipher[i]===(i===56?0:mod(x+primes[k++]-1))),"native p56 replay");
  const pow=(a,e)=>{let x=1;for(let i=0;i<e;i++)x=x*a%59;return x};
  const H=Array.from({length:29},(_,i)=>pow(5,i));assert(new Set(H).size===29&&pow(5,29)===1,"order29");
  const logs=[Array.from({length:29},(_,i)=>i),Array.from({length:29},(_,i)=>H.indexOf((i+1)**2%59))];
  assert(logs.every(l=>new Set(l).size===29&&l.every(x=>x>=0)),"transport bijection");
  const tokens=G.pages.flatMap(p=>p.tokens);assert(tokens.length===256,"grid size");
  const rowMajor=Array.from({length:256},(_,i)=>i), inside=rowMajor.filter(i=>i>=8&&i<248&&i%8>0&&i%8<7), outside=rowMajor.filter(i=>!inside.includes(i));
  assert(inside.length===180&&outside.length===76,"ring shape");
  const layouts=[["row-major",rowMajor.slice(76),rowMajor.slice(0,76)],["SHED-ring",inside,outside]];
  // exact Gaussian rank and consistency in GF29; returns a particular solution if any.
  function solve(A,Y){
    const n=A[0].length,M=A.map((r,i)=>[...r.map(mod),mod(Y[i])]),piv=[];let rank=0;
    for(let j=0;j<n&&rank<M.length;j++){let t=rank;while(t<M.length&&!M[t][j])t++;if(t===M.length)continue;
      [M[t],M[rank]]=[M[rank],M[t]];let v=1;while(mod(v*M[rank][j])!==1)v++;
      M[rank]=M[rank].map(x=>mod(x*v));
      for(let i=0;i<M.length;i++)if(i!==rank&&M[i][j]){const f=M[i][j];M[i]=M[i].map((x,l)=>mod(x-f*M[rank][l]))}
      piv.push(j);rank++;
    }
    const bad=M.slice(rank).some(r=>r[n]!==0);const solution=Array(n).fill(0);piv.forEach((j,i)=>solution[j]=M[i][n]);
    return {rank,augmentedRank:rank+Number(bad),solution:bad?null:solution};
  }
  const dot=(a,b)=>mod(a.reduce((s,x,i)=>s+x*b[i],0));
  const feature=(i,q,mode)=>{if(mode==="global")return[q,1];const r=Math.floor(i/8),c=i%8;
    const x=Array(80).fill(0);x[r]=q;x[32+c]=q;x[40+r]=1;x[72+c]=1;return x};
  const data=[];
  for(const radix of [59,60]){
    const alphabet=radix===59?G.alphabet.replace("f",""):G.alphabet;
    const bytes=tokens.map(t=>radix*alphabet.indexOf(t[0])+alphabet.indexOf(t[1]));
    assert(bytes.every(x=>x>=0&&x<=255),"physical byte range");
    if(radix===60)assert(bytes.every((x,i)=>x===G.bytes[i]),"canonical base60");
    for(const swapped of [false,true])for(const [transport,L] of logs.entries()){
      const Q=bytes.map(x=>L[swapped?x%29:Math.floor(x/29)]),R=bytes.map(x=>L[swapped?Math.floor(x/29):x%29]);
      for(const [layout,known,unknown] of layouts)for(const [register,P] of [["plain",[...p56,...p57]],["printed",[...cipher,...p57]]]){
        const Y=known.map((i,j)=>mod(R[i]-L[P[j]]));
        const A=known.map(i=>feature(i,Q[i],"global")),S=solve(A.slice(0,85),Y.slice(0,85));
        const hold=S.solution?A.slice(85).filter((x,j)=>dot(x,S.solution)===Y[85+j]).length:null;
        const B=known.map(i=>feature(i,Q[i],"separable")),T=solve(B,Y);
        const direct=Y.filter((y,j)=>y===mod(6*Q[known[j]])).length;
        const directUnknown=unknown.map(i=>L.indexOf(mod(R[i]-6*Q[i])));
        data.push({radix,swapped,transport,layout,register,globalTrain:[S.rank,S.augmentedRank],hold,separable:[T.rank,T.augmentedRank],directMatches:direct,directUnknown:directUnknown.map(x=>C.translit[x]).join(" ")});
      }
    }
  }
  // Valid byte-shaped positive, same row-major or ring known positions, no guessing concealed GP runes.
  const controls=[];
  for(const [layout,known,unknown] of layouts)for(const [transport,L] of logs.entries()) {
    const P=Array(256);known.forEach((i,j)=>P[i]=[...p56,...p57][j]);unknown.forEach((i,j)=>P[i]=p57[j]);
    const key=[6,17],Q=[],R=[],bytes=[];
    for(let i=0;i<256;i++){const nonce=1+i%7;Q[i]=L[nonce];R[i]=mod(L[P[i]]+dot([Q[i],1],key));bytes[i]=29*nonce+L.indexOf(R[i]);}
    assert(bytes.every(x=>x>=0&&x<256),"positive physical bytes");
    const Y=known.map(i=>mod(R[i]-L[P[i]])),A=known.map(i=>[Q[i],1]),S=solve(A.slice(0,85),Y.slice(0,85));
    assert(S.solution&&S.solution.every((x,i)=>x===key[i]),"positive key");
    const decoded=bytes.map((x,i)=>L.indexOf(mod(L[x%29]-dot([L[Math.floor(x/29)],1],S.solution))));
    assert(decoded.every((x,i)=>x===P[i]),"positive full inverse");
    const T=solve(known.map(i=>feature(i,Q[i],"separable")),Y);assert(T.solution,"positive broad family");
    // A second byte-shaped plant exercises independent row/column secrets rather than only a global subset.
    const Y2=known.map(i=>mod(Q[i]*(Math.floor(i/8)*3+i%8*5+1)+Math.floor(i/8)*7+i%8*11+9));
    const B=known.map(i=>feature(i,Q[i],"separable")),T2=solve(B,Y2);assert(T2.solution&&B.every((x,j)=>dot(x,T2.solution)===Y2[j]),"positive varying row and column state");
    const bytes2=Array.from({length:256},(_,i)=>{const nonce=1+i%7;const mask=mod(Q[i]*(Math.floor(i/8)*3+i%8*5+1)+Math.floor(i/8)*7+i%8*11+9);return 29*nonce+L.indexOf(mod(L[P[i]]+mask))});
    assert(bytes2.every(x=>x>=0&&x<256),"varying-state positive physical bytes");
    assert(known.every((i,j)=>L[bytes2[i]%29]===mod(L[P[i]]+dot(B[j],T2.solution))),"varying-state known replay");
    controls.push({layout,transport,key:S.solution,withheldKnown:95,unknownRecovered:76,separableRank:T2.rank});
  }
  return {p56:p56.map(x=>C.translit[x]).join(" "),sourceFamilies:data.length,globalInconsistent:data.filter(x=>x.globalTrain[1]>x.globalTrain[0]).length,separableInconsistent:data.filter(x=>x.separable[1]>x.separable[0]).length,controls,data};
}
const root=path.join(__dirname,'..','resources','liber-primus');
console.log(JSON.stringify(experiment(JSON.parse(fs.readFileSync(path.join(root,'lp2-corpus.json'),'utf8')),JSON.parse(fs.readFileSync(path.join(root,'lp2-grid-256.json'),'utf8'))),null,2));
