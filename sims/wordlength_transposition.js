'use strict';
/**
 * Limited, key-independent tests of candidate word-order transpositions.
 * All transforms operate on whole rune words. Numeric-only LP2 page 50 is empty.
 * Project's original text is held in resources/transcriptions/.
 * CommonJS; no packages and no writes.
 * @module wordlength_transposition
 */
const { parseMaster }=require('./wordlength_crib_scan');
const {lengthIndependence}=require('./wordlength_order_test');
const R=new Set([...'ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ']);

/** @param {string} master @returns {{lengths:number[],pages:number[],segments:number[]}} */
function groupSizes(master){
  const pages=parseMaster(master).pages.slice(0,56),lengths=[],byPage=Array(56).fill(0);
  let pending=0,firstPage=-1;
  function flush(){if(pending){lengths.push(pending);byPage[firstPage]++;pending=0;firstPage=-1;}}
  for(let i=0;i<pages.length;i++)for(const ch of pages[i]){
    if(R.has(ch)){if(!pending)firstPage=i;pending++;}
    else if('-.$&§'.includes(ch))flush();
  }
  flush();
  const segments=pages.join('%').split('$').map(part=>part.split(/[-.&$§]/)
    .map(word=>[...word].filter(ch=>R.has(ch)).length).filter(Boolean).length).filter(Boolean);
  if(lengths.length!==2896 || segments.reduce((a,b)=>a+b,0)!==lengths.length || byPage.reduce((a,b)=>a+b,0)!==lengths.length)
    throw new Error('Master boundaries did not produce 2896 words');
  return{lengths,pages:byPage,segments};
}

/** @param {number} n @param {number} width @param {'fwd'|'inverse'|'snake'|'rail'} mode @returns {number[]} */
function localPermutation(n,width,mode){
  if(!Number.isInteger(width)||width<2)throw new RangeError('width >=2');
  if(n<2)return Array.from({length:n},(_,i)=>i);
  if(mode==='fwd'){
    const p=[];
    for(let col=0;col<width;col++)for(let row=0;row<Math.ceil(n/width);row++){
      const k=row*width+col;if(k<n)p.push(k);
    }
    return p;
  }
  if(mode==='inverse'){
    const f=localPermutation(n,width,'fwd'),p=Array(n);
    f.forEach((v,i)=>p[v]=i);
    return p;
  }
  if(mode==='snake'){
    const p=[];
    for(let row=0;row<Math.ceil(n/width);row++)for(let k=0;k<width;k++){
      const col=row%2?width-1-k:k,i=row*width+col;if(i<n)p.push(i);
    }
    return p;
  }
  if(mode==='rail'){
    const rows=Array.from({length:width},()=>[]);let row=0,step=1;
    for(let i=0;i<n;i++){
      rows[row].push(i);row+=step;if(row===0||row===width-1)step=-step;
    }
    return rows.flat();
  }
  throw new Error('Unknown word-order mode '+mode);
}

/** @param {number[]} sizes @param {number} width @param {'fwd'|'inverse'|'snake'|'rail'} mode @returns {Uint16Array} */
function permutation(sizes,width,mode){
  let off=0;const positions=[];
  for(const len of sizes){for(const i of localPermutation(len,width,mode))positions.push(off+i);off+=len;}
  return Uint16Array.from(positions);
}

/** @param {Uint8Array} classes @param {Uint16Array} indices @returns {number} Pearson chi2 for transformed adjacent categories. */
function permutedChi2(classes,indices){
  const matrix=new Uint16Array(9),row=[0,0,0],col=[0,0,0];let prev=classes[indices[0]];
  for(let k=1;k<indices.length;k++){
    const cur=classes[indices[k]];matrix[3*prev+cur]++;row[prev]++;col[cur]++;prev=cur;
  }
  const n=indices.length-1;let chi=0;
  for(let i=0;i<3;i++)for(let j=0;j<3;j++){
    const e=row[i]*col[j]/n;if(e)chi+=(matrix[3*i+j]-e)**2/e;
  }
  return chi;
}

/** @param {{lengths:number[],pages:number[],segments:number[]}} corpus @param {number} maxWidth */
function transformSpecs(corpus,maxWidth=24){
  const sets=[['global',[corpus.lengths.length]],['segment',corpus.segments],['page',corpus.pages]];
  const specs=[];
  for(const [label,sizes] of sets)for(let width=2;width<=maxWidth;width++)
    for(const mode of ['fwd','inverse','snake','rail'])
      specs.push({name:label+'_'+mode+'_'+width,indices:permutation(sizes,width,mode)});
  return specs;
}

/** @param {Uint8Array} values @param {number} seed @returns {Uint8Array} */
function shuffle(values,seed){
  const out=values.slice();let x=seed>>>0;
  for(let i=out.length-1;i>0;i--){
    x^=x<<13;x^=x>>>17;x^=x<<5;x>>>=0;
    const j=x%(i+1),temp=out[i];out[i]=out[j];out[j]=temp;
  }
  return out;
}

/** @param {{lengths:number[],pages:number[],segments:number[]}} corpus @param {number} [iterations] */
function evaluateTransformFamily(corpus,iterations=300){
  const classes=Uint8Array.from(corpus.lengths.map(x=>x<=2?0:x<=5?1:2));
  const specs=transformSpecs(corpus),ranked=specs.map(({name,indices})=>({name,chi2:permutedChi2(classes,indices)}));
  ranked.sort((a,b)=>b.chi2-a.chi2);
  let exceed=0;const nullMax=[];
  for(let i=1;i<=iterations;i++){
    const sample=shuffle(classes,(i*2654435761)>>>0);
    let max=0;
    for(const spec of specs)max=Math.max(max,permutedChi2(sample,spec.indices));
    nullMax.push(max);if(max>=ranked[0].chi2)exceed++;
  }
  nullMax.sort((a,b)=>a-b);
  return{tested:specs.length,originalChi2:lengthIndependence(corpus.lengths).chi2,
    top:ranked.slice(0,10),exceed,nullIterations:iterations,
    familywiseUpperTail:(exceed+1)/(iterations+1),
    nullMedian:nullMax[Math.floor((iterations-1)/2)]};
}

module.exports={groupSizes,localPermutation,permutation,permutedChi2,transformSpecs,shuffle,evaluateTransformFamily};
