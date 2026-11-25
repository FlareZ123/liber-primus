'use strict';
const fs=require('node:fs');
function experiment(src,corpus){
 const assert=(p,m)=>{if(!p)throw Error(m)};
 const runes=Array.from("ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ");
 const names=["F","U","TH","O","R","C","G","W","H","N","I","J","EO","P","X","S","T","B","E","M","L","NG","OE","D","A","AE","Y","IA","EA"];
 const ix=new Map(runes.map((x,i)=>[x,i]));
 const pages=src.replace(/\r\n/g,"\n").split(/\n%\n/);
 const words=s=>s.split(/[-.&$§]/u).map(s=>Array.from(s).filter(x=>ix.has(x)).map(x=>ix.get(x))).filter(x=>x.length);
 const fr=words(pages[54]),ws=fr.slice(1);
 assert(JSON.stringify(fr.flat())===JSON.stringify(corpus.pages.find(p=>p.page===55).indices),"p55 source mismatch");
 assert(fr[0].length===1&&fr[0][0]===21&&ws.length===16,"framing");
 const I=ws.flatMap(w=>w.slice(1,-1)),S=ws.flatMap(w=>[w[0],w.at(-1)]);
 assert(I.length===43&&S.length===32,"split");
 const val=(a,b)=>a.reduce((n,x)=>n*BigInt(b)+BigInt(x),0n);
 const dig=(n,b)=>{const a=[];do{a.unshift(Number(n%BigInt(b)));n/=BigInt(b)}while(n);return a};
 const pow=(x,e,m)=>{let a=1n;while(e>0n){if(e&1n)a=a*x%m;x=x*x%m;e>>=1n}return a};
 const N=val(I,59),E=val(S,59),d=368n,p=23n;
 assert(N%d===0n,"divisibility");
 const c1=E%p,shared=pow(c1,6n,p),inverse=pow(shared,p-2n,p);
 assert(c1===20n&&shared===16n&&inverse===13n,"shared");
 const decode=q=>val(dig(q,23).map(x=>Number(BigInt(x)*inverse%p)),23);
 const encode=m=>val(dig(m,23).map(x=>Number(BigInt(x)*shared%p)),23);
 const Q=N/d,M=decode(Q),C=dig(Q,23),P=dig(M,23),GP=dig(M,29);
 assert(encode(M)*d===N,"integer replay");
 const recI=dig(encode(M)*d,59);
 assert(JSON.stringify(recI)===JSON.stringify(I),"glyph replay");
 let cursor=0;
 const recovered=[fr[0],...ws.map(w=>[w[0],...recI.slice(cursor,cursor+=w.length-2),w.at(-1)])].flat();
 assert(JSON.stringify(recovered)===JSON.stringify(fr.flat()),"full source replay");
 const native=words(pages[56]).flat();
 assert(native.length===95,"p57 length");
 const controls=[[0,41],[41,82],[82,95]].map(([a,b])=>{
   const plain=native.slice(a,b),m=val(plain,29),q=encode(m),n=q*d,phys=dig(n,59);
   assert(decode(q)===m,"arithmetic native control");
   const replay=dig(decode(q),29);
   while(replay.length<plain.length)replay.unshift(0);
   assert(JSON.stringify(replay)===JSON.stringify(plain),"native control");
   return {start:a,end:b,exact:plain.length,base59Digits:phys.length,illegalDigits:phys.filter(x=>x>=29).length,physicallyRepresentable:phys.length<=43&&phys.every(x=>x<29)};
 });
 // Exact finite carrier census. Leading GP F (0) is permitted, generous to this model.
 let counts=Array(Number(d)).fill(0n);counts[0]=1n;
 for(let i=0;i<43;i++){const next=counts.map(()=>0n);for(let j=0;j<counts.length;j++)for(let x=0;x<29;x++)next[(59*j+x)%Number(d)]+=counts[j];counts=next}
 const capacity=counts[0];assert(counts.reduce((a,b)=>a+b,0n)===29n**43n,"count conservation");
 assert(29n**41n<=capacity&&capacity<29n**42n,"capacity");
 const ioc=GP.reduce((s,x,i)=>s+GP.slice(i+1).filter(y=>x===y).length,0)*2/(GP.length*(GP.length-1));
 return {original:{Q:Q.toString(),shared:Number(shared),inverse:Number(inverse),fieldDigits:C.length,zeroCipherDigits:C.filter(x=>x===0).length,zeroPositions:C.flatMap((x,i)=>x===0?[i]:[]),lastPlainDigit:P.at(-1),GP,readout:GP.map(x=>names[x]).join(" "),IoC:ioc,integerBits:M.toString(2).length,fullGlyphReplay:recovered.length},controls,capacity:{valid43:capacity.toString(),bits:Math.log2(Number(capacity)),maxUnrestrictedGP29:41}};
}
const src=fs.readFileSync('resources/transcriptions/lp2-image-corrected.txt','utf8');
const corpus=JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json','utf8'));
console.log(JSON.stringify(experiment(src,corpus),null,2));
