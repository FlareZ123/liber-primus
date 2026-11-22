"use strict";
/**
 * Exhaustively test the entire 600,366-byte valid LP1 05.jpg prefix
 * in both byte directions as a literal LP2 pad, with mod29 and scaled29
 * reducers, both arithmetic signs and skip-aware 24-rune Viterbi.
 * Reproduce: node sims/mirror_jpeg_whole_offsets.cjs
 */
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const {train,encode}=require("./grid_keyskip_viterbi.cjs");
const {decode,encrypt,imageStreams,candidateKeys}=require("./mirror_jpeg_pad.cjs");
const {headScore,exhaustive}=require("./mirror_jpeg_offsets.cjs");
const ROOT=path.join(__dirname,".."),WINDOW=220,HEAD=24;
function main(){
  const image=fs.readFileSync(path.join(ROOT,"resources","liber-primus","05.jpg"));
  const keys=candidateKeys(imageStreams(image)).filter(x=>
    x.name.startsWith("whole-jpeg:")||x.name.startsWith("reversed-jpeg:"));
  assert.equal(keys.length,4);
  const length=keys[0].key.length;
  assert.equal(length,600366);
  const lm=train(fs.readFileSync(path.join(
    ROOT,"resources","control","shakespeare_first300k.txt"),"utf8"));
  const data=JSON.parse(fs.readFileSync(path.join(
    ROOT,"resources","liber-primus","lp2-corpus.json"),"utf8"));
  const cipher=data.pages.find(p=>p.page===0).indices.slice(0,WINDOW);
  assert.equal(cipher.length,WINDOW);

  const known=fs.readFileSync(path.join(
    ROOT,"resources","liber-primus","lp1-plaintext-reference.txt"),"utf8");
  const plain=encode(known.split("### 3")[1].split("### 4")[0]).slice(0,WINDOW);
  assert.equal(plain.length,WINDOW);
  const offset=300000,trueKey=keys[0].key,plant=encrypt(
    plain,trueKey,offset,1,0x971f3301);
  const expected=headScore(plant.cipher.slice(0,HEAD),trueKey,offset,1,lm);
  let rank=1;
  for(let guess=0;guess<=length-3*WINDOW;guess++){
    if(guess===offset)continue;
    if(headScore(plant.cipher.slice(0,HEAD),trueKey,guess,1,lm)>expected)rank++;
  }
  const decoded=decode(plant.cipher,trueKey,offset,1,lm);
  const recovered=decoded.plain.filter((v,i)=>v===plain[i]).length;
  console.log("CONTROL",JSON.stringify({
    offset,rank,headScore:expected,offsets:length-3*WINDOW+1,
    plantedSkips:plant.skips,decodedSkips:decoded.skips,
    recovered,total:WINDOW
  }));
  assert.ok(recovered>=Math.ceil(0.90*WINDOW));
  assert.ok(rank<=140);

  const search=exhaustive(cipher.slice(0,HEAD),keys,lm,140);
  const decodedCandidates=search.best.map(x=>{
    const key=keys.find(z=>z.name===x.name).key;
    const value=decode(cipher,key,x.offset,x.sign,lm);
    return {...x,fullScore:value.perRune,skips:value.skips,
      first40:value.plain.slice(0,40)};
  }).sort((a,b)=>b.fullScore-a.fullScore);
  console.log("FINAL",JSON.stringify({
    page:0,head:HEAD,full:WINDOW,checked:search.checked,
    best:decodedCandidates.slice(0,20),
    strongestHead:search.best.slice(0,20)
  }));
}
if(require.main===module)main();
