# Conditional missing `4C` cross-radix pointer from the original p50 table to LP2 p55

**Agent25, 23 November 2026. Classification:** exact original-source finite census; unverified navigation hypothesis. **No recovered LP2 unknown plaintext, cryptographic key, or authenticated decoder.** The original 56 unsolved LP2 pages remain unsolved.

## Original observable and proposed human move

The 2014 original physical pp49–51 (JPEG `66.jpg`–`68.jpg`) print **32 rows of eight two-character alphanumeric tokens**. The existing [spatial-successor report](lp2-p50-highband-spatial-successor-chain.md) finds physically adjacent increasing sequences `48→49→4A→4B` and `4D→4E→4F`, with **`4C` missing** from the entire 256-cell original table. The current test accepts those observations without re-running the many existing spatial shuffles.

There is an exact second reading of the same absent literal token:

1. As hexadecimal ASCII, `0x4C = 76`, which is the letter **L**.
2. Under the repository's conventional, *provisional* base-60 interpretation of the printed numerals, `4C = 4×60+12 = 252`; `252 mod 29 = 20`, exactly **GP29(L)** in the original Gematria Primus index order.
3. Of the **58** LP2 physical pages, only **p55 has exactly 76 printed runes**. Thus the ASCII code of this source-absent glyph is an exact, unambiguous *page-length selector*.
4. Original physical **p32 starts with the GP rune L**. Separately, p32 and p55 contain the strongly registered blurred/sharp illustrations of the same tree; see [original-image correspondence](lp2-p32-p55-blurred-tree-correspondence.md). The first-rune observation is weaker than the numerical identity because **four** LP2 pages start with L (p3, p4, p17, p32).

These are reproducible coincidences between *different observable source registers*. Reading an absent table token as an instruction to visit a page is a hypothesis. The source does not supply that instruction, and the cross-radix reading was noticed after the spatial bands and page counts were already known. Do not attach a discovery-wide chance probability to the conjunction.

## Complete fixed candidate census, including rivals

Hexadecimal ASCII uppercase letters A through O produce literal two-character tokens `41`…`4F` and are the full uppercase letter set whose hex spelling could fit the actual panel's single-digit high glyph `4`. For each of these **15 candidates**, enumerate all 256 original printed tokens, convert its hypothetical token to base60, reduce modulo29, and compare to the canonical GP index of its ASCII letter (K aliases C). Do this also for **present** tokens, so the missing `4C` is not tested alone.

| Candidate | Exact original result |
| --- | --- |
| **Self-indexing base60-to-GP letter** | **L only**: `4C → 252 → 20 = GP(L)` |
| Missing among the 15 hypothetical ASCII tokens | **A, B, C, D, L** |
| Absent ASCII tokens whose decimal code is a physical LP2 rune-page length | **B→66→p49; L→76→p55** |
| Simultaneously self-indexing, absent and uniquely matched to a page length | **L→p55 only** |
| p32's first GP letter | **L** (p3, p4 and p17 also start with L) |
| Same `4C` token under alternative radix59 | **248 mod29 = 16**, different from GP(L)=20 |

The last row is an important **radix sensitivity**. The ASCII reading of `4C` is stable, but the 29-index self-match only exists if the speculative source convention is exactly **base60**, rather than the nearby base59 interpretation studied elsewhere in the repository. It therefore cannot be used as independent validation that base60 is correct without circularly assuming the intended cross-radix connection.

This full finite comparison sharpens the newly observed missing-L pattern. It does not independently establish a key, source instruction, sequential traversal, or a decoded rune. The other absent letters and B→p49 count are explicit rivals to selecting p55 from absence alone.

## Reproducible original-input test

[Single-file read-only Node.js CommonJS original-data SFT](../sims/lp2_p50_missing4c_dualradix_page55_sft.cjs) reads `resources/liber-primus/base60-grid.json` and `resources/liber-primus/lp2-corpus.json`, asserts all **256** token-to-byte source conversions, enumerates all **15** qualifying ASCII letters, validates the exact self-index/absence/page-length conjunction and the base59 counterexample. The complete source-positive claim is arithmetic and census only: no reversible decoder is proposed or plant falsely called a plaintext verification. The original source-data calculation was independently executed directly on GitHub-fetched JSON.

## Decision and prospective requirement

Retain this as an *exploratory navigational conjunction*: the numeral panel may mark a missing **L** that points to **p55**, while **p32** has the same rune at its first position and shares the illustrated tree motif. A human can reconstruct the arithmetic without unbounded cipher-key search, but the decisive missing element is **an original creator-selected operation consuming L or the p55 page**.

A useful next step requires either a historical first-party instruction prescribing the dual base60/ASCII/GP reading or a **frozen full-original p55 inverse** derived independently from this `L` pointer that recovers natural text and predicts untouched material, including the authentic p54→p55 word carry. Do not optimize shifts, KDFs, page rotations, alphabet alternatives or image thresholds until that operation is independently selected. Nothing here warrants changing the established solution status in `results/README.md`.
