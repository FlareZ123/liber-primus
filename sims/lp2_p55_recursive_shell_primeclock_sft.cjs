"use strict";
// Frozen p55 recursive physical-row perimeter prime clock. Agent39, 2026-11-27.
function run(corpus,source,reference) {
 const mod=x=>(x%29+29)%29,eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b),check=(v,m)=>{if(!v)throw Error(m)};
 const idx=new Map(corpus.runes.map((c,i)=>[c,i]));
 const raw=source.split("%");check(raw.length===57,"page count");raw.splice(50,0,"");
 const rows=raw.map(s=>s.split(/[\n/]/).map(l=>[...l].filter(c=>idx.has(c)).map(c=>idx.get(c))).filter(l=>l.length));
 for(let i=0;i<58;i++)check(eq(rows[i].flat(),corpus.pages[i].indices),"source p"+i);
 const tok=corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 const gp=s=>s.toUpperCase().replace(/V/g,"U").replace(/K/g,"C").match(/[A-Z]+/g).flatMap(w=>{let a=[];while(w.length){let t=tok.find(x=>w.startsWith(x.s));if(!t){w=w.slice(1);continue}a.push(t.i);w=w.slice(t.s.length)}return a});
 const p56=gp("AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE");
 const primes=[];for(let n=2;primes.length<400;n++){if(primes.every(p=>p*p>n||n%p))primes.push(n)}
 const k=primes.map(p=>(p-1)%29);
 function route(lens){let a=[],off=0;for(const n of lens){a.push(Array.from({length:n},(_,i)=>off+i));off+=n}let order=[],rings=[];
 while(a.length){const ring=[];ring.push(...a.shift());if(a.length){const bottom=a.pop();for(const row of a)if(row.length)ring.push(row.pop());ring.push(...bottom.reverse());for(let i=a.length-1;i>=0;i--)if(a[i].length)ring.push(a[i].shift())}a=a.filter(row=>row.length);rings.push(ring.length);order.push(...ring)}
 check(order.length===off&&new Set(order).size===off,"route");return {order,rings}}
 function encrypt(p,order,hold=true){let c=Array(p.length),j=0;for(let i of order)c[i]=hold&&p[i]===0?0:mod(p[i]+k[j++]);return c}
 function decode(c,order,hold=true){let paths=[{p:Array(c.length),j:0}],counts=[],death=null;for(let i of order){let next=[];for(let s of paths){const p=mod(c[i]-k[s.j]);if(!hold||p!==0){let a=s.p.slice();a[i]=p;next.push({p:a,j:s.j+1})}if(hold&&c[i]===0){let a=s.p.slice();a[i]=0;next.push({p:a,j:s.j})}}if(!next.length)death={traversal_offset:counts.length,physical_offset:i,cipher:c[i],previous_states:paths.map(s=>({clock:s.j,shift:k[s.j]}))};paths=next;counts.push(paths.length);if(!paths.length)break}
 for(const s of paths)check(eq(encrypt(s.p,order,hold),c),"forward replay");return {paths,counts,death}}
 const train=gp(reference.split("### 56")[0].replace(/^#.*$/gm,"").replace(/\[[^\]]*\]/g,"").replace(/\([^)]*\)/g,""));
 const counts=Array(29**3).fill(0),ctx=Array(29**2).fill(0);for(let i=2;i<train.length;i++){let a=train[i-2]*29+train[i-1];counts[a*29+train[i]]++;ctx[a]++}
 const score=p=>p.slice(2).reduce((s,b,i)=>{let a=p[i]*29+p[i+1];return s+Math.log((counts[a*29+b]+.25)/(ctx[a]+29*.25))},0)/(p.length-2);
 const pretty=p=>p.map(x=>corpus.translit[x]).join(" ");
 const identity=p=>p.map((_,i)=>i);
 check(eq(encrypt(p56,identity(p56)),corpus.pages[56].indices),"authentic p56 exact replay");
 let out={train:train.length,p56_control:{runes:p56.length,exact:true,truth_score:score(p56)}};
 const target=corpus.pages[55].indices, r=route(rows[55].map(x=>x.length));out.geometry={lengths:rows[55].map(x=>x.length),...r};
 out.plants=[p56.slice(0,76),corpus.pages[57].indices.slice(0,76)].map((p,i)=>{let c=encrypt(p,r.order),d=decode(c,r.order),ss=d.paths.sort((a,b)=>score(b.p)-score(a.p));let rank=ss.findIndex(a=>eq(a.p,p));check(rank>=0,"planted inverse");return {id:i,paths:ss.length,true_rank:rank+1,truth_score:score(p),best_score:score(ss[0].p),recovered_top:eq(ss[0].p,p),cipher_zeros:c.filter(x=>x===0).length}});
 out.original=[true,false].map(hold=>{let d=decode(target,r.order,hold);let ss=d.paths.sort((a,b)=>score(b.p)-score(a.p));return {hold,paths:ss.length,legal_prefix:d.counts.filter(x=>x>0).length,max_states:Math.max(...d.counts),death:d.death,best_score:ss.length?score(ss[0].p):null,top:ss.slice(0,3).map(s=>({score:score(s.p),text:pretty(s.p),runes:s.p}))}});
 return out
}
if(typeof module!=="undefined")module.exports=run;
if(typeof require!=="undefined"&&require.main===module){const fs=require("node:fs"),path=require("node:path"),root=path.resolve(__dirname,"..");const read=p=>fs.readFileSync(path.join(root,p),"utf8");console.log(JSON.stringify(run(JSON.parse(read("resources/liber-primus/lp2-corpus.json")),read("resources/transcriptions/lp2-image-corrected.txt"),read("resources/liber-primus/lp1-plaintext-reference.txt")),null,2))}
