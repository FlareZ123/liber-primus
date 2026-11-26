/** #3037 exact typed-edge completion; no original ciphertext fit. */
const fs=require("node:fs");
function experiment(raw,profile,mode="mixed"){
 const S="0123456789abcdefghijklmnopqrs",L="F U TH O R C G W H N I J EO P X S T B E M L NG OE D A AE Y IA EA".split(" "),D=new Set(),by=Array.from({length:30},()=>[]);
 for(const l of raw.split(/\r?\n/)){const m=l.match(/^([a-z]+)\s+([0-9]+)$/);if(!m)continue;const s=m[1].toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");function go(i,w){if(i===s.length){D.add(w);return}for(let j=0;j<29;j++)if(s.startsWith(L[j],i))go(i+L[j].length,w+S[j]);if(s.startsWith("ING",i))go(i+3,w+S[21])}go(0,"")}
 for(const w of D)by[w.length].push(w);by.forEach(a=>a.sort());
 const lens=profile.p54.body_groups.slice(0,47).map(w=>w.length),hl=profile.p55.groups.slice(1).map(w=>w.length),ord=lens.map((_,i)=>i).sort((a,b)=>lens[b]-lens[a]||a-b);
 function stats(s){let f=0,r=0;for(let i=0;i<s.length;i++){if(s[i]==="0")f++;if(i&&s[i]===s[i-1])r++}return [f,r]}
 if(D.size!==38910||lens.reduce((a,b)=>a+b,0)!==213||stats(profile.p54.body_groups.join("")).join()!=="3,2")throw Error("profile");
 function rng(seed){let x=seed>>>0;return n=>{x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)%n}}
 function shuffle(a,r){for(let i=a.length-1;i>0;i--){const j=r(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
 const seq=n=>Array.from({length:n},(_,i)=>i),mod=x=>(x%29+29)%29;
 function inv(p){const a=[];p.forEach((v,i)=>a[v]=i);return a}
 function maps(pi,k){const I=inv(pi);return k.map(t=>pi.map(v=>I[(v+t)%29]))}
 function enc(w,M,j){let s="";for(const x of w){const p=S.indexOf(x);if(!p)s+="0";else{s+=S[M[j][p]];j=(j+1)%8}}return s}
 function paths(w,I,visit){const c=Array.from(w,x=>S.indexOf(x));function walk(i,j,p,start){if(i===c.length){visit(p,start);return}if(c[i]===0)walk(i+1,j,p+"0",start);const x=I[j][c[i]];if(x!==0)walk(i+1,(j+1)%8,p+S[x],start)}for(let j=0;j<8;j++)walk(0,j,"",j)}
 function fit(C,M){const I=M.map(inv);let bad=0,score=0;for(const ix of ord){const w=C[ix];let n=0,d=0;paths(w,I,p=>{n++;if(D.has(p))d++});if(!d&&++bad>2)return null;const prob=(45/47)*d/(8*by[w.length].length)+(2/47)*n/(8*29**w.length);if(!prob)return null;score+=Math.log(prob)}return {score,bad}}
 function held(z,M){const I=M.map(inv);let retained=0,unique=0;for(let i=0;i<z.H.length;i++){const w=new Set();paths(z.HC[i],I,(p,j)=>{if(enc(p,M,j)!==z.HC[i])throw Error("replay");if(D.has(p))w.add(p)});retained+=w.has(z.H[i]);unique+=w.size===1&&w.has(z.H[i])}let carry=0,total=0;paths(z.C[47],I,(p,j)=>{if(enc(p,M,j)!==z.C[47])throw Error("carry replay");total++;carry+=p===z.P[47]});return {retained,unique,carryPaths:total,carryTruth:carry}}
 function generate(seed){const r=rng(seed);for(let tries=1;tries<=250000;tries++){
  const P=lens.map(n=>by[n][r(by[n].length)]);
  for(const i of [ord[0],ord[ord.length-8]]){do{P[i]=seq(lens[i]).map(()=>S[r(29)]).join("")}while(D.has(P[i]))}
  let cw;do{cw=seq(11).map(()=>S[r(29)]).join("")}while(D.has(cw)||by[11].some(w=>w.startsWith(cw.slice(0,10))));
  P.push(cw);let k;do{k=seq(8).map(()=>r(29))}while([1,2,4].some(d=>k.every((v,i)=>v===k[i%d])));const origin=k.findIndex(x=>x!==0);k=k.slice(origin).concat(k.slice(0,origin));const scale=seq(29).find(x=>x*k[0]%29===1);k=k.map(x=>x*scale%29);const pi=[0,...shuffle(seq(28).map(x=>x+1),r)];const M=maps(pi,k),j=P.map(()=>r(8)),C=P.map((w,i)=>enc(w,M,j[i]));if(stats(C.slice(0,47).join("")+C[47].slice(0,10)).join()!=="3,2")continue;
  const H=hl.map(n=>by[n][r(by[n].length)]),h=H.map(()=>r(8)),HC=H.map((w,i)=>enc(w,M,h[i]));return {tries,pi,k,M,P,j,C,H,h,HC};
 }throw Error("matched plant cap "+seed)}
 // Known relative shifts plus phase-labelled consuming edges. Each edge is
 // pi[y]-pi[x]=k[j]. Components have fixed offsets, unknown translations.
 function recover(C,k,edges,limit){
  const g=seq(29).map(()=>[]);for(const [j,x,y] of edges){g[x].push([y,k[j]]);g[y].push([x,mod(-k[j])])}
  const seen=Array(29).fill(false),comps=[];for(let a=0;a<29;a++)if(!seen[a]){const v=[[a,0]],off=new Map([[a,0]]);seen[a]=true;for(let i=0;i<v.length;i++)for(const [b,d] of g[v[i][0]]){const x=mod(v[i][1]+d);if(off.has(b)){if(off.get(b)!==x)return {complete:true,components:0,candidates:0,passing:0,best:null}}else{off.set(b,x);seen[b]=true;v.push([b,x])}}if(new Set(v.map(x=>x[1])).size!==v.length)return {complete:true,components:0,candidates:0,passing:0,best:null};comps.push(v)}
  const fixed=comps.shift();comps.sort((a,b)=>b.length-a.length);const pi=Array(29).fill(-1);let mask=0;for(const [a,v] of fixed){pi[a]=v;mask|=1<<v}
  const placements=comps.map(v=>seq(29).map(t=>{const p=v.map(([a,d])=>[a,mod(d+t)]);return {p,m:p.reduce((m,[,x])=>m|(1<<x),0)}}));
  let candidates=0,passing=0,best=null,ties=0,complete=true,truthRetained=false;const winners=[];
  function dfs(i,used){if(!complete)return;if(i===placements.length){if(candidates===limit){complete=false;return}candidates++;const z=fit(C,maps(pi,k));if(z===null)return;passing++;if(best===null||z.score>best+1e-9){best=z.score;ties=1;winners.length=0;winners.push(pi.slice())}else if(Math.abs(z.score-best)<=1e-9){ties++;if(winners.length<16)winners.push(pi.slice())}return}for(const {p,m} of placements[i])if(!(used&m)){for(const [a,x] of p)pi[a]=x;dfs(i+1,used|m);if(!complete)return}}
  dfs(0,mask);return {complete,components:comps.length+1,candidates,passing,best,ties,winners};
 }

 // Only edges of one independently selected nonzero phase map are given;
 // no key-shift coordinates other than the normalization k[0]=1 are supplied.
 function cycleOnly(z,geo,m){
  const succ=Array(29).fill(-1),pred=Array(29).fill(-1);
  for(const [,x] of geo.slice(0,m)){const y=z.M[0][x];succ[x]=y;pred[y]=x}
  const chains=[];for(let a=0;a<29;a++)if(pred[a]===-1){const q=[];for(let x=a;x!==-1;x=succ[x])q.push(x);chains.push(q)}
  if(chains.reduce((a,b)=>a+b.length,0)!==29)throw Error("chain coverage");
  const root=chains.splice(chains.findIndex(v=>v.includes(0)),1)[0];
  const anchors=ord.filter(i=>z.C[i].length-Array.from(z.C[i]).filter(x=>x==="0").length>=8);
  if(anchors.length<3)throw Error("insufficient complete-vector anchors");
  const anchorWords=anchors.map(i=>({c:Array.from(z.C[i],x=>S.indexOf(x)),p:by[z.C[i].length].map(w=>Array.from(w,x=>S.indexOf(x)))}));
  function canonical(k){const rotations=[];for(let j=0;j<8;j++)if(k[j]===1)rotations.push(k.slice(j).concat(k.slice(0,j)).map(x=>S[x]).join(""));return rotations.sort()[0]}
  const truth=canonical(z.k);let alphabets=0,keyVectors=0,fullFits=0,passing=0,best=null,ties=0,winner=null;
  function evaluate(cycle){
   const q=cycle.indexOf(0),pi=Array(29);for(let i=0;i<29;i++)pi[cycle[(i+q)%29]]=i;alphabets++;
   const count=new Map();
   for(const {c,p} of anchorWords){const v=new Set();for(const w of p){
    const k=[];let legal=true,n=0;for(let i=0;i<c.length;i++){if(w[i]===0){if(c[i]!==0){legal=false;break}continue}const d=mod(pi[c[i]]-pi[w[i]]);if(n>=8&&k[n%8]!==d){legal=false;break}k[n%8]=d;n++}
    if(!legal||n<8||!k.includes(1)||[1,2,4].some(d=>k.every((x,i)=>x===k[i%d])))continue;
    v.add(canonical(k));
   }for(const k of v)count.set(k,(count.get(k)||0)+1)}
   keyVectors+=count.size;
   for(const [key,n] of count)if(n>=anchors.length-2){fullFits++;const k=Array.from(key,x=>S.indexOf(x)),r=fit(z.C.slice(0,47),maps(pi,k));if(!r)continue;passing++;if(best===null||r.score>best+1e-9){best=r.score;ties=1;winner={pi:pi.slice(),key}}else if(Math.abs(r.score-best)<=1e-9)ties++}
  }
  function permute(q,remaining){if(!remaining.length){evaluate(q);return}for(let i=0;i<remaining.length;i++)permute(q.concat(remaining[i]),remaining.slice(0,i).concat(remaining.slice(i+1)))}
  permute(root,chains);
  const exact=ties===1&&winner.key===truth&&winner.pi.join()===z.pi.join();
  return {m,anchors,alphabets,keyVectors,fullFits,passing,best,ties,exact,held:exact?held(z,maps(winner.pi,Array.from(winner.key,x=>S.indexOf(x)))):null,winner};
 }

 if(mode==="fixture"){
  const rows=[];for(let t=0;t<2;t++){
   let seed=0x30374200+t*16,z;do{z=generate(seed++);}while(fit(z.C.slice(0,47),z.M)?.bad!==2);
   rows.push({seed:seed-1,tries:z.tries,pi:z.pi,k:z.k,P:z.P,C:z.C,j:z.j,H:z.H,HC:z.HC,h:z.h});
  }
  return {schema:3,dict:D.size,rows};
 }

 if(mode==="cycle-only"){
  const out=[];for(let t=0;t<4;t++){
   const seed=0x30374100+t,gr=rng(0x3037e100+t),geo=shuffle(seq(28).map(x=>[0,x+1]),gr),z=generate(seed);
   const results=[27,25,24,23].map(m=>cycleOnly(z,geo,m));out.push({seed,tries:z.tries,key:z.k,pi:z.pi,edges:geo.map(([j,x])=>[j,x,z.M[j][x]]),results});
  }return {schema:2,dict:D.size,lens,hl,out};
 }

 const out=[],budgets=[27,25,23,21,20];for(let t=0;t<4;t++){
  const seed=0x30374000+t,gr=rng(0x3037e000+t),structured=shuffle(seq(28).map(x=>[0,x+1]),gr),random=shuffle(seq(224).map(x=>[Math.floor(x/28),x%28+1]),gr);
  const z=generate(seed);const results=[];
  for(const [mode,geo] of [["one-cycle",structured],["random-phase",random]])for(const m of budgets){
   const edges=geo.slice(0,m).map(([j,x])=>[j,x,z.M[j][x]]),r=recover(z.C.slice(0,47),z.k,edges,50000),exact=r.complete&&r.ties===1&&r.winners[0]?.join()===z.pi.join();const h=exact?held(z,maps(r.winners[0],z.k)):null;
   results.push({mode,m,clues:m+7,edges,complete:r.complete,components:r.components,candidates:r.candidates,passing:r.passing,best:r.best,ties:r.ties,exact,held:h});
  }
  out.push({seed,tries:z.tries,key:z.k,pi:z.pi,results});
 }
 return {schema:1,dict:D.size,lens,hl,budgets,out};
}
if(require.main===module) console.log(JSON.stringify(experiment(fs.readFileSync("resources/control/english_wordfreq_textblob.txt","utf8"),JSON.parse(fs.readFileSync("resources/liber-primus/lp2-page-groups-54-55-derived.json","utf8")),process.argv[2]||"mixed"),null,2));
module.exports={experiment};
