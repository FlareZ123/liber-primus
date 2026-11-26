"use strict";
const fs=require("node:fs"),path=require("node:path");
const paths=["resources/liber-primus/lp2-corpus.json","resources/control/shakespeare_first300k.txt","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt"];
function experiment(raw,opts={}){
 const gp=JSON.parse(raw[0]),M=29,mod=x=>(x%M+M)%M;
 const tokens=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
 function native(t){const a=/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t),b=/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t);const out=[];for(let w of (t.slice(a?a.index+a[0].length:0,b?b.index:t.length).match(/[A-Za-z]+/g)||[])){w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");for(let j=0;j<w.length;){const v=w.startsWith("ING",j)?{t:"ING",i:21}:w.startsWith("IO",j)?{t:"IO",i:27}:tokens.find(x=>w.startsWith(x.t,j));if(!v)break;out.push(v.i);j+=v.t.length}}return out}
 const donors=raw.slice(1).map(native),counts=Array(M).fill(.5),bi=Array.from({length:M},()=>Array(M).fill(.25));const model=donors[0].slice(0,Math.floor(donors[0].length*.8));for(let i=0;i<model.length;i++){counts[model[i]]++;if(i)bi[model[i-1]][model[i]]++}const s=counts.reduce((a,b)=>a+b,0),p=counts.map(x=>x/s),lp=p.map(Math.log),lb=bi.map(r=>{const z=r.reduce((a,b)=>a+b,0);return r.map(x=>Math.log(x/z))}),em=Array.from({length:M},(_,k)=>Float64Array.from({length:M},(_,c)=>p[mod(c-k)])),rat=em.map(r=>Float64Array.from(r,x=>M*x));
 let state=opts.seed??0x6113701;const rand=()=>{state^=state<<13;state^=state>>>17;state^=state<<5;return(state>>>0)/4294967296};
 const q=opts.q??13,N=opts.N??3008,mode=opts.mode??"plant",eps=opts.eps??.028,rho=.81,truth=Array.from({length:q},()=>Math.floor(rand()*M));
 const off=Math.floor(donors[opts.donor??1].length*.8)+(opts.offset??0),P=donors[opts.donor??1].slice(off,off+N),C=[],phase=[],skip=[];let j=0;
 if(mode==="plant"){if(P.length!==N)throw Error("donor too short");for(const x of P){let n=0,c=mod(x+truth[j]);while(C.length&&c===C.at(-1)&&rand()<rho){j=(j+1)%q;n++;c=mod(x+truth[j]);}C.push(c);phase.push(j);skip.push(n);j=(j+1)%q;}}
 else C.push(...gp.pages.slice(opts.firstPage??0,opts.lastPage??56).flatMap(x=>x.indices).slice(0,N));
 const T=opts.train??Math.floor(C.length*.7),c=C.slice(0,T),stride=opts.stride??5,L=opts.window??Math.min(q,24),starts=Array.from({length:Math.floor((T-L)/stride)+1},(_,i)=>i*stride),clean=(1-eps)**(L-1),outlier=1-clean,base=clean/q,sz=starts.length*q;
 const width=opts.width??96,observed=Uint8Array.from(starts.flatMap(i=>c.slice(i,i+L))),affected=Array.from({length:q},(_,d)=>Int32Array.from({length:L},(_,j)=>(d-j+q)%q));
 function calc(obj,d){const {W,S}=obj,h=affected[d],scores=new Float64Array(M),rest=new Float64Array(starts.length),ww=new Float64Array(starts.length*L);
 for(let i=0;i<starts.length;i++){let z=0;for(let j=0;j<L;j++){const x=W[i*q+h[j]];ww[i*L+j]=x;z+=x}rest[i]=Math.max(0,S[i]-z)}
 for(let k=0;k<M;k++){const a=rat[k];let v=0;for(let i=0,t=0;i<starts.length;i++){let z=rest[i];const end=t+L;for(;t<end;t++)z+=ww[t]*a[observed[t]];v+=Math.log(outlier+base*z)}scores[k]=v}return scores}
 function nextWeights(obj,d,k){const h=affected[d],a=rat[k],W=obj.W.slice(),S=new Float64Array(starts.length);for(let i=0;i<starts.length;i++){for(let j=0;j<L;j++)W[i*q+h[j]]*=a[observed[i*L+j]];let z=0;for(let j=0;j<q;j++)z+=W[i*q+j];S[i]=z}return {W,S}}
 function weightFor(K){let obj={W:new Float64Array(sz).fill(1),S:new Float64Array(starts.length).fill(q)};for(let d=0;d<K.length;d++)obj=nextWeights(obj,d,K[d]);return obj}
 function transitions(K,j,x,y,callback,marginal){
  const k=K[j],plain=mod(x-k),repeat=x===y;
  let m=1;while(m<q&&K[(j+m)%q]===k)m++;
  if(repeat&&m===q&&marginal){for(let h=0;h<q;h++)callback((j+h+1)%q,plain,Math.pow(rho,h)*(1-rho)/(1-Math.pow(rho,q)),h);return}
  callback((j+1)%q,plain,repeat?1-rho:1,0);
  if(y<0)return;
  if(repeat){for(let h=1;h<m;h++)callback((j+h+1)%q,plain,Math.pow(rho,h)*(1-rho),h);}
  else if(m<q&&mod(y-k+K[(j+m)%q])===x)callback((j+m+1)%q,mod(y-k),Math.pow(rho,m),m);
 }
 function exact(K,tape,prior,previous=-1){let A=prior?Float64Array.from(prior):Float64Array.from({length:q},()=>1/q),B=new Float64Array(q),ll=0;for(let i=0;i<tape.length;i++){B.fill(0);const x=tape[i],y=i?tape[i-1]:previous;for(let j=0;j<q;j++){const w=A[j];if(!w)continue;transitions(K,j,x,y,(next,plain,pr)=>{B[next]+=w*p[plain]*pr},true);}
  let z=B.reduce((a,b)=>a+b,0);if(!z)return {ll:-Infinity,end:[]};ll+=Math.log(z);for(let j=0;j<q;j++)A[j]=B[j]/z;}return {ll,end:Array.from(A)}}
 function nullLL(tape,previous=-1){let ll=0;for(let i=0;i<tape.length;i++){const y=i?tape[i-1]:previous;ll+=y<0?-Math.log(M):Math.log((tape[i]===y?1-rho:1)/(M-rho))}return ll}
 function decode(K,tape){const S=q*M,A=new Float64Array(S),B=new Float64Array(S),bp=new Int16Array(tape.length*S).fill(-1),bs=new Int16Array(tape.length*S);A.fill(-Infinity);for(let i=0;i<tape.length;i++){B.fill(-Infinity);const x=tape[i],y=i?tape[i-1]:-1;
  for(let j=0;j<q;j++)transitions(K,j,x,y,(next,plain,pr,skips)=>{const b=next*M+plain,pen=Math.log(pr);if(i===0){const v=lp[plain]-Math.log(q)+pen;if(v>B[b]){B[b]=v;bp[i*S+b]=j;bs[i*S+b]=skips}}else{let v=-Infinity,z=-1;for(let prev=0;prev<M;prev++){const a=j*M+prev,h=A[a]+lb[prev][plain]+pen;if(h>v){v=h;z=a}}if(v>B[b]){B[b]=v;bp[i*S+b]=z;bs[i*S+b]=skips}}},false);
  A.set(B);
 }
 let end=0;for(let i=1;i<S;i++)if(A[i]>A[end])end=i;const score=A[end],plain=[],skips=[],cursors=[];if(!Number.isFinite(score))throw Error("no path");
 for(let i=tape.length-1;i>=0;i--){plain.push(end%M);skips.push(bs[i*S+end]);const prev=bp[i*S+end];cursors.push(i?Math.floor(prev/M):prev);end=prev}plain.reverse();skips.reverse();cursors.reverse();
 for(let i=0;i<tape.length;i++){let j=cursors[i];for(let h=0;h<skips[i];h++){if(mod(plain[i]+K[j])!==tape[i-1])throw Error("reject replay");j=(j+1)%q;}if(mod(plain[i]+K[j])!==tape[i])throw Error("emit replay");if(i+1<tape.length&&cursors[i+1]!==((j+1)%q))throw Error("cursor replay")}
 return {plain,skips,cursors,score,replay:true,text:plain.slice(0,180).map(x=>gp.translit[x]).join("")}
 }
 function match(K){return Math.max(...Array.from({length:q},(_,d)=>K.filter((x,i)=>x===truth[(i+d)%q]).length))}
 let beam=(opts.initialKeys??[[]]).map(K=>({K,W:weightFor(K),ll:0})),layers=[];
 for(let d=beam[0].K.length;d<q;d++){
  const all=[];for(let i=0;i<beam.length;i++){const x=beam[i],sc=calc(x.W,d);for(let k=0;k<M;k++)all.push({i,k,ll:sc[k],K:[...x.K,k]});}
  all.sort((a,b)=>b.ll-a.ll);
  beam=all.slice(0,width).map(x=>({K:x.K,W:nextWeights(beam[x.i].W,d,x.k),ll:x.ll}));
  layers.push({d:d+1,best:beam[0].ll,...(mode==="plant"?{truthRank:all.findIndex(x=>match(x.K)===d+1)+1,truthKept:beam.filter(x=>match(x.K)===d+1).length,bestMatch:Math.max(...beam.map(x=>match(x.K)))}:{})});
  if(opts.stopAt&&d+1>=opts.stopAt)break;
 }
 if(beam[0].K.length<q)return {mode,q,N:C.length,T,width,stride,layers,partialKeys:beam.map(x=>x.K),truth:mode==="plant"?truth:undefined};
 const can=K=>Array.from({length:q},(_,j)=>K.slice(j).concat(K.slice(0,j)).join(",")).sort()[0],seen=new Set(),candidates=[];
 for(const x of beam){const key=can(x.K);if(seen.has(key))continue;seen.add(key);const a=exact(x.K,c);candidates.push({K:x.K,ll:x.ll,exact:a.ll,fitGain:a.ll-nullLL(c),end:a.end,...(mode==="plant"?{match:match(x.K)}:{})})}
 candidates.sort((a,b)=>b.exact-a.exact);
 const winner=candidates[0],held=C.slice(T),h=exact(winner.K,held,winner.end,C[T-1]),dec=decode(winner.K,C),correct=mode==="plant"?{fit:dec.plain.slice(0,T).filter((x,i)=>x===P[i]).length,held:dec.plain.slice(T).filter((x,i)=>x===P[T+i]).length,skips:dec.skips.filter((x,i)=>x===skip[i]).length}:undefined;
 return {mode,q,N:C.length,T,width,stride,windows:starts.length,window:L,seed:opts.seed??0x6113701,skip:mode==="plant"?skip.reduce((a,b)=>a+b,0):undefined,truth:mode==="plant"?truth:undefined,truthExact:mode==="plant"?exact(truth,c).ll:undefined,layers,best:candidates.slice(0,8),bestMatch:mode==="plant"?Math.max(...candidates.map(x=>x.match)):undefined,nullLL:nullLL(c),winner:{...winner,heldGain:h.ll-nullLL(held,C[T-1]),heldLL:h.ll,replay:dec.replay,score:dec.score,text:dec.text,correct,decoded:opts.full?dec:undefined}};
}
module.exports=experiment;
if(require.main===module){const raw=paths.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8"));const opts=process.argv[2]?JSON.parse(process.argv[2]):{};console.log(JSON.stringify(experiment(raw,opts),null,2));}
