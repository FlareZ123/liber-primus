'use strict';
// Exact native-prime inverse with fixed word-local prime-sum rotation and arbitrary rotation relaxation.
const fs=require('node:fs');
const path=require('node:path');
const INPUTS=[
  "resources/liber-primus/lp2-corpus.json",
  "resources/transcriptions/lp2-image-corrected.txt",
  "resources/control/english_wordfreq_textblob.txt",
  "resources/external/relikd-solved-gp29-native-v1.json"
];
function experiment(raw) {
  const corpus=JSON.parse(raw[0]), ix=new Map(corpus.runes.map((c,i)=>[c,i])), gold=JSON.parse(raw[3]);
  const mod=(x,m)=>(x%m+m)%m, id=w=>w.join(","), rotate=(w,r)=>w.slice(mod(r,w.length)).concat(w.slice(0,mod(r,w.length)));
  const requireTrue=(v,msg)=>{if(!v)throw Error(msg)};
  const source=corpus.pages.filter(p=>p.page<56).flatMap(p=>p.indices);
  let words=[], n=0;
  for(const token of raw[1].replace(/\/\r?\n/g,"").replace(/[\r\n%&$]/g,"").split(/[-.]+/)){
    if(n===source.length)break;
    const w=[...token].filter(c=>ix.has(c)).map(c=>ix.get(c));
    if(w.length){words.push(w);n+=w.length}
  }
  requireTrue(n===12956&&words.length===2896&&id(words.flat())===id(source),"source parse mismatch");
  const cut=[0,729,1874,3612,5506,6527,7960,9640,12648,12956];
  const chapters=Array.from({length:9},()=>[]);let offset=0,chapter=0;
  for(const w of words){if(offset===cut[chapter+1])chapter++;requireTrue(offset+w.length<=cut[chapter+1],"cross-chapter word");chapters[chapter].push(w);offset+=w.length}
  const primes=[];for(let p=2;primes.length<20000;p++){let ok=true;for(const q of primes){if(q*q>p)break;if(p%q===0){ok=false;break}}if(ok)primes.push(p)}
  const shifts=primes.map(p=>(p-1)%29);
  const nativeWords=t=>(t.match(/[\u16a0-\u16ff]+/gu)||[]).map(w=>[...w].map(c=>ix.get(c))).filter(w=>w.every(x=>x!==undefined));
  const glyphs=corpus.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
  const vocab=new Set(gold.sections.flatMap(s=>nativeWords(s.source_text)).map(id));
  for(const line of raw[2].split(/\r?\n/)){
    const m=/^([a-z]+) (\d+)$/.exec(line);if(!m)continue;
    const w=m[1].toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
    for(const alt of [false,true]){
      let p=[];
      for(let j=0;j<w.length;){const v=alt&&w.startsWith("ING",j)?{t:"ING",i:21}:alt&&w.startsWith("IO",j)?{t:"IO",i:27}:glyphs.find(x=>w.startsWith(x.t,j));if(!v)throw Error("unknown dictionary token "+w);p.push(v.i);j+=v.t.length}
      vocab.add(id(p))
    }
  }
  for(let j=0;j<29;j++)vocab.add(id([j]));
  const rotation=w=>w.reduce((a,x)=>a+corpus.prime[x],0)%w.length;
  const enc=(pw,k,mode,wi)=>{let c=[];for(const p of pw){if(p===0)c.push(0);else{c.push(mod(p+shifts[k],29));k++}}const r=mode==="fixed"?rotation(c):mode==="none"?0:(13*wi+7)%c.length;return {c:rotate(c,r),k,r}};
  function inverses(c,k){
    let states=[{p:[],k}];
    for(const x of c){const next=[];for(const s of states){if(x===0)next.push({p:s.p.concat(0),k:s.k});const v=mod(x-shifts[s.k],29);if(v!==0)next.push({p:s.p.concat(v),k:s.k+1})}states=next;if(!states.length)break}
    return states;
  }
  function solve(groups,mode,origin=0,truth=null){
    let states=new Map([[origin,{cost:0,path:null}]]), reached=0, glyphsReached=0,maxStates=1, truthRetained=0, trueK=origin;
    for(let wi=0;wi<groups.length;wi++){
      const c=groups[wi],rs=mode==="fixed"?[rotation(c)]:mode==="none"?[0]:Array.from({length:c.length},(_,i)=>i);
      const unrot=rs.map(r=>({r,c:rotate(c,-r)})), next=new Map();
      for(const [k,node] of states)for(const u of unrot)for(const a of inverses(u.c,k)){
        const cost=node.cost+(vocab.has(id(a.p))?0:1), old=next.get(a.k);
        if(!old||cost<old.cost)next.set(a.k,{cost,path:{p:a.p,r:u.r,prev:node.path,k}});
      }
      if(truth){const t=truth[wi],nextK=trueK+t.filter(x=>x!==0).length;requireTrue(unrot.some(u=>inverses(u.c,trueK).some(a=>a.k===nextK&&id(a.p)===id(t))),"true local inverse lost");requireTrue(next.has(nextK),"true cursor lost");trueK=nextK;truthRetained+=t.length;}
      if(!next.size)break;
      states=next;reached++;glyphsReached+=c.length;maxStates=Math.max(maxStates,states.size);
    }
    const [k,best]=[...states.entries()].sort((a,b)=>a[1].cost-b[1].cost||a[0]-b[0])[0], path=[];for(let q=best.path;q;q=q.prev)path.push(q);path.reverse();
    let cursor=origin;
    for(let wi=0;wi<path.length;wi++){const q=path[wi];let e=[];for(const p of q.p){if(!p)e.push(0);else e.push(mod(p+shifts[cursor++],29))}requireTrue(id(rotate(e,q.r))===id(groups[wi]),"forward replay failed");requireTrue(q.k===cursor-q.p.filter(x=>x!==0).length,"cursor mismatch")}
    requireTrue(cursor===k,"final cursor mismatch");
    return {mode,origin,groups:groups.length,runes:groups.flat().length,reached,glyphsReached,complete:reached===groups.length,remainingCursors:states.size,maxStates,minOOV:best.cost,budget:Math.floor(groups.length*.05),representative:path.slice(0,12).map(q=>q.p.map(x=>corpus.translit[x]).join("")).join(" "),representativeFull:path.map(q=>q.p.map(x=>corpus.translit[x]).join("")).join(" "),truthRetained,representativeEqualsTruth:truth?path.length===truth.length&&id(path.flatMap(q=>q.p))===id(truth.flat()):null};
  }
  const p56=nativeWords(gold.sections.find(s=>s.name==="p56_an_end").source_text);let k=0, c56=[];for(let i=0;i<p56.length;i++){const a=enc(p56[i],k,"none",i);c56.push(...a.c);k=a.k}
  requireTrue(c56.length===85&&k===84&&id(c56)===id(corpus.pages[56].indices),"actual p56 control mismatch");
  const controls=[];
  for(const name of ["p57_parable","0_warning","0_koan_1"]){const p=nativeWords(gold.sections.find(s=>s.name===name).source_text);for(const mode of ["fixed","arbitrary"]){let k=0;const c=p.map((w,i)=>{const a=enc(w,k,mode,i);k=a.k;return a.c});const s=solve(c,mode,0,p);requireTrue(s.complete&&s.minOOV===0&&s.truthRetained===p.flat().length,"plant failure");delete s.representativeFull;controls.push({name,...s})}}
  const original=[];
  for(const j of [8,0,1,2,3,4,5,6,7])for(const mode of ["fixed","arbitrary"]){const result=solve(chapters[j],mode);original.push({chapter:j,...result})}
  return {sourceRunes:n,sourceWords:words.length,lexicon:vocab.size,p56:{runes:c56.length,consumed:k},controls,original};
}
if(require.main===module){const root=path.resolve(__dirname,'..');console.log(JSON.stringify(experiment(INPUTS.map(p=>fs.readFileSync(path.join(root,p),'utf8'))),null,2));}
module.exports={experiment,INPUTS};
