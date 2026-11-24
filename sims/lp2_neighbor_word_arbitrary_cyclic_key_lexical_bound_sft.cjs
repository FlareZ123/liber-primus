'use strict';
// Exact arbitrary private cyclic-key periods: forward/backward whole-word autokey.
// The original word boundary and length-preserving GP29 assumptions are explicit.
const fs=require('node:fs');
const path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
function experiment(corpus,trans,solved,lextext){
 const idx=new Map(corpus.runes.map((r,i)=>[r,i])),words=[];let w=[];
 for(const c of trans.split('%').slice(0,55).join('%')){if(idx.has(c))w.push(idx.get(c));else if(!'%/'.includes(c)&&!/\s/u.test(c)&&w.length){words.push(w);w=[];}}if(w.length)words.push(w);
 const key=p=>String.fromCharCode(...p),mod=x=>(x+29)%29;
 const check=(v,msg)=>{if(!v)throw Error(msg)};
 check(words.length===2896&&JSON.stringify(words.flat())===JSON.stringify(corpus.pages.slice(0,56).flatMap(p=>p.indices)),'source tape');
 const tok=corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function encode(s){s=s.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U').replace(/[KQ]/g,'C').replace(/Z/g,'S').replace(/ING/g,'NG').replace(/IO/g,'IA');const p=[];while(s.length){const m=tok.find(t=>s.startsWith(t.s));if(!m)return null;p.push(m.i);s=s.slice(m.s.length);}return p;}
 const donors=solved.sections.map(s=>(s.source_text.match(/[\u16a0-\u16ff]+/gu)||[]).map(w=>[...w].map(c=>idx.get(c))));
 const base=new Map();for(const l of lextext.split(/\r?\n/)){const m=/^([a-z]+) (\d+)$/.exec(l);if(m){const p=encode(m[1]);if(p)base.set(key(p),p);}}
 function vocab(exclude=-1){const v=new Map(base);for(let j=0;j<donors.length;j++)if(j!==exclude)for(const p of donors[j])v.set(key(p),p);return v;}
 const lex=vocab();check(lex.size===29081,'lexicon');
 function buckets(v){const by=Array.from({length:Math.max(...words.map(w=>w.length))+1},()=>[]);for(const p of v.values())if(p.length<by.length)by[p.length].push(p);return by;}
 const by=buckets(lex);
 // A compatible plaintext fixes the residues in a private key of length L.
 // Unknown residues, key identities, and all inter-word constraints are free.
 function compatible(c,p,L,hold){let t=0,m=Array(L).fill(-1);for(let i=0;i<c.length;i++){if(hold&&p[i]===0){if(c[i]!==0)return false;continue;}const s=t++%L,v=mod(c[i]-p[i]);if(m[s]!==-1&&m[s]!==v)return false;m[s]=v;}return true;}
 function emit(p,k,hold){let t=0;return p.map(x=>hold&&x===0?0:(x+k[t++%k.length])%29)}
 const render=p=>p.map(x=>corpus.translit[x]).join("");
 const bounds=[0];for(const p of corpus.pages.slice(0,56))bounds.push(bounds.at(-1)+p.indices.length);
 const offsets=[0];for(const w of words)offsets.push(offsets.at(-1)+w.length);
 const pageAt=o=>bounds.findIndex(b=>b>o)-1;
 const AN=[24,9];check(JSON.stringify(donors[7][0])===JSON.stringify(AN),'AN');
 const results=[],failsets={};
 for(const direction of [-1,1])for(const hold of [false,true]){
  const fail=[],perLen={},nontrivial=[];let localTested=0;
  for(let i=0;i<words.length;i++){
   const c=words[i],L=words[i+direction]?.length??(i===words.length-1&&direction===1?AN.length:null);
   if(L===null)continue;
   const start=Math.min(i,i+direction),end=Math.max(i,i+direction);
   const local=start>=0&&end<words.length&&pageAt(offsets[start])===pageAt(offsets[end+1]-1);
   if(local)localTested++;
   const n=by[c.length].filter(p=>compatible(c,p,L,hold)).length;
   if(c.length>L)nontrivial.push(i);
   if(n===0){check(c.length>L,'failure with unconstrained key length');fail.push({i,page:pageAt(offsets[i]),runes:c.length,keylen:L,word:render(c),cipher:c,local});perLen[c.length]=(perLen[c.length]??0)+1;}
  }
  failsets[`${direction}:${hold}`]=new Set(fail.map(x=>x.i));
  const local=fail.filter(x=>x.local);
  results.push({direction,hold,tested:direction===1?words.length:words.length-1,nontrivial:nontrivial.length,fail:fail.length,failRuneCount:fail.reduce((a,x)=>a+x.runes,0),failLong:fail.filter(x=>x.runes>=4).length,localTested,localFail:local.length,pagesWithLocalFailure:new Set(local.map(x=>x.page)).size,perLen,byChapter:[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]].map(([a,b])=>({p:[a,b],fail:fail.filter(x=>x.page>=a&&x.page<=b).length,localFail:local.filter(x=>x.page>=a&&x.page<=b).length,groups:words.filter((w,i)=>pageAt(offsets[i])>=a&&pageAt(offsets[i])<=b).length})),first:fail.slice(0,3),last:fail.slice(-3)});
 }
 const intersection=[false,true].map(hold=>({hold,fail:[...failsets[`-1:${hold}`]].filter(i=>failsets[`1:${hold}`].has(i)).length}));
 // Target-excluded lexicon calibration: all native words, no target-only donor entries.
 const controls=donors.map((ws,section)=>{
  let out={section,words:ws.length,lexicon:vocab(section).size};const vv=vocab(section),bb=buckets(vv);
  for(const direction of [-1,1])for(const hold of [false,true]){
   const f=Array.from({length:29},(_,x)=>(x*x+17*x+3)%29);let n=0,tested=0,forced=0,oov=0;
   for(let i=0;i<ws.length;i++){
    const k=ws[i+direction];if(!k)continue;const p=ws[i],c=emit(p,k.map(x=>f[x]),hold);
    check(compatible(c,p,k.length,hold),'true plant rejected');
    const known=vv.has(key(p));if(!known)oov++;
    const has=bb[p.length]?.some(q=>compatible(c,q,k.length,hold))??false;
    if(!has)forced++;
    check(!known||has,'known donor rejected');n+=p.length;tested++;
   }
   out[`${direction}:${hold}`]={runes:n,tested,forced,oov};
  }
  return out;
 });
 // Exact terminal AN seeded global arbitrary stationary map; no injectivity assumption.
 function apply(c,p,k,table){let t=0,m=table.slice();for(let i=0;i<c.length;i++){if(p[i]===0){if(c[i]!==0)return null;continue;}const s=k[t++%k.length],v=mod(c[i]-p[i]);if(m[s]!==-1&&m[s]!==v)return null;m[s]=v;}return m;}
 let states=[{k:AN,m:Array(29).fill(-1)}];const terminal=[];
 for(let j=words.length-1;j>=words.length-3;j--){const c=words[j],out=new Map();for(const s of states){for(const p of by[c.length]){const m=apply(c,p,s.k,s.m);if(!m)continue;const id=key(p)+"/"+m.join(",");if(!out.has(id))out.set(id,{k:p,m});}}states=[...out.values()];terminal.push({j,word:render(c),length:c.length,lexicalCandidates:by[c.length].length,states:states.length});}
 check(JSON.stringify(terminal.map(x=>x.states))===JSON.stringify([17,6499,0]),'terminal state counts');
 check(JSON.stringify(results.map(x=>x.fail))===JSON.stringify([599,597,601,609]),'forced OOV counts');
 return {lexicon:lex.size,runes:words.flat().length,groups:words.length,results,intersection,controls,terminal};
}
const out=experiment(JSON.parse(read("resources/liber-primus/lp2-corpus.json")),read("resources/liber-primus/lp2-transcription.txt"),JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json")),read("resources/control/english_wordfreq_textblob.txt"));
console.log(JSON.stringify(out,null,2));
