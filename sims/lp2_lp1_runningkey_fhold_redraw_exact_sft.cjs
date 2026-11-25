'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const mod=x=>(x%29+29)%29,S=.81288,LR=Math.log(S),LA=Math.log1p(-S);

/** @param {number[][]} seqs */
function model(seqs){
 const u=new Float64Array(29),b=new Float64Array(870),t=new Float64Array(26100),bt=new Float64Array(30),tt=new Float64Array(900);
 let count=0;
 for(const seq of seqs){let a=29,z=29;for(const p of seq){u[p]++;count++;b[z*29+p]++;bt[z]++;t[(a*30+z)*29+p]++;tt[a*30+z]++;a=z;z=p;}}
 return t.map((v,i)=>{const p=i%29,ctx=Math.floor(i/29),z=ctx%30,pu=(u[p]+.5)/(count+14.5),pb=(b[z*29+p]+6*pu)/(bt[z]+6);return Math.log((v+6*pb)/(tt[ctx]+6));});
}

/** Exact all-origin or fixed-origin Viterbi; states merge only on cursor and last two runes.
 * @param {number[]} c @param {number[]} k @param {number} sign @param {Float64Array} lm
 * @param {{start?:number,a?:number,b?:number,prev?:number,trace?:boolean,endId?:number}} opt */
function solve(c,k,sign,lm,opt={}){
 const n=k.length,M=(n+1)*900,runEnd=new Int32Array(n);
 for(let j=n-1;j>=0;j--)runEnd[j]=j+1<n&&k[j]===k[j+1]?runEnd[j+1]:j+1;
 let scores=new Float64Array(M),nextScores=new Float64Array(M);scores.fill(-Infinity);nextScores.fill(-Infinity);
 let origins=new Int32Array(M),nextOrigins=new Int32Array(M),active=[],nextActive=[];
 let paths=opt.trace?new Map():null,nextPaths=opt.trace?new Map():null;
 const a0=opt.a??29,b0=opt.b??29,start=opt.start;
 for(let j=start??0;j<=(start??n);j++){const id=j*900+a0*30+b0;active.push(id);scores[id]=0;origins[id]=j;if(paths)paths.set(id,'');}
 let prev=opt.prev??-1,maxStates=active.length;
 for(let i=0;i<c.length;i++){
  const v=c[i],delta=mod(sign*(v-prev)),acc=v===prev?LA:0;
  nextActive.length=0;if(nextPaths)nextPaths.clear();
  for(const id of active){
   const j=Math.floor(id/900),ctx=id-j*900,b=ctx%30,base=scores[id],org=origins[id];
   const add=(p,h,cons,coin)=>{
    const nid=h*900+b*30+p,ns=base+lm[ctx*29+p]+coin,old=nextScores[nid];
    if(old===-Infinity)nextActive.push(nid);
    if(ns>old||(ns===old&&org<nextOrigins[nid])){
     nextScores[nid]=ns;nextOrigins[nid]=org;
     if(nextPaths)nextPaths.set(nid,paths.get(id)+String.fromCharCode(65+p,65+cons));
    }
   };
   if(v===0)add(0,j,0,0);
   if(j===n)continue;
   const p=mod(v-sign*k[j]);if(p!==0)add(p,j+1,1,acc);
   if(prev<0)continue;
   const e=runEnd[j];
   if(delta===0){if(p!==0)for(let h=j+1;h<e;h++)add(p,h+1,h-j+1,(h-j)*LR+acc);}
   else if(e<n&&mod(k[e]-k[j])===delta){const q=mod(v-sign*k[e]);if(q!==0)add(q,e+1,e-j+1,(e-j)*LR+acc);}
  }
  for(const id of active)scores[id]=-Infinity;
  [scores,nextScores]=[nextScores,scores];[origins,nextOrigins]=[nextOrigins,origins];[active,nextActive]=[nextActive,active];
  if(paths)[paths,nextPaths]=[nextPaths,paths];
  if(!active.length)return {failedAt:i,maxStates};
  maxStates=Math.max(maxStates,active.length);prev=v;
 }
 let best=-1;
 if(opt.endId!==undefined){if(scores[opt.endId]!==-Infinity)best=opt.endId;}
 else for(const id of active)if(best<0||scores[id]>scores[best]||(scores[id]===scores[best]&&(origins[id]<origins[best]||(origins[id]===origins[best]&&id<best))))best=id;
 if(best<0)return {failedAt:c.length,maxStates};
 const j=Math.floor(best/900),ctx=best-j*900,answer={score:scores[best],origin:origins[best],end:j,a:Math.floor(ctx/30),b:ctx%30,endId:best,maxStates,terminalStates:active.length};
 if(paths){const p=[],cons=[],v=paths.get(best);for(let i=0;i<v.length;i+=2){p.push(v.charCodeAt(i)-65);cons.push(v.charCodeAt(i+1)-65);}answer.plain=p;answer.cons=cons;}
 return answer;
}

/** Validate every original output and every hidden redraw. */
function replay(p,cons,k,sign,origin,prev=-1){
 const c=[];let j=origin;
 for(let i=0;i<p.length;i++){
  const x=p[i],d=cons[i];let v;
  if(x===0){assert.equal(d,0);v=0;}
  else{assert(d>=1&&j+d<=k.length);for(let r=0;r<d-1;r++)assert.equal(mod(x+sign*k[j+r]),prev);v=mod(x+sign*k[j+d-1]);j+=d;}
  c.push(v);prev=v;
 }
 return {c,end:j};
}
function plant(p,k,sign,origin,seed){
 let j=origin,prev=-1;const c=[],cons=[],rnd=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)/4294967296;};
 for(const x of p){
  if(x===0){c.push(0);cons.push(0);prev=0;continue;}
  const start=j;let v=mod(x+sign*k[j++]);
  while(v===prev&&rnd()<S){assert(j<k.length);v=mod(x+sign*k[j++]);}
  c.push(v);cons.push(j-start);prev=v;
 }
 return {c,cons,end:j,redraws:cons.reduce((a,b)=>a+Math.max(0,b-1),0)};
}
function prepare(lp2,lp1,printed){
 const gp=new Map(lp1.runes.map((v,i)=>[v,i])),toGP=t=>Array.from(t).filter(v=>gp.has(v)).map(v=>gp.get(v));
 const sections=lp1.sections.map(s=>toGP(s.source_text)),print=toGP(printed);
 const koan=toGP(printed.split('%').slice(4,8).join('')).map(v=>(60-v)%29);sections[3]=koan;
 const clear=sections.slice(0,7).flat();assert.equal(print.length,2797);assert.equal(clear.length,2797);
 const starts=[0,729,1874,3603,5506,6527,7960,9640,12648,12956],tape=lp2.pages.slice(0,56).flatMap(p=>p.indices);assert.equal(tape.length,12956);
 const lm=model([0,2,3,4,6].map(i=>sections[i]));
 const variants=(cleared=clear)=>['corrected','printed'].flatMap((name,i)=>['index','prime'].flatMap(encoding=>[1,-1].map(sign=>({name,encoding,sign,k:(i?print:cleared).map(v=>encoding==='prime'?lp2.prime[v]%29:v)}))));
 return {lp2,sections,clear,print,starts,tape,lm,variants};
}
function predict(c,split,variants,lm,truth=null,oracle=true){
 const pre=c.slice(0,split),suf=c.slice(split),fits=[];
 for(let vi=0;vi<variants.length;vi++){const v=variants[vi];fits.push({vi,...solve(pre,v.k,v.sign,lm)});}
 const ranked=fits.filter(x=>x.score!==undefined).sort((a,b)=>b.score-a.score||a.vi-b.vi);
 function materialize(fit){
  if(!fit)return null;
  const {name,encoding,sign,k}=variants[fit.vi],first=solve(pre,k,sign,lm,{start:fit.origin,endId:fit.endId,trace:true});
  assert(Math.abs(first.score-fit.score)<1e-8);
  const last=solve(suf,k,sign,lm,{start:fit.end,a:fit.a,b:fit.b,prev:pre.at(-1),trace:true});
  const a=replay(first.plain,first.cons,k,sign,fit.origin);assert.deepEqual(a.c,pre);assert.equal(a.end,fit.end);
  if(last.plain){const b=replay(last.plain,last.cons,k,sign,fit.end,pre.at(-1));assert.deepEqual(b.c,suf);assert.equal(b.end,last.end);}
  return {name,encoding,sign,origin:fit.origin,cursor:fit.end,prefixScore:fit.score/pre.length,holdoutScore:last.score===undefined?null:last.score/suf.length,prefix:first.plain,prefixClock:first.cons,suffix:last.plain??null,suffixClock:last.cons??null,truthPrefix:truth?first.plain.filter((p,i)=>p===truth[i]).length:null,truthSuffix:truth&&last.plain?last.plain.filter((p,i)=>p===truth[split+i]).length:null,failedAt:last.failedAt??null};
 }
 const winner=materialize(ranked[0]),oracleRows=[];
 if(oracle)for(let vi=0;vi<variants.length;vi++){const v=variants[vi];oracleRows.push({vi,...solve(c,v.k,v.sign,lm)});}
 const o=oracleRows.filter(x=>x.score!==undefined).sort((a,b)=>b.score-a.score||a.vi-b.vi)[0];
 let bestFull=null;
 if(o){
  const v=variants[o.vi],f=solve(c,v.k,v.sign,lm,{start:o.origin,endId:o.endId,trace:true});assert(Math.abs(f.score-o.score)<1e-8);
  assert.deepEqual(replay(f.plain,f.cons,v.k,v.sign,o.origin).c,c);
  bestFull={name:v.name,encoding:v.encoding,sign:v.sign,origin:o.origin,score:o.score/c.length,plain:f.plain,clock:f.cons};
 }
 return {n:c.length,split,holdout:suf.length,fits,winner,oracleRows,bestFull};
}
function control(prep,section,encoding,sign,offset,split,seed){
 const p=prep.sections[section],key=prep.sections.slice(0,7).flatMap((s,i)=>i===section?[]:s),variants=prep.variants(key);
 const chosen=variants.find(x=>x.name==='corrected'&&x.encoding===encoding&&x.sign===sign),pl=plant(p,chosen.k,sign,offset,seed);
 return {target:section,planted:{name:chosen.name,encoding,sign,offset,redraws:pl.redraws,holds:p.filter(x=>!x).length},...predict(pl.c,split,variants,prep.lm,p,false)};
}
function original(prep,ch){
 const {starts,tape}=prep,c=tape.slice(starts[ch],Math.min(starts[ch+1],starts[ch]+729)),split=ch===0?262:ch===8?232:Math.floor(c.length*2/3);
 return {chapter:ch,...predict(c,split,prep.variants(),prep.lm,null,true)};
}
function main(){
 const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'),prep=prepare(JSON.parse(read('resources/liber-primus/lp2-corpus.json')),JSON.parse(read('resources/external/relikd-solved-gp29-native-v1.json')),read('resources/transcriptions/lp1_wulfic_canonical.txt'));
 const arg=process.argv[2]??'all',output=[];
 if(arg==='controls'||arg==='all')for(const a of [[1,'index',1,451,260,0x93ba7],[5,'prime',-1,821,180,0x12d34],[8,'index',-1,1117,55,0x879c]])output.push(control(prep,...a));
 if(arg==='all'||/^[0-8]$/.test(arg))for(const ch of arg==='all'?[0,1,2,3,4,5,6,7,8]:[Number(arg)])output.push(original(prep,ch));
 console.log(JSON.stringify(output,null,2));
}
module.exports={model,solve,replay,plant,prepare,predict,control,original};
if(require.main===module)main();
