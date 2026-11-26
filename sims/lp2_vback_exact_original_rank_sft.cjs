'use strict';
// Complete original candidate ranking for fixed native q8 V-BACK, #2886.
const fs = require('node:fs');
const path = require('node:path');
function rankAll(corpus,reference,groups){
 const K=[23,10,1,10,9,10,16,26],q=29,m=x=>(x%q+q)%q,assert=(b,s)=>{if(!b)throw Error(s)};
 const gp=corpus.translit.map((x,i)=>[x,i]).sort((a,b)=>b[0].length-a[0].length);
 const norm=w=>w.replace(/ING/g,"NG").replace(/QU/g,"CW").replace(/K/g,"C").replace(/V/g,"U").replace(/Z/g,"S").replace(/Q/g,"C");
 function toRunes(w){w=norm(w);let a=[];for(let i=0;i<w.length;){let t=gp.find(([x])=>w.startsWith(x,i));if(!t)return null;a.push(t[1]);i+=t[0].length}return a}
 const train=reference.split("### 56")[0].split("\n").filter(s=>!s.startsWith("#")&&!s.startsWith("[")&&!/\d/.test(s)).join(" ").match(/[A-Z]+/g).map(toRunes).filter(x=>x!==null);
 const lex=new Set(train.map(x=>x.join(","))),stream=train.flat(),N=new Float64Array(q*q*q),D=new Float64Array(q*q);
 for(let i=2;i<stream.length;i++){let b=stream[i-2]*q+stream[i-1];N[b*q+stream[i]]++;D[b]++}
 function score(P){let s=0;for(let i=2;i<P.length;i++){let b=P[i-2]*q+P[i-1];s+=Math.log((N[b*q+P[i]]+0.5)/(D[b]+0.5*q))}return s/(P.length-2)}
 const C=corpus.pages[54].indices.concat(corpus.pages[55].indices);
 const words=groups.p54.all_visual_groups.slice(0,-1).concat([groups.p54.all_visual_groups.at(-1)+groups.p55.groups[0]],groups.p55.groups.slice(1));
 const compact="0123456789abcdefghijklmnopqrs";assert(words.join("")===C.map(i=>compact[i]).join(""),"groups/corpus exact");
 const P=[],B=[];let n=0,best=null,lexBest=0,second=null;const sameEnd=[];
 function visit(t,j){if(t===C.length){n++;const s=score(P);let w=0,o=0;for(const x of words){if(lex.has(P.slice(o,o+x.length).join(",")))w++;o+=x.length}lexBest=Math.max(lexBest,w);if(!best||s>best.score){second=best;best={score:s,knownWords:w,P:P.slice(),backs:B.slice(),j}}else if(!second||s>second.score)second={score:s,knownWords:w,P:P.slice(),backs:B.slice(),j};if(B.length===1&&sameEnd.length<2)sameEnd.push({j,back:B[0],P:P.slice()});return}
 P.push(m(C[t]-K[j%8]));visit(t+1,j+1);P.pop();if(t&&j&&m(C[t]-C[t-1])===m(K[(j-1)%8]-K[j%8])){P.push(m(C[t]-K[(j-1)%8]));B.push(t);visit(t+1,j);B.pop();P.pop()}}
 visit(0,0);assert(n===6241,"path count");
 const render=a=>a.map(x=>corpus.translit[x]).join("");const p56=toRunes("ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGETHATHASHESTOITISTHEDUTYOFEUERYPILGRIMTOSEECOUTTHISPAGE");const p57=corpus.pages[57].indices;
 // Word-separated tokenization avoids accidental digraphs across boundaries.
 const p56Native="AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE".split(" ").flatMap(toRunes);
 assert(p56Native.length===85,"p56 control length");
 let j=0;const replay=best.P.map((p,t)=>{if(best.backs.includes(t)){assert(t>0&&j>0&&m(p+K[j%8])===C[t-1],"back validity");j--}return m(p+K[j++%8])});assert(replay.every((x,i)=>x===C[i]),"top replay");
 let o=0;const printed=words.map(w=>{const x=render(best.P.slice(o,o+w.length));o+=w.length;return x}).join(" ");
 return {trainRunes:stream.length,trainTypes:lex.size,groups:words.length,candidates:n,best:{score:best.score,knownWords:best.knownWords,backs:best.backs,j:best.j,printed},runnerUp:second.score,maximumKnownWords:lexBest,controls:{p56:score(p56Native),p57:score(p57),uniform:-Math.log(29)},sameEnd:sameEnd.map(x=>({j:x.j,back:x.back,first30:render(x.P.slice(0,30))})),sameEndDifferent:sameEnd[0].P.filter((x,i)=>x!==sameEnd[1].P[i]).length};
}
const base = path.join(__dirname, '..', 'resources', 'liber-primus');
const read = name => fs.readFileSync(path.join(base,name),'utf8');
console.log(JSON.stringify(rankAll(JSON.parse(read('lp2-corpus.json')),read('lp1-plaintext-reference.txt'),JSON.parse(read('lp2-page-groups-54-55-derived.json'))),null,2));
