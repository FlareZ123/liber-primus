# Spon 1685 butterfly-soul source and bounded route tests

**Classification:** likely iconographic source for LP1 p16 / LP2 p22; one low-confidence numeric coincidence; **no recovered plaintext, key, or reversible LP2 cipher**.

## Source identification

Jacob Spon's 1685 *Miscellanea eruditae antiquitatis* has an Art. III contents entry on printed page 7: “Nuptiae Cupidinis & Psyches, Papilio animae symbolum.” Its plate contains numbered figures III–IX. Spon's Table III commentary describes the butterfly's repeated worm-to-butterfly metamorphosis. For Table IV he says the depicted butterfly is the soul of a deceased man flying away. Table V describes a bird catching the butterfly as transmigration of souls from humans into animals; Table VI describes Cupid fastening the soul to a tree with a nail so it cannot ascend. The primary-source pointer is recorded in `resources/external/spon-1685-miscellanea-eruditae-antiquitatis.md`.

The LP1 p16 / LP2 p22 reused corpse-and-butterfly figure is strongly consistent with Spon's Table IV subject and explanation. This is a likely iconographic source, not a pixel-level proof of the exact crop or engraving lineage. The p57 instar/emergence parable has a meaningful thematic parallel to Spon's metamorphosis explanation. The p53/p55 moth illustrations are not claimed to be copies of Tables V/VI.

## Original numbering correction: retire 74/75

A tempting concatenation of printed source page 7 and Table IV gives 74, and Table V gives 75. This is **not a native LP2 address**. The contemporaneous original Stage11 index, `resources/external/cicada2014-stage11-onion7-original-index.html`, contains 58 LP2 images numbered 0–57 (title 133; div id 331). The later combined JPEG archive has 75 images numbered 00–74 because it prepends the 17 LP1 images. Thus image 74 is LP2 p57 only in the later combined corpus; the original Stage11 page calls it image 57. The 75/next-table continuation claim is retired.

## Surviving page/table coordinate test

Interpreting the source's page 7 as row 7 and Table IV as column 4 in the original 32×8 p50 numeric table selects byte 59. This equals the GP prime weight of T, and the p53 red span begins with T. The next cells in row 7 (86, 171, 156, 80) do not match the next p53 red symbols. This is a one-symbol match only, not an established key or direction.

The source-selected coordinate is flat cell 51 (one-based row 7, column 4). Starting the existing p50 5+3 relative-bytewalk at this cell produces a six-cell transient followed by the same 20-cell cycle (26 distinct cells total). Using its byte-mod-29 stream on the p53 red span gives no language; using it on the original p48–49 and p51–52 flanking sentences also gives no language. This is the source-selected-start variant of the existing relative-bytewalk, not a new family of transforms.

## Bounded cryptanalytic tests

1. **Latin epitaph as a p55 key — negative.** A later normalized transcription of the epitaph has 72 letters. LP2 p55 has 76 runes; excluding its incoming NG carry and its three F positions leaves 72, but applying the known-page F-skip rule to this unsolved page is not established. The source-derived 72-letter string was tested as a forward-order GP29 additive/subtractive Vigenere key (including classical V/U normalization and a phonetic V-to-W variant): neither direction produced language. A second frozen test partitioned the 72-rune stream by the 14 Latin word lengths and ordered those blocks by their GP-prime word sums; this also produced no language. Treat the length match as a weak coincidence, not key evidence.

2. **p56 phi(prime) start — negative.** Starting the known phi(prime) = prime−1 stream at prime 59, or at the 59th prime, on the p53 red span gives no plaintext. The prime-59 branch reaches an impossible plaintext-F event at red-span position 3.

3. **Five-cell Freenet CHK-settings candidate — invalid.** Reading p50 row 7, columns 4–8 gives bytes [59, 86, 171, 156, 80] (modified-base64 `O1arnFA`). These are not a valid CHK extra/settings field: Hyphanet's ClientCHK parser requires the second extra byte to be algorithm 2 or 3, whereas this candidate has 86. The five-cell length match to the CHK extra length is therefore not a viable direct construction.

The executable reproduction is `sims/lp1_p16_spon_papilio_source_route_gate.cjs`; it uses the canonical corpus, ink annotations, p50 byte grid, and original Stage11 index.

## Decision

Keep the Spon source identification as historical/iconographic context. Retire the 74/75 concatenation as an archive-numbering artifact. Retain the row7/column4 → byte59 → p53 T observation only as a low-confidence coincidence; the source-selected relative walk and prime-stream extensions fail. No further unconstrained transforms are justified by this source alone. Return effort to source-selected plaintext/key recovery.