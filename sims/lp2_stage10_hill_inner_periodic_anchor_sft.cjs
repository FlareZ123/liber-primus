"use strict";
// Generalized source-fixed inner Stage10 Hill + outer authentic F-hold q8/q13.
// Adds full-rank single-anchor recovery and distinct historical periods/sections.
// Node 22: node sims/lp2_stage10_hill_inner_periodic_anchor_sft.cjs [original|control1|control4] [8|13] [0|1|2]
const fs=require("node:fs"),path=require("node:path");
const {inverse,transform}=require("./lp2_stage10_hill_outer_fhold_gate_sft.cjs");
const files=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/control/english_wordfreq_textblob.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/transcriptions/lp1_wulfic_canonical.txt","sims/lp2_p23_26_six_anchor_inverse_sft.cjs","resources/cicada2014-openpuff-magic-squares.txt"];
let q=13,n=5,all=(1<<q)-1;const mod=x=>(x%29+29)%29;
const ok=(v,m)=>{if(!v)throw Error(m)};
const equal=(a,b)=>String(a)===String(b);
const chars=a=>String.fromCharCode(...a.map(x=>65+x));
function canonical(k){let s=chars(k);for(let i=1;i<q;i++){const t=chars(k.slice(i).concat(k.slice(0,i)));if(t<s)s=t;}return s;}
function encode(P,K){let j=0;return P.map(p=>p===0?0:mod(p+K[j++%q]));}
function legalStarts(C,K){const km=Array(29).fill(0);for(let i=0;i<q;i++)km[K[i]]|=1<<i;let m=all;
 for(let j=C.length-1;j>=0;j--){const c=C[j],back=((m>>>1)|((m&1)<<(q-1)))&~km[c];m=c===0?m|back:back;if(!m)break;}return m;}
/** Row-reduce a linear system, keeping the row operations as a left multiplier.
 * @param {number[][]} H */
function reduce(H){const m=H.length,A=H.map((row,i)=>row.concat(Array.from({length:m},(_,j)=>+(i===j))));let rank=0;
 for(let j=0;j<q;j++){let p=rank;while(p<m&&!A[p][j])p++;if(p===m)continue;[A[rank],A[p]]=[A[p],A[rank]];
  let inv=1;while(mod(A[rank][j]*inv)!==1)inv++;A[rank]=A[rank].map(v=>mod(v*inv));
  for(let i=0;i<m;i++)if(i!==rank){const v=A[i][j];if(v)A[i]=A[i].map((x,k)=>mod(x-v*A[rank][k]));}rank++;}
 return {rank,T:A.map(row=>row.slice(q))};}
/** @param {number[]} C @param {number[][]} words @param {number[][]} I @param {number} fit */
function anchors(C,words,I,fit){
 const U=transform(I,C.slice(0,fit));let off=0;const A=[];
 for(let w of words){const a=off;off+=w.length;if(off>fit)break;if(w.length<8)continue;
  const lo=n*Math.floor(a/n),hi=n*Math.ceil(off/n);if(hi>fit||C.slice(lo,hi).includes(0))continue;
  const H=[];for(let i=a;i<off;i++){const row=Array(q).fill(0),block=n*Math.floor(i/n);
   for(let k=0;k<n;k++){const j=(block-lo+k)%q;row[j]=mod(row[j]+I[i%n][k]);}H.push(row);}
  A.push({off:a,lo,hi,len:w.length,H,U:U.slice(a,off)});
 }
 return A.sort((a,b)=>b.len-a.len||a.off-b.off).slice(0,6).sort((a,b)=>a.off-b.off);
}
/** Project dictionary words through a left-nullspace signature. */
function records(a,dict,T,start,end,sign){const out=[];for(const p of dict[a.len].values()){
 const z=p.map((v,i)=>mod(a.U[i]-v)),sig=T.map(row=>{let s=0;for(let j=start;j<end;j++)s+=row[j]*z[j-start];return mod(sign*s);});
 out.push({z,s:chars(sig)});}return out;}
function candidateKeys(C,A,dict){
 const keys=new Set(),cases=[];let joins=0,singleJoins=0;
 // A single word can determine all q digits when its row rank is q.
 // Require two surplus equations to keep the candidate pool discriminating.
 for(const a of A)if(a.len>=q+2){
   const {rank,T}=reduce(a.H);if(rank!==q)continue;
   for(const p of dict[a.len].values()){
     const z=p.map((v,i)=>mod(a.U[i]-v)),y=T.map(row=>mod(row.reduce((s,v,i)=>s+v*z[i],0)));
     if(y.slice(q).some(Boolean))continue;
     const k=y.slice(0,q);ok(a.H.every((row,i)=>mod(row.reduce((s,v,j)=>s+v*k[j],0))===z[i]),"single solve");
     keys.add(canonical(k));singleJoins++;
   }
 }
 for(let i=0;i<A.length;i++)for(let j=i+1;j<A.length;j++){const a=A[i],b=A[j];if(a.hi>b.lo||a.len+b.len<q+4)continue;
  const gap=C.slice(a.lo,b.lo).filter(x=>x===0).length,phases=new Set();for(let h=0;h<=Math.min(q-1,gap);h++)phases.add(((b.lo-a.lo-h)%q+q)%q);
  for(const phase of phases){const H=a.H.concat(b.H.map(row=>row.map((_,k)=>row[(k-phase+q)%q]))),{rank,T}=reduce(H);
   const info={a:a.off,b:b.off,phase,rank,joins:0};cases.push(info);if(rank<q)continue;
   const L=T.slice(q),map=new Map();
   for(const x of records(a,dict,L,0,a.len,1)){let v=map.get(x.s);if(!v)map.set(x.s,v=[]);v.push(x.z);}
   for(const y of records(b,dict,L,a.len,a.len+b.len,-1))for(const x of map.get(y.s)||[]){
    const z=x.concat(y.z),key=T.slice(0,q).map(row=>mod(row.reduce((s,v,i)=>s+v*z[i],0)));
    ok(H.every((row,i)=>mod(row.reduce((s,v,j)=>s+v*key[j],0))===z[i]),"bad linear join");
    keys.add(canonical(key));info.joins++;joins++;
   }
  }
 }
 const legal=[];for(const key of keys){const K=Array.from(key,x=>x.charCodeAt(0)-65),starts=legalStarts(C,K);if(starts)legal.push({K,starts});}
 return {keys,legal,cases,joins,singleJoins};
}
function languageModel(sections,excluded){const uni=Array(29).fill(.2),bi=Array.from({length:29},()=>Array(29).fill(.1)),tri=Array.from({length:841},()=>Array(29).fill(.05));
 for(let j=0;j<sections.length;j++)if(j!==excluded){const P=sections[j].flat();for(let i=0;i<P.length;i++){uni[P[i]]++;if(i)bi[P[i-1]][P[i]]++;if(i>1)tri[P[i-2]*29+P[i-1]][P[i]]++;}}
 const prob=row=>{const sum=row.reduce((a,b)=>a+b);return row.map(x=>x/sum);};const u=prob(uni),b=bi.map(prob),t=tri.map(prob);
 return (a,c,d)=>Math.log(a<0?(c<0?u[d]:.7*b[c][d]+.3*u[d]):.55*t[a*29+c][d]+.35*b[c][d]+.1*u[d]);}
/** Given a full key, exact Viterbi over legal F paths with fixed Hill block inverse. */
function decode(C,K,I,LM,starts,context=[-1,-1]){
 let S=new Map();for(let j=0;j<q;j++)if(starts&(1<<j))S.set([j,...context].join(","),{phase:j,a:context[0],b:context[1],score:0,prev:null,p:null,start:j});
 for(let off=0;off<C.length;off+=n){const T=new Map(),options=new Map();
  for(const v of S.values()){let opts=options.get(v.phase);if(!opts){opts=[];const buf=[];function rec(i,j){if(i===n){opts.push({end:j,p:transform(I,buf)});return;}const c=C[off+i];if(c===0){buf.push(0);rec(i+1,j);buf.pop();}const u=mod(c-K[j]);if(u!==0){buf.push(u);rec(i+1,(j+1)%q);buf.pop();}}rec(0,v.phase);options.set(v.phase,opts);}
   for(const o of opts){let a=v.a,b=v.b,score=v.score;for(const p of o.p){score+=LM(a,b,p);a=b;b=p;}const tag=[o.end,a,b].join(","),old=T.get(tag);if(!old||score>old.score)T.set(tag,{phase:o.end,a,b,score,prev:v,p:o.p,start:v.start});}
  }S=T;if(!S.size)return null;
 }
 let best=null;for(const v of S.values())if(!best||v.score>best.score)best=v;
 const blocks=[];for(let v=best;v&&v.p;v=v.prev)blocks.push(v.p);
 return {P:blocks.reverse().flat(),score:best.score,phase:best.phase,start:best.start,context:[best.a,best.b]};
}
function run(inputs,mode="original",period=8,section=0){
 q=period;all=(1<<q)-1;ok(q===8||q===13,"period");ok([0,1,2].includes(section),"section");
 const src=inputs[7],start=src.indexOf(" const [gp,trans,lex,native]"),end=src.indexOf(" function chars(");
 const build=new Function("inputs",src.slice(start,end)+"\\nreturn {gp,originalWords,solved,buildLexicon};"),{gp,originalWords,solved,buildLexicon}=build(inputs);
 const matrices=inputs[8].trim().split(/\\r?\\n\\s*\\r?\\n/).map(s=>s.trim().split(/\\r?\\n/).map(s=>s.trim().split(/\\s+/).map(Number))),M=matrices[section],I=inverse(M);n=M.length;
 let C,words,P=null,secret=null,fit,excluded=-1;
 if(mode==="original"){
  const spec=[[3,7,null,0,1145],[8,22,15,20,3612],[23,26,23,16,1005]][section],[lo,hi,skipPage,skip,expected]=spec;
  const offPage=i=>gp.pages.slice(0,i).reduce((s,p)=>s+p.indices.length,0),beg=offPage(lo),end=offPage(hi+1),ex0=skipPage===null?-1:offPage(skipPage),ex1=ex0+skip;
  let off=0;words=originalWords.filter(w=>{const i=off;off+=w.length;return i>=beg&&off<=end&&(skipPage===null||off<=ex0||i>=ex1);});
  C=words.flat();const fixed=gp.pages.slice(lo,hi+1).flatMap(p=>p.indices.slice(p.page===skipPage?skip:0));
  ok(C.length===expected&&equal(C,fixed),"whole groups and exact source spans");fit=n*Math.floor(500/n);
 }else{
  excluded=Number(mode.slice(7));words=solved[excluded];P=words.flat().slice(0,Math.floor(words.flat().length/n)*n);secret=Array.from({length:q},(_,j)=>mod(j*j+7*j+3*excluded+11+section));C=encode(transform(M,P),secret);fit=n*Math.floor((excluded===1?350:500)/n);
 }
 const dict=buildLexicon(excluded),prefix=C.slice(0,fit),A=anchors(prefix,words,I,fit),candidates=candidateKeys(prefix,A,dict);
 let oracle=secret?candidates.keys.has(canonical(secret)):null;
 const LM=languageModel(solved,excluded);let selected=null;for(const item of candidates.legal){const d=decode(prefix,item.K,I,LM,item.starts);ok(d,"legal key no decode");
  if(!selected||d.score>selected.score)selected={...d,K:item.K};}
 let hold=null;if(selected){hold=decode(C.slice(fit),selected.K,I,LM,1<<selected.phase,selected.context);
  const rot=selected.K.slice(selected.start).concat(selected.K.slice(0,selected.start));
  ok(equal(encode(transform(M,selected.P),rot),prefix),"prefix replay");
  if(hold)ok(equal(encode(transform(M,selected.P.concat(hold.P)),rot),C),"full replay");
 }
 const view=d=>d?{scorePerRune:d.score/d.P.length,plaintext:chars(d.P),translit:d.P.map(x=>gp.translit[x]).join(" "),phase:d.phase}:null;
 return {mode,period:q,section,blockSize:n,length:C.length,fit,holdout:C.length-fit,dictSize:dict.reduce((s,x)=>s+x.size,0),anchors:A.map(a=>({off:a.off,len:a.len,lo:a.lo,hi:a.hi,dict:dict[a.len].size,actual:secret?dict[a.len].has(String(P.slice(a.off,a.off+a.len))):null})),phaseCases:candidates.cases.length,rankHistogram:candidates.cases.reduce((s,x)=>(s[x.rank]=(s[x.rank]||0)+1,s),{}),joins:candidates.joins,singleJoins:candidates.singleJoins,keyClasses:candidates.keys.size,legalClasses:candidates.legal.length,oracleKeyInPool:oracle,selectedKey: selected?selected.K.slice(selected.start).concat(selected.K.slice(0,selected.start)):null,expectedKey:secret,prefix:view(selected),prediction:view(hold),prefixCorrect:P&&selected?selected.P.filter((p,i)=>p===P[i]).length:null,holdoutCorrect:P&&hold?hold.P.filter((p,i)=>p===P[fit+i]).length:null};
}
if(require.main===module)console.log(JSON.stringify(run(files.map(p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8")),process.argv[2]||"original",Number(process.argv[3]||8),Number(process.argv[4]||0)),null,2));
module.exports={run,files};
