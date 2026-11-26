'use strict';
const fs=require('node:fs'),path=require('node:path');
function experiment(raw,corpus,ink,punc){
 const ids=new Map(corpus.runes.map((x,i)=>[x,i]));
 let words=[],tape=[],joins=[],marks=[],start=0,current=[],offset=0;
 function finish(){if(current.length){words.push({start,end:offset,c:current});current=[]}}
 for(const ch of raw.split("%").slice(0,55).join("%")){
  if(ids.has(ch)){if(!current.length)start=offset;current.push(ids.get(ch));tape.push(ids.get(ch));offset++}
  else if(ch==="/"||ch==="%")joins.push(offset);
  else if(!/\s/u.test(ch)){finish();if(ch!=="-")marks.push(offset)}
 }
 finish();
 const target=corpus.pages.filter(x=>x.page<56).flatMap(x=>x.indices);
 if(tape.length!==12956||words.length!==2896||target.length!==tape.length||target.some((x,i)=>x!==tape[i]))throw Error("source mismatch");
 const offsets=new Map();let sum=0;for(const page of corpus.pages){offsets.set(page.page,sum);sum+=page.indices.length}
 let red=new Set();for(const page of ink.pages.filter(x=>x.page<56))for(const s of page.red_spans??[])for(let i=0;i<s.length;i++)red.add(offsets.get(page.page)+s.start+i);
 const markSet=new Set([...marks,...punc.events.map(e=>e.rune_offset)]),joinSet=new Set(joins);
 const eligible=words.filter(w=>w.c.length>=3);
 const choices=w=>{let out=new Set();for(let j=1;j<w.c.length-1;j++)if(w.c[j]!==w.c[j-1])out.add([...w.c.slice(0,j),...w.c.slice(j+1)].join(","));return out.size};
 const counts=eligible.map(choices),sorted=counts.filter(n=>n>0).sort((a,b)=>a-b),hist={};for(const n of counts)hist[n]=(hist[n]??0)+1;
 const short=new Set(words.filter(w=>w.c.length<=2).flatMap(w=>w.c));
 const redWords=eligible.filter(w=>w.c.some((_,j)=>red.has(w.start+j)));
 const joined=eligible.filter(w=>Array.from({length:w.c.length+1},(_,j)=>w.start+j).some(i=>joinSet.has(i)));
 const marked=eligible.filter(w=>Array.from({length:w.c.length+1},(_,j)=>w.start+j).some(i=>markSet.has(i)));
 const union=new Set([...redWords,...joined,...marked].map(w=>w.start));
 const interior=eligible.filter(w=>Array.from({length:w.c.length-1},(_,j)=>w.start+j+1).some(i=>joinSet.has(i)));
 const klist=[1216,1260,1303],max=Math.max(...klist),coeff=Array(max+1).fill(0n);coeff[0]=1n;
 for(const n of counts)if(n)for(let k=max;k>0;k--)coeff[k]+=BigInt(n)*coeff[k-1];
 const log2=n=>{if(n===0n)return null;const t=n.toString(2);return t.length-1+Math.log2(parseInt(t.slice(0,53),2)/2**(Math.min(53,t.length)-1));};
 const stats=klist.map(k=>({k,log2_all_deletions:log2(coeff[k]),minimum_log2_even_if_word_flags_given:sorted.length>=k?sorted.slice(0,k).reduce((s,n)=>s+Math.log2(n),0):null}));
 const mod=x=>(x%29+29)%29;
 function encodeAt(p,k,j,v){const payload=p.map((x,i)=>mod(x+k[i]));if(j<1||j>=p.length||payload[j-1]===v)throw Error("invalid checked insertion");payload.splice(j,0,v);return payload}
 function inverseAt(c,k,j){return c.filter((_,i)=>i!==j).map((x,i)=>mod(x-k[i]))}
 const k=[3,1,4],man=[19,24,9],men=[19,18,9];
 const plantA=encodeAt(man,k,2,19),plantB=encodeAt(men,k,1,25);
 if(plantA.join()!==plantB.join()||inverseAt(plantA,k,2).join()!==man.join()||inverseAt(plantB,k,1).join()!==men.join())throw Error("plant failed");
 const witness=eligible.find(w=>choices(w)>=2),c=witness.c,shifts=[3,1,4,1,5,9,2,6,5,3,5,8,9,7];
 const wits=[];for(let j=1;j<c.length-1;j++)if(c[j]!==c[j-1]){let p=inverseAt(c,shifts,j);if(encodeAt(p,shifts,j,c[j]).join()!==c.join())throw Error("roundtrip");if(!wits.some(w=>w.p.join()===p.join()))wits.push({j,p})}
 return {source:{runes:tape.length,words:words.length,eligible:eligible.length,eligibleWithLegalSlot:sorted.length,shortWordAlphabetSize:short.size,redRunes:red.size,distinctJoinOffsets:joinSet.size,distinctMarkOffsets:markSet.size},directSourceFlagWords:{red:redWords.length,lineOrPageAdjacent:joined.length,interiorLineOrPage:interior.length,nonwordMarkAdjacent:marked.length,union:union.size},slotHistogram:hist,stats,plant:{key:k,man,men,commonOutput:plantA,deletedSlots:[2,1]},witness:{start:witness.start,c,shifts,wits:wits.slice(0,2)}};
}
const root=path.join(__dirname,'..');
const files=["resources/lp2-transcription.txt","resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-ink-annotations.json","resources/liber-primus/lp2-punctuation-identity.json"];
const a=files.map(p=>fs.readFileSync(path.join(root,p),'utf8'));
const result=experiment(a[0],...a.slice(1).map(JSON.parse));
if(result.directSourceFlagWords.union!==867||result.source.shortWordAlphabetSize!==29||result.stats[1].log2_all_deletions<4137)throw Error('unexpected original result');
console.log(JSON.stringify(result,null,2));
