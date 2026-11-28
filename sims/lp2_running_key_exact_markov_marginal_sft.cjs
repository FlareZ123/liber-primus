'use strict';
// Node 22 / CommonJS; fixed source files. Run node sims/lp2_running_key_exact_markov_marginal_sft.cjs short|long
function study(inputs,mode="long"){
 const gp=JSON.parse(inputs[0]),native=JSON.parse(inputs[1]),Q=29,mod=x=>(x%Q+Q)%Q,assert=(x,m)=>{if(!x)throw Error(m)};
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
 function encode(p,k,t,h){let j=0;return p.map(x=>h&&x===0?0:mod(x+t*k[j++]));}
 function receiver(t,hold){
  // pair[c] = all possible (last plaintext, last consumed key) states consistent with c.
  const pair=Array.from({length:Q},(_,c)=>{const a=[];for(let p=hold?1:0;p<Q;p++)a.push([p,mod((c-p)*inv[t])]);if(hold&&c===0)for(let k=0;k<=Q;k++)a.push([0,k]);return a;});pair.push([[Q,Q]]);
  const mat=Array.from({length:Q+1},()=>Array(Q)),same=Array(Q);
  function matrix(prev,c){let m=mat[prev][c];if(m)return m;const a=pair[prev],b=pair[c],w=new Float64Array(a.length*b.length),sum=new Float64Array(a.length);
   for(let i=0;i<a.length;i++){const [pp,kk]=a[i];for(let j=0;j<b.length;j++){const [p,k]=b[j],h=hold&&p===0;const z=P[pp][p]*(h?Number(k===kk):K[kk][k]);w[i*b.length+j]=z;sum[i]+=z;}}
   m={w,sum,n:b.length};mat[prev][c]=m;if(prev===c)same[prev]=sum;return m;}
  function forward(c,nFit,trace=false){
   let prev=Q,weights=Float64Array.of(1),v=Float64Array.of(0),h=[],fit={ll:0,conditionalBF:0,predictedRepeats:0,repeats:0},held={...fit};
   for(let i=0;i<c.length;i++){const x=c[i],m=matrix(prev,x),n=m.n,w=new Float64Array(n),nv=trace?new Float64Array(n).fill(-Infinity):null,bp=trace?new Int16Array(n).fill(-1):null;
    let rp=0;if(prev!==Q){const rr=same[prev]||matrix(prev,prev).sum;for(let a=0;a<weights.length;a++)rp+=weights[a]*rr[a];}
    for(let a=0;a<weights.length;a++){const off=a*n,wa=weights[a];for(let j=0;j<n;j++){const p=m.w[off+j];w[j]+=wa*p;if(trace&&p>0){const z=v[a]+Math.log(p);if(z>nv[j]){nv[j]=z;bp[j]=a}}}}
    const mass=w.reduce((a,b)=>a+b,0);assert(mass>0,"zero mass");for(let j=0;j<n;j++)w[j]/=mass;
    const o=i<nFit?fit:held;o.ll+=Math.log(mass);o.predictedRepeats+=rp;o.repeats+=Number(x===prev);o.conditionalBF+=prev===Q?Math.log(mass*Q):x===prev?0:Math.log(mass/(1-rp)*(Q-1));
    if(trace){h.push({x,bp});v=nv}weights=w;prev=x;
   }
   const out={t,hold,fit,held};
   if(trace){let j=Array.from(v).reduce((a,x,i)=>x>v[a]?i:a,0),p=[],k=[];out.mapScore=v[j];for(let i=h.length-1;i>=0;i--){const [a,b]=pair[h[i].x][j];p.push(a);k.push(hold&&a===0?null:b);j=h[i].bp[j]}p.reverse();k.reverse();assert(String(encode(p,k.filter(x=>x!==null),t,hold))===String(c),"forward replay");out.plain=p;out.key=k;}
   return out;
  }
  return {forward};
 }
 const originalFull=gp.pages.slice(0,56).flatMap(p=>p.indices),longSplit=gp.pages.slice(0,15).flatMap(p=>p.indices).length;
 assert(originalFull.length===12956&&gp.pages[54].indices.length===232&&gp.pages[55].indices.length===76,"canonical source counts");
 const n=mode==="short"?308:originalFull.length,split=mode==="short"?232:longSplit,orig=mode==="short"?originalFull.slice(-308):originalFull;
 function slice(d,o){const a=ds[d].slice(cut[d]+o,cut[d]+o+n);assert(a.length===n,"held donor length "+d+" "+a.length+"/"+n);return a;}
 const plants=mode==="short"?[
 {name:"native-koan / held Shakespeare",p:sections["0_koan_1"].slice(20,20+n),k:slice(0,1234),t:1,hold:true},
 {name:"native-divinity / held Gibran",p:sections["0_loss_of_divinity"].slice(40,40+n),k:slice(2,500),t:7,hold:true},
 {name:"held Emerson / held Shakespeare",p:slice(1,900),k:slice(0,4321),t:13,hold:false},
 {name:"held Gibran / held Emerson",p:slice(2,1800),k:slice(1,1300),t:28,hold:false}
 ]:[
 {name:"held Emerson / held Shakespeare",p:slice(1,1000),k:slice(0,2000),t:1,hold:true},
 {name:"held Shakespeare / held Emerson",p:slice(0,10000),k:slice(1,20000),t:7,hold:true},
 {name:"held Emerson / held Shakespeare B",p:slice(1,26000),k:slice(0,30000),t:13,hold:false},
 {name:"held Shakespeare / held Emerson B",p:slice(0,40000),k:slice(1,45000),t:28,hold:false}
 ];
 for(const a of plants)assert(a.p.length===n&&a.k.length===n,"plant length");
 let seed=0x29f13301;function rand(k){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)%k;}
 const uniform=Array.from({length:n},()=>rand(Q)),repeatMatched=[rand(Q)];for(let i=1;i<n;i++){const p=repeatMatched[i-1];repeatMatched.push(orig[i]===orig[i-1]?p:mod(p+1+rand(Q-1)));}
 const cases=[...plants.map(a=>({...a,c:encode(a.p,a.k,a.t,a.hold),rank:[]})),{name:"iid uniform",c:uniform,rank:[]},{name:"original equality-pattern null",c:repeatMatched,rank:[]},{name:"original",c:orig,rank:[]}];
 // Rank model only on prefix. The suffix is not evaluated until each case's selector is fixed.
 for(const hold of [false,true])for(let t=1;t<Q;t++){const f=receiver(t,hold);for(const c of cases){const z=f.forward(c.c.slice(0,split),split);c.rank.push({t,hold,fit:z.fit});}}
 const results=[];
 const render=a=>a.map(x=>x===null?"·":gp.translit[x]).join("");
 for(const c of cases){c.rank.sort((a,b)=>b.fit.ll-a.fit.ll);const best=c.rank[0],f=receiver(best.t,best.hold),z=f.forward(c.c,split,true);
  assert(Math.abs(z.fit.ll-best.fit.ll)<1e-8,"prefix selection changed");
  const match=(a,b)=>a.reduce((v,x,i)=>v+Number(x===b[i]),0);
  const truth=c.p?{t:c.t,hold:c.hold,rank:c.rank.findIndex(x=>x.t===c.t&&x.hold===c.hold)+1,fitCorrect:match(z.plain.slice(0,split),c.p.slice(0,split)),heldCorrect:match(z.plain.slice(split),c.p.slice(split))}:null;
  const score=(s,m)=>({...s,logBF:s.ll+m*Math.log(Q),llPerRune:s.ll/m,conditionalBFPerRune:s.conditionalBF/m});
  results.push({name:c.name,truth,best:{t:best.t,hold:best.hold,fit:score(z.fit,split),held:score(z.held,n-split),mapScore:z.mapScore,plain:mode==="short"?render(z.plain):render(z.plain.slice(0,100))+"…"+render(z.plain.slice(-100)),key:mode==="short"?render(z.key):render(z.key.slice(0,100))+"…"+render(z.key.slice(-100))},rank:c.rank.map(x=>[x.t,x.hold,x.fit.ll,x.fit.conditionalBF])});
 }
 // Independent emission-mass test: all possible pairs sum to one under each bypass rule.
 for(const hold of [false,true]){let mass=0;const f=receiver(7,hold);for(let c=0;c<Q;c++)for(let d=0;d<Q;d++)mass+=Math.exp(f.forward([c,d],2).fit.ll);assert(Math.abs(mass-1)<1e-10,"two-rune marginal normalization "+mass);}
 return {model:"continuous C=P+tK mod29, t=1..28; ordinary vs mandatory true-F holds; exact normalized first-order Markov marginal; no beam; sequential equality-conditioned score; Viterbi is full-input smoothing",mode,n,split,donorLengths:ds.map(a=>a.length),trainingLengths:cut,results};
}
const fs=require('node:fs'),path=require('node:path');
const files=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/gibran_prophet_58585.txt"];
if(require.main===module)console.log(JSON.stringify(study(files.map(p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8')),process.argv[2]||'long'),null,2));
module.exports={study,files};
