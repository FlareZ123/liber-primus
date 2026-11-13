# One source-led 29-state word-prime/totient inverse: identifiable on blind native controls, rejected on original LP2

**Agent 12, 13 November 2026. Director issue [#739](https://github.com/FlareZ123/liber-primus/issues/739).** This is a bounded original-cipher decision on **one** fully specified family. The 55 rune-bearing unknown LP2 physical pages remain **12,956 undeciphered GP29 runes in 2,896 printed words**. There is no recovered unknown-page plaintext, historical key or continuation. The quantitative negative below does not exclude general stateful ciphers, alternative language registers or a secret high-entropy pad.

## Why this candidate is human-discoverable, and its weakest assumption

Original Gematria Primus maps its 29 rune indices to the first 29 primes. Known LP2 p56 encryption uses a shifted prime/totient progression (with a separately documented literal-F exception). The Cicada-signed 2016 instruction says the manuscript's *words*, *numbers* and *direction* matter. These motivate a causal reading: each **previous ciphertext word's GP-prime sum** chooses the starting prime for **within-word, zero-based φ(prime) shifts**. One global secret rotation `b` remains to infer. The source **does not specify this composition**, which is the principal objection. The literal-F exception of p56 is *not* silently transferred to this new family. The reproducer independently regresses **all 85 authenticated solved-p56 GP runes**, consuming exactly **84** prime terms with that historical skip, before testing the new candidate.

For every complete printed word `w`, including page-carried words, define `s_0 = 3301 mod 29 = 24`, and `s_w = sum(GPprime(C[w-1])) mod 29` for subsequent words. With `j=0,1,...` inside the current word and `p_n` the zero-based `n`th conventional prime:

```
C[w,j] = (P[w,j] + (p_(s_w + b + j) - 1)) mod 29
P[w,j] = (C[w,j] - (p_(s_w + b + j) - 1)) mod 29
b in {0,1,...,28}; 29 keys = log2(29) = 4.85798 free bits.
```

No extra key, secret alphabet, unknown word boundary, chosen reset, nonlinear recurrence, letter normalization or phase sweep is fitted. Encryption is causal because the required preceding ciphertext word is available. All 29 keys invert **all original 12,956 symbols** exactly; re-encryption is an implementation check, not key authentication.

## Locked blind identifiability experiment

Use the [canonical actual word parser](../sims/lp2_word_pages.cjs) and [source runes](../resources/liber-primus/lp2-corpus.json). Original words are length 1–14, and their complete **2,896-word length vector** is frozen before the plants. Two independent native English prose sources provide 10 seeds: five Shakespeare and five Gibran. For every slot, sample an authentic GP-encoded source word of the exact printed LP2 length; encrypt all 12,956 resulting GP runes with a planted unknown `b`. The native GP encoder reproduces the attested `ING` and `IO` rune choices. Sampling authentic words creates an intentionally broken-sentence corpus, so the model scores **within-word** trigrams and never rewards invented sentence structure.

An independent **Emerson** English text trains a 29^3 GP29 native trigram distribution with Dirichlet `alpha=0.5`, **167,823** actual within-word trigrams. Search all 29 keys, selecting solely by the first **1,448** original word slots; reserve the last 1,448 for held-out scoring. Two wrong-family sets are subjected to the **identical 29-key selection**: (i) a lossless predecessor-ciphertext GP29 nonzero-step rotor whose EA rune emits an equal-cipher rune, thereby mimicking LP2's rarity of duplicate neighbors; and (ii) a per-symbol independent-rune mask from deterministically seeded SHA256 counter bytes, rejection-sampled uniformly modulo 29 (a long-pad-style counterexample).

**Pre-original acceptance threshold:** mean within-word native trigrams ≥ **−9.5 nats** on selection and held-out intervals. Native plants score **−7.46817 or better** on selection, with key success **10/10 at rank 1** and clear separation from the runner-up (usually approximately −12.2). The predecessor-rotor controls score **at most −12.21254** even after best-of-29 selection; all ten independently masked long-pad controls also fail the locked threshold. In all twenty wrong-family tests no false plaintext/key is accepted. All native plants decrypt and reencrypt exactly; the long-pad controls are deliberately the wrong architecture.

## Original source test and conclusion

Two **disjoint original visible chapters**, preserved with their printed word carries and the rest of the original ciphertext available for causal predecessor sums:

| Measurement | First original p0–p2 | Held-out original p40–p53 |
|---|---:|---:|
| Original GP29 runes | 729 | 3,008 |
| Printed whole words | 158 | 669 |
| Scored GP trigrams | 418 | 1,683 |
| Score using key `b=14`, selected only on first chapter | **−12.11181778** | **−12.31844613** |
| Frozen acceptance cutoff | −9.5 | −9.5 |

The independent second-chapter key search instead favors `b=18` (score **−12.17830819**). Neither chapter approaches the native-control threshold; the first and second do not even select the same `b`. The full-original re-encryption check passes for the selected `b=14`, as every mathematically valid inverse must.

**Research decision:** the one 29-key preceding-cipherword GP-prime sum to word-local φ(prime) progression is an easily identifiable, **unsuccessful original LP2 inverse**. Stop this family. Do not rescue it by tuning clocks, prime-index offsets, per-page rotations, non-source keys or exceptions after viewing the original. The unresolved question is which independently instructed key/state update produces coherent unknown text; the original's near-uniform runes and suppressed ciphertext doublets remain unexplained.

**Reproducer:** [standalone CommonJS SFT](../sims/lp2_wordprime_phi_smallstate_identifiability_sft.cjs), using only checked-in original corpus plus three checked-in independent English sources. The source-defined original positive/wrong-family controls, deterministic seeds, full 12,956-rune round trips, locked numerical results and refusal to promote the candidate are asserted in code. [Passing manual-only GitHub Actions run](https://github.com/FlareZ123/liber-primus/actions/runs/43410211988) (Node 22) executes this SFT through the existing preceding-cipherword source workflow.
