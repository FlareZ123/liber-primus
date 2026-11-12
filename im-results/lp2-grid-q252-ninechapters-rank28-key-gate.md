# Exact nine-chapter × 28-state quotient-key inversion of LP2

**Agent 31, 12 November 2026. Status: source-constrained complete-family necessary-condition negative, with one explicit original-key inverse and source-native plant. No unknown plaintext, authenticated key or new destination.**

## Upstream human-puzzle premise

A genuine clue-led opportunity joins four independently visible structures:

1. Cicada's signed 2013 TCP challenge demonstrates **BASE29 3301 = 3QO**, corresponding to ascending GF29 polynomial coefficients **[3,26,24]**. Physical LP2 p39's uniquely 13-dot-bracketed red triple supplies **[27,5,15]**. Their degree-four product, **[23,21,11,17,12]**, divides all **256** printed base60 byte coefficients of the LP2 pp49–51 numerical rectangle under the existing source-order GF29 reading, with zero remainder. That factorization is previously established; see [complete factorization](lp2-grid-complete-gf29-factorization.md) and [radix gate](lp2-grid-numeric-codec-ambiguity.md).
2. Keeping all formal coefficient slots when dividing the 256-source-cell vector by a degree-four polynomial yields **252 GF29 quotient slots**. The first quotient slot is **zero**, because the first table byte is 203 ≡0 mod29; the actual quotient polynomial has a lower degree. Treating all 252 slots as key data is therefore a proposed *fixed-length* convention, not an authenticated ciphertext instruction.
3. The original book visibly divides into exactly **nine top-level chapters**, physical pp0–2,3–7,8–14,15–22,23–26,27–32,33–39,40–53,54–55; see [original visual chapter atlas](lp2-global-original-visual-section-map.md).
4. The ciphertext has very few adjacent equal runes. A candidate reversible 29-output/28-choice rank encoder uses one of the 28 runes *other than the immediately preceding ciphertext rune*. Nine chapters × **28** key phases equals the formal **252** quotient slots.

These observations motivate a *specific missing inverse/key test*, rather than further periodic-key trial-and-error. The weakest leap is treating polynomial quotient coefficients as the nine complete rank-key blocks and assuming a 28-step chapter clock.

## Exact candidate cipher and a broader secret-key obstruction

Let the 252 formal high-to-low quotient coefficients be `Q[0..251]`. Partition them as nine consecutive groups of 28. For chapter `s`, the first rune carries an unenciphered initial state; for each following local position `i≥1`, use a repeating phase `j=(i−1) mod 28` and the literal conditional key `K[s,j]=Q[28s+j] mod 28`. Let the published rune be `C_i∈{0,...,28}`.

At a nonrepeat site, invert either of two standard preceding-ciphertext exclusion encoders:

- **Sorted excluded rank:** `R_i=C_i−[C_i>C_(i−1)]`, from 0 to 27.
- **Cyclic excluded rank:** `R_i=(C_i−C_(i−1) mod29)−1`, from 0 to 27.

For the fixed quotient key, decode `P_i=(R_i−K[s,j]) mod28`. The book's **86 adjacent-repeat sites** are explicitly interpreted as the escaped GP rune `EA` (index28) and are excluded from the rank diagnostic, as are the nine chapter leaders. This escape interpretation is hypothetical. The operation is source-complete and reversible given the declared state.

There is also a much stronger **unknown-key-independent test**. An arbitrary **secret 28-way bijection** could replace the fixed subtraction *for each of all 252 chapter/phase states*, granting an adversary 252 independently chosen permutations. Such secret relabelings cannot change the frequency of same-rank pairs *within each source-defined chapter/phase*. Therefore the aggregated phase-conditioned equality rate of `R` is an exact invariant of every such secret key. English-like GP28 plaintext should retain the native-language within-phase collision rate, rather than an almost perfectly flat 28-symbol count.

## Original-cipher result

Source bytes: 32×8 conventional-base60 rows of `resources/liber-primus/base60-grid.json`; byte SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`. All nine original chapter lengths are **[729,1145,1729,1903,1021,1433,1680,3008,308]**, totaling 12,956 runes.

The nine quotient blocks contain only **[16,19,21,16,19,16,18,17,22] distinct GP29 coefficients** respectively. **None** is literally an unknown 28-symbol permutation table. That rejects a direct keys-as-permutations reading, but ordinary additive shifts can repeat, so the complete inverse above remains meaningful.

| Source-relative 28-rank decoder | Genuine original rank-phase equality | Fixed quotient-key decoded GP29 IoC | Exact Shakespeare-GP28 key/encoder plant equality |
| --- | ---: | ---: | ---: |
| Sorted exclusion | **29,336 / 815,506 = 0.0359727580** | **0.0352801377** | **0.0611595745** |
| Cyclic exclusion | **29,136 / 815,506 = 0.0357275115** | **0.0353065668** | **0.0611595745** |

Both original fixed-key outputs remain near the 28-way uniform background, with no GP-English text. The first 100 output runes are logged in the SFT for human inspection. A held-out source-native Shakespeare-GP28 plant uses exactly the same nine chapter lengths, the same actual 252 quotient-derived key slots, the same 28-clock rule and **all 86 original doublet sites overwritten as escapes**. Its exact inverse recovers **12,870 / 12,956** genuine planted plaintext runes; all **86** remaining sites are intentionally erased at the same original source positions. Both plants attain a phase equality rate **0.0611595745** and decoded GP29 IoC **0.0603853032**, demonstrating that a true language-bearing register under this exact mechanism is detectable even with the documented escapes.

The **original rank equality** is key invariant, so replacing the quotient digits with *any* nine-by-28 additive key, or indeed with *any* unknown independent phase-specific 28-symbol permutations, cannot make it match the demonstrated GP-English reference rate. This is a substantial necessary-condition obstacle against the proposed **stationary per-chapter period-28 rank alphabet**, beyond a failed particular key. The language inference is conditional on ordinary English-like GP28 source text; atypical languages, preprocessing and changing nonlinear state are untested.

## Research decision

Reject the **particular table-quotient → nine 28-slot keys → immediate-predecessor 28-rank cipher** as a route to plaintext under both standard rank encoders. Its exact 252-slot count does not authenticate a cipher schedule, and an arbitrary hidden stationary chapter/phase key cannot repair the flat source-rank collision statistics to native-English levels. Do not re-search quotient phase offsets or source-derived additive keys merely to improve a short English score.

New work would require a separately indicated **changing state, alternate 28-choice alphabet construction, independently recoverable key, or a non-GP English intermediate**. This result does not refute the exact 2013/base29 and p39 source factorization, the nine original chapter boundaries, other uses of the table, or an as-yet-undiscovered LP2 decoder.

[Single-file original-source CommonJS regression](../sims/lp2_grid_q252_chapter9x28_no_repeat_sft.cjs). The script reconstructs the exact coefficient quotient with zero remainder, retains all 252 formal slots, measures the complete source ciphertext and original chapter/phase invariant, asserts every source feature, and encrypts/recovers the matched GP28 control with 86 real-place erasures.
