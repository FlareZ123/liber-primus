'use strict';
// Exact recency-rank capacity with arbitrary preceding-cipher/state-phase rank labels.
const fs=require('node:fs'),path=require('node:path');
function study(data){
  const check=(x,m)=>{if(!x)throw Error(m)};
  const corpus=JSON.parse(data[0]),pages=corpus.pages.slice(0,56),c=pages.flatMap(p=>p.indices),N=c.length;check(N===12956,"source count");
  const tokens=corpus.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
  function gp(raw){const s=raw.toUpperCase().replaceAll("V","U").replaceAll("K","C");let out=[];for(let i=0;i<s.length;){const x=tokens.find(t=>s.startsWith(t.t,i));if(x){out.push(x.i);i+=x.t.length}else i++}return out}
  const cw=gp(data.slice(1,4).join("\n")),raw=data[4],bk=gp(raw.slice(raw.indexOf("THE ARGUMENT"),raw.indexOf("*** END OF THIS PROJECT GUTENBERG EBOOK")));check(cw.length===21611&&bk.length===18631,"donors");
  const donors=[cw.slice(0,N),cw.slice(4327,4327+N),cw.slice(8655,8655+N),bk.slice(0,N),bk.slice(5675,5675+N)];
  const cuts=[0];for(const p of pages)cuts.push(cuts.at(-1)+p.indices.length);const spans=x=>x.slice(1).map((b,i)=>[x[i],b]);
  const chapters=spans([0,3,8,15,23,28,33,40,54,56].map(i=>cuts[i]));
  function cumulative(h){let s=0;return Array.from(h).sort((a,b)=>b-a).map(v=>s+=v)}
  function lower(d,ss){const h=new Uint32Array(29);for(const [a,b]of ss){const L=[];for(let i=a;i<b;i++){const v=d[i],j=L.indexOf(v);if(j>=0){h[j]++;L.splice(j,1)}L.unshift(v)}}return cumulative(h)}
  // Every rank subset of size k uses at most k emitted symbols in each
  // deterministic context. Grant the first cipher symbol of each interval.
  function upper(x,ss,q){const U=new Uint32Array(29);for(const [a,b]of ss){if(a===b)continue;for(let k=0;k<29;k++)U[k]++;const H=Array.from({length:q*29},()=>new Uint32Array(29));for(let i=a+1;i<b;i++)H[((i-a)%q)*29+x[i-1]][x[i]]++;for(const row of H){const top=cumulative(row);for(let k=0;k<29;k++)U[k]+=top[k]}}return Array.from(U)}
  function perm(seed){const a=Array.from({length:29},(_,i)=>i);let s=seed>>>0;for(let i=28;i>0;i--){s^=s<<13;s^=s>>>17;s^=s<<5;const j=(s>>>0)%(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
  function transform(x,ss,q,inverse,back){const out=new Int16Array(N);for(let si=0;si<ss.length;si++){const [a,b]=ss[si],L=perm(0x7654+si*7897),maps=Array.from({length:q*29},(_,j)=>perm(0x741923+si*91337+j*7859));let prev=11;for(let i=a;i<b;i++){const map=maps[((i-a)%q)*29+prev],rank=inverse?map.indexOf(x[i]):L.indexOf(x[i]),plain=L.splice(rank,1)[0],cipher=inverse?x[i]:map[rank];out[i]=inverse?plain:cipher;prev=cipher;if(back)L.push(plain);else L.unshift(plain)}}return out}
  function run(label,ss){const D=donors.map(d=>lower(d,ss));const rows=[];for(let q=1;q<=31;q++){const U=upper(c,ss,q);let best={gap:-Infinity};for(let j=0;j<29;j++){const y=D.map(x=>x[j]),gap=Math.min(...y)-U[j];if(gap>best.gap)best={k:j+1,gap,upper:U[j],donors:y}}rows.push({q,...best})}
    for(const back of [false,true]){const p=donors[back?4:0],q=7,C=transform(p,ss,q,false,back),dec=transform(C,ss,q,true,back);check(dec.every((v,i)=>v===p[i]),"positive inverse");check(upper(C,ss,q).every((v,i)=>v>=lower(p,ss)[i]),"all top-k bound positive")}
    return {label,excluded:rows.filter(x=>x.gap>0).map(x=>x.q),rows,positive:"both independent secret initial/state-phase permutations PASS"}}
  return {N,regimes:[run("global",[[0,N]]),run("chapter",chapters),run("page",spans(cuts))]};
}
const paths=[
  "resources/liber-primus/lp2-corpus.json",
  "resources/external/2013-book-of-law-I.txt",
  "resources/external/2013-book-of-law-II.txt",
  "resources/external/2013-book-of-law-III.txt",
  "resources/external/cicada2012-blake-marriage-gutenberg45315.txt"
];
console.log(JSON.stringify(study(paths.map(p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8'))),null,2));
