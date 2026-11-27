"use strict";
const paths=["resources/transcriptions/lp2-image-corrected.txt","resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json"];
const main=function(inputs){
 const check=(v,m)=>{if(!v)throw Error(m)};
 const eq=(a,b,m)=>check(JSON.stringify(a)===JSON.stringify(b),m);
 const corpus=JSON.parse(inputs[1]), R=corpus.runes.join(""), native=JSON.parse(inputs[2]);
 const groups=[], pageTape={};let page=0,offset=0,tape="",positions=[];
 for(const ch of inputs[0]){if(ch==="%"){page++;continue}if(ch==="/"||/\s/u.test(ch))continue;const physical=page+(page>=50?1:0);positions.push({page:physical,offset});tape+=ch;if(R.includes(ch)){(pageTape[physical]??=[]).push(R.indexOf(ch));offset++}}
 for(const p of corpus.pages)eq(pageTape[p.page]||[],p.indices,"page "+p.page);
 for(const m of tape.matchAll(new RegExp("["+R+"]+","gu")))if(positions[m.index].page<56)groups.push({w:m[0],...positions[m.index],endPage:positions[m.index+m[0].length-1].page});
 eq([groups.length,groups.reduce((a,g)=>a+g.w.length,0),groups.filter(g=>g.page!==g.endPage).length],[2896,12956,32],"original geometry");
 const parse=s=>s.replace(/['’]/gu,"").match(new RegExp("["+R+"]+","gu"))||[];
 const sections=native.sections.map(s=>({name:s.name,words:parse(s.source_text)}));
 const all=sections.flatMap(s=>s.words), dict=new Map();
 for(const w of all){if(!dict.has(w.length))dict.set(w.length,new Set());dict.get(w.length).add(w)}
 for(const [n,ws] of dict)dict.set(n,[...ws].sort());
 eq(dict.get(1).map(x=>R.indexOf(x)).sort((a,b)=>a-b),[10,24],"native A/I");
 const p57=sections.find(s=>s.name==="p57_parable");
 eq(p57.words.flatMap(w=>[...w].map(x=>R.indexOf(x))),corpus.pages.find(p=>p.page===57).indices,"p57 clear native");
 const distinct=(ws,n)=>new Set(ws.filter(w=>w.length===n)).size;
 const capacities=Array.from({length:14},(_,i)=>i+1).map(n=>{const D=distinct(groups.map(g=>g.w),n),L=dict.get(n)?.length||0;return {n,D,L,minStates:L?Math.ceil(D/L):null,minLexiconAt14:Math.ceil(D/14),maxJointStates:L?(29n**BigInt(n)/BigInt(L)).toString():null}});
 eq(capacities.slice(0,3).map(x=>x.D),[28,354,704],"original type counts");
 const minStates=Math.max(...capacities.map(x=>x.minStates||0)), maxJointStates=Number(capacities.reduce((a,x)=>x.maxJointStates!==null&&BigInt(x.maxJointStates)<a?BigInt(x.maxJointStates):a,29n**14n));
 check(minStates>maxJointStates,"native vocabulary gate");
 // Exact minimum output capacity for a specified deterministic transition delta[s][p].
 // Known incoming state: pools can overlap across input states only within a destination.
 // Joint local decode: no overlap across input states.
 function demand(delta,S,joint){const d=Array.from({length:S},()=>Array(S).fill(0));for(let s=0;s<S;s++)for(const t of delta[s])d[s][t]++;return Array.from({length:S},(_,t)=>joint?d.reduce((a,row)=>a+row[t],0):Math.max(...d.map(row=>row[t])))}
 // Exhaustive oracle on toy q=2 state, 2 plaintext types and M=0..4 output symbols.
 // Enumerate output assignment for all four pairs. Check within-row (or global)
 // injectivity and consistency of output-to-destination labels.
 let toyCases=0;
 for(let mask=0;mask<16;mask++){const d=Array.from({length:2},(_,s)=>Array.from({length:2},(_,p)=>(mask>>(2*s+p))&1));for(const joint of [false,true])for(let M=0;M<=4;M++){let feasible=false;for(let x=0;x<M**4;x++){const a=[];let z=x;for(let i=0;i<4;i++){a.push(z%M);z=Math.floor(z/M)}if(a[0]===a[1]||a[2]===a[3]||(joint&&new Set(a).size!==4))continue;let good=true;for(let i=0;i<4;i++)for(let j=0;j<i;j++)if(a[i]===a[j]&&d[i>>1][i%2]!==d[j>>1][j%2])good=false;if(good){feasible=true;break}}eq(feasible,demand(d,2,joint).reduce((a,b)=>a+b,0)<=M,"toy capacity");toyCases++}}
 // Lexicographic word ranks. Destination = s + rank + secret modulo S.
 // Encode into contiguous destination pools of exact minimum size.
 // This artificial construction is an implementation control, not a source-selected decoder.
 function build(S,key,joint){
  const tables=new Map();
  for(const [n,ws] of dict){const delta=Array.from({length:S},(_,s)=>ws.map((_,p)=>(s+p+key)%S)),sizes=demand(delta,S,joint),offsets=sizes.map((_,t)=>sizes.slice(0,t).reduce((a,b)=>a+b,0));
   check(BigInt(sizes.reduce((a,b)=>a+b,0))<=29n**BigInt(n),"capacity");
   const maps=Array.from({length:S},()=>new Map()), rev=Array.from({length:S},()=>new Map()), global=new Map(), next=new Map(),used=Array(S).fill(0);
   for(let s=0;s<S;s++){const local=Array(S).fill(0);for(let p=0;p<ws.length;p++){const t=delta[s][p],slot=joint?used[t]++:local[t]++,c=offsets[t]+slot;maps[s].set(ws[p],c);rev[s].set(c,ws[p]);if(joint)global.set(c,{s,w:ws[p]});check(!next.has(c)||next.get(c)===t,"output state");next.set(c,t)}}
   tables.set(n,{maps,rev,global,next});
  }
  const asWord=(rank,n)=>{let c="";for(let j=0;j<n;j++){c=R[rank%29]+c;rank=Math.floor(rank/29)}check(rank===0,"word length");return c};
  const rank=c=>[...c].reduce((a,x)=>a*29+R.indexOf(x),0);
  return {enc(s,w){const t=tables.get(w.length),c=t.maps[s].get(w);check(c!==undefined,"encode");return {c:asWord(c,w.length),next:t.next.get(c)}},dec(s,c){const t=tables.get(c.length),i=rank(c),w=t.rev[s].get(i);return w===undefined?null:{w,next:t.next.get(i)}},local(c){const t=tables.get(c.length),i=rank(c),v=t.global.get(i);return v?{...v,next:t.next.get(i)}:null}};
 }
 const controls=[];
 for(const [S,joint] of [[14,true],[29,false]]){const key=7,init=3,model=build(S,key,joint),train=sections.find(s=>s.name==="p56_an_end").words;
  const encode=(ws,start)=>{let s=start;return {cs:ws.map(w=>{const q=model.enc(s,w);s=q.next;return q.c}),s}};
  const training=encode(train,init),hold=encode(p57.words,training.s);
  const keys=[];for(let k=0;k<S;k++){const trial=build(S,k,joint);let s=init,good=true;for(let i=0;i<train.length;i++){const q=trial.dec(s,training.cs[i]);if(!q||q.w!==train[i]){good=false;break}s=q.next}if(good)keys.push(k)}eq(keys,[key],"hidden control key");
  let s=training.s;for(let i=0;i<hold.cs.length;i++){const q=model.dec(s,hold.cs[i]);eq(q.w,p57.words[i],"held p57");if(joint)eq(model.local(hold.cs[i]),{s,w:q.w,next:q.next},"local incoming state");s=q.next}
  eq(s,hold.s,"held carry");
  controls.push({S,joint,keys,heldWords:hold.cs.length,heldRunes:p57.words.reduce((a,w)=>a+w.length,0)});
 }
 return {geometry:{groups:groups.length,runes:12956,carries:32},capacities,minStates,maxJointStates,oneRuneProducts:[28,29],toyCases,controls,notes:"Fixed native vocabulary; apostrophes merged; dictionary includes held native word types, so held check is a key/state implementation control, not lexical recovery."};
};
module.exports={main,paths};
if(require.main===module){const fs=require("node:fs"),path=require("node:path");console.log(JSON.stringify(main(paths.map(p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8"))),null,2));}
