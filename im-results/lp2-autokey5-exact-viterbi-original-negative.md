# Exact GP29 five-rune plaintext autokey: both signs, two original chapters (17 November 2026)

**Original-cipher result.** Two source-motivated, fully reversible **five-position plaintext-feedback** ciphers fail to recover English plaintext from the unchanged original opening pp0–2 (**729 GP29 runes, 158 printed words**) and visually five-dot-marked pp23–26 (**1,021 GP29 runes, 224 printed words**). Both signs are completely invertible; every one of the (29^5=20,511,149) possible initial five-symbol plaintext seeds is optimized **exactly** under an independent GP29 language model. The best original outputs are unreadable on **all four** combinations, while **eight original-geometry Gibran controls for each** recover **every symbol and seed**. This retires the two specified classical five-rune plaintext-autokey models as ordinary GP-English mechanisms on these chapters, without claiming any unknown plaintext or extrapolating to unrelated ciphers.

These are **hypothesis choices, not authenticated Cicada opcodes**. Five positions are suggested weakly by the source five-dot motif (recipient pp23–26); the positive and negative feedback signs are two standard modular arithmetic variants. Earlier original p0 729-rune/27×27 observations and solved GP inversion methods motivate checking both signs, but neither source chooses the recurrence. No new key source is claimed.

## Frozen equations and exact inverse

Use the original ordered GP29 rune-index alphabet 0…28 and preserve the actual printed word/page layout. For sign `s=+1` or `s=−1` independently, a secret five-rune plaintext state initializes positions0…4. For every i≥5:

```
C[i] = (P[i] + s*P[i-5]) mod 29
P[i] = (C[i] - s*P[i-5]) mod 29
```

Within each complete tested chapter, the modular recurrence crosses printed word and physical page boundaries. For a fixed sign, each five-phase plaintext chain is an exact deterministic function of its single initial state. Precompute all 29 chain trajectories per phase, score them under an independently trained GP29 unigram+within-word bigram language model, and optimize the five-state **cyclic pairwise factor graph** via exact 29-way conditioning on the first state and dynamic programming on the other four. The cyclic 4→0 score is included. Thus the returned state is **globally optimal over the full 29^5 keyspace**, without beam search, simulated annealing or plaintext cribs.

The independently frozen training corpus is `resources/control/shakespeare_first300k.txt`, with **217,106 native GP runes**, +1 unigram and +0.25 within-word bigram smoothing and fixed unigram log-likelihood weight0.25. The disjoint genuine-English plant corpus is `resources/control/gibran_prophet_58585.txt`; the algorithm selects whole words with exactly the authentic source word-length sequence, seeds its own original source cipher from the selected first five GP symbols, and blinds the receiver to those states. Each sign uses **eight** such exact-geometry controls at each of the two original chapters. All 32 controls decrypt every rune perfectly and recover every initial five-symbol seed; exact inverse/forward original reconstruction is also asserted.

## Complete original-cipher and positive-control outcomes

| Chapter | Feedback sign | Original best GP-English model log score, nats/rune | Eight positive-control scores, range | Recovered planted GP runes |
|---|---:|---:|---:|---:|
| p0–2: 729 runes, 158 words | +1 | **−5.174765** | −2.645960…−2.509760 | 8 × 729/729 |
| p0–2: 729 runes, 158 words | −1 | **−5.183493** | −2.645960…−2.509760 | 8 × 729/729 |
| p23–26: 1,021 runes, 224 words | +1 | **−5.229442** | −2.643657…−2.566232 | 8 × 1,021/1,021 |
| p23–26: 1,021 runes, 224 words | −1 | **−5.218181** | −2.643657…−2.566232 | 8 × 1,021/1,021 |

The original optimized seeds are respectively `[25,0,25,20,10]`, `[19,16,24,16,21]`, `[4,5,20,7,23]` and `[8,22,10,16,16]` in the above row order. Output excerpts begin `AEFAELIDIARATADUWAJ...`, `MTATNGNXATHEIAGFRF...`, `RCLWDIESODFDUXTYC...`, and `HOEITTOETTYROEAOXX...`. They are nonprose optimum artifacts, **not decrypted text**. Every original score is >2.5 nats/rune worse than independent native-English positive controls. The control ranges for p23–26 above were corrected to match the **exact original-geometry script**; an earlier version of this report copied numbers from a temporary separate-run Gibran sampler with different selection positions. The true controls remain 100% recovered.

## Independent equality invariant and its original-source constraint

For i≥6, both adjacent cipher symbols are already under known five-step plaintext feedback. With either frozen sign `s`, the within-word adjacency identity is

```
C[i] = C[i-1]
  iff P[i] + s*P[i-5] ≡ P[i-1] + s*P[i-6] (mod 29).
```

**Any fixed secret bijection of output rune symbols, even a separate arbitrary GP29 alphabet for each printed word, preserves this equality.** It cannot repair the original adjacent-doublet deficit for the same five-back feedback model. A fixed 4,096-plant independent draw per sign and chapter selects full, genuine Gibran GP29 words at every original source word length, encrypts them with the frozen sign and records within-word adjacent equal symbols at original indices i≥6. The original ciphertext comparison requires no English key recovery or scoring:

| Original chapter | Sign | Original same-word adjacent equalities (i≥6) | Control mean ± SD | Min in 4,096 controls | Empirical lower-tail |
|---|---:|---:|---:|---:|---:|
| p0–2 | +1 | **2** | 20.158 ± 4.449 | 6 | 0.0002441 |
| p0–2 | −1 | **2** | 23.666 ± 4.870 | 9 | 0.0002441 |
| p23–26 | +1 | **9** | 28.313 ± 5.254 | 12 | 0.0002441 |
| p23–26 | −1 | **9** | 33.013 ± 5.927 | 13 | 0.0002441 |

All four outcomes have **0 of 4,096 controls** with equal or fewer matching within-word doublets than the original, so the smoothed one-sided Monte Carlo tail is `1/4097`. These are **conditional results for the pinned native-English source distribution**, not universal exclusion probabilities across conceivable messages, alternate languages, punctuation-reinterpretation, hidden padding, changing output permutations, or unrelated feedback clocks. The invariant alone is an especially useful key-independent cipher-family constraint.

## Algebraic whole-word key attack: source dictionary as a direct plaintext gate

A second independent [exact dictionary-state SFT](../sims/lp2_autokey5_exact_dictionary_original_sft.cjs) now tests whether **any** initial five-symbol plaintext seed produces a complete, actual English GP29 word at a source-selected anchor, without optimizing a language model. Convert all complete words in the two separate native-English references (Shakespeare and Gibran) into the original 29-rune orthography and keep **6,834 unique GP29 word types**. Choose the **first complete original printed word with length≥5**, before inspecting decoded candidate words.

For fixed sign, every plaintext position `i` is an affine function `P[i] = a[i] * seed[i mod5] + b[i] (mod29)` with `a[i]` always ±1, determined *entirely* from the exact original ciphertext and the sign. Each genuine English dictionary word at that anchor uniquely determines all five seed symbols; check its remaining runes for algebraic consistency and then test consecutive original printed words with the resulting seed. No `29^5` enumeration, hidden scoring, guessed crib or key selection is needed.

| Original chapter | Sign | First long original word anchor | Distinct native dictionary candidates | Full five-state seeds consistent with anchor | Longest initial source-English word sequence |
|---|---:|---|---:|---:|---:|
| p0–2 | +1 | word1, 8 GP runes, source offset0 | 771 | **0** | **0 words** |
| p0–2 | −1 | word1, 8 GP runes, source offset0 | 771 | **0** | **0 words** |
| p23–26 | +1 | word2, 6 GP runes, source offset2 | 1,331 | 37 | **2 words** |
| p23–26 | −1 | word2, 6 GP runes, source offset2 | 1,331 | 58 | **2 words** |

**All 32 separately encrypted genuine Gibran controls** produce full source-prefix recognition (**158/158 or 224/224 words**, eight per case) and the **exact true five-symbol seed**. The first p0–2 original word is an eight-rune red title fragment; its absence from this particular 6,834-type dictionary does *not* prove an author did not use a proper name, rare archaic word or another plaintext register. The test is an exact **corpus-conditional key existence result**, not a universal English lexicon theorem. For p23–26, the first two candidate words are short and produce no sustained text; no third complete word follows under either sign. This independent direct whole-word criterion agrees with the separate bigram model and equality invariant.

## Reproducer and decision

[Single-file read-only Windows Node.js 22 CommonJS SFT](../sims/lp2_plaintext_autokey5_exact_state_original_sft.cjs) consumes canonical `resources/liber-primus/lp2-corpus.json` and `lp2-transcription.txt`, the two pinned GP English control texts, original word lengths and complete rune sequences. It asserts the exact 729/158 and 1,021/224 geometries, all 32 blind planted decodes, original forward reproduction, exact state-score recomputation, and 4×4,096 frozen original-geometry equality controls. The separate exact word-lexicon SFT asserts its algebraic original prefix results and its own 32 complete source-shaped control recoveries. The final exact remotely committed script was executed against the exact remote source files in a JS runtime, with all assertions passing.

**Decision:** neither additive nor subtractive five-rune plaintext-autokey explains the real opening or actual five-dot original chapter under a common native-English register; an arbitrary static output-rune renaming cannot rescue either. Before further computational campaigns, obtain a genuine *creator-visible* operation, initial key or rule for changed state. Do not repeat a 29^5 key sweep, tune an F exception, or invent a position-dependent letter rewrite to rescue these specific failed models. All 56 original unknown LP2 physical pages remain unsolved.
