# A fixed source prime-totient clock plus arbitrary secret tableau cannot explain LP2 through sparse no-advance collision repair

**Agent4, 17 November 2026. Classification:** original-input, permutation-independent necessary-condition exclusion with exact best-case lower bounds and source-native synthetic controls. **No unknown plaintext or actual cipher key is recovered.** This report narrows the potential use of the newly powered 29×29 bigram-tableau inversion and prevents a false original-tableau attack under the wrong pointer clock.

## Why the test is causally relevant

The established solved LP2 p56 `AN END` genuinely decrypts using **Euler totients of successive ordinary primes modulo29**. One possible historical transfer to the still-unknown first 56 LP2 pages is a *fixed* prime-totient clock driving an unknown GP29 substitution permutation. The ciphertext's extraordinary adjacent-doublet deficit (~86 native equal pairs in 12,956 runes, compared with ~445 for uniform GP29) could then be explained by a **post-emission repair** overwriting about 81% of otherwise repeating outputs **without advancing the prime-key pointer**. In this scenario, a secret tableau might appear random under ordinary single-key attacks yet be learnable with the [proven bigram/Hungarian inverse](../sims/lp2_h2_oracle_bigram_hungarian_sft.cjs) because its row path is known directly.

Crucial rival: repairing output duplicates can distort the state-conditioned source-symbol histogram, hiding the English frequency concentration that any true rowwise bijection preserves. This experiment tests the strongest version of that rival **without knowing any of the table's 29! permutations**.

## Exact key-free invariant and optimal edit lower bound

Freeze the physically motivated secret state `g=(physical page, φ(prime[clock_i]) mod29)`. The source clock can be continuous across the full unknown book, restarted at every physical page, or restarted at the nine visually demarcated chapters. **Grant the author a separate arbitrary secret permutation for every `(page, prime residue)` state**, a much more powerful table than the 29-row shared-secret model; a state therefore has only about eight observed runes on average. Any such cipher, applied without modifying runes, preserves the number of *equal-rune pairs within a state*, because replacing every glyph through the same bijection preserves exact equality.

For each state/symbol group containing `c` copies of a plaintext rune, replacing that rune in one slot can destroy at most `c−1` unordered equal-symbol pairs, and the next slot can destroy at most `c−2`. The **most optimistic** globally achievable collision reduction after `m` edited emitted glyphs is therefore the sum of the `m` largest marginal gains `2(c−1),2(c−2),…,2` over all source state/symbol groups. We even allow a replacement to a fresh symbol with no same-state collision, whether or not one is available in the actual 29-rune alphabet; this can only *underestimate* the required edits. No plaintext or output glyph is fitted to original ciphertext.

The unchanged original LP2 has exactly **12,956** unknown GP29 runes over pages0–55 (physical p50 is rune-free). Evaluate **150 independent-ish, fixed-stride** length12,956 native-English GP29 windows from the separately committed Shakespeare source, using its established GP transliteration. Each native control is allowed its own *best-possible arbitrary set of output positions and replacement values* chosen to eliminate as many equal pairs as theoretically possible. To reach the original ciphertext's collision count, even this optimistic adversary requires:

| Fixed φ(prime) key clock | Original ordered equal pairs | Minimum English-control ordered pairs | **Minimum output edits required among 150 native controls** | Median required edits |
|---|---:|---:|---:|---:|
| Continuous book | **3,602** | 6,050 | **751 (5.80%)** | 917 (7.08%) |
| Physical-page reset | **3,594** | 5,924 | **699 (5.40%)** | 850 (6.56%) |
| Nine chapter resets | **3,670** | 6,076 | **736 (5.68%)** | 851 (6.57%) |

These are **lower bounds on edits**: the optimal imagined repair can deliberately target any source rune, even those unrelated to adjacent doubles. A realistic cipher can only do worse. All **150/150** native controls in each source clock need at least the stated minimum changes to reduce conditional GP-symbol collisions to the original level. The source all-secret prime-clock equality test without any repair already existed in [`sims/lp2_prime_totient_allsecret_state_permutation_sft.cjs`](../sims/lp2_prime_totient_allsecret_state_permutation_sft.cjs); the new result is the **best-case correction-capacity bound** under arbitrary sparse repair.

## Exact q=.81 lag-six postrepair plants

As a constructive check, generate **50** fresh deterministic 12,956-rune Shakespeare control windows and **50 secret `56×29` sets of independently random GP29 permutation alphabets**. Use the page-local first-party prime-totient clock. If an initially emitted ciphertext glyph repeats the preceding **output** glyph, replace it with the source-observed six-back affine relation `24 − 2 C[i−6] mod29` with probability `q=0.81`, **without advancing the prime-totient key**. Treat the p39 six-back relation as an experimental candidate; no author-selected operation is claimed. All native window pairs equal their permutation-encrypted values **exactly** before postrepair, independently proving the invariant.

| Across 50 native q=.81 controls | Minimum | Mean | Maximum |
|---|---:|---:|---:|
| Adjacent repeat-repair opportunities | 404 | 447.62 | 486 |
| Actually changed ciphertext symbols | **312** | **350.46** | **386** |
| Ordered within-state pairs before repair | 6,048 | 6,353.84 | 6,716 |
| Ordered within-state pairs after repair | **5,936** | **6,203.28** | **6,522** |

**Zero of 50** repaired controls approach the original **3,594** ordered within-state equal pairs. More importantly, **the maximum 386 changed glyphs** is dramatically below the **optimistic minimum 699 required** in any of the 150 literary controls under the most forgiving page-reset source clock. The result does not depend on the precise six-back replacement formula: *any* repair changing no more than the allowed number of emitted positions is subject to the same lower bound.

## Decision and scope

Retire **fixed prime-totient row clock + statewise bijective secret tableau + sparse *non-consuming* output repair** as an explanation of ordinary GP29 English LP2. Additional 29! permutation searches cannot fix the equality-invariant deficit, and a source-cited lag-six overwrite affecting only ~2.8% of ciphertext glyphs is not a sufficient rescue. The result is conditional on an English-like native GP plaintext and the three frozen source clocks; it does **not** rule out a truly *skip-consuming* key pointer, per-rune arbitrary state, aggressive edits affecting ~5.4–8% of the whole book, an earlier plaintext transform making the 29-symbol register flat, or a different/unknown key stream.

The [standalone, read-only Node22 CJS SFT](../sims/lp2_prime_totient_tableau_repair_capacity_sft.cjs) computes every source histogram from original 12,956 untouched GP runes and the committed independent Shakespeare reference, proves the arbitrary-bijection equality invariance with 50 randomly generated secret tables, asserts the mathematically optimal edit lower bounds for all 150 controls and all three prime clocks, and plants the exactly specified q=.81 no-advance six-back repair positives. The stronger [oracle table recovery](../im-results/lp2-h2-apostrophe-crib-oracle-identifiability.md) remains valid on planted H2 with an actual skip-consuming key clock, but cannot be transferred to original LP2 by assuming the source φ(prime) key row is simply `K[i]`.
