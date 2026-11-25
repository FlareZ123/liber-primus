// Agent31: spacing-free q8 BASE29 multiplier carry with literal Fehu holds.
// node sims/lp2_base29_lattice_blind_fhold_sft.cjs [controls|original|all]
const fs=require('node:fs');
function attack(gp,gold,freq,stage="controls"){
 const ok=(v,m)=>{if(!v)throw Error(m)},eq=(a,b)=>a.join()===b.join();
 const abs=x=>x<0n?-x:x,mod=(x,m)=>(x%m+m)%m,pow=n=>29n**BigInt(n);
 const num=a=>a.reduceRight((x,y)=>x*29n+BigInt(y),0n),reverse=a=>a.slice().reverse();
 const min=(a,b)=>a<b?a:b,max=(a,b)=>a>b?a:b;
 const floor=(a,b)=>a>=0n?a/b:-((-a+b-1n)/b),ceil=(a,b)=>-floor(-a,b);
 const dot=(a,b)=>a[0]*b[0]+a[1]*b[1],norm=a=>dot(a,a);
 function reduce(X,M){
  let a=[1n,mod(X,M)],b=[0n,M];let iterations=0;
  while(true){if(norm(b)<norm(a))[a,b]=[b,a];const n=norm(a),d=dot(a,b);if(2n*abs(d)<=n)break;const q=(d<0n?-1n:1n)*((2n*abs(d)+n)/(2n*n));b=[b[0]-q*a[0],b[1]-q*a[1]];if(++iterations>1000)throw Error("reduction cap")}
  if(a[0]*b[1]-a[1]*b[0]<0n)b=b.map(x=>-x);
  ok(a[0]*b[1]-a[1]*b[0]===M,"determinant");return [a,b]
 }
 let queries=0,points=0,maxBox=0n;

 const A=29n**8n-1n,R=A+1n,B=29n**10n,M=R*B,W=16,FIT=249;
 const digits=(x,n)=>{const a=[];for(let i=0;i<n;i++){a.push(Number(x%29n));x/=29n}ok(x===0n,"digit width");return a};
 const idx=new Map(gp.runes.map((x,i)=>[x,i])),tokens=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
 const words=s=>(s.match(/[\u16a0-\u16ff]+/gu)||[]).map(t=>[...t].map(x=>idx.get(x))).filter(w=>w.every(Number.isInteger));
 function word(w,alt){w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const o=[];for(let j=0;j<w.length;){const q=alt&&w.startsWith("ING",j)?{t:"ING",i:21}:alt&&w.startsWith("IO",j)?{t:"IO",i:27}:tokens.find(o=>w.startsWith(o.t,j));ok(q,"spelling "+w);o.push(q.i);j+=q.t.length;}return o}
 const anchors=new Set();for(const l of freq.split(/\r?\n/)){const m=l.match(/^([a-z]+)\s+(\d+)$/i);if(m)for(const alt of [true,false]){const a=word(m[1],alt);if(a.filter(x=>x!==0).length===10)anchors.add(a.join(","))}}
 const grouped=new Map();for(const s of anchors){const a=s.split(",").map(Number),mask=a.flatMap((x,i)=>x===0?[i]:[]),key=a.length+":"+mask.join(",");if(!grouped.has(key))grouped.set(key,{length:a.length,mask,values:[]});grouped.get(key).values.push(num(a.filter(x=>x!==0)))}
 const groups=[...grouped.values()];
 function rectangle(X,basis,pval){
   queries++;const [u,v]=basis,Y=pval*R,H=Y+R-1n,L=Y-A+1n;
   function interval(ax,ay){const l=min(ax,ax*A)+min(ay*L,ay*H),h=max(ax,ax*A)+max(ay*L,ay*H);return [ceil(l,M),floor(h,M)]}
   const [l1,h1]=interval(v[1],-v[0]),[l2,h2]=interval(-u[1],u[0]);if(h1<l1||h2<l2)return [];
   const box=(h1-l1+1n)*(h2-l2+1n);maxBox=max(maxBox,box);ok(box<=1000000n,"lattice box cap");const out=[];
   for(let i=l1;i<=h1;i++)for(let j=l2;j<=h2;j++){points++;const a=i*u[0]+j*v[0],y=i*u[1]+j*v[1];if(a<1n||a>A||a%29n===0n||y>H||y+a-1n<Y)continue;ok(mod(a*X-y,M)===0n,"lattice congruence");out.push(a)}
   return out
 }
 function previous(C,i){const out=new Set();function rec(j,n,x){if(n===8){out.add(x);return}if(j<0)return;rec(j-1,n+1,x*29n+BigInt(C[j]));if(C[j]===0)rec(j-1,n,x)}rec(i-1,0,0n);return out}
 function nominate(C){
  const keys=new Set();let positions=0,contexts=0,groupFits=0,raw=0;
  for(let i=8;i+10<=C.length;i++){const pre=previous(C,i);if(!pre.size)continue;positions++;
   for(const g of groups){if(i+g.length>C.length||g.mask.some(j=>C[i+j]!==0))continue;groupFits++;
    const hold=new Set(g.mask),active=C.slice(i,i+g.length).filter((_,j)=>!hold.has(j));ok(active.length===10,"anchor width");const y=num(active)*R;
    for(const p of pre){contexts++;const X=y+p,basis=reduce(X,M);for(const val of g.values)for(const a of rectangle(X,basis,val)){raw++;keys.add(a)}}
   }
  }return {keys,positions,contexts,groupFits,raw}
 }
 function lmFor(excluded){const uni=new Float64Array(29),bi=new Float64Array(29**2),tri=new Float64Array(29**3);let total=0;for(const s of gold.sections)if(s.name!==excluded){const a=words(s.source_text).flat();for(let i=0;i<a.length;i++){uni[a[i]]++;total++;if(i)bi[a[i-1]*29+a[i]]++;if(i>1)tri[(a[i-2]*29+a[i-1])*29+a[i]]++}}
  const lm=new Float64Array(29**3);for(let a=0;a<29;a++)for(let b=0;b<29;b++)for(let c=0;c<29;c++){const p0=(uni[c]+0.5)/(total+14.5),p1=(bi[b*29+c]+8*p0)/(uni[b]+8),p2=(tri[(a*29+b)*29+c]+8*p1)/(bi[a*29+b]+8);lm[(a*29+b)*29+c]=Math.log(p2)}return lm
 }
 function warmMasks(C){const masks=[];function rec(i,active,holds){if(i===W){ok(active.length>=8,"warmup too few consumed symbols");masks.push({X:num(active),n:active.length,holds:holds.slice()});return}active.push(C[i]);rec(i+1,active,holds);active.pop();if(C[i]===0){holds.push(i);rec(i+1,active,holds);holds.pop()}}rec(0,[],[]);return masks}
 function nextNonzero(x,n){const a=digits(x,n);for(let i=n-1;i>=0;i--)if(a[i]===0){for(let j=i;j>=0;j--)a[j]=1;return num(a)}return x}
 function initial(a,masks){const out=new Map();for(const m of masks){const modn=pow(m.n),x=a*m.X;for(let carry=x/modn;carry<=(x+a-1n)/modn;carry++){const lo=max(0n,x-carry*modn),hi=min(modn-1n,x+a-1n-carry*modn),p=nextNonzero(lo,m.n);if(p>hi)continue;const s0=p+carry*modn-x,ds=digits(p,m.n),h=new Set(m.holds),P=[];let k=0;for(let i=0;i<W;i++)P.push(h.has(i)?0:ds[k++]);const key=String(carry);if(!out.has(key))out.set(key,{carry,b:-1,c:-1,score:0,path:null,warm:P,s0})}}return [...out.values()]}
 function decode(C,a,states,lm){let count=0,maxStates=states.length;
  for(const cv of C){const next=new Map(),c=BigInt(cv);for(const st of states){
    const add=(p,carry)=>{const score=st.score+(st.b<0?0:lm[(st.b*29+st.c)*29+p]),key=carry+":"+st.c+":"+p,prev=next.get(key);if(!prev||score>prev.score)next.set(key,{carry,b:st.c,c:p,score,path:{p,prev:st.path},warm:st.warm,s0:st.s0})};
    if(cv===0)add(0,st.carry);
    const z=a*c+st.carry,p=Number(z%29n);if(p!==0)add(p,z/29n)
   }states=[...next.values()];count++;maxStates=Math.max(maxStates,states.length);if(!states.length)return {best:null,count,maxStates};}
  let best=null;for(const s of states)if(!best||s.score>best.score)best=s;return {best,count,maxStates}
 }
 function unpath(node){const o=[];for(let t=node;t;t=t.prev)o.push(t.p);return o.reverse()}
 function encode(P,a,s0){let s=s0,iv=1n;while(mod(a*iv,29n)!==1n)iv++;const C=[];for(const p of P){if(!p){C.push(0);continue}const c=mod((BigInt(p)-s)*iv,29n);s=(a*c+s-BigInt(p))/29n;ok(s>=0n&&s<a,"carry bound");C.push(Number(c))}return C}
 function solve(C,fitN,excluded){
  const nom=nominate(C.slice(0,fitN)),lm=lmFor(excluded),masks=warmMasks(C),keys=[...nom.keys];let winner=null,legal=0,maxStates=0;const finalists=[],fullReachable=[];
  for(const a of keys){const ini=initial(a,masks);if(!ini.length)continue;const d=decode(C.slice(W,fitN),a,ini,lm);maxStates=Math.max(maxStates,d.maxStates);if(!d.best)continue;legal++;const full=decode(C.slice(W),a,ini,lm);if(full.best){const Pfull=full.best.warm.concat(unpath(full.best.path));ok(eq(encode(Pfull,a,full.best.s0),C),"all-key full replay");fullReachable.push({a:String(a),score:full.best.score/(C.length-W-2),Pfull,initialCarry:String(full.best.s0)});}const row={a,state:d.best};finalists.push({a:String(a),score:d.best.score});if(!winner||row.state.score>winner.state.score||row.state.score===winner.state.score&&a<winner.a)winner=row}
  const summary={anchors:anchors.size,patterns:groups.length,positions:nom.positions,contexts:nom.contexts,groupFits:nom.groupFits,rawWitnesses:nom.raw,keys:keys.length,legal,fullReachable,maxStates,top:finalists.sort((a,b)=>b.score-a.score).slice(0,5)};
  if(!winner)return {...summary,key:null};const {a,state}=winner,Pfit=state.warm.concat(unpath(state.path));ok(Pfit.length===fitN,"fit width");ok(eq(encode(Pfit,a,state.s0),C.slice(0,fitN)),"fit replay");
  const frozen={...state,score:0,path:null};const h=decode(C.slice(fitN),a,[frozen],lm);const result={...summary,key:String(a),fitScore:state.score/(fitN-W-2),Pfit,initialCarry:String(state.s0),frozenCarry:String(state.carry),holdoutReached:h.count,holdoutLength:C.length-fitN,holdoutScore:h.best?h.best.score/(C.length-fitN):null,Phold:h.best?unpath(h.best.path):null};
  if(result.Phold)ok(eq(encode(Pfit.concat(result.Phold),a,state.s0),C),"full replay");return result
 }
 let seed=0x29100855;function rng(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0}function key(){let a=BigInt(rng())*4294967296n+BigInt(rng());a=mod(a,pow(7))+pow(7)*(1n+BigInt(rng()%28));if(a%29n===0n)a++;return a}
 const out={stage,anchors:anchors.size,patterns:groups.length};
 if(stage==="controls"||stage==="all"){out.controls=[];for(const name of ["0_welcome","0_loss_of_divinity"]){const P=words(gold.sections.find(s=>s.name===name).source_text).flat(),ww=words(gold.sections.find(s=>s.name===name).source_text);let off=0,n=0;for(const w of ww){if(off>=8&&off+w.length<=FIT&&anchors.has(w.join(",")))n++;off+=w.length}ok(n>0,"no control anchor "+name);
   const a=key(),s0=mod(BigInt(rng())*4294967296n+BigInt(rng()),a),C=encode(P,a,s0),sol=solve(C,FIT,name),exact=sol.Phold?sol.Phold.filter((v,i)=>v===P[FIT+i]).length:0;out.controls.push({name,key:String(a),carry:String(s0),trueAnchors:n,exact,holdout:P.length-FIT,sol})
  }out.gate=out.controls.every(c=>c.sol.key===c.key&&c.exact>=Math.floor(0.99*c.holdout));}
 if(stage==="original"||stage==="all"&&out.gate){const C=gp.pages.slice(0,3).flatMap(p=>p.indices).slice(13);ok(C.length===716,"p0-2 black-body length");out.original=solve(C,FIT,null)}
 out.diagnostics={queries,points,maxBox:String(maxBox)};return out
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/english_wordfreq_textblob.txt"];const r=paths.map(p=>fs.readFileSync(p,'utf8'));console.log(JSON.stringify(attack(JSON.parse(r[0]),JSON.parse(r[1]),r[2],process.argv[2]||'controls'),null,2));
