"use strict";
// #3153 — conditional parse ambiguity, not an authentic decoder.
const fs=require("node:fs"),path=require("node:path");
/** @param {string} transcription */
function experiment(transcription) {
  const rune=c=>/[\u16a0-\u16ff]/u.test(c||"");
  const sections=transcription.split("%").slice(0,55);
  const pages=Array.from({length:56},(_,i)=>i===50?"":sections[i<50?i:i-1].replace(/\s/gu,""));
  const chapters=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
  let pos=0,words=[],w=null,starts=[],lines=new Set();
  for(let p=0;p<56;p++){
    starts.push(pos);
    for(let j=0;j<pages[p].length;j++){
      const c=pages[p][j];
      if(c==="/"){if(rune(pages[p][j-1])&&rune(pages[p][j+1]))lines.add(pos);continue}
      if(rune(c)){if(!w)w={s:"",start:pos,p,q:p};w.s+=c;w.q=p;pos++}
      else if(w){words.push(w);w=null}
    }
  }
  if(w)words.push(w);
  const carries=words.filter(w=>w.p!==w.q);
  const forbidden=new Set([...lines,...carries.map(w=>starts[w.q])]);
  function requireEqual(actual,expected,label){if(actual!==expected)throw Error(`${label}: ${actual} !== ${expected}`)}
  requireEqual(pos,12956,"runes");requireEqual(words.length,2896,"groups");
  requireEqual(lines.size,388,"line carries");requireEqual(carries.length,32,"page carries");
  requireEqual(forbidden.size,420,"distinct carried offsets");
  // Exact segmentation count with all original printed group endpoints mandatory.
  function refine(w,dict,blocked){
    const n=w.s.length,F=Array(n+1).fill(0n),max=Array(n+1).fill(-Infinity),best=Array(n+1).fill(null);
    F[0]=1n;max[0]=0;best[0]=[];
    for(let i=0;i<n;i++)if(F[i])for(let j=i+1;j<=n;j++){
      const x=w.s.slice(i,j);
      if((j===n||!blocked.has(w.start+j))&&dict.has(x)){
        F[j]+=F[i];
        if(max[i]+1>max[j]){max[j]=max[i]+1;best[j]=[...best[i],x]}
      }
    }
    return {count:F[n],max:max[n],parts:best[n]};
  }
  // Exact small controls: two parses for AB; forbid cut and only one remains.
  const toy={s:"ab",start:0},toyDict=new Set(["a","b","ab"]);
  requireEqual(refine(toy,toyDict,new Set()).count,2n,"ambiguous control");
  requireEqual(refine(toy,toyDict,new Set([1])).count,1n,"carry-fixed control");
  requireEqual(refine(toy,new Set(["ab"]),new Set()).count,1n,"unambiguous control");
  const out=chapters.map(([a,b])=>{
    const ws=words.filter(w=>w.p>=a&&w.q<=b),dict=new Map();
    for(const w of ws)if(!dict.has(w.s))dict.set(w.s,w);
    let count=1n,maximum=0,ambiguous=0,example=null;
    for(const w of ws){
      const f=refine(w,dict,forbidden);
      if(!f.count)throw Error("Original partition missing");
      count*=f.count;maximum+=f.max;ambiguous+=Number(f.count>1n);
      if(!example&&f.count>1n){
        requireEqual(f.parts.join(""),w.s,"exact witness");
        example={word:w,alternative:f.parts,witnesses:f.parts.map(x=>dict.get(x))};
      }
    }
    // Unrestricted parsing of the whole tape with the same post-selected dictionary.
    const t=ws.map(w=>w.s).join(""),n=t.length,m=Math.max(...[...dict.keys()].map(x=>x.length));
    const F=Array(n+1).fill(0n),B=F.slice();F[0]=B[n]=1n;
    for(let i=0;i<n;i++)if(F[i])for(let j=i+1;j<=Math.min(n,i+m);j++)if(dict.has(t.slice(i,j)))F[j]+=F[i];
    for(let i=n-1;i>=0;i--)for(let j=i+1;j<=Math.min(n,i+m);j++)if(dict.has(t.slice(i,j)))B[i]+=B[j];
    requireEqual(F[n],B[0],"forward/backward counts");
    let internalSeams=0,forcedCarry=0,forcedBoundary=0,ambiguousSeam=0;
    for(let p=a+1;p<=b;p++){
      internalSeams++;
      const k=starts[p]-ws[0].start,at=F[k]*B[k];
      if(!at)forcedCarry++;else if(at===F[n])forcedBoundary++;else ambiguousSeam++;
    }
    const held=ws.filter(w=>w.p===b&&w.q===b),train=new Set(ws.filter(w=>w.q<b).map(w=>w.s));
    return {range:[a,b],runes:n,printed:ws.length,types:dict.size,unrestricted:F[n].toString(),refinements:count.toString(),maximum,ambiguousGroups:ambiguous,internalSeams,forcedCarry,forcedBoundary,ambiguousSeam,heldLastPage:held.length,seen:held.filter(w=>train.has(w.s)).length,example};
  });
  const product=out.reduce((a,b)=>a*BigInt(b.refinements),1n);
  requireEqual(product,363377703347701376755078255104139198464n,"all-chapter refinements");
  requireEqual(out.reduce((s,x)=>s+x.forcedCarry,0),32,"forced carries");
  requireEqual(out.reduce((s,x)=>s+x.ambiguousSeam,0),0,"ambiguous page seams");
  return {runes:pos,groups:words.length,lineCarries:lines.size,pageCarries:carries.length,refinementProduct:product.toString(),out};
}
if(require.main===module) console.log(JSON.stringify(experiment(fs.readFileSync(path.join(__dirname,"..","resources/transcriptions/lp2-image-corrected.txt"),"utf8")),null,2));
module.exports=experiment;
