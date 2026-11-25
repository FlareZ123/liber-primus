// Agent31: exact bounded integer multiplier/carry quotation inference.
// Run from repository root: node sims/lp2_quote_base29_lattice_sft.cjs
const fs = require('node:fs');
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
 let seed=0x42291333;function rng(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0}
 for(let k=0;k<500;k++){const M=BigInt(17+rng()%97),A=BigInt(1+rng()%15),X=BigInt(rng()%Number(M)),Y=BigInt(rng()%Number(M));const got=solve(X,Y,M,A,reduce(X,M),false).map(x=>`${x.a}:${x.s}`).sort(),want=[];for(let a=1n;a<=A;a++){const s=mod(Y-a*X,M);if(s<a)want.push(`${a}:${s}`)}ok(eq(got,want.sort()),"toy exhaustive mismatch")}
 const A=pow(13)-1n,M=pow(41),N=160,stop=41,train=80;
 const names=["Shakespeare","Emerson","Gibran"],idx=new Map(gp.translit.map((s,i)=>[s,i]));
 const normal=w=>w.toUpperCase().replace(/['’]/g,"").replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");
 function body(s,start){const a=s.indexOf(start),b=s.search(/\*\*\*\s*END OF (?:THIS|THE) PROJECT GUTENBERG/i);ok(a>=0&&b>a,"body markers");return s.slice(a,b)}
 function chunks(s){const out=[];let words=[],prev=0;for(const m of s.matchAll(/[A-Za-z]+(?:['’][A-Za-z]+)*/g)){if(/[.!?]/.test(s.slice(prev,m.index))&&words.length){out.push(words.join(" "));words=[]}words.push(normal(m[0]));prev=m.index+m[0].length}if(words.length)out.push(words.join(" "));return out}
 function graph(s){const L=s.length,f=Array.from({length:L+1},()=>[]),b=Array.from({length:L+1},()=>[]);for(let i=0;i<L;i++){let p=i;while(s[p]===" ")p++;for(let d=1;d<=2&&p+d<=L;d++){const v=idx.get(s.slice(p,p+d));if(v!==undefined)f[i].push([v,p+d])}}for(let i=1;i<=L;i++){let p=i;while(s[p-1]===" ")p--;for(let d=1;d<=2&&p-d>=0;d++){const v=idx.get(s.slice(p-d,p));if(v!==undefined)b[i].push([v,p-d])}}return {L,f,b}}
 const texts=[raw[0],body(raw[1],"There is no great and no small"),body(raw[2],"Almustafa,")],pairs=[],candidates=[];
 for(let j=0;j<texts.length;j++){const ch=chunks(texts[j]);for(let i=0;i+1<ch.length;i++){const l=ch[i],r=ch[i+1];if(l.replace(/ /g,"").length<stop||r.replace(/ /g,"").length<N-stop)continue;const pair={id:pairs.length,source:names[j],stop:i+1,left:graph(l),right:graph(r)};pairs.push(pair);const rev=[];function rec(p){if(rev.length===stop){const plain=reverse(rev),nums=[num(plain),num(rev)];candidates.push({pair,plain,start:p,nums,bases:nums.map(x=>reduce(x,M))});return}for(const [v,n] of pair.left.b[p]){rev.push(v);rec(n);rev.pop()}}rec(pair.left.L)}}
 ok(pairs.length===1161&&candidates.length===8764,"frozen source paths");
 const modes=["EF","ER","DF","DR"];
 function scan(C){
  const left=C.slice(0,stop),cnums=[num(left),num(reverse(left))],cb=cnums.map(x=>reduce(x,M));const stats=Object.fromEntries(modes.map(m=>[m,{left:0,prefix:0,full:0}])),prefix=[],full=[];
  for(const p of candidates)for(const mode of modes){
   const rev=mode[1]==="R",d=Number(rev),enc=mode[0]==="E",X=enc?p.nums[d]:cnums[d],Y=enc?cnums[d]:p.nums[d],basis=enc?p.bases[d]:cb[d];
   for(const {a,s} of solve(X,Y,M,A,basis)){
    stats[mode].left++;const end=(a*X+s)/M;ok(end>=0n&&end<a,"end carry");
    const right=[],g=p.pair.right;
    function walk(i,pos,carry){
     if(i===train){stats[mode].prefix++;prefix.push({mode,a:String(a),s:String(s),pair:p.pair.id,leftStart:p.start,plain:p.plain.concat(right),pos,carry:String(carry)})}
     if(i===N){stats[mode].full++;full.push({mode,a:String(a),s:String(s),pair:p.pair.id,leftStart:p.start,plain:p.plain.concat(right),pos,carry:String(carry)});return}
     const c=BigInt(C[i]);for(const [pv,np] of g.f[pos]){
      const v=BigInt(pv),input=enc?v:c,output=enc?c:v;let next;
      if(rev){next=29n*carry+output-a*input;if(next<0n||next>=a)continue}
      else {const x=a*input+carry;if(x%29n!==output)continue;next=x/29n}
      right.push(pv);walk(i+1,np,next);right.pop()
     }
    }
    walk(stop,0,rev?s:end);
   }
  }
  for(const x of full){const s0=BigInt(x.mode[1]==="R"?x.carry:x.s);ok(eq(encrypt(x.plain,x.mode,BigInt(x.a),s0).C,C),"full replay")}
  return {stats,prefix,full}
 }
 function path(g,p,n,memo=new Map()){if(!n)return [];const key=`${p}:${n}`;if(memo.has(key))return memo.get(key);const opts=g.f[p].slice();for(let i=opts.length-1;i>0;i--){const j=rng()%(i+1);[opts[i],opts[j]]=[opts[j],opts[i]]}for(const [v,np] of opts){const tail=path(g,np,n-1,memo);if(tail){const ret=[v,...tail];memo.set(key,ret);return ret}}memo.set(key,null);return null}
 function big(k){return num(Array.from({length:k},()=>rng()%29))}
 function encrypt(P,mode,a,s0){const rev=mode[1]==="R",enc=mode[0]==="E",T=rev?reverse(P):P;let s=s0;const C=[];let leftS=null;
  for(let i=0;i<N;i++){if(!rev&&i===0||rev&&i===N-stop)leftS=s;const p=BigInt(T[i]);let c;if(enc){const z=a*p+s;c=z%29n;s=z/29n}else{let iv=1n;while(mod(iv*a,29n)!==1n)iv++;c=mod((p-s)*iv,29n);s=(a*c+s-p)/29n}ok(s>=0n&&s<a,"plant carry");C.push(Number(c))}
  return {C:rev?reverse(C):C,leftS}
 }
 const controls=[],nulls=[];
 for(let k=0;k<modes.length;k++){const mode=modes[k],pool=candidates.filter(c=>c.pair.source===names[k%3]);let chosen,right;for(let tries=0;tries<pool.length;tries++){chosen=pool[rng()%pool.length];right=path(chosen.pair.right,0,N-stop);if(right)break}ok(right,"plant source length");const P=chosen.plain.concat(right);let a=big(13);a=mod(a,pow(12))+pow(12)*(1n+BigInt(rng()%28));if(a%29n===0n)a++;const s0=big(13)%a;const {C,leftS}=encrypt(P,mode,a,s0),res=scan(C);const truth={mode,a:String(a),s:String(leftS),pair:chosen.pair.id,plain:P};const hits=res.full.filter(x=>x.mode===mode&&x.a===truth.a&&x.s===truth.s&&x.pair===truth.pair&&eq(x.plain,P));ok(hits.length>=1,"true full control missing "+mode);const n=scan(Array.from({length:N},()=>rng()%29));ok(n.prefix.length===0,"null prefix");const classes=new Set(res.prefix.map(x=>[x.mode,x.a,x.s,x.pair].join(":"))).size;ok(classes===1,"ambiguous parameter class");controls.push({mode,truth,leftCounts:res.stats,prefixClasses:classes,fullPaths:res.full.length,heldoutTrueIncluded:N-train,uniqueHeldout:new Set(res.full.map(x=>x.plain.slice(train).join())).size===1,fullCandidates:res.full});nulls.push({mode,stats:n.stats})}
 const U=gp.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);ok(U.length===12956,"canonical tape");const C=U.slice(10279,10439),original=scan(C);
 return {pairs:pairs.length,leftPaths:candidates.length,modes,limit:String(A),toyTests:500,controls,nulls,original,diagnostics:{queries,points,maxBox:String(maxBox)}}
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/gibran_prophet_58585.txt"];
const raw=paths.map(p=>fs.readFileSync(p,'utf8'));
console.log(JSON.stringify(experiment(JSON.parse(raw[0]),raw.slice(1)),null,2));
