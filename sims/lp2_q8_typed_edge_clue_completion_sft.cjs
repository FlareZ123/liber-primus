/** #3037 exact typed-edge completion; no original ciphertext fit. */
const fs=require("node:fs");
function experiment(raw,profile){
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
if(require.main===module) console.log(JSON.stringify(experiment(fs.readFileSync("resources/control/english_wordfreq_textblob.txt","utf8"),JSON.parse(fs.readFileSync("resources/liber-primus/lp2-page-groups-54-55-derived.json","utf8"))),null,2));
module.exports={experiment};
