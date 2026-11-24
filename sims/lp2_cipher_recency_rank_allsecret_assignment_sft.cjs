'use strict';
// Ciphertext-driven recency-rank cipher: all-secret phase key assignment bound.
const fs=require('node:fs'),path=require('node:path');
function study(data){
  const check=(x,m)=>{if(!x)throw Error(m)};
  const corpus=JSON.parse(data[0]),c=corpus.pages.slice(0,56).flatMap(p=>p.indices),N=c.length;
  check(N===12956,"source");
  const tokens=corpus.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
  function gp(raw){const s=raw.toUpperCase().replaceAll("V","U").replaceAll("K","C");let out=[];for(let i=0;i<s.length;){const x=tokens.find(t=>s.startsWith(t.t,i));if(x){out.push(x.i);i+=x.t.length}else i++}return out}
  const cw=gp(data.slice(1,4).join("\n")),raw=data[4],bk=gp(raw.slice(raw.indexOf("THE ARGUMENT"),raw.indexOf("*** END OF THIS PROJECT GUTENBERG EBOOK")));
  check(cw.length===21611&&bk.length===18631,"donor counts");
  const donors=[cw.slice(0,N),cw.slice(4327,4327+N),cw.slice(8655,8655+N),bk.slice(0,N),bk.slice(5675,5675+N)];
  function hist(x){const a=new Uint32Array(29);for(const v of x)a[v]++;return a}
  const donorMax=donors.map(x=>Math.max(...hist(x)));
  function ioc(x){return hist(x).reduce((s,v)=>s+v*(v-1),0)/(x.length*(x.length-1))}
  function transform(xs,labels,init,back,inverse){const L=init.slice(),out=[];for(let i=0;i<xs.length;i++){const m=labels[i%labels.length];let cipher,plain;if(inverse){cipher=xs[i];plain=L[m[cipher]]}else{plain=xs[i];cipher=m.indexOf(L.indexOf(plain))}out.push(inverse?plain:cipher);L.splice(L.indexOf(cipher),1);if(back)L.push(cipher);else L.unshift(cipher)}return out}
  function perm(seed){const a=Array.from({length:29},(_,i)=>i);let s=seed>>>0;for(let i=28;i>0;i--){s^=s<<13;s^=s>>>17;s^=s<<5;const j=(s>>>0)%(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
  // Cipher-driven recency list: all seen symbols form a known prefix.
  function makeStates(x){const L=[],states=[];for(const v of x){states.push(L.slice());const j=L.indexOf(v);if(j>=0)L.splice(j,1);L.unshift(v)}return states}
  // Max-weight perfect assignment for 29 cipher symbols -> 29 rank slots.
  // Hungarian algorithm for minimizing negative weights.
  function assignment(weights,offset){const n=29,u=new Int32Array(n+1),v=new Int32Array(n+1),p=new Int32Array(n+1),way=new Int32Array(n+1);for(let i=1;i<=n;i++){p[0]=i;let j0=0;const minv=new Int32Array(n+1);minv.fill(1e9);const used=new Uint8Array(n+1);do{used[j0]=1;const i0=p[j0];let delta=1e9,j1=0;for(let j=1;j<=n;j++)if(!used[j]){const cur=-weights[offset+(i0-1)*n+j-1]-u[i0]-v[j];if(cur<minv[j]){minv[j]=cur;way[j]=j0}if(minv[j]<delta){delta=minv[j];j1=j}}for(let j=0;j<=n;j++)if(used[j]){u[p[j]]+=delta;v[j]-=delta}else minv[j]-=delta;j0=j1}while(p[j0]!==0);do{const j1=way[j0];p[j0]=p[j1];j0=j1}while(j0!==0)}let value=0;for(let j=1;j<=n;j++)value+=weights[offset+(p[j]-1)*n+j-1];return value}
  function bound(x,q){const states=makeStates(x),a=new Uint16Array(q*29*29*29);
    for(let i=0;i<x.length;i++){const L=states[i],base=((i%q)*29*29*29)+x[i]*29;for(let p=0;p<29;p++){const off=base+p*29*29,k=L.indexOf(p);if(k>=0)a[off+k]++;else for(let j=L.length;j<29;j++)a[off+j]++}}
    const values=[];for(let p=0;p<29;p++){let t=0;for(let j=0;j<q;j++)t+=assignment(a,(j*29+p)*29*29);values.push(t)}return {q,max:Math.max(...values),bySymbol:values}}
  const direct=[false,true].map(back=>{const init=Array.from({length:29},(_,i)=>i),p=transform(c,[init],init,back,true);check(transform(p,[init],init,back,false).every((v,i)=>v===c[i]),"direct replay");return{back,ioc:ioc(p),train:ioc(p.slice(0,9640)),holdout:ioc(p.slice(9640,12648)),prefix:p.slice(0,90).map(v=>corpus.translit[v]).join("")}});
  const rows=[];for(let q=1;q<=31;q++){const b=bound(c,q);rows.push({q,max:b.max,excluded:donorMax.filter(v=>v>b.max).length})}
  // Known nontrivial phase maps and initial alphabets: independent positives.
  const positive=[];for(const back of [false,true]){const labels=Array.from({length:13},(_,i)=>perm(0xabc918+i*1957)),init=perm(0x9838bd),p=donors[back?4:0],cipher=transform(p,labels,init,back,false);check(transform(cipher,labels,init,back,true).every((v,i)=>v===p[i]),"secret-key positive");const b=bound(cipher,13);check(b.max>=Math.max(...hist(p)),"bound positive");positive.push({back,actual:Math.max(...hist(p)),bound:b.max})}
  return {N,donorMax,direct,rows,positive};
}
const paths=[
  "resources/liber-primus/lp2-corpus.json",
  "resources/external/2013-book-of-law-I.txt",
  "resources/external/2013-book-of-law-II.txt",
  "resources/external/2013-book-of-law-III.txt",
  "resources/external/cicada2012-blake-marriage-gutenberg45315.txt"
];
console.log(JSON.stringify(study(paths.map(p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8'))),null,2));
