'use strict';
/** Exact line-clock non-F frequency bound with arbitrary line directions and optional transparent F. */
const fs=require('node:fs');
const path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
function research(rawCorpus,transcription,referenceTexts) {
  const c=JSON.parse(rawCorpus),idx=new Map(c.runes.map((x,i)=>[x,i])),N=12956;
  const assert=(ok,msg)=>{if(!ok)throw Error(msg)},same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
  const lines=transcription.split("%").slice(0,55).flatMap(p=>p.split("/").map(l=>[...l].filter(x=>idx.has(x)).map(x=>idx.get(x))).filter(x=>x.length));
  assert(lines.length===594&&Math.max(...lines.map(l=>l.length))===26&&same(lines.flat(),c.pages.filter(p=>p.page<56).flatMap(p=>p.indices)),"original layout");
  const partitions=[[[0,1,2,3],[4,5,6,7],[8,9,10,11],[12,13,14,15],[16,17,18,19],[20,21,22,23],[24,25]],[[0,1],[2,3,4,5],[6,7,8,9],[10,11,12,13],[14,15,16,17],[18,19,20,21],[22,23,24,25]]];
  for(const p of partitions)assert(same(p.flat().slice().sort((a,b)=>a-b),Array.from({length:26},(_,i)=>i)),"partition");
  /** @param {number[][]} source @param {boolean} hold @returns {number[][][]} */
  function lineOptions(source,hold){
    return source.map(l=>{const os=[];for(const s of [l,l.slice().reverse()]){
      const z=s.filter(x=>x===0).length;
      for(let m=0;m<(hold?2**z:1);m++){let j=0;const seq=[];for(const x of s){if(x===0&&((m>>j++)&1))continue;seq.push(x)}os.push(seq)}
    }return os});
  }
  /** @param {number} x @returns {number} */
  function pop(x){x=x-((x>>>1)&0x55555555);x=(x&0x33333333)+((x>>>2)&0x33333333);return (((x+(x>>>4))&0x0F0F0F0F)*0x01010101)>>>24}
  /** Exact group bound from subset support bitsets.
   * @param {number[][][]} opts @param {number[]} js @param {number[]=} fixed */
  function group(opts,js,fixed){
    const W=Math.ceil(opts.length/32),n=js.length,fullMask=(1<<n)-1;
    assert(n===2||n===4,"block size");
    const subs=Array.from({length:fullMask},(_,k)=>Array.from({length:n},(_,i)=>i).filter(i=>(k+1)>>i&1));
    const ss=subs.map(s=>s.length===4?new Map():new Uint32Array(29**s.length*W));
    for(let l=0;l<opts.length;l++){
      const w=l>>>5,b=1<<(l&31);
      for(const q of opts[l]){const v=js.map(j=>q[j]);for(let i=0;i<subs.length;i++){
        const sub=subs[i];let k=0,good=true;
        for(const p of sub){if(v[p]===undefined){good=false;break}k=k*29+v[p]}
        if(!good)continue;
        if(sub.length===4){if(!ss[i].has(k))ss[i].set(k,new Uint32Array(W));ss[i].get(k)[w]|=b}else ss[i][k*W+w]|=b;
      }}
    }
    /** @param {number[]} v @param {number} mask @returns {number} */
    function score(v,mask){
      const ls=[];
      for(let m=mask;m;m=(m-1)&mask){let k=0;for(const p of subs[m-1])k=k*29+v[p];const l=subs[m-1].length;ls.push([l,ss[m-1],k*W,l===4?ss[m-1].get(k):null])}
      let sum=0;
      for(let w=0;w<W;w++){let u=0,p=0,t=0,q=0;for(const [l,arr,k,full] of ls){if(l===1)u|=arr[k+w];else if(l===2)p|=arr[k+w];else if(l===3)t|=arr[k+w];else q|=full?full[w]:0}sum+=pop(u)+pop(p)+pop(t)+pop(q)}
      return sum;
    }
    /** @param {number[]} v @returns {number} */
    function direct(v){let sum=0;for(const os of opts){let best=0;for(const q of os){let m=0;for(let i=0;i<n;i++)if(q[js[i]]===v[i])m++;if(m>best)best=m}sum+=best}return sum}
    if(fixed){const s=score(fixed,fullMask);assert(s===direct(fixed),"fixed score");return {phases:js,best:s,tuple:fixed}}
    let best=-1,arg=[],evals=0;
    if(n===2){for(let a=0;a<29;a++)for(let b=0;b<29;b++){const v=[a,b],z=score(v,3);evals++;if(z>best){best=z;arg=v}}}
    else{
      const singles=Array.from({length:29},(_,d)=>score([0,0,0,d],8)),mx=Math.max(...singles),prefix=[];
      for(let a=0;a<29;a++)for(let b=0;b<29;b++)for(let d=0;d<29;d++){const v=[a,b,d,0];prefix.push([score(v,7),a,b,d])}
      prefix.sort((a,b)=>b[0]-a[0]);
      for(const [s,a,b,d] of prefix){if(s+mx<=best)break;for(let e=0;e<29;e++){if(s+singles[e]<=best)continue;const v=[a,b,d,e],z=score(v,15);evals++;if(z>best){best=z;arg=v}}}
    }
    assert(best===direct(arg),"max score");
    return {phases:js,best,tuple:arg,fullTuplesEvaluated:evals};
  }
  const source=[];
  for(const hold of [false,true]){
    const opts=lineOptions(lines,hold),bounds=partitions.map(p=>{const blocks=p.map(js=>group(opts,js));return {blocks,sum:blocks.reduce((s,x)=>s+x.best,0)}});
    source.push({hold,bounds,bestBound:Math.min(...bounds.map(b=>b.sum)),maxOptionsPerLine:Math.max(...opts.map(x=>x.length))});
  }
  assert(source[0].bestBound===1128&&source[1].bounds[0].sum===1414&&source[1].bestBound===1399,"original bounds");
  /** @param {string} s @returns {number[]} */
  function gp(s){
    const out=[],tokens=c.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
    for(const w of s.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").match(/[A-Z]+/g)||[]){
      for(let i=0;i<w.length;){if(w.startsWith("ING",i)){out.push(21);i+=3;continue}if(w.startsWith("IO",i)){out.push(27);i+=2;continue}const z=tokens.find(x=>w.startsWith(x.t,i));assert(z,"spelling");out.push(z.i);i+=z.t.length}
    }return out;
  }
  const nativeStreams=referenceTexts.map(gp);
  const control=nativeStreams.map(native=>{
    const counts=Array(29).fill(0);let min=Infinity,max=0,minAt=-1,passing=0;
    for(let j=0;j<native.length;j++){counts[native[j]]++;if(j>=N)counts[native[j-N]]--;if(j<N-1)continue;const v=Math.max(...counts.slice(1));if(v<min){min=v;minAt=j-N+1}max=Math.max(max,v);passing+=v<=source[1].bestBound}
    return {runes:native.length,windows:native.length-N+1,minLargestNonF:min,maxLargestNonF:max,minAt,windowsAtOrBelowBound:passing};
  });
  assert(control.every(x=>x.windowsAtOrBelowBound===0),"native control at/below bound");
  let state=0x41f29e56;
  const rand=()=>{state^=state<<13;state^=state>>>17;state^=state<<5;return state>>>0};
  const keys=Array.from({length:26},()=>{const a=Array.from({length:29},(_,i)=>i);for(let i=28;i>0;i--){const j=rand()%(i+1);[a[i],a[j]]=[a[j],a[i]]}return a});
  const plain=nativeStreams[0].slice(12345,12345+N),encrypted=[],recovered=[];
  let cursor=0,held=0,reversed=0;
  for(const line of lines){const p=plain.slice(cursor,cursor+line.length);cursor+=line.length;const rev=rand()%2===1;reversed+=rev;const traversal=rev?p.slice().reverse():p,ct=[],mask=[];let j=0;
    for(const v of traversal){const h=v===0;mask.push(h);ct.push(h?0:keys[j++][v]);held+=h}
    encrypted.push(rev?ct.slice().reverse():ct);const inverse=[];j=0;for(let k=0;k<ct.length;k++)inverse.push(mask[k]?0:keys[j++].indexOf(ct[k]));recovered.push(...(rev?inverse.reverse():inverse));
  }
  assert(same(recovered,plain),"known-key plant");
  const plantOpts=lineOptions(encrypted,true),e=plain.filter(x=>x===18).length;
  const plantBlocks=partitions[1].map(js=>group(plantOpts,js,js.map(j=>keys[j][18]))),plantBound=plantBlocks.reduce((s,x)=>s+x.best,0);
  assert(plantBound>=e,"plant frequency bound");
  return {source:{lines:lines.length,runes:lines.flat().length,zeroCipherRunes:lines.flat().filter(x=>x===0).length,models:source},controls:control,plant:{knownKeyExactInverse:recovered.length,held,reversed,eCount:e,trueEKeyRelaxedBlockScore:plantBound,blocks:plantBlocks}};
}
const inputs=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-transcription.txt","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"].map(read);
console.log(JSON.stringify(research(inputs[0],inputs[1],inputs.slice(2)),null,2));
