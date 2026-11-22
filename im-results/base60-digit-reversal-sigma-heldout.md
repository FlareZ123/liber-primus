# Source-cued base-60 character reversal: a selected heldout peak fails new manuscript material

**Classification: completed, reproducible bounded cryptanalytic key test. No original LP2 plaintext, key, mechanism or intended destination recovered.** Agent 9, 10 November 2026.

## Source clue and exact candidate cipher

The original LP1 `05.jpg` contains a central textual payload that is decoded by reversing the character order of a 358-character hexadecimal string before decoding the binary. Its independently recovered 5×5 numeric magic square and exact JPEG envelope are established in [the original-artifact analysis](jpeg05-palindromic-magic-square.md). This suggests, as a deliberately narrow *hypothesis*, reversing numeral characters in the LP2 source's 32×8 table of **two-character base-60 values**. It does **not** establish that LP1's operation is reused in LP2.

With the source table's exact base-60 alphabet `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx`, each cell has integer digits `hi,lo` with `0≤hi≤4`. The fixed candidate keystream is

```text
K[j] = (60 × lo[j mod 256] + hi[j mod 256]) mod 29
```

The manuscript encryption hypothesis is `C_i = sigma((P_i + K[pointer_i]) mod29)`, with one entirely unknown **shared** 29-symbol output bijection `sigma` and a collision-triggered skipped-key policy at suppression probability **0.81**. Each of eight full-length marked text sections starts its own key pointer at zero. The code uses a pooled 29×29 assignment/forward-backward and strict Viterbi alignment solver that can actually recover the 29-symbol unknown alphabet on planted GP-English controls. It is a full-key, hidden-skip and unrestricted outer-alphabet test, not a fixed Caesar reading.

The source-key alternatives tested independently are unmodified cell order with reversed base-60 digits, reversing entire cell order as well, raw 512 base-60 characters as direct keys, and a negative additive sign. All source cell readings are literal; no source byte changes, free offsets, or target-fitted key transformations are allowed. The exact encryption family is a candidate, not an assertion that it describes Cicada.

## First 480 runes: exploratory signal

Train a **single** arbitrary outer alphabet and section-specific skip path on the first **240 runes** of each of the eight sections (1,920 runes total). Freeze that alphabet while independently continuing to the next **240 runes** of each section (another 1,920). GP-English word-position frequencies come from a disjoint part of the fixed 300,000-character Shakespeare control source.

A first 30 shuffled-cell null screen singled out the forward character-reversed key. With **240** independent cell-preserving shuffle nulls (same optimization for all models), the actual second block scores **−4.969821694 nats/rune** versus null mean **−5.118086132**. Exactly **3/240** shuffled keys score as well or better, giving the add-one within-selected-model empirical upper tail `4/241 = 0.016598`. A negative-sign test scores −5.1359 against its 24-null mean −5.1392 (upper tail 0.48). The fully reversed-cell and raw-512-digit alternative p-values under 30 nulls are 0.8710 and 0.4194 respectively.

The 240-null result is **not** proof of a key. The character-reversed candidate was selected after observing the first holdout, with multiple reading/sign hypotheses; the quoted conditional tail has no discovery-wide multiplicity correction. More importantly, its decrypted GP rune stream is unreadable and scores far below a planted authentic-register example.

## Untouched third 240-rune block: failure to generalize

To remove selection ambiguity, we froze the selected forward reversed-digit keystream and *all* model hyperparameters. We continue each previously estimated alphabet and section key pointer through positions **480–719**, with **no new alphabet fitting or key offset search**. Those eight third blocks were not examined in the initial selected-key comparisons. All eight text sections are at least 720 runes long.

| Exact score, nats per rune | True-key planted GP-English | Original LP2 | Shuffled source-key null |
| --- | ---: | ---: | ---: |
| Second block, original selected test | −2.768860 | **−4.969822** | Mean −5.118086 (240 keys) |
| **Third, untouched block** | **−2.855435** | **−5.119604** | Mean **−5.113107** (240 keys) |

On the new third block, **137/240** independently shuffled source-symbol keys score as well or better than the original. The empirical upper tail is **138/241 = 0.572614**; the null SD is **0.057332** and the observed value is below the null mean. The originally observed advantage disappears without refitting anything.

**Powered positive control:** using 8 separate 720-rune English-GP passages from the first 16,000 Shakespeare word tokens, independent of the language training part, encrypt with the exact proposed 256-period key, a random global 29-way `sigma`, and the prescribed .81 collision-skip rule. The program recovers **29/29** unknown alphabet symbols and **0.8796875** of the 1,920 genuinely unseen third-block plaintext rune symbols. This establishes conditional sensitivity for the specified source register, arbitrary cipher alphabet and skip channel, even after propagating the fitted pointer across two intervening blocks. A meaningful genuine decryption would also need to reconstruct and exactly reencrypt a readable LP2 passage.

## Reproduction and interpretation

Source-locked CommonJS programs:
- [Second-block key and null search](../sims/base60_digit_reversal_sigma_heldout.cjs) and its [manual workflow](../.github/workflows/base60-digit-reversal-sigma.yml), successful 240-source-key comparison [run 42783659726](https://github.com/FlareZ123/liber-primus/actions/runs/42783659726).
- [Genuinely independent third-block continuation](../sims/base60_digit_reversal_thirdblock.cjs) and its [manual workflow](../.github/workflows/base60-digit-reversal-thirdblock.yml), successful 240-null [run 42784600716](https://github.com/FlareZ123/liber-primus/actions/runs/42784600716).

Both rely on the original annotated `resources/liber-primus/base60-grid.json` and the shared `lp2-corpus.json`. They use the existing tested global-alphabet and hidden-skip inversion modules without learning a key from real LP2.

**Current conclusion:** the appearance of a promising first heldout-score peak was selection-sensitive and failed an additional untouched source interval. This is a useful caution about overinterpreting optimized language scores under unconstrained substitution alphabets. The specific model of a 256-period character-reversed base-60 pad, shared outer alphabet, eight section restarts, and .81 key rejection has no credible plaintext recovery signal after continuation. This result does not exclude different source transformations, independent per-section keys, other GP plaintext encodings or another encryption architecture.
