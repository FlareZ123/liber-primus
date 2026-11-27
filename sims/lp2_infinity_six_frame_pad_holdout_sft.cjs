// Agent 8: exact shared-pad marginal / ornament holdout.
const fs=require('node:fs');
const paths=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/external/2013-book-of-law-I.txt","resources/external/2013-book-of-law-II.txt","resources/external/2013-book-of-law-III.txt"];
function run(c,n,books){
const Q=29,N=100,mod=x=>(x+Q)%Q,idx=new Map(c.runes.map((x,i)=>[x,i]));
const native=n.sections.map(s=>[...s.source_text].filter(x=>idx.has(x)).map(x=>idx.get(x)));
const dict=new Map(c.translit.map((x,i)=>[x,i]));for(const [a,b] of Object.entries({V:"U",K:"C",Q:"C",Z:"S",ING:"NG"}))dict.set(a,dict.get(b));
function translit(s){const w=s.toUpperCase().match(/[A-Z]+/g)||[];return w.flatMap(x=>{const a=[];for(let i=0;i<x.length;){let t=[x.slice(i,i+3),x.slice(i,i+2),x[i]].find(t=>dict.has(t));if(t){a.push(dict.get(t));i+=t.length}else i++}return a})}
const corp=books.map(translit);function model(rev){let u=Array(Q).fill(.5),b=Array.from({length:Q},()=>Array(Q).fill(.5));for(const source of corp){const a=rev?source.slice().reverse():source;for(let i=0;i<a.length;i++){u[a[i]]++;if(i)b[a[i-1]][a[i]]++}}const norm=a=>a.map(x=>Math.log(x/a.reduce((s,t)=>s+t,0)));return {u:norm(u),b:b.map(norm)}}
const models=[model(false),model(true)];const dirs=[0,1,0,1,0,1,0];const lse=a=>{const m=Math.max(...a);return m+Math.log(a.reduce((s,v)=>s+Math.exp(v-m),0))};
function decode(rows){const R=rows.length;let F=[],V=[],back=[];for(let k=0;k<Q;k++)F[k]=V[k]=rows.reduce((s,row,j)=>s+models[dirs[j]].u[mod(row[0]-k)],0);for(let i=1;i<N;i++){const f=[],v=[],p=[];for(let k=0;k<Q;k++){let z=[],best=-Infinity,bk=-1;for(let h=0;h<Q;h++){let t=0;for(let j=0;j<R;j++)t+=models[dirs[j]].b[mod(rows[j][i-1]-h)][mod(rows[j][i]-k)];z.push(F[h]+t);if(V[h]+t>best){best=V[h]+t;bk=h}}f[k]=lse(z);v[k]=best;p[k]=bk}F=f;V=v;back.push(p)}const key=[V.indexOf(Math.max(...V))];for(let i=N-2;i>=0;i--)key.unshift(back[i][key[0]]);return {logZ:lse(F),key}}
function trial(rows){const a=decode(rows.slice(0,6)),b=decode(rows);return {fitBF:a.logZ+5*N*Math.log(Q),heldBF:b.logZ-a.logZ+N*Math.log(Q),key:a.key,held:rows[6].map((v,i)=>mod(v-a.key[i]))}}
let state=0x37ae4981;const rand=k=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return Math.floor(state/4294967296*k)};
const starts=native.flatMap((a,j)=>Array.from({length:Math.floor(a.length/N)},(_,i)=>({j,i:i*N})));function sample(){const pool=starts.slice(),chosen=[];for(let j=0;j<7;j++){const x=pool.splice(rand(pool.length),1)[0],a=native[x.j].slice(x.i,x.i+N);chosen.push(dirs[j]?a.reverse():a)}return chosen}
function enc(a,key){return a.map((v,i)=>(v+key[i])%Q)}const acc=(a,b)=>a.reduce((s,x,i)=>s+(x===b[i]),0);
const controls=[];for(let j=0;j<24;j++){const p=sample(),k=Array.from({length:N},()=>rand(Q)),rows=p.map(a=>enc(a,k));const t=trial(rows);const wrong=trial([...rows.slice(0,6),enc(p[6],Array.from({length:N},()=>rand(Q)))]);const indep=trial(p.map(a=>enc(a,Array.from({length:N},()=>rand(Q)))));controls.push({positive:{fitBF:t.fitBF,heldBF:t.heldBF,keyCorrect:acc(t.key,k),heldCorrect:acc(t.held,p[6])},wrongHeld:{heldBF:wrong.heldBF},independent:{fitBF:indep.fitBF,heldBF:indep.heldBF}})}
const pos=controls.map(x=>x.positive.heldBF),neg=controls.map(x=>x.wrongHeld.heldBF);const gate=Math.min(...pos)>Math.max(...neg)&&controls.filter(x=>x.positive.heldCorrect>=90).length>=22;
const rows=[];for(let j=0;j<3;j++){const a=c.pages.find(p=>p.page===j).indices;rows.push(a.slice(0,N),a.slice(-N).reverse())}rows.push(c.pages.find(p=>p.page===15).indices.slice(9,9+N));if(rows.some(a=>a.length!==N))throw Error("geometry");
return {N,trainingLengths:corp.map(x=>x.length),controls,gate,original:gate?trial(rows):null};
}
const files=paths.map(p=>fs.readFileSync(p,'utf8'));
console.log(JSON.stringify(run(JSON.parse(files[0]),JSON.parse(files[1]),files.slice(2)),null,2));
