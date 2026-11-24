'use strict';
const fs=require('node:fs');
function experiment(gp,raws){
const ranges=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
const table=Object.entries(gp.translit).map(([i,x])=>[x,+i]).sort((a,b)=>b[0].length-a[0].length);
function tokenize(s){const out=[];for(let word of s.toUpperCase().match(/[A-Z]+/g)||[]){word=word.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");while(word.length){const q=table.find(([x])=>word.startsWith(x));if(!q)throw Error("token "+word);out.push(q[1]);word=word.slice(q[0].length)}}return out}
const donors=raws.map(tokenize);
function encode(a){let k=0;for(const x of a)k=k*29+x;return k}
function decode(k,b){let a=Array(b);for(let i=b-1;i>=0;i--){a[i]=k%29;k=Math.floor(k/29)}return a}
function potential(c,b){
const counts=new Map;
for(let start=0;start<c.length;start++){
const found=new Set;
function dfs(i,d,key){if(d===b){found.add(key);return}for(let j=i;j<c.length;j++){dfs(j+1,d+1,key*29+c[j]);if(c[j]!==0)break}}
dfs(start+1,1,c[start]);for(const k of found)counts.set(k,(counts.get(k)||0)+1)
}
return counts;
}
function maxType(c,t,b){const a=decode(t,b),n=b*2;let v=new Int32Array(n).fill(-100000),w=new Int32Array(n);v[1]=0;for(let j=1;j<b;j++)v[j*2]=0;for(const x of c){w.fill(-100000);if(x===0)w.set(v);for(let j=0;j<b;j++)for(let m=0;m<2;m++){const val=v[j*2+m];if(val<0)continue;const ok=m===1&&x===a[j],next=j+1===b?1:(j+1)*2+Number(ok),score=val+Number(j+1===b&&ok);if(score>w[next])w[next]=score}[v,w]=[w,v]}return Math.max(...v)}
function caps(c,b){const raw=potential(c,b),ex=[];for(const [k,n] of raw){let cap=n===1?1:maxType(c,k,b);if(cap>n)throw Error("cap");if(cap>0)ex.push(cap)}ex.sort((a,b)=>b-a);return {rawTypes:raw.size,max:ex[0]||0,coll:ex.reduce((s,n)=>s+n*(n-1)/2,0),rawColl:[...raw.values()].reduce((s,n)=>s+n*(n-1)/2,0)}}
function hist(a,b,phase){const h=new Map;for(let i=phase;i+b<=a.length;i+=b){const k=encode(a.slice(i,i+b));h.set(k,(h.get(k)||0)+1)}const vals=[...h.values()];return {n:Math.floor((a.length-phase)/b),coll:vals.reduce((s,n)=>s+n*(n-1)/2,0),max:Math.max(...vals,0)}}
let seed=0x31920514;function rand(n){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)%n}
let brute=0;
for(const b of [3,5])for(let trial=0;trial<80;trial++){const c=Array.from({length:9+rand(7)},()=>rand(4));const raw=potential(c,b);const zs=c.map((x,i)=>x===0?i:-1).filter(i=>i>=0);const exact=new Map;for(let mask=0;mask<2**zs.length;mask++){const skip=new Set(zs.filter((_,i)=>((mask>>>i)&1)===1)),a=c.filter((_,i)=>!skip.has(i));for(let phase=0;phase<b;phase++){const h=new Map;for(let i=phase;i+b<=a.length;i+=b){let k=encode(a.slice(i,i+b));h.set(k,(h.get(k)||0)+1)}for(const [k,n] of h)exact.set(k,Math.max(exact.get(k)||0,n));}}for(const [k,n] of raw){if(maxType(c,k,b)!==(exact.get(k)||0))throw Error("brute disagreement");brute++}}
const results=[];
for(const [lo,hi] of ranges){const c=gp.pages.filter(p=>p.page>=lo&&p.page<=hi).flatMap(p=>p.indices);for(const b of [3,5]){const q=caps(c,b),r=[];for(const d of donors)for(let j=0;j<32;j++){const offset=Math.round(j*(d.length-c.length)/31),a=d.slice(offset,offset+c.length).filter(x=>x!==0),hs=Array.from({length:b},(_,phase)=>hist(a,b,phase)),minColl=Math.min(...hs.map(x=>x.coll)),minMax=Math.min(...hs.map(x=>x.max)),pass=hs.some(h=>h.coll<=q.coll&&h.max<=q.max);r.push({minColl,minMax,pass})}results.push({pages:[lo,hi],b,n:c.length,zero:c.filter(x=>x===0).length,...q,donorColl:[Math.min(...r.map(x=>x.minColl)),Math.max(...r.map(x=>x.minColl))],donorMax:[Math.min(...r.map(x=>x.minMax)),Math.max(...r.map(x=>x.minMax))],survive:r.filter(x=>x.pass).length})}}
const whole=gp.pages.filter(p=>p.page<=55).flatMap(p=>p.indices),total=whole.length,chapters=ranges.map(([lo,hi])=>gp.pages.filter(p=>p.page>=lo&&p.page<=hi).reduce((n,p)=>n+p.indices.length,0)),book=[];
for(const b of [3,5]){const q=caps(whole,b),independent=results.filter(x=>x.b===b).reduce((s,x)=>s+x.coll,0),r=[];for(const d of donors)for(let j=0;j<32;j++){const offset=Math.round(j*(d.length-total)/31),p=d.slice(offset,offset+total),a=p.filter(x=>x!==0),hs=Array.from({length:b},(_,phase)=>hist(a,b,phase));let k=0,ind=0;for(const n of chapters){const v=p.slice(k,k+n).filter(x=>x!==0);k+=n;ind+=Math.min(...Array.from({length:b},(_,phase)=>hist(v,b,phase).coll))}r.push({minColl:Math.min(...hs.map(h=>h.coll)),minMax:Math.min(...hs.map(h=>h.max)),ind,pass:hs.some(h=>h.coll<=q.coll&&h.max<=q.max)})}book.push({b,...q,independent,donorColl:[Math.min(...r.map(x=>x.minColl)),Math.max(...r.map(x=>x.minColl))],donorIndependent:[Math.min(...r.map(x=>x.ind)),Math.max(...r.map(x=>x.ind))],sharedSurvive:r.filter(x=>x.pass).length,independentSurvive:r.filter(x=>x.ind<=independent).length})}
return {brute,donorLengths:donors.map(x=>x.length),results,book};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/gibran_prophet_58585.txt"];
const contents=paths.map(p=>fs.readFileSync(p,'utf8'));
console.log(JSON.stringify(experiment(JSON.parse(contents[0]),contents.slice(1)),null,2));
