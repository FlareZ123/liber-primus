'use strict';
// #3141: one frozen direct centered-difference Rice / minimal BASE29 bit frame.
// No claim that the analyst-selected sentinel or GP29 mapping was authored.
function experiment(gp, lp1, donorTexts, testOriginal=true){
 const assert=(x,m)=>{if(!x)throw Error(m)}, eq=(a,b)=>a.length===b.length&&a.every((v,i)=>v===b[i]);
 const mod=x=>(x%29+29)%29, EOF=29;
 // Signed mapping and unary convention from Mahoney, Data Compression Explained §3.4.
 const fold=d=>d<0?-2*d-1:2*d, unfold=v=>v%2?-(v+1)/2:v/2;
 const centered=x=>mod(x+14)-14;
 /** @param {number[]} a */
 function deltas(a){let prev=0;return a.map(x=>{const v=fold(centered(x-prev));prev=x;return v;});}
 /** @param {number} v @param {number} k */
 function word(v,k){return '1'.repeat(Math.floor(v/2**k))+'0'+(k?(v%2**k).toString(2).padStart(k,'0'):'');}
 assert(word(5,2)==='1001'&&word(6,1)==='11100'&&word(0,2)==='000','historical Rice worked table');
 function base29(x){if(x===0n)return [0];const a=[];while(x){a.push(Number(x%29n));x/=29n;}return a.reverse();}
 function integer(a){let x=0n;for(const d of a){assert(Number.isInteger(d)&&d>=0&&d<29,'GP digit');x=x*29n+BigInt(d);}return x;}
 assert(eq(base29(3301n),[3,26,24])&&eq(base29(30n),[1,1])&&eq(base29(1033n),[1,6,18]),'historical BASE29');
 /** @param {string} bits */
 function pack(bits){return base29(BigInt('0b1'+bits));}
 function unpack(a){if(!a.length||a[0]===0)return null;const x=integer(a);return x.toString(2).slice(1);}
 function encode(a,k){return [...deltas(a),EOF].map(v=>word(v,k)).join('');}
 function receive(a,k){
  const bits=unpack(a);if(bits===null)return {status:'nonminimal-or-zero'};
  const suffix=word(EOF,k),suffixOK=bits.endsWith(suffix);
  if(!suffixOK)return {status:'wrong-eof-suffix',bits:bits.length,suffixOK};
  let i=0,prev=0;const plain=[];
  while(i<bits.length){
   let q=0;while(i<bits.length&&bits[i]==='1'){q++;i++;if(q*2**k>EOF)return {status:'out-of-range-quotient',decoded:plain.length,bits:bits.length,suffixOK};}
   if(i===bits.length||i+1+k>bits.length)return {status:'truncated-codeword',decoded:plain.length,bits:bits.length,suffixOK};
   i++;const r=k?parseInt(bits.slice(i,i+k),2):0;i+=k;const v=q*2**k+r;
   if(v>EOF)return {status:'out-of-range-value',decoded:plain.length,bits:bits.length,suffixOK};
   if(v===EOF){
    if(i!==bits.length)return {status:'early-eof',decoded:plain.length,bits:bits.length,trailing:bits.length-i,suffixOK};
    assert(eq(pack(encode(plain,k)),a),'exact replay');
    return {status:'canonical',plain,decoded:plain.length,bits:bits.length,suffixOK};
   }
   prev=mod(prev+unfold(v));plain.push(prev);
  }
  return {status:'missing-eof',decoded:plain.length,bits:bits.length,suffixOK};
 }
 const primes=[];for(let n=2;primes.length<85;n++)if(!primes.some(p=>p*p<=n&&n%p===0))primes.push(n);
 let j=0;const p56=gp.pages[56].indices.map((c,i)=>i===56?0:mod(c-(primes[j++]-1)));
 assert(j===84&&p56.map(i=>gp.translit[i]).join('')==='ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGETHATHASHESTOITISTHEDUTYOFEUERYPILGRIMTOSEECOUTTHISPAGE','authentic p56');
 const map=new Map(gp.runes.map((r,i)=>[r,i]));
 const lp1pages=lp1.split('%').map(s=>[...s].filter(c=>map.has(c)).map(c=>map.get(c))).filter(a=>a.length);
 assert(eq([3,8,9,10,11,14].map(i=>lp1pages[i].length),[157,187,207,192,169,89]),'LP1 geometry');
 const training=[3,8,9].map(i=>lp1pages[i]);
 // Count all EOFs; for k>=5 q=0 and length grows with k, so 0..5 exhaustive.
 const costs=Array.from({length:6},(_,k)=>training.reduce((s,a)=>s+encode(a,k).length,0));
 const k=costs.indexOf(Math.min(...costs)); // lowest k on ties
 const native=[...[10,11,14].map(i=>({id:'LP1p'+i,a:lp1pages[i]})),{id:'LP2p56',a:p56},{id:'LP2p57',a:gp.pages[57].indices}];
 const tok=gp.translit.map((x,i)=>[x,i]).sort((a,b)=>b[0].length-a[0].length);
 function translit(s){
  const a=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){
   w=w.replace(/QU/g,'CW').replace(/V/g,'U').replace(/[KQ]/g,'C').replace(/Z/g,'S');
   for(let i=0;i<w.length;){if(w.startsWith('ING',i)){a.push(21);i+=3;continue}if(w.startsWith('IO',i)){a.push(27);i+=2;continue}
    const t=tok.find(x=>w.startsWith(x[0],i));assert(t,'donor token');a.push(t[1]);i+=t[0].length;}
  }return a;
 }
 const repeats=a=>a.slice(1).filter((x,i)=>x===a[i]).length;
 function control(id,a,negative=false){
  const bits=encode(a,k),frame=pack(bits),v=receive(frame,k);assert(v.status==='canonical'&&eq(v.plain,a),'native inverse '+id);
  const row={id,plain:a.length,bits:bits.length,digits:frame.length,ratio:frame.length/Math.max(1,a.length),repeats:repeats(frame),repeatRate:repeats(frame)/Math.max(1,frame.length-1)};
  if(negative)row.mutations=[
   ['truncate-one-bit',pack(bits.slice(0,-1)),k],['append-zero-bit',pack(bits+'0'),k],['leading-zero-digit',[0,...frame],k],['wrong-k',frame,(k+1)%6]
  ].map(([kind,f,key])=>{const z=receive(f,key);return {kind,status:z.status,samePlain:z.status==='canonical'&&eq(z.plain,a)}});
  return row;
 }
 const controls=native.map(({id,a})=>control(id,a,true));
 for(const a of [[],[0],[28],[0,0,0],Array.from({length:29},(_,i)=>i),Array.from({length:29},(_,i)=>28-i)])control('edge',a);
 for(let v=0;v<29;v++)for(let w=0;w<29;w++)control('pair',[v,w]);
 const literary=[];
 for(let i=0;i<donorTexts.length;i++){
  const a=translit(donorTexts[i]);assert(a.length>=25912,'donor length');
  literary.push(control('donor'+i+'-native12956',a.slice(0,12956)));
  // Monotonicity of positive integer under inserting a codeword before fixed EOF:
  // bit length grows; BASE29 width cannot decrease. Select longest prefix <=12956 digits.
  let lo=0,hi=25912;
  while(lo+1<hi){const m=Math.floor((lo+hi)/2);if(pack(encode(a.slice(0,m),k)).length<=12956)lo=m;else hi=m;}
  const q=control('donor'+i+'-encoded12956',a.slice(0,lo));assert(q.digits<=12956&&pack(encode(a.slice(0,lo+1),k)).length>12956,'length bracket');literary.push(q);
 }
 const summary={model:'centered mod29 previous-symbol residual, fold negative -2d-1 / nonnegative 2d, previous=0, EOF29, unary q ones then 0, MSB k-bit remainder',frame:'positive integer binary 1||payload, minimal base29, no pad',costs,k,EOFword:word(EOF,k),controls,literary};
 if(!testOriginal)return summary;
 const ranges=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55],[0,55]];
 const original=ranges.map(([lo,hi])=>{
  const a=gp.pages.filter(p=>p.page>=lo&&p.page<=hi).flatMap(p=>p.indices),v=receive(a,k);
  const suffixValue=Number(integer(a)%(1n<<BigInt(word(EOF,k).length)));
  return {range:[lo,hi],digits:a.length,repeats:repeats(a),suffixValue,...v};
 });
 assert(eq(original.map(x=>x.digits),[729,1145,1729,1903,1021,1433,1680,3008,308,12956]),'chapter cuts');
 return {...summary,original};
}
if(typeof module!=='undefined')module.exports=experiment;
if(typeof require!=='undefined'&&typeof module!=='undefined'&&require.main===module){
 const fs=require('node:fs'),path=require('node:path'),read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
 const paths=['resources/control/emerson_essays_2944.txt','resources/control/gibran_prophet_58585.txt','resources/control/shakespeare_first300k.txt'];
 console.log(JSON.stringify(experiment(JSON.parse(read('resources/liber-primus/lp2-corpus.json')),read('resources/transcriptions/lp1_wulfic_canonical.txt'),paths.map(read),!process.argv.includes('--controls-only')),null,2));
}
