// Agent50, 2026-11-24. Exact transparent-F ciphertext-autokey reachability.
// node sims/lp2-ciphertext-autokey-lag8-fhold-exact-gate.js
const fs=require("node:fs");
function mod(x){return (x%29+29)%29}
function enc(p,key){const q=key.slice(),out=[];for(const v of p){if(v===0){out.push(0);continue;}const c=mod(v+q.shift());out.push(c);q.push(c);}return out;}
function inv(c,lag,key=null){
 let states=new Map([["",{q:[],count:1n,p:[]}]]);
 let max=1;
 for(let i=0;i<c.length;i++){
  const v=c[i],next=new Map();
  function add(s,q,p){const h=q.join(",");const old=next.get(h);if(old){old.count+=s.count;}else next.set(h,{q,count:s.count,p:s.p.concat(p)});}
  for(const s of states.values()){
   if(v===0)add(s,s.q,0);
   const j=s.q.length;
   const k=j<lag?(key?key[j]:null):s.q[0];
   const p=k===null?-1:mod(v-k);
   if(p!==0)add(s,j<lag?s.q.concat(v):s.q.slice(1).concat(v),p);
  }
  max=Math.max(max,next.size);
  if(!next.size)return {n:c.length,fail:i,c:v,prior:[...states.values()].map(s=>({q:s.q,count:s.count.toString()})),max};
  states=next;
 }
 const s=[...states.values()][0];return {n:c.length,fail:null,states:states.size,max,paths:[...states.values()].reduce((a,b)=>a+b.count,0n).toString(),example:s.p};
}
function run(data){
 const get=(lo,hi)=>data.pages.filter(p=>p.page>=lo&&p.page<=hi).flatMap(p=>p.indices);
 const primer=[23,10,1,10,9,10,16,26],rows=[];
 for(const [name,c] of [["p0–2",get(0,2)],["p0 black body onward",get(0,2).slice(13)],["p40–53",get(40,53)],["p54–55",get(54,55)],["p54 black body onward",get(54,55).slice(9)]]){
 const a=inv(c,8),b=inv(c,8,primer);rows.push({name,arbitrary:a,fixed:b});
 }
 const p=get(57,57),controls=[];
 for(const key of [primer,[0,1,2,3,4,5,6,7],[28,17,6,24,3,21,12,9]]){
 const c=enc(p,key),a=inv(c,8),b=inv(c,8,key);
 if(a.fail!==null||b.fail!==null||enc(b.example,key).join(",")!==c.join(","))throw Error("control failed");
 controls.push({key,n:p.length,arbitraryPaths:a.paths,fixedPaths:b.paths,representativeMatches:b.example.filter((v,i)=>v===p[i]).length,exactReplay:true});
 }
 return {rows,controls};
}
console.log(JSON.stringify(run(JSON.parse(fs.readFileSync("resources/liber-primus/lp2-corpus.json","utf8"))),null,2));
