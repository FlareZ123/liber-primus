"use strict";
/**
 * Candidate LP2 pad: the LP1 05.jpg mirrored bytes converted to an
 * unbiased 29-symbol stream by rejection of byte values 232..255.
 * Search every offset of that stream under a 0..2 rejection cipher
 * filter. Independent planted-key calibration. Test LP2 pages 0 and 5.
 * Reproduce: node sims/mirror_jpeg_rejection_offsets.cjs
 */
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const {train,encode}=require("./grid_keyskip_viterbi.cjs");
const {decode,encrypt,imageStreams}=require("./mirror_jpeg_pad.cjs");
const {headScore,exhaustive}=require("./mirror_jpeg_offsets.cjs");
const ROOT=path.join(__dirname,".."),WINDOW=220,HEAD=24;
function main(){
  const bytes=fs.readFileSync(path.join(ROOT,"resources","liber-primus","05.jpg"));
  const keys=imageStreams(bytes).filter(x=>
    x.name==="trailing-mirror"||x.name==="unmirrored-prefix").map(x=>({
      name:x.name+":reject232",
      key:x.bytes.filter(n=>n<232).map(n=>n%29)
    }));
  assert.equal(keys.length,2);
  const lm=train(fs.readFileSync(path.join(
    ROOT,"resources","control","shakespeare_first300k.txt"),"utf8"));
  const corpus=JSON.parse(fs.readFileSync(path.join(
    ROOT,"resources","liber-primus","lp2-corpus.json"),"utf8"));
  const known=fs.readFileSync(path.join(ROOT,"resources",
    "liber-primus","lp1-plaintext-reference.txt"),"utf8");
  const plain=encode(known.split("### 3")[1].split("### 4")[0]).slice(0,WINDOW);
  const offset=12345,seed=0x33010522;
  const plant=encrypt(plain,keys[0].key,offset,1,seed);
  const truth=headScore(plant.cipher.slice(0,HEAD),keys[0].key,offset,1,lm);
  let rank=1;
  for(let guess=0;guess<=keys[0].key.length-3*WINDOW;guess++){
    if(guess===offset)continue;
    if(headScore(plant.cipher.slice(0,HEAD),keys[0].key,guess,1,lm)>truth)rank++;
  }
  const decoded=decode(plant.cipher,keys[0].key,offset,1,lm);
  const recovered=decoded.plain.filter((v,i)=>v===plain[i]).length;
  console.log("CONTROL",JSON.stringify({
    retainedPadBytes:keys[0].key.length,offset,headScore:truth,
    rank,offsets:keys[0].key.length-3*WINDOW+1,
    recovered,total:WINDOW,plantedSkips:plant.skips,decodedSkips:decoded.skips
  }));
  assert.ok(recovered>=Math.ceil(0.9*WINDOW));
  assert.ok(rank<=140);
  for(const pageNumber of [0,5]){
    const cipher=corpus.pages.find(p=>p.page===pageNumber).indices.slice(0,WINDOW);
    assert.ok(cipher.length>=HEAD);
    const outcome=exhaustive(cipher.slice(0,HEAD),keys,lm,140);
    const selected=outcome.best.map(x=>{
      const key=keys.find(y=>y.name===x.name).key;
      const d=decode(cipher,key,x.offset,x.sign,lm);
      return {...x,fullScore:d.perRune,skips:d.skips,
        first40:d.plain.slice(0,40)};
    }).sort((a,b)=>b.fullScore-a.fullScore);
    console.log("FINAL",JSON.stringify({
      page:pageNumber,head:HEAD,full:cipher.length,
      checked:outcome.checked,topFull:selected.slice(0,12),
      bestHead:outcome.best[0]
    }));
  }
}
if(require.main===module)main();
