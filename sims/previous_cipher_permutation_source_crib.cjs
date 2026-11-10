"use strict";
/**
 * Source-crib inversion for a maximally free per-page, previous-ciphertext
 * keyed GP29 substitution: C[t] = S_page[C[t-1]][P[t]].
 *
 * Every S_page[a] is an arbitrary 29-symbol permutation, unknown to us.
 * Source text need only be a contiguous GP-tokenized passage; exact printed
 * word boundaries and known substitution rows are not assumed.
 *
 * The necessary and sufficient source-window consistency check is:
 * (a,plaintext) uniquely determines ciphertext, AND
 * (a,ciphertext) uniquely determines plaintext. If both hold, the partial
 * maps can be extended to complete permutations, re-encrypting the page
 * exactly. Fast duplicated-edge equalities safely reject most offsets first.
 *
 * A matched source window is an algebraically possible decipherment, NOT
 * evidence of the actual Cicada key. Short pages can have many false hits.
 * Negative results exclude only these four stored source editions, exact
 * contiguous GP spelling and this no-insertion per-page model.
 *
 * Run: node sims/previous_cipher_permutation_source_crib.cjs
 * Node >= 22; built-in modules, canonical source files only.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const read = name => fs.readFileSync(path.join(ROOT, name), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pages = corpus.pages.filter(p => p.page < 56 && p.indices.length);
assert.equal(pages.length, 55);
assert.equal(pages.reduce((s,p) => s + p.indices.length, 0), 12956);
const TOKEN = corpus.translit.map((s,i) => ({s,i})).sort((a,b) =>
  b.s.length - a.s.length);
const sourcePaths = [
  ["LP1-solved", "resources/liber-primus/lp1-plaintext-reference.txt"],
  ["Shakespeare", "resources/control/shakespeare_first300k.txt"],
  ["Gibran", "resources/control/gibran_prophet_58585.txt"],
  ["Emerson", "resources/control/emerson_essays_2944.txt"]
];

/** @param {string} text @returns {Uint8Array} */
function gp(text) {
  const out = [];
  for (let w of text.toUpperCase().match(/[A-Z]+/g) || []) {
    w = w.replace(/QU/g, "CW").replace(/V/g, "U")
      .replace(/K/g, "C").replace(/Z/g, "S");
    for (let i = 0; i < w.length;) {
      const t = TOKEN.find(t => w.startsWith(t.s,i));
      assert.ok(t, "Unknown GP token: " + w.slice(i));
      out.push(t.i);
      i += t.s.length;
    }
  }
  return Uint8Array.from(out);
}

/**
 * Repeated (previous ciphertext, current ciphertext) edges require the
 * *same* source plaintext rune at every occurrence for any bijective row.
 * @param {number[]} cipher
 * @returns {Array<[number,number]>}
 */
function edgeEqualities(cipher) {
  const groups = new Map();
  for (let i = 1; i < cipher.length; i++) {
    const key = cipher[i-1]*29 + cipher[i];
    let v = groups.get(key);
    if (!v) {v=[]; groups.set(key,v);}
    v.push(i);
  }
  const constraints = [];
  for (const v of groups.values()) {
    for (let i = 1; i < v.length; i++) constraints.push([v[0],v[i]]);
  }
  return constraints;
}

/**
 * Test every contiguous literal source placement. This permits DIFFERENT
 * otherwise arbitrary row permutation keys on every physical cipher page.
 * @param {number[]} cipher
 * @param {Uint8Array} source
 * @param {boolean} [retainHits=true]
 */
function scan(cipher, source, retainHits = true) {
  const n = source.length-cipher.length+1;
  assert.ok(n>=0);
  const requirements = edgeEqualities(cipher);
  const forwardSeen = new Int32Array(841), inverseSeen = new Int32Array(841);
  const forward = new Uint8Array(841), inverse = new Uint8Array(841);
  let timestamp=0, candidates=0, complete=0, maxPrefix=0;
  let bestOffset=-1;
  const matches=[];
  for (let offset=0; offset<n; offset++) {
    let allowed=true;
    for (const [i,j] of requirements) {
      if (source[offset+i]!==source[offset+j]) {allowed=false;break;}
    }
    if (!allowed) continue;
    candidates++;
    const now=++timestamp;
    let matched=0;
    for (let i=1;i<cipher.length;i++) {
      const predecessor=cipher[i-1],next=cipher[i];
      const plain=source[offset+i];
      const out=predecessor*29+plain,back=predecessor*29+next;
      if ((forwardSeen[out]===now && forward[out]!==next) ||
          (inverseSeen[back]===now && inverse[back]!==plain)) break;
      forwardSeen[out]=now;forward[out]=next;
      inverseSeen[back]=now;inverse[back]=plain;
      matched++;
    }
    if (matched>maxPrefix) {maxPrefix=matched;bestOffset=offset;}
    if (matched===cipher.length-1) {
      complete++;
      if (retainHits) matches.push(offset);
    }
  }
  return {sourceWindows:n,edgeEqualities:requirements.length,
    afterEqualityGate:candidates,fullMatches:complete,
    longestPrefixAfterGate:maxPrefix,bestOffset,
    matchedSourceOffsets:matches};
}

/**
 * Construct the *actual* page row permutations implied by one source
 * alignment, completing unconstrained inputs in increasing index order.
 * This demonstrates exact source re-encryption, never authenticates a hit.
 * @param {number[]} cipher
 * @param {Uint8Array} source
 * @param {number} offset
 */
function reconstruct(cipher, source, offset) {
  const rows=Array.from({length:29},()=>Array(29).fill(-1));
  const used=Array.from({length:29},()=>new Set());
  for(let i=1;i<cipher.length;i++) {
    const prior=cipher[i-1],next=cipher[i],symbol=source[offset+i];
    if(rows[prior][symbol]>=0) assert.equal(rows[prior][symbol],next);
    else {
      assert.ok(!used[prior].has(next),"Nonbijective hidden row");
      rows[prior][symbol]=next;
      used[prior].add(next);
    }
  }
  for(let a=0;a<29;a++) {
    const available=Array.from({length:29},(_,i)=>i)
      .filter(b=>!used[a].has(b));
    let j=0;
    for(let p=0;p<29;p++)if(rows[a][p]<0)rows[a][p]=available[j++];
    assert.equal(j,available.length);
    assert.equal(new Set(rows[a]).size,29);
  }
  const recipher=[cipher[0]];
  for(let i=1;i<cipher.length;i++)
    recipher.push(rows[recipher[i-1]][source[offset+i]]);
  assert.deepEqual(recipher,cipher);
  return rows;
}

/** @param {number} seed */
function rng(seed) {
  let x=seed>>>0;
  return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0;};
}

/** Construct 29 arbitrary per-predecessor 29-permutations with EA as self. */
function secretRows(random) {
  return Array.from({length:29},(_,a)=>{
    const out=Array.from({length:29},(_,i)=>i).filter(i=>i!==a);
    for(let i=out.length-1;i>0;i--) {
      const j=random()%(i+1);
      [out[i],out[j]]=[out[j],out[i]];
    }
    const row=new Array(29);
    for(let i=0;i<28;i++)row[i]=out[i];
    row[28]=a;
    return row;
  });
}

/**
 * A full original-format synthetic inversion:
 * unknown random independently keyed row permutations on each page;
 * source offset must be FOUND by the very same blind source scan.
 */
function positive(source) {
  const random=rng(0x1729cc01);
  const cases=[];
  for(let k=0;k<pages.length;k++) {
    const target=pages[k],offset=20000+311*k;
    const truth=source.subarray(offset,offset+target.indices.length);
    assert.equal(truth.length,target.indices.length);
    const rows=secretRows(random),cipher=[(7*target.page+5)%29];
    for(let i=1;i<truth.length;i++)
      cipher.push(rows[cipher[i-1]][truth[i]]);
    const found=scan(cipher,source);
    assert.ok(found.matchedSourceOffsets.includes(offset),
      "Planted known GP offset missing on physical page "+target.page);
    const reconstructed=reconstruct(cipher,source,offset);
    assert.equal(reconstructed.length,29);
    cases.push({page:target.page,runes:cipher.length,trueOffset:offset,
      originalOffsetRecovered:true,recoveredFullCipher:true,
      candidateFullMatches:found.fullMatches});
  }
  return cases;
}

function main() {
  const sources=sourcePaths.map(([name,file])=>({name,runes:gp(read(file))}));
  const rows=[];
  for(const page of pages) {
    for(const src of sources) {
      const x=scan(page.indices,src.runes);
      for(const offset of x.matchedSourceOffsets)
        reconstruct(page.indices,src.runes,offset);
      rows.push({page:page.page,runes:page.indices.length,source:src.name,...x});
    }
  }
  const total=rows.reduce((acc,row)=>acc+row.sourceWindows,0);
  const all=rows.filter(row=>row.fullMatches>0);
  const plants=positive(sources.find(s=>s.name==="Shakespeare").runes);
  assert.equal(rows.length,220);
  assert.equal(total,33513796);
  assert.equal(all.reduce((n,row)=>n+row.fullMatches,0),62);
  assert.deepEqual([...new Set(all.map(x=>x.page))],[49]);
  assert.equal(plants.length,55);
  return {
    source:"Original physical LP2 pages 0..55 excluding runeless page50; authentic source text in four stored editions",
    cipherHypothesis:"C[i] = S_page[C[i-1]][P[i]]; S_page[a] is any freely chosen permutation of GP29 for each page and predecessor",
    ciphertextRunes:12956,cipherPages:55,sourceSizes:sources.map(s=>({name:s.name,runes:s.runes.length})),
    original:{pageSourceScans:rows.length,contiguousSourceWindows:total,
      exactMatches:all,fullMatches:all.reduce((n,row)=>n+row.fullMatches,0),
      pagesWithNoExactWindow:pages.length-new Set(all.map(x=>x.page)).size,
      page49ExactCandidateCount:all.filter(x=>x.page===49)
        .reduce((n,x)=>n+x.fullMatches,0)},
    independentSynthetic:{pages:plants.length,totalRunes:plants.reduce((n,x)=>n+x.runes,0),
      allTrueSourceOffsetsFound:true,allExactReencryptions:true,
      sourceReused:"Shakespeare (independent held-out offsets)",
      minCandidateFullMatches:Math.min(...plants.map(x=>x.candidateFullMatches))},
    scope:"No unknown plaintext recovered. Original 62 page49 matches are non-unique algebraic fits. This excludes only exact contiguous quotations from these four GP-tokenized source editions for the declared per-page previous-ciphertext row-permutation cipher."
  };
}
if(require.main===module) console.log(JSON.stringify(main(),null,2));
module.exports={gp,edgeEqualities,scan,reconstruct,secretRows,positive,main};
