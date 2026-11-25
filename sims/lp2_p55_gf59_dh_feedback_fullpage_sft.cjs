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
  if(!maps.square.every((v,i)=>v===mod(2*maps.signed[i])))throw Error('square/signed equivalence');
  delete maps.signed;
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
  const rowBi=seq(29).map(y=>bi.slice(y*29,(y+1)*29).reduce((a,b)=>a+b,0));
  const rowTri=seq(29*29).map(x=>tri.slice(x*29,(x+1)*29).reduce((a,b)=>a+b,0));
  for(let x=0;x<29;x++)for(let y=0;y<29;y++)for(let z=0;z<29;z++){
    const p0=(uni[z]+.5)/(uTotal+14.5),p1=(bi[y*29+z]+10*p0)/(rowBi[y]+10);
    table[(x*29+y)*29+z]=Math.log((tri[(x*29+y)*29+z]+15*p1)/(rowTri[x*29+y]+15));
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
  for(const [key,filter] of Object.entries({all:k=>true,sourceExponent:k=>k.a===6,sourceIndices:k=>k.a===6&&[8,19].includes(k.iv),square:k=>k.kind==='square'})){
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
  // Exact latent plaintext-F holds. Retain every distinct state/context, then
  // rank on the prefix only. Carry all feasible prefix states for the chosen key.
  const initial=(kind,iv)=>new Map([[maps[kind][iv]*900+29*30+29,{state:maps[kind][iv],x:29,y:29,s:0,path:''}]]);
  const advance=(states,c,kind,a,mode)=>{
    const m=maps[kind],b=inv[kind],next=new Map();
    for(const v of states.values()){
      const put=(p,state)=>{
        const ss=v.s+(v.x===29?0:table[(v.x*29+v.y)*29+p]);
        const k=state*900+v.y*30+p;
        const old=next.get(k);
        if(!old||ss>old.s)next.set(k,{state,x:v.y,y:p,s:ss,path:v.path+String.fromCharCode(65+p)});
      };
      if(c===0)put(0,v.state);
      const p=b[mod(m[c]-a*v.state)];
      if(p!==0)put(p,mode==='previous'?m[c]:mod(v.state+m[c]));
    }return next;
  };
  const walk=(c,k,states=initial(k.kind,k.iv))=>{
    for(const x of c){states=advance(states,x,k.kind,k.a,k.mode);if(!states.size)break}
    return states;
  };
  const bestOf=states=>{let best=null;for(const x of states.values())if(!best||x.s>best.s)best=x;return best};
  const asRunes=p=>[...p].map(c=>c.charCodeAt(0)-65);
  const encF=(p,k)=>{
    const m=maps[k.kind],b=inv[k.kind];let state=m[k.iv],c=[];
    for(const x of p){
      if(x===0){c.push(0);continue}
      const y=b[mod(m[x]+k.a*state)];c.push(y);state=k.mode==='previous'?m[y]:mod(state+m[y]);
    }return c;
  };
  const rankF=(c,split,allow=()=>true)=>{
    let eligible=0,prefixFeasible=0,fullFeasible=0,winner=null,maxDirectHold=-Infinity;
    for(const k of candidates)if(allow(k)){
      eligible++;
      const states=walk(c.slice(0,split),k),b=bestOf(states);
      if(!b)continue;
      prefixFeasible++;
      const full=walk(c.slice(split),k,states);
      const f=bestOf(full);
      if(f){fullFeasible++;const p=asRunes(f.path);maxDirectHold=Math.max(maxDirectHold,score(p,split));}
      if(!winner||b.s>winner.fitSum)winner={k,fitSum:b.s,states};
    }
    if(!winner)return {eligible,prefixFeasible,fullFeasible};
    const f=bestOf(walk(c.slice(split),winner.k,winner.states));
    const base={eligible,prefixFeasible,fullFeasible,selected:winner.k,fit:winner.fitSum/(split-2),directHoldDiagnostic:Number.isFinite(maxDirectHold)?maxDirectHold:null};
    if(!f)return {...base,hold:null,reason:'prefix winner has no full path'};
    const p=asRunes(f.path);
    if(!same(encF(p,winner.k),c))throw Error('latent F replay');
    return {...base,hold:score(p,split),holdText:decipher(p.slice(split)),fitText:decipher(p.slice(0,split)),exactReplay:true,p};
  };
  output.fhold={original:{},controls:[]};
  for(const [key,filter] of Object.entries({all:k=>true,sourceExponent:k=>k.a===6,sourceIndices:k=>k.a===6&&[8,19].includes(k.iv)})){
    const r=rankF(original,232,filter);delete r.p;output.fhold.original[key]=r;
  }
  for(let i=0;i<donors.length;i++)for(const kind of Object.keys(maps))for(const mode of ['previous','product']){
    const d=donors[i],split=Math.floor(d.x.length*.75),k={kind,mode,a:[6,17,11,23][i],iv:[8,19,13,2][i]};
    const c=encF(d.x,k),r=rankF(c,split),p=r.p;
    const correctHold=p?p.slice(split).filter((v,j)=>v===d.x[split+j]).length:0;
    delete r.p;delete r.fitText;delete r.holdText;
    output.fhold.controls.push({donor:d.name,planted:k,holdLength:d.x.length-split,correctHold,expectedHold:score(d.x,split),...r});
  }
  // Page-local p55 independent reset: no fitting claim; enumerate every key and
  // every legal F path for this direct diagnostic. The terminal winner is postselected.
  const single=rank(p55,p55.length);
  delete single.p;delete single.best.hold;delete single.best.holdIoC;delete single.best.holdText;
  output.pageLocalOrdinary=single;
  let fBest=null,legal=0;
  for(const k of candidates){
    const f=bestOf(walk(p55,k));if(!f)continue;legal++;
    if(!fBest||f.s>fBest.s)fBest={...f,k};
  }
  output.pageLocalF={tested:candidates.length,legal,selected:fBest?.k,score:fBest?fBest.s/(p55.length-2):null,text:fBest?decipher(asRunes(fBest.path)):null,exactReplay:fBest?same(encF(asRunes(fBest.path),fBest.k),p55):null};
  // Source-fixed DIUINITY (native WELCOME keyword explicitly echoed by p57).
  // No unknown exponent digits or other keywords are searched.
  const keyword=[...'DIUINITY'].map(x=>corpus.translit.indexOf(x));
  if(keyword.length!==8||keyword.some(x=>x<0))throw Error('native key alphabet');
  const schedule=[];
  for(const kind of Object.keys(maps))for(const mode of ['previous','product'])for(let phase=0;phase<8;phase++)for(let iv=0;iv<29;iv++)schedule.push({kind,mode,phase,iv});
  const ksRun=(data,k,hold,encode)=>{
    const m=maps[k.kind],b=inv[k.kind];let state=m[k.iv],phase=k.phase,output=[];
    for(const v of data){
      if(hold&&encode&&v===0){output.push(0);continue}
      const x=b[mod(m[v]+(encode?1:-1)*keyword[phase]*state)];
      output.push(x);const c=encode?x:v;
      state=k.mode==='previous'?m[c]:mod(state+m[c]);phase=(phase+1)%8;
    }return output;
  };
  const ksWalk=(data,k,hold,states)=>{
    const m=maps[k.kind],b=inv[k.kind];
    if(!states)states=new Map([[0,{state:m[k.iv],phase:k.phase,x:29,y:29,s:0,path:''}]]);
    for(const c of data){
      const next=new Map();
      for(const v of states.values()){
        const put=(p,state,phase)=>{
          const s=v.s+(v.x===29?0:table[(v.x*29+v.y)*29+p]);
          const id=((state*8+phase)*30+v.y)*30+p;
          const old=next.get(id);
          if(!old||s>old.s)next.set(id,{state,phase,x:v.y,y:p,s,path:v.path+String.fromCharCode(65+p)});
        };
        if(hold&&c===0)put(0,v.state,v.phase);
        const p=b[mod(m[c]-keyword[v.phase]*v.state)];
        if(!hold||p!==0)put(p,k.mode==='previous'?m[c]:mod(v.state+m[c]),(v.phase+1)%8);
      }
      states=next;if(!states.size)break;
    }return states;
  };
  const ksRank=(c,split,hold)=>{
    let best=null,prefixFeasible=0,fullFeasible=0;
    for(const k of schedule){
      const states=ksWalk(c.slice(0,split),k,hold),b=bestOf(states);
      if(!b)continue;prefixFeasible++;
      if(ksWalk(c.slice(split),k,hold,states).size)fullFeasible++;
      if(!best||b.s>best.s)best={k,s:b.s,states};
    }
    if(!best)return {tested:schedule.length,prefixFeasible,fullFeasible};
    const f=bestOf(ksWalk(c.slice(split),best.k,hold,best.states));
    const out={tested:schedule.length,prefixFeasible,fullFeasible,selected:best.k,fit:best.s/(split-2)};
    if(!f)return {...out,hold:null,reason:'prefix winner has no legal suffix'};
    const p=asRunes(f.path);
    if(!same(ksRun(p,best.k,hold,true),c))throw Error('keyword replay');
    return {...out,hold:split===c.length?null:score(p,split),readout:decipher(p),p,exactReplay:true};
  };
  output.keyword={literal:'DIUINITY',indices:keyword,original:{},pageLocal:{},controls:[]};
  for(const hold of [false,true]){
    const mode=hold?'fhold':'ordinary';
    const t=ksRank(original,232,hold);delete t.p;output.keyword.original[mode]=t;
    const v=ksRank(p55,p55.length,hold);delete v.p;output.keyword.pageLocal[mode]=v;
    for(let i=0;i<donors.length;i++)for(const kind of Object.keys(maps))for(const update of ['previous','product']){
      const d=donors[i],split=Math.floor(d.x.length*.75),k={kind,mode:update,phase:[2,5,3,7][i],iv:[8,19,13,2][i]};
      const c=ksRun(d.x,k,hold,true),z=ksRank(c,split,hold),p=z.p;
      const correctHold=p?p.slice(split).filter((v,j)=>v===d.x[split+j]).length:0;
      delete z.p;delete z.readout;
      output.keyword.controls.push({fBypass:hold,donor:d.name,planted:k,correctHold,holdLength:d.x.length-split,...z});
    }
  }
  return output;
}
module.exports={experiment};
if(require.main===module){
 const root=process.argv[2]||'.';
 const data=experiment(JSON.parse(fs.readFileSync(root+'/resources/liber-primus/lp2-corpus.json','utf8')),JSON.parse(fs.readFileSync(root+'/resources/external/relikd-solved-gp29-native-v1.json','utf8')));
 console.log(JSON.stringify(data,null,2));
}
