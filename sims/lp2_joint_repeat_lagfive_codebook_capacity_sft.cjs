"use strict";
/** Joint GP29 anti-repeat/lag-five codebook bound. Read-only original-input SFT, Node 22. */
const fs=require("node:fs"),path=require("node:path");
function analyze(gp,raw,ink,typography){
  const check=(ok,msg)=>{if(!ok)throw Error(msg)};
  const q=29, pages=gp.pages.filter(p=>p.page<=55&&p.indices.length),N=pages.reduce((s,p)=>s+p.indices.length,0);
  const runeMap=new Map(gp.runes.map((s,i)=>[s,i])), pageTexts=raw.split("%").slice(0,55);
  const wordList=[];let current=[];const endWord=()=>{if(current.length){wordList.push(current);current=[]}};
  for(let j=0;j<pageTexts.length;j++)for(const c of pageTexts[j]){if(runeMap.has(c))current.push({v:runeMap.get(c),page:j});else if(c!=="/"&&!/\s/u.test(c))endWord()}
  endWord();const flat=wordList.flat();check(N===12956&&flat.length===N&&wordList.length===2896,"source counts");
  check(flat.map(x=>x.v).join(",")===pages.flatMap(p=>p.indices).join(","),"source rune tape");
  let E5=0,E55=0,L=0,P=0;for(const w of wordList)for(let j=5;j<w.length;j++){L++;const echo=w[j].v===w[j-5].v;E5+=Number(echo);if(j>=6){P++;E55+=Number(echo&&w[j-1].v===w[j-6].v)}}
  check(L===2105&&E5===104&&E55===9,"source echo counts");
  /** @param {number[]} a */
  const canon=a=>{const m=new Map();return a.map(v=>{if(!m.has(v))m.set(v,m.size);return m.get(v)}).join("")};
  /** Exact weighted word count, quotienting by the equality patterns of the last five runes. */
  function partition(n,skip,q,ax,ay,bx,by,cx,cy){
    let s=new Map([["0:0",BigInt(q)]]);
    for(let i=1;i<n;i++){const t=new Map();for(const [k,v] of s){const [seq,oldHit]=k.split(":"),a=[...seq].map(Number),d=1+Math.max(...a);for(let j=0;j<=d&&j<q;j++){const eq=j===a.at(-1),echo=i>=5&&j===a[0],pair=i>=6&&echo&&oldHit==="1",m=j===d?q-d:1;const dest=canon([...a,j].slice(-5))+":"+Number(echo);let factor=BigInt(m);if(!(skip&(1<<i)))factor*=eq?ax:ay;if(i>=5)factor*=echo?bx:by;if(i>=6)factor*=pair?cx:cy;t.set(dest,(t.get(dest)||0n)+v*factor)}}s=t}
    return [...s.values()].reduce((a,b)=>a+b,0n);
  }
  /** @param {number} n @param {number} k */
  function choose(n,k){if(k<0||k>n)return 0n;k=Math.min(k,n-k);let v=1n;for(let i=1;i<=k;i++)v=v*BigInt(n-k+i)/BigInt(i);return v}
  const pow=(x,y)=>x**BigInt(y);
  const log2=x=>{const h=x.toString(2);return h.length-1+Math.log2(Number("0b"+h.slice(0,53))/2**(Math.min(53,h.length)-1))};
  const weights=[3n,16n,21n,16n,51n,16n];let brute=0n;for(let x=0;x<3**7;x++){let v=x;const w=[];for(let i=0;i<7;i++){w.push(v%3);v=Math.floor(v/3)}let weight=1n;for(let i=1;i<7;i++){if(i!==3)weight*=w[i]===w[i-1]?3n:16n;if(i>=5)weight*=w[i]===w[i-5]?21n:16n;if(i>=6)weight*=w[i]===w[i-5]&&w[i-1]===w[i-6]?51n:16n}brute+=weight}check(brute===partition(7,1<<3,3,...weights),"toy enumeration");
  const full=pow(29n,N);
  let side=1n,redTotal=0,redCount=0,markCount=0,apostrophes=0;
  const wordBreaks=new Set(["-",".","⁘","⁚","⁜","⁕"]);
  for(let i=0;i<pageTexts.length;i++){
    const p=pages[i],annotation=ink.pages.find(x=>x.page===p.page),red=annotation?.red_spans||[],marks=annotation?.large_punctuation||[];
    const redN=red.reduce((s,x)=>s+x.length,0),slots=new Set([0]);let pos=0;
    for(const c of pageTexts[i]){if(runeMap.has(c))pos++;else if(wordBreaks.has(c))slots.add(pos)}slots.add(pos);
    check(pos===p.indices.length,"page count");
    side*=choose(pos-redN+red.length,red.length)*choose(slots.size+marks.length-1,marks.length);
    for(const a of typography.source_visible_apostrophes.filter(x=>x.page===p.page)){side*=BigInt(pos+1);apostrophes++}
    redTotal+=redN;redCount+=red.length;markCount+=marks.length;
  }
  check(redTotal===213&&redCount===16&&markCount===31&&apostrophes===4,"markup count");
  side*=choose(31,3)*31n;const extra=side*pow(2n,redCount);
  const out=[];
  for(const continuous of [false,true]){
    const A=continuous?N-1:N-pages.length;let E1=0,B=0;const groups=new Map();
    for(let i=1;i<N;i++)if((continuous||flat[i].page===flat[i-1].page)&&flat[i].v===flat[i-1].v)E1++;
    for(let i=0;i<wordList.length;i++){const w=wordList[i];let skip=0;if(i>0&&(continuous||wordList[i-1].at(-1).page===w[0].page))B++;
      for(let j=1;j<w.length;j++)if(!continuous&&w[j].page!==w[j-1].page)skip|=1<<j;
      const key=w.length+":"+skip;groups.set(key,(groups.get(key)||0)+1);
    }
    check(E1===86&&B===(continuous?2895:2873),"source adjacencies");
    function bound(ax,ay,bx,by,cx,cy){let wordNumerator=29n;for(const [k,count] of groups){const [n,skip]=k.split(":").map(Number);const v=partition(n,skip,29,ax,ay,bx,by,cx,cy);check(v%29n===0n,"symbol symmetry");wordNumerator*=pow(v/29n,count)}
      const cross=ax+28n*ay,free=wordList.length-1-B;
      const Z=wordNumerator*pow(cross,B)*pow(29n,free);
      const minimum=pow(ax,E1)*pow(ay,A-E1)*pow(bx,E5)*pow(by,L-E5)*pow(cx,E55)*pow(cy,P-E55);
      const mode=Number(BigInt(B+1)*ax/cross);
      const maxNumerator=choose(B,mode)*pow(ax,mode)*pow(28n*ay,B-mode);
      let num=wordNumerator*pow(29n,free)*maxNumerator*ay,den=minimum*(ay-ax);
      // Six-rune words with no physical page cut have precisely one possible
      // lag-five echo and no successive-echo pair. Condition on which of them
      // have zero adjacent repeats. At least M-E1 must be in that subset on
      // every admissible tape; other words can be granted completely freely.
      // Their tilted echo count is binomial, and its maximum point mass
      // cannot increase with additional independent Bernoulli trials.
      const sixCount=groups.get("6:0")||0, minSix=Math.max(0,sixCount-E1);
      let echoRefinementBits=0;
      if(bx>by&&minSix>0){
        const same=pow(28n,5)-28n,other=29n*pow(28n,5)-same;
        const yes=same*bx,no=other*by,total=yes+no;
        const m=Number(BigInt(minSix+1)*yes/total);
        const peak=choose(minSix,m)*pow(yes,m)*pow(no,minSix-m);
        const refineNum=peak*bx,refineDen=pow(total,minSix)*(bx-by);
        if(refineNum<refineDen){
          num*=refineNum;den*=refineDen;
          echoRefinementBits=log2(refineDen)-log2(refineNum);
        }
      }
      const baseLoss=log2(full*minimum)-log2(Z),improvedLoss=log2(full*den)-log2(num);
      let missing=0;while(num*extra*pow(2n,missing)<full*den)missing++;
      return {baseLoss,improvedLoss,mode,minSix,echoRefinementBits,ordinaryChannelExcluded:num*side<full*den,extraChannelExcluded:num*extra<full*den,minFurtherBinaryBitsBeyondExtra:missing};
    }
    const bounds=[[3n,16n,1n,1n,1n,1n],[3n,16n,3n,2n,1n,1n],weights].map(w=>bound(...w));
    out.push({continuous,A,E1,B,groups:groups.size,bounds});
  }
  check(out.every(x=>x.bounds[2].extraChannelExcluded),"joint exact bound in both framing modes");
  return {N,L,E5,P,E55,words:wordList.length,redTotal,redCount,markCount,apostrophes,sideBits:log2(side),extraSideBits:log2(extra),results:out,exactToyControl:true};
}
const root=path.join(__dirname,"..","resources","liber-primus");
const read=name=>fs.readFileSync(path.join(root,name),"utf8");
console.log(JSON.stringify(analyze(JSON.parse(read("lp2-corpus.json")),read("lp2-transcription.txt"),JSON.parse(read("lp2-ink-annotations.json")),JSON.parse(read("lp2-quote-punctuation-spans.json"))),null,2));
