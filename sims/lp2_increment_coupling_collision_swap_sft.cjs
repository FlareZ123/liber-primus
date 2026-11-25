'use strict';
// Agent48: exact coupling bounds and causal collision-swap envelope, read-only.
const fs=require('node:fs'),crypto=require('node:crypto');
const inputs=[
  {
    "path": "resources/liber-primus/lp2-corpus.json",
    "sha": "054f2a0f780b7d46901acbe3d9bf4f0ac1801165"
  },
  {
    "path": "resources/liber-primus/lp2-transcription.txt",
    "sha": "43bfeb6bf8dabaf25b0446cc519f8d91d205d8a7"
  },
  {
    "path": "resources/external/2013-book-of-law-I.txt",
    "sha": "64876892683fab1467481fe87d85743a8ea17982"
  },
  {
    "path": "resources/external/2013-book-of-law-II.txt",
    "sha": "cb4353b080d7584441f85502aeccb60796e6fe0f"
  },
  {
    "path": "resources/external/2013-book-of-law-III.txt",
    "sha": "36e716252a271d31f5c4ba25b3cb78199ccc1114"
  },
  {
    "path": "resources/external/cicada2012-blake-marriage-gutenberg45315.txt",
    "sha": "44149cc32fa8a46501a95059283526a8a3429705"
  },
  {
    "path": "resources/liber-primus/lp2-ink-annotations.json",
    "sha": "0614aca67969a14ae006e0c1ae6aee6dcd8136e6"
  },
  {
    "path": "resources/liber-primus/lp1-plaintext-reference.txt",
    "sha": "8ed037a6ddeef2b20a10bd6a84830e7cf9f43f7d"
  },
  {
    "path": "resources/external/relikd-solved-gp29-native-v1.json",
    "sha": "1b064ef6d85819b7d96adaff31a82d1ec551598f"
  },
  {
    "path": "resources/control/english_wordfreq_textblob.txt",
    "sha": "140e1d22b5f8c45deddd2e8b25549d9d6307d938"
  }
];
function study(files){
const [corpus,trans,ci,cii,ciii,blake,inkstr,lp1,nat,lex]=files;
const c=JSON.parse(corpus),ink=JSON.parse(inkstr),native=JSON.parse(nat),A=29,mod=x=>(x%A+A)%A,sum=a=>a.reduce((s,v)=>s+v,0),zero=()=>Array(A).fill(0),assert=(b,m)=>{if(!b)throw Error(m)};
const rune=new Map(c.runes.map((x,i)=>[x,i])),tokens=c.translit.map((x,i)=>[x,i]).sort((a,b)=>b[0].length-a[0].length);
const raw=trans.split("%");raw.splice(50,0,"");const tape=[],offsets=[0],marks=new Set();let pending="";
for(let p=0;p<58;p++){const seq=[];for(const ch of raw[p]){if(rune.has(ch)){const r=rune.get(ch);seq.push(r);tape.push({r,gap:pending,pg:p});pending=""}else if("-.$&§".includes(ch))pending+=ch}assert(seq.join()===c.pages[p].indices.join(),"page");offsets.push(tape.length)}
assert(offsets[56]===12956,"length");for(const p of ink.pages)if(p.page<56)for(const [i,n] of p.large_punctuation||[])if(n===13)marks.add(offsets[p.page]+i);
function gp(s){const t=[];let gap="";for(const m of s.toUpperCase().replaceAll("V","U").replaceAll("K","C").matchAll(/([A-Z]+)|([^A-Z]+)/g)){if(!m[1]){gap=/[.!?;:]/.test(m[0])?".":"-";continue}let first=true;for(let i=0;i<m[1].length;){const v=tokens.find(([s])=>m[1].startsWith(s,i));if(v){t.push({r:v[1],gap:first?gap:""});first=false;i+=v[0].length}else i++}}return t}
function h(t,from=0,to=t.length,m=new Set()){const z=Array.from({length:4},()=>Array.from({length:A},zero));for(let i=from+1;i<to;i++){const prev=t[i-1].r,d=mod(t[i].r-prev),s=m.has(i)?3:/[.$&§]/.test(t[i].gap)?2:t[i].gap?1:0;z[s][prev][d]++}return z}
const hist=z=>z.map(s=>Array.from({length:A},(_,d)=>sum(s.map(r=>r[d]))));
const clean=lp1.split(/^### /m).filter(s=>/^(1|3|5|6|9|10|11|12|13|14|15|16|56|57)\n/.test(s)).map(s=>s.split("\n").slice(1).filter(l=>!/^(#|\[|\(|\d)/.test(l)&&!/[0-9]/.test(l)).join("\n")).join("\n");
const donors=[["Crowley",gp([ci,cii,ciii].join("\n"))],["Blake",gp(blake.slice(blake.indexOf("THE ARGUMENT"),blake.indexOf("*** END OF THIS PROJECT GUTENBERG EBOOK")))],["Editorial LP",gp(clean)],["p57 actual",tape.slice(offsets[57],offsets[58])]];
const parts=[["training",0,40],["holdout",40,54],["terminal",54,56],["whole",0,56]].map(([name,lo,hi])=>{const v=hist(h(tape,offsets[lo],offsets[hi],marks));const w=v.slice(0,2).map(sum),n=sum(w),z=v[0][0]+v[1][0];return {name,w,n,z,rho:z/n}});
assert(parts[3].n===12781&&parts[3].z===85,"ordinary");
const primes=[];for(let n=2;primes.length<12956;n++){let ok=true;for(let j=2;j*j<=n;j++)if(n%j===0){ok=false;break}if(ok)primes.push((n-1)%29)}
const key8=gp("DIVINITY").map(x=>x.r),key13=gp("FIRFUMFERENFE").map(x=>x.r);assert(key8.length===8&&key13.length===13,"period lengths");
const inc=k=>k.map((v,i)=>mod(v-k[(i+1)%k.length])); // negative next-minus-previous increment
const qdist=xs=>{const q=zero();for(const x of xs)q[x]++;return q.map(v=>v/xs.length)};
const qs=[["uniform",zero().map(()=>1/A)],["DIUINITY cyclic",qdist(inc(key8))],["FIRFUMFERENFE cyclic",qdist(inc(key13))],["p56 consuming-prime",qdist(primes.slice(1,84).map((x,i)=>mod(primes[i]-x)))]];
function coupling(p,q,rho){
 const diag=p.map((v,i)=>v*q[i]),R=sum(diag),delta=Math.max(0,R-rho),minDiag=Math.max(0,...p.map((v,i)=>v+q[i]-1)),maxDiag=sum(p.map((v,i)=>Math.min(v,q[i]))),cap=sum(diag.map(v=>Math.min(v,delta/2)));
 const out={R,delta,minDiag,maxDiag,feasible:rho>=minDiag-1e-12,tvLower:delta,binaryKLbits:delta>0?(rho===0?0:rho*Math.log2(rho/R))+(1-rho)*Math.log2((1-rho)/(1-R)):0,exactTV:false};
 if(delta<=1e-14){out.exactTV=true;return out}
 if(cap+1e-12<delta)return out;
 // allocate removed diagonal mass with each entry <= delta/2.
 const a=zero();let remain=delta;for(let i=0;i<A;i++){a[i]=Math.min(diag[i],delta/2,remain);remain-=a[i]}
 assert(Math.abs(remain)<1e-11,"allocation");
 // circle transport: rotate by half the removed total, intervals length <= half.
 const starts=[0];for(const x of a)starts.push(starts.at(-1)+x);
 const J=p.map(v=>q.map(w=>v*w));for(let i=0;i<A;i++)J[i][i]-=a[i];
 for(let i=0;i<A;i++)for(let j=0;j<A;j++)for(const k of [-1,0,1]){const l=starts[j]+delta/2+k*delta,r=starts[j+1]+delta/2+k*delta;const x=Math.max(0,Math.min(starts[i+1],r)-Math.max(starts[i],l));J[i][j]+=x}
 const err=Math.max(...J.map((r,i)=>Math.abs(sum(r)-p[i])),...q.map((v,j)=>Math.abs(sum(J.map(r=>r[j]))-v)),Math.abs(sum(J.map((r,i)=>r[i]))-rho));
 const tv=sum(J.map((r,i)=>sum(r.map((v,j)=>Math.abs(v-p[i]*q[j])))))/2;
 assert(err<1e-10&&Math.abs(tv-delta)<1e-10&&J.every(r=>r.every(v=>v>=-1e-12)),"transport");
 return {...out,exactTV:true,tv,transportError:err,transport:J};
}
function contextCost(M,q,rho){
 const marg=Array.from({length:A},(_,i)=>sum(M[i])),base=sum(M.map((row,i)=>sum(row.map((v,d)=>v*q[d]))));
 let min=0;const options=[];
 for(let prev=0;prev<A;prev++){const row=M[prev],m=marg[prev];if(m===0)continue;let d1=row.indexOf(Math.min(...row));min+=row[d1];for(let d0=0;d0<A;d0++){const gain=q[d0]*(row[d0]-row[d1]),cost=q[d0]*(row[d0]+row[d1]);if(gain>0)options.push({prev,d0,d1,gain,cost,ratio:cost/gain})}}
 options.sort((a,b)=>a.ratio-b.ratio);let need=Math.max(0,base-rho),cost=0,achieved=0;const policy=[];
 for(const o of options){if(need<=1e-13)break;const use=Math.min(1,need/o.gain);cost+=use*o.cost;achieved+=use*o.gain;need-=use*o.gain;policy.push({...o,use})}
 return {base,min,possible:need<1e-10,minimumOverride:need<1e-10?cost:null,collisionReduction:achieved,policy};
}
const rows=[];
for(const [name,t] of donors){const H=h(t),hh=hist(H);for(const part of parts){const M=Array.from({length:A},(_,i)=>Array.from({length:A},(_,d)=>sum(part.w.map((w,s)=>w/part.n*H[s][i][d]/sum(hh[s])))));const p=Array.from({length:A},(_,d)=>sum(M.map(r=>r[d])));for(const [clock,q] of qs){const cp=coupling(p,q,part.rho),cc=contextCost(M,q,part.rho);rows.push({donor:name,part:part.name,clock,p,q,...cp,context:cc})}}}
const known=gp("AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE").map(x=>x.r);let used=0;const eff=known.map(p=>p===0?0:primes[used++]),solved=known.map((p,i)=>mod(p+eff[i]));assert(used===84&&known.length===85&&solved.join()===c.pages[56].indices.join(),"p56");
const actualJ=Array.from({length:A},zero);for(let i=1;i<known.length;i++)actualJ[mod(known[i]-known[i-1])][mod(eff[i-1]-eff[i])]++;
const pp=actualJ.map(r=>sum(r)/84),qq=Array.from({length:A},(_,j)=>sum(actualJ.map(r=>r[j]))/84),actualR=sum(actualJ.map((r,i)=>r[i]))/84,base=sum(pp.map((v,i)=>v*qq[i])),actualTV=sum(actualJ.map((r,i)=>sum(r.map((v,j)=>Math.abs(v/84-pp[i]*qq[j])))))/2;
const p56={runes:85,consuming:used,actualEqualities:actualR*84,expectedUnderEmpiricalProduct:base*84,actualTV,actualJ};
// Enumerate the exact local transposition support. At any state a permutation
// which swaps nominal zero with one other output leaves every other output fixed.
function encStep(d,e,t){const z=mod(d+e);return z===0?t:z===t?0:z}
function decStep(z,e,t){return mod((z===0?t:z===t?0:z)-e)}
let roundtrips=0;for(let e=0;e<A;e++)for(let t=0;t<A;t++)for(let d=0;d<A;d++){const z=encStep(d,e,t);assert(decStep(z,e,t)===d,"swap roundtrip");assert(z===0||mod(d+e)===0||mod(d+e)===z,"envelope");roundtrips++}
// Reuse the exact 38,938-variant lexicon of Agent48's previous checkpoint.
const dict=new Map(),al=new Map(c.translit.map((s,i)=>[s,i])),id=w=>String.fromCharCode(...w),add=w=>{if(w.length)dict.set(id(w),w)},rw=s=>(s.match(/[\u16a0-\u16ff]+/g)||[]).map(w=>Array.from(w,ch=>rune.get(ch)).filter(x=>x!==undefined));
function variants(s,visit){const w=s.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");function dfs(i,a){if(i===w.length){visit(a);return}for(let k=1;k<=3;k++){const t=w.slice(i,i+k);if(t.length!==k)continue;const v=k===3?t==="ING"?al.get("NG"):undefined:al.get(t);if(v!==undefined)dfs(i+k,[...a,v])}}dfs(0,[])}
for(const line of lex.split(/\r?\n/)){const m=/^([a-z]+)\s+(\d+)$/.exec(line);if(m)variants(m[1],add)}
for(const s of native.sections)for(const w of rw(s.source_text))add(w);assert(dict.size===38938,"dictionary");
const words=rw(trans.replace(/[\s/%]/g,"")).slice(0,2896);assert(words.flat().join()===tape.slice(0,12956).map(x=>x.r).join(),"words");
const by=Array.from({length:64},()=>[]);for(const w of dict.values())if(w.length<64)by[w.length].push(w);
function support(w,p,key,hold,phase){let prev=-1,used=0;for(let j=0;j<w.length;j++){if(hold&&p[j]===0){if(w[j]!==0)return false;continue}if(prev>=0){const z=mod(w[j]-w[prev]),d=mod(p[j]-p[prev]),e=mod(key(phase+used)-key(phase+used-1));if(z!==0&&mod(d+e)!==0&&mod(d+e)!==z)return false}prev=j;used++}return true}
const clocks=[["DIUINITY",i=>key8[i%8],8],["FIRFUMFERENFE",i=>key13[i%13],13],["prime-minus-one",i=>primes[i],0]];
const positions=Array.from({length:29},()=>[]);for(let k=1;k<primes.length;k++)positions[mod(primes[k]-primes[k-1])].push(k);
function lowerBound(a,x){let l=0,r=a.length;while(l<r){let m=(l+r)>>>1;if(a[m]<x)l=m+1;else r=m}return l}
function primeHoldSupport(w,p,from,to){
 let prev=-1,used=0,cs=[];
 for(let j=0;j<p.length;j++){if(p[j]===0){if(w[j]!==0)return false;continue}
 if(prev>=0){const z=mod(w[j]-w[prev]);if(z!==0){const d=mod(p[j]-p[prev]);cs.push([used,mod(-d),mod(z-d)])}}prev=j;used++}
 if(!cs.length)return true;
 // Select a constraint with the fewest candidate starts in the interval.
 let best=null;for(const [off,a,b] of cs){const aa=positions[a],bb=positions[b],i=lowerBound(aa,from+off),j=lowerBound(bb,from+off),I=lowerBound(aa,to+off+1),J=lowerBound(bb,to+off+1);const n=I-i+J-j;if(n===0)return false;if(!best||n<best.n)best={off,aa,bb,i,j,I,J,n}}
 function good(phase){for(const [k,a,b] of cs){const e=mod(primes[phase+k]-primes[phase+k-1]);if(e!==a&&e!==b)return false}return true}
 for(let i=best.i;i<best.I;i++)if(good(best.aa[i]-best.off))return true;
 for(let j=best.j;j<best.J;j++)if(good(best.bb[j]-best.off))return true;return false;
}
const gates=[];for(const [name,key,period] of clocks)for(const hold of [false,true]){let pos=0,zeroBefore=0;const byLen={},miss=[];for(let i=0;i<words.length;i++){const w=words[i];if(w.length>=7){let ok=false;const from=period?0:hold?pos-zeroBefore:pos,to=period?period-1:pos;
 for(const p of by[w.length]){if(!period&&hold){if(primeHoldSupport(w,p,from,to)){ok=true;break}}else{if(hold&&p.some((v,j)=>v===0&&w[j]!==0))continue;for(let phase=from;phase<=to;phase++){if(support(w,p,key,hold,phase)){ok=true;break}}if(ok)break}}
 const r=byLen[w.length]??={total:0,compatible:0};r.total++;if(ok)r.compatible++;else miss.push(i)}pos+=w.length;zeroBefore+=w.filter(v=>v===0).length}gates.push({name,hold,phasePolicy:period?"arbitrary per word":hold?"every phase in physical offset minus preceding visible zeros through physical offset":"continuous physical offset",byLen,miss,compatible:sum(Object.values(byLen).map(x=>x.compatible)),total:sum(Object.values(byLen).map(x=>x.total))})}
// Synthetic full-state ordinary plants: swap target determined by decoded previous
// plaintext and public step; this is a diagnostic, not a fitted source key.
const plants=[];for(const [name,t] of donors.slice(0,3)){const plain=t.slice(0,12956).map(x=>x.r),cc=[plain[0]],back=[plain[0]];for(let i=1;i<plain.length;i++){const e=mod(key8[i%8]-key8[(i-1)%8]),target=mod(plain[i-1]+i),d=mod(plain[i]-plain[i-1]);cc.push(mod(cc[i-1]+encStep(d,e,target)))}for(let i=1;i<cc.length;i++){const e=mod(key8[i%8]-key8[(i-1)%8]),target=mod(back[i-1]+i),z=mod(cc[i]-cc[i-1]);back.push(mod(back[i-1]+decStep(z,e,target)))}assert(back.join()===plain.join(),"plant");plants.push({name,runes:plain.length,roundtrip:true})}

const gateControls=[];
for(const [name,key,period] of clocks)for(const hold of [false,true]){
 let tested=0,nontrivial=0,held=0,ordinaryZeros=0;
 for(const section of native.sections.filter(s=>s.name!=="0_wisdom"))for(const p of rw(section.source_text)){
  if(p.length<2)continue;
  const phase=period?tested%period:tested;
  let prev=-1,used=0,Cprev=0;const w=[];
  for(let j=0;j<p.length;j++){
   if(hold&&p[j]===0){w.push(0);held++;continue}
   let x;
   if(prev<0)x=mod(p[j]+key(phase));
   else {const e=mod(key(phase+used)-key(phase+used-1)),d=mod(p[j]-p[prev]),t=mod(p[prev]+j+tested),z=encStep(d,e,t);assert(decStep(z,e,t)===d,"control inverse");x=mod(Cprev+z);if(z!==mod(d+e))nontrivial++}
   w.push(x);if(x===0)ordinaryZeros++;prev=j;used++;Cprev=x;
  }
  assert(support(w,p,key,hold,phase),"gate rejected planted word");if(!period&&hold){const lo=Math.max(0,phase-5),hi=phase+5;assert(primeHoldSupport(w,p,lo,hi),"prime index lost planted word");const brute=Array.from({length:hi-lo+1},(_,k)=>lo+k).some(k=>support(w,p,key,true,k));assert(brute===primeHoldSupport(w,p,lo,hi),"prime index mismatch");}tested++;
 }
 gateControls.push({name,hold,tested,nontrivial,held,ordinaryZeros});
}
assert(support(solved,known,i=>primes[i],true,0),"real p56 F-hold support");

return {parts,keys:{key8,key13},rows,p56,roundtrips,lexicon:dict.size,gates,plants,gateControls};
}
const data=inputs.map(({path,sha})=>{const b=fs.readFileSync(path);if(crypto.createHash('sha1').update(`blob ${b.length}\0`).update(b).digest('hex')!==sha)throw Error('input changed: '+path);return b.toString('utf8')});
console.log(JSON.stringify(study(data),null,2));
