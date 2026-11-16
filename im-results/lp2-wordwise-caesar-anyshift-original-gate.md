# Fresh per-word GP29 Caesar keys: complete original-word exclusion

**Agent 3, 16 November 2026. Evidence classification:** a key-independent necessary-condition exclusion of an explicit source-motivated cipher family under a declared English/GP orthographic register. **No unknown LP2 plaintext or key recovered.**

## Original clue and competing explanations

The 6 January 2016 signed Cicada hint connects *words*, *meaning* and *numbers*. One human-readable interpretation is a word-by-word numerical shift: every authentic printed word obtains its own Caesar offset from its preceding plaintext, prime-weight sum, another page, or a lost lookup. Earlier work tested the stricter rule that the current word's own plaintext GP-prime sum determines the shift, and separate page/word-codebook invariants reject stationary keys. This note tests **all possible per-word shifts independently**, removing any dependence on how the secret shift is selected.

The strongest alternative is a rune-varying, word-varying stream, a transposition/resegmentation cipher, or plaintext written in another register. This bound does not touch those models.

## Exact all-key invariant

Let a printed word have GP rune indices (C_0,\ldots,C_{n-1}\) in (\mathbf{Z}_{29}\). For an entirely arbitrary one-word Caesar key (k_w\),

\[
C_j = P_j+k_w\pmod{29}\quad\Longrightarrow\quad
(C_j-C_0)\bmod29=(P_j-P_0)\bmod29.
\]

Thus **one normalized difference shape represents all 29 candidate keys simultaneously**. Any secret, independently selected, causal, random or word-specific offset fails when its original ciphertext normalized difference shape is absent from every allowable native-GP word of the exact printed rune length. The test grants all 29 offsets separately at each of the authentic **2,896** words.

Inputs: unchanged `resources/liber-primus/lp2-corpus.json`, source-faithful `lp2-transcription.txt`, and the existing `resources/control/english_wordfreq_textblob.txt` (29,088 normalized GP word forms with lengths up to fourteen), with the repo's historically informed `ING/NG/IO`, `V→U`, `QU→CW` source orthography. The 2,896 parsed printed words concatenate to **exactly 12,956 unmodified original LP2 runes**. This is the same dictionary/register used by the prior original fixed-self-loop gate, avoiding a custom after-the-fact language model.

## Original results and independent complete-length plant

| Original printed GP word length | Original word count | No native-English candidate under **any** of 29 shifts |
| ---: | ---: | ---: |
| 1 | 83 | 0 |
| 2 | 448 | 0 |
| 3 | 720 | 274 |
| 4 | 513 | 474 |
| 5 | 317 | 316 |
| 6 | 256 | 256 |
| 7 | 216 | 216 |
| 8 | 156 | 156 |
| 9 | 78 | 78 |
| 10 | 52 | 52 |
| 11 | 32 | 32 |
| 12 | 18 | 18 |
| 13 | 4 | 4 |
| 14 | 3 | 3 |
| **Total** | **2,896** | **1,879** |

Every one of the **815** original printed words with six or more runes fails, despite the reference dictionary having thousands of legitimate words of each of these lengths. For example, the source's opening red eight-rune `SHEOGMIAF` and first black four-rune `THJGAE` have no normalized native word candidate under any key; this is a complete-word statement and claims no decoded text.

**Positive control:** construct another 2,896-word GP-English book using independently listed native lexemes in the **exact original word-length sequence**. Apply independently changing deterministic keys (k_w=(11w+3)\bmod29\) to every word. All **12,956** encrypted GP rune positions invert exactly, and **all** shifted ciphertext words retain the native dictionary's normalized signatures, including all original lengths 1–14. The original failure is therefore a true all-key language mismatch for this family rather than a parser error or inability to handle changing keys.

## Scope and decision

This rejects, under the exact authentic printed-word boundaries and declared native-English register, **every independent one-shift-per-word GP29 Caesar schedule**, including any previous-word-based number-to-shift method with a constant offset across the next word. It is a stronger all-key obstruction to the direct 2016-word-number interpretation than the earlier *current-word-prime-sum* fixed-point exclusion, and is distinct from static codebook or ciphertext-feedback tests.

It does **not** prove the manuscript contains ordinary modern English, that its printed separators are plaintext spaces, or that a word may not contain a changing running key. The true 2016 hint may direct a different operation. No readable unknown plaintext, author-selected key schedule or complete inverse emerges. **Do not optimize alternative per-word Caesar key derivations from the same unchanged word segmentation; require a source-selected within-word-changing or boundary-changing mechanism.**

**Reproduction:** [original-input single-file Node22 CJS](../sims/lp2_wordwise_anykey_caesar_original_sft.cjs). The parser, lexicon, complete-length plant, exact counts and representative failed original words are asserted and printed by the script.
