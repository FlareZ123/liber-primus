'use strict';
// Agent42 #3038: authentic Gadsby lipogram vs native p56 encryption.
function periodicMinimum(c,A,Q,forbid,cutoff=Infinity){
 // Per-page relaxed exact optimization over arbitrary Q periodic shifts and F hold.
 // At nonzero C there is one branch; at C=0 literal F may hold or consume.
 // Bound via independent phase minimum cost after all observations so far.
 const counts=Array.from({length:Q},()=>new Int16Array(A));
 let best=cutoff, nodes=0,complete=false;
 const mod=x=>(x%A+A)%A;
 const costs=Array.from({length:A},(_,c)=>Array.from({length:A},(_,k)=>Number(forbid.has(mod(c-k)))));
 function bound(){
  let total=0;
  for(let q=0;q<Q;q++){let min=Infinity;for(let k=0;k<A;k++)if(counts[q][k]===0){let cost=0;for(let x=0;x<A;x++)cost+=counts[q][x]*costs[x][k];if(cost<min)min=cost}total+=min;if(total>=best)return total}
  return total;
 }
 function dfs(i,q){
  nodes++;if(bound()>=best)return;
  const start=i,phase=q;
  while(i<c.length&&c[i]!==0){counts[q][c[i]]++;q=(q+1)%Q;i++}
  const b=bound();
  if(b<best){
   if(i===c.length){best=b;complete=true}
   else{
    dfs(i+1,q); // hold literal F
    counts[q][0]++;dfs(i+1,(q+1)%Q);counts[q][0]--;
   }
  }
  let t=phase;for(let j=start;j<i;j++){counts[t][c[j]]--;t=(t+1)%Q}
 }
 dfs(0,0);
 return {min:complete?best:null,provedAtLeast:complete?best:cutoff,nodes};
}
function experiment(raw){
 const [gp,native,source,book]=[JSON.parse(raw[0]),JSON.parse(raw[1]),raw[2],raw[3]];
 const assert=(x,msg)=>{if(!x)throw new Error(msg)}, ix=new Map(gp.runes.map((x,i)=>[x,i])), labels=gp.translit;
 const forbidden=new Set(labels.map((x,i)=>x.includes("E")?i:-1).filter(i=>i>=0));
 const runeGroups=s=>{let w=[],out=[];for(const ch of s){if(ix.has(ch))w.push(ix.get(ch));else if(w.length){out.push(w);w=[]}}if(w.length)out.push(w);return out};
 const frame=groups=>{let p=[],seam=[];for(const w of groups)for(let j=0;j<w.length;j++){p.push(w[j]);seam.push(j===0)}return {p,seam}};
 const parts=source.split("%"),orig=gp.pages.filter(p=>p.page<=55&&p.indices.length).map(x=>{
   const f=frame(runeGroups(parts[x.page<50?x.page:x.page-1].replace(/[\s/]/g,"")));
   assert(f.p.join()===x.indices.join(),"source page "+x.page);return {page:x.page,...f}
 });
 const nativeFrames=native.sections.map(s=>({name:s.name,...frame(runeGroups(s.source_text))}));
 const tokens=new Map(labels.map((t,i)=>[t,i]));tokens.set("ING",21);tokens.set("IO",27);
 const adapt=w=>{w=w.toUpperCase().replace(/QU/g,"CW").replace(/[KQ]/g,"C").replace(/V/g,"U").replace(/Z/g,"S");const p=[];while(w.length){let found=false;for(let n=Math.min(3,w.length);n>0;n--){const x=tokens.get(w.slice(0,n));if(x!==undefined){p.push(x);w=w.slice(n);found=true;break}}assert(found,"token "+w)}return p};
 const start=book.indexOf("If Youth, throughout all history"),end=book.indexOf("\r\nFINIS",start);assert(start>=0&&end>start,"story bounds");
 const story=book.slice(start,end).replace(/^\s*[IVXLCDM]+\s*$/gm,"").replace(/\[Illustration[^\]]*\]/gi,"");
 const words=story.match(/[A-Za-z]+/g)||[], exceptions=words.filter(w=>/e/i.test(w));
 const donor=frame(words.map(adapt));
 const primes=[];for(let n=2;primes.length<donor.p.length/10+4000;n++){let ok=true;for(const p of primes){if(p*p>n)break;if(n%p===0){ok=false;break}}if(ok)primes.push(n)}
 const mod=x=>(x%29+29)%29;
 function encode(p){let k=0;return p.map(x=>x===0?0:mod(x+primes[k++]-1))}
 const witness=nativeFrames.find(x=>x.name==="p56_an_end");
 assert(encode(witness.p).join()===gp.pages[56].indices.join(),"p56 replay");
 const summarize=frames=>{
   let n=0,forbid=0,withinN=0,withinRepeat=0,seamN=0,seamRepeat=0,lag=Array.from({length:6},()=>[0,0]),wordN=0,wordRepeat=0,wordHas=false,wordLen=0;
   const flush=()=>{if(wordLen){wordN++;wordRepeat+=Number(wordHas)}wordHas=false;wordLen=0};
   for(const f of frames){const p=f.p;n+=p.length;forbid+=p.filter(x=>forbidden.has(x)).length;
    for(let i=0;i<p.length;i++){if(i===0||f.seam[i])flush();if(i>0){if(f.seam[i]){seamN++;seamRepeat+=Number(p[i]===p[i-1])}else{withinN++;if(p[i]===p[i-1]){withinRepeat++;wordHas=true}}}wordLen++;for(let k=1;k<=6;k++)if(i>=k){lag[k-1][0]++;lag[k-1][1]+=Number(p[i]===p[i-k])}}
    flush()
   }
   return {n,forbid,withinN,withinRepeat,seamN,seamRepeat,wordN,wordRepeat,lag};
 };
 const N=orig.reduce((s,f)=>s+f.p.length,0);
 assert(N===12956,"original geometry");
 const windowed=[];for(let offset=0;offset+N<=donor.p.length;offset+=N){let at=offset;const f=orig.map(x=>{const n=x.p.length,v={page:x.page,p:donor.p.slice(at,at+n),seam:donor.seam.slice(at,at+n)};at+=n;return v});windowed.push({offset,clear:summarize(f),prime:summarize(f.map(x=>({...x,p:encode(x.p)})))})}
 // Exact min forbidden cost over every interpretation of C=0 as literal F or consuming symbol.
 // DP state is count of consumed primes; plaintext F is only literal/held.
 function minimum(c){
   let state=new Map([[0,0]]);
   for(const x of c){const next=new Map();const put=(k,v)=>{if(v<(next.get(k)??Infinity))next.set(k,v)};for(const [k,v] of state){if(x===0)put(k,v);const p=mod(x-primes[k]+1);if(p!==0)put(k+1,v+Number(forbidden.has(p)))}state=next;if(!state.size)return {min:null,states:0}}
   return {min:Math.min(...state.values()),states:state.size};
 }
 // Exact conditional inverse positive control for every authentic lipogram frame;
 // minimum may be less than actual number of exceptions, never greater.
 const dpControls=windowed.slice(0,2).map((_,i)=>{let at=i*N;return orig.map(x=>{const p=donor.p.slice(at,at+x.p.length);at+=p.length;const m=minimum(encode(p));assert(m.min!==null&&m.min<=p.filter(y=>forbidden.has(y)).length,"known planted control");return m.min})});
 const perPage=orig.map(x=>({page:x.page,n:x.p.length,...minimum(x.p)}));
 const periodic=orig.map(x=>({page:x.page,...periodicMinimum(x.p,29,8,forbidden,5)}));
 const periodicControls=[];for(let i=0;i<4;i++){const K=[23,10,1,10,9,10,16,26],plain=donor.p.slice(i*100,i*100+100);let j=0;const c=plain.map(x=>x===0?0:mod(x+K[j++%8]));const z=periodicMinimum(c,29,8,forbidden,5);assert(z.min===0,"periodic lipogram plant");periodicControls.push(z)}
 const sumMin=xs=>xs.some(x=>x.min===null)?null:xs.reduce((s,x)=>s+x.min,0);
 return {source:{storyBounds:[start,end],wordCount:words.length,exceptions,forbidden:[...forbidden],donorRunes:donor.p.length,windows:windowed.length},native:nativeFrames.map(f=>({name:f.name,plain:summarize([f]),prime:summarize([{...f,p:encode(f.p)}])})),original:summarize(orig),windowed,dp:{controlMinima:dpControls,perPage,trainP0to39:sumMin(perPage.filter(x=>x.page<=39)),heldP40to55:sumMin(perPage.filter(x=>x.page>=40)),illegalPages:perPage.filter(x=>x.min===null).map(x=>x.page)},periodic:{controls:periodicControls,perPage:periodic,lowerBoundAll:periodic.reduce((s,x)=>s+x.provedAtLeast,0),train:periodic.filter(x=>x.page<=39).reduce((s,x)=>s+x.provedAtLeast,0),held:periodic.filter(x=>x.page>=40).reduce((s,x)=>s+x.provedAtLeast,0)},p56Replay:witness.p.length};
}
if(require.main===module){const fs=require('node:fs'),path=require('node:path');const root=path.resolve(__dirname,'..');const files=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/transcriptions/lp2-image-corrected.txt"];const book=process.argv[2];if(!book)throw Error('Pass pinned GITenberg 47342.txt path');console.log(JSON.stringify(experiment([...files.map(p=>fs.readFileSync(path.join(root,p),'utf8')),fs.readFileSync(book,'utf8')]),null,2))}
module.exports={experiment};
