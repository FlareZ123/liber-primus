'use strict';
const fs=require('node:fs'),path=require('node:path');
const files=["resources/liber-primus/lp2-corpus.json","resources/lp2-transcription.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt"];
const experiment=function experiment(raw,mode,lo,hi){
 const C=JSON.parse(raw[0]),N=JSON.parse(raw[2]),q=29,D=4,mod=x=>(x%q+q)%q,assert=(v,m)=>{if(!v)throw Error(m)};
 const inv=x=>{for(let k=1;k<q;k++)if(mod(k*x)===1)return k;throw Error("singular")},dot=(a,b)=>mod(a.reduce((s,x,i)=>s+x*b[i],0));
 const rref=(rows,n)=>{let A=rows.map(a=>a.slice()),p=0;for(let j=0;j<n;j++){let k=A.findIndex((a,i)=>i>=p&&a[j]);if(k<0)continue;[A[p],A[k]]=[A[k],A[p]];A[p]=A[p].map(x=>mod(x*inv(A[p][j])));for(let i=0;i<A.length;i++)if(i!==p){let v=A[i][j];if(v)A[i]=A[i].map((x,l)=>mod(x-v*A[p][l]))}p++}return{A,rank:p}};
 const inverse=M=>{let r=rref(M.map((a,i)=>[...a,...Array.from({length:D},(_,j)=>+(i===j))]),D);assert(r.rank===D,"singular basis");return r.A.map(a=>a.slice(D))};
 const parse=t=>t.split(new RegExp("[^"+C.runes.join("")+"]+","u")).filter(Boolean).map(w=>[...w].map(x=>C.runes.indexOf(x)));
 const toks=C.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 const gp=t=>(t.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").match(/[A-Z]+(?:['’][A-Z]+)*/g)||[]).map(w=>{w=w.replace(/['’]/g,"");let a=[];for(let i=0;i<w.length;){if(w.startsWith("ING",i)){a.push(21);i+=3}else if(w.startsWith("IO",i)){a.push(27);i+=2}else{let t=toks.find(x=>w.startsWith(x.s,i));assert(t,"unmapped");a.push(t.i);i+=t.s.length}}return a});
 const ow=parse(raw[1].split("%").slice(0,55).join("").replace(/[/\r\n]/g,"")),O=ow.flat(),native=N.sections.flatMap(s=>parse(s.source_text)),gw=gp(raw[3]);assert(ow.length===2896&&O.length===12956&&O.join(",")===C.pages.filter(p=>p.page<56).flatMap(p=>p.indices).join(","),"original source");
 const model=gw.slice(0,Math.floor(gw.length/2)).flat(),hist1=Array(q).fill(.5),hist2=Array.from({length:q},()=>Array(q).fill(.5));
 for(let i=0;i<model.length;i++){hist1[model[i]]++;if(i)hist2[model[i-1]][model[i]]++}
 const log1=hist1.map(x=>Math.log(x/(model.length+q*.5))),log2=hist2.map(a=>{let s=a.reduce((x,y)=>x+y,0);return a.map(x=>Math.log(x/s))});
 let rng=0x33010539;function random(){rng=(Math.imul(rng,1664525)+1013904223)>>>0;return rng}



 const lim=200000,composite=new Uint8Array(lim),pr=[];
 for(let p=2;p<lim;p++){if(composite[p])continue;pr.push(p);if(p*p<lim)for(let j=p*p;j<lim;j+=p)composite[j]=1}
 const pm=pr.map(p=>(p-1)%29);assert(pr[463]===3301,"prime rank");
 // Ciphertext-consumed feedback: plaintext F outputs F without clock or feedback update.
 function encode(P,s,K){let c=[],prev=0,t=s,u=inv(K[0]);for(let p of P){if(p===0){c.push(0);continue}let x=mod(u*(p-K[1]*prev-K[2]*pm[t++]-K[3]));c.push(x);prev=x}return c}
 const p56=C.pages.find(p=>p.page===56).indices,p56plain=parse(N.sections.find(s=>s.name==="p56_an_end").source_text).flat();
 assert(encode(p56plain,0,[1,0,28,0]).join(",")===p56.join(","),"p56 exact");
 const cut=C.pages.filter(p=>p.page<=39).reduce((s,p)=>s+p.indices.length,0);
 let start=Math.floor(gw.length/2),n=0,count=0,end=start;for(;end<gw.length;end++){let w=gw[end];if(w.length===1&&n>=3)count++;n+=w.length;if(count===68){end++;break}}
 const words=gw.slice(start,end+500),P=words.flat(),s0=137,K0=[13,2,17,9];
 const c=mode==="plant"?encode(P,s0,K0):O,stop=mode==="plant"?n:cut;
 const train=c.slice(0,stop),last=new Uint8Array(stop);let x=0,zeros=0;for(let i=0;i<stop;i++){last[i]=x;if(train[i])x=train[i];else zeros++}
 const prefix=train.indexOf(0);assert(prefix>=0,"zero needed");
 const max=2*(zeros+2),a=new Int32Array(max),z=new Int32Array(max),seen=new Uint32Array(max);
 let stamp=0,total=0,prefixReject=0,run=0,keys=[],maxDeath=0;
 const mul=Array.from({length:29},(_,j)=>Uint8Array.from({length:29},(_,k)=>j*k%29));
 // Normalized current coefficient 1; zero/nonzero unaffected by any nonzero scale.
 function test(s,b,d,e){
  let A=a,B=z,len=1;A[0]=0;
  let bb=mul[b],dd=mul[d];
  for(let i=prefix;i<stop;i++){
   const u=train[i],v=last[i],p=s+i;++stamp;let m=0;
   for(let j=0;j<len;j++){
    const w=A[j],h=w>>1,flag=w&1;
    if(!u){let k=w+2;if(seen[k]!==stamp){seen[k]=stamp;B[m++]=k}}
    const q=(u+(flag?0:bb[v])+dd[pm[p-h]]+e)%29;
    if(q!==0){let k=(h<<1)|(u===0?1:0);if(seen[k]!==stamp){seen[k]=stamp;B[m++]=k}}
   }
   if(!m){if(i>maxDeath)maxDeath=i;return false}
   let tmp=A;A=B;B=tmp;len=m;
  }return true
 }
 for(let s=lo;s<hi;s++)for(let b=0;b<29;b++)for(let d=0;d<29;d++){
   let mask=0x1fffffff;for(let i=0;i<prefix&&mask;i++)mask&=~(1<<mod(-train[i]-mul[b][last[i]]-mul[d][pm[s+i]]));
   total+=29;let k=0;for(;mask;mask&=mask-1){let e=31-Math.clz32(mask&-mask);k++;run++;if(test(s,b,d,e))keys.push({s,K:[1,b,d,e]})}prefixReject+=29-k;
 }
 // Exact feasibility candidate search followed by language-model Viterbi over hold histories.
 // Fit scale on training only. State tracks prime cursor, last consumed ciphertext, and previous plaintext.
 function decode(c,s,K,cut,trace){
  const initial={t:s,prev:0,p:-1,score:0,path:null};let states=new Map([["start",initial]]);
  for(let i=0;i<cut;i++){let u=c[i],next=new Map();for(let st of states.values()){
   const put=(p,t,prev)=>{let score=st.score+(st.p<0?log1[p]:log2[st.p][p]),id=t+","+prev+","+p,old=next.get(id);if(!old||score>old.score)next.set(id,{t,prev,p,score,path:trace?{p,prev:st.path}:null})};
   if(u===0)put(0,st.t,st.prev);
   let p=mod(K[0]*u+K[1]*st.prev+K[2]*pm[st.t]+K[3]);if(p!==0)put(p,st.t+1,u);
  }states=next;if(!states.size)return null}
  let best=[...states.values()].reduce((a,b)=>a.score>b.score?a:b),out=[];if(trace){for(let st=best.path;st;st=st.prev)out.push(st.p);out.reverse()}return {score:best.score,P:out}
 }
 let best=null;
 for(let {s,K} of keys)for(let scale=1;scale<29;scale++){let k=K.map(x=>mod(x*scale)),v=decode(c,s,k,stop,false);if(v&&(!best||v.score>best.score))best={s,K:k,score:v.score}}
 if(best){let v=decode(c,best.s,best.K,c.length,true);if(v){assert(encode(v.P,best.s,best.K).join(",")===c.join(","),"replay");best.fullScore=v.score;if(mode==="plant"){best.exact=v.P.filter((x,i)=>x===P[i]).length;best.holdExact=v.P.slice(stop).filter((x,i)=>x===P[stop+i]).length}}}
 return {mode,range:[lo,hi],total,prefixReject,run,prefix,maxDeath,cut:stop,keys,best,p56Exact:p56.length,...(mode==="plant"?{expected:P.length,holdExpected:P.length-stop,s0,K0}:{})}
};
console.log(JSON.stringify(experiment(files.map(f=>fs.readFileSync(path.resolve(__dirname,'..',f),'utf8')),process.argv[2]||'original',Number(process.argv[3]||0),Number(process.argv[4]||464)),null,2));
