"use strict";
const fs=require("node:fs"),path=require("node:path");
const files=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/base60-grid.json","resources/liber-primus/lp2-transcription.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/gibran_prophet_58585.txt","resources/control/english_wordfreq_textblob.txt","resources/external/relikd-solved-gp29-native-v1.json"];
function experiment(raw){
 const gp=JSON.parse(raw[0]),grid=JSON.parse(raw[1]),gold=JSON.parse(raw[7]),Q=29,L=24,mod=x=>(x%Q+Q)%Q,idx=new Map(gp.runes.map((x,i)=>[x,i])),S=gp.translit,tokens=S.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
 const id=w=>String.fromCharCode(...w.map(x=>65+x)),view=w=>w.map(x=>S[x]).join("");
 function word(w,alt=true){w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const o=[];for(let j=0;j<w.length;){const q=alt&&w.startsWith("ING",j)?{t:"ING",i:21}:alt&&w.startsWith("IO",j)?{t:"IO",i:27}:tokens.find(o=>w.startsWith(o.t,j));if(!q)throw Error(w);o.push(q.i);j+=q.t.length;}return o}
 function body(t){const a=/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t),b=/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t);return t.slice(a?a.index+a[0].length:0,b?b.index:t.length)}
 const words=t=>(body(t).toUpperCase().match(/[A-Z]+/g)||[]).map(w=>word(w));
 const train=raw.slice(3,5).map(words);
 for(const s of gold.sections)if(!["0_welcome","jpg107-167"].includes(s.name))train.push((s.source_text.match(/[\u16a0-\u16ff]+/gu)||[]).map(t=>[...t].map(x=>idx.get(x))).filter(w=>w.every(Number.isInteger)));
 const counts=new Map(),ext=new Map(),uni=Array(Q).fill(.5);let total=0,et=0;
 for(const a of train)for(const w of a)if(w.length&&w.length<=L){const k=id(w);counts.set(k,(counts.get(k)||0)+1);total++;for(const x of w)uni[x]++}
 for(const l of raw[6].split(/\r?\n/)){const m=l.match(/^([a-z]+)\s+(\d+)$/i);if(!m)continue;const v=[...new Set([id(word(m[1])),id(word(m[1],false))])].filter(k=>k.length<=L);for(const k of v){const f=+m[2]/v.length;ext.set(k,(ext.get(k)||0)+f);et+=f}}
 const singleton=new Set(["A","I","O","T"].map(w=>id(word(w))));const types=new Set([...counts.keys(),...ext.keys()]);for(const k of types)if(k.length===1&&!singleton.has(k))types.delete(k);
 const lex=new Map();for(const k of types)lex.set(k,Math.log(.95*(.85*(counts.get(k)||0)/total+.149*(ext.get(k)||0)/et+.001/types.size)));
 const us=uni.reduce((a,b)=>a+b,0),logu=uni.map(x=>Math.log(x/us)),supp=1-.664/3.448,lnN=Math.log(supp/28),lnR=Math.log(1-supp);
 const C=gp.pages[55].indices;const chunks=raw[2].split("%");const part=chunks.find(c=>[...c].filter(x=>idx.has(x)).map(x=>idx.get(x)).join()===C.join());if(!part)throw Error("p55 text not aligned");
 const W=(part.replace(/[/\r\n]/g,"").match(/[\u16a0-\u16ff]+/gu)||[]).map(w=>[...w].map(x=>idx.get(x)));if(W.flat().join()!==C.join()||W.length!==17||W[0].length!==1)throw Error("group alignment "+JSON.stringify(W.map(w=>w.length)));
 const xy=[];for(let c=0;c<8;c++)xy.push([0,c]);for(let r=1;r<32;r++)xy.push([r,7]);for(let c=6;c>=0;c--)xy.push([31,c]);for(let r=30;r>=1;r--)xy.push([r,0]);if(xy.length!==76)throw Error("ring");
 const a59=grid.alphabet.replace("f",""),K60=xy.map(([r,c])=>mod(grid.byte_rows[r][c])),K59=xy.map(([r,c])=>{const [a,b]=grid.rows[r][c];if(!a59.includes(a)||!a59.includes(b))throw Error("59 token");return mod(59*a59.indexOf(a)+a59.indexOf(b))});
 function edges(C,K){return C.map((c,i)=>{const prev=C[i-1],e=[{end:i+1,p:mod(c-K[i]),w:i&&c===prev?lnR:0}];if(i&&c!==prev){const p=mod(prev-K[i]);let w=0;for(let j=i;j<C.length;j++){const x=mod(p+K[j]);if(x===C[j]){e.push({end:j+1,p,w:w+(x===C[j-1]?lnR:0)});break}if(x!==C[j-1]||C[j]===C[j-1])break;w+=lnN}}return e})}
 function score(w){const k=id(w);if(lex.has(k))return {o:0,s:lex.get(k)};return {o:1,s:Math.log(.05)-Math.log(L)+w.reduce((n,x)=>n+logu[x],0)}}
 function decode(C,K,groups){
  const E=edges(C,K),n=C.length;const paths=Array(n+1).fill(0n);paths[0]=1n;for(let i=0;i<n;i++)for(const e of E[i])paths[e.end]+=paths[i];
  function walk(start,stop,cb){function rec(i,w,ev,s){if(w.length){cb(i,w,ev,s);if(w.length===L)return}if(i===stop)return;for(const e of E[i])if(e.end<=stop)rec(e.end,[...w,e.p],[...ev,{start:i,...e}],s+e.w)}rec(start,[],[],0)}
  const mk=(a,b)=>!a||b.o<a.o||b.o===a.o&&b.s>a.s; 
  function solve(fixed){const D=Array(n+1).fill(null);D[0]={o:0,s:0,words:[],ev:[]};let ends=new Map(),next=0;for(const len of groups){ends.set(next,next+len);next+=len;}for(let i=0;i<n;i++){const a=D[i];if(!a)continue;const stop=fixed?ends.get(i):n;if(stop===undefined)continue;
   if(i===0){const e=E[0][0];D[1]={o:0,s:e.w,words:[[e.p]],ev:[{start:0,...e}]};continue;}
   walk(i,stop,(j,w,ev,s)=>{if(fixed&&j!==stop)return;if(w.length===1&&!singleton.has(id(w))&&!fixed)return;const t=score(w),b={o:a.o+t.o,s:a.s+s+t.s,words:[...a.words,w],ev:[...a.ev,...ev]};if(mk(D[j],b))D[j]=b});
  }
  const d=D[n];if(!d)return null;let i=0;for(const e of d.ev){if(e.start!==i)throw Error("continuity");for(;i<e.end-1;i++)if(i===0||mod(e.p+K[i])!==C[i-1]||C[i]===C[i-1])throw Error("null replay");if(mod(e.p+K[i])!==C[i])throw Error("real replay");i++}if(i!==n)throw Error("length");
  return {oov:d.o,score:d.s/n,words:d.words.map(view),P:d.words.flat(),nulls:n-d.ev.length};
  }
  return {paths:paths[n].toString(),nullStarts:E.filter(e=>e.length>1).length,fixed:solve(true),latent:solve(false)};
 }
 let seed=0x158a7701;function rng(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)/4294967296}
 function encode(W,K){let C=[],groups=[];for(const w of W){const start=C.length;for(const p of w){while(true){const i=C.length;if(i>=K.length)return null;const c=mod(p+K[i]);if(i&&c===C[i-1]&&rng()<supp){let z=Math.floor(rng()*28);if(z>=c)z++;C.push(z)}else{C.push(c);break}}}groups.push(C.length-start)}return {C,groups}}
 const donor=words(raw[5]);const results={};const control=[];
 for(const [name,K] of [["base60",K60],["base59",K59]]){
  results[name]=decode(C,K,W.map(w=>w.length));
  let attempts=0,accepted=0;for(let i=1;i<donor.length-30&&accepted<50;i+=17){for(let j=i+1;j<i+30;j++){const ws=[[donor[i-1].at(-1)],...donor.slice(i,j)];if(ws.flat().length<60)continue;if(ws.flat().length>76)break;attempts++;const x=encode(ws,K);if(!x||x.C.length!==76)continue;
   const d=decode(x.C,K,x.groups),P=ws.flat();const wrong=decode(x.C,K===K60?K59:K60,x.groups);control.push({name,i,words:ws.length-1,trueNulls:76-P.length,truthOov:ws.slice(1).filter(w=>!lex.has(id(w))).length,fixed:{oov:d.fixed?.oov??null,score:d.fixed?.score??null,exact:d.fixed?.P.join()===P.join()},latent:{oov:d.latent?.oov??null,score:d.latent?.score??null,exact:d.latent?.P.join()===P.join()},wrong:{fixed:wrong.fixed?.score??null,latent:wrong.latent?.score??null},paths:d.paths});accepted++;break;}
  }
  results[name].attempts=attempts;results[name].controls=accepted;
 }
 return {groups:W.map(w=>w.length),lexicon:lex.size,supp,results,control}
}
if(require.main===module)console.log(JSON.stringify(experiment(files.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8"))),null,2));
module.exports={experiment};
