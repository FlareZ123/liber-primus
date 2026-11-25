'use strict';
const fs=require('node:fs'),crypto=require('node:crypto');
const inputs=[
  {
    "path": "resources/liber-primus/lp2-corpus.json",
    "sha": "054f2a0f780b7d46901acbe3d9bf4f0ac1801165"
  },
  {
    "path": "resources/liber-primus/lp2-transcription.txt",
    "sha": "43bfeb6bf8dabaf25b0446cc519f8d91d205d8a7"
  },
  {
    "path": "resources/external/relikd-solved-gp29-native-v1.json",
    "sha": "1b064ef6d85819b7d96adaff31a82d1ec551598f"
  },
  {
    "path": "resources/control/gibran_prophet_58585.txt",
    "sha": "df260a07d56bf5998d40a6360b6132c35c252d10"
  },
  {
    "path": "resources/control/shakespeare_first300k.txt",
    "sha": "94c677ad9dd50771c6670e0c4e4dad9052b46d85"
  }
];
function experiment(gp,trans,nat,gibran,shakespeare){
 const g=JSON.parse(gp),native=JSON.parse(nat),q=8;
 const assert=(b,m)=>{if(!b)throw Error(m)};
 const raw=s=>Array.from(s).filter(c=>g.runes.includes(c)).map(c=>g.runes.indexOf(c));
 const words=s=>(s.match(/[\u16a0-\u16ff]+/g)||[]).map(raw);
 const all=words(trans.replace(/[\s/%]/g,"")).slice(0,2896);
 assert(all.length===2896&&all.flat().length===12956&&all.flat().join()===g.pages.slice(0,56).flatMap(p=>p.indices).join(),"physical source mismatch");
 const cuts=[0,729,1874,3612,5506,6527,7960,9640,12648,12956],chapters=[];let at=0,j=0;
 for(let k=1;k<cuts.length;k++){const start=j;while(at<cuts[k])at+=all[j++].length;assert(at===cuts[k],"chapter crosses group");chapters.push(all.slice(start,j))}
 const prose=native.sections.filter(s=>s.name!=="0_wisdom").map(s=>({name:s.name,words:words(s.source_text)}));
 const nativeTape=prose.flatMap(s=>s.words.flat());
 const al=new Map(g.translit.map((s,i)=>[s,i]));
 function roman(s){const a=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");for(let i=0;i<w.length;){if(w.startsWith("ING",i)){a.push(al.get("NG"));i+=3;continue}const t=w.slice(i,i+2);if(t.length===2&&al.has(t)){a.push(al.get(t));i+=2;continue}assert(al.has(w[i]),"unmapped Latin character");a.push(al.get(w[i++]));}}return a}
 const refs=[nativeTape,roman(gibran),roman(shakespeare)];
 function floor(t,n){if(n>t.length)return null;const c=new Int32Array(29);for(let i=0;i<n;i++)c[t[i]]++;function max(){let v=0;for(let i=1;i<29;i++)v=Math.max(v,c[i]);return v}let m=max();for(let i=n;i<t.length;i++){c[t[i-n]]--;c[t[i]]++;m=Math.min(m,max())}return m}
 function peel(ws,inside){const layers=[];let pos=0;for(const w of ws){for(let d=0;d<Math.ceil(w.length/2);d++){if(!layers[d])layers[d]=[];layers[d].push(w[d]);if(d!==w.length-1-d)layers[d].push(w[w.length-1-d])}pos+=w.length}const t=(inside?layers.reverse():layers).flat();assert(t.length===pos,"length");return t}
 // Each block is a maximal nonzero run followed by an optional consuming zero.
 // h[symbol*q+relativePhase] counts nonzero events in this block.
 function blocks(t){const b=[];let n=0,h=new Int16Array(29*q);for(const c of t){if(c===0){b.push({h,n:n%q,zero:true});h=new Int16Array(29*q);n=0}else{h[c*q+n%q]++;n++}}b.push({h,n:n%q,zero:false});return b}
 // For two phase-specific preimages a,b, maximize jointly over the SAME hold path.
 function pairBound(bs,p,r){let best=0;const s=new Int16Array(q),next=new Int16Array(q);
 for(let a=0;a<29;a++)for(let b=0;b<29;b++){s.fill(-30000);s[0]=0;for(const z of bs){next.fill(-30000);for(let j=0;j<q;j++){if(s[j]<0)continue;const e=(j+z.n)%q;const v=s[j]+z.h[a*q+(p-j+q)%q]+z.h[b*q+(r-j+q)%q];if(v>next[e])next[e]=v;if(z.zero){const k=(e+1)%q;const w=v+Number(e===p&&a===0)+Number(e===r&&b===0);if(w>next[k])next[k]=w}}s.set(next)}for(let j=0;j<q;j++)if(s[j]>best)best=s[j]}return best}
 function bound(t){const bs=blocks(t),B=Array.from({length:q},()=>Array(q).fill(0));for(let p=0;p<q;p++)for(let r=p+1;r<q;r++)B[p][r]=B[r][p]=pairBound(bs,p,r);
 const memo=new Map([[0,{v:0,edges:[]}]]);function dp(mask){if(memo.has(mask))return memo.get(mask);let p=0;while(!(mask>>p&1))p++;let best={v:Infinity};for(let r=p+1;r<q;r++)if(mask>>r&1){const x=dp(mask^(1<<p)^(1<<r)),v=B[p][r]+x.v;if(v<best.v)best={v,edges:[[p,r],...x.edges]}}memo.set(mask,best);return best}return {zeros:bs.length-1,cap:dp(255),B}}
 function brute(t,p,r){let best=0;const c=Array.from({length:q},()=>new Int16Array(29));function dfs(i,j){if(i===t.length){let a=0,b=0;for(let k=0;k<29;k++){a=Math.max(a,c[p][k]);b=Math.max(b,c[r][k])}best=Math.max(best,a+b);return}const x=t[i];if(!x)dfs(i+1,j);c[j][x]++;dfs(i+1,(j+1)%q);c[j][x]--}dfs(0,0);return best}
 let seed=3301;function rng(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0}
 let comparisons=0;for(let k=0;k<20;k++){const t=Array.from({length:30},()=>rng()%5===0?0:1+rng()%28);for(let p=0;p<q;p++)for(let r=p+1;r<q;r++){assert(pairBound(blocks(t),p,r)===brute(t,p,r),"pair mismatch");comparisons++}}
 const controls=[];for(const name of ["0_welcome","0_koan_1","0_loss_of_divinity"]){const ws=prose.find(s=>s.name===name).words;for(const inside of [false,true]){const p=peel(ws,inside),key=Array.from({length:q},()=>rng()%29);let phase=0;const c=p.map(x=>{if(!x)return 0;const y=(x+key[phase])%29;phase=(phase+1)%q;return y});const count=new Int32Array(29);for(const x of p)count[x]++;const trueMax=Math.max(...count.slice(1)),a=bound(c);assert(a.cap.v>=trueMax,"control excluded");controls.push({name,inside,key,trueMax,cap:a.cap.v,zeros:a.zeros})}}
 const results=[];for(let chapter=0;chapter<chapters.length;chapter++){const n=cuts[chapter+1]-cuts[chapter],floors=refs.map(t=>floor(t,n));for(const inside of [false,true]){const t=peel(chapters[chapter],inside),a=bound(t);results.push({chapter,inside,n,floors,...a})}}
 return {comparisons,refLengths:refs.map(t=>t.length),controls,results};
}
const data=inputs.map(({path,sha})=>{const b=fs.readFileSync(path);if(crypto.createHash('sha1').update(`blob ${b.length}\0`).update(b).digest('hex')!==sha)throw Error('input changed: '+path);return b.toString('utf8')});
console.log(JSON.stringify({inputs,...experiment(...data)},null,2));
