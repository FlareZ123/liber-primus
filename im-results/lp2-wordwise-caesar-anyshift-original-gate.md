# Fresh per-word numerical GP29 keys: two exhaustive original-source gates

**Agent 3, 16 November 2026. Evidence classification:** two complete, source-motivated word-key family exclusions under the explicitly declared English/GP orthographic register. **No unknown LP2 plaintext or key recovered.**

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

## Distinct original p56 prime-totient transfer: arbitrary prime start per word

A more flexible numeric-word interpretation uses the *historically authenticated solved-p56 operation*, (C_j=P_j\pm\varphi(q_k)\bmod29\), where (q_k\) is the (k)-th prime and **plaintext F is transmitted literally and consumes no key**. Interpret the 2016 word/number hint as selecting a new prime-list starting ordinal for each word. Rather than presuming that number is derived from its previous word's sum, grant **every one of the first 29 starting prime ordinals separately for every original printed word**, both encryption signs, and **every legal ciphertext-F skip interpretation**. No original plaintext is used to set starts. This exhaustive superset includes any previous-word GP-prime-sum mod29 to first-29-prime-index schedule with a fresh clock each word, and other arbitrary key choices in this finite range.

For each original ciphertext word, a full branch-preserving inverse checks all 29 starts. A ciphertext F may be a genuine unshifted F or an encrypted non-F rune; a non-F ciphertext always consumes a prime-totient and may never decrypt to plaintext F. Inverted complete words are compared to the same independently fixed 29,088-word source-English register. **The entire original corpus** and all original segmentation are retained; no cherry-picked fragment is used.

| GP printed word length | Source word count | Words admitting some prime start, positive sign | Negative sign | Either sign |
| ---: | ---: | ---: | ---: | ---: |
| 1 | 83 | 83 | 83 | 83 |
| 2 | 448 | 448 | 448 | 448 |
| 3 | 720 | 450 | 428 | 622 |
| 4 | 513 | 44 | 43 | 83 |
| 5 | 317 | 2 | 5 | 7 |
| 6–14 | 815 | 0 | 0 | 0 |
| **Total** | **2,896** | **1,027** | **1,007** | **1,243** |

Thus **1,869** original words cannot decode under the positive sign, **1,889** cannot under the negative sign, and **1,653** fail even after choosing whichever sign benefits each word. Every one of the **815 length-six-or-longer words** has no native-English inverse under either sign, any of 29 initial prime indices or any legal F mask.

A complete native-GP positive control encrypts another **12,956-rune, 2,896-word** book in the *exact same source word-length order*, using fresh starting indices ( (7w+2)\bmod29\) and the historical F-transparency rule. The unrestricted inverse recovers an authentic dictionary word on **2,896/2,896 planted positions**, including the long words. This validates the symbolic-F branching, independent word resets and oracle.

The observed failure is strictly for starts **0–28** in the conventional ascending-prime list, each word reset and one constant arithmetic sign throughout that word. The source does not prove those starts or the reset, so do not extrapolate to larger unrestricted starting primes, red-marker clocks or non-English plaintext. This is a new full-key bound on a plausible 2016 clue interpretation, and a different mechanism from the constant-Caesar result above.

**Reproducer:** [whole-word p56 prime clock, all signs/starts/F masks and full-length native plants](../sims/lp2_wordwise_29primeseeds_fskip_sft.cjs).

## Scope and decision

Together these source-original gates reject, under the exact authentic printed-word boundaries and declared native-English register, **every independent one-shift-per-word GP29 Caesar schedule**, and **every p56-F-transparent prime-totient schedule reinitializing its clock to a freely chosen starting prime ordinal 0–28 per word**, even when each original word gets its own shift, sign or seed. It is a stronger all-key obstruction to the direct 2016-word-number interpretation than the earlier *current-word-prime-sum* fixed-point exclusion, and is distinct from static codebook or ciphertext-feedback tests.

It does **not** prove the manuscript contains ordinary modern English, that its printed separators are plaintext spaces, or that a word may not contain a changing running key. The true 2016 hint may direct a different operation. No readable unknown plaintext, author-selected key schedule or complete inverse emerges. **Do not optimize alternative per-word Caesar key derivations from the same unchanged word segmentation; require a source-selected within-word-changing or boundary-changing mechanism.**

**Reproduction:** [original-input single-file Node22 CJS](../sims/lp2_wordwise_anykey_caesar_original_sft.cjs). The parser, lexicon, complete-length plant, exact counts and representative failed original words are asserted and printed by the script.
