'use strict';
/**
 * Original LP2 32x8 grid interpreted simultaneously as eight 32-byte
 * section keys (columns) and 32 eight-byte fragment nonces (rows).
 * 31 authentic 13-dot marks delimit the 32 fragments. No arbitrary KDF.
 * Reversible exact original and source-native positive, Node 22 CJS.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {inputs,correctedGridColumns}=require('./grid_section_column_keys.cjs');
const {train,encode}=require('./grid_keyskip_viterbi.cjs');
const {plainScore}=require('./grid_latin_register_inverse.cjs');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const corpus=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const ink=JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const {groups,columnKeys}=inputs();
assert.equal(groups.length,8);
assert.equal(groups.reduce((n,x)=>n+x.length,0),12956);
const start=[],all=[],originalPage=[];
for(const page of corpus.pages){
  start[page.page]=all.length;
  for(const c of page.indices){all.push(c);originalPage.push(page.page);}
}
assert.equal(all.length,13136);
assert.deepEqual(groups.flat(),all.slice(0,12956));
const markers=[];
for(const rec of ink.pages){
  assert.equal(rec.rune_count,corpus.pages[rec.page].indices.length);
  for(const [offset,count] of rec.large_punctuation||[])
    if(count===13)markers.push(start[rec.page]+offset);
}
markers.sort((a,b)=>a-b);
assert.equal(markers.length,31);
const fragments=[];let k=0,f=0;
for(let p=0;p<12956;p++){
  while(k<markers.length&&markers[k]===p){k++;f++;}
  fragments[p]=f;
}
assert.equal(k,27);
assert.equal(fragments[12955],27);
let cursor=0;
const section=[];
for(let s=0;s<groups.length;s++)for(const c of groups[s]){
  assert.equal(c,all[cursor]);section[cursor++]=s;
}
assert.equal(cursor,12956);
const cells=[];
for(let p=0;p<12956;p++){
  const fragment=fragments[p],group=section[p];
  if(p===0||cells.at(-1).fragment!==fragment||cells.at(-1).group!==group)
    cells.push({fragment,group,items:[]});
  cells.at(-1).items.push({cipher:all[p],page:originalPage[p]});
}
assert.equal(cells.reduce((n,c)=>n+c.items.length,0),12956);
assert.ok(cells.length>=28);
const bySource={canonical:columnKeys,imageFive:correctedGridColumns(columnKeys)};
const modeList=[];
for(const source of ['canonical','imageFive'])for(const algorithm of ['aes-256-ctr','chacha20'])
for(const reverseKey of [false,true])for(const reverseNonce of [false,true])
for(const format of ['direct29','diff28'])for(const reducer of ['mod','scaled'])
for(const sign of [-1,1])modeList.push({source,algorithm,reverseKey,reverseNonce,format,reducer,sign});
assert.equal(modeList.length,128);
const mod=(x,q)=>(x%q+q)%q;
const digit=(b,q,m)=>m.reducer==='mod'?b%q:Math.floor(b*q/256);
function keypads(mode){
  const cols=bySource[mode.source];
  const keys=cols.map(col=>{
    const key=Buffer.from(col);
    return mode.reverseKey?Buffer.from(key).reverse():key;
  });
  const nonces=Array.from({length:32},(_,r)=>{
    const bytes=Buffer.from(cols.map(col=>col[r]));
    return mode.reverseNonce?bytes.reverse():bytes;
  });
  return cells.map(({fragment,group,items})=>{
    const n=nonces[fragment];
    const iv=mode.algorithm==='chacha20'
      ?Buffer.concat([Buffer.alloc(8),n])
      :Buffer.concat([n,Buffer.alloc(8)]);
    const cipher=crypto.createCipheriv(mode.algorithm,keys[group],iv);
    return Buffer.concat([cipher.update(Buffer.alloc(items.length)),cipher.final()]);
  });
}
function decode(cipher,pads,m){
  return cipher.map((item,t)=>{
    const result=[];
    for(let j=0;j<item.length;j++){
      const c=item[j],direct=m.format==='direct29'||j===0;
      const q=direct?29:28,k=digit(pads[t][j],q,m);
      if(direct)result.push(mod(c-m.sign*k,29));
      else if(c===item[j-1])result.push(28);
      else result.push(mod(mod(c-item[j-1]-1,29)-m.sign*k,28));
    }
    return result;
  });
}
function encrypt(plain,pads,m){
  return plain.map((item,t)=>{
    const result=[];
    for(let j=0;j<item.length;j++){
      const p=item[j],direct=m.format==='direct29'||j===0;
      const q=direct?29:28,k=digit(pads[t][j],q,m);
      if(direct)result.push(mod(p+m.sign*k,29));
      else if(p===28)result.push(result[j-1]);
      else result.push(mod(result[j-1]+1+mod(p+m.sign*k,28),29));
    }
    return result;
  });
}
const original=cells.map(c=>c.items.map(item=>item.cipher));
function split(rows){
  const tr=[],ho=[];
  for(let t=0;t<rows.length;t++)for(let j=0;j<rows[t].length;j++)
    (cells[t].items[j].page<28?tr:ho).push(rows[t][j]);
  assert.equal(tr.length+ho.length,12956);
  return {tr,ho};
}
function ioc(arr){
  const f=Array(29).fill(0);
  for(const x of arr)f[x]++;
  return f.reduce((s,x)=>s+x*(x-1),0)/(arr.length*(arr.length-1));
}
const sourceEnglish=read('resources/control/shakespeare_first300k.txt');
const model=train(sourceEnglish.slice(0,190000));
const native=encode(sourceEnglish.slice(205000));
assert.ok(native.length>=12956);
function search(cipher){
  return modeList.map(mode=>{
    const inverse=decode(cipher,keypads(mode),mode);
    const {tr,ho}=split(inverse);
    return {mode,train:plainScore(tr,model),heldout:plainScore(ho,model),
      heldoutIoc:ioc(ho),prefix:inverse[0].slice(0,45).map(x=>corpus.translit[x]).join('')};
  }).sort((a,b)=>b.train-a.train);
}
function plant(){
  const truth={source:'imageFive',algorithm:'chacha20',reverseKey:false,
    reverseNonce:false,format:'diff28',reducer:'scaled',sign:1};
  const ref=native.slice(0,12956);let cur=0;
  const plaintext=cells.map(c=>{const seq=ref.slice(cur,cur+c.items.length);cur+=seq.length;return seq;});
  const pad=keypads(truth),cipher=encrypt(plaintext,pad,truth);
  assert.deepEqual(decode(cipher,pad,truth),plaintext);
  assert.deepEqual(encrypt(decode(cipher,pad,truth),pad,truth),cipher);
  const candidates=search(cipher),idx=candidates.findIndex(x=>JSON.stringify(x.mode)===JSON.stringify(truth));
  return {truth,rank:idx+1,recovered:plaintext.flat().length,
    reencrypted:cipher.flat().length,trueHeldout:candidates[idx].heldout,
    nextWrongTrain:candidates.filter(x=>JSON.stringify(x.mode)!==JSON.stringify(truth))[0].train};
}
function main(){
  const result=search(original);
  const actual=split(original);
  const output={sourceShape:{gridRows:32,gridColumns:8,markerCount:markers.length,
    printedSections:groups.length,intersectingCells:cells.length,
    nonemptyFragments:new Set(fragments).size,runes:12956},settings:modeList.length,
    topTraining:result.slice(0,5),
    frozenBest:{...result[0]},noKey:{heldout:plainScore(actual.ho,model),
      heldoutIoc:ioc(actual.ho)},positive:plant()};
  console.log(JSON.stringify(output,null,2));
}
if(require.main===module)main();
module.exports={keypads,decode,encrypt,split,search,plant,main};
