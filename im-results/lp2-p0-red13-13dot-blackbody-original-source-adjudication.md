# Original LP2 p0 opening: 13 red title runes, marker after rune13

**Agent42, 16 November 2026. Classification: exact original-image input correction. No new unknown-page plaintext, key, or deciphering mechanism.**

## The correct original first line

The immutable source is physical LP2 p0, scan resources/liber-primus/17.jpg, 2400x3600 RGB, SHA-256 197e1e153958b9a2736b09c10eea7d8bb00e0632fd22a8d9606840becc79942e.

| Source segment | Original zero-based GP rune offsets | Text | Physical ink |
| --- | --- | --- | --- |
| First heading word | 0–7 | SHEOGMIAF, original runes ᛋᚻᛖᚩᚷᛗᛡᚠ | Eight RED runes, first giant initial |
| Small ordinary word divider | after rune7 | one small dot at (1123,725) | RED |
| Second heading word | 8–12 | SYENGC, original runes ᛋᚣᛖᛝᚳ | Five more RED runes |
| Large 13-dot paragraph marker | offset13 | 13 separately rendered dots at x1405–1444 | RED |
| First black body words | 13–19 | THJGAE-FJOE, original runes ᚦᛄᚷᚫ-ᚠᛄᛟ | BLACK |

The existing source transcript starts with ᛋᚻᛖᚩᚷᛗᛡᚠ-ᛋᚣᛖᛝᚳ.ᚦᛄᚷᚫ-ᚠᛄᛟ-/ and correctly records the 8+5 rune title and the first following black-body words. Its full stop after the second red title word corresponds to the large red 13-dot mark, whereas the small word divider after the first word is separately visible. The derivative ink annotation records red length13 and large punctuation [[13,13,"red"]], both correct on this page.

## The precise error in the previous purported correction

The 16 November report im-results/lp2-p0-red8-13dot-black5-original-source-correction.md stated that there were eight red runes, then the 13-dot marker at offset8, then a five-rune black word. Its read-only pixel census was accurate; **its interpretation of how many rune glyphs occupied each crop was false**. It labeled the entire red continuation crop x765–1388 as seven ordinary red continuation runes when that area actually includes **twelve** smaller red runes: seven completing heading word1, a small red word dot, then five forming heading word2. It misassigned the black crop x1449–1777 to second title word SYENGC; those black glyphs are in the next body sentence THJGAE-FJOE.

Original JPEG pixels with the earlier test's same red and near-black thresholds resolve the miscount without inventing a new plaintext:

| Crop (x0,y0,x1,y1), exclusive right/bottom | Red pixels | Near-black pixels | Reading |
| --- | ---: | ---: | --- |
| (620,640,758,1190) | 25133 | 0 | Oversized first rune of first red word |
| (765,640,1122,770) | 14256 | 0 | Seven red runes after oversized initial |
| (1122,640,1135,770) | 100 | 7 | One 10x10 ordinary red word dot at x1123–1132, y725–734 |
| (1135,640,1395,770) | 9102 | 474 | Five red runes of second red word |
| (1399,640,1448,770) | 1116 | 0 | Thirteen red chapter-mark dots |
| (1449,640,1777,770) | 0 | 11434 | First seven runes of black body |

The first seven smaller red runes appear in seven connected components with area at least70. The second five red runes appear in six components at the same threshold because one printed glyph has disconnected ink. The word dot is a separate component, and the large chapter mark is exactly thirteen separated dots. Pixel values and original GP transcript are locked in the revised [single-file source test](../sims/lp2_p0_red13_marker13_original_image_sft.py). The original red image content is continuous until the 13-dot mark, with the small divider after word1.

## Consequence for actual cryptanalysis

The original p0–p2 729-rune opening has a 13-rune red heading followed by a 716-rune chapter remainder. Treating p0 body as beginning at offset8 would introduce five authentic red heading runes into the wrong cipher register. The previous red8-marker8 key-switch hypothesis is excluded by this direct image reading. The older published total of 225 red runes should **not** be reduced by five based on p0.

## The 13-dot mark is not a source-selected cipher initial state (Issue #1905)

The p0 image establishes a precise *layout* boundary: 13 red heading runes, then the large red 13-dot mark at GP offset13, then black body. That is the only operation selected by this page itself: exclude the heading/marker from the black-body ciphertext register and begin the body at offset13. It does not specify a key, a GP29 direction, a state-update law or a reset schedule.

The first later red 13-dot mark in physical reading order is the blind p2 consequence frozen in Issue #1905. Original p2 image **19.jpg** places it at GP offset **201**, exactly equal to p2's 201-rune count: it follows the final body rune and has no following p2 rune. P1 has no red 13-dot mark. The full LP2 annotation census finds **30 red 13-dot marks across 58 pages**: **19 internal**, **10 terminal**, and **one at page offset0** (p15). Thus p0's offset13 mark is one instance of a recurring punctuation family. P2's terminal placement only rejects a requirement that every mark introduce a new segment on the same physical page; it is compatible with a reset before the next page or section. The solved p56 prime-minus-one clock crosses internal marks without reset, rejecting a universal reset for that known cipher. The p0 13-rune heading / 13-dot equality is a local layout alignment, not a key selector.

| Original page | Red 13-dot offset | Page rune count | Position |
| --- | ---: | ---: | --- |
| p0 (17.jpg) | 13 | 262 | internal; after the 8+5 red heading |
| p2 (19.jpg) | 201 | 201 | terminal; after the last body rune |
| p15 | 0 | page-start | the only red 13-dot mark at offset0 |

At most three low-description readings are warranted:
1. **Delimiter only:** use the 13-dot mark to separate p0's red title from its black body. This is source-supported and fixes the body start at offset13; it is not a cipher.
2. **Constant ±13 GP29 shift:** the dot count makes 13 a conceivable shift, but neither sign, phase nor scope is selected. It is not run.
3. **Period-13 red-title key:** the image gives no instruction that the title is a key, but the simplest printed-order additive receiver has now been tested by Agent14 (25 November): use the exact 13 red GP29 values as a period-13 key from the first black body rune, with both arithmetic signs, on the 249-rune p0 body and the 716-rune p0–2 chapter remainder. Neither output develops a language signal; exact values and the bounded decision are below. This retires only the raw printed-order repeating additive key. The separate dot-ordered repeating-key and autokey tests are in [the p0 topology report](lp2-p0-red13-dot-topology-readout.md).

The dated 4 February 2015 prime-delta dialogue is participant-sidecar, not a first-party Cicada instruction. It describes an imaginary preceding F, successive-prime shifting and GP29 differencing; it does not connect that operation to the p0 red title or the 13-dot mark, and it supplies no title-key or page-reset rule. The 2015 idea therefore cannot fill the missing selector. Agent14's direct printed-order test below now supplies the first p0–2 output and language score for the raw title-as-key candidate, but it does not change this source-level conclusion.

The external proposed Latin SECUENDI RATIO calculation remains an unverified arithmetic fit on the 8+5 title, using separately chosen keys and cipher directions. The physical placement supplies neither key nor direction. No p1/p2 cipher output, language score, or new cipher sweep was run; the p2 check was only the fixed original-image marker position.

## Direct printed-order red-title Vigenère test (Agent14, 25 November 2026)

The source image fixes a 13-rune red heading in printed 8+5 order, then the 13-dot boundary and black body. A contemporary solver could try the title itself as a period-13 GP29 additive key, beginning at the first black rune. This is a compact, recognizable Vigenère hypothesis; it is not an operation prescribed by the image. The exact raw key is `[15,8,18,3,6,19,27,0,15,26,18,21,5]`. I tested only the two arithmetic directions, phase zero, with one continuous key clock and no F bypass or page reset.

| Target | Length | Raw IoC | C−K IoC | C+K IoC |
|---|---:|---:|---:|---:|
| p0 black body | 249 | 0.03436326 | 0.03462236 | 0.03355357 |
| p0–2 chapter remainder | 716 | 0.03410165 | 0.03435559 | 0.03419541 |
| Clear p57 control | 95 | — | — | 0.06270997 |

Neither direction yields a readable opening or a natural-language frequency signal. The chapter-remainder test starts the key at p0's first black rune and carries it continuously through p1 and p2, matching the original 716-rune opening unit. The direct printed-order test is distinct from the dot-topology permutation, the 13-rune autokey, and the 2015 D/E compositions already tested elsewhere. Exact inputs, original p0 image hash, both directions and round-trip implementation checks are preserved in [the Node 22 SFT](../sims/lp2_p0_red13_title_key_sft.cjs). It passed the repository's read-only Node 22 workflow, run [#2653](https://github.com/FlareZ123/liber-primus/actions/runs/45724628867).

**Decision:** retire the raw printed-order period-13 additive receiver on p0 body and the p0–2 chapter remainder. This does not show that the heading has no puzzle role; it shows only that this obvious direct Vigenère consumer does not recover the black text. The image still selects the layout boundary, not a key role or cipher direction.


## Historical plaintext-F clock and exact shared title-multiset decision (Agent14, 26 November)

The direct title-as-key route omitted the authentic Cicada plaintext-F bypass in the previous ordinary-consuming test. Restore that historical rule: with decoder sign s, a non-F plaintext rune is P=(C+sK[j]) mod29 and consumes one key cell; a literal plaintext F emits C=0 and leaves j unchanged. In particular, a computed P=0 on a consuming branch is illegal even if the ciphertext is not F. The target is the original 716-rune black remainder of p0–2, with no change to the source transcription.

**Fixed title order:** a 13-state exact dynamic program counts every legal F hold/consume path without a language model. For the literal printed order and the previously proposed dot-topology order, all 13 starting phases and both signs were exhausted (52 cases); none reaches the end of the chapter. At phase zero, printed minus/plus die at body offsets 37/74, dot minus/plus at 43/39. Only printed-minus initial phase 3 survives p0's 249 black runes (30 distinct paths); it dies at body offset 405. The other 51 fail within p0. Synthetic p57-derived controls pass for all four order/sign combinations. This is an exact algebraic exclusion for one continuous period-13 clock, not a language-score decision.

**Arbitrary order is structurally possible:** the two full 716-rune exact replay witnesses in the SFT use cyclic keys `[0,8,3,19,18,18,21,5,15,27,6,15,26]` (minus) and `[18,21,26,0,27,5,8,19,18,6,15,15,3]` (plus). Their plaintext IoCs are 0.0343712 and 0.0342540 and their outputs are nonprose. These witnesses were found by a matching-based search over F histories; they establish existence, not the number of legal inverses. They are not authenticated keys.

**Intact-group arbitrary-order relaxation (H-shuffle):** give every group its own independent key ordering and initial phase, while preserving the exact multiplicities of the 13 title rune values. Each original complete group has length ≤11, so every consuming position uses a distinct key cell. A candidate native word is compatible iff its F positions have C=0 and the multiset of its required consuming shifts is a submultiset of the title. This is an exact per-group criterion under the deliberately relaxed receiver. The pinned register has 32,232 source Latin word types and 36,740 distinct rune forms, using both canonical and source-native ING/IO contractions from TextBlob and Gibran/Shakespeare/Emerson/LP1 references. The 156 original groups contain 36 (minus) or 31 (plus) unsupported groups, versus a 5% budget of 7. Three independent title-order controls per sign retain all 156 planted word forms. Allowing unknown boundaries while keeping the length inventory, but still permitting a different key order per interval, weakens the lower bound to 3/4 OOV; that weaker relaxation does not exclude H-decoy.

**Shared-order latent-inventory exact receiver:** preserve only the multiset of original printed word lengths, allow every possible true start and arbitrary independent starting phase per word, and use a single unknown cyclic permutation of the raw title multiset. The length 8–11 inventory is 8/6/4/2 = 20 long words. Even spending all seven OOV allowances on long words requires at least 13 supported long words.

For each sign, enumerate every length 8–11 interval and every matching lexical form. Each accepted form fixes an ordered consuming shift substring. Enumerate every multiset completion into a cyclic 13-cell key; normalize its rotation at the unique zero rune. Keys outside the anchor union support zero long words. For every nominated key, count distinct compatible intervals, cap the equal-length disjoint packing by that length's inventory, and sum over lengths. Independent per-length packings may overlap across lengths, so this sum is a rigorous upper bound, not a claim that all supported intervals can be jointly placed.

| Decoder sign | Interval/form pairs | Completion emissions | Unique cyclic keys | Maximum supported long words | Minimum OOV |
| --- | ---: | ---: | ---: | ---: | ---: |
| Minus | 141 | 12,762 | 12,605 | 2 | 18 |
| Plus | 133 | 12,068 | 11,987 | 2 | 18 |

Both signs have zero keys reaching 13. The total 119,750,400 possible cyclic title arrangements need not be brute-forced: every key supporting a long word is in the exact anchor union, and all others fail the threshold immediately. Four deterministic hidden-order plants using the same 716-rune length inventory (two orders × two signs) recover a unique threshold-passing cyclic key, support all 20 long words and retain the true key. These are same-register calibration controls rather than independent natural-text validation. This result rules out the shared title-multiset cyclic additive receiver under a conserved native-GP length inventory and ≤7 OOV even if printed boundaries are displaced, true word order is arbitrary, and per-word clock origins are free. It does not exclude changed word-length inventories, other plaintext registers, interleaved key cells, different alphabets, or a genuinely different title role.

Reproducers: [fixed clock, arbitrary-order witnesses, intact-group and relaxed latent packing](../sims/lp2_p0_title_multiset_fhold_original_sft.cjs) · [exhaustive shared-cycle latent anchors](../sims/lp2_p0_title_multiset_latent_long_anchor_sft.cjs). Both computational cores were executed on exact GitHub source blobs in the connected JS runtime; standalone filesystem wrappers were not separately run. The two explicit witnesses were found in a local compiled matching search and independently replayed by the first SFT. The source corpus blob is `054f2a0f780b7d46901acbe3d9bf4f0ac1801165`, transcription `43bfeb6bf8dabaf25b0446cc519f8d91d205d8a7`, TextBlob `140e1d22b5f8c45deddd2e8b25549d9d6307d938`, Gibran `df260a07d56bf5998d40a6360b6132c35c252d10`, Shakespeare `94c677ad9dd50771c6670e0c4e4dad9052b46d85`, Emerson `a92be8ba5b3511a003a22ba31523c14397aaa83a`, and LP1 reference `8ed037a6ddeef2b20a10bd6a84830e7cf9f43f7d`.

**Conserved-inventory decision:** this receiver is negative under the stated finite register. The next subsection removes its inventory assumption.

## Complete continuous-clock title-multiset inverse, with and without F hold

The preceding anchor bound preserves a word-length inventory. Remove that assumption entirely. First, the exact forward/backward phase-mask test on all 24,592 nominated anchor cycles leaves 74 minus and 2 plus keys with any complete legal path. Only 23 minus and zero plus cycles retain an actual length-8–11 dictionary anchor on such a path, with at most one anchored interval/form per key. The exact trigram Viterbi maximum across these 76 keys, trained on Shakespeare, Emerson and LP1, is −5.859928 / −6.252244 nats/rune for minus/plus. A Gibran-file-header plant (Gibran omitted from that trigram training; other books contain similar Gutenberg boilerplate) ranks its planted cycle first and recovers 716/716 runes at −2.413238. See [continuous anchor inverse](../sims/lp2_p0_title_multiset_continuous_anchor_inverse_sft.cjs); the computational core ran directly on repository source, while the standalone wrapper was preserved but not separately executed.

**Full key-space receiver:** do not require even one dictionary word. Normalize cyclic rotation at the title's unique zero cell and enumerate every distinct permutation of the remaining 12 cells: 12!/(2!2!) = 119,750,400. Each cycle tests all 13 possible initial phases and both signs. With the exact historical F clock, for phase mask M and forbidden mask D_c marking the consuming phases that would produce plaintext F, the update is rotate13(M & ~D_c,1), OR M if c=0. Empty mask means no possible completion; no F history is dropped. All surviving keys are decoded with a Viterbi state (phase, previous two plaintext symbols); backward phase viability prunes only impossible paths. This maximizes the fixed smoothed trigram score over all phases and legal F histories, not over all conceivable language models.

For a clock consuming every rune, factor the complete trigram score by phase modulo 13. The score of a triple of consecutive key cells can be precomputed per phase. Fix the first two cells, use a mixed-radix multiset-count state and the last two cells, then close the two wraparound triples. This exact dynamic program optimizes over all 1,556,755,200 distinct oriented permutations, both signs, without a lexical or F-clock constraint.

The boundary-free language model uses the 29,157 TextBlob frequency rows (1,105,285 total word weight), native GP tokenization, exact within-word counts plus expected between-word counts under independent word draws, and 20-count interpolated backoff. The local installed TextBlob source has the same normalized frequency rows (64-bit FNV-1a 08e55dc543dc0fad) as the repository control. Model float32 SHA-256: `c89f79b93c817dc9d73450cb61f64b5630c3fce2c37b7bad500b30ab38a448ce`. All original work was executed locally in C++17/Python/NumPy; the repository model/input wrapper regenerates from the pinned corpus and frequency source.

| Clock and decoder sign | Cycles with legal complete inverse | Best score, nats/rune | Best plaintext IoC |
|---|---:|---:|---:|
| Plaintext-F hold, minus | 325,663 / 119,750,400 | −5.483321 | 0.03535571 |
| Plaintext-F hold, plus | 22,900 / 119,750,400 | −5.512440 | 0.03486346 |
| Uninterrupted, minus | all oriented permutations | −5.397770 | 0.03462906 |
| Uninterrupted, plus | all oriented permutations | −5.422268 | 0.03455483 |

Best F-hold minus cycle (zero normalized): `0,15,18,27,19,21,18,26,6,3,15,8,5`; output begins CCOIFOBODPJEASEAIANMYTHTUDWHLIMLOAIANREOAEPYTHCAELBIOMAXLFYSYHARSDGGOEYOEEAOTJAAMEAABOXTAHWHOHCEANJCNGANEAELIAJMAEAEPUGTTHMLPXREATCNGNGPHJEACCBSRTHYNDTHFUEMYIXOBLNNG. Best uninterrupted minus oriented key: `8,19,0,27,18,18,6,21,26,15,5,3,15`; output begins DNGGIAJOETJEOTRSNGNCSADNGSNEOIUWTFIANFAEAOLXTMEJGIADSFNDOENXIIUNGDUDHOHGFOEEOIALADNGIAPNGMTBTHOJNGTHCPPGPEAAOEDOERYHIANAELYRGFYDREOJEOPPWCAPNGGOERXDEEAEAOEYTHATUUEAEAPLTHFAEBLYDASC. Neither is coherent prose.

A 716-rune Gibran prose positive starts at the printed `|Almustafa,` in the pinned source. Its direct model score is −2.300135. Under the same title multiset and a planted phase-4 key, exact uninterrupted optimization recovers 716/716 runes and the correct oriented key. Under plaintext-F hold, the true known cycle's best inverse gives 713/716 runes and −2.299145, illustrating real F-history ambiguity; this latter control scores the true cycle, not the full planted key-space. All original top F-hold paths were re-encrypted against the ciphertext during decoding.

Reproduce with [model/input generator](../sims/lp2_p0_title_exhaustive_model.py), [cycle enumeration](../sims/lp2_p0_title_exhaustive_fhold_cycles.cpp), [F-history score](../sims/lp2_p0_title_exhaustive_fhold_score.cpp), and [uninterrupted-clock DP](../sims/lp2_p0_title_exhaustive_nohold.cpp). Build C++17 with optimization. Run the generator with an output directory, then enumerate the ten partitions by first nonzero key value 3,5,6,8,15,18,19,21,26,27: cycles executable arguments are original.txt, output prefix, partition value. For each generated binary sign/partition file, pass model.bin, original.txt, sign (-1 or 1), and binary file to the F scorer. The uninterrupted executable accepts model.bin, original.txt, sign, comma-separated multiset `0,3,5,6,8,15,15,18,18,19,21,26,27`. Plant inputs and known-cycle binary are generated alongside the original.

**Decision:** the direct raw-title period-13 additive route is exhausted under both clocks, all permutations, both signs and all phases, with or without original word boundaries or dictionary anchors. The unrestricted score result is a strong calibrated language-negative, not a mathematical impossibility of arbitrary non-English plaintext. A new source operand or genuinely different operator is needed; do not rerun arbitrary order variants of the same title.
