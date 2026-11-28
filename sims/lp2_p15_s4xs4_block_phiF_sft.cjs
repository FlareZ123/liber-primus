'use strict';
const fs=require('node:fs'),path=require('node:path');
function experiment(A,B) {
 const assert=(q,m)=>{if(!q)throw Error(m)},same=(a,b)=>a.length===b.length&&a.every((v,i)=>v===b[i]),mod=x=>(x%29+29)%29;
 const raw=A.pages.slice(16,23).flatMap(x=>x.indices),cut=864;
 assert(raw.length===1744&&cut%16===0,"target block shape");
 const prime=[];for(let n=2;prime.length<raw.length;n++)if(prime.every(p=>p*p>n||n%p!==0))prime.push(n);
 const K=prime.map(p=>(p-1)%29);
 const native=s=>[...s.source_text].map(c=>A.runes.indexOf(c)).filter(i=>i>=0);
 const enc=p=>{let j=0;return p.map(v=>v===0?0:mod(v+K[j++]));};
 const p56=native(B.sections.find(s=>s.name==="p56_an_end"));
 assert(same(enc(p56),A.pages[56].indices),"authentic p56 replay");
 function permutations(a){if(!a.length)return [[]];return a.flatMap((v,i)=>permutations(a.filter((_,j)=>i!==j)).map(p=>[v,...p]));}
 const perms=permutations([0,1,2,3]),keys=perms.flatMap(row=>perms.map(col=>({row,col,order:row.flatMap(r=>col.map(c=>4*r+c))})));
 assert(keys.length===576&&new Set(keys.map(k=>k.order.join(","))).size===576,"exact domain");
 function trans(x,k,reverse){assert(x.length%16===0,"complete blocks");const y=new Array(x.length);for(let i=0;i<x.length;i+=16)for(let j=0;j<16;j++){if(reverse)y[i+j]=x[i+k.order[j]];else y[i+k.order[j]]=x[i+j];}return y;}
 function reach(c){let row=new Uint8Array(c.length+2),z=0;row[0]=1;for(let i=0;i<c.length;i++){let any=0,v=c[i];if(v===0){for(let h=z+1;h>=0;h--){row[h]=(h<=z&&row[h]&&K[i-h]!==0)||(h>0&&row[h-1])?1:0;any|=row[h];}z++;}else{for(let h=0;h<=z;h++){if(row[h]&&K[i-h]===v)row[h]=0;any|=row[h];}}if(!any)return {length:i,states:0};}return {length:c.length,states:row.reduce((s,x)=>s+x,0)};}
 const donorNames=["0_koan_1","0_loss_of_divinity","jpg107-167","jpg229"];
 const donor=B.sections.filter(s=>donorNames.includes(s.name)).flatMap(native);
 assert(donor.length>=raw.length,"donor length");
 const u=new Float64Array(29).fill(.5),b=Array.from({length:30},()=>new Float64Array(29)),n=new Float64Array(30);
 for(const s of B.sections.filter(s=>!donorNames.includes(s.name))){let last=29;for(const p of native(s)){u[p]++;b[last][p]++;n[last]++;last=p;}}
 const total=u.reduce((a,v)=>a+v,0),logp=b.map((row,l)=>Array.from(row,(v,p)=>Math.log((v+5*u[p]/total)/(n[l]+5))));
 function decode(c){let states=new Map([[29,{h:0,last:29,score:0,prev:null,p:null}]]);for(let i=0;i<c.length;i++){const out=new Map();const add=(s,p,h)=>{const score=s.score+logp[s.last][p],id=h*30+p,old=out.get(id);if(!old||score>old.score)out.set(id,{h,last:p,score,prev:s,p});};for(const s of states.values()){if(c[i]===0)add(s,0,s.h+1);const p=mod(c[i]-K[i-s.h]);if(p!==0)add(s,p,s.h);}if(!out.size)return null;states=out;}let best=null;for(const s of states.values())if(!best||s.score>best.score)best=s;let score=best.score,p=[];while(best.prev){p.push(best.p);best=best.prev;}p.reverse();assert(same(enc(p),c),"inner replay");return {p,score};}
 function scoreRange(p,start,end){let z=0;for(let i=start;i<end;i++)z+=logp[i?p[i-1]:29][p[i]];return z/(end-start);}
 function search(cipher){
  const results=keys.map((k,id)=>{const c=trans(cipher,k,true),r=reach(c.slice(0,cut));assert(same(trans(c,k,false),cipher),"outer replay");const prefix=r.length===cut?decode(c.slice(0,cut)):null;return {id,row:k.row,col:k.col,prefixLegal:r.length,terminalStates:r.states,prefixScore:prefix?prefix.score/cut:null};});
  const candidates=results.filter(x=>x.prefixLegal===cut).sort((a,b)=>b.prefixScore-a.prefixScore||a.id-b.id);
  let chosen=null;if(candidates.length){const best=candidates[0],c=trans(cipher,keys[best.id],true),f=reach(c),d=f.length===c.length?decode(c):null;chosen={id:best.id,row:best.row,col:best.col,prefixScore:best.prefixScore,fullLegal:f.length,fullStates:f.states,heldScore:d?scoreRange(d.p,cut,d.p.length):null,plaintext:d?.p??null};if(d)assert(same(trans(enc(d.p),keys[best.id],false),cipher),"full replay");}
  return {results,survivorCount:candidates.length,maxPrefix:Math.max(...results.map(r=>r.prefixLegal)),chosen};
 }
 const controls=[137,502].map((id,i)=>{const start=i*(donor.length-raw.length),p=donor.slice(start,start+raw.length),c=trans(enc(p),keys[id],false),out=search(c);assert(out.results[id].prefixLegal===cut,"true planted key legal");const chosen=out.chosen;return {trueId:id,trueKey:keys[id],donorStart:start,survivorCount:out.survivorCount,wrongKeysLegal:out.survivorCount-1,chosen:chosen&&{...chosen,plaintext:undefined},exact:chosen?.plaintext?.filter((v,j)=>v===p[j]).length??0,heldExact:chosen?.plaintext?.slice(cut).filter((v,j)=>v===p[cut+j]).length??0};});
 const original=search(raw);
 return {target:{pages:[16,22],length:raw.length,cut,held:raw.length-cut,domain:keys.length,clock:"origin zero, prime-minus-one, transparent plaintext F"},p56:p56.length,donorLength:donor.length,controls,original};
}
const inputs=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json"].map(p=>JSON.parse(fs.readFileSync(path.join(__dirname,'..',p),'utf8')));
console.log(JSON.stringify(experiment(...inputs),null,2));
