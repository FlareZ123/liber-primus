'use strict';
// Private-page prime-totient/MTF lexical key recovery; read-only Node22 CJS SFT.
const fs=require('node:fs'), path=require('node:path');
function experiment(g,lex,donor,lp,shakespeare,emerson,transcription){
 const gp=JSON.parse(g),mod=x=>(x%29+29)%29,id=Array.from({length:29},(_,i)=>i);
 const tr=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 const eq=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]),key=a=>String.fromCharCode(...a.map(x=>x+1));
 /** @param {string} s @returns {number[][]} */
 function words(s){return (s.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").match(/[A-Z]+/g)||[]).map(w=>{const a=[];for(let i=0;i<w.length;){const t=w.startsWith("ING",i)?{i:21,s:"ING"}:w.startsWith("IO",i)?{i:27,s:"IO"}:tr.find(t=>w.startsWith(t.s,i));if(!t)throw Error(w);a.push(t.i);i+=t.s.length}return a})}
 const native=words(donor.slice(donor.indexOf("Almustafa"),donor.indexOf("*** END OF")));
 const dict=new Map(),counts=Array(29).fill(1);
 function add(w,f){const k=key(w);dict.set(k,(dict.get(k)||0)+f)}
 for(const line of lex.split(/\r?\n/)){const m=/^([a-z]+)\s+(\d+)$/.exec(line);if(m){const w=words(m[1])[0];if(w)add(w,+m[2])}}
 for(const w of native.slice(0,Math.floor(native.length*.6))){add(w,1);for(const x of w)counts[x]++}
 const byLen=new Map();for(const [k,f] of dict){const a=Array.from(k,c=>c.charCodeAt(0)-1),L=a.length;let v=byLen.get(L);if(!v)byLen.set(L,v=[]);v.push({a,f})}
 for(const v of byLen.values())v.sort((a,b)=>b.f-a.f);
 const pri=[];for(let x=2;pri.length<1000;x++){let ok=true;for(let d=2;d*d<=x;d++)if(x%d===0){ok=false;break}if(ok)pri.push(mod(x-1))}
 const logp=counts.map(x=>Math.log(x/counts.reduce((s,v)=>s+v,0)));
 /** @param {number[]} a @param {boolean} decode @param {number[]} pi */
 function mtf(a,decode,pi=id){let L=pi.slice();return a.map(x=>{const j=decode?x:L.indexOf(x),v=L[j];L.splice(j,1);L.unshift(v);return decode?v:j})}
 /** @param {number[][]} w */
 function hung(w){const n=w.length;if(!n)return[];const u=Array(n+1).fill(0),v=u.slice(),p=u.slice(),way=u.slice();for(let i=1;i<=n;i++){p[0]=i;let j0=0;const minv=Array(n+1).fill(Infinity),used=Array(n+1).fill(false);do{used[j0]=true;const i0=p[j0];let d=Infinity,j1=0;for(let j=1;j<=n;j++)if(!used[j]){const cur=-w[i0-1][j-1]-u[i0]-v[j];if(cur<minv[j]){minv[j]=cur;way[j]=j0}if(minv[j]<d){d=minv[j];j1=j}}for(let j=0;j<=n;j++){if(used[j]){u[p[j]]+=d;v[j]-=d}else minv[j]-=d}j0=j1}while(p[j0]!==0);do{let j1=way[j0];p[j0]=p[j1];j0=j1}while(j0!==0)}const a=Array(n);for(let j=1;j<=n;j++)a[p[j]-1]=j-1;return a}
 /** @param {number[]} c @param {number[]} lens @param {number} beamWidth */
 function solve(c,lens,beamWidth=256){
  const a=mtf(c,true),n=c.length;
  let p=0,spans=lens.map(l=>{let lo=p;p+=l;return{lo,hi:p,L:l}});if(p!==n)throw Error("length");
  const training=spans.filter(w=>w.hi<=n*.70),end=training.at(-1).hi;
  const weights=id.map(()=>id.map(()=>0));for(let i=0;i<end;i++)for(const x of id)weights[a[i]][x]+=logp[mod(x-pri[i])];
  for(const w of training){
   const aa=a.slice(w.lo,w.hi);w.distinct=new Set(aa).size;w.cands=[];
   for(const d of byLen.get(w.L)||[]){
    const m=Array(29).fill(-1),iv=m.slice(),pairs=[];let ok=true;
    for(let i=0;i<w.L;i++){const x=aa[i],y=mod(d.a[i]+pri[w.lo+i]);if(m[x]>=0&&m[x]!==y||iv[y]>=0&&iv[y]!==x){ok=false;break}if(m[x]<0){pairs.push(x,y);m[x]=y;iv[y]=x}}
    if(ok)w.cands.push({pairs,f:d.f,score:w.L+.05*Math.log1p(d.f)});
   }
  }
  const order=training.filter(w=>w.cands.length).sort((a,b)=>Math.log1p(a.cands.length)/a.distinct-Math.log1p(b.cands.length)/b.distinct||b.L-a.L);
  let beam=[{m:Array(29).fill(-1),iv:Array(29).fill(-1),s:0}],maxStates=0;
  for(const w of order){
   const best=new Map();
   const keep=z=>{const k=key(z.m);const old=best.get(k);if(!old||z.s>old.s)best.set(k,z)};
   for(const state of beam){
    keep(state);
    for(const candidate of w.cands){
     const pairs=candidate.pairs;let ok=true,changed=false;
     for(let j=0;j<pairs.length;j+=2){const x=pairs[j],y=pairs[j+1];if(state.m[x]>=0&&state.m[x]!==y||state.iv[y]>=0&&state.iv[y]!==x){ok=false;break}if(state.m[x]<0)changed=true}
     if(!ok)continue;
     const m=changed?state.m.slice():state.m,iv=changed?state.iv.slice():state.iv;
     if(changed)for(let j=0;j<pairs.length;j+=2){m[pairs[j]]=pairs[j+1];iv[pairs[j+1]]=pairs[j]}
     keep({m,iv,s:state.s+candidate.score});
    }
   }
   maxStates=Math.max(maxStates,best.size);
   beam=Array.from(best.values()).sort((a,b)=>b.s-a.s).slice(0,beamWidth);
  }
  function complete(z){
   const m=z.m.slice(),rows=id.filter(i=>m[i]<0),cols=id.filter(i=>z.iv[i]<0),q=hung(rows.map(i=>cols.map(j=>weights[i][j])));for(let j=0;j<rows.length;j++)m[rows[j]]=cols[q[j]];return m;
  }
  function evaluate(pi){
   const out=a.map((x,i)=>mod(pi[x]-pri[i]));let score=0,known=0;
   for(const w of training){const v=out.slice(w.lo,w.hi),f=dict.get(key(v));score+=v.reduce((s,x)=>s+.12*logp[x],0);if(f){score+=w.L+.05*Math.log1p(f);known+=w.L}}
   return {pi,out,score,known}
  }
  const best=beam.map(complete).map(evaluate).sort((a,b)=>b.score-a.score)[0];
  const hold=spans.filter(w=>w.lo>=end),knownHold=hold.reduce((s,w)=>s+(dict.has(key(best.out.slice(w.lo,w.hi)))?w.L:0),0);
  if(!eq(mtf(best.out.map((x,i)=>mod(x+pri[i])),false,best.pi),c))throw Error("replay");
  return {...best,end,knownHold,holdLen:n-end,maxStates,dictSize:dict.size,candidates:training.map(w=>[w.L,w.distinct,w.cands.length]),display:spans.map(w=>best.out.slice(w.lo,w.hi).map(i=>gp.translit[i]).join("")).join(" ")};
 }
 const p57=words(lp.split("### 57\n")[1]);if(!eq(p57.flat(),gp.pages[57].indices))throw Error("p57");
 function donorWindow(ws,start,min){const out=[];let n=0;for(let i=start;n<min;i++){out.push(ws[i]);n+=ws[i].length}return out}
 const sh=words(shakespeare),em=words(emerson),koan=words(lp.split("### 14\n")[1].split("### 15\n")[0]);
 const samples=[["p57",p57],["Gibran-short",donorWindow(native,Math.floor(native.length*.75),76)],["Gibran-long",donorWindow(native,Math.floor(native.length*.82),262)],["Shakespeare-long",donorWindow(sh,Math.floor(sh.length*.75),262)],["Emerson-long",donorWindow(em,Math.floor(em.length*.80),231)],["LP1-koan",koan]];
 const results=[];
 for(let j=0;j<samples.length;j++){const [name,ws]=samples[j],p=ws.flat(),pi=id.map(i=>mod((7+2*j)*i+3+j));[pi[0],pi[9]]=[pi[9],pi[0]];const c=mtf(p.map((x,i)=>mod(x+pri[i])),false,pi);const z=solve(c,ws.map(w=>w.length));results.push({name,n:p.length,end:z.end,keyCorrect:z.pi.filter((x,i)=>x===pi[i]).length,trainCorrect:z.out.slice(0,z.end).filter((x,i)=>x===p[i]).length,holdCorrect:z.out.slice(z.end).filter((x,i)=>x===p[z.end+i]).length,holdLen:z.holdLen,trainLex:z.known,holdLex:z.knownHold,maxStates:z.maxStates,candidates:z.candidates,display:z.display})}
 // Long-page gate only. The short p57/Gibran plants diagnose insufficient information.
 const gate=results.filter(x=>x.n>=200).every(x=>x.holdCorrect/x.holdLen>=.90);
 const source=[],rmap=new Map(gp.runes.map((r,i)=>[r,i])),parts=transcription.split("%");parts.splice(50,0,"");
 if(parts.length!==58)throw Error("source physical pages");
 const sourceWords=parts.map((s,i)=>{
   const ws=(s.replace(/[/\r\n]/g,"").match(new RegExp("["+gp.runes.join("")+"]+","gu"))||[]).map(w=>Array.from(w,r=>rmap.get(r)));
   if(!eq(ws.flat(),gp.pages[i].indices))throw Error("source page "+i);return ws;
 });
 if(gate)for(const pg of [0,16,40]){
  const c=gp.pages[pg].indices,lens=sourceWords[pg].map(w=>w.length),z=solve(c,lens);
  source.push({pg,n:c.length,end:z.end,trainLex:z.known,holdLex:z.knownHold,holdLen:z.holdLen,pi:z.pi,score:z.score,display:z.display,maxStates:z.maxStates,candidates:z.candidates});
 }
 return {results,gate,source,dictSize:dict.size,nativeWords:native.length};
}
const files=["resources/liber-primus/lp2-corpus.json","resources/control/english_wordfreq_textblob.txt","resources/control/gibran_prophet_58585.txt","resources/liber-primus/lp1-plaintext-reference.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/liber-primus/lp2-transcription.txt"];
const data=files.map(f=>fs.readFileSync(path.resolve(__dirname,'..',f),'utf8'));
console.log(JSON.stringify(experiment(...data),null,2));
