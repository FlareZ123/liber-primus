'use strict';
// Exact blockwise DH share inverse; run at repository root. Mode 0: all shares; ±1: DH generator progression.
const fs=require('node:fs'),crypto=require('node:crypto');
function experiment(d,reference){
 const m=x=>(x%29+29)%29, inv=([a,b,c,d])=>[m(15*(a+d)),m(15*(b+c)),m(15*(c-b)),m(15*(d-a))];
 const tok=d.translit, tokens=tok.map((t,i)=>[t,i]).concat([["ING",21],["IO",27],["K",5],["V",1],["Z",14],["QU",5]]).sort((a,b)=>b[0].length-a[0].length);
 function enc(s){let out=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){while(w.length){const t=tokens.find(([q])=>w.startsWith(q));if(!t){w=w.slice(1);continue}out.push(t[1]);w=w.slice(t[0].length)}}return out}
 const training=enc(reference.split("\n").filter(l=>/^[A-Z" ]+$/.test(l)&&l.trim()).join(" "));
 const cnt=Array.from({length:29},()=>Array(29).fill(0.5));for(let i=1;i<training.length;i++)cnt[training[i-1]][training[i]]++;
 const L=cnt.map(r=>{const n=r.reduce((a,b)=>a+b,0);return r.map(x=>Math.log(x/n))});
 const score=a=>a.slice(1).reduce((s,x,i)=>s+L[a[i]][x],0)/Math.max(1,a.length-1);
 const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);const check=(v,msg)=>{if(!v)throw Error(msg)};
 // A block is four consuming symbols; F bypasses before the share choice.
 // Fixed progression restricts each next A; free-share model makes all 22 choices.
 function inverse(input,h,hold,mode){
  const ks=Array.from({length:23},(_,A)=>inv([h[0],A,h[2],h[3]]));const step=mode===1?5:14;
  const initial=mode===0?0:8*step%23;
  let dp=new Map([["0,"+initial+",29",{phase:0,A:initial,last:29,s:0,plain:[],shares:[],n:1n}]]);
  for(let i=0;i<input.length;i++){
   let nd=new Map();
   function put(v,p,phase,A,shares){const key=[phase,A,p].join(","),s=v.s+(v.last===29?0:L[v.last][p]),old=nd.get(key),n=v.n+(old?.n??0n);
    if(!old||s>old.s)nd.set(key,{phase,A,last:p,s,plain:[...v.plain,p],shares,n});else old.n=n}
   for(const v of dp.values()){
    if(hold&&input[i]===0)put(v,0,v.phase,v.A,v.shares);
    const allowed=mode===0&&v.phase===0?Array.from({length:22},(_,i)=>i+1):[v.A];
    for(const A of allowed){
     const p=m(input[i]-ks[A][v.phase]);if(hold&&p===0)continue;
     const next=(v.phase+1)%4,nextA=next===0?(mode===0?0:A*step%23):A;
     put(v,p,next,nextA,v.phase===0?[...v.shares,A]:v.shares)
    }
   }
   if(!nd.size){const blockers=[...dp.values()].map(v=>({phase:v.phase,A:v.A,last:v.last,number:String(v.n),key:v.A?ks[v.A][v.phase]:null}));return {dead:i,cipher:input[i],blockers,paths:"0"}}
   dp=nd
  }
  const a=[...dp.values()].sort((a,b)=>b.s-a.s);
  return {plain:a[0].plain,shares:a[0].shares,paths:String(a.reduce((s,x)=>s+x.n,0n)),score:score(a[0].plain)}
 }
 function forward(p,h,shares,hold){let phase=0,b=0;return p.map(x=>{if(hold&&x===0)return 0;const k=inv([h[0],shares[b],h[2],h[3]])[phase];if(++phase===4){phase=0;b++}return m(x+k)})}
 function genShares(mode,s,n){let A=8;return Array.from({length:n},(_,i)=>mode===0?1+((i*7+s*11+i*i)%22):(A=A*(mode===1?5:14)%23))}
 const configs=[{page:40,offset:71,h:[14,8,3,26],p:[13,24,2,15]},{page:33,offset:132,h:[23,8,2,27],p:[7,10,20,20]}],results=[];
 for(const {page,offset,h,p} of configs){
  check(eq(forward(p,h,[8],false),d.pages[page].indices.slice(offset,offset+4)),"anchor mismatch");
  const x=d.pages[page].indices.slice(offset+4);
  for(const mode of [1,-1,0])for(const hold of [false,true]){
   const a=inverse(x,h,hold,mode), controls=[];
   // The editorial reference can include p57: its exact participation is NOT assumed independent.
   const plants=mode===0?Array.from({length:8},(_,s)=>training.slice(200+s*181,200+s*181+x.length)).concat([d.pages[57].indices]):[d.pages[57].indices];
   for(let s=0;s<plants.length;s++){
    const plant=plants[s], shares=genShares(mode,s,plant.length), cipher=forward(plant,h,shares,hold),v=inverse(cipher,h,hold,mode);
    check(v.plain&&eq(forward(v.plain,h,v.shares,hold),cipher)&&v.score>=score(plant)-1e-9,"planted forward/score mismatch");
    controls.push({n:plant.length,truthScore:score(plant),bestScore:v.score,correct:v.plain.filter((y,i)=>y===plant[i]).length,paths:v.paths})
   }
   if(a.plain)check(eq(forward(a.plain,h,a.shares,hold),x),"original replay");
   const min=Math.min(...Array.from({length:training.length-x.length+1},(_,i)=>score(training.slice(i,i+x.length))));
   results.push({page,offset,suffixLength:x.length,mode,hold,...a,referenceMin:min,output:a.plain?.map(y=>tok[y]).join(" "),controls})
  }
 }
 return {trainingLength:training.length,results}
}
const cp='resources/liber-primus/lp2-corpus.json',rp='resources/liber-primus/lp1-plaintext-reference.txt';
const blob=b=>crypto.createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex');
const cb=fs.readFileSync(cp), rb=fs.readFileSync(rp);
if(blob(cb)!=='054f2a0f780b7d46901acbe3d9bf4f0ac1801165'||blob(rb)!=='8ed037a6ddeef2b20a10bd6a84830e7cf9f43f7d')throw Error('input blob mismatch');
const output=experiment(JSON.parse(cb.toString('utf8')),rb.toString('utf8'));output.inputs={corpus:blob(cb),reference:blob(rb)};
const out=process.argv[2];if(out)fs.writeFileSync(out,JSON.stringify(output,null,2)+'\n');else console.log(JSON.stringify(output,null,2));
