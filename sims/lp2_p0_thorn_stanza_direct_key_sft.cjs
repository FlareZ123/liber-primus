"use strict";
/** Direct third-stanza GP29 receiver, phase zero at the p0 black body. */
function experiment(gp,native,poem){
 const check=(x,m)=>{if(!x)throw Error(m)},mod=x=>(x%29+29)%29,tok=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length),map=new Map(gp.runes.map((x,i)=>[x,i]));
 const stanza=poem.trim().split(/\n\s*\n/)[2];check(stanza.startsWith("Ðorn byþ"),"source stanza");
 const english="The thorn is exceedingly sharp, an evil thing for any knight to touch, uncommonly severe on all who sit among them.";
 function keyText(s,eth){const a=[];for(let w of s.toUpperCase().replace(/Æ/g,"AE").replace(/Þ/g,"TH").replace(/Ð/g,eth).match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");while(w.length){const t=tok.find(t=>w.startsWith(t.s));if(!t)throw Error(w);a.push(t.i);w=w.slice(t.s.length)}}return a}
 const keys=[["Old English phonetic eth→TH",keyText(stanza,"TH")],["Old English eth→D",keyText(stanza,"D")],["Dickins translation",keyText(english,"TH")]];
 const solved=native.sections.map(s=>Array.from(s.source_text.match(/[\u16a0-\u16ff]/gu)||[],x=>map.get(x)));
 function model(exclude){const counts=new Float64Array(30*30*29).fill(.2),den=new Float64Array(30*30).fill(29*.2);for(let s=0;s<solved.length;s++){if(s===exclude)continue;let a=29,b=29;for(const p of solved[s]){const i=a*30+b;counts[i*29+p]++;den[i]++;a=b;b=p}}return (a,b,p)=>Math.log(counts[(a*30+b)*29+p]/den[a*30+b])}
 function encode(p,K,Q,start=0){let k=start;return p.map(x=>Q.includes(x)?x:mod(x+K[k++%K.length]))}
 function solve(C,K,Q,score,initial={k:0,a:29,b:29,s:0,p:[]}){let states=new Map([[""+initial.k+","+initial.a+","+initial.b,initial]]),peak=1;for(let t=0;t<C.length;t++){const c=C[t],next=new Map();for(const st of states.values()){const push=(p,k)=>{const a=st.b,b=p,s=st.s+score(st.a,st.b,p),id=k+","+a+","+b,old=next.get(id);if(!old||s>old.s)next.set(id,{k,a,b,s,p:[...st.p,p]})};if(Q.includes(c))push(c,st.k);const p=mod(c-K[st.k]);if(!Q.includes(p))push(p,(st.k+1)%K.length)}if(!next.size)return {legalPrefix:t,peak,best:null};states=next;peak=Math.max(peak,states.size)}return {legalPrefix:C.length,peak,best:[...states.values()].sort((a,b)=>b.s-a.s)[0]}}
 const C=gp.pages.slice(0,3).flatMap(p=>p.indices).slice(13);check(C.length===716&&C[0]===2,"source body");
 const results=[],plants=[];for(const [name,K] of keys){for(const Q of [[],[0],[2],[0,2]]){const score=model(-1),fit=solve(C.slice(0,351),K,Q,score);const row={name,period:K.length,Q,fitLegal:fit.legalPrefix,fitPeak:fit.peak};if(fit.best){row.fitScore=fit.best.s/351;row.fitPreview=fit.best.p.slice(0,70).map(x=>gp.translit[x]).join("");check(encode(fit.best.p,K,Q).join()===C.slice(0,351).join(),"original prefix replay");const b=fit.best,hold=solve(C.slice(351),K,Q,score,{k:b.k,a:b.a,b:b.b,s:0,p:[]});row.holdLegal=hold.legalPrefix;row.holdPeak=hold.peak;if(hold.best){row.holdScore=hold.best.s/365;row.holdPreview=hold.best.p.slice(0,70).map(x=>gp.translit[x]).join("");check(encode(hold.best.p,K,Q,b.k).join()===C.slice(351).join(),"original holdout replay")}}results.push(row);
 const sec=(Q.length+K.length)%7,plain=solved[sec].slice(0,Math.min(249,solved[sec].length)),pc=encode(plain,K,Q),v=solve(pc,K,Q,model(sec));check(v.best&&encode(v.best.p,K,Q).join()===pc.join(),"native plant replay");plants.push({name,Q,sec,n:plain.length,exact:v.best.p.filter((x,i)=>x===plain[i]).length,score:v.best.s/plain.length,peak:v.peak});}}
 check(results.filter(x=>x.Q.length).every(x=>x.fitLegal<=34),"literal hold exclusion");check(results.filter(x=>!x.Q.length).every(x=>x.holdLegal===365),"ordinary receiver");
 return {stanza,english,keys:keys.map(([name,K])=>({name,K,period:K.length})),results,plants};
}
const fs=require("node:fs"),path=require("node:path");
const files=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/external/dickins1915-rune-poem-old-english.txt"];
const raw=files.map(p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8"));
console.log(JSON.stringify(experiment(JSON.parse(raw[0]),JSON.parse(raw[1]),raw[2]),null,2));
