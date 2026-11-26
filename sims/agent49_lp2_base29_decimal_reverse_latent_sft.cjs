'use strict';
// Agent49: exact spacing-free inverse of GP29 -> decimal reversal -> GP29 word transport.
const fs=require('node:fs');
const path=require('node:path');
function analyze(gp,native,lex){
  const assert=(p,m)=>{if(!p)throw Error(m)};
  const ix=new Map(gp.runes.map((x,i)=>[x,i])), tokens=gp.translit.map((text,index)=>({text,index})).sort((a,b)=>b.text.length-a.text.length);
  /** @param {string} word */
  function encode(word){const text=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");let a=[];for(let i=0;i<text.length;){if(text.startsWith("ING",i)){a.push(21);i+=3;continue}if(text.startsWith("IO",i)){a.push(27);i+=2;continue}const t=tokens.find(t=>text.startsWith(t.text,i));if(!t)return [];a.push(t.index);i+=t.text.length}return a}
  /** @param {number[]} a */
  function sender(a){const z=a.reduce((z,d)=>29n*z+BigInt(d),0n);let v=BigInt([...z.toString()].reverse().join(""));if(v===0n)return [0];const b=[];while(v){b.push(Number(v%29n));v/=29n}return b.reverse()}
  const register=new Map();
  const add=(a,count)=>{const k=a.join(","),old=register.get(k);register.set(k,{a,count:(old?.count??0)+count})};
  for(const line of lex.split(/\r?\n/u)){const m=/^([A-Za-z]+) (\d+)$/u.exec(line);if(!m)continue;const a=encode(m[1]);if(a.length)add(a,Number(m[2]))}
  const sections=native.sections.map(s=>({name:s.name,words:s.source_text.match(/[\u16A0-\u16FF]+/gu).map(w=>[...w].map(x=>ix.get(x)))}));
  for(const s of sections)for(const a of s.words)if(!register.has(a.join(",")))add(a,1);
  const total=[...register.values()].reduce((n,x)=>n+x.count,0);
  const trie=[{next:new Map(),ends:[]}];
  let maxLen=0;
  for(const rec of register.values()){
    const b=sender(rec.a);maxLen=Math.max(maxLen,b.length);let j=0;
    for(const x of b){if(!trie[j].next.has(x)){trie[j].next.set(x,trie.length);trie.push({next:new Map(),ends:[]})}j=trie[j].next.get(x)}
    trie[j].ends.push({...rec,cost:-Math.log(rec.count/total)});
  }
  const tr=a=>a.map(i=>gp.translit[i]).join("");
  /** @param {number[]} a @param {boolean} padded */
  function solve(a,padded){
    const n=a.length,uncovered=new Int32Array(n+1);uncovered.fill(1e9);uncovered[0]=0;
    const cost=new Float64Array(n+1);cost.fill(Infinity);cost[0]=0;
    const prev=Array(n+1).fill(null);
    const fallback=12; // an explicit fixed 12-nat penalty for each uncovered rune
    let edges=0;
    const relax=(i,j,rec)=>{
      edges++;uncovered[j]=Math.min(uncovered[j],uncovered[i]);
      const c=cost[i]+rec.cost;
      if(c<cost[j]){cost[j]=c;prev[j]={i,word:rec.a}}
    };
    for(let i=0;i<n;i++){
      uncovered[i+1]=Math.min(uncovered[i+1],uncovered[i]+1);
      if(cost[i]+fallback<cost[i+1]){cost[i+1]=cost[i]+fallback;prev[i+1]={i,word:null}}
      const starts=[i];
      if(padded){let j=i;while(j+1<n&&a[j]===0){j++;starts.push(j)}}
      for(const k of starts){let node=0;for(let j=k;j<Math.min(n,k+maxLen);j++){
        const next=trie[node].next.get(a[j]);if(next===undefined)break;node=next;
        for(const rec of trie[node].ends)relax(i,j+1,rec)
      }}
    }
    const path=[];let j=n;while(j){const p=prev[j];assert(p,"backpointer");path.push({start:p.i,end:j,word:p.word});j=p.i}path.reverse();
    for(const p of path)if(p.word){const got=a.slice(p.start,p.end),b=sender(p.word);let k=0;if(padded)while(k<got.length-1&&got[k]===0)k++;const x=got.slice(k);assert(x.join(",")===b.join(",")||got.join(",")===b.join(","),"replay")}
    return {n,minUncovered:uncovered[n],cost:cost[n],costPerRune:cost[n]/n,mapUncovered:path.filter(x=>!x.word).length,mapWords:path.filter(x=>x.word).length,edges,preview:path.slice(0,35).map(x=>x.word?tr(x.word):"["+tr(a.slice(x.start,x.end))+"]").join(" "),path};
  }
  const strip=({path,...rest})=>rest;
  const original=gp.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);
  assert(original.length===12956,"original size");
  const bounds=[0,729,1874,3603,5506,6527,7960,9640,12648,12956];
  const orig=[];
  for(let i=0;i<9;i++){const a=original.slice(bounds[i],bounds[i+1]);orig.push({chapter:i+1,canonical:strip(solve(a,false)),padded:strip(solve(a,true))})}
  const control=[];
  for(const s of sections){
    const a=s.words.flatMap(sender),truth=new Map();let n=0;
    for(const w of s.words){const b=sender(w);truth.set(n,{end:n+b.length,w});n+=b.length}
    const x=solve(a,false),y=solve(a,true);
    const evalPath=z=>{let exact=0,exactRunes=0;for(const p of z.path){const t=truth.get(p.start);if(t&&t.end===p.end&&p.word&&t.w.join(",")===p.word.join(",")){exact++;exactRunes+=p.word.length}}return {...strip(z),exactWords:exact,exactPlainRunes:exactRunes}};
    assert(x.minUncovered===0&&y.minUncovered===0,"planted true path");
    control.push({name:s.name,plainWords:s.words.length,plainRunes:s.words.flat().length,canonical:evalPath(x),padded:evalPath(y)});
  }
  // Exact segmentability is independent of word scoring. Compare chapter-level coverage
  // to deterministic random permutations of original glyphs, preserving each chapter histogram.
  let seed=0x33011033;
  const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
  const nulls=[];
  for(let rep=0;rep<20;rep++){
    let u=0,up=0,c=0,cp=0;
    for(let i=0;i<9;i++){const a=original.slice(bounds[i],bounds[i+1]);for(let j=a.length-1;j>0;j--){const k=Math.floor(rand()*(j+1));[a[j],a[k]]=[a[k],a[j]]}
      const x=solve(a,false),y=solve(a,true);u+=x.minUncovered;up+=y.minUncovered;c+=x.cost;cp+=y.cost
    }nulls.push({canonicalMinUncovered:u,paddedMinUncovered:up,canonicalCost:c,paddedCost:cp})
  }
  const totalOriginal={canonicalMinUncovered:orig.reduce((s,x)=>s+x.canonical.minUncovered,0),paddedMinUncovered:orig.reduce((s,x)=>s+x.padded.minUncovered,0),canonicalCost:orig.reduce((s,x)=>s+x.canonical.cost,0),paddedCost:orig.reduce((s,x)=>s+x.padded.cost,0)};
  return {register:register.size,maxCodeLength:maxLen,trieNodes:trie.length,original:orig,controls:control,totalOriginal,nulls};
}
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
console.log(JSON.stringify(analyze(JSON.parse(read("resources/liber-primus/lp2-corpus.json")),JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json")),read("resources/control/english_wordfreq_textblob.txt")),null,2));
