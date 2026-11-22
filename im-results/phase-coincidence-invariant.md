# LP2 rune-phase collision invariant: shared page keys and continuous periods

**Evidence:** exact equality-preservation derivation, seeded Monte Carlo tests and held-out-source positive controls. **No LP2 key or plaintext recovered.** Agent 34, 2026-11-10.

## Algebraic mechanism and explanatory scope

Let ciphertext position `t` satisfy `C_t = σ_t((P_t+K_t) mod 29)` where the output map `σ_t` is a bijection of the 29 runes. For positions `i,j` with **the same pad value** and **the same output permutation**, `C_i=C_j` if and only if `P_i=P_j`. This necessity does not require knowing, fitting, or brute-forcing the 29! possible `σ` permutations. More generally, it applies to an arbitrary **one-to-one mapping reused at the same phase**, even without additive group structure. If a shared page key starts at the first rune of each page, equality across different pages at a shared rune offset should retain the above-1/29 natural-language plaintext collision profile, absent sufficient corruption. For a globally continuous key of period `L`, the corresponding test groups rune positions with identical absolute offsets modulo `L`.

These invariants require deterministic phase synchronization across the compared positions. Hidden key skips, differently keyed outer alphabets, word-level transpositions, deliberate nonsparse ciphertext overwrites, changing plaintext encoding and unrelated per-page keys are outside the conclusion. The expected high same-rune probability derives from the specified **English GP register**, rather than a universal property of any potential secret code.

## Actual page-reset signal

Use original unsolved LP2 pages 0–55, excluding the runeless page 50: **55 rune-bearing pages, 12,956 runes**. Compare all pairs of physical pages at the same within-page rune position. There are exactly **311,132** eligible pairs, with **10,751** equal-symbol outcomes and rate **0.0345544656**, close to the uniform reference **1/29 = 0.0344827586**.

A null rotates each original physical page independently while preserving its complete sequence, rune inventory, and anti-adjacent-repeat properties, and repeats the identical cross-page pairing procedure. In **1,000** fixed-seed null rotations, median rate **0.0345030**, 5th–95th percentile **0.0339502–0.0350591** and empirical upper-tail **p=0.42358**. The unrotated alignment does not exhibit preferred shared-key phase.

The critical positive control uses the withheld final 60k characters of a GP-transliterated public-domain Shakespeare sample (**43,802 runes**), the actual 55 LP2 page lengths, fresh random 256-symbol shared additive pad and random 29-rune ciphertext permutation, and replaces 81% of candidates that would repeat the preceding ciphertext rune. In **100** independent plants, shared page-reset pads yield same-position equality rates **0.0562109–0.0589878**, median **0.0575222**, all above LP2. Control plants with independent per-page random pads have median **0.0344291**, near LP2. This test separates the specified models with large margins and does not claim universal detection across untested plaintext registers or alignment policies.

## Continuous repeated phases: full period family

Concatenate the 55 ciphertext rune pages in physical order. For every integer `L` from **2 through 1600**, group glyph positions by `t mod L`; count equal pairs within groups and standardize against the 1/29 baseline (the `z` statistic is a scan score, **not** a normally calibrated p-value). The strongest raw peak is **L=539**, equal-symbol rate **0.0359947**, `z=3.20122`. The manuscript period-256 rate is only **0.0347480**.

A family-wise calibration independently rotates every physical ciphertext page in **160** null books, scanning all 1,599 periods again per book. **109** null maxima equal or exceed the actual best, giving `(109+1)/(160+1) = 0.68323`. Thus the apparent 539 peak is consistent with manuscript-matched null structure. The strongest scan period is exploratory and has no recovered-key status.

A fresh positive control with 100 English-GP heldout books, one globally continuous 256-symbol random additive pad, a shared random ciphertext permutation, and 81% in-place adjacent-repeat rewriting yields a period-256 coincidence rate median **0.0574331**, range **0.0560361–0.0587523**. The real book shows no comparable signal. Independent per-page control keys give phase-256 median **0.03449596**.

## Reproduce and next discriminating objective

- [Exact Node.js 22 implementation](../sims/phase_coincidence_invariant.cjs): reproducible PRNG and histogram counts, independent page rotations, 100 held-out plants for each page/continuous/independent model; outputs all rates and statistics. 
- Inputs: [LP2 corpus](../resources/liber-primus/lp2-corpus.json) and [English GP reference](../resources/control/shakespeare_first300k.txt).
- [Successful on-demand CI run 42752446242](https://github.com/FlareZ123/liber-primus/actions/runs/42752446242) and [manual workflow](../.github/workflows/phase-coincidence-invariant.yml).

**Inference:** shared page-reset or continuous short-period fixed-phase bijections operating directly on the specified GP-English source are strongly disfavoured. This is a necessary-condition architectural test: no rune plaintext or key has been recovered. Better future attacks should reconstruct an **independently predicted key-pointer path**, source-dependent per-occurrence mapping, or different intermediate plaintext encoding rather than broadening this already-negative fixed-phase period search.
