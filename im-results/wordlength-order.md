# LP2 word lengths show no detectable adjacent-length dependence (2026-11-10)

**Classification: independently computed empirical structural observation; plaintext mechanism remains unknown.** This investigation replaces a potentially misleading assumption behind simple word-length cribs: the spaces visible in the manuscript might not preserve the adjacency relationships of English plaintext.

## Result and comparison

Using the canonical rtkd/iddqd-derived transcription in `resources/transcriptions/liber_primus_master.txt`, the 56 unsolved LP2 pages have **2,896 rune words** (12,956 runes). Preserve mid-word line and page wraps, counting rune words between `-`, `.`, `&`, `$`, or `§`. Three coarse length categories were selected for this exploratory test: short (1–2 runes), medium (3–5), long (6 or more). The order-1 contingency table is:

| previous / next | short | medium | long |
|---|---:|---:|---:|
| short | 94 | 278 | 159 |
| medium | 276 | 828 | 445 |
| long | 161 | 444 | 210 |

Across **2,895 pairs**, Pearson independence χ² = **3.9494**, with 4 degrees of freedom and asymptotic tail p ≈ **0.4129**. Thus LP2's word-length categories fail to exhibit detectable adjacent dependence under this coarse scheme. At lags 2 and 3 the χ² values are **1.4229** and **1.2428** respectively. This is a failure to reject independence, not proof that the order is mathematically independent.

The 694 rune words from the solved LP1 section, processed by the identical tokenizer, yield the χ² = **15.3927** (p ≈ **0.00395**, df 4) for adjacent length classes. Three public-domain literary references encoded to the solved page's GP word-length convention also show strong order structure. The reference volumes are sourced from the exact GitHub blobs pinned in [the literary crib screen](wordlength-literary-crib.md):

| Control (whole text) | Words | χ², lag 1, df 4 | Minimum χ² across 300 fixed-seed contiguous 2,896-word windows |
|---|---:|---:|---:|
| Gibran, *The Prophet* | 12,572 | 373.79 | 54.45 |
| Hesse, *Siddhartha* | 39,793 | 549.18 | 17.35 |
| Emerson, *Essays, First Series* | 74,866 | 2,117.97 | 43.15 |

Every one of the **900 overlapping control windows** has a stronger categorical word-length association than LP2's complete 2,896-word sequence. These windows are dependent and constitute a power comparison, so 0/900 is **not** an independent p-value.

## Search for displaced word order

A straightforward scrambling hypothesis is that English word adjacency survived at a fixed lag (odd-even or other columnar word order). The scanner calculated the same 3×3 test at all word offsets **1–128**. The maximum observed χ² is **10.9005** at lag **34**; next are lag 106 = 10.3957, lag 12 = 10.3440, and lag 38 = 9.8609. To control the 128-test search, it shuffled the 2,896 observed lengths 300 times (deterministic xorshift32 seeds), rescanned each shuffle, and recorded the maximum. **293/300** shuffled baselines have a maximum at least as large as the real maximum (empirical upper-tail probability **294/301 ≈ 0.9767**). Therefore **no fixed word offset 1–128 restores the missing association** on this test. The observed maximum sits unusually low in this exploratory null distribution; avoid inferring deliberate balancing from that marginal lower-tail observation alone.

## Direct search over simple whole-word permutations

As a follow-up to the null lag scan, we tested whether columnar and rail-fence rearrangements of **whole word positions** restore English-like local adjacency. Each page's word groups were assigned by the page of the word's **first rune**, preserving word wraps across page boundaries. The tested family consists of 4 modes (forward column read, inverse column read, alternating-direction/serpentine row read, rail-fence read) at widths 2–24, applied separately under three grouping rules: globally, within each of 9 segments, or within each of 56 pages (including the empty numeric page). That gives **276 transformations**.

The largest transformed adjacent 3×3 length χ² = **14.4154** for segment-wise rail-fence width 8; next is page-wise inverse width 2 at χ² = **12.8595**. Over **300 deterministic length-shuffle controls**, **214** random baselines have a family-maximum at least that high (empirical upper-tail **215/301 = 0.7143**; shuffled median maximum ≈15.5638). Thus **none** of these 276 simplistic word-order interpretations restores detectable syntactic length dependence after accounting for selection. The test does not rule out keyed or irregular permutations, unknown original word breaks, or other languages. Implementation and standalone regression: `sims/wordlength_transposition.js` and `sims/test_length_transposition.js`.

## Mechanistic implications and caveats

Standard fixed-length-per-rune encryption of ordinary English with **faithfully copied word boundaries** would preserve the kinds of adjacent word-length correlations present in the English controls, even if rune identities are encrypted. LP2 does not show that common signal. Possibilities include encrypted/rearranged boundaries, permutation of whole plaintext words, a source text in an unusual literary register or another language, or a fully different encoding. This test cannot choose among them. The 1–2 / 3–5 / >=6 categorization was exploratory and is not a cryptographic key recovery.

The main actionable consequence is that **word-length source attribution cannot be treated as a reliably plaintext-preserving channel** until an independent reason to trust LP2's word separators emerges. A next attack should explicitly model a boundary permutation or alternative language before assigning high confidence to long literal cribs.

## Reproducibility

- `sims/wordlength_order_test.js` contains pure CommonJS functions for the 3-category contingency table, χ², lag scan, deterministic shuffled family-wise null, and source-text control windows. It imports the validated tokenizer and English-to-GP length approximation from `sims/wordlength_crib_scan.js`.
- `sims/test_length_order.js` is a single-file runnable test for the entire observed LP1/LP2 metric set. Run it using Node.js in the `sims/` directory, with no packages or downloaded data required.
- The 300 English windows are deterministic (xorshift32 seed `0x12345678`). Public-domain text sources are exactly those named and pinned in the previous report. Under `englishRuneLengths(sourceText)`, each can be passed to `englishWindows(sourceRuneLengths,2896,300)`.
- The lag-family null scans 128 lags over 300 shuffles with xorshift32 seeds `(i*2654435761)>>>0`, i=1…300, and reports the conservative (exceed+1)/(repetitions+1).
