# Spon 1685 butterfly-soul source and bounded route tests

**Classification:** likely iconographic source for LP1 p16 / LP2 p22; one low-confidence numeric coincidence; **no recovered plaintext, key, or reversible LP2 cipher**.

## Source identification

Jacob Spon's 1685 *Miscellanea eruditae antiquitatis* has an Art. III contents entry on printed page 7: “Nuptiae Cupidinis & Psyches, Papilio animae symbolum.” Its plate contains numbered figures III–IX. Spon's Table III commentary describes the butterfly's repeated worm-to-butterfly metamorphosis. For Table IV he says the depicted butterfly is the soul of a deceased man flying away. Table V describes a bird catching the butterfly as transmigration of souls from humans into animals; Table VI describes Cupid fastening the soul to a tree with a nail so it cannot ascend. The primary-source pointer is recorded in `resources/external/spon-1685-miscellanea-eruditae-antiquitatis.md`.

The original LP1 images 14–16 share the same reclining-corpse footer; the insect count changes while the body remains fixed: file14 shows the corpse alone, file15 shows two cicada-like insects above it, and file16 shows one. The original-image census independently confirms that the p14–16 corpse footer is pixel-identical and is horizontally mirrored on LP2 p22; the separate segmented-insect artwork is reused on LP2 p2. These are two distinct reused-art families, not a single two-input composite. Spon's Table IV describes one butterfly as the soul of a deceased man flying away (“Papilio igitur hic expressus viri defuncti anima est quae avolat”); Table V describes transmigration and adds “Duplex autem papilio alludere potest ad duplicem animam.” Thus p16's single insect and p15's pair are compatible with the single-/double-soul motifs, but LP1's visible order (double, then single) reverses Spon's Table IV→V numbering, and p14's corpse-only image has no exact figure match. The insect species and crop are not exact. This is a plausible thematic allusion, not a verified image-to-figure mapping. LP2 p22's added horizontal object is not in the Spon image; the LP2 p53/p55 moths belong to a separate LP1 p05 artwork family and are not claimed as copies of Spon Tables IV/V. The p57 instar/emergence wording separately echoes solved LP1 p3/4.

## Original numbering correction: retire 74/75

A tempting concatenation of printed source page 7 and Table IV gives 74, and Table V gives 75. This is **not a native LP2 address**. The contemporaneous original Stage11 index, `resources/external/cicada2014-stage11-onion7-original-index.html`, contains 58 LP2 images numbered 0–57 (title 133; div id 331). The later combined JPEG archive has 75 images numbered 00–74 because it prepends the 17 LP1 images. Thus image 74 is LP2 p57 only in the later combined corpus; the original Stage11 page calls it image 57. The 75/next-table continuation claim is retired.

## Surviving page/table coordinate test

Interpreting the source's page 7 as row 7 and Table IV as column 4 in the original 32×8 p50 numeric table selects byte 59. This equals the GP prime weight of T, and the p53 red span begins with T. The next cells in row 7 (86, 171, 156, 80) do not match the next p53 red symbols. This is a one-symbol match only, not an established key or direction.

The source-selected coordinate is flat cell 51 (one-based row 7, column 4). Starting the existing p50 5+3 relative-bytewalk at this cell produces a six-cell transient followed by the same 20-cell cycle (26 distinct cells total). Using its byte-mod-29 stream on the p53 red span gives no language; using it on the original p48–49 and p51–52 flanking sentences also gives no language. This is the source-selected-start variant of the existing relative-bytewalk, not a new family of transforms.

The same cell was also tested as the start for two other already documented p50 readers. Under the existing 3×3 keypad interpretation of byte quotient plus one, the route is 52 → 61 → 60 → 69 → 60, emitting U-M-J-AE before entering a two-cell cycle. Under the direct byte-pointer interpretation, it has nine transient cells and then enters the known 11-cell cycle; its byte-mod-29 key also fails on the p53 red span, p55, and the complete flanking sentences. These are source-selected start variants of existing readers, not new cipher families.

## Bounded cryptanalytic tests

1. **Latin epitaph as a p55 key — negative.** A later normalized transcription of the epitaph has 72 letters. LP2 p55 has 76 runes; excluding its incoming NG carry and its three F positions leaves 72, but applying the known-page F-skip rule to this unsolved page is not established. The source-derived 72-letter string was tested as a forward-order GP29 additive/subtractive Vigenere key (including classical V/U normalization and a phonetic V-to-W variant): neither direction produced language. A second frozen test partitioned the 72-rune stream by the 14 Latin word lengths and ordered those blocks by their GP-prime word sums; this also produced no language. A ragged columnar transposition using the same 14 word lengths as column heights was also tested in source word order, reverse word order, and GP-prime-sum order; none produced language. Treat the length match as a weak coincidence, not key evidence.

2. **p56 phi(prime) start — negative.** Starting the known phi(prime) = prime−1 stream at prime 59, or at the 59th prime, on the p53 red span gives no plaintext. The prime-59 branch reaches an impossible plaintext-F event at red-span position 3.

3. **Five-cell Freenet CHK-settings candidate — invalid.** Reading p50 row 7, columns 4–8 gives bytes [59, 86, 171, 156, 80] (modified-base64 `O1arnFA`). These are not a valid CHK extra/settings field: Hyphanet's ClientCHK parser requires the second extra byte to be algorithm 2 or 3, whereas this candidate has 86. The five-cell length match to the CHK extra length is therefore not a viable direct construction.

The executable reproduction is `sims/lp1_p16_spon_papilio_source_route_gate.cjs`; it uses the canonical corpus, ink annotations, p50 byte grid, and original Stage11 index.

## #1454 one/two-input operation gate: no source-selected operator or receiver

The Spon text explains an iconographic idea, not an executable cipher. Its “reciprocal” movement of souls “from body to body” and “alternating succession of dead and living” occur in the discussion of metempsychosis; the single and double butterflies explain a soul leaving a corpse or a double-soul belief. Those phrases could be metaphorically mapped to interleaving, addition/subtraction, XOR, reversal, or a two-state substitution, but the source specifies none of those operations. It supplies no alphabet, modulus, symbol-to-number mapping, key, clock, alignment, or rule for choosing the order of two streams.

The first-party solved LP1 text adjacent to the images does not fill that gap:
- p14 is **A KOAN** about the “I” as the voice of the circumference.
- p15 is **AN INSTRUCTION**: question all things, discover truth inside yourself, follow your truth, impose nothing on others.
- p16 is **KNOW THIS** followed by the 5×5 / 3301 numeric square.

None instructs a reciprocal, alternating, two-input, or soul/body stream operation. Nor do the three solved plaintexts form an evident aligned input/input/output triple: p14 and p15 are prose of different lengths, while p16 is a 25-number table. The 5×5 square's direct Hill, additive, and rank-order consumers are separately negative in `lp1-p16-square-hill5-lp2-original-gate.md` and `lp1-p16-order56-pagepower-gate.md`.

The source-art census identifies possible LP2 receivers but does not select a directed pair or operation:
- LP2 p2 (201 runes) carries the segmented-insect family.
- LP2 p22 (131 runes) carries the mirrored corpse-footer family.
- LP2 p53 (179 runes) and p55 (76 runes) carry the separate LP1 p05 moth family.

The insect and corpse families are independently reused; p2 and p22 are therefore a thematic “soul/body” pair one might choose, but the source does not say whether p2 keys p22, p22 keys p2, or they should be combined at all. The p53/p55 moth pair is a different source family. The existing linked-chapter common-position key test is negative and the artwork does not establish a shared cipher clock; see `lp1-p16-doubleart-chapter-common-bijection-gate.md` and `lp1-lp2-crossrelease-artwork-raster-copies.md`.

**Decision for #1454:** no simple reversible operation can be demonstrated on the solved LP1 case, and no unique LP2 receiver/order/alignment is selected. “Alternating” could nominate interleaving; “reciprocal” could nominate several self-inverse or two-way arithmetic operations; the images alone do not distinguish them. Running one would be an arbitrary transform, expressly outside the issue's gate. Retire this iconographic branch as a cipher-operation hypothesis while retaining the conditional Spon attribution as historical context. Reopen only on a first-party clue that fixes both the operator and the receiver(s).

## Decision

Keep the Spon source identification as conditional historical/iconographic context, not an LP2 cipher instruction. Retire the 74/75 concatenation as an archive-numbering artifact and the #1454 one/two-input iconographic operation branch because no operator or directed LP2 receiver is selected. Retain the row7/column4 → byte59 → p53 T observation only as a low-confidence coincidence; the source-selected relative walk and prime-stream extensions fail. No further unconstrained transforms are justified by this source alone. Return effort to source-selected plaintext/key recovery.