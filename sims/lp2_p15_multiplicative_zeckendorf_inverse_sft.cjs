'use strict';
const fs=require('node:fs');
function run(data){
const [corpus,native]=data.slice(0,2).map(JSON.parse);const target=corpus.pages.filter(p=>p.page>=15&&p.page<=22).flatMap(p=>p.indices.slice(p.page===15?20:0));const cut=1752;
const mod=(x,m=28)=>((x%m)+m)%m;
const pow=[1],log=Array(29).fill(-1);for(let i=1;i<28;i++)pow.push(pow[i-1]*2%29);pow.forEach((p,i)=>log[p]=i);if(new Set(pow).size!==28)throw Error("generator");
const fib=[1,2];while(fib.at(-1)+fib.at(-2)<target.length)fib.push(fib.at(-1)+fib.at(-2));
const masks=Array.from({length:target.length},(_,i)=>{let b=0;for(let k=fib.length-1;k>=0;k--)if(i>=fib[k]){i-=fib[k];b|=1<<k;}return b;});
const primes=[];for(let x=2;primes.length<=fib.at(-1);x++)if(primes.every(p=>p*p>x||x%p))primes.push(x);
const vals=[0,...fib].map(j=>Math.abs(3301-primes[j])%29);if(vals.includes(0))throw Error("zero source sample");
const source=[log[vals[0]],...vals.slice(1).map(v=>mod(log[v]-log[vals[0]]))];
const runeMap=new Map(corpus.runes.map((r,i)=>[r,i]));const labels=corpus.translit.map((s,i)=>[s.toUpperCase(),i]).sort((a,b)=>b[0].length-a[0].length);
function encode(s){let arr=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replaceAll("QU","CW").replaceAll("V","U").replace(/[KQ]/g,"C").replaceAll("Z","S");while(w.length){let f=w.startsWith("ING")?["ING",21]:w.startsWith("IO")?["IO",27]:labels.find(([l])=>w.startsWith(l));if(!f){w=w.slice(1);continue;}arr.push(f[1]);w=w.slice(f[0].length);}}return arr;}
const refs=[...native.sections.map(s=>Array.from(s.source_text).filter(r=>runeMap.has(r)).map(r=>runeMap.get(r))),encode(data[2]),encode(data[3])];const em=encode(data[4]);
const u=Array(29).fill(.5),b=Array(841).fill(0),t=Array(24389).fill(0);for(const a of refs)for(let i=0;i<a.length;i++){u[a[i]]++;if(i>0)b[a[i-1]*29+a[i]]++;if(i>1)t[(a[i-2]*29+a[i-1])*29+a[i]]++;}
const us=u.reduce((x,y)=>x+y),bu=Array(29).fill(0),tu=Array(841).fill(0);b.forEach((v,i)=>bu[Math.floor(i/29)]+=v);t.forEach((v,i)=>tu[Math.floor(i/29)]+=v);
const sc1=u.map(v=>Math.log(29*v/us)),sc2=b.map((v,i)=>Math.log(29*(v+10*u[i%29]/us)/(bu[Math.floor(i/29)]+10))),sc3=t.map((v,i)=>Math.log(29*(v+10*Math.exp(sc2[i%841])/29)/(tu[Math.floor(i/29)]+10)));
function term(a,i){return i===0?sc1[a[i]]:i===1?sc2[a[0]*29+a[1]]:sc3[(a[i-2]*29+a[i-1])*29+a[i]];}
function score(a,s,e){let z=0;for(let i=s;i<e;i++)z+=term(a,i);return z/(e-s);}
function ks(key){return masks.map(m=>{let v=key[0];for(let k=0;k<fib.length;k++)if(m&(1<<k))v+=key[k+1];return mod(v);});}
function clocks(a,hold){let j=0;return a.map(p=>{const q=j;if(!hold||p!==0)j++;return q;});}
function apply(a,key,hold,sign){const k=ks(key),c=clocks(a,hold);return a.map((p,i)=>p===0?0:pow[mod(log[p]+sign*k[c[i]])]);}
let state=0x1fd29477;function rnd(n){state=(Math.imul(state,1664525)+1013904223)>>>0;return Math.floor(state/4294967296*n);}
const shift=Array.from({length:28},(_,d)=>Array.from({length:29},(_,p)=>p?pow[mod(log[p]-d)]:0));
const result={fib,vals,source,cut,targetLength:target.length,donorLengths:refs.map(x=>x.length),experiments:[]};
for(const hold of [false,true]){
const diff=Array.from({length:fib.length},()=>Array(28).fill(.5));
for(const raw of refs){const r=hold?raw.filter(p=>p):raw;for(let k=0;k<fib.length;k++){const f=fib[k];for(let i=0;i+f<r.length;i++)if(r[i]&&r[i+f])diff[k][mod(log[r[i+f]]-log[r[i]])]++;}}
const dl=diff.map(a=>{const s=a.reduce((x,y)=>x+y);return a.map(v=>Math.log(v/s));});
function fit(c){
const clk=clocks(c,hold),pos=Array(target.length).fill(-1);
for(let i=0;i<cut;i++)if(c[i])pos[clk[i]]=i;
const pairCounts=[],rank=[];
for(let k=0;k<fib.length;k++){
const pairs=[];for(let j=0;j+fib[k]<pos.length;j++){const l=j+fib[k];if(pos[j]>=0&&pos[l]>=0&&(masks[j]^masks[l])===(1<<k)&&!(masks[j]&(1<<k)))pairs.push(mod(log[c[pos[l]]]-log[c[pos[j]]]));}
pairCounts.push(pairs.length);
const counts=Array(28).fill(0);pairs.forEach(d=>counts[d]++);
rank.push(Array.from({length:28},(_,d)=>[d,counts.reduce((s,v,i)=>s+v*dl[k][mod(i-d)],0)]).sort((a,b)=>b[1]-a[1]).map(p=>p[0]));
}
const flags=Array.from({length:source.length},(_,k)=>Array.from({length:cut},(_,i)=>i).filter(i=>c[i]&&(k===0||(masks[clk[i]]&(1<<(k-1))))));
const affected=flags.map(a=>{const set=new Set();for(const i of a)for(let j=i;j<Math.min(cut,i+3);j++)set.add(j);return [...set];});
let best=null;const guesses=[source.slice(),[0,...rank.map(a=>a[0])],...Array.from({length:4},()=>[rnd(28),...rank.map(a=>a[rnd(3)])])];
for(const g of guesses){let key=g.slice(),p=apply(c.slice(0,cut),key,hold,-1);
for(let sweep=0;sweep<10;sweep++){let changes=0;for(let k=0;k<key.length;k++){const f=flags[k],a=affected[k];let v=0;for(const i of a)v+=term(p,i);let top=v,delta=0;const prev=f.map(i=>p[i]);for(let d=1;d<28;d++){for(let j=0;j<f.length;j++)p[f[j]]=shift[d][prev[j]];let z=0;for(const i of a)z+=term(p,i);if(z>top+1e-8){top=z;delta=d;}}for(let j=0;j<f.length;j++)p[f[j]]=shift[delta][prev[j]];if(delta){key[k]=mod(key[k]+delta);changes++;}}if(!changes)break;}
const s=score(p,0,cut);if(!best||s>best.fit)best={key,fit:s};}
const decoded=apply(c,best.key,hold,-1);return {...best,held:score(decoded,cut,c.length),decoded,pairCounts};
}
for(let trial=0;trial<3;trial++){const p=em.slice(10000+(Number(hold)*3+trial)*target.length,10000+(Number(hold)*3+trial+1)*target.length);if(p.length!==target.length)throw Error("donor");const key=source.map(()=>rnd(28));const c=apply(p,key,hold,1);const f=fit(c);result.experiments.push({hold,trial,truth:key,recovered:f.key,fit:f.fit,held:f.held,pairCounts:f.pairCounts,fitCorrect:p.slice(0,cut).filter((v,i)=>v===f.decoded[i]).length,heldCorrect:p.slice(cut).filter((v,i)=>v===f.decoded[i+cut]).length});}
const fixed=apply(target,source,hold,-1),blind=fit(target);
result.experiments.push({hold,trial:"original",fixed:{fit:score(fixed,0,cut),held:score(fixed,cut,target.length),decoded:fixed},blind});
}
return result;
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];
console.log(JSON.stringify(run(paths.map(p=>fs.readFileSync(p,'utf8'))),null,2));
