'use strict';
/**
 * Bounded 5-bit byte-to-GP29 key test for the reconstructed 2013
 * DATA/560.13 prefix. Not a full-file offset search or a claim that
 * DATA/560.13 is an LP2 key.
 *
 * Fixed byte offsets: 0 (file start), 133 and 331 (2014 onion7 HTML
 * title/div id), 449 and 1109 (selectors from the corrected 2013
 * prime/gap sequence).
 *
 * Test MSB/LSB 5-bit packing; values 29..31 folded mod 29 or rejected;
 * both additive signs; continuous or page-reset clocks. 80 models total.
 * The 15,330-byte prefix supplies a full key stream at every tested offset.
 *
 * Run: node sims/iso56013_5bit_gp29_key_gate.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.join(__dirname, '..');
const PREFIX_PATH = 'resources/derived/cicada2013-56013-reconstructed.bin';
const CORPUS_PATH = 'resources/liber-primus/lp2-corpus.json';
const GIBRAN_PATH = 'resources/control/gibran_prophet_58585.txt';
const OFFSETS = [0, 133, 331, 449, 1109];
const BIT_ORDERS = ['msb', 'lsb'];
const INVALID_POLICIES = ['mod29', 'reject'];
const SIGNS = [-1, 1];
const CLOCKS = ['continuous', 'page'];
const NULL_REPLICATES = 100;
const NULL_SEED = 0x56013b29;
const MOD = 29;
const FULL_MEMBER_BYTES = 118818811;
const FULL_MEMBER_SHA256 = 'db79072ce580efa54acf5f31f3ef0eb00aef867871a051d04e27ee5e7fbc112f';
const GP = ['F','U','TH','O','R','C','G','W','H','N','I','J','EO','P','X','S','T','B','E','M','L','NG','OE','D','A','AE','Y','IA','EA'];
const LETTERS = {A:24,B:17,C:5,D:23,E:18,F:0,G:6,H:8,I:10,J:11,K:5,L:20,M:19,N:9,O:3,P:13,Q:5,R:4,S:15,T:16,U:1,V:1,W:7,X:14,Y:26,Z:15};
const DIGRAPHS = {TH:2,NG:21,EO:12,OE:22,AE:25,IA:27,EA:28};
const read = rel => fs.readFileSync(path.join(ROOT, rel));
const mod = x => ((x % MOD) + MOD) % MOD;

function encodeGp29(text) {
  const source = text.toUpperCase().replace(/[^A-Z]/g, '');
  const out = [];
  for (let i = 0; i < source.length; i++) {
    const digraph = DIGRAPHS[source.slice(i, i + 2)];
    if (digraph !== undefined) { out.push(digraph); i++; }
    else out.push(LETTERS[source[i]]);
  }
  return out;
}
function iocCounts(counts, n) {
  let pairs = 0;
  for (const count of counts) pairs += count * (count - 1);
  return pairs / (n * (n - 1));
}
function ioc(values) {
  const counts = new Uint32Array(MOD);
  for (const value of values) counts[value]++;
  return iocCounts(counts, values.length);
}
function unpackFiveBits(bytes, order) {
  const out = [];
  let accumulator = 0, bitCount = 0;
  for (const byte of bytes) {
    if (order === 'msb') {
      accumulator = (accumulator << 8) | byte;
      bitCount += 8;
      while (bitCount >= 5) {
        bitCount -= 5;
        out.push((accumulator >> bitCount) & 31);
        accumulator &= (1 << bitCount) - 1;
      }
    } else {
      accumulator |= byte << bitCount;
      bitCount += 8;
      while (bitCount >= 5) {
        out.push(accumulator & 31);
        accumulator >>>= 5;
        bitCount -= 5;
      }
    }
  }
  return Uint8Array.from(out);
}
function buildKey(sourceBytes, offset, order, policy) {
  const chunks = unpackFiveBits(sourceBytes.subarray(offset), order);
  if (policy === 'mod29') return Uint8Array.from(chunks, value => value % MOD);
  const accepted = [];
  for (const value of chunks) if (value < MOD) accepted.push(value);
  return Uint8Array.from(accepted);
}
function transformPages(inputPages, key, sign, clock) {
  let globalIndex = 0;
  return inputPages.map(page => page.map((value, localIndex) => {
    const keyIndex = clock === 'page' ? localIndex : globalIndex;
    globalIndex++;
    return mod(value + sign * key[keyIndex]);
  }));
}
function scoreModel(pages, key, sign, clock) {
  const fullCounts = new Uint32Array(MOD);
  let globalIndex = 0, total = 0, maxPage = null;
  const pageScores = [];
  for (const page of pages) {
    const pageCounts = new Uint32Array(MOD);
    for (let i = 0; i < page.indices.length; i++) {
      const keyIndex = clock === 'page' ? i : globalIndex;
      const value = mod(page.indices[i] + sign * key[keyIndex]);
      pageCounts[value]++; fullCounts[value]++;
      globalIndex++; total++;
    }
    if (page.indices.length >= 140) {
      const score = iocCounts(pageCounts, page.indices.length);
      pageScores.push(score);
      if (!maxPage || score > maxPage.ioc) maxPage = {page:page.page,n:page.indices.length,ioc:score};
    }
  }
  pageScores.sort((a,b)=>a-b);
  return {fullBookIoC:iocCounts(fullCounts,total),maxPage,medianPageIoC:pageScores[Math.floor(pageScores.length/2)]};
}
function evaluateSource(sourceBytes, pages, collectRows) {
  const rows = [];
  let maxFullBookIoC = -Infinity, maxPageLocalIoC = -Infinity;
  const totalRunes = pages.reduce((sum,page)=>sum+page.indices.length,0);
  for (const offset of OFFSETS) for (const order of BIT_ORDERS) {
    const chunks = unpackFiveBits(sourceBytes.subarray(offset),order);
    for (const policy of INVALID_POLICIES) {
      const key = policy === 'mod29'
        ? Uint8Array.from(chunks,value=>value%MOD)
        : Uint8Array.from([...chunks].filter(value=>value<MOD));
      assert.ok(key.length>=totalRunes,{offset,order,policy,keyLength:key.length});
      for (const clock of CLOCKS) for (const sign of SIGNS) {
        const score = scoreModel(pages,key,sign,clock);
        maxFullBookIoC=Math.max(maxFullBookIoC,score.fullBookIoC);
        maxPageLocalIoC=Math.max(maxPageLocalIoC,score.maxPage.ioc);
        if (collectRows) rows.push({offset,bitOrder:order,invalidPolicy:policy,clock,sign,keyLength:key.length,fullBookIoC:score.fullBookIoC,maxPage:score.maxPage,medianPageIoC:score.medianPageIoC});
      }
    }
  }
  return {rows,maxFullBookIoC,maxPageLocalIoC};
}
function xorshift32(seed) {
  let state=seed>>>0;
  return ()=>{state^=state<<13;state^=state>>>17;state^=state<<5;return state>>>0;};
}
function distribution(values,actual) {
  const sorted=values.slice().sort((a,b)=>a-b);
  const mean=values.reduce((s,v)=>s+v,0)/values.length;
  const percentile=p=>sorted[Math.floor(p*(sorted.length-1))];
  return {replicates:values.length,mean,median:percentile(0.5),p95:percentile(0.95),p99:percentile(0.99),maximum:sorted[sorted.length-1],actualPercentile:sorted.filter(v=>v<=actual).length/values.length,actualAboveNullMaximum:actual>sorted[sorted.length-1]};
}
function run() {
  const prefix=read(PREFIX_PATH);
  const corpus=JSON.parse(read(CORPUS_PATH).toString('utf8'));
  const gibranText=read(GIBRAN_PATH).toString('utf8');
  const pages=corpus.pages.filter(p=>p.page<=55&&p.status==='unsolved'&&p.indices.length).map(p=>({page:p.page,indices:p.indices}));
  const totalRunes=pages.reduce((s,p)=>s+p.indices.length,0);
  assert.equal(prefix.length,15330);assert.equal(pages.length,55);assert.equal(totalRunes,12956);assert.equal(GP.length,MOD);
  const originalIoC=ioc(pages.flatMap(p=>p.indices));
  const gibran=encodeGp29(gibranText);
  const actual=evaluateSource(prefix,pages,true);
  assert.equal(actual.rows.length,80);
  const controlPlain=gibran.slice(0,totalRunes),controlPages=[];
  let at=0;
  for(const page of pages){controlPages.push(controlPlain.slice(at,at+page.indices.length));at+=page.indices.length;}
  let positiveControls=0;
  for(const row of actual.rows){
    const key=buildKey(prefix,row.offset,row.bitOrder,row.invalidPolicy);
    const encrypted=transformPages(controlPages,key,-row.sign,row.clock);
    const recovered=transformPages(encrypted,key,row.sign,row.clock).flat();
    assert.deepEqual(recovered,controlPlain);positiveControls++;
  }
  assert.equal(positiveControls,80);
  const rng=xorshift32(NULL_SEED),nullFull=[],nullPage=[];
  for(let r=0;r<NULL_REPLICATES;r++){
    const randomSource=Buffer.alloc(prefix.length);
    for(let i=0;i<randomSource.length;i++)randomSource[i]=rng()&255;
    const result=evaluateSource(randomSource,pages,false);
    nullFull.push(result.maxFullBookIoC);nullPage.push(result.maxPageLocalIoC);
  }
  actual.rows.sort((a,b)=>b.fullBookIoC-a.fullBookIoC);
  const bestPage=actual.rows.slice().sort((a,b)=>b.maxPage.ioc-a.maxPage.ioc)[0];
  return {
    source:{prefixPath:PREFIX_PATH,prefixBytes:prefix.length,fullMemberBytes:FULL_MEMBER_BYTES,fullMemberSha256:FULL_MEMBER_SHA256,fullMemberNotPresentLocally:true},
    corpus:{unsolvedRunePages:pages.length,runes:totalRunes,originalIoC,gp29EnglishControlRunes:gibran.length,gp29EnglishControlIoC:ioc(gibran)},
    fixedModelGrid:{offsets:OFFSETS,bitOrders:BIT_ORDERS,invalidPolicies:INVALID_POLICIES,signs:SIGNS,clocks:CLOCKS,models:actual.rows.length,positiveControls},
    actual:{bestFullBook:actual.rows[0],bestPageLocal:bestPage,maxFullBookIoC:actual.maxFullBookIoC,maxPageLocalIoC:actual.maxPageLocalIoC,rows:actual.rows},
    matchedRandomNull:{seed:NULL_SEED,fullBookMaxima:distribution(nullFull,actual.maxFullBookIoC),pageLocalMaxima:distribution(nullPage,actual.maxPageLocalIoC)},
    decision:'No language-like recovery from direct 5-bit DATA/560.13 key chunks at the five source-fixed prefix offsets. This does not exclude other full-file offsets, other byte maps, skip channels, or non-additive uses.'
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run,unpackFiveBits,buildKey,scoreModel};
