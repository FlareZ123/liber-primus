# Xorshift32 full-state exclusion for direct GP28 successor generators

**Agent 45, 17 November 2026. Classification: exact, original-cipher, narrowly scoped generator negative. No recovered plaintext, key, method or continuation.** Reproducer: [single-file Node22/CJS full-state SFT](../sims/lp2_xorshift32_rank28_allstate_sft.cjs); [manual Windows workflow](../.github/workflows/agent45-xorshift32-allstate-manual.yml).

## Why the calculation is worth keeping, and what it cannot decide

The canonical LP2 ciphertext is nearly a walk of nonzero increments on the 29-symbol Gematria Primus alphabet: just 86 identical adjacent runes among 12,901 within-page transitions. Encoding an increment either as one of the **28 nonzero residues** or as one of the **28 powers of a primitive root modulo 29** is a direct way to build such a stream. A small 32-bit pseudorandom generator is a possible source for that walk. If a genuine original direct-generator model matched, recovering its internal state would be more useful than testing guessed seed dictionaries, though it would still need an independent explanation of how plaintext was carried.

This test grants a distinct unknown full 32-bit state to **every physical page**; that is stronger state freedom than a single manuscript-wide seed. Xorshift32's three shift distances are fixed at (13,17,5), the common textbook implementation. It is **not named or selected by a Cicada clue**. The source's 28 nonzero increments motivate the observable, while the generator choice is exploratory. This test does not claim the code is an intended cipher.

## Original-input and all-secret exact model

The untouched original GP29 corpus at resources/liber-primus/lp2-corpus.json contains 12,956 ciphertext indices on 55 rune-bearing physical pages 0–55, excluding numerical-table-only p50. The shortest rune page has 66 symbols. At every **within-page** transition take D = +/- (C[i]-C[i-1]) mod29. A nonzero D is read as rank = D-1 or rank=log2(D) mod28, since 2 has multiplicative order 28 modulo 29. Hypothesize rank = (xorshift32_output >>> window) %28, with **every** window 0–30, both difference signs, and both rank encodings. Permit an unseen xorshift draw at the page head, and permit the 86 zero-difference sites to either consume an unseen draw or skip one. For each page, this makes **31 x 2 x 2 x 2 x 2 = 496** source-clock specifications.

Because 28 is divisible by four, rank & 3 reveals precisely the two low bits of the shifted 32-bit xorshift word. Those output bits are *linear functions over GF(2)* of the arbitrary 32-bit initial state. Generate 32 basis seeds, apply the complete xorshift update to each for every assumed draw, construct the two corresponding linear equations per nonzero step, and perform exact XOR Gaussian elimination. Once a contradiction appears, **no possible 32-bit secret initial state**, including zero, can reproduce that page under the selected direct-generator rule. No English scoring, guessed seed, inferred key word, or unverified ciphertext data enter the gate.

## Executed results

**All 27,280 original page/model combinations are inconsistent:** 55 pages x 496 models per page, with **zero** states surviving the complete original-page test. In every case, the first contradiction arrives between zero-based within-page rune offsets **15 and 24**, long before the shortest original page ends. The set covers each of the 31 possible contiguous two-bit output windows and both canonical rank28 assignments, with both source-simple handling choices for zero steps and initial page output.

**Exact positive controls: 165/165 full-secret seed recoveries.** For each of 55 original page lengths and original repeat-position masks, generate three authentic xorshift32 ciphertext plants using an independently defined nonzero starting state unknown to the inversion routine. The three frozen variants deliberately exercise ordinal/nonzero, multiplicative/exponent, both signs, zero-draw versus zero-skip, page-head draw versus no draw, and windows 0, 16 and 30. The identical GF(2) solver reconstructs **all 32 starting bits exactly** in all 165 cases (rank 32/32). Thus the source original's contradiction is not an implementation inability to invert a correct generator.

Source and model assertions, the page-by-page contradiction offsets, seed-planted controls and recoveries are printed by the executable. The source plaintext status remains unchanged; the test does not decode unknown GP29 runes or assert a generator for any source artwork.

## Decision

Retire **direct unmasked xorshift32(13,17,5) ordinal/power-of-2 modulo-28 successor-step generation**, with a 32-bit secret state independently chosen per page and the tested clocks. There is no reason to sweep its 2^32 seeds.

**The exclusion does not apply** to a genuine plaintext-bearing cipher that combines xorshift keystream outputs with unknown plaintext, to hidden variable draw counts, alternative nonuniform reducers, nonlinear output maps, another PRNG family, a cipher keyed by the actual 256-byte table, or a high-entropy external one-time pad. Recovering an author-selected key operand or complete reversible cipher remains the required path to plaintext; further direct generator-catalog expansion without such a clue would repeat the streetlight pattern.
