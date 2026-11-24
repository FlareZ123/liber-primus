'use strict';
const fs=require('node:fs');
const path=require('node:path');
const run=function run(gp,sol){
const mod=x=>(x%29+29)%29,N=464,ps=[];for(let n=2;ps.length<3500;n++){let yes=true;for(const p of ps){if(p*p>n)break;if(n%p===0){yes=false;break}}if(yes)ps.push(n)}const base=ps.map(p=>(p-1)%29);
const ix=new Map(gp.runes.map((x,i)=>[x,i])),gptext=s=>Array.from(s).filter(x=>ix.has(x)).map(x=>ix.get(x)),src=sol.sections.filter(s=>!s.name.startsWith("p56")&&!s.name.startsWith("p57")).map(s=>gptext(s.source_text));
const uni=new Float64Array(29).fill(1),bi=Array.from({length:29},()=>new Float64Array(29)),tri=Array.from({length:841},()=>new Float64Array(29));for(const a of src)for(let i=0;i<a.length;i++){uni[a[i]]++;if(i)bi[a[i-1]][a[i]]++;if(i>1)tri[a[i-2]*29+a[i-1]][a[i]]++}const sum=a=>a.reduce((s,x)=>s+x,0),ut=sum(uni),up=Array.from(uni,x=>x/ut),bp=bi.map(row=>{const z=sum(row)+10;return Array.from(row,(x,j)=>(x+10*up[j])/z)}),tl=tri.map((row,i)=>{const z=sum(row)+10;return Array.from(row,(x,j)=>Math.log((x+10*bp[i%29][j])/z))}),bl=bp.map(r=>r.map(Math.log)),ul=up.map(Math.log),score=(a,b,p)=>b===29?ul[p]:a===29?bl[b][p]:tl[a*29+b][p];
const maps=[];for(let a=1;a<29;a++)for(let b=0;b<29;b++)maps.push({a,b,k:Uint8Array.from(base,x=>mod(a*x+b))});
const target=gp.pages.filter(p=>p.page>=40&&p.page<=53).flatMap(p=>p.indices);if(target.length!==3008)throw Error("source");
function reach(c,s,k,limit=c.length){const f=new Uint8Array(1+c.slice(0,limit).filter(x=>x===0).length);f[0]=1;let lo=0,hi=0;for(let i=0;i<limit;i++){const v=c[i];if(v===0){for(let j=hi+1;j>=lo;j--)f[j]=(j>lo&&f[j-1])||(j<=hi&&f[j]&&k[s+i-j]!==0)?1:0;hi++}else{for(let j=lo;j<=hi;j++)if(f[j]&&k[s+i-j]===v)f[j]=0}
while(lo<=hi&&!f[lo])lo++;while(hi>=lo&&!f[hi])hi--;if(lo>hi)return i}return limit}
function encode(p,s,k){let j=s;return p.map(v=>v===0?0:mod(v+k[j++]))}
function viterbi(c,s,k,lo,hi,initial={j:s,a:29,b:29,l:0,seq:""}){let states=[initial];for(let i=lo;i<hi;i++){const next=new Map();function add(v,j,p){const l=v.l+score(v.a,v.b,p),key=(j*30+v.b)*30+p,old=next.get(key);if(!old||l>old.l)next.set(key,{j,a:v.b,b:p,l,seq:v.seq+String.fromCharCode(65+p)})}
for(const v of states){const p=mod(c[i]-k[v.j]);if(c[i]===0)add(v,v.j,0);if(p!==0)add(v,v.j+1,p)}states=Array.from(next.values());if(!states.length)return null}states.sort((a,b)=>b.l-a.l);return states[0]}
const decode=s=>Array.from(s,x=>x.charCodeAt(0)-65);
function fit(c,p,prefix,truth){let best=null,legal=0,rank=0,truthScore;const trueMap=maps.find(x=>x.a===truth.a&&x.b===truth.b);const t=viterbi(c,truth.s,trueMap.k,0,prefix);if(!t)throw Error("planted key");truthScore=t.l;
for(const {a,b,k} of maps)for(let s=0;s<N;s++){if(reach(c,s,k,prefix)<prefix)continue;legal++;const v=viterbi(c,s,k,0,prefix);if(v.l>truthScore+1e-9)rank++;if(!best||v.l>best.v.l)best={a,b,s,k,v}}
const follow=viterbi(c,best.s,best.k,prefix,c.length,best.v),plain=follow&&decode(follow.seq);return {legal,truthRank:rank+1,best:{a:best.a,b:best.b,s:best.s,score:best.v.l},prefixCorrect:decode(best.v.seq).filter((x,i)=>x===p[i]).length,heldoutCorrect:plain?plain.slice(prefix).filter((x,i)=>x===p[prefix+i]).length:0,total:p.length,replay:plain?encode(plain,best.s,best.k).every((x,i)=>x===c[i]):false}}

// Each chapter has independent origin and affine key. Freeze first floor(n/2) runes as train.
const ranges=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]],out=[];
for(const [p0,p1] of ranges){
const c=gp.pages.filter(p=>p.page>=p0&&p.page<=p1).flatMap(p=>p.indices),cut=Math.floor(c.length/2);let best=null,legal=0,full=0,max=0,top=[];
for(const {a,b,k} of maps)for(let s=0;s<N;s++){if(reach(c,s,k,cut)<cut)continue;legal++;const v=viterbi(c,s,k,0,cut);if(!v)throw Error("reach mismatch");if(!best||v.l>best.v.l)best={a,b,k,s,v};}
const tail=best&&viterbi(c,best.s,best.k,cut,c.length,best.v),trainPlain=best&&decode(best.v.seq),plain=tail&&decode(tail.seq);
for(const {a,b,k} of maps)for(let s=0;s<N;s++){const d=reach(c,s,k);if(d===c.length)full++;if(d>max){max=d;top=[]}if(d===max&&top.length<10)top.push([s,a,b])}
out.push({chapter:[p0,p1],n:c.length,cut,legal,full,max,top,best:best&&{s:best.s,a:best.a,b:best.b,train:best.v.l/cut,trainPreview:trainPlain.slice(0,60).map(x=>gp.translit[x]).join(""),heldoutLegal:!!tail,hold:tail?(tail.l-best.v.l)/(c.length-cut):null,holdPreview:tail?plain.slice(cut,cut+60).map(x=>gp.translit[x]).join(""):null,replay:tail?encode(plain,best.s,best.k).every((x,i)=>x===c[i]):false}})
}
return out;
};
const files=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json"];
console.log(JSON.stringify(run(...files.map(p=>JSON.parse(fs.readFileSync(path.join(__dirname,'..',p),'utf8')))),null,2));
