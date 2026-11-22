"use strict";
/**
 * Source-key ciphertext-only dictionary attack on complete original LP2 p36
 * numbered item1 (139 GP29 runes, 30 authentic printed words).
 *
 * The creator demonstrably used DATA/560.13 file-offset crypto in Cicada
 * 2013. This source test asks whether any original byte start in its entire
 * 118,818,811-byte file is a consecutive GP29 additive pad, WITHOUT assuming
 * a hypothetical LP2 plaintext title. Try source forward/backward, mod29 or
 * balanced29 and either additive direction, plus any unknown global Caesar
 * intercept. All secret offsets and intercepts are covered exactly.
 *
 * Search 30 original word-length slots. An 8-GP-rune word at offset7 is a
 * tight first discriminator: its 7 predecessor differences do not depend
 * on the secret global Caesar intercept. Build exact GP-native 8-word
 * difference signatures from three pinned historical English references;
 * match source starts by signature. Every full signature hit is decoded as
 * all 139 original runes at its inferred Caesar intercept and checked
 * against the entire dictionary, in unchanged original word order.
 *
 * Synthetic source-native 139-rune plants validate all 8 key-readings,
 * including original 30-word segmentation and true source-offset recovery.
 * Node.js22 CommonJS, read-only. Results are conditional on actual plaintext
 * being adequately represented in the specified English register.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const {encodeWords}=require("./lp2_difference_allletter_capacity_sft.cjs");
const ROOT=path.join(__dirname,"..");
/** @param {string} rel @returns {string} */
const read=rel=>fs.readFileSync(path.join(ROOT,rel),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const lines=read("resources/liber-primus/lp2-transcription.txt");
const c36=corpus.pages.find(x=>x.page===36).indices;
const original=c36.slice(99);
const script=lines.split(/\n%\n/)[36];
const numbered=script.slice(script.indexOf("\n1-")+3).replace(/[\/\n]/g,"");
const originalWords=numbered.split(/[-.]/).filter(Boolean);
const mapping=new Map(corpus.runes.map((r,i)=>[r,i]));
/** @param {string} s @returns {number[]} */
const gp=s=>Array.from(s).map(c=>mapping.get(c));
const lengths=originalWords.map(w=>w.length);
const flatWords=originalWords.flatMap(gp);
const starts=lengths.map((_,i)=>lengths.slice(0,i).reduce((s,n)=>s+n,0));
const longWord=2,longStart=starts[longWord],longLength=lengths[longWord];
const mod=n=>(n%29+29)%29;
assert.equal(original.length,139);
assert.equal(originalWords.length,30);
assert.equal(lengths.reduce((a,b)=>a+b,0),139);
assert.equal(longStart,7);assert.equal(longLength,8);
assert.deepEqual(flatWords,original);
const referencePaths=[
 "resources/control/gibran_prophet_58585.txt",
 "resources/control/emerson_essays_2944.txt",
 "resources/control/shakespeare_first300k.txt"
];
const allReferenceWords=referencePaths.flatMap(s=>encodeWords(read(s)));
/** @param {number[]} v @returns {number} */
function pack(v) {
 let key=0;
 for(const x of v)key=key*29+x;
 return key;
}
/** @param {number[]} v @returns {number} */
function differenceKey(v){
 const d=[];
 for(let i=1;i<v.length;i++)d.push(mod(v[i]-v[i-1]));
 return pack(d);
}
const wordsByLength=new Map();
for(const w of allReferenceWords){
 if(!w.length||w.length>20)continue;
 let lex=wordsByLength.get(w.length);
 if(!lex){lex=new Map();wordsByLength.set(w.length,lex);}
 lex.set(pack(w),w);
}
const signatures=new Map();
const prefixes3=new Set(),prefixes4=new Set();
for(const word of wordsByLength.get(8).values()){
 const diffs=[];
 for(let j=1;j<8;j++)diffs.push(mod(word[j]-word[j-1]));
 prefixes3.add(pack(diffs.slice(0,3)));
 prefixes4.add(pack(diffs.slice(0,4)));
 const key=pack(diffs);
 let list=signatures.get(key);
 if(!list){list=[];signatures.set(key,list);}
 list.push(word);
}
/**
 * @param {Buffer} data
 * @param {Uint8Array} lut
 * @param {1|-1} direction
 * @param {1|-1} sign
 * @returns {object}
 */
function scan(data,lut,direction,sign){
 const first=direction===1?0:138;
 const last=direction===1?data.length-139:data.length-1;
 let maxWords=0,maxRuneCoverage=0,matchedSignatures=0,
     passedThree=0,passedFour=0;
 const top=[];
 for(let source=first;source<=last;source++){
   let key=0,past=lut[data[source+direction*longStart]];
   let j=1;
   for(;j<=7;j++){
     const curr=lut[data[source+direction*(longStart+j)]];
     const difference=mod(original[longStart+j]-original[longStart+j-1]
         +sign*(curr-past));
     key=key*29+difference;
     past=curr;
     if(j===3&&!prefixes3.has(key))break;
     if(j===4&&!prefixes4.has(key))break;
   }
   if(j<=3)continue;
   passedThree++;
   if(j<=4)continue;
   passedFour++;
   if(j!==8)continue;
   const matches=signatures.get(key);
   if(!matches)continue;
   matchedSignatures++;
   const kFirst=lut[data[source+direction*longStart]];
   const clearFirst=mod(original[longStart]+sign*kFirst);
   for(const word of matches){
     const bias=mod(word[0]-clearFirst);
     const candidate=new Array(139);
     for(let i=0;i<139;i++)
       candidate[i]=mod(original[i]+sign*lut[data[source+direction*i]]+bias);
     const text=[], hits=[];
     let good=0,covered=0;
     for(let w=0;w<lengths.length;w++){
       const arr=candidate.slice(starts[w],starts[w]+lengths[w]);
       const inNative=wordsByLength.get(arr.length)?.has(pack(arr))??false;
       if(inNative){good++;covered+=arr.length;}
       text.push(arr.map(x=>corpus.translit[x]).join(""));
       if(inNative)hits.push(w);
     }
     if(good>maxWords)maxWords=good;
     if(covered>maxRuneCoverage)maxRuneCoverage=covered;
     top.push({sourceOffset:source,sign,bias,
       matchedOriginalWords:good,matchedOriginalRunes:covered,
       positionsOfNativeWords:hits,
       plaintext:text.join(" ")});
     top.sort((a,b)=>b.matchedOriginalWords-a.matchedOriginalWords||
       b.matchedOriginalRunes-a.matchedOriginalRunes);
     if(top.length>25)top.length=25;
   }
 }
 return{sourceStartsTested:Math.max(0,last-first+1),
   passedThree,passedFour,matchedSignatures,
   maxWords,maxRuneCoverage,top};
}
/** @returns {Buffer} */
function sourcePlant(){
 let x=0x33011399;
 const b=Buffer.alloc(650);
 for(let i=0;i<b.length;i++){
  x^=x<<13;x^=x>>>17;x^=x<<5;
  b[i]=x&255;
 }
 return b;
}
/** Construct arbitrary source-native GP plain with ALL 30 original lengths.
 * @returns {number[]} */
function nativePlantPlaintext(){
 return lengths.flatMap((len,i)=>{
   const candidates=[...wordsByLength.get(len).values()];
   assert.ok(candidates.length,"native reference has no word length "+len);
   return candidates[(i*37+19)%candidates.length];
 });
}
/** @returns {object[]} */
function positiveControls(){
 const sourceData=sourcePlant(),p=nativePlantPlaintext(),result=[];
 assert.equal(p.length,139);
 for(const name of ["byte_mod29","byte_balanced29"])
 for(const direction of [1,-1])
 for(const sign of [1,-1]){
   const lut=Uint8Array.from({length:256},(_,i)=>name==="byte_mod29"?
     i%29:Math.floor(i*29/256));
   const source=direction===1?40:550,bias=13;
   const ciphertext=p.map((x,i)=>mod(x-sign*
     lut[sourceData[source+direction*i]]-bias));
   const old=original.slice();
   for(let i=0;i<original.length;i++)original[i]=ciphertext[i];
   const found=scan(sourceData,lut,direction,sign).top.find(c=>
      c.sourceOffset===source&&c.bias===bias&&
      c.matchedOriginalWords===30&&c.matchedOriginalRunes===139);
   for(let i=0;i<original.length;i++)original[i]=old[i];
   assert.ok(found,"failed native GP source key plant "+name+"/"+direction+"/"+sign);
   assert.equal(found.plaintext,p.reduce((s,x,i)=>
     s+(i&&starts.includes(i)?" ":"")+corpus.translit[x],""));
   result.push({projection:name,direction,sign,originalWords:30,
      exactRunes:139,sourceOffset:source,secretBias:bias});
 }
 return result;
}
function main(){
 const positives=positiveControls(),file=process.env.CICADA_ISO_56013_PATH;
 assert.ok(file,"Set CICADA_ISO_56013_PATH to genuine 2013 DATA/560.13");
 const data=fs.readFileSync(file);
 assert.equal(data.length,118818811);
 const sha256=crypto.createHash("sha256").update(data).digest("hex");
 assert.equal(sha256,
   "db79072ce580efa54acf5f31f3ef0eb00aef867871a051d04e27ee5e7fbc112f");
 const findings=[];
 for(const projection of ["byte_mod29","byte_balanced29"])
 for(const direction of [1,-1])
 for(const sign of [1,-1]){
   const lut=Uint8Array.from({length:256},(_,i)=>projection==="byte_mod29"?
     i%29:Math.floor(i*29/256));
   const out=scan(data,lut,direction,sign);
   findings.push({projection,direction,sign,...out});
   console.log(JSON.stringify({projection,direction,sign,
     candidates:out.matchedSignatures,
     bestNativeWords:out.maxWords,bestNativeRunes:out.maxRuneCoverage}));
 }
 const best=findings.flatMap(x=>x.top.map(y=>({
    projection:x.projection,direction:x.direction,...y
   }))).sort((a,b)=>b.matchedOriginalWords-a.matchedOriginalWords||
      b.matchedOriginalRunes-a.matchedOriginalRunes).slice(0,30);
 const result={source:{file:"2013 CicadaOS DATA/560.13",bytes:data.length,sha256},
    original:{page:36,firstNumberedUnitRunes:139,originalWords:30,
      originalWordLengths:lengths,
      independentCrib:"English eight-GP-rune word at original offset7"},
    nativeDictionary:{sources:referencePaths,
      uniqueEightRuneWords:wordsByLength.get(8).size,
      differentEightRuneSignatures:signatures.size,
      threeDifferencePrefixes:prefixes3.size,
      fourDifferencePrefixes:prefixes4.size},
    fullOriginalScan:findings.map(x=>({...x,top:x.top.slice(0,3)})),
    bestCandidates:best,
    positives,
    decision:best.some(x=>x.matchedOriginalWords>=18)
      ?"Potential source-key plaintext; independently validate actual full first numbered passage"
      :"No strongly lexical GP-English p36 first-numbered passage under full original 2013 source byte pad"
 };
 console.log(JSON.stringify(result,null,2));
 return result;
}
if(require.main===module)main();
module.exports={main,scan,positiveControls};
