"use strict";
const fs=require("node:fs"),path=require("node:path");
const paths=["resources/liber-primus/lp2-corpus.json","resources/control/shakespeare_first300k.txt","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt"];
function experiment(raw,opts={}){
 const gp=JSON.parse(raw[0]),M=29,mod=x=>(x%M+M)%M;
 const tokens=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
 function native(t){const a=/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t),b=/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t);const out=[];for(let w of (t.slice(a?a.index+a[0].length:0,b?b.index:t.length).match(/[A-Za-z]+/g)||[])){w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");for(let j=0;j<w.length;){const v=w.startsWith("ING",j)?{t:"ING",i:21}:w.startsWith("IO",j)?{t:"IO",i:27}:tokens.find(x=>w.startsWith(x.t,j));if(!v)break;out.push(v.i);j+=v.t.length}}return out}
 const donors=raw.slice(1).map(native),counts=Array(M).fill(.5),bi=Array.from({length:M},()=>Array(M).fill(.25));const model=donors[0].slice(0,Math.floor(donors[0].length*.8));for(let i=0;i<model.length;i++){counts[model[i]]++;if(i)bi[model[i-1]][model[i]]++}const s=counts.reduce((a,b)=>a+b,0),p=counts.map(x=>x/s),lp=p.map(Math.log),lb=bi.map(r=>{const z=r.reduce((a,b)=>a+b,0);return r.map(x=>Math.log(x/z))});
 const H=M*(M-1),enc=Array.from({length:H},(_,k)=>Uint8Array.from({length:M},(_,x)=>mod((1+Math.floor(k/M))*x+k%M))),inv=enc.map(a=>{const b=new Uint8Array(M);for(let x=0;x<M;x++)b[a[x]]=x;return b}),em=inv.map(a=>Float64Array.from(a,x=>p[x])),logem=inv.map(a=>Float64Array.from(a,x=>lp[x]));
 let state=opts.seed??0x6113701;const rand=()=>{state^=state<<13;state^=state>>>17;state^=state<<5;return(state>>>0)/4294967296};
 const q=opts.q??29,N=opts.N??3008,mode=opts.mode??"plant",eps=opts.eps??.028,rho=.81,truth=Array.from({length:q},()=>Math.floor(rand()*H));
 const off=Math.floor(donors[opts.donor??1].length*.8)+(opts.offset??0),P=donors[opts.donor??1].slice(off,off+N),C=[],phase=[],skip=[];let j=0;
 if(mode==="plant"){if(P.length!==N)throw Error("donor too short");for(const x of P){let n=0,c=enc[truth[j]][x];while(C.length&&c===C.at(-1)&&rand()<rho){j=(j+1)%q;n++;c=enc[truth[j]][x];}C.push(c);phase.push(j);skip.push(n);j=(j+1)%q;}}
 else C.push(...gp.pages.slice(opts.firstPage??0,opts.lastPage??56).flatMap(x=>x.indices).slice(0,N));
 const T=opts.train??Math.floor(C.length*.7),c=C.slice(0,T),width=opts.seedCount??12,stride=0,starts=[];
 function transitions(K,j,x,y,callback,marginal){
  const k=K[j],plain=inv[k][x],repeat=x===y;
  if(y<0){callback((j+1)%q,plain,1,0);return}
  const rejected=inv[k][y];let m=1;while(m<q&&enc[K[(j+m)%q]][rejected]===y)m++;
  if(repeat&&m===q&&marginal){for(let h=0;h<q;h++)callback((j+h+1)%q,plain,Math.pow(rho,h)*(1-rho)/(1-Math.pow(rho,q)),h);return}
  callback((j+1)%q,plain,repeat?1-rho:1,0);
  if(repeat){for(let h=1;h<m;h++)callback((j+h+1)%q,plain,Math.pow(rho,h)*(1-rho),h);}
  else if(m<q&&enc[K[(j+m)%q]][rejected]===x)callback((j+m+1)%q,rejected,Math.pow(rho,m),m);
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
 for(let i=0;i<tape.length;i++){let j=cursors[i];for(let h=0;h<skips[i];h++){if(enc[K[j]][plain[i]]!==tape[i-1])throw Error("reject replay");j=(j+1)%q;}if(enc[K[j]][plain[i]]!==tape[i])throw Error("emit replay");if(i+1<tape.length&&cursors[i+1]!==((j+1)%q))throw Error("cursor replay")}
 return {plain,skips,cursors,score,replay:true,text:plain.slice(0,180).map(x=>gp.translit[x]).join("")}
 }
 function match(K){return Math.max(...Array.from({length:q},(_,d)=>K.filter((x,i)=>x===truth[(i+d)%q]).length))}
 // Approximate independent geometric skip model for key proposals, with exact collision receiver below.
 const alpha=new Float64Array(T*q),scale=new Float64Array(T),beta=new Float64Array(q),bb=new Float64Array(q),occ=new Float64Array(q*M),E=new Float64Array(q*M),Q=new Float64Array(q*H),nQ=new Float64Array(q*H),logs=new Float64Array(H),jump=[1-eps,(1-eps)*eps,eps*eps],iterN=opts.iterations??20,anchorN=opts.anchorIterations??3,anchorLen=opts.anchorLen??q;
 const prev=Array.from({length:3},(_,r)=>Int32Array.from({length:q},(_,j)=>(j-1-r+q)%q)),next=Array.from({length:3},(_,r)=>Int32Array.from({length:q},(_,j)=>(j+1+r)%q));
 function fb(start,anchor){for(let j=0;j<q;j++)for(let x=0;x<M;x++){let z=0;for(let k=0;k<H;k++)z+=Q[j*H+k]*em[k][x];E[j*M+x]=z}
  let ll=0;for(let i=0;i<T;i++){const a=i*q,b=a-q,x=c[i],force=anchor&&i>=start&&i<start+anchorLen?i-start:-1;let z=0;
   for(let j=0;j<q;j++){const v=force>=0&&j!==force?0:E[j*M+x]*(i===0?1/q:jump[0]*alpha[b+prev[0][j]]+jump[1]*alpha[b+prev[1][j]]+jump[2]*alpha[b+prev[2][j]]);alpha[a+j]=v;z+=v}if(!(z>0))throw Error("zero forward");scale[i]=z;ll+=Math.log(z);for(let j=0;j<q;j++)alpha[a+j]/=z}
  occ.fill(0);beta.fill(1);
  for(let i=T-1;i>=0;i--){const a=i*q,x=c[i];let z=0;for(let j=0;j<q;j++)z+=alpha[a+j]*beta[j];for(let j=0;j<q;j++)occ[j*M+x]+=alpha[a+j]*beta[j]/z;
   if(i){const force=anchor&&i>=start&&i<start+anchorLen?i-start:-1;for(let j=0;j<q;j++){let v=0;for(let r=0;r<3;r++){const k=next[r][j];if(force<0||k===force)v+=jump[r]*E[k*M+x]*beta[k]}bb[j]=v/scale[i]}beta.set(bb)}
  }return ll}
 function update(temp,damp){for(let j=0;j<q;j++){let best=-Infinity;for(let k=0;k<H;k++){let z=0;const e=logem[k];for(let x=0;x<M;x++)z+=occ[j*M+x]*e[x];logs[k]=z/temp;best=Math.max(best,logs[k])}let z=0;for(let k=0;k<H;k++)z+=Math.exp(logs[k]-best);for(let k=0;k<H;k++)nQ[j*H+k]=damp*Q[j*H+k]+(1-damp)*Math.exp(logs[k]-best)/z}Q.set(nQ)}
 function hard(){return Array.from({length:q},(_,j)=>{let k=0;for(let h=1;h<H;h++)if(Q[j*H+h]>Q[j*H+k])k=h;return k})}
 const seedStarts=opts.seedStarts??Array.from({length:width},(_,i)=>Math.floor((T-anchorLen)*(i+.5)/width)),beam=[],layers=[];
 for(const start of seedStarts){for(let j=0;j<q;j++)for(let k=0;k<H;k++)Q[j*H+k]=j<anchorLen?em[k][c[start+j]]/(M-1):1/H;const history=[];let K;
  for(let it=0;it<iterN;it++){const ll=fb(start,it<anchorN),temp=Math.max(opts.endTemp??1,(opts.startTemp??8)*(1-it/Math.max(1,iterN-1)));update(temp,opts.damping??.2);K=hard();history.push({it,ll,exact:(it===iterN-1||opts.scoreEvery&&it%opts.scoreEvery===0)?exact(K,c).ll:undefined,...(mode==="plant"?{match:match(K)}:{})})}
  const ll=fb(start,false);K=hard();beam.push({K,ll});layers.push({start,history,final:history.at(-1)})}
 const can=K=>Array.from({length:q},(_,j)=>K.slice(j).concat(K.slice(0,j)).join(",")).sort()[0],seen=new Set(),candidates=[];
 for(const x of beam){const key=can(x.K);if(seen.has(key))continue;seen.add(key);const a=exact(x.K,c);candidates.push({K:x.K,ll:x.ll,exact:a.ll,fitGain:a.ll-nullLL(c),end:a.end,...(mode==="plant"?{match:match(x.K)}:{})})}
 candidates.sort((a,b)=>b.exact-a.exact);
 const winner=candidates[0],held=C.slice(T),h=exact(winner.K,held,winner.end,C[T-1]),dec=decode(winner.K,C),correct=mode==="plant"?{fit:dec.plain.slice(0,T).filter((x,i)=>x===P[i]).length,held:dec.plain.slice(T).filter((x,i)=>x===P[T+i]).length,skips:dec.skips.filter((x,i)=>x===skip[i]).length}:undefined;
 return {mode,q,N:C.length,T,width,stride,windows:starts.length,seed:opts.seed??0x6113701,skip:mode==="plant"?skip.reduce((a,b)=>a+b,0):undefined,truth:mode==="plant"?truth:undefined,truthExact:mode==="plant"?exact(truth,c).ll:undefined,layers,best:candidates.slice(0,8),bestMatch:mode==="plant"?Math.max(...candidates.map(x=>x.match)):undefined,nullLL:nullLL(c),winner:{...winner,heldGain:h.ll-nullLL(held,C[T-1]),heldLL:h.ll,replay:dec.replay,score:dec.score,text:dec.text,correct,decoded:opts.full?dec:undefined}};
}
module.exports=experiment;
if(require.main===module){const raw=paths.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8"));const opts=process.argv[2]?JSON.parse(process.argv[2]):{};console.log(JSON.stringify(experiment(raw,opts),null,2));}
