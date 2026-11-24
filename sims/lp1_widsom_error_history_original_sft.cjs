'use strict';
const fs=require('node:fs');const path=require('node:path');
function run(native,lp1,corpus,ink){
 const assert=(ok,s)=>{if(!ok)throw new Error(s)};
 const rs=native.runes, enc=s=>[...s].filter(c=>rs.includes(c)).map(c=>rs.indexOf(c)), equal=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]), show=a=>a.map(x=>rs[x]).join("");
 const pages=lp1.split("%").filter(s=>enc(s).length);
 const p=enc(native.sections.find(x=>x.name==="0_welcome").source_text), c=[...enc(pages[1]),...enc(pages[2])];
 const key=enc("ᛞᛁᚢᛁᚾᛁᛏᚣ");
 function encrypt(tape){let clock=0;const clocks=[];const out=tape.map(v=>{clocks.push(clock);return v===0?0:(v+key[clock++%key.length])%29});return {out,clocks,clock};}
 assert(p.length===515&&c.length===515,"WELCOME source lengths"); const authentic=encrypt(p);
 assert(equal(authentic.out,c),"full authentic WELCOME exact replay");
 const loc=394, typo=enc("ᚹᛁᛞᛋᚩᛗ"), normal=enc("ᚹᛁᛋᛞᚩᛗ");
 assert(equal(p.slice(loc,loc+6),typo),"WIDSOM at predeclared offset");
 const fixed=p.slice(); fixed.splice(loc,6,...normal);
 const standard=encrypt(fixed);const post=standard.out.slice(); [post[loc+2],post[loc+3]]=[post[loc+3],post[loc+2]];
 function mismatches(out){return out.flatMap((v,i)=>v!==c[i]?[i]:[])}
 const hypotheses={before:authentic.out.slice(loc,loc+6),correct:standard.out.slice(loc,loc+6),after:post.slice(loc,loc+6)};
 assert(equal(hypotheses.before,[17,19,4,2,0,13]),"source title exact");
 assert(equal(mismatches(standard.out),[396,397])&&equal(mismatches(post),[396,397]),"exact local discrimination");
 assert(equal(authentic.clocks,standard.clocks),"same non-F count and clock");
 const phase=authentic.clocks.slice(loc,loc+6).map(i=>i%key.length), values=phase.map(i=>key[i]);
 assert(c[398]===0&&p[398]===3&&phase[4]===7&&phase[5]===0,"generated F and advancement");
 const tail=p.slice(loc+6), stop=authentic.clocks[loc+6];
 let wrongClock=stop-1;
 const wrongTail=tail.map(v=>v===0?0:(v+key[wrongClock++%8])%29);
 const wrongTailMatches=wrongTail.filter((v,i)=>v===c[loc+6+i]).length;
 const unknown=corpus.pages.filter(p=>p.page<56).flatMap(p=>p.indices);
 assert(unknown.length===12956,"unknown source count");
 const matches=Object.fromEntries(Object.entries(hypotheses).map(([name,t])=>[name,unknown.flatMap((v,i)=>t.every((x,j)=>unknown[i+j]===x)?[i]:[])]));
 const sixRuneRed=ink.pages.filter(p=>p.page<56).flatMap(p=>(p.red_spans??[]).filter(s=>s.length===6).map(s=>({page:p.page,start:s.start})));
 const clear=enc(pages[8]), correctClear=enc(pages[9]);const miss=enc("ᛒᛖᛚᛖᛁᚢᛖ"), correct=enc("ᛒᛖᛚᛁᛖᚢᛖ");
 function positions(t,s){return t.flatMap((v,i)=>s.every((x,j)=>t[i+j]===x)?[i]:[]);}
 const clearMiss=positions(clear,miss),clearCorrect=positions(correctClear,correct);
 assert(clearMiss.length===1&&clearCorrect.length===1,"clear spelling contrast");
 const koanP=enc(native.sections.find(x=>x.name==="0_koan_1").source_text);
 const koanC=[4,5,6,7].flatMap(i=>enc(pages[i]));
 const koanD=koanC.map(v=>(31-v)%29);const koanAdjusted=koanP.slice();
 // The two actual WHO rather than WHAT word sites (GP: WHA T -> WHO).
 for(const idx of [279,142]){assert(equal(koanAdjusted.slice(idx-2,idx+2),enc("ᚹᚻᚪᛏ")),"published WHAT at "+idx);koanAdjusted.splice(idx,2,3);}
 assert(equal(koanAdjusted,koanD),"exact two word variants restore KOAN alignment");
 return {sourceLengths:[p.length,c.length],key,loc,phase,values,sourceWord:show(typo),normalWord:show(normal),hypotheses:Object.fromEntries(Object.entries(hypotheses).map(([n,t])=>[n,{indices:t,runes:show(t)}])),mismatches:{pre:mismatches(authentic.out),correct:mismatches(standard.out),post:mismatches(post)},unchangedTail:tail.length,generatedFAt:398,wrongHoldTailMatches:wrongTailMatches,clearMiss,clearCorrect,koan:{original:koanC.length,externalSolved:koanP.length,variants:[142,279],exactAdjustedReplay:koanD.length},unknown:{n:unknown.length,matches,sixRuneRed}};
}
const files=["resources/external/relikd-solved-gp29-native-v1.json","resources/transcriptions/lp1_wulfic_canonical.txt","resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-ink-annotations.json"];
const raw=files.map(f=>fs.readFileSync(path.resolve(__dirname,'..',f),'utf8'));console.log(JSON.stringify(run(JSON.parse(raw[0]),raw[1],JSON.parse(raw[2]),JSON.parse(raw[3])),null,2));
