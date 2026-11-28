'use strict';
// POST-freeze grading for Agent38 / Director #3406.
// PRETARGET candidate file was committed in f57aa4c2e856fa7991a87675fdfbba2b384309ad.
// This script MUST NOT modify/reselect a source-only candidate.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..');
const frozen=JSON.parse(fs.readFileSync(path.join(root,'im-results/lp2-p6-exceptional-black7-pretarget-output.json'),'utf8'));
const corpus=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const asc=fs.readFileSync(path.join(root,'resources/historical/cicada2016-4gq25-outguess.asc'),'utf8').replace(/\r\n/g,'\n');
const body=asc.slice(asc.indexOf('\n\n',asc.indexOf('Hash:'))+2,asc.indexOf('-----BEGIN PGP SIGNATURE-----'));
const words=body.match(/[A-Za-z]+/g).map(x=>x.toUpperCase());
assert.equal(words[36],'GOOD');assert.equal(words[41],'VERIFY');assert.equal(words[42],'OPENPGP');
const norm=ch=>ch==='V'?'U':ch;
const targets=[36,41,42].map(j=>[...words[j]].map(ch=>{const i=corpus.translit.indexOf(norm(ch));assert(i>=0);return i;}));
assert.deepEqual(targets.map(x=>x.length),[4,6,7]);
assert.equal(frozen.alternatives.total,48);assert.equal(frozen.variants.length,48);
assert.deepEqual(corpus.pages[6].indices.slice(82,89),frozen.p6Black7);
for(const c of frozen.cases)assert.deepEqual(corpus.pages[c.page].indices.slice(c.start,c.start+c.original.length),c.original);
const mod=x=>((x%29)+29)%29, sum=xs=>mod(xs.reduce((a,b)=>a+b,0));
const inv=n=>{for(let a=1;a<29;a++)if(mod(a*n)===1)return a;throw Error('missing inverse')};
const H=xs=>{const o=[];for(let i=0;i<Math.floor(xs.length/2);i++)o.push(mod(xs[i]-xs[xs.length-1-i]),mod(xs[i]+xs[xs.length-1-i]));if(xs.length%2)o.push(xs[Math.floor(xs.length/2)]);return o};
const Hadj=xs=>{const o=[];for(let i=0;i+1<xs.length;i+=2)o.push(mod(xs[i]-xs[i+1]),mod(xs[i]+xs[i+1]));if(xs.length%2)o.push(xs[xs.length-1]);return o};
const scores=frozen.variants.map(v=>{
  const counts=v.receivers.map((r,j)=>r.rawDecoded.filter((q,i)=>q===targets[j][i]).length);
  const complete=v.receivers.map((r,j)=>Number(r.rawDecoded.every((q,i)=>q===targets[j][i])));
  return {representation:v.representation,orientation:v.orientation,sign:v.sign,placement:v.placement,matchedRunes:counts.reduce((a,b)=>a+b,0),matchedCompleteWords:complete.reduce((a,b)=>a+b,0),perPage:counts};
});
const hist={};for(const s of scores)hist[s.matchedRunes]=(hist[s.matchedRunes]||0)+1;
assert.deepEqual(hist,{'0':19,'1':20,'2':5,'3':4});
assert(scores.every(s=>s.matchedCompleteWords===0));
// Broader POSTTARGET exclusion: arbitrary affine scale a and per-page offset b,
// constrained only by the independently established page key sum. Since all
// target words are now known this is an exhaustive finite *fit* gate, not a new
// prospectively selected serializer. It even grants independent a on each page.
const affine=[];
for(let k=0;k<3;k++){
  const c=frozen.cases[k], C=c.original.filter((_,i)=>i!==c.removeIndex);
  const exactKey=C.map((x,i)=>mod(x-targets[k][i]));
  assert.equal(sum(exactKey),c.keysum);
  const n=C.length, rows=[];
  for(const repr of ['direct','H','Hadj'])for(const direction of ['forward','reverse'])for(const placement of ['prefix','suffix','centerLeft','centerRight']){
    const s=direction==='forward'?frozen.p6Black7:frozen.p6Black7.slice().reverse();
    const full=repr==='direct'?s:repr==='H'?H(s):Hadj(s);
    const slack=7-n, begin=placement==='prefix'?0:placement==='suffix'?slack:placement==='centerLeft'?Math.floor(slack/2):Math.ceil(slack/2);
    const t=full.slice(begin,begin+n);
    for(let a=0;a<29;a++){
      const uncentered=t.map(x=>mod(a*x));
      const b=mod((c.keysum-sum(uncentered))*inv(n));
      const proposed=uncentered.map(x=>mod(x+b));
      rows.push(proposed.filter((v,i)=>v===exactKey[i]).length);
    }
  }
  assert.equal(rows.length,696);
  const best=Math.max(...rows),fullCount=rows.filter(x=>x===n).length;
  assert.equal(fullCount,0);assert.equal(best,[2,3,2][k]);
  affine.push({page:c.page,length:n,testedLabeled:rows.length,maxMatchingKeyCoordinates:best,exactKeyHits:fullCount});
}
console.log(JSON.stringify({source:'resources/historical/cicada2016-4gq25-outguess.asc',freezeCommit:'f57aa4c2e856fa7991a87675fdfbba2b384309ad',candidateCount:scores.length,targetIndices:targets,hitHistogram:hist,maxMatchedRunes:3,completeWords:0,best:scores.filter(s=>s.matchedRunes===3),posttargetAllAffinePerPage:affine},null,2));
