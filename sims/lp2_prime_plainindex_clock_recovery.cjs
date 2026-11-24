'use strict';
// Exact dynamic programming for plaintext-index prime-clock candidate.
// Run with Node from any directory. No external dependencies.
const fs=require('node:fs'), path=require('node:path');
const root=path.resolve(__dirname,'..');
const run=function(corpus,transcript,lextext){
  const src=JSON.parse(corpus), check=(v,m)=>{if(!v)throw Error(m)}, mod=x=>(x%29+29)%29;
  const alphabet=new Map(src.runes.map((x,i)=>[x,i])), all=[], words=[];let w=[];
  for(const ch of transcript){if(alphabet.has(ch)){w.push(alphabet.get(ch));all.push(alphabet.get(ch));}else if(ch!=="/"&&ch!=="%"&&!/\s/.test(ch)&&w.length){words.push(w);w=[]}}
  if(w.length)words.push(w);
  check(all.join(",")===src.pages.flatMap(p=>p.indices).join(","),"source mismatch");
  const tokens=src.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
  function gp(s){s=s.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");const a=[];while(s){const t=tokens.find(t=>s.startsWith(t.s));if(!t)return null;a.push(t.i);s=s.slice(t.s.length)}return a}
  const lex=new Set();for(const line of lextext.split(/\r?\n/)){const m=line.match(/^([a-z]+)\s+\d+$/);if(m){const a=gp(m[1]);if(a)lex.add(a.join(","));}}
  let x=0;const spans=words.map(w=>{const a=x;x+=w.length;return {a,b:x,w}});
  const n=src.pages.slice(0,3).reduce((s,p)=>s+p.indices.length,0), p0=src.pages[0].indices.length;
  const orig=spans.filter(t=>t.b<=n).map(t=>t.w), split=spans.filter(t=>t.b<=p0).length;
  check(orig.flat().length===n,"chapter does not finish at word boundary");
  check(orig[0].length===8&&orig[1].length===5,"p0 title mismatch");
  const known56="AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE".split(" ").map(gp);
  const n57=src.pages[57].indices.length, known57=spans.filter(t=>t.a>=all.length-n57).map(t=>t.w);
  check(known57.flat().length===95,"p57 layout");
  const cap=1000000, sieve=new Uint8Array(cap+1), primes=[];for(let i=2;i<=cap;i++)if(!sieve[i]){primes.push(i);if(i*i<=cap)for(let j=i*i;j<=cap;j+=i)sieve[j]=1}
  const shifts=primes.map(p=>(p-1)%29);check(primes[463]===3301,"prime bound");
  function enc(words,q,variable){return words.map(w=>w.map(p=>{if(p===0)return 0;const c=mod(p+shifts[q]);q+=variable?p:1;return c}))}
  check(enc(known56,0,false).flat().join(",")===src.pages[56].indices.join(","),"p56 authentic control");
  const better=(a,b)=>!b||a.cover>b.cover||(a.cover===b.cover&&a.hits>b.hits)||(a.cover===b.cover&&a.hits===b.hits&&a.start<b.start);
  const starts=Array.from({length:464},(_,i)=>({q:i,start:i,cover:0,hits:0,prev:null,w:null}));
  function advance(chunks,initial){
    let states=new Map(initial.map(a=>[a.q,a])), trace=[];
    for(const word of chunks){
      const next=new Map();
      for(const old of states.values()){
        const tmp=[];
        function visit(i,q){
          if(i===word.length){const hit=lex.has(tmp.join(","));const node={q,start:old.start,cover:old.cover+(hit?tmp.length:0),hits:old.hits+Number(hit),prev:old,w:tmp.slice()};if(better(node,next.get(q)))next.set(q,node);return}
          const c=word[i];
          if(c===0){tmp.push(0);visit(i+1,q);tmp.pop()}
          const p=mod(c-shifts[q]);if(p!==0){tmp.push(p);visit(i+1,q+p);tmp.pop()}
        }
        visit(0,old.q)
      }
      states=next;trace.push(states.size);if(!states.size)break;
    }
    let best=null;for(const s of states.values())if(better(s,best))best=s;
    return {states,trace,best}
  }
  function decode(node){const a=[];while(node&&node.w){a.push(node.w);node=node.prev}return a.reverse()}
  function summary(node,ct){if(!node)return null;const p=decode(node);check(enc(p,node.start,true).flat().join(",")===ct.flat().join(","),"replay");const f=Array(29).fill(0);for(const v of p.flat())f[v]++;const n=p.flat().length;return {start:node.start,end:node.q,cover:node.cover,hits:node.hits,words:p.length,runes:n,ioc:f.reduce((s,c)=>s+c*(c-1),0)/(n*(n-1)),plain:p,text:p.map(w=>w.map(v=>src.translit[v]).join("")).join(" ")}}
  function evaluate(c,split){
    const a=advance(c.slice(0,split),starts);
    const b=a.best?advance(c.slice(split),[a.best]):null;
    const oracle=advance(c,starts);
    return {firstStates:a.trace.slice(0,5),trainSurviving:a.states.size,trainDeadAt:a.states.size?null:a.trace.length,train:summary(a.best,c.slice(0,split)),holdoutSurviving:b?.states.size??null,holdoutDeadAt:b&&!b.states.size?b.trace.length:null,holdout:b?.best?{...summary(b.best,c),incrementalCover:b.best.cover-a.best.cover,incrementalHits:b.best.hits-a.best.hits}:null,oracleSurviving:oracle.states.size,oracleDeadAt:oracle.states.size?null:oracle.trace.length,oracleDeadWordStart:oracle.states.size?null:c.slice(0,oracle.trace.length-1).flat().length,oracleDeadWordEnd:oracle.states.size?null:c.slice(0,oracle.trace.length).flat().length,oracle:summary(oracle.best,c)}
  }
  const plant=known57.concat(known56), ct=enc(plant,132,true);
  const positive=evaluate(ct,known57.length);
  const original=evaluate(orig,split);
  const pp=plant.flat(), rec=positive.holdout?.plain.flat()??[];
  check(positive.train.start===132&&rec.length===180,"planted start/full inverse");
  return {lexSize:lex.size,chapterRunes:n,chapterWords:orig.length,trainWords:split,trainRunes:orig.slice(0,split).flat().length,positive:{...positive,actualStart:132,exactRecoveredRunes:rec.filter((v,i)=>v===pp[i]).length,exactHoldoutRunes:rec.slice(95).filter((v,i)=>v===pp[95+i]).length},original};
};
const inputs=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/control/english_wordfreq_textblob.txt"].map(p=>fs.readFileSync(path.join(root,p),'utf8'));
console.log(JSON.stringify(run(...inputs), (k,v)=>k==='plain'?undefined:v, 2));
