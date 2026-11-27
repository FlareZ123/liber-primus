'use strict';
const fs=require('node:fs');
function experiment(corpus){
 const S=corpus.prime,pages=corpus.pages.slice(0,56).filter(x=>x.indices.length);
 const mod=(x,m)=>(x%m+m)%m,gcd=(a,b)=>b?gcd(b,a%b):a,lcm=(a,b)=>a/gcd(a,b)*b;
 function pow(a,e,m){if(m===1n)return 0n;let z=1n;a%=m;while(e){if(e&1n)z=z*a%m;a=a*a%m;e>>=1n}return z}
 function inv(a,m){let [x,y,u,v]=[mod(a,m),m,1n,0n];while(y){let q=x/y;[x,y,u,v]=[y,x-q*y,v,u-q*v]}if(x!==1n)throw Error("nonunit CRT");return mod(u,m)}
 function lam(f,j){return f.reduce((l,[p,r])=>{let k=r*j,P=BigInt(p),x=p===2&&k>=3?P**BigInt(k-2):(P-1n)*P**BigInt(k-1);return lcm(l,x)},1n)}
 function prepare(C,b,f){const B=BigInt(b),M=B**BigInt(C.length),x=C.reduceRight((s,d)=>s*B+BigInt(d),0n);
 const components=f.map(([p,r])=>{const P=BigInt(p),m=P**BigInt(r*C.length),other=M/m;let u=x%m,g=1n;while(u%P===0n&&g<m){u/=P;g*=P}return {q:m/g,u,g,crt:other*inv(other,m)%M}});
 return {M,x,components};
 }
 function unpack(row,parts){return row.components.reduce((z,c,i)=>(z+c.crt*c.g*parts[i])%row.M,0n)}
 function apply(row,e){return unpack(row,row.components.map(c=>pow(c.u,e,c.q)))}
 function decodeDigits(x,b,L){const B=BigInt(b),a=[];for(let j=0;j<L;j++){a.push(Number(x%B));x/=B}return a}
 function run(C,b,f,D,cap=512){
 const B=BigInt(b),legal=Array(b).fill(false);for(const x of D)legal[x]=true;
 const R=C.map(a=>prepare(a,b,f)),L=Math.max(...C.map(a=>a.length)),trace=[];
 const mk=(e,parts)=>({e,parts,ys:parts.map((p,i)=>unpack(R[i],p))});
 let step=lam(f,1),q=B,states=[];
 for(let e=0n;e<step;e++)if(gcd(e,step)===1n&&R.every(row=>legal[Number(apply(row,e)%B)])){const parts=R.map(row=>row.components.map(c=>pow(c.u,e,c.q)));states.push(mk(e,parts))}
 trace.push({depth:1,keys:states.length,active:R.length});
 if(!states.some(s=>s.e===1n%step))throw Error("identity lost at first digit");
 let powers=R.map(row=>row.components.map(c=>pow(c.u,step,c.q))),stop=null,work=0;
 for(let j=1;j<L;j++){
 const m=q*B,nextOrder=lam(f,j+1),ratio=nextOrder/step,active=C.map((a,i)=>a.length>j?i:-1).filter(i=>i>=0),next=[];
 if(work+states.length>50000){stop={digit:j,reason:"parent budget"};break}
 work+=states.length;
 outer:for(const s of states){
 const slopes=active.map(i=>{const row=R[i],parts=s.parts[i].map((v,k)=>v*powers[i][k]%row.components[k].q),y=unpack(row,parts),delta=mod(y-s.ys[i],m);if(delta%q!==0n)throw Error("nonlift");return [Number(s.ys[i]/q%B),Number(delta/q)]});
 for(let k=0n;k<ratio;k++){
 const e=s.e+k*step;if(gcd(e,nextOrder)!==1n)continue;
 const v=Number(k);if(!slopes.every(([d,h])=>legal[(d+v*h)%b]))continue;
 const parts=R.map((row,i)=>row.components.map((c,t)=>s.parts[i][t]*pow(powers[i][t],k,c.q)%c.q)),z=mk(e,parts);
 if(!active.every(i=>legal[Number(z.ys[i]/q%B)]))throw Error("linear lift mismatch");
 next.push(z);if(next.length>cap){stop={digit:j,reason:"candidate cap",active:active.length};break outer}
 }}
 if(stop)break;
 if(!next.some(s=>s.e===1n%nextOrder))throw Error("identity lost");
 states=next;q=m;step=nextOrder;powers=R.map((row,i)=>row.components.map((c,t)=>pow(powers[i][t],ratio,c.q)));
 trace.push({depth:j+1,keys:states.length,active:active.length});
 }
 const depth=trace.length;let fixed=0,covered=0,maxChanges=0;const pageCounts=[];
 for(let i=0;i<C.length;i++){const n=Math.min(depth,C[i].length),vary=Array(n).fill(false);for(const s of states){const a=decodeDigits(s.ys[i],b,n);for(let j=0;j<n;j++)if(a[j]!==C[i][j])vary[j]=true}let same=n-vary.filter(Boolean).length;fixed+=same;covered+=n;pageCounts.push({index:i,covered:n,forcedUnchanged:same})}
 for(const s of states){let n=0;for(let i=0;i<C.length;i++){const a=decodeDigits(s.ys[i],b,Math.min(depth,C[i].length));n+=a.filter((d,j)=>d!==C[i][j]).length}maxChanges=Math.max(maxChanges,n)}
 return {depth,stop,states:states.length,exponents:states.map(s=>String(s.e)),covered,fixed,maxChanges,trace,pageCounts,work};
 }
 // For identity-containing input, compare every residue against direct exhaustive full CRT application.
 const toy=[];
 for(const [b,f] of [[6,[[2,1],[3,1]]],[10,[[2,1],[5,1]]],[8,[[2,3]]]]){
 const D=[1,2,3,5].filter(x=>x<b),C=[[1,2,3],[3,1],[2,2,1],[5,3,2]].map(a=>a.map(x=>x%b)),z=run(C,b,f,D,10000),R=C.map(a=>prepare(a,b,f)),o=lam(f,3),keys=[];
 for(let e=0n;e<o;e++)if(gcd(e,o)===1n&&R.every((row,i)=>decodeDigits(apply(row,e),b,C[i].length).every(x=>D.includes(x))))keys.push(String(e));
 if(z.depth!==3||JSON.stringify(z.exponents.sort())!==JSON.stringify(keys.sort()))throw Error("toy mismatch");toy.push({b,keys:keys.length});
 }
 const out={toy,plant:[],original:[]};
 for(const [b,f] of [[110,[[2,1],[5,1],[11,1]]],[128,[[2,7]]]]){
 // All prime-pair inputs whose frozen cube remains prime digits; retain the actual cube exponent.
 const C=[];for(const a of S)for(const d of S){let v=[a,d],row=prepare(v,b,f),P=decodeDigits(apply(row,3n),b,2);if(P.every(x=>S.includes(x)))C.push(v)}
 const z=run(C,b,f,S,10000);if(!z.exponents.includes("3"))throw Error("cube lost");out.plant.push({b,pairs:C.length,keys:z.exponents,depth:z.depth});
 for(const reverse of [false,true]){
 const C=pages.map(p=>(reverse?[...p.indices].reverse():p.indices).map(x=>S[x])),z=run(C,b,f,S);
 out.original.push({b,reverse,...z,total:C.reduce((s,a)=>s+a.length,0)});
 }}
 return out;
}
console.log(JSON.stringify(experiment(JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json'))),null,2));
