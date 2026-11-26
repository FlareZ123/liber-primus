"use strict";
// Exact count-free prime/index self-word feedback with literal plaintext-F bypass.
const fs=require("node:fs"),path=require("node:path");
const paths=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/english_wordfreq_textblob.txt","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];
function experiment(raw){
 const gp=JSON.parse(raw[0]),gold=JSON.parse(raw[1]),rune=new Map(gp.runes.map((x,i)=>[x,i])),mod=x=>(x%29+29)%29,key=w=>String.fromCharCode(...w.map(x=>65+x));
 const assert=(x,m)=>{if(!x)throw Error(m)},tokens=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
 function enc(w,alt){w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const p=[];for(let j=0;j<w.length;){const v=alt&&w.startsWith("ING",j)?{t:"ING",i:21}:alt&&w.startsWith("IO",j)?{t:"IO",i:27}:tokens.find(x=>w.startsWith(x.t,j));if(!v)return null;p.push(v.i);j+=v.t.length}return p}
 function native(t){const a=/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t),b=/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t);return (t.slice(a?a.index+a[0].length:0,b?b.index:t.length).match(/[A-Za-z]+/g)||[]).map(w=>enc(w,true)).filter(w=>w&&w.length<=14)}
 const donors=raw.slice(3).map(native),vocab=new Map();
 function add(w,f){if(w&&w.length&&w.length<=24){const k=key(w);vocab.set(k,Math.max(f,vocab.get(k)||0))}}
 for(const line of raw[2].split(/\r?\n/)){const m=/^([A-Za-z]+)\s+(\d+)$/.exec(line);if(m)for(const alt of [true,false])add(enc(m[1],alt),+m[2])}
 for(const ws of donors)for(const w of ws.slice(0,Math.floor(ws.length*.8)))add(w,1);
 for(const s of gold.sections)for(const w of s.source_text.match(/[\u16a0-\u16ff]+/g)||[])add(Array.from(w,c=>rune.get(c)),1);
 for(let i=0;i<29;i++)add([i],1);assert(vocab.size===35938,"vocab");
 const logTotal=Math.log([...vocab.values()].reduce((s,f)=>s+f+1,0)),lf=new Map([...vocab].map(([k,f])=>[k,Math.log(f+1)-logTotal]));
 const val=(p,kind)=>kind==="prime"?gp.prime[p]:p;
 function sender(words,src,sign,kind){let state=0,C=[],holds=0;for(const w of words){const c=w.map(p=>{if(p===0){if(state!==0)holds++;return 0}return mod(p+sign*state)});C.push(...c);state=(src==="dw"?w:c).reduce((s,x)=>s+val(x,kind),0)%29}return{C,holds}}
 // Enumerate every legal plaintext word, including every visible-F ambiguity.
 // The state is the prior selected gematria sum, and no true lengths/count enter.
 function solve(C,src,sign,kind,cap=24){
  const N=C.length,dp=new Float64Array((N+1)*29);dp.fill(-Infinity);dp[0]=0;
  const prev=new Int32Array(dp.length),trace=new Array(dp.length);let transitions=0;
  for(let i=0;i<N;i++)for(let s=0;s<29;s++){
   const z=i*29+s,v=dp[z];if(!Number.isFinite(v))continue;
   function visit(j,p,plainSum,cipherSum){
    if(j>i){transitions++;const next=(src==="dw"?plainSum:cipherSum)%29,score=lf.get(p)??(-18-3.5*(j-i)),at=j*29+next;
     if(v+score>dp[at]){dp[at]=v+score;prev[at]=z;trace[at]=p}}
    if(j===N||j-i===cap)return;
    const x=C[j],y=mod(x-sign*s),cc=cipherSum+val(x,kind);
    if(y!==0)visit(j+1,p+String.fromCharCode(65+y),plainSum+val(y,kind),cc);
    if(x===0)visit(j+1,p+"A",plainSum+val(0,kind),cc);
   }
   visit(i,"",0,0);
  }
  let z=N*29;for(let s=1;s<29;s++)if(dp[N*29+s]>dp[z])z=N*29+s;
  if(!Number.isFinite(dp[z]))return{score:null,transitions};
  const score=dp[z]/N,ws=[];while(z){assert(trace[z],"trace");ws.push(Array.from(trace[z],c=>c.charCodeAt(0)-65));z=prev[z]}ws.reverse();
  assert(sender(ws,src,sign,kind).C.join(",")===C.join(","),"replay");
  return{score,ws,groups:ws.length,oov:ws.filter(w=>!vocab.has(key(w))).length,transitions};
 }
 function bounds(ws){let n=0;return new Set(ws.map(w=>(n+=w.length)))}
 const cells=[];for(const kind of ["prime","index"])for(const src of ["dw","cw"]){
  const controls=[];for(let d=0;d<donors.length;d++){
   const ws=[];let n=0;for(const w of donors[d].slice(Math.floor(donors[d].length*.94))){if(n+w.length>262)break;ws.push(w);n+=w.length}
   const sign=d===1?-1:1,{C,holds}=sender(ws,src,sign,kind);
   const best=[-1,1].map(s=>({sign:s,...solve(C,src,s,kind)})).filter(x=>x.score!==null).sort((a,b)=>b.score-a.score)[0];
   const A=bounds(ws),B=bounds(best.ws),correct=best.ws.flat().filter((x,i)=>x===ws.flat()[i]).length,F1=2*[...A].filter(i=>B.has(i)).length/(A.size+B.size);
   controls.push({donor:d,runes:n,truthGroups:ws.length,truthOov:ws.filter(w=>!vocab.has(key(w))).length,holds,trueSign:sign,selectedSign:best.sign,correct,F1,score:best.score,oov:best.oov,groups:best.groups});
  }
  const passed=controls.every(c=>c.correct/c.runes>=.95&&c.F1>=.90&&c.trueSign===c.selectedSign&&c.holds>0);
  const original=[];if(passed){
   const first=gp.pages[0].indices,best=[-1,1].map(s=>({sign:s,...solve(first,src,s,kind)})).filter(x=>x.score!==null).sort((a,b)=>b.score-a.score)[0];
   if(best)for(let page=0;page<=5;page++){const C=gp.pages[page].indices,x=page===0?best:solve(C,src,best.sign,kind);original.push({page,sign:best.sign,n:C.length,score:x.score,groups:x.groups,oov:x.oov,transitions:x.transitions,plaintext:x.ws?.map(w=>w.map(p=>gp.translit[p]).join("")).join(" "),runeGroups:x.ws})}
  }
  cells.push({kind,src,controls,passed,original});
 }
 return{register:vocab.size,cells};
}
if(require.main===module)console.log(JSON.stringify(experiment(paths.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8"))),null,2));
module.exports={experiment};
