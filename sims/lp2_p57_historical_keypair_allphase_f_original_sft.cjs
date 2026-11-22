'use strict';
/**
 * Original-source p57's two named historical keys, tested with all finite
 * starting phases and both authentic plaintext-F bypass placements.
 * F orthography is as solved in original 2014 LP1; all results from exact LP2.
 * Run in repository with Node.js 22; no network, mutation or external packages.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const gp=JSON.parse(fs.readFileSync(path.join(__dirname,'../resources/liber-primus/lp2-corpus.json'),'utf8'));
const original=[gp.pages[54].indices,gp.pages[55].indices];
assert.deepEqual(original.map(x=>x.length),[232,76]);
const known=gp.pages[57].indices;
assert.equal(known.length,95);
const idx=s=>[...s].map(c=>{
  const n=gp.translit.indexOf(c);
  assert(n>=0,'Unknown native GP29 key rune: '+c);
  return n;
});
const historical=[
  {name:'FIRFUMFERENFE',runes:idx('FIRFUMFERENFE')},
  {name:'DIUINITY',runes:idx('DIUINITY')}
];
assert.deepEqual(historical[0].runes,[0,10,4,0,1,19,0,18,4,18,9,0,18]);
assert.deepEqual(historical[1].runes,[23,10,1,10,9,10,16,26]);
const mod=x=>(x%29+29)%29;

/**
 * @param {number} c @param {number[]} key @param {number} phase
 * @param {-1|1} direction @param {boolean} bypass
 * @returns {[number,number][]}
 */
function inverseOptions(c,key,phase,direction,bypass){
  const out=[];
  if(bypass&&c===0)out.push([0,phase]);
  const v=mod(c-direction*key[phase]);
  if(!bypass||v!==0)out.push([v,(phase+1)%key.length]);
  return out;
}
/**
 * @typedef {{outer:number[],inner:number[],signOuter:-1|1,signInner:-1|1,
 * skipOuter:boolean,skipInner:boolean,resetPage:boolean,
 * phaseOuter:number,phaseInner:number}} Model
 */
/** @param {number[][]} pages @param {Model} model */
function invert(pages,model){
  let states=new Set(),maxStates=1,index=0;
  for(let page=0;page<pages.length;page++){
    if(page===0||model.resetPage)states=new Set([model.phaseOuter+','+model.phaseInner]);
    for(const c of pages[page]){
      const next=new Set();
      for(const s of states){
        const [a,b]=s.split(',').map(Number);
        for(const [mid,aa] of inverseOptions(c,model.outer,a,model.signOuter,model.skipOuter))
          for(const [plain,bb] of inverseOptions(mid,model.inner,b,model.signInner,model.skipInner)){
            assert(plain>=0&&plain<29);
            next.add(aa+','+bb);
          }
      }
      states=next;maxStates=Math.max(maxStates,states.size);
      if(!states.size)return {failure:index,terminalStates:0,maxStates};
      index++;
    }
  }
  return {failure:null,terminalStates:states.size,maxStates};
}
/** @param {number[][]} plainPages @param {Model} model */
function encrypt(plainPages,model){
  let a=model.phaseOuter,b=model.phaseInner;
  const encodeStep=(p,key,phase,sign,skip)=>{
    if(skip&&p===0)return [0,phase];
    return [mod(p+sign*key[phase]),(phase+1)%key.length];
  };
  return plainPages.map((page,i)=>{
    if(i>0&&model.resetPage){a=model.phaseOuter;b=model.phaseInner;}
    return page.map(p=>{
      const mid=encodeStep(p,model.inner,b,model.signInner,model.skipInner);b=mid[1];
      const out=encodeStep(mid[0],model.outer,a,model.signOuter,model.skipOuter);a=out[1];
      return out[0];
    });
  });
}
/** @param {number[]} a */
function ioc(a){
  const c=Array(29).fill(0);
  for(const x of a)c[x]++;
  return c.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1));
}
const plant=original.map((x,j)=>x.map((_,i)=>known[(i+(j===1?232:0))%known.length]));
const summary={};
let trials=0,positive=0;
let bestOriginal={ioc:-1,model:null},minIoC=Infinity;
for(const order of [0,1]){
  const outer=historical[order].runes,inner=historical[1-order].runes;
  for(const signOuter of [-1,1])
    for(const signInner of [-1,1])
      for(const skipOuter of [false,true])
        for(const skipInner of [false,true])
          for(const resetPage of [false,true]){
            const label=String(Number(skipOuter))+String(Number(skipInner))+
              '-'+(resetPage?'page':'chapter');
            const agg=summary[label]??={total:0,p54p55Survive:0,p55Survive:0,
              failureMax:-1,maxStates:0};
            for(let phaseOuter=0;phaseOuter<outer.length;phaseOuter++)
              for(let phaseInner=0;phaseInner<inner.length;phaseInner++){
                const model={outer,inner,signOuter,signInner,skipOuter,
                  skipInner,resetPage,phaseOuter,phaseInner};
                const encoded=encrypt(plant,model);
                assert.equal(invert(encoded,model).failure,null,'positive-control failure');
                positive++;trials++;agg.total++;
                const alone=invert([original[1]],model);
                if(alone.failure===null)agg.p55Survive++;
                const result=invert(original,model);
                if(result.failure===null)agg.p54p55Survive++;
                else agg.failureMax=Math.max(agg.failureMax,result.failure);
                agg.maxStates=Math.max(agg.maxStates,result.maxStates);
                if(!skipOuter&&!skipInner){
                  const out=original.map((chunk,j)=>{
                    let a=(phaseOuter+(j>0&&!resetPage?232:0))%outer.length;
                    let b=(phaseInner+(j>0&&!resetPage?232:0))%inner.length;
                    return chunk.map(c=>{
                      const mid=mod(c-signOuter*outer[a]);a=(a+1)%outer.length;
                      const plain=mod(mid-signInner*inner[b]);b=(b+1)%inner.length;
                      return plain;
                    });
                  }).flat();
                  const score=ioc(out);minIoC=Math.min(minIoC,score);
                  if(score>bestOriginal.ioc)bestOriginal={ioc:score,model:{
                    order,signOuter,signInner,resetPage,phaseOuter,phaseInner}};
                }
              }
          }
}
assert.equal(trials,6656);
assert.equal(positive,trials);
assert.deepEqual(Object.fromEntries(Object.entries(summary).map(([k,v])=>[k,v.total])),{
  '00-chapter':832,'00-page':832,'01-chapter':832,'01-page':832,
  '10-chapter':832,'10-page':832,'11-chapter':832,'11-page':832
});
for(const key of ['10-chapter','10-page','11-chapter','11-page'])
  assert.equal(summary[key].p54p55Survive,0,'unexpected bypass acceptance');
assert(bestOriginal.ioc<0.04,'unexpected nonflat all-consuming result');
console.log('SOURCE '+JSON.stringify({unknownP54Runes:232,unknownP55Runes:76,
  historicalKeys:historical.map(x=>({name:x.name,length:x.runes.length})),
  p57ClearPositiveRunes:known.length,
  rawOriginalIoC:ioc(original.flat()),p57IoC:ioc(known)}));
console.log('SOURCE_NATIVE_ALL_PHASES '+JSON.stringify({trials,positivePlants:positive,
  byBypassPlacement:summary,allConsumingMinIoC:minIoC,
  allConsumingBestIoC:bestOriginal}));
console.log('DECISION: two explicit original LP1 keys, in either layer order/sign, fail to recover ordinary GP29 on final chapter. All phases fail if outer layer has literal plaintext-F bypass; the all-consuming texts remain flat. P55 alone is underdetermined.');
