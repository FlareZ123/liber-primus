// Exact source-native crib screen for stationary q8 GP29 plaintext-autokey permutations.
// No language scoring, no fitted map across crib alignments; only partial-bijection consistency.
const fs=require('node:fs'),assert=require('node:assert/strict');
const gp=JSON.parse(fs.readFileSync('resources/liber-primus/lp2-corpus.json','utf8'));
const src=JSON.parse(fs.readFileSync('resources/external/relikd-solved-gp29-native-v1.json','utf8'));
const rune=new Map(gp.runes.map((x,i)=>[x,i]));
const donors=src.sections.map(s=>({name:s.name,pt:Array.from(s.source_text).filter(c=>rune.has(c)).map(c=>rune.get(c))}));
const ct=gp.pages.slice(0,56).flatMap(p=>p.indices),q=8;
assert.equal(ct.length,12956);
function starts(p,excludeF=true){
 const end=new Int32Array(p.length);let k=p.length;
 for(let i=p.length-1;i>=0;i--){if(excludeF&&!p[i])k=i;end[i]=k;}
 return Array.from(p.keys()).filter(i=>end[i]-i>q).map(i=>[i,end[i]-i]);
}
function scan(c,excludeF=true){
 const cs=starts(c,excludeF),fv=new Int8Array(29),iv=new Int8Array(29),ft=new Int32Array(29),it=new Int32Array(29);
 let stamp=0,max=0,best=null,above32=0,above40=0;
 for(const d of donors){const p=d.pt;
 for(const [a,alen] of starts(p)){for(const [b,blen] of cs){
  stamp++;const len=Math.min(alen,blen);let n=q;
  for(;n<len;n++){const u=p[a+n-q],v=p[a+n];let z=c[b+n]-v;if(z<0)z+=29;
   if((ft[u]===stamp&&fv[u]!==z)||(it[z]===stamp&&iv[z]!==u))break;
   ft[u]=stamp;fv[u]=z;it[z]=stamp;iv[z]=u;
  }
  if(n>=32)above32++;if(n>=40)above40++;
  if(n>max){max=n;best={name:d.name,sourceOffset:a,targetOffset:b,phrase:p.slice(a,a+n).map(x=>gp.translit[x]).join('')};}
 }}}
 return {max,best,above32,above40,comparisons:stamp};
}
const terminal=ct.slice(-308).slice(70,193);assert.equal(terminal.length,123);assert(!terminal.includes(0));
const target=scan(terminal);assert.equal(target.max,23);
let state=3301;function rand(n){state=(Math.imul(state,1664525)+1013904223)>>>0;return state%n;}
const nulls=[];for(let j=0;j<32;j++){const a=terminal.slice();for(let i=a.length-1;i>0;i--){const k=rand(i+1);[a[i],a[k]]=[a[k],a[i]];}nulls.push(scan(a).max);}
const p=donors.find(d=>d.name==='jpg107-167').pt.slice(59,182);assert(!p.includes(0));assert.equal(p.length,123);
const plant=p.map((v,i)=>(v+(i<q?i:(11*p[i-q]+7)%29))%29);
const positive=scan(plant,false);assert.equal(positive.max,123);
console.log(JSON.stringify({target,nulls,positive},null,2));
const whole=scan(ct);assert.equal(whole.comparisons,23571636);assert.equal(whole.max,24);assert.equal(whole.above32,0);
console.log(JSON.stringify({whole},null,2));
