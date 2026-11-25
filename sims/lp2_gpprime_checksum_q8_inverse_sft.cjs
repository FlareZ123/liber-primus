'use strict';
const fs=require('node:fs');
const paths=["resources/liber-primus/lp2-corpus.json","resources/control/gibran_prophet_58585.txt","resources/control/blake_song_of_liberty_train.txt","resources/liber-primus/lp1-plaintext-reference.txt"];
function experiment(corpus,gibran,blake,lp1){
 const A=29,Q=8, primes=corpus.prime;
 const mod=x=>(x%A+A)%A;
 const tr=corpus.translit;
 const tok=Object.fromEntries(tr.map((x,i)=>[x,i]));Object.assign(tok,{ING:21,IO:27,K:5,Q:5,V:1,Z:15});
 function encodeLatin(text){return (text.toUpperCase().match(/[A-Z]+/g)||[]).flatMap(w=>{w=w.replace(/QU/g,"CW");let p=[];for(let i=0;i<w.length;){let t=[3,2,1].map(n=>w.slice(i,i+n)).find(x=>Object.hasOwn(tok,x));if(!t)throw Error(w.slice(i));p.push(tok[t]);i+=t.length}return p})}
 function clock(C,s=0){let states=[];for(const c of C){states.push(s);s=(s+primes[c])%Q}return [states,s]}
 function encrypt(P,key,s=0){let C=[];for(const p of P){let c=mod(p+key[s]);C.push(c);s=(s+primes[c])%Q}return C}
 function decode(C,key,s=0){const [states]=clock(C,s);return C.map((c,i)=>mod(c-key[states[i]]))}
 const train=encodeLatin(gibran.split("*** START OF THIS PROJECT GUTENBERG EBOOK THE PROPHET ***")[1].split("*** END OF THIS PROJECT GUTENBERG EBOOK THE PROPHET ***")[0]), B=encodeLatin(blake.split("BEGIN SOURCE TEXT")[1].split("END SOURCE TEXT")[0]), L=encodeLatin(lp1.split("\n").filter(x=>!x.startsWith("#")&&!/^\s*$/.test(x)).join("\n"));
 const counts=Array(A).fill(.5),big=Array.from({length:A},()=>Array(A).fill(.5));for(let i=0;i<train.length;i++){counts[train[i]]++;if(i)big[train[i-1]][train[i]]++}
 const logU=counts.map(x=>Math.log(x/counts.reduce((a,b)=>a+b,0)));
 const logB=big.map(row=>row.map(x=>Math.log(x/row.reduce((a,b)=>a+b,0))));
 const score=P=>P.slice(1).reduce((a,p,i)=>a+logB[P[i]][p],0)/Math.max(1,P.length-1);
 let seed=0x3301761;function rand(n){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)%n}
 function bounds(C){const [S]=clock(C);let h=Array.from({length:Q},()=>Array(A).fill(0));C.forEach((c,i)=>h[S[i]][c]++);const options=h.map(row=>row.map((_,k)=>({e:row[mod(18+k)],eo:row[mod(18+k)]+row[mod(3+k)],rare:row[mod(11+k)]+row[mod(12+k)],ll:row.reduce((s,n,c)=>s+n*logU[mod(c-k)],0)})));return {maxE:options.reduce((a,row)=>a+Math.max(...row.map(x=>x.e)),0),minRare:options.reduce((a,row)=>a+Math.min(...row.map(x=>x.rare)),0),maxEO:options.reduce((a,row)=>a+Math.max(...row.map(x=>x.eo)),0),maxUnigram:options.reduce((a,row)=>a+Math.max(...row.map(x=>x.ll)),0)/C.length,stateSizes:h.map(row=>row.reduce((a,b)=>a+b,0))}}
 function windowBounds(P,n){if(n>P.length)return null;let h=Array(A).fill(0);P.slice(0,n).forEach(x=>h[x]++);let minE=Infinity,maxRare=0,minEO=Infinity,minUnigram=Infinity,maxUnigram=-Infinity;for(let i=0;;i++){minE=Math.min(minE,h[18]);maxRare=Math.max(maxRare,h[11]+h[12]);minEO=Math.min(minEO,h[18]+h[3]);const ll=h.reduce((s,v,c)=>s+v*logU[c],0)/n;minUnigram=Math.min(minUnigram,ll);maxUnigram=Math.max(maxUnigram,ll);if(i+n===P.length)break;h[P[i]]--;h[P[i+n]]++}return {windows:P.length-n+1,minE,maxRare,minEO,minUnigram,maxUnigram}}
 function fit(C){const [S]=clock(C), u=Array.from({length:Q},()=>Array(A).fill(0)), tables=Array.from({length:Q*Q},()=>new Float64Array(A*A));for(let i=0;i<C.length;i++){for(let k=0;k<A;k++)u[S[i]][k]+=logU[mod(C[i]-k)];if(i){let T=tables[S[i-1]*Q+S[i]];for(let k=0;k<A;k++)for(let l=0;l<A;l++)T[k*A+l]+=logB[mod(C[i-1]-k)][mod(C[i]-l)]}}
 const argmax=a=>a.indexOf(Math.max(...a));const start=u.map(argmax);
 function local(k,j,v){let z=tables[j*Q+j][v*A+v];for(let h=0;h<Q;h++)if(h!==j){z+=tables[j*Q+h][v*A+k[h]]+tables[h*Q+j][k[h]*A+v]}return z}
 function total(k){let z=0;for(let j=0;j<Q;j++)for(let h=0;h<Q;h++)z+=tables[j*Q+h][k[j]*A+k[h]];return z}
 let best=null;for(let i=0;i<256;i++){let k=i===0?start.slice():i<128?start.map(v=>rand(3)?v:rand(A)):Array.from({length:Q},()=>rand(A));for(let pass=0;pass<40;pass++){let change=false;for(let jj=0;jj<Q;jj++){let j=(jj+pass)%Q,old=k[j],v=argmax(Array.from({length:A},(_,v)=>local(k,j,v)));if(local(k,j,v)>local(k,j,old)+1e-9){k[j]=v;change=true}}if(!change)break}let val=total(k);if(!best||val>best.val)best={key:k,val}}
 return best.key
 }
 function evaluate(C,n,truth,key){let k=fit(C.slice(0,n));let P=decode(C,k);if(encrypt(P,k).some((v,i)=>v!==C[i]))throw Error("replay");return {key:k,fit:score(P.slice(0,n)),held:score(P.slice(n)),keyExact:key?k.every((v,i)=>v===key[i]):undefined,heldExact:truth?P.slice(n).filter((v,i)=>v===truth[n+i]).length:undefined,heldN:C.length-n,output:P.slice(n).map(x=>tr[x]).join("")}}
 const chapters=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
 const controls=[];for(const [name,P,n] of [["Blake729",B.slice(0,729),262],["LP1_729",L.slice(0,729),262],["LP1_308",L.slice(900,1208),232],["Blake308",B.slice(200,508),232]]){if(P.length<=n)throw Error("short control");let key=Array.from({length:Q},()=>rand(A)),C=encrypt(P,key);let b=bounds(C);if(b.maxE<P.filter(x=>x===18).length||b.minRare>P.filter(x=>x===11||x===12).length||b.maxEO<P.filter(x=>x===18||x===3).length)throw Error("capacity invariant");let res=evaluate(C,n,P,key);controls.push({name,planted:key,...res})}
 const data=chapters.map(([a,b])=>{let C=corpus.pages.slice(a,b+1).flatMap(p=>p.indices);return {pages:[a,b],n:C.length,bounds:bounds(C),literary:windowBounds(train,C.length),fit:evaluate(C,corpus.pages[a].indices.length)}});
 return {trainN:train.length,blakeN:B.length,lp1N:L.length,data,controls}
}
const input=paths.map(p=>fs.readFileSync(p,'utf8'));
console.log(JSON.stringify(experiment(JSON.parse(input[0]),...input.slice(1)),null,2));
