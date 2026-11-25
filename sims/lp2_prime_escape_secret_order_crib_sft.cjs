'use strict';
const fs=require('node:fs');
function solveOrderExperiment(c,n,gs,es,ss){
'use strict';
const check=(x,m)=>{if(!x)throw Error(m)},mod=(x,m)=>(x%m+m)%m,FULL29=(1<<29)-1,FULL28=(1<<28)-1,first=x=>31-Math.clz32(x&-x),pop=x=>{let n=0;while(x){x&=x-1;n++}return n};
const C=c.pages.slice(0,56).flatMap(p=>p.indices);check(C.length===12956,"original length");
const prime=[];for(let x=2;prime.length<=C.length;x++){let ok=true;for(const p of prime){if(p*p>x)break;if(x%p===0){ok=false;break}}if(ok)prime.push(x)}
const log=Array(29).fill(-1),pow=[];let a=1;for(let i=0;i<28;i++){log[a]=i;pow.push(a);a=a*15%29}check(new Set(pow).size===28,"primitive root");
const map=Object.fromEntries(c.translit.map((x,i)=>[x,i]));Object.assign(map,{ING:21,IO:27,V:1,K:5,Q:5,Z:15});const keys=Object.keys(map).sort((a,b)=>b.length-a.length);
function encode(s){let out=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)){w=w.replace(/QU/g,"CW");while(w){let k=keys.find(x=>w.startsWith(x));check(k,"token "+w);out.push(map[k]);w=w.slice(k.length)}}return Uint8Array.from(out)}
const gs0=gs.indexOf("|Almustafa"),gs1=gs.indexOf("*** END OF"),es0=es.indexOf("THERE is one mind"),es1=es.indexOf("*** END OF");check(gs0>=0&&gs1>gs0&&es0>=0&&es1>es0,"body anchors");
const donors=[["Gibran",encode(gs.slice(gs0,gs1))],["Emerson",encode(es.slice(es0,es1))],["Shakespeare",encode(ss)],...n.sections.map((s,i)=>["native"+i,Uint8Array.from(Array.from(s.source_text).map(x=>c.runes.indexOf(x)).filter(x=>x>=0))])];
function trace(A,hold,q,order){let t=0,last=0;const rows=Array.from({length:q*28},()=>[]),steps=[];for(let i=0;i<A.length;i++){let d=mod(A[i]-last,29),k=mod(prime[t]-1,28);last=A[i];if(d){let z=log[d],v=(t%q)*28+(order==="before"?mod(z-k,28):z),s=order==="after"?k:0;rows[v].push([i,s]);steps.push([v,s])}else steps.push(null);if(d||!hold)t++}return {rows,steps}}
function prepare(rows,q){let unequal=[],classes=[],triples=[];for(let v=0;v<rows.length;v++){const r=rows[v],by=Array.from({length:28},()=>[]);for(let i=0;i<r.length;i++){let [p,k]=r[i];by[k].push(p);for(let j=0;j<i;j++){let [p2,k2]=r[j],d=mod(k-k2,28);if(d>1&&d<27)unequal.push(p,p2)}}for(const b of by)if(b.length>=2)classes.push(b);for(const b of by)if(b.length>=3)triples.push(b)}triples.sort((a,b)=>b.length-a.length);
const sameShift=[];for(let ph=0;ph<q;ph++){const groups=Array.from({length:28},()=>[]);for(let v=ph*28;v<(ph+1)*28;v++)for(const [i,k] of rows[v])groups[k].push([i,v]);for(const g of groups)if(g.length>=3)sameShift.push(g)}sameShift.sort((a,b)=>b.length-a.length);return {unequal,triples,classes,sameShift}}
const rot=(m,k)=>((m<<k)|(m>>>(28-k)))&FULL28,rankDomain=(p,k)=>rot((p&FULL28)|(p>>>1),k),posDomain=(r,k)=>{const u=rot(r,(28-k)%28);return u|(u<<1)};
const masks=Array.from({length:28},(_,k)=>Array.from({length:29},(_,p)=>rankDomain(1<<p,k)));
function match(dom){const owner=new Int16Array(dom.length).fill(-1),order=dom.map((d,i)=>i).sort((a,b)=>pop(dom[a])-pop(dom[b]));function aug(i,seen){for(let m=dom[i];m;m&=m-1){const v=first(m);if(seen[v])continue;seen[v]=1;if(owner[v]<0||aug(owner[v],seen)){owner[v]=i;return true}}return false}for(const i of order)if(!aug(i,new Uint8Array(dom.length)))return null;const a=Array(dom.length);for(let j=0;j<a.length;j++)a[owner[j]]=j;return a;}
function encodeFull(P,A,K,E,hold,order){const pos=Array(29);A.forEach((p,i)=>pos[p]=i);let t=0,last=0;const out=[];for(let i=0;i<P.length;i++){const p=pos[P[i]],e=pos[E[i]],k=mod(prime[t]-1,28);if(p!==e){const r=p-Number(p>e),v=order==="after"?mod(r+k,28):r,z=K[t%K.length].indexOf(v);check(z>=0,"key");last=mod(last+pow[order==="before"?mod(z+k,28):z],29);t++}else if(!hold)t++;out.push(last)}return out}
function exact(A,P,at,q,hold,order,tr){
const {rows,steps}=tr,obs=Array.from(P.slice(at,at+A.length)),edges=[],links=new Map(),degree=Array(29).fill(0),rowDegree=Array(rows.length).fill(0);
for(let v=0;v<rows.length;v++){
 const uniq=new Set(rows[v].map(([i,k])=>obs[i]*28+k)),r=[...uniq].map(x=>[Math.floor(x/28),x%28]);for(const [p,k] of r){edges.push([p,v,k]);degree[p]++;rowDegree[v]++}
 for(let i=0;i<r.length;i++)for(let j=0;j<i;j++){
 let [p,k]=r[i],[s,l]=r[j];if(p===s)continue;if(p>s){[p,s]=[s,p];[k,l]=[l,k]}
 let code=p*29+s,b=links.get(code);if(!b){b={p,s,M:Array.from({length:29},(_,j)=>FULL29^(1<<j))};links.set(code,b)}
 for(let x=0;x<29;x++){let d=0;for(let y=0;y<29;y++)if(masks[k][x]&masks[l][y])d|=1<<y;b.M[x]&=d}
 }
}
const pairs=[...links.values()],observed=degree.map((d,i)=>d?i:-1).filter(x=>x>=0);
for(const b of pairs){b.R=Array(29).fill(0);for(let x=0;x<29;x++)for(let m=b.M[x];m;m&=m-1)b.R[first(m)]|=1<<x}
let nodes=0;const LIMIT=200000;
function singles(D,lo,hi){let mask=0;for(let i=lo;i<hi;i++){const d=D[i];if(!d)return -1;if(!(d&(d-1))){if(mask&d)return -1;mask|=d}}let change=0;for(let i=lo;i<hi;i++){const d=D[i];if(d&(d-1)){const e=d&~mask;if(!e)return -1;if(e!==d){D[i]=e;change=1}}}return change}
function propagate(D,R){let changed=true;while(changed){changed=false;for(const [p,v,k] of edges){let r=R[v]&rankDomain(D[p],k);if(!r)return false;if(r!==R[v]){R[v]=r;changed=true}let d=D[p]&posDomain(r,k);if(!d)return false;if(d!==D[p]){D[p]=d;changed=true}}
for(const {p,s,M,R:rev} of pairs){let a=0,b=0;for(let m=D[p];m;m&=m-1)a|=M[first(m)];let x=D[s]&a;if(!x)return false;if(x!==D[s]){D[s]=x;changed=true}for(let m=x;m;m&=m-1)b|=rev[first(m)];let y=D[p]&b;if(!y)return false;if(y!==D[p]){D[p]=y;changed=true}}
let a=singles(D,0,29);if(a<0)return false;if(a)changed=true;for(let ph=0;ph<q;ph++){a=singles(R,ph*28,(ph+1)*28);if(a<0)return false;if(a)changed=true}}
return true}
function dfs(D,R){if(++nodes>LIMIT)throw Error("node budget");if(!propagate(D,R))return null;const positions=match(D);if(!positions)return null;const K=[];for(let ph=0;ph<q;ph++){const m=match(R.slice(ph*28,(ph+1)*28));if(!m)return null;K.push(m)}
let p=-1,best=30;for(const j of observed){const d=pop(D[j]);if(d>1&&(d<best||(d===best&&degree[j]>degree[p]))){p=j;best=d}}if(p<0)return {positions,K};for(let m=D[p];m;m&=m-1){const dd=D.slice();dd[p]=m&-m;const r=dfs(dd,R.slice());if(r)return r}return null}
let witness;try{witness=dfs(Array(29).fill(FULL29),Array(rows.length).fill(FULL28))}catch(e){if(e.message==="node budget")return {status:"unresolved",nodes,pairs:pairs.length};throw e}
if(!witness)return {status:"unsat",nodes,pairs:pairs.length};
const alphabet=Array(29);witness.positions.forEach((p,i)=>alphabet[p]=i);const E=obs.map((p,i)=>{const s=steps[i];if(!s)return p;const [v,k]=s,r=mod(witness.K[Math.floor(v/28)][v%28]-k,28),pos=witness.positions[p];check(pos===r||pos===r+1,"position witness");return alphabet[pos===r?r+1:r]});
const out=encodeFull(obs,alphabet,witness.K,E,hold,order);check(out.every((x,i)=>x===A[i]),"independent exact replay");
return {status:"sat",nodes,pairs:pairs.length,alphabet,positions:witness.positions,key:witness.K,escape:E,plaintext:obs};
}
function scan(A,q,hold,order,ds){const tr=trace(A,hold,q,order),{unequal,triples,classes,sameShift}=prepare(tr.rows,q),N=A.length;let total=0,pass=0,passGraph=0,passShift=0,by=[],fits=[];
const adj=new Int32Array(29),seen=new Int32Array(29),seen2=new Int32Array(29);
for(const [name,P] of ds){let W=Math.max(0,P.length-N+1);if(!W)continue;total+=W;let pp=0,pg=0,ps=0,results=[];
outer:for(let at=0;at<W;at++){for(let j=0;j<unequal.length;j+=2)if(P[at+unequal[j]]===P[at+unequal[j+1]])continue outer;
for(const b of triples){let x=P[at+b[0]],y=-1;for(let j=1;j<b.length;j++){let z=P[at+b[j]];if(z!==x){if(y<0)y=z;else if(z!==y)continue outer}}}
pp++;adj.fill(0);for(const b of classes){const x=P[at+b[0]];let y=-1;for(let j=1;j<b.length;j++){let z=P[at+b[j]];if(z!==x){y=z;break}}if(y>=0){adj[x]|=1<<y;adj[y]|=1<<x;}}
let left=0;for(let i=0;i<29;i++){let a=adj[i];if(a&&(a&(a-1))){let b=a&(a-1);if(b&(b-1))continue outer;}if(a)left|=1<<i}
while(left){let bit=left&-left,front=bit,component=0,ends=0;while(front){let b=front&-front;front^=b;if(component&b)continue;component|=b;let u=first(b),d=adj[u];if(!(d&(d-1)))ends++;front|=d&~component}if(!ends)continue outer;left&=~component}
pg++;for(const g of sameShift){seen.fill(-1);seen2.fill(-1);for(const [i,v] of g){let p=P[at+i];if(seen[p]===-1)seen[p]=v;else if(seen[p]!==v){if(seen2[p]===-1)seen2[p]=v;else if(seen2[p]!==v)continue outer}}}
ps++;const f=exact(A,P,at,q,hold,order,tr);results.push({at,status:f.status,nodes:f.nodes,pairs:f.pairs});if(f.status==="sat")fits.push({name,at,...f});
}pass+=pp;passGraph+=pg;passShift+=ps;by.push({name,W,pass:pp,passGraph:pg,passShift:ps,results})}
return {q,hold,order,N,total,unequal:unequal.length/2,triples:triples.length,classes:classes.length,pass,passGraph,passShift,by,fits}}
let rng=0x12832919;const rnd=()=>{rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;return rng>>>0},perm=n=>{let p=Array.from({length:n},(_,i)=>i);for(let i=n-1;i>0;i--){const j=rnd()%(i+1);[p[i],p[j]]=[p[j],p[i]]}return p};
const plants=[];
for(const [q,hold,order,at] of [[8,false,"before",5500],[13,true,"after",18500],[8,true,"none",25100]]){const P=Array.from(donors[0][1].slice(at,at+308)),A=perm(29),K=Array.from({length:q},()=>perm(28)),E=P.map(()=>rnd()%29),cipher=encodeFull(P,A,K,E,hold,order),res=scan(cipher,q,hold,order,[donors[0]]),f=res.fits.find(x=>x.at===at);check(f,"planted source recovery "+order);plants.push({q,hold,order,at,hiddenAlphabet:A,hiddenKey:K,hiddenEscape:E,cipher,...res})}
const scopes=[[0,55],[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]],results=[];
for(const [lo,hi] of scopes){const A=c.pages.slice(lo,hi+1).flatMap(p=>p.indices);for(const q of [8,13])for(const hold of [false,true])for(const order of ["none","before","after"]){const r=scan(A,q,hold,order,donors);results.push({lo,hi,...r})}}
return {plants,results,donors:donors.map(([name,p])=>({name,N:p.length}))};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt","resources/control/shakespeare_first300k.txt"];
console.log(JSON.stringify(solveOrderExperiment(JSON.parse(fs.readFileSync(paths[0],'utf8')),JSON.parse(fs.readFileSync(paths[1],'utf8')),...paths.slice(2).map(p=>fs.readFileSync(p,'utf8'))),null,2));
