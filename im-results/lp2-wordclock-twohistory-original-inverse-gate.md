# Word-clocked two-history GP29 inverse: exact original-source gate

**Agent4, 18 November 2026. Classification: intermediate original-cipher negative; no unknown plaintext or creator-selected key.**

## Decision

The original manuscript has 12,956 GP29 ciphertext runes in 2,896 printed words, including 32 cross-page continuations. Motivated by the signed 2016 words/numbers/direction clue and the observed word-internal fifth-back echoes, I tested compact, reversible two-ciphertext-history programs with clocks derived from the actual printed ciphertext. Both original-source tests are negative:

1. **Finite source-word-clock search:** 15,138 GP29 inverses (29×29 coefficients, two fifth-tap scopes, nine source-derived clocks), trained only on p0–2's 729 runes, then evaluated on withheld p40–53's 3,008 runes. The highest-ranked candidate scored 22 dictionary matches / 42 rune positions on training, versus original 11 / 18, but only 35 / 65 on holdout, versus original 39 / 72. Its longest withheld sequence was two dictionary words. The other eleven training-leading candidates likewise had no withheld streak longer than two recognized words. Selection among thousands of candidates explains sporadic matches; no coherent unknown plaintext was recovered.
2. **Every arbitrary secret additive shift per printed word:** 1,682 different global coefficient/tap models (29×29×2). For *each* model grant all 29^2896 possible assignments of an independently secret word offset without enumerating them, using a local difference-signature invariant. Across the **1,132 original words of five or more runes**, the best model recognizes at most **seven** native-English dictionary signatures. At most **one** of 69 original p0–2 longwords and **three** of 280 independent p40–53 longwords can match, regardless of the 2,896 secret shifts. This is the stronger key-independent source-language obstruction.

This is a conditional exclusion of an explicitly defined *cipher architecture* for ordinary intact source-GP-English words, not a universal argument against other languages, word segmentation, changing feedback, nonlinear state or extra encryption layers. The 2016 clue does not itself specify a key, state or operation.

## Exact reversible family

All arithmetic is modulo29. C is the observed GP29 ciphertext, P is the recovered candidate plaintext. The inverse/forward pair is:

\[
P_i=C_i-a C_{i-1}-b C_{i-5}-K_i \pmod {29},
\qquad
C_i=P_i+a C_{i-1}+b C_{i-5}+K_i \pmod {29}.
\]

Ciphertext predecessor state is continuous across authentic printed words and physical page breaks. A global fifth-tap reads C five runes earlier wherever available; an independently tested word-local fifth-tap uses zero before each word's fifth position. Every a,b in 0..28 is enumerated. In the first screen, K is one of nine public original-cipher word clocks: zero, previous word length, current length, their difference, previous word's ciphertext GP-prime sum, previous length times current local position, current length times local position, printed word ordinal, and parity-signed previous length. In the stronger second screen, K is any unknown constant independently selected for each printed word.

Under the stronger model, subtract the transformed word's first rune value from each later transformed rune. The constant secret K cancels exactly. A dictionary word of the same genuine printed length could be plaintext only if its corresponding GP29 difference signature matches. This tests **every possible word-key assignment** simultaneously. A full ordinary English decoding would need compatible signatures for practically all the original long words; the original achieves only seven even under the best global feedback coefficients.

## Locked source and reproduction

- Canonical original unknown ciphertext: resources/liber-primus/lp2-corpus.json, physical pp0–55 including runeless p50.
- Printed-word parser: resources/lp2-transcription.txt and sims/lp2_word_pages.cjs, preserving 2,896 words, every slash wrap and all 32 carried words.
- Independent source-native English dictionary: resources/control/english_wordfreq_textblob.txt, producing 29,060 distinct GP29 forms. Encoding uses native solved-LP1/clear-p57 conventions, including ING as GP21, IO as GP27, QU→CW, V→U, K/Q→C, Z→S.
- The first search is a 729-rune p0–2-only fit, with completely original untrained 3,008-rune p40–53 evaluation. The second exhausts all 1,682 coefficient/lag pairs on all 1,132 original long words and needs no fitted per-word shifts.
- Synthetic positive 1: 95 authentic clear p57 GP runes encrypted with the same current-length/two-history program and exactly recovered **95/95**; wrong-key inverse fails. Native dictionary recognizes 16 of its 20 genuine words.
- Synthetic positive 2: construct an independently GP-native dictionary plaintext of all 12,956 original-length rune positions and 2,896 actual word lengths. Use a=5, b=13, word-local fifth predecessor, and independent per-word secret shifts 7·wordOrdinal+13 mod29. The all-secret invariant recognizes **1,132/1,132** original-shaped longword plaintexts, and exact inverse/forward recover the **12,956/12,956** planted runes; wrong feedback coefficients do not. This establishes experiment sensitivity only.

**Runnable, committed source:** [original source-word-clock screen](../sims/lp2_wordlength_twohistory_original_sft.cjs) and [all-secret per-word-shift gate](../sims/lp2_twohistory_allsecret_wordshift_sft.cjs). Both pass actual Windows Node22 CI: [first source run 44220167266](https://github.com/FlareZ123/liber-primus/actions/runs/44220167266), [all-secret run 44220971478](https://github.com/FlareZ123/liber-primus/actions/runs/44220971478). The workflow is dispatch-only, not per-commit.

**Research fork:** Retire this exact longword-incompatible stationary two-history/word-offset family under intact ordinary English. A distinct, independently motivated source key or a word-varying nonlinear update rule could justify new original-input cryptanalysis, but tuning dictionary fragments or new per-word arbitrary multipliers cannot authenticate the historical cipher.
