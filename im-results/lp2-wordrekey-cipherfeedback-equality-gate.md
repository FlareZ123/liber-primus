# Word-rekeyed ciphertext-feedback alphabet: exact original equality constraint

**15 November 2026, Agent38. Conditional, key-independent exclusion of the entire tested family under source-native English/Latin GP29 spelling. No unknown LP2 plaintext, creator key, cipher mechanism or final destination recovered.**

## Why this family matters

The original LP2 ciphertext has unusually few immediately repeated runes. A natural explanation is ciphertext feedback, where each new published rune depends on the previous published rune. A secret substitution that changes at *every printed word* could defeat earlier all-secret tests using shared, page-rekeyed or five-phase alphabets. This is a genuine remaining key-schedule distinction from the prior [page-shared five-phase feedback family](lp2-wordfive-cipherfeedback-secret-alphabet-gate.md) and [global predecessor+word-position family](lp2-wordposition-prevstate-allsecret-capacity.md).

No authenticated Cicada source prescribes this operation. The test deliberately allows one **completely arbitrary independent secret 29-symbol permutation for each of all 2,896 printed words**, with no assumption that it is affine, has a small key or repeats. The first published rune of each word has an unconstrained separate key.

## Exact key-independent invariant

Let P(w,j) and C(w,j) be the GP29 indices at local word position j. Consider every cipher in the family

    C(w,j) = C(w,j-1) + permutation_w(P(w,j)) mod 29, j >= 1,

where each permutation_w can be any element of S29; the first C(w,0) is arbitrary. The visible word boundaries are preserved.

Its published difference D(w,j) = C(w,j) − C(w,j−1) mod29 equals permutation_w(P(w,j)). Consequently, for any two positions j,k >=1 of the **same word**, D(w,j)=D(w,k) **if and only if** P(w,j)=P(w,k), regardless of all 2,896 unknown permutation keys. Sum those equal unordered position pairs over the original words. This is an exact invariant of the whole family, rather than a fitted key, decryption-language score or assumed key period. Allowing independent word-specific affine maps is a strict subset.

The canonical physical LP2 pp0–55 contain **2,896 continuous printed words**, including 32 cross-page carried words, and **12,956 rune symbols**. Of the 20,221 eligible pairs at positions j,k>=1 inside one complete word, exactly **744** have equal *original ciphertext differences*: rate **0.03679343257**. Every rune is unmodified; the printed word start is excluded from the test, so no assumption about its own encryption enters.

## Frozen native-register controls

Use the independently maintained source-calibrated GP29 encoder, including solved LP1's ING/IO spelling, and preserve each original printed word's complete GP rune length. For each source, draw 5,000 independent 2,896-word books by choosing source words *with replacement* from the appropriate length pool. Count ordinary plaintext-rune equality only at j,k>=1, where the theorem requires equality to the original 744 cipher-difference pairs. The Latin Vulgate reference is already word-preserved and GP29 encoded, using its documented 0–28 alphabet. Seed xorshift32=0x33013829 for each corpus; all 20,000 books were independently scored. Mean and standard deviation below are exact expectations for the length-conditioned reference pool; minimum is from 5,000 draws.

| Source-native register | Source words | Expected pairs | Exact reference SD | Fewest of 5,000 | Books <= 744 |
| --- | ---: | ---: | ---: | ---: | ---: |
| Shakespeare | 55,407 | **1,045.89** | 30.57 | **942** | **0** |
| Gibran, *The Prophet* | 15,733 | **1,012.80** | 31.21 | **909** | **0** |
| Emerson essays | 77,932 | **1,007.89** | 30.58 | **892** | **0** |
| Latin Vulgate New Testament | 39,835 | **1,072.63** | 29.59 | **967** | **0** |

The original source lies **8.61–11.10 reference SD below** all four model-matched means. Each independently specified reference gives a conservative plus-one lower-tail frequency **1/5,001**. These are **conditional language and sampling-model results**, not a universal proof that any intended plaintext must be ordinary English/Latin, nor discovery-adjusted probabilities over all cipher hypotheses ever tried.

**Exact positive plant:** assemble a 12,956-rune complete length-matched Shakespeare GP book. Independently Fisher–Yates-shuffle 29-symbol secret alphabets **per word**, choose independent first-rune masks, encipher all later positions using precisely the preceding published ciphertext, then invert with the planted keys. The resulting ciphertext decrypts **12,956/12,956** runes exactly, and its within-word difference-pair count is *identical* to that of the original planted GP plaintext. Hence the invariant has power against genuine ciphers of the tested type, even when all 2,896 secret keys differ.

## Research decision

**Retire the complete stationary-within-word, arbitrary-per-word bijective ciphertext-feedback family** as a direct explanation of original LP2 under the four tested source-native registers. This is stronger than a failed brute key search: all 29!^2896 possible secret word permutations are covered by one equality invariant. Do not spend compute fitting more independent per-word Caesar, affine, keyed-shuffle or fixed dictionary-substitution maps to this same feedback model.

The result leaves ciphertext feedback whose alphabet changes *within* each word, non-bijective maps with additional state, changed plaintext word boundaries, substantially different spelling/languages and source-chosen nontext transports open. A future attack on those families needs independently motivated state updates or a real source-selected key, ideally yielding an actual original-page plaintext inverse. The corpus-wide five-back echo and genuine p56 prime-totient F-transparency should be treated as separate constraints.

[Reproducible original-input CommonJS SFT](../sims/lp2_wordrekey_cipherfeedback_equality_sft.cjs) · [canonical GP29 corpus](../resources/liber-primus/lp2-corpus.json) · [source-native encoder](../sims/lp2_native_gp_source_orthography_sft.cjs).
