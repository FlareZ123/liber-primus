"use strict";
// Exact shared consuming-tape inverse with independent historical F holds.
function experiment(inputs){
 const [gp,raw,lex,native,gib,sh]=[JSON.parse(inputs[0]),inputs[1],inputs[2],JSON.parse(inputs[3]),inputs[4],inputs[5]];
 const assert=(x,m)=>{if(!x)throw Error(m)},mod=x=>(x%29+29)%29;
 const map=new Map(gp.runes.map((x,i)=>[x,i])),alpha=new Map(gp.translit.map((x,i)=>[x,i])),dict=Array.from({length:32},()=>new Map());
 const add=w=>{if(w.length&&w.length<32)dict[w.length].set(String(w),w)};
 function variants(word){const s=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");function walk(i,w){if(i===s.length){add(w);return}for(const n of [1,2,3]){const a=s.slice(i,i+n);if(a.length!==n)continue;const v=n===3?(a==="ING"?alpha.get("NG"):undefined):alpha.get(a);if(v!==undefined)walk(i+n,[...w,v])}}walk(0,[])}
 for(const l of lex.split(/\r?\n/)){const m=/^([a-z]+)\s+(\d+)$/.exec(l);if(m&&m[1].length>=2)variants(m[1])}
 for(const s of ["A","I","O"])variants(s);
 for(const sec of native.sections)for(const w of sec.source_text.match(/[\u16a0-\u16ff]+/g)||[])add(Array.from(w,x=>map.get(x)));
 const tokens=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function donor(s){const out=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){const p=[];w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");while(w.length){const t=tokens.find(t=>w.startsWith(t.s));if(!t)throw Error(w);p.push(t.i);w=w.slice(t.s.length)}out.push(p)}return out}
 const g=donor(gib.slice(gib.toLowerCase().indexOf("almustafa"))),s=donor(sh);for(const p of [...g,...s])add(p);
 const vocabulary=dict.reduce((n,d)=>n+d.size,0);assert(vocabulary===40540,"lexicon");
 function parse(src){const words=[];let w=[];for(const c of src){if(map.has(c))w.push(map.get(c));else if(c!=="/"&&!/\s/u.test(c)&&w.length){words.push(w);w=[]}}if(w.length)words.push(w);return words}
 const parts=raw.split("%"),before=parse(parts[48]+parts[49]),after=parse(parts[50]+parts[51]);
 assert(String(before.flat())===String(gp.pages[48].indices.concat(gp.pages[49].indices)),"before source");assert(String(after.flat())===String(gp.pages[51].indices.concat(gp.pages[52].indices)),"after source");
 function slice(words,start,end){let p=0;return words.filter(w=>{const a=p;p+=w.length;return a>=start&&p<=end})}
 const a=slice(before,199,337),b=slice(after,0,170);
 assert(a.length===33&&a.flat().length===138&&b.length===40&&b.flat().length===170,"sentence geometry");
 const tries=[false,true].map(rev=>dict.map(d=>{const nodes=[new Int32Array(29).fill(-1)];for(const orig of d.values()){let n=0;for(const v of rev?orig.slice().reverse():orig){let k=nodes[n][v];if(k<0){k=nodes.length;nodes[n][v]=k;nodes.push(new Int32Array(29).fill(-1))}n=k}}return nodes}));
 function stream(words,rev){const ws=rev?words.slice().reverse().map(w=>w.slice().reverse()):words;const c=ws.flat(),ts=[],end=[];for(const w of ws)for(let i=0;i<w.length;i++){ts.push(tries[+rev][w.length]);end.push(i===w.length-1)}return {c,ts,end}}
 function joint(A,B,rev){const x=stream(A,rev),y=stream(B,rev),na=x.c.length,nb=y.c.length,seen=new Set(),trace=[],max=[0,0],stats={states:0,holdEdges:0,consumeEdges:0,peakSum:0};let witness=null;
 function step(t,i,n,p){const k=t.ts[i][n][p];return k<0?-1:t.end[i]?0:k}
 const tails=[new Map(),new Map()];
 function tail(t,i,n,id){if(i===t.c.length)return [];const code=i+":"+n;if(tails[id].has(code))return tails[id].get(code);for(let p=0;p<29;p++){if(p===0&&t.c[i]!==0)continue;const k=step(t,i,n,p);if(k<0)continue;const z=tail(t,i+1,k,id);if(z!==null){const out=[p,...z];tails[id].set(code,out);return out}}tails[id].set(code,null);return null}
 function dfs(i,j,u,v){const code=[i,j,u,v].join(",");if(seen.has(code))return false;seen.add(code);stats.states++;max[0]=Math.max(max[0],i);max[1]=Math.max(max[1],j);stats.peakSum=Math.max(stats.peakSum,i+j);
  if(i===na||j===nb){const pa=tail(x,i,u,0),pb=tail(y,j,v,1);if(pa!==null&&pb!==null){witness={steps:trace.slice(),tailA:pa,tailB:pb,overlapEnd:[i,j]};return true}return false}
  if(x.c[i]===0){const k=step(x,i,u,0);if(k>=0){stats.holdEdges++;trace.push([0,-1,-1]);if(dfs(i+1,j,k,v))return true;trace.pop()}}
  if(y.c[j]===0){const k=step(y,j,v,0);if(k>=0){stats.holdEdges++;trace.push([-1,0,-1]);if(dfs(i,j+1,u,k))return true;trace.pop()}}
  for(let p=1;p<29;p++){const q=mod(p+y.c[j]-x.c[i]);if(!q)continue;const k=step(x,i,u,p),l=step(y,j,v,q);if(k<0||l<0)continue;stats.consumeEdges++;trace.push([p,q,mod(x.c[i]-p)]);if(dfs(i+1,j+1,k,l))return true;trace.pop()}
  return false}
 const possible=dfs(0,0,0,0);
 if(possible){const pa=witness.steps.filter(z=>z[0]>=0).map(z=>z[0]).concat(witness.tailA),pb=witness.steps.filter(z=>z[1]>=0).map(z=>z[1]).concat(witness.tailB),key=witness.steps.filter(z=>z[2]>=0).map(z=>z[2]);
 for(const [t,p] of [[x,pa],[y,pb]]){let k=0;for(let i=0;i<p.length;i++){if(p[i]===0)assert(t.c[i]===0,"hold replay");else {if(k<key.length)assert(mod(p[i]+key[k])===t.c[i],"shared replay");k++}}assert(k>=key.length,"shared length")}
 witness={pa,pb,key,overlapEnd:witness.overlapEnd}}
 return {possible,...stats,maxPhysicalReach:max,witness}}
 const original=[false,true].map(rev=>joint(a,b,rev));
 let seed=0x33014951;function rand(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed}
 function draw(ds,shape){const pool=Array.from({length:32},()=>[]);for(const w of ds.slice(Math.floor(ds.length*.7)))if(w.length<32)pool[w.length].push(w);return shape.map(c=>pool[c.length][rand()%pool[c.length].length])}
 function enc(ws,k,rev){const oriented=rev?ws.slice().reverse().map(w=>w.slice().reverse()):ws;let phase=0;const c=oriented.map(w=>w.map(p=>p===0?0:mod(p+k[phase++])));return rev?c.reverse().map(w=>w.reverse()):c}
 const plants=[];for(const rev of [false,true])for(let trial=0;trial<2;trial++){const pa=draw(g,a),pb=draw(s,b),key=Array.from({length:170},()=>rand()%29);const ca=enc(pa,key,rev),cb=enc(pb,key,rev),res=joint(ca,cb,rev);assert(res.possible,"plant missed");const expectedA=stream(pa,rev).c,expectedB=stream(pb,rev).c;plants.push({rev,trial,holds:[pa.flat().filter(x=>!x).length,pb.flat().filter(x=>!x).length],cipherF:[ca.flat().filter(x=>!x).length,cb.flat().filter(x=>!x).length],states:res.states,shared:res.witness.key.length,keyCorrect:res.witness.key.filter((x,i)=>x===key[i]).length,plainCorrect:[res.witness.pa.filter((x,i)=>x===expectedA[i]).length,res.witness.pb.filter((x,i)=>x===expectedB[i]).length]})}
 return {vocabulary,shape:[a.map(w=>w.length),b.map(w=>w.length)],originalF:[a.flat().filter(x=>!x).length,b.flat().filter(x=>!x).length],original,plants}
}
const fs=require("node:fs"),path=require("node:path");
const paths=["resources/liber-primus/lp2-corpus.json","resources/transcriptions/lp2-image-corrected.txt","resources/control/english_wordfreq_textblob.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt"];
console.log(JSON.stringify(experiment(paths.map(p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8"))),null,2));
