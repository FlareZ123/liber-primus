// Agent31: exact large-unit multiplier/carry with authentic literal-F holds.
// Run: node sims/lp2_quote_base29_lattice_fhold_sft.cjs
const fs=require('node:fs');
function experiment(gp,raw){
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
 function solve(X,Y,M,A,basis=reduce(X,M),checkUnit=true){
  queries++;const [u,v]=basis,lo=Y-A+1n,hi=Y;
  function interval(ax,ay){const l=min(ax,ax*A)+min(ay*lo,ay*hi),h=max(ax,ax*A)+max(ay*lo,ay*hi);return [ceil(l,M),floor(h,M)]}
  const [l1,h1]=interval(v[1],-v[0]),[l2,h2]=interval(-u[1],u[0]);
  if(h1<l1||h2<l2)return [];
  const box=(h1-l1+1n)*(h2-l2+1n);maxBox=max(maxBox,box);ok(box<=1000000n,"explicit lattice candidate cap");
  const out=[];
  for(let i=l1;i<=h1;i++)for(let j=l2;j<=h2;j++){
   points++;const a=i*u[0]+j*v[0],y=i*u[1]+j*v[1],s=Y-y;
   if(a<1n||a>A||s<0n||s>=a||(checkUnit&&a%29n===0n))continue;
   ok(mod(a*X+s,M)===Y,"lattice congruence");out.push({a,s})
  }return out
 }

 const A=pow(37)-1n,M=pow(41),N=160,stop=41,train=80;
 const names=["Shakespeare","Emerson","Gibran"],idx=new Map(gp.translit.map((s,i)=>[s,i]));
 const normal=w=>w.toUpperCase().replace(/['’]/g,"").replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");
 function body(s,start){const a=s.indexOf(start),b=s.search(/\*\*\*\s*END OF (?:THIS|THE) PROJECT GUTENBERG/i);ok(a>=0&&b>a,"body markers");return s.slice(a,b)}
 function chunks(s){const out=[];let words=[],prev=0;for(const m of s.matchAll(/[A-Za-z]+(?:['’][A-Za-z]+)*/g)){if(/[.!?]/.test(s.slice(prev,m.index))&&words.length){out.push(words.join(" "));words=[]}words.push(normal(m[0]));prev=m.index+m[0].length}if(words.length)out.push(words.join(" "));return out}
 function graph(s){const L=s.length,f=Array.from({length:L+1},()=>[]),b=Array.from({length:L+1},()=>[]);for(let i=0;i<L;i++){let p=i;while(s[p]===" ")p++;for(let d=1;d<=2&&p+d<=L;d++){const v=idx.get(s.slice(p,p+d));if(v!==undefined)f[i].push([v,p+d])}}for(let i=1;i<=L;i++){let p=i;while(s[p-1]===" ")p--;for(let d=1;d<=2&&p-d>=0;d++){const v=idx.get(s.slice(p-d,p));if(v!==undefined)b[i].push([v,p-d])}}return {L,f,b}}
 const texts=[raw[0],body(raw[1],"There is no great and no small"),body(raw[2],"Almustafa,")],pairs=[],candidates=[];
 for(let j=0;j<texts.length;j++){const ch=chunks(texts[j]);for(let i=0;i+1<ch.length;i++){const l=ch[i],r=ch[i+1];if(l.replace(/ /g,"").length<stop||r.replace(/ /g,"").length<N-stop)continue;const pair={id:pairs.length,source:names[j],stop:i+1,left:graph(l),right:graph(r)};pairs.push(pair);const rev=[];function rec(p){if(rev.length===stop){const plain=reverse(rev),nums=[num(plain),num(rev)];candidates.push({pair,plain,start:p});return}for(const [v,n] of pair.left.b[p]){rev.push(v);rec(n);rev.pop()}}rec(pair.left.L)}}
 ok(pairs.length===1161&&candidates.length===8764,"frozen source paths");

 const modes=["EF","ER","DF","DR"];
 let seed=0x37f42213;
 function rng(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0}
 function rightPaths(g,p,n,accept,visit){const out=[];function rec(pos,j){if(j===n){visit(out.slice(),pos);return}for(const [v,np] of g.f[pos])if(accept(v,j)){out.push(v);rec(np,j+1);out.pop()}}rec(p,0)}
 function compatible(P,C){return P.every((v,i)=>v!==0||C[i]===0)}
 function scan(C){
  const stats=Object.fromEntries(modes.map(m=>[m,{prefix:0,full:0}])),prefix=[],full=[];
  let leftN=0,prefixN=0,activeMin=80,activeMax=0;
  const left=C.slice(0,stop),right=C.slice(stop,train),cache=new Map();
  for(const p of candidates){if(!compatible(p.plain,left))continue;leftN++;
   rightPaths(p.pair.right,0,train-stop,(v,j)=>v!==0||right[j]===0,(rp,pos)=>{
    prefixN++;const P=p.plain.concat(rp),PP=[],CC=[];
    for(let j=0;j<train;j++)if(P[j]!==0){PP.push(P[j]);CC.push(C[j])}
    const n=PP.length;activeMin=Math.min(activeMin,n);activeMax=Math.max(activeMax,n);const M=pow(n);
    const pnums=[num(PP),num(reverse(PP))],cnums=[num(CC),num(reverse(CC))];
    for(const mode of modes){const rev=mode[1]==="R",d=Number(rev),enc=mode[0]==="E",X=enc?pnums[d]:cnums[d],Y=enc?cnums[d]:pnums[d];let basis;
     if(enc)basis=reduce(X,M);else {const k=n+":"+X;if(!cache.has(k))cache.set(k,reduce(X,M));basis=cache.get(k)}
     for(const {a,s} of solve(X,Y,M,A,basis)){
      const end=(a*X+s)/M;ok(end>=0n&&end<a,"end carry");
      stats[mode].prefix++;prefix.push({mode,a:String(a),s:String(s),pair:p.pair.id,leftStart:p.start,plain:P,pos,carry:String(rev?s:end)});
      const suffix=[],g=p.pair.right;
      function walk(i,at,carry){
       if(i===N){stats[mode].full++;full.push({mode,a:String(a),s:String(s),pair:p.pair.id,leftStart:p.start,plain:P.concat(suffix),pos:at,carry:String(carry)});return}
       const c=BigInt(C[i]);for(const [pv,np] of g.f[at]){
        let next;
        if(pv===0){if(c!==0n)continue;next=carry}
        else{const v=BigInt(pv),input=enc?v:c,output=enc?c:v;
         if(rev){next=29n*carry+output-a*input;if(next<0n||next>=a)continue}
         else {const x=a*input+carry;if(x%29n!==output)continue;next=x/29n}}
        suffix.push(pv);walk(i+1,np,next);suffix.pop()
       }
      }walk(train,pos,rev?s:end)
     }
    }
   })
  }
  for(const x of full){const s0=BigInt(x.mode[1]==="R"?x.carry:x.s);ok(eq(encrypt(x.plain,x.mode,BigInt(x.a),s0).C,C),"full replay")}
  return {leftN,prefixN,activeMin,activeMax,stats,prefix,full}
 }
 function path(g,p,n,memo=new Map()){if(!n)return [];const key=p+":"+n;if(memo.has(key))return memo.get(key);const opts=g.f[p].slice();for(let i=opts.length-1;i>0;i--){const j=rng()%(i+1);[opts[i],opts[j]]=[opts[j],opts[i]]}for(const [v,np] of opts){const tail=path(g,np,n-1,memo);if(tail){const ret=[v,...tail];memo.set(key,ret);return ret}}memo.set(key,null);return null}
 function big(k){return num(Array.from({length:k},()=>rng()%29))}
 function encrypt(P,mode,a,s0){const rev=mode[1]==="R",enc=mode[0]==="E",T=rev?reverse(P):P;let s=s0;const C=[];let prefixS=null;
  let iv=1n;while(mod(iv*a,29n)!==1n)iv++;
  for(let i=0;i<N;i++){if(!rev&&i===0||rev&&i===N-train)prefixS=s;const p=BigInt(T[i]);let c;
   if(p===0n)c=0n;
   else if(enc){const z=a*p+s;c=z%29n;s=z/29n}
   else{c=mod((p-s)*iv,29n);s=(a*c+s-p)/29n}
   ok(s>=0n&&s<a,"plant carry");C.push(Number(c))}
  return {C:rev?reverse(C):C,prefixS}
 }
 const controls=[],nulls=[];
 for(let k=0;k<modes.length;k++){const mode=modes[k],pool=candidates.filter(c=>c.pair.source===names[k%3]);let chosen,right,P;
  for(let tries=0;tries<10000;tries++){chosen=pool[rng()%pool.length];right=path(chosen.pair.right,0,N-stop);if(!right)continue;P=chosen.plain.concat(right);const f1=P.slice(0,train).filter(v=>v===0).length,f2=P.slice(train).filter(v=>v===0).length;if(f1>=1&&f1<=2&&f2>=1)break;P=null}
  ok(P,"plant source length and F holds");let a=mod(big(37),pow(36))+pow(36)*(1n+BigInt(rng()%28));if(a%29n===0n)a++;const s0=big(37)%a;const {C,prefixS}=encrypt(P,mode,a,s0),res=scan(C);
  const truth={mode,a:String(a),s:String(prefixS),pair:chosen.pair.id,plain:P,holds:P.flatMap((v,i)=>v===0?[i]:[])};
  const hits=res.full.filter(x=>x.mode===mode&&x.a===truth.a&&x.s===truth.s&&x.pair===truth.pair&&eq(x.plain,P));ok(hits.length>=1,"true control missing "+mode);
  const classes=xs=>new Set(xs.map(x=>[x.mode,x.a,x.s,x.pair].join(":"))).size;
  controls.push({mode,truth,leftN:res.leftN,prefixN:res.prefixN,prefixClasses:classes(res.prefix),fullClasses:classes(res.full),prefixMultiplierSources:new Set(res.prefix.map(x=>[x.mode,x.a,x.pair].join(":"))).size,fullMultiplierSources:new Set(res.full.map(x=>[x.mode,x.a,x.pair].join(":"))).size,stats:res.stats,fullPaths:res.full.length,uniqueHeldout:new Set(res.full.map(x=>x.plain.slice(train).join())).size===1,fullCandidates:res.full});
  const n=scan(Array.from({length:N},()=>rng()%29));nulls.push({mode,stats:n.stats,prefixN:n.prefixN,full:n.full})
 }
 const gate=controls.every(c=>c.prefixMultiplierSources===1&&c.fullMultiplierSources===1)&&nulls.every(x=>Object.values(x.stats).every(y=>y.prefix===0));
 let original=null;if(gate){const U=gp.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);ok(U.length===12956,"canonical tape");const C=U.slice(10279,10439);original=scan(C)}
 return {pairs:pairs.length,leftPaths:candidates.length,modes,limit:String(A),controls,nulls,gate,original,diagnostics:{queries,points,maxBox:String(maxBox)}}
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/gibran_prophet_58585.txt"];
const raw=paths.map(p=>fs.readFileSync(p,'utf8'));
console.log(JSON.stringify(experiment(JSON.parse(raw[0]),raw.slice(1)),null,2));
