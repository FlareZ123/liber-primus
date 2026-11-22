# Original LP2 per-word quadratic ciphertext-feedback gate

**Decision (21 November 2026):** An independently keyed quadratic ciphertext-feedback rule for *each printed word*, with arbitrary first ciphertext symbol, cannot explain the intact long English words of the unsolved LP2 corpus. This is an exact finite-field key-existence exclusion for the named architecture, subject to native GP29 spelling and the 29,157-word source dictionary. It recovers no new plaintext or original key. Do not pursue higher-degree fits merely to rescue the hypothesis without a fresh source instruction.

## Source premise and test

The original p39 red triad supplies a visible quadratic field element over GP29; the preserved printed word boundaries offer natural independent units. The deliberately generous test family is, for every printed word C and candidate plaintext word P,

\[
 C_j=dP_j+a C_{j-1}^2+b C_{j-1}+z\pmod{29},\qquad j\ge1.
\]

Here d is any nonzero GF29 value, while a, b and z vary arbitrarily for every printed word. The initial C_0 is unrestricted. This admits 28 × 29³ distinct secret coefficient tuples per word before accounting for the arbitrary header. It includes every quadratic in the preceding ciphertext rune, including the p39 repeated-root polynomial with otherwise free coefficients. The quadratic mechanism itself is a **test hypothesis**, not an established Cicada operation.

Inputs: unchanged 55 rune-bearing unknown LP2 physical pages p0–55, 12,956 GP29 ciphertext runes and 2,896 printed words, with line and page continuations joined. Native English forms were drawn from the committed resources/control/english_wordfreq_textblob.txt (29,157 words) and encoded under the published GP29 digraph/ING/IO convention. Each candidate of equal runic word length was checked by exact GF29 Gaussian elimination for existence of any nonzero-d key. The candidate plaintext first rune was left untested because C_0 is unconstrained. Thus an incompatible word cannot be saved by changing a secret coefficient, per-word initialization, ciphertext offset, or phase.

## Original-input result

| GP rune length | Original ciphertext words | Native dictionary candidates per word | Original words compatible with any secret key |
|---:|---:|---:|---:|
| 8 | 156 | 4,331 | 27 |
| 9 | 78 | 3,409 | 1 |
| 10 | 52 | 2,392 | **0** |
| 11 | 32 | 1,453 | **0** |
| 12 | 18 | 772 | **0** |
| 13 | 4 | 382 | **0** |
| 14 | 3 | 155 | **0** |

**1,128,307 original ciphertext/dictionary pairs** were examined; none of the 109 original words of length 10 or greater have a source-native English candidate under any permitted wordwise key. Across the 187 words of length at least nine, a single length-nine match occurs, original word index 2314 to *salivation* with coefficients [d,a,b,z]=[22,10,8,6]. This isolated algebraic fit conveys no supported plaintext; the first symbol was unconstrained and the remaining 77 length-nine words also fail.

The positive plant encrypted **100 independently selected native-GP dictionary words** of the same original word lengths using varying invertible d and independent quadratic, linear and constant terms. Every plant recovered a compatible all-secret key, recovered the original native rune sequence and re-encrypted exactly: **100/100**.

## Decision and limitations

This eliminates a nonlinear extension of earlier affine ciphertext-feedback and fixed-p39-coefficient studies, even allowing each word a fully secret four-parameter map and an arbitrary initial ciphertext symbol. The original p39 quadratic itself remains a structural observation; no text-directed selector compels this particular transition rule. A generator could be higher degree, depend on additional state, change ciphertext word length, use a source language or spelling absent from the lexicon, or incorporate external key material. These survive the test without positive evidence.

For an actual solution, seek an original-source state transition or direct plaintext clue rather than spending further compute increasing independent free parameters per word. Avoid promoting isolated short compatible words as a recovered text.

**Reproducer:** [sims/lp2_wordlocal_quadratic_cfeedback_allsecret_sft.cjs](../sims/lp2_wordlocal_quadratic_cfeedback_allsecret_sft.cjs). **Windows Node.js 22 PASS:** [manual Actions run 44959313956](https://github.com/FlareZ123/liber-primus/actions/runs/44959313956).
