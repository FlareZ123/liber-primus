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

## Source interpretation and decision

The exact **232 + 24 = 256** equality is noteworthy because it arises from an oversized original red initial, an entire physical page, and the manuscript's actual 256-cell numeric table. Yet the 24 is the **alphabet index**, whereas Ac's GP **prime weight is 97**. Other plausible offsets, word clocks, a literal/uncounted initial, table roles, numeral encodings, and hidden registers are not disambiguated by the original page. Furthermore the enlarged initial is integrated into a **nine-rune red heading**, rather than printed as an isolated instruction.

The finite source-tail additive test **does not recover p54**. It only rejects a direct, fixed pad interpretation using the printed table suffix. More elaborate uses require an independent source-visible instruction selecting the exact operation, rather than treating the arithmetic equality as a recovered cipher key.

[Standalone source-to-original CommonJS SFT](../sims/p54_ac24_grid256_tail_sft.cjs) · [manual-only workflow](../.github/workflows/p54-ac24-grid256-manual.yml) · [passing source/plant/original GitHub Actions run 43007740144](https://github.com/FlareZ123/liber-primus/actions/runs/43007740144).

**Status:** one original-source numerical alignment; eight bounded negative inverses; zero unknown-page plaintext, authenticated generator, or destination.
