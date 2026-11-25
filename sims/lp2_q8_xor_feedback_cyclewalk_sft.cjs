"use strict";
/** Agent9: continuous q8 ciphertext-feedback XOR cycle-walk; exact lexical anchor CSP. Read-only. */
const fs=require("node:fs"),path=require("node:path");
function experiment(raw){
 const gp=JSON.parse(raw[0]),gold=JSON.parse(raw[1]),ix=new Map(gp.runes.map((x,i)=>[x,i])),tokens=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
 const check=(v,m)=>{if(!v)throw Error(m)},same=(a,b)=>a.length===b.length&&a.every((v,i)=>v===b[i]),id=w=>String.fromCharCode(...w.map(x=>65+x)),nums=s=>Array.from(s,x=>x.charCodeAt(0)-65);
 function word(w,alt=true){w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const o=[];for(let j=0;j<w.length;){const q=alt&&w.startsWith("ING",j)?{t:"ING",i:21}:alt&&w.startsWith("IO",j)?{t:"IO",i:27}:tokens.find(o=>w.startsWith(o.t,j));if(!q)throw Error("native "+w);o.push(q.i);j+=q.t.length;}return o;}
 function body(t){const a=/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t),b=/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t);return t.slice(a?a.index+a[0].length:0,b?b.index:t.length);}
 const donors=raw.slice(2,5).map(t=>(body(t).toUpperCase().match(/[A-Z]+/g)||[]).map(w=>word(w))),training=donors.map(w=>w.slice(0,Math.floor(w.length*.8)));
 for(const s of gold.sections)if(!["0_welcome","jpg107-167"].includes(s.name))training.push((s.source_text.match(/[\u16a0-\u16ff]+/gu)||[]).map(t=>[...t].map(x=>ix.get(x))).filter(w=>w.every(Number.isInteger)));
 const types=new Set(Array.from({length:29},(_,x)=>String.fromCharCode(65+x)));
 for(const a of training)for(const w of a)if(w.length&&w.length<=24)types.add(id(w));
 for(const ln of raw[5].split(/\r?\n/)){const m=ln.match(/^([a-z]+)\s+(\d+)$/i);if(!m)continue;for(const alt of [true,false]){const k=id(word(m[1],alt));if(k.length<=24)types.add(k);}}
 check(types.size===35944,"same frozen 35944-form register");
 const byLen=new Map();for(const w of types){if(!byLen.has(w.length))byLen.set(w.length,[]);byLen.get(w.length).push(nums(w));}
 const orig=[];let w=[];for(const x of raw[6].split("%").slice(0,55).join("%")){if(ix.has(x))w.push(ix.get(x));else if(x!=="%"&&x!=="/"&&!/\s/u.test(x)&&w.length){orig.push(w);w=[];}}if(w.length)orig.push(w);
 const full=gp.pages.filter(x=>x.page<56).flatMap(x=>x.indices);check(orig.length===2896&&same(orig.flat(),full),"exact original transcript");
 let off=0;const rows=[];for(const w of orig){if(off>=12657)rows.push({start:off-12657,len:w.length});off+=w.length;}
 const ct=full.slice(12657);check(ct.length===299&&rows.length===64,"terminal body shape");
 const fitRows=rows.filter(w=>w.start+w.len<=223);check(fitRows.length===47&&fitRows.at(-1).start+fitRows.at(-1).len===213,"p54 complete-body groups only");
 const withheld=rows.slice(fitRows.length),budget=Math.floor(.05*fitRows.length);
 // One-step XOR or two-step return if the first step leaves the GP29 register.
 const f=(x,m)=>{const y=x^m;return y<29?y:x;};
 let fixedPointCases=0,repeatChecks=0;
 for(let x=0;x<29;x++)for(let m=0;m<32;m++){check(f(f(x,m),m)===x,"involution all inputs");if((x^m)>=29){check(f(x,m)===x,"invalid-code return");fixedPointCases++;}}
 const masks=Array.from({length:29},(_,prev)=>Array.from({length:29},(_,c)=>Array.from({length:29},()=>0)));
 for(let prev=0;prev<29;prev++)for(let c=0;c<29;c++)for(let k=0;k<29;k++){const p=f(c,k^prev);masks[prev][c][p]|=1<<k;check((c===prev)===(p===k),"repeat equivalence");repeatChecks++;}
 const encode=(p,k)=>{let prev=0;return p.map((x,i)=>(prev=f(x,k[i%8]^prev)));};
 const decode=(c,k)=>c.map((x,i)=>f(x,k[i%8]^(i?c[i-1]:0)));
 function fit(c){
  const anchors=fitRows.filter(w=>w.len>=8).sort((a,b)=>b.len-a.len||a.start-b.start).slice(0,budget+1);
  check(anchors.length===budget+1,"at least one complete lexical anchor");
  const candidates=new Map(),stats=[];
  for(const a of anchors){
   let words=0,assignments=0;
   for(const p of byLen.get(a.len)||[]){
    const dom=Array(8).fill((1<<29)-1);
    for(let j=0;j<a.len;j++){const i=a.start+j,phase=i%8;dom[phase]&=masks[i?c[i-1]:0][c[i]][p[j]];if(!dom[phase])break;}
    if(dom.some(v=>!v))continue;words++;
    const k=Array(8);
    function visit(j){if(j===8){assignments++;const s=id(k);if(!candidates.has(s))candidates.set(s,[...k]);return;}let m=dom[j];while(m){const lo=m&-m;k[j]=31-Math.clz32(lo);visit(j+1);m^=lo;}}
    visit(0);
   }
   stats.push({start:a.start,len:a.len,lexicalMatches:words,assignments});
  }
  const order=[...fitRows].sort((a,b)=>b.len-a.len||a.start-b.start);
  const survivors=[],failHistogram=Array(order.length+1).fill(0);
  let bestOOV=Infinity,bestKey=null;
  for(const k of candidates.values()){let bad=0,used=0;for(const w of order){const p=[];for(let j=0;j<w.len;j++){const i=w.start+j;p.push(f(c[i],k[i%8]^(i?c[i-1]:0)));}used++;if(!types.has(id(p))&&++bad>budget)break;}failHistogram[used]++;if(bad<bestOOV){bestOOV=bad;bestKey=k;}if(bad<=budget)survivors.push({key:k,bad});}
  return {anchors:stats,candidates:candidates.size,survivors,bestOOV,bestKey,failHistogram};
 }
 function evaluate(c,k,truth=null){const p=decode(c,k);check(same(encode(p,k),c),"exact continuous replay");const words=withheld.map(w=>({start:w.start,len:w.len,word:id(p.slice(w.start,w.start+w.len)),covered:types.has(id(p.slice(w.start,w.start+w.len)))}));return {withheldCovered:words.filter(w=>w.covered).length,withheldWords:words,withheldCorrect:truth?p.slice(213).filter((x,i)=>x===truth[213+i]).length:null,fullCorrect:truth?p.filter((x,i)=>x===truth[i]).length:null,plain:p};}
 let seed=2818;function R(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed;}
 const controls=[];
 for(let d=0;d<3;d++){
  const tail=donors[d].slice(Math.floor(donors[d].length*.8)),pool=new Map();for(const w of tail)if(types.has(id(w))){if(!pool.has(w.length))pool.set(w.length,[]);pool.get(w.length).push(w);}
  const p=rows.flatMap(w=>{const a=pool.get(w.len);return a?.length?a[R()%a.length]:byLen.get(w.len)[R()%byLen.get(w.len).length];});
  const key=Array.from({length:8},()=>R()%29),c=encode(p,key);check(same(decode(c,key),p),"planted direct replay");
  const fits=fit(c),valid=fits.survivors.filter(x=>same(x.key,key)),evaluated=fits.survivors.map(x=>({...x,...evaluate(c,x.key,p)}));
  controls.push({donor:d,key,fit:fits,exactKeyCount:valid.length,evaluated,fixedPointUses:c.filter((v,i)=>((p[i]^(key[i%8]^(i?c[i-1]:0)))>=29)).length});
 }
 const calibration=controls.every(x=>x.exactKeyCount===1&&x.fit.survivors.length===1&&x.evaluated[0].fullCorrect===299);
 const original=calibration?fit(ct):null;
 const evaluated=original?.survivors.map(x=>({...x,...evaluate(ct,x.key)}))||[];
 const pad=ct.map(()=>R()%29),padFit=fit(pad);
 return {register:types.size,bodyLength:ct.length,fitGroups:fitRows.length,withheldGroups:withheld.length,budget,controls,calibration,original,evaluated,pad:{candidates:padFit.candidates,survivors:padFit.survivors},fixedPointCases,repeatChecks};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/english_wordfreq_textblob.txt","resources/transcriptions/lp2-image-corrected.txt"];
console.log(JSON.stringify(experiment(paths.map(p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8"))),null,2));
