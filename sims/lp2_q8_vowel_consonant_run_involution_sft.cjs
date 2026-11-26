"use strict";
const fs=require("node:fs"),path=require("node:path");
const files=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/english_wordfreq_textblob.txt","resources/liber-primus/lp2-transcription.txt"];
function build(raw){
 const gp=JSON.parse(raw[0]),gold=JSON.parse(raw[1]),ix=new Map(gp.runes.map((x,i)=>[x,i])),tokens=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
 const id=w=>String.fromCharCode(...w.map(x=>65+x));
 function word(w,alt=true){w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const o=[];for(let j=0;j<w.length;){const q=alt&&w.startsWith("ING",j)?{t:"ING",i:21}:alt&&w.startsWith("IO",j)?{t:"IO",i:27}:tokens.find(o=>w.startsWith(o.t,j));if(!q)throw Error("native "+w);o.push(q.i);j+=q.t.length;}return o;}
 function body(t){const a=/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t),b=/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t);return t.slice(a?a.index+a[0].length:0,b?b.index:t.length);}
 const donors=raw.slice(2,5).map(t=>(body(t).toUpperCase().match(/[A-Z]+/g)||[]).map(w=>word(w))),training=donors.map(w=>w.slice(0,Math.floor(w.length*.8)));
 for(const s of gold.sections)if(!["0_welcome","jpg107-167"].includes(s.name))training.push((s.source_text.match(/[\u16a0-\u16ff]+/gu)||[]).map(t=>[...t].map(x=>ix.get(x))).filter(w=>w.every(Number.isInteger)));
 const types=new Set(Array.from({length:29},(_,x)=>String.fromCharCode(65+x)));
 for(const a of training)for(const w of a)if(w.length&&w.length<=24)types.add(id(w));
 for(const ln of raw[5].split(/\r?\n/)){const m=ln.match(/^([a-z]+)\s+(\d+)$/i);if(!m)continue;for(const alt of [true,false]){const k=id(word(m[1],alt));if(k.length<=24)types.add(k);}}
 const orig=[];let w=[];for(const x of raw[6].split("%").slice(0,55).join("%")){if(ix.has(x))w.push(ix.get(x));else if(x!=="%"&&x!=="/"&&!/\s/u.test(x)&&w.length){orig.push(w);w=[];}}if(w.length)orig.push(w);
 const tape=gp.pages.filter(x=>x.page<56).flatMap(x=>x.indices);if(orig.length!==2896||id(orig.flat())!==id(tape))throw Error("canonical tape");
 let off=0;const rows=[];for(const w of orig){if(off>=12657)rows.push({off,C:w});off+=w.length;}return {types,donors,rows};
}
function run(raw){
 const check=(b,m)=>{if(!b)throw Error(m)};
 const {types,donors,rows}=build(raw);
 const mod=x=>(x+29)%29,id=w=>String.fromCharCode(...w.map(x=>65+x)),nums=s=>Array.from(s,x=>x.charCodeAt(0)-65);
 const vowels=new Set([1,3,10,12,18,22,24,25,26,27,28]);
 function order(w){let a=[];for(let i=0;i<w.length;){let j=i+1;while(j<w.length&&vowels.has(w[j])===vowels.has(w[i]))j++;a.push(...w.slice(i,j).reverse());i=j;}return a;}
 check(types.size===35944,"dictionary size");
 const transformed=new Set();for(const w of types){const b=order(nums(w));check(id(order(b))===w,"involution");transformed.add(id(b));}
 check(transformed.size===types.size,"injectivity");
 const anchorWords=[...transformed].filter(w=>w.length===8&&!w.includes("A")).map(nums);
 const fit=rows.filter(x=>x.off+x.C.length<=12880),hold=rows.filter(x=>!fit.includes(x));
 check(rows.length===64&&rows.flatMap(x=>x.C).length===299&&fit.length===47&&hold.length===17&&hold[0].C.length===11,"corrected carry");
 const anchors=fit.filter(x=>x.C.length===8&&!x.C.includes(0));check(anchors.length===5,"anchor count");
 function canon(K){let best=Infinity,bestK;for(let j=0;j<8;j++){let R=K.slice(j).concat(K.slice(0,j)),n=R.reduce((a,b)=>a*29+b,0);if(n<best){best=n;bestK=R;}}return [best,bestK];}
 function domains(C,K,first=false){const out=[];function rec(i,p,W,s){if(i===C.length){if(transformed.has(id(W))){out.push({s,t:p,P:order(W)});return first;}return false;}if(C[i]===0){W.push(0);if(rec(i+1,p,W,s))return true;W.pop();}const x=mod(C[i]-K[p]);if(x){W.push(x);if(rec(i+1,(p+1)&7,W,s))return true;W.pop();}return false;}for(let s=0;s<8;s++)if(rec(0,s,[],s)&&first)break;return out;}
 function encode(P,K,s){const C=[];for(const x of order(P)){if(x===0)C.push(0);else{C.push(mod(x+K[s]));s=(s+1)&7;}}return {C,t:s};}
 function solve(all){const F=all.slice(0,47),H=all.slice(47),A=F.filter(x=>x.C.length===8&&!x.C.includes(0)),budget=2;
 check(A.length>=3,"insufficient anchors");
 const map=new Map();for(const a of A)for(const P of anchorWords){const [n,K]=canon(a.C.map((c,i)=>mod(c-P[i])));map.set(n,K);}
 const candidates=[];let multi=0,bestAnchor=0,bestCoverage=0,bestKey=null;
 for(const [n,K] of map){let ac=0;for(const a of A)if(domains(a.C,K,true).length)ac++;bestAnchor=Math.max(bestAnchor,ac);if(ac<A.length-budget)continue;multi++;let covered=ac;for(const x of F)if(!A.includes(x)&&domains(x.C,K,true).length)covered++;if(covered>bestCoverage){bestCoverage=covered;bestKey=K;}if(covered>=F.length-budget)candidates.push({n,K,fitCovered:covered});}
 const tested=candidates.map(o=>{let d=H.map(x=>domains(x.C,o.K));return {...o,holdCovered:d.filter(x=>x.length).length,holdTrue:H.filter((x,i)=>x.P&&d[i].some(y=>id(y.P)===id(x.P))).length,holdUnique:d.filter(x=>new Set(x.map(y=>id(y.P))).size===1).length};});
 return {anchors:A.map(x=>x.off),keyCount:map.size,anchorPass:multi,bestAnchor,bestCoverageAmongAnchorSurvivors:multi?bestCoverage:null,bestKey,fitRequired:45,candidates:tested};}
 function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0;};}
 function control(seed){const R=rng(seed),K=Array.from({length:8},()=>R()%29),pool=Array.from({length:25},()=>[]);for(const D of donors)for(const w of D.slice(Math.floor(D.length*.8)))if(w.length<=24&&types.has(id(w)))pool[w.length].push(w);let s=0;const result=[];let fholds=0,consumingZero=0,changed=0;for(const row of rows){const need=anchors.includes(row);let o;for(let j=0;j<20000;j++){const P=pool[row.C.length][R()%pool[row.C.length].length],e=encode(P,K,s);if(need&&(P.includes(0)||e.C.includes(0)))continue;if(!need&&result.length<47&&P.length===8&&!e.C.includes(0))continue;o={off:row.off,P,C:e.C,s,t:e.t};break;}check(o,"control construction");s=o.t;result.push(o);fholds+=o.P.filter(x=>x===0).length;consumingZero+=o.C.filter((x,i)=>x===0&&order(o.P)[i]!==0).length;changed+=id(o.P)!==id(order(o.P));}
 const z=solve(result),[truth]=canon(K);const replay=result.every(x=>{const e=encode(x.P,K,x.s);return id(e.C)===id(x.C)&&e.t===x.t&&domains(x.C,K).some(y=>y.s===x.s&&y.t===x.t&&id(y.P)===id(x.P));});
 check(replay,"native forward inverse");check(z.candidates.length===1&&z.candidates[0].n===truth&&z.candidates[0].holdTrue===17,"control recovery");
 return {seed,truth,K,changed,fholds,consumingZero,replay,...z};}
 const controls=[2918,2919,2920].map(control),original=solve(rows);
 return {model:"reverse maximal vowel/consonant runs, q8 literal-F",vowels:[...vowels],dict:types.size,transformed:transformed.size,anchorWords:anchorWords.length,fitGroups:fit.length,fitRunes:fit.flatMap(x=>x.C).length,holdGroups:hold.length,holdRunes:hold.flatMap(x=>x.C).length,carry:hold[0].C,controls,original};
}
if(require.main===module) console.log(JSON.stringify(run(files.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8"))),null,2));
module.exports={run,files};
