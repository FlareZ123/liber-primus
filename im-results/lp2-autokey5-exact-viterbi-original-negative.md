# Exact GP29 five-position plaintext-autokey inverse on two original chapters (17 November 2026)

**Original ciphertext decision:** A source-native, completely reversible, five-rune **plaintext autokey** has now been inverted optimally under every possible initial five-symbol GP29 state on *two independent, authentic, untouched LP2 chapters*: physical pp0–2 (**729 runes / 158 original words**) and the visually five-dot-marked pp23–26 (**1,021 runes / 224 original words**). Both best plaintexts remain unreadable. The globally optimized original scores are **−5.174765 and −5.229442 nats/rune**, respectively, while eight independently shaped Gibran English test passages per chapter are fully recovered (**729/729 or 1,021/1,021**), with scores around **−2.5 to −2.7**. No unknown original LP2 plaintext, key or destination recovered.

This is an original-chapter, finite negative for a historically established reversible cipher family. The source five-dot motif makes p23–26 a plausible *recipient* for a five-step test, but **no original creator instruction specifies a plaintext-autokey recurrence or its sign**. We do not generalize to all feedback ciphers, other changing plaintext registers, other chapter-specific algorithms or lost offsite keys.

## Frozen operation and complete state search

All rune operations use the **original, unchanged GP29 numeric indices** 0…28, with original word and page boundaries retained. A five-rune plaintext initial state is unrestricted. For each later rune i≥5,

```
C[i] = (P[i] + P[i-5]) mod 29
P[i] = (C[i] - P[i-5]) mod 29
```

The stream is continuous across word and physical page breaks within each tested chapter. The five unknown starting plaintext symbols are not guessed by hand: for each residue class j modulo5, every P[i] on that chain is a deterministic function of **only P[j]**. Evaluate all 29 candidate chains for each of the five classes. The independent GP29 within-word **bigram** language model couples only neighboring classes, forming a five-cycle. Condition on 29 possibilities for class0 and use an exact dynamic program for classes1–4, then close the cycle. This gives the **global optimum across all (29^5=20,511,149) starting states** without brute-force enumeration or model fitting to source ciphertext.

The scoring model is trained only on `resources/control/shakespeare_first300k.txt` converted into authentic GP29 rune orthography: **217,106 native GP runes**, +1 unigram smoothing, +0.25 bigram smoothing and fixed unigram log-likelihood weight 0.25. No cross-word GP bigrams are scored. The original 158 / 224 printed word lengths and all rune positions remain unmodified.

The independent positive plaintext corpus is `resources/control/gibran_prophet_58585.txt`, disjoint from Shakespeare training. A frozen sequence of eight seeds selects actual entire GP29 English words of **exactly** the original 158- or 224-word length pattern. Each synthetic ciphertext uses the same five-lag original operation, with unknown initial plaintext states. The decoder never receives a key oracle and must recover all five states from ciphertext.

## Exact outputs of the source-native reproducer

| Source and geometry | Native-controls recovered | Original optimum nats/rune | Range of eight native-control optima |
|---|---:|---:|---:|
| p0–2: 729 runes, 158 words | 8 × 729/729 | **−5.174765** | −2.645960 … −2.509760 |
| p23–26: 1,021 runes, 224 words | 8 × 1,021/1,021 | **−5.229442** | −2.682236 … −2.516396 |

The original inferred initial plaintext states are `[25,0,25,20,10]` for pp0–2 and `[4,5,20,7,23]` for pp23–26. The first 150 original-decoder runes begin respectively `AEFAELIDIARATADUWAJTHEARIANGWO...` and `RCLWDIESODFDUXTYCCUNTTHXIAOAIO...`, neither coherent plaintext. Both source-optimal outputs are **over 2.5 nats/rune** worse than every corresponding independent native-English positive. Their exact original ciphertext forward reconstructions pass under the selected 5-rune state, which shows only that the frozen operation is reversible, not that either decoding is authentic.

The [single-file read-only Windows Node22 CJS SFT](../sims/lp2_plaintext_autokey5_exact_state_original_sft.cjs) reads unmodified original `resources/liber-primus/lp2-corpus.json` and `lp2-transcription.txt`, asserts both original lengths, original printed-word counts and all eight control recoveries per chapter, and verifies exact forward recurrence and independent model-score recomputation. The exact committed code was executed in a standalone V8 evaluator against its fetched repository source files. No source files, control corpora or ciphertext are modified.

## Cryptanalytic decision

This standard five-step plaintext-autokey **cannot explain either visually different original chapter as ordinary GP English**, despite allowing its entire initial keyspace. The targeted five-dot chapter matters: the original visual motif did not reveal the specified equation, but it supplied a less arbitrary recipient than the opening alone. This removes a bounded, fully reversible candidate from future exploratory searches without importing a speculative second cipher layer. Any future five-step hypothesis needs a **new, independently authored state transition or key/clock instruction** and must explain the original adjacent-repeat suppression plus the position-dependent lag-five statistics under a true inverse.

All 56 unknown physical LP2 pages remain unsolved; this is a calibrated exclusion, not a plaintext claim.
