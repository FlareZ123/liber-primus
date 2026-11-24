/** Soft-phase EM predictive period pilot. Run from repository root. */
const fs=require('node:fs');
function experiment(lp1,gold,raw,original=null){
 const A=29,ix=new Map(gold.runes.map((r,i)=>[r,i])),extract=s=>Array.from(s).filter(x=>ix.has(x)).map(x=>ix.get(x)),sections=gold.sections.map(s=>extract(s.source_text)),mod=x=>(x+A)%A;
 function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296;};}
 function enc(p,key){let j=0;return p.map(x=>x===0?0:mod(x+key[j++%key.length]));}
 const w=extract(lp1.split("%").slice(1,3).join("%")),k=extract(lp1.split("$")[5]),wk=[23,10,1,10,9,10,16,26],kk=[0,10,4,0,1,19,0,18,4,18,9,0,18],eq=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
 if(!eq(enc(sections[1],wk),w)||!eq(enc(sections[5],kk),k))throw Error("authentic mismatch "+sections.map(s=>s.length)+" "+w.length+" "+k.length);
 function freq(ex){let n=Array(A).fill(.5);sections.forEach((s,i)=>{if(!ex.includes(i))s.forEach(x=>n[x]++);});let t=n.reduce((a,b)=>a+b,0);return n.map(x=>x/t);}
 const pm=Array.from({length:A},(_,c)=>Array.from({length:A},(_,d)=>mod(c-d)));
 function emissions(pi,f,q){let e=new Float64Array(q*A);for(let j=0;j<q;j++)for(let c=0;c<A;c++){let v=0;for(let d=0;d<A;d++)if(d!==c)v+=pi[j*A+d]*f[pm[c][d]];e[j*A+c]=v;}return e;}
 function pass(C,e,f,q,initial,stats){
  let n=C.length,F=new Float64Array((n+1)*q),sc=new Float64Array(n),ll=0;if(initial)F.set(initial);else F[0]=1;
  for(let t=0;t<n;t++){let c=C[t],s=0,b=t*q,b1=b+q;for(let j=0;j<q;j++){let a=F[b+j];if(c===0)F[b1+j]+=a*f[0];F[b1+(j+1)%q]+=a*e[j*A+c];}for(let j=0;j<q;j++)s+=F[b1+j];if(!s)return {ll:-Infinity,end:null};sc[t]=s;ll+=Math.log(s);for(let j=0;j<q;j++)F[b1+j]/=s;}
  const end=F.slice(n*q);if(!stats)return {ll,end};
  let counts=new Float64Array(q*A),B=new Float64Array(q).fill(1),N=new Float64Array(q);
  for(let t=n-1;t>=0;t--){let c=C[t],s=sc[t];for(let j=0;j<q;j++){let a=e[j*A+c]*B[(j+1)%q];counts[j*A+c]+=F[t*q+j]*a/s;N[j]=(a+(c===0?f[0]*B[j]:0))/s;}[B,N]=[N,B];}
  return {ll,end,counts};
 }
 function fit(C,f,q,seed){
  let random=rng(seed),pi=new Float64Array(q*A);for(let j=0;j<q;j++){let s=0;for(let d=0;d<A;d++){let v=-Math.log(Math.max(1e-12,random()));pi[j*A+d]=v;s+=v;}for(let d=0;d<A;d++)pi[j*A+d]/=s;}
  for(let it=0;it<45;it++){
   const e=emissions(pi,f,q),z=pass(C,e,f,q,null,true),newpi=new Float64Array(q*A);
   for(let j=0;j<q;j++){let s=0;for(let d=0;d<A;d++){let n=0;for(let c=0;c<A;c++)if(c!==d&&e[j*A+c]>0)n+=z.counts[j*A+c]*f[pm[c][d]]/e[j*A+c];let v=pi[j*A+d]*n+.005;newpi[j*A+d]=v;s+=v;}for(let d=0;d<A;d++)newpi[j*A+d]/=s;}
   pi=newpi;
  }
  let e=emissions(pi,f,q),z=pass(C,e,f,q,null,false),key=Array.from({length:q},(_,j)=>{let b=0;for(let d=1;d<A;d++)if(pi[j*A+d]>pi[j*A+b])b=d;return b;});
  return {pi,key,conf:key.reduce((s,d,j)=>s+pi[j*A+d],0)/q,train:z.ll,end:z.end};
 }

 /** Finite beam over hard assignments, using soft distributions for unassigned phases.
  * @param {number[]} C training ciphertext only
  * @param {number[]} f native unigram probabilities
  * @param {number} q selected phase count
  * @param {Float64Array} profile fitted soft phase probabilities
  */
 function harden(C,f,q,profile,log,selectC=C){
  let winners=[],expanded=0;
  for(let rot=0;rot<q;rot++){
   const pi=new Float64Array(q*A);
   for(let j=0;j<q;j++)pi.set(profile.slice(((j+rot)%q)*A,((j+rot)%q+1)*A),j*A);
   const opts=Array.from({length:q},(_,j)=>Array.from({length:A},(_,d)=>d).sort((a,b)=>pi[j*A+b]-pi[j*A+a]).slice(0,5));
   const order=Array.from({length:q},(_,j)=>j).sort((a,b)=>pi[b*A+opts[b][0]]-pi[a*A+opts[a][0]]);
   const initial=emissions(pi,f,q);
   let beam=[{key:Array(q).fill(-1),e:initial,ll:pass(C,initial,f,q,null,false).ll}];
   for(const j of order){
    const next=[];
    for(const node of beam)for(const d of opts[j]){
      const e=node.e.slice(),key=node.key.slice();key[j]=d;
      for(let c=0;c<A;c++)e[j*A+c]=c===d?0:f[pm[c][d]];
      const ll=pass(C,e,f,q,null,false).ll;expanded++;
      if(Number.isFinite(ll))next.push({key,e,ll});
    }
    next.sort((a,b)=>b.ll-a.ll);beam=next.slice(0,24);if(!beam.length)break;
   }
   for(const candidate of beam)if(candidate.key.every(d=>d>=0))winners.push({...candidate,tri:viterbi(selectC,candidate.key,log).s});
  }
  winners.sort((a,b)=>b.tri-a.tri||b.ll-a.ll);
  return {expanded,best:Number.isFinite(winners[0]?.tri)?winners[0]:null,rotationsWithLegalKeys:winners.length};
 }

 function model(ex){
  let u=Array(A).fill(.5),b=new Float64Array(30*A),bt=new Float64Array(30),t=new Float64Array(900*A),tt=new Float64Array(900);
  for(let i=0;i<sections.length;i++)if(!ex.includes(i)){
   let a=29,z=29;for(const p of sections[i]){u[p]++;b[z*A+p]++;bt[z]++;t[(a*30+z)*A+p]++;tt[a*30+z]++;a=z;z=p;}
  }
  const tot=u.reduce((a,b)=>a+b,0),log=new Float64Array(900*A);
  for(let a=0;a<30;a++)for(let z=0;z<30;z++)for(let p=0;p<A;p++){
   const p1=u[p]/tot,p2=(b[z*A+p]+4*p1)/(bt[z]+4),p3=(t[(a*30+z)*A+p]+8*p2)/(tt[a*30+z]+8);
   log[(a*30+z)*A+p]=Math.log(p3);
  }
  return log;
 }
 /** Exact Viterbi for the fixed key and authentic latent holds. */
 function viterbi(C,key,log,trace=false){
  const q=key.length;let m=new Map([[899,{s:0,path:""}]]);
  for(const c of C){
   let next=new Map();
   for(const [id,node] of m){
    const j=Math.floor(id/900),ctx=id%900,z=ctx%30;
    function step(p,k){const n=k*900+z*30+p,s=node.s+log[ctx*A+p],prev=next.get(n);if(!prev||s>prev.s)next.set(n,{s,path:trace?node.path+String.fromCharCode(65+p):""});}
    if(c===0)step(0,j);
    const p=mod(c-key[j]);if(p!==0)step(p,(j+1)%q);
   }
   if(!next.size)return {s:-Infinity,P:null};m=next;
  }
  let best=null;for(const v of m.values())if(!best||v.s>best.s)best=v;
  return {s:best.s,P:trace?Array.from(best.path,c=>c.charCodeAt(0)-65):null};
 }

 /** Local full-alphabet refinement, using only the development ciphertext. */
 function refine(C,key,log){
  const k=key.slice();let score=viterbi(C,k,log).s,changes=0;
  for(let sweep=0;sweep<2;sweep++){
   let improved=false;
   for(let j=0;j<k.length;j++){
    let b=k[j],best=score;
    for(let d=0;d<A;d++)if(d!==b){const old=k[j];k[j]=d;const s=viterbi(C,k,log).s;k[j]=old;if(s>best+1e-10){best=s;b=d;}}
    if(b!==k[j]){k[j]=b;score=best;changes++;improved=true;}
   }
   if(!improved)break;
  }
  return {key:k,score,changes};
 }
 function primitive(key){for(let d=1;d<=key.length;d++)if(key.length%d===0&&key.every((x,i)=>x===key[i%d]))return d;}
 function test(name,C,f,trueKey,seed,log,truthPlain=null){
  const n=C.length,b=Math.floor(.65*n),v=Math.floor(.82*n),train=C.slice(0,b),valid=C.slice(b,v),hold=C.slice(v),rows=[],profiles=[];
  for(let q=2;q<=16;q++){
   let best=null;for(let s=0;s<3;s++){let x=fit(train,f,q,(seed+10007*q+7919*s)>>>0);if(!best||x.train>best.train)best=x;}
   profiles[q]=best.pi;let e=emissions(best.pi,f,q),va=pass(valid,e,f,q,best.end,false),ho=pass(hold,e,f,q,va.end,false),key=best.key,hard=new Float64Array(q*A);key.forEach((d,j)=>hard[j*A+d]=1);
   let he=emissions(hard,f,q),ht=pass(train,he,f,q,null,false),hv=ht.end?pass(valid,he,f,q,ht.end,false):{ll:-Infinity,end:null},hh=hv.end?pass(hold,he,f,q,hv.end,false):{ll:-Infinity};
   rows.push({q,primitive:primitive(key),key,conf:best.conf,train:best.train/b,validation:va.ll/valid.length,hold:ho.ll/hold.length,hardTrain:ht.ll/b,hardValidation:hv.ll/valid.length,hardHold:hh.ll/hold.length});
  }
  const uniform=new Float64Array(A).fill(1/A),base=pass(hold,emissions(uniform,f,1),f,1,null,false).ll/hold.length,rank=rows.slice().sort((a,b)=>b.validation-a.validation),win=rank[0];
  const hardened=harden(train,f,win.q,profiles[win.q],log,C.slice(0,v));let fixed=null;
  if(hardened.best){const refined=refine(C.slice(0,v),hardened.best.key,log),key=refined.key,hard=new Float64Array(win.q*A);key.forEach((d,j)=>hard[j*A+d]=1);const e=emissions(hard,f,win.q),ft=pass(train,e,f,win.q,null,false),fv=pass(valid,e,f,win.q,ft.end,false),fh=fv.end?pass(hold,e,f,win.q,fv.end,false):{ll:-Infinity};
    const decoded=viterbi(C,key,log,true),P=decoded.P;if(P&&!eq(enc(P,key),C))throw Error('replay');fixed={key,changes:refined.changes,train:ft.ll/train.length,validation:fv.ll/valid.length,hold:fh.ll/hold.length,exactKey:trueKey?eq(key,trueKey):null,viterbi:decoded.s/C.length,accuracy:truthPlain&&P?P.filter((p,i)=>p===truthPlain[i]).length/P.length:null,heldoutAccuracy:truthPlain&&P?P.slice(v).filter((p,i)=>p===truthPlain[v+i]).length/(C.length-v):null,plaintext:P?P.map(x=>gold.runes[x]).join(''):null};}
  const accept=win.hold-base>=.1&&fixed!==null&&Number.isFinite(fixed.hold)&&fixed.hold-base>=.1;return {name,n,split:[b,v-b,n-v],truth:trueKey,baseline:base,accept,winner:win,hardening:{expanded:hardened.expanded,rotationsWithLegalKeys:hardened.rotationsWithLegalKeys,fixed},rows};
 }

 const letters=["F","U","TH","O","R","C","G","W","H","N","I","J","EO","P","X","S","T","B","E","M","L","NG","OE","D","A","AE","Y","IA","EA"];
 const nativeTokens=letters.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function native(s){
  const out=[];for(let word of s.toUpperCase().match(/[A-Z]+/g)||[]){word=word.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");while(word.length){const x=nativeTokens.find(t=>word.startsWith(t.s));if(!x)throw Error(word);out.push(x.i);word=word.slice(x.s.length);}}
  return out;
 }
 const hist=[{name:"WELCOME",C:w,P:sections[1],ex:[1],key:wk},{name:"KOAN2",C:k,P:sections[5],ex:[5],key:kk}].map((c,i)=>test(c.name,c.C,freq(c.ex),c.key,981243+i*8713,model(c.ex),c.P));

 const donors=raw.map(native),periods=[4,5,6,7,9,12,13,16],starts=[18000,55000,22000,90000,190000,35000,185000,265000],plants=[],pads=[];
 const authPass=hist.every(x=>x.accept&&x.winner.q===x.truth.length&&x.hardening.fixed?.exactKey);
 if(authPass)for(let i=0;i<periods.length;i++){
  const q=periods[i],n=840,d=i%3,random=rng((0x51DAB3ED+0x9E3779B9*i)>>>0),start=starts[i],P=donors[d].slice(start,start+n);
  if(P.length!==n)throw Error("short donor "+d+" "+start+" "+donors[d].length);
  let key=Array.from({length:q},()=>Math.floor(random()*29));
  if(i%2===0&&q%2===0){const repeat=key[0];for(let j=0;j<q;j+=2)key[j]=repeat;if(primitive(key)!==q)key[q-1]=(key[q-1]+1)%29;}
  if(primitive(key)!==q)throw Error("nonprimitive");
  const pad=Array.from({length:n},()=>Math.floor(random()*29));
  plants.push(test("fresh-"+d+"-"+start,enc(P,key),freq([]),key,(0xA4A836B1+i*104729)>>>0,model([]),P));
  pads.push(test("pad-"+d+"-"+start,enc(P,pad),freq([]),null,(0x95DB7AB3+i*104729)>>>0,model([]),null));
 }
 const gate={authentic:hist.filter(x=>x.accept&&x.winner.q===x.truth.length&&x.hardening.fixed?.exactKey).length,
 plants:plants.filter(x=>x.accept&&x.winner.q===x.truth.length&&x.hardening.fixed.heldoutAccuracy>=.98).length,
 wrong:plants.filter(x=>x.accept&&x.winner.q!==x.truth.length).length,pads:pads.filter(x=>x.accept).length};
 gate.pass=gate.authentic===2&&gate.plants>=6&&gate.wrong===0&&gate.pads===0;
 let target=null;
 if(gate.pass&&original){
  const C=original.pages.filter(p=>p.page>=33&&p.page<=39).flatMap(p=>p.indices);if(C.length!==1680)throw Error("chapter length");
  const f=freq([]),log=model([]),prefix=C.slice(0,840),hold=C.slice(840);
  const fit=test("physical p33-39 first 840",prefix,f,null,0x928C35E1,log);
  target={fit,continuation:null};
  if(fit.accept){
   const key=fit.hardening.fixed.key,q=key.length,pi=new Float64Array(q*A);key.forEach((d,j)=>pi[j*A+d]=1);
   const e=emissions(pi,f,q),a=pass(prefix,e,f,q,null,false),z=a.end?pass(hold,e,f,q,a.end,false):{ll:-Infinity,end:null},baseline=pass(hold,emissions(new Float64Array(A).fill(1/A),f,1),f,1,null,false).ll/hold.length,decoded=viterbi(C,key,log,true);
   if(decoded.P&&!eq(enc(decoded.P,key),C))throw Error("target replay");
   target.continuation={key,heldout:hold.length,score:z.ll/hold.length,baseline,gain:z.ll/hold.length-baseline,legal:!!z.end,plaintext:decoded.P?decoded.P.map(x=>letters[x]).join(" "):null,exactReplay:!!decoded.P};
  }
 }
 return {hist,plants,pads,gate,target};
}
console.log(JSON.stringify(experiment(fs.readFileSync('resources/transcriptions/lp1_wulfic_canonical.txt','utf8'),JSON.parse(fs.readFileSync('resources/external/relikd-solved-gp29-native-v1.json','utf8')),[fs.readFileSync('resources/control/shakespeare_first300k.txt','utf8'),fs.readFileSync('resources/control/emerson_essays_2944.txt','utf8'),fs.readFileSync('resources/control/gibran_prophet_58585.txt','utf8')],JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json','utf8'))),null,2));
