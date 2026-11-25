"use strict";
const fs=require("node:fs"),path=require("node:path");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
function study(c,g,sh,donor1,donor2){
const n=29,mod=x=>((x%n)+n)%n,code=g.alphabet.replace("f",""),tokens=g.pages.flatMap(p=>p.tokens),F=tokens.map(t=>59*code.indexOf(t[0])+code.indexOf(t[1]));
const children=Array.from({length:256},()=>[]);for(let i=0;i<256;i++)if(i!==F[i])children[F[i]].push(i);
function orders(root){const out={};function dfs(u,arr,post,rev){if(!post)arr.push(u);for(const v of rev?[...children[u]].reverse():children[u])dfs(v,arr,post,rev);if(post)arr.push(u);}
const a=[];dfs(root,a,false,false);out.address=a.slice().sort((a,b)=>a-b);
for(const rev of [false,true]){const s=rev?"desc":"asc";for(const post of [false,true]){const v=[];dfs(root,v,post,rev);out[`${post?"post":"pre"}_${s}`]=v;}let q=[root];for(let i=0;i<q.length;i++)q.push(...(rev?[...children[q[i]]].reverse():children[q[i]]));out[`bfs_${s}`]=q;}return out;}
const O1=orders(58),O2=orders(244);if(O1.address.length!==121||O2.address.length!==76)throw Error("subtree sizes");
const pm=O=>Object.fromEntries(Object.entries(O).map(([name,o])=>{const ix=new Map(o.map((v,i)=>[v,i]));return [name,o.map(v=>ix.get(F[v])??-1)];}));
const M1=pm(O1),M2=pm(O2);
const gp=c.translit.map((t,i)=>[t,i]).sort((a,b)=>b[0].length-a[0].length);
function enc(s){const a=[];for(let w of s.match(/[a-z]+/gi)||[]){w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/K/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");while(w.length){let t=gp.find(([t])=>w.startsWith(t));if(!t)throw Error("encode");a.push(t[1]);w=w.slice(t[0].length);}}return a;}
const A=enc(donor1),B=enc(donor2),T=[enc(sh),A.slice(16000),B.slice(16000)];
const counts=Array.from({length:4},(_,i)=>new Uint32Array(n**(i+1))),tot=Array.from({length:4},(_,i)=>new Uint32Array(n**i));
for(const s of T)for(let i=0;i<s.length;i++){let k=0,p=1;for(let j=0;j<4&&j<=i;j++){counts[j][k*n+s[i]]++;tot[j][k]++;if(i>j){k+=p*s[i-j-1];p*=n;}}}
const probs=counts.map(a=>new Float64Array(a.length));
for(let x=0;x<n;x++)probs[0][x]=(counts[0][x]+.5)/(tot[0][0]+.5*n);
for(let j=1;j<4;j++)for(let k=0;k<n**j;k++)for(let x=0;x<n;x++)probs[j][k*n+x]=(counts[j][k*n+x]+8*probs[j-1][k%(n**(j-1))*n+x])/(tot[j][k]+8);
for(const p of probs)for(let i=0;i<p.length;i++)p[i]=Math.log(p[i]);
function score(P,start,end){let s=0,z=0;for(let i=start;i<end;i++){if(P[i]<0)continue;let k=0,p=1,j=0;while(j<3&&i-j>0&&P[i-j-1]>=0){k+=p*P[i-j-1];p*=n;j++;}s+=probs[j][k*n+P[i]];z++;}return s/z;}
function dec(C,m,a,b,d){return C.map((x,i)=>m[i]<0?-1:mod(a*x+b*C[m[i]]+d));}
function inv(a){for(let b=1;b<n;b++)if(a*b%n===1)return b;throw Error("inverse");}
function encrypt(P,m,a,b,d,rootC){const C=new Array(P.length).fill(-1);function at(i){if(C[i]>=0)return C[i];if(m[i]<0)return C[i]=rootC;return C[i]=mod(inv(a)*(P[i]-b*at(m[i])-d));}return P.map((_,i)=>at(i));}
function fit(C){let rows=[];for(const [name,m] of Object.entries(M1))for(let a=1;a<n;a++)for(let b=1;b<n;b++)for(let d=0;d<n;d++){const P=dec(C,m,a,b,d),s=score(P,0,80);rows.push({name,a,b,d,fit:s});}rows.sort((a,b)=>b.fit-a.fit);return rows;}
function render(P){return P.map(x=>x<0?"[IV]":c.translit[x]).join("");}
function evaluate(C,D,truth=null,params=null){const rows=fit(C),w=rows[0],P=dec(C,M1[w.name],w.a,w.b,w.d),Q=dec(D,M2[w.name],w.a,w.b,w.d);const result={...w,hold32:score(P,80,121),hold55:score(Q,0,76),margin:w.fit-rows[1].fit,plaintext32:render(P),plaintext55:render(Q),replay:encrypt(P,M1[w.name],w.a,w.b,w.d,C[M1[w.name].indexOf(-1)]).every((v,i)=>v===C[i])&&encrypt(Q,M2[w.name],w.a,w.b,w.d,D[M2[w.name].indexOf(-1)]).every((v,i)=>v===D[i])};
if(truth){result.params=params;result.rank=rows.findIndex(w=>w.name===params.name&&w.a===params.a&&w.b===params.b&&w.d===params.d)+1;result.match32=P.filter((x,i)=>x===truth[0][i]).length;result.match55=Q.filter((x,i)=>x===truth[1][i]).length;}
return result;}
const controls=[],params=[{name:"address",a:7,b:19,d:13},{name:"pre_desc",a:17,b:6,d:5},{name:"bfs_asc",a:5,b:28,d:21}];
for(let j=0;j<params.length;j++){const p=params[j],x=A.slice(5000+j*1000,5121+j*1000),y=B.slice(7000+j*1300,7076+j*1300),C=encrypt(x,M1[p.name],p.a,p.b,p.d,11),D=encrypt(y,M2[p.name],p.a,p.b,p.d,23);controls.push(evaluate(C,D,[x,y],p));}
const pass=controls.every(x=>x.rank===1&&x.match32===120&&x.match55===75&&x.replay);
const original=pass?evaluate(c.pages[32].indices,c.pages[55].indices):null;
return {orders:Object.keys(M1),candidates:Object.keys(M1).length*28*28*29,controls,gatePassed:pass,original};
}
const d=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-grid-256.json","resources/control/shakespeare_first300k.txt","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt"].map(read);console.log(JSON.stringify(study(JSON.parse(d[0]),JSON.parse(d[1]),...d.slice(2)),null,2));
