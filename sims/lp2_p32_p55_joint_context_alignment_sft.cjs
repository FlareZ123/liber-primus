"use strict";
const fs=require("node:fs"),path=require("node:path");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
function study(c,sh,g,e,dict,which='all',width=4096){
const n=29,m=n**4,tokens=c.translit.map((t,i)=>[t,i]).sort((a,b)=>b[0].length-a[0].length);
const encode=w=>{w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/K/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");let o=[];while(w.length){const q=tokens.find(([t])=>w.startsWith(t));if(!q)return [];o.push(q[1]);w=w.slice(q[0].length)}return o};
const enc=s=>(s.match(/[a-z]+/gi)||[]).flatMap(encode),a=enc(g),b=enc(e),s=enc(sh);
const train=[s,a.slice(12000),b.slice(18000)],counts=Array.from({length:5},(_,i)=>new Uint32Array(n**(i+1))),totals=Array.from({length:5},(_,i)=>new Uint32Array(n**i));
for(const stream of train)for(let i=0;i<stream.length;i++){let x=stream[i],k=0,p=1;for(let j=0;j<5&&j<=i;j++){counts[j][k*n+x]++;totals[j][k]++;if(i-j>0){k+=p*stream[i-j-1];p*=n;}}}
const probs=Array.from({length:5},(_,i)=>new Float32Array(n**(i+1)));let sum=totals[0][0];for(let x=0;x<n;x++)probs[0][x]=(counts[0][x]+.5)/(sum+n*.5);
for(let j=1;j<5;j++){let den=n**(j-1);for(let k=0;k<n**j;k++){const t=totals[j][k],prior=probs[j-1],prev=(k%den)*n;for(let x=0;x<n;x++)probs[j][k*n+x]=(counts[j][k*n+x]+8*prior[prev+x])/(t+8)}}
const p0=probs[0].slice(),p1=probs[1].slice(),p2=probs[2].slice();
for(const p of probs)for(let i=0;i<p.length;i++)p[i]=Math.log(p[i]);
const weights=new Map(),add=(w,f)=>{const x=encode(w);if(!x.length)return;const k=String.fromCharCode(...x);weights.set(k,(weights.get(k)||0)+f)};
for(const row of dict.split(/\r?\n/)){const z=/^([a-z]+)\s+(\d+)$/.exec(row);if(z)add(z[1],Number(z[2]));}
for(const w of sh.match(/[a-z]+/gi)||[])add(w,1);
const nodes=[],node=()=>{nodes.push({children:new Map(),total:0,end:0});return nodes.length-1},root=node(),suffix=node();
function insert(start,w,weight){let k=start;nodes[k].total+=weight;for(let i=0;i<w.length;i++){let x=w.charCodeAt(i),v=nodes[k].children.get(x);if(v===undefined){v=node();nodes[k].children.set(x,v)}k=v;nodes[k].total+=weight;}nodes[k].end+=weight;}
for(const [w,f] of weights){insert(root,w,f);for(let i=0;i<w.length;i++)insert(suffix,w.slice(i),f)}
const tr=nodes.map(v=>{let o=Array.from({length:n},()=>[]);for(const [x,k] of v.children)o[x].push([k,Math.log(nodes[k].total/v.total),false]);if(v.end>0){let p=Math.log(v.end/v.total);for(const [x,k] of nodes[root].children)o[x].push([k,p+Math.log(nodes[k].total/nodes[root].total),true]);}return o;});
function decode(D,width=4096,lambda=.5){
let beam=[{a:suffix,b:suffix,k:0,l:0,s:0,prev:null}];
for(let i=0;i<D.length;i++){let j=Math.min(i,4),p=probs[j],d=D[i],next=new Map();
for(const q of beam){let off=q.k*n,off2=q.l*n,ta=tr[q.a],tb=tr[q.b];for(let x=0;x<n;x++){const y=(x-d+n)%n;if(!ta[x].length||!tb[y].length)continue;let k=(q.k*n+x)%m,l=(q.l*n+y)%m,ng=(1-lambda)*(p[off+x]+p[off2+y]);for(const u of ta[x])for(const v of tb[y]){let ka=u[0],kb=v[0],key=`${ka},${kb},${k}`,score=q.s+ng+lambda*(u[1]+v[1]);let old=next.get(key);if(!old||score>old.s)next.set(key,{a:ka,b:kb,k,l,s:score,prev:q,x,y,sa:u[2],sb:v[2]});}}}
beam=Array.from(next.values()).sort((a,b)=>b.s-a.s).slice(0,width);if(!beam.length)return {dead:i};
}
let best=beam[0],x=[],y=[],ra=[],rb=[];for(let q=best;q.prev;q=q.prev){x.push(q.x);y.push(q.y);ra.push((q.sa?" ":"")+c.translit[q.x]);rb.push((q.sb?" ":"")+c.translit[q.y])}return {x:x.reverse(),y:y.reverse(),score:best.s,A:ra.reverse().join(""),B:rb.reverse().join("")};
}
const mod=x=>(x+n)%n;
function marginal(D){let v=new Float64Array(n*n),z=0,logZ=0,prefix=null;for(let x=0;x<n;x++)for(let y=0;y<n;y++){let r=mod(x-D[0]),s=mod(y-D[1]);v[x*n+y]=p0[x]*p0[r]*p1[x*n+y]*p1[r*n+s];z+=v[x*n+y];}logZ=Math.log(z);for(let k=0;k<v.length;k++)v[k]/=z;for(let i=2;i<D.length;i++){const w=new Float64Array(n*n),d0=D[i-2],d1=D[i-1],d2=D[i];for(let x=0;x<n;x++)for(let y=0;y<n;y++){const f=v[x*n+y],k=(x*n+y)*n,l=(mod(x-d0)*n+mod(y-d1))*n;for(let u=0;u<n;u++)w[y*n+u]+=f*p2[k+u]*p2[l+mod(u-d2)];}z=0;for(const v of w)z+=v;logZ+=Math.log(z);for(let k=0;k<w.length;k++)w[k]/=z;v=w;if(i===47)prefix=logZ;}return {logZ,prefix};}
const diff=(A,B,off)=>B.map((y,i)=>mod(A[i+off]-y));
function rank(A,B){let rows=[];for(let off=0;off<=A.length-B.length;off++){let D=diff(A,B,off);rows.push({off,train:marginal(D.slice(0,48)).logZ});}rows.sort((a,b)=>b.train-a.train);let w=rows[0],D=diff(A,B,w.off),z=marginal(D);return {off:w.off,train:w.train/48,holdout:(z.logZ-w.train)/(B.length-48),margin:w.train-rows[1].train,rows};}
const render=v=>v.map(x=>c.translit[x]).join("");
let seed=0x70616972;function rand(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)%29;}

// Rank directly by the stronger joint lexical-context MAP receiver, not by
// the independently failed trigram marginal alignment selector.
function rankContext(A,B,truth,control){const rows=[];let best=null;
 for(let off=0;off<=A.length-B.length;off++){const D=diff(A,B,off),res=decode(D,width,.5);const row={off,score:res.score??-Infinity,dead:res.dead??null};if(truth&&off===truth.off)row.trueMatch=res.x?.filter((v,j)=>v===truth.x[j+off]).length??0;rows.push(row);if(!best||row.score>best.score)best={...row,res};}
 rows.sort((a,b)=>b.score-a.score);if(!best.res.x)throw Error("all offsets dead");const {off,res}=best,pad=res.x.map((x,i)=>mod(A[i+off]-x));if(res.y.some((y,i)=>mod(y+pad[i])!==B[i]))throw Error("replay");return{control,expected:truth?.off??null,selected:off,rank:truth?rows.findIndex(z=>z.off===truth.off)+1:null,margin:rows[0].score-rows[1].score,match:truth&&off===truth.off?res.x.filter((v,j)=>v===truth.x[j+off]).length:null,knownAlignmentMatch:truth?rows.find(z=>z.off===truth.off).trueMatch:null,score:best.score,A:res.A,B:res.B,pad,plainA:res.x,plainB:res.y,rows};
}
const controls=[];
for(let i=0;i<4;i++){const off=[7,19,31,43][i],x=a.slice(2000+i*1000-off,2121+i*1000-off),y=b.slice(4000+i*1500,4076+i*1500),K=x.map(rand),A=x.map((v,j)=>mod(v+K[j])),B=y.map((v,j)=>mod(v+K[j+off]));if(which==='all'||which==='controls'||which===String(i)){const q=rankContext(A,B,{off,x},i);controls.push(q);console.log('RESULT_JSON '+JSON.stringify(q));}}
const pass=controls.filter(x=>x.expected===x.selected&&x.match>=38).length>=3;let original=null;
if((which==='all'&&pass)||which==='original'){const A=c.pages[32].indices,B=c.pages[55].indices;original=rankContext(A,B,null,'original');console.log('RESULT_JSON '+JSON.stringify(original));}
return {words:weights.size,nodes:nodes.length,trainingRunes:train.map(x=>x.length),width,controls,gatePassed:pass,original};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/control/shakespeare_first300k.txt","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt","resources/control/english_wordfreq_textblob.txt"];
if(require.main===module){const d=paths.map(read);const r=study(JSON.parse(d[0]),...d.slice(1),process.argv[2]||'all',Number(process.argv[3]||4096));console.log('SUMMARY_JSON '+JSON.stringify({words:r.words,nodes:r.nodes,trainingRunes:r.trainingRunes,width:r.width,gatePassed:r.gatePassed}));}
module.exports={study};
