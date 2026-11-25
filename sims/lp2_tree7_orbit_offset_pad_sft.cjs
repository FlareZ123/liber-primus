"use strict";
/** Agent46: p7 polynomial's seven states as actual page-start key offsets,
 * not Caesar alphabet offsets. Exact trigram MAP for arbitrary additive pad,
 * six physical pages training, p14 held. No printed-word assumptions. */
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const root=path.join(__dirname,".."),read=p=>fs.readFileSync(path.join(root,p),"utf8"),Q=29;
const gp=JSON.parse(read("resources/liber-primus/lp2-corpus.json")),gold=JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"));
const tokens=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
function native(text){const a=/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(text),b=/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(text);const w=text.slice(a?a.index+a[0].length:0,b?b.index:text.length).toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");let p=[];for(const s of w.match(/[A-Z]+/g)||[])for(let j=0;j<s.length;){const v=s.startsWith("ING",j)?{t:"ING",i:21}:s.startsWith("IO",j)?{t:"IO",i:27}:tokens.find(x=>s.startsWith(x.t,j));assert(v);p.push(v.i);j+=v.t.length;}return p;}
const nativeSections=gold.sections.map(s=>[...s.source_text].map(c=>gp.runes.indexOf(c)).filter(x=>x>=0));assert.equal(nativeSections.flat().length,2979);
const donors=["gibran_prophet_58585.txt","emerson_essays_2944.txt","shakespeare_first300k.txt"];
const lit=donors.map(p=>native(read("resources/control/"+p)));
function train(ss){const u=new Float64Array(Q).fill(.5),B=new Float64Array(Q*Q),T=new Float64Array(Q**3),nB=new Float64Array(Q),nT=new Float64Array(Q*Q);for(const s of ss)for(let i=0;i<s.length;i++){u[s[i]]++;if(i){B[s[i-1]*Q+s[i]]++;nB[s[i-1]]++;}if(i>1){const j=s[i-2]*Q+s[i-1];T[j*Q+s[i]]++;nT[j]++;}}const total=u.reduce((a,b)=>a+b,0);for(let x=0;x<Q;x++)u[x]/=total;for(let x=0;x<Q;x++)for(let y=0;y<Q;y++)B[x*Q+y]=(B[x*Q+y]+8*u[y])/(nB[x]+8);for(let x=0;x<Q*Q;x++)for(let y=0;y<Q;y++)T[x*Q+y]=Math.log((T[x*Q+y]+12*B[(x%Q)*Q+y])/(nT[x]+12));return {u:Array.from(u,Math.log),B:Array.from(B,Math.log),T};}
const model=train([...nativeSections,lit[2]]);
const source=gp.pages.filter(p=>p.page>=8&&p.page<=14).map(p=>p.indices);assert.deepEqual(source.map(p=>p.length),[255,268,263,273,261,272,137]);
const f=x=>(11+26*x+8*x*x+15*x*x*x+2*x*x*x*x)%Q;
let x=0;for(let i=0;i<5;i++)x=f(x);const orbit=[];for(let i=0;i<7;i++){orbit.push(x);x=f(x);}assert.deepEqual(orbit,[5,15,28,9,10,24,7]);assert.equal(x,orbit[0]);
const mod=x=>(x+Q)%Q;
function offsets(sign){const a=orbit.map(x=>sign*x),m=Math.min(...a);return a.map(x=>x-m);}
function modelRows(black){return source.map((p,i)=>p.slice(black&&i===0?12:0));}
function invert(C,O,truth=null,plain=null){const N=Math.max(...C.slice(0,6).map((p,i)=>p.length+O[i]));assert(O[6]+C[6].length<=N);
 const active=Array.from({length:N},(_,t)=>C.slice(0,6).flatMap((p,j)=>t>=O[j]&&t<O[j]+p.length?[{p,j,i:t-O[j]}]:[]));
 const emission=new Float64Array(Q),pairs=new Float64Array(Q*Q),tri=new Float64Array(Q**3),back=new Uint8Array(N*Q*Q);
 function fill(t){emission.fill(0);pairs.fill(0);tri.fill(0);for(const {p,i} of active[t]){const c=p[i];if(i===0){for(let z=0;z<Q;z++)emission[z]+=model.u[mod(c-z)];}else if(i===1){for(let b=0;b<Q;b++)for(let z=0;z<Q;z++)pairs[b*Q+z]+=model.B[mod(p[i-1]-b)*Q+mod(c-z)];}else{for(let a=0;a<Q;a++)for(let b=0;b<Q;b++){const v=(mod(p[i-2]-a)*Q+mod(p[i-1]-b))*Q,w=(a*Q+b)*Q;for(let z=0;z<Q;z++)tri[w+z]+=model.T[v+mod(c-z)];}}}}
 fill(0);let prev=new Float64Array(Q*Q);prev.fill(-Infinity);for(let z=0;z<Q;z++)prev[z]=emission[z];
 fill(1);let cur=new Float64Array(Q*Q);for(let b=0;b<Q;b++)for(let z=0;z<Q;z++)cur[b*Q+z]=prev[b]+emission[z]+pairs[b*Q+z];prev=cur;
 for(let t=2;t<N;t++){fill(t);cur=new Float64Array(Q*Q);cur.fill(-Infinity);for(let a=0;a<Q;a++)for(let b=0;b<Q;b++){const v=prev[a*Q+b],w=(a*Q+b)*Q;for(let z=0;z<Q;z++){const j=b*Q+z,s=v+tri[w+z];if(s>cur[j]){cur[j]=s;back[t*Q*Q+j]=a;}}}for(let b=0;b<Q;b++)for(let z=0;z<Q;z++)cur[b*Q+z]+=emission[z]+pairs[b*Q+z];prev=cur;}
 let end=0;for(let j=1;j<prev.length;j++)if(prev[j]>prev[end])end=j;const K=Array(N);K[N-2]=Math.floor(end/Q);K[N-1]=end%Q;for(let t=N-1;t>=2;t--)K[t-2]=back[t*Q*Q+K[t-1]*Q+K[t]];
 const P=C.map((p,j)=>p.map((c,i)=>mod(c-K[O[j]+i])));for(let j=0;j<C.length;j++)for(let i=0;i<C[j].length;i++)assert.equal((P[j][i]+K[O[j]+i])%Q,C[j][i]);
 function score(p){let s=model.u[p[0]];if(p.length>1)s+=model.B[p[0]*Q+p[1]];for(let i=2;i<p.length;i++)s+=model.T[(p[i-2]*Q+p[i-1])*Q+p[i]];return s;}
 const fitN=P.slice(0,6).reduce((a,p)=>a+p.length,0),fitScore=P.slice(0,6).reduce((a,p)=>a+score(p),0);assert(Math.abs(fitScore-prev[end])<1e-6,"path objective mismatch");
 const result={offsets:O,fitN,fitNats:fitScore/fitN,holdN:P[6].length,holdNats:score(P[6])/P[6].length,holdPreview:P[6].map(x=>gp.translit[x]).join(" ")};
 if(truth){result.heldCorrect=P[6].filter((v,i)=>v===plain[6][i]).length;result.fitCorrect=P.slice(0,6).reduce((a,p,j)=>a+p.filter((v,i)=>v===plain[j][i]).length,0);result.overlapKeyCorrect=K.slice(O[6],O[6]+P[6].length).filter((v,i)=>v===truth[O[6]+i]).length;result.nativeHoldNats=score(plain[6])/P[6].length;}
 return result;
}
function rng(seed){let s=seed>>>0;return n=>{s^=s<<13;s^=s>>>17;s^=s<<5;return (s>>>0)%n;};}
function plant(d,sign,black){const C=modelRows(black),O=offsets(sign),R=rng(461400+d*4+(sign<0?2:0)+(black?1:0)),total=C.reduce((a,p)=>a+p.length,0);let first=R(lit[d].length-total),pos=first;const P=C.map(p=>{const v=lit[d].slice(pos,pos+p.length);pos+=p.length;return v;});const K=Array.from({length:Math.max(...C.map((p,j)=>p.length+O[j]))},()=>R(Q));const enc=P.map((p,j)=>p.map((v,i)=>(v+K[O[j]+i])%Q));return {donor:donors[d],first,sign,black,...invert(enc,O,K,P)};}
const mode=process.argv[2]||"plant0",sign=Number(process.argv[3]||1),black=process.argv[4]==="black";
assert([1,-1].includes(sign));if(mode.startsWith("plant"))console.log(JSON.stringify(plant(Number(mode.slice(-1)),sign,black)));else if(mode==="original")console.log(JSON.stringify({sign,black,...invert(modelRows(black),offsets(sign))}));else throw Error("unknown mode");
