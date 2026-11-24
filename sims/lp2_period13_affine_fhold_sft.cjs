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


 function allSlopes(prefix,dict){const results=[];for(let a=1;a<29;a++){const x=createSolver(13,dict,a).solve(prefix,{limit:3000});results.push({a,keys:x.keys.map(v=>({key:v.key,p:v.p,paths:v.paths,endPhases:v.endPhases})),exact:x.exact,exhausted:x.exhausted,nodes:x.nodes,passes:x.passes,rowVisits:x.rowVisits,initialRows:x.initialRows,failure:x.failure})}return results}
 function run(label,ws,cut,dict,truth,actualKey,actualSlope){const fit=ws.slice(0,cut),results=allSlopes(fit,dict);const survivors=results.flatMap(x=>x.keys.map(y=>({...y,a:x.a})));const out={label,trainWords:cut,trainRunes:fit.flat().length,held:ws.slice(cut).flat().length,vocabulary:dict.reduce((n,d)=>n+d.size,0),survivingSlopes:results.filter(x=>x.keys.length).map(x=>x.a),exhausted:results.filter(x=>x.exhausted).map(x=>x.a),allExact:results.every(x=>x.exact),results:results.map(x=>({...x,keys:x.keys.map(({p,...y})=>y)}))};if(survivors.length===1&&!out.exhausted.length){const s=survivors[0];out.selected={a:s.a,key:s.key,paths:s.paths,endPhases:s.endPhases};if(truth){out.exactSlope=s.a===actualSlope;out.exactKey=String(s.key)===String(actualKey);out.prefixMatches=s.p.flat().filter((v,i)=>v===truth.flat()[i]).length}
 if(s.endPhases.length===1){const h=decodeFixed(ws.slice(cut),s.key,dict,s.endPhases[0],s.a);if(h){out.continuation={score:h.score,paths:h.paths,plain:h.p.map(w=>w.map(v=>gp.translit[v]).join("")).join(" "),replay:String(encode(s.p.concat(h.p),s.key,s.a).flat())===String(ws.flat())};if(truth)out.continuation.matches=h.p.flat().filter((v,i)=>v===truth.slice(cut).flat()[i]).length}}}return out}
 const rng=seed=>()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0};
 function plant(i,a,seed){const rand=rng(seed),key=Array.from({length:13},()=>rand()%29),truth=solved[i],dict=buildLexicon(i),{cut}=cutAt(truth,155);return run("plant "+native.sections[i].name+" a="+a,encode(truth,key,a),cut,dict,truth,key,a)}
 const mode=process.argv[2]||"all";
 if(mode==="control1"||mode==="all"){const {cut}=cutAt(cipherSections[5],155);const control=run("authentic KOAN2",cipherSections[5],cut,buildLexicon(5),solved[5],[0,10,4,0,1,19,0,18,4,18,9,0,18],1);if(mode==="control1")return control;if(!control.exactSlope||!control.exactKey||control.continuation?.matches!==control.held)throw Error("control1 failed")}
 if(mode==="control2"||mode==="all"){const control=plant(3,7,0x25540007);if(mode==="control2")return control;if(String(control.survivingSlopes)!=="7"||control.exhausted.length)throw Error("control2 slope failed")}
 if(mode==="control3"||mode==="all"){const control=plant(5,17,0x25540017);if(mode==="control3")return control;if(!control.exactSlope||!control.exactKey||control.continuation?.matches!==control.held)throw Error("control3 failed")}
 if(mode==="control4"){return plant(4,11,0x25540011)}
 const ws=originalWords.slice(-66);assert(ws.flat().length===308&&String(ws.flat())===String(gp.pages.slice(54,56).flatMap(x=>x.indices)),"target original");const {cut,n}=cutAt(ws,205);assert(n===205,"frozen split");return run("p54–55",ws,cut,buildLexicon(-1));
}
const fs=require("node:fs"),path=require("node:path");const files=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/control/english_wordfreq_textblob.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/transcriptions/lp1_wulfic_canonical.txt"];
console.log(JSON.stringify(experiment(files.map(p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8"))),null,2));
