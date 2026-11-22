'use strict';
/**
 * Liber Primus LP2 word-length crib scanner.
 * Source words use a documented approximation to the solved Parable's spelling.
 * No network, file writes or hidden dependencies. CommonJS, Node.js 18+.
 * Cross-page/line wraps do not break words. Numeric grid cells are discarded.
 * @module wordlength_crib_scan
 */
const RUNES = "ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ";
const RUNES_SET = new Set([...RUNES]);
const PAGE0 = "ᛋᚻᛖᚩᚷᛗᛡᚠ";

function runeWords(booksText) {
  return booksText.split(/[-.&$§]/).map(part=>[...part].filter(ch=>RUNES_SET.has(ch)).join("")).filter(Boolean);
}

function parseMaster(text) {
  const begin = text.indexOf(PAGE0);
  if(begin<0) throw new Error("LP2 page 0 incipit not present");
  const pages = text.slice(begin).split("%");
  if(pages.length!==59) throw new Error("Expected LP2 pages 0–57 and final section terminator");
  const lp2 = pages.slice(0,56).join("%");
  const count = [...lp2].filter(ch=>RUNES_SET.has(ch)).length;
  const words = runeWords(lp2);
  if(count!==12956 || words.length!==2896 || runeWords(pages[57]).length!==20) throw new Error("Unexpected canonical transcription: expected 12956 runes, 2896 rune-words, 20 Parable words");
  return {pages:pages.slice(0,58),cipherLengths:words.map(w=>w.length),parableLengths:runeWords(pages[57]).map(w=>w.length),runeCount:count};
}

function runeLength(word) {
  const w=word.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/K/g,"C").replace(/Z/g,"S");
  let n=0;
  for(let i=0;i<w.length;) {
    if(w.startsWith("ING",i)) i+=3;
    else if(["TH","EO","OE","AE","IA","EA","NG"].includes(w.slice(i,i+2))) i+=2;
    else i++;
    n++;
  }
  return n;
}

function englishWords(content) {
  const start=/^\*\*\* START OF THIS PROJECT GUTENBERG EBOOK[^\r\n]*\*\*\*/im.exec(content);
  const end=/^\*\*\* END OF THIS PROJECT GUTENBERG EBOOK[^\r\n]*\*\*\*/im.exec(content);
  const body=content.slice(start?start.index+start[0].length:0,end?end.index:undefined);
  return body.match(/[A-Za-z]+/g)||[];
}

function signature(lengths){return lengths.map(n=>String.fromCharCode(33+n)).join("");}

function makeIndex(targetLengths, seedLength=6) {
  if(!Number.isInteger(seedLength)||seedLength<1) throw new RangeError("seedLength must be positive");
  const seq=signature(targetLengths), locations=new Map();
  for(let i=0;i<=seq.length-seedLength;i++) {
    const segment=seq.slice(i,i+seedLength);
    if(!locations.has(segment)) locations.set(segment,[]);
    locations.get(segment).push(i);
  }
  return {seq,seedLength,locations};
}

function bestMatches(index, sourceLengths, maxErrors=2) {
  if(maxErrors<0||!Number.isInteger(maxErrors)) throw new RangeError("maxErrors must be nonnegative integer");
  const source=signature(sourceLengths), target=index.seq, seed=index.seedLength;
  let bestExact={length:0,targetStart:-1,sourceStart:-1,mismatches:0};
  let bestFuzzy={length:0,targetStart:-1,sourceStart:-1,mismatches:0};
  let seedHits=0;
  for(let j=0;j<=source.length-seed;j++) {
    const hits=index.locations.get(source.slice(j,j+seed));
    if(!hits) continue;
    for(const i of hits) {
      seedHits++;
      let exact=seed;
      while(i+exact<target.length && j+exact<source.length && target[i+exact]===source[j+exact]) exact++;
      if(exact>bestExact.length) bestExact={length:exact,targetStart:i,sourceStart:j,mismatches:0};
      // Every >=18-word span containing <=2 errors has a 6-word exact seed.
      // For each allocation of mismatch budget left/right, extend to the boundary.
      const left=Array(maxErrors+1).fill(0);
      const right=Array(maxErrors+1).fill(seed);
      let mistakes=0;
      for(let d=1;i-d>=0&&j-d>=0;d++) {
        if(target[i-d]!==source[j-d]) mistakes++;
        if(mistakes>maxErrors) break;
        left[mistakes]=d;
      }
      mistakes=0;
      for(let d=seed;i+d<target.length&&j+d<source.length;d++) {
        if(target[i+d]!==source[j+d]) mistakes++;
        if(mistakes>maxErrors) break;
        right[mistakes]=d+1;
      }
      for(let allowedLeft=0;allowedLeft<=maxErrors;allowedLeft++) {
        const L=Math.max(...left.slice(0,allowedLeft+1));
        const R=Math.max(...right.slice(0,maxErrors-allowedLeft+1));
        if(L+R>bestFuzzy.length) {
          const beginI=i-L,beginJ=j-L,len=L+R;
          let nErrors=0; for(let z=0;z<len;z++) nErrors+=target[beginI+z]!==source[beginJ+z];
          bestFuzzy={length:len,targetStart:beginI,sourceStart:beginJ,mismatches:nErrors};
        }
      }
    }
  }
  return {seedHits,bestExact,bestFuzzy};
}

function scanText(index, englishText) {
  const words=englishWords(englishText), lengths=words.map(runeLength), r=bestMatches(index,lengths);
  return {sourceWords:words.length,seedHits:r.seedHits,
    exact:{...r.bestExact,text:r.bestExact.sourceStart>=0?words.slice(r.bestExact.sourceStart,r.bestExact.sourceStart+r.bestExact.length).join(" "):""},
    fuzzy:{...r.bestFuzzy,text:r.bestFuzzy.sourceStart>=0?words.slice(r.bestFuzzy.sourceStart,r.bestFuzzy.sourceStart+r.bestFuzzy.length).join(" "):""}};
}

module.exports = { runeWords,parseMaster,runeLength,englishWords,signature,makeIndex,bestMatches,scanText };
