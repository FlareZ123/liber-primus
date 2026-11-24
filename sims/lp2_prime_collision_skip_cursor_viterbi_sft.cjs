'use strict';
// Agent5: exact optional collision-only prime cursor DP; no claimed universal inverse.
const fs=require('node:fs'),path=require('node:path');
function experiment(corpus,transcript,solved,lexicon){
 const check=(x,m)=>{if(!x)throw Error(m)},same=(a,b)=>JSON.stringify(a)===JSON.stringify(b),mod=x=>(x%29+29)%29;
 const idx=new Map(corpus.runes.map((r,i)=>[r,i]));
 const words=[];let w=[];for(const c of transcript.split("%").slice(0,55).join("%")){if(idx.has(c))w.push(idx.get(c));else if(c!=="%"&&c!=="/"&&!/\s/u.test(c)&&w.length){words.push(w);w=[];}}if(w.length)words.push(w);
 check(words.length===2896&&same(words.flat(),corpus.pages.filter(p=>p.page<=55).flatMap(p=>p.indices)),"source shape");
 const tokens=corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 const key=p=>String.fromCharCode(...p),unkey=s=>Array.from(s,c=>c.charCodeAt(0));
 const render=p=>p.map(x=>corpus.translit[x]).join("");
 function gp(s){s=s.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");const p=[];while(s.length){const m=tokens.find(t=>s.startsWith(t.s));if(!m)return null;p.push(m.i);s=s.slice(m.s.length);}return p;}
 const freq=new Map(),bigram=Array.from({length:30},()=>Array(30).fill(.5));
 for(const l of lexicon.split(/\r?\n/)){const m=/^([a-z]+) (\d+)$/.exec(l);if(!m)continue;const p=gp(m[1]);if(!p)continue;const n=+m[2],s=key(p);freq.set(s,(freq.get(s)||0)+n);let prev=29;for(const x of p.concat(29)){bigram[prev][x]+=Math.sqrt(n);prev=x;}}
 check(freq.size===29060,"dictionary shape");
 const logBigram=bigram.map(row=>{const n=row.reduce((a,b)=>a+b,0);return row.map(v=>Math.log(v/n));});
 function wordScore(s){let v=0,prev=29;for(let i=0;i<s.length;i++){const x=s.charCodeAt(i);v+=.1*logBigram[prev][x];prev=x;}v+=.1*logBigram[prev][29];const f=freq.get(s);return v+(f?(s.length>=3?s.length:.25*s.length)+.05*Math.log1p(f):0);}
 const sieve=new Uint8Array(1000001),primes=[];for(let n=2;n<sieve.length;n++)if(!sieve[n]){primes.push(n);if(n*n<sieve.length)for(let j=n*n;j<sieve.length;j+=n)sieve[j]=1;}
 check(primes[173]===1033&&primes[463]===3301,"prime anchors");
 const K=primes.map(p=>(p-1)%29),diff=Array(K.length);diff[K.length-1]=K.length;
 for(let t=K.length-2;t>=0;t--)diff[t]=K[t]===K[t+1]?diff[t+1]:t+1;
 const origins=Array.from({length:464},(_,i)=>i);
 // Full relation for arbitrary optional collision-only rejection, no hidden
 // arbitrary key increments. At a repeat, acceptance can occur at any member
 // of the current equal-key-residue run. At a nonrepeat, only the first
 // distinct-key residue is reachable after rejection.
 function eachChoice(c,prev,t,F,visit){
  if(t>=K.length-1)throw Error("prime tape exhausted");
  if(F&&c===0)visit(0,t);
  const p=mod(c-K[t]),j=diff[t];
  if(c===prev){if(!F||p!==0)for(let end=t+1;end<=j;end++)visit(p,end);}
  else {
   if(!F||p!==0)visit(p,t+1);
   const p0=mod(prev-K[t]);
   if((!F||p0!==0)&&j<K.length&&mod(p0+K[j])===c)visit(p0,j+1);
  }
 }
 // Plant policy known only to encoder: skip collision iff the starting prime
 // residue is not 1 mod7, then consume all equal-residue rejections.
 function encrypt(ws,start,F){
  let t=start,prev=0,skips=0,repeat=0,hold=0;
  const c=ws.map(w=>w.map(p=>{
   let x;if(F&&p===0){x=0;hold++;}
   else {if(mod(p+K[t])===prev&&primes[t]%7!==1){const j=diff[t];skips+=j-t;t=j;}x=mod(p+K[t]);t++;}
   if(x===prev)repeat++;prev=x;return x;
  }));
  return {c,end:t,skips,repeat,hold};
 }
 // A decoded path is an exact preimage with explicit per-rune consumptions.
 function replay(ws,moves,start,prev,F){
  let t=start;
  const c=ws.map((w,j)=>w.map((p,i)=>{const n=moves[j][i];let x;
   if(n===0){check(F&&p===0,"F hold");x=0;}
   else {check(!F||p!==0,"no normal F");for(let k=0;k<n-1;k++)check(mod(p+K[t+k])===prev,"illegal skip");x=mod(p+K[t+n-1]);t+=n;}
   prev=x;return x;
  }));
  return {c,end:t,prev};
 }
 function local(c,previous,t,F){
  const best=new Map(),moves=[];
  function rec(i,state,s){
   if(i===c.length){const score=wordScore(s),old=best.get(state);if(!old||score>old.score)best.set(state,{score,s,moves:moves.slice()});return;}
   eachChoice(c[i],i?c[i-1]:previous,state,F,(p,end)=>{moves.push(end-state);rec(i+1,end,s+String.fromCharCode(p));moves.pop();});
  }
  rec(0,t,"");return best;
 }
 // Exact Viterbi for the fixed additive word score and supplied possible
 // initial cursor states. There is no beam pruning.
 function decode(ws,starts,previous,F){
  let states=new Map(starts.map(t=>[t,{score:0,start:t,prev:null}])),maxStates=states.size;
  let last=previous;
  for(let wi=0;wi<ws.length;wi++){
   const c=ws[wi],next=new Map();
   for(const [t,r] of states)for(const [end,z] of local(c,last,t,F)){
    const score=r.score+z.score,old=next.get(end);
    if(!old||score>old.score)next.set(end,{score,start:r.start,prev:r,s:z.s,moves:z.moves});
   }
   if(!next.size)return {failure:wi,maxStates};
   states=next;maxStates=Math.max(maxStates,states.size);last=c.at(-1);
  }
  let end=-1,best=null;for(const [t,r] of states)if(!best||r.score>best.score){best=r;end=t;}
  const decoded=[],moves=[];for(let r=best;r.prev;r=r.prev){decoded.push(unkey(r.s));moves.push(r.moves);}decoded.reverse();moves.reverse();
  const re=replay(decoded,moves,best.start,previous,F);check(same(re.c,ws)&&re.end===end,"path replay");
  return {start:best.start,end,score:best.score,words:decoded,moves,maxStates,finalStates:states.size,skip:moves.flat().reduce((s,n)=>s+Math.max(0,n-1),0),holds:moves.flat().filter(n=>n===0).length};
 }
 function stats(ws){const tape=ws.flat(),counts=Array(29).fill(0);tape.forEach(x=>counts[x]++);return {runes:tape.length,words:ws.length,known:ws.filter(w=>freq.has(key(w))).length,long:ws.filter(w=>w.length>=5).length,longKnown:ws.filter(w=>w.length>=5&&freq.has(key(w))).length,ioc:counts.reduce((s,n)=>s+n*(n-1),0)/(tape.length*(tape.length-1))};}
 function accuracy(p,q){const a=p.flat(),b=q.flat();return a.filter((x,i)=>x===b[i]).length/a.length;}
 const donor=solved.sections.flatMap(s=>(s.source_text.match(/[\u16a0-\u16ff]+/gu)||[]).map(w=>[...w].map(c=>idx.get(c))));
 const plants=[];
 for(const F of [false,true])for(let j=0;j<3;j++){
  const start=[0,173,463][j],p=donor.slice(j*200,j*200+200),plant=encrypt(p,start,F);
  const a=decode(plant.c.slice(0,150),origins,0,F);check(!('failure'in a),"plant training failed");
  const b=decode(plant.c.slice(150),[a.end],plant.c[149].at(-1),F);
  plants.push({F,start,observedStart:a.start,trainAccuracy:accuracy(p.slice(0,150),a.words),holdoutAccuracy:b.words?accuracy(p.slice(150),b.words):0,trainExact:same(a.words,p.slice(0,150)),holdoutExact:b.words?same(b.words,p.slice(150)):false,terminalCorrect:b.end===plant.end,actualSkips:plant.skips,actualRepeats:plant.repeat,actualHolds:plant.hold,decodedSkips:a.skip+(b.skip||0),maxStates:a.maxStates});
 }
 // Exact maximum of long dictionary hits over all histories and 464 origins.
 // Only the outgoing cursor is sufficient state for future input. No English
 // word is required for reachability; a nonlexical word simply scores zero.
 function bound(ws,F,previous=0){
  let cur=new Int32Array(K.length).fill(-1),next=new Int32Array(K.length).fill(-1),active=origins.slice(),prev=previous,maxStates=active.length,marks=[];
  for(const t of active)cur[t]=0;
  for(let wi=0;wi<ws.length;wi++){
   const c=ws[wi],long=c.length>=5,dest=[];
   for(const t of active){
    const score=cur[t];
    function rec(i,state,s){
     if(i===c.length){const val=score+(long&&freq.has(s)?1:0);if(val>next[state]){if(next[state]<0)dest.push(state);next[state]=val;}return;}
     eachChoice(c[i],i?c[i-1]:prev,state,F,(p,end)=>rec(i+1,end,long?s+String.fromCharCode(p):""));
    }
    rec(0,t,"");
   }
   for(const t of active)cur[t]=-1;
   [cur,next]=[next,cur];active=dest;prev=c.at(-1);maxStates=Math.max(maxStates,active.length);
   if(!active.length)return {failure:wi,maxStates,marks};
   if(wi===157||wi===412||wi%400===399||wi===ws.length-1)marks.push({word:wi+1,states:active.length,best:Math.max(...active.map(t=>cur[t])),long:ws.slice(0,wi+1).filter(w=>w.length>=5).length});
  }
  return {max:Math.max(...active.map(t=>cur[t])),maxStates,marks};
 }
 const offsets=[];let n=0;for(const w of words){offsets.push(n);n+=w.length;}
 const pages=[];n=0;for(const p of corpus.pages.filter(p=>p.page<=55)){if(p.indices.length)pages.push([p.page,n]);n+=p.indices.length;}
 const pageAt=i=>pages.filter(p=>p[1]<=i).at(-1)[0];
 const orig=[];
 for(const F of [false,true]){
  const a=decode(words.slice(0,158),origins,0,F);
  if(a.failure!==undefined){orig.push({F,training:a,bound:bound(words,F)});continue;}
  const out=a.words.slice(),allMoves=a.moves.slice();let end=a.end,score=a.score,skip=a.skip,holds=a.holds,fail=null,prev=words[157].at(-1);
  // Freeze the selected origin and end state after p0–2. Continue fixed
  // decoding in 150-word blocks; each block sees only its own ciphertext.
  for(let i=158;i<words.length;i+=150){
   const c=words.slice(i,i+150),b=decode(c,[end],prev,F);
   if(b.failure!==undefined){fail=i+b.failure;break;}
   out.push(...b.words);allMoves.push(...b.moves);end=b.end;score+=b.score;skip+=b.skip;holds+=b.holds;prev=c.at(-1);
  }
  const fullReplay=replay(out,allMoves,a.start,0,F);check(same(fullReplay.c,words.slice(0,out.length))&&fullReplay.end===end,"original full replay");
  const region=(lo,hi)=>out.filter((w,i)=>pageAt(offsets[i])>=lo&&pageAt(offsets[i])<=hi);
  orig.push({F,training:{start:a.start,end:a.end,maxStates:a.maxStates,stats:stats(a.words),score:a.score,words:a.words.slice(0,30).map(render).join(" ")},continuation:{fail,end,score,skip,holds,full:stats(out),p16:stats(region(16,21)),p40:stats(region(40,53)),p40Words:region(40,53).slice(0,25).map(render).join(" ")},bound:bound(words,F)});
 }
 const tape=words.flat();
 function reach(a,F,prev=0){
  let active=new Set(origins);
  for(let i=0;i<a.length;i++){
   const next=new Set();for(const t of active)eachChoice(a[i],prev,t,F,(_p,end)=>next.add(end));
   if(!next.size)return {failure:i,c:a[i],prev,priorCount:active.size,priorCursors:[...active]};
   active=next;prev=a[i];
  }
  return {survivors:active.size};
 }
 const lengths=[729,1145,1729,9,1894,1021,1524,1589,3316];check(lengths.reduce((a,b)=>a+b,0)===tape.length,"chapter tape");
 const chapter=[];let start=0;
 for(const len of lengths){
  const end=start+len,complete=words.filter((w,i)=>offsets[i]>=start&&offsets[i]+w.length<=end);
  const fragments=words.map((w,i)=>w.slice(Math.max(0,start-offsets[i]),Math.max(0,end-offsets[i]))).filter(w=>w.length);
  check(same(fragments.flat(),tape.slice(start,end)),"chapter slice");
  const crossing=fragments.length-complete.length;
  chapter.push({start,end,crossing,completeLong:complete.filter(w=>w.length>=5).length,
   reset:bound(fragments,false),FReset:reach(tape.slice(start,end),true),
   continuousPrevious:bound(fragments,false,start?tape[start-1]:0),FContinuousPrevious:reach(tape.slice(start,end),true,start?tape[start-1]:0)});
  start=end;
 }
 return {lexicon:freq.size,plants,original:orig,firstFDeath:reach(tape,true),chapter};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/control/english_wordfreq_textblob.txt"];
const r=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
console.log(JSON.stringify(experiment(JSON.parse(r(paths[0])),r(paths[1]),JSON.parse(r(paths[2])),r(paths[3])),null,2));
