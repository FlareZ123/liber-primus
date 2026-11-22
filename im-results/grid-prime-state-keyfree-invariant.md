# Key-independent 256-state inverse: GP-prime running-sum substitution is unsupported by original LP2

**Status:** exact structural invariant with a 12,956-rune independently encrypted and correctly recovered source-native control. **No original unknown plaintext/key recovered.** Executed successfully in [GitHub Actions 42806260396](https://github.com/FlareZ123/liber-primus/actions/runs/42806260396), 10 November 2026.

## General cipher class, far beyond fixed source keys

The original unresolved manuscript contains 12,956 GP ciphertext runes and 2,896 words in eight printed text sections. Let the observable register q accumulate the **GP prime values of already emitted ciphertext** modulo 32, and let an eight-way public column be either the printed section or the uninterrupted rune clock modulo eight. There are 32×8 = **256 observable states**. A cipher can reset q at each page, word, section, or only once per book.

Assume each one of these 256 states carries its own **completely arbitrary unknown 28-symbol permutation**. After the first glyph of a physical page, ciphertext equals its predecessor when GP plaintext is EA (index28); otherwise, map the plaintext glyph (0..27) through the current state's unknown permutation into either the cyclic or increasing-numeric rank among the 28 ciphertext glyphs other than the predecessor.

This is a strictly causal and reversible cipher class, with **(28!)^256** different secret substitution-table choices per reset/rank model. The secret tables need not be additive, affine, periodic, grid-derived or even algorithmically succinct. Unlike testing thousands of keys, one key-free statistic can examine *all* secret tables simultaneously.

For each observable (q,column) state, count the 28 nonrepeating ciphertext ranks. Under a fixed secret permutation in that state, the rank multiset is merely a relabeling of the corresponding plaintext-ordinal multiset. Therefore the pooled conditional index of coincidence, total within-state equal ordered symbol pairs divided by total within-state ordered pairs, is **mathematically identical** before and after any secret permutation. This is an *exact invariant*, requiring no original key recovery or language-model fitting.

## Executed original and source-native controlled values

The primary model uses physical-page reset, the global rune clock modulo eight, and cyclic predecessor-exclusion rank. The immutable original ciphertext gives:

| Quantity | Value |
| --- | ---: |
| Original conditional IoC | **0.03567120616488441** |
| Uniform 28-symbol baseline | **0.03571428571428571** |
| Equal within-cell ordered pairs, original | 22,830 |
| All within-cell ordered pairs, original | 640,012 |
| Occupied cells with pairs | 256 |
| Matched random nonrepeat null mean, 128 seeds | **0.03566784145727095** |
| Null standard deviation | **0.00033334597880364** |
| Original upper-tail null probability, plus-one | **0.4961240310** |

The matched surrogate generator preserves every original physical-page first glyph and **the exact locations of all repeated predecessor glyphs**, drawing nonrepeated successors uniformly from the 28 distinct possibilities. These controls retain the number and placement of the putative EA markers and source page boundaries. Their spread confirms that the observed conditional figure is ordinary under this narrow no-English null.

A separately generated 12,956-rune GP-English sample, encrypted with **256 independent secret 28-permutations** selected by a seeded xorshift32 generator, gives **conditional IoC 0.06319073440963306** (40,996 equal ordered pairs out of 648,766). The decryptor, supplied the true secret tables, recovered **all 12,956 original plaintext runes**, and exact ciphertext re-encryption succeeded. Its per-state conditional IoC was bit-for-bit **equal** when computed from the original plaintext labels, a direct computational assertion of the invariant.

Across all **16** publicly specified reset/column/rank models, the highest retrospectively selected original IoC is only **0.03608405171968148**, still much closer to chance than the planted source-native control. This cross-family maximum is descriptive and was not calibrated as an independent discovery test.

## What is eliminated, and what survives

The original rune distribution has no visible conditional **English-GP lexical marginal signal** under the tested 256-state *public-running-prime* construction, even if every state may contain an **arbitrary secret 28-permutation**. The negative result is stronger than testing particular key bytes from the 32×8 table: any unknown substitution table attached to this specific public state would be constrained by the same source-blind invariant.

It remains a conditional exclusion. A hidden plaintext that is **compressed, non-English, already cryptographically mixed, or expressed in a different intermediate alphabet** could resemble uniform ranks under a correct reversible cipher. Secret state that also depends on unrecoverable key material, additional ciphertext history, hidden language-sensitive events, or a different treatment of EA falls outside the model. Statistical evidence cannot prove a universal cipher impossibility.

**Technical reproducer:** [sims/grid_prime_state_permutation_invariant.cjs](../sims/grid_prime_state_permutation_invariant.cjs), run with Node22 in the existing [manual grid workflow](../.github/workflows/grid-section-digests.yml). The script reads only source GP runes, original word separators, source prime values, and the independent Shakespeare GP reference, and leaves all sources unchanged. Exact output, including every primary result and the 16 model comparisons, is preserved in [CI 42806260396](https://github.com/FlareZ123/liber-primus/actions/runs/42806260396).

**Research direction:** Reject attempts to fit larger secret lookup tables at these 256 public states under the ordinary GP-English register. The next meaningful work needs a genuinely different **state-generation rule or intermediate plaintext representation** that provides its own source evidence and produces a new heldout ciphertext prediction.
