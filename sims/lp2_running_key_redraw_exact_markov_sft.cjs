'use strict';
// Node 22/CommonJS. Exact collision redraw receiver.
function study(inputs){
 const gp=JSON.parse(inputs[0]),native=JSON.parse(inputs[1]),Q=29,S=.81288,mod=x=>(x%Q+Q)%Q,assert=(x,m)=>{if(!x)throw Error(m)};
 const inv=Array.from({length:Q},(_,t)=>Array.from({length:Q},(_,j)=>j).find(j=>mod(j*t)===1));
 const runeMap=new Map(gp.runes.map((x,i)=>[x,i])),alpha=[["ING",21],["IO",27],...gp.translit.map((x,i)=>[x,i])].sort((a,b)=>b[0].length-a[0].length);
 function parse(s){return Array.from(s).filter(x=>runeMap.has(x)).map(x=>runeMap.get(x))}
 function body(s){const a=/\*\*\* START OF (?:THIS|THE) PROJECT GUTENBERG EBOOK[^\r\n]*\*\*\*/i.exec(s);if(a)s=s.slice(a.index+a[0].length);const b=/\*\*\* END OF (?:THIS|THE) PROJECT GUTENBERG EBOOK/i.exec(s);return b?s.slice(0,b.index):s;}
 function donor(s){const a=[];for(let w of body(s).match(/[A-Za-z]+/g)||[]){w=w.toUpperCase().replace(/QU/g,"CW").replace(/[KQ]/g,"C").replace(/V/g,"U").replace(/Z/g,"S");while(w){const t=alpha.find(x=>w.startsWith(x[0]));assert(t,"donor word "+w);a.push(t[1]);w=w.slice(t[0].length)}}return a;}
 const ds=inputs.slice(2).map(donor),sections=Object.fromEntries(native.sections.map(s=>[s.name,parse(s.source_text)])),cut=ds.map(a=>Math.floor(.65*a.length));
 function train(seqs){const counts=Array.from({length:Q},()=>new Float64Array(Q)),u=new Float64Array(Q).fill(.5);
  for(const a of seqs)for(let i=0;i<a.length;i++){u[a[i]]++;if(i)counts[a[i-1]][a[i]]++;}
  const n=u.reduce((a,b)=>a+b,0);for(let i=0;i<Q;i++)u[i]/=n;
  const T=counts.map(row=>{const n=row.reduce((a,b)=>a+b,0);return Float64Array.from(row,(x,i)=>(x+20*u[i])/(n+20))});T.push(u);return T;}
 const P=train([ds[1].slice(0,cut[1]),...Object.entries(sections).filter(([k])=>!["0_koan_1","0_loss_of_divinity"].includes(k)).map(([,v])=>v)]),K=train([ds[0].slice(0,cut[0])]);
 const orig=gp.pages.slice(0,56).flatMap(p=>p.indices),n=orig.length,split=gp.pages.slice(0,15).flatMap(p=>p.indices).length;
 assert(n===12956&&split===3603,"canonical original counts");
 let seed=0x8f153301;
 function u32(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0}
 function encode(p,key,t,hold){let j=0,prev=Q,skips=0;const c=[],events=[];
  for(const x of p){if(hold&&x===0){c.push(0);events.push([]);prev=0;continue}const a=[];let y;
   do{assert(j<key.length,"key donor exhausted");const k=key[j++];a.push(k);y=mod(x+t*k);if(y!==prev||u32()/4294967296>=S)break;skips++}while(true);
   c.push(y);events.push(a);prev=y;
  }return {c,skips,events,consumed:j};}
 function replay(p,events,t,hold,c){let prev=Q;for(let i=0;i<p.length;i++){const x=p[i],a=events[i];if(hold&&x===0){assert(a.length===0&&c[i]===0,"literal F replay");prev=0;continue}assert(a.length>0,"missing consumed rune");
 for(let j=0;j<a.length-1;j++)assert(prev!==Q&&mod(x+t*a[j])===prev,"invalid redraw");
 assert(mod(x+t*a[a.length-1])===c[i],"output replay");prev=c[i]}}
 function receiver(t,hold){
  const pair=Array.from({length:Q},(_,c)=>{const a=[];for(let p=hold?1:0;p<Q;p++)a.push([p,mod((c-p)*inv[t])]);if(hold&&c===0)for(let k=0;k<=Q;k++)a.push([0,k]);return a;});pair.push([[Q,Q]]);
  const mat=Array.from({length:Q+1},()=>Array(Q)),same=Array(Q);
  function matrix(prev,c,trace){let m=mat[prev][c];if(m&&(!trace||m.v))return m;
   const a=pair[prev],b=pair[c],w=new Float64Array(a.length*b.length),sum=new Float64Array(a.length),v=trace?new Float64Array(w.length):null,skip=trace?new Uint8Array(w.length):null;
   for(let i=0;i<a.length;i++){const [pp,kk]=a[i];for(let j=0;j<b.length;j++){const [p,k]=b[j],h=hold&&p===0,off=i*b.length+j;
    let z,mx=0,ns=0;
    if(h){z=mx=P[pp][p]*Number(k===kk)}else{
     const d=K[kk][k];let g=0,e=0,accept=1;
     if(prev!==Q){const r=mod((prev-p)*inv[t]);e=S*K[kk][r]*K[r][k];g=e/(1-S*K[r][r]);accept=c===prev?1-S:1;}
     const common=P[pp][p]*accept;z=common*(d+g);mx=common*Math.max(d,e);ns=Number(e>d);
    }
    w[off]=z;sum[i]+=z;if(trace){v[off]=mx>0?Math.log(mx):-Infinity;skip[off]=ns;}
   }}
   m={w,sum,n:b.length,v,skip};mat[prev][c]=m;if(prev===c)same[prev]=sum;return m;}
  function forward(c,nFit,trace=false){
   let prev=Q,weights=Float64Array.of(1),v=Float64Array.of(0),h=[],fit={ll:0,conditionalBF:0,predictedRepeats:0,repeats:0},held={...fit};
   for(let i=0;i<c.length;i++){const x=c[i],m=matrix(prev,x,trace),n=m.n,w=new Float64Array(n),nv=trace?new Float64Array(n).fill(-Infinity):null,bp=trace?new Int16Array(n).fill(-1):null,rs=trace?new Uint8Array(n):null;
    let rp=0;if(prev!==Q){const rr=same[prev]||matrix(prev,prev,false).sum;for(let a=0;a<weights.length;a++)rp+=weights[a]*rr[a];}
    for(let a=0;a<weights.length;a++){const off=a*n,wa=weights[a];for(let j=0;j<n;j++){w[j]+=wa*m.w[off+j];if(trace){const z=v[a]+m.v[off+j];if(z>nv[j]){nv[j]=z;bp[j]=a;rs[j]=m.skip[off+j]}}}}
    const mass=w.reduce((a,b)=>a+b,0);assert(mass>0,"zero mass");for(let j=0;j<n;j++)w[j]/=mass;
    const o=i<nFit?fit:held;o.ll+=Math.log(mass);o.predictedRepeats+=rp;o.repeats+=Number(x===prev);o.conditionalBF+=prev===Q?Math.log(mass*Q):x===prev?0:Math.log(mass/(1-rp)*(Q-1));
    if(trace){h.push({x,bp,rs,weights:w,scale:mass});v=nv}weights=w;prev=x;
   }
   const out={t,hold,fit,held};
   if(trace){let j=Array.from(v).reduce((a,x,i)=>x>v[a]?i:a,0),p=[],events=[];out.mapScore=v[j];
    for(let i=h.length-1;i>=0;i--){const [a,b]=pair[h[i].x][j],prev=i?c[i-1]:Q;p.push(a);events.push(hold&&a===0?[]:h[i].rs[j]?[mod((prev-a)*inv[t]),b]:[b]);j=h[i].bp[j]}
    p.reverse();events.reverse();replay(p,events,t,hold,c);out.plain=p;out.events=events;
    // Exact posterior probabilities of plaintext labels, marginalizing all key and redraw paths.
    let beta=new Float64Array(pair[c[c.length-1]].length).fill(1);const mbr=new Array(c.length),conf=new Array(c.length);
    for(let i=c.length-1;i>=0;i--){const probs=new Float64Array(Q),a=pair[c[i]];for(let k=0;k<a.length;k++)probs[a[k][0]]+=h[i].weights[k]*beta[k];
     const total=probs.reduce((a,b)=>a+b,0);assert(Math.abs(total-1)<1e-8,"posterior normalization "+total);
     const j=Array.from(probs).reduce((a,x,i)=>x>probs[a]?i:a,0);mbr[i]=j;conf[i]=probs[j];
     if(i){const m=matrix(c[i-1],c[i],true),next=new Float64Array(pair[c[i-1]].length);for(let a=0;a<next.length;a++){let z=0;for(let b=0;b<m.n;b++)z+=m.w[a*m.n+b]*beta[b];next[a]=z/h[i].scale}beta=next;}
    }out.mbr=mbr;out.conf=conf;
   }return out;
  }return {forward};
 }
 function slice(d,o,len){const a=ds[d].slice(cut[d]+o,cut[d]+o+len);assert(a.length===len,"donor length");return a;}
 const plants=[
 {name:"Emerson / Shakespeare A",p:slice(1,0,n),key:slice(0,0,n+3000),t:1,hold:true},
 {name:"Shakespeare / Emerson A",p:slice(0,18000,n),key:slice(1,18000,n+3000),t:7,hold:true},
 {name:"Emerson / Shakespeare B",p:slice(1,36000,n),key:slice(0,36000,n+3000),t:13,hold:false},
 {name:"Shakespeare / Emerson B",p:slice(0,54000,n),key:slice(1,54000,n+3000),t:28,hold:false}
 ];
 const cases=plants.map(a=>{const z=encode(a.p,a.key,a.t,a.hold);replay(a.p,z.events,a.t,a.hold,z.c);return {...a,c:z.c,skips:z.skips,consumed:z.consumed,rank:[]}});
 const repeatMatched=[u32()%Q];for(let i=1;i<n;i++){const p=repeatMatched[i-1];repeatMatched.push(orig[i]===orig[i-1]?p:mod(p+1+u32()%(Q-1)));}
 const uniformRedraw=[u32()%Q];for(let i=1;i<n;i++){const p=uniformRedraw[i-1];uniformRedraw.push(u32()/4294967296<(1-S)/(Q-S)?p:mod(p+1+u32()%(Q-1)));}
 cases.push({name:"uniform soft-redraw",c:uniformRedraw,rank:[]},{name:"original equality-pattern null",c:repeatMatched,rank:[]},{name:"original LP2",c:orig,rank:[]});
 for(const hold of [false,true])for(let t=1;t<Q;t++){const f=receiver(t,hold);for(const c of cases){const z=f.forward(c.c.slice(0,split),split);c.rank.push({t,hold,fit:z.fit});}}
 const results=[],render=a=>a.map(x=>gp.translit[x]).join("");
 for(const c of cases){c.rank.sort((a,b)=>b.fit.ll-a.fit.ll);const best=c.rank[0],f=receiver(best.t,best.hold),z=f.forward(c.c,split,true);assert(Math.abs(z.fit.ll-best.fit.ll)<1e-8,"prefix selection changed");
  const match=(a,b)=>a.reduce((v,x,i)=>v+Number(x===b[i]),0);
  const truth=c.p?{t:c.t,hold:c.hold,rank:c.rank.findIndex(x=>x.t===c.t&&x.hold===c.hold)+1,actualRedraws:c.skips,consumed:c.consumed,mapCorrect:match(z.plain,c.p),mbrCorrect:match(z.mbr,c.p),mapHeldCorrect:match(z.plain.slice(split),c.p.slice(split)),mbrHeldCorrect:match(z.mbr.slice(split),c.p.slice(split))}:null;
  const score=(s,m,first)=>{const nullLL=(first?-Math.log(Q):0)+s.repeats*Math.log((1-S)/(Q-S))+(m-s.repeats-Number(first))*Math.log(1/(Q-S));return {...s,softNullLogBF:s.ll-nullLL,llPerRune:s.ll/m,conditionalBFPerRune:s.conditionalBF/m};};
  results.push({name:c.name,truth,best:{t:best.t,hold:best.hold,fit:score(z.fit,split,true),held:score(z.held,n-split,false),mapScore:z.mapScore,mapRedraws:z.events.filter(a=>a.length>1).length,meanMbrConfidence:z.conf.reduce((a,b)=>a+b,0)/n,plain:render(z.plain.slice(0,100))+"…"+render(z.plain.slice(-100)),mbr:render(z.mbr.slice(0,100))+"…"+render(z.mbr.slice(-100))},rank:c.rank.map(x=>[x.t,x.hold,x.fit.ll,x.fit.conditionalBF])});
 }
 for(const hold of [false,true]){let mass=0;const f=receiver(7,hold);for(let c=0;c<Q;c++)for(let d=0;d<Q;d++)mass+=Math.exp(f.forward([c,d],2).fit.ll);assert(Math.abs(mass-1)<1e-10,"two-rune marginal normalization "+mass);}
 return {model:"continuous independent GP29 first-order P/K, C=P+tK, t=1..28, S=.81288 collision-only redraw consumes K not P, both clocks, exact infinite-redraw marginal and full event MAP + per-label posterior MBR; no word cuts",n,split,S,donorLengths:ds.map(a=>a.length),trainingLengths:cut,results};
}
const fs=require('node:fs'),path=require('node:path');
const files=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/gibran_prophet_58585.txt"];
if(require.main===module)console.log(JSON.stringify(study(files.map(p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8'))),null,2));
module.exports={study,files};
