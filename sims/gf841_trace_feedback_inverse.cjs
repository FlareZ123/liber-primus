"use strict";
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const MOD = 29;
const SECTION_LENGTHS = [729,1145,1738,1894,1021,1433,1680,3316];
const WINDOW_COUNT = 300;
const CONTROL_FILES = ["shakespeare_first300k.txt","gibran_prophet_58585.txt","emerson_essays_2944.txt"];
const sha256 = b => crypto.createHash("sha256").update(b).digest("hex");
const mod = x => ((x%MOD)+MOD)%MOD;
function inverse(x){for(let i=1;i<MOD;i++)if(mod(x*i)===1)return i;throw Error("nonunit");}
function derivative(c){return c.slice(0,-1).map((x,i)=>mod(x*(c.length-1-i)));}
function evaluateDescending(c,x){return c.reduce((v,n)=>mod(v*x+n),0);}
const corpusPath="resources/liber-primus/lp2-corpus.json";
const inkPath="resources/liber-primus/lp2-ink-annotations.json";
const gridPath="resources/liber-primus/base60-grid.json";
const corpusBytes=fs.readFileSync(path.join(ROOT,corpusPath));
const inkBytes=fs.readFileSync(path.join(ROOT,inkPath));
const gridBytes=fs.readFileSync(path.join(ROOT,gridPath));
const corpus=JSON.parse(corpusBytes.toString("utf8"));
const ink=JSON.parse(inkBytes.toString("utf8"));
const grid=JSON.parse(gridBytes.toString("utf8"));
const triads=ink.pages.flatMap(p=>(p.red_spans||[]).filter(s=>s.length===3).map(s=>({page:p.page,start:s.start,values:[...s.runes].map(r=>corpus.runes.indexOf(r))})));
const red3=triads.find(x=>x.page===3&&x.start===119),red39=triads.find(x=>x.page===39&&x.start===119);
assert.ok(red3&&red39);assert.deepEqual(red3.values,[13,23,2]);assert.deepEqual(red39.values,[27,5,15]);
const ac=corpus.pages.find(p=>p.page===54).indices[0];assert.equal(ac,24);
assert.deepEqual(red39.values,[mod(15*ac*ac),mod(-30*ac),15]);
const A=mod(-red3.values[0]*inverse(red3.values[2])),B=mod(-red3.values[1]*inverse(red3.values[2]));
assert.deepEqual([A,B],[8,3]);
const discriminant=mod(red3.values[1]**2-4*red3.values[0]*red3.values[2]);
const squares=new Set(Array.from({length:MOD},(_,i)=>mod(i*i)));
assert.equal(discriminant,19);assert.equal(squares.has(discriminant),false);
function multiply(x,y){return [mod(x[0]*y[0]+A*x[1]*y[1]),mod(x[0]*y[1]+x[1]*y[0]+B*x[1]*y[1])];}
const u=[0,1];let power=[1,0];const seen=new Set();
for(let i=0;i<840;i++){const k=power.join(",");assert.equal(seen.has(k),false);seen.add(k);power=multiply(power,u);}
assert.equal(seen.size,840);assert.deepEqual(power,[1,0]);
const gridValues=grid.byte_rows.flat().map(mod);assert.equal(gridValues.length,256);
assert.equal(evaluateDescending(gridValues,ac),0);assert.equal(evaluateDescending(derivative(gridValues),ac),0);
assert.notEqual(evaluateDescending(derivative(derivative(gridValues)),ac),0);
const pages=corpus.pages.filter(p=>p.page<56),original=pages.flatMap(p=>p.indices);
assert.equal(pages.length,56);assert.equal(pages.filter(p=>p.indices.length>0).length,55);assert.equal(original.length,12956);
const SECTION_LENGTHS2=[729,1145,1738,1894,1021,1433,1680,3316];
assert.equal(SECTION_LENGTHS2.reduce((a,b)=>a+b,0),original.length);
assert.ok(original.every(x=>Number.isInteger(x)&&x>=0&&x<MOD));
const originalBytes=Buffer.from(original);
const originalDoublets=pages.reduce((sum,p)=>sum+p.indices.slice(1).filter((x,i)=>x===p.indices[i]).length,0);
assert.equal(originalDoublets,86);
const trace=s=>mod(2*s[0]+3*s[1]);
const norm=s=>mod(s[0]*s[0]+3*s[0]*s[1]-8*s[1]*s[1]);
const projections={a:s=>s[0],b:s=>s[1],trace,norm};
const initialState=[ac,0];
function transform(input,o,decode,seed=initialState){
 const {feedback,reset,sign,projection}=o;assert.ok(feedback==="plain"||feedback==="cipher");
 assert.ok(["book","page","section"].includes(reset));assert.ok(sign===1||sign===-1);assert.ok(Object.hasOwn(projections,projection));
 const output=[];let state=[...seed],offset=0,section=0,nextSectionEnd=SECTION_LENGTHS2[0];
 for(const page of pages){if(reset==="page")state=[...seed];for(let local=0;local<page.indices.length;local++){
  if(reset==="section"&&offset===nextSectionEnd){section++;nextSectionEnd+=SECTION_LENGTHS2[section];state=[...seed];}
  const value=input[offset];assert.ok(Number.isInteger(value)&&value>=0&&value<MOD);
  if(decode){const plain=mod(value-sign*projections[projection](state));output.push(plain);
   const f=feedback==="plain"?plain:value;state=multiply(u,state);state[0]=mod(state[0]+f);
  }else{const cipher=mod(value+sign*projections[projection](state));output.push(cipher);
   const f=feedback==="plain"?value:cipher;state=multiply(u,state);state[0]=mod(state[0]+f);}
  offset++;
 }}assert.equal(offset,input.length);return output;
}
function nativeGP(raw){
 const tokens=corpus.translit.map((text,index)=>({text,index})).sort((a,b)=>b.text.length-a.text.length);
 const words=raw.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/K/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").match(/[A-Z]+/g)||[];
 const out=[];for(const word of words){const encoded=[];for(let i=0;i<word.length;){const token=tokens.find(t=>word.startsWith(t.text,i));if(!token){encoded.length=0;break;}encoded.push(token.index);i+=token.text.length;}out.push(...encoded);}return out;
}
function ioc(a){const f=Array(MOD).fill(0);for(const x of a)f[x]++;return f.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1));}
function train(a){const c=new Map();let n=0;for(let i=0;i+2<a.length;i++){const k=a[i]*MOD*MOD+a[i+1]*MOD+a[i+2];c.set(k,(c.get(k)||0)+1);n++;}return {c,n};}
const controlRunes=CONTROL_FILES.map(n=>nativeGP(fs.readFileSync(path.join(ROOT,"resources/control",n),"utf8")));
const model=train(controlRunes[0]),smooth=0.1,den=model.n+smooth*MOD**3;
function tri(a){let s=0;for(let i=0;i+2<a.length;i++){const k=a[i]*MOD*MOD+a[i+1]*MOD+a[i+2];s+=Math.log(((model.c.get(k)||0)+smooth)/den);}return s/(a.length-2);}
function summarize(runes){const max=runes.length-original.length;assert.ok(max>=0);const ws=[];for(let i=0;i<WINDOW_COUNT;i++){const start=Math.floor(i*max/(WINDOW_COUNT-1));ws.push(runes.slice(start,start+original.length));}
 const ii=ws.map(ioc).sort((a,b)=>a-b),tt=ws.map(tri).sort((a,b)=>a-b);return {windows:WINDOW_COUNT,ioc:{min:ii[0],median:ii[149],max:ii.at(-1)},trigram:{min:tt[0],median:tt[149],max:tt.at(-1)}};}
const controls=CONTROL_FILES.map((name,i)=>({source:name,GP_runes:controlRunes[i].length,...summarize(controlRunes[i])}));
const plant=controlRunes[0].slice(0,original.length);assert.equal(plant.length,original.length);
const variants=[];
for(const feedback of ["plain","cipher"])for(const reset of ["book","page","section"])for(const sign of [1,-1])for(const projection of ["a","b","trace","norm"]){
 const o={feedback,reset,sign,projection},decoded=transform(original,o,true),reciphered=transform(decoded,o,false);
 assert.deepEqual(reciphered,original);
 const plantedCipher=transform(plant,o,false),recoveredPlant=transform(plantedCipher,o,true);
 assert.deepEqual(recoveredPlant,plant);
 const wrongSeed=transform(plantedCipher,o,true,[25,0]);assert.notDeepEqual(wrongSeed,plant);
 const doublets=decoded.slice(1).reduce((n,v,i)=>n+(v===decoded[i]?1:0),0);
 variants.push({...o,originalRoundtrip:true,sourceNativePlantExact:true,wrongSeedRejected:true,ioc:ioc(decoded),trigram:tri(decoded),doublets});
}
assert.equal(variants.length,48);
const byTrigram=[...variants].sort((a,b)=>b.trigram-a.trigram),byIoc=[...variants].sort((a,b)=>b.ioc-a.ioc);
const summary={
 originalRunes:original.length,originalWithinPageDoublets:originalDoublets,originalRuneStreamSHA256:sha256(originalBytes),
 sourceInputSHA256:{corpus:sha256(corpusBytes),inkAnnotations:sha256(inkBytes),numericGrid:sha256(gridBytes)},
 sourceDerivation:{p3RedTriad:red3.values,p39RedTriad:red39.values,p3FieldRelation:"u^2 = 3u + 8 mod 29",p3Discriminant:discriminant,p3PrimitiveOrder:seen.size,p39Factor:"15*(X-24)^2 mod 29",p54OversizedAc:ac,initialState},
 model:{equation:"C_i = P_i + sign*projection(S_i); S_(i+1)=u*S_i+X_i",feedback:["plain","cipher"],resets:["book","page","section"],signs:[1,-1],projections:["a","b","trace","norm"],variantCount:variants.length},
 controls,
 original:{iocRange:[Math.min(...variants.map(x=>x.ioc)),Math.max(...variants.map(x=>x.ioc))],trigramRange:[Math.min(...variants.map(x=>x.trigram)),Math.max(...variants.map(x=>x.trigram))],doubletRange:[Math.min(...variants.map(x=>x.doublets)),Math.max(...variants.map(x=>x.doublets))],bestTrigram:byTrigram[0],bestIoc:byIoc[0]},
 controlsPassed:{originalExactRoundtrips:variants.filter(x=>x.originalRoundtrip).length,sourceNativePlantsRecovered:variants.filter(x=>x.sourceNativePlantExact).length,wrongSeedRejected:variants.filter(x=>x.wrongSeedRejected).length},
 interpretation:"All 48 source-seeded scalar-output GF(29^2) feedback variants are mechanically reversible and pass native-GP plants, but every original output remains far below native-GP English windows. This excludes only the declared projections, feedback choices and reset clocks; it does not exclude general nonlinear, quotient-driven or non-GP registers."
};
assert.deepEqual(summary.controlsPassed,{originalExactRoundtrips:48,sourceNativePlantsRecovered:48,wrongSeedRejected:48});
console.log(JSON.stringify(summary,null,2));
