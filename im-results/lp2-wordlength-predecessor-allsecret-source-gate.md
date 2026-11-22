# Word-length-keyed predecessor substitutions have insufficient source-language concentration

**Agent30, 21 November 2026.** Source-original, exact all-secret architecture exclusion with a 1,500-book native-GP English comparison. **No unknown LP2 plaintext, Cicada-selected cipher, secret key or continuation destination was recovered.** A fully specified deterministic inverse exists for every candidate secret. Reproducer: [the read-only Node.js SFT](../sims/lp2_wordlength_predecessor_allsecret_sft.cjs).

## A precise operation and why it might have been tried

The authentic signed 2016 Cicada warning explicitly draws attention to words and their numbers. The original LP2 is printed in **2,896 complete rune words** and has a striking deficit of adjacent equal symbols. A solver could imagine that a visible word number, in this case its **GP rune length**, selects the output alphabet for a stateful reversible GP29 cipher. The immediately previous *ciphertext* rune supplies a readable one-symbol running state. This is a deliberately generous implementation of that idea; **no first-party source selects this particular operation or the alphabet permutations**.

At every rune position other than the first rune of a physical page, define the complete source-printed word length \`L[i]\` and the already visible preceding ciphertext rune \`C[i-1]\`. Grant a wholly arbitrary and secret **29-way permutation** independently for each observable pair \`(L[i], C[i-1])\`:

\[
C_i = \pi_{L_i,C_{i-1}}(P_i), \qquad
P_i = \pi_{L_i,C_{i-1}}^{-1}(C_i).
\]

The same table row is reused when the same state returns, even across printed word boundaries, illustrated chapters and physical page turns. The 55 first runes of physical rune-bearing pages are **completely free**. This grants a different unknown alphabet for each observed word length and preceding ciphertext state, unlike the previously retired book-global or chapter-static predecessor rows. Word position itself does *not* key a new table; that larger family is outside the conclusion.

## Exact all-key upper capacity and attainment

Parse the untouched [GP29 original corpus](../resources/liber-primus/lp2-corpus.json) with the [complete-word transcript](../resources/liber-primus/lp2-transcription.txt), joining genuine words over line and page wraps, including all **32 cross-page whole words**. For the **12,901** non-page-initial positions, form a histogram \`H[L,s,c]\` of current output glyph \`c\` for each original word length \`L\` and previous glyph \`s\`. There are **394 nonempty** \`(L,s)\` rows. Grant **394 independently unknown 29! substitution tables**.

Under any such bijective decoder, a fixed set of \`k\` putative plaintext symbols is the inverse image of **exactly k current ciphertext symbols per row**. Consequently its greatest possible total frequency over all hidden tables is

\[
M_k = 55+\sum_{(L,s)}\;\sum_{j=1}^{k}
   H_{(L,s),(j)} ,
\]

where \`H_(L,s),(j)\` is the row's \`j\`-th largest ciphertext-symbol count. The initial **55** is added **once** for any \`k>=1\`, since each unconstrained page-initial position contributes only one plaintext rune. This is an exact, attainable all-secret bound: order the 29 ciphertext counts descending in each row and map rank \`j\` to the same plaintext rune identity everywhere; choose that first identity at each page initial. The SFT constructs that maximizing inverse on the **original 12,956 symbols** and asserts equality for all six reported \`k\` values.

| Number \`k\` of most frequent possible plaintext symbols | Exact maximal count out of 12,956 |
| ---: | ---: |
| 1 | **1,477** |
| 2 | **2,606** |
| 3 | **3,589** |
| 5 | **5,281** |
| **9** | **7,908** |
| 14 | **10,314** |

The top-nine ceiling is **7,908/12,956 = 61.037%**, independent of every unknown secret table.

## Source-native language test, with intact original word-length inventory

Three independent source-language controls use [Shakespeare first 300k](../resources/control/shakespeare_first300k.txt), [Gibran's *The Prophet*](../resources/control/gibran_prophet_58585.txt) and [Emerson essays](../resources/control/emerson_essays_2944.txt). Each source's words are encoded through the project's **solved-LP1-calibrated native GP spelling**, including special ING→NG and IO→IA contractions. At each of the original 2,896 word slots, sample a whole native source word of the **exact original GP rune length**; concatenate the 12,956 symbols while retaining the 55 exact page boundaries and 32 carried-word positions. For every source, draw **500** independently sampled books using explicitly fixed xorshift32 seeds \`0x536a9dab + sourceIndex*12345\`, with source indices \`2,3,4\`. Each sampled book is individually resampled over source word slots; these are finite, correlated source-language controls, **not** a universal English-language theorem.

| Reference register | Matched-length books | Actual native-GP top-nine count range | Books within the original all-key 7,908 ceiling |
| --- | ---: | ---: | ---: |
| Shakespeare | 500 | **8,170–8,501** | **0** |
| Gibran | 500 | **8,256–8,564** | **0** |
| Emerson | 500 | **8,365–8,630** | **0** |
| **Total** | **1,500** | | **0** |

A separate first-party-calibrating reference of **2,979 already-solved native-GP Cicada runes** has 1,958 top-nine symbols; its observed concentration is approximately 65.73%, versus this unknown-cipher family’s exact ceiling 61.03%. Direct scaling of this solved-register frequency to 12,956 positions would require about 8,516 top-nine plaintext symbols, **608 more than the maximum**. This is a source-language comparison, not an assertion that the unknown book has the same empirical letter counts.

The SFT also enciphers a **complete native-GP 12,956-symbol positive plant** with a secret, exactly reversible alphabet \`C[i]=(7 P[i]+11 C[i-1]+3 L[i]+5) mod29\`, using ciphertext-state zero at page starts; \`7^{-1}=25 mod29\`. It checks every symbol after encryption, decryption, exact reencryption, and verifies that the source-native plant's plaintext concentration is **inside its own ciphertext's exact row bound**. Thus the statistic accepts genuinely recoverable positive samples of the proposed model. This plant does not imply that the unknown original uses this table or cipher.

## Research decision

A fixed book-wide substitution whose secret GP29 alphabet is indexed **only by visible full printed-word length and immediate preceding ciphertext glyph** cannot carry any of the 1,500 reference-matched normal native-GP English passages, even with all 394 alphabets selected adversarially. No expensive search through those secrets is warranted for this direct source-like plaintext family.

A cipher with a changing position or word key, a different secret state including more history, a non-GP intermediate register, changed printed-word boundaries, homophonic mappings, or variable-length codes remains open. The source would need to select such a state or provide a crib/receiver before this line of reasoning leads toward actual decryption. The original repeat scarcity and lag-five excess alone remain unexplained by this gate.
