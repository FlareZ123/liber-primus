"use strict";
/** Source-fixed 29-GP adaptation of the historical dual-wheel Chaocipher.
 * Two independent *straight/mirror* visual-key wheel settings, nadir 13/14,
 * and original page/section/book clocks. No hidden initial alphabets fitted.
 * Run from the repository root with Node.js 22:
 *   node sims/chaocipher_scroll_fixed_alphabet_inverse.cjs
 * Chaocipher algorithm regression: Moshe Rubin, "Chaocipher Revealed"
 * https://www.chaocipher.com/ActualChaocipher/Chaocipher-Revealed-Algorithm.pdf
 */
const fs=require("node:fs");
const path=require("node:path");
function analyze(data,reference) {
  const assert=(ok,message)=>{if(!ok)throw Error(message);};
  const alpha=data.translit,field=alpha.length,lookup=new Map(alpha.map((x,i)=>[x,i]));
  assert(field===29,"Original GP alphabet size");
  function rotate(array,index){return array.slice(index).concat(array.slice(0,index));}
  /** @param {Array<number|string>} input @param {Array<number|string>} L @param {Array<number|string>} R @param {number} nadir @param {boolean} encrypt */
  function chaocipher(input,L,R,nadir,encrypt){
    let left=L.slice(),right=R.slice();const out=[];
    for(const symbol of input){
      const index=encrypt?right.indexOf(symbol):left.indexOf(symbol);
      assert(index>=0,"Invalid input symbol");
      out.push(encrypt?left[index]:right[index]);
      left=rotate(left,index);
      let moving=left.splice(1,1)[0];left.splice(nadir,0,moving);
      right=rotate(right,index+1);
      moving=right.splice(2,1)[0];right.splice(nadir,0,moving);
    }
    return out;
  }
  const refLeft=[..."HXUCZVAMDSLKPEFJRIGTWOBNYQ"];
  const refRight=[..."PTLNBQDEOYSFAVZKGJRIHWXUMC"];
  const knownPT=[..."WELLDONEISBETTERTHANWELLSAID"];
  const knownCT=[..."OAHQHCNYNXTSZJRRHJBYHQKSOUJY"];
  assert(chaocipher(knownPT,refLeft,refRight,13,true).join("")===knownCT.join(""),"Published 26-letter known cipher");
  assert(chaocipher(knownCT,refLeft,refRight,13,false).join("")===knownPT.join(""),"Published 26-letter inverse");

  const tokens=[...alpha,"ING"].sort((a,b)=>b.length-a.length);
  function encode(referenceText){
    let t=referenceText.toUpperCase().replace(/K/g,"C").replace(/V/g,"U").replace(/Z/g,"S").replace(/QU/g,"CW"),result=[];
    for(let i=0;i<t.length;){
      if(t[i]<"A"||t[i]>"Z"){i++;continue;}
      let found=false;
      for(const word of tokens)if(t.startsWith(word,i)){
        result.push(word==="ING"?21:lookup.get(word));
        i+=word.length;found=true;break;
      }
      if(!found)i++;
    }
    return result;
  }
  const english=encode(reference),trigrams=new Map(),bigrams=new Map();
  assert(english.length>20000,"GP reference length");
  for(let i=2;i<english.length;i++){
    const ab=english[i-2]*field+english[i-1],abc=ab*field+english[i];
    trigrams.set(abc,(trigrams.get(abc)||0)+1);
    bigrams.set(ab,(bigrams.get(ab)||0)+1);
  }
  function score(input){
    let sum=0;
    for(let i=2;i<input.length;i++){
      const ab=input[i-2]*field+input[i-1],abc=ab*field+input[i];
      sum+=Math.log(((trigrams.get(abc)||0)+0.1)/((bigrams.get(ab)||0)+field*0.1));
    }
    return sum/(input.length-2);
  }
  const pages=data.pages.filter(p=>p.page<=55),cipher=pages.flatMap(p=>p.indices);
  assert(cipher.length===12956 && pages.length===56,"Complete LP2 original unsolved corpus");
  const sectionSizes=[729,1145,1729,1903,1021,1524,1589,3316];
  const sections=[];let cursor=0;
  for(const n of sectionSizes){sections.push(cipher.slice(cursor,cursor+n));cursor+=n;}
  assert(cursor===cipher.length && sections.length===8,"Original physical sections");
  const straight=Array.from({length:29},(_,i)=>i),reverse=straight.slice().reverse();
  const orientations=[["original",straight],["mirrored",reverse]],clocks=[["whole book",[cipher]],["8 source sections",sections],["physical pages",pages.map(p=>p.indices)]];
  const candidates=[];
  for(const [leftName,left] of orientations)for(const [rightName,right] of orientations){
    for(const nadir of [13,14])for(const [clockName,regions] of clocks){
      const recovered=regions.flatMap(region=>chaocipher(region,left,right,nadir,false));
      assert(recovered.length===cipher.length,"Source length invariant");
      candidates.push({left:leftName,right:rightName,nadir,clock:clockName,score:score(recovered),head:recovered.slice(0,80).map(x=>alpha[x]).join("")});
    }
  }
  candidates.sort((a,b)=>b.score-a.score);
  const control=english.slice(20000,20729),planted=chaocipher(control,reverse,straight,14,true),recovered=chaocipher(planted,reverse,straight,14,false);
  assert(control.length===729 && recovered.every((x,i)=>x===control[i]),"729/729 native GP source plant");
  assert(candidates.length===24 && Math.abs(candidates[0].score-(-4.7969530776358535))<1e-10,"Original score check");
  return {sourceCiphertextRunes:cipher.length,sourcePhysicalPages:pages.length,sourceSections:sectionSizes.length,
    model:"29-symbol straight/mirrored GP dual alphabet, nadir=13/14, 3 source clocks",settings:candidates.length,
    known26Vector:"WELLDONEISBETTERTHANWELLSAID → OAHQHCNYNXTSZJRRHJBYHQKSOUJY",
    nativeGP729Control:{exact:recovered.filter((x,i)=>x===control[i]).length,referenceScore:score(control),encryptedScore:score(planted)},
    originalRawScore:score(cipher),originalBest:candidates[0],nextCandidates:candidates.slice(1,5)};
}
const root=path.resolve(__dirname,"..");
const data=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const reference=fs.readFileSync(path.join(root,"resources/control/emerson_essays_2944.txt"),"utf8");
console.log(JSON.stringify(analyze(data,reference),null,2));
