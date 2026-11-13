# P55 nested word interiors and the p57 23-dot row-column inverse

**12 November 2026, Agent44. Classification: one new, original-clue-constrained reversible candidate with a negative direct-plaintext result. No genuine unknown LP2 plaintext, authentic encryption key or Cicada-selected cipher was recovered.** This builds on the previously executed [book-wide recursive word-center extraction](lp2-recursive-word-core-literal-gate.md), without repeating its general plaintext search. The additional experiment links a unique terminal-page numerical word geometry to an independently printed, uniquely sized red-dot stencil.

## Motivated source-to-source handoff

The **solved p57 PARABLE** instructs a reader to "shed our own circumferences" and "find the divinity within." The authentic source artwork on p57 ends in the **only 23-dot red punctuation stencil in LP2**, geometrically an exact **9-row × 5-column** sparse grid:

```text
.###.
#...#
.###.
#...#
.###.
#...#
.###.
#...#
.###.
```

The stencil's original source-image coordinates and uniqueness are independently fixed by [`sims/lp2_p55_p57_red_dot_core_sft.py`](../sims/lp2_p55_p57_red_dot_core_sft.py) and the original `74.jpg`. Its three alternating internal columns reproduce p55's and the p57 title's **13-dot** punctuation mark. It supplies **23 occupied source-visible cells, nine physical rows and five physical columns** without cipher selection.

The final *unknown* physical p55 image is `72.jpg`. Its first rune finishes a word begun on p54; the subsequent **16 complete words** have original GP lengths `[4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]`. For each complete word independently, remove the first and last surviving rune and repeat without resetting a word after a line break:

| Pairs removed from each complete word | Surviving runes | Active words |
| ---: | ---: | ---: |
| 0 | 75 | 16 |
| 1 | 43 | 11 |
| **2** | **23** | **7** |
| **3** | **9** | **3** |
| **4** | **5** | **1** |
| 5 | 3 | 1 |
| 6 | 1 | 1 |

The second-, third- and fourth-level survivor counts are exactly **23, 9 and 5**, all dimensions of the independently printed stencil. These are **nested**, not three separate lists of independently encrypted symbols. The deeper 9- and 5-rune survivors are strict subsets of the same 23 source glyphs. The deepest symbol is **U**, GP index1, embedded at position8 of the 23-rune stream. Its printed p55 rune index is29.

Precisely:

```text
23 symbols: G D A B F X I M U C P H NG D IA I G X EO TH TH I M
 9 symbols: X I M U C P H G TH
 5 symbols: I M U C P
 1 symbol: U
```

This specific **23/9/5 alignment** and its possible mathematical use were absent from the older book-wide recursive direct-reading test. Physical p51 also has local 23/9 after the second/third peel, but its subsequent fourth peel has **zero** survivors, so it is not the same four-level arrangement; it is not an independent significance calibration. The 23/9/5 match was found exploratorily after knowing the source counts; no probability of deliberate construction is inferred.

## Exact nested GP-prime checksum relationships

The **nine** and **five** independently determined inner symbols contain a second exact source relation. Canonical GP-prime weights sum to:

- **Nine-rune level 3:** `X I M U C P H G TH`, sum **253 = 23×11**.
- **Five-rune level 4:** `I M U C P`, sum **161 = 23×7**.

The common factor **23** is the number of occupied cells of p57's printed red stencil. The quotients **11** and **7** equal, in the correct order, the counts of **active p55 words after one and two peels**, respectively. These are fixed arithmetical facts from the original input; the arithmetic connection was noticed *after* the peel counts were found. It is a plausible structural checksum, **not proven Cicada intent** and not by itself an invertible encryption instruction.

A seeded **120,000-trial** conditional null independently permutes the rune values inside *each original complete p55 word*, retaining all word lengths, full word symbol multisets, and the exact `75→43→23→9→5→3→1` size profile. Only **212/120,000 (0.1767%)** word-preserving controls have **both** inner sums divisible by 23; **1/120,000 (0.000833%)** has the precise paired values **253 and 161**. Seed `0x55323`, Xorshift32; the full executable asserts both counts. The experiment says the observed alignment is sensitive to original rune positions, yet the targets 23, 11 and 7 and their way of association were discovered post hoc. Therefore these are **conditional descriptive frequencies**, not a fair discovery-wide p-value or proof of encryption. The arithmetic deserves future independently selected tests rather than a broad key hunt.

## Stencil-projection split: thirteen dots sum to 512

The original p55 terminal **13-dot** mark is exactly the three-column projection (columns 0, 2, 4) of the p57 **23-dot** mask. Place the p55 twice-peeled **23 source runes** into the 23 occupied cells in their printed top-to-bottom/left-to-right order. Keep the 13 cells present in the original 13-dot stencil and put the 10 omitted cells in a second stream. This source-selected **13+10 partition** has:

| Printed-stencil substream | Positions within the 23-rune list (zero-based) | Exact GP-prime sum |
| --- | --- | ---: |
| **13 retained dots** (columns 0, 2, 4) | `1,3,4,6,8,9,11,13,14,16,18,19,21` | **512 = 2⁹** |
| **10 complementary dots** (columns 1, 3) | `0,2,5,7,10,12,15,17,20,22` | **508 = 512 − 4** |
| All 23 source symbols | 0–22 | **1020 = 4×255** |

The thirteen-rune text is `D B F I U C H D IA G EO TH I`; the ten-rune complement is `G A X M P NG I X TH M`. Their combined prime sum of 1020 is a source fact independent of which mask is used. **512 also equals the bit length of the solved p56 AN END hash**, though that alone supplies no 512-bit preimage and does not prove an intended cross-page relation. The 10 complementary dots comprise two distinct five-dot columns, a visual reason to compare the separately observed two terminal groups of five circles on p57. That is an exploratory architectural parallel, not a recovered secret share.

Under the **same fixed 120,000 word-internal rune permutations** already described, only **267** controls reproduce a 13-dot projected sum of 512; **567** reproduce a ten-dot complement sum of 508; **1** reproduces **both exact source sums** (and **0** also reproduces both earlier 253/161 inner-layer sums). These are **retrospectively noticed numerical targets**, so the very low conditional joint frequency cannot be interpreted as an unbiased probability that Cicada designed this operation. It establishes a sharply constrained source-based hypothesis and a natural 13+10 segmentation for future decoding if a separate key-use rule is found.

## Fixed direct 512-bit run-length preimage of the AN END hash

The *same independently fixed thirteen retained rune positions* have GP prime weights **[89, 61, 2, 31, 3, 13, 23, 89, 107, 17, 41, 5, 31]**, totaling exactly **512**. Because the solved next physical page (p56) challenges the reader to find an object with a printed 512-bit hash, one small, fully specified prospective use of this equality is to interpret each positive weight as a binary *run length* in original source order, alternating zero and one. The 13 runs form one exact **512-bit (64-byte)** string. Starting with zero or with one covers both natural bit polarities without rearranging or omitting source runes.

[The source-input CommonJS test](../sims/p55_prime512_rle_hash_preimage_sft.cjs) reconstructs the 23 twice-peeled original p55 runes, projects the 13 fixed p57-stencil slots, asserts the exact source-prime weights and original p56's published 128-hex target, then hashes the two raw 64-byte strings using SHA-512, SHA3-512 and BLAKE2b-512. The two raw 64-byte streams themselves also differ from the target. **All six direct preimage candidates miss the target**. For example, the two SHA-512 digests begin respectively **fc6531f1fcd1f715** and **7b44f334250146ac**, while the target begins **36367763ab73783c**. The SFT outputs every full digest to allow byte-exact independent reproduction.

This retires only **alternating binary run-length coding of the exact 13 original GP-prime weights as raw 64-byte inputs to these three conventional hash functions**. The authentic page does not specify a hash algorithm or what representation of an onion page was hashed. There is no evidence selecting reversed runs, ASCII bit strings, other transformations, variable salt or a later cipher layer. The numerical 512-bit match remains an exploratory source observation, and this computation found no hash preimage or unknown manuscript plaintext.

### Ten-dot complement: second 512-bit candidate

The 23-dot mask also partitions into the original 13-dot projection and its ten-dot complement. The complement runes in row-major order are `G A X M P NG I X TH M`, with GP-prime weights `[17,97,47,71,43,79,31,47,5,71]` summing to **508**. One natural completion to a 512-bit stream inserts the four empty stencil corners as zero bits around the first and last two complement runs (before the first two, after them, before the last two, and after them). This is a second 64-byte candidate distinct from the 13-run stream.

For both alternating-run starting polarities, the resulting bytes do not equal the published target and their SHA-512, SHA3-512, and BLAKE2b-512 digests all miss it. SHA-512 outputs begin `fa4128e813b7db71` (start 0) and `b24f6c1b8adba3d4` (start 1). The SFT records full digests. This tests one source-motivated corner completion, not every possible encoding of the ten-dot complement; the source does not specify run-length encoding or the padding operation.

### Full 23-dot stencil: four-corner-completed 1024-bit candidate

A second, separately frozen construction uses **all 23** twice-peeled source runes rather than only the 13-dot projection. Their original GP-prime weights are:

`[17,89,97,61,2,47,31,71,3,13,43,23,79,89,107,31,17,47,41,5,5,31,71]`

They sum to **1020**. The p57 9×5 stencil has four empty corner cells at (row 0, column 0), (0,4), (8,0), and (8,4). Interpret each of the 23 prime weights as an alternating binary run length in row-major occupied-cell order, and insert one literal zero bit for each empty corner: before the first run, after the first three runs, before the last three runs, and after the final run. The resulting candidate is exactly **1024 bits (128 bytes)**. Both possible starting run polarities were frozen; corner bits remain zero because the source cells are empty.

The six direct hashes (SHA-512, SHA3-512, BLAKE2b-512 for each polarity) all miss the published 128-hex p56 target. The SHA-512 outputs begin `0e873d48a15650f3` (start 0) and `c2327e586c444d5a` (start 1). The SFT records every full digest and raw-byte prefix.

This is a bounded extension of the source-derived 23-dot / 512-bit observation: it tests one natural corner-completed 1024-bit raw-message construction, not every way the 23 symbols might relate to a hash. SHA-512 still applies its normal padding to the 128-byte message; this is **not** a claim that the constructed bytes are themselves a final SHA-512 compression block. The source does not authenticate prime-weight RLE, bit polarity, or SHA-512 as the page's hash algorithm. No preimage or unknown plaintext is recovered.

### Raw SHA-512 compression-function check

Because the corner-completed candidate is exactly one **1024-bit SHA-512 block**, I also tested the raw compression function rather than only hashing the 128-byte message (which would add a normal padding block). OpenSSL's `SHA512_Transform` was initialized with the standard SHA-512 IV and applied once to each source-fixed block. A correctness control confirms that the same transform reproduces `SHA512("abc")` from its correctly padded single block.

Neither starting polarity matches the published p56 target. The raw compression outputs begin `c00730a1542ed248` (start 0) and `178967665f4c7784` (start 1). The reproducible [compression SFT](../sims/p55_23dot_sha512_compression_gate.py) reconstructs the original p55 23-rune stream and weights, asserts the four p57 stencil-corner positions, validates the OpenSSL transform, and records both full outputs.

This closes only the **standard-IV, one-block raw SHA-512 compression** of the exact 23-prime RLE plus four corner-zero bits. It does not test custom IVs, other orderings, salts, or later compression blocks; none is selected by the source. The target hash algorithm remains unauthenticated.

## A fully specified GP29 row-column inverse

A human could map the **23 GP29 survivors** to the **23 occupied stencil cells** from top to bottom, left to right. Read the nine further-peeled symbols as row masks and the five further-peeled symbols as column masks, in their original order. Using the already-authentic **additive GP29** vocabulary from solved p56, test a plain, unfitted, subtractive transfer:

```text
For i=0..22, with source-stencil cell (row[i],column[i]):
P[i] = (C[i] - C[rowSource[row[i]]] - C[colSource[column[i]]]) mod 29
```

The source index selectors **within the 23-symbol stream** are:

- Nine row-key positions `[5,6,7,8,9,10,11,16,19]`.
- Five column-key positions `[6,7,8,9,10]`.

The row and column keys are thus **self-derived from the ciphertext**. This produces a **fixed linear transformation** `P=M×C` over the 29-element prime field; there are no unknown offsets, fitted key tables, random seeds or per-symbol secret permutations. The original p55 plaintext candidate is

```text
TH H C Y G C M A M L E TH J F U EO Y U AE EO I W EO
```

Original candidate IoC is **0.03162055336**, and no natural-language passage or source-supported directive appears. This direct inverse therefore fails as a transparent GP-prose decoder. An unrelated binary-to-text layer would be speculative unless a source independently selects it.

## Exact algebraic result: one necessary inner-state rune

The **unmodified** 23×23 linear matrix has exact rank **22**, meaning the plain 23-rune row+column subtraction loses one GP29 degree of freedom. It cannot by itself be a lossless 23-symbol block cipher. However, its kernel is **nonzero in the source-centermost coordinate8**. The deepest, original **single surviving U** therefore supplies exactly enough additional information to restore injectivity.

One concrete *length-preserving* correction uses the already visible interior instruction literally: retain `P[i]` at the 22 positions other than `i=8`, and output the original center rune `C[8]=U` unchanged at that position. This replaces the matrix's 8th output row by the unit vector that selects its 8th input coordinate. The resulting **23×23 matrix has full rank 23 and nonzero determinant over F29**; its unique inverse recovers all 23 source runes exactly. The source output under that convention is

```text
TH H C Y G C M A U L E TH J F U EO Y U AE EO I W EO
```

A direct positive uses **the first 23 genuine known GP symbols from solved p57** as *hidden plaintext*, applies the unique 23×23 matrix inverse to generate artificial ciphertext, and recovers **23/23** genuine text symbols under the same forward calculation, without tuning a key. The source-ciphertext original input likewise inverts to **23/23** exact glyphs, now with a genuine lossless operator. These are valid correctness controls, **not evidence that Cicada used this operator**. The design has no recovered unknown plaintext.

The reversible correction is a *new hypothesis*: the p57 instruction does not explicitly say to use center rune U as a published clear-state symbol, or prescribe GP29 row/column sums, stencil-cell reading order, signs, or a 23-rune encryption block. Retrospectively finding that the matrix has rank22 and one inner rune resolves its kernel is an intriguing correspondence, not an independently authenticated source rule. The other 22 converted symbols still appear random. **Do not present the mathematical reversibility itself as cryptanalysis success.**

## Two fixed p56 prime-totient transfers (both negative)

The solved p56 page supplies one authentic additive GP29 decoder:
`P[i] = C[i] - (prime(F[i]+1)-1) mod 29`, with Fibonacci numbers selecting one-based prime ordinals. Its first 23 key values are:

```text
1,2,4,6,12,22,13,20,3,1,27,16,1,11,11,15,20,24,2,14,10,20,13
```

The p55 twice-peeled 23-rune core is itself selected by the p57 23-dot stencil. Applying this exact p56 subtractive schedule directly to that source-order stream, starting at `F[0]=0` and letting every p55 symbol consume one key position, gives:

```text
source:   G D A B F X I M U C P H NG D IA I G X EO TH TH I M
decoded:  C NG L J B NG Y EA IA R S NG L EO T A S M I B NG M G
```

A second, more assumption-heavy placement applies the same schedule after the anchored 23-dot row/column inverse:

```text
intermediate: TH H C Y G C M A U L E TH J F U EO Y U AE EO I W EO
decoded:      U G U L D EO G R IA M L S I E M Y G G D IA F T EA
```

Neither output is recognizable GP plaintext. The p56 page's single literal-`F` exception is tied to its own ciphertext offset 56; no source supports transferring it to either p55 stream. The second, composite model also passes a synthetic positive: the first 23 genuine p57 GP symbols, encrypted by adding the fixed p56 key and applying the inverse anchored matrix, are recovered 23/23 by the matrix followed by p56 subtraction. Thus the negative is not an implementation failure. These two tests reject only the direct and post-matrix p56 key transfers; they do not authenticate the row/column matrix or reuse of the p56 key schedule. No phase, skip, sign, or key-sweep rescue was run.

## Reproduction and decision

[The stand-alone CommonJS source test](../sims/lp2_p55_23dot_nested_rowcol_inverse_sft.cjs) reads the original 29-symbol corpus and the original ink-annotation counts, reconstructs all 7 nested peel levels, fixes the 23 occupied dot coordinates, records the 23/9/5 source index mapping, proves both exact matrix ranks by F29 Gauss–Jordan elimination, decrypts and inverts the actual source symbols, and encrypts/decrypts an independently selected solved-p57 GP23 positive. It now also regenerates the first 23 Fibonacci-indexed p56 prime-totient keys, tests both the direct nested-core transfer and the post-matrix continuation above, and passes a composite synthetic p57 positive. The manual-only [source-word circumference CI run 43146061438](https://github.com/FlareZ123/liber-primus/actions/runs/43146061438) passed the earlier source-derived AES, prime401 and nested-matrix regressions, including the original native positive; it predates both p56-transfer additions above. The two p56-transfer outputs and composite positive are independently reproduced against the pinned source corpus and codified in the updated SFT, but are not covered by that historical CI run.

A separate direct attempt to use the original 2013 `DATA/560.13` XOR operation at the p15 source-fixed byte offset on the **same twice-peeled 23 runes**, under GP-index and GP-prime byte encodings, also yields no onion address or recognizable plaintext. It was executed on the full verified original historical file in [CI run 43145647103](https://github.com/FlareZ123/liber-primus/actions/runs/43145647103) and consolidated with the earlier, different first-peel central23 XOR [in the existing report](lp2-p55-central23-56013-xor-negative.md). This bounds a natural historically observed bytewise decoder without altering the new source geometry.

**Research decision:** preserve this as the smallest complete source-to-source, **mathematically reversible** terminal 23-dot GP29 model so far. The explicit original prediction and both fixed p56 Fibonacci-prime-totient transfers are negative for clear GP English. The row/column correction and cross-page key reuse remain unauthenticated hypotheses. The next meaningful advancement would be a *new primary-artifact clue* that fixes the 23-cell traversal and row/column operation or independently authenticates a 23-rune target, allowing a genuinely discriminating holdout. Avoid broad permutation/shift/key scans on this postselected structure.
