'use strict';
const fs=require('node:fs');
function run(data,mode="all"){
const cp=JSON.parse(data[0]),native=JSON.parse(data[2]),target=cp.pages.filter(p=>p.page>=15&&p.page<=22).flatMap(p=>p.indices.slice(p.page===15?20:0)),N=target.length,cut=1752;
const mod=x=>((x%29)+29)%29,inv=Array(29).fill(0);for(let a=1;a<29;a++)for(let b=1;b<29;b++)if(a*b%29===1)inv[a]=b;
const start=cp.pages.filter(p=>p.page<15).reduce((s,p)=>s+p.indices.length,0)+20,rm=new Map(cp.runes.map((r,i)=>[r,i]));let word=[],words=[],i=0;function finish(){if(word.length){words.push(word);word=[];}}for(const ch of data[1].split("%").slice(0,55).join("%")){if(rm.has(ch)){word.push([i++,rm.get(ch)]);}else if(ch==="%"||ch==="/"||/\s/u.test(ch)){}else finish();}finish();
const anchors=words.filter(w=>w.length===1&&w[0][0]>=start&&w[0][0]<start+cut).map(w=>w[0][0]-start);if(anchors.length!==18||N!==1883||words.length!==2896)throw Error("source dimensions");
const fib=[1,2];while(fib.at(-1)+fib.at(-2)<N)fib.push(fib.at(-1)+fib.at(-2));const masks=Array.from({length:N},(_,i)=>{let b=0;for(let k=fib.length-1;k>=0;k--)if(i>=fib[k]){i-=fib[k];b|=1<<k;}return b;});
const primes=[];for(let x=2;primes.length<=fib.at(-1);x++)if(primes.every(p=>p*p>x||x%p))primes.push(x);
const vals=[0,...fib].map(j=>Math.abs(3301-primes[j])%29),slopes=[vals[0],...vals.slice(1).map(x=>mod(x*inv[vals[0]]))];
const sourceB=[2,...fib.map(j=>mod((primes[j]-2)*inv[slopes[0]]))];
const labels=cp.translit.map((s,i)=>[s.toUpperCase(),i]).sort((a,b)=>b[0].length-a[0].length);
function encode(s){let arr=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replaceAll("QU","CW").replaceAll("V","U").replace(/[KQ]/g,"C").replaceAll("Z","S");while(w.length){let f=w.startsWith("ING")?["ING",21]:w.startsWith("IO")?["IO",27]:labels.find(([l])=>w.startsWith(l));if(!f){w=w.slice(1);continue;}arr.push(f[1]);w=w.slice(f[0].length);}}return arr;}
const refs=[...native.sections.map(s=>Array.from(s.source_text).filter(r=>rm.has(r)).map(r=>rm.get(r))),encode(data[3]),encode(data[4])],em=encode(data[5]);
const u=new Float64Array(29).fill(.5),b=new Float64Array(841),t=new Float64Array(24389);for(const a of refs)for(let i=0;i<a.length;i++){u[a[i]]++;if(i>0)b[a[i-1]*29+a[i]]++;if(i>1)t[(a[i-2]*29+a[i-1])*29+a[i]]++;}
const us=u.reduce((x,y)=>x+y),bu=new Float64Array(29),tu=new Float64Array(841);b.forEach((v,i)=>bu[Math.floor(i/29)]+=v);t.forEach((v,i)=>tu[Math.floor(i/29)]+=v);
const sc1=u.map(v=>Math.log(29*v/us)),sc2=b.map((v,i)=>Math.log(29*(v+10*u[i%29]/us)/(bu[Math.floor(i/29)]+10))),sc3=t.map((v,i)=>Math.log(29*(v+10*Math.exp(sc2[i%841])/29)/(tu[Math.floor(i/29)]+10)));
const score4=new Int32Array(29**4);for(let a=0;a<29;a++)for(let b=0;b<29;b++)for(let c=0;c<29;c++)for(let d=0;d<29;d++)score4[((a*29+b)*29+c)*29+d]=Math.round(1000*(sc1[a]+sc2[a*29+b]+sc3[(a*29+b)*29+c]+sc3[(b*29+c)*29+d]));
function score(a,s,e){let z=0;for(let i=s;i<e;i++)z+=i===0?sc1[a[i]]:i===1?sc2[a[0]*29+a[1]]:sc3[(a[i-2]*29+a[i-1])*29+a[i]];return z/(e-s);}
const sample=[];for(let k=0;k<16;k++){let p=Math.floor((k+.5)*cut/16)-2;while(anchors.some(x=>x>=p&&x<p+4))p++;for(let j=0;j<4;j++)sample.push(p+j);}
const L=sample.length,choices=[24,10,3],H=3**9,keep=4096,pows3=Array.from({length:9},(_,j)=>3**j);
let seed=0x3ea9c217;function rnd(n){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return Math.floor(seed/4294967296*n);}
function geom(rev){
const rows=masks.map(m=>{let h=Array(17).fill(0),a=slopes[0];h[0]=1;for(let z=0;z<16;z++){let k=rev?15-z:z;if(m&(1<<k)){h[k+1]=a;a=mod(a*slopes[k+1]);}}return{a,h,sparse:h.flatMap((v,j)=>v?[[j,v]]:[])};});
for(let j=0;j<fib.length;j++){let x=rows[fib[j]];if(x.a!==vals[j+1]||mod(x.h.reduce((s,v,k)=>s+v*sourceB[k],0))!==primes[fib[j]]%29)throw Error("source map");}
const aug=anchors.map((p,i)=>[...rows[p].h,...Array.from({length:18},(_,j)=>+(i===j))]);
for(let c=0;c<17;c++){let p=aug.findIndex((r,i)=>i>=c&&r[c]);if(p<0)throw Error("rank");[aug[p],aug[c]]=[aug[c],aug[p]];let a=inv[aug[c][c]];aug[c]=aug[c].map(x=>mod(x*a));for(let i=0;i<18;i++)if(i!==c&&aug[i][c]){let z=aug[i][c];aug[i]=aug[i].map((x,j)=>mod(x-z*aug[c][j]));}}
return {rows,R:aug.map(r=>r.slice(17))};
}
function apply(p,key,g,sign){return p.map((v,i)=>{const r=g.rows[i];let b=0;for(const [j,x] of r.sparse)b+=key[j]*x;return sign===1?mod(r.a*v+b):mod(inv[r.a]*(v-b));});}
function recover(c,g,truth){
const {rows,R}=g,ac=anchors.map(p=>c[p]),aa=anchors.map(p=>rows[p].a);
const w=R[17].map((v,j)=>mod(v*aa[j])),need=mod(R[17].reduce((s,v,j)=>s+v*ac[j],0)-24*w.reduce((s,v)=>s+v,0));
const coeff=sample.map(i=>{const {a,h}=rows[i];const q=Array.from({length:18},(_,j)=>mod(h.reduce((s,v,k)=>s+v*R[k][j],0)*inv[a]));return {m:q.map((v,j)=>mod(v*aa[j])),base:mod(c[i]*inv[a]-q.reduce((s,v,j)=>s+v*ac[j],0)+24*q.reduce((s,v,j)=>s+v*aa[j],0))};});
function half(begin,base){
const V=new Uint8Array(H*L),syn=new Uint8Array(H),groups=Array.from({length:29},()=>[]);if(base)for(let k=0;k<L;k++)V[k]=coeff[k].base;groups[0].push(0);
const diff=Array.from({length:9},(_,j)=>[0,1].map(d=>coeff.map(o=>mod(o.m[begin+j]*(choices[d+1]-choices[d])))));
const ds=Array.from({length:9},(_,j)=>[0,1].map(d=>mod(w[begin+j]*(choices[d+1]-choices[d]))));
for(let n=1;n<H;n++){let j=0,k=n;while(k%3===0){j++;k=Math.floor(k/3);}let digit=k%3,par=n-pows3[j],off=n*L,po=par*L,z=diff[j][digit-1];for(let m=0;m<L;m++){let a=V[po+m]+z[m];V[off+m]=a>=29?a-29:a;}syn[n]=(syn[par]+ds[j][digit-1])%29;groups[syn[n]].push(n);}
return {V,syn,groups};
}
const A=half(0,true),B=half(9,false);
let tested=0,truthSample=null,truthBetter=0,truthEqual=0;if(truth){truthSample=0;for(let k=0;k<L;k+=4)truthSample+=score4[((truth[sample[k]]*29+truth[sample[k+1]])*29+truth[sample[k+2]])*29+truth[sample[k+3]]];}
const heap=[];function push(x){if(heap.length<keep){let j=heap.length;heap.push(x);while(j>0){let p=(j-1)>>1;if(heap[p][0]<=x[0])break;heap[j]=heap[p];j=p;heap[j]=x;}}else if(x[0]>heap[0][0]){let j=0;heap[0]=x;while(true){let p=2*j+1;if(p>=heap.length)break;if(p+1<heap.length&&heap[p+1][0]<heap[p][0])p++;if(heap[p][0]>=x[0])break;heap[j]=heap[p];j=p;heap[j]=x;}}}
for(let l=0;l<H;l++){
const ao=l*L,bs=B.groups[mod(need-A.syn[l])];
for(const r of bs){let bo=r*L,z=0;for(let k=0;k<L;k+=4){let a=A.V[ao+k]+B.V[bo+k],b=A.V[ao+k+1]+B.V[bo+k+1],c=A.V[ao+k+2]+B.V[bo+k+2],d=A.V[ao+k+3]+B.V[bo+k+3];if(a>=29)a-=29;if(b>=29)b-=29;if(c>=29)c-=29;if(d>=29)d-=29;z+=score4[((a*29+b)*29+c)*29+d];}tested++;if(truthSample!==null){if(z>truthSample)truthBetter++;if(z===truthSample)truthEqual++;}if(heap.length<keep||z>heap[0][0])push([z,l,r]);}
}
function decodePair(l,r){let pp=[];for(let i=0;i<9;i++){pp.push(choices[l%3]);l=Math.floor(l/3);}for(let i=0;i<9;i++){pp.push(choices[r%3]);r=Math.floor(r/3);}const rhs=ac.map((c,j)=>mod(c-aa[j]*pp[j]));if(mod(R[17].reduce((s,v,j)=>s+v*rhs[j],0)))throw Error("syndrome");return R.slice(0,17).map(row=>mod(row.reduce((s,v,j)=>s+v*rhs[j],0)));}
const best=[];for(const [sampleScore,l,r] of heap){const key=decodePair(l,r),p=apply(c,key,g,-1),fit=score(p,0,cut);best.push({key,fit,sampleScore});}
best.sort((a,b)=>b.fit-a.fit);let winner=best[0];const p=apply(c,winner.key,g,-1);if(apply(p,winner.key,g,1).some((x,i)=>x!==c[i]))throw Error("replay");if(anchors.some(i=>!choices.includes(p[i])))throw Error("anchor inverse");
return{tested,sampleKeep:heap.length,truthSample,truthSampleStrictRank:truth?truthBetter+1:null,truthSampleTies:truth?truthEqual:null,winner:{...winner,held:score(p,cut,N),decoded:p},otherTop:best.slice(1,8)};
}
const out={N,cut,anchors,fib,slopes,sourceB,sample,controls:[],original:[]};
for(const rev of [false,true]){if(mode!=="all"&&mode!==String(Number(rev)))continue;seed=(0x3ea9c217 ^ (Number(rev)*0x5bd1e995))>>>0;const g=geom(rev);const p=em.slice(43000+Number(rev)*N,43000+(Number(rev)+1)*N);if(p.length!==N)throw Error("donor");anchors.forEach(i=>p[i]=choices[rnd(3)]);const key=sourceB.map(()=>rnd(29)),c=apply(p,key,g,1),control=recover(c,g,p);let d=control.winner.decoded;out.controls.push({rev,key,correct:d.filter((v,i)=>v===p[i]).length,heldCorrect:d.slice(cut).filter((v,i)=>v===p[i+cut]).length,...control,winner:{...control.winner,decoded:undefined}});
if(control.winner.key.every((x,i)=>x===key[i])){const a=recover(target,g,null),fixed=apply(target,sourceB,g,-1);out.original.push({rev,...a,fixed:{fit:score(fixed,0,cut),held:score(fixed,cut,N),decoded:fixed}});}else out.original.push({rev,skipped:"control did not recover full key"});
}
return out;
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/lp2-transcription.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];
if(require.main===module)console.log(JSON.stringify(run(paths.map(p=>fs.readFileSync(p,'utf8')),process.argv[2]||'all'),null,2));
module.exports=run;
