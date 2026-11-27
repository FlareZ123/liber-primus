// Exact aligned-crib recovery for 5x6 GP29 coordinate permutation cyclewalk.
const fs=require("node:fs"),path=require("node:path");
const paths=[
  "resources/liber-primus/lp2-corpus.json",
  "resources/external/2013-book-of-law-I.txt",
  "resources/external/2013-book-of-law-II.txt",
  "resources/external/2013-book-of-law-III.txt",
  "resources/external/cicada2012-blake-marriage-gutenberg45315.txt",
  "resources/external/cicada2014-self-reliance-2014-bookcode-witness.txt",
  "resources/liber-primus/lp1-plaintext-reference.txt",
  "resources/control/gibran_prophet_58585.txt"
];
const files=paths.map(p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8"));
function run(corpus, texts) {
 const N=29,W=6,K=5,ALL=(1<<29)-1;
 const tok=[["ING",21],["IO",27],...corpus.translit.map((t,i)=>[t,i])].sort((a,b)=>b[0].length-a[0].length);
 function native(t){const a=[];t=t.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");for(let i=0;i<t.length;){const p=tok.find(([x])=>t.startsWith(x,i));if(p){a.push(p[1]);i+=p[0].length}else i++}return a}
 function rng(seed){return n=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)%n}}
 function shuffle(rnd){let a=Array.from({length:N},(_,i)=>i);for(let i=N-1;i>0;i--){let j=rnd(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
 const r=[0,3,1,4,2],c=[2,0,3,1,4],ri=Array(K),ci=Array(K);r.forEach((x,i)=>ri[x]=i);c.forEach((x,i)=>ci[x]=i);
 const powers=(p)=>{let out=[],a=Array.from({length:K},(_,i)=>i);for(let j=0;j<4;j++){a=a.map(x=>p[x]);out.push(a.slice())}return out};
 const plans=[[powers(r),powers(c)],[powers(ri),powers(ci)]];
 function transform(a,key,dir,steps=null){const b=new Int8Array(a.length),loc=new Int8Array(N);for(let i=0;i<N;i++)loc[key[i]]=i;const [rp,cp]=plans[dir],R=new Int8Array(K),C=new Int8Array(K);let n=0;for(let i=0;i<a.length;i+=K){for(let j=0;j<K;j++){let v=loc[a[i+j]];R[j]=(v/W)|0;C[j]=v%W}for(let t=0;t<4;t++){let ok=true,rr=rp[t],cc=cp[t];for(let j=0;j<K;j++)if(R[rr[j]]===4&&C[cc[j]]===5){ok=false;break}if(!ok)continue;for(let j=0;j<K;j++)b[i+j]=key[R[rr[j]]*W+C[cc[j]]];if(steps)steps[t]++;n++;break}}if(n!==a.length/K)throw Error("walk");return b}
 function pop(a){let n=0;while(a){a&=a-1;n++}return n}
 const parity=(a,i)=> (1<<a[i])^(1<<a[i+1])^(1<<a[i+2])^(1<<a[i+3])^(1<<a[i+4]);
 function basis(a,b,offset=0,cap=29){let B=new Int32Array(N),rank=0,blocks=0;for(let i=0;i<a.length;i+=K){let x=parity(a,i)^parity(b,i+offset);while(x){let j=31-Math.clz32(x);if(B[j])x^=B[j];else{B[j]=x;rank++;break}}blocks++;if(rank>=cap)break}return{B,rank,blocks}}
 function kernel(B){const free=[];for(let i=0;i<N;i++)if(!B[i])free.push(i);if(free.length>19)throw Error("too many free dims for enumeration");const basis=[];for(let f of free){let x=1<<f;for(let j=0;j<N;j++)if(B[j]&&(pop(B[j]&x)&1))x|=1<<j;basis.push(x)}let out=[0];for(let v of basis){let n=out.length;for(let i=0;i<n;i++)out.push(out[i]^v)}return out}
 function exactMask(mask,a,b){for(let i=0;i<a.length;i+=K){let d=0;for(let j=0;j<K;j++){d+=(mask>>a[i+j])&1;d-=(mask>>b[i+j])&1}if(d!==0)return false}return true}
 function covers(sets,short,full,number){const results=[];for(let s of sets.filter(x=>pop(x)===short)){const q=sets.filter(x=>pop(x)===full&&!(x&s));function rec(used,rows){if(rows.length===number-1){if(used===ALL)results.push([...rows,s]);return}const uncovered=ALL^used,bit=uncovered&-uncovered;for(let v of q)if((v&bit)&&!(v&used))rec(used|v,[...rows,v])}rec(s,[])}return results}
 function recover(a,b){
  const {B,rank}=basis(a,b),km=kernel(B),valid=km.filter(x=>pop(x)>=4&&pop(x)<=6&&exactMask(x,a,b)),rows=covers(valid,5,6,5),cols=covers(valid,4,5,6);let charts=0,keys=[];
  for(let rr of rows)for(let cc of cols){let compatible=true;for(let i=0;i<5;i++)for(let j=0;j<6;j++)if(pop(rr[i]&cc[j])!==(i===4&&j===5?0:1))compatible=false;if(!compatible)continue;charts++;
   // Independent relabelings of complete rows/columns commute with positional coordinate permutations.
   let key=[];for(let x of rr)for(let y of cc)if(x&y)key.push(31-Math.clz32(x&y));
   for(let d=0;d<2;d++)if(transform(a,key,d).every((x,i)=>x===b[i]))keys.push({key,d})
  }
  return{rank,kernelSize:km.length,validMasks:valid.length,rowCovers:rows.length,colCovers:cols.length,charts,keys}
 }
 const src=(a,b,n)=>corpus.pages.slice(a,b+1).flatMap(p=>p.indices).slice(n),o1=src(23,26,16),o2=src(40,53,8);
 if(o1.length!==1005||o2.length!==3000)throw Error("geometry");
 const donors=texts.map(native),board=[];for(let i=0;i<15;i++){board.push(i);if(i<14)board.push(15+i)}
 const fixed=[];for(let d=0;d<2;d++)for(let [name,a] of [["p23",o1],["p40",o2]]){let steps=[0,0,0,0],p=transform(a,board,d,steps);if(transform(p,board,1-d).some((x,i)=>x!==a[i]))throw Error("roundtrip");let h=Array(N).fill(0);for(let x of p)h[x]++;fixed.push({name,d,steps,ioc:h.reduce((s,x)=>s+x*(x-1),0)/(a.length*(a.length-1)),preview:Array.from(p.slice(0,100),x=>corpus.translit[x]).join("")})}
 const control=[];for(let [i,off,seed] of [[0,1000,8741],[4,2000,1930],[6,3000,5151],[6,8000,1133]]){
  const p=donors[i].slice(off,off+1005),key=shuffle(rng(seed)),direction=seed%2,ct=transform(p,key,1-direction),fit=recover(ct.slice(0,300),p.slice(0,300));if(!fit.keys.length)throw Error("true chart not recovered");const held=fit.keys.map(k=>transform(ct.slice(300),k.key,k.d).reduce((n,x,i)=>n+(x===p[i+300]),0));control.push({donor:i,off,seed,direction,fit,held})}
 const scan=[];for(let [name,a] of [["p23",o1],["p40",o2]])for(let i=0;i<donors.length;i++){const donor=donors[i],n=Math.max(0,donor.length-a.length+1);let pass=[],maxRank=0,totalBlocks=0;for(let j=0;j<n;j++){const q=basis(a,donor,j,20);totalBlocks+=q.blocks;maxRank=Math.max(maxRank,q.rank);if(q.rank<=19)pass.push({offset:j,rank:q.rank})}scan.push({name,donor:i,length:donor.length,windows:n,maxRank,totalBlocks,survivors:pass})}
 return {fixed,control,scan}
}
console.log(JSON.stringify(run(JSON.parse(files[0]),files.slice(1)),null,2));
