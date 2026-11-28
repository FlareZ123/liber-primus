"use strict";
/**
 * Exact q-homophone capacity extension of the fixed-width LP2 block gate.
 * Run from repository root:
 *   node sims/lp2_static_block_homophony_capacity_sft.cjs
 */
const fs=require("node:fs");
const corpus=JSON.parse(fs.readFileSync("resources/liber-primus/lp2-corpus.json","utf8"));
const sourceNames=["gibran_prophet_58585.txt","shakespeare_first300k.txt","emerson_essays_2944.txt"];
const pages=corpus.pages.filter(p=>p.page<=55&&p.indices&&p.indices.length),arrays=pages.map(p=>p.indices),lengths=arrays.map(a=>a.length),tape=arrays.flat(),N=tape.length,A=29,SAMPLES=512;
const ranges=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]],assert=(v,m)=>{if(!v)throw Error(m);};
assert(pages.length===55&&N===12956,"source shape");
const items=corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length),single=new Map(corpus.translit.map((s,i)=>[s,i]));
function gp(txt,mode){const out=[],words=txt.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").match(/[A-Z]+/g)||[];for(const w of words)for(let i=0;i<w.length;){if(mode==="legacy"&&w.startsWith("ING",i)){out.push(21);i+=3;continue}if(mode==="legacy"&&w.startsWith("IO",i)){out.push(27);i+=2;continue}if(mode==="latin"){assert(single.has(w[i]),"latin rune");out.push(single.get(w[i++]));continue}const t=items.find(x=>w.startsWith(x.s,i));assert(t,"GP token");out.push(t.i);i+=t.s.length}return out}
function state(a,i,k){let x=0;for(let j=0;j<k;j++)x=x*A+a[i+j];return x}
function one(a,k,o){const m=new Map();for(let i=o;i+k<=a.length;i+=k){const x=state(a,i,k);m.set(x,(m.get(x)||0)+1)}return [...m.values()]}
function merge(as,k,o){const m=new Map();for(const a of as)for(let i=o;i+k<=a.length;i+=k){const x=state(a,i,k);m.set(x,(m.get(x)||0)+1)}return [[...m.values()]]}
function separate(as,k,o){return as.map(a=>one(a,k,o))}
function segment(w){let z=0;return lengths.map(n=>{const a=w.slice(z,z+n);z+=n;return a})}
function chapters(as){const byPage=new Map(pages.map((p,i)=>[p.page,as[i]]));return ranges.map(([lo,hi])=>{const out=[];for(let p=lo;p<=hi;p++)if(byPage.has(p))out.push(...byPage.get(p));return out})}
function counts(as,scope,k,o){if(scope==="shared-continuous")return [one(as.flat(),k,o)];if(scope==="shared-page-reset")return merge(as,k,o);if(scope==="chapter-private")return separate(chapters(as),k,o);if(scope==="page-private")return separate(as,k,o);throw Error("scope")}
function collisions(vv){let s=0;for(const v of vv)for(const n of v)s+=n*(n-1)/2;return s}
function splitMinimum(vv,q){let s=0;for(const v of vv)for(const n of v){const a=Math.floor(n/q),r=n%q;s+=r*a*(a+1)/2+(q-r)*a*(a-1)/2}return s}
function qNeeded(vv,limit){for(let q=1;q<=128;q++)if(splitMinimum(vv,q)<=limit)return q;return 129}
const specs=[["shared-continuous",2],["shared-continuous",3],["shared-page-reset",2],["shared-page-reset",3],["chapter-private",2],["chapter-private",3],["page-private",2]];
const result={};
for(const [scope,k] of specs){const key=scope+"/k"+k;result[key]={minimumQ:99,witness:null};
 for(let o=0;o<k;o++){const limit=collisions(counts(arrays,scope,k,o));
  for(const name of sourceNames){const text=fs.readFileSync("resources/control/"+name,"utf8");
   for(const mode of ["legacy","greedy","latin"]){const seq=gp(text,mode);assert(seq.length>=N,"control length");const max=seq.length-N;
    for(let w=0;w<SAMPLES;w++){const start=Math.floor(w*max/(SAMPLES-1)),need=qNeeded(counts(segment(seq.slice(start,start+N)),scope,k,o),limit);
     if(need<result[key].minimumQ)result[key]={minimumQ:need,witness:{offset:o,name,mode,window:w,start,originalCollisionLimit:limit}};
    }
   }
  }
 }
}
const expected={"shared-continuous/k2":4,"shared-continuous/k3":6,"shared-page-reset/k2":4,"shared-page-reset/k3":6,"chapter-private/k2":4,"chapter-private/k3":3,"page-private/k2":3};
for(const [key,q] of Object.entries(expected))assert(result[key].minimumQ===q,key+" exact q bound");
console.log(JSON.stringify({theorem:"n occurrences split among at most q homophones have minimum equal-output pairs under the balanced partition",source:{unknownRunes:N,windowsPerDonorRendering:SAMPLES},robustAcross:["Gibran","Shakespeare","Emerson","legacy","greedy","latin"],bounds:result,interpretation:"every q below minimumQ is excluded on all tested windows, renderings, offsets, and the stated reset scope; minimumQ itself has at least one collision-count survivor only"},null,2));
