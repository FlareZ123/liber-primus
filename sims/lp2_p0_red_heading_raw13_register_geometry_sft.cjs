"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,".."),read=f=>fs.readFileSync(path.join(root,f),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink=JSON.parse(read("resources/liber-primus/lp2-p0-physical-ink-override.json"));
const {encodeSourceNativeGP}=require("./lp2_native_gp_source_orthography_sft.cjs");
function phi(n){let v=n,x=n;for(let p=2;p*p<=x;p++){if(x%p)continue;while(x%p===0)x/=p;v-=v/p}if(x>1)v-=v/x;return v}
const mod=n=>(n%29+29)%29,tr=n=>corpus.translit[n];
const grid=corpus.pages.filter(p=>p.page<=2).flatMap(p=>p.indices);assert.equal(grid.length,729);
const words=ink.physical_zero_based.red_words;assert.deepEqual(words.map(w=>w.length),[8,5]);
assert.deepEqual(words.flatMap(w=>w.gp_indices),grid.slice(0,13));
const mark=ink.physical_zero_based.large_punctuation[0];assert.deepEqual([mark.after_runes,mark.dots],[13,13]);
const at=([r,c])=>grid[(r-1)*27+c-1],anchor=[13,phi(13)];assert.deepEqual(anchor,[13,12]);assert.equal(tr(at(anchor)),"J");

const chains=[];for(const rs of[-1,1])for(const cs of[-1,1]){const m=[13+5*rs,12+5*cs],e=[13+10*rs,12+10*cs];if([...m,...e].every(x=>x>=1&&x<=27)&&at(m)>0&&phi(at(m))===at(e))chains.push({m,e})}
assert.deepEqual(chains,[{m:[18,17],e:[23,22]}]);
const secondKey=[at(anchor),phi(at(chains[0].m)),at(chains[0].e)];assert.deepEqual(secondKey.map(tr),["J","TH","TH"]);
const secondPlain=words[1].gp_indices.map((v,i)=>mod(v-secondKey[i%3]));assert.equal(secondPlain.map(tr).join(""),"RATIO");
assert.deepEqual(secondPlain.map((v,i)=>mod(v+secondKey[i%3])),words[1].gp_indices);

const markerColumns=[4,5,4];assert.deepEqual([markerColumns[0]+markerColumns[2],markerColumns[1]],[8,5]);
const d2=([r,c])=>(r-13)**2+(c-12)**2,rects=[];
for(let t=1;t<=27;t++)for(let b=t+1;b<=27;b++)for(let l=1;l<=27;l++)for(let r=l+1;r<=27;r++){
 const h=b-t,w=r-l;if(h!==3*w&&w!==3*h)continue;const pts=[[t,l],[t,r],[b,r],[b,l]],vals=pts.map(at),ds=pts.map(d2);
 for(const diag of[[0,2],[1,3]]){const[a,z]=diag;if(vals[a]===vals[z]&&ds[a]===ds[z])rects.push({t,b,l,r,vals,diag})}
}
assert.equal(rects.length,9);
assert.deepEqual(rects.map(x=>[x.t,x.b,x.l,x.r,...x.vals.map(tr)]),[
 [2,3,7,10,"U","G","P","G"],[3,27,14,22,"U","B","IA","B"],[5,17,16,20,"P","Y","P","S"],
 [6,8,7,13,"M","N","A","N"],[6,24,3,9,"X","N","X","C"],[7,25,18,24,"AE","W","C","W"],
 [8,12,7,19,"N","X","N","EA"],[9,14,5,20,"G","H","G","OE"],[21,23,6,12,"B","W","B","L"]]);

const orders=[[0,1,2,3],[0,3,2,1],[1,2,3,0],[1,0,3,2],[2,3,0,1],[2,1,0,3],[3,0,1,2],[3,2,1,0]],decodes=[];
for(let ri=0;ri<rects.length;ri++)for(const order of orders)for(const reverse of[false,true])for(const sign of[-1,1]){
 const key=order.map(i=>rects[ri].vals[i]),ct=reverse?[...words[0].gp_indices].reverse():words[0].gp_indices;
 const plain=ct.map((v,i)=>mod(v+sign*key[i%4]));decodes.push({ri,key,reverse,sign,plain,text:plain.map(tr).join("")})
}
assert.equal(decodes.length,288);assert.equal(new Set(decodes.map(x=>x.text)).size,144);
const fullTarget=13*phi(13),secondSum=secondPlain.reduce((a,b)=>a+b,0),firstTarget=fullTarget-secondSum;
assert.deepEqual([fullTarget,secondSum,firstTarget],[156,57,99]);
const sumHits=decodes.filter(x=>x.plain.reduce((a,b)=>a+b,0)===firstTarget);assert.equal(sumHits.length,8);
assert.deepEqual([...new Set(sumHits.map(x=>x.ri))],[4]);assert.ok(sumHits.every(x=>x.sign===-1));
const wordHits=decodes.filter(x=>x.text==="SECUENDI");assert.equal(wordHits.length,2);
assert.ok(wordHits.every(x=>x.ri===4&&x.reverse&&x.sign===-1&&x.key.map(tr).join("-")==="X-N-X-C"));
const firstPlain=wordHits[0].plain;assert.deepEqual(firstPlain.map((v,i)=>mod(v+wordHits[0].key[i%4])),[...words[0].gp_indices].reverse());
const raw=[...firstPlain,...secondPlain];assert.equal(raw.map(tr).join(" "),"S E C U E N D I R A T I O");assert.equal(raw.reduce((a,b)=>a+b,0),156);

const sourceNative=encodeSourceNativeGP("SEQUENDI RATIO");assert.equal(sourceNative.length,12);
assert.equal(sourceNative.map(tr).join(" "),"S E C W E N D I R A T IA");assert.notDeepEqual(sourceNative,raw);
const aliases=new Map([["Q","C"],["K","C"],["V","U"],["Z","S"]]);
const directLatin="SEQUENDI RATIO".replace(/[^A-Z]/g,"").split("").map(ch=>{const i=corpus.translit.indexOf(aliases.get(ch)||ch);assert.ok(i>=0);return i});
assert.deepEqual(directLatin,raw);

console.log(JSON.stringify({status:"intermediate raw-title geometry and Latin-register hypothesis",fiveRuneOutput:secondPlain.map(tr),rectangleCandidates:rects.length,configurations:decodes.length,distinctOutputs:new Set(decodes.map(x=>x.text)).size,checksumHits:sumHits.length,checksumRectangle:rects[4].vals.map(tr),sequendiHits:wordHits.length,rawTitle:raw.map(tr),sourceNativePhrase:sourceNative.map(tr),directLatinPhrase:directLatin.map(tr),caveat:"RATIO->3:1, checksum use, and direct-Latin register remain inferred"},null,2));
