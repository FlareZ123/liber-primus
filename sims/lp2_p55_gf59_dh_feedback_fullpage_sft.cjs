/** Full-length GF59 subgroup ciphertext-feedback gate. Node 22 CommonJS. */
const fs = require('node:fs');
const assert = require('node:assert/strict');
function experiment(corpus, reference) {
  const mod = (x,m=29)=>((x%m)+m)%m;
  const pow = (x,n)=>{let r=1; for(let k=0;k<n;k++)r=r*x%59;return r};
  const seq = n=>Array.from({length:n},(_,i)=>i);
  const exponent=seq(29).map(i=>pow(5,i));
  const log=Array(59).fill(-1);exponent.forEach((v,i)=>log[v]=i);
  const maps={
    exponential:seq(29),
    square:seq(29).map(i=>log[(i+1)**2%59]),
    signed:seq(29).map(i=>{let x=i+1;return log[x]>=0?log[x]:log[59-x]})
  };
  const inv=Object.fromEntries(Object.entries(maps).map(([k,m])=>{let a=Array(29);m.forEach((v,i)=>a[v]=i);if(new Set(m).size!==29||m.some(v=>v<0))throw Error('invalid transport');return [k,a]}));
  const run=(input,kind,a,iv,mode,encode=false)=>{
    const m=maps[kind],b=inv[kind];let state=m[iv];const output=[];
    for(const x of input){
      const y=b[mod(m[x]+(encode?1:-1)*a*state)];
      output.push(y); const c=encode?y:x;
      state=mode==='previous'?m[c]:mod(state+m[c]);
    }return {output,state};
  };
  const same=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
  const sections=reference.sections.map(s=>({name:s.name,x:[...s.source_text].map(c=>reference.runes.indexOf(c)).filter(i=>i>=0)}));
  const train=sections.filter(s=>!['p56_an_end','p57_parable','0_warning','0_wisdom'].includes(s.name));
  const uni=Array(29).fill(0),bi=Array(29*29).fill(0),tri=Array(29**3).fill(0);
  for(const {x} of train)for(let i=0;i<x.length;i++){uni[x[i]]++;if(i)bi[x[i-1]*29+x[i]]++;if(i>1)tri[(x[i-2]*29+x[i-1])*29+x[i]]++}
  const uTotal=uni.reduce((a,b)=>a+b,0);
  const table=new Float64Array(29**3);
  for(let x=0;x<29;x++)for(let y=0;y<29;y++)for(let z=0;z<29;z++){
    const p0=(uni[z]+.5)/(uTotal+14.5),p1=(bi[y*29+z]+10*p0)/(uni[y]+10);
    table[(x*29+y)*29+z]=Math.log((tri[(x*29+y)*29+z]+15*p1)/(bi[x*29+y]+15));
  }
  const score=(x,start=0,end=x.length)=>{let s=0,n=0;for(let i=Math.max(2,start);i<end;i++){s+=table[(x[i-2]*29+x[i-1])*29+x[i]];n++}return s/n};
  const ioc=x=>{const f=Array(29).fill(0);x.forEach(v=>f[v]++);return f.reduce((s,v)=>s+v*(v-1),0)/(x.length*(x.length-1))};
  const decipher=x=>x.map(i=>corpus.translit[i]).join('');
  const candidates=[];
  for(const kind of Object.keys(maps))for(const mode of ['previous','product'])for(let a=0;a<29;a++)for(let iv=0;iv<29;iv++)candidates.push({kind,mode,a,iv});
  const p54=corpus.pages.find(p=>p.page===54).indices,p55=corpus.pages.find(p=>p.page===55).indices;
  if(p54.length!==232||p55.length!==76)throw Error('source size mismatch');
  const rank=(c,split,allow=()=>true)=>{
    const res=[];for(const k of candidates)if(allow(k)){
      const p=run(c,k.kind,k.a,k.iv,k.mode).output;
      const fit=score(p,0,split);
      res.push({...k,fit,p});
    }
    res.sort((a,b)=>b.fit-a.fit);
    const best=res[0];return {tested:res.length, best:{kind:best.kind,mode:best.mode,a:best.a,iv:best.iv,fit:best.fit,hold:score(best.p,split),holdIoC:ioc(best.p.slice(split)),fitText:decipher(best.p.slice(0,split)),holdText:decipher(best.p.slice(split)),exactReplay:same(run(best.p,best.kind,best.a,best.iv,best.mode,true).output,c)},topFitTies:res.filter(x=>Math.abs(x.fit-best.fit)<1e-12).length,p:best.p};
  };
  const original=p54.concat(p55);
  let output={transports:maps, training:train.map(s=>[s.name,s.x.length]),sourceSizes:[p54.length,p55.length], original:{}};
  for(const [key,filter] of Object.entries({all:k=>true,sourceExponent:k=>k.a===6,sourceIndices:k=>k.a===6&&[8,19].includes(k.iv),squareSigned:k=>k.kind!=='exponential'})){
    const r=rank(original,232,filter);delete r.p;output.original[key]=r
  }
  // Full original replay for EVERY candidate; no candidate accepted merely because it round-trips.
  let replay=0;for(const k of candidates){const p=run(original,k.kind,k.a,k.iv,k.mode).output;if(!same(run(p,k.kind,k.a,k.iv,k.mode,true).output,original))throw Error('replay failure');replay+=original.length}
  output.replayedOriginalSymbols=replay;
  // Two separate held-out source-native LP1 passages; p56/p57 controls separately measured.
  const donors=sections.filter(s=>['0_warning','0_wisdom','p57_parable','p56_an_end'].includes(s.name));
  output.controls=[];
  for(let i=0;i<donors.length;i++)for(const kind of Object.keys(maps))for(const mode of ['previous','product']){
    const d=donors[i],split=Math.floor(d.x.length*.75),a=[6,17,11,23][i],iv=[8,19,13,2][i];
    const c=run(d.x,kind,a,iv,mode,true).output;const r=rank(c,split);
    const truePlain=run(c,kind,a,iv,mode).output;
    if(!same(truePlain,d.x))throw Error('native replay failed');
    output.controls.push({donor:d.name,kind,mode,a,iv,split,expectedHold:score(d.x,split),fit:r.best.fit,hold:r.best.hold, selected:{kind:r.best.kind,mode:r.best.mode,a:r.best.a,iv:r.best.iv},correctHold:r.p.slice(split).filter((v,j)=>v===d.x[split+j]).length,holdLength:d.x.length-split,exactReplay:r.best.exactReplay});
  }
  return output;
}
module.exports={experiment};
if(require.main===module){
 const root=process.argv[2]||'.';
 const data=experiment(JSON.parse(fs.readFileSync(root+'/resources/liber-primus/lp2-corpus.json','utf8')),JSON.parse(fs.readFileSync(root+'/resources/external/relikd-solved-gp29-native-v1.json','utf8')));
 console.log(JSON.stringify(data,null,2));
}
