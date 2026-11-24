'use strict';
// Exact partial-key necessary reachability, final full keys are exact.
function experiment(inputs){
 const [g,trans,nt]=[JSON.parse(inputs[0]),inputs[1],JSON.parse(inputs[2])],mp=new Map(g.runes.map((x,i)=>[x,i]));
 const words=(trans.replace(/[\s/%]/g,"").match(/[\u16a0-\u16ff]+/g)||[]).slice(0,2896).map(w=>[...w].map(x=>mp.get(x)));const tape=words.flat(),assert=(v,m)=>{if(!v)throw Error(m)};
 assert(String(tape)===String(g.pages.slice(0,56).flatMap(p=>p.indices)),"canonical tape");const starts=[];for(const w of words)starts.push(1,...Array(w.length-1).fill(0));
 const lo=g.pages.slice(0,40).reduce((a,p)=>a+p.indices.length,0),hi=g.pages.slice(0,54).reduce((a,p)=>a+p.indices.length,0),C=tape.slice(lo,hi),W=starts.slice(lo,hi);W[0]=1;assert(C.length===3008,"chapter");
 const rot=(key,s)=>key.slice(s).concat(key.slice(0,s)),canonical=key=>Array.from({length:key.length},(_,i)=>rot(key,i)).sort((a,b)=>{for(let j=0;j<a.length;j++)if(a[j]!==b[j])return a[j]-b[j];return 0})[0];
 function solve(C,W,q){
  const M=(1<<q)-1,D=C.map((x,i)=>(x-(i?C[i-1]:0)+29)%29),c=Uint8Array.from(C),d=Uint8Array.from(D),w=Uint8Array.from(W),N=c.length,key=new Int8Array(q).fill(-1),ban=new Int32Array(29),pair=new Int32Array(29);
  let calls=0,steps=0;
  function reachable(){
   calls++;ban.fill(0);pair.fill(0);
   for(let j=0;j<q;j++){const a=key[j],b=key[(j+q-1)%q];if(a>=0)ban[a]|=1<<j;if(a>=0&&b>=0)pair[(a-b+29)%29]|=1<<j}
   let H=M,A=0,i=0;
   for(;i<N;i++){
    const x=c[i],h=x===0?A|(w[i]?H:0):0,z=(H|(w[i]?A:A&~pair[d[i]]))&~ban[x];
    A=((z<<1)|(z>>(q-1)))&M;H=h;if(!(A|H)){steps+=i+1;return false}
   }
   steps+=i;return true;
  }
  const un=[];for(let a=0;a<29;a++){key[0]=a;if(reachable())un.push(a)}key.fill(-1);
  const pairs=Array.from({length:Math.floor(q/2)+1},()=>new Uint8Array(29*29)),pairCounts=[];
  for(let dist=1;dist<pairs.length;dist++){
   let n=0;for(const a of un)for(const b of un){key[0]=a;key[dist]=b;if(reachable()){pairs[dist][29*a+b]=1;n++}}key.fill(-1);pairCounts.push(n)
  }
  const visited=Array(q+1).fill(0),passed=Array(q+1).fill(0),full=[],start=Date.now();
  function dfs(j){
   if(j===q){const k=Array.from(key);if(String(k)===String(canonical(k)))full.push(k);return}
   for(const x of un){if(j&&x<key[0])continue;let ok=true;for(let i=0;i<j;i++){let gap=j-i;if(gap<=Math.floor(q/2)){if(!pairs[gap][29*key[i]+x]){ok=false;break}}else if(!pairs[q-gap][29*x+key[i]]){ok=false;break}}if(!ok)continue;
    key[j]=x;visited[j+1]++;if(reachable()){passed[j+1]++;dfs(j+1)}key[j]=-1;
   }
  }
  dfs(0);
  return {q,unary:un,pairCounts,visited,passed,calls,steps,full,searchSeconds:(Date.now()-start)/1000}
 }
 const out={target:[],controls:[]};
 for(const q of [7,8]){const r=solve(C,W,q);out.target.push(r)}
 // A strict intermediate made losslessly from native GP indices as two nonzero modular
 // deltas per source rune. The output has no adjacent equality at any position.
 const donor=nt.sections.flatMap(s=>Array.from(s.source_text).filter(x=>mp.has(x)).map(x=>mp.get(x)));
 let prev=0;const intermediate=[];for(const p of donor){for(const delta of [Math.floor(p/28)+1,p%28+1]){prev=(prev+delta)%29;intermediate.push(prev)}if(intermediate.length>=C.length)break}
 assert(intermediate.length>=C.length,"donor");const P=intermediate.slice(0,C.length);assert(P.every((x,i)=>!i||x!==P[i-1]),"strict");
 for(const q of [7,8]){
  const k=q===7?[7,13,24,5,26,17,3]:[23,10,1,10,9,10,16,26];let phase=3;const ct=P.map(x=>x===0?0:(x+k[phase++%q])%29);const r=solve(ct,W,q),truth=canonical(k);assert(r.full.some(x=>String(x)===String(truth)),"true key lost");out.controls.push({...r,truth,source:"native GP encoded as two nonzero base28 digits"});
 }
 return out;
}
const fs=require('node:fs'),path=require('node:path');
const paths=["resources/liber-primus/lp2-corpus.json","resources/transcriptions/lp2-image-corrected.txt","resources/external/relikd-solved-gp29-native-v1.json"];
console.log(JSON.stringify(experiment(paths.map(p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8'))),null,2));
