# LP2 p0 staves: Cistercian rejected; 3|3 branch-rune readout is convention-dependent

**Current status: the Cistercian 1133/3311 interpretation is not supported by independent visual audit. The three-member 3|3 morphology is compatible with Hahal-runa/branch-rune writing, but its value is convention-dependent: the Anglo-Saxon Isruna-tradition Futhorc order gives 3|3 → E, while the reversed Younger Futhark 6:5:5 convention gives 3|3 → TH. The latter matches p0's first black ciphertext glyph, but is a cross-family choice not selected by the image. No plaintext has been recovered.**

## Established visual observations

The two wood-like marginal stave motifs on original LP2 images `resources/liber-primus/17.jpg`–`19.jpg` are repeated essentially identically across pages 0–2 and are 180-degree counterparts. The repeated-crop test is reproducible with `sims/lp2_p0_stave_repetition_sft.py`.

Agent4's independent audit (`communications/agent2/20261126T0416Z_agent4_p0-stave-visual-audit.md`) identifies **three genuine transverse members** crossing the upright, each protruding on both sides: a 3|3 branch pattern. The audit does not find a defensible four-quadrant Cistercian stroke assignment. In particular, the proposed 1133/3311 readings require assigning or ignoring an ambiguous central member and should not be treated as observed numerals.

## Why the Cistercian arithmetic is not evidence

The previous manual hypothesis read the pair as 1133 and 3311, yielding 3311=7×11×43, φ-factor values 6,10,42, and a conditional gcd of the two totients equal to 60. Those arithmetic identities are correct **if the manual numbers are assumed**. The visual premise is not established, however, and the resulting 6/10/42 page partition, (17,42) section address, and gcd-60/base-60 connection are therefore numerical coincidences until an independent glyph reading supports the numbers.

Do not use these calculations to support the old p0/base-60 address hypothesis. The conditional arithmetic reproducer `sims/lp2_p0_cistercian_staves_totient_partition_sft.cjs` is retained only to document what follows from the rejected manual assignment; it is not an image recognizer or evidence for the assignment.

## Live but non-unique: Hahal-runa / branch-rune morphology

The three transverse members on both sides of the upright give a 3|3 branch count. This is compatible with the historical Hahal-runa form: branches on the left encode the rune group/row, and branches on the right encode the rune's position within that row. The geometry therefore supports a *candidate cipher-rune family*, but it does not by itself select which runic alphabet or row order supplies the lookup.

### Direct Anglo-Saxon Futhorc comparator

The closest historical comparator to the manuscript's 29-symbol GP29 alphabet is the Anglo-Saxon Futhorc, not the reduced Younger Futhark. R. Derolez's *Runica Manuscripta: The English Tradition* (1954), chapter II, examines the Isruna tract preserved in five manuscripts, including St Gallen MS 270. The tract describes Hahal-runa as using the left side for the group/row and the right side for the letter's position. Its first 24 cipher runes occupy three groups of eight. Salzburg alone makes the last four runes a separate group. Independent Cotton Domitian corroborates the third group's start, and includes Ior without fixing its coordinate. [Historical gate](lp2-anglosaxon-isruna28-gp29-gate.md). The first 24 runes follow.

```text
1: f u þ o r c g w
2: h n i j eo p x s
3: t b e m l ng oe d
```

The first 24 entries match the corresponding opening of the canonical GP29 order in [the corrected source map](../results/2013-original-gp29-source-map.md). Under this source-matched Hahal-runa layout, **3|3 = E**, not TH. Derolez gives the underlying group/position rule and the Hahal-runa definition in chapter II, pp. 89–122 (especially pp. 89 and 119–121): [digitized text](https://old.katab.asia/special/Rene_Derolez_-_Runica_Manuscripta.pdf).

### Cross-family Younger Futhark candidate

The Uppsala University Rune Blog describes a cryptic Younger Futhark ordering with the ættir reversed:

```text
tbmlʀ / hnias / fuþork
```

In that 6:5:5 order, group 3, position 3 is **þ / TH**. Menota §18.3.13 independently describes the usual branch-rune coordinate convention and notes that rows are counted from bottom to top and positions from left to right: [Menota handbook](https://www.menota.org/HB4_ch18.xml#18.3.13); [Uppsala discussion](https://www.runforum.nordiska.uu.se/blog/cryptic-runes/).

That gives a real alternative, but it is a cross-family import: LP2's 29-rune alphabet follows Anglo-Saxon Futhorc, while the 3|3 → TH result uses a reversed 16-rune Younger Futhark order. The first black p0 rune after the red heading is indeed TH, but that is a visible ciphertext glyph, not an independently known plaintext crib. Choosing the Younger order because it returns the already-visible TH is post hoc unless another source clue selects that order. The two staves' 180° relationship may suggest reversal in some sense, but does not uniquely prescribe reversing the ættir rather than some other orientation or traversal.

| Lookup convention | Third group (counted from the bottom) | 3|3 result |
| --- | --- | --- |
| Isruna/Hahal-runa Futhorc, 3×8 | t b **e** m l ng oe d | **E** |
| Younger Futhark, ordinary 6:5:5 | t b **m** l ʀ | **M** |
| Younger Futhark, reversed cipher order | f u **þ** o r k | **TH** |

Thus the p0 match is possible, but not uniquely selected by the 3|3 geometry. The 180° pair and the first visible TH do not establish the required alphabet/order independently.

### Local Futhorc alignment: E at the third position of both red words

The source-fixed p0 red heading is `SHEOGMIAF` (8 GP29 runes) followed by `SYENGC` (5 GP29 runes). In the canonical corpus, the third rune of each word (zero-based offsets 2 and 10 in the 13-rune heading) is **E**. Under the directly relevant Anglo-Saxon Isruna/Hahal-runa order, each 3|3 stave also reads **E**. This gives a precise local correspondence: two staves, two heading words, and E at the third position of each word. It is a stronger local fit than the cross-family 3|3 → TH match.

This may be a title/word-position annotation or a selector for an E-based operation, but the image does not say whether E is plaintext, a key symbol, a transparent hold, or merely a label. The same staves repeat on p1–p2 where there is no red heading, so their repetition is not three independent confirmations. The correlation is a source observation, not recovered plaintext.

### Third-rune anchor receiver (Agent19)

The E/E title alignment also motivates an explicit reversible shared word-local schedule indexed by each group's third ciphertext rune. The exact arbitrary-per-position additive mask optimizer, allowing a separate row per third rune and requiring bijective third-rune decoding, finds no common title mask in 28,851 GP forms (4,209 eight-rune and 3,591 five-rune forms). Black p0/p1 training yields 60/93 lexical groups but none of the 29 held-out p2 groups; p3–39 training yields 171/1,632 and only 3/608 frozen p40–55 dictionary hits. A hidden-key length-matched control recovers 599/608 words. Even optimizing all later ranges jointly allows only 197/2,240 dictionary groups (282 if anchor bijectivity is dropped). This rules against the specific shared positional-shift receiver, not the underlying stave interpretation or arbitrary nonlinear models. [Exact inverse and controls](lp2-third-anchor-position-mask-gate.md).

### Bounded E-hold receiver tests

A natural operational hypothesis is that the Futhorc Hahal-runa value E selects an E-transparent hold, analogous to the authentic plaintext-F hold in solved Cicada material. I tested the simplest clue-constrained consumers against the original corpus:

- Use the exact 13-rune red heading as a repeating GP29 additive key on p0's 249-rune black body and the 716-rune p0–p2 chapter remainder. When ciphertext E is emitted as plaintext E without consuming a key cell, both arithmetic directions are nonprose.
- Remove the two E cells from the heading to form an 11-rune key; the additive directions and the Beaufort-style `K−C` receiver are also nonprose.
- Transfer the solved p56 prime-minus-one clock, starting at prime 2, to the p0–p2 remainder with E-hold. The 716-rune output consumes 694 shifts, has 25 adjacent equalities and IoC 0.035469; its opening is nonprose. The same implementation with the authentic F-hold on p56 recovers the known opening `AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE...` using 80 consuming shifts, providing a positive control.

Exact inputs, rules, output summaries and the p56 control are reproducible in [the E-hold probe](../sims/lp2_p0_hahalruna_ehold_probe.cjs). These results reject the simple title-key and p56-prime-clock E-hold receivers only; they do not reject every possible E-based marker or an independently sourced key.


### Direct Hahal-runa coordinate receiver: exact common-axis and spacing-free gate (Agent4, 26 November)

The historical group/position semantics suggest a literal coordinate fractionation, distinct from the earlier GP28 predecessor-rank and GP30-space rectangle studies. Use the canonical GP29 order as a 4×8 chart, with `r=floor(x/8)`, `c=x mod 8` and the final three cells 29–31 absent. The first three rows match the Isruna Futhorc comparator above; extending the fourth to five GP symbols is our explicit hypothesis. The two original 180° staves motivate reversing one coordinate stream; their three branches motivate testing a relative cyclic displacement of three. No evidence authenticates fractionation itself.

**Direct inverse:** on the 716 black runes of p0–p2 (156 complete printed groups; the 13-rune title excluded), reverse or cyclically shift by ±3 either coordinate stream, retaining the other. All six within-group variants introduce 34–38 forbidden cells and hit only 8–15 full lexical groups. Applying the same six transforms to the continuous 716-rune body instead gives 34–41 forbidden cells, so none is a legal full inverse. No missing-cell restoration is supplied by the source.

**Exact common-axis inverse relaxation.** Give each word *arbitrary independent positional permutations* of its row and column streams, but use one shared row-label and one shared column-label bijection across the entire opening. For a proposed plaintext word, the transformed row and column marginal count vectors must equal those of the plaintext. This criterion is necessary and sufficient for the existence of independent coordinate-position permutations: pair the occurrences of each coordinate label separately. It grants all 4!×8!=967,680 label maps, even those that do not globally preserve the holes, provided the particular plaintext/ciphertext glyphs are valid. For the separate native F-hold case, remove all h plaintext F symbols and h actual ciphertext F symbols before the comparisons; enumerate every h from zero to the ciphertext word's F count. Held F sites remain fixed, and consuming coordinates may otherwise be permuted arbitrarily. This is an upper bound even if the historical sender has a more restrictive position schedule.

The exhaustive count-vector search uses the pinned 38,910-form TextBlob GP29 register augmented by 28 authentic native forms (38,938). Original source: 2,896 complete groups / 12,956 runes, exactly matching the canonical tape; opening title 8+5 and body 156/716.

| Receiver on 156 black groups | Maximum dictionary-supported groups | Minimum unsupported groups | Best maps tied |
|---|---:|---:|---:|
| Fixed literal group/position labels, arbitrary within-group transport | 48 | 108 | fixed |
| Every shared axis relabeling, ordinary | 60 | 96 | 1 |
| Every shared axis relabeling, literal-F hold | 59 | 97 | 4 |

The reported maximizing maps have no supported group of length ≥8 (20 such original groups). Allowing a *different* row/column label map for every group instead supports all 156 groups (with and without F holds), so a changing-label model is not excluded by this invariant; the permissive construction also no longer identifies a key schedule. Neither red title group has a fixed-label lexical witness.

Two hidden-map plants of 70 actual solved-native groups each, using independent row/column permutations with only legal output cells, recover their exact unique common label maps (ordinary WELCOME, 60/70 mixed groups; F-hold KOAN, 58/70 mixed groups). The known planting inverses recover every original native glyph. These are in-register calibration plants, not independent evidence of vocabulary coverage or a unique original plaintext under arbitrary position permutations.

**Spacing-free strengthening.** Remove the printed word assumption entirely and allow arbitrary independent position permutations over all 716 black runes. A shared label map still preserves the multiset of four row totals and the multiset of eight column totals. Original row totals [202,198,199,117], column totals [104,96,100,82,97,82,81,74], 33 ciphertext F. With native F holds, remove exactly the candidate plaintext's F count from both row0 and col0 before sorting, and require no more than 33 holds.

For each contiguous 716-GP29 window from the pinned Shakespeare/Gibran/Emerson texts, compare sorted marginals. Half the L1 distance on either axis is the minimum number of individual coordinate changes needed to reconcile that axis; take the larger of the two as a discrepancy lower bound. This optimizes over all label relabelings separately for each reference window, an additional relaxation of a shared secret map.

| Reference | Windows | Ordinary min discrepancy | F-hold feasible windows | F-hold min discrepancy |
|---|---:|---:|---:|---:|
| Shakespeare | 216,391 | 79 | 216,391 | 79 |
| Gibran | 61,777 | 73 | 61,777 | 67 |
| Emerson | 320,612 | 73 | 320,013 | 67 |

Zero exact matches in either mode (598,780 ordinary windows, 598,181 F-count-admissible windows). For the F-hold column, the discrepancy is conditional on the window's exact F count; the 599 other windows already violate the F availability condition. Two positive 716-rune Gibran plants with a hidden hole-preserving label map pass their respective ordinary/F-hold invariants exactly. The reference normalization is deterministic (QU→CW, ING→NG, IO→IA, V→U, K/Q→C, Z→S; greedy GP29 digraphs). This is a finite reference-window comparison, not a theorem about every possible English text.

**Decision:** retire direct Hahal-runa fractionation under a common pair of axis maps, including arbitrary boundary-free axis transport for the specified native reference windows. The row/position historical reading itself remains provisional. Do not rescue the family by introducing unrestricted per-word label changes without independently selected state or key material. No unknown plaintext or key.

Reproducers: [exact common-axis search](../sims/lp2_p0_hahalruna_common_axis_fractionation_sft.cjs), [spacing-free marginal gate](../sims/lp2_p0_hahalruna_spacingfree_axis_marginal_sft.cjs). Both cores executed in connected V8; standalone Node filesystem wrappers were not separately executed. Source blobs: corpus `054f2a0f780b7d46901acbe3d9bf4f0ac1801165`, transcription `43bfeb6bf8dabaf25b0446cc519f8d91d205d8a7`, lexicon `140e1d22b5f8c45deddd2e8b25549d9d6307d938`, native controls `1b064ef6d85819b7d96adaff31a82d1ec551598f`; Shakespeare `94c677ad9dd50771c6670e0c4e4dad9052b46d85`, Gibran `df260a07d56bf5998d40a6360b6132c35c252d10`, Emerson `a92be8ba5b3511a003a22ba31523c14397aaa83a`.

### Conditional 13+1+55×13 partition: possible per-page key matrix

The original-image-derived corpus gives p0–p2 a total of **729 runes** (262 + 266 + 201). The p0 red heading occupies 13 runes; the first black rune after it is TH; the remaining p0 black text plus all p1–p2 runes totals **715 = 55 × 13**. Thus, if the TH glyph is a sentinel, the opening material partitions exactly as:

```text
13 red runes + 1 black TH sentinel + 55 rows × 13 runes
```

Together with the 13-dot marker, this suggests a possible 56-row, 13-symbol schedule: the red row for p0 and 55 subsequent rows for p1–p55. It is a coherent human-solve-path hypothesis, but depends on selecting the reversed Younger Futhark 3|3 → TH reading; the more directly relevant Futhorc Hahal-runa convention instead gives E and matches the two third-position E runes in the red title. The row interpretation is not established.

I tested the simplest page-key receivers using the 55 rows read sequentially:

- Treat each 13-symbol row as a repeating Vigenère key for its page. Representative p3/p4/p55 tests under the natural p1–p55 mapping, and p56/p57 under the alternative p3–p57 mapping, fail with index shifts and prime-valued shifts, both arithmetic directions, forward/reversed keys, and no/F/E holds.
- Treat each row as a keyword for a page-specific keyed monoalphabetic alphabet. The red row on p0 and payload rows on representative p3/p4/p55 do not produce language.
- Treat the 715-symbol payload as a one-time pad for the first 715 runes of p3 onward. Row-major and column-major key order, both signs, forward/reversed key, and no/F/E holds all fail.
- A separate 13-column transposition keyed by the raw or decoded red title, combined with the p56 prime-minus-one clock in either layer order, also fails to produce language on the 715-symbol payload. The already documented 13-dot route gives the fixed title-position permutation `[8,0,1,9,2,3,10,4,5,11,6,7,12]` (output `SSHYEOEGMNGIAFC`; see [the existing dot-topology report](lp2-p0-red13-dot-topology-readout.md)). Applying that exact permutation to every 13-symbol matrix row, then using the permuted rows as page-specific Vigenère keys, also fails on p3/p55 under index/prime shifts, both signs, forward/reversed order and no/F/E holds. Flattening the dot-permuted rows as a 715-symbol OTP over the first 715 runes of p3 onward likewise fails. This uses the existing dot-route result as a selector for the new matrix hypothesis; it does not reopen or repeat the already closed standalone dot-key/autokey tests.

A further conditional cross-carrier check uses the natural p3–p57 row mapping: p50 is row47, and the original base60 table has a 13×8 p50 block. The row47 key is `OITNXPTFHRDEF`. Stable GP29-rank row permutation, the existing dot-route row permutation, row/column flattenings, and row-wise XOR/add/subtract using the row47 GP29 indices, corresponding primes, and dot-permuted forms do not produce printable data from the 13×8 base60-byte block. This is only a negative test of that specific base60-byte interpretation; the table's documented base59 ambiguity and the unproven page-to-row mapping remain caveats.

The dimension-matched linear alternative `A(55×13) × B(13×8)`, with A the opening matrix and B the p50 13×8 base60-byte block, was also tested over moduli 23, 29, 60 and 256, with natural and dot-route inner orders. The mod-29/mod-23 products do not form language; the mod-256 products are not printable. Using the resulting 8-symbol mod-29/mod-23 rows as repeating Vigenère keys on the known p56/p57 controls also fails. The 13×8/55×13 dimension match is therefore not yet an executable receiver.


### Direct 55×13 title-keyed columnar transposition (Agent11, 26 November)

The exact 715-rune payload after the red title and first-black-TH sentinel was arranged as 55 rows × 13 columns. A contemporary solver could plausibly take the visible 13-rune red title as a standard columnar keyword; the independently fixed 13-dot title permutation supplies a second, bounded key candidate. The test fixes the GP29 alphabet order, stable duplicate handling, and the 55×13 rectangle, then checks each key in stable ascending and reversed-stable column order, with both forward and inverse columnar transforms. No offset, phase, key fitting, row reversal or additional cipher layer is introduced.

| Key | Column order | Direction | Mean English log10/quadgram | Uncorrected upper-tail p vs 5,000 random orders | Unseen quadgrams |
|---|---|---|---:|---:|---:|
| Raw title | Stable ascending | Inverse | −7.598483 | 0.8536 | 0.6282 |
| Raw title | Stable ascending | Forward | −7.468880 | 0.2575 | 0.5864 |
| Raw title | Reverse stable sort | Inverse | −7.530637 | 0.4837 | 0.6023 |
| Raw title | Reverse stable sort | Forward | −7.477150 | 0.5585 | 0.5910 |
| Dot-routed title | Stable ascending | Inverse | −7.541521 | 0.5517 | 0.6090 |
| Dot-routed title | Stable ascending | Forward | −7.487233 | 0.8770 | 0.5944 |
| Dot-routed title | Reverse stable sort | Inverse | −7.678021 | 0.9910 | 0.6463 |
| Dot-routed title | Reverse stable sort | Forward | **−7.463768** | **0.1208** | 0.5853 |

Scoring expands the GP29 digraph runes into Latin letters and uses the pinned Duko English quadgram counts (79,495 observed grams; missing-gram floor 0.01). The native positive control is the first 715 GP29 tokens greedily mapped from the solved LP1 plaintext reference: mean score **−4.560423**; all four key/order encrypt→decrypt controls recover it exactly. The inverse random-order null has min/median/max −7.766897/−7.533525/−7.305297; the forward null has −7.510383/−7.475631/−7.441823. The best fixed candidate is the dot-routed title with reverse-stable column order and the forward transform; its score is not exceptional against the random-order family and remains far below the native positive control. Its first 100 expanded letters are `EINGPUGYFNMYTPEOXNGHFAWROEGGEAAEAEOHIAIALIXDPAESXHHEBNGIAHDUEOWGETSFEOPEYTHTHIATHWNMOEEORDROELMAEDEA`.

The reproducible Node 22 SFT pins corpus blob `054f2a0f780b7d46901acbe3d9bf4f0ac1801165`, quadgram blob `da56c2e11e004ad24454750dba8fbe2e19abbc71`, and LP1 plaintext-reference blob `8ed037a6ddeef2b20a10bd6a84830e7cf9f43f7d`; it also asserts exact source round-trips and the native positive control. [SFT](../sims/lp2_p0_13x55_columnar_transposition_sft.cjs) · [CI run 45867896964](https://github.com/FlareZ123/liber-primus/actions/runs/45867896964).

**Decision:** retire this standard keyworded columnar transposition on the 55×13 payload under the raw and dot-routed title keys, both fixed column orientations and both transform directions. The best uncorrected random-order comparison is p=0.1208 before accounting for the eight tested variants. This does not exclude a different source-selected matrix operation, but the exact partition alone does not justify more transposition variants.

The exact partition is real; the simple Vigenère, keyed-alphabet, OTP, dimension-matched linear, and direct title-keyed columnar transposition receivers are negative. This does not exclude a different source-selected matrix use, but there is currently no source-selected operation that turns the 55×13 payload into an executable key schedule. Do not continue enumerating grid or transposition variants without an independent cipher instruction. Reproduction: [13×55 matrix gate](../sims/lp2_p0_13x55_matrix_gate.cjs) · [columnar transposition SFT](../sims/lp2_p0_13x55_columnar_transposition_sft.cjs).


## Decisive next tests

1. Reopen an E-hold, branch-coordinate fractionation, or 13×55 matrix receiver only if an independent source supplies the key/state rule; do not repeat the failed title-key, p56-prime-clock, row-key, keyed-alphabet, OTP, or direct keyworded columnar tests.
2. Seek a second clean, variable branch-rune symbol or another original clue that independently selects the role of the two E markers or the TH sentinel.
3. Do not use the visible first black TH glyph to choose the Younger Futhark row order and then count the resulting 55×13 divisibility as independent confirmation.
4. Do not repeat the Cistercian/totient arithmetic, broad branch-count scans, or arbitrary grid routes. No receiver or plaintext has been recovered.

**Current conclusion:** the repeated 3|3 branch morphology is compatible with Hahal-runa. The direct Anglo-Saxon Futhorc readout is E and matches the third rune of both p0 red-title words, but the simplest E-hold receivers and the exact common-axis coordinate-fractionation receiver fail. A reversed Younger Futhark readout gives TH and exposes an exact 13+1+55×13 partition, but the resulting simple page-key, keyed-alphabet, OTP, and direct title-keyed columnar receivers fail, and the order is not independently selected. Retain both as unresolved structural clues; no key, reversible receiver, or plaintext has been recovered.
