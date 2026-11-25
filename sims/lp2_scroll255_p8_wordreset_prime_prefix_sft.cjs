'use strict';
// Exact source-specific cursor and arbitrary shared-prefix key recovery. Read-only Node 22.
const fs=require('node:fs'),path=require('node:path');
function experiment(raw){
 const gp=JSON.parse(raw[0]),grid=JSON.parse(raw[2]),gold=JSON.parse(raw[3]),ix=new Map(gp.runes.map((x,i)=>[x,i]));
 const check=(x,m)=>{if(!x)throw Error(m)},same=(a,b)=>JSON.stringify(a)===JSON.stringify(b),mod=x=>(x%29+29)%29,id=w=>String.fromCharCode(...w);
 const primes=[];for(let n=2;primes.length<3340;n++)if(primes.every(p=>p*p>n||n%p))primes.push(n);
 const shift=primes.map(p=>(p-1)%29);
 check(same(primes.slice(0,29),gp.prime),"GP chart primes");
 const words=[];let pending=[];for(const part of raw[1].split("%").slice(3,8))for(const ch of part){if(ix.has(ch))pending.push(ix.get(ch));else if("-.".includes(ch)&&pending.length){words.push(pending);pending=[]}}if(pending.length)words.push(pending);
 const c=gp.pages[8].indices;check(words.length===255&&c.length===255&&same(words.flat(),gp.pages.slice(3,8).flatMap(p=>p.indices)),"source register");
 const taps=words.slice(-5).map(w=>w.reduce((v,x)=>v*x%29,1));check(same(taps,[11,26,8,15,2]),"red taps");
 const digits=grid.alphabet.replace("f",""),bytes=grid.pages.flatMap(p=>p.tokens).map(t=>59*digits.indexOf(t[0])+digits.indexOf(t[1]));check(bytes.length===256&&bytes.every(v=>v>=0&&v<=251),"radix59");
 let s=[taps[4]%4,0,0,0];function mul(a,b){let v=0;for(let k=0;k<2;k++){if((b>>>k)&1)v^=a;a<<=1;if(a&4)a^=7}return v}
 const addresses=[];const h=c.map(v=>{const a=s.reduce((x,y)=>4*x+y,0);addresses.push(a);const out=(v+bytes[a])%29;const z=s.reduce((x,y,j)=>x^mul(y,taps[j]%4),0);s=[...s.slice(1),z];return out});check(new Set(addresses).size===255&&!addresses.includes(0),"orbit");check(same([[47,240],[48,231],[235,236],[88,179]].map(([i,j])=>[h[i],h[j]]),[[20,20],[8,8],[2,2],[9,9]]),"four conditional collisions");
 const tokens=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
 function runeWords(t){return [...t.matchAll(/[\u16a0-\u16ff]+/gu)].map(m=>[...m[0]].map(x=>ix.get(x)))}
 function spell(word,alt){const w=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S"),p=[];for(let j=0;j<w.length;){const v=alt&&w.startsWith("ING",j)?{t:"ING",i:21}:alt&&w.startsWith("IO",j)?{t:"IO",i:27}:tokens.find(x=>w.startsWith(x.t,j));if(!v)throw Error("unknown token "+w);p.push(v.i);j+=v.t.length}return p}
 function native(t){const a=/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t),b=/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t);return (t.slice(a?a.index+a[0].length:0,b?b.index:t.length).toUpperCase().match(/[A-Z]+/g)||[]).map(w=>spell(w,true))}
 const donors=raw.slice(4,7).map(native),training=donors.map(w=>w.slice(0,Math.floor(w.length*.8)));
 for(const g of gold.sections)if(!["0_welcome","jpg107-167"].includes(g.name))training.push(runeWords(g.source_text));
 const vocab=new Map(training.flat().filter(w=>w.length<=24).map(w=>[id(w),w]));check(vocab.size===10842,"narrow vocabulary");
 for(const line of raw[7].split(/\r?\n/)){const match=/^([a-z]+) (\d+)$/.exec(line);if(match)for(const alt of [false,true]){const p=spell(match[1],alt);if(p.length<=24)vocab.set(id(p),p)}}for(let i=0;i<29;i++)vocab.set(id([i]),[i]);check(vocab.size===35944,"broad vocabulary");
 const byLength=new Map;for(const p of vocab.values()){if(!byLength.has(p.length))byLength.set(p.length,[]);byLength.get(p.length).push(p)}
 /** @param {number[]} w @param {number[]} key @param {number} start */
 function encrypt(w,key,start=0){let j=start;return w.map(v=>v===0?0:mod(v+key[j++]))}
 const p56=gold.sections.find(x=>x.name==="p56_an_end"),p=runeWords(p56.source_text).flat(),actual=gp.pages.find(x=>x.page===56).indices;check(p.length===85&&same(encrypt(p,shift),actual),"real p56 native replay");
 /** Enumerate all legal F-hold inverses, not just a greedy transparent-F branch. */
 function inv(w,start){let legal=false,covered=false,p=[];function rec(i,j){if(i===w.length){legal=true;if(vocab.has(id(p)))covered=true;return}const q=w[i];if(q===0){p.push(0);rec(i+1,j);p.pop()}const v=mod(q-shift[j]);if(v){p.push(v);rec(i+1,j+1);p.pop()}}rec(0,start);return {legal,covered}}
 function matrix(ws,limit){return ws.map(w=>Uint8Array.from({length:limit},(_,j)=>{const r=inv(w,j);return r.covered?2:r.legal?1:0}))}
 function evaluate(ws,seq,M,limits){const result={fixed:[],domains:[]};for(const [name,seed] of [["index",y=>y],["prime",y=>primes[y]],["primeMinusOne",y=>primes[y]-1]]){let legal=0,covered=0,bad=[];for(let i=0;i<ws.length;i++){const r=M[i][seed(seq[i])];if(r)legal++;else bad.push(i);if(r===2)covered++}result.fixed.push({name,legal,covered,bad})}
 for(const limit of limits){const classes=Array.from({length:29},(_,y)=>ws.map((_,i)=>i).filter(i=>seq[i]===y));const domains=classes.map((g,y)=>{let allowed=0,best=-1,seeds=[],maxIgnoreLegality=-1;for(let j=0;j<limit;j++){let n=0,legal=true;for(const i of g){const r=M[i][j];if(!r)legal=false;if(r===2)n++}maxIgnoreLegality=Math.max(maxIgnoreLegality,n);if(!legal)continue;allowed++;if(n>best){best=n;seeds=[j]}else if(n===best)seeds.push(j)}return {y,words:g.length,legalSeeds:allowed,best,bestSeeds:seeds,ignoreLegalityBest:maxIgnoreLegality}});
 const legal=domains.every(d=>d.legalSeeds>0),best=legal?domains.reduce((a,d)=>a+d.best,0):null,free=ws.filter((_,i)=>M[i].subarray(0,limit).includes(2)).length,freeLegal=ws.filter((_,i)=>M[i].subarray(0,limit).some(v=>v>0)).length;
 result.domains.push({limit,legal,best,ignoreLegalityBest:domains.reduce((a,d)=>a+d.ignoreLegalityBest,0),free,freeLegal,domains})}
 return result}
 /** Derive necessary and sufficient consuming key prefix for a word pair. */
 function derive(c,p){const k=[];for(let i=0;i<c.length;i++){if(!p[i]){if(c[i]!==0)return null;}else k.push(mod(c[i]-p[i]))}return k}
 /** Exact maximum coverage of word slots by a shared key prefix, with arbitrary OOV slots relaxed. */
 function trieSolve(ws,seq,truth=null){let total=0,stats=[],trueCovered=0;for(let y=0;y<29;y++){const g=ws.map((w,i)=>({w,i})).filter(x=>seq[x.i]===y),root={mask:0n,children:new Map};let nodes=1,entries=0;
 for(let i=0;i<g.length;i++){const w=g[i].w;for(const p of byLength.get(w.length)||[]){const k=derive(w,p);if(!k)continue;let node=root;for(const v of k){if(!node.children.has(v)){node.children.set(v,{mask:0n,children:new Map});nodes++}node=node.children.get(v)}node.mask|=1n<<BigInt(i);entries++}}
 let best=-1,path=[],mask=0n;function count(n){let c=0;while(n){n&=n-1n;c++}return c}function dfs(node,prefix,seen){seen|=node.mask;const n=count(seen);if(n>best||(n===best&&prefix.length>path.length)){best=n;path=prefix.slice();mask=seen}for(const [v,child]of node.children){prefix.push(v);dfs(child,prefix,seen);prefix.pop()}}dfs(root,[],0n);
 const matched=[];for(let i=0;i<g.length;i++){const {w,i:index}=g[i];const hits=(byLength.get(w.length)||[]).filter(p=>{const k=derive(w,p);return k!==null&&k.length<=path.length&&k.every((v,j)=>v===path[j])});check(Boolean(hits.length)===Boolean((mask>>BigInt(i))&1n),"trie mask witness");if(hits.length){check(hits.every(p=>same(encrypt(p,path),w)),"word replay");matched.push({index,candidates:hits.map(p=>p.map(v=>gp.translit[v]).join(""))});if(truth&&hits.some(p=>same(p,truth[index])))trueCovered++}}
 total+=best;stats.push({y,words:g.length,best,nodes,entries,path,matched})}return {total,stats,trueCovered}}
 const M=matrix(words,3301);const original=[["raw",c],["corrected",h]].map(([label,seq])=>({label,...evaluate(words,seq,M,[29,110,3301]),allPrefix:trieSolve(words,seq)}));
 const controls=[];for(let d=0;d<donors.length;d++){const ds=donors[d];let start=Math.floor(ds.length*.8);while(start+255<=ds.length&&ds.slice(start,start+255).some(w=>!vocab.has(id(w))))start++;check(start+255<=ds.length,"control window");const p=ds.slice(start,start+255),oov=p.filter(w=>!vocab.has(id(w))).length;
 for(const limit of [29,110,3301]){const K=Array.from({length:29},(_,i)=>(i*73+17+d*113)%limit),ws=p.map((w,i)=>encrypt(w,shift,K[c[i]])),m=matrix(ws,Math.max(110,limit)),result=evaluate(ws,c,m,[limit]).domains[0];check(result.legal&&result.best===255-oov,"plant coverage");let unique=0,retained=0;for(const x of result.domains){if(x.bestSeeds.includes(K[x.y])){retained++;if(x.bestSeeds.length===1)unique++}}controls.push({d,start,limit,oov,coverage:result.best,unique,retained,secret:K})}
 const K=Array.from({length:29},(_,y)=>Array.from({length:24},(_,i)=>(y*17+i*i*11+i*7+d*19)%29));const ws=p.map((w,i)=>encrypt(w,K[c[i]])),result=trieSolve(ws,c,p);check(result.total===255,"arbitrary hidden-key plant");controls.push({d,start,limit:"arbitraryPrefix",oov,coverage:result.total,trueWordsInOneMaxWitness:result.trueCovered});}
 return {vocab:vocab.size,p56Replay:85,original,controls}
}
const files=[
  "resources/liber-primus/lp2-corpus.json",
  "resources/liber-primus/lp2-transcription.txt",
  "resources/liber-primus/lp2-grid-256.json",
  "resources/external/relikd-solved-gp29-native-v1.json",
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/shakespeare_first300k.txt",
  "resources/control/emerson_essays_2944.txt",
  "resources/control/english_wordfreq_textblob.txt"
];
console.log(JSON.stringify(experiment(files.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'))),null,2));
