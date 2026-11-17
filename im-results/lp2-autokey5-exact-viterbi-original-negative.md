# Exact five-position GP29 plaintext-autokey inverse on original opening (17 November 2026)

**Decisive bounded original result.** The complete physical LP2 p0–2 ciphertext (729 untouched GP29 runes; all 158 original printed words) fails the **classical five-rune plaintext-autokey addition model**, even granting the solver *any* of the (29^5=20,511,149) initial five plaintext symbols. A genuinely independent Shakespeare GP29 bigram model is optimized **globally and exactly** with a 5-cycle dynamic program. The original optimum is **−5.174765 nats/rune**, producing unreadable GP text. Eight **Gibran** plaintext controls, absent from model training and planted into the original 158 word lengths, each recover **729/729 symbols** and all five initial GP states; their optimum scores span **−2.645960 to −2.509760 nats/rune**. Thus this frozen family offers no recovered original plaintext, with a large calibrated language gap.

This experiment is an original-output receiver for one **small, historically known, reversible classical cipher**. The apparent five-back word structure and source five-dot motif merely motivate testing five positions; they do **not** specify a plaintext-autokey equation. The conclusion retires **this exact recurrence and source register on p0–2**, not all five-step state machines, alternate ciphers, unknown language registers or other chapters. It does not reproduce prior unselected 5-phase substitution and H1 drift searches.

## Frozen operation and exact-key recovery

Use the authentic GP29 rune-index alphabet, with every rune 0…28. A first-five-symbol seed is arbitrary. At rune i≥5, the model is

```
C[i] = (P[i] + P[i-5]) mod 29
P[i] = (C[i] - P[i-5]) mod 29
```

The original printed words are preserved as the **language-model boundary**; arithmetic runs continuously over page and word breaks. For any fixed residue j modulo five, plaintext values depend only on the one unknown initial P[j]. Compute all 29 candidate plaintext chains for each of the five residues. A frozen GP29 unigram plus **within-printed-word bigram** log-likelihood then couples only neighboring residues, including the 4→0 wrap. This is a five-cycle pairwise factor graph. Condition on the 29 possible P[0] values and apply dynamic programming across the other four residues, closing the cycle exactly. The method explores the **global optimum over every possible five-symbol seed**, without enumerating 20.5 million keys, simulated annealing, guessed cribs or local optima.

The language model is built solely from `resources/control/shakespeare_first300k.txt`, transliterated to the same source-native 29 GP glyph indices. Unigram Dirichlet counts use +1; within-word bigrams use +0.25, and unigram log-likelihood has weight 0.25. The Gibran control source is `resources/control/gibran_prophet_58585.txt`, independent of model training. Eight fixed-seed control selections draw native Gibran whole words of **exactly the original 158 source word lengths**, preserving every original word break and total 729 GP runes. For controls, the first five ciphertext glyphs equal the five plaintext glyphs, and the frozen forward recurrence encrypts every later position. The receiver is not given the planted initial state.

## Observations from the exact committed SFT

[Standalone read-only Node22 CommonJS SFT](../sims/lp2_plaintext_autokey5_exact_state_original_sft.cjs) consumes the canonical unmodified original source corpus and the two fixed reference texts. It asserts p0–2's exact 729-rune/158-word source geometry, the 217,106-rune Shakespeare model, all GP29 consistency, inferred global score, and exact 729-rune forward re-encryption under the inferred state.

| Input | Best score, nats/rune | Exact inferred true plaintext |
|---|---:|---:|
| Unmodified p0–2 | **−5.174765** | Unknown; output is nonprose |
| Gibran original-shaped control 0 | −2.645960 | 729/729 |
| Gibran original-shaped control 1 | −2.582498 | 729/729 |
| Gibran original-shaped control 2 | −2.509760 | 729/729 |
| Gibran original-shaped control 3 | −2.597269 | 729/729 |
| Gibran original-shaped control 4 | −2.555641 | 729/729 |
| Gibran original-shaped control 5 | −2.597981 | 729/729 |
| Gibran original-shaped control 6 | −2.621513 | 729/729 |
| Gibran original-shaped control 7 | −2.617994 | 729/729 |

The original inferred seed is **[25,0,25,20,10]**. Its first 150 GP runes begin `AEFAELIDIARATADUWAJTHEARIANGWOCLSINGITHYFFLWE...`; these are nonlinguistic artifacts of the frozen optimum, **not plaintext**. The original score is over 2.5 nats/rune worse than every independent source-native English control, so a coherent original chapter is absent under this equation. The original word shape itself was not fitted.

**Decision.** A standard five-lag plaintext-autokey can be inverted fully and cheaply from sufficiently long native English, yet fails decisively on the real opening. Do not spend CI on its five-symbol key enumeration or use a new guessed pad to rescue it. Any further autokey work needs a **distinct original-authored operation or side input**; 86 suppressed doublets and 104 lag-five events alone are not an opcode. All unknown LP2 pages remain undeciphered.
