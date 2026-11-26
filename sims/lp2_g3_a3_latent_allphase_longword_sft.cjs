"use strict";
const fs=require("node:fs"),path=require("node:path");
const paths=["resources/liber-primus/lp2-corpus.json","resources/transcriptions/lp2-image-corrected.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/control/english_wordfreq_textblob.txt","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];
function experiment(raw,book){
 const gp=JSON.parse(raw[0]),gold=JSON.parse(raw[2]),rune=new Map(gp.runes.map((x,i)=>[x,i])),mod=x=>(x%29+29)%29,key=w=>String.fromCharCode(...w.map(x=>65+x)),shape=w=>key(w.map(x=>mod(x-w[0]))),sum=w=>w.reduce((s,x)=>s+gp.prime[x],0)%29;
 const tokens=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
 function enc(w,alt){w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const p=[];for(let j=0;j<w.length;){const v=alt&&w.startsWith("ING",j)?{t:"ING",i:21}:alt&&w.startsWith("IO",j)?{t:"IO",i:27}:tokens.find(x=>w.startsWith(x.t,j));if(!v)return null;p.push(v.i);j+=v.t.length}return p}
 function native(t){const a=/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t),b=/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t);return (t.slice(a?a.index+a[0].length:0,b?b.index:t.length).match(/[A-Za-z]+/g)||[]).map(w=>enc(w,true)).filter(w=>w&&w.length<=14)}
 const donors=raw.slice(4).map(native),vocab=new Map();
 function add(w,f){if(w&&w.length&&w.length<=24){let k=key(w);vocab.set(k,Math.max(f,vocab.get(k)||0))}}
 for(const line of raw[3].split(/\r?\n/)){const m=/^([A-Za-z]+)\s+(\d+)$/.exec(line);if(m)for(const alt of [true,false])add(enc(m[1],alt),+m[2])}
 for(const ws of donors)for(const w of ws.slice(0,Math.floor(ws.length*.8)))add(w,1);
 for(const s of gold.sections)for(const w of s.source_text.match(/[\u16a0-\u16ff]+/g)||[])add(Array.from(w,c=>rune.get(c)),1);
 for(let i=0;i<29;i++)add([i],1);


 const tape=gp.pages.filter(p=>p.page<=55).flatMap(p=>p.indices),words=[];let w=[],n=0;
 for(const c of raw[1]){if(rune.has(c)){if(n===tape.length)break;w.push(rune.get(c));n++}else if("-.$&§".includes(c)&&w.length){words.push(w);w=[]}}if(w.length)words.push(w);
 if(words.length!==2896||words.flat().join(",")!==tape.join(","))throw Error("source mismatch");
 const K=book.key,L=K.length;
 // Only length >=8 lexical words enter the trie: exact finite necessary condition for long slots.
 const maxNodes=1+[...vocab.keys()].filter(k=>k.length>=8).reduce((s,k)=>s+k.length,0);
 const trie=new Int32Array(maxNodes*29),term=new Uint8Array(maxNodes);let nodes=1;
 for(const k of vocab.keys())if(k.length>=8&&k.length<=14){let x=0;for(let i=0;i<k.length;i++){const z=x*29+k.charCodeAt(i)-65;if(!trie[z])trie[z]=nodes++;x=trie[z];}term[x]=1;}
 const plus=new Uint8Array(29*29),minus=new Uint8Array(29*29);for(let a=0;a<29;a++)for(let b=0;b<29;b++){plus[a*29+b]=mod(a-b);minus[a*29+b]=mod(a+b);}
 function scan(C,sgn,step){
  const tab=sgn===1?plus:minus,N=C.length,hit=Array.from({length:N},()=>new Uint8Array(15)),starts=Array.from({length:L},(_,i)=>i);
  // Ordinary branch and unlimited same-plaintext collision-only rejected proposals.
  // Precompute next changed value along the rejected-proposal stride; cyclic all-constant is impossible for this fixed source.
  const change=new Int32Array(L),next=new Int32Array(L);for(let j=0;j<L;j++){next[j]=(j+1)%L;if(step){let a=(j+step)%L,guard=0;while(K[a]===K[j]&&guard++<L)a=(a+step)%L;change[j]=a;}}
  let states=0;
  function visit(i,j,node,dep,start,firstPrev){
   states++;if(term[node]&&dep>=8)hit[start][dep]=1;
   if(i>=N||dep===14)return;
   const c=C[i],prev=i===start?firstPrev:C[i-1],v=tab[c*29+K[j]],nn=trie[node*29+v];
   if(nn)visit(i+1,next[j],nn,dep+1,start,firstPrev);
   if(!step||prev<0)return;
   const p=tab[prev*29+K[j]],q=trie[node*29+p];if(!q)return;
   // If c == prev, every key phase reached through the equal-value run may accept.
   if(c===prev){
    let a=(j+step)%L,guard=0;while(K[a]===K[j]&&guard++<L){visit(i+1,next[a],q,dep+1,start,firstPrev);a=(a+step)%L;}
   }else{const a=change[j];if(tab[c*29+K[a]]===p)visit(i+1,next[a],q,dep+1,start,firstPrev);}
  }
  for(let i=0;i+8<=N;i++)for(const j of starts)visit(i,j,0,0,i,i>0?C[i-1]:-1);
  const intervals=[];for(let i=0;i<N;i++)for(let l=8;l<=14;l++)if(hit[i][l])intervals.push([i,l]);
  return {sgn,step,states,intervals};
 }
 const controls=[];
 // Construct two real lexical words with internal collision rejection, one per skip stride, plus ordinary.
 let seed=8731441;const rand=n=>(seed=(Math.imul(seed,1664525)+1013904223)>>>0)%n;
 const longVocab=[...vocab.keys()].filter(k=>k.length>=8&&k.length<=14);
 function plant(P,start,sgn,step){let j=start,C=[],skips=0;for(const p of P){let c=mod(p+sgn*K[j]);while(step&&C.length&&c===C.at(-1)){j=(j+step)%L;c=mod(p+sgn*K[j]);skips++;}C.push(c);j=(j+1)%L;}return {C,skips}}
 for(const step of [0,1,2])for(const sgn of [-1,1]){let P,origin,ex;for(let rep=0;rep<10000;rep++){P=Array.from(longVocab[rand(longVocab.length)],x=>x.charCodeAt(0)-65);origin=rand(L);ex=plant(P,origin,sgn,step);if(!step||ex.skips>0)break}if(step&&ex.skips===0)throw Error("no skip control");const ans=scan(ex.C,sgn,step);if(!ans.intervals.some(([i,l])=>i===0&&l===P.length))throw Error("control missing");controls.push({step,sgn,origin,len:P.length,skips:ex.skips,retained:true});}
 const originals=[];for(const step of [0,1,2])for(const sgn of [-1,1])originals.push(scan(tape,sgn,step));
 function bound(rows){const intervals=[...new Set(rows.flatMap(r=>r.intervals.map(x=>x.join(","))))].map(s=>s.split(",").map(Number)).sort((a,b)=>a[0]-b[0]||a[1]-b[1]),e=Array.from({length:tape.length},()=>[]);for(const [i,l] of intervals)e[i].push(l);
 const dp=new Int32Array(tape.length+1);for(let i=tape.length-1;i>=0;i--){dp[i]=dp[i+1];for(const l of e[i])dp[i]=Math.max(dp[i],1+dp[i+l]);}
 const count=words.filter(w=>w.length>=8).length;return {longCount:count,intervalCount:intervals.length,disjointUpper:dp[0],minOov:Math.max(0,count-dp[0]),allowedOov:Math.floor(.05*words.length),intervals};
 }
 return {vocab:vocab.size,nKey:L,nodes,controls,originals,ordinary:bound(originals.filter(r=>r.step===0)),allSkip:bound(originals)};
}

const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
console.log(JSON.stringify(experiment(paths.map(read),JSON.parse(read("resources/derived/dukotah-r37-lp1-map-runes.json"))),null,2));
