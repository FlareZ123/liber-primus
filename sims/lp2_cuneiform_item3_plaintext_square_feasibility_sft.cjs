'use strict';
// Exact length-preserving plaintext prime-sum feasibility, including arbitrary whole-word permutation.
const fs=require('node:fs');
function run(corpus,transcription,wisdom){
  const assert=(b,m)=>{if(!b)throw new Error(m)};
  const primes=corpus.prime,runes=new Map(corpus.runes.map((r,i)=>[r,i]));
  const sum=w=>[...w].reduce((a,r)=>a+primes[runes.get(r)],0);
  const A=[272,138,341,131,151,366,199,130,320,18,226,245,91,245,226,18,320,130,199,366,151,131,341,138,272];
  const B=[434,1311,312,278,966,204,812,934,280,1071,626,620,809,620,626,1071,280,934,812,204,966,278,312,1311,434];
  const page=transcription.split(/\n%\n/)[37];let pos=0,w="",words=[];
  for(const ch of page){if(runes.has(ch)){if(pos>=91&&pos<189)w+=ch;pos++}else if(ch==="-"&&pos>91&&pos<=189&&w){words.push(w);w=""}}
  if(w)words.push(w);
  const lengths=words.map(w=>[...w].length);
  assert(words.length===25&&lengths.reduce((a,b)=>a+b,0)===98,"item3 framing");
  const sums=[new Set([0])];for(let n=1;n<=9;n++)sums.push(new Set([...sums[n-1]].flatMap(s=>primes.map(p=>s+p))));
  function matching(lens,targets){
    const match=Array(targets.length).fill(-1);
    function dfs(i,seen){for(let j=0;j<targets.length;j++){if(seen.has(j)||!sums[lens[i]].has(targets[j]))continue;seen.add(j);if(match[j]===-1||dfs(match[j],seen)){match[j]=i;return true}}return false}
    let count=0;for(let i=0;i<lens.length;i++)count+=Number(dfs(i,new Set()));
    return count;
  }
  const actual=wisdom.split("\n").filter(l=>/^(272|226|18|151|ᚫᚦ)/u.test(l)).map(l=>l.replace(/⁘/g,"").trim().split(/\s+/)).flat();
  assert(actual.length===25,"source table length");
  const expanded=actual.map(x=>/^\d+$/.test(x)?Number(x):sum(x));
  assert(expanded.every((x,i)=>x===A[i]),"original mixed-table replay");
  const controlWords=actual.filter(x=>!/^\d+$/.test(x));
  const controlValues=controlWords.map(sum),controlLens=controlWords.map(w=>[...w].length);
  assert(matching(controlLens,controlValues)===13,"source-native word-cell matching");
  const total=a=>a.reduce((a,b)=>a+b,0);
  const calc=target=>({targetSum:total(target),maxAll98:98*primes.at(-1),minRunesFromTotal:Math.ceil(total(target)/primes.at(-1)),impossibleRowMajor:lengths.map((l,i)=>sums[l].has(target[i])?null:{cell:i+1,length:l,target:target[i]}).filter(Boolean),maxMatching:matching(lengths,target),singleRuneCompatibleCells:target.filter(x=>sums[1].has(x))});
  return {lengths,wordCount:words.length,singleton:words[11],sourceControl:{exactMixedCells:25,exactRuneCells:13,matching:matching(controlLens,controlValues)},square1033:calc(A),square3301:calc(B)};
}
const read=p=>fs.readFileSync(p,'utf8');
console.log(JSON.stringify(run(JSON.parse(read('resources/liber-primus/lp2-corpus.json')),read('resources/liber-primus/lp2-transcription.txt'),read('resources/external/2013-0-wisdom.txt')),null,2));
