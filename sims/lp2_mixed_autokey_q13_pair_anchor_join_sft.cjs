'use strict';
/** Mixed lag-thirteen adjacent-word anchor join; exact GF29 projection eliminates two coefficients. */
function experiment(corpus,trans,solved,lex,donors,lib,mode='strict'){
 const gp=JSON.parse(corpus),native=JSON.parse(solved),q=13,mod=x=>((x%29)+29)%29;
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
 // Group dictionary words by the exact transparent-F locations; consuming C is then fixed.
 function group(c,list){
  const groups=new Map();
  for(const str of list){const p=Array.from(str,x=>x.charCodeAt(0));if(p.some((x,i)=>!x&&c[i]))continue;
   const mask=p.map(x=>x?'1':'0').join("");let g=groups.get(mask);
   if(!g){g={C:c.filter((_,i)=>p[i]!==0),words:[]};groups.set(mask,g);}
   g.words.push({p,v:p.filter(Boolean)});
  }return [...groups.values()];
 }
 /** Exact join over all dictionary pairs and all nonzero a,b, all d.
  * Difference rows remove d; quotient by the observed Cprev-difference vector removes b.
  * One word contributes additively to each equation, so a signature lookup replaces the pair product. */
 function join(c1,c2,list1,list2,emit,aRange=[1,28]){
  let models=0,maskPairs=0;
  for(const g1 of group(c1,list1))for(const g2 of group(c2,list2)){
   const C=g1.C.concat(g2.C),n=g1.C.length,m=C.length-q;
   if(m<3)continue;maskPairs++;
   const B=Array.from({length:m-1},(_,i)=>mod(C[i+1]-C[0])),D=Array.from({length:m-1},(_,i)=>mod(C[q+i+1]-C[q])),h=B.findIndex(x=>x!==0);
   const project=V=>V.map((v,i)=>h<0?mod(v):mod(B[h]*v-B[i]*V[h])).filter((_,i)=>i!==h);
   const target=project(D);
   function vector(P,left,a){const get=i=>i<n?(left?P[i]:0):(!left?P[i-n]:0),first=a*get(0)+get(q);return Array.from({length:m-1},(_,i)=>mod(a*get(i+1)+get(q+i+1)-first));}
   const key=(v,complement)=>String.fromCharCode(...project(v).map((x,i)=>complement?mod(target[i]-x):x));
   // Index the smaller side to limit memory; retain every collision exactly.
   const indexLeft=g1.words.length<=g2.words.length,I=indexLeft?g1.words:g2.words,J=indexLeft?g2.words:g1.words;
   for(let a=aRange[0];a<=aRange[1];a++){
    const map=new Map();for(const w of I){const v=vector(w.v,indexLeft,a),k=key(v,false);let arr=map.get(k);if(!arr){arr=[];map.set(k,arr);}arr.push({w,v});}
    for(const w of J){const v=vector(w.v,!indexLeft,a),arr=map.get(key(v,true));if(!arr)continue;
     for(const x of arr){
      const left=indexLeft?x.w:w,right=indexLeft?w:x.w;
      const bs=h<0?Array.from({length:28},(_,i)=>i+1):[mod((D[h]-v[h]-x.v[h])*inv[B[h]])];
      for(const b of bs){if(!b)continue;const p=left.p.concat(right.p),P=left.v.concat(right.v),d=mod(C[q]-P[q]-a*P[0]-b*C[0]);models++;
       emit({a,b,d,p,P,C});
      }
     }
    }
   }
  }return {models,maskPairs};
 }
 // Deterministic small Cartesian comparison tests all hold-pattern and rank-deficient cases.
 function testJoin(){
  const cases=[
   {c1:Array.from({length:9},(_,i)=>mod(i*3+1)),c2:Array.from({length:11},(_,i)=>mod(i*7+4))},
   {c1:[0,2,2,2,0,2,2,2,2],c2:[3,3,0,3,3,3,3,3,3,3,3,3]},
   {c1:Array(9).fill(4),c2:Array(11).fill(9)}
  ];
  for(const {c1,c2} of cases){
   const mk=c=>Array.from({length:5},(_,j)=>String.fromCharCode(...c.map((x,i)=>!x&&((i+j)%2===0)?0:1+((i*7+j*11)%28))));
   const A=mk(c1),B=mk(c2),actual=[],expected=[];
   const repr=(a,b,d,p)=>[a,b,d,...p].join(",");
   join(c1,c2,A,B,x=>actual.push(repr(x.a,x.b,x.d,x.p)));
   for(const a of A)for(const b of B){const p=Array.from(a+b,x=>x.charCodeAt(0)),c=c1.concat(c2);if(p.some((x,i)=>!x&&c[i]))continue;const cp=p.map((x,i)=>[c[i],x]).filter(x=>x[1]);if(cp.length<q+3)continue;
    for(const [aa,bb,dd] of triples(cp))expected.push(repr(aa,bb,dd,p));
   }
   assert(same(actual.sort(),expected.sort()),"join vs direct triples");
  }return cases.length;
 }

 // Exact concrete-queue whole-side reachability. Only dead branch states are memoized.
 // Cap is measured in visited physical-rune transitions, never treated as impossibility.
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

 // Streaming reachability for large anchor support; ring mutation avoids per-rune array allocation.
 // Copies only at ambiguous zero branches; exact depth-first existence, no score pruning.
 function reachFast(C,K,a,b,d,rev){
  const n=C.length,ai=inv[a];let visits=0,capped=false;
  const check=()=>{if(++visits>REACH_CAP)throw Error("reach cap");};
  const xAt=i=>C[rev?n-1-i:i];
  function consume(c,k,h){let p;if(rev){h=h===0?q-1:h-1;p=mod((k[h]-b*c-d)*ai);if(!p)return -1;k[h]=mod(c-p);return h;}
   p=mod(c-k[h]);if(!p)return -1;k[h]=mod(a*p+b*c+d);return h===q-1?0:h+1;}
  function go(i,k,h){while(i<n&&xAt(i)){check();h=consume(xAt(i++),k,h);if(h<0)return false;}if(i===n)return true;
   check();if(go(i+1,k.slice(),h))return true;
   const nh=consume(0,k,h);if(nh<0)return false;check();return go(i+1,k,nh);
  }
  let yes=false;try{yes=go(0,K.slice(),0);}catch(e){if(e.message!=="reach cap")throw e;capped=true;}
  return {status:yes?"legal":capped?"cap":"empty",visits};
 }

 // A second intact pair is a separate necessary lexical condition on the *same* full path.
 // No memoization across partial words: every path is kept exact up to the explicit cap.
 function reachLexReverse(C,K,a,b,d,constraints){
  const seq=C.slice().reverse(),plain=new Uint8Array(seq.length),ai=inv[a],ends=new Map();let visits=0,capped=false,final=null;
  for(const w of constraints)ends.set(C.length-w.at,w);
  const check=()=>{if(++visits>REACH_CAP)throw Error("reach cap");};
  const allowed=i=>{const w=ends.get(i);return !w||dict[w.n].has(String.fromCharCode(...Array.from(plain.slice(i-w.n,i)).reverse()));};
  function consume(c,k){const p=mod((k.at(-1)-b*c-d)*ai);return p?{p,k:[mod(c-p),...k.slice(0,-1)]}:null;}
  function go(i,k){
   while(i<seq.length&&seq[i]){check();const x=consume(seq[i],k);if(!x)return false;plain[i++]=x.p;if(!allowed(i))return false;k=x.k;}
   if(i===seq.length){final=k.slice();return true;}
   check();plain[i]=0;if(allowed(i+1)&&go(i+1,k))return true;
   const x=consume(0,k);if(x){check();plain[i]=x.p;if(allowed(i+1)&&go(i+1,x.k))return true;}return false;
  }
  let yes=false;try{yes=go(0,K);}catch(e){if(e.message!=="reach cap")throw e;capped=true;}
  return {status:yes?"legal":capped?"cap":"empty",visits,p:yes?Array.from(plain).reverse():null,queue:final};
 }
 function p0Stream(range){
  // Independently check the ring inverse against the earlier complete-queue implementation.
  const ns=src.find(x=>x.name==="0_loss_of_divinity"),P=ns.w.flat(),a0=28,b0=5,d0=11,K0=Array.from({length:q},(_,i)=>(i*i*7+i*11+23)%29),C0=encrypt(P,K0,a0,b0,d0).C;
  const i0=ns.w.slice(0,5).flat().length,j0=i0+ns.w[5].length+ns.w[6].length,cp0=P.slice(i0,j0).map((v,i)=>[C0[i0+i],v]).filter(x=>x[1]);
  const k0=cp0.slice(0,q).map(([c,p])=>mod(c-p)),f0=encrypt(P.slice(i0,j0),k0,a0,b0,d0).queue;
  let checks=0;for(const [C,K,rev] of [[C0.slice(0,i0),k0,true],[C0.slice(j0),f0,false]])for(const delta of [0,1,7]){const k=K.slice();k[0]=mod(k[0]+delta);const x=reach(C,k,a0,b0,d0,rev),y=reachFast(C,k,a0,b0,d0,rev);assert(x.status===y.status&&x.status!=="cap","fast reach agreement");checks++;if(!delta)assert(y.status==="legal","native true path");}
  const words=original.slice(0,158),C=words.flat();assert(C.length===729&&same(C,gp.pages.slice(0,3).flatMap(x=>x.indices)),"p0 chapter tape");
  const offset=[0];for(const w of words)offset.push(offset.at(-1)+w.length);
  const pairs=words.slice(0,-1).map((w,j)=>({j,nz:w.concat(words[j+1]).filter(Boolean).length,n:w.length+words[j+1].length})).filter(x=>words[x.j].length>=5&&words[x.j+1].length>=5&&x.nz>=q+3).sort((a,b)=>b.nz-a.nz||b.n-a.n||a.j-b.j);
  const j=pairs[0].j,at=offset[j],end=offset[j+2],c1=words[j],c2=words[j+1],LC=C.slice(0,at),RC=C.slice(end);
  assert(j===144&&at===645&&c1.length===8&&c2.length===9,"frozen p0 anchor");
  // Same source-only pair ordering, take the strongest complete nonoverlapping pair left of the first.
  const other=pairs.find(x=>x.j+2<=j);assert(other,"second pair");
  const secondary=[{at:offset[other.j],n:words[other.j].length},{at:offset[other.j+1],n:words[other.j+1].length}];
  let legal=0,cap=0,empty=0,visits=0,best=null,legalModels=[],byA={},secondLegal=0,secondEmpty=0,secondCap=0,secondVisits=0,secondModels=[];
  const support=join(c1,c2,dict[c1.length],dict[c2.length],x=>{
   const {a,b,d,p,P,C:CC}=x,start=P.slice(0,q).map((v,i)=>mod(CC[i]-v)),finish=P.slice(-q).map((v,i)=>mod(a*v+b*CC[CC.length-q+i]+d));
   let stats=byA[a];if(!stats)stats=byA[a]={models:0,empty:0,legal:0,cap:0,visits:0};stats.models++;
   // Short right side first: cheap necessary condition, then full backward side.
   const rr=reachFast(RC,finish,a,b,d,false);let ll=null,status="empty";
   if(rr.status!=="empty"){ll=reachFast(LC,start,a,b,d,true);status=ll.status==="empty"?"empty":ll.status==="cap"||rr.status==="cap"?"cap":"legal";}
   const v=rr.visits+(ll?.visits||0);visits+=v;stats.visits+=v;stats[status]++;
   if(status==="empty"){empty++;return;}if(status==="cap"){cap++;return;}legal++;
   const left=reach(LC,start,a,b,d,true),right=reach(RC,finish,a,b,d,false);
   assert(left.status==="legal"&&right.status==="legal","witness reach");
   const pp=left.p.concat(p,right.p);assert(same(encrypt(pp,left.queue,a,b,d).C,C),"full p0 replay");
   const avg=score(pp)/pp.length,row={a,b,d,anchor:render(p.slice(0,c1.length))+" "+render(p.slice(c1.length)),anchorIndices:p,incoming:start,score:avg,first100:render(pp.slice(0,100)),last100:render(pp.slice(-100))};
   // Preserve the best arbitrary witness, not an unbounded list of ordinary legal models.
   if(!best||avg>best.score)best=row;
   const sl=reachLexReverse(LC,start,a,b,d,secondary);secondVisits+=sl.visits;
   if(sl.status==="empty"){secondEmpty++;return;}if(sl.status==="cap"){secondCap++;return;}
   secondLegal++;const sp=sl.p.concat(p,right.p);assert(same(encrypt(sp,sl.queue,a,b,d).C,C),"two-anchor full replay");
   const secondWords=secondary.map(w=>render(sp.slice(w.at,w.at+w.n)));secondModels.push({...row,secondWords,score:score(sp)/sp.length,first100:render(sp.slice(0,100)),last100:render(sp.slice(-100))});
  },range);
  assert(support.models===legal+cap+empty&&legal===secondLegal+secondEmpty+secondCap,"p0 exhaustive accounting");
  return {mode:"p0full",q,range,joinTests,checks,anchor:{j,at,n:[c1.length,c2.length]},lexicon:dict.reduce((s,d)=>s+d.size,0),...support,legal,cap,empty,visits,byA,best,secondary,secondLegal,secondEmpty,secondCap,secondVisits,secondModels};
 }
 const joinTests=testJoin(),FIT_CAP=2048;
 if(mode.startsWith('p0full:')){const range=mode.slice(7).split('-').map(Number);assert(range.length===2&&range[0]>=1&&range[1]<=28&&range[0]<=range[1],'a range');return p0Stream(range);}
 function attack(name,words,truth=null,partial=new Set(),prediction=true){
  const C=words.flat(),offsets=[0],anchors=[];for(const w of words)offsets.push(offsets.at(-1)+w.length);
  let pairs=[];
  for(let j=0;j+1<words.length;j++){
   if(partial.has(j)||partial.has(j+1)||words[j].length<5||words[j+1].length<5)continue;
   const c=words[j].concat(words[j+1]);if(c.filter(Boolean).length<q+3)continue;
   const at=offsets[j],end=offsets[j+2],L=Math.max(0,at-48),R=Math.min(C.length,end+48),rev=L>=C.length-R;
   if((rev?L:C.length-R)<76)continue;
   pairs.push({j,at,end,L,R,rev,c,nz:c.filter(Boolean).length});
  }
  // Original selection depends only on the strongest guaranteed equation count.
  if(!truth)pairs=pairs.sort((a,b)=>b.nz-a.nz||b.c.length-a.c.length||a.j-b.j).slice(0,1);
  else if(truth.anchorJ!=null)pairs=pairs.filter(x=>x.j===truth.anchorJ);
  for(const {j,at,end,L,R,rev,c,nz} of pairs){
   const c1=words[j],c2=words[j+1],fitLeft=C.slice(L,at),fitRight=C.slice(end,R),held=rev?C.slice(L-76,L):C.slice(R,R+76);
   const trueP=truth?.P.slice(at,end),trueLex=truth?dict[c1.length].has(String.fromCharCode(...trueP.slice(0,c1.length)))&&dict[c2.length].has(String.fromCharCode(...trueP.slice(c1.length))):null;
   let trueModelCount=0,fitLegal=0,best=null,stored=[],fullLegal=0,fullCap=0,fullEmpty=0,fullVisits=0,bestFull=null,trueFull=null;
   const support=join(c1,c2,dict[c1.length],dict[c2.length],x=>{
    if(truth&&x.a===truth.a&&x.b===truth.b&&x.d===truth.d&&same(x.p,trueP))trueModelCount++;
    if(stored.length<=FIT_CAP)stored.push(x);
   });
   if(prediction&&support.models<=FIT_CAP){
    for(const x of stored){const {a,b,d,p,P,C:consumed}=x,start=P.slice(0,q).map((v,i)=>mod(consumed[i]-v));
     const check=encrypt(p,start,a,b,d);assert(same(check.C,c),"join replay");
     const left=bestSide(fitLeft,start,a,b,d,true,p);if(!left.best)continue;
     const right=bestSide(fitRight,check.queue,a,b,d,false,p);if(!right.best)continue;
     fitLegal++;
     // A complete chapter witness is independent of the locally preferred F path.
     // Test the longer side first; an empty side certifies rejection even if the other caps.
     const LC=C.slice(0,at),RC=C.slice(end),rr=LC.length>=RC.length?[[LC,start,true],[RC,check.queue,false]]:[[RC,check.queue,false],[LC,start,true]];
     const one=reach(rr[0][0],rr[0][1],a,b,d,rr[0][2]);fullVisits+=one.visits;let status="empty",two=null;
     if(one.status!=="empty"){two=reach(rr[1][0],rr[1][1],a,b,d,rr[1][2]);fullVisits+=two.visits;status=two.status==="empty"?"empty":one.status==="cap"||two.status==="cap"?"cap":"legal";}
     if(status==="legal"){fullLegal++;const ll=rr[0][2]?one:two,rt=rr[0][2]?two:one,all=ll.p.concat(p,rt.p);assert(same(encrypt(all,ll.queue,a,b,d).C,C),"full chapter replay");const wscore=score(all)/all.length;if(!bestFull||wscore>bestFull.score)bestFull={a,b,d,anchor:render(p),score:wscore,first100:render(all.slice(0,100)),last100:render(all.slice(-100))};}
     else if(status==="cap")fullCap++;else fullEmpty++;
     if(truth&&a===truth.a&&b===truth.b&&d===truth.d&&same(p,trueP))trueFull=status;
     const fit=left.best.p.concat(p,right.best.p),s=score(fit),seed=left.best.queue,after=right.best.queue;
     assert(same(encrypt(fit,seed,a,b,d).C,C.slice(L,R)),"fit replay");
     if(!best||s>best.s)best={a,b,d,p,seed,after,fit,s};
    }
   }
   let result=null;
   if(best){const h=bestSide(held,rev?best.seed:best.after,best.a,best.b,best.d,rev,best.fit);
    if(h.best){const full=rev?h.best.p.concat(best.fit):best.fit.concat(h.best.p),seed=rev?h.best.queue:best.seed;assert(same(encrypt(full,seed,best.a,best.b,best.d).C,C.slice(rev?L-76:L,rev?R:R+76)),"holdout replay");}
    result={a:best.a,b:best.b,d:best.d,word:render(best.p.slice(0,c1.length))+" "+render(best.p.slice(c1.length)),fitScore:best.s/(R-L),fit:render(best.fit),holdout:h.best?render(h.best.p):null,holdoutScore:h.best?h.best.s/76:null,holdoutPaths:h.paths,correct:truth?{model:best.a===truth.a&&best.b===truth.b&&best.d===truth.d,fit:best.fit.filter((x,i)=>x===truth.P[L+i]).length,fitTotal:R-L,holdout:h.best?h.best.p.filter((x,i)=>x===truth.P[(rev?L-76:R)+i]).length:0}:null};
   }
   anchors.push({j,at,n:[c1.length,c2.length],guaranteed:nz,L,R,holdoutSide:rev?"left":"right",dictWords:[dict[c1.length].size,dict[c2.length].size],...support,fitStatus:!prediction?"unqualified":support.models>FIT_CAP?"cap":"complete",fitLegal,fullReach:prediction&&support.models<=FIT_CAP?{legal:fullLegal,cap:fullCap,empty:support.models-fullLegal-fullCap,visits:fullVisits,bestWitness:bestFull,trueFull}:null,trueLex,trueModelCount,result});
  }return {name,n:C.length,anchors};
 }
 const controls=specs.map(([name,a,b,d,salt])=>{const s=src.find(x=>x.name===name),P=s.w.flat(),K=Array.from({length:q},(_,i)=>(i*i*7+i*11+salt)%29),C=encrypt(P,K,a,b,d).C;let j=0;return attack(name,s.w.map(w=>{const v=C.slice(j,j+w.length);j+=w.length;return v}),{P,K,a,b,d});});

 // Independent workload-matched prose controls: disjoint from each donor's training prefix.
 // The first in-vocabulary pair with >=20 consuming plaintext runes is selected before encryption.
 function donorPlant(text,name,a,b,d,salt){
  const st=/\*\*\* START OF (?:THIS|THE) PROJECT GUTENBERG EBOOK[^\r\n]*\*\*\*/i.exec(text);if(st)text=text.slice(st.index+st[0].length);
  const w=[],off=[0];for(let t of text.match(/[A-Za-z]+/g)||[]){t=t.toUpperCase().replace(/QU/g,'CW').replace(/[KQ]/g,'C').replace(/V/g,'U').replace(/Z/g,'S');const p=[];while(t.length){let ok=false;for(let k=Math.min(t.length,3);k>=1;k--){const x=t.slice(0,k),v=k===3?(x==="ING"?21:undefined):alpha.get(x);if(v!==undefined){p.push(v);t=t.slice(k);ok=true;break;}}assert(ok,"donor word");}w.push(p);off.push(off.at(-1)+p.length);}
  const eligible=p=>p.length>=5&&p.length<dict.length&&dict[p.length].has(String.fromCharCode(...p));
  const j=w.findIndex((p,i)=>i+1<w.length&&off[i]>=2300&&off.at(-1)-off[i+2]>=160&&eligible(p)&&eligible(w[i+1])&&p.concat(w[i+1]).filter(Boolean).length>=20);
  assert(j>=0,"donor informative anchor");let l=j,h=j+2;while(off[j]-off[l]<160)l--;while(off[h]-off[j+2]<160)h++;
  const words=w.slice(l,h),P=words.flat(),K=Array.from({length:q},(_,i)=>(i*i*7+i*11+salt)%29),C=encrypt(P,K,a,b,d).C;let k=0;
  assert(off[l]>=2000,"disjoint donor training");
  const out=attack(name,words.map(w=>{const v=C.slice(k,k+w.length);k+=w.length;return v}),{P,K,a,b,d,anchorJ:j-l});
  return {...out,donorWindow:[off[l],off[h]],anchorSourceOffset:off[j]};
 }
 controls.push(donorPlant(donors[1],"Shakespeare-disjoint",17,8,3,7),donorPlant(donors[2],"Emerson-disjoint",7,21,19,19));
 const calibration=controls.flatMap(c=>c.anchors).filter(a=>a.trueLex),eligibleFit=calibration.filter(a=>a.fitStatus==="complete"),exact=eligibleFit.filter(a=>a.result?.correct.model&&a.result.correct.holdout===76).length;
 const supportPass=calibration.length>=2&&calibration.every(a=>a.trueModelCount===1);
 const pass=eligibleFit.length>=2&&exact===eligibleFit.length;
 const pages=[0,3,8,15,23,27,34,40,54,56],starts=pages.map(p=>gp.pages.slice(0,p).reduce((s,x)=>s+x.indices.length,0));
 let off=0;const ww=original.map(w=>{const x={w,off};off+=w.length;return x});
 const originalResults=supportPass?starts.slice(0,-1).map((s,i)=>{const e=starts[i+1],w=[],partial=new Set();for(const x of ww){const lo=Math.max(s,x.off),hi=Math.min(e,x.off+x.w.length);if(lo>=hi)continue;if(lo!==x.off||hi!==x.off+x.w.length)partial.add(w.length);w.push(x.w.slice(lo-x.off,hi-x.off));}assert(w.flat().length===e-s,"chapter group carry");assert(same(w.flat(),gp.pages.slice(pages[i],pages[i+1]).flatMap(x=>x.indices)),"chapter tape");return attack("p"+pages[i],w,null,partial,pass);}):null;
 return {q,trainLengths:train.map(x=>x.length),lexicon:dict.reduce((s,d)=>s+d.size,0),joinTests,FIT_CAP,REACH_CAP,calibration:{eligible:calibration.length,eligibleFit:eligibleFit.length,exact,passed:pass,supportPassed:supportPass},controls,original:originalResults};
}
if(typeof module!=="undefined")module.exports={experiment};

if(require.main===module){const fs=require('node:fs'),path=require('node:path'),lib=require('./lp2_fhold_cyclic_ngram_map.cjs');const paths=["resources/liber-primus/lp2-corpus.json","resources/lp2-transcription.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/control/english_wordfreq_textblob.txt","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];const a=paths.map(p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8'));console.log(JSON.stringify(experiment(...a.slice(0,4),a.slice(4),lib,process.argv[2]||'strict'),null,2));}
