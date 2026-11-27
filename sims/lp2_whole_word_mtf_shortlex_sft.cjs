'use strict';
// Whole-word MTF, one unpadded BASE29 integer per complete original group.
// Initial vocabulary: first occurrence of GP words in pinned 1906 Blake edition.
// OOV: N + shortlex rank of nonempty literal word; N = current dictionary size.
function run(gp,lp1,lp2,blake,crowley,emerson,original=false){
 const assert=(b,m)=>{if(!b)throw Error(m)}, eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
 const ix=new Map(gp.runes.map((r,i)=>[r,i]));
 const val=s=>[...s].reduce((x,c)=>x*29n+BigInt(ix.get(c)),0n);
 function digits(x){let a=[];do{a.push(gp.runes[Number(x%29n)]);x/=29n;}while(x);return a.reverse().join('');}
 function shortlex(s){let off=0n,p=29n;for(let i=1;i<s.length;i++){off+=p;p*=29n;}return off+val(s);}
 function literal(n){let len=1,p=29n;while(n>=p){n-=p;p*=29n;len++;}return digits(n).padStart(len,gp.runes[0]);}
 const native=s=>(s.replace(/[\/%\s]/g,'').match(/[\u16a0-\u16ff]+/g)||[]);
 const tok=gp.translit.map((x,i)=>[x,gp.runes[i]]).sort((a,b)=>b[0].length-a[0].length);
 function words(s){return (s.toUpperCase().match(/[A-Z]+/g)||[]).map(w=>{
   w=w.replace(/QU/g,'CW').replace(/V/g,'U').replace(/[KQ]/g,'C').replace(/Z/g,'S');
   let a='';for(let i=0;i<w.length;){if(w.startsWith('ING',i)){a+=gp.runes[21];i+=3;continue;}if(w.startsWith('IO',i)){a+=gp.runes[27];i+=2;continue;}
    const t=tok.find(x=>w.startsWith(x[0],i));assert(t,'token');a+=t[1];i+=t[0].length;}return a;
 });}
 const dict=[...new Set(words(blake))];
 function encode(ws,initial=dict,mtf=true){const d=initial.slice(),out=[];let oov=0;
  for(const w of ws){const r=d.indexOf(w);if(r<0){out.push(digits(BigInt(d.length)+shortlex(w)));d.unshift(w);oov++;}else{out.push(digits(BigInt(r)));if(mtf){d.splice(r,1);d.unshift(w);}}}return {out,oov,size:d.length};
 }
 function decode(gs,initial=dict,mtf=true){const d=initial.slice(),ws=[];let oov=0;
  for(let i=0;i<gs.length;i++){const g=gs[i],x=val(g);if(digits(x)!==g)return {status:'nonminimal',i,oov,ws};
   if(x<BigInt(d.length)){const r=Number(x),w=d[r];ws.push(w);if(mtf){d.splice(r,1);d.unshift(w);}}
   else{const w=literal(x-BigInt(d.length));if(d.includes(w))return {status:'known-word-literal',i,oov,ws};ws.push(w);d.unshift(w);oov++;}
  }return {status:'canonical',i:gs.length,oov,ws};
 }
 const synthetic=[gp.runes[0]+gp.runes[0],gp.runes[0],gp.runes[0]+gp.runes[0],gp.runes[28].repeat(14)];
 for(const w of synthetic)assert(literal(shortlex(w))===w,'literal');
 const clear=lp1.split('%').map(native);assert(eq([3,8,9,10,11,14].map(i=>clear[i].join('').length),[157,187,207,192,169,89]),'native lengths');
 const known=lp2.split('%').filter(s=>native(s).length).slice(-2).map(native);
 assert(eq(known.map(x=>x.join('').length),[85,95]),'LP2 solved lengths');
 const primes=[];for(let n=2;primes.length<84;n++)if(!primes.some(p=>p*p<=n&&n%p===0))primes.push(n);
 let pos=0,k=0;known[0]=known[0].map(w=>[...w].map(r=>{const i=pos++;return gp.runes[i===56?0:(ix.get(r)-(primes[k++]-1)%29+29)%29];}).join(''));
 assert(known[0].map(w=>[...w].map(r=>gp.translit[ix.get(r)]).join('')).join('')==='ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGETHATHASHESTOITISTHEDUTYOFEUERYPILGRIMTOSEECOUTTHISPAGE','p56');
 const controls=[...([3,8,9,10,11,14].map(i=>['LP1p'+i,clear[i]])),['LP2p56',known[0]],['LP2p57',known[1]],['Book of Law I',words(crowley)],['Self-Reliance',words(emerson)],['literal edge',synthetic]];
 function stats(name,w){const e=encode(w),d=decode(e.out);assert(d.status==='canonical'&&eq(d.ws,w)&&eq(encode(d.ws).out,e.out),'roundtrip '+name);
  const wrongOrder=decode(e.out,dict.slice().reverse()),wrongUpdate=decode(e.out,dict,false),n=e.out.length,dig=e.out.join('').length;
  const flat=e.out.join(''),repeats=[...flat].slice(1).filter((c,i)=>c===flat[i]).length;
  return {name,groups:n,inputRunes:w.join('').length,digits:dig,over4:e.out.filter(s=>s.length>4).length,oov:e.oov,finalDictionary:e.size,repeatRate:repeats/(dig-1),wrongOrderExact:wrongOrder.status==='canonical'&&eq(wrongOrder.ws,w),wrongUpdateExact:wrongUpdate.status==='canonical'&&eq(wrongUpdate.ws,w)};
 }
 const result={initialDictionary:dict.length,controls:controls.map(([name,w])=>stats(name,w))};
 if(!original)return result;
 let n=0,i=0;for(;i<lp2.length&&n<12956;i++)if(ix.has(lp2[i]))n++;const groups=native(lp2.slice(0,i));assert(groups.length===2896&&n===12956,'source groups');
 const d=decode(groups),long=groups.filter(g=>g.length>4),bad=groups.filter(g=>g.length>1&&g[0]===gp.runes[0]);
 result.original={groups:groups.length,knownRankCeiling:dict.length+groups.length-1,status:d.status,firstFailureGroup:d.i,firstFailureGlyphs:groups[d.i],literalCountBeforeFailure:d.oov,over4:long.length,nonminimal:bad.length,minimumOOVIfOnlyMinimalRepaired:long.length};
 // Direct out-of-range branch predicts every value exceeding maximum rank is literal.
 // Independently count even minimal valid 3+ digit groups whose value exceeds max size.
 const limit=BigInt(dict.length+groups.length-1);
 result.original.minimumOOVAmongCanonicalGroups=groups.filter(g=>digits(val(g))===g&&val(g)>limit).length;
 return result;
}
module.exports=run;
if(require.main===module){const fs=require('node:fs'),path=require('node:path'),read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
 console.log(JSON.stringify(run(JSON.parse(read('resources/liber-primus/lp2-corpus.json')),read('resources/transcriptions/lp1_wulfic_canonical.txt'),read('resources/transcriptions/lp2-image-corrected.txt'),read('resources/external/blake-marriage-1906-gutenberg45315.txt'),read('resources/external/2013-book-of-law-I.txt'),read('resources/external/cicada2014-self-reliance-2014-bookcode-witness.txt'),!process.argv.includes('--controls-only')),null,2));}
