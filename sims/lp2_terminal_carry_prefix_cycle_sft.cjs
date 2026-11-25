'use strict';
const fs=require('node:fs');
const path=require('node:path');
function experiment(g,raw,lex,native){
  const assert=(x,m)=>{if(!x)throw Error(m)};
  const alpha="0123456789abcdefghijklmnopqrs", rmap=new Map(g.runes.map((r,i)=>[r,i])), tmap=new Map(g.translit.map((r,i)=>[r,i]));
  const groups=raw.replace(/[\s/%]/g,"").match(/[\u16a0-\u16ff]+/g).map(w=>[...w].map(r=>rmap.get(r)));
  const tape=groups.flat(), expected=g.pages.flatMap(p=>p.indices);
  assert(tape.length===expected.length&&tape.every((x,i)=>x===expected[i]),"canonical tape mismatch");
  const p54start=g.pages.filter(p=>p.page<54).reduce((n,p)=>n+p.indices.length,0), seam=p54start+232, end=seam+76;
  const spans=[];let off=0;for(const w of groups){spans.push({start:off,end:off+w.length,w});off+=w.length}
  const crossing=spans.find(s=>s.start<seam&&s.end>seam), train=spans.filter(s=>s.start>=p54start+9&&s.end<=seam),test=spans.filter(s=>s.start>=seam&&s.end<=end);
  assert(crossing.start===seam-10&&crossing.end===seam+1,"seam profile");
  assert(train.length===47&&train.reduce((n,s)=>n+s.w.length,0)===213&&test.length===16&&test.reduce((n,s)=>n+s.w.length,0)===75,"complete groups");
  const prefix=tape.slice(seam-10,seam),actual=tape[seam],dict=new Map();
  function add(w,label){if(w.length!==11)return;const k=w.join(",");if(!dict.has(k))dict.set(k,{w,label});}
  for(const line of lex.split(/\r?\n/)){
    const m=/^([a-z]+)\s+(\d+)$/.exec(line);if(!m)continue;
    const s=m[1].toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
    function walk(i,w){if(w.length>11)return;if(i===s.length){add(w,m[1]);return}for(let n=1;n<=3;n++){const part=s.slice(i,i+n);if(part.length!==n)continue;const x=n===3?(part==="ING"?tmap.get("NG"):undefined):tmap.get(part);if(x!==undefined)walk(i+n,[...w,x])}}walk(0,[]);
  }
  for(const sec of native.sections)for(const w of sec.source_text.match(/[\u16a0-\u16ff]+/g)||[])add([...w].map(x=>rmap.get(x)),"native");
  const mod=x=>(x%29+29)%29,inv=Array.from({length:29},(_,i)=>{for(let j=1;j<29;j++)if(i*j%29===1)return j;return 0});
  function possible(p,c){
    const basis=[];let phase=0;
    function reduce(row){for(const b of basis){const q=row[b.pivot];if(q)for(let j=b.pivot;j<36;j++)row[j]=mod(row[j]-q*b.row[j])}return row;}
    for(let i=0;i<c.length;i++){
      if(p[i]===0){if(c[i]!==0)return false;continue}
      let row=Array(36).fill(0);if(c[i])row[c[i]-1]++;row[p[i]-1]--;row[28+phase]--;phase=(phase+1)%8;
      row=reduce(row.map(mod));const pivot=row.findIndex(Boolean);if(pivot<0)continue;
      row=row.map(x=>mod(x*inv[row[pivot]]));
      for(const b of basis){const q=b.row[pivot];if(q)for(let j=pivot;j<36;j++)b.row[j]=mod(b.row[j]-q*row[j])}
      basis.push({pivot,row});basis.sort((a,b)=>a.pivot-b.pivot);
    }
    // Any forced coordinate equality contradicts pi being a permutation.
    const sig=[];for(let k=0;k<29;k++){const row=Array(36).fill(0);if(k)row[k-1]=1;sig.push(reduce(row).join(","))}
    if(new Set(sig).size!==29)return false;
    // If all solutions satisfy period 4, none has primitive period 8.
    let forcedPeriod4=true;for(let j=0;j<4;j++){const row=Array(36).fill(0);row[28+j]=1;row[32+j]=28;if(reduce(row).some(Boolean))forcedPeriod4=false;}
    return !forcedPeriod4;
  }
  const compact=w=>w.map(x=>alpha[x]).join("");
  function analyze(c){
    const out=[];for(const {w,label} of dict.values()){
      if(!possible(w,c))continue;
      const suffix=[];for(let j=0;j<29;j++)if(possible(w,[...c,j]))suffix.push(j);
      out.push({word:label,gp:compact(w),suffix:compact(suffix)});
    }
    return out;
  }
  const opts=analyze(prefix),counts=Array.from({length:29},(_,j)=>opts.filter(o=>o.suffix.includes(alpha[j])).length);
  function rng(seed){return ()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0}}
  const plants=[];
  for(const seed of [3301,1033,2014]){
    const rand=rng(seed),pool=[...dict.values()].filter(o=>o.label!=="native"&&!o.w.slice(0,10).includes(0));
    let pi,key,p,c;
    do{p=pool[rand()%pool.length];pi=Array.from({length:29},(_,i)=>i);for(let i=28;i>1;i--){const j=1+rand()%i;[pi[i],pi[j]]=[pi[j],pi[i]]}
      key=Array.from({length:8},()=>rand()%29);let phase=rand()%8;c=p.w.map(x=>{if(x===0)return 0;const y=pi.indexOf(mod(pi[x]+key[phase]));phase=(phase+1)%8;return y});
    }while(c.slice(0,10).includes(0)||key.slice(0,4).every((x,i)=>x===key[i+4]));
    const d=analyze(c.slice(0,10)),hit=d.find(o=>o.gp===compact(p.w));
    assert(hit&&hit.suffix.includes(alpha[c[10]]),"true planted word/suffix lost");
    plants.push({seed,word:p.label,gp:compact(p.w),cipher:compact(c),options:d.length,trueWordSuffixCount:hit.suffix.length,unionSuffixCount:new Set(d.flatMap(o=>[...o.suffix])).size});
  }
  return {model:"Unknown primitive q8 common GP29 cycle fixing F, arbitrary start phase, literal plaintext F hold; homogeneous affine necessary filter only, no all-different assignment claimed",source:{p54Start:p54start,seam,carryStart:crossing.start,carryEndExclusive:crossing.end,trainCompleteGroups:train.length,trainCompleteRunes:213,heldCompleteGroups:test.length,heldCompleteRunes:75,prefix:compact(prefix),knownStructuralLength:11,actualSuffix:alpha[actual]},dictionary11:dict.size,prefixOptions:opts.length,actualSuffixOptions:counts[actual],suffixSupport:Object.fromEntries(counts.map((x,j)=>[alpha[j],x])),plants,options:opts};
}
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const files=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/control/english_wordfreq_textblob.txt","resources/external/relikd-solved-gp29-native-v1.json"];
const a=files.map(read);
console.log(JSON.stringify(experiment(JSON.parse(a[0]),a[1],a[2],JSON.parse(a[3])),null,2));
