"use strict";
const assert=require("node:assert/strict"),crypto=require("node:crypto"),fs=require("node:fs"),path=require("node:path");
const ROOT=path.resolve(__dirname,".."),MOD=29,WINDOWS=300;
const CONTROL_FILES=["shakespeare_first300k.txt","gibran_prophet_58585.txt","emerson_essays_2944.txt"];
const mod=x=>((x%MOD)+MOD)%MOD,sha=b=>crypto.createHash("sha256").update(b).digest("hex");
function inv(x){for(let i=1;i<MOD;i++)if(mod(i*x)===1)return i;throw Error("nonunit")}
function nativeGP(raw,translit){const t=translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length),w=raw.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/K/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").match(/[A-Z]+/g)||[],o=[];for(const word of w){const a=[];for(let j=0;j<word.length;){const x=t.find(z=>word.startsWith(z.s,j));if(!x){a.length=0;break}a.push(x.i);j+=x.s.length}o.push(...a)}return o}
function ioc(a){const f=Array(MOD).fill(0);for(const x of a)f[x]++;return f.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1))}
function train(a){const c=new Map();let n=0;for(let i=0;i+2<a.length;i++){const k=a[i]*841+a[i+1]*29+a[i+2];c.set(k,(c.get(k)||0)+1);n++}return {c,n}}
function score(a,m){const d=m.n+0.1*MOD**3;let s=0;for(let i=0;i+2<a.length;i++){const k=a[i]*841+a[i+1]*29+a[i+2];s+=Math.log(((m.c.get(k)||0)+0.1)/d)}return s/(a.length-2)}
function windows(a,m){const max=a.length-128,v=[];for(let i=0;i<WINDOWS;i++){const j=Math.floor(i*max/(WINDOWS-1)),w=a.slice(j,j+128);v.push({ioc:ioc(w),score:score(w,m)})}const x=v.map(z=>z.ioc).sort((a,b)=>a-b),y=v.map(z=>z.score).sort((a,b)=>a-b);return {windows:WINDOWS,iocMin:x[0],iocMedian:x[149],trigramMin:y[0],trigramMedian:y[149]}}
const corpusPath="resources/liber-primus/lp2-corpus.json",inkPath="resources/liber-primus/lp2-ink-annotations.json",gridPath="resources/liber-primus/base60-grid.json";
const corpusBytes=fs.readFileSync(path.join(ROOT,corpusPath)),inkBytes=fs.readFileSync(path.join(ROOT,inkPath)),gridBytes=fs.readFileSync(path.join(ROOT,gridPath));
const corpus=JSON.parse(corpusBytes.toString("utf8")),ink=JSON.parse(inkBytes.toString("utf8")),grid=JSON.parse(gridBytes.toString("utf8"));
const p53=corpus.pages.find(p=>p.page===53).indices,p54=corpus.pages.find(p=>p.page===54).indices,p55=corpus.pages.find(p=>p.page===55).indices;
const red53=(ink.pages.find(p=>p.page===53).red_spans||[]).find(s=>s.start===128&&s.length===51);
assert.ok(red53);assert.equal(p53.length,179);assert.equal(p54[0],24);assert.equal(p55.length,76);
const A=p53.slice(0,128),B=[...p53.slice(128),p54[0],...p55];assert.equal(A.length,128);assert.equal(B.length,128);
const gridBytesFlat=grid.byte_rows.flat();assert.equal(gridBytesFlat.length,256);
const work=gridBytesFlat.map(mod),quotient=[];
for(let i=0;i<254;i++){const lead=work[i];quotient.push(lead);work[i+1]=mod(work[i+1]-10*lead);work[i+2]=mod(work[i+2]-25*lead)}
assert.deepEqual(work.slice(254),[0,0]);assert.equal(quotient.length,254);
const quotientPairs=[];for(let i=0;i<254;i+=2)quotientPairs.push([quotient[i],quotient[i+1]]);
assert.equal(quotientPairs.length,127);
const red3=(ink.pages.find(p=>p.page===3).red_spans||[]).find(s=>s.start===119&&s.length===3);
assert.ok(red3);const p3=[...red3.runes].map(r=>corpus.runes.indexOf(r));assert.deepEqual(p3,[13,23,2]);
const Acoef=mod(-p3[0]*inv(p3[2])),Bcoef=mod(-p3[1]*inv(p3[2]));assert.deepEqual([Acoef,Bcoef],[8,3]);
const trace=([a,b])=>mod(2*a+3*b);
const quotientPlusAc=[...quotientPairs.slice(0,51),[24,0],...quotientPairs.slice(51)].map(trace);assert.equal(quotientPlusAc.length,128);
const columnMajor=[];for(let c=0;c<8;c++)for(let r=0;r<32;r++)columnMajor.push(grid.byte_rows[r][c]);
function pairTrace(bytes){assert.equal(bytes.length,256);const p=[];for(let i=0;i<256;i+=2)p.push(trace([mod(bytes[i]),mod(bytes[i+1])]));return p}
const schedules=[
{name:"quotient pairs + Ac inserted at p54 index 51",pad:quotientPlusAc},
{name:"original grid row-major adjacent pairs",pad:pairTrace(gridBytesFlat)},
{name:"original grid column-major adjacent pairs",pad:pairTrace(columnMajor)}
];
const controls=CONTROL_FILES.map(n=>nativeGP(fs.readFileSync(path.join(ROOT,"resources/control",n),"utf8"),corpus.translit));
const model=train(controls[0]),referenceWindows=controls.map((a,i)=>({source:CONTROL_FILES[i],GP_runes:a.length,...windows(a,model)}));
const variants=[];
for(const s of schedules){const d=B.map((x,i)=>mod(x-A[i])),plus=d.filter((x,i)=>x===s.pad[i]).length,minus=d.filter((x,i)=>x===mod(-s.pad[i])).length;
 for(const target of ["A","B"]){const source=target==="A"?A:B;for(const sign of [1,-1]){const out=source.map((x,i)=>mod(x-sign*s.pad[i]));variants.push({schedule:s.name,target,sign,matchesPlus:plus,matchesMinus:minus,ioc:ioc(out),trigram:score(out,model)})}}
}
const plant=controls[0].slice(0,128),cipher=plant.map((x,i)=>mod(x+quotientPlusAc[i])),recovered=cipher.map((x,i)=>mod(x-quotientPlusAc[i]));
assert.deepEqual(recovered,plant);
const wrong=cipher.map((x,i)=>mod(x-schedules[1].pad[i])),wrongMatches=wrong.filter((x,i)=>x===plant[i]).length;assert.ok(wrongMatches<128);
const best=[...variants].sort((a,b)=>b.trigram-a.trigram)[0];
const summary={
 sourceHashes:{corpus:sha(corpusBytes),ink:sha(inkBytes),grid:sha(gridBytes),A:sha(Buffer.from(A)),B:sha(Buffer.from(B))},
 partition:{p53Total:p53.length,p53Black:A.length,p53Red:51,p54Ac:p54[0],p55:p55.length,B:B.length,quotientCoefficients:quotient.length,quotientPairs:quotientPairs.length,AcInsertedAt:51,keyLength:quotientPlusAc.length},
 pads:schedules.map(s=>({name:s.name,first:s.pad.slice(0,5),last:s.pad.slice(-5)})),
 relationMatches:variants.filter(x=>x.target==="A"&&x.sign===1).map(x=>({schedule:x.schedule,plus:x.matchesPlus,minus:x.matchesMinus})),
 expectedRandomMatches:128/29,
 bestOriginalCandidate:best,
 candidateTrigramRange:[Math.min(...variants.map(x=>x.trigram)),Math.max(...variants.map(x=>x.trigram))],
 referenceWindows,
 positivePlant:{exact:recovered.every((x,i)=>x===plant[i]),wrongGridPadExactMatches:wrongMatches},
 interpretation:"The exact 128+128 source partition does not support the tested additive field-trace pads: 127 quotient pairs with Ac inserted at the p54 boundary, or original-grid adjacent pairs in row/column order. This rejects only these explicit trace-pad conventions."
};
console.log(JSON.stringify(summary,null,2));
