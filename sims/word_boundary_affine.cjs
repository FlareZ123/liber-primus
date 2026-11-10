'use strict';
/**
 * Exhaustive pair-linear LP2 boundary test over F_29.
 * Run: node sims/word_boundary_affine.cjs
 * Every nonconstant affine form a*last+b*prior+c is equivalent under output
 * relabeling to one of these 30 projective directions (29 slopes and prior).
 */
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const c=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const raw=fs.readFileSync(path.join(root,'resources/lp2-transcription.txt'),'utf8');
const map=new Map(c.runes.map((r,i)=>[r,i]));
/** @type {Array<{v:number[],b:boolean[]}>} */
const pages=Array.from({length:55},()=>({v:[],b:[]}));
let page=0;
for(const ch of raw.split('%').slice(0,55).join('%')){
  if(map.has(ch)){
    pages[page].v.push(map.get(ch));
    pages[page].b.push(false);
  }else if(ch==='%'){
    page++;
  }else if(ch==='/'||/\s/u.test(ch)){
    // Page and line wrapping need not delimit rune words.
  }else if(pages[page].b.length){
    pages[page].b[pages[page].b.length-1]=true;
  }
}
if(pages.reduce((n,p)=>n+p.v.length,0)!==12956)throw Error('Corpus rune count');

/** @param {Array<{v:number[],b:boolean[]}>} ps */
function score(ps){
  const all=new Uint32Array(841),ends=new Uint32Array(841);
  let n=0,nb=0;
  for(const p of ps)for(let i=1;i<p.v.length;i++){
    const idx=p.v[i]*29+p.v[i-1];all[idx]++;n++;
    if(p.b[i]){ends[idx]++;nb++;}
  }
  const frac=nb/n,stats=[];
  for(let slope=0;slope<=29;slope++){
    const total=new Uint32Array(29),hits=new Uint32Array(29);
    for(let x=0;x<29;x++)for(let y=0;y<29;y++){
      const bin=slope===29?y:(x+slope*y)%29,at=x*29+y;
      total[bin]+=all[at];hits[bin]+=ends[at];
    }
    let chi2=0;
    for(let j=0;j<29;j++){
      const expected=frac*total[j];
      if(expected>0)chi2+=(hits[j]-expected)**2/(expected*(1-frac));
    }
    stats.push(chi2);
  }
  return{n,nb,stats};
}
let state=0x51ab357c;
/** @returns {number} */
function random(){
  state^=state<<13;state^=state>>>17;state^=state<<5;
  return (state>>>0)/4294967296;
}
function rotated(){
  return pages.map(p=>{
    const o=Math.floor(random()*p.v.length);
    return{v:p.v.slice(o).concat(p.v.slice(0,o)),b:p.b};
  });
}
const observed=score(pages);
if(observed.n!==12901||observed.nb!==2884)throw Error('Corpus pairs/endings');
const ranked=observed.stats.map((chi2,slope)=>({slope,chi2})).sort((a,b)=>b.chi2-a.chi2);
const nNull=2000,maxima=[],single=[];
for(let t=0;t<nNull;t++){
  const v=score(rotated()).stats;
  maxima.push(Math.max(...v));single.push(v[ranked[0].slope]);
}
maxima.sort((a,b)=>a-b);
const ge=(arr,x)=>arr.filter(y=>y>=x).length;
const result={
  corpus:{runes:12956,rune_pages:55,pairs:observed.n,word_endings:observed.nb},
  family:'All 30 inequivalent nonconstant affine F29 pair functions',
  best:ranked.slice(0,8),
  null:{iterations:nNull,seed:'0x51ab357c',
    model:'independent full-page rune circular rotations; fixed word-ending locations',
    maximum_mean:maxima.reduce((a,b)=>a+b,0)/nNull,
    maximum_95: maxima[Math.floor((nNull-1)*0.95)],
    maximum_99: maxima[Math.floor((nNull-1)*0.99)]
  },
  p_familywise:(ge(maxima,ranked[0].chi2)+1)/(nNull+1),
  p_uncorrected:(ge(single,ranked[0].chi2)+1)/(nNull+1)
};
// Plant a new word-ending decision from one prespecified hidden direction.
// This checks that the detector can recover a substantial pair-conditioned rule.
const plant=pages.map(p=>{
  const b=p.b.slice();
  for(let i=1;i<b.length;i++){
    const q=(p.v[i]+19*p.v[i-1])%29;
    b[i]=random()<(q<6?0.55:0.15);
  }
  return{v:p.v,b};
});
const planted=score(plant).stats.map((chi2,slope)=>({slope,chi2})).sort((a,b)=>b.chi2-a.chi2);
if(planted[0].slope!==19||planted[0].chi2<100)throw Error('Planted detector missed slope19');
result.positive_control={slope:19,
  model:'boundary probability 0.55 for six residues; 0.15 for other residues',
  recovered:planted[0]};
console.log(JSON.stringify(result,null,2));
