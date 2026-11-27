#!/usr/bin/env node
"use strict";
const fs=require("node:fs"),path=require("node:path");
const root=path.join(__dirname,"../resources/liber-primus");
const corpus=JSON.parse(fs.readFileSync(path.join(root,"lp2-corpus.json"),"utf8"));
const src=fs.readFileSync(path.join(root,"lp2-transcription.txt"),"utf8");
const q=29,S=q*q,INF=30000,mod=x=>(x%q+q)%q,all=(1<<29)-1;
const lookup=new Map(corpus.runes.map((x,i)=>[x,i])),words=[];let w=[],offset=0,start=0;
for(const ch of src.split("%").slice(0,55).join("%")){
  if(lookup.has(ch)){if(!w.length)start=offset;w.push({i:offset++,c:lookup.get(ch)});}
  else if(ch!=="%"&&ch!=="/"&&!/\s/u.test(ch)&&w.length){words.push({start,runes:w});w=[];}
}
if(w.length)words.push({start,runes:w});
const C=words.flatMap(x=>x.runes).map(x=>x.c);
const anchors=words.filter(x=>x.runes.length===1).map(x=>x.start),aset=new Set(anchors);
if(C.length!==12956||anchors.length!==83)throw Error("source mismatch");
const allowed=[24,10,3],amask=allowed.reduce((a,x)=>a|(1<<x),0);

function fstep(Fc,Fn,i){
 const Ec=new Int16Array(S).fill(INF),En=Array(S).fill(0n),c=C[i],a=aset.has(i)?amask:all;
 for(let k=0;k<q;k++){const p=mod(c-k);if(!(a&(1<<p)))continue;const base=k*q;let min=INF,sum=0n;
  for(let d=0;d<q;d++){const v=Fc[base+d];if(v<min){min=v;sum=Fn[base+d]}else if(v===min)sum+=Fn[base+d]}
  for(let e=0;e<q;e++){const j=mod(k+e)*q+e,s=base+e,same=Fc[s],innov=min+1,best=Math.min(same,innov);
   if(best<Ec[j]){Ec[j]=best;En[j]=0n}
   if(best===Ec[j]){if(same===best)En[j]+=Fn[s];if(innov===best)En[j]+=sum}
  }
 }return [Ec,En];
}
const snaps=new Map();let Fc=new Int16Array(S),Fn=Array(S).fill(1n);
for(let i=0;i<C.length;i++){if(aset.has(i))snaps.set(i,[Fc.slice(),Fn.slice()]);[Fc,Fn]=fstep(Fc,Fn,i)}
const optimum=Math.min(...Fc);let total=0n,finalStates=0;
for(let s=0;s<S;s++)if(Fc[s]===optimum){total+=Fn[s];finalStates++}
if(optimum!==30||finalStates!==1)throw Error("quotient regression");

let Bc=new Int16Array(S),Bn=Array(S).fill(1n),marg=[];
for(let i=C.length-1;i>=0;i--){
 if(aset.has(i)){
  const [Pc,Pn]=snaps.get(i),c=C[i],counts=[];
  for(const p of allowed){const k=mod(c-p);let count=0n;
   for(let d=0;d<q;d++){const pc=Pc[k*q+d];if(pc>=INF)continue;
    for(let e=0;e<q;e++){const ns=mod(k+e)*q+e;if(pc+(e===d?0:1)+Bc[ns]===optimum)count+=Pn[k*q+d]*Bn[ns]}
   }
   counts.push({p,translit:corpus.translit[p],count});
  }
  if(counts.reduce((a,x)=>a+x.count,0n)!==total)throw Error("marginal mismatch");
  const positive=counts.filter(x=>x.count>0n),max=positive.reduce((a,x)=>x.count>a?x.count:a,0n);
  marg.push({i,positive:positive.length,max,counts});
 }
 const Ec=new Int16Array(S).fill(INF),En=Array(S).fill(0n),c=C[i],a=aset.has(i)?amask:all;
 for(let k=0;k<q;k++){const p=mod(c-k);if(!(a&(1<<p)))continue;
  for(let d=0;d<q;d++){let best=INF,sum=0n;
   for(let e=0;e<q;e++){const ns=mod(k+e)*q+e,v=(e===d?0:1)+Bc[ns];if(v<best){best=v;sum=Bn[ns]}else if(v===best)sum+=Bn[ns]}
   Ec[k*q+d]=best;En[k*q+d]=sum;
  }
 }Bc=Ec;Bn=En;
}
marg.reverse();
const optionHist={};let assignmentUpper=1n;
for(const x of marg){optionHist[x.positive]=(optionHist[x.positive]||0)+1;assignmentUpper*=BigInt(x.positive)}
const strongest=[...marg].sort((a,b)=>a.max<b.max?-1:a.max>b.max?1:0)[0];
if(strongest.i!==530)throw Error("strongest singleton regression");
const maxWord=Math.max(...words.map(x=>x.runes.length));
let p29=1n,infoRunes=0;while(p29<total){p29*=29n;infoRunes++}
const oneWordResidual=(total+29n**BigInt(maxWord)-1n)/(29n**BigInt(maxWord));
const singletonResidual=(total+assignmentUpper-1n)/assignmentUpper;
let pageStart=0,page=null;for(const p of corpus.pages.filter(x=>x.page<=55)){if(strongest.i>=pageStart&&strongest.i<pageStart+p.indices.length){page={page:p.page,offset:strongest.i-pageStart};break}pageStart+=p.indices.length}

function solve(CC,A,trace=false){
 let D=new Int16Array(S),E=new Int16Array(S),N=new Uint8Array(S).fill(1),M=new Uint8Array(S);
 const back=trace?new Uint16Array(CC.length*S):null;
 function offer(j,v,n,pred,i){if(v<E[j]){E[j]=v;M[j]=n;if(back)back[i*S+j]=pred}else if(v===E[j])M[j]=Math.min(2,M[j]+n)}
 for(let i=0;i<CC.length;i++){E.fill(INF);M.fill(0);const c=CC[i],a=A[i];
  for(let k=0;k<q;k++){const p=mod(c-k);if(!(a&(1<<p)))continue;const base=k*q;let min=INF,arg=-1,n=0;
   for(let d=0;d<q;d++){const v=D[base+d];if(v<min){min=v;arg=d;n=N[base+d]}else if(v===min)n=Math.min(2,n+N[base+d])}
   for(let e=0;e<q;e++){const j=mod(k+e)*q+e,s=base+e;if(D[s]<INF)offer(j,D[s],N[s],s,i);if(min+1<=D[s])offer(j,min+1,n,base+arg,i)}
  }[D,E]=[E,D];[N,M]=[M,N];
 }
 let min=INF,arg=-1,count=0;for(let s=0;s<S;s++){if(D[s]<min){min=D[s];arg=s;count=N[s]}else if(D[s]===min)count=Math.min(2,count+N[s])}
 const out={cost:min,pathsCapped:count};
 if(trace){let s=arg,plain=[],events=[];for(let i=CC.length-1;i>=0;i--){const prev=back[i*S+s],k=Math.floor(prev/q),d=prev%q,e=s%q;plain.push(mod(CC[i]-k));if(e!==d)events.push([i,e]);s=prev}out.plain=plain.reverse();out.events=events.reverse()}
 return out;
}
function plant(P,quad=false){let k=7,d=4,t=0;const CC=[],events=[],changes=new Map([[17,8],[53,12],[97,1]]);
 for(let i=0;i<P.length;i++){CC.push(mod(P[i]+k));if(quad&&t>0){d=mod(d+3);events.push([i,d])}else if(changes.has(t)){d=changes.get(t);events.push([i,d])}k=mod(k+d);t++}return {CC,events}}
const native=corpus.pages.find(p=>p.page===57).indices,P=Array.from({length:190},(_,i)=>native[i%native.length]),truth=plant(P),wrong=plant(P,true);
function maskPos(pos){const A=new Int32Array(P.length).fill(all);for(const i of pos)A[i]=1<<P[i];return A}
const control=[];
for(let stride=1;stride<=25;stride++){const pos=[];for(let i=0;i<P.length;i+=stride)pos.push(i);if(pos.at(-1)!==P.length-1)pos.push(P.length-1);const t=solve(truth.CC,maskPos(pos),true),z=solve(wrong.CC,maskPos(pos));
 control.push({stride,anchors:pos.length,trueCost:t.cost,trueUnique:t.pathsCapped===1,trueRecovered:t.plain.join()===P.join()&&t.events.join()===truth.events.join(),wrongSparseCost:z.cost,wrongUnique:z.pathsCapped===1})}
function log2Big(n){const s=n.toString(2),head=parseInt(s.slice(0,53),2);return s.length-53+Math.log2(head)}
const out={schema:1,issue:3238,model:{source_issue:3231,clock:"ordinary",singleton_plaintext:["A","I","O"],minimum_innovations:optimum},
 original:{runes:C.length,singletons:anchors.length,optimal_histories:total.toString(),optimal_history_bits:log2Big(total),unique_final_state_count:finalStates,arbitrary_gp29_rune_information_lower_bound:infoRunes,max_printed_word_length:maxWord,one_word_residual_history_lower_bound:oneWordResidual.toString(),singleton_option_histogram:optionHist,maximum_distinct_singleton_assignments:assignmentUpper.toString(),complete_singleton_assignment_residual_pigeonhole_lower_bound:singletonResidual.toString(),strongest_singleton:{global_offset:strongest.i,physical_page:page.page,page_offset:page.offset,minimax_remaining_histories:strongest.max.toString(),minimax_information_gain_bits:log2Big(total)-log2Big(strongest.max),counts:strongest.counts.map(x=>({plaintext:x.translit,count:x.count.toString()}))}},
 control:{plaintext:"solved p57 native clear rune sequence repeated to 190 runes",true_events:truth.events,uniform_anchor_scan:control,wrong_law:"slope +3 every consuming step; 188 observable changes"},
 decision:"Need >=26 independently authenticated GP29 rune identities in fixed coordinates by information alone, or equivalent state/event information. This is a lower bound, not sufficiency."
};
console.log(JSON.stringify(out,null,2));
