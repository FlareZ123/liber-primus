# Red-ink-only fixed substitution: original-source discriminator

**Status (11 November 2026):** A single unchanged 29-symbol monoalphabetic substitution cannot plausibly explain all **16 red spans on unsolved physical LP2 pages 0–55** as ordinary GP-English. This original-ciphertext negative uses a key-independent exact invariant and independent source controls. It supplies no unknown plaintext or key.

## Source-visible solve-path premise

A human reader sees that particular rune words/paragraphs are printed in red. One natural low-cost idea is that they form a separately enciphered channel under a shared substitution alphabet, independent of the surrounding black manuscript. A monoalphabetic substitution preserves the histogram and index of coincidence (IoC) of any concatenated plaintext corpus, regardless of the unknown 29-symbol secret alphabet.

Original input: `resources/liber-primus/lp2-corpus.json`, selected by original page-local red spans in `resources/liber-primus/lp2-ink-annotations.json`. The separately solved pages 56–57 are excluded, so the original sample is **16 spans, 213 runes**. The 16 spans may be disconnected; the tested assumption is a *single global lookup* across them. The original symbol IoC, with the denominator `N(N−1)`, is **0.03383824962352733**.

## Predeclared controls and finding

The source-language control is the independently held `resources/control/shakespeare_first300k.txt`, normalized to the existing 29 GP spellings (`QU→CW, V→U, K→C, Z→S, ING→NG`), yielding **217,644** GP runes. For each of 20,000 deterministic draws, select one independent contiguous GP segment of the exact length of each of the 16 red spans, concatenate the 213 symbols and compute IoC.

The source-only ciphertext control independently rotates each original red-span mask inside its **original physical page**, preserving the page input, every red-span length, and its number of observations. The same 20,000 draws use xorshift32 seed `0x33014141`. The direct fixed-bijection positive check maps each rune `x→(11x+7) mod29` and establishes IoC is **exactly unchanged**. Such invariance holds for all secret 29-rune permutations.

| 213-rune sample | IoC |
|---|---:|
| **Original 16 red spans** | **0.03383825** |
| Length-matched native-English control mean | 0.05950810 |
| Lowest native-English control in 20,000 | 0.04867570 |
| Native-English lower-tail bound | **1/20,001 = 0.000050** |
| Original-page red-mask rotations mean | 0.03405559 |
| Original-page rotation lower-tail fraction (plus-one) | **0.463877** |

The original red symbols behave like ordinary LP2 ciphertext and are grossly unlike native GP-English's substitution-invariant concentration. This rejects the *source-motivated fixed shared substitution* as a route to authentic red plaintext under the tested English register; searching all 29! secret lookup permutations would not change this discriminator.

## What this does not settle

The test makes no claim about per-span/per-section alphabets, non-English plaintext distributions, homophonic/polygraphic or stateful ciphers, outer binary encoding, source-derived running keys, or whether the red stencils provide *key material* rather than a readable standalone message. The native corpus is not proof of the authors' exact linguistic register, and 20,000 draws are finite controls. A new red-ink decoder would need an independently fixed operation that recovers original material.

**Reproducer:** [`sims/lp2_red_ink_substitution_invariant_sft.cjs`](../sims/lp2_red_ink_substitution_invariant_sft.cjs). It reads the original source resources, uses a fixed seed and performs no file writes. Node.js 22 CommonJS; native GP and the original-page nulls are constructed without a fitted secret key.
