// Agent 8: shared cycle-walk projective power receiver on the fixed infinity-mark registration.
const fs=require("node:fs");
const paths=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/external/2013-book-of-law-I.txt","resources/external/2013-book-of-law-II.txt","resources/external/2013-book-of-law-III.txt","resources/external/blake-marriage-1906-gutenberg45315.txt","resources/external/kybalion-gitenberg-14209.txt"];
function run(c,n,books,mode="calibrate"){
 const Q=29,K=30,N=100,KS=K*K,KT=KS*K,QS=Q*Q,QT=QS*Q,dirs=[0,1,0,1,0,1,0];
 const mod=x=>((x%Q)+Q)%Q,inv=Array.from({length:Q},(_,x)=>x===0?0:Array.from({length:Q},(_,i)=>i).find(y=>mod(x*y)===1));
 const values=[3299,3298,3296,3294,3288,3278,3258,3222,3152,3038,2838,2472,1820,708,1206,4516];
 const mul=(a,b)=>[mod(a[0]*b[0]+a[1]*b[2]),mod(a[0]*b[1]+a[1]*b[3]),mod(a[2]*b[0]+a[3]*b[2]),mod(a[2]*b[1]+a[3]*b[3])];
 const matrices=Array.from({length:4},(_,i)=>values.slice(4*i,4*i+4).map(mod));
 const t=matrices.reduce((a,b)=>mul(b,a),[1,0,0,1]);
 if(t.join(",")!=="11,8,13,7")throw Error("source matrix mismatch: "+t);
 const pgl=(x,m)=>{const a=x===Q?m[0]:mod(m[0]*x+m[1]),b=x===Q?m[2]:mod(m[2]*x+m[3]);return b?mod(a*inv[b]):Q};
 const powers=[[1,0,0,1]];for(let i=1;i<=K;i++)powers.push(mul(t,powers[i-1]));
 if(powers[K][0]!==powers[K][3]||powers[K][1]||powers[K][2])throw Error("order");
 const d=Array.from({length:Q},(_,x)=>Array.from({length:K},(_,k)=>{let y=pgl(x,powers[k]);if(y===Q)y=pgl(y,powers[k]);if(y===Q)throw Error("invalid cycle walk");return y}));
 const e=Array.from({length:Q},(_,x)=>Array.from({length:K},(_,k)=>d[x][(K-k)%K]));
 const signatures=new Set();for(let k=0;k<K;k++){const col=d.map(x=>x[k]);if(new Set(col).size!==Q)throw Error("not bijective");signatures.add(col.join(","));for(let x=0;x<Q;x++)if(e[d[x][k]][k]!==x)throw Error("inverse")}
 if(signatures.size!==K)throw Error("duplicate keys");
 const idx=new Map(c.runes.map((x,i)=>[x,i])),dict=new Map(c.translit.map((x,i)=>[x,i]));for(const [a,b] of Object.entries({V:"U",K:"C",Q:"C",Z:"S",ING:"NG"}))dict.set(a,dict.get(b));
 const native=n.sections.map(s=>[...s.source_text].filter(x=>idx.has(x)).map(x=>idx.get(x)));
 function translit(s){return(s.toUpperCase().match(/[A-Z]+/g)||[]).flatMap(x=>{const a=[];for(let i=0;i<x.length;){const t=[x.slice(i,i+3),x.slice(i,i+2),x[i]].find(t=>dict.has(t));if(t){a.push(dict.get(t));i+=t.length}else i++}return a})}
 const corp=books.map(translit);
 function model(rev){const u=new Float64Array(Q).fill(.5),b=new Float64Array(QS),t=new Float64Array(QT);for(const source of corp){const a=rev?source.slice().reverse():source;for(let i=0;i<a.length;i++){u[a[i]]++;if(i)b[a[i-1]*Q+a[i]]++;if(i>1)t[(a[i-2]*Q+a[i-1])*Q+a[i]]++}}const us=u.reduce((a,b)=>a+b,0);for(let i=0;i<Q;i++)u[i]/=us;for(let h=0;h<Q;h++){let z=0;for(let k=0;k<Q;k++)z+=b[h*Q+k];for(let k=0;k<Q;k++)b[h*Q+k]=(b[h*Q+k]+10*u[k])/(z+10)}for(let h=0;h<QS;h++){let z=0;for(let k=0;k<Q;k++)z+=t[h*Q+k];for(let k=0;k<Q;k++)t[h*Q+k]=Math.log((t[h*Q+k]+8*b[(h%Q)*Q+k])/(z+8))}return{u:u.map(Math.log),b:b.map(Math.log),t}}
 const models=[model(false),model(true)];
 function decode(rows){const R=rows.length;let F=new Float64Array(KS),V=new Float64Array(KS);const back=[];for(let h=0;h<K;h++)for(let k=0;k<K;k++){let z=0;for(let j=0;j<R;j++){const a=d[rows[j][0]][h],b=d[rows[j][1]][k],m=models[dirs[j]];z+=m.u[a]+m.b[a*Q+b]}F[h*K+k]=V[h*K+k]=z}const tr=new Float64Array(KT);for(let i=2;i<N;i++){tr.fill(0);for(let j=0;j<R;j++){const a=d[rows[j][i-2]],b=d[rows[j][i-1]],cc=d[rows[j][i]],t=models[dirs[j]].t;for(let h=0;h<K;h++)for(let k=0;k<K;k++){const src=(a[h]*Q+b[k])*Q,dst=(h*K+k)*K;for(let l=0;l<K;l++)tr[dst+l]+=t[src+cc[l]]}}const f=new Float64Array(KS),v=new Float64Array(KS),p=new Uint8Array(KS),z=new Float64Array(K);for(let k=0;k<K;k++)for(let l=0;l<K;l++){let m=-Infinity,best=-Infinity,bk=0;for(let h=0;h<K;h++){const a=h*K+k,w=tr[a*K+l];z[h]=F[a]+w;if(z[h]>m)m=z[h];if(V[a]+w>best){best=V[a]+w;bk=h}}let s=0;for(let h=0;h<K;h++)s+=Math.exp(z[h]-m);const a=k*K+l;f[a]=m+Math.log(s);v[a]=best;p[a]=bk}F=f;V=v;back.push(p)}let best=0,m=-Infinity;for(let j=0;j<KS;j++){if(V[j]>V[best])best=j;if(F[j]>m)m=F[j]}const key=[Math.floor(best/K),best%K];for(let i=N-3;i>=0;i--)key.unshift(back[i][key[0]*K+key[1]]);return{logZ:m+Math.log(F.reduce((s,x)=>s+Math.exp(x-m),0)),key}}
 let state=0xab183cc7;const rand=k=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return Math.floor(state/4294967296*k)},starts=native.flatMap((a,j)=>Array.from({length:Math.floor(a.length/N)},(_,i)=>({j,i:i*N})));
 function sample(){const pool=starts.slice(),chosen=[];for(let j=0;j<7;j++){const x=pool.splice(rand(pool.length),1)[0],a=native[x.j].slice(x.i,x.i+N);chosen.push(dirs[j]?a.reverse():a)}return chosen}
 const keygen=()=>Array.from({length:N},()=>rand(K)),enc=(a,k)=>a.map((v,i)=>e[v][k[i]]),dec=(a,k)=>a.map((v,i)=>d[v][k[i]]),acc=(a,b)=>a.reduce((s,x,i)=>s+(x===b[i]),0),L=N*Math.log(Q),prior=N*Math.log(K),fit=a=>a.logZ-prior+6*L,held=(a,b)=>b.logZ-a.logZ+L;
 const metadata={N,Q,K,matrices,composite:t,order:K,distinctFiniteMaps:signatures.size,trainingLengths:corp.map(x=>x.length),seed:"0xab183cc7"};
 if(mode==="original"){
  const rows=[];for(let j=0;j<3;j++){const a=c.pages.find(p=>p.page===j).indices;rows.push(a.slice(0,N),a.slice(-N).reverse())}rows.push(c.pages.find(p=>p.page===15).indices.slice(9,9+N));const a=decode(rows.slice(0,6)),b=decode(rows),p=rows.map(row=>dec(row,a.key));if(rows.some((row,j)=>acc(enc(p[j],a.key),row)!==N))throw Error("original replay");
  return{metadata,original:{fitScore:fit(a),heldScore:held(a,b),key:a.key,fitPlain:p.slice(0,6),heldPlain:p[6],heldTranslit:p[6].map(v=>c.translit[v]).join(" ")}};
 }
 const controls=[];for(let j=0;j<6;j++){const p=sample(),k=keygen(),rows=p.map(a=>enc(a,k));if(rows.some((row,j)=>acc(dec(row,k),p[j])!==N))throw Error("plant");const a=decode(rows.slice(0,6)),b=decode(rows),wrong=decode([...rows.slice(0,6),enc(p[6],keygen())]),ir=p.map(a=>enc(a,keygen())),ia=decode(ir.slice(0,6)),ib=decode(ir);controls.push({positive:{fitScore:fit(a),heldScore:held(a,b),keyCorrect:acc(a.key,k),heldCorrect:acc(dec(rows[6],a.key),p[6])},wrongHeld:{heldScore:held(a,wrong)},independent:{fitScore:fit(ia),heldScore:held(ia,ib)}})}
 const gate=Math.min(...controls.map(x=>x.positive.heldScore))>Math.max(...controls.flatMap(x=>[x.wrongHeld.heldScore,x.independent.heldScore]))&&controls.filter(x=>x.positive.keyCorrect>=90&&x.positive.heldCorrect>=90).length>=5;
 return{metadata,controls,gate};
}
const files=paths.map(p=>fs.readFileSync(p,"utf8"));
const mode=process.argv.includes("--original-after-calibration")?"original":"calibrate";
console.log(JSON.stringify(run(JSON.parse(files[0]),JSON.parse(files[1]),files.slice(2),mode),null,2));
