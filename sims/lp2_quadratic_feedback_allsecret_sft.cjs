"use strict";
// Usage: node sims/lp2_quadratic_feedback_allsecret_sft.cjs <compiled C++20 executable>
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const {spawnSync}=require("node:child_process");
const root=path.resolve(__dirname,".."),read=p=>fs.readFileSync(path.join(root,p),"utf8");
const gp=JSON.parse(read("resources/liber-primus/lp2-corpus.json")),exe=path.resolve(process.argv[2]),Q=29,mod=x=>(x%29+29)%29;
const pages=gp.pages.filter(p=>p.page>=40&&p.page<=53&&p.indices.length).map(p=>p.indices);
assert.deepEqual(pages[0].slice(0,8),[0,9,19,26,6,23,25,8]);pages[0]=pages[0].slice(8);const C=pages.flat();
assert.equal(C.length,3000);assert.equal(C.filter(c=>!c).length,124);
function scan(tape,model,clock="continuous",emit=false){
 const input=tape.map(x=>x.toString(29)).join("")+"\n"+(clock==="pages"?pages.map(p=>p.length).join(" ")+"\n":"");
 const p=spawnSync(exe,[model,clock,emit?"emit":"summary"],{input,encoding:"utf8",maxBuffer:8*1024*1024});
 if(p.error)throw p.error;if(p.status!==0)throw Error(p.stderr);
 const lines=p.stdout.trim().split("\n").map(JSON.parse),summary=lines.pop();return {summary,candidates:lines};
}
const original=[];
for(const model of ["ordinal-c","prime-c","prime-p","autonomous"])for(const clock of model==="autonomous"?["continuous"]:["continuous","pages"]){const r=scan(C,model,clock).summary;assert.equal(r.nontrivial,0);assert.equal(r.survivors,model==="autonomous"?812:0);original.push(r);}
let prefix=0,count=0;while(count<29){count+=Number(C[prefix]!==0);prefix++;}
const h=Array(Q).fill(0);for(const c of C.slice(prefix))h[c]++;
const autonomousTop2=prefix+h.sort((a,b)=>b-a).slice(0,2).reduce((a,b)=>a+b,0);assert.equal(autonomousTop2,273);
const tokens=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
function native(s){const a=[];for(const w of s.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").match(/[A-Z]+/g)||[]){for(let i=0;i<w.length;){if(w.startsWith("ING",i)){a.push(21);i+=3}else if(w.startsWith("IO",i)){a.push(27);i+=2}else{const t=tokens.find(x=>w.startsWith(x.s,i));if(!t)throw Error(w);a.push(t.i);i+=t.s.length}}}return a}
const ds=["resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt"].map(p=>native(read(p)));
function train(ds){const h1=new Float64Array(Q).fill(.2),h2=new Float64Array(Q*Q).fill(.2),h3=new Float64Array(Q*Q*Q).fill(.2);for(const d of ds)for(let i=0;i<d.length;i++){h1[d[i]]++;if(i>0)h2[d[i-1]*Q+d[i]]++;if(i>1)h3[(d[i-2]*Q+d[i-1])*Q+d[i]]++}function norm(h){for(let at=0;at<h.length;at+=Q){let sum=0;for(let k=0;k<Q;k++)sum+=h[at+k];for(let k=0;k<Q;k++)h[at+k]=Math.log(h[at+k]/sum)}}norm(h1);norm(h2);norm(h3);return {h1,h2,h3}}
const lm=train([ds[0].slice(0,40000),ds[1].slice(0,150000)]);
function send(P,key){let [u,v,a,b,d,s]=key;const ia=Array.from({length:29},(_,i)=>i).find(i=>i*a%29===1);return P.map(p=>{if(!p)return 0;const c=mod(ia*(p-b*s-d));s=mod(s*s+u*gp.prime[p]+v);return c})}
function decode(C,key,initial=null,trace=false){const [u,v,a,b,d]=key,T=Array.from({length:Q},(_,s)=>gp.prime.map(p=>mod(s*s+u*p+v)));let dp=new Map(),backs=[];if(initial===null){for(let s=0;s<Q;s++)dp.set(s*900+29*30+29,0)}else dp.set(initial,0);for(const c of C){const next=new Map(),back=trace?new Map():null;for(const [id,score] of dp){const s=Math.floor(id/900),r=id%900,x=Math.floor(r/30),y=r%30;function step(p,t){const sc=score+(x<29?lm.h3[(x*Q+y)*Q+p]:y<29?lm.h2[y*Q+p]:lm.h1[p]),nid=t*900+y*30+p;if(sc>(next.get(nid)??-Infinity)){next.set(nid,sc);if(back)back.set(nid,id)}}if(c===0)step(0,s);const p=mod(a*c+b*s+d);if(p!==0)step(p,T[s][p])}if(!next.size)return null;dp=next;if(back)backs.push(back)}let end=null,best=-Infinity;for(const [id,score] of dp)if(score>best){best=score;end=id}const out={score:best,end};if(trace){let id=end,P=[];for(let i=backs.length-1;i>=0;i--){P.push(id%30);id=backs[i].get(id)}out.P=P.reverse();out.start=Math.floor(id/900)}return out}
const controls=[];
for(const [id,offset,key] of [[0,55000,[15,17,7,13,5,24]],[1,190000,[22,7,13,6,19,9]]]){
 const P=ds[id].slice(offset,offset+3000),cipher=send(P,key),sc=scan(cipher.slice(0,1200),"prime-p","continuous",true);
 const scores=sc.candidates.map(o=>({k:o.key,r:decode(cipher.slice(0,1200),o.key)})).filter(x=>x.r).sort((a,b)=>b.r.score-a.r.score);
 const selected=scores[0].k,a=decode(cipher.slice(0,1200),selected,null,true),b=decode(cipher.slice(1200),selected,a.end,true);
 assert.deepEqual([...selected,a.start],key);const out=a.P.concat(b.P);assert.deepEqual(send(out,[...selected,a.start]),cipher);
 const result={id,offset,planted:key,selected,seed:a.start,trainMatches:a.P.filter((x,i)=>x===P[i]).length,heldMatches:b.P.filter((x,i)=>x===P[i+1200]).length,replay:3000,trainScore:a.score/1200,heldScore:b.score/1800,survivors:scores.length,scan:sc.summary};
 assert.equal(result.trainMatches,id===0?1193:1200);assert.equal(result.heldMatches,id===0?1762:1800);controls.push(result);
}
console.log(JSON.stringify({original,autonomousTop2,prefix,controls},null,2));
