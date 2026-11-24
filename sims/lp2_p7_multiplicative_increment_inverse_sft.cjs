"use strict";
// Agent 11: exact multiplicative-increment additive-state inverse; all bank lexical and fixed source spacing-free prediction.
const fs=require("node:fs"),path=require("node:path");
const paths=[
  "resources/liber-primus/lp2-corpus.json",
  "resources/liber-primus/lp2-transcription.txt",
  "resources/external/relikd-solved-gp29-native-v1.json",
  "resources/control/english_wordfreq_textblob.txt",
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/shakespeare_first300k.txt",
  "resources/control/emerson_essays_2944.txt",
  "resources/control/blake_song_of_liberty_train.txt"
];
function experiment(corpus,transcript,solved,lexicalSources){
 const mod=x=>(x%29+29)%29,idx=new Map(corpus.runes.map((r,i)=>[r,i])),check=(x,m)=>{if(!x)throw Error(m)};
 const inv=Array.from({length:29},(_,a)=>a?Array.from({length:28},(_,i)=>i+1).find(b=>a*b%29===1):0);
 const pop=x=>{let n=0;while(x){x&=x-1;n++}return n};
 let words=[],w=[],off=0,start=0;for(const c of transcript.split("%").slice(0,55).join("%")){if(idx.has(c)){if(!w.length)start=off;w.push(idx.get(c));off++}else if(c!=="%"&&c!=="/"&&!/\s/u.test(c)&&w.length){words.push({start,w});w=[]}}if(w.length)words.push({start,w});
 const tape=corpus.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);check(words.length===2896&&JSON.stringify(tape)===JSON.stringify(words.flatMap(x=>x.w)),"source");
 let i=0;const bounds=corpus.pages.filter(p=>p.page<=55).map(p=>{let a=i;i+=p.indices.length;return{page:p.page,start:a,end:i}});
 const p7=bounds.find(x=>x.page===7),p8=bounds.find(x=>x.page===8),p14=bounds.find(x=>x.page===14),begin=p8.start+12,end=p14.end,split=begin+1024;
 const R=words.filter(x=>x.start>=p7.end-14&&x.start+x.w.length<=p7.end).map(x=>x.w.reduce((a,b)=>a*b%29,1));check(JSON.stringify(R)==="[11,26,8,15,2]","products");check(end-begin===1717,"body span");const reciprocal=R.map(a=>inv[a]);
 const native=solved.sections.map(s=>({name:s.name,words:(s.source_text.match(/[\u16a0-\u16ff]+/gu)||[]).map(w=>[...w].map(x=>idx.get(x)))}));
 const tokens=corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function encode(word){const s=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const a=[];for(let i=0;i<s.length;){if(s.startsWith("ING",i)){a.push(21);i+=3}else if(s.startsWith("IO",i)){a.push(27);i+=2}else{const t=tokens.find(t=>s.startsWith(t.s,i));check(t,"encode");a.push(t.i);i+=t.s.length}}return a}
 const lit=lexicalSources.map((t,i)=>({i,words:(t.match(/[A-Za-z]+/g)||[]).map(encode)}));
 const lexBase=new Map();function add(map,w){if(w.length<8)return;let m=map.get(w.length);if(!m)map.set(w.length,m=new Map());m.set(w.join(","),w)}
 for(const s of lit)for(const w of s.words)add(lexBase,w);
 function lexicon(exclude){const map=new Map([...lexBase].map(([k,v])=>[k,new Map(v)]));for(const s of native)if(s.name!==exclude)for(const w of s.words)add(map,w);return new Map([...map].map(([k,v])=>[k,[...v.values()]]))}
 const masks=[],ids=new Map(),asMask=a=>a.reduce((m,x)=>m|(1<<(x-1)),0),asList=m=>Array.from({length:28},(_,i)=>i+1).filter(x=>m&(1<<(x-1)));
 function expand(m,first,left,visit){if(left===0){visit(m);return}for(let j=first;j<28;j++)if(!(m&(1<<j)))expand(m|(1<<j),j+1,left-1,visit)}
 expand(0,0,5,m=>{ids.set(m,masks.length);masks.push(m)});check(masks.length===98280,"all five banks");
 function need(c,p,hold){let m=0,prev=0;for(let i=0;i<p.length;i++){if(hold&&p[i]===0){if(c[i]!==0)return -1;continue}const k=mod(c[i]-p[i]);if(k===0)return -1;if(prev){m|=1<<((k*inv[prev]%29)-1);if(pop(m)>5)return -1}prev=k}return m}
 function support(ws,hold,lex,truth=null){
   const training=new Uint16Array(masks.length),test=new Uint16Array(masks.length),mark=new Uint16Array(masks.length),n=ws.length,stats=[];
   for(let j=0;j<n;j++){const {w:c,held}=ws[j],pats=new Set();for(const p of lex.get(c.length)||[]){let m=need(c,p,hold);if(m>=0)pats.add(m)}
     let keyCount=0;for(const m of pats)expand(m,0,5-pop(m),key=>{const id=ids.get(key);check(id!==undefined,"mask id");if(mark[id]===j+1)return;mark[id]=j+1;(held?test:training)[id]++;keyCount++});stats.push({start:ws[j].start,length:c.length,held,compatibleBanks:keyCount});
   }
   let best=-1,first=-1,ties=0,min=Infinity,max=-Infinity,fullBest=-1,fullTies=0,fullFirst=-1;
   for(let j=0;j<masks.length;j++){let a=training[j],b=test[j];if(a>best){best=a;first=j;ties=1;min=max=b}else if(a===best){ties++;min=Math.min(min,b);max=Math.max(max,b)}if(a+b>fullBest){fullBest=a+b;fullTies=1;fullFirst=j}else if(a+b===fullBest)fullTies++}
   const selected=masks[first],sourceId=ids.get(asMask(R)),recipId=ids.get(asMask(reciprocal)),truthId=truth?ids.get(asMask(truth)):null;
   return{hold,trainN:ws.filter(x=>!x.held).length,heldoutN:ws.filter(x=>x.held).length,trainingBest:best,trainingTies:ties,selected:asList(selected),selectedHeldout:test[first],trainingTiesHeldoutRange:[min,max],fullBest,fullTies,fullFirst:asList(masks[fullFirst]),source:[training[sourceId],test[sourceId]],reciprocal:[training[recipId],test[recipId]],truth,truthTrain:truth?training[truthId]:null,truthTest:truth?test[truthId]:null,truthWinner:truth?training[truthId]===best:null,stats};
 }
 function random(seed){let z=seed>>>0;return()=>{z^=z<<13;z^=z>>>17;z^=z<<5;return z>>>0}}
 function plant(p,bank,hold,seed){const rng=random(seed),c=[],kpath=[];let k=1+rng()%28;for(let i=0;i<p.length;i++){if(hold&&p[i]===0){c.push(0);kpath.push(k);continue}const prev=k;let next=prev*bank[rng()%5]%29,v=mod(p[i]+next);if(i&&v===c.at(-1)){next=prev*bank[rng()%5]%29;v=mod(p[i]+next)}k=next;c.push(v);kpath.push(k)}checkReplay(c,p,kpath,bank,hold);return{c,kpath}}
 function checkReplay(c,p,ks,bank,hold){check(c.length===p.length&&p.length===ks.length,"replay length");for(let i=0;i<c.length;i++){check(ks[i]>0&&ks[i]<29,"nonzero key");if(hold&&p[i]===0){check(c[i]===0&&(!i||ks[i]===ks[i-1]),"literal F replay")}else{check(c[i]===mod(p[i]+ks[i]),"cipher replay");if(i)check(bank.includes(ks[i]*inv[ks[i-1]]%29),"increment replay")}}}
 const originalWords=words.filter(x=>x.start>=begin&&x.start+x.w.length<=end&&x.w.length>=8&&(x.start+x.w.length<=split||x.start>=split)).map(x=>({...x,held:x.start>=split}));
 const out={source:R,reciprocal,banks:masks.length,begin,end,split,lexical:{controls:[],original:[]},spacingFree:{controls:[],original:[]}};
 // First recover unknown banks on two independent native solved controls.
 for(const [name,bank,hold,seed] of [["0_welcome",[1,3,7,19,24],false,330101],["0_loss_of_divinity",[2,6,12,17,28],true,330102]]){
   const s=native.find(x=>x.name===name),p=s.words.flat(),pl=plant(p,bank,hold,seed),cut=Math.floor(p.length*.65);let off=0,ws=[],known=[];
   for(const w of s.words){if(w.length>=8&&(off+w.length<=cut||off>=cut)){ws.push({start:off,w:pl.c.slice(off,off+w.length),held:off>=cut});known.push(w)}off+=w.length}
   const lex=lexicon(name),r=support(ws,hold,lex,bank);r.name=name;
   const key=asMask(r.selected);r.trueWordsAdmitted=known.filter((p,i)=>{const m=need(ws[i].w,p,hold);return m>=0&&(m&key)===m}).length;
   r.trueWithheldAdmitted=known.filter((p,i)=>{const m=need(ws[i].w,p,hold);return ws[i].held&&m>=0&&(m&key)===m}).length;
   r.nativeWordsInLexicon=known.filter(p=>(lex.get(p.length)||[]).some(q=>q.join(",")===p.join(","))).length;
   out.lexical.controls.push(r);
 }
 for(const hold of [false,true])out.lexical.original.push(support(originalWords,hold,lexicon(null)));
 // Native trigram model: donor excluded; train on 40k GP runes from each other literary source and solved sections.
 function language(excludeLit){
   const u=new Float64Array(29),b=new Float64Array(29*29),t=new Float64Array(29**3),bs=new Float64Array(29),ts=new Float64Array(29*29);let n=0;
   function train(s){for(let i=0;i<s.length;i++){const p=s[i];u[p]++;n++;if(i){let a=s[i-1];b[a*29+p]++;bs[a]++}if(i>1){let q=s[i-2]*29+s[i-1];t[q*29+p]++;ts[q]++}}}
   for(const s of lit)if(s.i>0&&s.i!==excludeLit)train(s.words.flat().slice(4096,44096));for(const s of native)train(s.words.flat());
   const U=Float64Array.from(u,x=>(x+.5)/(n+14.5)),B=new Float64Array(29*29),T=new Float64Array(29**3);
   for(let a=0;a<29;a++)for(let p=0;p<29;p++)B[a*29+p]=(b[a*29+p]+20*U[p])/(bs[a]+20);
   for(let a=0;a<29;a++)for(let q=0;q<29;q++)for(let p=0;p<29;p++){let h=a*29+q;T[h*29+p]=(t[h*29+p]+12*B[q*29+p])/(ts[h]+12)}
   return{U,B,T}
 }
 const size=29**3,code=(k,a,b)=>(k*29+a)*29+b;
 function decode(c,bank,hold,lm,truth=null){
   const inBank=new Set(bank),cut=1024,repeat=86/12901;let f=new Float64Array(size),g=new Float64Array(size),v=new Float64Array(size),z=new Float64Array(size),parent=new Int32Array(size),active=[],next=[],hist=[],gain=[0,0],ll=[0,0],maxActive=0;v.fill(-Infinity);z.fill(-Infinity);
   function add(k,a,b,w,prev,score){const j=code(k,a,b);if(g[j]===0)next.push(j);g[j]+=w;if(score>z[j]){z[j]=score;parent[j]=prev}}
   function finish(i){let s=0;for(const j of next)s+=g[j];check(s>0,"no forward probability");const llv=Math.log(s);ll[+(i>=cut)]+=llv;gain[+(i>=cut)]+=llv-Math.log(i?(c[i]===c[i-1]?repeat:(1-repeat)/28):1/29);for(const j of next)g[j]/=s;hist.push({ids:Int32Array.from(next),parents:Int32Array.from(next,j=>parent[j])});for(const j of active){f[j]=0;v[j]=-Infinity}let a=f;f=g;g=a;a=v;v=z;z=a;active=next;next=[];maxActive=Math.max(maxActive,active.length)}
   for(let k=1;k<29;k++){const p=mod(c[0]-k);if(!hold||p!==0){let w=lm.U[p]/28;add(k,0,p,w,-1,Math.log(w))}if(hold&&c[0]===0){let w=lm.U[0]/28;add(k,0,0,w,-1,Math.log(w))}}
   finish(0);
   for(let i=1;i<c.length;i++){
    for(const id of active){let b=id%29,a=Math.floor(id/29)%29,k=Math.floor(id/841),prevP=f[id],prevV=v[id];const lp=p=>i===1?lm.B[b*29+p]:lm.T[(a*29+b)*29+p];
     if(hold&&c[i]===0){let w=lp(0);add(k,b,0,prevP*w,id,prevV+Math.log(w))}
     for(const r of bank){const nk=k*r%29,p=mod(c[i]-nk);if(hold&&p===0)continue;const r0=mod(c[i-1]-p)*inv[k]%29,em=c[i]===c[i-1]?1/25:(inBank.has(r0)?6/25:1/5),w=lp(p)*em;add(nk,b,p,prevP*w,id,prevV+Math.log(w))}
    }
    finish(i);
   }
   let id=active.reduce((a,b)=>v[a]>=v[b]?a:b),p=new Array(c.length),ks=new Array(c.length);
   for(let i=c.length-1;i>=0;i--){p[i]=id%29;ks[i]=Math.floor(id/841);const h=hist[i],j=h.ids.indexOf(id);check(j>=0,"traceback");id=h.parents[j]}
   checkReplay(c,p,ks,bank,hold);
   return{bank,hold,fitN:cut,heldoutN:c.length-cut,fitGain:gain[0]/cut,heldoutGain:gain[1]/(c.length-cut),fitLogLik:ll[0],heldoutLogLik:ll[1],maxActive,replay:c.length,mapPrefix:p.slice(0,80).map(x=>corpus.translit[x]).join(" "),mapExact:truth?p.filter((x,i)=>x===truth[i]).length:null,mapHeldoutExact:truth?p.slice(cut).filter((x,i)=>x===truth[i+cut]).length:null};
 }
 // Check that the exact redraw transition law is normalized for every possible prior state and plaintext.
 for(const bank of [R,reciprocal])for(let k=1;k<29;k++)for(let p=0;p<29;p++)for(let old=0;old<29;old++){let s=0;const r0=mod(old-p)*inv[k]%29;for(const r of bank){const c=mod(p+k*r%29);s+=c===old?1/25:(bank.includes(r0)?6/25:1/5)}check(Math.abs(s-1)<1e-12,"transition normalization")}
 for(const [i,hold,bank,seed] of [[1,false,R,330103],[3,true,reciprocal,330104]]){
   const p=lit[i].words.flat().slice(4096,4096+1717),pl=plant(p,bank,hold,seed),r=decode(pl.c,bank,hold,language(i),p);r.donor=i;out.spacingFree.controls.push(r)
 }
 const orig=tape.slice(begin,end),lm=language(-1);
 for(const hold of [false,true])for(const bank of [R,reciprocal])out.spacingFree.original.push(decode(orig,bank,hold,lm));
 return out;
}
const data=paths.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8"));
console.log(JSON.stringify(experiment(JSON.parse(data[0]),data[1],JSON.parse(data[2]),data.slice(3)),null,2));
