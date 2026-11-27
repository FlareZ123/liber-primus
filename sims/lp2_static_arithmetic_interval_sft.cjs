'use strict';
const fs=require('node:fs');
const path=require('node:path');
function arithmeticGate(d,lp1){
 const assert=(x,m)=>{if(!x)throw Error(m)},eq=(a,b)=>a.length===b.length&&a.every((v,i)=>v===b[i]),runes=new Map(d.runes.map((x,i)=>[x,i])),pages=lp1.split("%").map(s=>[...s].filter(c=>runes.has(c)).map(c=>runes.get(c))).filter(a=>a.length);
 const trainIDs=[3,8,9,10],holdIDs=[11,14],train=trainIDs.flatMap(i=>pages[i]);assert(eq(trainIDs.map(i=>pages[i].length),[157,187,207,192])&&eq(holdIDs.map(i=>pages[i].length),[169,89]),"native LP1 physical page classification");
 const weights=Array(30).fill(1);for(const c of train)weights[c]++;const cum=[0n];for(const w of weights)cum.push(cum.at(-1)+BigInt(w));const T=cum.at(-1),B=29n;
 const ceil=(a,b)=>(a+b-1n)/b;
 function encode(plain){
  let L=0n,H=1n,D=1n;
  for(const c of [...plain,29]){const w=H-L;H=L*T+w*cum[c+1];L=L*T+w*cum[c];D*=T}
  let P=1n,m=0,x=0n;while(true){x=ceil(L*P,D);if((x+1n)*D<=H*P)break;P*=B;m++}
  const out=Array(m);for(let i=m-1;i>=0;i--){out[i]=Number(x%B);x/=B}assert(x===0n,"base29 overflow");return out;
 }
 function decode(a){
  let x=0n,D=1n;for(const c of a){assert(c>=0&&c<29&&Number.isInteger(c),"invalid digit");x=x*B+BigInt(c);D*=B}
  let L=x,H=x+1n;const plain=[];
  while(true){const l=L*T/D,h=(H*T-1n)/D;let c=0;while(cum[c+1]<=l)c++;
   if(h>=cum[c+1])return {status:"boundary-crossing",decoded:plain.length,plain};
   const off=cum[c]*D;L=L*T-off;H=H*T-off;D*=BigInt(weights[c]);
   if(c===29){const canonical=encode(plain);return {status:eq(canonical,a)?"canonical":"noncanonical-eof",decoded:plain.length,canonicalDigits:canonical.length,plain}}
   plain.push(c);
  }
 }
 const mod=x=>(x%29+29)%29,primes=[];for(let n=2;primes.length<85;n++)if(!primes.some(p=>p*p<=n&&n%p===0))primes.push(n);
 let k=0;const p56=d.pages[56].indices.map((c,i)=>i===56?0:mod(c-(primes[k++]-1)));assert(p56.map(x=>d.translit[x]).join("")==="ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGETHATHASHESTOITISTHEDUTYOFEUERYPILGRIMTOSEECOUTTHISPAGE"&&k===84,"native p56");
 const p57=d.pages[57].indices,donors=[...holdIDs.map(i=>({id:"LP1p"+i,plain:pages[i]})),{id:"LP2p56",plain:p56},{id:"LP2p57",plain:p57}];
 const repeats=a=>a.slice(1).filter((x,i)=>x===a[i]).length;
 const brief=(v)=>{const {plain,...rest}=v;return {...rest,prefix:plain.slice(0,36).map(x=>d.translit[x]).join(""),...(v.status==="canonical"?{decodedIndices:plain}: {})}};
 const control=donors.map(({id,plain})=>{const c=encode(plain),v=decode(c);assert(v.status==="canonical"&&eq(v.plain,plain)&&eq(encode(v.plain),c),"native replay");const append=decode([...c,0]);assert(append.status!=="canonical","canonical padding rejection");return {id,plain:plain.length,cipher:c.length,repeats:repeats(c),roundtrip:true,appendedZero:append.status}});
 const empty=encode([]);assert(decode(empty).status==="canonical"&&decode(empty).decoded===0,"empty");
 const src=d.pages.filter(p=>p.page<56&&p.indices.length),all=src.flatMap(p=>p.indices);assert(src.length===55&&all.length===12956,"source total");
 const rows=src.map(p=>({page:p.page,length:p.indices.length,repeats:repeats(p.indices),...brief(decode(p.indices))}));const full={length:all.length,repeats:repeats(all),...brief(decode(all))};
 let seed=0x3129a12;function rand(n){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return Math.floor((seed>>>0)/4294967296*n)}
 function tape(n,r){const sites=new Set;while(sites.size<r)sites.add(1+rand(n-1));const a=[rand(29)];for(let i=1;i<n;i++){const p=a.at(-1);if(sites.has(i))a.push(p);else{const j=rand(28);a.push(j+(j>=p?1:0))}}return a}
 const hist={};for(const group of ["uniform","matched"]){let counts={},sample=[];for(const p of src){for(let rep=0;rep<4;rep++){const n=p.indices.length,a=group==="uniform"?Array.from({length:n},()=>rand(29)):tape(n,repeats(p.indices));const v=decode(a);counts[v.status]=(counts[v.status]||0)+1;if(v.status==="canonical")sample.push({page:p.page,length:n,...brief(v)})}}hist[group]={counts,canonical:sample}}
 const fullNull={};for(const group of ["uniform","matched"]){let counts={},sample=[];for(let j=0;j<8;j++){const a=group==="uniform"?Array.from({length:all.length},()=>rand(29)):tape(all.length,repeats(all));const v=decode(a);counts[v.status]=(counts[v.status]||0)+1;if(v.status==="canonical")sample.push(brief(v))}fullNull[group]={counts,canonical:sample}}
 return {model:{trainIDs,trainLength:train.length,holdIDs,weights,EOF:29,total:Number(T),digits:"GP29 indices, most significant first",termination:"shortest entire base29 cylinder inside EOF interval; smallest integer at that length"},control,empty:empty.length,full,rows,controlNull:hist,fullNull};
}
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
console.log(JSON.stringify(arithmeticGate(JSON.parse(read('resources/liber-primus/lp2-corpus.json')),read('resources/transcriptions/lp1_wulfic_canonical.txt')),null,2));
