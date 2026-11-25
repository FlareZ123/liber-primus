"use strict";
/** Original p37 item3 fixed LUCK-key continuation. */
const fs=require("node:fs"),path=require("node:path");
const read=n=>fs.readFileSync(path.join(__dirname,"../resources/liber-primus",n),"utf8");
function experiment(db,transcription){
 const mod=(x,n=29)=>(x%n+n)%n,key=[12,1,1,22],lo=91,hi=189,anchor=55,C=db.pages[37].indices.slice(lo,hi),map=new Map(db.runes.map((x,i)=>[x,i])),eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b),assert=(x,m)=>{if(!x)throw Error(m)};
 const section=transcription.split(/^\s*%\s*$/m)[37].split(/(?:^|\n)3-/)[1].split(/(?:^|\n)4-/)[0];
 const words=section.replace(/[\/\s]/g,"").split(/[-.]/).map(w=>[...w].filter(x=>map.has(x)).map(x=>map.get(x))).filter(w=>w.length);
 let pos=0;const starts=words.map(w=>{let s=pos;pos+=w.length;return s});assert(eq(words.flat(),C)&&words.length===25&&starts[17]===anchor&&eq(C.slice(anchor,anchor+4),[3,2,6,27]),"source");
 function decode(c,phase,mask,holds){let p=[],k=phase,f=0;for(let i=0;i<c.length;i++){let x=c[i];if(holds&&x===0&&((mask>>f++)&1)){p.push(0);continue;}let y=mod(x-key[k]);if(holds&&y===0)return {fail:i};p.push(y);k=(k+1)%4;}return {p};}
 function encode(p,phase,holds){let k=phase;return p.map(x=>{if(holds&&x===0)return 0;let y=mod(x+key[k]);k=(k+1)%4;return y;});}
 function cases(c,holds){let out=[],fail=[];for(let m=0;m<(holds?2**c.filter(x=>x===0).length:1);m++){let z=0,h=0;for(let i=0;i<anchor;i++)if(c[i]===0){if(holds&&((m>>z)&1))h++;z++;}const phase=mod(h-anchor,4),d=decode(c,phase,m,holds);if(d.p){assert(eq(encode(d.p,phase,holds),c),"replay");out.push(d.p);}else fail.push(d.fail+lo);}return {out,fail};}
 const ordinary=cases(C,false),held=cases(C,true);assert(eq(ordinary.out[0].slice(anchor,anchor+4),[20,1,5,5]),"LUCK");
 const wordOrd=words.map(w=>decode(w,0,0,false).p),wordHold=words.map(w=>{let out=[];for(let m=0;m<2**w.filter(x=>x===0).length;m++){let d=decode(w,0,m,true);if(d.p){assert(eq(encode(d.p,0,true),w),"word replay");out.push(d.p);}}return out;});
 function extend(c,reverse){let states=new Set([0]),n=0;for(const x of (reverse?c.slice().reverse():c)){let next=new Set();for(const k of states){if(x===0)next.add(k);let j=reverse?mod(k-1,4):k;if(mod(x-key[j])!==0)next.add(reverse?j:(j+1)%4);}if(!next.size)break;states=next;n++;}return n;}
 const native=db.pages[57].indices.concat([24,9,18]),phase=mod(-native.slice(0,anchor).filter(x=>x!==0).length,4),ctrl=cases(encode(native,phase,true),true);assert(ctrl.out.some(x=>eq(x,native)),"plant");
 const render=p=>p.map(x=>db.translit[x]).join(""),fmt=p=>words.map((w,i)=>render(p.slice(starts[i],starts[i]+w.length))).join(" ");
 const left=extend(C.slice(0,anchor),true),right=extend(C.slice(anchor+4),false);
 return {lo,hi,anchor:146,ordinary:fmt(ordinary.out[0]),heldPaths:held.out.length,failedOffsets:held.fail,left,right,leftFailure:146-left-1,rightFailure:150+right,wordResetOrdinary:wordOrd.map(render).join(" "),wordResetImpossible:wordHold.flatMap((x,i)=>x.length?[]:[lo+starts[i]]),wordResetPaths:wordHold.reduce((a,b)=>a*b.length,1),nativePaths:ctrl.out.length,nativeTruthRetained:true};
}
console.log(JSON.stringify(experiment(JSON.parse(read("lp2-corpus.json")),read("lp2-transcription.txt")),null,2));
