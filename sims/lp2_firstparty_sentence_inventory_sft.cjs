'use strict';
const fs=require('node:fs');
const path=require('node:path');
function experiment(input){
  const corpus=JSON.parse(input[0]),runes=new Map(corpus.runes.map((x,i)=>[x,i])),apo=new Set(JSON.parse(input[2]).source_visible_internal_separators_before_rune);
  const map=new Map(corpus.translit.map((x,i)=>[x,i])),tokens=["ING","IO",...corpus.translit].sort((a,b)=>b.length-a.length);
  function gp(s){s=s.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const out=[];for(let i=0;i<s.length;){const t=tokens.find(x=>s.startsWith(x,i));if(!t)throw Error("unmapped "+s.slice(i));out.push(map.get(t==="ING"?"NG":t==="IO"?"IA":t));i+=t.length;}return out;}
  function record(words,anchors,nums,extra={}){const lens=words.map(x=>x.length);return {words,lens,key:[...lens].sort((a,b)=>a-b).join(","),n:lens.length,r:lens.reduce((s,v)=>s+v,0),anchors:[...anchors].sort(),nums:[...nums].sort(),...extra};}
  function original(){
    const pages=input[1].split("%").slice(0,55),expected=corpus.pages.filter(x=>x.page<=55&&x.runic_count);
    if(pages.length!==55)throw Error("page count");
    for(let p=0;p<55;p++){const a=[...pages[p]].filter(c=>runes.has(c)).map(c=>runes.get(c));if(a.join(",")!==expected[p].indices.join(","))throw Error("source mismatch");}
    const out=[];let words=[],anchors=[],nums=[],w=[],wa=[],off=0,start=0,group=0,firstGroup=0;
    function finishWord(){if(w.length){for(const k of wa)anchors.push(w.length+":"+k);words.push(w);group++;}w=[];wa=[];}
    function finishSpan(){finishWord();if(words.length){out.push(record(words,anchors,nums,{start,end:off,firstGroup}));words=[];anchors=[];nums=[];start=off;firstGroup=group;}}
    for(const c of pages.join("%")){if(runes.has(c)){if(apo.has(off)){if(!w.length)throw Error("apostrophe is not internal");wa.push(w.length);}w.push(runes.get(c));off++;}else if(c==="-")finishWord();else if(".&$§".includes(c))finishSpan();else if(/\d/.test(c)){finishWord();nums.push(c);}}
    finishSpan();if(out.length!==173||group!==2896||off!==12956)throw Error("corrected partition mismatch "+JSON.stringify([out.length,group,off]));if(out.flatMap(x=>x.anchors).length!==4)throw Error("anchor count");return out;
  }
  function source(s,isLaw=false){
    if(isLaw)s=s.replace(/^\s*\d+\.\s*/gm,"");
    return s.split(/[.!?]+/g).map(part=>{
      const words=[],anchors=[],nums=[];
      for(const m of part.matchAll(/[A-Za-z]+(?:['’][A-Za-z]+)*|\d+/g)){
        const t=m[0];if(/^\d+$/.test(t)){nums.push(t);continue;}
        const segments=t.split(/['’]/).map(gp),whole=segments.flat();let off=0;for(let i=0;i<segments.length-1;i++){off+=segments[i].length;anchors.push(whole.length+":"+off);}words.push(whole);
      }
      return record(words,anchors,nums);
    }).filter(x=>x.n);
  }
  const orig=original();
  const donors=[...input.slice(3,6).map((s,i)=>({name:"Book of the Law "+(i+1),spans:source(s,true)})),{name:"Self-Reliance",spans:source(input[6])}];
  const g=input[7],gs=g.indexOf("|Almustafa"),ge=g.indexOf("*** END OF");if(gs<0||ge<0)throw Error("Gibran wrapper markers");
  const controls=[{name:"Gibran",spans:source(g.slice(gs,ge).replace(/\{\d+\}/g,""))},{name:"Shakespeare",spans:source(input[8])}];
  let seed=0x2975b055;function rand(n){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)%n;}
  const minSpans=2,minWords=20,minRunes=60,alpha=.01;
  function compatible(a,b){return a.key===b.key&&(!a.anchors.length||!b.anchors.length||a.anchors.join(",")===b.anchors.join(","))&&(!a.nums.length||!b.nums.length||a.nums.join(",")===b.nums.join(","));}
  function targetIndex(target){const m=new Map();for(let i=0;i+1<target.length;i++){const k=target[i].key+"|"+target[i+1].key;if(!m.has(k))m.set(k,[]);m.get(k).push(i);}return m;}
  function scan(target,src,index=targetIndex(target),keep=false){
    let max=0,maxRunes=0,maxSpans=0,nRuns=0,runs=[];
    for(let j=0;j+1<src.length;j++)for(const i of index.get(src[j].key+"|"+src[j+1].key)||[]){
      if(i&&j&&compatible(target[i-1],src[j-1]))continue;
      let d=0,w=0,r=0;while(i+d<target.length&&j+d<src.length&&compatible(target[i+d],src[j+d])){w+=target[i+d].n;r+=target[i+d].r;d++;}
      if(d<2)continue;nRuns++;maxSpans=Math.max(maxSpans,d);if(w>max||w===max&&r>maxRunes){max=w;maxRunes=r;}
      if(keep)runs.push({target:i,source:j,spans:d,words:w,runes:r,qualifies:d>=minSpans&&w>=minWords&&r>=minRunes});
    }return {max,maxRunes,maxSpans,nRuns,runs:keep?runs:undefined};
  }
  const info=x=>({name:x.name,spans:x.spans.length,words:x.spans.reduce((s,v)=>s+v.n,0),runes:x.spans.reduce((s,v)=>s+v.r,0)});
  const volumes=donors.map(info);
  // Predeclared exact sentence search volume; prefer aggregate word/rune
  // volume within 15%. If no such windows exist, report the fallback explicitly.
  const choices=volumes.map(v=>{
    const all=[],matched=[];
    for(const c of controls){let w=0,r=0;for(let i=0;i<c.spans.length;i++){w+=c.spans[i].n;r+=c.spans[i].r;if(i>=v.spans){w-=c.spans[i-v.spans].n;r-=c.spans[i-v.spans].r;}if(i+1>=v.spans){const x={name:c.name,source:c.spans,start:i+1-v.spans,words:w,runes:r};all.push(x);if(Math.abs(w-v.words)<=.15*v.words&&Math.abs(r-v.runes)<=.15*v.runes)matched.push(x);}}}
    return {windows:matched.length?matched:all,matched:!!matched.length,all:all.length};
  });
  if(choices.some(x=>!x.windows.length))throw Error("no matched independent donor windows");
  const index=targetIndex(orig),nullTrials=2000,nullMax=[];
  for(let t=0;t<nullTrials;t++){let m=0;for(let d=0;d<volumes.length;d++){const c=choices[d].windows[rand(choices[d].windows.length)],z=scan(orig,c.source.slice(c.start,c.start+volumes[d].spans),index);m=Math.max(m,z.max);}nullMax.push(m);}
  const plants=[];for(let di=0;di<donors.length;di++){
    const d=donors[di],candidates=[];
    for(let j=0;j+3<d.spans.length;j++)for(let n=2;n<=4;n++){const sub=d.spans.slice(j,j+n);if(j+n>=d.spans.length||sub.length!==n)continue;const w=sub.reduce((s,x)=>s+x.n,0),r=sub.reduce((s,x)=>s+x.r,0);if(w>=minWords&&r>=minRunes&&sub.some(x=>x.n<13))candidates.push({j,n,w,r});}
    const used=new Set();for(let t=0;t<6;t++){const c=candidates[rand(candidates.length)];if(used.has(c.j)){t--;continue;}used.add(c.j);const off=5+rand(orig.length-c.n-10);
      const back=controls[t%2].spans,start=rand(back.length-orig.length-1),target=back.slice(start,start+orig.length);
      const sub=d.spans.slice(c.j,c.j+c.n).map(x=>{const a=x.words.slice();for(let k=a.length-1;k>0;k--){const z=rand(k+1);[a[k],a[z]]=[a[z],a[k]];}return record(a,x.anchors,x.nums);});target.splice(off,c.n,...sub);
      const found=scan(target,d.spans,undefined,true),ok=found.runs.some(x=>x.target<=off&&x.source<=c.j&&off-x.target===c.j-x.source&&x.target+x.spans>=off+c.n);
      if(!ok)throw Error("missed planted inventory");plants.push({donor:d.name,source:c.j,target:off,spans:c.n,words:c.w,runes:c.r,success:ok});
    }
  }
  const results=donors.map(d=>({name:d.name,...scan(orig,d.spans,index,true)}));
  const all=results.flatMap((x,di)=>x.runs.map(y=>({...y,donor:x.name,di,runeStart:orig[y.target].start,runeEnd:orig[y.target+y.spans-1].end,wordStart:orig[y.target].firstGroup})));
  const max=Math.max(0,...results.map(x=>x.max)),exceed=nullMax.filter(x=>x>=max).length,p=(exceed+1)/(nullTrials+1);
  const eligible=all.filter(x=>x.qualifies&&((nullMax.filter(z=>z>=x.words).length+1)/(nullTrials+1))<=alpha);
  let crib=null;
  if(eligible.length===1){const c=eligible[0],d=donors[c.di].spans;
    const plain=d.slice(c.source,c.source+c.spans).flatMap(x=>x.words.flat()),cipher=orig.slice(c.target,c.target+c.spans).flatMap(x=>x.words.flat());
    const key=Array(8).fill(null);let j=0,conflicts=0;for(let i=0;i<plain.length;i++){const a=plain[i],b=cipher[i];if(a===0){if(b!==0)conflicts++;continue;}const k=(b-a+29)%29;if(key[j%8]!==null&&key[j%8]!==k)conflicts++;else key[j%8]=k;j++;}
    const next=d[c.source+c.spans],actual=orig[c.target+c.spans];let predicted=null;
    if(!conflicts&&key.every(x=>x!==null)&&next&&actual){predicted=next.words.flat().map(a=>a===0?0:(a+key[j++%8])%29);}
    crib={candidate:c,key,conflicts,withheldAvailable:!!(next&&actual),withheldExact:predicted!==null&&predicted.join(",")===actual.words.flat().join(",")};
  }
  return {protocol:{minSpans,minWords,minRunes,alpha,nullTrials,sourceBoundary:"[.!?]; colon/semicolon are not resets; strip Law verse labels",anchor:"compare apostrophe (word length, interior rune offset) and literal numeral multiset only if present on both sides"},original:{spans:orig.length,words:orig.reduce((s,x)=>s+x.n,0),runes:orig.at(-1).end,apostrophes:orig.flatMap(x=>x.anchors).length,numerals:orig.flatMap(x=>x.nums)},donors:volumes,controls:controls.map(info),nullChoices:choices.map(c=>({volumeMatched:c.matched,all:c.all,byDonor:Object.fromEntries(controls.map(x=>[x.name,c.windows.filter(y=>y.name===x.name).length]))})),nullMax,max,exceed,p,results,eligible,crib,plants};
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/transcriptions/lp2-image-corrected.txt","resources/liber-primus/lp2-quote-punctuation-spans.json","resources/external/2013-book-of-law-I.txt","resources/external/2013-book-of-law-II.txt","resources/external/2013-book-of-law-III.txt","resources/external/cicada2014-self-reliance-2014-bookcode-witness.txt","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt"];
console.log(JSON.stringify(experiment(paths.map(p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8'))),null,2));
