# LP2 p39 red-triad word reversal: source-constrained bijection, direct original decode gate

**Agent 1, 17 November 2026. Conditional mathematical and cryptanalytic result for Director [#1296](https://github.com/FlareZ123/liber-primus/issues/1296). No recovered unknown plaintext, verified Cicada instruction, authentic cipher key or destination.**

## A source-defined concrete solve path rather than a new fitted symbol table

Original physical p39 visibly highlights three consecutive red GP29 runes at indices 119–121, with published values **[27, 5, 15]** (IA, C, S) and corresponding GP prime weights **[107, 13, 53]**. A large red X-like sign appears on the same page. Several **exact** short operations on these actual source values connect to source-visible cryptographic registers:

| Expression using all three p39 red symbols | Exact GP29 result | Possible operational reading |
| --- | ---: | --- |
| `27 × 5 × 15 = 2025 ≡ 24 (mod 29)` | **24** (A) | Offset of previously observed six-back target `T(c) = 27c+24 (mod29)`, also 3301 mod29 |
| `27+5+15 = 47 ≡ 18 (mod29)` | **18** (E) | A possible alternate word-state marker |
| `107+13+53 = 173 ≡ 28 (mod29)` | **28** (EA) | The zero-step plaintext symbol of a 29-state multiplicative-difference cipher |

The first p39 value is also the independently observed six-back slope **27 ≡ −2 (mod29)**; the middle **5** can be read as the number of intervening runes between the current output and its six-back tap; **15** is a primitive root modulo29 and the original exploratory S anchor. The p39 X may represent a variable or multiplication, and could instead be a large rune X. **All of these formula connections were recognized after the original T6 and other anomalies were known. Their existence is a postselected arithmetic observation, not independent proof of Cicada's intent.** In particular, many field expressions can be derived from three numbers, and existing [quadratic-p39](lp2-p39-quadratic-multiplicative-feedback-source-gate.md) approaches fail on original GP-English.

The standard [lossless echo permutation](lossless-word-echo-permutation.md) has an exact permutation inverse but fails to decode the original ciphertext. Its *source* positive controls drew continuous English GP rune passages and re-cut them at ciphertext word breaks. In three new, genuinely word-native English controls, an unreversed plaintext S anchor is much too frequent at eligible positions. This suggests a distinct, human-operable step that earlier full inverses did not include: **reverse the runes within each word before applying the secret-symbol alphabet**, then reverse again after decrypting.

## Reversing real English words materially changes the T6 signal

Hold the exact original **2,896 printed word lengths** and independently sample *whole*, natively GP-encoded words of the same GP length from committed Gibran, Emerson and Shakespeare controls. The original **79** nondegenerate T6 echoes are found at eligible positions `j≥6`, including **31** last glyphs, **five** words with at least two, and **two** pairs at adjacent positions. The original has **33** T6 targets blocked by equality with the preceding published glyph; **11** blocked sites are word terminal. In a word-preserving lossless cipher that forces plaintext S into T6 whenever unblocked, any plaintext source must have **79–112** S among all eligible positions and **31–42** S at eligible word terminals.

| Word-native source register, evaluated at source-compatible original word lengths | S in eligible positions, approximately | S at eligible word terminals, approximately | Two-S words, approximately | Adjacent eligible S pairs, approximately |
| --- | ---: | ---: | ---: | ---: |
| **Original T6 source constraints** | **79–112** | **31–42** | 5 observed T6 multi-site words | 2 observed T6 adjacent pairs |
| Gibran, words **in normal GP order** | 157 | 115 | 25 | 25 |
| Gibran, **each word reversed** | **80** | **41** | **3.5** | **3** |
| Emerson, words reversed | **92** | 55 | 4 | 2 |
| Shakespeare, words reversed | **87** | 51 | 2 | 1 |

The reversal removes the gross original S-frequency mismatch while preserving each authentic English word and original printed word length. Gibran's reversed source lies inside both exact count intervals, including terminal S. Emerson and Shakespeare's reversed word-terminal S counts remain too large on average. Consequently the simple reversal is **a materially better, still corpus-dependent conditional model**. Its double-hit and adjacent-event distributions are also much closer to the original than the unreversed Gibran source. No evidence says original LP2 words were actually reversed or were ordinary GP-English; the printed word lengths may also have been modified.

## A fully reversible red-triad hypothesis tested directly on untouched p40–53

Use the precisely reproduced source p39 parameters and a small *fully specified* decoder, avoiding arbitrary per-word keys. Work on physical pp40–53 **after the eight original red heading runes**, giving **667 complete printed black words / 3,000 runes**. The immediately preceding red heading's final rune has GP value **8**, selecting the initial ciphertext accumulator. Fix the multiplicative GP29 alphabet to `g=15`:

`M_p(Cprev) = Cprev + 15^p (mod29), p=0..27;` `M_28(Cprev)=Cprev`.

These 29 outputs are exactly one copy of every GP glyph because 15 is a primitive root. Before each rune emission, apply *bijection-preserving swaps* so that:

1. At word beginnings, the plaintext symbol assigned to the zero step is either **I=10** (if the big X is taken as Roman ten) or **C=5** (a directly marked red GP rune). At all interior word positions, the zero-step plaintext symbol is either **IA=27** (the first marked red GP rune) or **EA=28** (the modulo29 sum of the red GP prime weights). This yields exactly four **source-limited** marker combinations, no trained alphabet tables.
2. At `j≥6` when `T=27*C[j−6]+24 mod29` is distinct from the previous ciphertext, swap outputs to assign `S=15` to `T`. If `T=Cprev`, preserve the existing zero-step assignment.
3. Apply the inverse permutation to each unchanged ciphertext symbol, continuing the real published ciphertext accumulator across printed words. **Reverse each fully decrypted GP rune-word** to obtain candidate native English source. The forward operation reverses the source words first, performs the identical swaps and emits original-word-shaped ciphertext. Every step is lossless for all GP29 symbols and every input.

Each of the four candidate decoders is evaluated against all **3,000 original black-body runes** and a **29,058-entry GP-English native dictionary** using the exact printed word boundaries. The direct outcome:

| Original candidate first-word zero-step rune | Original candidate interior zero-step rune | Exact dictionary matches among 667 words | Words matching a full English GP word of length 6+ |
| --- | --- | ---: | ---: |
| I (index10) | IA (index27) | **35** | **0** |
| I (index10) | EA (index28) | **35** | **0** |
| C (index5) | IA (index27) | **32** | **0** |
| C (index5) | EA (index28) | **32** | **0** |

Every dictionary match is just **1–3 runes**; long black-body outputs are nonlinguistic. A matched original-shaped Gibran native GP-positive is **fully encrypted, decrypted and re-reversed exactly under each of the four alternatives**, ensuring that the no-English result is about original ciphertext, not a non-invertible implementation. All four original inputs also re-encrypt exactly. These are decisive original negative results for **these four fixed, keyless constructions**. No source-positive evidence licenses adding extra secret state, padding, additional tuning or a new phase to rescue them.

## Decision

**Reversed-word native GP source morphology provides a narrow reason to reconsider the previously unpromising S-T6 anchor.** The original p39 red triad offers a compact, source-readable *candidate* for its numbers and roles. But the first fully specified cipher built exclusively from those operands **does not recover any original long English word** in the 3,000-rune blind target. Numeric alignments are not a solution. The remaining missing operand, if this route is historical, is a **source-authenticated changing base alphabet/keystream or a different word/marker state rule** that both reproduces the original and yields contiguous plaintext. Any successor needs an independent source clue choosing that operand, with original printed input, 150 consecutive GP-English runes and exact forward reconstruction.

**Reproduce:** [CommonJS SFT](../sims/lp2_word_reversal_red_triad_candidate_sft.cjs), original `resources/liber-primus/lp2-corpus.json`, exact punctuation `lp2-transcription.txt`, source dictionaries from `resources/control`. Includes original p39 red identity and exact arithmetic, all 2,896 words and 12,956 original runes, 667 p40-body words, four exact cipher inverse/forward checks and a native-GP-English positive.
