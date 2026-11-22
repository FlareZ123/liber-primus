# The original 2013 Parable number as a complete-cycle F79/F3301 pad: exact original-input negative

**Agent 17, 2026-11-10. Classification: source-anchored finite-class cryptanalytic exclusion with full secret-table synthetic inverses. The original LP2 unknown plaintext, authentic key, cipher and destination remain entirely unrecovered.** This research freezes the historical number and tests a mathematically natural new primitive-field mechanism before attempting to fit unconstrained keys.

## Why these generators are historical rather than arbitrary dictionary seeds

The three original GP-prime-valued clauses on the independently solved LP2 *Parable* (physical p57) have sums **1,259**, **1,031**, **1,229**. Their product **1,595,277,641** appears in the original Cicada 2013 **761.MP3** ID3 record. This independently documented relationship existed before LP2 was released. Unlike a random phrase candidate, it is a real historical source clue to a possible cipher seed.

That product unexpectedly produces **full primitive multiplicative cycles** in two independently important prime fields:

| Modulus | Product residue g | Full multiplicative order of g | Proper-prime-divisor certificates |
| --- | ---: | ---: | --- |
| **79** (the red p15/53/Fibonacci prime) | **68** | **78** | `68^39 mod79=78`, `68^26 mod79=55`, `68^6 mod79=65` |
| **3301** (the historical Cicada constant) | **70** | **3300** | `70^1650 mod3301=3300`, `70^1100 mod3301=1726`, `70^660 mod3301=3217`, `70^300 mod3301=3184` |

In each field, `g^order=1` and none of the powers `g^(order/q)` for prime factors `q` of the group order equals1. This certifies the stated primitive roots. The original 2013 number remains a **post-selected candidate** for an LP2 key; the modular coincidences do not independently authenticate its intended role.

The source-defined key hypotheses are `x[t+1]=g*x[t] mod modulus` and either `K[t]=x[t] mod29` for direct rune symbols or `K[t]=x[t] mod28` for the previous-rune-nonrepeating step alphabet. All nonzero initial `x[0]` values are tested, equivalent to **every possible phase** of each full multiplicative cycle. We examine entire-book clocks, reset to the same unknown seed at each of **55** physical rune pages, and reset to the same seed at each of **eight** printed sections. For the 28-way prior-rune transport, both marker-skip and marker-consume clocks are tested.

## First, phase-free equal-symbol invariants on the original pages

If `C[t]=σ((P[t]+K[t]) mod29)` with ANY unknown fixed output rune permutation `σ`, and two clock positions have exactly the same key symbol, then their ciphertext equality is equivalent to their plaintext equality. In particular, a multiplicative key of order T repeats after T positions regardless of unknown initial phase.

On all **12,956 authentic LP2 unsolved rune positions** (55 physical pages, excluding p50):

| Exact pair equality | Original source matches / pairs | Original rate |
| --- | ---: | ---: |
| Whole-book glyph lag **78** | **456 / 12,878** | **0.035409** |
| Whole-book glyph lag **3,300** | **307 / 9,656** | **0.031794** |
| Zero-marker-skipping predecessor-step lag **78** | **466 / 12,737** | **0.036586** |
| Zero-marker-skipping predecessor-step lag **3,300** | **339 / 9,515** | **0.035628** |
| Same within-page glyph-clock position across physical pages, excluding IVs | **10,699 / 309,647** | **0.034552** |
| Same within-section glyph-clock position across printed sections, excluding IVs | **1,119 / 33,068** | **0.033839** |

The page/section clocks compare each glyph with all glyphs at its *same reset-relative position* in other groups; the periodic key would be exactly identical at those clocks, whatever its seed. The compacted step clock removes all literal zero steps, implementing the conditional EA-as-transparent-marker model.

In **20 geometrically identical source windows per edition** from checked-in native-GP Shakespeare, Gibran and Emerson, the corresponding alphabet-repeat rates lie around **0.058–0.070** (source-dependent) for book lags, and **0.056–0.066** for same-clock page/section comparisons. Every one of those 60 windows shows more equality than the authentic ciphertext on these metrics. Windows overlap and are intended to illustrate the plausible native-language register, not to supply a multiplicity-corrected or language-independent p-value.

Complete original and source-window tests, both finite-field order certificates and exact GP29/GP28 synthetic key/transport inverses: [source and reproducer](../sims/parable_primitive_period_source_gate.cjs), [successful manual original-CI run 42839038567](https://github.com/FlareZ123/liber-primus/actions/runs/42839038567).

## Second, exhaustive hidden-alphabet mutual information under direct additive GP29

For the direct 29-way model `C[t]=σ((P[t]+K[t]) mod29)`, the mutual information `I(C;K)` is **exactly unchanged** by *any* secret fixed 29! output permutation `σ`. This gives a seed/phase discriminator without guessing a single output alphabet assignment, and it tests substantially more than a fixed Caesar shift.

An exact full-cycle search evaluated **10,134** source-defined candidate keys:

```text
(78 nonzero F79 seeds + 3300 nonzero F3301 seeds)
× (book, page-reset, section-reset)
= 10,134 complete original-ciphertext key schedules.
```

Each score excludes the unconstrained first glyph/IV of its segment. All **10,134** original-input scores are near the source-independent contingency-table noise floor. The maximum across the entire seed/reset family is **0.0362091613 nats** (F3301, section reset; F3301 page reset is virtually identical). The familywise mean for each model sits near **0.031 nats**.

As a *real* inverse check, a disjoint **12,956-rune native-GP Shakespeare** source excerpt was actually encrypted under every source modulus and reset architecture using a freshly shuffled **whole-book secret 29-permutation output alphabet**. The decoder independently inverted all non-IV GP runes and re-encrypted them without error. Every planted true seed is in the **rank-one maximum equivalence class** when all modulus-phase seeds are scanned blind; source-product seed and its negative may tie because mutual information is invariant under a bijective key relabeling. The **minimum** source-true planted MI over six families is **0.450833 nats**, more than twelve times the **maximum** authentic-input value.

The exact six-family exhaustive search and synthetic recovery were successful in [GitHub Actions run 42839833993](https://github.com/FlareZ123/liber-primus/actions/runs/42839833993). [Complete 10,134-seed reproducer](../sims/parable_primitive_seed_mi_exhaustive.cjs).

## Third, exhaustive predecessor-conditioned 28-way secret substitution rows

A direct GP29 additive cipher would typically generate far too many adjacent repeated ciphertext glyphs. The original manuscript has only **86** such repeats within pages, which motivates a stronger, *exactly reversible* model respecting that observation:

```text
If P[t] = GP-EA: C[t] = C[t-1].
Otherwise:
  C[t] = S[C[t-1]][(P[t] + K[t]) mod28].
```

Here **each of 29 unknown stationary rows `S[a]` may be any independent permutation of the 28 glyphs *other than a***. The same unknown rows are shared across pages. Thus the model has enormous discrete key freedom (**29 copies of 28!**) and preserves all original non-repetition positions without needing a lossy output repair. A repeated output acts as a possible plaintext EA anchor, with two independently tested interpretations of whether it advances the running key. It is still only a hypothesis.

The source-exact necessary condition is powerful: at two observations with **the same predecessor ciphertext glyph `a` and the same key value K**, equality of their ciphertext output symbols is *exactly equivalent* to equality of their unknown plaintext symbols. This is true for every possible hidden row table, so no 28! row-permutation search is required. Aggregate the equal-output pairs over all 29×28 predecessor/key contexts, divide by all eligible pairs, and use this unknown-alphabet-invariant collision ratio as an original-language discriminator.

The fully exhaustive experiment spans **20,268 original-input forward model schedules**:

```text
(78 + 3300) nonzero source generator seeds
× (book, page reset, section reset)
× (EA markers consume key, EA markers skip key)
= 20,268 exact source schedules.
```

It uses all **12,815** authentic nonzero predecessor transitions plus the exact location of all **86** original literal same-glyph markers on the 55 pages. With the *entire* unknown row-key space still unrestricted, **the greatest original collision rate over all 20,268 seeds/clocks is only 0.0378630348**. This is very close to the expected collision of independent 28-way output symbols.

For every one of the 12 source-modulus/reset/EA-mode families, the script also generates an **independently encrypted, original-shaped 55-page GP-English ciphertext**, with **29 hidden random independent 28-way row permutations**, 12,815 native-GP Shakespeare non-EA source glyphs, and original-position **86 EA transparent markers**. The script exactly inverts all **12,815** source symbols, reconstructs the full **12,956** output glyph stream, and confirms that **every original marker site remains a repeated output**. Under the correct historical-source seed, the **lowest** of the 12 planted collision rates is **0.0604128839**, well above the **largest** authentic-input value across all seeds and architectures. The original and plants were subjected to the same complete phase scan, including all hidden-initial-phase alternatives.

Successful [GitHub Actions run 42840958657](https://github.com/FlareZ123/liber-primus/actions/runs/42840958657) · [20,268-seed GP28 feedback-row inverse and full sweeper](../sims/parable_primitive_feedback_row_collision.cjs).

## What this does and does not close

A historically sourced integer now provides **two genuine full primitive cycles**, and all directly natural additive applications to ordinary GP prose have been attacked with complete seed-phase coverage, fixed hidden alphabet freedom and genuine full-manuscript-shaped positives. The original shares no detectable native GP-English key-phase equality concentration with the controls. In particular, neither constant direct GP29 shifts nor secret stationary predecessor-conditioned GP28 rows become viable by changing only the 2013 product-derived multiplicative seed, choosing a different phase, or resetting at the tested page/section boundaries. Re-running those same phases with a different key-fitting heuristic would duplicate a completed source-exact negative.

**A language/encoding assumption remains necessary** to interpret the low equality/MI as incompatible with real plaintext. These are *not* absolute impossibility proofs for unknown non-English or compressed plaintext. The original clock may depend on glyph history or punctuation, the row substitution may evolve, reset seeds may be distinct per page, a radix/binary intermediary may precede the GP output, or the 2013 number may be wholly unrelated. All such alternatives require an independently specified decoder and original-cipher re-encryption to become credible.

The attack's reusable advance is the **same-key/same-predecessor collision invariant**, allowing entirely unknown fixed 28-way secret row tables to be evaluated without constructing them. Apply it to a newly justified keystream source before spending resources on permutation fitting. Keep the 2013 Parable number in the historical clue register, without promoting this conditional negative to a solved page.
