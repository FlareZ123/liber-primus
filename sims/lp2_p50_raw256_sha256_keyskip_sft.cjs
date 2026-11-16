'use strict';

/**
 * Source-locked LP2 p50 complete-table SHA-256 stream-key inverse.
 * Independent branch: the WHOLE original 256-byte tableau is hashed once;
 * no 32-byte column/row split, quotient, fitted nonce, fitted phase, or secret.
 * A soft predecessor-collision retry decoder admits 0..3 exact legal key skips.
 * This is exploratory and is NOT an authenticated cipher prescription.
 * Run: node sims/lp2_p50_raw256_sha256_keyskip_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const j = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'));
const sourceTable = JSON.parse(fs.readFileSync(path.join(root, 'resources/liber-primus/lp2-grid-256.json'), 'utf8'));
const raw = Buffer.from(sourceTable.bytes);
assert.equal(raw.length, 256);
assert.equal(crypto.createHash('sha256').update(raw).digest('hex'), '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
const key = crypto.createHash('sha256').update(raw).digest();
const plainControl = j.pages.find(p => p.page === 57).indices;
assert.equal(plainControl.length, 95);
const page0 = j.pages.find(p => p.page === 0).indices;
const page55 = j.pages.find(p => p.page === 55).indices;
assert.equal(page0.length, 262);
assert.equal(page55.length, 76);
const trainingText = fs.readFileSync(path.join(root, 'resources/control/shakespeare_first300k.txt'), 'utf8');
const symbols = j.translit.map((s, i) => ({s, i})).sort((a,b) => b.s.length - a.s.length);
const gp = new Map(j.translit.map((s, i) => [s, i]));
const mod = x => (x % 29 + 29) % 29;

/**
 * Translate the period's literal 29-GP alphabet with longest-runic-digraph matching.
 * @param {string} text Source modern-English prose.
 * @returns {number[]} GP29 numerical symbols.
 */
function translit(text) {
  const result = [];
  const words = text.toUpperCase().match(/[A-Z]+/g) || [];
  for (const w of words) {
    const normalized = w.replace(/QU/g, 'CW').replace(/Q|K/g, 'C').replace(/V/g, 'U').replace(/Z/g, 'S');
    for (let i = 0; i < normalized.length;) {
      const sym = symbols.find(x => normalized.startsWith(x.s, i));
      assert.ok(sym, 'transliteration undefined at ' + normalized.slice(i));
      result.push(sym.i);
      i += sym.s.length;
    }
  }
  return result;
}

/**
 * Build an independently fixed GP29 native-language trigram score.
 * @param {number[]} training A plaintext literary source stream.
 * @returns {{score:(a:number,b:number,c:number)=>number, mean:(a:number[])=>number}}
 */
function model(training) {
  const tri = new Float64Array(29 * 29 * 29);
  const bi = new Float64Array(29 * 29);
  const un = new Float64Array(29);
  for (let i=0;i<training.length;i++) {
    un[training[i]]++;
    if(i>0) bi[training[i-1]*29+training[i]]++;
    if(i>1) tri[(training[i-2]*29+training[i-1])*29+training[i]]++;
  }
  const score = (a,b,c) => {
    if(a<0 && b<0) return Math.log((un[c]+0.5)/(training.length+14.5));
    if(a<0) return Math.log((bi[b*29+c]+0.5)/(un[b]+14.5));
    return Math.log((tri[(a*29+b)*29+c]+0.5)/(bi[a*29+b]+14.5));
  };
  const mean = v => v.reduce((sum,c,i) => sum + score(i>1?v[i-2]:-1,i>0?v[i-1]:-1,c),0)/v.length;
  return {score,mean};
}
const lm = model(translit(trainingText));
const encode = seq => seq.map(x => String.fromCharCode(65+x)).join('');
const decodeTrace = trace => Array.from(trace, c => c.charCodeAt(0) - 65);
const textify = seq => seq.map(x=>j.translit[x]).join('');

function stream(cipher) {
  const c = crypto.createCipheriv(cipher, key, Buffer.alloc(16));
  return c.update(Buffer.alloc(65536));
}

/**
 * Decode a complete observed ciphertext with known byte-stream and exact
 * predecessor-rejection compatibility constraints. Rejected trials are legal
 * only when they would have emitted the previous *actual* ciphertext rune.
 * @param {number[]} ct Canonical unmodified cipher runes.
 * @param {number[]} pad Candidate GP29 key clock.
 * @param {number} sign Encryption orientation +/-1.
 * @param {number} width Beam width.
 * @returns {{seq:number[], languageScore:number, skipCount:number, policyScore:number}}
 */
function inverse(ct, pad, sign, width=512) {
  /** @type {{j:number,a:number,b:number,s:number,n:number,t:string}[]} */
  let states=[{j:0,a:-1,b:-1,s:0,n:0,t:''}];
  for(let i=0;i<ct.length;i++) {
    const candidates=new Map();
    for(const st of states) {
      for(let skipped=0;skipped<=3;skipped++) {
        const used=st.j+skipped;
        const p=mod(ct[i] - sign*pad[used]);
        if (skipped && i===0) break;
        let legal=true;
        for(let t=0;t<skipped;t++) {
          if (mod(p + sign*pad[st.j+t])!==ct[i-1]) {legal=false;break;}
        }
        if(!legal) continue;
        const repeats = i>0 && ct[i]===ct[i-1];
        const policy = skipped * Math.log(0.8) + (repeats?Math.log(0.2):0);
        const s=st.s+lm.score(st.a,st.b,p)+policy;
        const next={j:used+1,a:st.b,b:p,s,n:st.n+skipped,t:st.t+String.fromCharCode(65+p)};
        const id=next.j+','+next.a+','+next.b;
        const old=candidates.get(id);
        if(!old||s>old.s) candidates.set(id,next);
      }
    }
    states=Array.from(candidates.values()).sort((a,b)=>b.s-a.s).slice(0,width);
    assert.ok(states.length>0,'No legal decoded state at rune '+i);
  }
  const best=states[0],seq=decodeTrace(best.t);
  assert.equal(seq.length, ct.length);
  return {seq, languageScore:lm.mean(seq),skipCount:best.n,policyScore:best.s/seq.length};
}

/**
 * A separate source-native generator to detect cipher and skip logic on p57.
 * @param {number[]} pt Solved real GP29 source.
 * @param {number[]} pad Known key stream.
 * @param {number} sign Encryption sign.
 * @returns {{cipher:number[],skips:number}}
 */
function plant(pt,pad,sign) {
  let state=0x33012014 >>>0;
  let clock=0,skips=0;
  const cipher=[];
  for(const p of pt) {
    let trial=0;
    while(true) {
      const c=mod(p+sign*pad[clock++]);
      state=(Math.imul(1664525,state)+1013904223)>>>0;
      const reject=cipher.length>0 && c===cipher[cipher.length-1] &&
        (state%5!==0) && trial<3;
      if(!reject) {cipher.push(c);break;}
      skips++;trial++;
    }
  }
  return {cipher,skips};
}
function countEqual(seq) {
  return seq.slice(1).filter((x,i)=>x===seq[i]).length;
}
const out=[];
for (const cipher of ['aes-256-ctr','chacha20']) {
  const bytes=stream(cipher);
  for (const mapping of ['mod29','scaled29']) {
    const pad=Array.from(bytes, b=>mapping==='mod29'?b%29:Math.floor(b*29/256));
    for (const sign of [1,-1]) {
      const planted=plant(plainControl,pad,sign);
      const recovered=inverse(planted.cipher,pad,sign);
      const hits=recovered.seq.filter((x,i)=>x===plainControl[i]).length;
      const p0=inverse(page0,pad,sign);
      const p55=inverse(page55,pad,sign);
      out.push({cipher,mapping,sign,
        sourceNativeControl:{length:95,imposedSkips:planted.skips,hits,mean:recovered.languageScore},
        originalP0:{length:262,mean:p0.languageScore,skips:p0.skipCount,doubles:countEqual(page0),prefix:textify(p0.seq.slice(0,70))},
        originalP55:{length:76,mean:p55.languageScore,skips:p55.skipCount,doubles:countEqual(page55),text:textify(p55.seq)}
      });
    }
  }
}
out.sort((a,b)=>b.originalP0.mean-a.originalP0.mean);
console.log(JSON.stringify({
  hypothesis:'SHA256(complete original 256-byte p50 table) as AES/ChaCha zero nonce stream, GP29 soft predecessor-collision retry',
  originalGridSha256:crypto.createHash('sha256').update(raw).digest('hex'),
  keySha256:key.toString('hex'),trainingRunes:translit(trainingText).length,
  trueP57Mean:lm.mean(plainControl),results:out
},null,2));
if(out.some(x=>x.sourceNativeControl.hits<76)) {
  throw new Error('Insufficient genuine-plaintext control sensitivity: do not interpret original negatives');
}
