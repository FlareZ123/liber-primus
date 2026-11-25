"use strict";
const fs=require("node:fs");
function experiment(c,n,raw,dict){
 const O=3302,mod=x=>(x%29+29)%29,pr=[];for(let x=2;pr.length<O+1000;x++){let ok=true;for(const p of pr){if(p*p>x)break;if(x%p===0){ok=false;break}}if(ok)pr.push(x)}
 const shifts=pr.map(x=>mod(x-1)),bits=shifts.map((_,i)=>1n<<BigInt(i)),M=Array(29).fill(0n);for(let j=0;j<shifts.length;j++)M[shifts[j]]|=bits[j];
 const initial=(1n<<BigInt(O))-1n,all=(1n<<BigInt(shifts.length))-1n,assert=(x,m)=>{if(!x)throw Error(m)},equal=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
 const idx=new Map(c.runes.map((x,i)=>[x,i])),id=Array.from({length:29},(_,i)=>i),full=c.pages.slice(0,56).flatMap(p=>p.indices);
 function indices(x){const s=x.toString(2),a=[];for(let i=s.length-1;i>=0;i--)if(s[i]==="1")a.push(s.length-1-i);return a}
 function back(C,b,m,sign){const B=Array(C.length+1);B[C.length]=all;for(let i=C.length-1;i>=0;i--){const a=C[i],s=B[i+1];B[i]=((s>>1n)&~M[mod(sign*(a-m))])|(a===b?s:0n)}return B}
 function enc(P,S,b,sign,j){return P.map(x=>x===b?b:mod(S[x]+sign*shifts[j++]));}
 function wordList(raw){let pos=0;return raw.split(/[^\u16a0-\u16ff]+/u).filter(Boolean).map(w=>{const p=[...w].map(x=>idx.get(x));const a={start:pos,len:p.length,p};pos+=p.length;return a})}
 const words=wordList(raw.split("%").slice(0,55).join("%").replace(/[/\s%]/gu,""));assert(words.length===2896&&equal(words.flatMap(x=>x.p),full),"original word parse");
 const sources=n.sections.map(s=>({name:s.name,words:wordList(s.source_text),P:[...s.source_text].filter(x=>idx.has(x)).map(x=>idx.get(x))}));
 assert(equal(enc(sources.find(x=>x.name==="p56_an_end").P,id,0,1,0),c.pages[56].indices),"p56 authentic replay");
 const tokens=c.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function encode(w){const text=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const p=[];for(let i=0;i<text.length;){if(text.startsWith("ING",i)){p.push(21);i+=3;}else if(text.startsWith("IO",i)){p.push(27);i+=2;}else{const t=tokens.find(x=>text.startsWith(x.s,i));if(!t)return null;p.push(t.i);i+=t.s.length}}return p}
 const forms=new Map;for(const line of dict.split(/\r?\n/)){if(!/^[a-z]+\s+\d+$/i.test(line))continue;const p=encode(line.split(/\s+/)[0]);if(p)forms.set(p.join(","),p)}
 for(const s of sources)for(const w of s.words)forms.set(w.p.join(","),w.p);
 function sig(w,marker){const map=new Int8Array(29).fill(-1);map[marker]=0;let k=1,s="";for(const z of w){if(map[z]<0)map[z]=k++;s+=String.fromCharCode(65+map[z]);}return s}
 const D=new Map;for(const b of [0,2]){const d=new Map;for(const p of forms.values()){if(p.length<7)continue;const k=sig(p,b);if(!d.has(k))d.set(k,[]);d.get(k).push(p)}D.set(b,d)}
 function choose(w,start,N){return w.filter(a=>a.start>=start&&a.start+a.len<=start+N).sort((a,b)=>b.len-a.len||a.start-b.start).slice(0,6).map(a=>({...a,start:a.start-start}))}
 function joint(A,b,m){
  const ls=A.map(z=>D.get(b).get(sig(z,m))||[]),local=ls.filter(x=>x.length).length;
  if(local<6)return {local,joint:false};
  const order=id.slice(0,6).sort((i,j)=>ls[i].length-ls[j].length),inv=new Int8Array(29).fill(-1),fw=new Int8Array(29).fill(-1);inv[m]=b;fw[b]=m;let nodes=0;
  function dfs(k){if(k===6)return Array.from(inv);const j=order[k],z=A[j];for(const p of ls[j]){nodes++;const add=[];let ok=true;for(let i=0;i<p.length;i++){const a=z[i],v=p[i];if(inv[a]===v)continue;if(inv[a]>=0||fw[v]>=0){ok=false;break}inv[a]=v;fw[v]=a;add.push([a,v])}if(ok){const x=dfs(k+1);if(x)return x}for(const [a,v] of add){inv[a]=-1;fw[v]=-1}}return null}
  const key=dfs(0);return {local,joint:!!key,key,nodes};
 }
 function solve(C,b,anchors){
  assert(anchors.length===6&&anchors.every(a=>a.len>=7),"anchor count");
  let total=0,originModels=0,modelCount=0,maxLocal=0,jointPaths=0,best=null,cache=new Map,nodes=0;
  for(const sign of [1,-1])for(let m=0;m<29;m++){
   const B=back(C,b,m,sign),starts=indices(B[0]&initial);if(!starts.length)continue;modelCount++;originModels+=starts.length;
   const Z=new Int8Array(C.length);
   function visit(start,j){
    total++;
    const A=anchors.map(a=>Array.from(Z.subarray(a.start,a.start+a.len)));
    const key=m+"|"+A.map(z=>String.fromCharCode(...z)).join("|");
    let q=cache.get(key);if(!q){q=joint(A,b,m);cache.set(key,q);nodes+=q.nodes||0}
    maxLocal=Math.max(maxLocal,q.local);
    if(q.joint){jointPaths++;if(!best){const k=q.key.slice(),free=id.filter(x=>k[x]<0),p=id.filter(x=>!k.includes(x));free.forEach((x,i)=>k[x]=p[i]);const P=Array.from(Z,z=>k[z]),S=id.map(p=>k.indexOf(p));assert(equal(enc(P,S,b,sign,start),C),"candidate replay");best={start,j,m,sign,partialKey:q.key,P:P.slice(0,100).map(p=>c.translit[p]).join(" "),anchors:A.map(z=>z.map(x=>c.translit[k[x]]).join(""))}}}
   }
   function walk(i,j,start){while(i<C.length){const a=C[i],v=B[i+1],z=mod(a-sign*shifts[j]),hold=a===b&&(v&bits[j]),take=z!==m&&(v&bits[j+1]);if(hold&&take){Z[i]=m;walk(i+1,j,start);Z[i]=z;j++;i++;continue;}if(hold){Z[i]=m;i++;continue;}if(take){Z[i]=z;j++;i++;continue;}throw Error("inconsistent reachability")}visit(start,j)}
   for(const start of starts)walk(0,start,start)
  }
  return {length:C.length,b,anchors:anchors.map(a=>({start:a.start,len:a.len})),models:modelCount,originModels,paths:total,uniqueAnchorStates:cache.size,maxIndividuallyLexical:maxLocal,allSixLexicalPaths:jointPaths,bestJoint:best,joinNodes:nodes};
 }
 const originals=[];for(const [f,l,skip,b] of [[54,55,0,0],[54,55,9,0],[0,2,0,2],[0,2,13,2],[0,2,0,0],[0,2,13,0]]){const start=c.pages.slice(0,f).reduce((a,p)=>a+p.indices.length,0)+skip,C=c.pages.slice(f,l+1).flatMap(p=>p.indices).slice(skip),a=choose(words,start,C.length);originals.push({f,l,skip,...solve(C,b,a)})}
 // Positive controls for the exact lexical join at the genuine clock path; the
 // separate reachability SFT tests all origins. Known native forms are in the finite register.
 const controls=[];
 for(const [name,b,sign,start,seed] of [["0_welcome",0,1,137,0x715a],["0_loss_of_divinity",2,-1,911,0x226b]]){
  const src=sources.find(s=>s.name===name),P=src.P,a=choose(src.words,0,P.length),S=id.slice();let x=seed;for(let i=28;i>0;i--){x^=x<<13;x^=x>>>17;x^=x<<5;const j=(x>>>0)%(i+1);[S[i],S[j]]=[S[j],S[i]]}const C=enc(P,S,b,sign,start),Z=P.map(p=>S[p]);const A=a.map(w=>Z.slice(w.start,w.start+w.len));const q=joint(A,b,S[b]);assert(q.joint,"true native join");const key=id.map(i=>S.indexOf(i));assert(A.every((z,i)=>z.every((x,j)=>key[x]===a[i].p[j])),"true native key");assert(equal(enc(Z.map(z=>key[z]),S,b,sign,start),C),"control replay");controls.push({name,b,sign,start,length:P.length,markerImage:S[b],trueJoin:true,firstJoinAssigned:q.key.filter(x=>x>=0).length,firstJoinCorrect:q.key.filter((x,i)=>x>=0&&key[i]===x).length,anchors:a.map(w=>({start:w.start,len:w.len})),replay:P.length})
 }
 return {method:"all legal inner-permutation prime-clock paths; exact shared monoalphabetic dictionary join on six longest intact original groups",lexiconForms:forms.size,authenticReplay:85,originals,controls}
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/lp2-transcription.txt","resources/control/english_wordfreq_textblob.txt"];
const f=paths.map(p=>fs.readFileSync(p,"utf8"));
console.log(JSON.stringify(experiment(JSON.parse(f[0]),JSON.parse(f[1]),f[2],f[3]),null,2));
