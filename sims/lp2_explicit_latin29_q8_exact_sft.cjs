"use strict";
const fs=require("node:fs"),path=require("node:path");const read=f=>fs.readFileSync(path.join(__dirname,"..",f),"utf8");

function run(gp,texts,lp1){
const M=29,Q=8,N=29**3,mod=x=>(x%29+29)%29,alphabet="ABCDEFGHIJKLMNOPQRSTUVWXYZ .'";
const letter=x=>x<26;
const grammar=(a,b)=>a<26||a===26&&b<26||a===27&&b===26||a===28&&b<26;
const enc=s=>[...s].map(c=>alphabet.indexOf(c));
function normalize(s){
 s=s.toUpperCase().replace(/[’‘]/g,"'").replace(/[^A-Z .']/g," ").replace(/(^|[^A-Z])'|'(?![A-Z])/g,"$1 ").replace(/\s+/g," ").replace(/ +\./g,".").replace(/\.+/g,".").replace(/\.(?=[A-Z])/g,". ").replace(/(^| )\./g,"$1").replace(/\s+/g," ").trim();
 let out=[];for(let c of enc(s))if(c>=0&&(!out.length?letter(c):grammar(out.at(-1),c)))out.push(c);
 return out;
}
const train=texts.slice(0,2).map(normalize),donors=[normalize(texts[2]),normalize(lp1.split(/\r?\n/).filter(l=>{l=l.trim();return l&&!l.startsWith("#")&&!l.startsWith("[")&&!/^[0-9a-f]{25,}$/i.test(l)}).join(" "))];
const un=new Float64Array(M),bi=new Float64Array(M*M),tri=new Float64Array(N),hist=new Float64Array(M*M),hist1=new Float64Array(M);
for(let s of train)for(let i=0;i<s.length;i++){un[s[i]]++;if(i){bi[s[i-1]*M+s[i]]++;hist1[s[i-1]]++}if(i>=2){tri[(s[i-2]*M+s[i-1])*M+s[i]]++;hist[s[i-2]*M+s[i-1]]++}}
const total=un.reduce((a,b)=>a+b,0),U=Float64Array.from(un,c=>Math.log((c+.5)/(total+.5*M))),B=new Float64Array(M*M),T=new Float64Array(N);
for(let a=0;a<M;a++)for(let b=0;b<M;b++){const d=a*M+b;B[d]=Math.log((bi[d]+20*Math.exp(U[b]))/(hist1[a]+20));for(let c=0;c<M;c++)T[d*M+c]=Math.log((tri[d*M+c]+35*Math.exp(B[b*M+c]))/(hist[d]+35))}
function score(p){let s=U[p[0]]+B[p[0]*M+p[1]],ok=true,invalid=0;for(let i=1;i<p.length;i++){if(!grammar(p[i-1],p[i])){ok=false;invalid++}if(i>=2)s+=T[(p[i-2]*M+p[i-1])*M+p[i]]}return {ll:s,per:s/p.length,grammar:ok,violations:invalid}}
function decrypt(c,k,offset=0){return c.map((x,i)=>mod(x-k[(i+offset)%Q]))}
function encrypt(p,k,offset=0){return p.map((x,i)=>mod(x+k[(i+offset)%Q]))}
function solve(C){
 let positions=Array.from({length:Q},()=>[]);for(let i=1;i<C.length;i++)positions[i%Q].push(i);
 const valid=positions.map(xs=>{let a=new Uint8Array(M*M).fill(1);for(let i of xs){for(let x=0;x<M;x++){let p=mod(C[i-1]-x);for(let y=0;y<M;y++)if(!grammar(p,mod(C[i]-y)))a[x*M+y]=0}}return a});
 const F=Array.from({length:Q},()=>new Float64Array(N).fill(-Infinity));
 for(let q=0;q<Q;q++){const xs=positions[q].filter(i=>i>=2);for(let a=0;a<M;a++)for(let b=0;b<M;b++){
 if(!valid[(q+7)%Q][a*M+b])continue;for(let c=0;c<M;c++){
 if(!valid[q][b*M+c])continue;let s=0;for(let i of xs)s+=T[(mod(C[i-2]-a)*M+mod(C[i-1]-b))*M+mod(C[i]-c)];F[q][(a*M+b)*M+c]=s
 }}}
 const nbr=valid.map(a=>Array.from({length:M},(_,x)=>Array.from({length:M},(_,y)=>y).filter(y=>a[x*M+y])));
 let best=-Infinity,keyCode=-1,count=0,starts=0,ops=0;
 for(let a=0;a<M;a++)for(let b of nbr[1][a]){
 starts++;let d=new Float64Array(M*M).fill(-Infinity),codes=new Float64Array(M*M),ways=new Float64Array(M*M);
 d[a*M+b]=U[mod(C[0]-a)]+B[mod(C[0]-a)*M+mod(C[1]-b)];codes[a*M+b]=a*M+b;ways[a*M+b]=1;
 for(let q=2;q<Q;q++){
 let e=new Float64Array(M*M).fill(-Infinity),ec=new Float64Array(M*M),ew=new Float64Array(M*M);
 for(let x=0;x<M;x++)for(let y=0;y<M;y++){
 let j=x*M+y,v=d[j];if(!Number.isFinite(v))continue;
 for(let z of nbr[q][y]){ops++;let s=v+F[q][j*M+z],k=y*M+z;if(s>e[k]+1e-9){e[k]=s;ec[k]=codes[j]*M+z;ew[k]=ways[j]}else if(Math.abs(s-e[k])<1e-9)ew[k]+=ways[j]}
 }
 d=e;codes=ec;ways=ew;
 }
 for(let x=0;x<M;x++)for(let y=0;y<M;y++){
 let j=x*M+y;if(!valid[0][y*M+a]||!Number.isFinite(d[j]))continue;
 let s=d[j]+F[0][j*M+a]+F[1][(y*M+a)*M+b];
 if(s>best+1e-9){best=s;keyCode=codes[j];count=ways[j]}else if(Math.abs(s-best)<1e-9)count+=ways[j]
 }
 }
 if(!Number.isFinite(best))return {key:null,allowedPairs:valid.map(a=>a.reduce((x,y)=>x+y,0)),starts,ops};
 const k=Array(Q);let code=keyCode;for(let i=Q-1;i>=0;i--){k[i]=code%M;code=Math.floor(code/M)}
 const p=decrypt(C,k),check=score(p);if(!check.grammar||Math.abs(check.ll-best)>1e-7||encrypt(p,k).some((x,i)=>x!==C[i]))throw Error("DP/replay mismatch");
 return {key:k,ll:best,per:best/C.length,optimalKeys:count,allowedPairs:valid.map(a=>a.reduce((x,y)=>x+y,0)),starts,ops,trainText:p.map(x=>alphabet[x]).join("")}
}
const a=gp.pages.find(p=>p.page===54).indices,b=gp.pages.find(p=>p.page===55).indices,fit=a.length,hold=b.length;
let seed=0x33015429;function rng(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0}const randomKey=()=>Array.from({length:Q},()=>rng()%M);
const plants=[],nulls=[];
function result(C,truth,k,name,kind){
 const x=solve(C.slice(0,fit));
 if(!x.key)return {name,kind,...x};
 const p=decrypt(C.slice(fit),x.key,fit),s=score(p),joined=decrypt(C,x.key),invalidPositions=[];
 for(let i=fit;i<joined.length;i++)if(!grammar(joined[i-1],joined[i]))invalidPositions.push(i);
 const delimiters=joined.flatMap((x,i)=>x>=26?[{offset:i,char:alphabet[x]}]:[]);
 return {name,kind,...x,trueKey:k,exactKey:k?String(x.key)===String(k):null,heldoutCorrect:truth?p.filter((x,i)=>x===truth[fit+i]).length:null,holdout:s,invalidPositions,delimiters,heldoutText:p.map(x=>alphabet[x]).join(""),heldoutReplay:encrypt(p,x.key,fit).every((x,i)=>x===C[fit+i])}
}
for(let i=0;i<4;i++){
 const d=donors[i%2],off=[2000,150,10000,700][i];if(d.length<off+fit+hold)throw Error("short donor");
 const p=d.slice(off,off+fit+hold),k=randomKey();plants.push(result(encrypt(p,k),p,k,"latin"+i,"Latin29"));
 const c=p.map(x=>mod(x+rng()%M));nulls.push(result(c,null,null,"pad"+i,"iid pad"));
}
const tokens=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
function gpNative(s){let out=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");while(w){let t=tokens.find(t=>w.startsWith(t.t));if(!t)throw Error(w);out.push(t.i);w=w.slice(t.t.length)}}return out}
const native=gpNative(texts[2]);
for(let i=0;i<2;i++){let p=native.slice(3000+i*9000,3000+i*9000+fit+hold),k=randomKey();nulls.push(result(encrypt(p,k),null,null,"native"+i,"GP29 q8"))}
const powered=plants.filter(p=>p.exactKey&&p.heldoutCorrect===hold).length>=3;
let original=null;if(powered)original=result(a.concat(b),null,null,"p54–55","original");
return {alphabet,fit,hold,trainChars:train.map(s=>s.length),donorChars:donors.map(s=>s.length),powered,plants,nulls,original}
}

console.log(JSON.stringify(run(JSON.parse(read("resources/liber-primus/lp2-corpus.json")),["emerson_essays_2944.txt","gibran_prophet_58585.txt","shakespeare_first300k.txt"].map(f=>read("resources/control/"+f)),read("resources/liber-primus/lp1-plaintext-reference.txt")),null,2));
