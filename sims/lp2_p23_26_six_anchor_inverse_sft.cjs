"use strict";
// Complete and partial hash joins on six longest printed groups; q13 F-hold.
// Reuse the frozen #2602 spelling rule and exact shared CSP.
const {encode,createSolver}=require("./lp2_fhold_word_relation_csp.cjs");
function experiment(inputs){
 const [gp,trans,lex,native]=[JSON.parse(inputs[0]),inputs[1],inputs[2],JSON.parse(inputs[3])];
 const assert=(x,m)=>{if(!x)throw Error(m)},map=new Map(gp.runes.map((r,i)=>[r,i])),alpha=new Map(gp.translit.map((s,i)=>[s,i]));
 const parse=s=>(s.replace(/[\s/%]/g,"").match(/[\u16a0-\u16ff]+/g)||[]).map(w=>Array.from(w,x=>map.get(x)));
 const originalWords=parse(trans).slice(0,2896);assert(String(originalWords.flat())===String(gp.pages.slice(0,56).flatMap(p=>p.indices)),"original source");
 const solved=native.sections.map(s=>(s.source_text.replace(/['’]/g,"").match(/[\u16a0-\u16ff]+/g)||[]).map(w=>Array.from(w,x=>map.get(x))));
 const cipherSections=inputs[6].split("$").map(parse);
 assert(solved[3].flat().length===780,"external KOAN1 donor");
 solved[3]=cipherSections[3].map(w=>w.map(v=>(2-v+29)%29));assert(solved[3].flat().length===778,"source KOAN1");
 function buildLexicon(excluded){
  const dict=Array.from({length:32},()=>new Map()),add=w=>{if(w.length&&w.length<32)dict[w.length].set(String(w),w)};
  function variants(word){const s=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/['’]/g,"");
   function walk(i,w){if(i===s.length){add(w);return}for(const n of [1,2,3]){const a=s.slice(i,i+n);if(a.length!==n)continue;const v=n===3?(a==="ING"?alpha.get("NG"):undefined):a==="IO"?alpha.get("IA"):alpha.get(a);if(v!==undefined)walk(i+n,[...w,v])}}walk(0,[])}
  for(const l of lex.split(/\r?\n/)){const m=/^([a-z']+)\s+(\d+)$/.exec(l);if(m&&m[1].length>=2)variants(m[1])}
  for(const s of ["A","I","O"])variants(s);
  for(const [i,sec] of solved.entries())if(i!==excluded)for(const w of sec)add(w);
  const tok=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
  for(const source of inputs.slice(4,6))for(let w of source.toUpperCase().match(/[A-Z]+(?:['’][A-Z]+)*/g)||[]){const p=[];w=w.replace(/['’]/g,"").replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");while(w.length){const t=tok.find(t=>w.startsWith(t.s));if(!t)throw Error("donor token "+w);p.push(t.i);w=w.slice(t.s.length)}add(p)}
  return dict;
 }
 function cutAt(ws,min){let cut=0,n=0;while(n<min&&cut<ws.length)n+=ws[cut++].length;return {cut,n}}

 const mod=x=>(x%29+29)%29, q=13, all=(1<<q)-1;
 function expand(dict){const next=dict.map(d=>new Map(d));for(const [len,d] of dict.entries())if(len>=5)for(const w of d.values())for(let i=1;i<len-2;i++){if(w[i]===0||w[i+1]===0||w[i]===w[i+1])continue;const v=w.slice();[v[i],v[i+1]]=[v[i+1],v[i]];next[len].set(String(v),v)}return next}
 function chars(a){return String.fromCharCode(...a.map(x=>65+x))}
 function canonical(k){let v=chars(k);for(let i=1;i<q;i++){const w=chars(k.slice(i).concat(k.slice(0,i)));if(w<v)v=w}return v}
 function partial(c,dict){const out=new Map();for(const p of dict[c.length].values()){let legal=true;const k=[];for(let i=0;i<c.length;i++){if(p[i]===0){if(c[i]!==0){legal=false;break}}else k.push(mod(c[i]-p[i]))}if(!legal||k.some((v,i)=>i>=q&&v!==k[i%q]))continue;const a=k.slice(0,q);if(!out.has(k.length))out.set(k.length,new Map());out.get(k.length).set(chars(a),a)}return [...out].map(([n,rows])=>[n,[...rows.values()]])}
 function candidates(ws,dict,fullOnly=true){
  const offsets=[0],zeros=[0];for(const w of ws){offsets.push(offsets.at(-1)+w.length);zeros.push(zeros.at(-1)+w.filter(x=>x===0).length)}
  const anchors=ws.map((w,i)=>({i,len:w.length,nonF:w.filter(x=>x!==0).length})).sort((a,b)=>b.nonF-a.nonF||b.len-a.len||a.i-b.i).slice(0,6).sort((a,b)=>a.i-b.i);
  const tables=anchors.map(a=>partial(ws[a.i],dict)),keys=new Set();let joins=0,hashChecks=0,phaseCases=0;
  for(let i=0;i<anchors.length;i++)for(let j=i+1;j<anchors.length;j++){
   const ia=anchors[i].i,ib=anchors[j].i,distance=offsets[ib]-offsets[ia],gap= zeros[ib]-zeros[ia+1];
   for(const [na,as] of tables[i])for(const [nb,bs] of tables[j]){if(Math.min(na,q)+Math.min(nb,q)<18)continue;
    for(let h=0;h<=Math.min(gap,q-1);h++){const phase=((distance-(ws[ia].length-na)-h)%q+q)%q;const pa=[],pb=[],used=new Set(as[0].map((_,x)=>x));
     for(let b=0;b<bs[0].length;b++){const a=(phase+b)%q;used.add(a);if(a<as[0].length){pa.push(a);pb.push(b)}}
     if(fullOnly&&used.size!==q)continue;phaseCases++;
     const map=new Map();for(const a of as){const sig=chars(pa.map(x=>a[x]));let v=map.get(sig);if(!v)map.set(sig,v=[]);v.push(a)}
     for(const b of bs){hashChecks++;const list=map.get(chars(pb.map(x=>b[x])));if(!list)continue;for(const a of list){const key=Array(q).fill(-1);for(let x=0;x<a.length;x++)key[x]=a[x];for(let x=0;x<b.length;x++)key[(phase+x)%q]=b[x];if(fullOnly)assert(key.every(v=>v>=0),"full key");joins++;keys.add(canonical(key))}}
    }
   }
  }
  return {keys,anchors,joins,hashChecks,phaseCases};
 }
 function feasibleStarts(flat,key){const km=Array(29).fill(0);for(let i=0;i<q;i++)if(key[i]>=0)km[key[i]]|=1<<i;let m=all;for(let j=flat.length-1;j>=0;j--){const c=flat[j],back=((m>>>1)|((m&1)<<(q-1)))&~km[c];m=c===0?m|back:back;if(!m)break}return m}
 function scoreWords(ws,key,base,exp,start){
  let states=new Map([[start,{score:0,n:1,prev:null,p:null}]]);
  for(const c of ws){const next=new Map();for(const [phase,head] of states){const p=[];function walk(i,ph){if(i===c.length){const tag=String(p),points=base[p.length].has(tag)?2*p.length:exp[p.length].has(tag)?p.length:0,score=head.score+points,old=next.get(ph);if(!old||score>old.score)next.set(ph,{score,n:head.n,prev:head,p:p.slice()});else if(score===old.score)old.n=Math.min(2,old.n+head.n);return}
   if(c[i]===0){p.push(0);walk(i+1,ph);p.pop()}const v=mod(c[i]-key[ph]);if(v!==0){p.push(v);walk(i+1,(ph+1)%q);p.pop()}}walk(0,phase)}
   if(!next.size)return null;states=next}
  const score=Math.max(...[...states.values()].map(x=>x.score)),best=[...states].filter(([,x])=>x.score===score);let t=best[0][1];const p=[];while(t.p){p.unshift(t.p);t=t.prev}return {score,p,end:best.map(([ph])=>ph),ties:Math.min(2,best.reduce((n,[,x])=>n+x.n,0))}
 }
 function run(label,ws,cut,dict,truth=null,expected=null){
  const exp=expand(dict),prefix=ws.slice(0,cut),flat=prefix.flat(),hold=ws.slice(cut),cand=candidates(prefix,exp);let feasible=0,scored=0,best=null,second=null,oracleSeen=false;const expectedCanonical=expected?canonical(expected):null;
  for(const str of cand.keys){const key=Array.from(str,x=>x.charCodeAt(0)-65),starts=feasibleStarts(flat,key);if(!starts)continue;feasible++;for(let i=0;i<q;i++)if(starts&(1<<i)){const k=key.slice(i).concat(key.slice(0,i));if(expected&&String(k)===String(expected))oracleSeen=true;const v=scoreWords(prefix,k,dict,exp,0);assert(v,"feasibility");scored++;const candidate={key:k,...v};if(!best||v.score>best.score){second=best;best=candidate}else if(!second||v.score>second.score)second=candidate}}
  const display=p=>p.map(w=>w.map(x=>gp.translit[x]).join("")).join(" ");
  let selected=null;if(best){assert(String(encode(best.p,best.key).flat())===String(flat),"prefix replay");selected={key:best.key,score:best.score/(2*flat.length),runner:second?second.score/(2*flat.length):null,baseWords:best.p.filter(w=>dict[w.length].has(String(w))).length,expandedWords:best.p.filter(w=>exp[w.length].has(String(w))).length,prefix:display(best.p),end:best.end,ties:best.ties,correctKey:expected?String(best.key)===String(expected):null,correctPrefix:truth?best.p.flat().filter((v,i)=>v===truth.flat()[i]).length:null};
   // The chosen key and all maximally scoring prefix phases are frozen here.
   selected.continuations=best.end.map(phase=>{const h=scoreWords(hold,best.key,dict,exp,phase);if(!h)return {phase,legal:false};const rot=best.key.slice(phase).concat(best.key.slice(0,phase));assert(String(encode(h.p,rot).flat())===String(hold.flat()),"hold replay");return {phase,legal:true,score:h.score/(2*hold.flat().length),text:display(h.p),correct:truth?h.p.flat().filter((v,i)=>v===truth.flat()[flat.length+i]).length:null,runes:hold.flat().length,ties:h.ties}})}
  return {label,trainRunes:flat.length,holdRunes:hold.flat().length,anchors:cand.anchors,keyClasses:cand.keys.size,joins:cand.joins,hashChecks:cand.hashChecks,phaseCases:cand.phaseCases,feasible,scored,oracleGenerated:expected?cand.keys.has(expectedCanonical):null,oracleSeen,selected};
 }
 const key=i=>Array.from({length:q},(_,j)=>(7*j*j+11*j+3*i+5)%29);
 const controls=[[1,300],[3,500],[4,400]].map(([i,n])=>{const k=key(i),w=solved[i],c=encode(w,k);return run(native.sections[i].name,c,cutAt(c,n).cut,buildLexicon(i),w,k)});
 const i=5,k=[0,10,4,0,1,19,0,18,4,18,9,0,18],c=cipherSections[i];controls.push(run("authentic second KOAN",c,cutAt(c,219).cut,buildLexicon(i),solved[i],k));
 // Control gate: >=3/4 exact keys with an exact selected continuation, including the genuine KOAN.
 const pass=controls.filter(x=>x.selected?.correctKey&&x.selected.continuations.some(y=>y.legal&&y.correct===y.runes)).length;
 let target=null;if(pass>=3&&controls.at(-1).selected?.correctKey){
 const begin=gp.pages.slice(0,23).reduce((n,p)=>n+p.indices.length,0),end=gp.pages.slice(0,27).reduce((n,p)=>n+p.indices.length,0);let off=0;const ws=originalWords.filter(w=>{const i=off;off+=w.length;return i>=begin&&off<=end});assert(ws.flat().length===1021,"source");
 const cut=cutAt(ws,500).cut,base=buildLexicon(-1),exp=expand(base),prefix=ws.slice(0,cut);
 target=run("original p23-26",ws,cut,base);
 // Extend the exact same joins to every partial coverage. Unknown key slots
 // may change arbitrarily on each use in the following relaxed reachability.
 const partial=candidates(prefix,exp,false),hist={},relaxed={};const partialWitnesses=[];
 for(const k of partial.keys){const n=[...k].filter(x=>x==="@").length;hist[n]=(hist[n]||0)+1;const key=[...k].map(x=>x.charCodeAt(0)-65),ph=feasibleStarts(prefix.flat(),key);if(ph)relaxed[n]=(relaxed[n]||0)+1;if(n)partialWitnesses.push({key,feasibleStartMask:ph})}
 assert(Object.keys(relaxed).length===0,"all partial and full anchor candidates fail relaxed reachability");
 const old=JSON.parse(inputs[7]).target.after.edges,edgeMap=new Map(old.map(e=>[String(e),e])),indices=partial.anchors.map(a=>a.i);
 for(let a=0;a<indices.length;a++)for(let b=a+1;b<indices.length;b++){const e=[indices[a],indices[b]];edgeMap.set(String(e),e)}
 const edges=[...edgeMap.values()].sort((a,b)=>a[0]-b[0]||a[1]-b[1]),covers=new Map();
 function enumerate(es,chosen){if(chosen.size>6)return;if(!es.length){const v=[...chosen].sort((a,b)=>a-b);covers.set(String(v),v);return}for(const u of es[0]){const next=new Set(chosen);next.add(u);enumerate(es.filter(e=>!e.includes(u)),next)}}
 enumerate(edges,new Set());
 assert(covers.size===4&&[...covers.values()].every(c=>c.length===6),"exact size-six covers");
 const engine=createSolver(q,exp),runs=[...covers.values()].map(c=>{const a=engine.solve(prefix,{limit:3000,wildcard:new Set(c)});return {c,keys:a.keys.length,exact:a.exact,exhausted:a.exhausted,nodes:a.nodes,passes:a.passes,failure:a.failure}});
 const rejected=runs.every(a=>a.exact&&!a.keys&&!a.exhausted);
 target.anchorConstraint={hist,relaxed,partialWitnesses,phaseCases:partial.phaseCases,joins:partial.joins,indices,mandatoryOOVAmongSix:5,edges,runs,certifiedOOVLowerBound:rejected?7:6};
 }
 return {controls,pass,target};
}

const fs=require("node:fs"),path=require("node:path");
const files=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/control/english_wordfreq_textblob.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/transcriptions/lp1_wulfic_canonical.txt","im-results/lp2-p23-26-orthographic-escape-output.json"];
console.log(JSON.stringify(experiment(files.map(p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8"))),null,2));
