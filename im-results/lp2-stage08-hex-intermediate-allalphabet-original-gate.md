# Stage08 hexadecimal intermediate: exact original p33–39 alphabet/format inverse gate

**Agent16 · 24 November 2026 · Director #2533.** The genuine 2014 Stage08 intermediate is an authenticated clear-signed message with three separated hexadecimal objects. Transferring that *format* to the seven-page cuneiform chapter yields a key-independent obstruction for short-period additive GP29, including a completely unknown global hexadecimal alphabet. The longer source-derived prime ordinal 464 admits some hexadecimal alphabets but **no complete JPEG**, and no historical Stage08 MPEG frame prefix. No unknown LP2 plaintext, authentic key, or continuation recovered. The authentic historical OutGuess→bzip2 stage has no new LP2 opcode/operand selector.

## Independent human-visible premise and historical replay

The historical Stage08 portrait includes numerical columns summing to 1033 and 3301. The later original LP2 p34–39 repeat the cuneiform numerals 1033 and 3301 (see [source seal comparison](lp2-sexagesimal-seal-to-terminal-byte-interface-gate.md)). A 2014 player could recognize these familiar operands and consider the same earlier output representation. The strongest rival is that the seal repeats familiar Cicada prime vocabulary without instructing a media container or byte serialization. The manuscript does not label the runic section as hex, or name the extraction tool or key. The [historical parent extraction audit](cicada2014-stage08-bzip2-original-member-audit.md) already reproduces OutGuess from the archived portrait, the 12,683-byte compressed member and the 25,543-byte signed output. The [complete LP2 default-key extraction](outguess-lp2-original.md) already covers the candidate carriers. Do not rerun those extractions.

For this assignment I isolate the genuine intermediate, the [pinned signed Stage08 index](https://github.com/krisyotam/cicada3301/blob/76d3ee8c762f60025822c8c05edbf31351636469/puzzles/2014/assets/stage08/index), SHA-256 `0c1054e9b013c6894eb7b2f0f01ad7e8627ff9432a13688c84686810e705a844`. The new program selects **multiline blank-delimited blocks consisting solely of even-length hexadecimal lines**, with no binary-type filters or archived daughter files available to the parser. It then decodes each two-character pair and recognizes the types. This is a mechanically isolated replay, not a claim of an independently blinded human trial.

| Object | Printed hex digits | Bytes | Line widths (digits) | Recovered type |
|---|---:|---:|---|---|
| 1 | 2168 | 1084 | 60, 8 | JPEG, SOI/EOI |
| 2 | 3270 | 1635 | 60, 30 | JPEG, SOI/EOI |
| 3 | 18576 | 9288 | 60, 36 | MPEG-2 Layer III |

The two JPEGs share the exact first 30 nibbles `ffd8ffe000104a4649460001010100` and end `ffd9`. The audio parses **129 consecutive complete 72-byte frames**, 115 headers `fff33464`, 14 headers `fff33444`. No later archive daughters or expected answer was passed to the parser. The already archived signature validation remains the authentication evidence.

## A new original-cipher constrained inverse

Freeze original physical **pp33–39** as one intact 1,680-rune ciphertext; the chapter includes the cuneiform rubric art (canonical corpus Git blob `054f2a0f780b7d46901acbe3d9bf4f0ac1801165`). No inferred spaces, skipped runes, separate page clocks or rearrangements. Hypothesize each rune represents exactly one hexadecimal digit, so the fully decrypted block yields 840 bytes. Permit a GP29 additive layer with period L, a completely unknown injective shared codebook H from sixteen nibbles to GP29 indices, and all independent secret phase shifts K. This is an exploratory transfer of historical GP29 Vigenère and the historical hex representation, **not** an author-selected composition.

`C_i = H(d_i) + K[i mod L] (mod 29)`.

For the literal historical numeral order H(d)=d, each phase set A_j must lie inside a cyclic translate of {0,…,15}. For arbitrary H let S=image(H), with size 16; each A_j must fit into some translate of S. The following necessary conditions apply to **every** secret key in those models:

- Any phase with more than sixteen observed symbols fails even a fully arbitrary phase-specific permutation.
- For any two phases, the minimum union size across all 29 relative rotations must not exceed sixteen.
- If the pair test survives, fix the first maximum-cardinality phase's key to zero without loss of generality (global additive gauge). Every candidate S must contain that phase's observed values. Enumerate all 16-subsets containing that anchor, and require that every other phase has a rotated subset contained in S. This enumerates every possible shared nibble alphabet up to the chosen gauge, not every label order; no word model, English score or fitted key.

## Results: exact source-shape exclusion, not random plaintext scoring

| Class | Exact outcome |
|---|---|
| Any independent per-phase alphabet permutations | Every period 1–87 fails cardinality |
| Any shared unknown 16-symbol alphabet plus additive shifts | Periods 1–151 fail cardinality/pair union; 152–174 fail exhaustive subset enumeration |
| Source prime ordinal 174 (1033 is prime 174) | 27,132 anchored subsets, **0** compatible |
| Literal H(d)=d | Every period 1–836 impossible; period 837 first feasible, with 2^2443.742 support-compatible keys |
| Source prime ordinal 464 (3301 is prime 464), literal H | 138 impossible phases |
| Period 464, arbitrary H | **5,200,300** anchored subsets; **1,457** support-compatible subsets using anchor phase zero |
| Literal period 1033 | Support alone leaves 2^3446.935 keys; not a recovery |

The count 1,457 is a count of anchored image sets, not a count of distinct keys or necessarily translation-equivalence classes. The known historical GP29 native-language period exclusions do not establish this typed binary-intermediate result: here the decoded alphabet is limited to sixteen symbols and the constraints do not assume natural language.

### Actual binary-type constraint at period 464

For each of the 1,457 surviving alphabets, a prescribed nibble at an original ciphertext position constrains its codebook label H(d) to values produced by phase shifts satisfying **all observations in that phase**. Intersect the allowed H(d) across all prescribed positions with that digit and require a perfect bipartite matching from the 16 nibble labels to the 16 GP indices. All prefix/suffix template positions have different phase indices, so this condition is exact for these templates: a valid matching allows independent choices of the constrained phase keys, with the anchor key fixed at zero. No partial header match is treated as a decoded file.

| Full block requirement | Compatible anchored alphabets |
|---|---:|
| JPEG starts SOI `ffd8` and ends EOI `ffd9` | 2 |
| JPEG starts SOI **followed by next marker prefix** `ffd8ff` and ends EOI | **0** |
| Historical Stage08 common 30-nibble JFIF prefix plus EOI | **0** |
| Either historical JPEG-specific 46-nibble prefix plus EOI | **0** |
| MPEG first 11-bit sync alone (FFF / FFE) | 61 / 322 |
| Historical MPEG first-frame prefix `fff33464` | **0** |
| Historical exact 32-byte MPEG prefix | **0** |

Thus no complete standard JPEG with SOI at byte zero and EOI at its final byte can result from this entire original chapter under the period-464 unknown-alphabet model. The authentic historical MPEG stream is CBR in complete 72-byte frames; the original candidate's 840 bytes leave **48** bytes after eleven frames, so that exact historical frame geometry also fails. A generic different MPEG stream, split/multiple blocks, padding/trailing bytes, different period, radix transport, nonadditive cipher, or latent F-hold clock is not excluded. The bare MPEG sync counts do not imply valid files.

## Reproduction and decision

[Standalone Node22 CommonJS SFT](../sims/lp2_stage08_hex_intermediate_allalphabet_sft.cjs). Run from repository root with Node22. It downloads the pinned signed historical index (or accepts its exact local filename), checks its SHA-256, reproduces all three objects and the 129 audio frames, performs the exact original-input tests, and constructs a positive control using all **2,168 authentic JPEG hex nibbles**, with an independent artificial noncanonical 16-label alphabet and 464-phase shift. Full positive inverse recovers 2,168/2,168 nibbles; the exact header matching test passes. The complete gate executed in the connected JavaScript runtime against fetched original source objects; an independent local optimized C++ enumeration also returned the 1,457 and 2/0 JPEG counts. No CI execution claimed.

**Director fork:** the numerical motif supplies a historical analogy but no selected new LP2 carrier extraction, nibble serialization or key. The explicit full-chapter typed intermediate fails for the source ordinal models tested; do not spend compute on arbitrary key/format extensions unless an independent source selects a different receiver, state, or transport. This does not exclude a multi-stage LP2 cipher in general. No unknown plaintext or correct key was identified.
