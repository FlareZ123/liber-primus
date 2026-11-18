# Spon 1685 butterfly-soul source and page/table route gate

**Classification:** strong iconographic source candidate; plausible navigation hypothesis; **no recovered plaintext, key, or reversible LP2 cipher**.

## Source identification

Jacob Spon's 1685 *Miscellanea eruditae antiquitatis* has an Art. III contents entry on printed page 7: “Nuptiae Cupidinis & Psyches, Papilio animae symbolum.” The commentary for its numbered figures explains the butterfly as the soul leaving a corpse (Table IV), then describes a bird catching the butterfly as transmigration of the soul into animals (Table V), and Cupid fastening the soul to a tree with a nail so it cannot ascend (Table VI). The source scan and bibliographic pointer are recorded in `resources/external/spon-1685-miscellanea-eruditae-antiquitatis.md`.

The LP1 p16 / LP2 p22 reused corpse-and-butterfly figure is strongly consistent with Spon's Table IV subject and explanation. This is a likely iconographic source, not a pixel-level proof of the exact crop or engraving lineage. The p53/p55 moth illustrations are not claimed to be copies of Spon Tables V/VI; at most they share metamorphosis/soul imagery.

## A human-solve route worth preserving

The source gives a printed page number (7) and a numbered figure (IV). If a solver treats these as a page/table address and concatenates them, 7|4 gives archive image 74, which is LP2 p57, the clear PARABLE page. The next numbered figure on that plate, Table V, would give 7|5 = 75, one beyond the 75-image LP2 archive (00–74). Table V's bird/transmigration explanation and p57's instruction to “emerge” make this a plausible pointer to the external continuation referenced by p56, rather than a claim that a 76th LP2 scan exists.

This is a **hypothesis**, not an established author instruction: concatenation is not explicitly stated, and the semantic fit could be post hoc. Its discriminating prediction is narrow: a contemporaneous, authenticated continuation should be addressable by the 75 / Table V step or should have content consistent with the source's bird/transmigration transition. The p56 deep-web target remains gated; do not substitute broad open-web OSINT for solving the LP2 chain.

## Bounded cryptanalytic tests

1. **Latin epitaph as a p55 key — negative.** A later normalized transcription of the epitaph has 72 letters. LP2 p55 has 76 runes; excluding its incoming NG carry and its three F positions leaves 72, but applying the known-page F-skip rule to this unsolved page is not established. The source-derived 72-letter string was tested as a forward-order GP29 additive/subtractive Vigenere key (including classical V/U normalization and a phonetic V-to-W variant): neither direction produced language. A second frozen test partitioned the 72-rune stream by the 14 Latin word lengths and ordered those blocks by their GP-prime word sums; this also produced no language. Treat the length match as a weak coincidence, not key evidence.

2. **Page/table coordinate in the 32×8 p50 table — one-symbol match only.** Interpreting source page 7 as row 7 and Table IV as column 4 selects p50 byte 59. This equals the GP prime weight of T, and the p53 red span begins with T. The next cells in row 7 (86, 171, …) do not match the next p53 red symbols, so the match does not extend. Applying the known p56 phi(prime) = prime−1 stream from prime 59 (or from the 59th prime) to the p53 red span gives no plaintext; the prime-59 branch reaches an impossible plaintext-F event at red-span position 3.

3. **Five-cell Freenet CHK-settings candidate — invalid.** Reading p50 row 7, columns 4–8 gives bytes [59, 86, 171, 156, 80] (modified-base64 `O1arnFA`). These are not a valid CHK extra/settings field: Hyphanet's ClientCHK parser requires the second extra byte to be algorithm 2 or 3, whereas this candidate has 86. The five-cell length match to the CHK extra length is therefore not a viable direct construction.

The executable reproduction is `sims/lp1_p16_spon_papilio_source_route_gate.cjs`; it uses only the repository's canonical corpus, ink annotations, and p50 byte grid.

## Decision

Keep the Spon identification and page7/TableIV → archive74 / TableV → 75 route as a **historical/navigation hypothesis**. Reject the direct Latin-key, direct p50-cell-to-red-rune, p56 prime-stream-start, and raw five-byte CHK-settings receivers tested here. No further unconstrained transforms are justified by this source alone. The useful next step, if independently sourced evidence appears, is one bounded check of whether the authenticated 2014 continuation uses the 75 / Table V address; otherwise retain this as iconographic context and return effort to source-selected plaintext/key recovery.