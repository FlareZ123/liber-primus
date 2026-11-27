'use strict';
const fs=require('node:fs');const path=require('node:path');
function experiment(grid,corpus){
 const q=29,mod=x=>(x%q+q)%q, inv=Array(q).fill(0);for(let i=1;i<q;i++)for(let j=1;j<q;j++)if(i*j%q===1)inv[i]=j;
 function rref(a,n){const m=a.map(r=>Int32Array.from(r,mod)),piv=[];let r=0;for(let j=0;j<n&&r<m.length;j++){let i=r;while(i<m.length&&m[i][j]===0)i++;if(i===m.length)continue;[m[r],m[i]]=[m[i],m[r]];const z=inv[m[r][j]];for(let k=j;k<n;k++)m[r][k]=m[r][k]*z%q;for(i=0;i<m.length;i++)if(i!==r&&m[i][j]){let f=m[i][j];for(let k=j;k<n;k++)m[i][k]=mod(m[i][k]-f*m[r][k])}piv.push(j);r++;}return {m,piv,rank:r}}
 function nullBasis(rows,n){const {m,piv,rank}=rref(rows,n),s=new Set(piv),free=Array.from({length:n},(_,i)=>i).filter(i=>!s.has(i));return {rank,basis:free.map(j=>{const v=Array(n).fill(0);v[j]=1;piv.forEach((p,i)=>v[p]=mod(-m[i][j]));return v})}}
 const tok=grid.pages.flatMap(p=>p.tokens),alpha=grid.alphabet,inner=Array.from({length:30},(_,i)=>Array.from({length:6},(_,j)=>(i+1)*8+j+1)).flat(),rim=[];for(let c=0;c<8;c++)rim.push(c);for(let r=1;r<32;r++)rim.push(r*8+7);for(let c=6;c>=0;c--)rim.push(31*8+c);for(let r=30;r>=1;r--)rim.push(r*8);
 if(inner.length!==180||rim.length!==76||new Set([...inner,...rim]).size!==256)throw Error("geometry");
 const p56=corpus.pages.find(x=>x.page===56).indices, p57=corpus.pages.find(x=>x.page===57).indices,pr=[];for(let p=2;pr.length<85;p++){let ok=true;for(let d=2;d*d<=p;d++)if(p%d===0){ok=false;break}if(ok)pr.push(p)}
 let cursor=0;const solved=p56.map((c,i)=>i===56?0:mod(c-pr[cursor++]+1));if(cursor!==84||solved.slice(0,5).join()!=="24,9,18,9,23"||p56[56]!==0)throw Error("known p56");
 function features(digits,ix,rich){const r=ix>>3,c=ix&7,arr=[];for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++)arr.push(digits.values[((r+dr+32)%32)*8+(c+dc+8)%8]%q);const f=[1,...arr];for(let i=0;i<9;i++)for(let j=i;j<9;j++)f.push(arr[i]*arr[j]%q);if(rich){const [h,l]=tok[ix];for(let i=0;i<5;i++)f.push(Number(+h===i));for(const x of digits.alphabet)f.push(Number(l===x))}return f}
 function fit(X,Y){const d=X[0].length,n=d+q,A=X.map((x,i)=>{const row=[...x,...Array(q).fill(0)];row[d+Y[i]]=28;return row}),{rank,basis}=nullBasis(A,n),obs=[...new Set(Y)].sort((a,b)=>a-b),projection=basis.map(v=>v.slice(d)),projRank=rref(projection,q).rank,groups=new Map();for(const x of obs){const k=projection.map(v=>v[x]).join(",");if(!groups.has(k))groups.set(k,[]);groups.get(k).push(x)}const forcedEqual=[...groups.values()].filter(v=>v.length>1);return {d,n,rank,nullity:basis.length,projRank,obs,forcedEqual,basis}}
 const cases=[];
 for(const radix of [60,59]){const alphabet=radix===60?alpha:alpha.replace("f",""),digits={alphabet,values:tok.map(t=>radix*alphabet.indexOf(t[0])+alphabet.indexOf(t[1]))};if(digits.values.some(x=>x<0||x>255))throw Error("source codec");
  for(const reflect of [false,true]){const positions=inner.map(i=>reflect?(i&~7)+(7-(i&7)):i);
   for(const [target,Y] of [["solved",solved.concat(p57)],["printed",p56.concat(p57)]])for(const rich of [false,true]){const X=positions.map(i=>features(digits,i,rich));const z=fit(X,Y);cases.push({radix,reflect,target,rich,features:z.d,rank:z.rank,nullity:z.nullity,alphabetProjectionRank:z.projRank,observed:z.obs,forcedEqual:z.forcedEqual});}
  }
 }
 // The original table serves as the unchanged input for a hidden synthetic decoder;
 // fit using only interior outputs, predict all withheld rim labels (periodic boundary).
 let rng=0x47ad11;const rand=n=>{rng=(Math.imul(rng,1664525)+1013904223)>>>0;return rng%n};
 const digits={alphabet:alpha,values:grid.bytes},controls=[];
 for(const rich of [false,true])for(let t=0;t<4;t++){
  const Xall=Array.from({length:256},(_,i)=>features(digits,i,rich)),d=Xall[0].length,w=Array.from({length:d},()=>rand(q)),s=Array.from({length:q},(_,i)=>i);for(let i=q-1;i>0;i--){const j=rand(i+1);[s[i],s[j]]=[s[j],s[i]]}const si=[];s.forEach((x,i)=>si[x]=i);
  const y=Xall.map(x=>si[mod(x.reduce((a,v,i)=>a+v*w[i],0))]),X=inner.map(i=>Xall[i]),Y=inner.map(i=>y[i]),f=fit(X,Y);
  if(f.forcedEqual.length)throw Error("true decoder excluded");
  // A predicted output label is uniquely identified if every null-space solution
  // makes the feature evaluation equal to that label's variable.
  const predicted=rim.map(i=>{const v=Xall[i];let out=[];for(let a=0;a<q;a++)if(f.basis.every(b=>mod(v.reduce((s,x,j)=>s+x*b[j],0)-b[d+a])===0))out.push(a);return out});
  if(predicted.some((p,i)=>p.length&&!p.includes(y[rim[i]])))throw Error("wrong forced prediction");
  controls.push({rich,t,rank:f.rank,nullity:f.nullity,obs:f.obs.length,alphabetProjectionRank:f.projRank,uniqueRim:predicted.filter(p=>p.length===1).length,correct:predicted.filter((p,i)=>p.length===1&&p[0]===y[rim[i]]).length});
 }
 return {runeCount:solved.length+p57.length,knownP56:solved,geometry:{inner:inner.length,rim:rim.length},cases,controls};
}
if(require.main===module){const read=p=>JSON.parse(fs.readFileSync(path.join(__dirname,'..','resources','liber-primus',p),'utf8'));console.log(JSON.stringify(experiment(read('lp2-grid-256.json'),read('lp2-corpus.json')),null,2));}
module.exports={experiment};
