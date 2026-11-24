'use strict';
// Two-coordinate nonlinear translation: certified edge-disjoint triangle relaxation.
const fs=require('node:fs'),path=require('node:path');
function run(corpus,donors){
const check=(c,s)=>{if(!c)throw Error(s)},mod=x=>(x+29)%29;
const orig=corpus.pages.filter(p=>p.page<56).flatMap(p=>p.indices),ch=orig.slice(7960,9640);
check(ch.length===1680,"chapter length");
const sub=Array.from({length:841},(_,i)=>Uint16Array.from({length:841},(_,j)=>mod(Math.floor(i/29)-Math.floor(j/29))*29+mod(i%29-j%29)));
function certify(tape,iv,skipFirst=false){
 let prev=iv;const H=Array.from({length:29},()=>[]);
 for(let i=0;i<tape.length;i+=2){if(!skipFirst||i!==0)H[prev].push([tape[i],tape[i+1]]);prev=tape[i+1]}
 let within=0,onePointCap=0,edgeCap=0;const e=Array.from({length:29},()=>[]);
 for(let a=0;a<29;a++){const h=new Uint16Array(841);for(const [u,v] of H[a])h[u*29+v]++;onePointCap+=Math.max(...h);within+=h.reduce((s,n)=>s+n*(n-1)/2,0);
 for(let b=a+1;b<29;b++){const m=new Uint16Array(841);for(const[u,v]of H[a])for(const[w,z]of H[b])m[mod(w-u)*29+mod(z-v)]++;const sorted=Array.from({length:841},(_,i)=>i).sort((i,j)=>m[j]-m[i]);e[a][b]={m,sorted,max:m[sorted[0]]};edgeCap+=m[sorted[0]]}}
 const tris=[];for(let a=0;a<29;a++)for(let b=a+1;b<29;b++)for(let c=b+1;c<29;c++){const x=e[a][b],y=e[a][c],z=e[b][c];let best=0;for(const i of x.sorted){if(x.m[i]+y.max+z.max<=best)break;for(const j of y.sorted){if(x.m[i]+y.m[j]+z.max<=best)break;best=Math.max(best,x.m[i]+y.m[j]+z.m[sub[j][i]])}}tris.push({a,b,c,loss:x.max+y.max+z.max-best,best})}
 tris.sort((a,b)=>b.loss-a.loss);const used=new Set(),pack=[];let loss=0;for(const t of tris){const {a,b,c}=t,k=[a*29+b,a*29+c,b*29+c];if(k.some(x=>used.has(x)))continue;k.forEach(x=>used.add(x));loss+=t.loss;pack.push(t)}
 return {within,edgeCap,independentBound:within+edgeCap,triangleLoss:loss,triangles:pack.length,upper:within+edgeCap-loss,onePointCap,allIVUpper:skipFirst?within+edgeCap-loss+onePointCap:null};
}
const known=certify(ch,orig[7959]),unknown=certify(ch,0,true);
const tokens=corpus.translit.map((s,i)=>({s,i})).sort((x,y)=>y.s.length-x.s.length);
function gp(t){const out=[];for(const w of t.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").match(/[A-Z]+/g)||[]){for(let i=0;i<w.length;){if(w.startsWith("ING",i)){out.push(21);i+=3}else if(w.startsWith("IO",i)){out.push(27);i+=2}else{const z=tokens.find(z=>w.startsWith(z.s,i));check(z,"unmapped word");out.push(z.i);i+=z.s.length}}}return out}
function Q(p){const h=new Uint16Array(841);for(let i=0;i<p.length;i+=2)h[p[i]*29+p[i+1]]++;return h.reduce((s,n)=>s+n*(n-1)/2,0)}
let seed=0x33012470;const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed};
const table=Array.from({length:29},()=>[rnd()%29,rnd()%29]);
const pi=Array.from({length:841},(_,i)=>i);for(let i=840;i>0;i--){const j=rnd()%(i+1);[pi[i],pi[j]]=[pi[j],pi[i]]}
const inv=Array(841);pi.forEach((v,i)=>inv[v]=i);
const controls=donors.map((t,k)=>{const p=gp(t);let n=0,min=Infinity,max=0,excluded=0,excludedAllIV=0;for(let i=0;i+1680<=p.length;i+=211){const q=Q(p.slice(i,i+1680));n++;min=Math.min(min,q);max=Math.max(max,q);excluded+=q>known.upper;excludedAllIV+=q>unknown.allIVUpper}
const plain=p.slice(0,1680),c=[],rec=[];let prev=17;for(let i=0;i<plain.length;i+=2){const z=pi[29*plain[i]+plain[i+1]],x=(Math.floor(z/29)+table[prev][0])%29,y=(z%29+table[prev][1])%29;c.push(x,y);prev=y}prev=17;for(let i=0;i<c.length;i+=2){const z=inv[29*mod(c[i]-table[prev][0])+mod(c[i+1]-table[prev][1])];rec.push(Math.floor(z/29),z%29);prev=c[i+1]}check(rec.join(",")===plain.join(","),"plant replay");const cert=certify(c,17),certAny=certify(c,0,true);check(Q(plain)<=cert.upper&&Q(plain)<=certAny.allIVUpper,"planted bound violated");return {source:["Gibran","Shakespeare"][k],n,min,max,excluded,excludedAllIV,plant:{Q:Q(plain),cert,certAny,exact:rec.length}}});
return {actualIV:orig[7959],known,unknown,controls};
}
const files=["resources/liber-primus/lp2-corpus.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt"];
const raw=files.map(f=>fs.readFileSync(path.resolve(__dirname,'..',f),'utf8'));
console.log(JSON.stringify(run(JSON.parse(raw[0]),raw.slice(1)),null,2));
