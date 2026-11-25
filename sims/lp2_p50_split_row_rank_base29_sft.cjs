#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} p */
const read = p => JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
/** Reversible rank split and exact affine original-cipher receiver. */
function analyze(grid,corpus,solved) {
  const mod=x=>(x%29+29)%29;
  function choose(n,k){if(k<0||k>n)return 0n;let x=1n;for(let i=1;i<=k;i++)x=x*BigInt(n-i+1)/BigInt(i);return x}
  const factorial=[1];for(let i=1;i<=8;i++)factorial.push(factorial[i-1]*i);
  function permRank(row,s){const pool=s.slice();let rank=0;for(let i=0;i<8;i++){const j=pool.indexOf(row[i]);if(j<0)throw Error("invalid row");rank=rank*(8-i)+j;pool.splice(j,1)}return rank}
  function permUnrank(rank,s){const pool=s.slice(),row=[];for(let i=7;i>=0;i--){const j=Math.floor(rank/factorial[i]);rank%=factorial[i];row.push(pool.splice(j,1)[0])}return row}
  function combRank(s){return s.reduce((r,v,i)=>r+choose(v,i+1),0n)}
  function combUnrank(rank){const s=[];let upper=255;for(let i=8;i>=1;i--){while(choose(upper,i)>rank)upper--;s.unshift(upper);rank-=choose(upper,i);upper--}if(rank!==0n)throw Error("rank residue");return s}
  function pack(a,base){return a.reduce((r,x)=>r*base+BigInt(x),0n)}
  function unpack(value,base,n){const a=[];for(let i=0;i<n;i++){a.unshift(value%base);value/=base}if(value!==0n)throw Error("pack overflow");return a}
  function base29(x){const a=[];do{a.unshift(Number(x%29n));x/=29n}while(x);return a}
  const tokens=grid.pages.flatMap(p=>p.tokens);
  if(tokens.length!==256)throw Error("table shape");
  const membershipBase=choose(256,8);
  function make(alphabet){const bytes=tokens.map(t=>alphabet.indexOf(t[0])*alphabet.length+alphabet.indexOf(t[1]));const rows=Array.from({length:32},(_,i)=>bytes.slice(8*i,8*i+8));const sets=rows.map(a=>a.slice().sort((a,b)=>a-b));if(sets.some(s=>new Set(s).size!==8))throw Error("non-distinct row");const perm=rows.map((a,i)=>permRank(a,sets[i])),comb=sets.map(combRank);
    const p=pack(perm,40320n),c=pack(comb,membershipBase);const p29=base29(p),c29=base29(c);
    const pr=unpack(pack(p29,29n),40320n,32),cr=unpack(pack(c29,29n),membershipBase,32);const restored=pr.flatMap((v,i)=>permUnrank(Number(v),combUnrank(cr[i])));
    if(restored.some((v,i)=>v!==bytes[i]))throw Error("row reconstruction");
    return {perm,comb:comb.map(String),p29,c29,permutationBits:p.toString(2).length,combinationBits:c.toString(2).length,replay:restored.length};
  }
  const b60=make(grid.alphabet),b59=make(grid.alphabet.replace("f",""));
  if(b60.perm.some((x,i)=>x!==b59.perm[i]))throw Error("order channel changed");
  const channels=[["order",b60.p29],["membership59",b59.c29],["membership60",b60.c29]];
  const runeMap=new Map(corpus.runes.map((r,i)=>[r,i]));
  const native=solved.sections.map(s=>({name:s.name,a:[...s.source_text].filter(c=>runeMap.has(c)).map(c=>runeMap.get(c))}));
  const n2=new Float64Array(900),n3=new Float64Array(27000),w=new Float64Array(27000);
  for(const {name,a} of native.filter(x=>!x.name.startsWith("p5"))){let u=29,v=29;for(const x of a){n2[30*u+v]++;n3[(30*u+v)*30+x]++;u=v;v=x}}
  for(let z=0;z<900;z++)for(let x=0;x<29;x++)w[z*30+x]=Math.log((n3[z*30+x]+.3)/(n2[z]+8.7));
  function score(a){let s=0,u=29,v=29;for(const x of a){s+=w[(30*u+v)*30+x];u=v;v=x}return s/a.length}
  function ioc(a){const f=Array(29).fill(0);for(const x of a)f[x]++;return f.reduce((s,x)=>s+x*(x-1),0)/(a.length*(a.length-1))}
  function spell(a){return a.map(x=>corpus.translit[x]).join("")}
  function enc(a,key,phase,hold){let j=phase;return a.map(x=>{if(hold&&x===0)return 0;const y=mod(x+key[j]);j=(j+1)%key.length;return y})}
  function ordinary(a,key,phase){return a.map((x,i)=>mod(x-key[(i+phase)%key.length]))}
  // Each bit represents the next key cursor. A literal plaintext F holds
  // iff ciphertext F; every consuming transition must decode to non-F.
  function reach(cipher,key,initialPhase=null){
    const L=BigInt(key.length),full=(1n<<L)-1n,eq=Array(29).fill(0n);
    key.forEach((x,j)=>eq[x]|=1n<<BigInt(j));
    let s=initialPhase===null?full:1n<<BigInt(initialPhase),i=0;
    for(const x of cipher){const q=s&(full^eq[x]),rot=((q<<1n)&full)|(q>>(L-1n));s=x===0?s|rot:rot;if(s===0n)return i;i++}
    return i;
  }
  function exhaustiveOrdinary(cipher,dev,digits){
    const L=digits.length,fit=Uint8Array.from(cipher.slice(0,dev));let best={s:-Infinity,a:0,b:0,p:0};
    let evaluated=0,ties=0;
    for(let a=1;a<29;a++)for(let b=0;b<29;b++){
      const key=Uint8Array.from(digits,x=>(a*x+b)%29);
      for(let p=0;p<L;p++){
        let s=0,u=29,v=29,j=p;
        for(let i=0;i<fit.length;i++){let x=fit[i]+29-key[j];if(x>=29)x-=29;s+=w[(30*u+v)*30+x];u=v;v=x;if(++j===L)j=0}
        evaluated++;
        if(s>best.s+1e-10){best={s,a,b,p};ties=1}else if(Math.abs(s-best.s)<=1e-10)ties++;
      }
    }
    const key=digits.map(x=>(best.a*x+best.b)%29),plain=ordinary(cipher,key,best.p);
    if(enc(plain,key,best.p,false).some((x,i)=>x!==cipher[i]))throw Error("ordinary replay");
    return {a:best.a,b:best.b,phase:best.p,evaluated,ties,devScore:best.s/dev,holdoutScore:score(plain.slice(dev)),ioc:ioc(plain),text:spell(plain),plain};
  }
  const original=corpus.pages.filter(p=>p.page>=51&&p.page<=55).flatMap(p=>p.indices);
  const dev=corpus.pages.filter(p=>p.page>=51&&p.page<=53).reduce((s,p)=>s+p.indices.length,0);
  if(original.length!==842||dev!==534)throw Error("original span");
  const held=native.filter(x=>x.name.startsWith("p5")),plant=held.flatMap(x=>x.a),plantDev=held[0].a.length;
  const controls=held.map(x=>({name:x.name,len:x.a.length,score:score(x.a),ioc:ioc(x.a)}));
  const result=[];
  for(let ci=0;ci<channels.length;ci++){
    const [name,d]=channels[ci];const fixed=[],all=[];
    for(let a=1;a<29;a++)for(let b=0;b<29;b++){const key=d.map(x=>(a*x+b)%29),n=reach(original,key);all.push({a,b,maxPrefix:n})}
    for(const a of [1,28]){const key=d.map(x=>a*x%29),reaches=d.map((_,p)=>reach(original,key,p));fixed.push({a,phase0:reaches[0],allPhaseMax:Math.max(...reaches),full:reaches.filter(x=>x===original.length).length,dev:reaches.filter(x=>x>=dev).length})}
    const maxPrefix=Math.max(...all.map(x=>x.maxPrefix)),devSurvivors=all.filter(x=>x.maxPrefix>=dev),fullSurvivors=all.filter(x=>x.maxPrefix===original.length);
    // Plant unknown affine parameters and phase; the search is unaware of them.
    const pa=[7,13,19][ci],pb=[11,3,24][ci],pp=[37,159,247][ci],pk=d.map(x=>(pa*x+pb)%29);
    const pc=enc(plant,pk,pp,false),pf=enc(plant,pk,pp,true);
    const pos=exhaustiveOrdinary(pc,plantDev,d);
    const positive={truth:{a:pa,b:pb,phase:pp},selected:{a:pos.a,b:pos.b,phase:pos.phase},exact:pos.plain.filter((x,i)=>x===plant[i]).length,total:plant.length,heldoutExact:pos.plain.slice(plantDev).filter((x,i)=>x===plant[plantDev+i]).length,heldoutTotal:plant.length-plantDev,devScore:pos.devScore,holdoutScore:pos.holdoutScore,holdTruePhaseReach:reach(pf,pk,pp),holdAllPhaseReach:reach(pf,pk)};
    const o=exhaustiveOrdinary(original,dev,d);
    result.push({name,digits:d,base29:d.map(x=>"0123456789ABCDEFGHIJKLMNOPQRS"[x]).join(""),directScore:score(d),directIoc:ioc(d),directText:spell(d),fixed,affine:{evaluated:all.length,phasePairs:all.length*d.length,maxPrefix,devSurvivors,fullSurvivors,all},ordinary:o,positive});
  }
  return {table:{perm:b60.perm,comb59:b59.comb,comb60:b60.comb,permBits:b60.permutationBits,comb59Bits:b59.combinationBits,comb60Bits:b60.combinationBits,replay:[b59.replay,b60.replay],membershipBase:String(membershipBase),capacity:{permutationBits:32*Math.log2(40320),membershipBits:32*Math.log2(Number(membershipBase))}},originalLen:original.length,dev,controls,result};
}
const result=analyze(read('resources/liber-primus/lp2-grid-256.json'),read('resources/liber-primus/lp2-corpus.json'),read('resources/external/relikd-solved-gp29-native-v1.json'));
console.log(JSON.stringify(result,null,2));
