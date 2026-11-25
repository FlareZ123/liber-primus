"use strict";
/**
 * Four-tape common additive key with authentic nonconsuming plaintext F.
 * Joint consuming-cursor beam, every local hold choice, no printed spaces.
 * Finite beam search, not all-mask proof. Each completed path replays all source glyphs.
 */
const {tokenize,train,score,layouts}=require("./lp2_p27_p55_four_tape_shared_pad_sft.cjs");
const R=29,N=76,H=R**3,mod=x=>(x%R+R)%R;
function encrypt(p,k){
 let j=0;const ct=p.map(v=>v===0?0:mod(v+k[j++]));
 return {ct,used:j};
}
function attack(model,ct,width=2048){
 if(ct.length!==4||ct.some(t=>t.length!==N))throw Error("source shape");
 const log=(pos,ctx,p)=>model[Math.min(pos,3)][ctx*R+p];
 const step=(ctx,p)=>(ctx*R+p)%H;
 let beam=[{pos:[0,0,0,0],ctx:[0,0,0,0],score:0,parent:null,k:null,holds:null}],best=null,expanded=0,maxStates=0,legalComplete=0;
 function keep(s){legalComplete++;if(!best||s.score>best.score)best=s;}
 for(let j=0;j<=N&&beam.length;j++){
  const next=new Map();
  for(const s of beam){
   // A tape can consume its next glyph or transparently emit each adjacent visible F first.
   const opt=[];
   for(let t=0;t<4;t++){
    let pos=s.pos[t],ctx=s.ctx[t],gain=0,h=0;const a=[];
    for(;;){
     a.push({pos,ctx,gain,h,end:pos===N,c:pos===N?-1:ct[t][pos]});
     if(pos===N||ct[t][pos]!==0)break;
     gain+=log(pos,ctx,0);ctx=step(ctx,0);pos++;h++;
    }opt.push(a);
   }
   for(const a of opt[0])for(const b of opt[1])for(const c of opt[2])for(const d of opt[3]){
    const q=[a,b,c,d],s0=s.score+a.gain+b.gain+c.gain+d.gain;
    const holds=[a.h,b.h,c.h,d.h];
    if(q.every(x=>x.end)){
     keep({pos:[N,N,N,N],ctx:q.map(x=>x.ctx),score:s0,parent:s,k:null,holds});continue;
    }
    const pos=q.map(x=>x.pos+(x.end?0:1)),emitted=pos[0]+pos[1]+pos[2]+pos[3],done=emitted===4*N;
    for(let k=0;k<R;k++){
     // A consuming plaintext F is forbidden by the historical encoder.
     if(a.c===k||b.c===k||c.c===k||d.c===k)continue;
     const pa=a.end?0:mod(a.c-k),pb=b.end?0:mod(b.c-k),pc=c.end?0:mod(c.c-k),pd=d.end?0:mod(d.c-k);
     const v=s0+(a.end?0:log(a.pos,a.ctx,pa))+(b.end?0:log(b.pos,b.ctx,pb))+(c.end?0:log(c.pos,c.ctx,pc))+(d.end?0:log(d.pos,d.ctx,pd));
     const ca=a.end?a.ctx:step(a.ctx,pa),cb=b.end?b.ctx:step(b.ctx,pb),cc=c.end?c.ctx:step(c.ctx,pc),cd=d.end?d.ctx:step(d.ctx,pd);
     expanded++;
     if(done){keep({pos,ctx:[ca,cb,cc,cd],score:v,parent:s,k,holds});continue;}
     // Same physical cursor/history and same number of consumed key digits:
     // identical future legal transitions and likelihood.
     const id=pos[0]*H+ca+","+ (pos[1]*H+cb)+","+(pos[2]*H+cc)+","+(pos[3]*H+cd);
     const old=next.get(id);
     if(!old||v>old.score)next.set(id,{pos,ctx:[ca,cb,cc,cd],score:v,priority:v+2.1*emitted,parent:s,k,holds});
    }
   }
  }
  maxStates=Math.max(maxStates,next.size);
  beam=[...next.values()].sort((a,b)=>b.priority-a.priority||b.score-a.score).slice(0,width);
 }
 if(!best)return {complete:false,width,expanded,maxStates,legalComplete};
 const chain=[];for(let s=best;s.parent;s=s.parent)chain.push(s);chain.reverse();
 const p=Array.from({length:4},()=>[]),key=[];
 for(const s of chain){
  for(let t=0;t<4;t++){
   for(let h=0;h<s.holds[t];h++){if(ct[t][p[t].length]!==0)throw Error("bad hold");p[t].push(0);}
   if(s.k!==null&&p[t].length<N){const v=mod(ct[t][p[t].length]-s.k);if(v===0)throw Error("bad consuming F");p[t].push(v);}
  }
  if(s.k!==null)key.push(s.k);
 }
 const replay=p.map(t=>encrypt(t,key));
 if(p.some(t=>t.length!==N)||replay.some((r,j)=>String(r.ct)!==String(ct[j]))||Math.max(...replay.map(r=>r.used))!==key.length)throw Error("full replay");
 const ll=p.reduce((a,t)=>a+score(model,t,4),0);
 if(Math.abs(ll-best.score)>1e-8)throw Error("likelihood traceback mismatch");
 return {complete:true,width,expanded,maxStates,legalComplete,score:ll,mean:ll/(4*N),key,p,holdPositions:p.map(t=>t.flatMap((v,i)=>v===0?[i]:[])),used:replay.map(r=>r.used)};
}
function experimentF(corpus,raw,mode="controls",which=0,width=2048){
 const donors=raw.map(t=>tokenize(corpus,t)),cuts=donors.map(t=>Math.floor(t.length*.67)),model=train(donors.map((t,i)=>t.slice(0,cuts[i])));
 const fmt=v=>v.map(t=>t.map(i=>corpus.translit[i]).join(""));
 const format=r=>r.complete?{...r,plaintext:fmt(r.p)}:r;
 if(mode==="original"){
  const [layout,ct]=layouts(corpus)[which];
  const hit=attack(model,ct,width),wrong=ct.map((t,k)=>t.map((v,i)=>t[(i+13*k)%N]));
  return {mode,layout,hit:format(hit),rotated:format(attack(model,wrong,width)),Fcount:ct.map(t=>t.filter(v=>v===0).length)};
 }
 // Use predetermined disjoint source-excluded windows with genuine F holds.
 const j=which,p=Array.from({length:4},(_,t)=>{
  const d=(j+t)%donors.length,start=cuts[d]+1000+j*1500+t*350;
  // First complete 76-symbol window in the subsequent 250 positions with at least one F.
  for(let off=start;off<start+250;off++){const q=donors[d].slice(off,off+N);if(q.includes(0))return q;}
  throw Error("preselected control has no F");
 });
 let seed=(0x9127a55+Math.imul(j+1,0x9e3779b1))>>>0;
 const key=Array.from({length:N},()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return Math.floor(seed/4294967296*R);});
 const ct=p.map(t=>encrypt(t,key).ct),used=Math.max(...p.map(t=>t.filter(v=>v!==0).length)),hit=attack(model,ct,width);
 const exact=hit.complete?p.reduce((a,t,k)=>a+t.filter((v,i)=>v===hit.p[k][i]).length,0):0;
 const trueHolds=p.map(t=>t.flatMap((v,i)=>v===0?[i]:[]));
 return {mode,j,width,truth:fmt(p),truthHolds:trueHolds,truthKey:key.slice(0,used),truthMean:p.reduce((a,t)=>a+score(model,t,4),0)/(4*N),exactRunes:exact,exactKey:hit.complete?hit.key.filter((v,i)=>v===key[i]&&i<used).length:0,exactHoldTapes:hit.complete?hit.holdPositions.filter((h,i)=>String(h)===String(trueHolds[i])).length:0,hit:format(hit)};
}
module.exports={encrypt,attack,experimentF};
if(require.main===module){const fs=require("node:fs"),path=require("node:path"),root=path.join(__dirname,".."),read=f=>fs.readFileSync(path.join(root,f),"utf8");console.log(JSON.stringify(experimentF(JSON.parse(read("resources/liber-primus/lp2-corpus.json")),["shakespeare_first300k.txt","gibran_prophet_58585.txt","emerson_essays_2944.txt"].map(x=>read("resources/control/"+x)),process.argv[2]||"controls",Number(process.argv[3]||0),Number(process.argv[4]||2048)),null,2));}
