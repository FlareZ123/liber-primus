// Exact aligned-crib recovery for independent GP29 coordinate chart labelings.
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
function run(corpus,texts){
 const N=29,K=5,ALL=(1<<29)-1;
 const tok=[["ING",21],["IO",27],...corpus.translit.map((t,i)=>[t,i])].sort((a,b)=>b[0].length-a[0].length);
 function native(t){const a=[];t=t.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");for(let i=0;i<t.length;){const p=tok.find(([x])=>t.startsWith(x,i));if(p){a.push(p[1]);i+=p[0].length}else i++}return a}
 function rng(seed){return n=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)%n}}
 function shuffle(rnd){let a=Array.from({length:N},(_,i)=>i);for(let i=N-1;i>0;i--){let j=rnd(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
 const r=[0,3,1,4,2],c=[2,0,3,1,4],ri=Array(K),ci=Array(K);r.forEach((x,i)=>ri[x]=i);c.forEach((x,i)=>ci[x]=i);
 const powers=(p)=>{let out=[],a=Array.from({length:K},(_,i)=>i);for(let j=0;j<4;j++){a=a.map(x=>p[x]);out.push(a.slice())}return out};
 const plans=[[powers(r),powers(c)],[powers(ri),powers(ci)]];
 function transform(a,input,output,dir){const b=new Int8Array(a.length),loc=new Int8Array(N);for(let i=0;i<N;i++)loc[input[i]]=i;const [rp,cp]=plans[dir],R=new Int8Array(K),C=new Int8Array(K);let n=0;for(let i=0;i<a.length;i+=K){for(let j=0;j<K;j++){let v=loc[a[i+j]];R[j]=v-v%6;C[j]=v%6}for(let t=0;t<4;t++){let ok=true,rr=rp[t],cc=cp[t];for(let j=0;j<K;j++)if(R[rr[j]]+C[cc[j]]===29){ok=false;break}if(!ok)continue;for(let j=0;j<K;j++)b[i+j]=output[R[rr[j]]+C[cc[j]]];n++;break}}if(n!==a.length/K)throw Error("walk");return b}
 function pop(a){let n=0;while(a){a&=a-1;n++}return n}
 function parity(a,i){return (1<<a[i])^(1<<a[i+1])^(1<<a[i+2])^(1<<a[i+3])^(1<<a[i+4])}
 function parities(a){return Int32Array.from({length:a.length-4},(_,i)=>parity(a,i))}
 function basis(pa,pb,n,offset=0,cap=58){let X=new Int32Array(58),Y=new Int32Array(58),rank=0,blocks=0;for(let i=0;i<n;i+=K){let x=pa[i],y=pb[i+offset];while(x||y){let j=y?29+31-Math.clz32(y):31-Math.clz32(x);if(X[j]||Y[j]){x^=X[j];y^=Y[j]}else{X[j]=x;Y[j]=y;rank++;break}}blocks++;if(rank>=cap)break}return{X,Y,rank,blocks}}
 function kernel(X,Y){const free=[];for(let i=0;i<58;i++)if(!(X[i]||Y[i]))free.push(i);if(free.length>20)throw Error("large kernel");const base=[];for(let f of free){let x=f<29?1<<f:0,y=f>=29?1<<(f-29):0;for(let j=0;j<58;j++)if((X[j]||Y[j])&&((pop(X[j]&x)+pop(Y[j]&y))&1)){if(j<29)x|=1<<j;else y|=1<<(j-29)}base.push([x,y])}let out=[[0,0]];for(let [x,y] of base){let n=out.length;for(let i=0;i<n;i++)out.push([out[i][0]^x,out[i][1]^y])}return out}
 function exactMask([x,y],a,b){for(let i=0;i<a.length;i+=K){let d=0;for(let j=0;j<K;j++){d+=(x>>a[i+j])&1;d-=(y>>b[i+j])&1}if(d!==0)return false}return true}
 function covers(sets,short,full,number){const results=[];for(let s of sets.filter(x=>pop(x[0])===short&&pop(x[1])===short)){const q=sets.filter(x=>pop(x[0])===full&&pop(x[1])===full&&!(x[0]&s[0])&&!(x[1]&s[1]));function rec(x,y,rows){if(rows.length===number-1){if(x===ALL&&y===ALL)results.push([...rows,s]);return}const uncovered=ALL^x,bit=uncovered&-uncovered;for(let v of q)if((v[0]&bit)&&!(v[0]&x)&&!(v[1]&y))rec(x|v[0],y|v[1],[...rows,v])}rec(s[0],s[1],[])}return results}
 function recover(a,b){
  const {X,Y,rank}=basis(parities(a),parities(b),a.length),km=kernel(X,Y),valid=km.filter(v=>pop(v[0])>=4&&pop(v[0])<=6&&pop(v[1])===pop(v[0])&&exactMask(v,a,b)),rows=covers(valid,5,6,5),cols=covers(valid,4,5,6);let charts=0,keys=[];
  for(let rr of rows)for(let cc of cols){let compatible=true;for(let i=0;i<5;i++)for(let j=0;j<6;j++)for(let z=0;z<2;z++)if(pop(rr[i][z]&cc[j][z])!==(i===4&&j===5?0:1))compatible=false;if(!compatible)continue;charts++;let keys2=[[],[]];for(let x of rr)for(let y of cc)for(let z=0;z<2;z++)if(x[z]&y[z])keys2[z].push(31-Math.clz32(x[z]&y[z]));for(let d=0;d<2;d++)if(transform(a,keys2[0],keys2[1],d).every((x,i)=>x===b[i]))keys.push({input:keys2[0],output:keys2[1],d})}
  return{rank,kernelSize:km.length,validMasks:valid.length,rowCovers:rows.length,colCovers:cols.length,charts,keys}
 }
 const donors=texts.map(native),pp=donors.map(parities),src=(a,b,n)=>corpus.pages.slice(a,b+1).flatMap(p=>p.indices).slice(n),o1=src(23,26,16),o2=src(40,53,8);
 if(o1.length!==1005||o2.length!==3000)throw Error("geometry");
 const control=[];for(let [i,off,seed] of [[0,500,4512],[4,2100,1931],[6,2500,5521],[6,8000,1134]]){
  const p=donors[i].slice(off,off+1005),rnd=rng(seed),pkey=shuffle(rnd),ckey=shuffle(rnd),d=seed%2,ct=transform(p,pkey,ckey,1-d),fit=recover(ct.slice(0,600),p.slice(0,600));if(!fit.keys.length)throw Error("true chart not recovered");const held=fit.keys.map(k=>transform(ct.slice(600),k.input,k.output,k.d).reduce((n,x,i)=>n+(x===p[i+600]),0));control.push({donor:i,off,seed,direction:d,fit,held})}
 const scan=[];for(let [name,a] of [["p23",o1],["p40",o2]]){const pa=parities(a);for(let i=0;i<donors.length;i++){const donor=donors[i],n=Math.max(0,donor.length-a.length+1);let pass=[],maxRank=0,totalBlocks=0;for(let j=0;j<n;j++){const q=basis(pa,pp[i],a.length,j,49);totalBlocks+=q.blocks;maxRank=Math.max(maxRank,q.rank);if(q.rank<=48)pass.push({offset:j,rank:q.rank})}scan.push({name,donor:i,length:donor.length,windows:n,maxRank,totalBlocks,survivors:pass})}}
 return {control,scan}
}
console.log(JSON.stringify(run(JSON.parse(files[0]),files.slice(1)),null,2));
