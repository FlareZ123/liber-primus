'use strict';
/** All-boundary GP29 branch-coordinate marginal gate. */
const fs=require('node:fs');
function main(corpus,refs){
  const A=corpus.translit, idx=new Map(A.map((x,i)=>[x,i]));
  function native(s){const out=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/ING/g,"NG").replace(/IO/g,"IA").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");for(let i=0;i<w.length;){const x=idx.get(w.slice(i,i+2));if(x!==undefined){out.push(x);i+=2}else{const y=idx.get(w[i++]);if(y!==undefined)out.push(y)}}}return out}
  const count=w=>{const r=Array(4).fill(0),c=Array(8).fill(0);let f=0;for(const x of w){r[x>>3]++;c[x&7]++;f+=+(x===0)}return {r,c,f}};
  const sorted=a=>a.slice().sort((x,y)=>x-y);
  function reduced(q,h){const r=q.r.slice(),c=q.c.slice();r[0]-=h;c[0]-=h;return [sorted(r),sorted(c)]}
  function distance(a,b){return Math.max(...a.map((h,i)=>h.reduce((s,x,j)=>s+Math.abs(x-b[i][j]),0)/2))}
  function compare(target,plain){const N=target.length,ct=count(target),tc=Array.from({length:ct.f+1},(_,h)=>reduced(ct,h));const q=count(plain.slice(0,N));
    const result={runes:plain.length,windows:plain.length-N+1,ordinary:{exact:0,min:Infinity,offset:null},Fhold:{admissible:0,exact:0,min:Infinity,offset:null}};
    function record(o,d,i){o.exact+=+(d===0);if(d<o.min){o.min=d;o.offset=i}}
    for(let i=0;i+N<=plain.length;i++){
      record(result.ordinary,distance(tc[0],reduced(q,0)),i);
      if(q.f<=ct.f){result.Fhold.admissible++;record(result.Fhold,distance(tc[q.f],reduced(q,q.f)),i)}
      if(i+N<plain.length){const a=plain[i],b=plain[i+N];q.r[a>>3]--;q.c[a&7]--;q.f-=+(a===0);q.r[b>>3]++;q.c[b&7]++;q.f+=+(b===0)}
    }
    return result
  }
  const body=corpus.pages.slice(0,3).flatMap(p=>p.indices).slice(13);
  if(body.length!==716)throw Error("opening");
  const sources=refs.map(native);
  const results=sources.map((p,i)=>({source:i,result:compare(body,p)}));
  const r=[2,0,1,3],c=[4,3,1,0,2,7,5,6],p=sources[1].slice(1200,1916);
  // Pure coordinate label mapping is a legal member; preserving the labels
  // as multisets after any legal coordinate permutation is the invariant.
  const plant=p.map(x=>8*r[x>>3]+c[x&7]);
  if(plant.some(x=>x>=29))throw Error("plant hole");
  const holdPlant=p.map(x=>x===0?0:8*r[x>>3]+c[x&7]);
  const a=compare(plant,p),b=compare(holdPlant,p);
  if(a.ordinary.exact!==1||b.Fhold.exact!==1)throw Error("positive control");
  return {target:count(body),results,controls:{ordinary:a,Fhold:b}};
}
const files=["resources/liber-primus/lp2-corpus.json","resources/control/shakespeare_first300k.txt","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt"];
const src=files.map(p=>fs.readFileSync(p,'utf8'));
console.log(JSON.stringify(main(JSON.parse(src[0]),src.slice(1)),null,2));
