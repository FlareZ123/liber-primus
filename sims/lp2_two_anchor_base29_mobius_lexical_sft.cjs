'use strict';
const fs=require('node:fs'),path=require('node:path');
function experiment(raw){
 const gp=JSON.parse(raw[0]),gold=JSON.parse(raw[1]),ix=new Map(gp.runes.map((x,i)=>[x,i])),tokens=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
 const assert=(b,m)=>{if(!b)throw Error(m)},id=a=>String.fromCharCode(...a.map(x=>65+x)),words=s=>(s.match(/[\u16a0-\u16ff]+/gu)||[]).map(t=>[...t].map(x=>ix.get(x))).filter(w=>w.every(Number.isInteger));
 function word(w,alt=true){w=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const o=[];for(let j=0;j<w.length;){const q=alt&&w.startsWith("ING",j)?{t:"ING",i:21}:alt&&w.startsWith("IO",j)?{t:"IO",i:27}:tokens.find(o=>w.startsWith(o.t,j));if(!q)throw Error(w);o.push(q.i);j+=q.t.length;}return o;}
 const held=["0_koan_1","0_loss_of_divinity"],types=new Set();for(const sec of gold.sections.filter(s=>!held.includes(s.name)))for(const w of words(sec.source_text))types.add(id(w));for(const l of raw[2].split(/\r?\n/)){const m=l.match(/^([a-z]+)\s+(\d+)$/i);if(m)for(const alt of [true,false])types.add(id(word(m[1],alt)));}
 const D=8,B=29n,Q=B**BigInt(D),pow=Array.from({length:D+1},(_,i)=>B**BigInt(i)),mod=(x,m)=>((x%m)+m)%m,integer=a=>a.reduceRight((s,x)=>s*B+BigInt(x),0n),digits=x=>{x=mod(x,Q);return Array.from({length:D},()=>{const z=Number(x%B);x/=B;return z})};
 const prefixes=new Map();for(const w of types){let a=prefixes.get(w.length);if(!a){a=Array.from({length:Math.min(D,w.length)+1},()=>new Set());prefixes.set(w.length,a)}for(let i=1;i<a.length;i++)a[i].add(w.slice(0,i));}
 function inv(v){let a=Q,b=mod(v,Q),u=0n,w=1n;while(b){let q=a/b;[a,b]=[b,a-q*b];[u,w]=[w,u-q*w]}assert(a===1n,"unit");return mod(u,Q)}
 const c56=gp.pages.find(p=>p.page===56).indices,c57=gp.pages.find(p=>p.page===57).indices;
 const primes=[];for(let x=2;primes.length<84;x++){let ok=true;for(let d=2;d*d<=x;d++)if(x%d===0){ok=false;break}if(ok)primes.push(x)}let k=0;const p56=c56.map((v,i)=>i===56?0:Number(mod(BigInt(v-primes[k++]+1),B)));k=0;assert(p56.every((v,i)=>c56[i]===(i===56?0:(v+primes[k++]-1)%29))&&k===84,"p56 replay");
 const x0=integer(c56.slice(0,D)),y0=integer(p56.slice(0,D)),x1=integer(c57.slice(0,D)),y1=x1,s=mod((y1-y0)*inv(x1-x0),Q);
 function coeff(c){let a=mod(s+c*(s*x1+y0),Q),b=mod(y0*(1n+c*x0)-a*x0,Q);return {a,b}}
 function f(x,c){const {a,b}=coeff(c);return mod((a*x+b)*inv(1n+c*x),Q)}
 function rev(y,c){const {a,b}=coeff(c);return mod((y-b)*inv(a-c*y),Q)}
 function pop(x){let n=0;while(x){x&=x-1;n++}return n}
 function run(ts,trueC){
  const xs=ts.map(t=>integer(t.c)),t=xs.map(x=>mod((x-x0)*s,Q)),der=t.map((v,j)=>Number(mod(v*(x1-xs[j]),B)));
  const lens=ts.map(t=>t.lens);assert(lens.every(l=>l[0]+l[1]>=D),"first two word coverage");
  let states=[{c:0n,p:xs.map(()=>0n),prefix:xs.map(()=>""),bad:0}];const counts=[];let trials=0;
  for(let d=0;d<D;d++){
   const h=pow[d],child=[],hist=[0,0,0],which=lens.map(l=>d<l[0]?0:1);
   for(const state of states){
    const rr=xs.map((x,j)=>{const z=t[j]*(1n+state.c*x1)-(1n+state.c*x)*(state.p[j]-y0);assert(z%h===0n,"exact residual");return Number(mod(z/h,B))});
    for(let a=0;a<(d?29:1);a++){
     trials++;const zz=rr.map((v,j)=>(v+a*der[j])%29),prefix=zz.map((v,j)=>(d===lens[j][0]?"":state.prefix[j])+String.fromCharCode(65+v));let bad=state.bad;
     for(let j=0;j<xs.length;j++){const bit=1<<(2*j+which[j]);if(!(bad&bit)&&!prefixes.get(lens[j][which[j]])?.[prefix[j].length]?.has(prefix[j]))bad|=bit}
     const n=pop(bad);if(n>2)continue;hist[n]++;child.push({c:state.c+BigInt(a)*h,p:state.p.map((p,j)=>p+BigInt(zz[j])*h),prefix,bad});
     if(child.length>200000)return {abortedAt:d,counts,trials};
    }
   }
   states=child;counts.push({digits:d+1,hist,total:states.length,trueRetained:trueC===null?null:states.some(a=>a.c===trueC%pow[d+1])});
   if(!states.length)break;
  }
  for(const a of states.slice(0,100)){assert(a.p.every((p,j)=>p===f(xs[j],a.c)),"full verification")}
  return {counts,trials,survivors:states.length,keys:states.slice(0,30).map(a=>({c:a.c.toString(),bad:pop(a.bad),plain:a.p.map(p=>digits(p))})),trueRetained:trueC===null?null:states.some(a=>a.c===trueC)};
 }
 const W=[];let w=[];for(const c of raw[3].split("%").slice(0,55).join("%")){if(ix.has(c))w.push(ix.get(c));else if(c!=="%"&&c!=="/"&&!/\s/u.test(c)&&w.length){W.push(w);w=[];}}if(w.length)W.push(w);
 const tape=gp.pages.filter(p=>p.page<56).flatMap(p=>p.indices);assert(W.length===2896&&tape.length===12956&&id(W.flat())===id(tape),"source exact");let off=0;const layout=W.map(w=>{let a={start:off,w};off+=w.length;return a});
 const starts=[3,8,15,23,27,33,40];let cursor=0;const original=[];for(const p of gp.pages){if(starts.includes(p.page)){let i=layout.findIndex(w=>w.start===cursor);assert(i>=0,"chapter start");const g=layout.slice(i,i+2);original.push({page:p.page,c:p.indices.slice(0,D),lens:g.map(x=>x.w.length)})}cursor+=p.indices.length;}
 function plant(sec,seed,corrupt){
  const ws=words(gold.sections.find(s=>s.name===sec).source_text), pairs=[];for(let i=0;i+1<ws.length&&pairs.length<7;i++){if(ws[i].length+ws[i+1].length>=D&&types.has(id(ws[i]))&&types.has(id(ws[i+1]))){pairs.push([ws[i].slice(),ws[i+1].slice()]);i++}}assert(pairs.length===7,"pairs");
  if(corrupt){for(let j=0;j<2;j++){let a=pairs[j][0].slice();let z=0;while(types.has(id(a))){a[z%a.length]=(a[z%a.length]+1)%29;z++;assert(z<1000,"OOV")};pairs[j][0]=a}}
  let state=seed;const q=()=>{state^=state<<13;state^=state>>>17;state^=state<<5;return state>>>0};let c=integer(Array.from({length:D},(_,i)=>i?q()%29:0)),ts=pairs.map(p=>{const y=integer(p.flat().slice(0,D)),x=rev(y,c);assert(f(x,c)===y,"plant replay");return {c:digits(x),lens:p.map(w=>w.length)}});
  return {sec,seed,corrupt,key:c.toString(),...run(ts,c)};
 }
 const plants=[plant(held[0],0x3301,false),plant(held[1],0x1033,true)];
 const result=plants.every(p=>p.trueRetained)?run(original,null):null;
 return {D,types:types.size,originalGroups:original,plants,original:result};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/english_wordfreq_textblob.txt","resources/liber-primus/lp2-transcription.txt"];console.log(JSON.stringify(experiment(paths.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'))),null,2));
