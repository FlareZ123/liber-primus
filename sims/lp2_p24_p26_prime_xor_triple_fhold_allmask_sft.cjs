"use strict";
const fs=require("node:fs"),path=require("node:path");
function solve(corpus){
 const code=[2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109],idx=new Map(code.map((p,i)=>[p,i])),M=128,full=(1n<<16384n)-1n;
 const allowed=Array.from({length:M},()=>new Uint8Array(M));
 for(let x=1;x<29;x++)for(let y=1;y<29;y++)for(let z=1;z<29;z++)allowed[code[x]^code[y]][code[x]^code[z]]=1;
 const rows=Array.from({length:M},(_,e)=>allowed.map(row=>{let r=0n;for(let b=0;b<M;b++)if(row[b^e])r|=1n<<BigInt(b);return r.toString(16).padStart(32,"0");}));
 const cache=new Map();function bits(d,e){const k=d*M+e;if(!cache.has(k)){const hex=[];for(let a=M-1;a>=0;a--)hex.push(rows[e][a^d]);cache.set(k,BigInt("0x"+hex.join("")));}return cache.get(k);}
 function bitCount(x){let n=0;while(x){x&=x-1n;n++;}return n;}
 function positions(a,p){const out=[];while(p<a.length){out.push(p);if(a[p]!==0)break;p++;}return out;}
 function advance(tracks,L){
  let states=new Map([["0,0,0",{p:[0,0,0],m:full}]]),trace=[];
  for(let t=0;t<L;t++){const next=new Map();for(const s of states.values()){
   const h=s.p.map((p,i)=>positions(tracks[i],p));
   for(const a of h[0])for(const b of h[1])for(const c of h[2]){
    const x=code[tracks[0][a]],y=code[tracks[1][b]],z=code[tracks[2][c]],m=s.m&bits(x^y,x^z);
    if(m===0n)continue;const p=[a+1,b+1,c+1],k=p.join(","),old=next.get(k);if(old)old.m|=m;else next.set(k,{p,m});
   }
  }
  states=next;let union=0n;for(const s of states.values())union|=s.m;
  trace.push({active:t+1,states:states.size,masks:bitCount(union)});if(!states.size)break;
  }
  let union=0n;for(const s of states.values())union|=s.m;const masks=[];for(let a=0;a<M;a++)for(let b=0;b<M;b++)if((union>>BigInt(a*M+b))&1n)masks.push([a,b]);
  return {trace,masks};
 }
 // Independent small brute force: for each pair of relative masks, enumerate all legal
 // hold histories and consuming triples, then compare the union to the bitset DP.
 const tiny=[[0,5,0,7,9],[3,0,8,0,12],[0,0,9,14,2]],L=3,brute=[];
 for(let a=0;a<M;a++)for(let b=0;b<M;b++){let states=[[0,0,0]];for(let t=0;t<L;t++){const next=new Map();for(const p of states)for(const i of positions(tiny[0],p[0]))for(const j of positions(tiny[1],p[1]))for(const k of positions(tiny[2],p[2])){
  const x=code[tiny[0][i]],y=code[tiny[1][j]],z=code[tiny[2][k]];
  if(allowed[x^y^a][x^z^b]){const q=[i+1,j+1,k+1];next.set(q.join(","),q);}
 }states=[...next.values()];if(!states.length)break;}if(states.length)brute.push([a,b]);}
 const test=advance(tiny,L);if(JSON.stringify(brute)!==JSON.stringify(test.masks))throw Error("brute mismatch");
 // A deliberately nonzero mask plant: use legal active plaintext triples chosen independently
 // of the observed original; both holds and consuming F outputs occur.
 const secret=[0,19,103],P=[[],[],[]],C=[[],[],[]];let seed=0x7318d06;function rand(n){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)%n;}
 for(let t=0;t<48;t++){let q,keys;do{q=secret.map(()=>1+rand(28));keys=Array.from({length:128},(_,k)=>k).filter(k=>q.every((x,j)=>idx.has(code[x]^k^secret[j])));}while(!keys.length);const key=keys[rand(keys.length)];for(let j=0;j<3;j++){if(rand(7)===0){P[j].push(0);C[j].push(0);}P[j].push(q[j]);C[j].push(idx.get(code[q[j]]^key^secret[j]));}}
 const plant=advance(C,48);if(!plant.masks.some(([a,b])=>a===secret[1]&&b===secret[2]))throw Error("true secret lost");
 const original=[[0,0,0],[3,2,1]].map(off=>({off,...advance(off.map((n,i)=>corpus.pages[24+i].indices.slice(n,n+264)),240)}));
 return {model:"exact all-relative-mask, all latent-F holds, non-F consuming plaintext, triple chart-prime XOR support",tiny:{maskCount:brute.length,trace:test.trace},plant:{secret,maskCount:plant.masks.length,trace:plant.trace},original,cache:cache.size};
}
console.log(JSON.stringify(solve(JSON.parse(fs.readFileSync(path.join(__dirname,"../resources/liber-primus/lp2-corpus.json"),"utf8"))),null,2));
