"use strict";
/** Agent21 #3042: Friedman coincidence-superimposition / Singer phase synchronization; control-only. */
function experiment(corpus,transcript,terminal,donors,native){
 const R=29,Q=8,TAU=2*Math.PI;
 const mod=x=>(x%Q+Q)%Q,mod29=x=>(x%R+R)%R;
 const ix=new Map(corpus.translit.map((x,i)=>[x,i])),ri=new Map(corpus.runes.map((x,i)=>[x,i]));
 const words=t=>(t.toUpperCase().match(/[A-Z]+/g)||[]).map(w=>{const s=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/K/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");const out=[];for(let i=0;i<s.length;i++){const a=s.slice(i,i+2);if(a.length===2&&ix.has(a)){out.push(ix.get(a));i++}else if(ix.has(s[i]))out.push(ix.get(s[i]));}return out;}).filter(w=>w.length);
 const d=donors.map(words),train=d.flatMap(w=>w.slice(0,Math.floor(w.length*.67))),test=d.flatMap(w=>w.slice(Math.floor(w.length*.67)));
 const byLen=new Map();for(const w of test){if(!byLen.has(w.length))byLen.set(w.length,[]);byLen.get(w.length).push(w);}
 const cat=(l,j)=>l<=10?`${l}:${j}`:l<=20?`11+:${j<3?"h"+j:l-j<=3?"t"+(l-j):"m"}`:"long";
 const cnt=new Map(),global=new Float64Array(R);
 for(const w of train)for(let j=0;j<w.length;j++){const c=cat(w.length,j);if(!cnt.has(c))cnt.set(c,new Float64Array(R));cnt.get(c)[w[j]]++;global[w[j]]++;}
 let total=global.slice(1).reduce((s,x)=>s+x,0);for(let p=1;p<R;p++)global[p]=(global[p]+.5)/(total+28*.5);global[0]=0;
 for(const a of cnt.values()){const n=a.slice(1).reduce((s,x)=>s+x,0);for(let p=1;p<R;p++)a[p]=(a[p]+10*global[p])/(n+10);a[0]=0;}
 const cache=new Map();
 function weights(a,b,mode){
  const k=[a,b].sort().join("|")+"|"+mode;if(cache.has(k))return cache.get(k);
  const f=cnt.get(a)||global,g=cnt.get(b)||global;
  let s=0;for(let i=1;i<R;i++)s+=f[i]*g[i];
  // Conditional on two outputs being nonzero, under uniform distinct shifts.
  // This is a composite pair model, not independent-edge exact likelihood.
  const p=mode==="visible"?28*s/(27+s):s;
  const u=mode==="visible"?(1-s)/(27+(1-s)/28):(1-s)/28;
  const v=[Math.log((1-p)/(1-u)),Math.log(p/u)];
  cache.set(k,v);return v;
 }
 function makeRecords(ws,perm,key,rnd,mode){
  const inverse=Array(R);perm.forEach((v,i)=>inverse[v]=i);
  return ws.map((p,id)=>{let start=rnd(Q),j=start,c=[],plain=[];for(const x of p){if(x===0){if(mode==="visible"){c.push(0);plain.push(0);}continue;}c.push(inverse[mod29(perm[x]+key[j])]);plain.push(x);j=mod(j+1);}return{id,start,p:plain,c,ctx:c.map((_,j)=>cat(c.length,j))};});
 }
 function pair(a,b,mode){
  const l=new Float64Array(Q);
  for(let i=0;i<a.c.length;i++)for(let j=0;j<b.c.length;j++){const w=weights(a.ctx[i],b.ctx[j],mode);l[mod(j-i)]+=w[a.c[i]===b.c[j]?1:0];}return l;
 }
 const cs=Float64Array.from({length:Q},(_,j)=>Math.cos(TAU*j/Q)),sn=Float64Array.from({length:Q},(_,j)=>Math.sin(TAU*j/Q));
 function synchronize(fit,mode,rnd,exactEdges=false){
  const n=fit.length,L=new Float32Array(n*n*Q),hr=new Float64Array(n*n),hi=new Float64Array(n*n);
  let hit=0,unique=0,comparisons=0,sumGap=0,sameN=0,sameE=0,diffN=0,diffE=0;
  for(let a=0;a<n;a++)for(let b=a+1;b<n;b++){
   const q=pair(fit[a],fit[b],mode),truth=mod(fit[a].start-fit[b].start);
   const max=Math.max(...q);if(q[truth]>=max-1e-10)hit++;if(q[truth]>=max-1e-10&&q.filter(x=>x>=max-1e-10).length===1)unique++;
   sumGap+=q[truth]-q.reduce((s,x)=>s+x,0)/Q;comparisons++;
   for(let i=0;i<fit[a].c.length;i++)for(let j=0;j<fit[b].c.length;j++){const eq=fit[a].c[i]===fit[b].c[j];if(mod(j-i)===truth){sameN++;sameE+=eq;}else{diffN++;diffE+=eq;}}
   let re=0,im=0,z=0;
   for(let d=0;d<Q;d++){const v=Math.exp(q[d]-max);z+=v;re+=v*cs[d];im+=v*sn[d];L[(a*n+b)*Q+d]=q[d];L[(b*n+a)*Q+mod(-d)]=q[d];}
   if(exactEdges){re=cs[truth];im=sn[truth];z=1;}
   hr[a*n+b]=hr[b*n+a]=re/z;hi[a*n+b]=im/z;hi[b*n+a]=-im/z;
  }
  // H is Hermitian. Shift by a Gershgorin bound so power iteration selects
  // the largest algebraic eigenvalue rather than the largest magnitude.
  let shift=0;
  for(let a=0;a<n;a++){let row=0;for(let b=0;b<n;b++)row+=Math.hypot(hr[a*n+b],hi[a*n+b]);shift=Math.max(shift,row);}
  let vr=Float64Array.from({length:n},()=>rnd(2001)/1000-1),vi=Float64Array.from({length:n},()=>rnd(2001)/1000-1);
  let norm=Math.hypot(...vr,...vi);vr=vr.map(x=>x/norm);vi=vi.map(x=>x/norm);
  for(let it=0;it<160;it++){const nr=new Float64Array(n),ni=new Float64Array(n);
   for(let a=0;a<n;a++){let x=shift*vr[a],y=shift*vi[a];for(let b=0;b<n;b++){const k=a*n+b;x+=hr[k]*vr[b]-hi[k]*vi[b];y+=hr[k]*vi[b]+hi[k]*vr[b];}nr[a]=x;ni[a]=y;}
   norm=Math.hypot(...nr,...ni);if(norm===0)break;vr=nr.map(x=>x/norm);vi=ni.map(x=>x/norm);
  }
  let x0=0,y0=0;for(let a=0;a<n;a++){const t=Q*Math.atan2(vi[a],vr[a]),w=Math.hypot(vr[a],vi[a]);x0+=w*Math.cos(t);y0+=w*Math.sin(t);}
  const offset=Math.atan2(y0,x0)/Q;
  const spectral=Array.from({length:n},(_,a)=>mod(Math.round((Math.atan2(vi[a],vr[a])-offset)*Q/TAU)));
  const objective=z=>{let v=0;for(let a=0;a<n;a++)for(let b=a+1;b<n;b++)v+=L[(a*n+b)*Q+mod(z[a]-z[b])];return v;};
  const fitScore=z=>{const hist=Array(Q).fill(0);for(let a=0;a<n;a++)hist[mod(fit[a].start-z[a])]++;let rotation=hist.indexOf(Math.max(...hist));return{correct:hist[rotation],rotation,objective:objective(z)};};
  const truth=fit.map(w=>w.start),est=spectral.slice();
  if(!exactEdges)for(let it=0;it<30;it++){let changes=0;for(let a=0;a<n;a++){const sums=new Float64Array(Q);for(let b=0;b<n;b++)if(a!==b){const k=(a*n+b)*Q;for(let j=0;j<Q;j++)sums[j]+=L[k+mod(j-est[b])];}let best=est[a];for(let j=0;j<Q;j++)if(sums[j]>sums[best]+1e-8)best=j;if(best!==est[a]){est[a]=best;changes++;}}if(!changes)break;}
  return {spectral:fitScore(spectral),refined:fitScore(est),truthScore:objective(truth),est,stats:{sameN,sameE,diffN,diffE,pairs:comparisons,trueBestIncludingTies:hit,trueUniqueBest:unique,meanTrueScoreGap:sumGap/comparisons}};
 }
 function predict(held,fit,starts,mode,rotation){
  let hit=0,tieHit=0,uniqueHit=0;const predictions=[];
  for(const w of held){const s=new Float64Array(Q);for(let a=0;a<fit.length;a++){const q=pair(w,fit[a],mode);for(let j=0;j<Q;j++)s[j]+=q[mod(j-starts[a])];}
   let z=Array.from(s).indexOf(Math.max(...s));const truth=mod(w.start-rotation),top=Math.max(...s),ties=s.filter(x=>x>=top-1e-8).length;hit+=z===truth;tieHit+=s[truth]>=top-1e-8;uniqueHit+=z===truth&&ties===1;predictions.push({id:w.id,true:w.start,estimate:mod(z+rotation),ties});}
  return {correct:hit,tieHit,uniqueHit,predictions};
 }
 // Corrected terminal and complete chapter group profiles. Only lengths are used.
 let page=0,w=[],start=0,groups=[];const finish=()=>{if(w.length){groups.push({start,page,L:w.length});w=[];}};
 for(const c of transcript.split("%").slice(0,55).join("%")){if(ri.has(c)){if(!w.length)start=page;w.push(ri.get(c));}else if(c==="%")page++;else if(c!=="/"&&!/\s/.test(c))finish();}finish();
 if(groups.length!==2896||groups.reduce((s,g)=>s+g.L,0)!==12956)throw Error("corpus");
 const physical=p=>p>=50?p+1:p;
 const chapter=groups.filter(g=>physical(g.start)>=40&&physical(g.page)<=53).map(x=>x.L);
 const terminalFit=terminal.p54.body_groups.slice(0,-1).map(x=>x.length),terminalHeld=[terminal.p54.body_groups.at(-1).length+terminal.p55.groups[0].length,...terminal.p55.groups.slice(1).map(x=>x.length)];
 if(terminalFit.length!==47||terminalFit.reduce((a,b)=>a+b,0)!==213||terminalHeld.length!==17||terminalHeld.reduce((a,b)=>a+b,0)!==86||chapter.length!==669||chapter.reduce((a,b)=>a+b,0)!==3008)throw Error("profile");
 const nativeWords=s=>{let a=[],b=[];for(const c of s.source_text){if(ri.has(c))b.push(ri.get(c));else if(b.length){a.push(b);b=[];}}if(b.length)a.push(b);return a;};
 const welcome=native.sections.find(s=>s.name==="0_welcome"),koan=native.sections.find(s=>s.name==="0_koan_2")||native.sections.find(s=>s.name==="0_koan_1");
 const sourceWords=[...nativeWords(welcome),...nativeWords(koan)];
 function run(label,seed,mode,kind){
  let state=seed;const rnd=n=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return Math.floor(state/4294967296*n);};
  const perm=Array.from({length:R},(_,i)=>i);for(let i=R-1;i>1;i--){let j=1+rnd(i);[perm[i],perm[j]]=[perm[j],perm[i]];}const key=[];while(key.length<Q){let k=rnd(R);if(!key.includes(k))key.push(k);}
  const sample=ls=>ls.map(l=>{const b=byLen.get(l);if(!b)throw Error("missing length "+l);return b[rnd(b.length)];});
  let P,H;
  if(kind==="terminal"){P=sample(terminalFit);H=sample(terminalHeld);}
  else if(kind==="chapter"){P=sample(chapter);H=sample(chapter.slice(0,80));}
  else if(kind==="native"){P=sourceWords.slice(0,Math.floor(sourceWords.length*.75));H=sourceWords.slice(P.length);}
  else {const a=test.flat().filter(x=>x!==0);let off=rnd(a.length-64*128);P=Array.from({length:48},(_,i)=>a.slice(off+i*128,off+(i+1)*128));H=Array.from({length:16},(_,i)=>a.slice(off+(48+i)*128,off+(49+i)*128));}
  const all=makeRecords(P,perm,key,rnd,mode),hold=makeRecords(H,perm,key,rnd,mode);
  const fit=all.filter(w=>w.c.length&&(mode!=="visible"||!w.c.includes(0))),held=hold.filter(w=>w.c.length&&(mode!=="visible"||!w.c.includes(0)));
  if(fit.length<2||!held.length)throw Error("few groups");
  const z=synchronize(fit,mode,rnd),ideal=synchronize(fit,mode,rnd,true);
  if(ideal.spectral.correct!==fit.length)throw Error("noiseless synchronization regression");
  const hp=predict(held,fit,z.est,mode,z.refined.rotation),oracle=predict(held,fit,fit.map(w=>w.start),mode,0);
  return {label,seed,mode,key,perm,fitAll:all.length,fitN:fit.length,fitRunes:fit.reduce((s,w)=>s+w.c.length,0),heldAll:hold.length,heldN:held.length,heldRunes:held.reduce((s,w)=>s+w.c.length,0),...z,idealCorrect:ideal.spectral.correct,heldPrediction:hp,oracleHeld:oracle,fitTruth:fit.map(w=>w.start)};
 }
 return {inputs:{train:train.length,held:test.length,nativeWords:sourceWords.length,nativeNames:[welcome.name,koan.name],terminalFit,terminalHeld,chapterLength:chapter.length},
  controls:[run("terminal-1",0x30420001,"visible","terminal"),run("terminal-2",0x30420002,"visible","terminal"),run("terminal-3",0x30420003,"visible","terminal"),run("terminal-4",0x30420004,"visible","terminal"),run("chapter-1",0x30420005,"visible","chapter"),run("chapter-2",0x30420006,"visible","chapter"),run("native-WELCOME+KOAN",0x30420007,"visible","native"),run("long-active-positive",0x30420008,"oracle-active","long")]};
}
if(require.main===module){const fs=require("node:fs"),path=require("node:path"),root=path.join(__dirname,".."),read=p=>fs.readFileSync(path.join(root,p),"utf8");console.log(JSON.stringify(experiment(JSON.parse(read("resources/liber-primus/lp2-corpus.json")),read("resources/lp2-transcription.txt"),JSON.parse(read("resources/liber-primus/lp2-page-groups-54-55-derived.json")),["resources/control/shakespeare_first300k.txt","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt"].map(read),JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"))),null,2));}
module.exports={experiment};
