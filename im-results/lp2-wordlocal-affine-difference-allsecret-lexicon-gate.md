# All-secret word-local affine predecessor-difference lexical test

**Decision (Agent24, 18 November 2026): No authentic unknown-page plaintext recovered.** This is an exact obstruction for an unusually generous, completely specified decoder against a pinned English lexical register; it does **not** exclude every GP29 cipher, alternate-language output, altered word spacing or a missing source-key operation.

## Source-selected route and its strongest assumption

A first-hand February 2015 Liber Primus intermediate applies successive GP29 rune differences to the 729-rune opening, and the 2016 signed hint names *words* and *numbers* as directions. Those observations motivate checking whether each originally printed word provides a separately changing Caesar/affine key for the predecessor-difference stream. This is a hypothesis about the author's intended use, not a known instruction.

Give the hypothesis every possible secret key independently **for each complete printed word**, including the 32 words carried across physical-page turns. For an original word of length L, with ciphertext GP29 indices C and proposed ordinary-English plaintext P, require only at interior offsets j=1..L-1:

\[
(C_j-C_{j-1})\bmod 29=(a_w P_j+b_w)\bmod 29,\quad a_w\in\{1,\ldots,28\},\ b_w\in\{0,\ldots,28\}.
\]

Each word may have its *own* 812 possible affine alphabets. Its first plaintext rune is completely free, and the rule imposes no cross-word or page key schedule. If this overpermissive model cannot recover ordinary lexical words, any fixed or derived subset of its keys necessarily fails against the same finite lexicon. The all-secret nature also avoids chasing p15/p50 numerical key candidates that cannot fix an intrinsically incompatible word.

**Exact test.** Let D be the  L−1 within-word ciphertext predecessor differences and let Q be an English GP29 word's L−1 suffix. Over the prime field F29, nonconstant D and Q are affinely equivalent if and only if their vectors are identical after translating the first coordinate to zero and scaling the first nonzero difference to one. Constant vectors have one separate class. The SFT indexes all candidate English suffixes by this complete affine invariant and checks each untouched original word. No slope, intercept, orientation or position was chosen from the outputs.

## Result on intact original manuscript

Inputs are the 55 rune-bearing original LP2 pages p0–p55 from the checked-in canonical transcription and index corpus: **12,956 ciphertext runes, 2,896 complete printed words**. The fixed comparator is the TextBlob English frequency wordlist, deterministically transliterated into one conventional GP29 spelling with K→C, V→U, Q→C, Z→S and ING/TH/EO/NG/OE/AE/IA/EA multigraphs, supplemented by exact GP29 word tokens from nine externally transcribed solved Cicada source sections. Total tested lexicon entries of length at least six: **22,621**; duplicates retained harmlessly. This lexical coverage is a finite reference, not an exhaustive universe of possible author spellings.

| Original word length | Number of source words | Any possible affine-key lexical match |
| ---: | ---: | ---: |
| 6 | 256 | 45 |
| 7 | 216 | 0 |
| 8 | 156 | 0 |
| 9 | 78 | 0 |
| 10 | 52 | 0 |
| 11 | 32 | 0 |
| 12 | 18 | 0 |
| 13 | 4 | 0 |
| 14 | 3 | 0 |
| **7–14** | **559** | **0** |

The 45 compatible six-rune words are ambiguous chance lexical fits under independently free secrets; no key continuation or original prose was inferred from them.

## End-to-end positive control

Every one of **178 length≥6 words** from the published native GP29 solved-text source is independently encrypted using a nonzero per-word slope, per-word sum-derived intercept and arbitrary initial ciphertext rune. The exact affine-invariant decoder includes the **true original GP29 word suffix among its lexical candidates in all 178/178 plants**. Forward encryption and arithmetic inversion are asserted at every noninitial symbol. Consequently the source impossibility is not due to a decoder that cannot accept honest English under its own model.

## Research decision

This rules out an independently secret affine mapping from each original within-word predecessor difference to an ordinary single-word GP29 lexical plaintext, within the stated lexicon, even with independently arbitrary keys and unconstrained first letters. It does not rule out non-affine codebooks, time-varying state within a word, an alternate word segmentation, or a register absent from the checked lexicon. The original no-doublet fingerprint itself is not proof of this decoder.

The test advances a **specific cipher-architecture decision**, not a decryption. Do not search p15 prime/Fibonacci or p50 table key schedules inside this failed word-local affine-difference model without independent evidence changing its plaintext alphabet or the within-word operation. Prefer an independently readable source operand/operation capable of predicting sustained original plaintext.

**Reproduction:** Run the self-contained Windows Node.js 22 test in [\`sims/lp2_wordlocal_affine_difference_lexicon_sft.cjs\`](../sims/lp2_wordlocal_affine_difference_lexicon_sft.cjs). It reads only four pinned repository inputs, asserts full original counts and every result above, and uses no random tuning. [Passed Windows Node22 CI run 44336791330](https://github.com/FlareZ123/liber-primus/actions/runs/44336791330).