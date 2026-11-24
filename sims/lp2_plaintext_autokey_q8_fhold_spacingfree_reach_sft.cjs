'use strict';
const fs=require('node:fs'),path=require('node:path');
const gp=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../resources/liber-primus/lp2-corpus.json'),'utf8'));
function reach(c,{reverse=false,consumeFirst=false,cap=2000000,nonzeroStart=false}={}){
 const q=8,ALL=(1<<29)-1,mod=x=>(x+29)%29,bit=x=>1<<x;
 const blocks=[];let from=0;
 for(let i=0;i<=c.length;i++)if(i===c.length||c[i]===0){
  const len=i-from,allow=Array(q).fill(ALL),sign=Array(q).fill(1),offset=Array(q).fill(0);
  for(let j=0;j<len;j++){const lane=j%q,x=c[from+j];allow[lane]&=~bit(mod(sign[lane]*(x-offset[lane])));sign[lane]*=-1;offset[lane]=mod(x-offset[lane]);}
  blocks.push({from,len,allow,sign,offset,zero:i<c.length});from=i+1;
 }
 function map(mask,s,b){let out=0;while(mask){const x=mask&-mask,k=31-Math.clz32(x);out|=bit(mod(s*k+b));mask^=x}return out}
 let visits=0,max=0,capHit=false,deadCount=0;const dead=blocks.map(()=>new Set());
 function dfs(i,domains,holds){
  if(++visits>cap){capHit=true;return null}
  if(i===blocks.length)return {holds,domains};
  const b=blocks[i];max=Math.max(max,b.from);
  const id=domains.join(",");if(dead[i].has(id))return null;
  const d=domains.map((x,j)=>x&b.allow[j]);
  if(d.some(x=>!x)){dead[i].add(id);deadCount++;return null}
  const end=d.map((x,j)=>map(x,b.sign[j],b.offset[j])),rot=b.len%q,queue=end.slice(rot).concat(end.slice(0,rot));
  max=Math.max(max,b.from+b.len);
  if(!b.zero)return {holds,domains:queue};
  for(const hold of consumeFirst?[false,true]:[true,false]){
    let r;if(hold)r=dfs(i+1,queue,holds.concat(b.from+b.len));
    else {const p=map(queue[0]&~1,-1,0);if(p)r=dfs(i+1,queue.slice(1).concat(p),holds)}
    if(r||capHit)return r;
  }
  dead[i].add(id);deadCount++;return null;
 }
 const result=dfs(0,Array(q).fill(nonzeroStart?ALL&~1:ALL),[]);
 let replay=null;
 if(result){
  const hold=new Set(result.holds),domains=Array(q).fill(nonzeroStart?ALL&~1:ALL),sign=Array(q).fill(1),off=Array(q).fill(0);let j=0;
  for(let i=0;i<c.length;i++){if(hold.has(i))continue;const k=j++%q;domains[k]&=~bit(mod(sign[k]*(c[i]-off[k])));sign[k]*=-1;off[k]=mod(c[i]-off[k]);}
  const seed=domains.map(x=>31-Math.clz32(x&-x));if(seed.some(x=>x<0))throw Error("impossible seed");
  let queue=seed.slice(),plain=[];for(let i=0;i<c.length;i++){if(hold.has(i)){if(c[i])throw Error("nonzero hold");plain.push(0);continue}const p=mod(c[i]-queue[0]);if(!p)throw Error("consuming F");plain.push(p);queue=queue.slice(1).concat(p)}
  queue=seed.slice();const out=plain.map(p=>{if(!p)return 0;const x=mod(p+queue[0]);queue=queue.slice(1).concat(p);return x});if(String(out)!==String(c))throw Error("replay");
  replay={primer:seed,holds:result.holds,holdCount:hold.size,firstPlain:plain.slice(0,30),possiblePrimers:domains.reduce((n,x)=>{let count=0;while(x){x&=x-1;count++}return n*count},1)};
 }
 return {runes:c.length,zeros:c.filter(x=>!x).length,blocks:blocks.length,visits,max,deadCount,reverse,consumeFirst,nonzeroStart,status:result?"legal":capHit?"cap":"exact empty",replay};
}
const cases=[["p0-2",0,3],["p40-53",40,54],["p54-55",54,56]];
for(const [name,a,b] of cases){const c=gp.pages.slice(a,b).flatMap(p=>p.indices);console.log(JSON.stringify({name,...reach(c,{cap:1500000})}));}
const c=gp.pages.slice(40,54).flatMap(p=>p.indices);let start=0,nz=0;while(nz<8)if(c[start++]!==0)nz++;
console.log(JSON.stringify(reach(c.slice(start).reverse(),{reverse:true,cap:2000000,nonzeroStart:true})));console.log(JSON.stringify(reach(c,{consumeFirst:true,cap:2000000})));

// Reverse search yields the old key at each consuming step. Reconstruct the
// actual forward plaintext from the reverse queue head and restore the prefix.
function reverseFull(c){
 let start=0,nz=0;while(nz<8)if(c[start++]!==0)nz++;
 const r=reach(c.slice(start).reverse(),{reverse:true,cap:2000000,nonzeroStart:true});
 if(r.status!=="legal")return r;
 const h=new Set(r.replay.holds.map(i=>c.length-1-i));for(let i=0;i<start;i++)if(c[i]===0)h.add(i);
 const mod=x=>(x+29)%29;let queue=r.replay.primer.slice().reverse(),plain=Array(c.length),terminal=queue.slice();
 for(let i=c.length-1;i>=0;i--){
  if(h.has(i)){if(c[i])throw Error("nonzero hold");plain[i]=0;continue}
  const p=queue.at(-1);if(!p)throw Error("illegal reverse tail");
  plain[i]=p;queue=[mod(c[i]-p),...queue.slice(0,-1)];
 }
 const key=queue.slice();let k=key.slice();const out=plain.map(p=>{if(!p)return 0;const x=mod(p+k[0]);k=k.slice(1).concat(p);return x});
 if(String(out)!==String(c)||String(k)!==String(terminal))throw Error("full forward replay");
 const count=Array(29).fill(0);for(const p of plain)count[p]++;
 const ioc=count.reduce((s,n)=>s+n*(n-1),0)/(plain.length*(plain.length-1));
 return {status:"legal full original inverse",runes:c.length,holdCount:h.size,primer:key,terminal,firstPlain:plain.slice(0,40),ioc,reverseVisits:r.visits,reverseSuffix:r.runes,exactReplay:out.length};
}
console.log(JSON.stringify(reverseFull(c)));
