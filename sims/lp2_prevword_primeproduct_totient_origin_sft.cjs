'use strict';
// Exact prior-plaintext-word Euler-totient product prime-origin decoder.
const fs=require('node:fs'), path=require('node:path');
function study(co,tx,native){
 const check=(v,m)=>{if(!v)throw Error(m)},mod=x=>(x%29+29)%29,M=3301;
 const lookup=new Map(co.runes.map((r,i)=>[r,i]));
 let words=[],w=[];
 for(const c of tx.split('%').slice(0,55).join('%')){
  if(lookup.has(c))w.push(lookup.get(c));
  else if(!'%/'.includes(c)&&!/\s/u.test(c)&&w.length){words.push(w);w=[]}
 }
 if(w.length)words.push(w);
 check(words.length===2896&&JSON.stringify(words.flat())===JSON.stringify(co.pages.slice(0,56).flatMap(p=>p.indices)),'canonical input');
 const maxL=Math.max(...words.map(x=>x.length),...native.sections.flatMap(s=>(s.source_text.match(/[\u16a0-\u16ff]+/gu)||[]).map(w=>w.length)));
 const primes=[];
 for(let p=2;primes.length<M+maxL;p++)if(primes.every(q=>q*q>p||p%q!==0))primes.push(p);
 const key=primes.map(p=>(p-1)%29);
 function phi(w){
  let seen=0,v=1;
  for(const x of w){const b=2**x;v=v*(seen&b?co.prime[x]:co.prime[x]-1)%M;seen|=b;}
  return v;
 }
 function exactPhi(w){let p=1n;const seen=new Set();for(const x of w){p*=BigInt(seen.has(x)?co.prime[x]:co.prime[x]-1);seen.add(x);}return Number(p%BigInt(M))}
 function enc(w,s,sign){let j=s;return w.map(x=>x===0?0:mod(x+sign*key[j++]));}
 const eq=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
 function branches(c,s,sign,cb){const p=[];
  function dfs(i,j,seen,v){
   if(i===c.length){cb(p,v);return}
   const x=mod(c[i]-sign*key[j]);
   function go(y,jj){const b=2**y;p.push(y);dfs(i+1,jj,seen|b,v*(seen&b?co.prime[y]:co.prime[y]-1)%M);p.pop();}
   if(c[i]===0)go(0,j);if(x!==0)go(x,j+1);
  }dfs(0,s,0,1)
 }
 const ns=native.sections.map(s=>({name:s.name,words:(s.source_text.match(/[\u16a0-\u16ff]+/gu)||[]).map(w=>[...w].map(c=>lookup.get(c)))}));
 const p56=ns.find(s=>s.name==="p56_an_end").words.flat();
 check(eq(enc(p56,0,1),co.pages[56].indices),'actual p56');
 check(words.every(w=>phi(w)===exactPhi(w)),'totient arithmetic');
 const full=Array.from({length:M},(_,i)=>i);
 function train(excluded){const counts=Array.from({length:30},()=>Array(30).fill(0.2));
  for(const s of ns)if(s.name!==excluded)for(const w of s.words){let a=29;for(const x of [...w,29]){counts[a][x]++;a=x;}}
  const log=counts.map(r=>{const sum=r.reduce((a,b)=>a+b,0);return r.map(x=>Math.log(x/sum))});
  return w=>{let z=0,a=29;for(const x of [...w,29]){z+=log[a][x];a=x}return z};
 }
 function decode(c,sign,score,truth){
  let st=new Map(full.map(s=>[s,{score:0,initial:s,prev:null,w:null,count:1n}]));
  let peak=st.size,n=0,completed=0,truthState=truth?.origin;
  const history=[];
  for(let i=0;i<c.length;i++){
   const dst=new Map();
   for(const [s,rec] of st)branches(c[i],s,sign,(p,t)=>{
    const val=rec.score+score(p),prior=dst.get(t),count=(prior?.count||0n)+rec.count;
    if(!prior||val>prior.score)dst.set(t,{score:val,initial:rec.initial,prev:rec,w:p.slice(),count});
    else prior.count=count;
   });
   if(truth){check(st.has(truthState),'plant previous state');let found=false;branches(c[i],truthState,sign,(p,t)=>{if(eq(p,truth.words[i])){check(t===phi(p),'plant phi');found=true;truthState=t}});check(found&&dst.has(truthState),'truth branch');}
   history.push(dst.size);
   if(!dst.size)return {complete:false,completedWords:completed,completedRunes:n,firstDeadWord:i,peak,history};
   st=dst;peak=Math.max(peak,st.size);n+=c[i].length;completed++;
  }
  let best=[...st.values()].reduce((a,b)=>a.score>b.score?a:b);
  const total=[...st.values()].reduce((a,b)=>a+b.count,0n).toString();
  const initial=best.initial,scoreValue=best.score,decoded=[];
  while(best.prev){decoded.push(best.w);best=best.prev}decoded.reverse();
  let s=initial;for(let i=0;i<c.length;i++){check(eq(enc(decoded[i],s,sign),c[i]),'candidate replay');s=phi(decoded[i])}
  return {complete:true,completedWords:completed,completedRunes:n,peak,finalStates:st.size,paths:total,initial,scorePerRune:scoreValue/n,decoded,history};
 }
 const offsets=[0];for(const p of co.pages.slice(0,56))offsets.push(offsets.at(-1)+p.indices.length);
 const cuts=[0,3,8,15,23,27,33,40,54,56].map(i=>offsets[i]);
 let total=0;const start=new Map([[0,0]]);words.forEach((w,i)=>{total+=w.length;start.set(total,i+1)});
 check(cuts.every(c=>start.has(c)),'chapter cuts');
 const controls=[];
 for(const [name,origin,sign] of [["0_warning",1033,1],["0_koan_1",761,-1],["0_loss_of_divinity",229,1]]){
  const p=ns.find(s=>s.name===name).words;let s=origin;const c=p.map(w=>{const e=enc(w,s,sign);s=phi(w);return e});
  const d=decode(c,sign,train(name),{origin,words:p});check(d.complete,'plant feasible');
  const a=d.decoded.flat(),b=p.flat();controls.push({name,origin,sign,n:b.length,recoveredOrigin:d.initial,recoveredRunes:a.filter((x,i)=>x===b[i]).length,paths:d.paths,scorePerRune:d.scorePerRune});
 }
 const original=[];
 for(let i=0;i+1<cuts.length;i++){
  const page=[0,3,8,15,23,27,33,40,54][i],c=words.slice(start.get(cuts[i]),start.get(cuts[i+1]));
  for(const sign of [1,-1]){const d=decode(c,sign,train(null));const {decoded,history,...summary}=d;original.push({page,sign,n:c.flat().length,words:c.length,...summary, ...(decoded?{plaintext:decoded.map(w=>w.map(x=>co.translit[x]).join('')).join(' ')}:{}),history});}
 }
 return {law:"s_next=phi(product GP primes of recovered word) mod3301; p56 prime-minus-one at prime ordinal s, literal F holds; all 3301 incoming states",canonicalRunes:total,canonicalWords:words.length,realP56:85,controls,original};
}
if(require.main===module){const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');console.log(JSON.stringify(study(JSON.parse(read('resources/liber-primus/lp2-corpus.json')),read('resources/liber-primus/lp2-transcription.txt'),JSON.parse(read('resources/external/relikd-solved-gp29-native-v1.json'))),null,2));}
module.exports=study;
