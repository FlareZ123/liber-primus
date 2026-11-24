'use strict';
/** Exact authentic F-hold completion of prior LP1 direct-running-key and nine-warning-prime experiments. */
const fs = require('node:fs');
const path = require('node:path');
const read = p => fs.readFileSync(path.join(__dirname, '..', p), 'utf8');
function experiment(lp2,lp1,printed){
 const check=(v,m)=>{if(!v)throw Error(m);},eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
 const gp=new Map(lp1.runes.map((v,i)=>[v,i])),toGP=t=>Array.from(t).filter(v=>gp.has(v)).map(v=>gp.get(v));
 const sections=lp1.sections.map(s=>toGP(s.source_text)),clear=sections.slice(0,7).flat(),print=toGP(printed),koan=toGP(printed.split("%").slice(4,8).join("")).map(v=>(60-v)%29),corrected=sections.slice(0,7).flatMap((s,i)=>i===3?koan:s);
 const cipher=lp2.pages.slice(0,56).flatMap(p=>p.indices),starts=[0,729,1874,3603,5506,6527,7960,9640,12648,12956],windows=starts.slice(0,-1).map((s,i)=>cipher.slice(s,Math.min(starts[i+1],s+729)));
 check(clear.length===2799&&print.length===2797&&corrected.length===2797&&cipher.length===12956&&koan.length===778&&eq(koan.slice(140,143),[7,8,3])&&eq(koan.slice(276,279),[7,8,3]),"source mismatch");
 const mod=v=>(v+29)%29;
 /** Exact support for a known running key and starting offset; no language restrictions.
  * @param {number[]} c @param {number[]} k @param {number} start @param {number} sign */
 function reach(c,k,start,sign){
  let states=[start];
  for(let i=0;i<c.length;i++){
   const v=c[i],next=[];
   for(const j of states){
    if(v===0&&next[next.length-1]!==j)next.push(j);
    if(j<k.length&&mod(v+sign*k[j])!==0&&next[next.length-1]!==j+1)next.push(j+1);
   }
   if(!next.length)return {prefix:i,ends:[]};
   states=next;
  }
  return {prefix:c.length,ends:states};
 }
 /** @param {number[]} p @param {number[]} k @param {number} start @param {number} sign */
 function enc(p,k,start,sign){let j=start;return p.map(v=>v===0?0:mod(v-sign*k[j++]));}
 const modelTrain=[sections[0],sections[2],koan,sections[4],sections[6]],u=new Float64Array(29),b=new Float64Array(30*29),t=new Float64Array(30*30*29),bt=new Float64Array(30),tt=new Float64Array(30*30);let count=0;
 for(const seq of modelTrain){let a=29,z=29;for(const p of seq){u[p]++;count++;b[z*29+p]++;bt[z]++;t[(a*30+z)*29+p]++;tt[a*30+z]++;a=z;z=p;}}
 const logp=new Float64Array(t.length);
 for(let a=0;a<30;a++)for(let z=0;z<30;z++)for(let p=0;p<29;p++){const pu=(u[p]+0.5)/(count+14.5),pb=(b[z*29+p]+6*pu)/(bt[z]+6);logp[(a*30+z)*29+p]=Math.log((t[(a*30+z)*29+p]+6*pb)/(tt[a*30+z]+6));}
 const parse=s=>Array.from(s,c=>c.charCodeAt(0)-65),render=s=>parse(s).map(v=>lp2.translit[v]).join(" ");
 function score(p){let a=29,b=29,s=0;for(const v of p){s+=logp[(a*30+b)*29+v];a=b;b=v;}return s;}
 /** Exact spacing-free trigram Viterbi, conditional on the supplied initial clock and context.
  * @param {number[]} c @param {number[]} k @param {number} start @param {number} sign @param {number} a0 @param {number} b0 */
 function viterbi(c,k,start,sign,a0=29,b0=29){
  let states=new Map([[start*900+a0*30+b0,{j:start,a:a0,b:b0,s:0,path:""}]]);
  for(const v of c){
   const next=new Map();
   function add(node,p,j){const s=node.s+logp[(node.a*30+node.b)*29+p],id=j*900+node.b*30+p,old=next.get(id);if(!old||s>old.s)next.set(id,{j,a:node.b,b:p,s,path:node.path+String.fromCharCode(65+p)});}
   for(const node of states.values()){
    if(v===0)add(node,0,node.j);
    if(node.j<k.length){const p=mod(v+sign*k[node.j]);if(p!==0)add(node,p,node.j+1);}
   }
   if(!next.size)return null;
   states=next;
  }
  let best=null;for(const node of states.values())if(!best||node.s>best.s)best=node;
  check(eq(enc(parse(best.path),k,start,sign),c),"exact replay failed");
  return best;
 }
 const p57=lp2.pages[57].indices,variants=[];
 for(const [name,key] of [["edited",clear],["printed",print],["corrected",corrected]])for(const [encoding,k] of [["index",key],["prime",key.map(v=>lp2.prime[v]%29)]])for(const sign of [-1,1])variants.push({name,encoding,sign,k});
 let results=[],plants=[],fullCandidates=[];
 for(const {name,encoding,sign,k} of variants){
   const p=Array.from({length:729},(_,i)=>p57[i%p57.length]),origin=457,ct=enc(p,k,origin,sign),a=reach(ct,k,origin,sign),short=p.slice(0,308),cts=enc(short,k,origin,sign),b=reach(cts,k,origin,sign);
   check(a.prefix===729&&b.prefix===308&&a.ends.includes(origin+p.filter(v=>v!==0).length)&&b.ends.includes(origin+short.filter(v=>v!==0).length),"plant support failure");
   const dec=viterbi(ct,k,origin,sign);
   plants.push({name,encoding,sign,holds:p.filter(v=>v===0).length,cipherF:ct.filter(v=>v===0).length,terminalStates:a.ends.length,knownKeyMatches:parse(dec.path).filter((v,i)=>v===p[i]).length,n:729,score:dec.s/729,trueScore:score(p)/729});
   for(let ch=0;ch<windows.length;ch++){
     const c=windows[ch],min=c.filter(v=>v!==0).length,survivors=[],hist={},maxStarts=[];let longest=-1;
     for(let o=0;o<=k.length-min;o++){
       const a=reach(c,k,o,sign);hist[a.prefix]=(hist[a.prefix]||0)+1;
       if(a.prefix>longest){longest=a.prefix;maxStarts.length=0;}
       if(a.prefix===longest)maxStarts.push(o);
       if(a.prefix===c.length){
        survivors.push({offset:o,ends:a.ends});
        const v=viterbi(c,k,o,sign);check(v!==null,"support/Viterbi mismatch");
        fullCandidates.push({name,encoding,sign,ch,offset:o,end:v.j,score:v.s/c.length,plaintextIndices:parse(v.path),preview:render(v.path.slice(0,90))});
       }
     }
     results.push({name,encoding,sign,ch,n:c.length,origins:k.length-min+1,longest,maxStarts,maxStartCount:maxStarts.length,survivors,deathHistogram:hist});
   }
 }
 /** Search all legal source offsets by prefix only, then freeze key, plaintext and phase.
  * @param {number[]} c @param {number} split @param {number[] | null} truth */
 function predict(c,split,truth=null){
  const pre=c.slice(0,split),suf=c.slice(split),min=pre.filter(v=>v!==0).length;
  let candidates=[];
  for(let vi=0;vi<variants.length;vi++){
   const {k,sign}=variants[vi];
   for(let offset=0;offset<=k.length-min;offset++){
    if(reach(pre,k,offset,sign).prefix!==split)continue;
    const v=viterbi(pre,k,offset,sign);
    candidates.push({vi,offset,...v});
   }
  }
  candidates.sort((x,y)=>y.s-x.s||x.vi-y.vi||x.offset-y.offset);
  const report=(v)=>{
   const {name,encoding,sign,k}=variants[v.vi],q=viterbi(suf,k,v.j,sign,v.a,v.b);
   if(q)check(eq(enc(parse(v.path+q.path),k,v.offset,sign),c),"frozen continuation replay failed");
   return {name,encoding,sign,offset:v.offset,phase:v.j,prefixScore:v.s/split,suffixScore:q?q.s/suf.length:null,preview:render(v.path.slice(0,90)),suffixPreview:q?render(q.path.slice(0,90)):null,plaintextIndices:q?parse(v.path+q.path):null,truthPrefixMatches:truth?parse(v.path).filter((p,i)=>p===truth[i]).length:null,truthSuffixMatches:truth&&q?parse(q.path).filter((p,i)=>p===truth[split+i]).length:null};
  };
  return {split,holdout:suf.length,legalPrefixCandidates:candidates.length,winner:candidates.length?report(candidates[0]):null,topFive:candidates.slice(0,5).map(report)};
 }
 const predictions=[{target:"original p0-2",...predict(windows[0],lp2.pages[0].indices.length)},{target:"original p54-55",...predict(windows[8],lp2.pages[54].indices.length)}];
 const blindPlants=[];
 for(const [section,vi,offset,split] of [[1,2,611,260],[5,5,1441,180],[8,9,811,55]]){
   const p=sections[section],v=variants[vi],ct=enc(p,v.k,offset,v.sign),known=viterbi(ct,v.k,offset,v.sign);
   blindPlants.push({target:lp1.sections[section].name,planted:{name:v.name,encoding:v.encoding,sign:v.sign,offset},n:p.length,trueScore:score(p)/p.length,knownKeyMatches:parse(known.path).filter((x,i)=>x===p[i]).length,...predict(ct,split,p)});
 }
 const primes=[];for(let n=2;primes.length<3400;n++){let p=true;for(let d=2;d*d<=n;d++)if(n%d===0){p=false;break;}if(p)primes.push(n);}
 const warning=[757,1009,691,353,769,911,1051,859,677],k=primes.map(p=>(p-1)%29);
 const warningResults=warning.map((v,i)=>({chapter:i,prime:v,ordinal:primes.indexOf(v)+1,n:starts[i+1]-starts[i],...reach(cipher.slice(starts[i],starts[i+1]),k,primes.indexOf(v),-1)}));
 const nativeP56=sections[7],nativeC56=lp2.pages[56].indices;
 check(nativeP56.length===85&&eq(enc(nativeP56,k,0,-1),nativeC56),"authentic p56 mismatch");
 const p56=reach(nativeC56,k,0,-1);check(p56.prefix===85&&p56.ends.includes(84),"p56 F control failed");
 fullCandidates.sort((a,b)=>b.score-a.score);
 return {trainingSections:[0,2,3,4,6],trainingRunes:count,results,plants,fullCandidates,predictions,blindPlants,warningResults,p56};
}
const out=experiment(JSON.parse(read("resources/liber-primus/lp2-corpus.json")),JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json")),read("resources/transcriptions/lp1_wulfic_canonical.txt"));
console.log(JSON.stringify(out,null,2));
