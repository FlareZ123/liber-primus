"use strict";
const fs=require("node:fs");
const paths=["resources/transcriptions/lp2-image-corrected.txt","resources/control/english_wordfreq_textblob.txt","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/external/relikd-solved-gp29-native-v1.json"];
function run(src){
const R="ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ";
const toks="F,U,TH,O,R,C,G,W,H,N,I,J,EO,P,X,S,T,B,E,M,L,NG,OE,D,A,AE,Y,IA,EA".split(",").map((s,i)=>[s,i]).sort((a,b)=>b[0].length-a[0].length);
const enc=(w,alt)=>{w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");let out=[];while(w){let x=alt&&w.startsWith("ING")?["ING",21]:alt&&w.startsWith("IO")?["IO",27]:toks.find(t=>w.startsWith(t[0]));if(!x)return [];out.push(x[1]);w=w.slice(x[0].length)}return out};
const key=w=>String.fromCharCode(...w.map(x=>65+x));
const lex=new Map();const add=w=>{if(w.length&&w.length<=24)lex.set(key(w),w)};
for(const l of src[1].split(/\r?\n/)){const m=l.match(/^([a-zA-Z]+)\s+\d+/);if(m){add(enc(m[1],false));add(enc(m[1],true))}}
for(const t of src.slice(2,5)){let s=t.replace(/\r/g,"");let i=s.search(/\*\*\* START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK/);if(i>=0)s=s.slice(s.indexOf("\n",i)+1);i=s.search(/\*\*\* END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK/);if(i>=0)s=s.slice(0,i);let ws=(s.match(/[A-Za-z]+/g)||[]).map(w=>enc(w,true)).filter(w=>w.length&&w.length<=14);for(const w of ws.slice(0,Math.floor(ws.length*.8)))add(w)}
for(const s of JSON.parse(src[5]).sections){let t=Object.values(s).find(x=>typeof x==="string"&&x.includes("ᚠ")&&x.includes("ᚢ"));if(t)for(const w of t.match(/[ᚠ-ᛠ]+/g)||[])add([...w].map(c=>R.indexOf(c)).filter(i=>i>=0))}
for(let i=0;i<29;i++)add([i]);
let sentences=[],words=[],word=[],pos=0;const flush=()=>{if(word.length){words.push(word);word=[]}};const sent=()=>{flush();if(words.length){sentences.push({start:pos-words.flat().length,words});words=[]}};
for(const c of src[0]){if(R.includes(c)){if(pos===12956)break;word.push(R.indexOf(c));pos++}else if(/[-.&$§0-9]/.test(c)){flush();if(/[.&$§]/.test(c))sent()}}sent();
if(pos!==12956||sentences.reduce((n,s)=>n+s.words.length,0)!==2896)throw Error("source counts");
function pattern(w){const m=new Map();return key(w.map(x=>{if(!m.has(x))m.set(x,m.size);return m.get(x)}))}
const ix=new Map();for(const w of lex.values()){const k=w.length+":"+pattern(w);if(!ix.has(k))ix.set(k,[]);ix.get(k).push(w)}
let result=[],totalNodes=0,totalOov=0,logChoices=0,allP=[],allC=[];
for(const s of sentences){
const C=s.words.flat(),N=C.length, lengths=[...new Set(s.words.map(w=>w.length))].sort((a,b)=>b-a),cnt=lengths.map(l=>s.words.filter(w=>w.length===l).length),k=lengths.length;
const edges=Array.from({length:N},(_,p)=>lengths.map(l=>p+l<=N?(ix.get(l+":"+pattern(C.slice(p,p+l)))||[]):[]));
const suffix=Array.from({length:N+1},()=>Array(k).fill(0)),dp=Array(N+1).fill(0);
for(let p=N-1;p>=0;p--){dp[p]=dp[p+1];for(let j=0;j<k;j++){suffix[p][j]=suffix[p+1][j]+(edges[p][j].length>0?1:0);if(edges[p][j].length)dp[p]=Math.max(dp[p],1+dp[p+lengths[j]])}}
const lb=(p)=>Math.max(cnt.reduce((a,n,j)=>a+Math.max(0,n-suffix[p][j]),0),cnt.reduce((a,n)=>a+n,0)-dp[p]);
let lower=lb(0),solution=null,nodes=0,cap=false,foundBudget=null;
for(let b=lower;b<=Math.max(lower,6)&&!solution;b++){const memo=new Map(),stack=[];
function dfs(p,budget){if(++nodes>1500000){cap=true;return false}if(p===N)return true;if(lb(p)>budget)return false;const id=cnt.join(",");if((memo.get(id)??-1)>=budget)return false;
const order=Array.from({length:k},(_,j)=>j).filter(j=>cnt[j]&&p+lengths[j]<=N).sort((a,b)=>Number(edges[p][b].length>0)-Number(edges[p][a].length>0)||lengths[b]-lengths[a]);
for(const j of order){const miss=edges[p][j].length?0:1;if(miss>budget)continue;cnt[j]--;stack.push({p,j,miss});if(dfs(p+lengths[j],budget-miss))return true;stack.pop();cnt[j]++;if(cap)return false}memo.set(id,budget);return false}
if(dfs(0,b)){solution=stack.slice();foundBudget=b}if(cap)break}
if(!solution){result.push({start:s.start,N,lower,nodes,cap,failed:true});continue}
let witness=[],misses=0,log=0;
for(const q of solution){let c=C.slice(q.p,q.p+lengths[q.j]),domain=edges[q.p][q.j],p=domain[0]||c;const m=new Map(),used=new Set();for(let i=0;i<p.length;i++){if(m.has(p[i])&&m.get(p[i])!==c[i])throw Error("bad permutation");if(!m.has(p[i])&&used.has(c[i]))throw Error("bad inverse");m.set(p[i],c[i]);used.add(c[i])}for(let i=0;i<29;i++)if(!m.has(i)){let t=Array.from({length:29},(_,x)=>x).find(x=>!used.has(x));m.set(i,t);used.add(t)}if(key(p.map(x=>m.get(x)))!==key(c))throw Error("replay");if(q.miss&&lex.has(key(p)))throw Error("OOV wrong");misses+=q.miss;log+=Math.log10(Math.max(1,domain.length));witness.push({offset:s.start+q.p,plain:key(p),choices:domain.length});allP.push(...p);allC.push(...c)}
if(solution.length!==s.words.length||key(solution.map(x=>lengths[x.j]).sort((a,b)=>a-b))!==key(s.words.map(w=>w.length).sort((a,b)=>a-b)))throw Error("hist");
totalNodes+=nodes;totalOov+=misses;logChoices+=log;result.push({start:s.start,N,lower,nodes,minimum:foundBudget,misses,logChoices:log,witness})
}
return {lexicon:lex.size,sentences:sentences.length,words:sentences.reduce((n,s)=>n+s.words.length,0),runes:pos,failed:result.filter(x=>x.failed),totalNodes,totalOov,logChoices,replayed:allC.length,rows:result}
}
const out=run(paths.map(p=>fs.readFileSync(p,"utf8")));
console.log(JSON.stringify(out,null,2));
