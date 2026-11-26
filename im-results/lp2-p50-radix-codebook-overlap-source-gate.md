# P49–51 two-character byte transports: exact source-codebook ambiguity

**Status: original-input mathematical constraint; no unknown LP2 plaintext or creator-selected radix.** This resolves specific source-typing decisions, including the ambiguity between two *uniform-byte* source grammars and the exclusion of a literal historical finite reciprocal-table grammar. It does not establish that the field is made of bytes, identify the cryptographic role of its values, or exclude a historically specified nonuniform encoding.

## Observable source and competing explanations

The untouched original images `resources/liber-primus/{66,67,68}.jpg` contain the physical LP2 p49–p51 table: **32 rows ×8 two-character cells**, laid out 10|13|9 rows. The independently image-audited tokens appear in `resources/liber-primus/base60-grid.json`; this file's name and `byte_rows` field reflect a conventional numerical hypothesis rather than an authored instruction. The 256 printed positions contain **161 distinct token spellings**. This alone rules out interpreting the table literally as a 256-entry permutation of all different bytes, but leaves a byte stream, repeated-value lookup table, pointer field, symbolic message and other types open.

Two historically discussed byte grammars use the identical printed tokens:

* **Conventional radix60:** digits `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx`; each unsigned byte 0..255 is printed in exactly two digits.
* **Drop-lowercase-f radix59:** delete just `f` from that alphabet and print each unsigned byte 0..255 in exactly two digits. This is a proposed alternative, **not** a confirmed period convention.

Their byte-support sets each contain exactly 256 strings. Exhaustive enumeration proves

```text
base60-only:  0f  1f  2f  3f
base59-only:  4G  4H  4I  4J
intersection: 252 two-character strings
```

**All 256 printed source cells lie in the 252-token intersection.** There is no printed test case supported by only one of the two codebooks. The source's first cell `3N` decodes to 203 (base60) versus 200 (base59); distinct numerical readings do not supply an independent ground-truth value.

## Exact identifiability result and scope

Suppose each of the 256 source cells was produced by an independent uniform random byte from 0..255, and then encoded by either grammar. Under either grammar, **every source-observed token has probability 1/256**, so the complete unchanged printed tape has identical pointwise likelihood `(1/256)^256` under both models. The full-data likelihood ratio is exactly **1**, regardless of repeated values or row order. No post-hoc histogram/entropy score of these same printed bytes can create evidence between these *specific* models with the full tape already observed.

The equivalence is also algebraic for unconstrained downstream byte lookup functions. The 252 shared spellings induce a one-to-one map between the corresponding base59 and base60 integers; the four unused inputs and outputs can be paired to form a complete **256-symbol permutation T**. Thus on every original cell `decode60(token)=T(decode59(token))`. Any decoder class allowing arbitrary secret alphabet relabeling can absorb T and will produce the same outputs and forward replay under both interpretations. This equivalence **does not** extend to a separately authenticated fixed arithmetic, byte serializer, key schedule or other operation that is *not* closed under arbitrary relabeling.

The standalone [CommonJS test](../sims/lp2_p50_radix_codebook_overlap_sft.cjs) enumerates both entire codebooks, verifies every original printed cell, constructs the complete byte permutation T, tests all 256 round trips and publishes a row-major source digest. It also uses the eight discriminating strings as positive rejection controls. No search for fluent LP2 output is involved.

## Direct lookup-box classification (Director #2568)

The same source-exact 256 tokens also give a stronger exclusion of the direct lookup interpretation, independent of row/column ordering and of the two surviving radix choices. Using the independently adjudicated `lp2-grid-256.json` original readings, the multiplicity histogram is:

| Number of occurrences of a byte | 0 | 1 | 2 | 3 | 4 |
|---|---:|---:|---:|---:|---:|
| Number of byte values | 95 | 92 | 49 | 14 | 6 |

The base60 range is 0–255; the base59 range is 0–251. Both have exactly 161 distinct values and 127 equal-value unordered pairs. For example, the original token `33` is at zero-based printed positions 7 and 14 (p49 row1 column8 and row2 column7). Thus any deterministic token-to-byte relabeling retains at least 95 excess duplicate positions. No inverse permutation exists; changing order, reversing rows or bijectively relabeling values cannot repair it. AES S-box/inverse and all bijective byte substitutions are excluded without comparing particular arrays.

**Additional algebraic exclusion:** any full-domain affine map F₂⁸→F₂⁸ of rank r has exactly 2^r distinct outputs and constant nonempty fiber size 2^(8−r). The observed 161 is not a power of two, and its nonempty fibers have sizes 1, 2, 3 and 4. This excludes *every* linear or affine eight-bit lookup, including conventional CRC-8 byte tables (fixed initial state, reflection and constant XOR do not affect the argument), even after arbitrary reordering of input indices or bijective output relabeling. This covers singular CRC choices too. For the familiar uniform-iid byte null, expected distinct values are 162.0071 and expected equal-value pairs 127.5; the observed counts are close to those expectations, not evidence for a particular cipher or for randomness.

The existing [SFT](../sims/lp2_p50_radix_codebook_overlap_sft.cjs) now prints exact missing byte lists, multiplicities and collision totals for both codebooks. The arithmetic was executed in the connector runtime against the source JSON; no new CI run is required or claimed. No direct standard-table inverse or affine lookup can be the consumer. Nonbijective nonlinear functions (for example as part of a larger reversible construction), byte ciphertext or context-dependent registers remain possible. No authored receiver or unknown plaintext was obtained. Since the permutation prerequisite fails, no specific standard-table comparisons or fitted transforms are warranted.


## Literal character-class record decision (Director #2877, Agent3, 25 November)

The source is the already image-adjudicated 256 tokens, with physical 32×8 order. This is a different question from the prior [digit-letter semantics](lp2-p50-literal-token-grammar-control-gate.md) and [case-bitplane AES consumers](lp2-p50-case-bitplane-aes256-source-gate.md): does the printed case/type mark a structured record before numeric conversion?

Let D/U/L be digit/uppercase/lowercase of the second character. Every first character is a decimal digit 0–4. Enumerate the two complete unsigned-byte codebooks and count the joint first-digit/second-class support:

| First digit | Original D/U/L | Base60 D/U/L | Drop-f base59 D/U/L |
| --- | --- | --- | --- |
| 0 | 5/27/28 | 10/26/24 | 10/26/23 |
| 1 | 7/30/21 | 10/26/24 | 10/26/23 |
| 2 | 12/24/29 | 10/26/24 | 10/26/23 |
| 3 | 8/28/20 | 10/26/24 | 10/26/23 |
| 4 | 10/7/0 | 10/6/0 | 10/10/0 |

The absent 4L class is forced by the 0–255 range under either encoding, as is the restriction to a numeric first character. Total original second-class counts are D=42, U=116, L=98. Given the integer and either exact codec, the first digit and case class are deterministic, so the conditional entropy of these marks given that integer is zero. This does **not** imply that a sender cannot deliberately constrain integer choices to carry another message; it establishes that the proposed marks are not extra independently adjustable bits of a fixed numeral. A separate-channel claim needs a fixed selection/decoding law and original prediction.

A repeated row record with a fixed D/U/L field type per column is impossible: all eight columns have all three classes. Even choosing the modal class of each column retrospectively would require **132/256 violations**. All 32 row class signatures are distinct. More flexible records could exist but require a documented field grammar. Exploratory diagnostics compare the original against 3,000 independently generated tables per null (uniform bytes and independent eight-distinct-byte rows for each radix; seed 0x2877c1ca). The distinct-row null preserves the already-established #2626 row-uniqueness property, rather than confusing it with a class effect.

| Statistic | Original | Base60 distinct-row null two-sided tail | Base59 distinct-row null two-sided tail |
| --- | ---: | ---: | ---: |
| Column class Pearson | 20.96458 | .19793 | .19660 |
| Physical-page class Pearson | 1.06696 | .18127 | .22326 |
| Within-row equal-class pairs | 325 | .91103 | 1.00000 |
| Horizontal equal-class neighbours | 74 | .39920 | .34588 |
| Vertical equal-class neighbours | 88 | .82373 | .78574 |
| Repeated row class signature pairs | 0 | 1.00000 | 1.00000 |

All six Bonferroni-corrected tails equal 1 in all four simulated nulls; minimum unadjusted tail .18127. This is a finite descriptive screen, not a blinded experiment or proof of randomness. No new field boundary follows.

**Authentic syntax controls, tested before any consumer selection.** Original p10 scan27 contains the literal standalone 7 between rune groups; p56 scan73 contains 128 lowercase hex characters across five lines (26/25/25/27/25). The authenticated 2013 BASE29 example 3301→3QO and historical participant examples 30→11, 1033→16I establish the minimal numeral grammar; its effective alphabet is 0–9/A–S (see [signed protocol](../resources/external/2013-tcp-server-signed-source.md)). The original p50 tape has only 42/256 two-decimal-digit tokens, 88/256 case-insensitive two-hex-digit tokens, 110/256 minimal BASE29 numerals, and 132/256 even allowing fixed-width BASE29 leading zeroes. None parses the complete printed object under its actual syntax.

The exact archived [2014 Stage11 signed delivery message](../resources/historical/cicada2014-stage11-message.asc) supplies a particularly relevant mixed-case control. Its signature armor has the literal header/footer, radix64 body, and CRC24. Parsing the complete body recovers one 543-byte old-format tag-2 signature packet with a 540-byte body and version 4; its decoded checksum 54 0a 3f matches the computed CRC24. For the original p50 literal tokens the complete printed-order concatenation is lexically valid radix64, decoding to 384 bytes beginning `dc dd e9 da 5d fa d5 bd`. However the first octet DC denotes new-format packet tag 28, unassigned in the 2014-era RFC4880 packet grammar, not tag 2 or a recognized ordinary OpenPGP data packet; neither the armor framing nor CRC exists in the source. Even allowing the body alone, it is not the historical signature record. This test acts on the literal 512 printed characters, **not** the earlier direct base60-byte packet test. Lexical radix64 membership alone is trivial for this alphabet; it selects no receiver.

**Decision:** no independently selected character-class record or typed payload. Retire fixed-column class framing and the exact direct historical numeral/signature grammars. Do not infer a hidden bitstream from case alone, or search arbitrary re-encodings. The original numeric table remains unsolved, both numeral readings remain conditional, and an independently decoded adjacent instruction or fixed sender grammar is still the causal prerequisite. No LP2 plaintext or key recovered.

Reproduction: [CommonJS SFT](../sims/lp2_p50_class_record_gate_sft.cjs). The core analysis executed on exact repository source in connected V8 (12,000 simulated tables); the later original-image p10/p56 literal controls were checked separately, and the standalone Node wrapper was not separately CI-run. The test uses structural checks, not language fitting.

## Historical reciprocal-table record decision (Director #2894, Agent8, 26 November)

**Decision:** literal Old Babylonian finite reciprocal records cannot account for all printed cells under the conventional base60 numeral reading, even if any power-of-60 scale and any pairing were granted. The original supplies no distinct reciprocal-field, negation, grouping, or table-operation instruction. This is an arithmetic typing exclusion, not a radix selection or unknown-rune decoder.

The motivating independent source is the p33 cuneiform pair (17,13)/(55,1), not the downstream byte scores. I inspected original archive scans 50 and 66–68 directly: the p33 numeral stamp and the p49–51 mixed-case alphanumeric panel are different visible notations; the latter has equal-spaced eight-cell rows with no explicit reciprocal label, semicolon, or alternating field separators. The earlier #440/#1968 missing-transfer conclusions remain intact; #2235 tested a separate digit-key transform.

**Period control.** J. Friberg, *A Remarkable Collection of Babylonian Mathematical Texts* (2007), [CDLI MS 3874/P252955](https://cdli.earth/artifacts/252955), is a real Old Babylonian reciprocal tablet. [May 2012 Stony Brook transcription derived from Friberg](https://www.math.stonybrook.edu/~tony/whatsnew/may12/tablets/bab-mult2.html) distinguishes legible rows from eight restored rows at the damaged junction. The ordinary syntax identifies a number and its reciprocal, using the historical igi / gál.bi markers. The first two lines express the 2/3 and half relations; the last two surviving reverse rows give the reciprocals of 1,4 and 1,21. C. Proust, [2012 chapter, pp.388–390, Table 12.2 and n.19](https://www.ms.uky.edu/~sohum/ma330/files/Chemla_K.Ed.-The_history_of_mathematical_proof_in_ancient_traditions-Cambridge_University_Press_2012.pdf), independently explains the floating-place convention and the explicit negation used for irregular inputs in older tables. The 26 standard pairs in Proust's table, together with the special 3/2 and unity rows in the MS3874 reconstruction, are 28/28 arithmetically valid; the eight reconstructed rows are not claimed as legible original clay.

For digits d, let M(d) be the nonnegative integer mantissa evaluated in base60. An unmarked place shift can only multiply it by 60^e for integer e. A finite reciprocal pair therefore requires positive A,B and A×B=60^k for some integer k≥0. Exact rational normalization B/60^k gives product 1. Every mantissa must be 2,3,5-smooth. No shift can remove a factor 7, 11, 13, 29, etc.; zero has no reciprocal. The integer arithmetic gives a stronger invariant than choosing a pair order or guessing a fraction point.

Using the already case-adjudicated `lp2-grid-256.json` (blob 2550eae357442912220e05dc51147523a61dd75a), the conventional 60-digit alphabet and literal single-cell mantissas, without pairing, changing any rune or optimizing any scale:

| Physical page | Positive regular | Positive irregular | Zero |
| --- | ---: | ---: | ---: |
| 49 | 14 | 66 | 0 |
| 50 | 21 | 83 | 0 |
| 51 | 12 | 58 | 2 |
| Total | 47 | 207 | 2 |

Witnesses: p49 row1 col1 `3N`=203=7×29; p50 row1 col1 `2M`=142=2×71; p51 row1 col2 `2a`=156=12×13. The visually confirmed literal `00` tokens are p51 row2 col1 and row6 col6 (one-based on physical page 51; global rows25/29). Their value is zero under both existing ordinary digit alphabets and any conventional place shift. Under the conditional base60 reading at most 47 of 256 fields are even individually eligible for finite reciprocal pairing, so at most 23 disjoint full pairs could exist before product constraints. The standard 28-record ordered range also does not match a 128-pair full panel; cardinality alone is not the exclusion. Earlier irregular-input tables explicitly mark no-reciprocal records, whereas the original provides no independently identified such field. No hypothesis about an unmarked zero-as-null, multi-cell regrouping, arbitrary digit remap or mixed literal/codeword records is authorized by the cuneiform.

Reproduction (exact integer arithmetic; the tested core executed in connected V8, no standalone Node/CI run claimed). Historical digits below are mathematical data from the two cited sources; `1.30` is the modern normalization of the 3/2 input, not a claimed literal first-line transcription.

```js
const g = require('../resources/liber-primus/lp2-grid-256.json');
const pairs = '1.30/40 2/30 3/20 4/15 5/12 6/10 8/7.30 9/6.40 10/6 12/5 15/4 16/3.45 18/3.20 20/3 24/2.30 25/2.24 27/2.13.20 30/2 32/1.52.30 36/1.40 40/1.30 45/1.20 48/1.15 50/1.12 54/1.6.40 1/1 1.4/56.15 1.21/44.26.40';
const m = s => s.split('.').reduce((a,d)=>60n*a+BigInt(d),0n);
function power60(n) {
  if (n <= 0n) return null;
  let k=0;
  while (n%60n===0n) { n/=60n; k++; }
  return n===1n ? k : null;
}
function residue(n) {
  if (n===0) return 0;
  for (const p of [2,3,5]) while (n%p===0) n/=p;
  return n;
}
const exponents = pairs.split(' ').map(p=>{
  const [a,b]=p.split('/');
  return power60(m(a)*m(b));
});
if (exponents.some(x=>x===null)) throw Error('historical control failed');
console.log('28 exact powers:', exponents);
for (const page of g.pages) {
  const v=page.tokens.map(t=>60*g.alphabet.indexOf(t[0])+g.alphabet.indexOf(t[1]));
  console.log(page.page, v.filter(x=>residue(x)===1).length,
    v.filter(x=>residue(x)>1).length,
    v.flatMap((x,i)=>x===0?[[Math.floor(i/8)+1,i%8+1]]:[]));
}
```

Control power exponents: 2, 1, 1, 1, 1, 1, 2, 2, 1, 1, 1, 2, 2, 1, 2, 2, 3, 1, 3, 2, 2, 2, 2, 2, 3, 0, 3, 4. Original output: [[49,14,66,[]],[50,21,83,[]],[51,12,58,[[2,1],[6,6]]]]. No arbitrary pairing, radix sweep, fitted operation or original rune-language score was performed. Retire the direct finite reciprocal-table grammar; only new source evidence specifying mixed fields or a distinct record syntax could justify a successor. No authentic key, plaintext or cryptographic receiver recovered.

## Historical evidence gate and next discriminating action

The first-party 2013 specification gives an explicit `BASE29 3301 -> 3QO` example, whereas no surviving source-authenticated original instruction gives a p50 digit alphabet, unsigned-byte type, grouping, row direction or recipient. The original 2014 Stage11 delivery index has only sequential JPEG references and no separate table legend. The 11 May 2014 `decimal.txt`/`sexagesimal.bin` files are participant-derived from copied manuscript tokens, with documented corrections, so their base60 choices cannot settle author intent. These points are separately documented by [source-codec decision #1968](https://github.com/FlareZ123/liber-primus/issues/1968), [binary typing decision #2087](https://github.com/FlareZ123/liber-primus/issues/2087), and [exact provenance decision #2029](https://github.com/FlareZ123/liber-primus/issues/2029).

**One predeclared discriminator:** a previously unseen, creator-authenticated numeric value for the printed **first cell `3N`**. If that value is **203**, it selects the conventional base60 byte grammar; if it is **200**, it selects the drop-f base59 byte grammar. An authenticated encoding declaration or typed output of the adjacent original 138-rune pretable sentence could also decide. No inspected original artifact supplies this input. Mere source-copied participant decimal203 is not independent.

**Decision:** The source table does not currently select byte type, radix, consumer or key. Preserve the two readings as conditional, discontinue discrimination by table-only uniform-byte histograms, and seek a first-party typed example or an independently decoded table-adjacent instruction. Neither the overall LP2 cipher nor any of its 56 unknown pages is solved by this result.

## Relative column-order decision (Director #2899, Agent1, 26 November)

The physical 32×8 source supports a **radix-invariant candidate order**, but does not independently select it as a cipher key or assign it to a receiving text. This is distinct from #2626's full ordered-selection rank of eight byte values: here only their relative order is used, with no byte serialization.

**Historical forward/inverse controls.** The [archived fourth-onion OutGuess example](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2014/006-fourth-onion/README.md#outguess) specifies the same column-read permutation on all eight seven-character rows: zero-based [0,6,2,5,1,4,3]. Reading the original rows yields exactly `TOBELIEVETRUTHISTODESTROYPOSSIBILITYQ4UTGDI2N4M4UIM59133`; the inverse puts plaintext character j in ciphertext column perm[j]. The separate [archived 14-column solver](https://github.com/lastpacketbender/991948530947554/blob/main/2014/004-first-three-pages/columnar.py) hardcodes [2,8,9,1,12,13,11,4,5,7,3,0,6,10] and yields `GOODWORKULTIMATETRUTHISTHEULTIMATEILLUSIONJOINUSATFV7LYUCMEOZZD5J4ONIO`. Both actual implementations consume a permutation of column indices, rather than an alphabetic keyword. Neither specifies key-letter comparison, repeated-letter tie handling, a numeral-to-permutation rule, or changing row keys. A generic textbook keyword sort is a new hypothesis, not a recovered Cicada convention.

**Exact radix-free fact.** For a fixed-width two-character token with first character a decimal digit, both proposed numeral alphabets order the available characters exactly as ASCII does (0–9, A–Z, a–x, with f omitted in base59). Lexicographic order therefore equals ascending numerical order for both interpretations: the leading digit dominates the second digit, and the second-digit ordering is strictly preserved. This applies to all source-supported tokens, not just the observed rows. On the image-adjudicated `lp2-grid-256.json`, all 896 within-row pair comparisons agree, there are no within-row ties, and the 32 ascending read permutations are all distinct. The first row sorts to `1b 26 2l 33 36 3N 3p 3v`. The following one-based column-read orders are the direct consequence of the **conditional** ascending comparator, grouped by the physical 10|13|9 rows:

```text
57384126 61378452 34785162 46187532 84562173 34812675 23485761 84527361 36817452 72856143
62871543 84763125 74352816 53728164 75126834 56143782 73465821 14628735 31746825 32541876 64532187 84657213 68253741
38541276 18476235 84261753 31458627 76541382 62137584 61478325 53621874 68123574
```

Ties cannot obstruct this candidate on the actual rows. The radix ambiguity likewise does not obstruct it. Nevertheless all 32 orders being distinct means the panel cannot be a literal repeated fixed historical column order under that comparator. Each row's relative order loses its numerical/token multiset; it is not a full inverse of the printed object. The new row-dependent order would need an independently indicated consumer.

**Receiver gate.** Direct inspection of original scans 66–68 shows the 10+13+9 rows, three rune lines immediately above the first panel row and four below the last; the middle page has only panel tokens. No visible labels pair the 32 rows with 32 independent eight-column rune packets. The adjacent encrypted text is not an independently specified geometry or rune-identity-changing stage. #638 established that the historical column permutations alone preserve the plaintext symbol inventory and do not select a complete LP2 composite. No comparator direction or row-to-receiver correspondence is prescribed by either worked historical example, and no separately sourced eight-column payload was found in the inspected original panel and source examples. Choosing a block of 256 runes by its length would introduce a new unselected correspondence.

**Decision:** retain the radix-free order lemma and retire this particular historical-transfer proposal pending a genuine row-key instruction and typed receiver. No alternate direction, comparator, radix, packet origin, second cipher layer or language score was searched. No new plaintext or authenticated key. Reproduce the exact finite result with [the small standalone SFT](../sims/lp2_p50_relative_column_order_sft.cjs); the numerical core and both known output controls were executed in the connected JS runtime. The wrapper is not claimed to have a separate CI run.

## Printed-reference-table decision (Director #3039)

**Decision:** two documented pre-LP2 reference formats do not supply a literal panel excerpt. A re-encoding or different source remains possible; no source-selected representation or unknown plaintext follows. This is distinct from the ancient reciprocal-table and GEB-record decisions.

**Candidate 1 — RAND, A Million Random Digits (1955).** The publisher's [2001 facsimile edition](https://www.rand.org/content/dam/rand/pubs/monograph_reports/MR1418/MR1418.digits.pdf) preserves the earlier layout; the [publisher's digit dataset](https://github.com/RANDCorporation/milliondigits/blob/09739b344efb3ed20602f34023232c67f20f212a/digits.txt), Git blob `cb72b2b37aa240bf05b0ebe1c981e0c510c1e5e0`, was actually acquired in full (1,440,000 bytes). Parse the numbered rows and the ten five-digit fields in each: 20,000 rows of 50 digits, exactly 1,000,000 digits. The 2014 [NIST Handbook 133, Appendix B, printed p109](https://www.nist.gov/system/files/documents/2017/05/09/hb133-14-final-web.pdf) documents grouping this decimal material into two-digit columns when appropriate; the output remains decimal. The publisher's PDF and NIST page screenshot could not be retrieved through the available PDF renderer (cache miss); the original numerical dataset was retrieved. The task's premise that Cicada used RAND Corporation material in 2012 is **not authenticated by the sources inspected**. The [signed January 2013 TCP specification](../resources/external/2013-tcp-server-signed-source.md) contains a participant-generated RAND command, which is not a citation of the RAND Corporation book or an organizer-fixed shared digit tape. The existing [Dukotah public-pad sweep](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/ELIMINATION-LEDGER.md) already tests RAND as a key source; do not repeat it here.

The literal recognition rule preserves consecutive printed rows and a fixed source-column origin, trains on the first two eight-cell rows and predicts the remaining 30 rows exactly. For the RAND data, allow a 16-character substring at any of the 35 valid digit positions in each native 50-digit row (thus even relaxing native five-digit grouping). No radix conversion, source reordering, arbitrary digit extraction or language score. Result: **zero training locations and zero full matches**. A planted authentic 32-row rectangular excerpt at zero-based source row137, digit column7 uniquely recovers its location and all 30 withheld rows. Changing one withheld digit retains the same training location but rejects the full match. LP2 contains 42/256 decimal cells, 214 with letters, no fully decimal row, and only one maximal run of three decimal tokens (offset12; this short string occurs in the million-digit tape and provides no identification). A broader exact obstruction: any *fixed* cell-wise mapping of two decimal digits has at most 100 output symbols, fewer than LP2's 161 distinct tokens, even allowing arbitrary cell reordering. This does not exclude repacking larger decimal groups using a new, independently selected rule.

**Candidate 2 — US8235286B2, Fig.13 (2012).** The [published specification](https://patents.google.com/patent/US8235286B2/en), published 7 August 2012, describes an 8-column ×32-row example of 256 random hexadecimal **digits**, with one nibble per cell. The distinctive dimension motivates the comparison but is not a Cicada linkage. The grant PDF and individual drawing sheets returned cache misses; no literal drawing values are claimed to have been acquired. Its explicitly documented field type is sufficient to reject the literal two-character LP2 panel and any fixed cell-wise relabeling of this figure: at most 16 distinct source values versus 161 in LP2. Figures 12–15's documented nibble-to-binary layout does not specify a two-character LP2 numeral codec. Figure 16's longer sequence is a different field, with no source-selected LP2 cell mapping. No speculative conversion was tested.

**Reproduction.** [Standalone CommonJS gate](../sims/lp2_p50_printed_table_literal_gate_sft.cjs) accepts the exact publisher digit file, validates its Git blob hash, and uses the adjudicated [original LP2 token grid](../resources/liber-primus/lp2-grid-256.json). The numerical core and both exact controls ran in the connected JS runtime on the full publisher file; the Node wrapper has not separately run. [Machine-readable result](lp2-p50-printed-table-literal-output.json). No third-party digit tape is mirrored. Retire these two literal reference formats; reconsider reference-table recognition only if an independently dated candidate actually supplies the mixed-case two-character grammar, or an authenticated clue supplies its exact re-encoding. No new key, radix or original plaintext is established.
