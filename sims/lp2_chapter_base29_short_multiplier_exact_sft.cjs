"use strict";
const fs=require("node:fs");
const files=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/english_wordfreq_textblob.txt","resources/liber-primus/lp2-transcription.txt"];
function run(raw) {
 const gp=JSON.parse(raw[0]),gold=JSON.parse(raw[1]),ix=new Map(gp.runes.map((x,i)=>[x,i])),tokens=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
 const id=a=>String.fromCharCode(...a.map(x=>65+x)),nums=s=>Array.from(s,x=>x.charCodeAt(0)-65);
 const words=s=>(s.match(/[\u16a0-\u16ff]+/gu)||[]).map(t=>[...t].map(x=>ix.get(x))).filter(w=>w.every(Number.isInteger));
 function word(w,alt=true){w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const o=[];for(let j=0;j<w.length;){const q=alt&&w.startsWith("ING",j)?{t:"ING",i:21}:alt&&w.startsWith("IO",j)?{t:"IO",i:27}:tokens.find(o=>w.startsWith(o.t,j));if(!q)throw Error(w);o.push(q.i);j+=q.t.length;}return o;}
 const hold=new Set(["0_koan_1","0_loss_of_divinity"]);
 const train=gold.sections.filter(s=>!hold.has(s.name)).map(s=>words(s.source_text));
 const types=new Set();for(const a of train)for(const w of a)types.add(id(w));for(const l of raw[2].split(/\r?\n/)){const m=l.match(/^([a-z]+)\s+(\d+)$/i);if(m)for(const alt of [true,false])types.add(id(word(m[1],alt)));}
 const lex=Array.from({length:30},()=>[]);for(const w of types)if(w.length<30)lex[w.length].push(nums(w));
 const uni=new Float64Array(29),bi=new Float64Array(29**2),tri=new Float64Array(29**3);let total=0;for(const a of train){const t=a.flat();for(let i=0;i<t.length;i++){uni[t[i]]++;total++;if(i)bi[t[i-1]*29+t[i]]++;if(i>1)tri[(t[i-2]*29+t[i-1])*29+t[i]]++;}}
 const lm=new Float64Array(29**3);for(let a=0;a<29;a++)for(let b=0;b<29;b++)for(let c=0;c<29;c++){const p0=(uni[c]+0.5)/(total+14.5),p1=(bi[b*29+c]+8*p0)/(uni[b]+8),p2=(tri[(a*29+b)*29+c]+8*p1)/(bi[a*29+b]+8);lm[(a*29+b)*29+c]=Math.log(p2);}
 const score=t=>{let s=0;for(let i=2;i<t.length;i++)s+=lm[(t[i-2]*29+t[i-1])*29+t[i]];return s/Math.max(1,t.length-2);};
 const M=n=>29n**BigInt(n),mod=(x,m)=>(x%m+m)%m;
 function inv(a,m){let [r,s,t,u]=[m,a,0n,1n];while(s){const q=r/s;[r,s,t,u]=[s,r-q*s,u,t-q*u];}if(r!==1n)throw Error("nonunit "+a);return mod(t,m);}
 function int(a,orient){const v=orient==="BE"?a:a.slice().reverse();return v.reduce((n,x)=>n*29n+BigInt(x),0n);}
 function dig(v,n,orient){const a=Array(n);for(let i=0;i<n;i++){a[orient==="BE"?n-1-i:i]=Number(v%29n);v/=29n;}if(v)throw Error("overflow");return a;}
 function transform(a,k,orient,mode,decode){const m=M(a.length);const mul=(mode==="encMultiplier")===decode?inv(k,m):k;return dig(int(a,orient)*mul%m,a.length,orient);}
 function same(a,b){return a.length===b.length&&a.every((x,i)=>x===b[i]);}
 const fmt=t=>t.map(x=>gp.translit[x]).join(""),span=(a,lo,hi)=>a.filter(w=>w.start>=lo&&w.start+w.w.length<=hi);
 function wordScore(p,ws,base){let hit=0,all=0;for(const w of ws){all+=w.w.length;if(types.has(id(p.slice(w.start-base,w.start-base+w.w.length))))hit+=w.w.length;}return {hit,all};}
 function layout(a){let off=0;return a.map(w=>{const p={w,start:off};off+=w.length;return p;});}
 function solve(C,ws,orient,mode,fitN){
  const n=C.length,be=orient==="BE",anchor=be?ws.at(-1):ws[0],m=anchor.w.length,fitLo=be?n-fitN:0,fitHi=be?n:fitN;
  const cut=C.slice(fitLo,fitHi),cm=int(be?C.slice(-m):C.slice(0,m),orient),mm=M(m);if(cm%29n===0n)throw Error("nonunit ciphertext anchor");
  const cinv=inv(cm,mm),keys=new Set();let count=0;
  for(const w of lex[m]){const v=int(w,orient);if(v%29n===0n)continue;const k=mode==="encMultiplier"?cm*inv(v,mm)%mm:v*cinv%mm;if(k>0n&&k%29n){keys.add(k);count++;}}
  const fws=span(ws,fitLo,fitHi).filter(w=>w!==anchor),hws=be?span(ws,0,fitLo):span(ws,fitHi,n);
  let best=null,best8=null,ranked=[];
  for(const k of keys){const P=transform(cut,k,orient,mode,true);const q=wordScore(P,fws,fitLo),s=score(be?P.slice(0,-m):P.slice(m));const row={k,hit:q.hit,all:q.all,s};ranked.push(row);}
  ranked.sort((a,b)=>b.hit-a.hit||b.s-a.s||(a.k<b.k?-1:1));best=ranked[0];best8=ranked.find(x=>x.k<M(8));
  const summarize=(row)=>{if(!row)return null;const P=transform(C,row.k,orient,mode,true),H=be?P.slice(0,fitLo):P.slice(fitHi),hs=wordScore(P,hws,0);if(!same(transform(P,row.k,orient,mode,false),C))throw Error("replay");return {key:row.k.toString(),keyDigits:dig(row.k,m,orient),fitHit:row.hit,fitTotal:row.all,fitScore:row.s,holdHit:hs.hit,holdTotal:hs.all,holdScore:score(H),head:ws.slice(0,12).map(w=>fmt(P.slice(w.start,w.start+w.w.length))).join(" "),tail:ws.slice(-12).map(w=>fmt(P.slice(w.start,w.start+w.w.length))).join(" "),P};};
  return {orient,mode,anchorLength:m,anchorForms:lex[m].length,unitForms:count,keys:keys.size,keys8:ranked.filter(x=>x.k<M(8)).length,fitN,best:summarize(best),best8:summarize(best8),ranked};
 }
 const W=[];let w=[];for(const c of raw[3].split("%").slice(0,55).join("%")){if(ix.has(c))w.push(ix.get(c));else if(c!=="%"&&c!=="/"&&!/\s/u.test(c)&&w.length){W.push(w);w=[];}}if(w.length)W.push(w);
 const tape=gp.pages.filter(p=>p.page<56).flatMap(p=>p.indices);if(W.length!==2896||tape.length!==12956||!same(W.flat(),tape))throw Error("source mismatch");
 const O=layout(W).filter(w=>w.start+w.w.length<=729);if(O.at(-1).start+O.at(-1).w.length!==729||O[0].w.length!==8||O.at(-1).w.length!==9)throw Error("anchor scope");
 const target=tape.slice(0,729),results=[],plants=[];
 for(const orient of ["BE","LE"])for(const mode of ["encMultiplier","decMultiplier"]){
  const result=solve(target,O,orient,mode,orient==="BE"?201:262);delete result.ranked;delete result.best.P;if(result.best8)delete result.best8.P;results.push(result);
  for(const section of gold.sections.filter(s=>hold.has(s.name))){
   const ww=words(section.source_text),m=orient==="BE"?9:8;
   const possible=ww.map((w,i)=>({w,i})).filter(({w,i})=>w.length===m&&types.has(id(w))&&(orient==="BE"?w.at(-1):w[0])!==0&&(orient==="BE"?ww.slice(0,i+1):ww.slice(i)).flat().length>=250);
   if(!possible.length)throw Error("missing native plant "+section.name+" "+orient);
   const a=orient==="BE"?ww.slice(0,possible.at(-1).i+1):ww.slice(possible[0].i);
   const P=a.flat(),layoutP=layout(a),key=section.name==="0_koan_1"?int([23,10,1,10,9,10,16,26],"BE"):345678912347n;
   if(key>=M(8)||key%29n===0n)throw Error("plant key");
   const C=transform(P,key,orient,mode,false),fitN=Math.min(201,Math.floor(P.length/2));const sol=solve(C,layoutP,orient,mode,fitN);
   const truth=sol.ranked.findIndex(x=>x.k===key),win=sol.best8;
   plants.push({section:section.name,orient,mode,n:P.length,fitN,key:key.toString(),rank:truth+1,fitHit:win.fitHit,fitTotal:win.fitTotal,holdHit:win.holdHit,holdTotal:win.holdTotal,holdScore:win.holdScore,recoveredKey:win.key,exact:win.P.filter((x,i)=>x===P[i]).length});
   if(truth<0||!same(transform(C,key,orient,mode,true),P))throw Error("plant excluded");
  }
 }
 const terminalStart=12657;const T=layout(W).filter(w=>w.start>=terminalStart).map(w=>({w:w.w,start:w.start-terminalStart}));const tc=tape.slice(terminalStart);if(T[0].w.length!==8||tc.length!==299||T.at(-1).start+T.at(-1).w.length!==299)throw Error("terminal scope");const terminal=[];for(const mode of ["encMultiplier","decMultiplier"]){const a=solve(tc,T,"LE",mode,223);delete a.ranked;delete a.best.P;if(a.best8)delete a.best8.P;terminal.push(a);}return {terminal,lexicon:types.size,original:{n:729,groups:O.length,rawScore:score(target),results},plants};
}
console.log(JSON.stringify(run(files.map(p=>fs.readFileSync(p,"utf8"))),null,2));
