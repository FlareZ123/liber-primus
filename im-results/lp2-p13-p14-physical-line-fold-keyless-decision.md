# Original p13–p14 physical fold: source-aligned impossibility and missing decoder

**Agent38, 23 November 2026. Classification: exact original-image structural test and a bounded all-secret stationary-mapping exclusion. There is no recovered unknown LP2 plaintext.** This study addresses Director #2342 without repeating the previously tested 40 flat-tape additive keys. The actual *horizontal physical paper fold* has a different pairwise alignment than simply reversing a concatenated string.

## Visible instruction candidate and rival

The original physical LP2 p13 image 30.jpg has a right-margin sapling and twelve complete text lines whose printed GP rune lengths are

**[24,21,23,23,22,23 | 22,25,21,22,22,24]**.

Both halves contain **136** runes. Following p14 image 31.jpg has a left-margin sapling, exactly **137** runes, and the exact complete second GP29 word **FOLD** at local runes 2–5. Omitting its F at offset2 leaves exactly136 receiving runes. The original independently solved p56 demonstrates a literal F bypass in *its own* prime-totient cipher, but the source does not license transferring that skip to p14. The mathematical fact that 137 is prime and phi(137)=136 permits a counting hypothesis without specifying an operator.

Of **35** original unknown LP2 pages containing twelve complete printed lines, **only three** have equal first-six and last-six rune counts: p13 (136+136), p24 (135+135) and p42 (136+136). Of these, **only p13** has an immediately following physical page whose total rune count equals one half plus one: p14 has137 runes, whereas p25 has273 and p43 has274. Thus the layout event is unusually specific within the exact charged source register, but its relevance was noticed retrospectively. Original p12 also has the same left-side sapling ornament as p14, so mirrored trees repeat as ordinary border design and cannot alone select a fold cipher.

## Exact physical fold pairing and side information

Folding the printed page horizontally between line6 and line7 maps line1 against line12, line2 against line11, line3 against line10, line4 against line9, line5 against line8, and line6 against line7. Vertical folding reverses line order while preserving each horizontal column. The six paired line counts are:

| Printed source lines | Upper length | Lower length | Overlap |
|---|---:|---:|---:|
| 1 / 12 | 24 | 24 | 24 |
| 2 / 11 | 21 | 22 | 21 |
| 3 / 10 | 23 | 22 | 22 |
| 4 / 9 | 23 | 21 | 21 |
| 5 / 8 | 22 | 25 | 22 |
| 6 / 7 | 23 | 22 | 22 |
| **Total** | **136** | **136** | **132** |

Unlike reverse-flattening the complete 136-rune half, the physical fold yields **132 overlaid ordered GP29 pairs**, plus four unpaired upper/right runes **WAFX** and four unpaired lower/right runes **FJEI** in original top-down row order. A single upper-side read produces 136 slots only after choosing how to consume or ignore those eight overhang values. An independent operator must fix this choice before output inspection.

## Secret-independent stationary folded-pair exclusion

Grant the strongest possible deterministic stationary mapping: an unrestricted secret function f(a,b) that maps every ordered pair of overlaid source GP29 rune indices to one target rune. Repeated identical pairs among the 132 physically overlapped source sites must have the same target under any such mapping. Read targets as the 136 original p14 rune indices excluding only local F offset2, with their complete original word/page order otherwise unchanged.

| Following-page target order | Distinct source ordered pairs | Repeated source pair events | Contradictory target events |
|---|---:|---:|---:|
| Original p14 order | 122 | 10 | **10** |
| Reversed p14 order | 122 | 10 | **8** |

Thus **no stationary secret folded-pair-to-p14 output map**, even an arbitrary 841-entry lookup table, can produce the following page under this exact physical alignment. A planted positive from a real deterministic two-rune mapping passes with **zero** contradictory targets. These numbers differ from the prior flat-tape reversal report's 128 distinct pairs and 6/7 contradictions because the latter is a different geometric operation. These mathematical obstructions do not exclude using the folded p13 as a *key stream* for decrypting p14 with an additional source-specified reversible cipher, nor word-boundary changes or nonstationary state.

## Direct cipher test from the physically exposed eight-runic strip

The literal physical fold reveals one additional key operand that the preceding flat-tape study did not have: the **four exposed top-right GP runes WAFX**, followed by **four exposed bottom-right GP runes FJEI**. Concatenating them in their original row order gives an exactly source-defined **eight-rune candidate key WAFXFJEI**. A player could reasonably attempt ordinary repeating-key GP29 Vigenère subtraction using this exposed strip as a secret, omitting only the original F at p14 local offset2. Unlike a fitted arbitrary map, this is an executable, reversible, low-description-length original-puzzle operation.

Freeze that upper-then-lower reading order, a zero initial key position and one key reset per physical page; **no seed, rotation, key reversal, language-fit selection or phase sweep**. Direct decryption of all 136 p14 recipient runes yields:

- Source-identified p14, 136 GP runes: resulting IoC **0.0355119825708061**, with opening GP transliteration **NTOGDIABAPJMXTHMRIATHIAYPEOYHXGX...**.
- Independent neighboring p15, entire original 180-or-more-rune page under exactly the same repeated eight-key and natural start: resulting IoC **0.03590478465090359**, also nonprose.
- Authentic already-solved p57 original GP plaintext used as an independent positive: forward GP29 encryption with this same frozen key and exact inverse recovers every rune; its original native IoC **0.06270996640537514**.

The complete p14 and p15 encipherment inverse checks pass, including the p14 single-F bypass. Both candidate original outputs remain near the random GP29 IoC of 1/29 instead of the native source's high coincidence. This rejects this **one natural exposed-key decipherment**, without disputing the new physical overhang or claiming that no other author-selected fold operation is possible.

## Causal decision and next required input

The source contains a recognizable word FOLD, mirrored sapling artwork, balanced physically printed 136/136 p13 halves, and an adjacent p14 count137. The literal paper fold leaves unavoidable **four-plus-four unpaired runes**, and none of the original inspected scans or signed-period operation precedents specifies an ordered-pair combining rule, how to use the overhangs, how to initialize/advance state, or why this hypothetical F bypass should transfer from solved p56. Agent35 had already rejected all 40 direct additive/prime-derived folded-key routes; the present physically correct pair geometry excludes the *entire* stationary direct pair-map class, and the literal overhang-derived eight-rune Vigenère inverse has also failed on p14 with a p15 holdout.

Director #2342 is therefore complete under its no-selector gate: **retire this local direct physical-fold → p14 ciphertext interpretation**. No reason remains to tune more functions against p14 without an independent first-party executable nonadditive fold/read instruction that predicts a genuine plaintext interval.

Reproduce using the original-source CommonJS test [physical line fold invariant SFT](../sims/lp2_p13_p14_physical_fold_pair_invariant_sft.cjs) with unchanged resources/liber-primus/lp2-transcription.txt and resources/liber-primus/lp2-corpus.json. The SFT checks all exact counts, p14's F offset, 35 twelve-line pages, source-pair collisions and positive plant. The prior independent flat-tape results remain in [p13/p14 FOLD 40-model source gate](lp2-p13-p14-foldline-Fskip-source.md).

**Independent executable environment:** The combined original-source tests completed successfully under **Windows GitHub Actions, Node 22** in [run #45097459572](https://github.com/FlareZ123/liber-primus/actions/runs/45097459572). The workflow runs each complete CommonJS original-source SFT without language-model fitting.
