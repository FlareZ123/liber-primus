# Bilinear five-back original-cipher inversion, training/holdout decision

**15 November 2026, Agent23, Director #1101.** Exhausting all 24,389 keys of one explicit lossless GP29 bilinear ciphertext-feedback cipher on unchanged Liber Primus LP2 p0–55 does **not** recover continuous original plaintext. The best key selected using only early-book deep-word positions yields normalized GP index of coincidence **1.025676** in training and **1.010177** on the untouched late-book holdout. A genuinely encrypted same-shape source-native English plant, whose secret key was not given to the search, is recovered as the unique first-ranked key and has **2.515418 / 2.701387** training/holdout collision indices.

## Intended cipher and why it was worth one bounded attack

The 29-sign Gematria Primus field and five-dot ornaments supply weak, source-visible motivation for a word-local fifth-predecessor. A bilinear term is the smallest non-affine coupling of the preceding ciphertext rune to the rune five letters back, rather than another two-tap linear sweep. The model assumes all original printed word boundaries survive encryption. It does **not** possess an authenticated first-party operation clue and cannot independently explain why immediate ciphertext duplicates are so scarce. This is an exploratory candidate attack, rather than a claimed historical decoder.

For each rune position `i` with position `j` within its complete printed word (including words continuing across physical page turns), let `Cprev=C[i−1]`, with zero at manuscript start, and `Cfive=C[i−5]` when `j≥5`, else zero. For constant secret coefficients `a,b,g∈GF(29)`:

```text
P[i] = C[i] − a*Cprev − b*Cfive − g*Cprev*Cfive (mod 29).
C[i] = P[i] + a*Cprev + b*Cfive + g*Cprev*Cfive (mod 29).
```

The forward direction uses previously emitted ciphertext only; it is fully invertible for every possible secret, including zero coefficients. This includes simple linear two-tap ciphers as `g=0`, while `g≠0` introduces one ciphertext-state interaction. No F bypass is postulated. The model's missing authored key is a major limitation.

## Frozen original-source experiment

- Input: `resources/liber-primus/lp2-corpus.json` and complete-word reconstruction from `resources/liber-primus/lp2-transcription.txt`, 2,896 words / 12,956 original indices, including 32 cross-page words and empty physical p50. The parsed and canonical rune streams must agree exactly.
- Training: **p0–39**, 9,640 runes. Evaluate the 1,563 sites whose source printed-word offset is at least five.
- Holdout: **p40–55**, 3,316 runes, with p50 empty. Reserve all 542 fifth-and-later-word positions without selection, training or tuning.
- Score: normalized GP29 `29*sum_v n_v(n_v−1)/(N(N−1))`. A uniform 29-symbol tape scores about one; source-native English normally scores substantially higher. Enumerate all `29³ = 24,389` coefficient triples, rank by training only, and inspect the first 15 on the untouched holdout. This is an explicit observed-language gate, not a proof about every possible intermediate encoding.

The unmodified original source's top five parameter triples, **before any holdout use**:

| Train rank | `(a,b,g)` | Deep training index | Deep untouched holdout index |
| ---: | :---: | ---: | ---: |
| 1 | (5,6,19) | 1.025676 | 1.010177 |
| 2 | (20,7,8) | 1.025486 | 1.014330 |
| 3 | (14,0,0) | 1.024298 | 0.984264 |
| 4 | (8,22,7) | 1.022944 | 0.993957 |
| 5 | (28,13,9) | 1.022825 | 1.012155 |

The untransformed original gives **0.999662/0.996330** on the corresponding 1,563/542 sites. The best fitted complete-book receiver remains essentially uniform in the much larger early-symbol region too; no meaningful original GP word, 150-rune passage, key source or continuation is obtained.

## Genuine source-native positive

Construct 2,896 plaintext GP words using the independent `resources/control/gibran_prophet_58585.txt`, source-calibrated GP letter digraphs (`ING` and `IO` included), and exactly the manuscript's printed word lengths. Use the deterministic source-word position selector `(17*wordIndex+3) mod matchingLengthPoolSize`. With secret `(a,b,g)=(7,11,19)`, encrypt **all 12,956 GP runes** by the stated recurrence, then supply the ciphertext, word breaks and unchanged training/holdout partition to precisely the same search algorithm.

The secret key is **rank 1 of 24,389** by training score. Its decoder recovers **12,956/12,956** plaintext runes exactly, and forward re-encrypts the ciphertext exactly. The genuine GP plaintext fifth-word-site normalized indices are **2.515418** in training and **2.701387** in holdout. The next-highest wrong key scores **1.038481** in training. This confirms that this finite architecture, when used with the chosen source-native register and original geometry, would be strongly detectable and recoverable by this test.

The synthetic plain-language plant is merely a detection-power control. It is not evidence that Cicada used the recurrence. Exact original re-encryption also holds for wrong keys, which is necessary decoder consistency rather than authentic key proof.

## Decision and next useful fork

The fitted early-book coefficients do not generalize to any strong English-like signal on p40–55. **Retire this single global, word-local fifth-tap bilinear family under source-native English**, including its whole coefficient space, without building additional parameter exceptions or tuning on holdout. It excludes neither a changed clock, an independently keyed pad, a nonlinear symbol permutation, a latent intermediate language, nor a real author-supplied state-update law. The earliest unmet input remains a **source-selected reversible operation or key**. A viable successor must additionally predict the original anti-doublet count, lag-five word-locality and paragraph-level readable plaintext.

**Executable source:** [single-file original-cipher and native-plant SFT](../sims/lp2_bilinear_word5_holdout_sft.cjs), runnable with Node.js 22 and built-in modules, using the repository's frozen authentic resources. This is supporting evidence and must not be promoted as unknown-page decipherment.
