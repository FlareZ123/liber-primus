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

## Fibonacci-square-based sixteen-word routes

The physical LP2 page-15 number square supplies a 16-cell reading order already fixed by its clockwise Fibonacci-indexed prime spiral. A bounded new test used its five source-plausible cell orders (row-major, column-major, clockwise spiral, ascending printed value, and boustrophedon), each directed source/target ordering and all sixteen block phases, for **320 fixed global whole-word transpositions**. The observed source has **2,896 original complete words**; each route permutes full sixteen-word blocks while preserving its visible word lengths and leaving any incomplete edge block in place. This deliberately tests a manuscript-clue-constrained possibility absent from the older generic 276-transposition screen.

The maximum restored adjacent three-category word-length Pearson χ² was **14.22559**, obtained for a row-major-to-column-major route starting at phase eleven; the strongest arrangement explicitly involving the clockwise spiral reached **13.57481**. The original untransposed χ² is **3.94945**. In **200** seeded complete-length-shuffle controls, each rerunning all 320 alternatives, **116** null family maxima reached or exceeded the original best, giving **117/201 = 0.58209**. The null's median maximum was **14.98141**. This is a **bounded negative**: no evidence that an ordinary unkeyed 16-word permutation derived directly from the authentic Fibonacci-square reading order restores English-like adjacent-length dependence. It does not cover keyed or section-local shuffles, altered word boundaries, or other plaintext registers. No key or plaintext was recovered. [Executable source and full candidate/max-null check](../sims/fibonacci_wordroute_length_test.cjs), seed `0x15f1b0ac`.

## Independent one-rune insertion as a word-length explanation

The ciphertext's word-length mean can be raised by adding a rune to individual words, but the **order-dependence deficit persists** under the simplest version of that hypothesis. For each English reference, simulate exactly 2,896 consecutive words converted to approximate GP spelling, with each word independently lengthened by one rune with probability p. Retain word order and boundaries. The observed LP2 3×3 adjacent-length χ² is **3.94945**.

At **p = 0.45**, across 1,200 random contiguous windows per source (seed `0x50998abc`), the synthetic χ² means are **22.30** for Shakespeare, **69.61** for Gibran's *The Prophet*, and **56.90** for Emerson's *Essays, First Series*. Lower-tail simulation fractions for χ² at or below LP2 are **21/1201 = 0.01749**, **1/1201 = 0.000833**, and **1/1201 = 0.000833**, respectively. The same 1,200-sample procedure at p = 0, 0.2, 0.6, 0.75, and 1 yields Shakespeare lower-tail fractions no larger than 0.0142 and zero observed Gibran/Emerson hits. These Monte Carlo comparisons sample overlapping windows, so they measure these named source registers under the stated random-window model and must not be read as genre-independent p-values.

**Consequence:** independent occasional insertion of one rune per intact English word does not, by itself, explain LP2's unusually weak adjacency signal in these literary controls. A viable insertion model may require word-dependent/neighbor-dependent insertion, a separate reordering/boundary operation, or a source with different linguistic statistics. This is a conditional mechanistic constraint with **no recovered plaintext or key**; it does not refute non-English or heavily stylized source texts. Reproduction: `sims/wordlength_padding_dependence.cjs` (three committed English texts, exact source checksums printed, 1,200 deterministic samples for each of six probabilities).

## One-extra-rune model against the wordwise equality invariant

The same insertion proposal has a **second, independent fingerprint**: a fixed rune substitution used throughout a word preserves every original equal-symbol pair. Inserting one extra rune anywhere cannot destroy an original nonadjacent equal-symbol pair. Consequently the 1,536 ciphertext words of length 4–9, which contain **526** such pairs, must have at least the original-plaintext equality count if this model is correct.

Using the exact GP spelling and collision-count implementation of `sims/word_partition_invariant.cjs`, condition on each observed ciphertext length `L`. With independent insertion probability `p=0.45`, sample the original English word from the length-`L` reference group weighted by `(1-p)`, or the length-`L-1` group weighted by `p`. The Shakespeare **retained-original equality lower-bound expectation** becomes **550.6055 ± 23.6821** pairs, compared to **707.8787 ± 26.4423** without insertion. The observed 526 is approximately **1.04 SD below** this lower-bound expectation: a substantial improvement over the unpadded model. Corresponding expected retained-original counts are 506.15 for a Gibran text control and 572.33 for solved LP1 at this same `p`; the Gibran figure is exploratory because the separate initial test included Gutenberg boilerplate.

A dummy rune sampled **uniformly from all 29 rune values**, placed uniformly into its chosen word, produces additional nonadjacent collisions with original symbols. For an original word of length `n=L-1`, its expected extra collision count is exactly `n(n-1)/(29(n+1))`. Using Shakespeare source frequencies and the same conditional length mix, this adds **87.8699** expected collisions, yielding **638.4754** expected total against the observed 526. By contrast, a padding rule that deliberately avoids the entire word's existing symbols can attain the 550.6055 lower bound.

**Joint constraint:** a near-half-word padding mechanism can account for much of LP2's *within-word equality deficit*, especially if the dummy is chosen to avoid repeated symbols. Yet independent padding of ordered English words still fails to account for LP2's weak **between-word** length dependence documented above. A promising mechanism therefore needs at least one additional operation, such as rearranging word order, rewriting boundaries, or a language register outside the controls. These are conditional constraints on a cipher construction, with no recovered plaintext or key.

**CI-backed calibration.** [Manual word-length Actions run 42757295031](https://github.com/FlareZ123/liber-primus/actions/runs/42757295031) passed all canonical-word tests and both insertion models. In the 2,000 Shakespeare one-rune uniform-dummy replicates (seed `0x50e1a117`), the nonadjacent same-rune count had mean **638.9775**, sample SD **25.3184**, observed minimum **561**, and fifth percentile **597**. None reached the manuscript's **526** pairs: conditional add-one lower-tail estimate **1/2001 ≈ 0.00050**. This inference assumes the source-register, ciphertext word lengths, and insertion policy in the script, so it is not a discovery-wide p-value or a universal rejection of insertion.

Reproduction: `sims/wordlength_padding_equality.cjs` imports the established GP encoder/collision test, calculates the analytic lower bound for Shakespeare, solved LP1 and distinct Shakespeare spellings, and generates 2,000 deterministic English planted single-dummy controls (seed `0x50e1a117`) to calibrate the unrestricted-dummy model. Its source words and corpus are committed under `resources/`.

## Mechanistic implications and caveats

Standard fixed-length-per-rune encryption of ordinary English with **faithfully copied word boundaries** would preserve the kinds of adjacent word-length correlations present in the English controls, even if rune identities are encrypted. LP2 does not show that common signal. Possibilities include encrypted/rearranged boundaries, permutation of whole plaintext words, a source text in an unusual literary register or another language, or a fully different encoding. This test cannot choose among them. The 1–2 / 3–5 / >=6 categorization was exploratory and is not a cryptographic key recovery.

The main actionable consequence is that **word-length source attribution cannot be treated as a reliably plaintext-preserving channel** until an independent reason to trust LP2's word separators emerges. A next attack should explicitly model a boundary permutation or alternative language before assigning high confidence to long literal cribs.

## Reproducibility

- `sims/wordlength_order_test.js` contains pure CommonJS functions for the 3-category contingency table, χ², lag scan, deterministic shuffled family-wise null, and source-text control windows. It imports the validated tokenizer and English-to-GP length approximation from `sims/wordlength_crib_scan.js`.
- `sims/test_length_order.js` is a single-file runnable test for the entire observed LP1/LP2 metric set. Run it using Node.js in the `sims/` directory, with no packages or downloaded data required.
- The 300 English windows are deterministic (xorshift32 seed `0x12345678`). Public-domain text sources are exactly those named and pinned in the previous report. Under `englishRuneLengths(sourceText)`, each can be passed to `englishWindows(sourceRuneLengths,2896,300)`.
- The lag-family null scans 128 lags over 300 shuffles with xorshift32 seeds `(i*2654435761)>>>0`, i=1…300, and reports the conservative (exceed+1)/(repetitions+1).
