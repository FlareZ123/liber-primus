"use strict";
// Exact latent word-constant Caesar with ordinary, literal plaintext-F hold and their union.
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
 for(let i=0;i<29;i++)add([i]);
 assert(vocab.size===35938,"register "+vocab.size);
 const tape=gp.pages.filter(p=>p.page<=55).flatMap(p=>p.indices),words=[];let w=[],nRune=0;
 for(const c of raw[1]){if(rune.has(c)){if(nRune===tape.length)break;w.push(rune.get(c));nRune++}else if("-.$&§".includes(c)&&w.length){words.push(w);w=[]}}if(w.length)words.push(w);
 assert(words.flat().join(",")===tape.join(",")&&words.length===2896,"source mismatch");
 function makeTrie(v){const next=[new Int32Array(29)],end=[false];for(const s of v){let node=0;for(const c of s){let a=c.charCodeAt(0)-65;if(!next[node][a]){next[node][a]=next.length;next.push(new Int32Array(29));end.push(false)}node=next[node][a]}end[node]=true}return{next,end}}
 function scan(C,trie,cap,mode){const ends=new Uint32Array(C.length+1),starts=new Uint32Array(C.length);
  const {next,end}=trie;
  for(let i=0;i<C.length;i++)for(let k=0;k<29;k++){
   function go(node,j){if(j>i&&end[node]){const b=1<<(j-i-1);starts[i]|=b;ends[j]|=b}if(j===C.length||j-i===cap)return;const c=C[j],p=mod(c-k);
    if(mode!=="hold"||p!==0){const z=next[node][p];if(z)go(z,j+1)}
    if(mode==="hold"&&c===0&&next[node][0])go(next[node][0],j+1);
   }go(0,i);
  }return{starts,ends};
 }
 const trie=makeTrie(vocab);
 function union(a,b){return{starts:Uint32Array.from(a.starts,(x,i)=>x|b.starts[i]),ends:Uint32Array.from(a.ends,(x,i)=>x|b.ends[i])}}
 function longBound(E,lens){const hist=Array(25).fill(0),counts=Array(25).fill(0),n=E.starts.length,dp=new Int32Array(n+1);for(const l of lens)hist[l]++;
  for(let i=n-1;i>=0;i--){dp[i]=dp[i+1];for(let l=6;l<=24&&i+l<=n;l++)if(hist[l]&&(E.starts[i]&(1<<(l-1)))){counts[l]++;dp[i]=Math.max(dp[i],1+dp[i+l])}}
  const long=lens.filter(l=>l>=6).length,upper=Math.min(dp[0],counts.reduce((s,x,l)=>s+Math.min(x,hist[l]),0));return{long,counts,disjoint:dp[0],upper,minOov:long-upper};
 }
 // Exact minimum number of OOV words in a complete partition with K words.
 // All OOV intervals are granted; the 0-cost lexical transitions are exactly the scanned ones.
 // A monotone queue computes min over prior positions within [i-cap,i-1].
 function exact(E,K,cap,findFirst=false){const N=E.starts.length,INF=30000,mask=(1<<cap)-1;
  let prev=new Int16Array(N+1),cur=new Int16Array(N+1);prev.fill(INF);prev[0]=0;const dq=new Int32Array(N+1);let first=null,atK=null,near=[];
  const maxK=findFirst?Math.min(N,Math.max(K+1200,Math.ceil(N/2))):K;
  for(let k=1;k<=maxK;k++){
   cur.fill(INF);let head=0,tail=0;const lo=k,hi=Math.min(N,k*cap);
   for(let i=lo;i<=hi;i++){
    const j=i-1;while(tail>head&&prev[dq[tail-1]]>=prev[j])tail--;dq[tail++]=j;
    while(tail>head&&dq[head]<i-cap)head++;
    let v=tail>head?Math.min(INF,prev[dq[head]]+1):INF,b=E.ends[i]&mask;
    while(b){const low=b&-b,l=32-Math.clz32(low);v=Math.min(v,prev[i-l]);b^=low;if(v===0)break}
    cur[i]=v;
   }
   [prev,cur]=[cur,prev];
   if(k===K)atK=prev[N];
   if(findFirst&&first===null&&prev[N]<=Math.floor(k*.05))first={groups:k,minOov:prev[N],budget:Math.floor(k*.05)};
   if(findFirst&&k>=K&&k%100===0&&prev[N]<INF)near.push([k,prev[N]]);
   if(k>=K&&(!findFirst||first))break;
  }
  return{runes:N,groups:K,cap,minOov:atK,budget:Math.floor(K*.05),firstFeasible:findFirst?first:null,near};
 }
 let seed=0x74b239e1;function rand(n){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)%n}
 function encode(w,k,hold){return w.map(p=>hold&&p===0?0:mod(p+k))}
 // Independent brute enumerator for each interval and every word/shift in small registers.
 const toyWords=new Set([[0],[1],[2],[0,1],[1,0],[2,0,2],[1,2,1],[0,0],[0,3,0,4]].map(key)),tt=makeTrie(toyWords);
 function bruteScan(C,hold){const m=new Uint32Array(C.length);for(let i=0;i<C.length;i++)for(const s of toyWords){const p=Array.from(s,c=>c.charCodeAt(0)-65);if(i+p.length>C.length)continue;for(let k=0;k<29;k++)if(encode(p,k,hold).every((x,j)=>x===C[i+j]))m[i]|=1<<(p.length-1)}return m}
 function bruteMin(E,K,cap){const N=E.starts.length,rec=(i,k)=>{if(k===0)return i===N?0:30000;let best=30000;for(let l=1;l<=cap&&i+l<=N;l++)best=Math.min(best,rec(i+l,k-1)+((E.starts[i]>>(l-1))&1?0:1));return best};return Math.min(30000,rec(0,K))}
 let toyCases=0,dpCases=0;
 for(let t=0;t<80;t++){const C=Array.from({length:5+rand(5)},()=>rand(7));if(t%2===0)C[rand(C.length)]=0;const a=scan(C,tt,4,"ordinary"),b=scan(C,tt,4,"hold");
  assert(a.starts.every((x,i)=>x===bruteScan(C,false)[i]),"ordinary brute");assert(b.starts.every((x,i)=>x===bruteScan(C,true)[i]),"hold brute");toyCases+=2;const e=union(a,b);
  for(let k=1;k<=C.length;k++){const got=exact(e,k,4).minOov,expected=bruteMin(e,k,4);assert(got===expected,`dp ${got} ${expected}`);dpCases++}
 }
 const controls=[];
 for(let d=0;d<donors.length;d++){
  const ws=[];let n=0;for(const p of donors[d].slice(Math.floor(donors[d].length*.92))){if(n+p.length>260)break;ws.push(p);n+=p.length}
  for(const mode of ["ordinary","hold","mixed"]){const C=[],truth=[];let fholds=0,offset=0;
   for(const p of ws){const h=mode==="hold"||(mode==="mixed"&&rand(2)===1),k=1+rand(28);if(h)fholds+=p.filter(x=>x===0).length;const c=encode(p,k,h);C.push(...c);truth.push({offset,len:p.length,lex:vocab.has(key(p))});offset+=p.length}
   const a=scan(C,trie,24,"ordinary"),b=scan(C,trie,24,"hold"),e=mode==="ordinary"?a:mode==="hold"?b:union(a,b);
   const actualOov=truth.filter(x=>!x.lex).length,missing=truth.filter(x=>x.lex&&!(e.starts[x.offset]&(1<<(x.len-1)))).length,min=exact(e,ws.length,14).minOov;
   assert(!missing&&min<=actualOov,"control truth excluded");controls.push({donor:d,mode,runes:n,groups:ws.length,heldF:fholds,truthOov:actualOov,minOov:min,missing});
  }
 }
 const started=Date.now(),a=scan(tape,trie,24,"ordinary"),b=scan(tape,trie,24,"hold"),u=union(a,b),lens=words.map(w=>w.length);
 const counts=e=>Array.from({length:25},(_,l)=>l?e.starts.reduce((s,v)=>s+((v>>(l-1))&1),0):0);
 const original={};for(const [name,e] of [["ordinary",a],["hold",b],["mixed",u]]){const long=longBound(e,lens);original[name]={counts:counts(e),long,exact:[14,24].map(cap=>exact(e,lens.length,cap,true))}}
 assert(original.ordinary.long.disjoint===7,"prior ordinary baseline");
 const offsets=[0,3,8,15,23,27,33,40,54,56].map(n=>gp.pages.slice(0,n).reduce((a,p)=>a+p.indices.length,0)),wo=[0];for(const p of words)wo.push(wo.at(-1)+p.length);
 const chapter=[];for(let j=0;j<9;j++){const start=offsets[j],stop=offsets[j+1],K=wo.indexOf(stop)-wo.indexOf(start),ls=lens.slice(wo.indexOf(start),wo.indexOf(stop));assert(wo.indexOf(start)>=0&&wo.indexOf(stop)>=0,"chapter seam");
  const C=tape.slice(start,stop),e=union(scan(C,trie,24,"ordinary"),scan(C,trie,24,"hold"));chapter.push({page:[0,3,8,15,23,27,33,40,54][j],long:longBound(e,ls),exact:[14,24].map(cap=>exact(e,K,cap))});
 }
 return{vocab:vocab.size,trieNodes:trie.next.length,toyCases,dpCases,controls,original,chapter,elapsedMs:Date.now()-started};
}
if(require.main===module)console.log(JSON.stringify(experiment(paths.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8"))),null,2));
module.exports={experiment};
