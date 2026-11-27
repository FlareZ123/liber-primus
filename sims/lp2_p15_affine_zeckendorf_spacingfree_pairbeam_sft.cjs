'use strict';
const fs=require('node:fs');
function run(data,mode="all",width=256){
const cp=JSON.parse(data[0]),native=JSON.parse(data[1]),target=cp.pages.filter(p=>p.page>=15&&p.page<=22).flatMap(p=>p.indices.slice(p.page===15?20:0)),N=target.length,cut=1752;
const mod=x=>((x%29)+29)%29,inv=Array(29).fill(0);for(let a=1;a<29;a++)for(let b=1;b<29;b++)if(a*b%29===1)inv[a]=b;
const fib=[1,2];while(fib.at(-1)+fib.at(-2)<N)fib.push(fib.at(-1)+fib.at(-2));const masks=Array.from({length:N},(_,i)=>{let b=0;for(let k=fib.length-1;k>=0;k--)if(i>=fib[k]){i-=fib[k];b|=1<<k;}return b;});
const primes=[];for(let x=2;primes.length<=fib.at(-1);x++)if(primes.every(p=>p*p>x||x%p))primes.push(x);
const vals=[0,...fib].map(j=>Math.abs(3301-primes[j])%29),slopes=[vals[0],...vals.slice(1).map(x=>mod(x*inv[vals[0]]))],sourceB=[2,...fib.map(j=>mod((primes[j]-2)*inv[slopes[0]]))],source=[sourceB[0],...sourceB.slice(1).map((b,k)=>mod(slopes[0]*b+(1-slopes[k+1])*sourceB[0]))];
const rm=new Map(cp.runes.map((r,i)=>[r,i])),labels=cp.translit.map((s,i)=>[s.toUpperCase(),i]).sort((a,b)=>b[0].length-a[0].length);
function encode(s){let arr=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replaceAll("QU","CW").replaceAll("V","U").replace(/[KQ]/g,"C").replaceAll("Z","S");while(w.length){let f=w.startsWith("ING")?["ING",21]:w.startsWith("IO")?["IO",27]:labels.find(([l])=>w.startsWith(l));if(!f){w=w.slice(1);continue;}arr.push(f[1]);w=w.slice(f[0].length);}}return arr;}
const refs=[...native.sections.map(s=>Array.from(s.source_text).filter(r=>rm.has(r)).map(r=>rm.get(r))),encode(data[2]),encode(data[3])],em=encode(data[4]);
const u=new Float64Array(29).fill(.5),b=new Float64Array(841),t=new Float64Array(24389);for(const a of refs)for(let i=0;i<a.length;i++){u[a[i]]++;if(i>0)b[a[i-1]*29+a[i]]++;if(i>1)t[(a[i-2]*29+a[i-1])*29+a[i]]++;}
const us=u.reduce((x,y)=>x+y),bu=new Float64Array(29),tu=new Float64Array(841);b.forEach((v,i)=>bu[Math.floor(i/29)]+=v);t.forEach((v,i)=>tu[Math.floor(i/29)]+=v);
const sc1=u.map(v=>Math.log(29*v/us)),sc2=b.map((v,i)=>Math.log(29*(v+10*u[i%29]/us)/(bu[Math.floor(i/29)]+10))),sc3=t.map((v,i)=>Math.log(29*(v+10*Math.exp(sc2[i%841])/29)/(tu[Math.floor(i/29)]+10)));
function term(a,i){return i===0?sc1[a[i]]:i===1?sc2[a[0]*29+a[1]]:sc3[(a[i-2]*29+a[i-1])*29+a[i]];}
function score(a,s,e){let z=0;for(let i=s;i<e;i++)z+=term(a,i);return z/(e-s);}
const diff=fib.map(lag=>{const h=new Float64Array(29).fill(.5);for(const p of refs)for(let i=0;i+lag<p.length;i++)h[mod(p[i+lag]-p[i])]++;const s=h.reduce((a,b)=>a+b);return h.map(v=>Math.log(29*v/s));});
const lut=diff.map(d=>{const a=new Float64Array(29**3);for(let invA=1;invA<29;invA++)for(let base=0;base<29;base++)for(let v=0;v<29;v++)a[(invA*29+base)*29+v]=d[mod(base-v*invA)];return a;});
let seed=0x2c9f1e01;function rnd(n){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return Math.floor(seed/4294967296*n);}
function geom(rev){
const order=Array.from({length:16},(_,k)=>rev?15-k:k);
const rows=masks.map(m=>{let h=Array(17).fill(0),a=1;for(const k of order)if(m&(1<<k)){h[k+1]=a;a=mod(a*slopes[k+1]);}h[0]=a;a=mod(a*slopes[0]);return{a,h,sparse:h.flatMap((v,j)=>v?[[j,v]]:[])};});
const specs=[];let peeled=0;for(const k of order){const pairs=[];for(let j=0;j+fib[k]<cut;j++){const n=j+fib[k];if((masks[j]^masks[n])!==(1<<k)||(masks[j]&(1<<k)))continue;let a=slopes[0];for(let l=0;l<16;l++)if((masks[n]&(1<<l))&&!(peeled&(1<<l)))a=mod(a*slopes[l+1]);pairs.push([j,n,inv[a]]);}specs.push({k,pairs});peeled|=1<<k;}
const flags=Array.from({length:17},(_,k)=>{let a=[];for(let i=0;i<cut;i++)if(rows[i].h[k])a.push([i,mod(inv[rows[i].a]*rows[i].h[k])]);return a;});
const affected=flags.map(a=>{const set=new Set();for(const [i] of a)for(let j=i;j<Math.min(cut,i+3);j++)set.add(j);return [...set];});
return{rows,specs,flags,affected};
}
function apply(c,key,g,sign){return c.map((v,i)=>{const r=g.rows[i];let b=0;for(const [j,x] of r.sparse)b+=key[j]*x;return sign===1?mod(r.a*v+b):mod(inv[r.a]*(v-b));});}
function refine(c,key,g){key=key.slice();let p=apply(c.slice(0,cut),key,g,-1);for(let sweep=0;sweep<10;sweep++){let changes=0;for(let k=0;k<17;k++){const flags=g.flags[k],af=g.affected[k],old=flags.map(([i])=>p[i]);let best=0;for(const i of af)best+=term(p,i);let bd=0;for(let d=1;d<29;d++){for(let j=0;j<flags.length;j++){const [i,cf]=flags[j];p[i]=mod(old[j]-cf*d);}let z=0;for(const i of af)z+=term(p,i);if(z>best+1e-8){best=z;bd=d;}}for(let j=0;j<flags.length;j++){const [i,cf]=flags[j];p[i]=mod(old[j]-cf*bd);}if(bd){key[k]=mod(key[k]+bd);changes++;}}if(!changes)break;}return{key,fit:score(p,0,cut)};}
function fit(c,g,truth){
let beam=[{y:Uint8Array.from(c.slice(0,cut)),key:Array(17).fill(0),s:0}],truthRanks=[],countPairs=[];
const peeled=[];
for(const {k,pairs} of g.specs){
countPairs.push({k,n:pairs.length});const children=[],a=slopes[k+1],L=lut[k];
for(let h=0;h<beam.length;h++){const s=beam[h],z=new Float64Array(29);for(const [i,j,ia] of pairs){const base=mod((s.y[j]-a*s.y[i])*ia),off=(ia*29+base)*29;for(let d=0;d<29;d++)z[d]+=L[off+d];}for(let d=0;d<29;d++)children.push({h,d,s:s.s+z[d]});}
children.sort((a,b)=>b.s-a.s);
if(truth){const rank=children.findIndex(x=>x.d===truth[k+1]&&peeled.every(j=>beam[x.h].key[j+1]===truth[j+1]));truthRanks.push(rank<0?null:rank+1);}
beam=children.slice(0,width).map(({h,d,s})=>{const parent=beam[h],key=parent.key.slice(),y=parent.y.slice();key[k+1]=d;for(let i=0;i<cut;i++)if(masks[i]&(1<<k))y[i]=mod((y[i]-d)*inv[a]);return{key,y,s};});peeled.push(k);
}
const ranks=[];
for(const item of beam){let best=null;for(let d=0;d<29;d++){const p=Array.from(item.y,x=>mod((x-d)*inv[slopes[0]])),s=score(p,0,cut);if(!best||s>best.fit)best={key:[d,...item.key.slice(1)],fit:s,pairScore:item.s};}ranks.push(best);}
ranks.sort((a,b)=>b.fit-a.fit);let refined=ranks.slice(0,8).map(x=>({...refine(c,x.key,g),pairScore:x.pairScore,preFit:x.fit}));refined.push({...refine(c,source,g),preFit:null,pairScore:null});refined.sort((a,b)=>b.fit-a.fit);
const winner=refined[0],p=apply(c,winner.key,g,-1);if(apply(p,winner.key,g,1).some((v,i)=>v!==c[i]))throw Error("replay");
return{countPairs,truthRanks,preRank:ranks[0],winner:{...winner,held:score(p,cut,N),decoded:p},refined:refined.slice(1,5)};
}
const out={N,cut,fib,slopes,source,width,controls:[],original:[]};
for(const rev of [false,true]){if(mode!=="all"&&mode!==String(Number(rev)))continue;seed=(0x2c9f1e01^(Number(rev)*0x6a09e667))>>>0;const g=geom(rev);let good=true;
for(let j=0;j<2;j++){const p=em.slice(55000+(Number(rev)*2+j)*N,55000+(Number(rev)*2+j+1)*N),key=source.map(()=>rnd(29));if(p.length!==N)throw Error("donor");const c=apply(p,key,g,1),res=fit(c,g,key),d=res.winner.decoded,correct=d.filter((v,i)=>v===p[i]).length;good&&=correct===N;out.controls.push({rev,j,key,correct,heldCorrect:d.slice(cut).filter((v,i)=>v===p[i+cut]).length,...res,winner:{...res.winner,decoded:undefined}});}
if(good){const res=fit(target,g,null),fixed=apply(target,source,g,-1);out.original.push({rev,...res,fixed:{fit:score(fixed,0,cut),held:score(fixed,cut,N),decoded:fixed}});}else out.original.push({rev,skipped:"full plant recovery gate failed"});
}
return out;
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];
if(require.main===module)console.log(JSON.stringify(run(paths.map(p=>fs.readFileSync(p,'utf8')),process.argv[2]||'all',Number(process.argv[3]||256)),null,2));
module.exports=run;
