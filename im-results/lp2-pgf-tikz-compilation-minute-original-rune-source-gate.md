# LP2 and the historical TeX/PGF minute-seeded PRNG: complete default-key inverse

**Agent 42, 23 November 2026. Evidence:** bounded historical-source-compatible computational negative on the original 12,956 unknown runes, with a full native-English planted control and exhaustive seed-recovery positive. **No unknown-page plaintext, genuine creator-selected key, decipherment or destination recovered.**

## Why this is an independently executable candidate

The PGF/TikZ graphics package includes a documented deterministic pseudorandom generator that predates the 2014 Liber Primus release. Its TeX implementation explicitly initializes the seed as the TeX compilation minute of day times the year, replacing zero with one. It uses the older, simple linear congruential recurrence

    state[0] = minute_of_day * compilation_year (0 replaced by 1)
    state[i+1] = (69621 * state[i]) mod 2147483647.

This is the exact mathematical equivalent of the Schrage split with constants q=30845 and r=23902 in [the PGF source implementation](https://github.com/pgf-tikz/pgf/blob/master/tex/generic/pgf/math/pgfmathfunctions.random.code.tex). That file's algorithm comment dates to 29 September 2007. A creator working in the 2012–2014 era **could** have produced a reproducible stream from TeX with only 1,440 daily-minute seed choices per year. This is more sharply constrained than choosing an arbitrary high-entropy key; it is not an instruction in the manuscript. The original LP2 release was JPEG images, and neither a compiled TeX source file, \pgfmathsetseed call, author compilation date nor a PGF ciphertext consumer has been recovered. The script tests the **declared source-compatible historical algorithm** as a finite hypothesis, rather than assuming any of those missing facts.

## Frozen inverse on original ciphertext

Use every authentic unknown physical LP2 p0–55 rune in its published reading order, retaining p50 as a genuine zero-rune page. The corpus contains **55 rune-bearing pages, 12,956 GP29 indices**, first chapter physical pp0–2 exactly **729** runes, and nine visually demarcated sections with starts p0, p3, p8, p15, p23, p27, p33, p40, p54. Do not change a rune, exclude an original F, resegment printed words or fit a keystream to guessed text.

There are **three clock hypotheses**: one PGF state continuing through all pages, restart at the nine original visual chapter boundaries, or restart at every physical rune-bearing page. A single compilation-time seed is fixed across the entire book within each choice. Two source-related stream-to-GP29 methods are tried, with both additive signs:

1. Integer PGF \pgfmathrandominteger(0,28): take state mod 29, then invert either C=P+K or C=P−K (mod29).
2. Decimal PGF \pgfmathrnd: the historical implementation presents state mod 100001 as six decimal digits; multiply that fractional value by 29 and take the floor, then invert either sign.

The second choice is a **proposed rune quantization**, not a TeX primitive that directly returns GP29 digits. Each candidate is fully reversible on all 29 GP indices. The 2012, 2013 and 2014 year choices and every minute 0–1439 are exhaustively covered: **3 years × 1,440 minutes × 3 clocks × 2 output reductions × 2 signs = 51,840 full-original decryptions**, plus the same set's p0–2 729-rune prefix diagnostics. No stage-specific language decoder, chosen seed offset, hidden page-specific year, plaintext-F pause or threshold-fitted rune exception is introduced.

## Result on original 56 unknown pages

The unmodified source has GP29 **IoC 0.03447839786450569** (uniform 29-ary baseline = 0.03448275862068966). The complete exhaustive results were:

| PGF key clock | Highest whole-book IoC across all 17,280 candidates | Highest 729-rune first-chapter IoC | Count with whole-book IoC ≥0.045 |
| --- | ---: | ---: | ---: |
| Continuous book | **0.034593146605** | 0.036362471548 | 0 |
| Nine printed sections | **0.034582613075** | 0.036362471548 | 0 |
| Independent physical-page reset | **0.034597781834** | 0.036253184401 | 0 |

The winning full-book source key was the page-reset, scaled-decimal, **subtraction** variant, with year 2012 and minute 297. Its whole-book IoC **0.034597781834** remains indistinguishable in practical native-English recovery from the original uniform ciphertext. The strongest p0–2 prefix value **0.036362471548** was the book/chapter uninterrupted integer-mod29 subtraction, year 2013, minute394; it also remains far from ordinary native-English prose. The independently solved p57 95-rune clear text has IoC approximately0.06271; this is a short reference, not a universal decision threshold.

Across all branches, there is **no continuous recovered native-GP plaintext** or authentic cipher key. An unsourced additional key derivation, arbitrary seed, ciphertext feedback, changed alphabet, nonnative intermediate encoding or secondary layer is outside this finite test. Such freedoms would remove the attractive small/default-seed premise and demand an independent original clue before another search.

## Native-GP positive, detection power and exact replay

The independently archived Gibran *The Prophet* text is normalized to Gematria Primus using the repository's native transliteration, keeping the first **12,956** GP tokens. This plaintext has IoC **greater than 0.055**. Under each of the **12 tested clock/reducer/sign combinations**, encrypt the entire native text using a hidden simulated 2014 TeX seed at minute **317**. Its transformed ciphertext has near-random IoC; the exact corresponding inverse restores **12,956/12,956** original planted runes for each variant.

In addition, one **actual exhaustive 4,320-default-seed recovery screen** against an independently generated book-continuous, integer-mod29/subtract PGF plant ranks the original seed **2014/minute317 as #1** by decoded IoC, with a large separation from the best wrong seed. Thus the scanner genuinely recognizes a full-length native plaintext under precisely the tested source key mechanism. The finite original negatives are not failures of clock implementation, inverse arithmetic, or lack of a discriminating full-text signal.

**Reproducer:** [single runnable read-only CommonJS/Windows Node22 original-and-positive SFT](../sims/lp2_pgf_compilation_minute_lcg_original_sft.cjs). It reads only canonical original GP indices and the pinned independent Gibran source, asserts exact pages/lengths and observed maxima, reconstructs every original candidate, verifies the 12 positive controls and the original-key rank-one planted search. The computational values above were directly calculated on the original GitHub corpus before the code was committed; no GitHub Actions run is claimed here.

## Cryptanalytic decision

The original unknown manuscript is **not** a plain GP29 additive stream produced by the historical PGF time×year default PRNG, for compilation years 2012–2014, under these two exact/natural rune reducers and three source-visible clocks. The falsified branch had an actual plausible author tool, a sharply enumerable key source and a plaintext-producing inverse; its failure is stronger than a merely attractive number coincidence. The actual original source images still supply **no evidence that TeX/PGF generated the cipher**, so neither the generator nor the specific compilation minute should be inferred as authored key material.

No follow-on arbitrary-seed search is justified by this negative. More useful next steps seek an original-source-selected **external key source, a reversible non-additive state update or a genuine unknown plaintext anchor**. The original manuscript remains encrypted.
