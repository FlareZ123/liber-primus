"use strict";
/** Agent9: budgeted lifting inversion and integer dual certificate. Read-only. */
const fs=require("node:fs"),path=require("node:path");
function experiment(raw){
 const gp=JSON.parse(raw[0]),gold=JSON.parse(raw[1]),ix=new Map(gp.runes.map((x,i)=>[x,i])),tokens=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
 const mod=x=>(x%29+29)%29,check=(v,m)=>{if(!v)throw Error(m)},same=(a,b)=>a.length===b.length&&a.every((v,i)=>v===b[i]),id=w=>String.fromCharCode(...w.map(x=>65+x)),nums=s=>Array.from(s,x=>x.charCodeAt(0)-65),all=(1<<29)-1;
 function word(w,alt=true){w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const o=[];for(let j=0;j<w.length;){const q=alt&&w.startsWith("ING",j)?{t:"ING",i:21}:alt&&w.startsWith("IO",j)?{t:"IO",i:27}:tokens.find(o=>w.startsWith(o.t,j));if(!q)throw Error("native "+w);o.push(q.i);j+=q.t.length;}return o;}
 function body(t){const a=/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t),b=/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t);return t.slice(a?a.index+a[0].length:0,b?b.index:t.length);}
 const donors=raw.slice(2,5).map(t=>(body(t).toUpperCase().match(/[A-Z]+/g)||[]).map(w=>word(w))),training=donors.map(w=>w.slice(0,Math.floor(w.length*.8)));
 for(const s of gold.sections)if(!["0_welcome","jpg107-167"].includes(s.name))training.push((s.source_text.match(/[\u16a0-\u16ff]+/gu)||[]).map(t=>[...t].map(x=>ix.get(x))).filter(w=>w.every(Number.isInteger)));
 const types=new Set(Array.from({length:29},(_,x)=>String.fromCharCode(65+x)));for(const a of training)for(const w of a)if(w.length&&w.length<=24)types.add(id(w));
 for(const ln of raw[5].split(/\r?\n/)){const m=ln.match(/^([a-z]+)\s+(\d+)$/i);if(!m)continue;for(const alt of [true,false]){const k=id(word(m[1],alt));if(k.length<=24)types.add(k);}}
 check(types.size===35944,"frozen register");
 const byLen=new Map();for(const w of types){if(!byLen.has(w.length))byLen.set(w.length,[]);byLen.get(w.length).push(nums(w));}
 const orig=[];let w=[];for(const x of raw[6].split("%").slice(0,55).join("%")){if(ix.has(x))w.push(ix.get(x));else if(x!=="%"&&x!=="/"&&!/\s/u.test(x)&&w.length){orig.push(w);w=[];}}if(w.length)orig.push(w);
 const full=gp.pages.filter(x=>x.page<56).flatMap(x=>x.indices);check(same(orig.flat(),full),"original transcript");
 let off=0;const rows=[];for(const w of orig){rows.push({start:off,len:w.length});off+=w.length;}
 const aRows=rows.filter(w=>w.start<729),bRows=rows.filter(w=>w.start>=12648).map(w=>({...w,start:w.start-12648}));check(aRows.length===158&&bRows.length===66,"chapter groups");
 const A=full.slice(0,729),B=full.slice(12648);
 const val=(a,i)=>i<0||i>=a.length?0:a[i],arg=(a,i)=>mod(val(a,i-1)+val(a,i+1));
 const encode=(p,{f,g})=>{const c=[...p];for(let i=1;i<c.length;i+=2)c[i]=mod(c[i]+f[arg(c,i)]);for(let i=0;i<c.length;i+=2)c[i]=mod(c[i]+g[arg(c,i)]);return c;};
 const evenDecode=(c,g)=>c.map((v,i)=>i%2?v:mod(v-g[arg(c,i)]));
 const decode=(c,{f,g})=>{const p=evenDecode(c,g);for(let i=1;i<p.length;i+=2)p[i]=mod(p[i]-f[arg(p,i)]);return p;};
 function factors(c,rows,stage,g=null){const e=g?evenDecode(c,g):null;
  return rows.map(({start,len},row)=>{
   const active=[];for(let j=0;j<len;j++){const i=start+j;if(i%2===stage)active.push({j,i,label:arg(stage?e:c,i)});}
   const vars=[...new Set(active.map(x=>x.label))].sort((a,b)=>a-b),pos=new Map(vars.map((v,i)=>[v,i])),dict=new Map();
   for(const p of byLen.get(len)||[]){if(stage&&p.some((v,j)=>(start+j)%2===0&&v!==e[start+j]))continue;
    const q=Array(vars.length).fill(-1);let ok=true;for(const x of active){const j=pos.get(x.label),v=mod(c[x.i]-p[x.j]);if(q[j]>=0&&q[j]!==v){ok=false;break;}q[j]=v;}
    if(ok){const k=id(q);if(!dict.has(k))dict.set(k,q);}
   }
   return {row,start,len,vars,tuples:[...dict.values()]};
  });
 }

 // Integer min-sum reparameterization. All costs in units Q.
 function dual(fs,sweeps=120,Q=1024,target=null){
  const ff=fs.map(f=>({...f,flat:Uint8Array.from(f.tuples.flat()),msg:f.vars.map(()=>new Int32Array(29))})),u=Array.from({length:29},()=>new Int32Array(29));
  function factor(f,j=-1){const d=f.vars.length,m=f.msg.map(x=>Math.min(...x)),sum=m.reduce((a,b)=>a+b,0),a=j<0?null:Int32Array.from(f.msg[j],v=>Q+sum-m[j]+v);let best=Q+sum;for(let t=0;t<f.flat.length;t+=d){let cost=0;for(let k=0;k<d;k++)cost+=f.msg[k][f.flat[t+k]];if(cost<best)best=cost;if(j>=0&&cost<a[f.flat[t+j]])a[f.flat[t+j]]=cost;}if(d===0)best=f.tuples.length?0:Q;return j<0?best:a;}
  function bound(){return ff.reduce((s,f)=>s+factor(f),0)+u.reduce((s,x)=>s+Math.min(...x),0);}
  const history=[bound()];for(let round=0;round<sweeps;round++){for(const f of ff)for(let j=0;j<f.vars.length;j++){const a=factor(f,j),b=u[f.vars[j]],m=f.msg[j];const shift=Int32Array.from(a,(x,v)=>Math.trunc((b[v]-x)/2)),offset=shift[0];for(let v=0;v<29;v++){const q=shift[v]-offset;m[v]+=q;b[v]-=q;}}
   if(round%5===4||round===sweeps-1){history.push(bound());if(target!==null&&history.at(-1)>target*Q)break;}
  }
  for(let v=0;v<29;v++)for(let x=0;x<29;x++){let z=u[v][x];for(const f of ff){const j=f.vars.indexOf(v);if(j>=0)z+=f.msg[j][x];}check(z===0,"reparameterization");}
  return {Q,lowerBound:history.at(-1)/Q,history,certificate:ff.map(f=>({row:f.row,vars:f.vars,msg:f.msg.map(x=>Array.from(x)),min:factor(f)})),u:u.map(x=>Array.from(x)),unaryMin:u.map(x=>Math.min(...x))};
 }
 function maxFit(fs,R,restarts=30,steps=100){
  const ff=fs.map(f=>({...f,multipliers:f.vars.map((_,j)=>29**j),set:new Set(f.tuples.map(t=>t.reduce((a,v,j)=>a+v*29**j,0)))}));
  const refs=Array.from({length:29},()=>[]);for(let i=0;i<ff.length;i++)ff[i].vars.forEach((v,j)=>refs[v].push([i,ff[i].multipliers[j]]));
  let best=Infinity,keys=[],trials=[];
  for(let trial=0;trial<restarts;trial++){
   const k=Array.from({length:29},()=>R()%29),codes=ff.map(f=>f.vars.reduce((s,v,j)=>s+k[v]*f.multipliers[j],0));let misses=ff.reduce((s,f,i)=>s+!f.set.has(codes[i]),0),lo=misses;
   for(let step=0;step<steps&&misses;step++){
    const order=Array.from({length:29},(_,i)=>i);for(let j=28;j>0;j--){const a=R()%(j+1);[order[j],order[a]]=[order[a],order[j]];}
    for(const v of order){const prev=k[v],rr=refs[v];if(!rr.length)continue;const m0=rr.reduce((s,[i])=>s+!ff[i].set.has(codes[i]),0);let m=m0,alts=[prev];for(let x=0;x<29;x++){if(x===prev)continue;const d=x-prev;let bad=0;for(const [i,a] of rr){bad+=!ff[i].set.has(codes[i]+a*d);if(bad>m)break;}if(bad<m){m=bad;alts=[x];}else if(bad===m)alts.push(x);}const x=alts[R()%alts.length];if(x!==prev){for(const [i,a] of rr)codes[i]+=a*(x-prev);k[v]=x;misses+=m-m0;}}
    lo=Math.min(lo,misses);if(misses<best){best=misses;keys=[[...k]];}else if(misses===best&&keys.length<20&&!keys.some(z=>same(z,k)))keys.push([...k]);
    if(!misses)break;
    if(step%5===4){const bad=ff.map((f,i)=>!f.set.has(codes[i])?i:-1).filter(i=>i>=0&&ff[i].vars.length);if(!bad.length)break;const f=ff[bad[R()%bad.length]],v=f.vars[R()%f.vars.length],x=R()%29,prev=k[v];for(const [i,a] of refs[v]){misses-=!ff[i].set.has(codes[i]);codes[i]+=a*(x-prev);misses+=!ff[i].set.has(codes[i]);}k[v]=x;}
   }
   trials.push(lo);
  }
  return {best,keys,trials};
 }
 const miss=(fs,k)=>fs.filter(f=>!f.tuples.some(t=>t.every((x,j)=>x===k[f.vars[j]]))).length;
 const oov=(p,rows)=>rows.filter(w=>!types.has(id(p.slice(w.start,w.start+w.len)))).length;
 let seed=194173;function R(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed;}
 const controls=[];
 for(let d=0;d<3;d++){
  const tail=donors[d].slice(Math.floor(donors[d].length*.8)),pool=new Map();for(const w of tail)if(types.has(id(w))){if(!pool.has(w.length))pool.set(w.length,[]);pool.get(w.length).push(w);}
  const plant=rows=>rows.flatMap(w=>{const a=pool.get(w.len);return a?.length?a[R()%a.length]:byLen.get(w.len)[R()%byLen.get(w.len).length];});
  const p=plant(aRows),q=plant(bRows),selected=[],eligible=aRows.map((w,i)=>w.len>=5?i:-1).filter(i=>i>=0);
  while(selected.length<7){const i=eligible[R()%eligible.length];if(selected.includes(i))continue;selected.push(i);const w=aRows[i];let n;do{n=Array.from({length:w.len},()=>R()%29);}while(types.has(id(n)));p.splice(w.start,w.len,...n);}
  check(oov(p,aRows)===7,"seven plant OOV groups");
  const key={f:Array.from({length:29},()=>R()%29),g:Array.from({length:29},()=>R()%29)},c=encode(p,key),dct=encode(q,key);
  check(same(decode(c,key),p)&&same(decode(dct,key),q),"plant inverse");
  const gf=factors(c,aRows,0),truthCost=miss(gf,key.g),lb=dual(gf,40);check(lb.lowerBound<=truthCost,"valid lower bound on known feasible key");
  const g=maxFit(gf,R,40,100);let best=null;for(const k of g.keys){const f=maxFit(factors(c,aRows,1,k),R,10,80);if(!best||f.best<best.f.best)best={g:k,f};}
  const k={g:best.g,f:best.f.keys[0]},pp=decode(c,k),qq=decode(dct,k);
  check(same(encode(pp,k),c)&&same(encode(qq,k),dct),"replay");
  controls.push({d,selected,truthCost,lowerBound:lb.lowerBound,g:g.best,gExact:g.keys.some(z=>same(z,key.g)),f:best.f.best,fitCorrect:pp.filter((v,i)=>v===p[i]).length,holdCorrect:qq.filter((v,i)=>v===q[i]).length,fullOov:oov(pp,aRows)});
 }
 seed=194173;
 const gf=factors(A,aRows,0),cert=dual(gf,120,1024,7),g=maxFit(gf,R,160,140);let best=null;for(const k of g.keys){const f=maxFit(factors(A,aRows,1,k),R,10,80);if(!best||f.best<best.f.best)best={g:k,f};}
 const k={g:best.g,f:best.f.keys[0]},pp=decode(A,k),qq=decode(B,k);
 check(miss(gf,k.g)===g.best,"primal score");check(same(encode(pp,k),A)&&same(encode(qq,k),B),"original replay");
 return {register:types.size,controls,original:{certificate:cert,g:g.best,gTrials:g.trials,fitOov:oov(pp,aRows),heldOov:oov(qq,bRows),key:k,plaintext:pp,held:qq}};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/english_wordfreq_textblob.txt","resources/transcriptions/lp2-image-corrected.txt"];
console.log(JSON.stringify(experiment(paths.map(p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8'))),null,2));
