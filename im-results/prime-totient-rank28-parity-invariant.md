# Source-independent parity sieve for prime/totient 28-rank enciphers

**Status, 10 November 2026:** exact original-cipher arithmetic obstruction under a specified GP-ordinal plaintext register, with two fully reproducible positive forward/inverse controls. **No new LP2 plaintext, key, or cipher method.** The result eliminates a source-plausible combined mechanism without searching a single prime start position.

## Motivation and exact model

The authentic, solved LP2 physical page 56 encrypts GP runes by successive `φ(p_n)=p_n−1` modulo 29, with a literal `ᚠ` interrupter. The 55 unsolved rune pages have **86/12,901** within-page identical-ciphertext successors, suggesting a wholly different possible 28-rank *predecessor-excluding* emitter. This investigation asks whether the **same historical prime-totient source** could drive that separate construction.

For a GP plaintext symbol `P∈{0,…,27}`, a secret index `k` and its prime `p_k`, define the rank `r = (P ± (p_k−1)) mod28`. An optional GP EA symbol `P=28` emits the preceding ciphertext rune verbatim. Two fixed, invertible choices for other outputs:

* **Cyclic-rank:** `C_t = (C_(t−1) + 1 + r) mod29`. The published nonzero difference determines `r = C_t−C_(t−1)−1 mod29`.
* **Field-power-rank:** `C_t = (C_(t−1) + 15^r) mod29`, where `15` is primitive in `F_29`. The published nonzero difference determines `r=log_15(C_t−C_(t−1))`.

All arithmetic is original GP ordinal arithmetic with the explicit choice of one of these two published nonzero-rank representations. This experiment grants **every prime start**, every changing prime position, either additive sign, an arbitrary fixed odd rank offset (parity inversion), and up to one special first-prime position per original page. The visible predecessor is taken within each page; no source text is fitted for a key.

## Key-free mathematical proof

Except for the unique even prime `2`, **all primes are odd**, hence `p_k−1` is even. Adding or subtracting an even number modulo 28 cannot change a rank's parity. Therefore **every unknown key index disappears from the parity test**. Except for a maximum of 55 `p_1=2` positions (one per physical rune page), the recovered rank parity must be exactly the GP plaintext-symbol parity, or its fixed complement. In particular, a candidate secret prime offset of 1, 79, 3,301, two million, or arbitrary mixed offsets cannot affect the observed even/odd counts.

The source gives **12,815** original within-page nonrepeating transitions after removing 86 adjacent repeats. Exact counts:

| Original rank from original ciphertext | Even count | Odd count | Larger of two classes |
| --- | ---: | ---: | ---: |
| Cyclic rank (`Δ−1`) | **6,495** | 6,320 | 6,495 |
| Field-power rank (`log_15 Δ`) | **6,426** | 6,389 | 6,426 |

The independently sourced `resources/control/shakespeare_first300k.txt`, GP-tokenized **word by word** so digraphs never straddle word boundaries, contains **217,167** non-EA source runes. Its **204,353 contiguous windows** of exactly 12,815 non-EA runes contain between **6,847 and 7,511 even GP ordinals**. Even granting all 55 first-prime exceptions so that they *always* push toward the source interval, cyclic-rank has at most **6,550** even symbols, a shortfall of **297** from the least-even Shakespeare window. Field-power-rank has at most **6,481**, a shortfall of **366**. Both fail all **204,353/204,353** frozen GP-English source windows.

A separate author-adjacent, editorially imperfect historical LP1/LP2 solved text control has **1,957/3,529 = 55.4548%** even among its GP non-EA symbols, consistent with the Shakespeare corpus's approximately **55.589%**. These are **conditional source-language models**, and the manuscript's true plaintext need not have their parity spectrum.

## Generative sanity checks

The self-contained [CommonJS reproducer](../sims/prime_totient_rank28_parity_invariant.cjs) encrypts 55 original page-length GP-language source segments, one as cyclic-rank with first prime 2, another as field-power-rank with prime start 79. In each plant the symbolic inverse recovers **all 12,901 noninitial plaintext positions**, with exact glyph-by-glyph re-encryption asserted during generation. EA produces source-native repeat positions, while every other symbol produces an invertible nonzero step. The source correctness regression and the original theorem passed in [manual GitHub Actions run 42825412437](https://github.com/FlareZ123/liber-primus/actions/runs/42825412437), invoking the existing [historical-key workflow](../.github/workflows/onion-cookie-key-manual.yml) with `source=rank28-parity`.

## What remains open

This exact sieve applies to **direct GP numeric 28-rank coding with prime or prime-totient additive shifts**, one of the two specified nonzero-step tables, and *at most one first-prime odd exception per page*. A new global unknown GP-to-rank permutation, distinct 28-bit binary or compressed intermediate, symbol-dependent parity mixing, a clock restarting at every word, or a different nonlinear source construction lies outside it. Even for GP plaintext, the exclusion is relative to the explicitly measured English/Cicada reference frequency; it is not an unconditional impossibility theorem for any imaginable message.

**Research use:** Replace exhaustive millions-of-prime-start searches within this *specific* nonrepeating direct-GP family by the parity capacity certificate. Redirect compute toward models that demonstrably break parity or reveal an independently fixed secret alphabet instead of adding arbitrary prime offsets.
