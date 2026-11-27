const fs=require('node:fs');
const paths=[
  "resources/liber-primus/lp2-corpus.json",
  "resources/control/english_wordfreq_textblob.txt",
  "resources/control/emerson_essays_2944.txt",
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/shakespeare_first300k.txt"
];
const inputs=Object.fromEntries(paths.map(p=>[p,fs.readFileSync(p,'utf8')]));
const run=function run(inputs, mode){
 const paths=["resources/liber-primus/lp2-corpus.json","resources/control/english_wordfreq_textblob.txt","resources/control/emerson_essays_2944.txt","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt"];
 const corpus=JSON.parse(inputs[paths[0]]),full=corpus.pages.filter(p=>p.page<56).flatMap(p=>p.indices),p55=corpus.pages.find(p=>p.page===55).indices;
 const diff=t=>t.slice(1).map((x,i)=>(x-t[i]+29)%29);
 const p=diff(p55);if(full.length!==12956||p.length!==75||new Set(p).size!==28||p.filter(x=>x===0).length!==1)throw Error("source shape");
 const chars="ABCDEFGHIJKLMNOPQRSTUVWXYZ",codes=".- -... -.-. -.. . ..-. --. .... .. .--- -.- .-.. -- -. --- .--. --.- .-. ... - ..- ...- .-- -..- -.-- --..".split(" "),M=Object.fromEntries([...chars].map((v,i)=>[v,codes[i]]));
 const word=w=>[...w].map(x=>M[x]).join("x"),words=s=>s.toUpperCase().match(/[A-Z]+/g)||[],pattern=s=>s.replace(/[.-]/g,"m"),reverse=s=>[...s].reverse().join("");
 const dictionary=[];let total=0;for(const l of inputs[paths[1]].split(/\r?\n/)){const m=l.match(/^([a-z]+)\s+(\d+)$/);if(!m)continue;const w=m[1].toUpperCase(),n=+m[2];if(w.length===1&&!["A","I","O"].includes(w))continue;const tr=word(w);dictionary.push({w,n,tr,pat:pattern(tr),rev:reverse(pattern(tr))});total+=n}for(const x of dictionary)x.score=Math.log(x.n/total);const wordSet=new Set(dictionary.map(x=>x.w));
 const byFull=new Map();for(const q of dictionary){if(!byFull.has(q.pat))byFull.set(q.pat,[]);byFull.get(q.pat).push(q)}
 const sorted=[...dictionary].sort((a,b)=>a.pat<b.pat?-1:a.pat>b.pat?1:0),revSorted=[...dictionary].sort((a,b)=>a.rev<b.rev?-1:a.rev>b.rev?1:0),maxLen=Math.max(...dictionary.map(q=>q.tr.length));
 function prefixRange(arr,field,s){let lo=0,hi=arr.length;while(lo<hi){const m=(lo+hi)>>1;if(arr[m][field]<s)lo=m+1;else hi=m}let end=lo;while(end<arr.length&&arr[end][field].startsWith(s))end++;return arr.slice(lo,end)}
 const templateCache=new Map();
 function templates(kind,pat){const k=kind+"|"+pat;if(templateCache.has(k))return templateCache.get(k);const out=new Map();function add(q,tr){const prev=out.get(tr);if(prev){prev.completions++;if(q.score>prev.score){prev.w=q.w;prev.score=q.score}}else out.set(tr,{tr,w:q.w,score:q.score,completions:1})}
 if(pat.length<=maxLen){
 if(kind==="full")for(const q of byFull.get(pat)||[])add(q,q.tr);
 else if(kind==="prefix")for(const q of prefixRange(sorted,"pat",pat))add(q,q.tr.slice(0,pat.length));
 else if(kind==="suffix")for(const q of prefixRange(revSorted,"rev",reverse(pat)))add(q,q.tr.slice(-pat.length));
 else for(const q of dictionary){let i=-1;while((i=q.pat.indexOf(pat,i+1))>=0)add(q,q.tr.slice(i,i+pat.length))}
 }
 const val=[...out.values()];templateCache.set(k,val);return val}
 function pop(x){x=x>>>0;x-=((x>>>1)&0x55555555);x=(x&0x33333333)+((x>>>2)&0x33333333);return (((x+(x>>>4))&0x0f0f0f0f)*0x01010101)>>>24}
 function enumerate(t,L,ends,first,callback){const active=t.reduce((m,x)=>m|1<<x,0);function masks(n){const a=new Set();for(let i=0;i+n<=t.length;i++){let m=0;for(let j=i;j<i+n;j++)m|=1<<t[j];a.add(m)}return [...a].sort((a,b)=>pop(a)-pop(b))}
 const pos=masks(L+1),neg=masks(3);let nodes=0,count=0,example=null,stop=false;function dfs(y,n){if(stop)return;nodes++;while(true){const yy=y,nn=n;for(const p of pos){if(p&y)continue;const v=p&~n;if(!v)return;if(!(v&(v-1)))y|=v}for(const q of neg){if(q&n)continue;const v=q&~y;if(!v)return;if(!(v&(v-1)))n|=v}if(y&n)return;if(y===yy&&n===nn)break}
 let best=0,bs=30;for(const [arr,w] of [[pos,1],[neg,-1]])for(const m of arr){if(m&(w===1?y:n))continue;const v=m&~(y|n);const z=pop(v);if(z<bs){bs=z;best=v;if(z===2)break}}
 if(!best){best=active&~(y|n);if(!best){count++;if(example===null)example=y;if(callback)callback(y);if(first)stop=true;return}}const bit=best&-best;dfs(y|bit,n);dfs(y,n|bit)}
 dfs(0,ends?((1<<t[0])|(1<<t.at(-1))):0);return {status:count?"SAT":"UNSAT",nodes,count,example,pos:pos.length,neg:neg.length}}
 function solve(t,clip,trueKey){let scenarios=0,lexFeasible=0,keyNodes=0,completePaths=0;const keys=new Map(),cache=new Map();function candidates(a,b,kind,p){const pat=p.slice(a,b),ck=kind+"|"+a+"|"+b+"|"+pat;if(cache.has(ck))return cache.get(ck);const opts=[];for(const q of templates(kind,pat)){let d=0,h=0,ok=true;for(let j=0;j<q.tr.length;j++){const x=q.tr[j];if(x==="x")continue;const bit=1<<t[a+j];if(x==="."){if(h&bit){ok=false;break}d|=bit}else{if(d&bit){ok=false;break}h|=bit}}if(ok)opts.push({...q,d,h})}cache.set(ck,opts);return opts}
 const state=enumerate(t,4,!clip,false,y=>{const p=t.map(x=>y>>x&1?"x":"m").join("");const base=[];let a=0;for(let i=0;i+1<p.length;){if(p.slice(i,i+2)==="xx"){if(a<i)base.push({a,b:i});a=i+2;i+=2}else i++}if(a<p.length)base.push({a,b:p.length});if(!base.length)return;
 const leftOpen=clip&&!p.startsWith("xx"),rightOpen=clip&&!p.endsWith("xx");
 for(const ls of leftOpen&&p.startsWith("x")?[false,true]:[false])for(const rs of rightOpen&&p.endsWith("x")?[false,true]:[false]){const seg=base.map(s=>({...s}));if(ls)seg[0].a++;if(rs)seg.at(-1).b--;if(seg.some(s=>s.a>=s.b))continue;scenarios++;const groups=seg.map((s,i)=>{const l=i===0&&leftOpen&&!ls,r=i===seg.length-1&&rightOpen&&!rs;return {...s,i,kind:l?(r?"substring":"suffix"):(r?"prefix":"full")}});groups.sort((a,b)=>(a.kind==="full"?0:1)-(b.kind==="full"?0:1)||(b.b-b.a)-(a.b-a.a));let fail=false;for(const g of groups){g.opts=candidates(g.a,g.b,g.kind,p);if(!g.opts.length){fail=true;break}}if(fail)continue;lexFeasible++;groups.sort((a,b)=>a.opts.length-b.opts.length);const chosen=new Array(groups.length);
 function rec(i,d,h,score){keyNodes++;if(i===groups.length){completePaths++;const tr=t.map(x=>y>>x&1?"x":d>>x&1?".":"-").join(""),id=y+":"+d;const record={sep:y,dots:d,dashes:h,score,visible:tr,completions:chosen.map(q=>q.w),completionCounts:chosen.map(q=>q.completions),fragments:chosen.map(q=>q.tr)};const old=keys.get(id);if(!old||score>old.score)keys.set(id,record);return}const g=groups[i];for(const q of g.opts)if(!(q.d&h)&&!(q.h&d)){chosen[g.i]=q;rec(i+1,d|q.d,h|q.h,score+q.score)}}
 rec(0,0,0,0)}
 });
 const top=[...keys.values()].sort((a,b)=>b.score-a.score);for(const q of top.slice(0,10)){if(t.map(x=>q.sep>>x&1?"x":q.dots>>x&1?".":"-").join("")!==q.visible)throw Error("replay");if(!clip&&q.completions.map(word).join("xx")!==q.visible)throw Error("phrase replay")}
 return {clip,separatorMasks:state.count,separatorNodes:state.nodes,scenarios,lexFeasible,keyNodes,completePaths,distinctKeys:keys.size,trueKeyRank:trueKey?top.findIndex(q=>q.sep===trueKey.sep&&q.dots===trueKey.dots)+1:null,top:top.slice(0,5),allKeys:mode.includes('allkeys')?top:undefined,templateCache:templateCache.size,localCache:cache.size}}
 function rng(seed){let s=seed>>>0;return n=>{s^=s<<13;s^=s>>>17;s^=s<<5;return (s>>>0)%n}}
 function plant(tr,seed){for(let trial=0;trial<100000;trial++){const r=rng(seed+trial*7919),a=Array.from({length:29},(_,i)=>i);for(let i=28;i>0;i--){const j=r(i+1);[a[i],a[j]]=[a[j],a[i]]}const groups={".":a.slice(0,10),"-":a.slice(10,20),x:a.slice(20)},t=[];let zeros=0;for(const c of tr){const pool=groups[c].filter(x=>x!==0||zeros===0);const x=pool[r(pool.length)];zeros+=x===0;t.push(x)}if(new Set(t).size!==28||zeros!==1)continue;const active=t.reduce((m,x)=>m|1<<x,0),sep=groups.x.reduce((m,x)=>m|1<<x,0)&active,dots=groups["."].reduce((m,x)=>m|1<<x,0)&active;const c=[r(29)];for(const d of t)c.push((c.at(-1)+d)%29);if(diff(c).some((x,i)=>x!==t[i]))throw Error("sender replay");return {t,key:{sep,dots},trial}}throw Error("plant not found")}
 function sourcePhrase(s,start,clip){const a=words(s);for(let i=start;i<a.length;i++){let tr="",ws=[];for(let j=i;j<a.length&&wordSet.has(a[j]);j++){tr+=(j===i?"":"xx")+word(a[j]);ws.push(a[j]);if(!clip){if(tr.length===75&&ws.length>=4)return {phrase:ws.join(" "),tr,offset:i};if(tr.length>75)break}else if(tr.length>=90){const off=1;if(tr[off]!=="x"&&tr[off+74]!=="x"&&tr[off+75]!=="x"&&off<word(a[i]).length)return {phrase:ws.join(" "),tr:tr.slice(off,off+75),offset:i,start:off};break}}}throw Error("no phrase")}
 if(mode.startsWith("control")){const k=+mode.at(-1),clip=k===2,source=paths[k+2],q=sourcePhrase(inputs[source],1700+100*k,clip),planting=plant(q.tr,6157+101*k),fit=solve(planting.t,clip,planting.key);if(fit.trueKeyRank<1)throw Error("true key missing");return {mode,source,...q,plant:planting.trial,key:planting.key,fit}}
 if(mode==="grammar"){const cuts=[0,729,1874,3603,5506,6527,7960,9640,12648,12956];return [["full",diff(full)],...cuts.slice(0,-1).map((x,i)=>["chapter"+i,diff(full.slice(x,cuts[i+1]))]),["p55",p]].map(([name,t])=>({name,n:t.length,results:[4,5,8].map(L=>({L,...enumerate(t,L,false,true)}))}))}
 const rev=mode.includes("reverse"),clip=mode.includes("clipped"),fit=solve(rev?[...p].reverse():p,clip,null);
 if(mode.includes("allkeys")){const all=diff(corpus.pages.filter(x=>x.page===54||x.page===55).flatMap(x=>x.indices)),active=p.reduce((m,x)=>m|1<<x,0),missing=Array.from({length:29},(_,i)=>i).filter(i=>!(active>>i&1));if(missing.length!==1)throw Error("missing shape");
 const preceding=all.slice(0,-p.length);let maxGrammar=-1,winners=[],hist={};for(const q of fit.allKeys){for(const missingTrit of [".","-","x"]){const decode=x=>x===missing[0]?missingTrit:q.sep>>x&1?"x":q.dots>>x&1?".":"-";const base=q.visible,extra=preceding.map(decode).join("");let n=0;for(let k=1;k<=extra.length;k++){const tr=rev?base+reverse(extra.slice(-k)):extra.slice(-k)+base;if(tr.includes("xxx")||/[.-]{5}/.test(tr))break;n=k}hist[n]=(hist[n]||0)+1;if(n>maxGrammar){maxGrammar=n;winners=[]}if(n===maxGrammar)winners.push({key:q,missingTrit,n,tr:rev?base+reverse(extra.slice(-n)):extra.slice(-n)+base})}}
 fit.continuation={missing,preceding:preceding.length,maxGrammar,hist,winners:winners.slice(0,5)};
 }
 return {mode,dictionary:dictionary.length,fit};
};
console.log(JSON.stringify(run(inputs,process.argv[2]||'grammar'),null,2));
