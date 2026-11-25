"use strict";
const R = "ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ";
const B=8;
const paths=["resources/transcriptions/lp2-image-corrected.txt","resources/transcriptions/lp1_wulfic_canonical.txt","resources/liber-primus/lp2-corpus.json","resources/control/emerson_essays_2944.txt","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt"];
/** @param {string} raw @param {boolean} lp2 */
function parse(raw,lp2) {
  // Strip wraps while preserving coordinates on each retained character.
  let page=0,line=0,sentence=0,paragraph=0,section=0,offset=0;
  const retained=[], coords=[], pageRunes=[];
  for (const c of raw) {
    if(c==="%"){page++;line=0;continue;}
    if(c==="/"){line++;continue;}
    if(/\s/u.test(c))continue;
    const p=lp2&&page>=50?page+1:page;
    retained.push(c);coords.push({page:p,line:p+":"+line,sentence,paragraph,section,offset});
    if(R.includes(c)){(pageRunes[p]??=[]).push(R.indexOf(c));offset++;}
    if(".&$§".includes(c))sentence++;
    if(c==="&")paragraph++;
    if(c==="$")section++;
  }
  const tape=retained.join("");
  const words=Array.from(tape.matchAll(new RegExp("["+R+"]+","gu")),m=>{
    const a=coords[m.index],z=coords[m.index+m[0].length-1];
    return {...a,endPage:z.page,endLine:z.line,n:m[0].length,word:m[0]};
  });
  return {words,pageRunes};
}
/** @param {string} text */
function english(text){
  const start=text.search(/\*\*\* START OF/i);
  if(start>=0)text=text.slice(text.indexOf("\n",start)+1);
  const end=text.search(/\*\*\* END OF/i);if(end>=0)text=text.slice(0,end);
  return (text.match(/[A-Za-z]+(?:['’][A-Za-z]+)*/g)||[]).map(w=>w.toUpperCase().replace(/['’]/g,"").replace(/ING|TH|EO|NG|OE|AE|IA|IO|EA/g,"#").length);
}
const cls=x=>Math.min(B,x)-1;
function model(lengths){
  const j=Array.from({length:B},()=>Array(B).fill(1));let total=B*B;
  for(let i=1;i<lengths.length;i++){j[cls(lengths[i-1])][cls(lengths[i])]++;total++;}
  const col=Array.from({length:B},(_,b)=>j.reduce((s,row)=>s+row[b],0));
  return j.map(row=>row.map((x,b)=>Math.log(x*total/(row.reduce((s,y)=>s+y,0)*col[b]))));
}
function rng(seed){return ()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)/4294967296;};}
function shuffle(a,blocks,random){const out=a.slice();for(const block of blocks){for(let i=block.length-1;i>0;i--){const k=Math.floor(random()*(i+1)),x=block[i],y=block[k];[out[x],out[y]]=[out[y],out[x]];}}return out;}
function stats(a,pairs,S){
  const j=new Int32Array(B*B),row=new Int32Array(B),col=new Int32Array(B);let llr=0;
  for(const i of pairs){const x=a[i-1],y=a[i];j[x*B+y]++;row[x]++;col[y]++;llr+=S[x][y];}
  const n=pairs.length;let mi=0;
  for(let x=0;x<B;x++)for(let y=0;y<B;y++){const v=j[x*B+y];if(v)mi+=v/n*Math.log(v*n/(row[x]*col[y]));}
  return [llr/n,mi];
}
function test(lengths,labels,S,draws,seed,strict){
  const a=lengths.map(cls),m=new Map();for(let i=0;i<a.length;i++){const k=labels[i];if(!m.has(k))m.set(k,[]);m.get(k).push(i);}
  const blocks=[...m.values()],pairs=Array.from({length:a.length-1},(_,i)=>i+1).filter(i=>!strict||labels[i]===labels[i-1]);
  const obs=stats(a,pairs,S),random=rng(seed);const ns=[[],[]];
  for(let k=0;k<draws;k++){const st=stats(shuffle(a,blocks,random),pairs,S);for(let i=0;i<2;i++)ns[i].push(st[i]);}
  const result=ns.map((v,i)=>{const mean=v.reduce((s,x)=>s+x,0)/v.length,sd=Math.sqrt(v.reduce((s,x)=>s+(x-mean)**2,0)/v.length);return {obs:obs[i],mean,sd,z:(obs[i]-mean)/sd,p:(1+v.filter(x=>x>=obs[i]).length)/(v.length+1)};});
  return {pairs:pairs.length,LLR:result[0],MI:result[1]};
}
function main(inputs){
  const [raw,lp1raw,cj,em,gib,sh]=inputs;const canonical=JSON.parse(cj),p=parse(raw,true),q=parse(lp1raw,false);
  for(const pg of canonical.pages){const got=p.pageRunes[pg.page]||[];if(JSON.stringify(got)!==JSON.stringify(pg.indices))throw Error("Rune mismatch on physical "+pg.page);}
  const u=p.words.filter(w=>w.page<=55),sol=p.words.filter(w=>w.page>=56);
  const count=w=>w.reduce((s,x)=>s+x.n,0);
  const counts={unknown:u.length,runes:count(u),crossPages:u.filter(w=>w.page!==w.endPage).length,crossLines:u.filter(w=>w.line!==w.endLine).length,lp1:q.words.length,solved:sol.length,solvedPages:[56,57].map(pg=>({page:pg,n:sol.filter(w=>w.page===pg).length,runes:count(sol.filter(w=>w.page===pg))})),periods:(raw.split("%").slice(0,55).join("%").match(/\./g)||[]).length};
  if(counts.unknown!==2896||counts.runes!==12956||counts.crossPages!==32||counts.lp1!==694||counts.solved!==45||counts.periods!==173)throw Error(JSON.stringify(counts));
  const E=english(em),G=english(gib),H=english(sh),half=Math.floor(E.length/2),S=model(E.slice(0,half));
  const lens=w=>w.map(x=>x.n),L=lens(u),all=n=>Array(n).fill(0),unknown={};
  for(const [i,scope] of ["global","sentence","line","paragraph","page","section"].entries()){
    const labels=scope==="global"?all(L.length):u.map(w=>w[scope]);
    unknown[scope]=test(L,labels,S,1999,452670+i,true);
  }
  const native={};
  for(const [i,[name,w]] of [["LP1",q.words],["LP2solved",sol],["p56",sol.filter(w=>w.page===56)],["p57",sol.filter(w=>w.page===57)],["combined",q.words.concat(sol)]].entries()){
    native[name]=test(lens(w),all(w.length),S,1999,6720+i,true);
  }
  const controls=[];
  for(const [name,arr] of [["Emerson-holdout",E.slice(half)],["Gibran",G],["Shakespeare",H]]){
    for(let off=0;off+L.length<=arr.length&&off<6*L.length;off+=L.length){
      const w=arr.slice(off,off+L.length),labels=all(w.length),seed=7100+controls.length;
      const intact=test(w,labels,S,399,seed,true);
      const perm=shuffle(w,[Array.from({length:w.length},(_,i)=>i)],rng(seed+300));
      const scrambled=test(perm,labels,S,399,seed+600,true);
      controls.push({name,off,intact,scrambled});
    }
  }
  // Conditional on an exact length inventory, a uniform word permutation and a
  // decoy segmentation drawn uniformly from that inventory induce the same length-tape law.
  return {counts,trainingWords:half,controls,unknown,native,unknownHistogram:Array.from({length:B},(_,i)=>L.filter(n=>cls(n)===i).length)};
}
module.exports={main,paths};
if(require.main===module){const fs=require("node:fs"),path=require("node:path");console.log(JSON.stringify(main(paths.map(p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8"))),null,2));}
