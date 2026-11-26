/** #3037: exact affine completion from phase-labelled plaintext/ciphertext alignment.
 * Matched-profile fixture generator reused; no original rune values scored. */
const fs=require("node:fs");
const {experiment:fixtures}=require("./lp2_q8_typed_edge_clue_completion_sft.cjs");
function study(raw,profile,generate=fixtures){
 const S="0123456789abcdefghijklmnopqrs", L="F U TH O R C G W H N I J EO P X S T B E M L NG OE D A AE Y IA EA".split(" "),D=new Set();
 for(const l of raw.split(/\r?\n/)){const m=l.match(/^([a-z]+)\s+([0-9]+)$/);if(!m)continue;const s=m[1].toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");function go(i,w){if(i===s.length){D.add(w);return}for(let j=0;j<29;j++)if(s.startsWith(L[j],i))go(i+L[j].length,w+S[j]);if(s.startsWith("ING",i))go(i+3,w+S[21])}go(0,"")}
 if(D.size!==38910)throw Error("dictionary");
 const seq=n=>Array.from({length:n},(_,i)=>i),mod=x=>(x%29+29)%29,inv=seq(29).map(x=>seq(29).find(y=>x*y%29===1));
 const budgets=[8,16,24,32,40,48,64,80,96,128,160,213];
 function rng(seed){let x=seed>>>0;return n=>{x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)%n}}
 function shuffle(a,r){for(let i=a.length-1;i>0;i--){const j=r(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
 function maps(pi,k){const v=[];pi.forEach((x,i)=>v[x]=i);return k.map(t=>pi.map(x=>v[mod(x+t)]))}
 function enc(w,M,j){let s="";for(const x of w){const p=S.indexOf(x);if(!p)s+="0";else{s+=S[M[j][p]];j=(j+1)%8}}return s}
 function paths(w,M,visit){const I=M.map(row=>{const a=[];row.forEach((x,i)=>a[x]=i);return a});const c=Array.from(w,x=>S.indexOf(x));function walk(i,j,p,start){if(i===c.length){if(enc(p,M,start)!==w)throw Error("replay");visit(p);return}if(!c[i])walk(i+1,j,p+"0",start);const x=I[j][c[i]];if(x!==0)walk(i+1,(j+1)%8,p+S[x],start)}for(let j=0;j<8;j++)walk(0,j,"",j)}
 function fit(z,M){let bad=0;for(const c of z.C.slice(0,47)){let ok=false;paths(c,M,p=>{if(D.has(p))ok=true});if(!ok&&++bad>2)return false}return true}
 function held(z,M){let retained=0,unique=0,carry=0,total=0;for(let i=0;i<z.H.length;i++){const w=new Set();paths(z.HC[i],M,p=>{if(D.has(p))w.add(p)});retained+=w.has(z.H[i]);unique+=w.size===1&&w.has(z.H[i])}paths(z.C[47],M,p=>{total++;carry+=p===z.P[47]});return {retained,unique,carry,total}}
 function equations(edges){const a=[Array(37).fill(0)];a[0][28]=1;a[0][36]=1;
 for(const [j,x,y] of edges){const q=Array(37).fill(0);if(y)q[y-1]++;if(x)q[x-1]--;q[28+j]--;a.push(q.map(mod))}
 let rank=0;const piv=[];for(let c=0;c<36;c++){let i=rank;while(i<a.length&&!a[i][c])i++;if(i===a.length)continue;[a[i],a[rank]]=[a[rank],a[i]];const q=a[rank],v=inv[q[c]];for(let j=c;j<37;j++)q[j]=mod(q[j]*v);for(let k=0;k<a.length;k++)if(k!==rank&&a[k][c]){const v=a[k][c];for(let j=c;j<37;j++)a[k][j]=mod(a[k][j]-v*q[j])}piv.push(c);rank++}
 if(a.slice(rank).some(q=>q[36]))throw Error("inconsistent plant");return {a,piv,rank,free:seq(36).filter(i=>!piv.includes(i))}}
 function recover(z,edges){const {a,piv,rank,free}=equations(edges);const truth=z.pi.slice(1).concat(z.k);
 if(a.some(q=>mod(q.slice(0,36).reduce((s,v,i)=>s+v*truth[i],0))!==q[36]))throw Error("truth constraint");
 const res={edges:edges.length,rank,dimension:free.length,complete:free.length<=3};if(!res.complete)return res;
 let legal=0,passing=0,truthPassing=false,only=null;const x=Array(36).fill(0);
 function visit(i){if(i<free.length){for(let v=0;v<29;v++){x[free[i]]=v;visit(i+1)}return}
 for(let j=0;j<rank;j++)x[piv[j]]=mod(a[j][36]-free.reduce((s,f)=>s+a[j][f]*x[f],0));
 const pi=[0,...x.slice(0,28)],k=x.slice(28);if(new Set(pi).size!==29||[1,2,4].some(d=>k.every((v,i)=>v===k[i%d])))return;legal++;
 const M=maps(pi,k);if(!fit(z,M))return;passing++;only=M;truthPassing||=x.every((v,i)=>v===truth[i]);}
 visit(0);if(!truthPassing)throw Error("lost plant");
 return {...res,legal,passing,truthPassing,exact:passing===1,held:passing===1?held(z,only):null}}
 const rows=[];const fixture=generate(raw,profile,"fixture",{seed:0x30374900,count:4});
 for(let t=0;t<fixture.rows.length;t++){const z=fixture.rows[t],M=maps(z.pi,z.k),g=rng(0x3037f900+t),positions=[],oracle=shuffle(seq(224).map(v=>[Math.floor(v/28),v%28+1]),g);
 for(let w=0;w<47;w++){let phase=z.j[w];for(let i=0;i<z.P[w].length;i++){const x=S.indexOf(z.P[w][i]),y=S.indexOf(z.C[w][i]);positions.push(x?[phase,x,y]:null);if(x)phase=(phase+1)%8}}
 if(positions.length!==213)throw Error("geometry");
 const order=shuffle(seq(213),g),results=[];
 for(const n of budgets){const contiguous=positions.slice(0,n).filter(Boolean),dispersed=order.slice(0,n).map(i=>positions[i]).filter(Boolean);for(const [kind,edges] of [["prefix",contiguous],["dispersed",dispersed],["oracle",oracle.slice(0,dispersed.length).map(([j,x])=>[j,x,M[j][x]])]])results.push({kind,n,...recover(z,edges)})}
 rows.push({seed:z.seed,tries:z.tries,k:z.k,results});
 }return {schema:1,budgets,rows};
}
if(require.main===module)console.log(JSON.stringify(study(fs.readFileSync("resources/control/english_wordfreq_textblob.txt","utf8"),JSON.parse(fs.readFileSync("resources/liber-primus/lp2-page-groups-54-55-derived.json","utf8"))),null,2));
module.exports={study};
