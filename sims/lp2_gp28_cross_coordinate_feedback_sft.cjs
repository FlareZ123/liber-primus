'use strict';
const fs=require('node:fs');
const path=require('node:path');
function core(data){
 const d=JSON.parse(data[0]),N=29,mod=(x,m)=>(x%m+m)%m,assert=(x,m)=>{if(!x)throw Error(m)},eq=(a,b)=>a.length===b.length&&a.every((v,i)=>v===b[i]);
 const toks=d.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function native(s){const out=[];for(const m of s.toUpperCase().replace(/QU/g,"CW").replace(/[KQ]/g,"C").replace(/V/g,"U").replace(/Z/g,"S").matchAll(/[A-Z]+/g)){const w=m[0].replace(/ING/g,"NG").replace(/IO/g,"IA");for(let i=0;i<w.length;){const t=toks.find(t=>w.startsWith(t.s,i));if(t){out.push(t.i);i+=t.s.length}else i++}}return out}
 const rm=new Map(d.runes.map((x,i)=>[x,i])),lp1=data[1].split("%").map(s=>[...s].filter(c=>rm.has(c)).map(c=>rm.get(c))).filter(a=>a.length);
 const sourceTrain=[3,8,9,10].map(i=>lp1[i]);assert(eq(sourceTrain.map(a=>a.length),[157,187,207,192]),"source train");
 const tr=[native(data[2]),...sourceTrain],H1=new Float64Array(N),H2=new Float64Array(N*N),H3=new Float64Array(N**3),L=new Float64Array(N**3);let n=0;
 for(const s of tr)for(let i=0;i<s.length;i++){H1[s[i]]++;n++;if(i)H2[s[i-1]*N+s[i]]++;if(i>1)H3[(s[i-2]*N+s[i-1])*N+s[i]]++}
 for(let a=0;a<N;a++)for(let b=0;b<N;b++){let n2=0,n3=0;for(let c=0;c<N;c++){n2+=H2[b*N+c];n3+=H3[(a*N+b)*N+c]}for(let c=0;c<N;c++){const p1=(H1[c]+.5)/(n+N*.5),p2=(H2[b*N+c]+10*p1)/(n2+10);L[(a*N+b)*N+c]=Math.log((H3[(a*N+b)*N+c]+10*p2)/(n3+10))}}
 function score(p,l,u){let s=0;for(let i=l+2;i<u;i++)s+=L[(p[i-2]*N+p[i-1])*N+p[i]];return s/(u-l-2)}
 // First rune literal. Native F=0 is the explicit repeat escape, with state held.
 // For nonrepeat rank y=7q+r, q receives a shift of a*old_r+b mod4,
 // r receives c*old_q+d mod7. Both old coordinates are previous OBSERVED rank.
 function encode(p,k){let [a,b,c,d]=k,oldq=0,oldr=0,out=[p[0]];for(let i=1;i<p.length;i++){if(p[i]===0){out.push(out.at(-1));continue}const z=p[i]-1,q=mod(Math.floor(z/7)+a*oldr+b,4),r=mod(z%7+c*oldq+d,7);out.push(mod(out.at(-1)+1+7*q+r,29));oldq=q;oldr=r}return out}
 function events(c){let oldq=0,oldr=0,out=[];for(let i=1;i<c.length;i++){const v=mod(c[i]-c[i-1],29);if(!v){out.push(null);continue}const q=Math.floor((v-1)/7),r=(v-1)%7;out.push([q,r,oldq,oldr]);oldq=q;oldr=r}return out}
 function decode(first,ev,k){const [a,b,c,d]=k,p=[first];for(const v of ev){if(!v){p.push(0);continue}const [q,r,oldq,oldr]=v;p.push(1+7*mod(q-a*oldr-b,4)+mod(r-c*oldq-d,7))}return p}
 const keys=[];for(let a=0;a<4;a++)for(let b=0;b<4;b++)for(let c=0;c<7;c++)for(let d=0;d<7;d++)keys.push([a,b,c,d]);
 function search(cipher,cut,truth=null){const e=events(cipher),fit=e.slice(0,cut-1);let best=null,second=-Infinity;
  for(const k of keys){const p=decode(cipher[0],fit,k),s=score(p,0,p.length);if(!best||s>best.train){second=best?.train??-Infinity;best={k,train:s}}else if(s>second)second=s}
  const p=decode(cipher[0],e,best.k);assert(eq(encode(p,best.k),cipher),"exact full replay");const hold=score(p,cut,p.length);
  return {...best,margin:best.train-second,held:hold,firstPlain:p.slice(0,90).map(x=>d.translit[x]).join(""),heldPlain:p.slice(cut,cut+90).map(x=>d.translit[x]).join(""),...(truth?{trueKey:truth.k,keyExact:eq(truth.k,best.k),fitHits:p.slice(0,cut).filter((x,i)=>x===truth.p[i]).length,heldHits:p.slice(cut).filter((x,i)=>x===truth.p[cut+i]).length,fitLength:cut,heldLength:p.length-cut}:{}),decoded:p};
 }
 const original=d.pages.slice(0,8).flatMap(p=>p.indices),cut=729;assert(original.length===1874,"chapter lengths");
 const primes=[];for(let i=2;primes.length<85;i++)if(!primes.some(p=>p*p<=i&&i%p===0))primes.push(i);let pi=0;const p56=d.pages[56].indices.map((c,i)=>i===56?0:mod(c-primes[pi++]+1,29));assert(pi===84&&p56.map(x=>d.translit[x]).join("")==="ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGETHATHASHESTOITISTHEDUTYOFEUERYPILGRIMTOSEECOUTTHISPAGE","native p56");
 const donors=[{name:"native-solved",p:[...lp1[11],...lp1[14],...p56,...d.pages[57].indices],cut:258,k:[3,1,5,2]},{name:"Gibran",p:native(data[3]).slice(2000,2000+original.length),cut,k:[1,3,6,4]},{name:"Emerson",p:native(data[4]).slice(4000,4000+original.length),cut,k:[2,0,3,1]}];
 let controls=[];for(const x of donors){const c=encode(x.p,x.k);assert(eq(decode(c[0],events(c),x.k),x.p),"forward/inverse");const v=search(c,x.cut,{k:x.k,p:x.p});const {decoded,...s}=v;controls.push({name:x.name,...s})}
 if(!controls.every(v=>v.keyExact&&v.heldHits===v.heldLength&&v.fitHits===v.fitLength))return {status:"control-failure",modelTraining:n,controls};
 const v=search(original,cut),e=events(original);const repeats=e.filter(x=>x===null).length,fitRepeats=e.slice(0,cut-1).filter(x=>x===null).length;assert(repeats===10&&fitRepeats===4,"original repeats");
 let seed=0x3122a12;function rnd(n){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return Math.floor((seed>>>0)/4294967296*n)}
 function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){let j=rnd(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
 function rebuild(rank){let c=[original[0]];for(const y of rank)c.push(y===null?c.at(-1):mod(c.at(-1)+1+y,29));return c}
 const R=e.map(v=>v?7*v[0]+v[1]:null);
 function matched(){return rebuild(R.map(v=>v===null?null:rnd(28)))}
 function shuffled(){const fitR=shuffle(e.slice(0,cut-1).filter(Boolean).map(v=>v[1])),heldR=shuffle(e.slice(cut-1).filter(Boolean).map(v=>v[1]));let a=0,b=0;return rebuild(e.map((v,i)=>v?7*v[0]+(i<cut-1?fitR[a++]:heldR[b++]):null))}
 const nulls={};for(const [id,fn] of [["matchedSingleChannel",matched],["shuffledCoordinates",shuffled]]){const samples=[];for(let i=0;i<80;i++){const a=search(fn(),cut);samples.push([a.train,a.held])}nulls[id]={n:samples.length,trainGE:samples.filter(x=>x[0]>=v.train).length,holdGE:samples.filter(x=>x[1]>=v.held).length,heldMin:Math.min(...samples.map(x=>x[1])),heldMax:Math.max(...samples.map(x=>x[1])),samples}}
 const {decoded,...orig}=v;
 return {status:"complete",model:{formula:"q=(Pq+a*old_r+b) mod4, r=(Pr+c*old_q+d) mod7",keyCount:keys.length,first:"literal",escape:"F=0 produces repeat, holds both observed coordinate states",trainingRunes:n,fit:"p0–2",held:"p3–7",fitLength:cut,heldLength:original.length-cut},controls,original:{...orig,repeatCount:repeats,fitRepeatCount:fitRepeats,decodedIndices:decoded,exactReplay:true},nulls};
}
const root=path.resolve(__dirname,'..');
const paths=["resources/liber-primus/lp2-corpus.json","resources/transcriptions/lp1_wulfic_canonical.txt","resources/control/shakespeare_first300k.txt","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt"];
console.log(JSON.stringify(core(paths.map(p=>fs.readFileSync(path.join(root,p),'utf8'))),null,2));
