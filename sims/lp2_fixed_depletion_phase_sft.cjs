"use strict";
/** Fixed depletion packet phase gate, Issue #2872. Run node sims/lp2_fixed_depletion_phase_sft.cjs */
const fs=require("node:fs"),path=require("node:path");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
function experiment(corpus,textSrc,punct,ink,lp1){
 const assert=(x,m)=>{if(!x)throw Error(m)};
 const ids=new Map(corpus.runes.map((r,i)=>[r,i]));const runeIds=t=>[...t].filter(x=>ids.has(x)).map(x=>ids.get(x));
 const parts=textSrc.split("%"),pages=[...parts.slice(0,50),"",...parts.slice(50,55)],s=corpus.pages.slice(0,56).flatMap(p=>p.indices),starts=[0];for(const p of pages)starts.push(starts.at(-1)+runeIds(p).length);assert(s.length===12956&&pages.every((p,i)=>runeIds(p).join()===corpus.pages[i].indices.join()),"source");
 const src=pages.join("%");
 const cuts=separator=>{let n=0,out=[0];for(const c of src){if(ids.has(c))n++;else if(separator.includes(c))out.push(n)}out.push(n);return out;};
 const uniq=a=>[...new Set(a)].sort((a,b)=>a-b);
 const physical=cuts(".&$%");assert(physical.length===255,"corrected intervals");
 const large=ink.pages.filter(p=>p.page<56).flatMap(p=>(p.large_punctuation||[]).map(x=>starts[p.page]+x[0]));
 const maximal=uniq([...physical,...large,...punct.events.map(e=>e.rune_offset)]);
 const cases={book:[0,s.length],chapters:[0,3,8,15,23,27,33,40,54,56].map(i=>starts[i]),page:uniq(starts),corrected:uniq(physical),overgranted:maximal,alsoLine:uniq([...maximal,...cuts("/")]),alsoWord:uniq([...maximal,...cuts("/-")]),wordOnly:uniq(cuts("-.&$§"))};
 const Ls=Array.from({length:28},(_,i)=>i+2);
 /** Exact boundary phases, as an integer bit mask; each repeat pair forces a boundary. */
 function phase(a,L){let m=(1<<L)-1;let w=[];for(let j=0;j<a.length;j++)for(let i=Math.max(0,j-L+1);i<j;i++)if(a[i]===a[j]){let mask=0;for(let k=i+1;k<=j;k++)mask|=1<<(k%L);const next=m&mask;if(next!==m){w.push([i,j,a[i],next]);m=next;}if(!m)return {mask:0,w};}return {mask:m,w};}
 /** Independent direct simulation of every candidate packet boundary phase. */
 function brute(a,L){let m=0;for(let r=0;r<L;r++){let seen=new Set(),ok=true;for(let i=0;i<a.length;i++){if(i%L===r)seen.clear();if(seen.has(a[i])){ok=false;break;}seen.add(a[i]);}if(ok)m|=1<<r;}return m;}
 let checks=0;const results={};for(const [name,b] of Object.entries(cases)){const groups=b.slice(1).map((end,i)=>({a:b[i],end,seq:s.slice(b[i],end)}));const rows=Ls.map(L=>{let bad=0,zeroBad=0,first=null,common=(1<<L)-1;for(const g of groups){let r=phase(g.seq,L);assert(r.mask===brute(g.seq,L),"phase mismatch");checks++;common&=r.mask;if(!(r.mask&1))zeroBad++;if(!r.mask){bad++;if(!first)first={a:g.a,end:g.end,w:r.w};}}return {L,bad,zeroBad,common,first};});const variableWitness=groups.find(g=>Ls.every(L=>phase(g.seq,L).mask===0));results[name]={groups:groups.length,rows,variableWitness:variableWitness?{a:variableWitness.a,end:variableWitness.end}:null};}
 const lp1parts=lp1.split("%");const controls=[...corpus.pages.slice(56,58).map(p=>({name:"LP2 p"+p.page,a:p.indices})),...[0,1,2,4,5,6,7,12,13].map(i=>({name:"LP1 encrypted segment "+i,a:runeIds(lp1parts[i])})),...[3,8,9,10,11,14].map(i=>({name:"LP1 clear segment "+i,a:runeIds(lp1parts[i])}))].map(({name,a})=>({name,len:a.length,phases:Ls.map(L=>({L,mask:phase(a,L).mask}))}));
 // Native p57-driven rank removal plants: actual clear parable values drive
 // deterministic choices modulo remaining deck capacity. This tests the phase
 // detector, not an arbitrary GP29-to-GP29 length-preserving cipher.
 let plants=0;const native=corpus.pages[57].indices;for(const L of Ls)for(let r=0;r<L;r++){let deck=[],a=[];for(let i=0;i<150;i++){if(i===0||i%L===r)deck=Array.from({length:29},(_,j)=>j);a.push(deck.splice(native[i%native.length]%deck.length,1)[0]);}assert(phase(a,L).mask&(1<<r),"plant missed");assert(phase(a,L).mask===brute(a,L),"plant mismatch");plants++;}
 return {n:s.length,checks,plants,controls,results};
}
const result=experiment(JSON.parse(read("resources/liber-primus/lp2-corpus.json")),read("resources/transcriptions/lp2-image-corrected.txt"),JSON.parse(read("resources/liber-primus/lp2-punctuation-identity.json")),JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json")),read("resources/transcriptions/lp1_wulfic_canonical.txt"));
console.log(JSON.stringify(result,null,2));
