'use strict';
const fs = require('node:fs');
const assert = require('node:assert/strict');
function run(corpus,native){
 const mod=x=>(x%29+29)%29,inv=Array.from({length:29},(_,a)=>a?Array.from({length:28},(_,j)=>j+1).find(b=>a*b%29===1):0);
 /** @param {number[]} t @returns {number[][]} */
 function runs(t){let out=[],s=[];for(const x of t){if(x)s.push(x);else if(s.length){out.push(s);s=[]}}if(s.length)out.push(s);return out.sort((a,b)=>b.length-a.length)}
 /** @param {number[]} run @param {number} a @param {number} b @param {number} d */
 function mask(run,a,b,d){let A=1,B=0,m=(1<<29)-2;for(let i=1;i<run.length;i++){A=mod(-a*A);B=mod(run[i]-b*run[i-1]-d-a*B);if(A===0){if(!B)return 0;}else{m&=~(1<<mod(-B*inv[A]));if(!m)return 0;}}return m}
 /** @param {number[][]} rs */
 function gate(rs){const ret=[];for(let a=0;a<29;a++)for(let b=0;b<29;b++)for(let d=0;d<29;d++)if(rs.every(run=>mask(run,a,b,d)))ret.push([a,b,d]);return ret}
 const pages=corpus.pages.filter(p=>p.page<56),t=pages.flatMap(p=>p.indices),rs=runs(t),prs=pages.flatMap(p=>runs(p.indices)).sort((a,b)=>b.length-a.length),surv=gate(rs),page=gate(prs),forced=surv.filter(([a,b,d])=>!a||rs.some(run=>mask(run,a,b,d)===(1<<run[0]))).length;
 const private7=gate(runs(pages.find(p=>p.page===7).indices));
 const pageForced=surv.map(([a,b,d])=>pages.filter(p=>p.indices.length&&(!a||runs(p.indices).some(run=>mask(run,a,b,d)===(1<<run[0])))).map(p=>p.page));
 const ioc=t=>{let f=Array(29).fill(0);for(const x of t)f[x]++;return f.reduce((s,x)=>s+x*(x-1),0)/(t.length*(t.length-1))};
 const sections=native.sections.map(s=>[...s.source_text].map(x=>native.runes.indexOf(x)).filter(x=>x>=0));
 /** @param {number[]} p @param {number} u @param {number} a @param {number} b @param {number} d @param {number[]} seed */
 function encrypt(p,u,a,b,d,seed=[5,17]){let [x,c]=seed;return p.map(v=>{if(!v)return 0;const nx=mod(u*v),nc=mod(nx+a*x+b*c+d);x=nx;c=nc;return nc})}
 /** @param {number[]} c @param {number} u @param {number} a @param {number} b @param {number} d @param {number[][]} train */
 function decode(c,u,a,b,d,train){const uni=Array(29).fill(1),bi=Array.from({length:29},()=>Array(29).fill(.1));for(const arr of train){for(let i=0;i<arr.length;i++){uni[arr[i]]++;if(i)bi[arr[i-1]][arr[i]]++}}const total=uni.reduce((a,b)=>a+b),btotal=bi.map(r=>r.reduce((a,b)=>a+b));const log=Array.from({length:30},(_,j)=>uni.map((v,p)=>Math.log(j===29?v/total:.3*v/total+.7*bi[j][p]/btotal[j])));let m=new Map(Array.from({length:841},(_,s)=>[s*30+29,{s,prev:29,score:0,node:null}]));for(const v of c){const n=new Map();for(const z of m.values()){let x=z.s%29,k=Math.floor(z.s/29),nx=mod(v-a*x-b*k-d);const add=(s,p)=>{const id=s*30+p,score=z.score+log[z.prev][p];if(!n.has(id)||score>n.get(id).score)n.set(id,{s,prev:p,score,node:{p,prev:z.node,seed:z.node?null:[x,k]}})};if(v===0)add(z.s,0);if(nx)add(v*29+nx,mod(inv[u]*nx));}m=n;}let best=[...m.values()].sort((a,b)=>b.score-a.score)[0],p=[],seed;for(let z=best.node;z;z=z.prev){p.push(z.p);if(z.seed)seed=z.seed;}return {p:p.reverse(),seed,score:best.score}}
 const plants=[[[1,3],[7,9,13,4]],[[4,5,6],[11,17,3,18]]].map(([ids,key])=>{const [u,a,b,d]=key,p=ids.flatMap(i=>sections[i]),c=encrypt(p,...key),train=sections.filter((_,i)=>!ids.includes(i)),cut=p.length>>1;const ranks=Array.from({length:28},(_,i)=>[i+1,decode(c.slice(0,cut),i+1,a,b,d,train).score]).sort((a,b)=>b[1]-a[1]);const best=decode(c,ranks[0][0],a,b,d,train);return{ids,key,n:p.length,fitScale:ranks[0][0],rank:ranks.findIndex(x=>x[0]===u)+1,holdout:p.length-cut,correct:best.p.slice(cut).filter((v,i)=>v===p[cut+i]).length,replay:encrypt(best.p,ranks[0][0],a,b,d,best.seed).every((v,i)=>v===c[i]),gate:gate(runs(c)).length}});
 const higher=[2,3,4].map(q=>{const groups=rs.map(run=>Array.from({length:q},(_,j)=>run.filter((_,i)=>i%q===j)).filter(x=>x.length)),lanes=groups.flat().sort((a,b)=>b.length-a.length),s=gate(lanes);return {q,survivors:s.length,noncancel:s.filter(([a,b,d])=>mod(a+b)||d).length,forced:s.filter(([a,b,d])=>!mod(a+b)&&!d&&(!a||groups.some(g=>g.length===q&&g.every(l=>mask(l,a,b,d)===(1<<l[0]))))).length}});
 return {n:t.length,runs:rs.length,maxRun:rs[0].length,pageRuns:prs.length,surv:surv.length,pageSurv:page.length,noncancel:surv.filter(([a,b,d])=>mod(a+b)||d).length,forced,private7:private7.length,private7Noncancel:private7.filter(([a,b,d])=>mod(a+b)||d).length,p7Forced:pageForced.every(p=>p.includes(7)),pageForced:pageForced.map(p=>p.length),ioc:ioc(t),holdoutIoC:ioc(pages.filter(p=>p.page>=16&&p.page<=21).flatMap(p=>p.indices)),plants,higher}
}
const result = run(JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json','utf8')),JSON.parse(fs.readFileSync('resources/external/relikd-solved-gp29-native-v1.json','utf8')));
assert.deepEqual(result, {
  "n": 12956,
  "runs": 455,
  "maxRun": 217,
  "pageRuns": 503,
  "surv": 29,
  "pageSurv": 29,
  "noncancel": 0,
  "forced": 29,
  "private7": 1133,
  "private7Noncancel": 1104,
  "p7Forced": true,
  "pageForced": [
    55,
    10,
    10,
    7,
    11,
    8,
    11,
    10,
    6,
    5,
    9,
    7,
    8,
    10,
    7,
    9,
    9,
    9,
    12,
    9,
    8,
    5,
    9,
    9,
    7,
    11,
    11,
    9,
    11
  ],
  "ioc": 0.03447839786450569,
  "holdoutIoC": 0.03454946549360884,
  "plants": [
    {
      "ids": [
        1,
        3
      ],
      "key": [
        7,
        9,
        13,
        4
      ],
      "n": 1295,
      "fitScale": 7,
      "rank": 1,
      "holdout": 648,
      "correct": 648,
      "replay": true,
      "gate": 16832
    },
    {
      "ids": [
        4,
        5,
        6
      ],
      "key": [
        11,
        17,
        3,
        18
      ],
      "n": 1163,
      "fitScale": 11,
      "rank": 1,
      "holdout": 582,
      "correct": 582,
      "replay": true,
      "gate": 1933
    }
  ],
  "higher": [
    {
      "q": 2,
      "survivors": 4367,
      "noncancel": 4338,
      "forced": 12
    },
    {
      "q": 3,
      "survivors": 19172,
      "noncancel": 19143,
      "forced": 1
    },
    {
      "q": 4,
      "survivors": 23271,
      "noncancel": 23242,
      "forced": 1
    }
  ]
});
console.log(JSON.stringify(result,null,2));
