'use strict';
function main(raw,mode="orig"){
const g=JSON.parse(raw[0]),toks=[...g.translit.map((s,i)=>[s,i]),["ING",21],["IO",27]],longest=[...toks].sort((a,b)=>b[0].length-a[0].length),norm=w=>w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
const target=[18,4,1,15],mask=target.reduce((s,x)=>s|(1<<x),0),words=new Map();function elig(p){let q=p.filter(Boolean).slice(0,-1).reduce((s,x)=>s|(1<<x),0);return(q&mask)===mask}
const lex=new Set([...raw[1].split("\n").map(s=>s.match(/^([a-z]+)\s+\d+$/)?.[1]).filter(Boolean),...raw[2].match(/[a-z]+/g),...raw[3].match(/[A-Z]{2,}/g)]);
for(let w of lex){w=norm(w);if(w.length<5||!["E","R","U","S"].every(s=>w.includes(s)))continue;function rec(j,a){if(j===w.length){if(elig(a))words.set(a.join(","),{p:a,w});return}for(const [s,i] of toks)if(w.startsWith(s,j))rec(j+s.length,[...a,i])}rec(0,[])}
const byLen=new Map(),templates=new Map();for(const [id,{p,w}] of words){let q=-1,holds=[],first=new Map(),repeat=[];for(let i=0;i<p.length;i++){if(!p[i]){holds.push(i);continue}if(q>=0){if(first.has(q)){const [j,v]=first.get(q);repeat.push(i,j,(p[i]-v+29)%29)}else first.set(q,[i,p[i]])}q=p[i]}
const edge=[],qs=[...target,...[...first.keys()].filter(q=>!target.includes(q))];for(const q of qs)edge.push(...first.get(q));const t={len:p.length,w,holds:Int8Array.from(holds),repeat:Int8Array.from(repeat),edge:Int8Array.from(edge),qs};if(!byLen.has(p.length))byLen.set(p.length,[]);byLen.get(p.length).push(t);templates.set(id,t)}
function proj(t,c,d,s){for(let j=0;j<t.holds.length;j++)if(c[s+t.holds[j]])return-1;for(let j=0;j<t.repeat.length;j+=3){if((d[s+t.repeat[j]]-d[s+t.repeat[j+1]]+29)%29!==t.repeat[j+2])return-1}let seen=0,id=0;for(let j=0;j<t.edge.length;j+=2){const v=(t.edge[j+1]-d[s+t.edge[j]]+29)%29,b=1<<v;if(seen&b)return-1;seen|=b;if(j<8)id=id*29+v}return id}
const A=29**4,original=g.pages.filter(x=>x.page<=55&&x.indices.length).map(x=>x.indices.slice(1));
function scan(frames,wanted=null,rawCounts=false){const last=new Int32Array(A).fill(-1),cnt=new Uint16Array(A);let offset=0,hits=0,tests=0;
for(const c of frames){const d=c.map((v,i)=>i?(v-c[i-1]+29)%29:0);for(let end=5;end<=c.length;end++)for(const [len,ts] of byLen){const start=end-len;if(start<0)continue;tests+=ts.length;for(let j=0;j<ts.length;j++){const id=proj(ts[j],c,d,start);if(id<0)continue;hits++;if(offset+start>=last[id]){last[id]=offset+end;cnt[id]++}}}offset+=c.length}
let max=0,best=[],distribution={};for(let i=0;i<A;i++){const n=cnt[i];if(n>max){max=n;best=[i]}else if(n===max)best.push(i);distribution[n]=(distribution[n]||0)+1}return{max,best:best.slice(0,30),ties:best.length,distribution,hits,tests,wanted:wanted===null?null:cnt[wanted],counts:rawCounts?cnt:undefined}}
if(mode==="refine"){
 const threshold=8,first=scan(original,null,true),groups=new Map();
 for(let id=0;id<A;id++)if(first.counts[id]>=threshold)groups.set(id,[]);
 let offset=0,retained=0;
 for(const c of original){const d=c.map((v,i)=>i?(v-c[i-1]+29)%29:0);for(let end=5;end<=c.length;end++)for(const [len,ts] of byLen){const start=end-len;if(start<0)continue;for(const t of ts){const id=proj(t,c,d,start),arr=groups.get(id);if(!arr)continue;const k=t.qs.map((q,j)=>q*29+(t.edge[2*j+1]-d[start+t.edge[2*j]]+29)%29);arr.push({start:offset+start,end:offset+end,k,w:t.w});retained++}}offset+=c.length}
 let best=threshold-1,witness=null,nodes=0,aborted=false,testedGroups=0;
 const maxNodes=10000000;
 function compatible(a,k,inv){for(const z of a.k){const q=Math.floor(z/29),v=z%29;if((k[q]>=0&&k[q]!==v)||(inv[v]>=0&&inv[v]!==q))return false}return true}
 function upper(list,lo,end,k,inv){let n=0;for(let j=lo;j<list.length;j++){const a=list[j];if(a.start>=end&&compatible(a,k,inv)){n++;end=a.end}}return n}
 function rec(list,lo,end,k,inv,path){if(++nodes>maxNodes){aborted=true;return}if(path.length>best){best=path.length;witness={path:path.slice(),partialKey:[...k]}}if(path.length+upper(list,lo,end,k,inv)<=best)return;
 for(let i=lo;i<list.length;i++){const a=list[i];if(a.start<end||!compatible(a,k,inv))continue;const kk=k.slice(),ii=inv.slice();for(const z of a.k){const q=Math.floor(z/29),v=z%29;kk[q]=v;ii[v]=q}rec(list,i+1,a.end,kk,ii,[...path,a]);if(aborted)return;if(path.length+upper(list,i+1,end,k,inv)<=best)return}}
 const ordered=[...groups].sort((a,b)=>first.counts[b[0]]-first.counts[a[0]]);for(const [id,list] of ordered){if(first.counts[id]<=best)break;testedGroups++;rec(list,0,-1,new Int8Array(29).fill(-1),new Int8Array(29).fill(-1),[]);if(aborted)break}
 return{threshold,projectionMax:first.max,eligibleGroups:groups.size,retained,testedGroups,nodes,aborted,upperBound:aborted?first.max:best,witness};
}
if(mode==="orig")return{target,lex:lex.size,templates:templates.size,original:scan(original)};
let seed=170423;const rnd=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n};
function native(t){const a=/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t),b=/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t);let p=[];for(const w0 of t.slice(a?a.index+a[0].length:0,b?b.index:t.length).toUpperCase().match(/[A-Z]+/g)||[]){let w=norm(w0),x=[];for(let j=0;j<w.length;){const v=longest.find(([s])=>w.startsWith(s,j));if(!v)throw Error(w);x.push(v[1]);j+=v[0].length}p.push({w,x})}return p}
const controls=[];for(let j=4;j<=6;j++){let w=native(raw[j]),n=w.reduce((s,o)=>s+o.x.length,0),start=n-12901,off=0,full=[];for(const o of w){let e=off+o.x.length;if(off>=start)full.push({...o,start:off-start,end:e-start});off=e}const p=w.flatMap(o=>o.x).slice(start);const K=Array.from({length:29},(_,i)=>i);for(let i=28;i>0;i--){let z=rnd(i+1);[K[i],K[z]]=[K[z],K[i]]}const keyid=target.reduce((s,q)=>s*29+K[q],0);let pos=0,frames=[],bounds=[];for(const f of original){let q=0,c=rnd(29),pp=p.slice(pos,pos+f.length);bounds.push([pos,pos+f.length]);frames.push(pp.map(x=>{let cc=x===0?0:(c+x-K[q]+29)%29;if(x)q=x;c=cc;return c}));pos+=f.length}
let eligible=0,covered=0,verified=0,firstCount=0;for(const o of full){if(!elig(o.x))continue;const b=bounds.findIndex(([a,b])=>o.start>=a&&o.end<=b);if(b<0)continue;eligible++;const t=templates.get(o.x.join(","));if(!t)continue;covered++;const c=frames[b],d=c.map((v,i)=>i?(v-c[i-1]+29)%29:0);if(proj(t,c,d,o.start-bounds[b][0])!==keyid)throw Error("true projection");verified++;if(b<5)firstCount++}
const s=scan(frames.slice(0,5),keyid);if(s.wanted<firstCount)throw Error("greedy bound");controls.push({donor:j-4,eligible,covered,verified,firstFiveCovered:firstCount,firstFiveScan:s})}
return{target,templates:templates.size,controls}
}
if(require.main===module){const fs=require('node:fs');const paths=["resources/liber-primus/lp2-corpus.json","resources/control/english_wordfreq_textblob.txt","resources/control/dwyl-english-alpha-gp13-14-only.txt","resources/liber-primus/lp1-plaintext-reference.txt","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];console.log(JSON.stringify(main(paths.map(p=>fs.readFileSync(p,'utf8')),process.argv[2]||'orig'),null,2));}
module.exports={main};
