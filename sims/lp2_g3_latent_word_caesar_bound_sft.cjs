"use strict";
const fs=require("node:fs"),path=require("node:path");
const paths=["resources/liber-primus/lp2-corpus.json","resources/transcriptions/lp2-image-corrected.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/control/english_wordfreq_textblob.txt","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];
function experiment(raw){
 const gp=JSON.parse(raw[0]),gold=JSON.parse(raw[2]),rune=new Map(gp.runes.map((x,i)=>[x,i])),mod=x=>(x%29+29)%29,key=w=>String.fromCharCode(...w.map(x=>65+x)),shape=w=>key(w.map(x=>mod(x-w[0]))),sum=w=>w.reduce((s,x)=>s+gp.prime[x],0)%29;
 const tokens=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
 function enc(w,alt){w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const p=[];for(let j=0;j<w.length;){const v=alt&&w.startsWith("ING",j)?{t:"ING",i:21}:alt&&w.startsWith("IO",j)?{t:"IO",i:27}:tokens.find(x=>w.startsWith(x.t,j));if(!v)return null;p.push(v.i);j+=v.t.length}return p}
 function native(t){const a=/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t),b=/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t);return (t.slice(a?a.index+a[0].length:0,b?b.index:t.length).match(/[A-Za-z]+/g)||[]).map(w=>enc(w,true)).filter(w=>w&&w.length<=14)}
 const donors=raw.slice(4).map(native),vocab=new Map();
 function add(w,f){if(w&&w.length&&w.length<=24){let k=key(w);vocab.set(k,Math.max(f,vocab.get(k)||0))}}
 for(const line of raw[3].split(/\r?\n/)){const m=/^([A-Za-z]+)\s+(\d+)$/.exec(line);if(m)for(const alt of [true,false])add(enc(m[1],alt),+m[2])}
 for(const ws of donors)for(const w of ws.slice(0,Math.floor(ws.length*.8)))add(w,1);
 for(const s of gold.sections)for(const w of s.source_text.match(/[\u16a0-\u16ff]+/g)||[])add(Array.from(w,c=>rune.get(c)),1);
 for(let i=0;i<29;i++)add([i],1);
 const sig=new Set([...vocab.keys()].map(k=>shape(Array.from(k,c=>c.charCodeAt(0)-65))));
 const tape=gp.pages.filter(p=>p.page<=55).flatMap(p=>p.indices),words=[];let w=[],nRune=0;
 for(const c of raw[1]){if(rune.has(c)){if(nRune===tape.length)break;w.push(rune.get(c));nRune++}else if("-.$&§".includes(c)&&w.length){words.push(w);w=[]}}if(w.length)words.push(w);
 if(words.flat().join(",")!==tape.join(",")||words.length!==2896)throw Error("source mismatch "+words.length);
 const starts=[0,3,8,15,23,27,33,40,54,56],offsets=starts.map(n=>gp.pages.slice(0,n).reduce((a,p)=>a+p.indices.length,0)),wordOffsets=[0];for(const w of words)wordOffsets.push(wordOffsets.at(-1)+w.length);
 function bound(C,lens){const N=C.length,h=Array(15).fill(0);for(const l of lens)h[l]++;const candidateCounts=Array(15).fill(0),candidateIntervals=[],edges=Array.from({length:N},()=>[]);
 for(let i=0;i<N;i++)for(let l=6;l<=14&&i+l<=N;l++)if(h[l]&&sig.has(shape(C.slice(i,i+l)))){candidateCounts[l]++;candidateIntervals.push([i,l]);edges[i].push(l)}
 const dp=new Int32Array(N+1);for(let i=N-1;i>=0;i--){dp[i]=dp[i+1];for(const l of edges[i])dp[i]=Math.max(dp[i],1+dp[i+l])}
 const long=lens.filter(l=>l>=6).length,byLengthUpper=candidateCounts.reduce((s,n,l)=>s+Math.min(n,h[l]),0),upper=Math.min(dp[0],byLengthUpper);
 return {runes:N,groups:lens.length,long,required:long-Math.floor(.05*lens.length),candidateCounts,byLengthUpper,disjointUpper:dp[0],minOov:Math.max(0,long-upper),candidateIntervals}}
 const whole=bound(tape,words.map(w=>w.length)),chapter=[];
 for(let j=0;j<9;j++){const a=offsets[j],b=offsets[j+1],aW=wordOffsets.indexOf(a),bW=wordOffsets.indexOf(b);if(aW<0||bW<0)throw Error("chapter carry");chapter.push({page:starts[j],...bound(tape.slice(a,b),words.slice(aW,bW).map(w=>w.length))})}
 function encode(ws,src,sgn){let shift=0,C=[];for(const p of ws){const c=p.map(x=>mod(x+sgn*shift));C.push(...c);shift=sum(src==="dw"?p:c)}return C}
 const logF=new Map([...vocab].map(([k,f])=>[k,Math.log(f+1)])),lf=Math.log([...vocab.values()].reduce((s,f)=>s+f+1,0));
 function solve(C,K,src,sgn){const N=C.length,dim=(N+1)*29,dp=new Float64Array((K+1)*dim);dp.fill(-Infinity);dp[0]=0;const trace=new Uint8Array(dp.length),pr=new Uint8Array(dp.length);
 const e=Array.from({length:N},(_,i)=>Array.from({length:29},(_,s)=>{let a=[],p=[],sumP=0,sumC=0;for(let l=1;l<=14&&i+l<=N;l++){const x=C[i+l-1],y=mod(x-sgn*s);p.push(y);sumC+=gp.prime[x];sumP+=gp.prime[y];const f=logF.get(key(p));a.push({next:(src==="dw"?sumP:sumC)%29,score:f===undefined?-18-l*3.5:f-lf})}return a}));
 for(let k=0;k<K;k++)for(let i=Math.max(k,N-14*(K-k));i<=Math.min(14*k,N-(K-k));i++)for(let s=0;s<29;s++){const v=dp[k*dim+i*29+s];if(!Number.isFinite(v))continue;for(let j=0;j<e[i][s].length;j++){const l=j+1,rem=N-i-l;if(rem<K-k-1||rem>14*(K-k-1))continue;const q=e[i][s][j],idx=(k+1)*dim+(i+l)*29+q.next,nv=v+q.score;if(nv>dp[idx]){dp[idx]=nv;trace[idx]=l;pr[idx]=s}}}
 let last=0;for(let s=1;s<29;s++)if(dp[K*dim+N*29+s]>dp[K*dim+N*29+last])last=s;const v=dp[K*dim+N*29+last];let i=N,ss=last,ws=[];
 for(let k=K;k>0;k--){const z=k*dim+i*29+ss,l=trace[z],old=pr[z];if(!l)throw Error("trace");ws.push(C.slice(i-l,i).map(x=>mod(x-sgn*old)));i-=l;ss=old}ws.reverse();
 if(encode(ws,src,sgn).join(",")!==C.join(","))throw Error("replay");return {score:v/N,ws,oov:ws.filter(w=>!vocab.has(key(w))).length}}
 function solveFree(C,src,sgn){
 const N=C.length,dp=new Float64Array((N+1)*29);dp.fill(-Infinity);dp[0]=0;const tr=new Uint8Array(dp.length),pr=new Uint8Array(dp.length);
 for(let i=0;i<N;i++)for(let s=0;s<29;s++){const v=dp[i*29+s];if(!Number.isFinite(v))continue;let sumP=0,sumC=0,p=[];for(let l=1;l<=24&&i+l<=N;l++){const x=C[i+l-1],y=mod(x-sgn*s);p.push(y);sumP+=gp.prime[y];sumC+=gp.prime[x];const next=(src==="dw"?sumP:sumC)%29,f=logF.get(key(p)),score=f===undefined?-18-l*3.5:f-lf,z=(i+l)*29+next;if(v+score>dp[z]){dp[z]=v+score;tr[z]=l;pr[z]=s;}}}
 let i=N,s=0;for(let j=1;j<29;j++)if(dp[N*29+j]>dp[N*29+s])s=j;const score=dp[N*29+s]/N,ws=[];
 while(i){const z=i*29+s,l=tr[z],old=pr[z];if(!l)throw Error("free trace");ws.push(C.slice(i-l,i).map(x=>mod(x-sgn*old)));i-=l;s=old}ws.reverse();
 if(encode(ws,src,sgn).join(",")!==C.join(","))throw Error("free replay");
 return {score,ws,oov:ws.filter(w=>!vocab.has(key(w))).length};
}
const controls=[],freeControls=[];for(let j=0;j<3;j++){const ws=[];let n=0;for(const w of donors[j].slice(Math.floor(donors[j].length*.85))){if(n+w.length>262)break;ws.push(w);n+=w.length}const printed=ws.map(w=>w.length).reverse();
 for(const src of ["dw","cw"]){const sgn=j===1?-1:1,C=encode(ws,src,sgn),res=[-1,1].map(sign=>({sign,...solve(C,printed.length,src,sign)})).sort((a,b)=>b.score-a.score),best=res[0],P=ws.flat(),correct=best.ws.flat().filter((x,i)=>x===P[i]).length;const bounds=arr=>{let n=0;return new Set(arr.map(w=>(n+=w.length)))};const truth=bounds(ws),pred=bounds(best.ws),F1=2*[...truth].filter(x=>pred.has(x)).length/(truth.size+pred.size);const freer=[-1,1].map(sign=>({sign,...solveFree(C,src,sign)})).sort((a,b)=>b.score-a.score)[0],fb=bounds(freer.ws);freeControls.push({donor:j,src,sign:freer.sign,trueSign:sgn,n,correct:freer.ws.flat().filter((x,i)=>x===P[i]).length,groups:freer.ws.length,truthGroups:ws.length,F1:2*[...truth].filter(x=>fb.has(x)).length/(truth.size+fb.size),score:freer.score,oov:freer.oov});controls.push({donor:j,src,trueSign:sgn,selectedSign:best.sign,n,groups:ws.length,correct,F1,score:best.score,oov:best.oov,truthOov:ws.filter(w=>!vocab.has(key(w))).length,hiddenLengthOrderChanged:printed.join(",")!==ws.map(w=>w.length).join(","),relaxedBound:bound(C,printed),freeBound:freeBound(C,printed.length),recovered:best.ws.map(w=>w.map(x=>gp.translit[x]).join("")).join(" ")})}}
 function freeBound(C,K){
 const N=C.length, caps=[14,24],out=[];
 for(const cap of caps){
  const dp=new Int32Array(N+1),counts=Array(cap+1).fill(0);
  for(let i=N-1;i>=0;i--){dp[i]=dp[i+1];for(let l=4;l<=cap&&i+l<=N;l++)if(sig.has(shape(C.slice(i,i+l)))){counts[l]++;dp[i]=Math.max(dp[i],l-3+dp[i+l]);}}
  const B=Math.floor(.05*K),max=3*K+(cap-3)*B+dp[0],min=Math.max(0,Math.ceil((N-3*K-dp[0])/(cap-3)));
  out.push({cap,K,N,candidateCounts:counts,maxGain:dp[0],allowedOov:B,maxRunes:max,minOov:min,excludes:max<N});
 }
 return out;
}
const free={whole:freeBound(tape,words.length),chapter:chapter.map((c,j)=>({page:c.page,bounds:freeBound(tape.slice(offsets[j],offsets[j+1]),c.groups)})),controls:controls.map(c=>({donor:c.donor,src:c.src,bounds:c.freeBound}))};
const freeOriginal=[];
 if(freeControls.every(c=>c.correct/c.n>=.95&&c.F1>=.90&&c.sign===c.trueSign)){
  for(const src of ["dw","cw"]){
   const p0=gp.pages[0].indices;
   const selected=[-1,1].map(sign=>({sign,...solveFree(p0,src,sign)})).sort((a,b)=>b.score-a.score)[0];
   for(let p=0;p<=5;p++){const C=gp.pages[p].indices,x=p===0?selected:solveFree(C,src,selected.sign);freeOriginal.push({page:p,src,sign:selected.sign,n:C.length,groups:x.ws.length,oov:x.oov,score:x.score,plaintext:x.ws.map(w=>w.map(q=>gp.translit[q]).join("")).join(" "),runeGroups:x.ws});}
  }
 }
 return {vocab:vocab.size,shapes:sig.size,whole,chapter,controls,free,freeControls,freeOriginal};
}
console.log(JSON.stringify(experiment(paths.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8"))),null,2));
