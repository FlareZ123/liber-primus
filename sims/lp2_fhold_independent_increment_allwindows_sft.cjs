'use strict';
/** All-window stationary consuming-key increment bound, with native F holds. */
const files=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/external/2013-book-of-law-I.txt","resources/external/2013-book-of-law-II.txt","resources/external/2013-book-of-law-III.txt","resources/external/cicada2012-blake-marriage-gutenberg45315.txt"];
function study(inputs){
 const c=JSON.parse(inputs[0]),native=JSON.parse(inputs[1]);
 const mod=x=>((x%29)+29)%29,assert=(x,m)=>{if(!x)throw Error(m)};
 const alpha=new Map(c.translit.map((x,i)=>[x,i]));alpha.set("ING",21);
 const rune=new Map(c.runes.map((x,i)=>[x,i]));
 function donor(s){
  const start=/\*\*\* START OF (?:THIS|THE) PROJECT GUTENBERG EBOOK[^\r\n]*\*\*\*/i.exec(s);if(start)s=s.slice(start.index+start[0].length);
  const end=/\*\*\* END OF (?:THIS|THE) PROJECT GUTENBERG EBOOK/i.exec(s);if(end)s=s.slice(0,end.index);
  let out=[];for(let t of s.match(/[A-Za-z]+/g)||[]){t=t.toUpperCase().replace(/QU/g,"CW").replace(/[KQ]/g,"C").replace(/V/g,"U").replace(/Z/g,"S");
   while(t.length){let ok=false;for(let n=Math.min(t.length,3);n>=1;n--){const v=alpha.get(t.slice(0,n));if(v!==undefined){out.push(v);t=t.slice(n);ok=true;break}}assert(ok,"native translation");}
  }return out;
 }
 const sections=new Map(native.sections.map(s=>[s.name,Array.from(s.source_text).filter(x=>rune.has(x)).map(x=>rune.get(x))]));
 assert(String(sections.get("p57_parable"))===String(c.pages[57].indices),"p57 original replay");
 function equal(a){let n=0;for(let i=1;i<a.length;i++)if(a[i]===a[i-1])n++;return n}
 const parts=[[0,56],[0,40],[40,54],[54,56],[0,3],[3,8],[8,15],[15,23],[23,27],[27,33],[33,40]];
 const regs=parts.map(([lo,hi])=>{
  let n=0,within=0,breaks=[],flat=[];
  for(const p of c.pages.slice(lo,hi)){if(!p.indices.length)continue;if(n)breaks.push(n);n+=p.indices.length;within+=equal(p.indices);flat.push(...p.indices)}
  return {lo,hi,n,breaks,within,continuous:equal(flat)};
 });
 assert(regs[0].n===12956&&regs[0].within===86&&regs[0].breaks.length===54,"original counts");
 // Count negative plaintext differences only on adjacent non-F pairs.
 const edges=p=>Int8Array.from(p,(v,i)=>i&&v&&p[i-1]?mod(p[i-1]-v):-1);
 function rolling(p,reg){
  const {n,breaks}=reg;if(p.length<n)return null;const e=edges(p),h=new Int32Array(29),hh=new Int32Array(29);
  for(let i=1;i<n;i++)if(e[i]>=0)h[e[i]]++;
  let cm=Infinity,pm=Infinity,cs=0,ps=0,ck=-1,pk=-1,cn=0,pn=0,minPairs=Infinity;
  for(let s=0;s+n<=p.length;s++){
   if(s){const l=e[s],r=e[s+n-1];if(l>=0)h[l]--;if(r>=0)h[r]++}
   hh.set(h);for(const b of breaks){const v=e[s+b];if(v>=0)hh[v]--}
   let pairs=0;for(let k=0;k<29;k++){pairs+=hh[k];if(h[k]<cm){cm=h[k];cs=s;ck=k}if(hh[k]<pm){pm=hh[k];ps=s;pk=k}}
   minPairs=Math.min(minPairs,pairs);
  }
  for(let i=cs+1;i<cs+n;i++)if(e[i]===ck)cn++;
  const br=new Set(breaks);for(let i=ps+1;i<ps+n;i++)if(!br.has(i-ps)&&e[i]===pk)pn++;
  assert(cn===cm&&pn===pm,"brute witness");
  return {windows:p.length-n+1,continuous:{min:cm,start:cs,increment:ck},pageLocal:{min:pm,start:ps,increment:pk},minNonFPairs:minPairs};
 }
 const bound=(mean,z)=>mean<=z?1:Math.exp(-mean+z+(z===0?0:z*Math.log(mean/z)));
 const donors=[["Gibran",donor(inputs[2])],["Shakespeare",donor(inputs[3])],["Emerson",donor(inputs[4])],["Crowley",donor(inputs.slice(5,8).join("\n"))],["Blake",donor(inputs[8])]];
 const results=donors.map(([name,p])=>({name,length:p.length,parts:regs.map(reg=>{const z=rolling(p,reg);return z?{lo:reg.lo,hi:reg.hi,...z,conditionalIidTail:bound(z.pageLocal.min,reg.within)}:null})}));
 function plant(p,k,breaks=[]){
   let j=0;const cipher=p.map(x=>x===0?0:mod(x+k*j++));let q=0;
   assert(String(cipher.map((x,i)=>p[i]===0?0:mod(x-k*q++)))===String(p),"known key/hold mask inverse");
   const br=new Set(breaks);let forced=0,observed=0;const e=edges(p);
   for(let i=1;i<p.length;i++)if(!br.has(i)){if(e[i]===k){assert(cipher[i]===cipher[i-1],"pair equality law");forced++}if(cipher[i]===cipher[i-1])observed++}
   assert(observed>=forced,"lower bound");return {forced,observed,exactReplay:p.length};
 }
 const nativeControls=[...sections].filter(([n,p])=>p.length>=95).map(([name,p])=>{const hist=Array(29).fill(0);for(const e of edges(p))if(e>=0)hist[e]++;const k=hist.indexOf(Math.min(...hist));const z=plant(p,k);assert(z.forced===hist[k],"native count");return{name,n:p.length,increment:k,...z}});
 const extremal=donors.map(([name,p],idx)=>{const reg=regs[0],w=results[idx].parts[0]?.pageLocal;if(!w)return null;const z=plant(p.slice(w.start,w.start+reg.n),w.increment,reg.breaks);assert(z.forced===w.min,"extremal witness");return{name,...z}});
 const p56=sections.get("p56_an_end"),primes=[];for(let n=2;primes.length<85;n++){let ok=true;for(let j=2;j*j<=n;j++)if(n%j===0){ok=false;break}if(ok)primes.push((n-1)%29)}
 let j=0;assert(p56.length===85&&String(p56.map(x=>x===0?0:mod(x+primes[j++])))===String(c.pages[56].indices),"authentic p56 exact");
 return {regions:regs,results,nativeControls,extremal,authenticP56:"85/85"};
}
if(require.main===module){const fs=require("node:fs"),path=require("node:path");console.log(JSON.stringify(study(files.map(p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8"))),null,2));}
module.exports={study,files};