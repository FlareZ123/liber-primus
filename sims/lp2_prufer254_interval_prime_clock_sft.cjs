"use strict";
/** Original LP2 corrected 254 intervals; canonical base59 tree code prime origins. Run: node sims/lp2_prufer254_interval_prime_clock_sft.cjs */
const fs=require("node:fs");
const path=require("node:path");
function study(corpus,trans,grid){
  const check=(x,msg)=>{if(!x)throw Error(msg)};
  const ids=new Map(corpus.runes.map((x,i)=>[x,i]));
  const runes=s=>[...s].filter(ch=>ids.has(ch)).map(ch=>ids.get(ch));
  const same=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
  const parts=trans.split("%");check(parts.length===57,"physical parts");
  const physical=[...parts.slice(0,50),"",...parts.slice(50,55)];
  check(physical.every((p,i)=>same(runes(p),corpus.pages[i].indices)),"canonical alignment");
  const source=physical.join("%"), separators=[...source].filter(ch=>".&$%".includes(ch));
  const intervals=source.split(/[.&$%]/u).map(runes);
  check(intervals.length===254&&intervals.flat().length===12956,"corrected intervals");
  const digits=grid.alphabet.replace("f","");
  const parent=grid.pages.flatMap(p=>p.tokens).map(t=>59*digits.indexOf(t[0])+digits.indexOf(t[1]));
  const root=189;
  check(parent.length===256&&parent.every(x=>x>=0&&x<256)&&parent[root]===root,"base59 source");
  for(let i=0;i<256;i++){let j=i,n=0;while(j!==root&&n<256){j=parent[j];n++}check(j===root,"tree convergence")}
  const adj=Array.from({length:256},()=>new Set());
  for(let i=0;i<256;i++)if(i!==root){adj[i].add(parent[i]);adj[parent[i]].add(i)}
  const code=[];
  for(let n=0;n<254;n++){const u=adj.findIndex(s=>s.size===1);check(u>=0,"leaf");const v=[...adj[u]][0];code.push(v);adj[v].delete(u);adj[u].clear()}
  // Invert the tree code and orient toward the separately recorded root.
  const degree=Array(256).fill(1),decoded=Array.from({length:256},()=>[]);
  for(const x of code)degree[x]++;
  for(const x of code){const leaf=degree.findIndex(x=>x===1);check(leaf>=0,"unrank leaf");degree[leaf]--;degree[x]--;decoded[leaf].push(x);decoded[x].push(leaf)}
  const last=degree.flatMap((x,i)=>x===1?[i]:[]);check(last.length===2,"last edge");decoded[last[0]].push(last[1]);decoded[last[1]].push(last[0]);
  const restored=Array(256).fill(-1);restored[root]=root;const queue=[root];for(let k=0;k<queue.length;k++)for(const x of decoded[queue[k]])if(restored[x]<0){restored[x]=queue[k];queue.push(x)}
  check(same(restored,parent),"tree roundtrip");
  const maxLen=Math.max(...intervals.map(x=>x.length)),primes=[];
  for(let p=2;primes.length<256+maxLen;p++)if(primes.every(q=>q*q>p||p%q!==0))primes.push(p);
  const mod=x=>(x%29+29)%29;
  /** Exact legal clock-state propagation under plaintext F hold. */
  function legal(c,start){let states=new Set([start]);for(let i=0;i<c.length;i++){const next=new Set();for(const j of states){if(c[i]===0)next.add(j);if(mod(c[i]-(primes[j]-1))!==0)next.add(j+1)}if(!next.size)return {ok:false,fail:i};states=next}return {ok:true,states:states.size}}
  const enc=(p,start)=>{let j=start;return p.map(x=>x===0?0:mod(x+primes[j++]-1))};
  // Exact native p56 plaintext replay and controls using independent clear p57.
  const translit=corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
  function encode(s){const out=[];for(let w of s.split(" ")){while(w.length){const x=translit.find(o=>w.startsWith(o.s));check(x,"native word");out.push(x.i);w=w.slice(x.s.length)}}return out}
  const p56=encode("AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE");
  check(same(enc(p56,0),corpus.pages[56].indices)&&legal(corpus.pages[56].indices,0).ok,"genuine p56");
  const p57=corpus.pages[57].indices;
  const plants=intervals.map((s,i)=>Array.from({length:s.length},(_,j)=>p57[(j+i)%p57.length]));
  check(plants.every((p,i)=>legal(enc(p,code[i]),code[i]).ok),"all source-shaped plants");
  const exact=intervals.map((s,i)=>legal(s,code[i]));
  const nonempty=intervals.flatMap((s,i)=>s.length?[i]:[]);
  const all=nonempty.map(i=>({i,origins:Array.from({length:256},(_,j)=>j).filter(j=>legal(intervals[i],j).ok)}));
  const usable=all.map(({i,origins})=>({i,origins:origins.filter(j=>code.includes(j))}));
  const noByte=all.filter(x=>x.origins.length===0).map(x=>x.i);
  const noTree=usable.filter(x=>x.origins.length===0).map(x=>x.i);
  // Each of the 254 printed-code occurrences has unit capacity, including duplicates.
  const match=Array(254).fill(-1);
  function augment(i,seen){for(let j=0;j<code.length;j++)if(!seen[j]&&usable[i].origins.includes(code[j])){seen[j]=true;if(match[j]===-1||augment(match[j],seen)){match[j]=i;return true}}return false}
  let size=0;for(let i=0;i<usable.length;i++)if(augment(i,Array(254).fill(false)))size++;
  const assignment=match.flatMap((k,j)=>k>=0?[{interval:usable[k].i,codeIndex:j,origin:code[j]}]:[]);
  check(assignment.every(x=>legal(intervals[x.interval],x.origin).ok),"matching certificate");
  let page=0,offset=0,global=0;
  const positions=intervals.map((s,i)=>{const p={i,page,offset,global,length:s.length};global+=s.length;offset+=s.length;if(separators[i]==="%"){page++;offset=0}return p});
  const obstruction=noByte.map(i=>{const fails=Array.from({length:256},(_,j)=>legal(intervals[i],j).fail);const max=Math.max(...fails);return {...positions[i],firstImpossiblePrefixLength:max+1,latestOrigins:fails.flatMap((v,j)=>v===max?[j]:[]),failureOffsets:fails}});
  return {root,code,roundtrip:restored.length,intervals:intervals.length,nonempty:nonempty.length,empty:intervals.length-nonempty.length,runes:intervals.flat().length,canonicalFailed:exact.filter(x=>!x.ok).length,canonical:exact,allByteOrigins:all,treeOrigins:usable,obstruction,noTree,arbitraryTreeMaxMatching:size,assignment,controls:{genuineP56:p56.length,sourceShapedPlants:plants.length}};
}
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
console.log(JSON.stringify(study(JSON.parse(read("resources/liber-primus/lp2-corpus.json")),read("resources/transcriptions/lp2-image-corrected.txt"),JSON.parse(read("resources/liber-primus/lp2-grid-256.json"))),null,2));
