'use strict';

/**
 * One frozen Cicada-authored 2013 three-prime -> Blum-Blum-Shub hypothesis.
 * Windows Node22 read-only original LP2 SFT, all supplied primary inputs local.
 * BBS is an exploratory *hypothesis*: no signed message selects BBS for LP2.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const triple = [1031,1229,1259];
const [p,seed,q] = triple;
const modulus = p*q;
const x0 = seed*seed % modulus;
const LABELS = ['F','U','TH','O','R','C','G','W','H','N','I','J','EO','P','X','S','T','B','E','M','L','NG','OE','D','A','AE','Y','IA','EA'];

function isPrime(v) {
  for (let d=2;d*d<=v;d++) if(v%d===0) return false;
  return v>=2;
}

function stateStream(count, emitNext) {
  let x=x0;
  const out=[];
  for(let i=0;i<count;i++){
    if(emitNext)x=x*x%modulus;
    out.push(x);
    if(!emitNext)x=x*x%modulus;
  }
  return out;
}

function makeKey(count, mode, emitNext) {
  if(mode==='residue') return stateStream(count,emitNext).map(x=>x%29);
  const values=[],buffer=[],states=stateStream(Math.ceil(count*5*32/29)+60,emitNext);
  for(const x of states){
    buffer.push(x&1);
    if(buffer.length===5){
      const d=buffer.reduce((v,b)=>(v<<1)|b,0);
      if(d<29)values.push(d);
      buffer.length=0;
      if(values.length===count)return values;
    }
  }
  assert.fail('BBS bitstream did not provide enough five-bit digits');
}

function asBytes(states, mostSignificantBitFirst) {
  assert.equal(states.length%8,0);
  const bytes=[];
  for(let i=0;i<states.length;i+=8){
    let value=0;
    for(let bit=0;bit<8;bit++){
      const offset=mostSignificantBitFirst?7-bit:bit;
      value|=(states[i+bit]&1)<<offset;
    }
    bytes.push(value);
  }
  return bytes;
}

function ioc(values) {
  const counts=Array(29).fill(0);
  for(const x of values)counts[x]++;
  return counts.reduce((s,c)=>s+c*(c-1),0)/(values.length*(values.length-1));
}

/**
 * All-state exact original plaintext-F-transparent inverse.
 * Return first original position at which *every* allowed key clock dies.
 */
function firstImpossible(cipher,key,sign){
  let clocks=new Set([0]);
  for(let i=0;i<cipher.length;i++){
    const next=new Set();
    for(const j of clocks){
      const rune=(cipher[i]+sign*key[j]+29)%29;
      if(rune!==0)next.add(j+1);
      if(cipher[i]===0)next.add(j);
    }
    clocks=next;
    if(clocks.size===0)return i;
  }
  return null;
}

function encryptPlant(plain,key,sign){
  let j=0;
  return plain.map(rune=>rune===0?0:(rune-sign*key[j++]+29)%29);
}

function countPrintable(bytes){
  return bytes.filter(c=>c>=32&&c<=126).length;
}

function main(){
  assert.equal(p*seed*q,1595277641,'Original 2013 parable numeric field');
  assert.ok(triple.every(isPrime),'Source factors must each be prime');
  assert.equal(p%4,3);
  assert.equal(q%4,3);
  assert.equal(seed%4,1);
  assert.ok(modulus<Math.sqrt(Number.MAX_SAFE_INTEGER),'Sufficient exact Number square precision');
  const root=path.join(__dirname,'..');
  const corpus=JSON.parse(fs.readFileSync(path.join(root,'resources','liber-primus','lp2-corpus.json'),'utf8'));
  const byteGrid=JSON.parse(fs.readFileSync(path.join(root,'resources','liber-primus','base60-grid.json'),'utf8'));
  const ciphertext=corpus.pages.slice(0,56).flatMap(page=>page.indices);
  const p0to2=corpus.pages.slice(0,3).flatMap(page=>page.indices);
  const p55=corpus.pages[55].indices;
  const clearP57=corpus.pages[57].indices;
  const table=byteGrid.byte_rows.flat();
  assert.equal(ciphertext.length,12956);
  assert.equal(p0to2.length,729);
  assert.equal(p55.length,76);
  assert.equal(clearP57.length,95);
  assert.equal(table.length,256);
  assert.deepEqual(table.slice(0,8),[203,231,167,186,97,237,126,183]);

  console.log(JSON.stringify({
    source:'2013 Instar Emergence number and 2014 LP2 copied p57 parable',
    factors:triple,uniqueBlumPair:[p,q],seed,modulus,x0,
    originalFirstChapterRuna:729,totalOriginalUnknownRunes:ciphertext.length,
    originalIoC:ioc(ciphertext)
  }));

  for(const mode of ['residue','bit5']){
    for(const emitNext of [false,true]){
      const key=makeKey(ciphertext.length+100,mode,emitNext);
      for(const sign of [-1,1]){
        const decoded=ciphertext.map((c,i)=>(c+sign*key[i]+29)%29);
        const impossible=firstImpossible(p0to2,key,sign);
        assert.notEqual(impossible,null,'Possible source-BBS original inverse requires review');
        const planted=encryptPlant(clearP57,key,sign);
        assert.equal(firstImpossible(planted,key,sign),null,'Solved p57 authentic-F plant must survive');
        console.log(JSON.stringify({
          mode,emitNext,sign,originalIoC:ioc(decoded),
          originalP0to2IoC:ioc(decoded.slice(0,729)),
          originalP55IoC:ioc(decoded.slice(-308+232)), 
          firstImpossibleZeroBased:impossible,
          p57Plant95Valid:true,
          originalFirst24:decoded.slice(0,24).map(x=>LABELS[x]).join(' ')
        }));
      }
    }
  }

  for(const emitNext of [false,true]){
    const sourceStates=stateStream(2048,emitNext);
    for(const mostSignificantBitFirst of [false,true]){
      const generated=asBytes(sourceStates,mostSignificantBitFirst);
      const xor=table.map((v,i)=>v^generated[i]);
      const tableEqual=table.every((v,i)=>v===generated[i]);
      const commonHeader=['1f8b','425a68','504b0304','25504446','89504e47']
        .some(hex=>Buffer.from(xor).subarray(0,hex.length/2).equals(Buffer.from(hex,'hex')));
      assert.ok(!tableEqual,'Recovered exact 256-byte table requires review');
      console.log(JSON.stringify({
        bbsBits:'lsb',emitNext,mostSignificantBitFirst,
        generatedFirst16:Buffer.from(generated.slice(0,16)).toString('hex'),
        originalTableEqual:tableEqual,
        tableXorPrintable:countPrintable(xor),
        tableXorStandardFileHeader:commonHeader,
        tableXorFirst16:Buffer.from(xor.slice(0,16)).toString('hex')
      }));
    }
  }
}
main();
