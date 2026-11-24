"use strict";
const {createSolver,encode,decodeFixed}=require("./lp2_fhold_word_relation_csp.cjs");
/** @param {string[]} inputs */
function experiment(inputs){
 const [gp,trans,lex,native]=[JSON.parse(inputs[0]),inputs[1],inputs[2],JSON.parse(inputs[3])];
 const assert=(x,m)=>{if(!x)throw Error(m)},map=new Map(gp.runes.map((r,i)=>[r,i])),alpha=new Map(gp.translit.map((s,i)=>[s,i]));
 const parse=s=>(s.replace(/[\s/%]/g,"").match(/[\u16a0-\u16ff]+/g)||[]).map(w=>Array.from(w,x=>map.get(x)));
 const originalWords=parse(trans).slice(0,2896);assert(String(originalWords.flat())===String(gp.pages.slice(0,56).flatMap(p=>p.indices)),"original source");
 const solved=native.sections.map(s=>(s.source_text.replace(/['’]/g,"").match(/[\u16a0-\u16ff]+/g)||[]).map(w=>Array.from(w,x=>map.get(x))));
 const cipherSections=inputs[6].split("$").map(parse);
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
 function summary(x){return {...x,keys:x.keys.map(v=>({key:v.key,paths:v.paths,endPhases:v.endPhases,runes:v.p.flat().length}))}}


 /** Optimistic pairwise word compatibility with arbitrary legal intervening F holds. */
 function conflictBound(ws,period,dict,minLength=4,slope=1){
  const mod=(x,n)=>(x%n+n)%n,groups=[],start=[],zeros=[0];let offset=0;
  for(const c of ws){start.push(offset);offset+=c.length;zeros.push(zeros.at(-1)+c.filter(v=>v===0).length);const a=new Map();
   if(c.length>=minLength)for(const p of (dict[c.length]||new Map()).values()){const d=[];let legal=true;for(let i=0;i<c.length;i++){if(p[i]===0){if(c[i]!==0){legal=false;break}}else d.push(mod(c[i]-slope*p[i],29))}if(!legal||d.some((v,i)=>i>=period&&v!==d[i%period]))continue;
    const holds=c.length-d.length;if(!a.has(holds))a.set(holds,[]);a.get(holds).push(d.slice(0,period))}
   groups.push(a)
  }
  const eligible=ws.flatMap((w,i)=>w.length>=minLength?[i]:[]),mandatory=eligible.filter(i=>!groups[i].size),edges=[];
  function compatible(i,j){const gapF=zeros[j]-zeros[i+1],distance=start[j]-start[i];
   for(const [ha,as] of groups[i])for(const [hb,bs] of groups[j])for(let h=0;h<=Math.min(gapF,period-1);h++){
    const phase=mod(distance-ha-h,period),pairs=[];for(let b=0;b<bs[0].length;b++){const a=mod(phase+b,period);if(a<as[0].length)pairs.push([a,b])}
    if(!pairs.length)return true;const sig=(row,k)=>pairs.map(p=>row[p[k]]).join(",");const hashes=new Set(as.map(a=>sig(a,0)));if(bs.some(b=>hashes.has(sig(b,1))))return true
   }return false
  }
  for(let a=0;a<eligible.length;a++){const i=eligible[a];if(!groups[i].size)continue;for(let b=a+1;b<eligible.length;b++){const j=eligible[b];if(groups[j].size&&!compatible(i,j))edges.push([i,j])}}
  let best=edges.length,bestCover=null,nodes=0;const memo=new Map();
  function cover(es,chosen){nodes++;const n=chosen.length;if(!es.length){if(n<=best){best=n;bestCover=chosen.slice()}return}if(n>=best)return;const used=new Set();let matching=0;for(const [u,v] of es)if(!used.has(u)&&!used.has(v)){used.add(u);used.add(v);matching++}if(n+matching>best)return;const id=es.map(e=>e.join(":")).join(",");if((memo.get(id)??Infinity)<=n)return;memo.set(id,n);const deg=new Map();for(const [u,v] of es){deg.set(u,(deg.get(u)||0)+1);deg.set(v,(deg.get(v)||0)+1)}const v=[...deg].sort((a,b)=>b[1]-a[1])[0][0],neigh=new Set(es.filter(e=>e.includes(v)).map(e=>e[0]===v?e[1]:e[0]));cover(es.filter(e=>!e.includes(v)),[...chosen,v]);cover(es.filter(e=>!e.some(u=>neigh.has(u))),[...chosen,...neigh])}
  cover(edges,[]);return {eligible:eligible.length,minLength,mandatory,edges,minimumOOVLowerBound:mandatory.length+best,cover:bestCover,nodes};
 }

 function allSlopes(prefix,dict){const results=[];for(let a=1;a<29;a++){const x=createSolver(13,dict,a).solve(prefix,{limit:3000});results.push({a,keys:x.keys.map(v=>({key:v.key,p:v.p,paths:v.paths,endPhases:v.endPhases})),exact:x.exact,exhausted:x.exhausted,nodes:x.nodes,passes:x.passes,rowVisits:x.rowVisits,initialRows:x.initialRows,failure:x.failure})}return results}
 function run(label,ws,cut,dict,truth,actualKey,actualSlope){const fit=ws.slice(0,cut),results=allSlopes(fit,dict);const survivors=results.flatMap(x=>x.keys.map(y=>({...y,a:x.a})));const out={label,trainWords:cut,trainRunes:fit.flat().length,held:ws.slice(cut).flat().length,vocabulary:dict.reduce((n,d)=>n+d.size,0),truthOOV:truth?truth.slice(0,cut).flatMap((w,i)=>dict[w.length].has(String(w))?[]:[i]):undefined,survivingSlopes:results.filter(x=>x.keys.length).map(x=>x.a),exhausted:results.filter(x=>x.exhausted).map(x=>x.a),allExact:results.every(x=>x.exact),results:results.map(x=>({...x,keys:x.keys.map(({p,...y})=>y)}))};if(survivors.length===1&&!out.exhausted.length){const s=survivors[0];out.selected={a:s.a,key:s.key,paths:s.paths,endPhases:s.endPhases};if(truth){out.exactSlope=s.a===actualSlope;out.exactKey=String(s.key)===String(actualKey);out.prefixMatches=s.p.flat().filter((v,i)=>v===truth.flat()[i]).length}
 if(s.endPhases.length===1){const h=decodeFixed(ws.slice(cut),s.key,dict,s.endPhases[0],s.a);if(h){out.continuation={score:h.score,paths:h.paths,plain:h.p.map(w=>w.map(v=>gp.translit[v]).join("")).join(" "),replay:String(encode(s.p.concat(h.p),s.key,s.a).flat())===String(ws.flat())};if(truth)out.continuation.matches=h.p.flat().filter((v,i)=>v===truth.slice(cut).flat()[i]).length}}}return out}
 const rng=seed=>()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0};
 function plant(i,a,seed){const rand=rng(seed),key=Array.from({length:13},()=>rand()%29),truth=solved[i],dict=buildLexicon(i),{cut}=cutAt(truth,155);return run("plant "+native.sections[i].name+" a="+a,encode(truth,key,a),cut,dict,truth,key,a)}
 const mode=process.argv[2]||"all";
 if(mode==="control1"||mode==="all"){const {cut}=cutAt(cipherSections[5],155);const control=run("authentic KOAN2",cipherSections[5],cut,buildLexicon(5),solved[5],[0,10,4,0,1,19,0,18,4,18,9,0,18],1);if(mode==="control1")return control;if(!control.exactSlope||!control.exactKey||control.continuation?.matches!==control.held)throw Error("control1 failed")}
 if(mode==="control2"||mode==="all"){const control=plant(3,7,0x25540007);if(mode==="control2")return control;if(String(control.survivingSlopes)!=="7"||control.exhausted.length)throw Error("control2 slope failed")}
 if(mode==="control3"||mode==="all"){const control=plant(5,17,0x25540017);if(mode==="control3")return control;if(!control.exactSlope||!control.exactKey||control.continuation?.matches!==control.held)throw Error("control3 failed")}
 if(mode==="control4"){return plant(4,11,0x25540011)}
 const ws=originalWords.slice(-66);assert(ws.flat().length===308&&String(ws.flat())===String(gp.pages.slice(54,56).flatMap(x=>x.indices)),"target original");const {cut,n}=cutAt(ws,205);assert(n===205,"frozen split");const dict=buildLexicon(-1),out=run("p54–55",ws,cut,dict);out.relaxed=Array.from({length:28},(_,i)=>{const a=i+1,x=conflictBound(ws.slice(0,cut),13,dict,4,a);return {a,eligible:x.eligible,mandatory:x.mandatory.length,edges:x.edges.length,minimumOOVLowerBound:x.minimumOOVLowerBound,nodes:x.nodes}});return out;
}
const fs=require("node:fs"),path=require("node:path");const files=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/control/english_wordfreq_textblob.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/transcriptions/lp1_wulfic_canonical.txt"];
console.log(JSON.stringify(experiment(files.map(p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8"))),null,2));
