'use strict';
const fs=require('node:fs'),path=require('node:path');
const load=p=>JSON.parse(fs.readFileSync(path.resolve(__dirname,'..',p),'utf8'));
function tile(gp,gate){
 const C=gp.pages.filter(p=>p.page<=55).flatMap(p=>p.indices),mod=x=>(x%29+29)%29,assert=(v,m)=>{if(!v)throw Error(m)};
 const rows=gate.rows.filter(x=>x.chapter===23);assert(rows.length===6&&rows.every((x,i)=>i===0||rows[i-1].end===x.start),"six contiguous strict spans");
 const bound=gate.scope.bound,cap=bound+rows.reduce((s,x)=>s+x.length,0)+2;
 const sieve=new Uint8Array(300000);sieve.fill(1,2);for(let n=2;n*n<sieve.length;n++)if(sieve[n])for(let k=n*n;k<sieve.length;k+=n)sieve[k]=0;
 const primes=[];for(let n=2;n<sieve.length&&primes.length<cap;n++)if(sieve[n])primes.push(n);assert(primes.length===cap,"prime count");
 const all=(1n<<BigInt(cap))-1n,startMask=(1n<<BigInt(bound+1))-1n;
 const range=(lo,hi)=>((1n<<BigInt(hi+1))-1n)^((1n<<BigInt(lo))-1n);
 const count=b=>{let n=0;while(b){b&=b-1n;n++}return n},first=b=>b?(b&(-b)).toString(2).length-1:null,has=(b,j)=>Boolean((b>>BigInt(j))&1n);
 const prefix=rows[0].start,prefixF=C.slice(0,prefix).filter(x=>x===0).length,sourceMin=prefix-prefixF,sourceMax=3301+prefix;
 const results=[];
 for(const s of [1,-1]){
   const forbid=Array(29).fill(0n);for(let j=0;j<cap;j++)forbid[mod(s*(primes[j]-1))]|=1n<<BigInt(j);
   const allowed=forbid.map(b=>all^b);
   function edges(c){let b=[all];for(let i=c.length-1;i>=0;i--){const x=c[i],n=Array(b.length+(x===0?1:0)).fill(0n);for(let h=0;h<b.length;h++){n[h]|=(b[h]>>1n)&allowed[x];if(x===0)n[h+1]|=b[h]}b=n}return b.map((b,h)=>({d:c.length-h,mask:b&startMask})).filter(e=>e.mask)}
   function endpoint(c,start){let front=new Set([start]);for(const x of c){const next=new Set();for(const j of front){if(x===0)next.add(j);if(mod(x-s*(primes[j]-1))!==0)next.add(j+1)}front=next;if(!front.size)break}return [...front].sort((a,b)=>a-b)}
   const spans=rows.map((r,i)=>{const c=C.slice(r.start,r.end),e=edges(c);const union=e.reduce((b,e)=>b|e.mask,0n);assert(count(union)===r.results.find(x=>x.sign===s).starts,"edge starts agree with gate");for(const start of [0,first(union),3301,sourceMin,sourceMax,bound]){const exact=endpoint(c,start),pred=e.filter(x=>has(x.mask,start)).map(x=>start+x.d).sort((a,b)=>a-b);assert(exact.join()===pred.join(),"edge endpoint oracle")}return {i,c,e,starts:count(union),edgeCount:e.reduce((n,x)=>n+count(x.mask),0)}});
   function adv(b,span){let z=0n;for(const e of span.e)z|=(b&e.mask)<<BigInt(e.d);return z}
   function recover(order,history,end){let states=[end];for(let t=order.length-1;t>=0;t--){const span=spans[order[t]],e=span.e.find(x=>end>=x.d&&has(history[t]&x.mask,end-x.d));assert(e,"edge witness");end-=e.d;states.unshift(end)}
    let pAll=[],cAll=[];for(let t=0;t<order.length;t++){const c=spans[order[t]].c,start=states[t],stop=states[t+1],layers=[new Map([[start,null]])];for(const x of c){const old=layers.at(-1),next=new Map();for(const j of old.keys()){if(x===0&&!next.has(j))next.set(j,{p:0,j});const p=mod(x-s*(primes[j]-1));if(p!==0&&!next.has(j+1))next.set(j+1,{p,j})}layers.push(next)}
     let j=stop,p=[];for(let i=c.length;i>0;i--){const q=layers[i].get(j);assert(q,"plain witness");p.unshift(q.p);j=q.j}assert(j===start,"initial witness");let cur=start;const replay=p.map(x=>x===0?0:mod(x+s*(primes[cur++]-1)));assert(cur===stop&&replay.join()===c.join(),"exact forward replay");pAll.push(...p);cAll.push(...c)}
    return {order,states,plaintext:pAll.map(x=>gp.translit[x]).join(" "),plainIndices:pAll,cipherIndices:cAll}
   }
   function solve(initial){let attempted=0,feasible=0,totalEndOrderPairs=0,possibleStartsForExample=[],witnesses=[],orders=[];function dfs(order,history,left){const b=history.at(-1);if(!b)return;if(!left.length){feasible++;const endpoints=count(b);totalEndOrderPairs+=endpoints;orders.push({order,endpoints});if(witnesses.length<2){const w=recover(order,history,first(b));witnesses.push(w)}return}for(const i of left){attempted++;dfs(order.concat(i),history.concat(adv(b,spans[i])),left.filter(x=>x!==i))}}dfs([],[initial],spans.map(x=>x.i));return {attempted,feasible,totalEndOrderPairs,witnesses,orders}}
   results.push({sign:s,spans:spans.map(({i,starts,edgeCount})=>({i,starts,edgeCount})),relaxed:solve(startMask),absolutePrefixBound:solve(range(sourceMin,sourceMax))});
 }
 return {chapter:"p23–26",spanOffsets:rows.map(x=>[x.start,x.end]),scope:{bound,cap,totalRunes:rows.reduce((n,x)=>n+x.length,0),prefix,prefixF,sourceMin,sourceMax},results};
}
console.log(JSON.stringify(tile(load("resources/liber-primus/lp2-corpus.json"),load("im-results/lp2-clause-prime-absolute-origin-output.json")),null,2));
