"use strict";
// Agent20 #3213. All-key conjugate orbit capacity and held native controls.
function run(corpus,txt,solved){
 const A=29,R=n=>Array.from({length:n},(_,i)=>i),mod=x=>(x%29+29)%29,sum=a=>a.reduce((x,y)=>x+y,0),assert=(v,m)=>{if(!v)throw Error(m)},powers=[1,12,28,17],inv=[1,17,28,12];
 const tok=corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 const gp=(txt.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").match(/[A-Z]+/g)||[]).flatMap(w=>{let a=[];for(let i=0;i<w.length;){if(w.startsWith("ING",i)){a.push(21);i+=3;}else if(w.startsWith("IO",i)){a.push(27);i+=2;}else{let t=tok.find(t=>w.startsWith(t.s,i));assert(t,w);a.push(t.i);i+=t.s.length;}}return a;});
 const C=corpus.pages.filter(p=>p.page<=55).flatMap(p=>p.indices),n=C.length,train=gp.slice(0,18000),U=R(A).map(()=>1),B=R(A).map(()=>R(A).map(()=>1));
 train.forEach((p,i)=>{U[p]++;if(i)B[train[i-1]][p]++;});
 const logU=U.map(v=>Math.log(v/sum(U))),L=B.map(row=>row.map(v=>Math.log(v/sum(row))));
 const act=(r,s,x)=>mod(r+powers[s]*(x-r));
 const unact=(r,s,x)=>mod(r+inv[s]*(x-r));
 function orbit(r){const seen=new Set(),O=[];for(let x of R(A)){if(seen.has(x))continue;const o=[...new Set(R(4).map(s=>act(r,s,x)))];o.forEach(v=>seen.add(v));O.push(o);}return O;}
 function rng(seed){return ()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)/4294967296;};}
 function key(r,rnd){const k=R(A).filter(x=>x!==r);for(let i=k.length-1;i>0;i--){let j=Math.floor(rnd()*(i+1));[k[i],k[j]]=[k[j],k[i]];}k.splice(r,0,r);return k;}
 function invert(k){let a=R(A);k.forEach((p,i)=>a[p]=i);return a;}
 // Ciphertext state is cumulative ciphertext mod 4, with initial state 0 and preceding c=0.
 function parse(c,r,s=0){let prev=0;return Array.from(c,x=>{const z=unact(r,s,mod(r+x-prev)),v=s*A+z;s=(s+x)%4;prev=x;return v;});}
 function decode(z,k,r){return z.map(v=>act(r,Math.floor(v/A),k[v%A]));}
 function encode(p,ks,r){let prev=0,s=0;const is=ks.map(invert);return p.map(x=>{const t=ks.length===1?act(r,s,is[0][unact(r,s,x)]):is[s][x];let c=mod(prev+t-r);s=(s+c)%4;prev=c;return c;});}
 function hist(z){const h=R(A).map(()=>0);z.forEach(v=>h[v%A]++);return h;}
 function orbitCounts(p,r){const f=R(A).map(()=>0);p.forEach(x=>f[x]++);return orbit(r).map(o=>sum(o.map(x=>f[x])));}
 function cap(h,k=4){return sum(h.slice().sort((a,b)=>b-a).slice(0,k));}
 function exactOrbitCheck(z,p,k,r){const h=hist(z),o=orbit(r),got=orbitCounts(p,r);return o.every((q,i)=>sum(h.filter((_,x)=>q.includes(k[x])))===got[i]);}
 function assignment(cost){const n=cost.length,u=Array(n+1).fill(0),v=u.slice(),p=u.slice(),way=u.slice();for(let i=1;i<=n;i++){p[0]=i;let j0=0,minv=Array(n+1).fill(Infinity),used=Array(n+1).fill(false);do{used[j0]=true;let i0=p[j0],d=Infinity,j1=0;for(let j=1;j<=n;j++)if(!used[j]){let x=cost[i0-1][j-1]-u[i0]-v[j];if(x<minv[j]){minv[j]=x;way[j]=j0;}if(minv[j]<d){d=minv[j];j1=j;}}for(let j=0;j<=n;j++)if(used[j]){u[p[j]]+=d;v[j]-=d;}else minv[j]-=d;j0=j1;}while(p[j0]);do{let j1=way[j0];p[j0]=p[j1];j0=j1;}while(j0);}let a=R(n);for(let j=1;j<=n;j++)a[p[j]-1]=j-1;return a;}
 function learn(z,r,fit,seed){
   const M=4*A,F=R(M).map(()=>0),H=R(M).map(()=>new Uint32Array(M)),trans=R(4).map(s=>R(A).map(p=>act(r,s,p))),adj=R(A).map(()=>[]),edges=[];
   for(let i=0;i<fit;i++){F[z[i]]++;if(i)H[z[i-1]][z[i]]++;}
   for(let i=0;i<M;i++)for(let j=0;j<M;j++)if(H[i][j]){const id=edges.length,x=i%A,y=j%A;edges.push([Math.floor(i/A),x,Math.floor(j/A),y,H[i][j]]);adj[x].push(id);if(x!==y)adj[y].push(id);}
   const init=assignment(R(A).map(x=>R(A).map(p=>-sum(R(4).map(s=>F[s*A+x]*logU[trans[s][p]])))));
   const edgeScore=(e,k)=>e[4]*L[trans[e[0]][k[e[1]]]][trans[e[2]][k[e[3]]]];
   const score=k=>sum(edges.map(e=>edgeScore(e,k)));
   const pair=R(A).map(a=>R(A).map(b=>[...new Set([...adj[a],...adj[b]])]));
   function delta(k,a,b){let d=0;const ka=k[a],kb=k[b];for(let id of pair[a][b]){let e=edges[id],x=k[e[1]],y=k[e[3]],xx=e[1]===a?kb:e[1]===b?ka:x,yy=e[3]===a?kb:e[3]===b?ka:y;d+=e[4]*(L[trans[e[0]][xx]][trans[e[2]][yy]]-L[trans[e[0]][x]][trans[e[2]][y]]);}return d;}
   const rnd=rng(seed),swap=(k,a,b)=>{[k[a],k[b]]=[k[b],k[a]];};let best=init.slice(),bestV=score(best);
   for(let restart=0;restart<4;restart++){let k=init.slice();if(restart)for(let i=0;i<4*restart;i++)swap(k,Math.floor(rnd()*A),Math.floor(rnd()*A));let v=score(k);
    for(let step=0;step<9000;step++){let a=Math.floor(rnd()*A),b=Math.floor(rnd()*A);if(a===b)continue;let d=delta(k,a,b),t=7*Math.pow(.01,step/9000);if(d>0||rnd()<Math.exp(d/t)){swap(k,a,b);v+=d;if(v>bestV){bestV=v;best=k.slice();}}}
    assert(Math.abs(v-score(k))<1e-5,"delta mismatch");
    for(let i=0;i<50;i++){let aa=-1,bb=-1,dd=1e-9;for(let a=0;a<A;a++)for(let b=a+1;b<A;b++){let d=delta(k,a,b);if(d>dd){aa=a;bb=b;dd=d;}}if(aa<0)break;swap(k,aa,bb);}
    v=score(k);if(v>bestV){bestV=v;best=k.slice();}
   }
   return {init,best,initScore:score(init),fitScore:bestV};
 }
 const repeats=c=>sum(c.map((v,i)=>+(i>0&&v===c[i-1])));
 const origRepeats=repeats(C),all=R(A).map(r=>{let f=R(A).map(()=>0),o=orbit(r),min=Infinity,minStart=-1,matched=[];for(let i=0;i<gp.length;i++){f[gp[i]]++;if(i>=n)f[gp[i-n]]--;if(i>=n-1){let m=Math.max(...o.filter(q=>q.length===4).map(q=>sum(q.map(x=>f[x]))));if(m<min){min=m;minStart=i-n+1;}if(i-n+1>=18000&&f[r]-(gp[i-n+1]===r?1:0)===origRepeats)matched.push(i-n+1);}}
 let caps=R(4).map(s=>cap(hist(parse(C,r,s))));return {r,min,minStart,maxOriginalCap:Math.max(...caps),caps,margin:min-Math.max(...caps),matched:matched.length,firstMatched:matched[0]??null};});
 const plants=[];
 function plant(p,r,seed,type,fit=Math.floor(p.length*.65)){
   const rnd=rng(seed),k=key(r,rnd),rival=R(4).map(()=>key(r,rnd)),c=encode(p,[k],r),w=encode(p,rival,r);
   assert(c.every((x,i)=>!i||+(x===c[i-1])===+(w[i]===w[i-1])),"repeat mask rival");
   const z=parse(c,r);assert(decode(z,k,r).every((x,i)=>x===p[i]),"native inverse");assert(exactOrbitCheck(z,p,k,r),"orbit identity");
   for(const [label,tape] of [["conjugate",c],["independent",w]]){
    const q=parse(tape,r),h=learn(q,r,fit,seed+122),dec=decode(q,h.best,r),init=decode(q,h.init,r),seen=new Set(q.slice(0,fit).map(v=>v%A));
    assert(encode(dec,[h.best],r).every((x,i)=>x===tape[i]),"replay");
    const held=p.length-fit,hit=x=>sum(x.slice(fit).map((v,i)=>+(v===p[i+fit]))),heldScore=sum(dec.slice(fit).map((v,i)=>L[dec[fit+i-1]][v]))/held;
    // Labelled-prefix exact oracle gauges: each occurrence directly determines K[z].
    const known=new Map();let conflicts=0;for(let i=0;i<fit;i++){const v=q[i],x=v%A,y=unact(r,Math.floor(v/A),p[i]);if(known.has(x)&&known.get(x)!==y)conflicts++;else known.set(x,y);}
    const uniqueValues=new Set(known.values()).size;
    plants.push({type,label,r,seed,n:p.length,fit,repeats:repeats(tape),cap:cap(hist(q)),nativeMaxOrbit:Math.max(...orbitCounts(p,r).filter((_,i)=>orbit(r)[i].length===4)),initHeld:hit(init),heldHits:hit(dec),held,heldScore,fitScore:h.fitScore,keyMatches:label==="conjugate"?sum(h.best.map((v,i)=>+(v===k[i]))):null,seen:seen.size,oracleConflicts:conflicts,oracleKnown:known.size,oracleUniqueValues:uniqueValues,heldUnseen:q.slice(fit).filter(v=>!seen.has(v%A)).length,originalKey:label==="conjugate"?k:null,fitKey:h.best});
   }
 }
 for(const r of [21,27]){const a=all[r].firstMatched;assert(a!==null,"repeat matched donor");plant(gp.slice(a,a+n),r,1729+r,`Gibran exact-repeat window ${a}`);}
 const native=solved.sections.map(s=>[...s.source_text].map(c=>corpus.runes.indexOf(c)).filter(x=>x>=0)).sort((a,b)=>b.length-a.length)[0];
 plant(native,21,3301,"longest solved GP source");
 return {definition:"q4 cumulative ciphertext state, GP29 centered order-four affine conjugacy, differential output",n,origRepeats,train:train.length,gibran:gp.length,windows:gp.length-n+1,all,plants,overlap:"Gibran exact-repeat windows overlap; separate keys and centers, same training split. Solved native independent.",originalHistogramCenter0:hist(parse(C,0)),originalFit:false};
}
module.exports={run};
if(require.main===module){const fs=require("node:fs");const read=p=>fs.readFileSync(p,"utf8");console.log(JSON.stringify(run(JSON.parse(read("resources/liber-primus/lp2-corpus.json")),read("resources/control/gibran_prophet_58585.txt"),JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"))),null,2));}
