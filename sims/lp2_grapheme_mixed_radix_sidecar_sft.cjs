'use strict';
/** Original LP2 mixed-radix grapheme sidecar gate. Node.js 22+, read-only. */
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const load=p=>fs.readFileSync(path.join(root,p),'utf8');
function run(corpus,transcription,grid,lp1){
  function check(cond,msg){if(!cond)throw Error(msg);}
  const index=new Map(corpus.runes.map((x,i)=>[x,i]));
  /** @param {string} source */
  function parse(source){
    let words=[],tokens=[],part=0,start=0;
    function flush(){if(tokens.length){words.push({part:start,tokens});tokens=[];}}
    for(const ch of source){
      if(index.has(ch)){if(!tokens.length)start=part;tokens.push(index.get(ch));}
      else if(ch==="%")part++;
      else if(!"/\n\r \t".includes(ch))flush();
    }
    flush();return words;
  }
  const eq=(a,b)=>a.length===b.length&&a.every((v,i)=>v===b[i]);
  /** @param {number[]} w @param {boolean} exact */
  function alternatives(w,exact){
    const s=w.map(i=>corpus.translit[i]).join(""),out=[];
    function rec(pos,v){
      if(exact&&v.length>w.length)return;
      if(pos===s.length){if(!exact||v.length===w.length)out.push(v);return;}
      for(let i=0;i<29;i++)if(s.startsWith(corpus.translit[i],pos))rec(pos+corpus.translit[i].length,[...v,i]);
    }
    rec(0,[]);return out;
  }
  function encode(words,exact=true){
    let capacity=1n,rank=0n;const rows=[];
    for(const {tokens,part} of words){
      const a=alternatives(tokens,exact),digit=a.findIndex(v=>eq(v,tokens));
      check(digit>=0,"original absent from its own parse alternatives");
      rank=rank*BigInt(a.length)+BigInt(digit);capacity*=BigInt(a.length);
      rows.push({a,digit,part,tokens});
    }
    return {capacity,rank,rows};
  }
  function decode(rows,value){
    const tape=new Array(rows.length);
    for(let i=rows.length-1;i>=0;i--){
      const radix=BigInt(rows[i].a.length);
      tape[i]=rows[i].a[Number(value%radix)];value/=radix;
    }
    check(value===0n,"sidecar outside mixed-radix range");
    return tape;
  }
  const all=parse(transcription);
  const words=all.filter(w=>w.part<55);
  const native=all.filter(w=>w.part===56);
  const lp1clear=parse(lp1).filter(w=>[3,8,9,10,11,14].includes(w.part));
  check(eq(all.flatMap(w=>w.tokens),corpus.pages.flatMap(p=>p.indices)),"all original runes agree");
  check(words.length===2896&&words.flatMap(w=>w.tokens).length===12956,"original shape");
  check(native.length===20&&lp1clear.length===230,"native controls");
  const x=encode(words),y=encode(words,false);
  check(eq(decode(x.rows,x.rank).flat(),words.flatMap(w=>w.tokens)),"same-width rank roundtrip");
  check(eq(decode(y.rows,y.rank).flat(),words.flatMap(w=>w.tokens)),"variable-width rank roundtrip");
  const n=encode(native),l=encode(lp1clear);
  check(n.capacity===1n&&l.capacity===1n,"solved clear same-width positives");
  check(eq(decode(n.rows,n.rank).flat(),native.flatMap(w=>w.tokens)),"p57 control");
  check(eq(decode(l.rows,l.rank).flat(),lp1clear.flatMap(w=>w.tokens)),"LP1 control");
  const eoe=[words[1381],words[2889]];
  const ec=encode(eoe);
  check(ec.capacity===4n&&ec.rows[0].digit===1&&ec.rows[1].digit===0,"authentic EOE conflict");
  for(let i=0n;i<4n;i++){
    const tape=decode(ec.rows,i);
    const round=encode(tape.map((tokens,part)=>({tokens,part})));
    check(round.rank===i,"nonvacuous planted ambiguity sidecar");
  }
  const cells=grid.pages.flatMap(p=>p.tokens);
  check(cells.length===256,"table size");
  const bytes=cells.filter((_,i)=>i%8===4).map(s=>60*grid.alphabet.indexOf(s[0])+grid.alphabet.indexOf(s[1]));
  check(bytes.every(x=>x>=0&&x<=255),"base60 byte range");
  const hex=bytes.map(x=>x.toString(16).padStart(2,"0")).join("");
  const operand=BigInt("0x"+hex),mod=operand%x.capacity;
  const candidate=decode(x.rows,mod);
  const histogram={},regions={opening:[0,0],middle:[0,0],holdout:[0,0],all:[0,0]};
  for(let i=0;i<x.rows.length;i++){
    const row=x.rows[i];if(row.a.length<=1)continue;
    histogram[row.a.length]=(histogram[row.a.length]||0)+1;
    const ok=eq(candidate[i],row.tokens);
    const bins=["all"];
    if(row.part<=2)bins.push("opening");
    if(row.part>=16&&row.part<=21)bins.push("middle");
    if(row.part>=40&&row.part<=52)bins.push("holdout");
    for(const bin of bins){regions[bin][0]++;regions[bin][1]+=Number(ok);}
  }
  const output={unknownRunes:12956,words:2896,histogram,capacity:x.capacity.toString(),fixedBits:(x.capacity-1n).toString(2).length,rankHex:x.rank.toString(16),variableBits:(y.capacity-1n).toString(2).length,operandHex:hex,rawInRange:operand<x.capacity,moduloExact:mod===x.rank,regions,firstMismatch:words.findIndex((w,i)=>!eq(w.tokens,candidate[i])),nativeControlWords:native.length+lp1clear.length,nonvacuousEOEPlants:4};
  check(output.fixedBits===250&&output.variableBits===3405,"bit counts");
  check(output.regions.all[0]===204&&output.regions.all[1]===91&&output.firstMismatch===0,"original sidecar result");
  check(!output.rawInRange&&!output.moduloExact,"original nominated sidecar is not actual rank");
  return output;
}
const result=run(JSON.parse(load('resources/liber-primus/lp2-corpus.json')),load('resources/liber-primus/lp2-transcription.txt'),JSON.parse(load('resources/liber-primus/lp2-grid-256.json')),load('resources/transcriptions/lp1_wulfic_canonical.txt'));
console.log(JSON.stringify(result,null,2));
