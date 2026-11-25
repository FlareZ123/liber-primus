"use strict";
const fs=require("node:fs"),path=require("node:path");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
function study(c,g,sh,d1,d2){
const n=29,mod=x=>((x%n)+n)%n,F=g.pages.flatMap(p=>p.tokens).map(t=>60*g.alphabet.indexOf(t[0])+g.alphabet.indexOf(t[1]));let path=[71];for(let i=0;i<23;i++)path.push(F[path.at(-1)]);if(path.at(-1)!==32||path[21]!==20||path[22]!==102||new Set(path).size!==24)throw Error("source path");
const L=c.pages[32].indices.length;if(L!==121)throw Error("length");
const orders={};for(const rev of [false,true]){const rank=path.map((_,i)=>i).sort((a,b)=>rev?path[b]-path[a]:path[a]-path[b]);let col=[];for(const j of rank)for(let i=j;i<L;i+=24)col.push(i);let row=[];for(let k=0;k<L;k+=24)for(const j of rank)if(k+j<L)row.push(k+j);orders[`column_${rev?"desc":"asc"}`]=col;orders[`row_${rev?"desc":"asc"}`]=row;}
const primes=[];for(let i=2;primes.length<3500;i++){let yes=true;for(const p of primes){if(p*p>i)break;if(i%p===0){yes=false;break}}if(yes)primes.push((i));}const K=primes.map(x=>(x-1)%n);
const tokens=c.translit.map((t,i)=>[t,i]).sort((a,b)=>b[0].length-a[0].length),enc=s=>{let out=[];for(let w of s.match(/[a-z]+/gi)||[]){w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/K/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");while(w.length){let t=tokens.find(([t])=>w.startsWith(t));if(!t)throw Error("encode");out.push(t[1]);w=w.slice(t[0].length);}}return out;};
const A=enc(d1),B=enc(d2),T=[enc(sh),A.slice(16000),B.slice(18000)],counts=Array.from({length:4},(_,i)=>new Uint32Array(n**(i+1))),tot=Array.from({length:4},(_,i)=>new Uint32Array(n**i));
for(const s of T)for(let i=0;i<s.length;i++){let k=0,p=1;for(let j=0;j<4&&j<=i;j++){counts[j][k*n+s[i]]++;tot[j][k]++;if(i>j){k+=p*s[i-j-1];p*=n;}}}
const probs=counts.map(a=>new Float64Array(a.length));for(let x=0;x<n;x++)probs[0][x]=(counts[0][x]+.5)/(tot[0][0]+.5*n);
for(let j=1;j<4;j++)for(let k=0;k<n**j;k++)for(let x=0;x<n;x++)probs[j][k*n+x]=(counts[j][k*n+x]+8*probs[j-1][k%(n**(j-1))*n+x])/(tot[j][k]+8);
for(const p of probs)for(let i=0;i<p.length;i++)p[i]=Math.log(p[i]);
function score(P,start,end){let s=0;for(let i=start;i<end;i++){let k=0,p=1,j=0;while(j<3&&i-j>0){k+=p*P[i-j-1];p*=n;j++;}s+=probs[j][k*n+P[i]];}return s/(end-start);}
const gather=(P,o)=>o.map(i=>P[i]),scatter=(C,o)=>{let P=new Array(L);for(let i=0;i<L;i++)P[o[i]]=C[i];return P;};
function paths(C,origin,sign){let out=[],P=new Array(L);function go(i,j){if(i===L){out.push(P.slice());return;}let c=C[i];if(c===0){P[i]=0;go(i+1,j);}let p=mod(c-sign*K[j]);if(p!==0){P[i]=p;go(i+1,j+1);}}go(0,origin);return out;}
function cipher(P,origin,sign){let j=origin;return P.map(p=>p===0?0:mod(p+sign*K[j++]));}
function encrypt(P,p){const o=orders[p.order];return p.layer==="prime_then_transpose"?gather(cipher(P,p.origin,p.sign),o):cipher(gather(P,o),p.origin,p.sign);}
function solve(C,truth=null,params=null){let rows=[],counts={};for(const [order,o] of Object.entries(orders))for(const layer of ["prime_then_transpose","transpose_then_prime"])for(const sign of [1,-1]){let k=`${order}/${layer}/${sign}`,X=layer==="prime_then_transpose"?scatter(C,o):C;counts[k]=0;for(let origin=0;origin<=3301;origin++){for(const Y of paths(X,origin,sign)){const P=layer==="prime_then_transpose"?Y:scatter(Y,o);counts[k]++;rows.push({order,layer,sign,origin,fit:score(P,0,80),hold:score(P,80,L),P});}}}
rows.sort((a,b)=>b.fit-a.fit);let w=rows[0];const tied=w?rows.filter(x=>x.order===w.order&&x.layer===w.layer&&x.origin===w.origin&&x.sign===w.sign&&x.P.slice(0,80).every((v,i)=>v===w.P[i])):[];tied.sort((a,b)=>b.hold-a.hold);const best=w?{...tied[0],prefixVariants:tied.length,render:tied[0].P.map(x=>c.translit[x]).join(""),replay:encrypt(tied[0].P,tied[0]).every((v,i)=>v===C[i])}:null;return {totalPaths:rows.length,counts,best,truthRank:params?rows.findIndex(x=>x.order===params.order&&x.layer===params.layer&&x.sign===params.sign&&x.origin===params.origin&&x.P.every((v,i)=>v===truth[i]))+1:null,match:truth&&best?best.P.filter((x,i)=>x===truth[i]).length:null};}
const ps=[{order:"column_asc",layer:"prime_then_transpose",origin:23,sign:1},{order:"row_desc",layer:"transpose_then_prime",origin:3301,sign:-1},{order:"column_desc",layer:"transpose_then_prime",origin:121,sign:1}],controls=[];
for(let i=0;i<3;i++){let P=(i%2===0?A:B).slice(8000+i*1000,8121+i*1000),params=ps[i];controls.push({params,...solve(encrypt(P,params),P,params)});}
const gate=controls.every(x=>x.match===121&&x.best.replay&&x.best.order===x.params.order&&x.best.layer===x.params.layer&&x.best.sign===x.params.sign&&x.best.origin===x.params.origin),original=gate?solve(c.pages[32].indices):null;
return {path,orders:Object.keys(orders),attempts:4*2*2*3302,controls,gatePassed:gate,original};
}
const d=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-grid-256.json","resources/control/shakespeare_first300k.txt","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt"].map(read);console.log(JSON.stringify(study(JSON.parse(d[0]),JSON.parse(d[1]),...d.slice(2)),null,2));
