'use strict';
// Agent6: source-sized period987 rank28 key recovery; Node22/CommonJS.
const fs=require('node:fs');
const path=require('node:path');
const paths=["resources/liber-primus/lp2-corpus.json","resources/lp2-transcription.txt","resources/control/shakespeare_first300k.txt","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt"];
function core(data){
 const s=JSON.parse(data[0]),Q=28,N=29,q=987,AIO=[3,10,24],mod=(x,m=Q)=>(x%m+m)%m,check=(x,msg)=>{if(!x)throw Error(msg)};
 const c0=s.pages.slice(16,56).flatMap(x=>x.indices),start=s.pages.slice(0,16).reduce((a,p)=>a+p.indices.length,0),cut=s.pages.slice(16,40).reduce((a,p)=>a+p.indices.length,0);
 let at=0,w=0,o=0,sites=[];const gs=new Set(s.runes);
 function flush(){if(w===1&&o>=start&&o<start+c0.length)sites.push(o-start);w=0}
 for(const ch of data[1].split("%").slice(0,55).join("%")){if(gs.has(ch)){if(!w)o=at;w++;at++}else if(ch!=="%"&&ch!=="/"&&!/\s/u.test(ch))flush()}flush();check(c0.length===9194&&cut===5878&&sites.length===58&&at===12956,"source");
 const tokens=s.translit.map((x,i)=>({x,i})).sort((a,b)=>b.x.length-a.x.length);
 function native(t){let out=[],ss=[];for(const m of t.toUpperCase().replace(/QU/g,"CW").replace(/[KQ]/g,"C").replace(/V/g,"U").replace(/Z/g,"S").matchAll(/[A-Z]+/g)){const word=m[0].replace(/ING/g,"NG").replace(/IO/g,"IA");let a=[];for(let i=0;i<word.length;){const x=tokens.find(t=>word.startsWith(t.x,i));if(x){a.push(x.i);i+=x.x.length}else i++}if(a.length===1&&AIO.includes(a[0]))ss.push(out.length);out.push(...a)}return {out,ss}}
 const tr=native(data[2]).out,h1=new Float64Array(N),h2=new Float64Array(N*N),h3=new Float64Array(N**3),L1=new Float64Array(N),L2=new Float64Array(N*N),L3=new Float64Array(N**3);
 for(let i=0;i<tr.length;i++){h1[tr[i]]++;if(i)h2[tr[i-1]*N+tr[i]]++;if(i>1)h3[(tr[i-2]*N+tr[i-1])*N+tr[i]]++}
 for(let a=0;a<N;a++)L1[a]=Math.log((h1[a]+.5)/(tr.length+N*.5));
 for(let a=0;a<N;a++){let n2=0;for(let c=0;c<N;c++)n2+=h2[a*N+c];for(let c=0;c<N;c++)L2[a*N+c]=Math.log((h2[a*N+c]+10*Math.exp(L1[c]))/(n2+10))}
 for(let a=0;a<N;a++)for(let b=0;b<N;b++){let n3=0;for(let c=0;c<N;c++)n3+=h3[(a*N+b)*N+c];for(let c=0;c<N;c++)L3[(a*N+b)*N+c]=Math.log((h3[(a*N+b)*N+c]+10*Math.exp(L2[b*N+c]))/(n3+10))}
 const pow=[],log=Array(N).fill(-1);let g=1;for(let i=0;i<Q;i++){pow.push(g);log[g]=i;g=g*15%29}check(new Set(pow).size===28,"root");
 const rank=(p,e)=>p>e?p-1:p,unrank=(p,e)=>p>=e?p+1:p;
 function ev(c,hold,read){let t=0;const rs=new Int16Array(c.length).fill(-1),ts=new Int16Array(c.length).fill(-1);for(let i=1;i<c.length;i++){const d=mod(c[i]-c[i-1],N);rs[i]=d?(read===0?d-1:read===1?log[d]:c[i]-Number(c[i]>c[i-1])):-1;ts[i]=t%q;if(d||!hold)t++}return {rs,ts}}
 function enc(p,key,e,hold,read){let t=0,c=[p[0]];for(let i=1;i<p.length;i++){const u=c[i-1];if(p[i]===e){c.push(u);if(!hold)t++;continue}const x=mod(rank(p[i],e)+key[t++%q]);c.push(read===2?x+Number(x>=u):mod(u+(read===1?pow[x]:x+1),N))}return c}
 function dec(c,key,e,events){return c.map((x,i)=>i===0?x:events.rs[i]<0?e:unrank(mod(events.rs[i]-key[events.ts[i]]),e))}
 const equal=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
 const score=(p,a,b)=>{let sum=0;for(let i=a+2;i<b;i++)sum+=L3[(p[i-2]*N+p[i-1])*N+p[i]];return sum/(b-a-2)};
 function masks(events,ss,e){let m=new Int32Array(q).fill((1<<28)-1);for(const i of ss){if(i===0||i>=cut)continue;if(events.rs[i]<0){if(!AIO.includes(e))return null;continue}let bits=0;for(const p of AIO)if(p!==e)bits|=1<<mod(events.rs[i]-rank(p,e));m[events.ts[i]]&=bits;if(!m[events.ts[i]])return null}return m}
 /** Plain symbol for every rank/key pair under one excluded rune. */
 function table(e){let a=new Int16Array(Q*Q);for(let r=0;r<Q;r++)for(let k=0;k<Q;k++)a[r*Q+k]=unrank(mod(r-k),e);return a}
 function screen(c,ss){let out=[];for(const hold of [false,true])for(const read of [0,1,2]){const events=ev(c,hold,read);for(let e=0;e<N;e++){const mask=masks(events,ss,e);if(!mask)continue;const T=table(e),scores=new Float64Array(q*Q);let val=0;for(let i=1;i<cut;i++){const r=events.rs[i],t=events.ts[i];if(r<0){val+=L1[e];continue}for(let k=0;k<Q;k++)scores[t*Q+k]+=L1[T[r*Q+k]]}for(let t=0;t<q;t++){let best=-Infinity;for(let k=0;k<Q;k++)if(mask[t]>>k&1)best=Math.max(best,scores[t*Q+k]);val+=best}out.push({hold,read,e,v:val/(cut-1),mask,events})}}return out.sort((a,b)=>b.v-a.v)}
 /** Exact open-chain Viterbi for all 28 shifts; ignore only the wrap edge. */
 function bigram(c,config){const {e,mask,events:{rs,ts}}=config,T=table(e),U=new Float64Array(q*Q),E=new Float64Array(q*Q*Q);
 for(let i=1;i<cut;i++){const r=rs[i],p=i===1?-1:rs[i-1],t=ts[i],j=ts[i-1];if(r<0&&p<0)continue;if(r<0){for(let k=0;k<Q;k++)U[j*Q+k]+=L2[T[p*Q+k]*N+e];continue}if(p<0){const a=i===1?c[0]:e;for(let k=0;k<Q;k++)U[t*Q+k]+=L2[a*N+T[r*Q+k]];continue}check(t===(j+1)%q,"adjacent phases");if(!t)continue;const base=t*Q*Q;for(let a=0;a<Q;a++){const off=T[p*Q+a]*N,idx=base+a*Q;for(let b=0;b<Q;b++)E[idx+b]+=L2[off+T[r*Q+b]]}}
 let prev=Float64Array.from({length:Q},(_,k)=>(mask[0]>>k&1)?U[k]:-Infinity),back=new Int8Array(q*Q);
 for(let t=1;t<q;t++){let next=new Float64Array(Q).fill(-Infinity),base=t*Q*Q;for(let b=0;b<Q;b++)if(mask[t]>>b&1){let best=-Infinity,ak=-1;for(let a=0;a<Q;a++){const v=prev[a]+E[base+a*Q+b];if(v>best){best=v;ak=a}}next[b]=best+U[t*Q+b];back[t*Q+b]=ak}prev=next}
 const key=new Array(q);key[q-1]=prev.indexOf(Math.max(...prev));for(let t=q-1;t>0;t--)key[t-1]=back[t*Q+key[t]];return key}
 /** Trigram coordinate refinement using only fit positions, exact score deltas. */
 function refine(c,config,key){const {e,mask,events:{rs,ts}}=config,T=table(e),p=dec(c,key,e,config.events),pos=Array.from({length:q},()=>[]),affected=Array.from({length:q},()=>[]);
 for(let i=1;i<cut;i++)if(rs[i]>=0)pos[ts[i]].push(i);
 for(let t=0;t<q;t++){const set=new Set();for(const i of pos[t])for(let j=Math.max(2,i);j<=Math.min(cut-1,i+2);j++)set.add(j);affected[t]=[...set]}
 const local=t=>affected[t].reduce((s,j)=>s+L3[(p[j-2]*N+p[j-1])*N+p[j]],0);
 const apply=(t,k)=>{for(const i of pos[t])p[i]=T[rs[i]*Q+k]};
 let passes=0,changed=0;for(let pass=0;pass<12;pass++){changed=0;for(let j=0;j<q;j++){const t=pass%2?q-1-j:j;let bk=key[t],bv=local(t);for(let k=0;k<Q;k++)if(k!==key[t]&&(mask[t]>>k&1)){apply(t,k);const v=local(t);if(v>bv+1e-10){bv=v;bk=k}}apply(t,bk);if(bk!==key[t])changed++;key[t]=bk}passes++;if(!changed)break}
 return {key,passes,changed}}
 function search(c,ss,truth){const configs=screen(c,ss);const rank=truth?configs.findIndex(x=>x.hold===truth.hold&&x.read===truth.read&&x.e===truth.e)+1:null;let best=null,summary=[];
 // Frozen selection: top 12 unigram fits; no original holdout used.
 for(const a of configs.slice(0,12)){const k0=bigram(c,a),b=refine(c,a,k0),p=dec(c,b.key,a.e,a.events);const v=score(p,0,cut),res={hold:a.hold,read:a.read,e:a.e,screen:a.v,train:v,passes:b.passes};summary.push(res);if(!best||v>best.train)best={...res,key:b.key,p}}
 if(!best)return {screened:configs.length,truthScreenRank:rank,summary};
 const {key,p,...b}=best;check(equal(enc(p,key,b.e,b.hold,b.read),c),"replay");return {screened:configs.length,truthScreenRank:rank,summary,best:{...b,held:score(p,cut,p.length),heldSingletonHits:ss.filter(i=>i>=cut&&AIO.includes(p[i])).length,heldSingletonTotal:ss.filter(i=>i>=cut).length,excerpt:p.slice(cut,cut+150).map(i=>s.translit[i]).join(""),...(truth?{keyHits:key.filter((v,i)=>v===truth.key[i]).length,heldRuneHits:p.slice(cut).filter((v,i)=>v===truth.p[cut+i]).length,configExact:b.hold===truth.hold&&b.read===truth.read&&b.e===truth.e}:{}),key}}
 }
 const controls=[];
 for(const [j,o,e,hold,read,seed] of [[3,1000,21,true,0,3301987],[4,4000,28,false,1,9873301]]){
  const n=native(data[j]),p=n.out.slice(o,o+c0.length),ss=n.ss.filter(i=>i>=o&&i<o+c0.length).map(i=>i-o);let x=seed;
  const key=Array.from({length:q},()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)%Q});
  const c=enc(p,key,e,hold,read);check(equal(dec(c,key,e,ev(c,hold,read)),p),"plant inverse");controls.push({donor:j,offset:o,truth:{e,hold,read},...search(c,ss,{key,p,e,hold,read})})
 }
 const original=search(c0,sites,null);return {n:c0.length,cut,period:q,model:"period987 rank28 additive cycle; 29 escape symbols, six rank/clock variants; first IV public; train singleton masks and unigram screen top12, exact open bigram Viterbi plus trigram coordinate refinement; no holdout fitting",controls,original}
}
if(require.main===module)console.log(JSON.stringify(core(paths.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'))),null,2));
module.exports={core};
