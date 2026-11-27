// Agent 8: transparent-F six-frame beam inverse, exact heldout decoder.
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
 const best=beam.find(x=>x.codes.every(v=>uncode(v)[0]===N));if(!best)return {key:[],score:null,expanded,complete:false};const key=[];for(let x=best;x.parent;x=x.parent)key.unshift(x.k);return {key,score:best.score-config.baseline*R*N,expanded,complete:true};
 }
 const la=(a,b)=>{if(a===-Infinity)return b;if(b===-Infinity)return a;const m=Math.max(a,b);return m+Math.log1p(Math.exp(Math.min(a,b)-m))};
 function held(row,key){let states=new Map([[code(0,29,29),{z:0,v:0,plain:[]}]]);const m=models[0];for(const cv of row.slice(0,H)){const next=new Map();function add(k,a,b,z,v,p){const id=code(k,a,b),old=next.get(id);if(!old)next.set(id,{z,v,plain:p});else{old.z=la(old.z,z);if(v>old.v){old.v=v;old.plain=p}}}for(const [id,x] of states){const [k,a,b]=uncode(id);if(cv===0){const w=lp(m,a,b,0);add(k,b,0,x.z+w,x.v+w,x.plain.concat(0))}if(k<key.length){const p=mod(cv-key[k]);if(p){const w=lp(m,a,b,p);add(k+1,b,p,x.z+w,x.v+w,x.plain.concat(p))}}}states=next;if(!states.size)return {z:-Infinity,plain:[]}}
 let z=-Infinity,best=null;for(const x of states.values()){z=la(z,x.z);if(!best||x.v>best.v)best=x}return {z,plain:best.plain}}
 function nullLL(row){let states=new Map([[29*30+29,0]]);const m=models[0];for(const cv of row.slice(0,H)){const next=new Map();for(const [id,z] of states){const a=Math.floor(id/30),b=id%30;for(let p=0;p<Q;p++){if(p===0&&cv!==0)continue;const v=z+lp(m,a,b,p)-(p===0?0:Math.log(Q)),nid=b*30+p;next.set(nid,la(next.get(nid)??-Infinity,v))}}states=next}let z=-Infinity;for(const x of states.values())z=la(z,x);return z}
 let state=config.seed;const rand=k=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return Math.floor(state/4294967296*k)},starts=native.flatMap((a,j)=>Array.from({length:Math.floor(a.length/N)},(_,i)=>({j,i:i*N})));
 function sample(){const pool=starts.slice(),chosen=[];for(let j=0;j<7;j++){const x=pool.splice(rand(pool.length),1)[0],a=native[x.j].slice(x.i,x.i+N);chosen.push(dirs[j]?a.reverse():a)}return chosen}
 const keygen=()=>Array.from({length:N},()=>rand(Q)),enc=(a,k)=>{let j=0;return a.map(v=>v?(v+k[j++])%Q:0)},acc=(a,b)=>a.reduce((s,x,i)=>s+(x===b[i]),0);
 const controls=[];for(let j=0;j<config.trials;j++){const p=sample(),k=keygen(),rows=p.map(a=>enc(a,k)),a=fit(rows.slice(0,6),config.width),hh=held(rows[6],a.key),wrong=enc(p[6],keygen()),wh=held(wrong,a.key),ir=p.map(a=>enc(a,keygen())),ia=fit(ir.slice(0,6),config.width),ih=held(ir[6],ia.key);controls.push({positive:{complete:a.complete,fitScore:a.score,keyCorrect:acc(a.key.slice(0,H),k),heldCorrect:acc(hh.plain,p[6]),heldBF:Number.isFinite(hh.z)?hh.z-nullLL(rows[6]):null,expanded:a.expanded},wrongHeld:{heldBF:Number.isFinite(wh.z)?wh.z-nullLL(wrong):null},independent:{complete:ia.complete,fitScore:ia.score,heldBF:Number.isFinite(ih.z)?ih.z-nullLL(ir[6]):null,expanded:ia.expanded}})}
 const gate=controls.filter(x=>x.positive.complete&&x.positive.keyCorrect>=81&&x.positive.heldCorrect>=81).length>=Math.ceil(config.trials*11/12)&&Math.min(...controls.map(x=>x.positive.heldBF??-Infinity))>Math.max(...controls.flatMap(x=>[x.wrongHeld.heldBF??-Infinity,x.independent.heldBF??-Infinity]));
 let original=null;if(gate&&config.original){const rows=[];for(let j=0;j<3;j++){const a=c.pages.find(p=>p.page===j).indices;rows.push(a.slice(0,N),a.slice(-N).reverse())}rows.push(c.pages.find(p=>p.page===15).indices.slice(9,9+N));const a=fit(rows.slice(0,6),config.width),hh=held(rows[6],a.key);original={fit:a,held:hh,heldBF:Number.isFinite(hh.z)?hh.z-nullLL(rows[6]):null}}
 return {config,controls,gate,original};
}
const files=paths.map(p=>fs.readFileSync(p,'utf8'));
const config=process.argv.includes('--pilot')?{"width":128,"baseline":2.4,"seed":2591891900,"trials":4,"original":false}:{width:256,baseline:2.4,seed:0x4a239e07,trials:12,original:true};
console.log(JSON.stringify(run(JSON.parse(files[0]),JSON.parse(files[1]),files.slice(2),config),null,2));
