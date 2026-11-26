"use strict";
const fs=require("node:fs"),path=require("node:path");
const paths=["resources/liber-primus/lp2-corpus.json","resources/transcriptions/lp2-image-corrected.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/control/english_wordfreq_textblob.txt","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];
function experiment(raw){
 const gp=JSON.parse(raw[0]),gold=JSON.parse(raw[2]),rune=new Map(gp.runes.map((x,i)=>[x,i])),mod=x=>(x%29+29)%29,key=w=>String.fromCharCode(...w.map(x=>65+x));
 const assert=(x,m)=>{if(!x)throw Error(m)};
 const tokens=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
 function enc(w,alt){w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const p=[];for(let j=0;j<w.length;){const v=alt&&w.startsWith("ING",j)?{t:"ING",i:21}:alt&&w.startsWith("IO",j)?{t:"IO",i:27}:tokens.find(x=>w.startsWith(x.t,j));if(!v)return null;p.push(v.i);j+=v.t.length}return p}
 function native(t){const a=/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t),b=/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t);return (t.slice(a?a.index+a[0].length:0,b?b.index:t.length).match(/[A-Za-z]+/g)||[]).map(w=>enc(w,true)).filter(w=>w&&w.length<=14)}
 const donors=raw.slice(4).map(native),vocab=new Set();
 function add(w){if(w&&w.length&&w.length<=24)vocab.add(key(w))}
 for(const line of raw[3].split(/\r?\n/)){const m=/^([A-Za-z]+)\s+(\d+)$/.exec(line);if(m)for(const alt of [true,false])add(enc(m[1],alt))}
 for(const ws of donors)for(const w of ws.slice(0,Math.floor(ws.length*.8)))add(w);
 for(const s of gold.sections)for(const w of s.source_text.match(/[\u16a0-\u16ff]+/g)||[])add(Array.from(w,c=>rune.get(c)));
 for(let i=0;i<29;i++)add([i]);assert(vocab.size===35938,"register "+vocab.size);
 const tape=gp.pages.filter(p=>p.page<=55).flatMap(p=>p.indices),words=[];let w=[],nRune=0;
 for(const c of raw[1]){if(rune.has(c)){if(nRune===tape.length)break;w.push(rune.get(c));nRune++}else if("-.$&§".includes(c)&&w.length){words.push(w);w=[]}}if(w.length)words.push(w);
 assert(words.flat().join(",")===tape.join(",")&&words.length===2896,"source mismatch");
 const inverse=Array.from({length:29},(_,a)=>a?Array.from({length:28},(_,i)=>i+1).find(b=>a*b%29===1):0);
 // Normalize all positions not in mask by their first value and first nonzero difference.
 // Constant sequences and empty sequences have distinct keys by length.
 function sig(x,off,len,mask=0){let base=-1,mult=0,s="";for(let i=0;i<len;i++)if(!(mask&(1<<i))){const v=x[off+i];if(base<0){base=v;s+="A";continue}const d=mod(v-base);if(!mult&&d)mult=inverse[d];s+=String.fromCharCode(65+mod(d*mult))}return s}
 function makeIndex(v){const ordinary=Array.from({length:25},()=>new Set()),hold=Array.from({length:25},()=>new Map());for(const s of v){const p=Array.from(s,c=>c.charCodeAt(0)-65),l=p.length;ordinary[l].add(sig(p,0,l));let mask=0;for(let j=0;j<l;j++)if(p[j]===0)mask|=1<<j;if(!hold[l].has(mask))hold[l].set(mask,new Set());hold[l].get(mask).add(sig(p,0,l,mask))}return{ordinary,hold}}
 const index=makeIndex(vocab);
 function scan(C,idx,cap){const N=C.length,A=new Uint32Array(N),H=new Uint32Array(N),ends=new Uint32Array(N+1);
 for(let i=0;i<N;i++){let zero=0;for(let l=1;l<=cap&&i+l<=N;l++){if(C[i+l-1]===0)zero|=1<<(l-1);const b=1<<(l-1);if(idx.ordinary[l].has(sig(C,i,l)))A[i]|=b;
 // A held F is only possible at a visible zero. Other positions share one invertible affine map, including encrypted non-F zeros.
 for(let mask=zero;;mask=(mask-1)&zero){const group=idx.hold[l].get(mask);if(group&&group.has(sig(C,i,l,mask))){H[i]|=b;break}if(mask===0)break}
 if((A[i]|H[i])&b)ends[i+l]|=b;
 }}return{A,H,starts:Uint32Array.from(A,(x,i)=>x|H[i]),ends}}
 function encode(w,a,b,hold){return w.map(p=>hold&&p===0?0:mod(a*p+b))}
 let seed=0x48061126;function rand(n){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)%n}
 const toy=new Set([[0],[1],[2],[0,1],[1,0],[2,0,2],[1,2,1],[0,0],[0,3,0,4],[2,4,3,4],[0,3,4,0]].map(key)),ti=makeIndex(toy),toyImages=[new Set(),new Set()];
 for(const s of toy){const p=Array.from(s,c=>c.charCodeAt(0)-65);for(let a=1;a<29;a++)for(let b=0;b<29;b++)for(let h=0;h<2;h++)toyImages[h].add(key(encode(p,a,b,h)))}
 let toyIntervals=0;
 for(let t=0;t<100;t++){const C=Array.from({length:5+rand(5)},()=>rand(8));const e=scan(C,ti,4);for(let i=0;i<C.length;i++)for(let l=1;l<=4&&i+l<=C.length;l++){const s=key(C.slice(i,i+l));assert(Boolean(e.A[i]&(1<<(l-1)))===toyImages[0].has(s),"ordinary brute");assert(Boolean(e.H[i]&(1<<(l-1)))===toyImages[1].has(s),"hold brute");toyIntervals++}}
 function exact(E,K,cap){const N=E.starts.length,INF=30000,mask=(1<<cap)-1;let prev=new Int16Array(N+1),cur=new Int16Array(N+1);prev.fill(INF);prev[0]=0;const dq=new Int32Array(N+1);
 for(let k=1;k<=K;k++){cur.fill(INF);let head=0,tail=0;for(let i=k;i<=Math.min(N,k*cap);i++){let j=i-1;while(tail>head&&prev[dq[tail-1]]>=prev[j])tail--;dq[tail++]=j;while(tail>head&&dq[head]<i-cap)head++;let v=tail>head?Math.min(INF,prev[dq[head]]+1):INF,b=E.ends[i]&mask;while(b){const low=b&-b,l=32-Math.clz32(low);v=Math.min(v,prev[i-l]);b^=low;if(v===0)break}cur[i]=v;}[prev,cur]=[cur,prev]}
 return prev[N]}
 function summary(E,lens,cap){const N=E.starts.length,hist=Array(25).fill(0),counts=Array(25).fill(0),a=Array(25).fill(0),h=Array(25).fill(0);for(const l of lens)hist[l]++;
 for(let i=0;i<N;i++)for(let l=1;l<=cap&&i+l<=N;l++){const bit=1<<(l-1);if(E.starts[i]&bit)counts[l]++;if(E.A[i]&bit)a[l]++;if(E.H[i]&bit)h[l]++;}
 const bounds=[];for(let min=4;min<=14;min++){const dp=new Int32Array(N+1);for(let i=N-1;i>=0;i--){dp[i]=dp[i+1];for(let l=min;l<=cap&&i+l<=N;l++)if(hist[l]&&(E.starts[i]&(1<<(l-1))))dp[i]=Math.max(dp[i],1+dp[i+l])}const need=hist.slice(min).reduce((s,v)=>s+v,0),upper=Math.min(dp[0],hist.slice(min).reduce((s,v,j)=>s+Math.min(v,counts[j+min]),0));bounds.push({min,need,disjoint:dp[0],upper,minimumOov:need-upper})}
 return{runes:N,groups:lens.length,budget:Math.floor(lens.length*.05),hist,counts,ordinaryCounts:a,holdCounts:h,bounds,minOovCountOnly:exact(E,lens.length,cap)}}
 const controls=[];for(let d=0;d<donors.length;d++){const ws=[];let n=0;for(const p of donors[d].slice(Math.floor(donors[d].length*.96))){if(n+p.length>350)break;ws.push(p);n+=p.length}for(const mode of ["ordinary","hold","mixed"]){const C=[],truth=[];let fs=0;for(const p of ws){const a=1+rand(28),b=rand(29),hold=mode==="hold"||(mode==="mixed"&&rand(2)===1);truth.push({offset:C.length,len:p.length,lex:vocab.has(key(p)),hold});if(hold)fs+=p.filter(x=>x===0).length;C.push(...encode(p,a,b,hold))}const E=scan(C,index,24),missing=truth.filter(x=>x.lex&&!((x.hold?E.H[x.offset]:E.A[x.offset])&(1<<(x.len-1)))).length,actual=truth.filter(x=>!x.lex).length,min=exact(E,ws.length,24);assert(missing===0&&min<=actual,"plant failure");controls.push({donor:d,mode,runes:n,groups:ws.length,fs,actualOov:actual,minOov:min,missing})}}
 const started=Date.now(),E=scan(tape,index,24),lens=words.map(w=>w.length),original=summary(E,lens,24);
 const offsets=[0,3,8,15,23,27,33,40,54,56].map(n=>gp.pages.slice(0,n).reduce((a,p)=>a+p.indices.length,0)),wo=[0];for(const p of words)wo.push(wo.at(-1)+p.length);
 const chapters=[];for(let j=0;j<9;j++){const start=offsets[j],stop=offsets[j+1];assert(wo.indexOf(start)>=0&&wo.indexOf(stop)>=0,"chapter seam");chapters.push({page:[0,3,8,15,23,27,33,40,54][j],...summary(scan(tape.slice(start,stop),index,24),lens.slice(wo.indexOf(start),wo.indexOf(stop)),24)})}
 return{vocab:vocab.size,toyIntervals,controls,original,chapters,elapsedMs:Date.now()-started};
}
if(require.main===module)console.log(JSON.stringify(experiment(paths.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8"))),null,2));
module.exports={experiment};
