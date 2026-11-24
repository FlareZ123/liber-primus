'use strict';
const fs=require('node:fs'),path=require('node:path');
const files=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/english_wordfreq_textblob.txt","im-results/lp2-dense-affine5-projective-output.json"];
const experiment=function(raw){
 const c=JSON.parse(raw[0]),n=JSON.parse(raw[2]),old=JSON.parse(raw[5]),R=c.runes,d=5,mod=x=>(x%29+29)%29,inv=x=>{for(let i=1;i<29;i++)if(mod(i*x)===1)return i;throw Error("singular")},assert=(x,m)=>{if(!x)throw Error(m)};
 const dot=(a,b)=>mod(a.reduce((s,x,i)=>s+x*b[i],0));
 const rr=(A,k)=>{A=A.map(a=>a.slice());let p=0;for(let j=0;j<k;j++){let i=A.findIndex((a,t)=>t>=p&&a[j]!==0);if(i<0)continue;[A[p],A[i]]=[A[i],A[p]];let u=inv(A[p][j]);A[p]=A[p].map(v=>mod(v*u));for(let t=0;t<A.length;t++)if(t!==p){let f=A[t][j];A[t]=A[t].map((v,l)=>mod(v-f*A[p][l]))}p++}return {A,rank:p}};
 const inverse=M=>{let l=M.length,z=rr(M.map((a,i)=>[...a,...Array.from({length:l},(_,j)=>+(i===j))]),l);assert(z.rank===l,"singular");return z.A.map(a=>a.slice(l))};
 const parse=t=>t.split(new RegExp("[^"+R.join("")+"]+","u")).filter(Boolean).map(w=>[...w].map(x=>R.indexOf(x)));
 const tok=c.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 const gp=t=>(t.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").match(/[A-Z]+/g)||[]).map(w=>{let a=[];for(let i=0;i<w.length;){if(w.startsWith("ING",i)){a.push(21);i+=3}else if(w.startsWith("IO",i)){a.push(27);i+=2}else{let q=tok.find(v=>w.startsWith(v.s,i));assert(q,"unmapped");a.push(q.i);i+=q.s.length}}return a});
 const sig=w=>String.fromCharCode(...w),nw=n.sections.flatMap(s=>parse(s.source_text)),gw=gp(raw[3]),g=gw.flat(),gpN=nw.flat(),model=g.slice(0,Math.floor(g.length/2)),one=Array(29).fill(.5),two=Array.from({length:29},()=>Array(29).fill(.5));
 for(let i=0;i<model.length;i++){one[model[i]]++;if(i)two[model[i-1]][model[i]]++}const lo=one.map(x=>Math.log(x/(model.length+14.5))),lt=two.map(row=>{let s=row.reduce((a,b)=>a+b,0);return row.map(v=>Math.log(v/s))});
 const ds=gp(raw[4].split(/\r?\n/).map(x=>x.match(/^([a-z]+)\s+[1-9]\d*$/i)?.[1]).filter(Boolean).join(" "));
 const dict=new Set([...ds,...nw,...gw.slice(0,Math.floor(gw.length/2))].map(sig));
 const spans=ws=>{let z=0;return ws.map(w=>{let a=z;z+=w.length;return [a,z]})};
 const clip=(ss,a,b)=>ss.filter(([s,e])=>s>=a&&e<=b).map(([s,e])=>[s-a,e-a]);
 const blocks=x=>{assert(x.length%d===0,"block fringe");let a=[];for(let i=0;i<x.length;i+=d)a.push(x.slice(i,i+d));return a};
 const encode=(P,M,b)=>{const I=inverse(M);return blocks(P).flatMap(p=>I.map(a=>dot(a,p.map((x,j)=>mod(x-b[j])))))};
 const decode=(C,M,b)=>blocks(C).flatMap(q=>M.map((a,j)=>mod(dot(a,q)+b[j])));
 const ioc=a=>{let h=new Uint32Array(29);for(const x of a)h[x]++;return h.reduce((s,x)=>s+x*(x-1),0)/(a.length*(a.length-1))};
 function measure(P,ss){let h=0,t=0,long=0,longHit=0;for(const [a,b] of ss){let w=P.slice(a,b);t+=w.length;if(w.length>=3)long+=w.length;if(dict.has(sig(w))){h+=w.length;if(w.length>=3)longHit+=w.length}}let ll=lo[P[0]];for(let i=1;i<P.length;i++)ll+=lt[P[i-1]][P[i]];return {hit:h,total:t,coverage:h/t,longHit,long,mean:ll/P.length,ioc:ioc(P)}}
 function refine(C,H,ss,hs,K){
  const p=decode(C,K.M,K.b),q=decode(H,K.M,K.b),laneIoC=Array.from({length:d},(_,j)=>ioc(p.filter((_,i)=>i%d===j)));
  const lane=laneIoC.indexOf(Math.min(...laneIoC)),before=measure(p,ss),beforeHold=measure(q,hs),B=blocks(C);
  let eq=[];
  for(const [a,b] of ss){
   if(b-a<2||b-a>5)continue;let missing=[];for(let i=a;i<b;i++)if(i%d===lane)missing.push(i);if(missing.length!==1)continue;
   const i=missing[0],w=p.slice(a,b),opts=[];for(let x=0;x<29;x++){w[i-a]=x;if(dict.has(sig(w)))opts.push(x)}
   if(opts.length>0&&opts.length<=4)eq.push({i,a,b,opts,row:[...B[Math.floor(i/d)],1]});
  }
  eq.sort((a,b)=>a.opts.length-b.opts.length||(b.b-b.a)-(a.b-a)||a.i-b.i);
  let remaining=eq.slice(),bases=[],keys=new Map();
  for(let t=0;t<12;t++){
   let bs=[];for(const e of remaining){if(rr([...bs.map(x=>x.row),e.row],6).rank>bs.length)bs.push(e);if(bs.length===6)break}
   if(bs.length!==6)break;
   let used=new Set(bs.map(e=>e.i));remaining=remaining.filter(e=>!used.has(e.i));
   let I=inverse(bs.map(e=>e.row)),count=0;function go(v){if(v.length<6){for(const x of bs[v.length].opts)go([...v,x]);return}let k=I.map(a=>dot(a,v)),M=K.M.map((a,j)=>j===lane?k.slice(0,5):a);if(rr(M,d).rank!==d)return;count++;keys.set(k.join(","),k)}go([]);
   bases.push({positions:bs.map(e=>e.i),optionCounts:bs.map(e=>e.opts.length),invertibleCandidates:count})
  }
  let best={M:K.M,b:K.b,sc:before,P:p};
  for(const k of keys.values()){let M=K.M.map((a,j)=>j===lane?k.slice(0,5):a),b=K.b.map((x,j)=>j===lane?k[5]:x),P=p.slice();for(let i=lane;i<P.length;i+=d)P[i]=dot(k,[...B[Math.floor(i/d)],1]);let sc=measure(P,ss);if(sc.hit>best.sc.hit||(sc.hit===best.sc.hit&&sc.mean>best.sc.mean))best={M,b,sc,P}}
  const Q=decode(H,best.M,best.b);assert(encode(best.P,best.M,best.b).join(",")===C.join(",")&&encode(Q,best.M,best.b).join(",")===H.join(","),"exact replay");
  return {lane,laneIoC,constraints:eq.length,bases,distinctKeys:keys.size,baseline:{key:K,train:before,holdout:beforeHold},refined:{key:{M:best.M,b:best.b},train:best.sc,holdout:measure(Q,hs),preview:Q.slice(0,70).map(x=>c.translit[x]).join(" ")},P:best.P,Q}
 }
 const ow=parse(raw[1].split("%").slice(0,55).join("").replace(/[/\r\n]/g,"")),ot=ow.flat(),canonical=c.pages.filter(p=>p.page<56).flatMap(p=>p.indices);
 assert(ot.join(",")===canonical.join(",")&&ow.length===2896,"original alignment");
 const start=p=>c.pages.filter(q=>q.page<p).reduce((s,q)=>s+q.indices.length,0),sp=spans(ow),a=start(33),b=start(40),h=start(3),j=start(8);
 const O=ot.slice(a,b),H=ot.slice(h,j);
 const out={lexicon:dict.size,original:refine(O,H,clip(sp,a,b),clip(sp,h,j),old.original.key),plants:[]};delete out.original.P;delete out.original.Q;
 for(let t=0;t<2;t++){
  const tape=t===0?gpN:g,ss=spans(t===0?nw:gw),off=t===0?0:Math.floor(g.length/2),P=tape.slice(off,off+1680),Q=tape.slice(off+1680,off+2825),trueK=old.plants[t].trueKey,plant=refine(encode(P,trueK.M,trueK.b),encode(Q,trueK.M,trueK.b),clip(ss,off,off+1680),clip(ss,off+1680,off+2825),old.plants[t].key);
  const trainExact=plant.P.filter((x,i)=>x===P[i]).length,holdExact=plant.Q.filter((x,i)=>x===Q[i]).length;
  delete plant.P;delete plant.Q;out.plants.push({name:old.plants[t].name,trainExact,holdExact,trueK,...plant})
 }
 return out
};
console.log(JSON.stringify(experiment(files.map(f=>fs.readFileSync(path.resolve(__dirname,'..',f),'utf8'))),null,2));
