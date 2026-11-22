"use strict";

/**
 * A source-led, all-secret inversion gate for 87 book-global doublet packets.
 *
 * The 86 immediately repeated LP2 runes delimit 87 nonrepeated transition
 * packets. Each L-digit packet is hypothetically a full m-byte integer in
 * base 28, where m=floor(log_256(28^L)), optionally with reverse digit order.
 * Grant a completely unknown fixed 29-rune order in each of nine chapters.
 *
 * A single order can give rank zero to only its first rune or, when the
 * predecessor was that first rune, its second rune. This supplies an exact
 * necessary condition independent of all nine secret 29! rune orders.
 *
 * Reproduce: node sims/lp2_global87_chapter_byte_gate_sft.cjs
 * This test is complete and offline after checking out the repository.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const source = JSON.parse(fs.readFileSync(path.join(
  __dirname, "..", "resources/liber-primus/lp2-corpus.json"), "utf8"));
const pages = source.pages.filter(p => p.page <= 55 && p.indices.length);
const ciphertext = pages.flatMap(p => p.indices);
const chapterEnds = [729, 1874, 3603, 5506, 6527, 7960, 9640, 12648, 12956];
assert.equal(ciphertext.length, 12956);

/** @param {number} offset */
function chapterAt(offset) {
  const i = chapterEnds.findIndex(end => offset < end);
  assert(i >= 0);
  return i;
}

/** @param {number} length */
function packetCapacity(length) {
  assert(length >= 1);
  const slots = 28n ** BigInt(length);
  let m = Math.floor(length * Math.log2(28) / 8);
  while (256n ** BigInt(m + 1) <= slots) m++;
  while (256n ** BigInt(m) > slots) m--;
  const bound = (256n ** BigInt(m) - 1n) / (28n ** BigInt(length - 1));
  return {bytes: m, firstDigitMaximum: Number(bound < 27n ? bound : 27n)};
}

const packets = [];
let start = 1;
const repeats = [];
for (let i = 1; i < ciphertext.length; i++) {
  if (ciphertext[i] === ciphertext[i - 1]) {
    repeats.push(i);
    packets.push({start, end: i, ...packetCapacity(i - start)});
    start = i + 1;
  }
}
packets.push({start, end: ciphertext.length,
  ...packetCapacity(ciphertext.length - start)});
assert.equal(repeats.length, 86);
assert.equal(packets.length, 87);
assert.equal(packets.reduce((sum, p) => sum + (p.end - p.start), 0), 12869);
assert(packets.every(p => p.end > p.start));

/** @param {"forward"|"reverse"} direction */
function gate(direction) {
  const forced = Array.from({length: 9}, () => []);
  const globalForced = [];
  const independentPredecessorRows = Array.from({length: 9}, () => new Map());
  for (const [packetId, packet] of packets.entries()) {
    if (packet.firstDigitMaximum !== 0) continue;
    const offset = direction === "forward" ? packet.start : packet.end - 1;
    const chapter = chapterAt(offset);
    const precedent = ciphertext[offset - 1];
    const successor = ciphertext[offset];
    const item = {packetId, offset, chapter,
      packetDigits: packet.end - packet.start, precedent, successor,
      pair: source.translit[precedent] + "→" + source.translit[successor]};
    forced[chapter].push(item);
    globalForced.push(item);
    const row = independentPredecessorRows[chapter].get(precedent) || new Set();
    row.add(successor);
    independentPredecessorRows[chapter].set(precedent, row);
  }
  const distinctSuccessors = forced.map(group =>
    new Set(group.map(item => item.successor)).size);
  const chapterPredecessorConflicts =
    independentPredecessorRows.map(row =>
      [...row.values()].filter(succ => succ.size >= 2).length);
  return {
    direction, forced, forcedCount: globalForced.length,
    distinctSuccessors, globalDistinct:
      new Set(globalForced.map(item => item.successor)).size,
    chapterPredecessorConflicts,
    eliminatedChapterOrders: distinctSuccessors.some(n => n > 2),
  };
}
const forward = gate("forward");
const reverse = gate("reverse");
assert.equal(forward.forcedCount, 36);
assert.equal(reverse.forcedCount, 36);
assert.deepEqual(forward.distinctSuccessors, [3,5,4,1,7,6,3,4,1]);
assert.deepEqual(reverse.distinctSuccessors, [2,4,5,1,6,6,3,5,1]);
assert(forward.eliminatedChapterOrders && reverse.eliminatedChapterOrders);
assert(forward.chapterPredecessorConflicts[4] >= 1);
assert(reverse.chapterPredecessorConflicts.every(n => n === 0));

/**
 * Exact forward natural/rank and cyclic/rank GP29 decoders.
 * @param {"natural"|"cyclic"} order
 * @param {"forward"|"reverse"} direction
 */
function overflowCensus(order, direction) {
  let violations = 0;
  for (const packet of packets) {
    const digits = [];
    for (let i = packet.start; i < packet.end; i++) {
      const current = ciphertext[i], prior = ciphertext[i-1];
      const digit = order === "natural" ?
        current - (current > prior ? 1 : 0) :
        (current - prior + 29) % 29 - 1;
      assert(digit >= 0 && digit < 28);
      digits.push(digit);
    }
    if (direction === "reverse") digits.reverse();
    let value = 0n;
    for (const digit of digits) value = value * 28n + BigInt(digit);
    if (value >= 256n ** BigInt(packet.bytes)) violations++;
  }
  return violations;
}
const census = {
  naturalForward: overflowCensus("natural", "forward"),
  naturalReverse: overflowCensus("natural", "reverse"),
  cyclicForward: overflowCensus("cyclic", "forward"),
  cyclicReverse: overflowCensus("cyclic", "reverse")
};
assert.deepEqual(census, {
  naturalForward:65, naturalReverse:63,
  cyclicForward:64, cyclicReverse:65
});

/** @param {number} seed */
function seededShuffle(seed) {
  let state = seed >>> 0;
  /** @returns {number} */
  function random() {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  }
  const order = Array.from({length: 29}, (_, i) => i);
  for (let i = 28; i > 0; i--) {
    const j = random() % (i + 1);
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

/**
 * Positive control: encode 7694 literal ASCII 'A' bytes into the source's
 * exact 87 packet lengths and exact 86 doublet positions, using independent
 * hidden whole-rune orders in all nine source-visible chapters.
 */
function plantedInverse() {
  const orders = chapterEnds.map((_, i) => seededShuffle(0x330187 + i * 449));
  const encoded = [0], totalBytes = packets.reduce((s, p) => s + p.bytes, 0);
  let reconstructedBytes = 0;
  for (const [j, packet] of packets.entries()) {
    if (j > 0) encoded.push(encoded[encoded.length - 1]);
    assert.equal(encoded.length, packet.start);
    const bytes = Buffer.alloc(packet.bytes, 0x41);
    let value = 0n;
    for (const b of bytes) value = value * 256n + BigInt(b);
    const digits = new Array(packet.end - packet.start).fill(0);
    for (let k = digits.length - 1; k >= 0; k--) {
      digits[k] = Number(value % 28n);
      value /= 28n;
    }
    assert.equal(value, 0n);
    for (let k = 0; k < digits.length; k++) {
      const offset = packet.start + k;
      const order = orders[chapterAt(offset)].filter(
        x => x !== encoded[encoded.length - 1]);
      encoded.push(order[digits[k]]);
    }
    assert.equal(encoded.length, packet.end);
  }
  assert.equal(encoded.length, 12956);
  assert.deepEqual(
    encoded.flatMap((v, i) => i > 0 && v === encoded[i-1] ? [i] : []),
    repeats
  );
  for (const packet of packets) {
    let value = 0n;
    for (let i = packet.start; i < packet.end; i++) {
      const order = orders[chapterAt(i)].filter(x => x !== encoded[i-1]);
      const digit = order.indexOf(encoded[i]);
      assert(digit >= 0);
      value = value * 28n + BigInt(digit);
    }
    const reconstructed = Buffer.alloc(packet.bytes);
    for (let k = reconstructed.length - 1; k >= 0; k--) {
      reconstructed[k] = Number(value % 256n);
      value /= 256n;
    }
    assert.equal(value, 0n);
    assert(reconstructed.every(x => x === 0x41));
    reconstructedBytes += reconstructed.length;
  }
  assert.equal(totalBytes, 7694);
  assert.equal(reconstructedBytes, totalBytes);
  return {encodedRunes:encoded.length, repeatedRunePositions:repeats.length,
    decodedBytes:reconstructedBytes, byteValue:0x41};
}

/**
 * Stronger original-input gate for direct printable-ASCII first bytes.
 * Each visual chapter may have 29 independent secret 28-way successor
 * alphabets, one for every preceding rune. If the most-significant digit
 * is forced to zero for distinct outputs from the same predecessor,
 * no secret alphabet can satisfy both packets.
 * @param {"forward"|"reverse"} direction
 */
function asciiFirstByteGate(direction) {
  const rows = Array.from({length: 9}, () => new Map());
  for (const [packetId, packet] of packets.entries()) {
    const length = packet.end - packet.start;
    const asciiMax = (127n * 256n ** BigInt(packet.bytes - 1) - 1n)
      / (28n ** BigInt(length - 1));
    if (asciiMax !== 0n) continue;
    const offset = direction === "forward" ?
      packet.start : packet.end - 1;
    const chapter = chapterAt(offset);
    const predecessor = ciphertext[offset - 1];
    const successor = ciphertext[offset];
    const row = rows[chapter].get(predecessor) || [];
    row.push({packetId, packetDigits:length, offset, chapter,
      predecessor, successor,
      pair:source.translit[predecessor] + "→" + source.translit[successor]});
    rows[chapter].set(predecessor, row);
  }
  const contradictions = [];
  let forcedZeroPackets = 0;
  for (const [chapter, group] of rows.entries()) {
    for (const [predecessor, events] of group) {
      forcedZeroPackets += events.length;
      if (new Set(events.map(item => item.successor)).size >= 2)
        contradictions.push({chapter, predecessor, events});
    }
  }
  return {direction, contradictions, forcedZeroPackets};
}
const asciiForward = asciiFirstByteGate("forward");
const asciiReverse = asciiFirstByteGate("reverse");
assert(asciiForward.contradictions.length > 0);
assert(asciiReverse.contradictions.length > 0);
assert(asciiReverse.contradictions.some(c => c.chapter === 7 &&
  c.predecessor === 4 &&
  c.events.some(e => e.packetId === 68 &&
    e.offset === 10507 && e.successor === 28) &&
  c.events.some(e => e.packetId === 77 &&
    e.offset === 11343 && e.successor === 18)));


/**
 * Construct an explicit original-cipher compatibility witness under the
 * much larger unconstrained-binary, per-predecessor, per-chapter key family.
 * This proves feasibility of one raw-binary interpretation and explains
 * why the natural-English first-byte condition is decisive. It is NOT a
 * source-derived key, an original LP2 plaintext, or a historical mechanism.
 */
function constructRawBinaryCompatibility() {
  const constraints = new Map();
  /** @param {number} packetId @param {number} digitIndex @param {number} bound */
  function addBound(packetId, digitIndex, bound) {
    assert(bound >= 0 && bound < 28);
    const p = packets[packetId];
    const offset = p.end - 1 - digitIndex;
    const prior = ciphertext[offset-1], out = ciphertext[offset];
    const key = chapterAt(offset) + ":" + prior;
    const row = constraints.get(key) || new Map();
    row.set(out, Math.min(row.get(out) ?? 27, bound));
    constraints.set(key, row);
  }

  for (const [packetId,p] of packets.entries()) {
    const len = p.end-p.start;
    let upperValue = 256n ** BigInt(p.bytes) - 1n;
    const bounds = new Array(len);
    for (let k=len-1; k>=0; k--) {
      bounds[k] = Number(upperValue % 28n);
      upperValue /= 28n;
    }
    assert.equal(upperValue, 0n);
    if (bounds[0] === 0) {
      assert(bounds[1] > 0);
      addBound(packetId,0,0);
      addBound(packetId,1,bounds[1]-1);
    } else if (packetId === 77) {
      // The sole strict-prefix conflict can use digit 1 here. The second
      // digit then stays strictly below the byte-capacity threshold 10.
      assert.equal(bounds[0], 1);
      assert.equal(bounds[1], 10);
      addBound(packetId,0,1);
      addBound(packetId,1,9);
    } else {
      addBound(packetId,0,bounds[0]-1);
    }
  }

  const code = Array.from({length:9},(_,chapter) =>
    Array.from({length:29},(_,prior)=>{
      const key=chapter+":"+prior;
      const fixed=constraints.get(key) || new Map();
      const ranked=[...fixed].sort((a,b)=>a[1]-b[1] || a[0]-b[0]);
      const outToRank=new Map(),rankToOut=[];
      for(const [out,bound] of ranked) {
        assert(rankToOut.length <= bound);
        outToRank.set(out,rankToOut.length);
        rankToOut.push(out);
      }
      for(let out=0;out<29;out++) {
        if(out!==prior && !outToRank.has(out)) {
          outToRank.set(out,rankToOut.length);
          rankToOut.push(out);
        }
      }
      assert.equal(rankToOut.length,28);
      return {outToRank,rankToOut};
    })
  );
  const reconstructed=[ciphertext[0]];
  let byteCount=0,printable=0,constrainedPackets=0;
  for (const [packetId,p] of packets.entries()) {
    if(packetId>0) reconstructed.push(reconstructed[reconstructed.length-1]);
    assert.equal(reconstructed.length,p.start);
    const digits=[];
    let value=0n;
    for(let i=p.end-1; i>=p.start; i--) {
      const row=code[chapterAt(i)][ciphertext[i-1]];
      const digit=row.outToRank.get(ciphertext[i]);
      assert(Number.isInteger(digit));
      digits.push(digit);
      value=value*28n+BigInt(digit);
    }
    assert(value < 256n**BigInt(p.bytes));
    const bytes=Buffer.alloc(p.bytes);
    let copy=value;
    for(let j=bytes.length-1;j>=0;j--) {
      bytes[j]=Number(copy%256n);
      copy/=256n;
    }
    assert.equal(copy,0n);
    byteCount+=bytes.length;
    for(const b of bytes)if(b>=32&&b<=126)printable++;
    // Inverse base28 encoding is bit-for-bit unique for this admissible
    // byte integer under a fixed packet digit length.
    let reproduce=0n;
    for(const b of bytes) reproduce=reproduce*256n+BigInt(b);
    const reversed=new Array(digits.length);
    for(let j=digits.length-1;j>=0;j--) {
      reversed[j]=Number(reproduce%28n);
      reproduce/=28n;
    }
    assert.equal(reproduce,0n);
    assert.deepEqual(reversed,digits);
    for(let k=p.start;k<p.end;k++){
      const digit=digits[p.end-1-k];
      const out=code[chapterAt(k)][reconstructed[reconstructed.length-1]]
        .rankToOut[digit];
      reconstructed.push(out);
    }
    assert.equal(reconstructed.length,p.end);
    constrainedPackets++;
  }
  assert.deepEqual(reconstructed,ciphertext);
  assert.equal(byteCount,7694);
  assert.equal(constrainedPackets,87);
  assert.equal(printable,2785);
  return {originalPacketsDecoded:constrainedPackets,
    originalRunesReencrypted:reconstructed.length,
    candidateOpaqueBinaryBytes:byteCount,printableByteCount:printable,
    independentSecretChapterPredecessorRows:9*29,
    directlyConstrainedRows:constraints.size,
    classification:"feasibility witness only; key fitted to original source"};
}

const plant = plantedInverse();
const binaryCompatibility = constructRawBinaryCompatibility();
const heading = [13,24,4,24,17,20,18].reduce(
  (sum, idx) => sum + source.prime[idx], 0);
assert.equal(heading, 449);
let ordinal = 0;
for (let n=2; n<=heading; n++) {
  let prime = true;
  for (let d=2; d*d<=n; d++) if(n%d===0) {prime=false;break;}
  if(prime) ordinal++;
}
assert.equal(ordinal, 87);

console.log(JSON.stringify({
  source:{unknownRunes:ciphertext.length,repeatMarkers:repeats.length,
    globalPackets:packets.length,nonrepeatingTransitions:12869,
    terminalHeadingPrimeSum:heading,terminalHeadingPrimeOrdinal:ordinal,
    chapterEnds},
  exactConsequence:{
    maximumPayloadBytes:packets.reduce((sum,p)=>sum+p.bytes,0),
    forcedZeroLeadersForward:forward.forcedCount,
    forcedZeroLeadersReverse:reverse.forcedCount,
    chapter4ForwardDistinct:forward.distinctSuccessors[4],
    chapter4ReverseDistinct:reverse.distinctSuccessors[4],
    chapter4ForwardExample:forward.forced[4].slice(0,4),
    chapter4ReverseExample:reverse.forced[4].slice(0,4),
    fixedSecretChapterOrderExcludedBothDirections:true,
    chapterPredecessorIndependentRowsForward:forward.chapterPredecessorConflicts,
    chapterPredecessorIndependentRowsReverse:reverse.chapterPredecessorConflicts,
    originalNaturalOrderOverflow:census,
    sourceNativePrintableFirstByte:{
      forwardZeroPacketCount:asciiForward.forcedZeroPackets,
      reverseZeroPacketCount:asciiReverse.forcedZeroPackets,
      reverseAllSecretRowContradiction:asciiReverse.contradictions.find(c =>
        c.chapter === 7 && c.predecessor === 4)
    }
  },
  positiveControl:plant,
  originalRawBinaryCompatibility:binaryCompatibility,
  conclusion:"No unknown plaintext. The 449→87 relation is speculative. A chapter-wide single secret order is impossible for canonical all-byte payloads; independently secret predecessor-specific chapter rows fail under printable ASCII first bytes. An arbitrary opaque-binary inverse with 261 independent secret rows can be fitted exactly to original ciphertext, proving compatibility but recovering no authentic source key or plaintext."
},null,2));
