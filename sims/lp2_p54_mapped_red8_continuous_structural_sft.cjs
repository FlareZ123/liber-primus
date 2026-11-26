'use strict';
const fs=require('node:fs');
function experiment(profile,corpus){
 const S="0123456789abcdefghijklmnopqrs",mod=x=>(x%29+29)%29,K=profile.red8_key.gp29_indices,C=[...profile.p54.body_groups.join("")].map(x=>S.indexOf(x)),P=corpus.pages[57].indices;
 if(C.length!==223||C.filter(x=>!x).length!==3||K.length!==8)throw Error("input");
 const uniq=[...new Set(K)],R=new Set(uniq);
 function reach(c,m,start){let states=1<<start;for(let i=0;i<c.length;i++){let next=0;for(let j=0;j<8;j++)if(states&(1<<j)){if(c[i]===0)next|=1<<j;if(c[i]!==m[j])next|=1<<((j+1)%8)}if(!next)return {firstImpossible:i,finalStates:0};states=next}return {firstImpossible:-1,finalStates:states}}
 function observed(c,start,mask){let seen=Array(8).fill(0),phase=start,z=0;for(const x of c){if(!x&&((mask>>z++)&1))continue;seen[phase]|=1<<x;phase=(phase+1)%8}return seen}
 function negative(c,start,mask){
  const seen=observed(c,start,mask),allowed=new Map(uniq.map(r=>[r,Array.from({length:28},(_,i)=>i+1).filter(s=>s!==r&&K.every((v,j)=>v!==r||!(seen[j]&(1<<s))))]));
  const partners=new Map();let nodes=0;
  function dfs(){nodes++;let r=-1,opts=null;for(const a of uniq)if(!partners.has(a)){let d=allowed.get(a).filter(b=>!partners.has(b)&&(!R.has(b)||allowed.get(b).includes(a)));if(!d.length)return false;if(!opts||d.length<opts.length){r=a;opts=d}}if(r<0)return true;for(const b of opts){partners.set(r,b);partners.set(b,r);if(dfs())return true;partners.delete(r);partners.delete(b)}return false}
  if(!dfs())return {start,mask,feasible:false,nodes};let remaining=Array.from({length:28},(_,i)=>i+1).filter(x=>!partners.has(x));for(let i=0;i<remaining.length;i+=2){partners.set(remaining[i],remaining[i+1]);partners.set(remaining[i+1],remaining[i])}
  let pi=Array(29).fill(0),n=1;for(let a=1;a<29;a++){if(pi[a])continue;let b=partners.get(a);pi[a]=n;pi[b]=29-n;n++}
  let m=K.map(x=>partners.get(x)),ip=[];pi.forEach((v,i)=>ip[v]=i);
  if(new Set(pi).size!==29||m.some((x,j)=>x!==ip[mod(-pi[K[j]])])||reach(c,m,start).firstImpossible!==-1)throw Error("witness");
  // Decode this exact mask and re-encrypt under the witnessed alphabet and sign.
  let phase=start,z=0,plain=c.map(x=>{if(!x&&((mask>>z++)&1))return 0;let p=ip[mod(pi[x]+pi[K[phase]])];phase=(phase+1)%8;if(!p)throw Error("forbidden consuming F");return p});
  phase=start;let replay=plain.map(p=>{if(!p)return 0;let x=ip[mod(pi[p]-pi[K[phase]])];phase=(phase+1)%8;return x});
  if(replay.some((x,i)=>x!==c[i]))throw Error("replay");
  return {start,mask,feasible:true,nodes,pi,excluded:m};
 }
 const direct=Array.from({length:8},(_,start)=>({start,...reach(C,K,start)}));
 const minus=[];for(let start=0;start<8;start++)for(let mask=0;mask<8;mask++)minus.push(negative(C,start,mask));
 let controls=[];for(let seed=1;seed<=16;seed++){let state=seed,rand=n=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state%n},pi=Array.from({length:29},(_,i)=>i);for(let i=28;i>1;i--){let j=1+rand(i);[pi[i],pi[j]]=[pi[j],pi[i]]}let ip=[];pi.forEach((x,i)=>ip[x]=i);for(let sign of [1,-1]){let start=seed%8,phase=start,z=0,mask=0;let c=P.map(p=>{if(!p){mask|=1<<z++;return 0}let x=ip[mod(pi[p]+sign*pi[K[phase]])];phase=(phase+1)%8;if(!x)z++;return x});let m=K.map(x=>ip[mod(sign*pi[x])]);if(reach(c,m,start).firstImpossible!==-1||sign===-1&&!negative(c,start,mask).feasible)throw Error("plant rejected");controls.push({seed,sign,start,z,mask})}}
 return {direct,minus,controls};
}
const [a,b]=["resources/liber-primus/lp2-page-groups-54-55-derived.json","resources/liber-primus/lp2-corpus.json"].map(p=>JSON.parse(fs.readFileSync(p,'utf8')));console.log(JSON.stringify(experiment(a,b),null,2));
