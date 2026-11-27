'use strict';
// Exact latent-boundary previous-word Euler-totient product prime-origin decoder.
const fs=require('node:fs'), path=require('node:path');
function study(co,tx,native,lex){
 const check=(v,m)=>{if(!v)throw Error(m)},mod=x=>(x%29+29)%29,M=3301;
 const lookup=new Map(co.runes.map((r,i)=>[r,i]));
 const ns=native.sections.map(s=>({name:s.name,words:(s.source_text.match(/[\u16a0-\u16ff]+/gu)||[]).map(w=>[...w].map(c=>lookup.get(c)))}));
 const code=w=>String.fromCharCode(...w),dec=s=>Array.from(s,c=>c.charCodeAt(0));
 const toks=co.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function gp(s){s=s.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U').replace(/[KQ]/g,'C').replace(/Z/g,'S').replace(/ING/g,'NG').replace(/IO/g,'IA');const out=[];while(s){const t=toks.find(t=>s.startsWith(t.s));if(!t)return null;out.push(t.i);s=s.slice(t.s.length)}return out}
 const validSingle=new Set([10,24,3,16]);
 const vocab=new Map();
 for(const l of lex.split(/\r?\n/)){const m=/^([a-z]+) (\d+)$/.exec(l);if(!m)continue;const w=gp(m[1]);if(!w||!w.length||w.length===1&&!validSingle.has(w[0]))continue;const k=code(w);vocab.set(k,Math.max(vocab.get(k)||0,+m[2]));}
 for(const s of ns)for(const w of s.words){const k=code(w);if(!vocab.has(k))vocab.set(k,1);}
 const maxL=Math.max(...[...vocab.keys()].map(w=>w.length));
 const total=[...vocab.values()].reduce((a,b)=>a+b,0);
 const pri=[];
 for(let p=2;pri.length<M+maxL;p++)if(pri.every(q=>q*q>p||p%q!==0))pri.push(p);
 const key=pri.map(p=>(p-1)%29);
 function addPhi(v,seen,x){const b=2**x;return v*(seen&b?co.prime[x]:co.prime[x]-1)%M}
 function phi(w){let v=1,seen=0;for(const x of w){v=addPhi(v,seen,x);seen|=2**x;}return v}
 function enc(w,s,sign){let j=s;return w.map(x=>x===0?0:mod(x+sign*key[j++]));}
 const eq=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
 function trieNode(v=1,seen=0){return {edges:new Int32Array(29).fill(-1),v,seen,score:null}}
 const trie=[trieNode()];
 for(const [s,f] of vocab){let i=0;for(const x of dec(s)){let j=trie[i].edges[x];if(j<0){j=trie.length;trie[i].edges[x]=j;trie.push(trieNode(addPhi(trie[i].v,trie[i].seen,x),trie[i].seen|2**x));}i=j;}trie[i].score=Math.log(f/total);}
 function lexical(c,start,s,sign,emit){
  const p=[];
  function dfs(i,j,node){
   const t=trie[node];if(t.score!==null)emit(i,t.v,p,t.score,0);
   if(i>=c.length||i-start>=maxL)return;
   const x=mod(c[i]-sign*key[j]);
   function go(y,jj){const nn=t.edges[y];if(nn<0)return;p.push(y);dfs(i+1,jj,nn);p.pop();}
   if(c[i]===0)go(0,j);if(x!==0)go(x,j+1)
  }dfs(start,s,0)
 }
 function oov(c,start,s,sign,max,emit){
  const p=[];
  function dfs(i,j,v,seen){
   if(i>start)emit(i,v,p,-12*(i-start),i-start);
   if(i>=c.length||i-start>=max)return;
   const x=mod(c[i]-sign*key[j]);
   function go(y,jj){p.push(y);dfs(i+1,jj,addPhi(v,seen,y),seen|2**y);p.pop();}
   if(c[i]===0)go(0,j);if(x!==0)go(x,j+1)
  }dfs(start,s,1,0)
 }
 function solve(c,sign,budget){
  const states=Array.from({length:c.length+1},()=>new Map());
  for(let s=0;s<M;s++)states[0].set(s,{cost:0,score:0,initial:s,prev:null,word:null});
  let maxPos=0,maxStates=0,totalStates=0,edges=0;
  for(let i=0;i<c.length;i++){
   const row=states[i];if(row.size){maxPos=i;maxStates=Math.max(maxStates,row.size);totalStates+=row.size;}
   for(const [s,r] of row){
    const emit=(end,next,p,score,cost)=>{
     edges++;const k=r.cost+cost;if(k>budget)return;
     const old=states[end].get(next),z=r.score+score;
     if(!old||k<old.cost||(k===old.cost&&z>old.score))states[end].set(next,{cost:k,score:z,initial:r.initial,prev:r,word:p.slice()});
    };
    lexical(c,i,s,sign,emit);
    if(r.cost<budget)oov(c,i,s,sign,budget-r.cost,emit);
   }
   // all useful predecessors persist through the best path chain; obsolete maps are released
   states[i]=null;
  }
  let row=states[c.length];if(row.size)maxPos=c.length;
  if(!row.size)return {complete:false,maxPos,maxStates,totalStates,edges};
  let best=[...row.values()].reduce((a,b)=>b.cost<a.cost||b.cost===a.cost&&b.score>a.score?b:a);
  const cost=best.cost,score=best.score,initial=best.initial,words=[];
  while(best.prev){words.push(best.word);best=best.prev}words.reverse();
  let s=initial,back=[];for(const w of words){back.push(...enc(w,s,sign));s=phi(w)}
  check(eq(back,c),'original replay');
  return {complete:true,maxPos,maxStates,totalStates,edges,finalStates:row.size,cost,scorePerRune:score/c.length,initial,words};
 }
 const controls=[];
 for(const [name,origin,sign] of [["0_warning",1033,1],["0_koan_1",761,-1],["0_loss_of_divinity",229,1]]){
  const p=ns.find(s=>s.name===name).words;let s=origin;const c=p.flatMap(w=>{const e=enc(w,s,sign);s=phi(w);return e});
  const d=solve(c,sign,0);check(d.complete,'plant feasible');
  const truth=p.flat(),got=d.words.flat();let cut=0;const cuts=new Set(d.words.map(w=>cut+=w.length));cut=0;
  controls.push({name,origin,sign,n:c.length,initial:d.initial,scorePerRune:d.scorePerRune,correctRunes:truth.filter((x,i)=>x===got[i]).length,correctCuts:p.filter(w=>cuts.has(cut+=w.length)).length,trueWords:p.length,decodedWords:d.words.length,totalStates:d.totalStates,edges:d.edges});
 }
 const original=[],pages=[0,3,8,15,23,27,33,40,54,56],skip=[13,16,12,20,16,19,10,8,9];
 for(let i=0;i<9;i++){const c=co.pages.slice(pages[i],pages[i+1]).flatMap(p=>p.indices).slice(skip[i]);
  for(const sign of [1,-1]){const d=solve(c,sign,0);const {words,...rest}=d;original.push({page:pages[i],n:c.length,sign,budget:0,...rest,...(words?{decoded:words.map(w=>w.map(x=>co.translit[x]).join('')).join(' ')}:{})});}}
 // budget is fixed, not tuned by original language score; terminal and opening independently.
 for(const page of [54,0,23]){const i=pages.indexOf(page),c=co.pages.slice(page,pages[i+1]).flatMap(p=>p.indices).slice(skip[i]);
  for(const sign of [1,-1]){const d=solve(c,sign,8);const {words,...rest}=d;original.push({page,n:c.length,sign,budget:8,...rest,...(words?{decoded:words.map(w=>w.map(x=>co.translit[x]).join('')).join(' ')}:{})});}}
 return {law:"previous-word phi(product GP primes) mod3301 prime-origin, p56 shift and F hold, inferred word boundaries",vocab:vocab.size,maxL,trieNodes:trie.length,controls,original};
}
if(require.main===module){const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');console.log(JSON.stringify(study(JSON.parse(read('resources/liber-primus/lp2-corpus.json')),read('resources/liber-primus/lp2-transcription.txt'),JSON.parse(read('resources/external/relikd-solved-gp29-native-v1.json')),read('resources/control/english_wordfreq_textblob.txt')),null,2));}
module.exports=study;
