// Agent 8: F-transparent beam fit, exact key marginal conditioned on inferred six hold masks.
const fs=require('node:fs');
const paths=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/external/2013-book-of-law-I.txt","resources/external/2013-book-of-law-II.txt","resources/external/2013-book-of-law-III.txt","resources/external/blake-marriage-1906-gutenberg45315.txt","resources/external/kybalion-gitenberg-14209.txt"];
function run(c,n,books,config){
 const Q=29,N=100,H=90,S=Q*Q,T=S*Q,dirs=[0,1,0,1,0,1,0],idx=new Map(c.runes.map((x,i)=>[x,i])),dict=new Map(c.translit.map((x,i)=>[x,i]));for(const [a,b] of Object.entries({V:"U",K:"C",Q:"C",Z:"S",ING:"NG"}))dict.set(a,dict.get(b));
 const native=n.sections.map(s=>[...s.source_text].filter(x=>idx.has(x)).map(x=>idx.get(x)));
 function translit(s){return (s.toUpperCase().match(/[A-Z]+/g)||[]).flatMap(x=>{const a=[];for(let i=0;i<x.length;){const t=[x.slice(i,i+3),x.slice(i,i+2),x[i]].find(t=>dict.has(t));if(t){a.push(dict.get(t));i+=t.length}else i++}return a})}
 const corp=books.map(translit);
 function model(rev){const u=new Float64Array(Q).fill(.5),b=new Float64Array(S),t=new Float64Array(T);for(const source of corp){const a=rev?source.slice().reverse():source;for(let i=0;i<a.length;i++){u[a[i]]++;if(i)b[a[i-1]*Q+a[i]]++;if(i>1)t[(a[i-2]*Q+a[i-1])*Q+a[i]]++}}const us=u.reduce((a,b)=>a+b,0);for(let i=0;i<Q;i++)u[i]/=us;for(let h=0;h<Q;h++){let z=0;for(let k=0;k<Q;k++)z+=b[h*Q+k];for(let k=0;k<Q;k++)b[h*Q+k]=(b[h*Q+k]+10*u[k])/(z+10)}for(let h=0;h<S;h++){let z=0;for(let k=0;k<Q;k++)z+=t[h*Q+k];for(let k=0;k<Q;k++)t[h*Q+k]=Math.log((t[h*Q+k]+8*b[(h%Q)*Q+k])/(z+8))}return {u:u.map(Math.log),b:b.map(Math.log),t}}
 const models=[model(false),model(true)],mod=x=>(x+Q)%Q,lp=(m,a,b,x)=>b===29?m.u[x]:a===29?m.b[b*Q+x]:m.t[(a*Q+b)*Q+x];
 const code=(i,a,b)=>i*900+a*30+b,uncode=x=>[Math.floor(x/900),Math.floor(x%900/30),x%30];
 function fit(rows,width){const R=rows.length;let beam=[{codes:Array(R).fill(code(0,29,29)),score:0,parent:null,k:-1}];let expanded=0;
 for(let phase=0;phase<N;phase++){
 const map=new Map(),heap=[];function swap(i,j){[heap[i],heap[j]]=[heap[j],heap[i]]}function push(x){heap.push(x);for(let i=heap.length-1;i;){const p=(i-1)>>1;if(heap[p].score<=x.score)break;swap(i,p);i=p}}
 function pop(){const x=heap[0],z=heap.pop();if(heap.length){heap[0]=z;for(let i=0;;){let j=i*2+1;if(j>=heap.length)break;if(j+1<heap.length&&heap[j+1].score<heap[j].score)j++;if(heap[i].score<=heap[j].score)break;swap(i,j);i=j}}return x}
 function cutoff(){while(heap.length&&map.get(heap[0].sig)!==heap[0])pop();return map.size>=width?heap[0].score:-Infinity}
 function offer(codes,score,parent,k){if(score<cutoff())return;const sig=codes.join(",");const prev=map.get(sig);if(prev&&prev.score>=score)return;const x={codes:codes.slice(),score,parent,k,sig};map.set(sig,x);push(x);if(map.size>width){while(heap.length&&map.get(heap[0].sig)!==heap[0])pop();map.delete(pop().sig)}expanded++}
 for(const st of beam){
 const opts=Array.from({length:R},()=>Array.from({length:Q},()=>[])),maxs=Array.from({length:R},()=>new Float64Array(Q).fill(-Infinity));
 for(let j=0;j<R;j++){let [i,a,b]=uncode(st.codes[j]),s=0;const row=rows[j],m=models[dirs[j]];while(true){if(i===N){for(let k=0;k<Q;k++){opts[j][k].push([code(i,a,b),s]);maxs[j][k]=Math.max(maxs[j][k],s)}break}const cv=row[i];for(let k=0;k<Q;k++){const p=mod(cv-k);if(p===0)continue;const v=s+lp(m,a,b,p)+config.baseline;opts[j][k].push([code(i+1,b,p),v]);maxs[j][k]=Math.max(maxs[j][k],v)}if(cv!==0)break;s+=lp(m,a,b,0)+config.baseline;i++;a=b;b=0}}
 const keys=[];for(let k=0;k<Q;k++){let u=st.score;for(let j=0;j<R;j++)u+=maxs[j][k];if(Number.isFinite(u))keys.push([k,u])}keys.sort((a,b)=>b[1]-a[1]);for(const [k,u] of keys){if(u<cutoff())break;const tail=Array(R+1).fill(0);for(let j=R-1;j>=0;j--)tail[j]=tail[j+1]+maxs[j][k];const codes=Array(R);function rec(j,s){if(s+tail[j]<cutoff())return;if(j===R){offer(codes,s,st,k);return}for(const [v,w] of opts[j][k]){codes[j]=v;rec(j+1,s+w)}}rec(0,st.score)}
 }
 beam=[...map.values()].sort((a,b)=>b.score-a.score);if(!beam.length)return {key:[],score:null,expanded,complete:false};
 }
 const best=beam.find(x=>x.codes.every(v=>uncode(v)[0]===N));if(!best)return {key:[],score:null,expanded,complete:false};const key=[];for(let x=best;x.parent;x=x.parent)key.unshift(x.k);const chain=[];for(let x=best;x.parent;x=x.parent)chain.unshift(x);const masks=rows.map(()=>Array(N).fill(false));for(const x of chain)for(let j=0;j<R;j++){const [a]=uncode(x.parent.codes[j]),[b,,last]=uncode(x.codes[j]);for(let p=a;p<b;p++)masks[j][p]=p!==b-1||last===0}return {key,score:best.score-config.baseline*R*N,expanded,complete:true,masks};
 }
 const la=(a,b)=>{if(a===-Infinity)return b;if(b===-Infinity)return a;const m=Math.max(a,b);return m+Math.log1p(Math.exp(Math.min(a,b)-m))};
 function held(row,key){let states=new Map([[code(0,29,29),{z:0,v:0,plain:[]}]]);const m=models[0];for(const cv of row.slice(0,H)){const next=new Map();function add(k,a,b,z,v,p){const id=code(k,a,b),old=next.get(id);if(!old)next.set(id,{z,v,plain:p});else{old.z=la(old.z,z);if(v>old.v){old.v=v;old.plain=p}}}for(const [id,x] of states){const [k,a,b]=uncode(id);if(cv===0){const w=lp(m,a,b,0);add(k,b,0,x.z+w,x.v+w,x.plain.concat(0))}if(k<key.length){const p=mod(cv-key[k]);if(p){const w=lp(m,a,b,p);add(k+1,b,p,x.z+w,x.v+w,x.plain.concat(p))}}}states=next;if(!states.size)return {z:-Infinity,plain:[]}}
 let z=-Infinity,best=null;for(const x of states.values()){z=la(z,x.z);if(!best||x.v>best.v)best=x}return {z,plain:best.plain}}
 function nullLL(row){let states=new Map([[29*30+29,0]]);const m=models[0];for(const cv of row.slice(0,H)){const next=new Map();for(const [id,z] of states){const a=Math.floor(id/30),b=id%30;for(let p=0;p<Q;p++){if(p===0&&cv!==0)continue;const v=z+lp(m,a,b,p)-(p===0?0:Math.log(Q)),nid=b*30+p;next.set(nid,la(next.get(nid)??-Infinity,v))}}states=next}let z=-Infinity;for(const x of states.values())z=la(z,x);return z}

function factors(rows,masks,chosenKey,chosenScore){
 const by=Array.from({length:N},()=>[]);let constant=0;
 for(let j=0;j<rows.length;j++){const row=rows[j],mask=masks[j],m=models[dirs[j]],sym=[[-2,0],[-2,0]];let k=0;
 for(let i=0;i<N;i++){if(mask[i]){if(row[i]!==0)throw Error("nonzero held");sym.push([-1,0])}else sym.push([k++,row[i]])}
 for(let i=2;i<sym.length;i++){const [a,b,x]=sym.slice(i-2,i+1),k=Math.max(a[0],b[0],x[0]);if(k<0){constant+=lp(m,a[0]===-2?29:0,b[0]===-2?29:0,0);continue}const offsets=[a,b,x].map(y=>y[0]<0?y[0]:k-y[0]);if(offsets.some(x=>x>2))throw Error("factor span");by[k].push({m,offsets,cvs:[a[1],b[1],x[1]]})}
 }
 const weights=[],maxLogs=[];let replay=constant;
 for(let k=0;k<N;k++){const size=k===0?Q:k===1?S:T,arr=new Float64Array(size),terms=by[k];let max=-Infinity;
 for(let a=0;a<size;a++){const h=k>=2?Math.floor(a/S):0,j=k>=1?Math.floor(a/Q)%Q:0,l=a%Q,keys=[l,j,h];let z=0;for(const t of terms){const sy=t.offsets.map((o,i)=>o===-2?29:o===-1?0:mod(t.cvs[i]-keys[o]));if(t.offsets[2]>=0&&sy[2]===0){z=-Infinity;break}z+=lp(t.m,sy[0],sy[1],sy[2])}arr[a]=z;if(z>max)max=z}
 if(!Number.isFinite(max))throw Error("empty factor");
 const chosen=k===0?chosenKey[0]:k===1?chosenKey[0]*Q+chosenKey[1]:(chosenKey[k-2]*Q+chosenKey[k-1])*Q+chosenKey[k];replay+=arr[chosen];
 for(let a=0;a<size;a++)arr[a]=Math.exp(arr[a]-max);weights.push(arr);maxLogs.push(max)
 }
 if(Math.abs(replay-chosenScore)>1e-7)throw Error("factor/beam replay "+replay+" vs "+chosenScore);
 return {weights,maxLogs,constant};
}
function fitMarginal(weights){
 let f=new Float64Array(S);f[0]=1;let logZ=0;
 for(let k=0;k<N;k++){const a=weights[k],next=new Float64Array(S);for(let h=0;h<Q;h++)for(let j=0;j<Q;j++){const state=h*Q+j,v=f[state];if(v===0)continue;const base=k===0?0:k===1?j*Q:state*Q;for(let l=0;l<Q;l++)next[j*Q+l]+=v*a[base+l]}const z=next.reduce((s,x)=>s+x,0);if(!z)return -Infinity;for(let i=0;i<S;i++)next[i]/=z;logZ+=Math.log(z);f=next}return logZ;
}
function heldMarginal(row,weights,wantPlain){
 const m=models[0],pm={u:m.u.map(Math.exp),b:m.b.map(Math.exp),t:m.t.map(Math.exp)},prob=(a,b,x)=>b===29?pm.u[x]:a===29?pm.b[b*Q+x]:pm.t[(a*Q+b)*Q+x];
 let groups=new Map([[0,{f:new Float64Array(S),v:wantPlain?new Float64Array(S):null}]]);groups.get(0).f[0]=1;if(wantPlain)groups.get(0).v[0]=1;let logZ=0;const back=[];
 for(let k=0;k<N;k++){const next=new Map(),w=weights[k],bp=new Map();function group(g){let o=next.get(g);if(!o){o={f:new Float64Array(S),v:wantPlain?new Float64Array(S):null};next.set(g,o);if(wantPlain)bp.set(g,new Int32Array(S).fill(-1))}return o}
 for(const [g,o] of groups){const p=Math.floor(g/2),flag=g%2;
 for(let h=0;h<Q;h++)for(let j=0;j<Q;j++){const id=h*Q+j,prior=o.f[id],v=wantPlain?o.v[id]:0;if(prior===0&&v===0)continue;const base=k===0?0:k===1?j*Q:id*Q;
 let a=29,b=29;if(p<H&&k>0){b=mod(row[p-1]-j);if(b===0)throw Error("active zero history");a=flag?0:k>=2?mod(row[p-2]-h):29}
 let q=p,skipProb=1;
 while(true){
 if(q===H){const ng=H*2,z=group(ng),ptr=wantPlain?bp.get(ng):null;for(let l=0;l<Q;l++){const factor=w[base+l]*skipProb,nid=j*Q+l;if(factor===0)continue;z.f[nid]+=prior*factor;if(wantPlain&&v*factor>z.v[nid]){z.v[nid]=v*factor;ptr[nid]=(g*Q+h)*2}}break}
 const ng=(q+1)*2+(q+1===H?0:q>p?1:0),z=group(ng),ptr=wantPlain?bp.get(ng):null,cv=row[q];
 for(let l=0;l<Q;l++){const x=mod(cv-l);if(!x)continue;const factor=w[base+l]*skipProb*prob(a,b,x),nid=j*Q+l;if(!factor)continue;z.f[nid]+=prior*factor;if(wantPlain&&v*factor>z.v[nid]){z.v[nid]=v*factor;ptr[nid]=(g*Q+h)*2+1}}
 if(cv!==0)break;skipProb*=prob(a,b,0);a=b;b=0;q++;
 }
 }}
 let sum=0,mv=0;for(const [g,o] of next){let active=false;for(let i=0;i<S;i++){sum+=o.f[i];if(o.f[i])active=true;if(wantPlain&&o.v[i]>mv)mv=o.v[i]}if(!active)next.delete(g)}if(!sum)return {z:-Infinity,plain:[]};logZ+=Math.log(sum);for(const o of next.values())for(let i=0;i<S;i++){o.f[i]/=sum;if(wantPlain)o.v[i]/=mv}groups=next;if(wantPlain)back.push(bp);
 }
 const final=groups.get(H*2);if(!final)return {z:-Infinity,plain:[]};const total=final.f.reduce((a,b)=>a+b,0);let plain=[];if(wantPlain){plain=Array(H).fill(0);let id=0,g=H*2;for(let i=1;i<S;i++)if(final.v[i]>final.v[id])id=i;for(let k=N-1;k>=0;k--){const ptr=back[k].get(g)?.[id];if(ptr===undefined||ptr<0)throw Error("missing backpointer");const consumed=ptr%2,pre=Math.floor(ptr/2),pg=Math.floor(pre/Q),h=pre%Q,p=Math.floor(g/2),pp=Math.floor(pg/2);if(consumed){if(p<=pp)throw Error("no consumed position");plain[p-1]=mod(row[p-1]-(id%Q))}id=h*Q+Math.floor(id/Q);g=pg}if(g!==0||id!==0)throw Error("bad trace")}
 return {z:logZ+Math.log(total),plain};
}
function predict(rows,fitResult,heldRows,withPlain){
 const f=factors(rows,fitResult.masks,fitResult.key,fitResult.score),z=fitMarginal(f.weights);const results=heldRows.map((row,j)=>{const out=heldMarginal(row,f.weights,withPlain&&j===0);return {bf:Number.isFinite(out.z)?out.z-z-nullLL(row):null,plain:out.plain}});
 return results;
}
 let state=config.seed;const rand=k=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return Math.floor(state/4294967296*k)},starts=native.flatMap((a,j)=>Array.from({length:Math.floor(a.length/N)},(_,i)=>({j,i:i*N})));
 function sample(){const pool=starts.slice(),chosen=[];for(let j=0;j<7;j++){const x=pool.splice(rand(pool.length),1)[0],a=native[x.j].slice(x.i,x.i+N);chosen.push(dirs[j]?a.reverse():a)}return chosen}
 const keygen=()=>Array.from({length:N},()=>rand(Q)),enc=(a,k)=>{let j=0;return a.map(v=>v?(v+k[j++])%Q:0)},acc=(a,b)=>a.reduce((s,x,i)=>s+(x===b[i]),0);
 const controls=[];for(let j=0;j<config.trials;j++){const p=sample(),k=keygen(),rows=p.map(a=>enc(a,k)),wrong=enc(p[6],keygen()),ir=p.map(a=>enc(a,keygen()));if(j<(config.skip??0)||j>=(config.skip??0)+(config.count??config.trials))continue;const a=fit(rows.slice(0,6),config.width),ia=fit(ir.slice(0,6),config.width);const pr=a.complete?predict(rows.slice(0,6),a,[rows[6],wrong],true):[{bf:null,plain:[]},{bf:null,plain:[]}],ipr=ia.complete?predict(ir.slice(0,6),ia,[ir[6]],false):[{bf:null}];const maskErrors=a.complete?a.masks.reduce((s,m,i)=>s+m.reduce((q,v,j)=>q+(v!==(p[i][j]===0)),0),0):null;
 if(j===0){const delta=Array.from({length:N},(_,i)=>{const w=new Float64Array(i===0?Q:i===1?S:T);w[i===0?k[0]:i===1?k[0]*Q+k[1]:(k[i-2]*Q+k[i-1])*Q+k[i]]=1;return w});const x=heldMarginal(rows[6],delta,true),y=held(rows[6],k);if(Math.abs(x.z-y.z)>1e-8||x.plain.join()!=y.plain.join())throw Error("held exact cross-check "+x.z+" "+y.z)}
 controls.push({positive:{complete:a.complete,fitScore:a.score,keyCorrect:acc(a.key.slice(0,H),k),maskErrors,heldCorrect:acc(pr[0].plain,p[6]),heldBF:pr[0].bf,expanded:a.expanded},wrongHeld:{heldBF:pr[1].bf},independent:{complete:ia.complete,fitScore:ia.score,heldBF:ipr[0].bf,expanded:ia.expanded}})}
 const gate=controls.filter(x=>x.positive.complete&&x.positive.keyCorrect>=81&&x.positive.heldCorrect>=81).length>=Math.ceil(controls.length*11/12)&&Math.min(...controls.map(x=>x.positive.heldBF??-Infinity))>Math.max(...controls.flatMap(x=>[x.wrongHeld.heldBF??-Infinity,x.independent.heldBF??-Infinity]));
 let original=null;if((gate&&config.original&&controls.length===config.trials)||config.originalOnly){const rows=[];for(let j=0;j<3;j++){const a=c.pages.find(p=>p.page===j).indices;rows.push(a.slice(0,N),a.slice(-N).reverse())}rows.push(c.pages.find(p=>p.page===15).indices.slice(9,9+N));const a=fit(rows.slice(0,6),config.width),pr=a.complete?predict(rows.slice(0,6),a,[rows[6]],true)[0]:null;original={fit:a,prediction:pr}}

 return {config,controls,gate,original};
}
const files=paths.map(p=>fs.readFileSync(p,'utf8'));
const config=process.argv.includes('--pilot')?{"width":128,"baseline":2.4,"seed":2591891900,"trials":4,"original":false}:{width:256,baseline:2.4,seed:0x4a239e07,trials:12,original:true};
if(process.argv.length>2&&!process.argv.includes('--pilot')){const a=process.argv.slice(2);if(a[0]==='--batch'){config.skip=Number(a[1]);config.count=Number(a[2]);config.original=false}else if(a[0]==='--original-after-calibration'){config.skip=config.trials;config.count=0;config.originalOnly=true;}}
console.log(JSON.stringify(run(JSON.parse(files[0]),JSON.parse(files[1]),files.slice(2),config),null,2));
