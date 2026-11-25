'use strict';
const fs=require('node:fs'),path=require('node:path');
function experiment(gp,native){
 const N=29,full=(1<<N)-1,mod=v=>(v%N+N)%N;
 function enc(p,k){let queue=k.slice();return p.map(v=>{if(v===0)return 0;const c=mod(queue.shift()-v);queue.push(v);return c})}
 function witness(c,q,h){const d=new Int32Array(q).fill(full),s=new Int32Array(q);let i=0,z=0;for(const v of c){if(v===0&&h[z++]==="H")continue;let a=i++%q;s[a]=mod(s[a]+v);d[a]&=~(1<<s[a]);if(!d[a])return null}const k=Array.from(d,m=>Math.log2(m&-m));const queue=k.slice();z=0;const p=c.map(v=>{if(v===0&&h[z++]==="H")return 0;const x=mod(queue.shift()-v);if(!x)throw Error("zero consumed");queue.push(x);return x});if(String(enc(p,k))!==String(c))throw Error("replay");return {key:k,plaintext:p}}
 function exact(c,q,cap){
  const blocks=[];let start=0;
  for(let i=0;i<=c.length;i++)if(i===c.length||c[i]===0){const shift=new Int32Array(q),bad=new Int32Array(q);for(let j=start;j<i;j++){let a=(j-start)%q;shift[a]=(shift[a]+c[j])%N;bad[a]|=1<<shift[a]}blocks.push({shift,bad,len:i-start});start=i+1}
  const rot=(m,s)=>((m>>>s)|(m<<(N-s)))&full;
  let nodes=0,maxdepth=0,cutoff=false,done=null;
  function go(depth,dom,history){
   if(++nodes>cap){cutoff=true;return false}
   maxdepth=Math.max(maxdepth,depth);
   const b=blocks[depth],next=new Int32Array(q),s=b.len%q;
   for(let i=0;i<q;i++){const a=dom[i]&~b.bad[i];if(!a)return false;next[(i-s+q)%q]=rot(a,b.shift[i])}
   if(depth===blocks.length-1){done=history;return true}
   if(go(depth+1,next,history+"H"))return true;
   if(cutoff)return false;
   if(next[0]&~1){const a=next[0]&~1;next.copyWithin(0,1);next[q-1]=a;if(go(depth+1,next,history+"C"))return true}
   return false
  }
  const feasible=go(0,new Int32Array(q).fill(full),"");
  const w=feasible?witness(c,q,done):null;
  if(feasible&&!w)throw Error("witness");
  return {q,n:c.length,zero:blocks.length-1,nodes,maxdepth,status:feasible?"SAT":cutoff?"CAPPED":"UNSAT",replay:!!w,history:done,key:w?.key};
 }
 function brute(c,q){function rec(i,k){if(i===c.length)return true;const v=c[i];if(v===0&&rec(i+1,k))return true;let x=mod(k[0]-v);return x!==0&&rec(i+1,k.slice(1).concat(x))}let k=Array(q).fill(0);for(let j=0;j<N**q;j++){let x=j;for(let i=0;i<q;i++){k[i]=x%N;x=Math.floor(x/N)}if(rec(0,k))return true}return false}
 let seed=0xc1ca3301;function rand(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%N}
 const toy=[];
 for(const q of [1,2])for(let t=0;t<40;t++){let c=Array.from({length:12+Math.floor(t*3)},(_,i)=>i%11===0?0:rand());const e=exact(c,q,1000000);const b=brute(c,q);if((e.status==="SAT")!==b||e.status==="CAPPED")throw Error("brute mismatch");toy.push(e.status)}
 const lookup=new Map(gp.runes.map((x,i)=>[x,i]));const sections=native.sections.map(s=>({name:s.name,p:Array.from(s.source_text).filter(x=>lookup.has(x)).map(x=>lookup.get(x))}));
 const controls=[];for(const name of ["0_welcome","0_koan_1","0_loss_of_divinity"]){const p=sections.find(x=>x.name===name).p.slice(0,308);const k=Array.from({length:8},rand),c=enc(p,k);const h=c.map((v,i)=>v===0?(p[i]===0?"H":"C"):"").join("");if(!witness(c,8,h))throw Error("native oracle");const e=exact(c,8,1500000);if(e.status!=="SAT")throw Error("native control");controls.push({name,...e,generatedF:h.split("C").length-1})}
 const p=gp.pages.slice(33,40).flatMap(x=>x.indices);const original=exact(p,8,1500000);if(original.status!=="UNSAT")throw Error("expected exact exclusion");
 let lo=0,hi=p.length;const boundary=[];
 while(hi-lo>1){const m=Math.floor((lo+hi)/2),e=exact(p.slice(0,m),8,1500000);boundary.push({n:m,status:e.status,nodes:e.nodes});if(e.status==="SAT")lo=m;else if(e.status==="UNSAT")hi=m;else break}
 const terminal=exact(gp.pages.slice(54,56).flatMap(x=>x.indices),8,1500000);
 return {toy:{total:toy.length,sat:toy.filter(v=>v==="SAT").length,unsat:toy.filter(v=>v==="UNSAT").length},controls,original,boundary,lo,hi,terminal};
}
const read=p=>JSON.parse(fs.readFileSync(path.resolve(__dirname,'..',p),'utf8'));
console.log(JSON.stringify(experiment(read('resources/liber-primus/lp2-corpus.json'),read('resources/external/relikd-solved-gp29-native-v1.json')),null,2));
