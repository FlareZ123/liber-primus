'use strict';
const fs = require('node:fs');
const path = require('node:path');

/** @param {object} j Original-image adjudication fixture. */
function investigate(j) {
  const assert=(c,m)=>{if(!c)throw Error(m)};
  const p=j.physical_zero_based;
  const seed=p.red_words.reduce((n,w)=>n+w.length,0);
  const word=p.black_following_runes[0].gp_indices.slice(0,4);
  assert(seed===13 && new Set(word).size===4, 'unexpected source');
  const num=(a,le)=> (le?[...a].reverse():a).reduce((x,y)=>x*29+y,0);
  const two=[],three=[];
  let minSingle=Infinity;
  for(let cut=1;cut<=3;cut++) for(const le1 of [false,true]) for(const le2 of [false,true])
    two.push({cut,le1,le2,min:Infinity,legal13:0,legal31:0,count:0});
  for(let c1=1;c1<3;c1++)for(let c2=c1+1;c2<4;c2++)
    for(let mask=0;mask<8;mask++)three.push({c1,c2,mask,oneBased:0,zeroBased:0,twoVerseRelaxation:0,count:0});
  for(let a=0;a<29;a++)for(let b=0;b<29;b++)if(b!==a)
    for(let c=0;c<29;c++)if(c!==a&&c!==b)
      for(let d=0;d<29;d++)if(d!==a&&d!==b&&d!==c){
        const v=[a,b,c,d];
        minSingle=Math.min(minSingle,num(v,false),num(v,true));
        for(const t of two){
          const x=num(v.slice(0,t.cut),t.le1),y=num(v.slice(t.cut),t.le2),m=Math.max(x,y);
          t.min=Math.min(t.min,m);t.legal13+=+(m<=seed);t.legal31+=+(m<=31);t.count++;
        }
        for(const t of three){
          const x=num(v.slice(0,t.c1),!!(t.mask&1)),y=num(v.slice(t.c1,t.c2),!!(t.mask&2)),z=num(v.slice(t.c2),!!(t.mask&4));
          t.oneBased+=+(x===1&&y===1&&z>=1&&z<=seed);
          t.zeroBased+=+(x===0&&y===0&&z>=0&&z<seed);
          t.twoVerseRelaxation+=+(x===1&&y>=1&&y<=2&&z>=1&&z<=seed);
          t.count++;
        }
      }
  assert(minSingle===902&&two.every(t=>t.count===570024&&t.min===31&&!t.legal13&&t.legal31>0),'bound failure');
  assert(three.every(t=>t.count===570024&&!t.oneBased&&!t.zeroBased),'three-field failure');
  const history=Array.from({length:31},(_,i)=>i%29);
  const digits=[0,3,1,2], len=num(digits.slice(0,2),false), distance=num(digits.slice(2),false);
  const copied=history.slice(history.length-distance,history.length-distance+len);
  assert(len===3&&distance===31&&copied.join(',')==='0,1,2','sharp positive control');
  const duplicate=[1,1,0,2], historical=[num(duplicate.slice(0,1),false),num(duplicate.slice(1,2),false),num(duplicate.slice(2),false)];
  assert(historical.join(',')==='1,1,2','valid historical-coordinate pattern');
  return {seed,word,minSingle,two,three,controls:{sharpSpan:{historyLength:history.length,digits,len,distance,copied},repeatedDigitThreeField:historical}};
}
if (require.main===module) {
  const j=JSON.parse(fs.readFileSync(path.join(__dirname,'../resources/liber-primus/lp2-p0-physical-ink-override.json'),'utf8'));
  console.log(JSON.stringify(investigate(j),null,2));
}
module.exports={investigate};
