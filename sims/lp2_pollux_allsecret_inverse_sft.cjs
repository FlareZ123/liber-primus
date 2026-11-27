// Direct stationary GP29 Pollux receiver. Exact grammar and lexical inverses.
// Node 22; run from repository root.
const fs=require('node:fs');
const paths=[
  "resources/liber-primus/lp2-corpus.json",
  "resources/control/english_wordfreq_textblob.txt",
  "resources/control/emerson_essays_2944.txt",
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/shakespeare_first300k.txt",
  "resources/external/2013-book-of-law-I.txt",
  "resources/external/2013-book-of-law-II.txt",
  "resources/external/2013-book-of-law-III.txt",
  "resources/external/blake-marriage-1906-gutenberg45315.txt",
  "resources/external/cicada2012-blake-marriage-gutenberg45315.txt",
  "resources/external/tennyson-lady-of-shalott-1832-mptc.txt",
  "resources/external/tennyson-lady-of-shalott-1842-gutenberg8601.txt",
  "resources/liber-primus/lp1-plaintext-reference.txt",
  "resources/external/relikd-solved-gp29-native-v1.json"
];
const inputs=Object.fromEntries(paths.map(p=>[p,fs.readFileSync(p,'utf8')]));
const run=function run(inputs,paths){
 const corpus=JSON.parse(inputs[paths[0]]),full=corpus.pages.filter(p=>p.page<56).flatMap(p=>p.indices),p55=corpus.pages.find(p=>p.page===55).indices;
 if(full.length!==12956||p55.length!==76||new Set(p55).size!==25)throw Error("source shape");
 const chars="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",codes=".- -... -.-. -.. . ..-. --. .... .. .--- -.- .-.. -- -. --- .--. --.- .-. ... - ..- ...- .-- -..- -.-- --.. ----- .---- ..--- ...-- ....- ..... -.... --... ---.. ----.".split(" "),M=Object.fromEntries([...chars].map((v,i)=>[v,codes[i]]));
 const word=w=>[...w].map(x=>M[x]).join("x"),words=s=>s.toUpperCase().match(/[A-Z0-9]+/g)||[],morse=s=>words(s).map(word).join("xx"),pattern=s=>s.replace(/[.-]/g,"m");
 const dictionary=[];let total=0;for(const l of inputs[paths[1]].split(/\r?\n/)){const m=l.match(/^([a-z]+)\s+(\d+)$/);if(!m)continue;const w=m[1].toUpperCase(),n=+m[2];if(w.length===1&&!["A","I","O"].includes(w))continue;dictionary.push({w,n,t:word(w)});total+=n}for(const x of dictionary)x.score=Math.log(x.n/total);const wordSet=new Set(dictionary.map(x=>x.w));
 function pop(x){x=x>>>0;x-=((x>>>1)&0x55555555);x=(x&0x33333333)+((x>>>2)&0x33333333);return (((x+(x>>>4))&0x0f0f0f0f)*0x01010101)>>>24}
 function enumerate(t,L,ends,first,callback){const active=t.reduce((m,x)=>m|1<<x,0);function masks(n){const a=new Set();for(let i=0;i+n<=t.length;i++){let m=0;for(let j=i;j<i+n;j++)m|=1<<t[j];a.add(m)}return [...a].sort((a,b)=>pop(a)-pop(b))}
 const pos=masks(L+1),neg=masks(3);let nodes=0,count=0,example=null,stop=false;function dfs(y,n){if(stop)return;nodes++;while(true){const yy=y,nn=n;for(const p of pos){if(p&y)continue;const v=p&~n;if(!v)return;if(!(v&(v-1)))y|=v}for(const q of neg){if(q&n)continue;const v=q&~y;if(!v)return;if(!(v&(v-1)))n|=v}if(y&n)return;if(y===yy&&n===nn)break}
 let best=0,bs=30;for(const [arr,w] of [[pos,1],[neg,-1]])for(const m of arr){if(m&(w===1?y:n))continue;const v=m&~(y|n);const z=pop(v);if(z<bs){bs=z;best=v;if(z===2)break}}
 if(!best){best=active&~(y|n);if(!best){count++;if(example===null)example=y;if(callback)callback(y);if(first)stop=true;return}}const bit=best&-best;dfs(y|bit,n);dfs(y,n|bit)}
 dfs(0,ends?((1<<t[0])|(1<<t.at(-1))):0);return {status:count?"SAT":"UNSAT",nodes,count,example,pos:pos.length,neg:neg.length}}
 const cuts=[0,729,1874,3603,5506,6527,7960,9640,12648,12956];
 const grammar=[["full",full],...cuts.slice(0,-1).map((a,i)=>["chapter"+i,full.slice(a,cuts[i+1])]),["p55",p55]].map(([name,t])=>({name,n:t.length,results:[4,5,8].map(L=>({L,...enumerate(t,L,false,true)}))}));
 function solveLex(t,clip,trueKey){const cases=[],queries=new Map();function addQuery(kind,p){const k=kind+"|"+p;if(!queries.has(k))queries.set(k,new Map());return k}
 const state=enumerate(t,4,!clip,false,y=>{const p=t.map(x=>y>>x&1?"x":"m").join("");const base=[];let a=0;for(let i=0;i+1<p.length;){if(p.slice(i,i+2)==="xx"){if(a<i)base.push({a,b:i});a=i+2;i+=2}else i++}if(a<p.length)base.push({a,b:p.length});if(!base.length)return;
 const leftOpen=clip&&!p.startsWith("xx"),rightOpen=clip&&!p.endsWith("xx");
 for(const ls of leftOpen&&p.startsWith("x")?[false,true]:[false])for(const rs of rightOpen&&p.endsWith("x")?[false,true]:[false]){const seg=base.map(s=>({...s}));if(ls)seg[0].a++;if(rs)seg.at(-1).b--;if(seg.some(s=>s.a>=s.b))continue;const chunks=seg.map((s,i)=>{const l=i===0&&leftOpen&&!ls,r=i===seg.length-1&&rightOpen&&!rs;const kind=l?(r?"substring":"suffix"):(r?"prefix":"full");return {...s,k:addQuery(kind,p.slice(s.a,s.b))}});cases.push({y,chunks})}});
 const lengths=Object.fromEntries(["full","prefix","suffix","substring"].map(k=>[k,new Set([...queries.keys()].filter(q=>q.startsWith(k+"|")).map(q=>q.length-k.length-1))]));
 function add(kind,tr,x){const k=kind+"|"+pattern(tr),m=queries.get(k);if(!m)return;const old=m.get(tr);if(!old)m.set(tr,{tr,w:x.w,score:x.score,completions:1});else{old.completions++;if(x.score>old.score){old.w=x.w;old.score=x.score}}}
 for(const x of dictionary){add("full",x.t,x);for(const L of lengths.prefix)if(L<=x.t.length)add("prefix",x.t.slice(0,L),x);for(const L of lengths.suffix)if(L<=x.t.length)add("suffix",x.t.slice(-L),x);for(const L of lengths.substring)for(let i=0;i+L<=x.t.length;i++)add("substring",x.t.slice(i,i+L),x)}
 let lexFeasible=0,keyNodes=0,completePaths=0;const keys=new Map(),cache=new Map();
 function candidates(s){const ck=s.k+"|"+t.slice(s.a,s.b).join(",");if(cache.has(ck))return cache.get(ck);const opts=[];for(const q of queries.get(s.k).values()){let d=0,h=0,ok=true;for(let j=0;j<q.tr.length;j++){const x=q.tr[j];if(x==="x")continue;const bit=1<<t[s.a+j];if(x==="."){if(h&bit){ok=false;break}d|=bit}else{if(d&bit){ok=false;break}h|=bit}}if(ok)opts.push({...q,d,h})}cache.set(ck,opts);return opts}
 for(const {y,chunks} of cases){const groups=chunks.map((s,i)=>({i,s,opts:candidates(s)}));if(groups.some(g=>!g.opts.length))continue;lexFeasible++;groups.sort((a,b)=>a.opts.length-b.opts.length);const chosen=new Array(groups.length);
 function rec(i,d,h,score){keyNodes++;if(i===groups.length){completePaths++;const tr=t.map(x=>y>>x&1?"x":d>>x&1?".":"-").join("");const id=y+":"+d;const record={sep:y,dots:d,dashes:h,score,visible:tr,completions:chosen.map(q=>q.w),completionCounts:chosen.map(q=>q.completions),fragments:chosen.map(q=>q.tr)};const old=keys.get(id);if(!old||score>old.score)keys.set(id,record);return}const g=groups[i];for(const q of g.opts)if(!(q.d&h)&&!(q.h&d)){chosen[g.i]=q;rec(i+1,d|q.d,h|q.h,score+q.score)}}
 rec(0,0,0,0)}
 const top=[...keys.values()].sort((a,b)=>b.score-a.score);for(const q of top.slice(0,10)){const replay=t.map(x=>q.sep>>x&1?"x":q.dots>>x&1?".":"-").join("");if(replay!==q.visible)throw Error("replay");if(!clip&&q.completions.map(word).join("xx")!==q.visible)throw Error("phrase replay")}
 return {clip,separatorMasks:state.count,separatorNodes:state.nodes,scenarios:cases.length,queries:queries.size,lexFeasible,keyNodes,completePaths,distinctKeys:keys.size,trueKeyRank:trueKey?top.findIndex(q=>q.sep===trueKey.sep&&q.dots===trueKey.dots)+1:null,top:top.slice(0,5)}}
 function rng(seed){let s=seed>>>0;return n=>{s^=s<<13;s^=s>>>17;s^=s<<5;return (s>>>0)%n}}
 function plant(tr,seed){for(let trial=0;trial<20000;trial++){const r=rng(seed+trial*7919),a=Array.from({length:29},(_,i)=>i);for(let i=28;i>0;i--){const j=r(i+1);[a[i],a[j]]=[a[j],a[i]]}const groups={".":a.slice(0,10),"-":a.slice(10,20),x:a.slice(20)},t=[];for(const c of tr){const pool=groups[c].filter(x=>x!==t.at(-1));t.push(pool[r(pool.length)])}if(new Set(t).size!==25)continue;const active=t.reduce((m,x)=>m|1<<x,0),sep=groups.x.reduce((m,x)=>m|1<<x,0)&active,dots=groups["."].reduce((m,x)=>m|1<<x,0)&active;return {t,key:{sep,dots},trial}}throw Error("plant not found")}
 function sourcePhrase(s,start){const a=words(s);for(let i=start;i<a.length;i++){let tr="",ws=[];for(let j=i;j<a.length&&wordSet.has(a[j]);j++){tr+=(j===i?"":"xx")+word(a[j]);if(tr.length>76)break;ws.push(a[j]);if(tr.length===76&&ws.length>=4)return {phrase:ws.join(" "),tr,offset:i}}}throw Error("no phrase")}
 const controls=[];for(let k=0;k<3;k++){const source=paths[k+2],p=sourcePhrase(inputs[source],1000+100*k),q=plant(p.tr,3301+101*k);const fit=solveLex(q.t,false,q.key);if(fit.trueKeyRank<1)throw Error("true complete key missing");controls.push({source,phrase:p.phrase,offset:p.offset,plant:q.trial,key:q.key,fit})}
 const clippedControls=[];for(let k=0;k<3;k++){const source=paths[k+2],a=words(inputs[source]);let p=null;for(let i=1500+100*k;i<a.length&&!p;i++){let tr="",ws=[];for(let j=i;j<a.length&&wordSet.has(a[j]);j++){tr+=(j===i?"":"xx")+word(a[j]);ws.push(a[j]);if(tr.length>=90){const start=1+k;if(tr[start]!=="x"&&tr[start+75]!=="x"&&tr[start+76]&&tr[start+76]!=="x"&&start<word(a[i]).length){p={phrase:ws.join(" "),tr:tr.slice(start,start+76),offset:i,start};}break}}}if(!p)throw Error("no clipped phrase");const q=plant(p.tr,4501+101*k);const fit=solveLex(q.t,true,q.key);if(fit.trueKeyRank<1)throw Error("true clipped key missing");clippedControls.push({source,phrase:p.phrase,offset:p.offset,start:p.start,plant:q.trial,key:q.key,fit})}
 // Exact tiny reference enumeration for the separator DPLL.
 let tiny=0;const trng=rng(71237);for(let z=0;z<120;z++){const n=3+trng(4),L=2+trng(4),t=Array.from({length:6+trng(13)},()=>trng(n)),active=t.reduce((m,x)=>m|1<<x,0);let brute=0;for(let m=0;m<1<<n;m++){if(m&~active)continue;const b=t.map(x=>m>>x&1?"x":"m").join("");if(!b.includes("xxx")&&!b.includes("m".repeat(L+1)))brute++}if(enumerate(t,L,false,false).count!==brute)throw Error("DPLL tiny mismatch");tiny++}
 const original=[{direction:"forward",...solveLex(p55,false,null)},{direction:"reverse",...solveLex([...p55].reverse(),false,null)},{direction:"forward",...solveLex(p55,true,null)},{direction:"reverse",...solveLex([...p55].reverse(),true,null)}];
 function constraints(c){const first=new Int32Array(29).fill(-1),pairs=[];for(let i=0;i<c.length;i++){if(first[c[i]]<0)first[c[i]]=i;else pairs.push([first[c[i]],i])}return pairs.sort((a,b)=>(b[1]-b[0])-(a[1]-a[0]))}
 const pairs=[constraints(p55),constraints([...p55].reverse())];function scan(tr,p){const hits=[];for(let i=0;i+76<=tr.length;i++){let ok=true;for(const [a,b] of p)if(tr[i+a]!==tr[i+b]){ok=false;break}if(ok)hits.push(i)}return hits}
 const quote=[];for(const path of paths.slice(2)){let entries=[[path,inputs[path]]];if(path.endsWith(".json")){const rm=Object.fromEntries(corpus.runes.map((v,i)=>[v,corpus.translit[i]]));entries=JSON.parse(inputs[path]).sections.map(x=>[x.name,[...x.source_text].map(c=>rm[c]||" ").join("")])}for(const [name,s] of entries){const tr=morse(s);quote.push({name,trits:tr.length,windows:Math.max(0,tr.length-75),forward:scan(tr,pairs[0]),reverse:scan(tr,pairs[1])})}}
 const quotePlant=sourcePhrase(inputs[paths[3]],1100),q=plant(quotePlant.tr,997),quoteCheck=scan(quotePlant.tr,constraints(q.t));if(quoteCheck[0]!==0)throw Error("quote positive failure");
 return {dictionary:dictionary.length,grammar,controls,clippedControls,tiny,original,quote,quotePositive:quoteCheck};
};
console.log(JSON.stringify(run(inputs,paths),null,2));
