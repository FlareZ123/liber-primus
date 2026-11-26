'use strict';
// Agent6: exact feedback-driven rank28 CRT inversion; Node 22/CommonJS.
const fs=require('node:fs');
const path=require('node:path');
const paths=["resources/liber-primus/lp2-corpus.json","resources/lp2-transcription.txt","resources/control/shakespeare_first300k.txt","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt"];
function core(data){
 const src=JSON.parse(data[0]),Q=28,N=29,AIO=[3,10,24],mod=(x,m=Q)=>(x%m+m)%m,check=(x,s)=>{if(!x)throw Error(s)};
 const c0=src.pages.slice(16,23).flatMap(x=>x.indices),start=src.pages.slice(0,16).reduce((s,p)=>s+p.indices.length,0),cut=src.pages.slice(16,19).reduce((s,p)=>s+p.indices.length,0);
 let at=0,w=0,ws=0,sites=[];const glyphs=new Set(src.runes);
 function flush(){if(w===1&&ws>=start&&ws<start+c0.length)sites.push(ws-start);w=0}
 for(const ch of data[1].split("%").slice(0,55).join("%")){if(glyphs.has(ch)){if(!w)ws=at;w++;at++}else if(ch!=="%"&&ch!=="/"&&!/\s/u.test(ch))flush()}flush();
 check(at===12956&&c0.length===1744&&cut===800&&sites.length===17,"source geometry");
 const toks=src.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function native(s){const out=[],ss=[];for(const m of s.toUpperCase().replace(/QU/g,"CW").replace(/[KQ]/g,"C").replace(/V/g,"U").replace(/Z/g,"S").matchAll(/[A-Z]+/g)){const word=m[0].replace(/ING/g,"NG").replace(/IO/g,"IA");let x=[];for(let i=0;i<word.length;){const tok=toks.find(t=>word.startsWith(t.s,i));if(tok){x.push(tok.i);i+=tok.s.length}else i++}if(x.length===1&&AIO.includes(x[0]))ss.push(out.length);out.push(...x)}return {out,ss}}
 const tr=native(data[2]).out,H1=new Float64Array(N),H2=new Float64Array(N*N),H3=new Float64Array(N**3),L=new Float64Array(N**3);
 for(let i=0;i<tr.length;i++){H1[tr[i]]++;if(i)H2[tr[i-1]*N+tr[i]]++;if(i>1)H3[(tr[i-2]*N+tr[i-1])*N+tr[i]]++}
 for(let a=0;a<N;a++)for(let b=0;b<N;b++){let n2=0,n3=0;for(let c=0;c<N;c++){n2+=H2[b*N+c];n3+=H3[(a*N+b)*N+c]}for(let c=0;c<N;c++){const p1=(H1[c]+.5)/(tr.length+N*.5),p2=(H2[b*N+c]+10*p1)/(n2+10);L[(a*N+b)*N+c]=Math.log((H3[(a*N+b)*N+c]+10*p2)/(n3+10))}}
 const score=(p,l,u)=>{let s=0;for(let i=l+2;i<u;i++)s+=L[(p[i-2]*N+p[i-1])*N+p[i]];return s/(u-l-2)};
 const pow=[],logs=Array(N).fill(-1);let g=1;for(let i=0;i<Q;i++){pow.push(g);logs[g]=i;g=g*15%N}check(new Set(pow).size===28,"root15");
 const rank=(p,e)=>p>e?p-1:p,unrank=(p,e)=>p>=e?p+1:p;
 function events(c,hold,read){let t=0;const ts=Array(c.length).fill(-1),rs=Array(c.length).fill(-1),feed=[];for(let i=1;i<c.length;i++){const d=mod(c[i]-c[i-1],N);rs[i]=d?(read?logs[d]:d-1):-1;ts[i]=t;if(d||!hold){feed.push(d?rs[i]:0);t++}}return {ts,rs,feed}}
 /** K[t+2]=a*K[t+1]+b*K[t]+f*R[t]+d. Key vector: [a,b,k0,k1,f,d]. */
 function encode(p,k,e,hold,read){const [a,b,,,f,d]=k;let u=k[2],v=k[3],c=[p[0]];for(let i=1;i<p.length;i++){if(p[i]===e){c.push(c[i-1]);if(hold)continue;[u,v]=[v,mod(a*v+b*u+d)];continue}const r=mod(rank(p[i],e)+u);c.push(mod(c[i-1]+(read?pow[r]:r+1),N));[u,v]=[v,mod(a*v+b*u+f*r+d)]}return c}
 function decode(c,k,e,hold,read,ev=events(c,hold,read)){const [a,b,,,f,d]=k;let u=k[2],v=k[3],p=[c[0]];for(let i=1;i<c.length;i++){const r=ev.rs[i];p.push(r<0?e:unrank(mod(r-u),e));if(r<0&&hold)continue;[u,v]=[v,mod(a*v+b*u+f*Math.max(0,r)+d)]}return p}
 const equal=(a,b)=>a.length===b.length&&a.every((v,i)=>v===b[i]);
 /** Project exact affine rows to a prime-power factor; no field division needed. */
 function rows(feed,positions,a,b,m){let u=[1,0,0,0],v=[0,1,0,0],out=[],j=0;for(let t=0;t<=positions.at(-1);t++){if(t===positions[j]){out.push(u);j++}const z=u.map((x,i)=>mod(a*v[i]+b*x+(i===2?feed[t]:i===3?1:0),m));u=v;v=z}check(out.length===positions.length,"rows");return out}
 function maskAt(ev,fit,e,m){return fit.map(i=>{let mask=0;for(const p of AIO)if(p!==e)mask|=1<<mod(ev.rs[i]-rank(p,e),m);return mask})}
 /** Enumerate every projected key satisfying projected singleton masks. */
 function project(ev,fit,e,m){const masks=maskAt(ev,fit,e,m),positions=fit.map(i=>ev.ts[i]),out=[];for(let a=0;a<m;a++)for(let b=0;b<m;b++){
   const H=rows(ev.feed,positions,a,b,m);
   for(let u=0;u<m;u++)for(let v=0;v<m;v++)for(let f=0;f<m;f++)for(let d=0;d<m;d++){
    let yes=true;for(let j=0;j<H.length;j++){const h=H[j],x=(h[0]*u+h[1]*v+h[2]*f+h[3]*d)%m;if(!(masks[j]>>x&1)){yes=false;break}}if(yes)out.push([a,b,u,v,f,d])
   }
 }return out}
 const crt=(a,b)=>a+7*mod(3*(b-a),4);
 for(let x=0;x<Q;x++)check(crt(x%7,x%4)===x,"CRT");
 function search(c,ss,truth){
  const fit=ss.filter(i=>i>0&&i<cut).slice(0,10),held=ss.filter(i=>i>=cut);check(fit.length===10&&held.length>0,"fit/hold sites");
  let candidates=0,all=0,best=null,truthRetained=false,rowsSummary=[];
  for(const hold of [false,true])for(const read of [false,true]){const ev=events(c,hold,read);const ordinary=fit.filter(i=>ev.rs[i]>=0),repeats=fit.length-ordinary.length;check(ordinary.length>1,"fit ordinary");let n7=0,n4=0,join=0,pass=0;
   for(let e=0;e<N;e++){if(repeats&&!AIO.includes(e))continue;const s7=project(ev,ordinary,e,7);n7+=s7.length;if(!s7.length)continue;const s4=project(ev,ordinary,e,4);n4+=s4.length;for(const a of s7)for(const b of s4){join++;const k=a.map((x,i)=>crt(x,b[i]));const p=decode(c,k,e,hold,read,ev);if(!fit.every(i=>AIO.includes(p[i])))continue;candidates++;pass++;
    const v=score(p,0,cut);if(truth&&e===truth.e&&hold===truth.hold&&read===truth.read&&equal(k,truth.k))truthRetained=true;
    if(!best||v>best.train){best={k,e,hold,read,train:v,p}}
    if(held.every(i=>AIO.includes(p[i])))all++;
   }}
   rowsSummary.push({hold,read,mod7:n7,mod4ForSurvivingEscapes:n4,crtJoins:join,fitCandidates:pass})
  }
  const summary={fit,held,candidates,allHeldSingletons:all,truthRetained,rowsSummary};
  if(best){const {p,...b}=best;check(equal(encode(p,b.k,b.e,b.hold,b.read),c),"best exact replay");summary.best={...b,held:score(p,cut,p.length),heldSingletonHits:held.filter(i=>AIO.includes(p[i])).length,excerpt:p.slice(cut,cut+120).map(x=>src.translit[x]).join(""),...(truth?{keyExact:equal(b.k,truth.k)&&b.e===truth.e&&b.hold===truth.hold&&b.read===truth.read,heldRuneHits:p.slice(cut).filter((v,i)=>v===truth.p[cut+i]).length}:{})}}
  return summary
 }
 const controls=[];
 for(const [i,offset,k,e,hold,read] of [[3,1200,[11,9,7,23,15,17],21,true,false],[4,3200,[17,5,22,3,19,7],28,false,true]]){
  const n=native(data[i]);let o=offset;for(;o+1744<n.out.length;o+=100){if(n.ss.filter(x=>x>o&&x<o+cut).length>=10&&n.ss.some(x=>x>=o+cut&&x<o+1744))break}
  const p=n.out.slice(o,o+1744),ss=n.ss.filter(x=>x>=o&&x<o+1744).map(x=>x-o);check(p.length===1744,"plant");const c=encode(p,k,e,hold,read);check(equal(decode(c,k,e,hold,read),p),"plant inverse");const a=search(c,ss,{k,e,hold,read,p});check(a.truthRetained,"truth lost");controls.push({donor:i,offset:o,truth:{k,e,hold,read},...a})
 }
 const original=search(c0,sites,null);
 return {model:"K[t+2]=a*K[t+1]+b*K[t]+f*R[t]+d mod28; R=nonrepeat cyclic rank or log15, repeated consume R=0; equal cipher pair denotes fixed escape e; hold/consume; first rune clear IV",n:c0.length,cut,original,controls}
}
if(require.main===module)console.log(JSON.stringify(core(paths.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'))),null,2));
module.exports={core};
