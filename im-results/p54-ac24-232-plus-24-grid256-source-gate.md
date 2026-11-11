# LP2 p54 enlarged Ac24 + 232-rune page: terminal 256-grid tail alignment

**Independent original-source count, Agent 24, 11 November 2026.** Physical LP2 page54 (original 71.jpg) contains **232 GP runes**. Its first rune is an enlarged red **ᚪ**, the Gematria Primus **A** symbol with zero-based alphabet index **24**. Thus **232 + 24 = 256**, the exact number of printed two-character numeric cells on LP2 pages49–51. Across all 55 rune-bearing original unsolved pages, **page54 alone** has its total rune count plus first-rune GP index equal to 256. These are exact, independently reproducible source features. The original image does not explicitly say to interpret its first rune as an offset or to apply the earlier table to page54, so the proposed application remains conjectural.

## Minimal original-cipher implication and result

A human solver might notice that the large initial **A** is the **25th GP symbol** and that exactly **232** source runes remain in a 256-slot numeric table after **24** entries are skipped. This supplies a fixed candidate state start. Under the simplest additive GP29 pad, decode each original p54 rune by the corresponding numeric-table byte starting at zero-based offset24, reduced modulo29, in either additive sign. No phase, key, symbol, or page offset is optimized.

The source table is taken in author-printed **row-major order**, with the widely documented literal radix60 decoder and the alternative f-omitting radix59 readout. The source-authenticated p56 literal-F exception motivates a secondary all-F-pass-through control, although transferring that mask to unknown p54 is not source-selected. Two byte readouts × two additive signs × F active/inactive = **eight** fixed candidate inverses.

Every result remains close to random GP29:

| Original p54 GP29 stream | Full 232-rune IoC |
|---|---:|
| Original ciphertext | 0.03313927 |
| Highest of eight direct table-tail variants | **0.03429616** |
| Lowest of eight direct table-tail variants | 0.03310196 |
| Uniform 29-symbol baseline | 0.03448276 |

The highest candidate begins **B X L M O I I IA E AE B D B D A F**; there is **no sustained native-GP plaintext or identified key**. A 232-rune planted GP source stream is recovered exactly under its fixed planted additive model. Original inverse re-encryption also succeeds in every declared variant; this checks algebra only, because a wrong additive pad is equally reversible.

## Eight-rune heading as a column key: bounded negative

The eight red runes following the enlarged A are **[19,21,23,27,2,14,10,19]** in GP indices. Stable ascending-key order gives columns **[4,6,5,0,7,1,2,3]**; the duplicate M is tied by its printed occurrence order. This supplies a human-visible candidate for using the same heading to reorder the 29×8 table tail or the 29×8 p54 rune page.

A fixed source-bounded test applied that column permutation in both directions to either the 232-byte table tail or the 232-rune p54 stream. For each of these four arrangements it tested three previously used byte→GP projections (byte mod29, floor(29×byte/256), byte mod28) and the three natural additive orientations C−K, C+K, K−C: **36 models**, with no phase or free column permutation. Every candidate re-encrypts exactly under its own declared inverse. The best original GP-English trigram score is **−11.58322** (ciphertext baseline **−11.76474**); its 232-symbol IoC is **0.036237**, near the uniform GP29 baseline **0.034483**. The best preview begins EA A IA H C J X TH T I O R T N B A NG EO, not sustained plaintext.

The score uses the first 50,000 GP symbols of the fixed Emerson control with additive smoothing 0.2. As an independent holdout, 2,154 non-overlapping-in-phase 232-symbol windows from the native-GP Gibran control have median **−8.01374**, 10th percentile **−8.24256**, 90th percentile **−7.82446**, and worst **−8.65111**; even the best candidate is 2.93 nats/rune below the worst holdout. A 232-symbol Gibran plant encrypted and recovered under one declared model is exact, checking the inverse and scoring path.

**Decision:** retire this specific p54-heading-keyed columnar/additive tail interpretation. It does not establish that the 24+232 source alignment is a cipher key, and it does not exclude other keyed, stateful, nonlinear or source-selected operations. Reproduce with [the heading-keyed p54 tail SFT](../sims/p54_ac24_heading_columnar_tail_sft.cjs).

## Source interpretation and decision

The exact **232 + 24 = 256** equality is noteworthy because it arises from an oversized original red initial, an entire physical page, and the manuscript's actual 256-cell numeric table. Yet the 24 is the **alphabet index**, whereas Ac's GP **prime weight is 97**. Other plausible offsets, word clocks, a literal/uncounted initial, table roles, numeral encodings, and hidden registers are not disambiguated by the original page. Furthermore the enlarged initial is integrated into a **nine-rune red heading**, rather than printed as an isolated instruction.

The finite source-tail additive test **does not recover p54**. It only rejects a direct, fixed pad interpretation using the printed table suffix. More elaborate uses require an independent source-visible instruction selecting the exact operation, rather than treating the arithmetic equality as a recovered cipher key.

[Standalone source-to-original CommonJS SFT](../sims/p54_ac24_grid256_tail_sft.cjs) · [manual-only workflow](../.github/workflows/p54-ac24-grid256-manual.yml) · [passing source/plant/original GitHub Actions run 43007740144](https://github.com/FlareZ123/liber-primus/actions/runs/43007740144).

**Status:** one original-source numerical alignment; eight bounded negative inverses; zero unknown-page plaintext, authenticated generator, or destination.
