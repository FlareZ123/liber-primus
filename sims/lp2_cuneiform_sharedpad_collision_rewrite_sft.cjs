// Agent 8: source-fixed cuneiform shared pad beneath a soft collision-rewrite output channel.
const fs=require('node:fs');
const paths=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/external/2013-book-of-law-I.txt","resources/external/2013-book-of-law-II.txt","resources/external/2013-book-of-law-III.txt","resources/external/blake-marriage-1906-gutenberg45315.txt","resources/external/kybalion-gitenberg-14209.txt"];
function run(c,n,books,config){
 const Q=29,N=100,H=90,S=Q*Q,T=S*Q,dirs=[0,0,0,0,0,0,1],idx=new Map(c.runes.map((x,i)=>[x,i])),dict=new Map(c.translit.map((x,i)=>[x,i]));for(const [a,b] of Object.entries({V:"U",K:"C",Q:"C",Z:"S",ING:"NG"}))dict.set(a,dict.get(b));
 const native=n.sections.map(s=>[...s.source_text].filter(x=>idx.has(x)).map(x=>idx.get(x)));
 function translit(s){return (s.toUpperCase().match(/[A-Z]+/g)||[]).flatMap(x=>{const a=[];for(let i=0;i<x.length;){const t=[x.slice(i,i+3),x.slice(i,i+2),x[i]].find(t=>dict.has(t));if(t){a.push(dict.get(t));i+=t.length}else i++}return a})}
 const corp=books.map(translit);
 function model(rev){const u=new Float64Array(Q).fill(.5),b=new Float64Array(S),t=new Float64Array(T);for(const source of corp){const a=rev?source.slice().reverse():source;for(let i=0;i<a.length;i++){u[a[i]]++;if(i)b[a[i-1]*Q+a[i]]++;if(i>1)t[(a[i-2]*Q+a[i-1])*Q+a[i]]++}}const us=u.reduce((a,b)=>a+b,0);for(let i=0;i<Q;i++)u[i]/=us;for(let h=0;h<Q;h++){let z=0;for(let k=0;k<Q;k++)z+=b[h*Q+k];for(let k=0;k<Q;k++)b[h*Q+k]=(b[h*Q+k]+10*u[k])/(z+10)}for(let h=0;h<S;h++){let z=0;for(let k=0;k<Q;k++)z+=t[h*Q+k];for(let k=0;k<Q;k++)t[h*Q+k]=Math.log((t[h*Q+k]+8*b[(h%Q)*Q+k])/(z+8))}return {u:u.map(Math.log),b:b.map(Math.log),t}}
 const models=[model(false),model(true)],mod=x=>(x+Q)%Q,lp=(m,a,b,x)=>b===29?m.u[x]:a===29?m.b[b*Q+x]:m.t[(a*Q+b)*Q+x];
function options(row,i){const cv=row.c[i],prev=row.prev[i];return cv===prev?[{raw:cv,weight:config.alpha}]:[{raw:cv,weight:1},{raw:prev,weight:(1-config.alpha)/(Q-1)}]}
function fit(rows,width){
 const R=rows.length,pack=(a,b)=>a*30+b;let beam=[{codes:Array(R).fill(pack(29,29)),score:0,parent:null,k:-1}];let expanded=0;
 for(let i=0;i<N;i++){
 const rawopts=rows.map(row=>options(row,i).map(o=>({...o,logw:Math.log(o.weight)}))),map=new Map(),heap=[];
 function swap(i,j){[heap[i],heap[j]]=[heap[j],heap[i]]}
 function push(x){heap.push(x);for(let i=heap.length-1;i;){const p=(i-1)>>1;if(heap[p].score<=x.score)break;swap(i,p);i=p}}
 function pop(){const x=heap[0],z=heap.pop();if(heap.length){heap[0]=z;for(let i=0;;){let j=i*2+1;if(j>=heap.length)break;if(j+1<heap.length&&heap[j+1].score<heap[j].score)j++;if(heap[i].score<=heap[j].score)break;swap(i,j);i=j}}return x}
 function cutoff(){while(heap.length&&map.get(heap[0].sig)!==heap[0])pop();return map.size>=width?heap[0].score:-Infinity}
 function offer(codes,score,parent,k){if(score<cutoff())return;const sig=codes.join(","),prev=map.get(sig);if(prev&&prev.score>=score)return;const x={codes:codes.slice(),score,parent,k,sig};map.set(sig,x);push(x);if(map.size>width){while(heap.length&&map.get(heap[0].sig)!==heap[0])pop();map.delete(pop().sig)}expanded++}
 for(const st of beam){
 const history=st.codes.map(v=>[Math.floor(v/30),v%30]),opt=Array.from({length:Q},()=>Array(R)),upper=new Float64Array(Q).fill(st.score);
 for(let k=0;k<Q;k++)for(let j=0;j<R;j++){const [a,b]=history[j],m=models[dirs[j]],o=rawopts[j].map(x=>{const p=mod(x.raw-k);return [pack(b,p),lp(m,a,b,p)+x.logw]});opt[k][j]=o;upper[k]+=Math.max(...o.map(x=>x[1]))}
 const keys=Array.from({length:Q},(_,k)=>k).sort((a,b)=>upper[b]-upper[a]);
 for(const k of keys){if(upper[k]<cutoff())break;const tail=Array(R+1).fill(0);for(let j=R-1;j>=0;j--)tail[j]=tail[j+1]+Math.max(...opt[k][j].map(x=>x[1]));const codes=Array(R);function rec(j,s){if(s+tail[j]<cutoff())return;if(j===R){offer(codes,s,st,k);return}for(const [v,w] of opt[k][j]){codes[j]=v;rec(j+1,s+w)}}rec(0,st.score)}
 }
 beam=[...map.values()].sort((a,b)=>b.score-a.score);
 if(!beam.length)throw Error("empty beam");
 }
 const best=beam[0],chain=[];for(let x=best;x.parent;x=x.parent)chain.unshift(x);const key=chain.map(x=>x.k),raw=rows.map((_,j)=>chain.map(x=>mod((x.codes[j]%30)+x.k)));return {key,raw,score:best.score,expanded};
}
function factors(rows,result){
 const raw=result.raw,weights=[];let replay=0;for(let j=0;j<rows.length;j++)for(let i=0;i<N;i++){const opts=options(rows[j],i),o=opts.find(x=>x.raw===raw[j][i]);if(!o)throw Error("invalid raw");replay+=Math.log(o.weight)}
 for(let k=0;k<N;k++){const size=k===0?Q:k===1?S:T,a=new Float64Array(size);let max=-Infinity;
 for(let id=0;id<size;id++){const h=k>=2?Math.floor(id/S):0,j=k>=1?Math.floor(id/Q)%Q:0,l=id%Q;let z=0;for(let r=0;r<raw.length;r++){const row=raw[r],m=models[dirs[r]],pa=k>=2?mod(row[k-2]-h):29,pb=k>=1?mod(row[k-1]-j):29,px=mod(row[k]-l);z+=lp(m,pa,pb,px)}a[id]=z;if(z>max)max=z}
 const key=result.key,index=k===0?key[0]:k===1?key[0]*Q+key[1]:(key[k-2]*Q+key[k-1])*Q+key[k];replay+=a[index];for(let id=0;id<size;id++)a[id]=Math.exp(a[id]-max);weights.push(a)
 }
 if(Math.abs(replay-result.score)>1e-7)throw Error("factor replay");return weights;
}
function fitMarginal(weights){let f=new Float64Array(S);f[0]=1;let logZ=0;for(let k=0;k<N;k++){const a=weights[k],next=new Float64Array(S);for(let h=0;h<Q;h++)for(let j=0;j<Q;j++){const id=h*Q+j,v=f[id];if(v===0)continue;const base=k===0?0:k===1?j*Q:id*Q;for(let l=0;l<Q;l++)next[j*Q+l]+=v*a[base+l]}const z=next.reduce((s,x)=>s+x,0);for(let i=0;i<S;i++)next[i]/=z;logZ+=Math.log(z);f=next}return logZ}
function heldMarginal(row,weights,wantPlain){
 const opts=Array.from({length:H},(_,i)=>options(row,i)),m=models[dirs[6]],pm={u:m.u.map(Math.exp),b:m.b.map(Math.exp),t:m.t.map(Math.exp)},prob=(a,b,x)=>b===29?pm.u[x]:a===29?pm.b[b*Q+x]:pm.t[(a*Q+b)*Q+x],D=S*4;let f=new Float64Array(D),v=wantPlain?new Float64Array(D):null;f[0]=1;if(v)v[0]=1;let logZ=0;const back=[];
 for(let k=0;k<N;k++){const w=weights[k],nf=new Float64Array(D),nv=v?new Float64Array(D):null,bp=v?new Int32Array(D).fill(-1):null;for(let id=0;id<D;id++){const pr=f[id],vr=v?v[id]:0;if(!pr&&!vr)continue;const state=Math.floor(id/4),h=Math.floor(state/Q),j=state%Q,oldBits=id%4,base=k===0?0:k===1?j*Q:state*Q;let a=29,b=29;if(k<H){if(k>=2)a=mod(opts[k-2][oldBits>>1].raw-h);if(k>=1)b=mod(opts[k-1][oldBits&1].raw-j)}
 for(let l=0;l<Q;l++){const wf=w[base+l];if(!wf)continue;const curOpts=k<H?opts[k]:[{raw:0,weight:1}];for(let bit=0;bit<curOpts.length;bit++){const o=curOpts[bit],factor=wf*o.weight*(k<H?prob(a,b,mod(o.raw-l)):1),nid=(j*Q+l)*4+((oldBits&1)*2+bit);nf[nid]+=pr*factor;if(v&&vr*factor>nv[nid]){nv[nid]=vr*factor;bp[nid]=id}}}
 }
 const z=nf.reduce((s,x)=>s+x,0);if(!z)return {z:-Infinity,plain:[]};let mv=0;if(v)for(const x of nv)if(x>mv)mv=x;for(let i=0;i<D;i++){nf[i]/=z;if(v)nv[i]/=mv}logZ+=Math.log(z);f=nf;v=nv;if(wantPlain)back.push(bp)
 }
 let plain=[];if(wantPlain){let id=0;for(let i=1;i<D;i++)if(v[i]>v[id])id=i;plain=Array(H);for(let k=N-1;k>=0;k--){if(k<H)plain[k]=mod(opts[k][id&1].raw-(Math.floor(id/4)%Q));id=back[k][id];if(id<0)throw Error("trace")}if(id!==0)throw Error("initial state")}
 return {z:logZ,plain};
}
function predict(rows,result,heldRows,wantPlain){const weights=factors(rows,result),z=fitMarginal(weights);return heldRows.map((row,j)=>{const a=heldMarginal(row,weights,wantPlain&&j===0),nullLL=Array.from({length:H},(_,i)=>Math.log(options(row,i).reduce((s,x)=>s+x.weight,0)/Q)).reduce((s,x)=>s+x,0);return {bf:a.z-z-nullLL,plain:a.plain}})}

let state=config.seed;const rand=k=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return Math.floor(state/4294967296*k)},starts=native.flatMap((a,j)=>Array.from({length:Math.floor(a.length/N)},(_,i)=>({j,i:i*N})));
function sample(){const pool=starts.slice(),chosen=[];for(let j=0;j<7;j++){const x=pool.splice(rand(pool.length),1)[0],a=native[x.j].slice(x.i,x.i+N);chosen.push(dirs[j]?a.reverse():a)}return chosen}
const keygen=()=>Array.from({length:N},()=>rand(Q)),acc=(a,b)=>a.reduce((s,x,i)=>s+(x===b[i]),0);
function enc(p,k,dir){const raw=p.map((v,i)=>mod(v+k[i])),c=Array(N),prev=Array(N);let last=rand(Q);for(let i=dir?N-1:0;dir?i>=0:i<N;i+=dir?-1:1){prev[i]=last;let v=raw[i];if(v===last&&rand(4294967296)/4294967296>=config.alpha)v=mod(last+1+rand(Q-1));c[i]=v;last=v}return {c,prev,raw}}
const controls=[];for(let j=0;j<config.trials;j++){const p=sample(),k=keygen(),rows=p.map((a,i)=>enc(a,k,dirs[i])),wrong=enc(p[6],keygen(),dirs[6]),ir=p.map((a,i)=>enc(a,keygen(),dirs[i]));if(j<(config.skip??0)||j>=(config.skip??0)+(config.count??config.trials))continue;const a=fit(rows.slice(0,6),config.width),ia=fit(ir.slice(0,6),config.width),pr=predict(rows.slice(0,6),a,[rows[6],wrong],true),ipr=predict(ir.slice(0,6),ia,[ir[6]],false);
controls.push({positive:{fitScore:a.score,keyCorrect:acc(a.key.slice(0,H),k),heldCorrect:acc(pr[0].plain,p[6]),heldBF:pr[0].bf,rawErrors:rows.slice(0,6).reduce((s,row,i)=>s+N-acc(a.raw[i],row.raw),0),rewrites:rows.map(row=>N-acc(row.raw,row.c)),repeats:rows.map(row=>acc(row.c,row.prev))},wrongHeld:{heldBF:pr[1].bf},independent:{fitScore:ia.score,heldBF:ipr[0].bf}})}
const gate=controls.filter(x=>x.positive.keyCorrect>=81&&x.positive.heldCorrect>=81).length>=Math.ceil(controls.length*5/6)&&Math.min(...controls.map(x=>x.positive.heldBF))>Math.max(...controls.flatMap(x=>[x.wrongHeld.heldBF,x.independent.heldBF]));
let original=null;if((gate&&config.original&&controls.length===config.trials)||config.originalOnly){const rows=[];for(let j=34;j<=39;j++){const page=c.pages.find(p=>p.page===j).indices,prior=c.pages.find(p=>p.page===j-1).indices;rows.push({c:page.slice(0,N),prev:[prior[prior.length-1],...page.slice(0,N-1)]})}const page=c.pages.find(p=>p.page===33).indices;rows.push({c:page.slice(-N).reverse(),prev:page.slice(-N-1,-1).reverse()});const a=fit(rows.slice(0,6),config.width),pr=predict(rows.slice(0,6),a,[rows[6]],true)[0];original={fit:a,prediction:pr,repeats:rows.map(row=>acc(row.c,row.prev)),inferredRewrites:a.raw.map((raw,i)=>N-acc(raw,rows[i].c))}}
return {config,controls,gate,original};
}
const files=paths.map(p=>fs.readFileSync(p,'utf8'));
const config={width:256,alpha:0.19,seed:0x19c03301,trials:6,original:true};
if(process.argv[2]==='--batch'){config.skip=Number(process.argv[3]);config.count=Number(process.argv[4]);config.original=false}else if(process.argv[2]==='--original-after-calibration'){config.skip=config.trials;config.count=0;config.originalOnly=true}
console.log(JSON.stringify(run(JSON.parse(files[0]),JSON.parse(files[1]),files.slice(2),config),null,2));
