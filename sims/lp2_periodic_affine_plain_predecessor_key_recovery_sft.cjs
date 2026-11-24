'use strict';
const fs=require('node:fs');
const path=require('node:path');
const files=["resources/liber-primus/lp2-corpus.json","resources/control/shakespeare_first300k.txt","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt"];
const run=function run(raw){
const gp=JSON.parse(raw[0]),m=29,mod=x=>(x%29+29)%29,mp=new Map(gp.translit.map((s,i)=>[s,i]));const tok=txt=>{const a=[];for(const w of txt.toUpperCase().replaceAll("QU","CW").replace(/[VKQZ]/g,c=>({V:"U",K:"C",Q:"C",Z:"S"})[c]).match(/[A-Z]+/g)||[]){for(let i=0;i<w.length;){let s=["ING","TH","NG","EO","OE","AE","IA","IO","EA"].find(t=>w.startsWith(t,i));if(!s)s=w[i];i+=s.length;const p=mp.get(s==="ING"?"NG":s==="IO"?"IA":s);if(p!==undefined)a.push(p)}}return a};
const P=raw.slice(1).map(tok),C=gp.pages.filter(x=>x.page<56).flatMap(x=>x.indices),N=C.length,T=9640,K=8;
if(N!==12956)throw Error("source length");
const dif=a=>a.slice(1).map((x,i)=>mod(x-a[i]));const B=new Float64Array(m*m).fill(.05),Tr=new Float64Array(m*m*m).fill(.005);
for(let i=1;i<P[0].length;i++){B[P[0][i-1]*m+P[0][i]]++;if(i>1)Tr[(P[0][i-2]*m+P[0][i-1])*m+P[0][i]]++}
const bsum=B.reduce((a,b)=>a+b),tsum=Tr.reduce((a,b)=>a+b);for(let i=0;i<B.length;i++)B[i]/=bsum;for(let i=0;i<Tr.length;i++)Tr[i]/=tsum;
const L3=Array.from({length:m*m},(_,i)=>{let s=0;for(let j=0;j<m;j++)s+=Tr[i*m+j];return Array.from({length:m},(_,j)=>Math.log(Tr[i*m+j]/s))});
const inv=Array.from({length:m},(_,a)=>{for(let i=1;i<m;i++)if(a*i%m===1)return i;return 0});
const states=[];for(let a=1;a<m;a++)for(let b=0;b<m;b++){const hist=new Float64Array(m);for(let p=0;p<m;p++)for(let x=0;x<m;x++)hist[(a*x+b*p)%m]+=B[p*m+x];for(let c=0;c<m;c++)states.push({a,b,c,h:Array.from({length:m},(_,x)=>Math.log(hist[mod(x-c)])),ia:inv[a]})}
function shortlist(d,q,K){const H=Array.from({length:q},()=>new Int32Array(m));for(let i=0;i<T-1;i++)H[(i+1)%q][d[i]]++;return H.map(row=>states.map(s=>({s,l:row.reduce((v,n,j)=>v+n*s.h[j],0)})).sort((a,b)=>b.l-a.l).slice(0,K).map(x=>x.s))}
const keyarr=s=>[s.a,s.b,s.c];function keyeq(a,b){return a.a===b.a&&a.b===b.b&&a.c===b.c}
function score(a,lo,hi){let s=0;for(let i=Math.max(2,lo);i<hi;i++)s+=L3[a[i-2]*m+a[i-1]][a[i]];return s/(hi-Math.max(2,lo))}
function recover(c,q){const d=dif(c),cand=shortlist(d,q,K);const edges=Array.from({length:q},()=>new Int32Array(m*m));for(let i=1;i<T-1;i++)edges[i%q][d[i-1]*m+d[i]]++;
const tables=edges.map((row,p)=>cand[p].map(a=>cand[(p+1)%q].map(b=>{const hist=new Float64Array(m*m);for(let prev=0;prev<m;prev++)for(let curr=0;curr<m;curr++){const x=mod(a.a*curr+a.b*prev+a.c);for(let next=0;next<m;next++){const y=mod(b.a*next+b.b*curr+b.c);hist[x*m+y]+=Tr[(prev*m+curr)*m+next]}}return row.reduce((s,n,i)=>s+n*Math.log(hist[i]),0)})));
let best=-Infinity,key;for(let first=0;first<K;first++){let v=Array(K).fill(-Infinity);v[first]=0;const back=[];for(let p=0;p<q-1;p++){const w=Array(K).fill(-Infinity),bp=Array(K).fill(-1);for(let i=0;i<K;i++)for(let j=0;j<K;j++){let x=v[i]+tables[p][i][j];if(x>w[j]){w[j]=x;bp[j]=i}}back.push(bp);v=w}for(let j=0;j<K;j++){let x=v[j]+tables[q-1][j][first];if(x>best){best=x;const t=[j];for(let p=q-2;p>=0;p--)t.unshift(back[p][t[0]]);key=t.map((a,p)=>cand[p][a])}}}
let plain,seed,bestp=-Infinity;for(let h=0;h<m;h++){const a=[h];for(let i=1;i<c.length;i++){const s=key[i%q];a.push(mod(s.ia*(d[i-1]-s.b*a[i-1]-s.c)))}const v=score(a,0,T);if(v>bestp){bestp=v;plain=a;seed=h}}let replay=plain.slice(1).every((v,i)=>{const s=key[(i+1)%q];return mod(s.a*v+s.b*plain[i]+s.c)===d[i]});return {key,seed,plain,replay,train:bestp,hold:score(plain,T,c.length),cand,pairScore:best/(T-2)}}
let seed=0x33012015;function rnd(n){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)%n}
let output=[];for(let q of [8,13]){let controls=[];for(let k=1;k<=2;k++){const p=P[k].slice(0,N).concat(gp.pages.find(x=>x.page===57).indices),key=Array.from({length:q},()=>({a:rnd(28)+1,b:rnd(29),c:rnd(29)})),c=[rnd(29)];for(let i=1;i<p.length;i++){const {a,b,c:e}=key[i%q];c.push(mod(c[i-1]+a*p[i]+b*p[i-1]+e))}const x=recover(c,q);controls.push({source:k,correctKey:x.key.filter((s,i)=>keyeq(s,key[i])).length,rank:x.cand.map((ss,i)=>ss.findIndex(s=>keyeq(s,key[i]))+1),trainCorrect:x.plain.slice(0,T).filter((v,i)=>v===p[i]).length,heldoutCorrect:x.plain.slice(T,N).filter((v,i)=>v===p[T+i]).length,parableCorrect:x.plain.slice(N).filter((v,i)=>v===p[N+i]).length,replay:x.replay,train:x.train,hold:x.hold,pairScore:x.pairScore})}
const x=recover(C,q);output.push({q,controls,original:{key:x.key.map(keyarr),seed:x.seed,train:x.train,hold:x.hold,pairScore:x.pairScore,replay:x.replay,preview:x.plain.slice(T,T+100).map(x=>gp.translit[x]).join("")}})}
return output;
};
console.log(JSON.stringify(run(files.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'))),null,2));
