'use strict';
/**
 * Family-wide exact-forward screen for equal-position reused additive keys.
 * A candidate page pair is useful only if a preselected English-GP model
 * explains separately its first and second ciphertext halves.
 *
 * Tests scale 1 (ordinary common key) and scale 4 (specific prior LP2 lead).
 * Scores are fully marginalized over latent plaintext paths. This is a
 * cryptanalytic candidate finder and does not itself recover text.
 *
 * Node 22, CommonJS, no third-party packages. Manual CI only.
 */
const fs=require('node:fs');
const path=require('node:path');
const base=require('./relative_key_english_probe.cjs');
const {train,evaluate}=require('./relative_key_forward_likelihood.cjs');
const ROOT=path.resolve(__dirname,'..');

/**
 * @param {{xs:number[],start:boolean[],end:boolean[]}} page
 * @param {number} from
 * @param {number} until
 */
function part(page,from,until){
  return {xs:page.xs.slice(from,until),
    start:page.start.slice(from,until),end:page.end.slice(from,until)};
}
/**
 * @param {{xs:number[],start:boolean[],end:boolean[]}} a
 * @param {{xs:number[],start:boolean[],end:boolean[]}} b
 * @param {ReturnType<typeof train>} model
 * @param {number} scale
 */
function crossvalidate(a,b,model,scale){
  const n=Math.min(a.xs.length,b.xs.length),middle=Math.floor(n/2);
  const first=evaluate(part(a,0,middle),part(b,0,middle),model,scale,false).observed;
  const second=evaluate(part(a,middle,n),part(b,middle,n),model,scale,false).observed;
  return {scale,n,first,second,
    minForward:Math.min(first.forward,second.forward),
    minExcess:Math.min(first.excess,second.excess),
    forwardSum:first.forward+second.forward,
    excessSum:first.excess+second.excess};
}
/** @param {number} minLength */
function scan(minLength=150){
  const source=fs.readFileSync(path.join(ROOT,'resources/control/shakespeare_first300k.txt'),'utf8');
  const trainWords=base.corpusWords(source.slice(0,240000));
  const model=train(trainWords);
  const corpus=JSON.parse(fs.readFileSync(path.join(ROOT,'resources/liber-primus/lp2-corpus.json'),'utf8'));
  const pages=corpus.pages.filter(p=>p.page<=55&&p.indices.length).map(p=>({
    page:p.page,mask:base.lp2Page(p.page)
  }));
  const rows=[];
  for(let i=0;i<pages.length;i++)for(let j=i+1;j<pages.length;j++){
    const a=pages[i],b=pages[j],n=Math.min(a.mask.xs.length,b.mask.xs.length);
    if(n<minLength)continue;
    for(const scale of [1,4]){
      rows.push({pages:[a.page,b.page],...crossvalidate(a.mask,b.mask,model,scale)});
    }
  }
  const top=(key)=>rows.slice().sort((a,b)=>b[key]-a[key]).slice(0,20)
    .map(x=>({pages:x.pages,scale:x.scale,n:x.n,
      firstForward:x.first.forward,secondForward:x.second.forward,
      firstExcess:x.first.excess,secondExcess:x.second.excess,
      rankMetric:x[key]}));
  const target=rows.filter(x=>x.pages[0]===28&&x.pages[1]===42);
  const counts={
    bothForwardPositive:rows.filter(r=>r.first.forward>0&&r.second.forward>0).length,
    bothExcessPositive:rows.filter(r=>r.first.excess>0&&r.second.excess>0).length,
    bothForwardAbove5:rows.filter(r=>r.first.forward>5&&r.second.forward>5).length,
    bothExcessAbove5:rows.filter(r=>r.first.excess>5&&r.second.excess>5).length
  };
  return {
    hypothesis:'identical additive key per offset across pages, with plaintext scale 1 or 4, two natural GP-English streams',
    sources:'LP2 canonical 55 rune pages; Shakespeare first 240k-character training',
    scannedPairs:rows.length/2,models:rows.length,minLength,
    halfBoundary:'at floor(minimum page rune length / 2), independently normalized',
    counts,target,topMinForward:top('minForward'),topMinExcess:top('minExcess'),
    topForwardSum:top('forwardSum'),topExcessSum:top('excessSum'),
    caveat:'The language model, page pairing and scale families are assumptions; half scoring resets state at the cut. Positive scores are candidate triage, not decryptions.'
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(scan(),null,2)+'\n');
module.exports={part,crossvalidate,scan};
