"use strict";
const fs=require("node:fs"),path=require("node:path");
function experiment(inputs){
 const g=JSON.parse(inputs[0]),glyph=new Map(g.runes.map((x,i)=>[x,i])),alpha=new Map(g.translit.map((x,i)=>[x,i]));
 const assert=(x,m)=>{if(!x)throw Error(m)};
 const src=(inputs[1].replace(/[\s/%]/g,"").match(/[\u16a0-\u16ff]+/gu)||[]).slice(0,2896).map(w=>Array.from(w,x=>glyph.get(x)));
 assert(src.flat().length===12956&&String(src.flat())===String(g.pages.slice(0,56).flatMap(p=>p.indices)),"source");
 /** @param {string} s @returns {number[][]} */
 function words(s){const out=[];for(const raw of s.match(/[A-Za-z]+(?:['’][A-Za-z]+)*/g)||[]){const w=raw.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/['’]/g,""),p=[];for(let i=0;i<w.length;){let found=false;for(const n of [3,2,1]){const a=w.slice(i,i+n);if(a.length!==n)continue;const v=n===3?(a==="ING"?21:undefined):a==="IO"?27:alpha.get(a);if(v!==undefined){p.push(v);i+=n;found=true;break}}if(!found)throw Error("unknown token")}if(p.length&&p.length<19)out.push(p)}return out}
 const corpus=inputs.slice(2,5).flatMap(words),h=Array(29).fill(.5),lengths=Array(19).fill(0);
 for(const w of corpus){lengths[w.length]++;for(const v of w)h[v]++}
 const H=h.reduce((a,b)=>a+b,0),ALPHA=20,models=[];
 for(let r=0;r<29;r++){
  const counts=Array.from({length:19},()=>new Map()),freq=[(H-h[0]-(r?h[r]:0))/H,h[0]/H,r?h[r]/H:0];
  for(const w of corpus){let p=0;for(const v of w)p=3*p+(v===0?1:r&&v===r?2:0);const m=counts[w.length];m.set(p,(m.get(p)||0)+1)}
  const prior=(p,L)=>{let v=1;for(let i=0;i<L;i++){v*=freq[p%3];p=Math.floor(p/3)}return v};
  const logP=(p,L)=>Math.log(((counts[L].get(p)||0)+ALPHA*prior(p,L))/(lengths[L]+ALPHA));
  models.push({logP});
 }
 const neg=-Infinity;
 const lse=(a,b)=>a===neg?b:b===neg?a:Math.max(a,b)+Math.log1p(Math.exp(-Math.abs(a-b)));
 function precompute(ws,marker){
  let centers=new Set(Array.from({length:29},(_,i)=>i));
  return ws.map(c=>{const rows=new Map(),next=new Set();for(const s of centers){const ts=[];function walk(i,b,p,n){if(i===c.length){ts.push({b,p,n});next.add(b);return}const v=c[i];if(v===0)walk(i+1,b,3*p+1,n);
    if(marker)walk(i+1,v,3*p+(v===b?2:0),n+(v===b?0:1));
    else walk(i+1,v,3*p,n+1);
   }walk(0,s,0,0);rows.set(s,ts)}centers=next;return {rows,L:c.length}})
 }
 function run(pre,r,cut){
  const den=Math.log(r?28:29),model=models[r];let d=Array(29).fill(-Math.log(29)),train,trainStates;let n=0;
  for(let j=0;j<pre.length;j++){const {rows,L}=pre[j],next=Array(29).fill(neg);for(const [s,ts] of rows){if(d[s]===neg)continue;for(const t of ts){const v=d[s]+model.logP(t.p,L)-den*t.n;next[t.b]=lse(next[t.b],v)}}d=next;n+=L;
   if(j+1===cut){train=d.reduce(lse,neg);trainStates=d.map(x=>x-train)}
  }
  const total=d.reduce(lse,neg);return {r,train,total,held:total-train,trainStates};
 }
 function cutAt(ws,n){let i=0,j=0;while(i<ws.length-1&&j+ws[i].length<=n){j+=ws[i++].length}return [i,j]}
 function score(ws,trainN){const [cut,n]=cutAt(ws,trainN),N=ws.flat().length,yes=precompute(ws,true),no=precompute(ws,false),base=run(no,0,cut);
  const scores=Array.from({length:28},(_,i)=>run(yes,i+1,cut)).map(x=>({r:x.r,trainBF:(x.train-base.train)/n,holdBF:(x.held-base.held)/(N-n),trainUniform:(x.train+n*Math.log(29))/n,heldUniform:(x.held+(N-n)*Math.log(29))/(N-n)})).sort((a,b)=>b.trainBF-a.trainBF);
  return {N,n,cut,baseTrainUniform:(base.train+n*Math.log(29))/n,baseHeldUniform:(base.held+(N-n)*Math.log(29))/(N-n),scores};
 }
 function rng(seed){return n=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)%n}}
 function plant(ws,r,center,seed){const rnd=rng(seed),a=Array.from({length:29},(_,i)=>i),map=a.slice();for(const b of [a,map])for(let i=28;i>0;i--){const j=rnd(i+1);[b[i],b[j]]=[b[j],b[i]]}const k=map.indexOf(r);[map[k],map[center]]=[map[center],map[k]];
  const initial=a.slice(),mask=[],cipher=[];let held=0,latent=0,marked=0;
  for(const w of ws){const c=[];for(const x of w){if(x===0){c.push(0);held++;mask.push(true);continue}const q=map.indexOf(x),v=a[q];c.push(v);mask.push(false);if(v===0)latent++;if(q===center)marked++;a.splice(q,1);a.splice(center,0,v)}cipher.push(c)}
  const state=initial.slice(),decoded=[];let j=0;for(const v of cipher.flat()){if(mask[j++]){assert(v===0,"F");decoded.push(0);continue}const q=state.indexOf(v);decoded.push(map[q]);state.splice(q,1);state.splice(center,0,v)}assert(String(decoded)===String(ws.flat()),"native replay");
  return {cipher,held,latent,marked};
 }
 const law=words(inputs.slice(5,8).join("\n")),blake=words(inputs[8].slice(inputs[8].indexOf("THE ARGUMENT"),inputs[8].indexOf("*** END OF THIS PROJECT GUTENBERG EBOOK")));
 const controls=[];
 for(const [a,r,center,seed,start] of [[law,11,5,3301,100],[law,14,8,1033,1000],[blake,21,14,31337,100],[blake,27,20,133331,500]]){
  const ws=a.slice(start,start+2896),p=plant(ws,r,center,seed),s=score(p.cipher,Math.floor(ws.flat().length*.74));
  controls.push({r,center,seed,start,N:s.N,held:p.held,latent:p.latent,marked:p.marked,rank:s.scores.findIndex(x=>x.r===r)+1,top:s.scores.slice(0,3),true:s.scores.find(x=>x.r===r),baseTrainUniform:s.baseTrainUniform,baseHeldUniform:s.baseHeldUniform});
 }
 const rnd=rng(20261124),nulls=[];
 for(let i=0;i<3;i++){const ws=src.map(w=>w.map(()=>rnd(29)));const s=score(ws,9640);nulls.push({i,top:s.scores[0],baseTrainUniform:s.baseTrainUniform,baseHeldUniform:s.baseHeldUniform})}
 const original=score(src,9640);
 // Count extremization uses the exact same finite-state relation, independent of language.
 function bounds(a){let lo=Array(29).fill(0),hi=lo.slice();for(const c of a){const l=Array(29).fill(Infinity),h=Array(29).fill(-Infinity);for(let b=0;b<29;b++){const n=+(b===c);l[c]=Math.min(l[c],lo[b]+n);h[c]=Math.max(h[c],hi[b]+n);if(c===0){l[b]=Math.min(l[b],lo[b]);h[b]=Math.max(h[b],hi[b])}}lo=l;hi=h}return [Math.min(...lo),Math.max(...hi)]}
 const N=src.flat().length,range=bounds(src.flat());
 function windowRange(ws,r){const a=ws.flat();if(a.length<N)return null;let c=a.slice(0,N).filter(x=>x===r).length,min=c,max=c,compatible=0;for(let i=0;i<=a.length-N;i++){if(i){c+=+(a[i+N-1]===r)-+(a[i-1]===r)}min=Math.min(min,c);max=Math.max(max,c);compatible+=+(c>=range[0]&&c<=range[1])}return {n:a.length-N+1,min,max,compatible}}
 const markerCount={range,donors:Object.fromEntries([6,21,17,28].map(r=>[r,[law,blake,...inputs.slice(2,5).map(words)].map(ws=>windowRange(ws,r))]))};
 return {trainingWords:corpus.length,trainingRunes:H-.5*29,alpha:ALPHA,controls,nulls,original,markerCount};
}
const files=["resources/liber-primus/lp2-corpus.json","resources/transcriptions/lp2-image-corrected.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/gibran_prophet_58585.txt","resources/external/2013-book-of-law-I.txt","resources/external/2013-book-of-law-II.txt","resources/external/2013-book-of-law-III.txt","resources/external/cicada2012-blake-marriage-gutenberg45315.txt"];
console.log(JSON.stringify(experiment(files.map(f=>fs.readFileSync(path.resolve(__dirname,"..",f),"utf8"))),null,2));
