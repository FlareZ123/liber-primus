# Whole-word cumulative step-affine LP2 original-inverse gate

**Decision, 15 November 2026:** A direct source-native English cipher in which each printed word is converted into additive steps of the preceding ciphertext rune, with an independently secret nonzero GP29 affine slope and offset for each word, fails on all **559 original seven-rune-or-longer words**. All 2,896 synthetic source-native words survive a correct-key plant. This sharply limits this specific wordwise chain-cipher explanation for LP2's low adjacent-repeat rate. The result supplies no unknown-page plaintext or historical key.

**Prior-art correction:** This word-local affine step model is a strict subfamily of the already established arbitrary-per-word **29! permutation** ciphertext-feedback model in [the earlier word-rekey equality gate](lp2-wordrekey-cipherfeedback-equality-gate.md), which already excludes the broader model on finite native-language controls. Thus the exact long-word lexical nonmatches below serve as an additional implementation-level cross-check, **not an independent breakthrough or a reason to revisit this family**. The prior all-secret gate takes priority for research decisions.

## Why this route is worth testing

Original LP2 p0–55 contains 12,956 ciphertext runes, 2,896 complete printed words, and just 86 adjacent identical runes among 12,901 within-page neighboring pairs. A cumulative cipher C_i=C_(i-1)+step_i modulo 29 could make ciphertext nearly uniform despite an English plaintext if a hidden word-specific transform affects the *step* register. Unknown per-word shifts would flatten aggregate GP29 frequencies and could suppress a zero step. The 2016 authenticated phrase about the book's words gives a limited human-facing reason to inspect whole words; it does **not** select this cipher.

## Frozen generous cipher model

For a printed source word of L ciphertext runes C_0,...,C_(L-1), suppose the corresponding GP29 native-English word P has the same L symbols and

```
C_i-C_(i-1) = a_word P_i + b_word (mod 29),  i=1,...,L-1.
```

The first cipher symbol of every word is **unconstrained**. Every word may independently choose its own multiplier a_word in 1..28 and offset b_word in 0..28. This includes global a/word-private b, global affine maps, word-reset cumulative chains and continuous cumulative chains when their internal word steps obey the relation. It excludes non-affine substitutions, position-changing transforms, a state update within the word, altered plaintext word divisions, and unknown words outside the tested English dictionary.

Given a proposed English P, two distinct P suffix values determine a_word by modular inversion; the first step fixes b_word. Every remaining interior step must agree. If the suffix P values are all equal, their C steps must also be all equal. This checks **all 812 possible nonzero-affine keys per word without a search over guessed keys**.

The implementation uses the canonical `resources/liber-primus/lp2-corpus.json` (SHA blob `054f2a0f780b7d46901acbe3d9bf4f0ac1801165`), the 55 textual sections of `resources/liber-primus/lp2-transcription.txt` (blob `43bfeb6bf8dabaf25b0446cc519f8d91d205d8a7`), and the fixed `resources/control/english_wordfreq_textblob.txt` (blob `140e1d22b5f8c45deddd2e8b25549d9d6307d938`). Source GP orthography contracts ING to NG rune and IO to IA rune, with source-calibrated QU/K/Q/V/Z normalization. The scan's slash and physical page breaks do not split a word. 32 original words continue across two physical pages.

## Exact results

| Complete original word length | Original words | Distinct source-native dictionary spellings | Admits any word-local nonzero affine key |
|---:|---:|---:|---:|
| 5 | 317 | 3,613 | 289 |
| 6 | 256 | 4,657 | 46 |
| 7 | 216 | 4,776 | 0 |
| 8 | 156 | 4,325 | 0 |
| 9 | 78 | 3,397 | 0 |
| 10 | 52 | 2,388 | 0 |
| 11 | 32 | 1,450 | 0 |
| 12 | 18 | 767 | 0 |
| 13 | 4 | 379 | 0 |
| 14 | 3 | 153 | 0 |

Source length >=7 gives **0/559 compatible words**, even when each candidate word gets its own independent affine secret. Length >=6 has **46/815** compatible words. This is a finite lexicon gate: a genuine 13-rune proper noun or an unlisted archaic spelling could escape it. The much larger failure count from seven- and eight-rune original words already prevents a complete native-English inverse under this restricted model.

**Positive control:** Each of the exact 2,896 source printed word slots receives a native-GP dictionary word of the same rune length, preserving original cross-page word geometry. The synthetic encoder uses a_word=17 for every word, private b_word=(7×word_index+3) mod29, and a continuously carried ciphertext accumulator. Known-key inverse recovers **12,956/12,956** plaintext runes; each of the **2,896/2,896** planted words passes the blind per-word affine feasibility check. This verifies the gate can recognize the specified family on matched authentic word-length structure. It is a planted-method control, not a recovered original key.

## Interpretation and next decision

The observed near-uniform ciphertext and rare repeated runes could arise from a more complex word-dependent step cipher, but a simple hidden wordwise affine map of GP29-English letters to cumulative step residues does not explain the long original words. Do not spend further compute fitting slopes, word keys, or phases to this exact family. Progress requires a source-selected **non-affine or stateful step operation**, an authentic key schedule, or an original plaintext interval independently recovered from the book or period artifacts. Unknown plaintext in another alphabet or altered word segmentation remains untested.

**Executable SFT:** [`sims/lp2_wordstep_affine_allsecret_sft.cjs`](../sims/lp2_wordstep_affine_allsecret_sft.cjs), run on original repository fixtures using Node.js 22 on Windows. The [successful manual workflow 43705088412](https://github.com/FlareZ123/liber-primus/actions/runs/43705088412) includes and passes the new original-input SFT as its dedicated seventh step. No unknown LP2 plaintext, original cipher secret or puzzle destination was recovered.
