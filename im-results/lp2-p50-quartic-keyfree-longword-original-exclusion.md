# Quartic p23/p39 factor supplies a key-free LFSR plaintext-word inverse

**Agent9, 22 November 2026. Original-cipher cryptanalytic decision and source-derived polynomial attack; no unknown LP2 plaintext established.** Original-source [Node22 CommonJS SFT](../sims/lp2_p50_hg_lfsr_keyfree_word_signature_sft.cjs) and genuinely encrypted word-shaped positive controls [passed Windows Actions 44975039375](https://github.com/FlareZ123/liber-primus/actions/runs/44975039375).

## Source-selected recurrence rather than searched seeds

The exact p50 256-cell numeric table, interpreted under the already documented conventional-base60 participant reading, has a known GF29 polynomial factor found independently from original Cicada objects:

- signed 2013 `BASE29(3301)=3QO` supplies `H=[3,26,24]` (ascending coefficients);
- p23's centered red triple supplies `R=[23,6,10]=27H mod29`;
- p39's centered red triple supplies `G=[27,5,15]`;
- `A=R×G=[12,16,7,24,5]`; `H×G=[23,21,11,17,12]` is a nonzero scalar multiple and thus has the **identical GF29 zero-recursion solution space**.

Original p50 polynomial division by either form has remainder `[0,0,0,0]` and 252-symbol quotient, so this filter is taken from authentic original numeric and red-word artifacts without fitting unknown ciphertext or secret keys. Its **factorization by itself does not prove that the authors meant it as an LFSR feedback law**.

The test charges the strongest simple additive explanation: any secret fourth-order running key `K` on GF29 satisfying

```
12 K[i] + 16 K[i+1] + 7 K[i+2] + 24 K[i+3] + 5 K[i+4] = 0 mod29,
C[i] = P[i] + K[i] mod29.
```

A key stream may have an **independent arbitrary four-symbol secret seed on *each* complete printed original word**. That is more permissive than one key for the entire book, any visual chapter or any page, while preserving authentic word boundaries. Both source coefficient orientations are tested: `A` and reverse `[5,24,7,16,12]`. No search of `29^4` possible seeds is necessary.

## Algebraic key elimination

Define for any word `W` of length `n≥5` its filter signature, with `n−4` GP indices,

```
S_A(W)[i] = sum_(j=0..4) A[j] W[i+j] mod29.
```

If the stated model produced `C` from genuine GP plaintext `P`, then **`S_A(C)=S_A(P)` exactly**, for any secret seed. Conversely, the equality is sufficient for the existence of *some* four-seed additive key stream satisfying the recurrence across that word: set its first four values to `C−P`, then the filter forces all remaining key values. This is an exact, lossless, key-independent inverse obstruction, unlike a probabilistic language score.

The genuine source-native GP orthography is frozen by solved LP1 / LP2 p57 controls, including composite ING and IA/IO. Build the dictionary from the repository's **29,157-entry TextBlob wordlist** and its pinned Shakespeare, Gibran, Emerson, Blake and solved LP1 source registers, deduplicated by GP-rune sequence. No unknown ciphertext values contribute candidate words or filters. The SFT compares every authentic printed word to every same-length source word by `(n,S_A)`.

The original LP2 input comprises **12,956 GP runes, 2,896 complete printed words**, of which **343** have length≥8 and **187** have length≥9. Among the length≥8 group, **247** contain no plaintext-F marker candidate in the original ciphertext, so F-transparent special-cases do not eliminate most of the testable register.

## Original plaintext-word candidates and their failures

The key-free exhaustive dictionary lookup has exactly **one** match among all 343 length≥8 words under each of the two natural source orientations:

| Original factor direction | Zero-based printed word | Absolute rune start | Only 8-GP-runic matched candidate |
| --- | ---: | ---: | --- |
| `A=[12,16,7,24,5]` | **2048** | **9118** | `JOURNEYING` |
| `reverse(A)=[5,24,7,16,12]` | **865** | **3890** | `AFFERENT` |

Both are exact valid local algebraic candidates under **some** four-element key; the mechanism alone cannot tell whether either isolated word is genuine. Neither orientation yields **any** native-GP source lexicon match among the original **187 words of length≥9**. These are finite-dictionary exclusions, not proofs against an unknown literary source.

The two length-eight matches also fail the natural **chapter-continuous** version of the same recurrence. The exact candidate determines the initial four key values uniquely:

- With p50/p23 forward `A`, `JOURNEYING` implies key start **[24,19,0,1]**. Extending the uniquely determined recurrence to its neighboring original printed words yields `GFF` on word2047, `CEANIA` on word2049 and `UPN` on word2050, none attested by the frozen GP dictionary.
- With reverse `A`, `AFFERENT` implies key start **[16,6,14,14]**. Extending to word866 yields `THWPAENGEAPIA` rather than an attested GP word. Its proposed plaintext also contains two F=0 runes whereas the actual eight-rune original ciphertext contains none, independently ruling it out under an authentic p56-like plaintext-F transparency rule.

These are **word-local plausible cribs with a falsified chapter continuation**, not authenticated unknown-page plaintext; their match frequency is compatible with chance screening of a large dictionary. A model rekeying with a fresh four-symbol IV on **every word** can still produce either local crib, but it must explain the other 341 length-eight-or-longer words absent from the finite lexicon.

## Full-length positive control

For each of the two source filters, construct an actual **12,956-rune source-native English word register**, selecting real source-attested words to match **all 2,896 exact original word lengths** (including the three length14 words). Generate completely independent arbitrary four-rune secret seeds word-by-word and derive every rest-of-word key symbol using the frozen quartic recurrence. Encrypt each real GP plaintext word with the resulting stream. The same code decrypts the result exactly: **12,956/12,956 original-shaped GP runes**, and **343/343 length≥8 planted plaintext words** pass the key-free filter invariant. The original negative is therefore about the actual ciphertext signatures rather than impossible or incorrectly implemented ciphers.

## Cryptanalytic decision

The authentic p23/p39 polynomial factor is a mathematically valid, **key-independent plaintext-word test** for any fourth-order GF29 source-factor additive LFSR. Its application to every printed original word has only two isolated eight-rune candidates, neither with viable immediate chapter-continuous context; all 187 longer words have zero hits. Therefore retire source-factor `A` / `reverse(A)` as a **direct chapter-continuous ordinary native-English additive cipher** under the true printed word segmentation. More permissive independent word-rekeyed versions are disfavored by their failure to match native-source vocabulary across long words but remain logically possible for plaintext outside the finite lexicon.

Do not claim `JOURNEYING` or `AFFERENT` as recovered plaintext. The next worthwhile source-driven LFSR experiment needs an original clue choosing a different keystream recurrence, nonlinear output operation, authenticated language switch or nonliteral segmentation. Arbitrarily choosing a new word key, new orientation or new plaintext after observing each incompatible word would defeat the intended human solution.

**Evidence:** [original-cipher, entire-dictionary, planted-key SFT](../sims/lp2_p50_hg_lfsr_keyfree_word_signature_sft.cjs), [passing Windows 11/Node22 CI](https://github.com/FlareZ123/liber-primus/actions/runs/44975039375), [authenticated p50 quartic bridge source](lp2-p23-red-midpoint-p50-factor-bridge.md).
