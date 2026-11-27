'use strict';
const fs=require('node:fs');
function run(data){
const [corpus,native]=data.slice(0,2).map(JSON.parse);
const target=corpus.pages.filter(p=>p.page>=15&&p.page<=22).flatMap(p=>p.indices.slice(p.page===15?20:0)),cut=1752,N=target.length;
const mod=(x,m=28)=>((x%m)+m)%m;
const pow=[1],log=Array(29).fill(-1);for(let i=1;i<28;i++)pow.push(pow[i-1]*2%29);pow.forEach((p,i)=>log[p]=i);if(new Set(pow).size!==28)throw Error("generator");
const logs=Array.from({length:29},(_,r)=>Array.from({length:29},(_,p)=>log[mod(p-r,29)]));
const fib=[1,2];while(fib.at(-1)+fib.at(-2)<N)fib.push(fib.at(-1)+fib.at(-2));
const masks=Array.from({length:N},(_,i)=>{let b=0;for(let k=fib.length-1;k>=0;k--)if(i>=fib[k]){i-=fib[k];b|=1<<k;}return b;});
const primes=[];for(let x=2;primes.length<=fib.at(-1);x++)if(primes.every(p=>p*p>x||x%p))primes.push(x);
const vals=[0,...fib].map(j=>Math.abs(3301-primes[j])%29);
const source=[log[vals[0]],...vals.slice(1).map(v=>mod(log[v]-log[vals[0]]))];
const runeMap=new Map(corpus.runes.map((r,i)=>[r,i]));const labels=corpus.translit.map((s,i)=>[s.toUpperCase(),i]).sort((a,b)=>b[0].length-a[0].length);
function encode(s){let arr=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replaceAll("QU","CW").replaceAll("V","U").replace(/[KQ]/g,"C").replaceAll("Z","S");while(w.length){let f=w.startsWith("ING")?["ING",21]:w.startsWith("IO")?["IO",27]:labels.find(([l])=>w.startsWith(l));if(!f){w=w.slice(1);continue;}arr.push(f[1]);w=w.slice(f[0].length);}}return arr;}
const refs=[...native.sections.map(s=>Array.from(s.source_text).filter(r=>runeMap.has(r)).map(r=>runeMap.get(r))),encode(data[2]),encode(data[3])],em=encode(data[4]);
const u=new Float64Array(29).fill(.5),b=new Float64Array(841),t=new Float64Array(24389);for(const a of refs)for(let i=0;i<a.length;i++){u[a[i]]++;if(i>0)b[a[i-1]*29+a[i]]++;if(i>1)t[(a[i-2]*29+a[i-1])*29+a[i]]++;}
const us=u.reduce((x,y)=>x+y),bu=new Float64Array(29),tu=new Float64Array(841);b.forEach((v,i)=>bu[Math.floor(i/29)]+=v);t.forEach((v,i)=>tu[Math.floor(i/29)]+=v);
const sc1=u.map(v=>Math.log(29*v/us)),sc2=b.map((v,i)=>Math.log(29*(v+10*u[i%29]/us)/(bu[Math.floor(i/29)]+10))),sc3=t.map((v,i)=>Math.log(29*(v+10*Math.exp(sc2[i%841])/29)/(tu[Math.floor(i/29)]+10)));
function term(a,i){return i===0?sc1[a[i]]:i===1?sc2[a[0]*29+a[1]]:sc3[(a[i-2]*29+a[i-1])*29+a[i]];}
function score(a,s,e){let z=0;for(let i=s;i<e;i++)z+=term(a,i);return z/(e-s);}
function ks(key){return masks.map(m=>{let v=key[0];for(let k=0;k<fib.length;k++)if(m&(1<<k))v+=key[k+1];return mod(v);});}
function apply(a,key,r,q,sign){const k=ks(key),from=sign===1?r:q,to=sign===1?q:r,L=logs[from];return a.map((p,i)=>p===from?to:mod(to+pow[mod(L[p]+sign*k[i])],29));}
let state=0x932cc1aa;function rnd(n){state=(Math.imul(state,1664525)+1013904223)>>>0;return Math.floor(state/4294967296*n);}
const diff=Array.from({length:29},()=>Array.from({length:fib.length},()=>new Float64Array(28).fill(.5)));
for(const raw of refs)for(let k=0;k<fib.length;k++){const lag=fib[k];for(let i=0;i+lag<raw.length;i++){const x=raw[i],y=raw[i+lag];for(let r=0;r<29;r++)if(x!==r&&y!==r)diff[r][k][mod(logs[r][y]-logs[r][x])]++;}}
const dl=diff.map(z=>z.map(a=>{const s=a.reduce((x,y)=>x+y);return a.map(v=>Math.log(28*v/s));}));
const pairIndices=fib.map((f,k)=>Array.from({length:cut-f},(_,j)=>j).filter(j=>(masks[j]^masks[j+f])===(1<<k)&&!(masks[j]&(1<<k))));
const shift=Array.from({length:29},(_,r)=>Array.from({length:28},(_,d)=>Array.from({length:29},(_,p)=>p===r?r:mod(r+pow[mod(logs[r][p]-d)],29))));
function fit(c){
const qhist=Array.from({length:29},(_,q)=>pairIndices.map((inds,k)=>{const h=new Float64Array(28);for(const j of inds){let x=c[j],y=c[j+fib[k]];if(x!==q&&y!==q)h[mod(logs[q][y]-logs[q][x])]++;}return h;}));
const count=new Uint16Array(29);for(let i=0;i<cut;i++)count[c[i]]++;
const cand=[];
for(let r=0;r<29;r++)for(let q=0;q<29;q++){
let rank=[],s=0;const prob=u[r]/us,p=count[q]/cut;
let marker=count[q]*Math.log(prob)+(cut-count[q])*Math.log1p(-prob);
if(p>0&&p<1)marker-=count[q]*Math.log(p)+(cut-count[q])*Math.log1p(-p);
for(let k=0;k<fib.length;k++){const h=qhist[q][k],d=dl[r][k];const a=Array.from({length:28},(_,x)=>{let z=0;for(let j=0;j<28;j++)z+=h[j]*d[mod(j-x)];return [x,z];}).sort((x,y)=>y[1]-x[1]);s+=a[0][1];rank.push(a.map(x=>x[0]));}
cand.push({r,q,rank,pairScore:s,marker,rankScore:s+marker});
}
cand.sort((a,b)=>b.rankScore-a.rankScore);
const final=[];
for(const {r,q,rank,pairScore,marker,rankScore} of cand.slice(0,8)){
const flags=Array.from({length:source.length},(_,k)=>Array.from({length:cut},(_,i)=>i).filter(i=>c[i]!==q&&(k===0||(masks[i]&(1<<(k-1))))));
const affected=flags.map(a=>{const set=new Set();for(const i of a)for(let j=i;j<Math.min(cut,i+3);j++)set.add(j);return [...set];});
let best=null;const guesses=[source.slice(),[0,...rank.map(a=>a[0])],...Array.from({length:2},()=>[rnd(28),...rank.map(a=>a[rnd(3)])])];
for(const g of guesses){let key=g.slice(),p=apply(c.slice(0,cut),key,r,q,-1);
for(let sweep=0;sweep<10;sweep++){let changes=0;for(let k=0;k<key.length;k++){const f=flags[k],a=affected[k];let v=0;for(const i of a)v+=term(p,i);let top=v,delta=0;const prev=f.map(i=>p[i]);for(let d=1;d<28;d++){const sh=shift[r][d];for(let j=0;j<f.length;j++)p[f[j]]=sh[prev[j]];let z=0;for(const i of a)z+=term(p,i);if(z>top+1e-8){top=z;delta=d;}}const sh=shift[r][delta];for(let j=0;j<f.length;j++)p[f[j]]=sh[prev[j]];if(delta){key[k]=mod(key[k]+delta);changes++;}}if(!changes)break;}
const s=score(p,0,cut);if(!best||s>best.fit)best={key,fit:s};}
const decoded=apply(c,best.key,r,q,-1);final.push({r,q,...best,held:score(decoded,cut,N),decoded,pairScore,marker,rankScore});}
final.sort((a,b)=>b.fit-a.fit);return {candidateRanks:cand.map(({r,q,pairScore,marker,rankScore})=>({r,q,pairScore,marker,rankScore})),final};
}
const result={fib,source,N,cut,sourcePivot:mod(3301,29),controls:[]};
for(let j=0;j<3;j++){
const p=em.slice(30000+j*N,30000+(j+1)*N);if(p.length!==N)throw Error("donor");const r=[4,24,17][j],q=[18,5,9][j],key=source.map(()=>rnd(28));const c=apply(p,key,r,q,1);const f=fit(c),w=f.final[0];
if(apply(w.decoded,w.key,w.r,w.q,1).some((x,i)=>x!==c[i]))throw Error("replay");
result.controls.push({r,q,key,trueRank:f.candidateRanks.findIndex(a=>a.r===r&&a.q===q)+1,winner:{r:w.r,q:w.q,key:w.key,fit:w.fit,held:w.held},fitCorrect:p.slice(0,cut).filter((x,i)=>x===w.decoded[i]).length,heldCorrect:p.slice(cut).filter((x,i)=>x===w.decoded[i+cut]).length});
}
if(result.controls.every(x=>x.heldCorrect>=.98*(N-cut))){
const f=fit(target),w=f.final[0];if(apply(w.decoded,w.key,w.r,w.q,1).some((x,i)=>x!==target[i]))throw Error("original replay");
const r=mod(3301,29),p=apply(target,source,r,r,-1);
result.original={...f,fixedSourcePivot:{r,fit:score(p,0,cut),held:score(p,cut,N),decoded:p}};
}else result.original=null;
return result;
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];
console.log(JSON.stringify(run(paths.map(p=>fs.readFileSync(p,'utf8'))),null,2));
