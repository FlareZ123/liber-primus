'use strict';
/**
 * LP2 source-bound cryptanalytic inverse: derive eight section stream keys
 * from the eight original 32-byte grid columns and eight original red titles.
 * Train on the first 160 original runes of each section; freeze source keys,
 * AES/ChaCha mode and exact 8! assignment; decode the following 140 runes
 * after continuation at the inferred skip offset.
 *
 * Supports standard SHA-256 concatenation, HMAC-SHA256 and HKDF-SHA256.
 * The title is represented either as original UTF-8 rune bytes or
 * as exact zero-based Gematria Primus rune-index bytes.
 * The same architecture is blind-recovered from independently planted
 * GP-English ciphertext with actual collision-consumed key draws.
 *
 * Status: executable attack hypothesis, not an actual LP2 decryption.
 * Node.js 22, CommonJS; run only via manual workflow or locally.
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const {originalBodies,originalKeys,streamKey,viterbi} = require('./grid_stream_collision_viterbi.cjs');
const {encode,train} = require('./grid_keyskip_viterbi.cjs');
const {matchColumns} = require('./grid_word_order_inversion.cjs');

const ROOT = path.resolve(__dirname,'..');
const read = name => fs.readFileSync(path.join(ROOT,name),'utf8');
const ALPHABET = [...'ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ'];
const T = 160, H = 140;
const BODY_PAGES = [0,3,8,15,23,27,33,40];
const BODY_OFFSETS = [0,0,0,9,0,0,91,0];
const SETTINGS = [];
for(const kdf of ['sha256concat','hmac','hkdf'])
for(const titleEncoding of ['runes','indices'])
for(const algo of ['aes-256-ctr','chacha20'])
for(const ivMode of ['zero','title-sha256'])
for(const reducer of ['mod29','scaled29'])
for(const sign of [1,-1])
SETTINGS.push({kdf,titleEncoding,algo,ivMode,reducer,sign});
const mod = v => (v%29+29)%29;

/** Read all eight colored title intervals using source image-aligned offsets. */
function originalTitles() {
  const annotations = JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
  const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
  return BODY_PAGES.map((page,i) => {
    const found = annotations.pages.find(p=>p.page===page).red_spans
      .find(s=>s.start===BODY_OFFSETS[i]);
    assert.ok(found);
    const runes = [...found.runes];
    const indices = runes.map(r=>corpus.runes.indexOf(r));
    assert.ok(indices.every(x=>x>=0));
    return {page,runes:found.runes,indices,start:found.start};
  });
}

/** @param {{runes:string,indices:number[]}} title @param {'runes'|'indices'} format */
function titleBytes(title,format) {
  return format==='runes' ? Buffer.from(title.runes,'utf8') : Buffer.from(title.indices);
}

/**
 * Deterministic 32-byte key from the printed 32-byte column and the
 * printed red-title rune string. The three constructions are separate,
 * strictly declared hypotheses, not discovered instructions.
 * @param {Buffer} column
 * @param {Buffer} title
 * @param {string} method
 * @returns {Buffer}
 */
function derive(column,title,method) {
  if(method==='sha256concat')
    return crypto.createHash('sha256').update(column).update(title).digest();
  if(method==='hmac')
    return crypto.createHmac('sha256',column).update(title).digest();
  if(method==='hkdf')
    return Buffer.from(crypto.hkdfSync('sha256',column,title,Buffer.alloc(0),32));
  throw new Error('Unexpected KDF');
}

/** @param {Buffer} title @param {'zero'|'title-sha256'} mode */
function nonce(title,mode) {
  return mode==='zero' ? Buffer.alloc(16)
    : crypto.createHash('sha256').update(title).digest().subarray(0,16);
}

/** @returns {number[]} Keystream for exact indexed and skip-aware inverse. */
function pad(column,title,setting) {
  const t = titleBytes(title,setting.titleEncoding);
  const secret = derive(column,t,setting.kdf);
  return streamKey(secret,setting,420,nonce(t,setting.ivMode));
}

/** All 8 by 8 source-key assignments, trained with no original holdout. */
function fit(cipher,columns,titles,model) {
  let champion = null;
  const summaries = [];
  for(const setting of SETTINGS) {
    const trained = cipher.map((row,i)=>columns.map(col=>{
      const k=pad(col,titles[i],setting);
      const result=viterbi(row.slice(0,T),k,setting.sign,model);
      return {score:result.score,skips:result.skips,key:k};
    }));
    const matching = matchColumns(trained.map(row=>row.map(x=>x.score)));
    const candidate = {setting,columns:matching.columns,trainScore:matching.score,
      trainMean:matching.score/(8*T),trained};
    summaries.push({setting,trainMean:candidate.trainMean});
    if(!champion||candidate.trainScore>champion.trainScore) champion=candidate;
  }
  assert.ok(champion);
  const checks = champion.columns.map((column,i)=>{
    const x=champion.trained[i][column];
    const tail=cipher[i].slice(T,T+H);
    const final=viterbi(tail,x.key.slice(T+x.skips),champion.setting.sign,model);
    const revealed=final.plaintext.map(v=>ALPHABET[v]).join('');
    return {section:i,page:titles[i].page,keyColumn:column,
      first160Training: x.score/T,trainingSkips:x.skips,
      next140Heldout:final.perRune,heldoutSkips:final.skips,
      candidateRunes:revealed.slice(0,85)};
  });
  const heldoutMean=checks.reduce((n,x)=>n+x.next140Heldout,0)/checks.length;
  return {setting:champion.setting,columns:champion.columns,
    trainMean:champion.trainMean,heldoutMean,checks,
    settingsScanned:SETTINGS.length,assignmentSearch:'exact 8! via subset DP',
    topTrain:summaries.sort((a,b)=>b.trainMean-a.trainMean).slice(0,4)};
}

function rng(seed) {
  let s=seed>>>0;
  return ()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return (s>>>0)/4294967296;};
}

/**
 * Independent blind plant under source-true HMAC/title key derivation.
 * Source: GP-encoded final >95k Shakespeare characters, not the trained LM.
 */
function positive(columns,titles,model) {
  const gp=encode(read('resources/control/shakespeare_first300k.txt').slice(205000));
  const clear=Array.from({length:8},(_,i)=>gp.slice(i*300,(i+1)*300));
  assert.ok(clear.every(a=>a.length===300));
  const setting={kdf:'hmac',titleEncoding:'runes',algo:'aes-256-ctr',
    ivMode:'title-sha256',reducer:'scaled29',sign:1};
  const assignment=[6,2,4,0,1,7,5,3];
  const random=rng(0x32012207);
  const used=[];
  const cipher=clear.map((row,i)=>{
    const k=pad(columns[assignment[i]],titles[i],setting);
    let index=0,prev=-1,skips=0;
    const ct=[];
    for(const p of row) {
      let c=mod(p+setting.sign*k[index]);
      if(c===prev && random()<.81) {
        index++;skips++;c=mod(p+setting.sign*k[index]);
      }
      ct.push(c);index++;prev=c;
    }
    used.push(skips);
    return ct;
  });
  const recovered=fit(cipher,columns,titles,model);
  const correctColumns=recovered.columns.every((col,i)=>col===assignment[i]);
  const correctSetting=Object.keys(setting).every(x=>recovered.setting[x]===setting[x]);
  const heldoutHits=recovered.checks.map((x,i)=>{
    const expected=clear[i].slice(T,T+H);
    const got=[...x.candidateRunes].map(ch=>ALPHABET.indexOf(ch));
    // Full GP accuracy independently obtained with exact original known key.
    const trueKey=pad(columns[assignment[i]],titles[i],setting);
    const trainResult=viterbi(cipher[i].slice(0,T),trueKey,setting.sign,model);
    const hold=viterbi(cipher[i].slice(T),trueKey.slice(T+trainResult.skips),setting.sign,model);
    return {section:i,correct:hold.plaintext.filter((p,j)=>p===expected[j]).length,
      heldout:H,physicalSkips:used[i],trainingEstimatedSkips:trainResult.skips};
  });
  const count=heldoutHits.reduce((a,b)=>a+b.correct,0);
  assert.ok(count/(8*H)>.7,'Planted true-key recovery must exceed 70%');
  return {sourceLength:8*300,setting,assignment,usedSkips:used,
    blindRecoveredConfig:correctSetting,blindRecoveredColumns:correctColumns,
    blindTrainMean:recovered.trainMean,blindHeldoutMean:recovered.heldoutMean,
    knownKeyHeldoutRecovered:count,knownKeyHeldoutTotal:8*H,
    recovery:heldoutHits};
}

function main() {
  const titles=originalTitles(),keys=originalKeys(),texts=originalBodies();
  assert.ok(keys.every(k=>k.length===32)&&texts.every(t=>t.length===300));
  const model=train(read('resources/control/shakespeare_first300k.txt').slice(0,200000));
  const planted=positive(keys,titles,model);
  const original=fit(texts,keys,titles,model);
  const out={model:'Red-title KDF-derived 256-bit grid-column key inversion',
    targetRings:'Eight source-designated section bodies, first 160 training + next 140 ciphertext runes',
    targetOriginalRunes:8*300,kdfSchemes:['SHA256(column||title)','HMAC-SHA256(column,title)','HKDF-SHA256(column,salt=title,info=empty)'],
    sourceTitleEncodings:['UTF8 runes','GP zero-based index bytes'],
    ciphers:['AES-256-CTR','ChaCha20'],nonceSchemes:['zero','SHA256(title)[:16]'],
    padByteMappings:['byte mod29','floor(byte*29/256)'],
    additiveSigns:[1,-1],skipPenalty:3.5,skipCap:34,
    trainingReferenceGP:model.symbols,positive:planted,original,
    status:'A held-out language score alone never establishes decrypted plaintext; inspect candidateRunes and re-encode before claiming recovery.'};
  process.stdout.write(JSON.stringify(out,null,2)+'\n');
}
if(require.main===module)main();
module.exports={originalTitles,titleBytes,derive,nonce,pad,fit,positive,SETTINGS};
