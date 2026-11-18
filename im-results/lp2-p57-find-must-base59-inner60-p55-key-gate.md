# p57 FIND/MUST base59 self-pointer and inner-60 key gate

**Agent 8, 17 November 2026. Classification: a source-shaped radix selector candidate plus bounded negatives for two direct p55 key consumers. No unknown plaintext or authentic key recovered.**

## Why this route was worth testing

The clear p57 PARABLE contains 20 original printed words. The sentence “WE MUST SHED OUR OWN CIRCUMFERENCES. FIND THE DIVINITY WITHIN AND EMERGE” offers a human-visible reason to test the GP-prime sums of MUST and FIND against the original p49–51 numeric table, with Euler's totient as the named “divinity” operation. This is a finite, source-led hypothesis rather than a generic search over table phases.

The original table tokens have two documented numerical readings: conventional base60 and the formal drop-f base59 alternative. For each of the 20 p57 words, the test sums the source-assigned GP prime values S and checks the self-pointer condition table[φ(S)] = S.

- FIND has S = 151 and φ(151) = 150. Under base59, zero-based table cell 150 contains 151. It is the **only** one of the 20 p57 words satisfying this self-pointer condition.
- Under base60, table cell 150 contains 153; none of the 20 p57 words satisfies the same condition.
- MUST has S = 186. The immediately outward cell 151 under base59 contains 186. The value 186 also occurs at cell 254, so the value alone is not unique; adjacency to the FIND cell selects cell 151. No p57 word sum matches the corresponding base60 cell 151 value, 189.
- φ(186) = 60, exactly the length of the table's third concentric ring. The FIND cell 150 is on the 68-cell ring; its immediate inward neighbor is cell 149 on the 60-cell ring, and its immediate outward neighbor is cell 151 on the 76-cell outer ring.

The full 20-word scan is important: raw word-sum/table-value coincidences are common (12/20 under base59 and 11/20 under base60). The more specific φ self-pointer occurs once under base59 and zero times under base60. This is a meaningful competing radix clue, but not a calibrated discovery-wide probability or proof of authorial intent. It also competes with a separate p57 date/PGP extraction that conditionally favors base60; neither path alone resolves the radix.

## Frozen geometry and candidate key maps

The source-shaped radial alignment is fixed, without a fitted phase:

1. Cell 151 (MUST) starts the 76-cell outer ring, which corresponds in length to physical p55's 76 original ciphertext runes.
2. Cell 149, immediately inward from FIND cell 150, starts the 60-cell ring selected by φ(MUST) = 60.
3. Traverse both rings in the same direction, testing only clockwise and counterclockwise.
4. Assign p55's original page-order runes to the outer ring from cell 151; read the inner ring as the key.

Two source-motivated key maps were tested:

- **Raw table key:** each inner-ring base59 value reduced modulo29 (60 key symbols).
- **Divinity key:** apply φ to each inner-ring base59 value and reduce modulo29. The ring contains one zero, at cell229; φ(0) is undefined, so omit that one cell, leaving 59 defined key symbols. No arbitrary replacement for φ(0) is used.

Both use the historically authenticated p56 subtraction direction, P = C − K mod29, and the authentic plaintext-F-transparent rule. All eight assignments of p55's three ciphertext Fs (offsets 15, 25 and 41) as literal plaintext-F bypasses or encrypted non-F symbols are enumerated in each direction. No extra phase, offset, cell permutation, value remapping, language-fitted key or unknown-plaintext crib is introduced.

## Original-cipher results

| Key map | Direction | First F-rule contradiction | No-bypass IoC | Native plant |
|---|---|---|---:|---:|
| Raw value mod29 | Clockwise | offset 5: 15 − 15 = 0 | 0.03263158 | 76/76 |
| Raw value mod29 | Counterclockwise | offset 12: 23 − 23 = 0 | 0.03122807 | 76/76 |
| φ(value) mod29, omit zero | Clockwise | offset 0: 21 − 21 = 0 | 0.03403509 | 76/76 |
| φ(value) mod29, omit zero | Counterclockwise | offset 0: 21 − 21 = 0 | 0.03438596 | 76/76 |

Every one of the 8 F-mask branches fails for each of the four cases. The raw-key contradictions occur before p55's first ciphertext F at offset15; the divinity-key contradictions occur at offset0. In every case, a non-F ciphertext rune would have to decrypt to plaintext F, which is forbidden by the authentic transparent-F forward rule. The 76-rune p57 native plants encrypted and recovered with each corresponding key and F-bypass rule pass **76/76**, confirming the receiver implementation.

For completeness, the no-bypass direct subtraction outputs are:

| Key map | Direction | Direct output |
|---|---|---|
| Raw value mod29 | Clockwise | AIUJAEFLYTOEEOONGEAGSYEXOEJESTHXAEBEONGIOFTYNGTLIAAWBXPAOEIALFCEAAENSIOEJNGNGHSNGFPDDPPTHTHNGDHEAXEAAE |
| Raw value mod29 | Counterclockwise | ANAEMPHAELEIATFPROEHJPMCTCFFRSSIABOOEIDDHCFCNDBXTHJLOESYSIPJEEORPPTNGEAHTHJNGBDGBNNGWEAYO |
| φ(value) mod29, omit zero | Clockwise | FEOPNLDNGOCEOAENGXPUSAENGTPDEOJXRHRIFOERGHFOEYOXNGCNGDOEXOEEAIDIADMTHNEAWMWICNUGPOEACTHIANTHEOOERH |
| φ(value) mod29, omit zero | Counterclockwise | FUYTHBNPMWOBBREOCIPPYYAIANGANNUHIERRTHSAIAPDIIAETHGIAIDNXTHWNGOIDTHXGEIDOEDOEAASWOEMCNGJYEAAE |

The four IoCs are near the uniform 1/29 reference (about 0.03448); none supplies a readable p55 passage.

## Frozen address grammar and matched nulls (Agent 6, 17 November 2026)

Issue [#1357](https://github.com/FlareZ123/liber-primus/issues/1357) challenged the strongest unsupported premise: is the \`FIND→MUST\` alignment unusually selective *before* a decoder is chosen? The [source-read-only, seeded SFT](../sims/lp2_p57_find_must_address_null_sft.cjs) freezes this grammar: for each of **all 20 original p57 printed word occurrences**, compute its source GP-prime sum \`S\`; only when \`1≤S≤256\`, address original printed table cell \`S−1\` (one-based S), require its radix value to equal S, and require **exactly one** cardinal outward neighbor from that concentric ring; the outward cell must equal the sum of a **different** p57 word occurrence. No special treatment is given to \`FIND\` and \`MUST\` during scoring. Nine of the 20 word occurrences have physically eligible unique-outward addresses; all printed source words are eligible as second targets. The same test uses both intact f-omitting base59 and conventional base60 interpretations, with source tokens and joint radix readings unchanged.

The original table gives exactly **one** ordered word-pair event, \`FIND(151)→MUST(186)\` at cells150→151 under base59, and **zero** under base60. Its baseline must account for selecting the words/radix/operation after inspecting the artifact:

| Frozen null; 300,000 seeded trials each | Base59 any transition | Base60 any transition | Either radix | Exact fixed FIND/MUST under base59 |
| --- | ---: | ---: | ---: | ---: |
| Global shuffles of all 256 **original two-character tokens** | 720 | 656 | **1,375** (0.4583%) | **7** |
| Independent shuffles of the eight original tokens **within each of the 32 printed rows** | **5,486** | 0 | **5,486** (1.8287%) | **5,486** |
| Length-matched, with-replacement draws from **553** filtered words in the independently solved LP1 prose, against the **unchanged** table | **3,250** | 0 | **3,250** (1.0833%) | Not a fixed-word-pair test |

The last reference control greedily maps English text to GP runes, normalizing K/V/Q/Z to C/U/C/S and treating GP digraphs as single runes, and keeps the unmatched length-14 p57 word unchanged (its sum451 cannot address the grid). It is a documented *approximate* solved-source word-distribution comparison, unlike the exact source-token shuffles. Each null family asks a different conditional question; the percentages must not be multiplied or interpreted as a single discovery-wide p-value. The exact fixed-pair global permutation probability, conditional on deciding \`FIND/MUST\` and its cells in advance, is **2/(256×255) ≈ 0.00306%** because the base59 table has one 151 and two 186s. Under the stronger post-selected row-composition conditioning, the row18 source contains one of each and the **exact probability is 1/(8×7) ≈ 1.7857%** for placing them in that ordered final-column pair. These are independent analytic checks on the random trials.

**Consequence.** The full frozen two-word path is uncommon under table-global randomization, but readily reproducible at the percent level when preserving the original row content or drawing authentic solved-text words. Its very specific \`FIND/MUST\` appearance does not repair its retrospective operator selection. The further equation \`φ(186)=60\` identifies a ring length once \`MUST\` has already been selected; it cannot be counted as an independent key or corroborating ciphertext. This is a defensible **provisional navigation clue**, not evidence of an actual decryption.

### Original numeral-alphabet occupancy and codec identifiability

The original 256 two-character tokens across physical JPEGs **66–68** contain **no lowercase \`f\`** among their 256 second characters. This initially motivates the f-omitting 59-digit interpretation, but a finite-source null is essential. The printed leading characters consist of **239** digits in \`0..3\` and **17** digit-\`4\` prefixes. Under a specific source-conditioned base60 null, the former have **60** possible second digits per legal 8-bit byte, while the latter have **16**. Hold those first-character counts (and their positions) fixed, sample the second digits independently and uniformly among the legal possibilities, and calculate *exactly* by inclusion-exclusion rather than simulation:

| Source-conditioned event in 256 printed second digits | Exact probability, rounded |
| --- | ---: |
| At least one of the 60 possible glyphs is missing | **60.3227%** |
| Exactly one glyph of any identity is missing | **38.2027%** |
| The named lowercase \`f\` is missing, regardless of others | **1.8009%** |
| Lowercase \`f\` is the **only** missing glyph | **0.7747%** |

These are different conditional questions, not an implicit p-value for discovering base59. In particular, selecting the missing glyph *after* seeing the table makes the broad **38.2%** one-missing event more pertinent than the much smaller preselected \`f\`-only probability. A separately authenticated author clue that singled out the lowercase letter \`f\` in the numeric alphabet would change the prior-selection condition; none has been identified. Uppercase GP rune \`F\` in p56's authentic skip mechanism does not alone identify the lower-case second-digit \`f\` in a distinct numeral alphabet.

The two complete 8-bit codebooks are **exactly observationally tied** on the unmodified table. The conventional full base60 and the f-deleted base59 alphabets each encode exactly 256 byte values, with **252** original two-character codewords in common. Base60-only symbols are \`0f,1f,2f,3f\`; f-deleted base59-only symbols are \`4G,4H,4I,4J\`. **Every one of the 256 printed tokens lies in their 252-element intersection**, so an iid uniform-byte generative model assigns the exact observed ordered token list probability \`(1/256)^256\` under either alphabet. The codec likelihood ratio for those two models is **1**. Selecting \`f\` after observing its absence cannot break this equality or authenticate base59. An independent original-source plaintext constraint, checksum, authenticated numeral alphabet, or uniquely specified receiver is still necessary.

[Single-file exact inclusion-exclusion and codebook support reproduction](../sims/lp2_p57_find_must_address_null_sft.cjs) uses only immutable canonical source text and outputs both exact-coded null summaries; no new decryption was inferred.

## Decision and limits

The original direct-decryption conclusion remains intact: no authenticated
2013–2016 source specifies an outer-to-p55 byte/rune receiver, a 76-rune key
clock, or the plaintext-F handling needed to turn the FIND/MUST geometry into
unknown plaintext. The two tested inner-60 additive consumers and the other
completed p55 receivers remain exact negatives and should not be rerun.

The earlier statement that the FIND/MUST address grammar lacked an independent
source selector is now **superseded for navigation** by the p27/DH23
circumference route. Independently recovered client private exponent **15**
selects p57 word15 **FIND** immediately after the circumference clause. Its
prime sum151 and divinity `phi(151)=150` enter the existing self-pointer at
cell150. Signed shared value2 gives exactly two inward circumference steps
from outer cell151 through FIND150 to cell149 on the selected 60-ring. Under
base59:

`151:186=MUST -> 150:151=FIND -> 149:171; 171 mod151=20=EMERGE word position`.

EMERGE has prime sum300, returning to the independently selected p55
boundary300. See
[`lp2-p27-dh23-find-emerge-radial-loop.md`](lp2-p27-dh23-find-emerge-radial-loop.md).

This reopens the address grammar as a **source-constrained navigation loop**,
while leaving it closed as a p55 decipherment method. It also supplies a new
base59 discriminator at the radial cells: base60 gives 189,153,174 and does
not reproduce MUST/FIND/EMERGE. No unknown LP2 plaintext, authentic p55 key,
web-hash preimage, or final destination follows yet.

**Reproducers:** the original p55 negatives remain
[`lp2_p57_find_must_base59_inner60_p55_key_sft.cjs`](../sims/lp2_p57_find_must_base59_inner60_p55_key_sft.cjs)
and
[`lp2_p57_find_must_address_null_sft.cjs`](../sims/lp2_p57_find_must_address_null_sft.cjs).
The new navigation continuation is
[`lp2_p27_dh23_find_emerge_radial_loop_sft.cjs`](../sims/lp2_p27_dh23_find_emerge_radial_loop_sft.cjs).
