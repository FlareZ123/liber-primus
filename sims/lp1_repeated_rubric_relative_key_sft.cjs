// Repeated-rubric relative-key bootstrap, issue #2866. Node CommonJS.
const fs=require('node:fs'), assert=require('node:assert/strict'), path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const run=(raw,corpus,ink,lp1,solved)=>{
 const mod=x=>(x%29+29)%29, rune=s=>[...s].filter(x=>corpus.runes.includes(x)).map(x=>corpus.runes.indexOf(x));
 const groups=s=>[...s.replace(/\/\s*/g,'').matchAll(/[ᚠ-ᛠ]+/gu)].map(m=>rune(m[0])).filter(g=>g.length);
 const pages=raw.split('%').map(s=>({r:rune(s),g:groups(s)})).filter(p=>p.r.length);
 assert.equal(pages.length,57);
 const pg=new Map();corpus.pages.filter(p=>p.indices.length).forEach((p,i)=>{assert.deepEqual(p.indices,pages[i].r);pg.set(p.page,pages[i]);});
 const matches=[];let spans=0;
 for(const p of ink.pages.filter(p=>p.page<56))for(const s of p.red_spans||[]){
  spans++;const g=pg.get(p.page).g;let start=0,i=0;while(i<g.length&&start<s.start)start+=g[i++].length;
  if(start!==s.start)continue;
  let len=0,j=i;while(j<g.length&&len<s.length)len+=g[j++].length;
  if(len!==s.length)continue;
  const a=g.slice(i,j).map(x=>x.length),b=g.slice(j,j+a.length).map(x=>x.length);
  if(JSON.stringify(a)===JSON.stringify(b))matches.push([p.page,s.start,a]);
 }
 assert.deepEqual(matches,[[3,119,[3]]]);
 // Equality over two consecutive, F-free, length-L plaintext blocks.
 function relative(c,L,q){
  const edges=Array.from({length:L},(_,i)=>[i%q,(i+L)%q,mod(c[i+L]-c[i])]);
  const k=Array(q).fill(null);k[0]=0;
  for(let j=0;j<q;j++)for(const [a,b,d] of edges){
   if(k[a]!==null&&k[b]===null)k[b]=mod(k[a]+d);
   if(k[b]!==null&&k[a]===null)k[a]=mod(k[b]-d);
  }
  if(edges.some(([a,b,d])=>k[a]!==null&&k[b]!==null&&mod(k[b]-k[a])!==d))return null;
  return k;
 }
 const control=rune(lp1.split('$')[1]), truth=rune(solved.sections.find(s=>s.name==='0_welcome').source_text);
 const relativeControl=relative(control,7,8);
 assert.deepEqual(relativeControl,[0,16,7,16,15,16,22,3]);assert.equal(control.length,515);assert.equal(truth.length,515);
 assert.ok(Array.from({length:7},(_,i)=>relative(control,7,i+1)).every(x=>x===null));
 const counts=new Map(),contexts=new Map(),alpha=.1;
 for(const s of solved.sections.filter(s=>s.name!=='0_welcome')){
  const p=rune(s.source_text);
  for(let i=0;i<p.length;i++){
   const context=p.slice(Math.max(0,i-2),i).join(','), key=context+'|'+p[i];
   counts.set(key,(counts.get(key)||0)+1);contexts.set(context,(contexts.get(context)||0)+1);
  }
 }
 const logp=(tail,p)=>{const c=tail.join(',');return Math.log(((counts.get(c+'|'+p)||0)+alpha)/((contexts.get(c)||0)+29*alpha));};
 function advance(states,c,k,allowHold){
  const out=new Map();
  for(const st of states.values()){
   const choices=[];if(c===0&&allowHold)choices.push([0,st.phase]);
   const p=mod(c-k[st.phase]);if(p!==0)choices.push([p,(st.phase+1)%k.length]);
   for(const [v,phase] of choices){
    const tail=[...st.tail,v].slice(-2),score=st.score+logp(st.tail,v),id=phase+'|'+tail.join(',');
    if(!out.has(id)||out.get(id).score<score)out.set(id,{phase,tail,score,plain:[...st.plain,v]});
   }
  }
  return out;
 }
 const best=s=>[...s.values()].sort((a,b)=>b.score-a.score)[0];
 function fit(c,L,rel){
  const candidates=[];
  for(let shift=0;shift<29;shift++){
   const k=rel.map(x=>mod(x+shift));let states=new Map([['0|',{phase:0,tail:[],score:0,plain:[]}]]);
   for(let i=0;i<40;i++)states=advance(states,c[i],k,i>=2*L);
   if(states.size)candidates.push({shift,k,state:best(states)});
  }
  candidates.sort((a,b)=>b.state.score-a.state.score);return candidates;
 }
 const fits=fit(control,7,relativeControl),winner=fits[0];
 assert.equal(winner.shift,23);assert.equal(fits.length,16);
 let states=new Map([['frozen',winner.state]]);
 for(let i=40;i<control.length;i++)states=advance(states,control[i],winner.k,true);
 const recovered=best(states).plain;assert.deepEqual(recovered,truth);
 let phase=0;assert.deepEqual(recovered.map(p=>p===0?0:mod(p+winner.k[phase++%winner.k.length])),control);
 const target=[...pg.get(3).r.slice(119),...pg.get(4).r,...pg.get(5).r,...pg.get(6).r.slice(0,71)];
 assert.equal(target.length,693);assert.deepEqual(target.slice(0,6),[13,23,2,12,23,12]);
 const rel=relative(target,3,4);assert.deepEqual(rel,[0,0,19,28]);
 const targetFits=fit(target,3,rel);assert.equal(targetFits.length,6);assert.equal(targetFits[0].shift,3);
 function failure(k){
  let phases=new Set([0]);
  for(let i=0;i<target.length;i++){
   const next=new Set(),c=target[i];
   for(const j of phases){if(c===0)next.add(j);if(c!==k[j])next.add((j+1)%k.length);}
   if(!next.size)return {offset:i,phases:[...phases].sort((a,b)=>a-b),c};
   phases=next;
  }
  return {offset:null};
 }
 const failures=Array.from({length:29},(_,s)=>failure(rel.map(x=>mod(x+s))));
 assert.deepEqual(failures.map(f=>f.offset),[11,17,16,87,21,8,6,13,12,171,27,53,2,0,115,33,30,19,18,41,24,7,10,1,34,26,45,9,29]);
 return {spans,matches,control:{relativeControl,feasible:fits.length,shift:winner.shift,key:winner.k,fitScore:winner.state.score,runnerUp:fits[1].state.score,holdout:475,fullReplay:515},target:{length:target.length,relative:rel,smallerPeriods:[1,2,3].map(q=>relative(target,3,q)),fit:targetFits.map(f=>[f.shift,f.state.score]),failures}};
};
if(require.main===module) console.log(JSON.stringify(run(read('resources/liber-primus/lp2-transcription.txt'),JSON.parse(read('resources/liber-primus/lp2-corpus.json')),JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json')),read('resources/transcriptions/lp1_wulfic_canonical.txt'),JSON.parse(read('resources/external/relikd-solved-gp29-native-v1.json'))),null,2));
module.exports={run};
