'use strict';
const fs = require('node:fs');
const paths = [
  "resources/liber-primus/lp2-corpus.json",
  "resources/control/gibran_prophet_58585.txt",
  "resources/control/emerson_essays_2944.txt",
  "resources/control/shakespeare_first300k.txt",
  "resources/liber-primus/lp1-plaintext-reference.txt"
];
function experiment(c, raw) {
  /** @type {string} */
  const alphabet="ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const assert=(v,m)=>{if(!v)throw Error(m)};
  const aliases=c.translit.map(x=>({C:["C","K","Q"],U:["U","V"],S:["S","Z"],NG:["NG","ING"],IA:["IA","IO"]}[x]||[x]));
  const C=c.translit.indexOf("C"),W=c.translit.indexOf("W");
  const forms=[...aliases,["CW","KW","QW","QU"]];
  const components=["CKQUVW","SZ","AO",...Array.from(alphabet).filter(x=>!"CKQUVWSZAO".includes(x))];
  /** @param {number[]} tape */
  function histogram(tape){
    const h=Array(forms.length).fill(0);
    for(let i=0;i<tape.length;i++){
      if(tape[i]===C&&tape[i+1]===W){h[29]++;i++;}
      else h[tape[i]]++;
    }
    return h;
  }
  /** @param {number[]} h @param {Set<string>} set */
  function cost(h,set){
    return h.reduce((total,n,i)=>total+(n? n*Math.min(...forms[i].map(w=>Array.from(w).filter(l=>set.has(l)).length)):0),0);
  }
  /** Exact minimum count of the k least frequent expanded letters for all k, including all alias choices.
   * @param {number[]} h */
  function minTails(h){
    let dp=[0];
    for(const group of components){
      const local=Array(group.length+1).fill(Infinity);
      for(let m=0;m<(1<<group.length);m++){
        const set=new Set(Array.from(group).filter((_,i)=>(m>>i)&1));
        local[set.size]=Math.min(local[set.size],cost(h,set));
      }
      const next=Array(dp.length+group.length).fill(Infinity);
      for(let i=0;i<dp.length;i++)for(let j=0;j<local.length;j++)next[i+j]=Math.min(next[i+j],dp[i]+local[j]);
      dp=next;
    }
    return dp.slice(1);
  }
  /** Direct independent subset enumeration, only on small active alphabets.
   * @param {number[]} h */
  function bruteTails(h){
    const active=Array.from(new Set(forms.flatMap((a,i)=>h[i]?a.flatMap(w=>Array.from(w)):[])));
    assert(active.length<=15,"toy too big");
    const inactive=26-active.length;
    const minima=Array(27).fill(Infinity);
    for(let m=0;m<2**active.length;m++){
      const set=new Set(active.filter((_,i)=>(m>>i)&1));
      const score=cost(h,set);
      for(let extra=0;extra<=inactive;extra++)minima[set.size+extra]=Math.min(minima[set.size+extra],score);
    }
    return minima.slice(1);
  }
  /** @param {number[]} h */
  function lengths(h){
    return [Math.min,Math.max].map(f=>h.reduce((s,n,i)=>s+n*f(...forms[i].map(w=>w.length)),0));
  }
  /** @param {string} s */
  function normalize(s){
    const start=s.match(/\*\*\* START OF[^\r\n]*\*\*\*/);
    if(start)s=s.slice(start.index+start[0].length);
    const end=s.match(/\*\*\* END OF[^\r\n]*\*\*\*/);
    if(end)s=s.slice(0,end.index);
    return s.toUpperCase().replace(/[^A-Z]/g,"");
  }
  const references=raw.slice(0,3).map(normalize);
  const native=raw[3].split(/\r?\n/).filter(x=>x&&!/^[#\[]/.test(x)&&!/^[0-9]/.test(x)).join("").toUpperCase().replace(/[^A-Z]/g,"");
  /** @param {string} s @param {number} n */
  function maxTails(s,n){
    if(n>s.length)return null;
    const counts=new Int32Array(26), max=Array(26).fill(0);
    for(let i=0;i<n;i++)counts[s.charCodeAt(i)-65]++;
    for(let j=n;;j++){
      const sorted=Array.from(counts).sort((a,b)=>a-b);let sum=0;
      for(let k=0;k<26;k++){sum+=sorted[k];max[k]=Math.max(max[k],sum);}
      if(j===s.length)break;
      counts[s.charCodeAt(j)-65]++;counts[s.charCodeAt(j-n)-65]--;
    }
    return max;
  }
  /** @param {string} s */
  function actualTails(s){
    const counts=Array(26).fill(0);
    for(const l of s)counts[alphabet.indexOf(l)]++;
    let sum=0;return counts.sort((a,b)=>a-b).map(x=>sum+=x);
  }
  const idx=x=>c.translit.indexOf(x);
  const toys=[["C","W","U","S","IA","NG","I"],["IA","IA","NG","NG","I","N","G","A","O"],["C","W","C","W","C","U","W","S","IA","IA","NG"]];
  for(const toy of toys){
    const h=histogram(toy.map(idx));assert(JSON.stringify(minTails(h))===JSON.stringify(bruteTails(h)),"toy exact subset mismatch");
  }
  const tokens=aliases.flatMap((a,i)=>a.map(s=>({s,tape:[i]}))).concat([{s:"QU",tape:[C,W]}]).sort((a,b)=>b.s.length-a.s.length);
  /** @param {string} s */
  function render(s){
    const tape=[],selected=[];
    for(let i=0;i<s.length;){const t=tokens.find(t=>s.startsWith(t.s,i));assert(t,"unrenderable letter");tape.push(...t.tape);selected.push(t.s);i+=t.s.length;}
    assert(selected.join("")===s,"Latin witness replay failed");
    return tape;
  }
  const plants=[];
  for(let i=0;i<4;i++){
    const source=(i<3?references[i]:native).slice(37+i*100,937+i*100);
    let seed=0x3301+i,perm=Array.from(alphabet);
    for(let j=25;j>0;j--){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const k=seed%(j+1);[perm[j],perm[k]]=[perm[k],perm[j]];}
    const encrypted=Array.from(source,x=>perm[alphabet.indexOf(x)]).join("");
    const tape=render(encrypted),h=histogram(tape),low=minTails(h),exact=actualTails(source),[lo,hi]=lengths(h);
    assert(lo<=source.length&&hi>=source.length,"wrong length interval");
    assert(JSON.stringify(actualTails(encrypted))===JSON.stringify(exact),"permutation invariant");
    assert(low.every((x,k)=>x<=exact[k]),"false plant rejection");
    assert(Array.from(encrypted,x=>alphabet[perm.indexOf(x)]).join("")===source,"key inverse");
    plants.push({source:i,letters:source.length,runes:tape.length,lo,hi,all26TailPredicates:true,exactForwardRendering:true});
  }
  const scopes=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55],[0,55]];
  const results=[];
  assert(c.pages.filter(p=>p.page<56).reduce((n,p)=>n+p.indices.length,0)===12956,"original rune count");
  for(const [p,q] of scopes){
    const tape=c.pages.filter(x=>x.page>=p&&x.page<=q).flatMap(x=>x.indices);
    const h=histogram(tape),[lo,hi]=lengths(h),low=minTails(h);
    assert(low[25]===lo,"all-letter cost must equal minimum expansion length");
    const maxima=references.map(s=>maxTails(s,hi));
    const nativeMax=maxTails(native,hi);
    const upper=low.map((_,k)=>Math.max(...maxima.map(m=>m[k]),nativeMax?nativeMax[k]:0));
    const margin=low.map((x,k)=>x-upper[k]),k=margin.indexOf(Math.max(...margin));
    results.push({p,q,runes:tape.length,lo,hi,pairs:h[29],k:k+1,lower:low[k],upper:upper[k],margin:margin[k],perCorpus:maxima.map(m=>m[k]),native:nativeMax?nativeMax[k]:null,allLower:low,allUpper:upper});
  }
  return {referenceLengths:[...references.map(s=>s.length),native.length],toyExhaustive:toys.length,plants,results};
}
const inputs = paths.map(p => fs.readFileSync(p, 'utf8'));
console.log(JSON.stringify(experiment(JSON.parse(inputs[0]), inputs.slice(1)), null, 2));
