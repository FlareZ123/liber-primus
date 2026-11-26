'use strict';
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname,'..');
const read = p => fs.readFileSync(path.join(root,p),'utf8');
function experiment(d,n,l){
 const A=29, parse=s=>Array.from(s).map(c=>d.runes.indexOf(c)).filter(x=>x>=0),mod=x=>(x%29+29)%29;
 const sections=n.sections.map(s=>({name:s.name,p:parse(s.source_text)})), lp1=l.split("$").map(parse);
 const key=s=>Array.from(s).map(c=>{const k=d.translit.indexOf(c);if(k<0)throw Error(c);return k;});
 const primes=[];for(let x=2;primes.length<15000;x++){if(primes.every(p=>p*p>x||x%p!==0))primes.push(x);}
 const ops=[{id:"clear",static:true,shift:x=>x},{id:"atbash",static:true,shift:x=>28-x},{id:"DIUINITY",k:key("DIUINITY")},{id:"FIRFUMFERENFE",k:key("FIRFUMFERENFE")},{id:"prime-minus-one",prime:true}];
 function makeModel(exclude){const u=new Float64Array(A),b=new Float64Array(A*A),t=new Float64Array(A*A*A),bc=new Float64Array(A),tc=new Float64Array(A*A);let N=0;for(const {name,p} of sections){if(name===exclude||name.startsWith("p56")||name.startsWith("p57"))continue;for(let i=0;i<p.length;i++){u[p[i]]++;N++;if(i>0){b[p[i-1]*A+p[i]]++;bc[p[i-1]]++;}if(i>1){const j=p[i-2]*A+p[i-1];t[j*A+p[i]]++;tc[j]++;}}}const pu=Array.from(u,x=>(x+1)/(N+A));const pb=Array.from(b,(x,i)=>(x+10*pu[i%A])/(bc[Math.floor(i/A)]+10));const pt=Array.from(t,(x,i)=>(x+10*pb[i%(A*A)])/(tc[Math.floor(i/A)]+10));return (a,b,c)=>Math.log(a<0?(b<0?pu[c]:pb[b*A+c]):pt[(a*A+b)*A+c]);}
 function step(op,s,c){if(op.static)return [[s,op.shift(c)]];const k=op.prime?mod(primes[s]-1):op.k[s],p=mod(c-k),next=op.prime?s+1:(s+1)%op.k.length;const a=[];if(c===0)a.push([s,0]);if(p!==0)a.push([next,p]);return a;}
 function decode(c,op,score,initial={s:0,a:-1,b:-1,v:0,parent:null},trace=true){let curr=new Map([["init",initial]]);for(let i=0;i<c.length;i++){const next=new Map();for(const h of curr.values())for(const [s,p] of step(op,h.s,c[i])){const v=h.v+score(h.a,h.b,p),id=(s*30+h.b+1)*30+p+1;const old=next.get(id);if(!old||v>old.v)next.set(id,{s,a:h.b,b:p,v,parent:trace?h:null,p});}curr=next;if(!curr.size)return {legal:i,terminal:null};}let terminal=null;for(const h of curr.values())if(!terminal||h.v>terminal.v)terminal=h;return {legal:c.length,terminal};}
 function unroll(t,len){const p=[];for(let i=0;i<len;i++){p.push(t.p);t=t.parent;}return p.reverse();}
 function encode(p,op,s=0){return p.map(x=>{if(op.static)return op.shift(x);if(x===0)return 0;const k=op.prime?mod(primes[s++]-1):op.k[s];if(!op.prime)s=(s+1)%op.k.length;return mod(x+k);});}
 const equal=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
 function test(c,cut,score,ref){const prefix=c.slice(0,cut),suffix=c.slice(cut);const candidates=ops.map(op=>{const a=decode(prefix,op,score);return {op,a,avg:a.terminal?a.terminal.v/cut:null};});const ranked=candidates.filter(x=>x.avg!==null).sort((a,b)=>b.avg-a.avg),win=ranked[0];const b=decode(suffix,win.op,score,win.a.terminal);const p0=unroll(win.a.terminal,cut);const p1=b.terminal?unroll(b.terminal,suffix.length):[];if(!equal(encode(p0,win.op),prefix))throw Error("prefix replay");if(b.terminal&&!equal(encode(p0.concat(p1),win.op),c))throw Error("full replay");const match=(p,off)=>ref?p.filter((x,i)=>x===ref[off+i]).length:null;return {length:c.length,cut,ranked:candidates.map(x=>({id:x.op.id,avg:x.avg,legal:x.a.legal})),selected:win.op.id,prefixScore:win.avg,heldScore:b.terminal?(b.terminal.v-win.a.terminal.v)/suffix.length:null,heldLegal:b.legal,prefixCorrect:match(p0,0),heldCorrect:match(p1,cut),preview:p0.slice(0,60).map(x=>d.translit[x]).join(""),heldPreview:p1.slice(0,60).map(x=>d.translit[x]).join("")};}
 const controlDefs=[[0,lp1[0],1],[1,lp1[1],2],[2,lp1[2],0],[5,lp1[5],3],[7,d.pages[56].indices,4],[8,d.pages[57].indices,0]];
 const controls=controlDefs.map(([j,c,oi])=>{const {name,p}=sections[j],op=ops[oi];if(!equal(encode(p,op),c))throw Error("native replay "+name);return {name,trueOp:op.id,...test(c,Math.floor(c.length*0.6),makeModel(name),p)};});
 const starts=[0,3,8,15,23,27,33,40,54,56],rubrics=[13,16,12,20,16,19,10,8,9],score=makeModel(null),original=[];
 for(let i=0;i<9;i++){const a=starts[i],b=starts[i+1],c=d.pages.slice(a,b).flatMap(p=>p.indices);original.push({start:a,end:b-1,whole:test(c,d.pages[a].indices.length,score),body:test(c.slice(rubrics[i]),d.pages[a].indices.length-rubrics[i],score)});}
 const global=d.pages.slice(0,56).flatMap(p=>p.indices);const globalResult=test(global,d.pages[0].indices.length,score);
 const blockCoverage=starts.slice(0,-1).map((a,i)=>{const start=d.pages.slice(0,a).reduce((s,p)=>s+p.indices.length,0)+rubrics[i],end=d.pages.slice(0,starts[i+1]).reduce((s,p)=>s+p.indices.length,0);return {startPage:a,bodyStart:start,end,full179:Array.from({length:72},(_,j)=>179*j).filter(j=>j>=start&&j+179<=end)};});
 const internalDefs=[
 ["p33-36 before first number",d.pages.slice(33,36).flatMap(p=>p.indices).concat(d.pages[36].indices.slice(0,99)),214],
 ["numbered item1",d.pages[36].indices.slice(99),69],
 ["numbered item2",d.pages[37].indices.slice(0,91),45],
 ["numbered item3",d.pages[37].indices.slice(91,189),49],
 ["numbered item4",d.pages[37].indices.slice(189).concat(d.pages[38].indices.slice(0,57)),39],
 ["numbered item5",d.pages[38].indices.slice(57,186),64],
 ["after item5 to chapter end",d.pages[38].indices.slice(186).concat(d.pages[39].indices),42],
 ["p40-48 before numeric panel",d.pages.slice(40,49).flatMap(p=>p.indices),231],
 ["p49-51 numeric panel text",d.pages.slice(49,52).flatMap(p=>p.indices),66],
 ["p52-53 after numeric panel",d.pages.slice(52,54).flatMap(p=>p.indices),263],
 ["p55 terminal tree",d.pages[55].indices,38]
 ];
 const internal=internalDefs.map(([name,c,cut])=>({name,...test(c,cut,score)}));
 const compare=original.map(({start,end,whole})=>{const c=d.pages.slice(start,end+1).flatMap(p=>p.indices),cut=whole.cut,p=c.map(x=>ops[1].shift(x));let v=0;for(let i=cut;i<p.length;i++)v+=score(p[i-2],p[i-1],p[i]);return {start,n:p.length-cut,globalAtbashScore:v/(p.length-cut),piecewiseScore:whole.heldScore};});
 const N=compare.reduce((s,x)=>s+x.n,0),pooled={N,global:compare.reduce((s,x)=>s+x.n*x.globalAtbashScore,0)/N,piecewise:compare.reduce((s,x)=>s+x.n*x.piecewiseScore,0)/N};
 return {controls,original,globalResult,blockCoverage,internal,compare,pooled};
}
console.log(JSON.stringify(experiment(JSON.parse(read("resources/liber-primus/lp2-corpus.json")), JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json")), read("resources/transcriptions/lp1_wulfic_canonical.txt")),null,2));
