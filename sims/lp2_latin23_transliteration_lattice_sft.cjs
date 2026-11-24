"use strict";
// Node 22: node sims/lp2_latin23_transliteration_lattice_sft.cjs
const fs=require("node:fs"), path=require("node:path");
const paths={
  "corpus": "resources/liber-primus/lp2-corpus.json",
  "source": "resources/liber-primus/lp2-transcription.txt",
  "freq": "resources/control/english_wordfreq_textblob.txt",
  "solved": "resources/liber-primus/lp1-plaintext-reference.txt"
};
const inputs=Object.fromEntries(Object.entries(paths).map(([k,p])=>[k,fs.readFileSync(path.resolve(__dirname,"..",p),"utf8")]));
function experiment(input) {
 const gp=JSON.parse(input.corpus), key=Array.from("a2e7j6ic78h0j7eiejd0120",c=>parseInt(c,36)), q=key.length;
 const options=gp.translit.map(s=>[s]); options[1]=["U","V"];options[5]=["C","K","Q"];options[15]=["S","Z"];options[21]=["NG","ING"];options[27]=["IA","IO"];
 const arcs=options.flatMap((ss,r)=>ss.map(s=>({s,rs:[r]})));arcs.push({s:"QU",rs:[5,7]});
 const byChar={};for(const arc of arcs)(byChar[arc.s[0]]??=[]).push(arc);
 for(const a of Object.values(byChar))a.sort((x,y)=>y.s.length-x.s.length);
 const enc=(s,p)=>Array.from(s,(c,i)=>String.fromCharCode(65+(c.charCodeAt(0)-65+key[(p+i)%q])%26)).join("");
 const dec=(s,p)=>Array.from(s,(c,i)=>String.fromCharCode(65+(c.charCodeAt(0)-65-key[(p+i)%q]+26)%26)).join("");
 const greedy=s=>{const rs=[];for(let i=0;i<s.length;){const a=byChar[s[i]].find(a=>s.startsWith(a.s,i));rs.push(...a.rs);i+=a.s.length}return rs};
 const f=new Map();for(const line of input.freq.split("\n")){const m=line.match(/^([a-z]+) (\d+)$/);if(m)f.set(m[1].toUpperCase(),+m[2])}
 if(f.size<20000)throw Error("lexicon missing");
 const words=[];const idx=new Map(gp.runes.map((r,i)=>[r,i]));const n=gp.pages.slice(0,56).reduce((a,p)=>a+p.indices.length,0);
 let pos=0,rs=[],begin=0;for(const c of input.source){if(idx.has(c)){if(pos===n)break;if(!rs.length)begin=pos;rs.push(idx.get(c));pos++}else if((c==="-"||c===".")&&rs.length){words.push({rs,start:begin,end:pos});rs=[]}}if(rs.length)words.push({rs,start:begin,end:pos});
 if(words.length!==2896||pos!==12956)throw Error("source mismatch");
 const off=[0];for(const p of gp.pages)off.push(off.at(-1)+p.indices.length);
 const original=words.filter(w=>w.start>=off[54]&&w.end<=off[56]);
 const split=original.filter(w=>w.end<=off[55]).length;
 const native=input.solved.split("### 6\n")[1].split("### 7")[0].match(/[A-Z]+/g).slice(2);
 const welcome=input.solved.split("### 3\n")[1].split("WISDOM")[0].match(/[A-Z]+/g).slice(1);
 // Three contiguous solved-style native Latin segments. Fixed starts and phase before ciphertext scoring.
 const plants=[[native,0],[native,75],[welcome,0]].map(([text,start],j)=>{let phase=[3,11,19][j];const plain=text.slice(start,start+75);if(plain.length!==75)throw Error("short native control");const p0=phase;const obs=plain.map(w=>{const rs=greedy(enc(w,phase));phase=(phase+w.length)%q;return {rs}});return {plain,obs,phase:p0,split:45}});
 const all=original.concat(...plants.map(x=>x.obs));
 const sig=rs=>rs.join(",");
 const targets=new Map();const trie={next:new Map()};for(const w of all){let t=trie;for(const r of w.rs){if(!t.next.has(r))t.next.set(r,{next:new Map()});t=t.next.get(r)}const s=sig(w.rs);t.id=s;if(!targets.has(s))targets.set(s,Array.from({length:q},()=>new Map()))}
 // Exact finite lexical transducer: every accepted segmentation; no greedy requirement on inverse.
 let hits=0;
 function visit(s,i,node,word,p,score){if(i===s.length){if(node.id!==undefined){const d=(p+s.length)%q,m=targets.get(node.id)[p],old=m.get(d);if(!old||score>old.score){m.set(d,{word,score});}hits++;}return}
  for(const a of byChar[s[i]]){if(!s.startsWith(a.s,i))continue;let t=node;for(const r of a.rs){t=t.next.get(r);if(!t)break}if(t)visit(s,i+a.s.length,t,word,p,score)}
 }
 for(const [w,count] of f){if(w.length>42)continue;for(let p=0;p<q;p++)visit(enc(w,p),0,trie,w,p,Math.log(count))}
 // OOV relaxed lattice: each rune independently emits any chart spelling, plus QU arc
 // does not change total Latin length versus CW. Exact attainable phase support;
 // retaining all segmentations makes this a liberal language gate.
 function lengthSet(rs){let a=new Map([[0,""]]);for(const r of rs){const b=new Map();for(const [x,s] of a)for(const t of options[r])b.set(x+t.length,s+t);a=b}return [...a]}
 function accepts(s,rs,i=0,j=0){if(i===s.length)return j===rs.length;if(j===rs.length)return false;return byChar[s[i]].some(a=>s.startsWith(a.s,i)&&a.rs.every((r,k)=>rs[j+k]===r)&&accepts(s,rs,i+a.s.length,j+a.rs.length));}
 const better=(a,b)=>!b||a.matches>b.matches||(a.matches===b.matches&&a.score>b.score);
 function solve(obs,starts,greedyOnly=false){let states=new Map(starts.map(p=>[p,{matches:0,score:0,start:p,seq:[],raw:[]}]));
  for(const w of obs){const next=new Map(),ls=lengthSet(w.rs), table=targets.get(sig(w.rs));
   for(const [p,z] of states){
    const put=(d,word,score,hit,raw=word)=>{const a={matches:z.matches+hit,score:z.score+score,start:z.start,seq:z.seq.concat(word),raw:z.raw.concat(raw)};if(better(a,next.get(d)))next.set(d,a)};
    if(greedyOnly){const s=w.rs.map(r=>gp.translit[r]).join(""),v=dec(s,p),c=f.get(v);put((p+s.length)%q,v,c?Math.log(c):0,c?1:0)}
    else{for(const [d,v] of table[p])put(d,v.word,v.score,1);for(const [l,cipher] of ls)put((p+l)%q,"?",0,0,dec(cipher,p))}
   }states=next;
  }let best;for(const [end,z] of states)if(better(z,best))best={...z,end};let phase=best.start,replayed=0;for(let i=0;i<obs.length;i++){const w=best.raw[i];if(!accepts(enc(w,phase),obs[i].rs))throw Error("relation replay failure");phase=(phase+w.length)%q;replayed+=obs[i].rs.length;}if(phase!==best.end)throw Error("phase replay failure");return {...best,replayed};
 }
 const phases=Array.from({length:q},(_,i)=>i);
 function evaluate(obs,split,plain,expected,greedyOnly){const a=solve(obs.slice(0,split),phases,greedyOnly), b=solve(obs.slice(split),[a.end],greedyOnly);return {trainWords:split,testWords:obs.length-split,trainMatches:a.matches,testMatches:b.matches,initial:a.start,holdoutPhase:a.end,expectedPhase:expected??null,trainExact:plain?a.seq.filter((w,i)=>w===plain[i]).length:null,testExact:plain?b.seq.filter((w,i)=>w===plain[split+i]).length:null,trainReadout:a.seq.join(" "),testReadout:b.seq.join(" "),trainReplay:a.replayed,testReplay:b.replayed,rawWitness:a.raw.concat(b.raw).join(" ")}}
 const controls=plants.map(z=>({joint:evaluate(z.obs,z.split,z.plain,z.phase,false),greedy:evaluate(z.obs,z.split,z.plain,z.phase,true),nativeAmbiguous:z.obs.flatMap(x=>x.rs).filter(r=>options[r].length>1).length,actualTrainEnd:(z.phase+z.plain.slice(0,z.split).join("").length)%q}));
 const result={key,lexicon:f.size,lexicalArcs:hits,sourceWords:words.length,sourceRunes:pos,control:controls,original:{retrospective:solve(original,phases).matches,runes:original.reduce((n,w)=>n+w.rs.length,0),joint:evaluate(original,split,null,null,false),greedy:evaluate(original,split,null,null,true)}};
 return result;
}
console.log(JSON.stringify(experiment(inputs),null,2));
