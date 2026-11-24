'use strict';
/** Mixed lag-eight all-coefficient anchor inverse; original surrounding spacing ignored. */
function experiment(corpus,trans,solved,lex,donors,lib,mode='strict',prior=null){
 const gp=JSON.parse(corpus),native=JSON.parse(solved),q=8,mod=x=>((x%29)+29)%29;
 const assert=(x,m)=>{if(!x)throw Error(m)};
 const same=(x,y)=>String(x)===String(y),rune=new Map(gp.runes.map((x,i)=>[x,i])),alpha=new Map(gp.translit.map((x,i)=>[x,i]));
 const parse=s=>(s.match(/[\u16a0-\u16ff]+/gu)||[]).map(w=>Array.from(w,c=>rune.get(c)));
 const original=parse(trans.replace(/[\s/%]/g,"")).slice(0,2896);
 assert(same(original.flat(),gp.pages.slice(0,56).flatMap(x=>x.indices)),"corpus alignment");
 const src=native.sections.map(s=>({name:s.name,w:parse(s.source_text)}));
 const specs=[["0_welcome",11,19,6,2],["0_koan_1",13,7,2,17],["0_loss_of_divinity",28,5,11,23],["jpg107-167",9,17,16,11]];
 const excluded=new Set(specs.map(x=>x[0])),dict=Array.from({length:40},()=>new Set());
 function add(w){if(w.length&&w.length<40)dict[w.length].add(String.fromCharCode(...w));}
 function variants(w){const s=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
  function go(i,p){if(i===s.length){add(p);return;}for(const len of [1,2,3]){const a=s.slice(i,i+len);if(a.length!==len)continue;const v=len===3?(a==="ING"?21:undefined):alpha.get(a);if(v!==undefined)go(i+len,[...p,v]);}}go(0,[]);}
 for(const line of lex.split(/\r?\n/)){const m=/^([a-z]+)\s+(\d+)$/.exec(line);if(m&&m[1].length>=2)variants(m[1]);}
 for(const s of src)if(!excluded.has(s.name))for(const w of s.w)add(w);
 function donor(s){const start=/\*\*\* START OF (?:THIS|THE) PROJECT GUTENBERG EBOOK[^\r\n]*\*\*\*/i.exec(s);if(start)s=s.slice(start.index+start[0].length);let out=[];for(let t of s.match(/[A-Za-z]+/g)||[]){t=t.toUpperCase().replace(/QU/g,'CW').replace(/[KQ]/g,'C').replace(/V/g,'U').replace(/Z/g,'S');while(t.length){let ok=false;for(let k=Math.min(t.length,3);k>=1;k--){const a=t.slice(0,k),v=k===3?(a==="ING"?21:undefined):alpha.get(a);if(v!==undefined){out.push(v);t=t.slice(k);ok=true;break}}assert(ok,'native translation');if(out.length===2000)return out}}throw Error('short donor')}
 const train=[...src.filter(s=>!excluded.has(s.name)).map(s=>s.w.flat()),...donors.map(donor)],lm=lib.train(train);
 const score=P=>lib.scorePlain(P,lm),inv=Array.from({length:29},(_,a)=>Array.from({length:29},(_,b)=>b).find(b=>mod(a*b)===1)||0);
 const render=p=>p.map(x=>gp.translit[x]).join("");
 // All triples satisfying a*previousP+b*previousC+d=currentC-currentP.
 function triples(cp){
  const E=[];for(let i=q;i<cp.length;i++)E.push([cp[i-q][1],cp[i-q][0],mod(cp[i][0]-cp[i][1])]);assert(E.length>=3,"insufficient equations");
  const [x,y,z]=E[0],D=E.slice(1).map(([u,v,w])=>[mod(u-x),mod(v-y),mod(w-z)]),row=D.find(([u,v])=>u||v);
  if(D.some(([u,v,w])=>!u&&!v&&w))return [];
  let pairs=[];
  if(!row){for(let a=1;a<29;a++)for(let b=1;b<29;b++)pairs.push([a,b]);}
  else {const [u,v,w]=row,second=D.find(([j,k])=>mod(u*k-v*j)!==0);
   if(second){const [j,k,l]=second,den=inv[mod(u*k-v*j)];pairs=[[mod((w*k-v*l)*den),mod((u*l-w*j)*den)]];}
   else if(v){for(let a=1;a<29;a++)pairs.push([a,mod((w-u*a)*inv[v])]);}
   else{const a=mod(w*inv[u]);for(let b=1;b<29;b++)pairs.push([a,b]);}}
  return pairs.filter(([a,b])=>a&&b&&D.every(([u,v,w])=>mod(a*u+b*v)===w)).map(([a,b])=>[a,b,mod(z-a*x-b*y)]);
 }
 function encrypt(P,K,a,b,d){let queue=K.slice();const C=P.map(p=>{if(!p)return 0;const c=mod(p+queue[0]);queue=queue.slice(1).concat(mod(a*p+b*c+d));return c});return {C,queue};}
 // Exhaust all latent F masks in the local window, scoring in original reading order.
 function bestSide(C,K,a,b,d,rev,context){
  const seq=rev?C.slice().reverse():C,plain=[],ai=inv[a];let best=null,paths=0;
  function visit(i,queue){if(i===seq.length){paths++;const p=rev?plain.slice().reverse():plain.slice(),s=rev?score(p.concat(context.slice(0,2)))-score(context.slice(0,2)):score(context.slice(-2).concat(p))-score(context.slice(-2));if(!best||s>best.s)best={p,queue:queue.slice(),s};return;}
   const c=seq[i];if(!c){plain.push(0);visit(i+1,queue);plain.pop();}
   if(rev){const p=mod((queue.at(-1)-b*c-d)*ai);if(p){plain.push(p);visit(i+1,[mod(c-p),...queue.slice(0,-1)]);plain.pop();}}
   else{const p=mod(c-queue[0]);if(p){plain.push(p);visit(i+1,queue.slice(1).concat(mod(a*p+b*c+d)));plain.pop();}}}
  visit(0,K);return {best,paths};
 }
 const REACH_CAP=2000000;
 function reach(C,K,a,b,d,rev){
  const seq=rev?C.slice().reverse():C,plain=new Uint8Array(seq.length),dead=new Map(),ai=inv[a];let visits=0,final=null,capped=false;
  const check=()=>{if(++visits>REACH_CAP)throw Error("reach cap");};
  function consume(c,queue){
   if(rev){const p=mod((queue.at(-1)-b*c-d)*ai);return p?{p,k:[mod(c-p),...queue.slice(0,-1)]}:null;}
   const p=mod(c-queue[0]);return p?{p,k:queue.slice(1).concat(mod(a*p+b*c+d))}:null;
  }
  function go(i,k){
   while(i<seq.length&&seq[i]){check();const x=consume(seq[i],k);if(!x)return false;plain[i++]=x.p;k=x.k;}
   if(i===seq.length){final=k.slice();return true;}
   let cache=dead.get(i);if(!cache){cache=new Set();dead.set(i,cache);}
   const id=String.fromCharCode(...k);if(cache.has(id))return false;
   check();plain[i]=0;if(go(i+1,k))return true;
   const x=consume(0,k);if(x){check();plain[i]=x.p;if(go(i+1,x.k))return true;}
   cache.add(id);return false;
  }
  let yes=false;try{yes=go(0,K);}catch(e){if(e.message!=="reach cap")throw e;capped=true;}
  const p=yes?Array.from(plain):null;if(p&&rev)p.reverse();
  return {status:yes?"legal":capped?"cap":"empty",visits,p,queue:final};
 }


 function reachLexForward(C,K,a,b,d,constraints){
 const plain=new Uint8Array(C.length),ends=new Map(constraints.map(w=>[w.at+w.n,w]));let visits=0,capped=false,final=null;
 const tick=()=>{if(++visits>REACH_CAP)throw Error("reach cap");};
 const allowed=i=>{const w=ends.get(i);return !w||dict[w.n].has(String.fromCharCode(...plain.slice(w.at,i)));};
 function consume(c,k){const p=mod(c-k[0]);return p?{p,k:k.slice(1).concat(mod(a*p+b*c+d))}:null;}
 function go(i,k){
 while(i<C.length&&C[i]){tick();const x=consume(C[i],k);if(!x)return false;plain[i++]=x.p;if(!allowed(i))return false;k=x.k;}
 if(i===C.length){final=k.slice();return true;}
 tick();plain[i]=0;if(allowed(i+1)&&go(i+1,k))return true;const x=consume(0,k);if(x){tick();plain[i]=x.p;if(allowed(i+1)&&go(i+1,x.k))return true;}return false;
 }
 let yes=false;try{yes=go(0,K);}catch(e){if(e.message!=="reach cap")throw e;capped=true;}return {status:yes?"legal":capped?"cap":"empty",visits,p:yes?Array.from(plain):null,queue:final};
 }
 if(mode==='secondary'){
 assert(prior?.mode==="whole"&&prior.q===8,"whole output required");
 const ns=src.find(x=>x.name==="0_loss_of_divinity"),P=ns.w.flat(),a=28,b=5,d=11,K=Array.from({length:q},(_,i)=>(i*i*7+i*11+23)%29),C=encrypt(P,K,a,b,d).C,off=[0];for(const w of ns.w)off.push(off.at(-1)+w.length);
 const j=5,at=off[j],end=off[j+1],A=P.slice(at,end),start=A.map((v,i)=>[C[at+i],v]).filter(x=>x[1]).slice(0,q).map(([c,p])=>mod(c-p)),check=encrypt(A,start,a,b,d);
 const constraints=[175,176].map(i=>({at:off[i]-end,n:ns.w[i].length}));for(const w of constraints)assert(dict[w.n].has(String.fromCharCode(...P.slice(w.at+end,w.at+end+w.n))),"native secondary vocabulary");
 const right=reachLexForward(C.slice(end),check.queue,a,b,d,constraints),left=reach(C.slice(0,at),start,a,b,d,true);assert(right.status==="legal"&&left.status==="legal","native two-anchor support");const witness=left.p.concat(A,right.p);assert(same(encrypt(witness,left.queue,a,b,d).C,C),"native full replay");
 const w=original.slice(0,158),c=w.flat(),offset=[0];for(const v of w)offset.push(offset.at(-1)+v.length);assert(same(c,gp.pages.slice(0,3).flatMap(x=>x.indices)),"opening tape");
 const first=prior.original[0].anchors[0],stop=first.at+first.n;assert(first.capped===0&&first.legalModels.length===first.legal,"prior complete");const other=w.map((v,j)=>({j,at:offset[j],n:v.length,nz:v.filter(Boolean).length})).filter(x=>x.at>=stop).sort((a,b)=>b.nz-a.nz||b.n-a.n||a.j-b.j)[0],con=[{at:other.at-stop,n:other.n}];
 let legal=0,capped=0,empty=0,visits=0;const survivors=[];
 for(const model of first.legalModels){const {a,b,d,p,incoming}=model,check=encrypt(p,incoming,a,b,d);assert(same(check.C,c.slice(first.at,stop)),"prior anchor replay");const z=reachLexForward(c.slice(stop),check.queue,a,b,d,con);visits+=z.visits;if(z.status==="empty"){empty++;continue;}if(z.status==="cap"){capped++;continue;}const l=reach(c.slice(0,first.at),incoming,a,b,d,true);assert(l.status==="legal","prior reverse witness");const P=l.p.concat(p,z.p);assert(same(encrypt(P,l.queue,a,b,d).C,c),"opening replay");legal++;survivors.push({...model,secondary:render(P.slice(other.at,other.at+other.n)),score:score(P)/P.length});}
 return {mode,q,control:{replay:witness.length,visits:right.visits,secondary:constraints.map(w=>render(witness.slice(w.at+end,w.at+end+w.n)))},first:{j:first.j,at:first.at,n:first.n,models:first.models,legal:first.legal},other,legal,capped,empty,visits,survivors};
 }
 function whole(name,words,truth=null,partial=new Set()){
 const C=words.flat(),offsets=[0];for(const w of words)offsets.push(offsets.at(-1)+w.length);
 const candidates=words.map((w,j)=>({j,n:w.length,nz:w.filter(Boolean).length,at:offsets[j]})).filter(x=>!partial.has(x.j)&&x.nz>=q+3).sort((a,b)=>b.nz-a.nz||b.n-a.n||a.j-b.j);
 // Use the strongest complete original group, all eligible in-vocabulary native controls.
 const anchors=truth?candidates.filter(x=>dict[x.n].has(String.fromCharCode(...truth.P.slice(x.at,x.at+x.n)))):candidates.slice(0,1);
 const results=[];
 for(const anchor of anchors){const {j,at,n}=anchor,end=at+n,c=words[j],LC=C.slice(0,at),RC=C.slice(end);
 let models=0,legal=0,capped=0,visits=0,trueLegal=0,trueModels=0,best=null,legalModels=[];
 for(const str of dict[n]){
 const p=Array.from(str,x=>x.charCodeAt(0)),cp=[];let valid=true;
 for(let i=0;i<n;i++){if(!p[i]){if(c[i]){valid=false;break;}}else cp.push([c[i],p[i]]);}
 if(!valid||cp.length<q+3)continue;
 const start=cp.slice(0,q).map(([x,y])=>mod(x-y));
 for(const [a,b,d] of triples(cp)){models++;const isTrue=truth&&a===truth.a&&b===truth.b&&d===truth.d&&same(p,truth.P.slice(at,end));if(isTrue)trueModels++;
 const check=encrypt(p,start,a,b,d);assert(same(check.C,c),"anchor replay");
 const left=reach(LC,start,a,b,d,true);visits+=left.visits;if(left.status==="empty")continue;
 const right=reach(RC,check.queue,a,b,d,false);visits+=right.visits;if(right.status==="empty")continue;
 if(left.status==="cap"||right.status==="cap"){capped++;continue;}
 const witness=left.p.concat(p,right.p);assert(same(encrypt(witness,left.queue,a,b,d).C,C),"full replay");legal++;if(isTrue)trueLegal++;
 const value=score(witness)/C.length,entry={a,b,d,p,incoming:start};if(!truth)legalModels.push(entry);
 if(!best||value>best.score)best={...entry,score:value,anchor:render(p),sample:render(witness.slice(0,100))};
 }}
 results.push({...anchor,models,legal,capped,visits,trueModels,trueLegal,best,legalModels});}
 return {name,n:C.length,anchors:results};
 }
 function attack(name,words,truth=null,partial=new Set()){
  const C=words.flat(),offsets=[0],anchors=[];for(const w of words)offsets.push(offsets.at(-1)+w.length);
  for(let j=0;j<words.length;j++){
   const c=words[j];if(partial.has(j)||c.filter(Boolean).length<q+3)continue;
   const at=offsets[j],end=offsets[j+1],L=Math.max(0,at-48),R=Math.min(C.length,end+48),rev=L>=C.length-R;
   if((rev?L:C.length-R)<76)continue;
   const fitLeft=C.slice(L,at),fitRight=C.slice(end,R),held=rev?C.slice(L-76,L):C.slice(R,R+76);
   let wordsFeasible=0,models=0,fitLegal=0,trueModelCount=0,best=null;
   const trueP=truth?.P.slice(at,end),trueLex=truth?dict[c.length].has(String.fromCharCode(...trueP)):null;
   for(const str of dict[c.length]){
    const p=Array.from(str,x=>x.charCodeAt(0)),cp=[];let valid=true;
    for(let i=0;i<c.length;i++){if(!p[i]){if(c[i]){valid=false;break;}}else cp.push([c[i],p[i]]);}
    if(!valid||cp.length<q+3)continue;
    const maps=triples(cp);if(!maps.length)continue;wordsFeasible++;
    const start=cp.slice(0,q).map(([x,y])=>mod(x-y));
    for(const [a,b,d] of maps){models++;if(truth&&a===truth.a&&b===truth.b&&d===truth.d&&same(p,trueP))trueModelCount++;
     const check=encrypt(p,start,a,b,d);assert(same(check.C,c),"anchor replay");
     const left=bestSide(fitLeft,start,a,b,d,true,p);if(!left.best)continue;
     const right=bestSide(fitRight,check.queue,a,b,d,false,p);if(!right.best)continue;
     fitLegal++;
     const fit=left.best.p.concat(p,right.best.p),s=score(fit),seed=left.best.queue,after=right.best.queue;
     assert(same(encrypt(fit,seed,a,b,d).C,C.slice(L,R)),"fit replay");
     if(!best||s>best.s)best={a,b,d,p,seed,after,fit,s};
    }
   }
   let result=null;
   if(best){const h=bestSide(held,rev?best.seed:best.after,best.a,best.b,best.d,rev,best.fit);
    if(h.best){const full=rev?h.best.p.concat(best.fit):best.fit.concat(h.best.p),seed=rev?h.best.queue:best.seed;assert(same(encrypt(full,seed,best.a,best.b,best.d).C,C.slice(rev?L-76:L,rev?R:R+76)),"holdout replay");}
    result={a:best.a,b:best.b,d:best.d,word:render(best.p),fitScore:best.s/(R-L),fit:render(best.fit),fitIndices:best.fit,holdout:h.best?render(h.best.p):null,holdoutIndices:h.best?.p||null,holdoutScore:h.best?h.best.s/76:null,holdoutPaths:h.paths,correct:truth?{model:best.a===truth.a&&best.b===truth.b&&best.d===truth.d,fit:best.fit.filter((x,i)=>x===truth.P[L+i]).length,fitTotal:R-L,holdout:h.best?h.best.p.filter((x,i)=>x===truth.P[(rev?L-76:R)+i]).length:0}:null};
   }
   anchors.push({j,at,n:c.length,guaranteed:c.filter(Boolean).length,L,R,holdoutSide:rev?"left":"right",dictWords:dict[c.length].size,wordsFeasible,models,fitLegal,trueLex,trueModelCount,result});
  }
  return {name,n:C.length,anchors};
 }
 const controls=specs.map(([name,a,b,d,salt])=>{const s=src.find(x=>x.name===name),P=s.w.flat(),K=Array.from({length:q},(_,i)=>(i*i*7+i*11+salt)%29),C=encrypt(P,K,a,b,d).C;let j=0;return (mode==='whole'?whole:attack)(name,s.w.map(w=>{const v=C.slice(j,j+w.length);j+=w.length;return v}),{P,K,a,b,d});});
 if(mode==='whole'){
 const cal=controls.flatMap(c=>c.anchors);assert(cal.length>=2&&cal.every(x=>x.trueModels===1&&x.trueLegal===1),"whole positive gate");
 const pages=[0,3,8,15,23,27,34,40,54,56],starts=pages.map(p=>gp.pages.slice(0,p).reduce((s,x)=>s+x.indices.length,0));
 let off=0;const ww=original.map(w=>{const x={w,off};off+=w.length;return x});
 const result=starts.slice(0,-1).map((s,i)=>{const e=starts[i+1],w=[],partial=new Set();for(const x of ww){const lo=Math.max(s,x.off),hi=Math.min(e,x.off+x.w.length);if(lo>=hi)continue;if(lo!==x.off||hi!==x.off+x.w.length)partial.add(w.length);w.push(x.w.slice(lo-x.off,hi-x.off));}assert(same(w.flat(),gp.pages.slice(pages[i],pages[i+1]).flatMap(x=>x.indices)),"chapter tape");return whole("p"+pages[i],w,null,partial);});
 return {q,mode,lexicon:dict.reduce((s,d)=>s+d.size,0),controls,original:result};
 }
 const calibration=controls.flatMap(c=>c.anchors).filter(a=>a.trueLex),exact=calibration.filter(a=>a.result?.correct.model&&a.result.correct.fit===a.result.correct.fitTotal&&a.result.correct.holdout===76).length;
 const pass=calibration.length>=2&&exact===calibration.length;
 const supportPass=calibration.length>=2&&calibration.every(a=>a.trueModelCount===1);
 assert(mode==='strict'||mode==='support','mode');
 const pages=[0,3,8,15,23,27,34,40,54,56],starts=pages.map(p=>gp.pages.slice(0,p).reduce((s,x)=>s+x.indices.length,0));
 let off=0;const ww=original.map(w=>{const x={w,off};off+=w.length;return x});
 const originalResults=(mode==='strict'?pass:supportPass)?starts.slice(0,-1).map((s,i)=>{const e=starts[i+1],w=[],partial=new Set();for(const x of ww){const lo=Math.max(s,x.off),hi=Math.min(e,x.off+x.w.length);if(lo>=hi)continue;if(lo!==x.off||hi!==x.off+x.w.length)partial.add(w.length);w.push(x.w.slice(lo-x.off,hi-x.off));}assert(w.flat().length===e-s,"chapter group carry");assert(same(w.flat(),gp.pages.slice(pages[i],pages[i+1]).flatMap(x=>x.indices)),"chapter tape");return attack("p"+pages[i],w,null,partial);}):null;
 return {q,trainLengths:train.map(x=>x.length),lexicon:dict.reduce((s,d)=>s+d.size,0),calibration:{eligible:calibration.length,exact,passed:pass,supportPassed:supportPass},mode,controls,original:originalResults};
}
if(typeof module!=="undefined")module.exports={experiment};

if(require.main===module){const fs=require('node:fs'),path=require('node:path'),lib=require('./lp2_fhold_cyclic_ngram_map.cjs');const paths=["resources/liber-primus/lp2-corpus.json","resources/lp2-transcription.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/control/english_wordfreq_textblob.txt","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];const a=paths.map(p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8'));const mode=process.argv[2]||'strict',prior=mode==='secondary'?JSON.parse(fs.readFileSync(path.resolve(__dirname,'..','im-results/lp2-mixed-autokey-q8-whole-anchor-output.json'),'utf8')):null;console.log(JSON.stringify(experiment(...a.slice(0,4),a.slice(4),lib,mode,prior),null,2));}
